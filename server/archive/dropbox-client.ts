import { createHash } from "node:crypto";

export class ArchiveError extends Error {
  constructor(public code: string) { super(code); }
}
export function contentHash(bytes: Buffer) {
  const blocks: Buffer[] = [];
  for (let offset = 0; offset < bytes.length; offset += 4 * 1024 * 1024) blocks.push(createHash("sha256").update(bytes.subarray(offset, offset + 4 * 1024 * 1024)).digest());
  return createHash("sha256").update(Buffer.concat(blocks)).digest("hex");
}
export const sha256 = (bytes: Buffer) => createHash("sha256").update(bytes).digest("hex");
const apiArg = (value: unknown) => JSON.stringify(value).replace(/[^\x20-\x7e]/g, char => `\\u${char.charCodeAt(0).toString(16).padStart(4, "0")}`);
export type FileReceipt = { id: string; rev: string; path: string; bytes: number; contentHash: string; sha256: string };

export class DropboxArchiveClient {
  constructor(private token: string, private request: typeof fetch = fetch) {}
  async api(operation: string, body: unknown): Promise<any> {
    const response = await this.request(`https://api.dropboxapi.com/2/${operation}`, {
      method: "POST", redirect: "error", signal: AbortSignal.timeout(30_000),
      headers: { Authorization: `Bearer ${this.token}`, "Content-Type": "application/json" }, body: JSON.stringify(body),
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) throw new ArchiveError(response.status === 401 ? "authorization_required" : String(data?.error_summary || "dropbox_unavailable").startsWith("path/not_found") ? "not_found" : "dropbox_unavailable");
    return data;
  }
  async identity(expectedEmail: string) {
    const account = await this.api("users/get_current_account", null);
    if (!account?.account_id || account.email_verified !== true || account.email?.trim().toLowerCase() !== expectedEmail.toLowerCase()) throw new ArchiveError("wrong_dropbox_account");
    return { id: account.account_id as string, email: account.email as string };
  }
  async metadata(path: string) {
    try { return await this.api("files/get_metadata", { path }); }
    catch (error) { if (error instanceof ArchiveError && error.code === "not_found") return null; throw error; }
  }
  async folder(path: string) {
    const current = await this.metadata(path);
    if (current) { if (current[".tag"] !== "folder") throw new ArchiveError("folder_conflict"); return; }
    try { await this.api("files/create_folder_v2", { path, autorename: false }); }
    catch (error) { const after = await this.metadata(path); if (after?.[".tag"] !== "folder") throw error; }
  }
  private validate(data: any, path: string, bytes: Buffer): FileReceipt {
    if (!/^id:[A-Za-z0-9_-]+$/.test(data?.id || "") || !data.rev || data.size !== bytes.length || data.content_hash !== contentHash(bytes) || data.path_lower?.normalize("NFC") !== path.normalize("NFC").toLowerCase()) throw new ArchiveError("invalid_archive_receipt");
    return { id: data.id, rev: data.rev, path: data.path_display || path, bytes: data.size, contentHash: data.content_hash, sha256: sha256(bytes) };
  }
  async put(path: string, bytes: Buffer): Promise<FileReceipt> {
    const existing = await this.metadata(path);
    if (existing) return this.validate(existing, path, bytes); // replay after crash, never overwrite
    const response = await this.request("https://content.dropboxapi.com/2/files/upload", {
      method: "POST", redirect: "error", signal: AbortSignal.timeout(60_000),
      headers: { Authorization: `Bearer ${this.token}`, "Content-Type": "application/octet-stream", "Dropbox-API-Arg": apiArg({ path, mode: "add", autorename: false, strict_conflict: true, mute: true }) },
      body: new Uint8Array(bytes),
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      if (response.status === 409) {
        const raced = await this.metadata(path);
        if (raced) return this.validate(raced, path, bytes);
      }
      throw new ArchiveError(response.status === 401 ? "authorization_required" : "upload_failed");
    }
    const uploaded = this.validate(data, path, bytes);
    const readBack = this.validate(await this.metadata(path), path, bytes);
    if (uploaded.id !== readBack.id || uploaded.rev !== readBack.rev) throw new ArchiveError("archive_changed_during_verification");
    return readBack;
  }
}

export async function exchangeDropboxToken(body: URLSearchParams, request: typeof fetch = fetch) {
  const response = await request("https://api.dropboxapi.com/oauth2/token", { method: "POST", redirect: "error", signal: AbortSignal.timeout(20_000), body });
  const data = await response.json().catch(() => null);
  if (!response.ok || !data?.access_token) throw new ArchiveError("authorization_required");
  return data as { access_token: string; refresh_token?: string; expires_in: number };
}
