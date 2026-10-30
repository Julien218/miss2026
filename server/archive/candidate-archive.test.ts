import { afterEach, describe, expect, it, vi } from "vitest";
import express from "express";
import type { Server } from "node:http";
import { contentHash, sha256, type DropboxArchiveClient } from "./dropbox-client";

vi.mock("../db", () => ({ getDb: vi.fn() }));
vi.mock("../_core/sdk", () => ({ sdk: { authenticateRequest: vi.fn() } }));
vi.mock("../storage", () => ({ storageGetPrivate: vi.fn(), storagePutPrivate: vi.fn() }));
vi.mock("./archive-repository", () => ({ archiveRepository: { reconcile: vi.fn(), claim: vi.fn(), application: vi.fn(), complete: vi.fn(), fail: vi.fn(), stats: vi.fn(), retry: vi.fn(), saveFolder: vi.fn() } }));
import { archiveOne, archiveTick, downloadPhoto, referenceDocument, registerCandidateArchiveRoutes } from "./candidate-archive";
import { archiveRepository } from "./archive-repository";
import { storageGetPrivate, storagePutPrivate } from "../storage";
import { sdk } from "../_core/sdk";

const servers: Server[] = [];
afterEach(async () => { vi.restoreAllMocks(); vi.unstubAllEnvs(); vi.unstubAllGlobals(); vi.clearAllMocks(); await Promise.all(servers.splice(0).map(s => new Promise<void>(resolve => s.close(() => resolve())))); });
const application = { id: 123, editionYear: 2027, firstName: "Test", lastName: "Exemple", status: "pending", email: "private@example.test", phone: "private-phone", city: "Dour", category: "miss", bio: "Présentation", motivation: "Motivation", profilePhoto: "https://pub-c511375d0e9444d8bb8dfdb7dbb81b08.r2.dev/photo.webp", contractPdfKey: "private/contract.pdf", contractPdfSha256: sha256(Buffer.from("contract")), updatedAt: new Date("2026-10-30T00:00:00Z") };
const dependencies = { downloadPhoto: vi.fn(async () => ({ bytes: Buffer.from("photo"), extension: ".webp" })), storageGetPrivate: vi.fn(async () => ({ data: Buffer.from("contract"), key: "private/contract.pdf", contentType: "application/pdf" })) };

describe("automatic candidate archive", () => {
  it("preserves a complete source copy but keeps private coordinates out of the AI reference", () => {
    const text = referenceDocument(application).toString();
    expect(text).toContain("Test Exemple");
    expect(text).toContain("pending");
    expect(text).not.toContain(application.email);
    expect(text).not.toContain(application.phone);
  });
  it("recovers from a partial transfer without duplicating files or returning a premature completion", async () => {
    const files = new Map<string, Buffer>(); let transfers = 0; let interruption = true;
    const api = { metadata: async () => ({ ".tag": "folder" }), folder: async () => {}, put: async (path: string, bytes: Buffer) => {
      if (interruption && transfers === 2) { interruption = false; throw new Error("temporary outage"); }
      if (files.has(path)) expect(files.get(path)).toEqual(bytes);
      else { files.set(path, bytes); transfers++; }
      return { id: `id:file_${transfers}`, rev: `r${transfers}`, path, bytes: bytes.length, sha256: sha256(bytes), contentHash: contentHash(bytes) };
    } } as unknown as DropboxArchiveClient;
    await expect(archiveOne({}, application, api, dependencies)).rejects.toThrow("temporary outage");
    const result = await archiveOne({}, application, api, dependencies);
    expect(result.files).toHaveLength(5);
    expect(result.receipt.path).toContain("RECU_ARCHIVAGE-123-");
    expect(files.size).toBe(6);
    expect([...files.keys()].some(path => path.endsWith(".pdf"))).toBe(true);
  });
  it("rejects a mismatching private contract and never writes a completion receipt", async () => {
    const put = vi.fn(async () => ({ id: "id:x", rev: "r", path: "x", bytes: 1, sha256: "x", contentHash: "x" }));
    const api = { metadata: async () => ({ ".tag": "folder" }), folder: async () => {}, put } as unknown as DropboxArchiveClient;
    await expect(archiveOne({}, { ...application, contractPdfSha256: "wrong" }, api, dependencies)).rejects.toThrow("contract_hash_mismatch");
    expect(put.mock.calls.some(args => args[0].includes("RECU_ARCHIVAGE"))).toBe(false);
  });
  it("never fetches candidate-provided URLs outside the configured media origin", async () => {
    const request = vi.fn();
    await expect(downloadPhoto("https://attacker.example/photo", request)).rejects.toThrow("invalid_media_origin");
    expect(request).not.toHaveBeenCalled();
  });
  it("reconciles persisted source records even while Dropbox authorization is broken, without consuming jobs", async () => {
    vi.stubEnv("DROPBOX_ARCHIVE_ENABLED", "true");
    vi.mocked(storageGetPrivate).mockRejectedValue(new Error("not connected"));
    await archiveTick();
    expect(archiveRepository.reconcile).toHaveBeenCalledOnce();
    expect(archiveRepository.claim).not.toHaveBeenCalled();
    expect(archiveRepository.complete).not.toHaveBeenCalled();
  });
  it("denies candidate/photographer configuration and archive status access", async () => {
    const app = express(); app.use(express.json()); registerCandidateArchiveRoutes(app);
    const server = app.listen(0, "127.0.0.1"); servers.push(server); await new Promise<void>(resolve => server.once("listening", resolve));
    const base = `http://127.0.0.1:${(server.address() as { port: number }).port}`;
    for (const role of ["candidate", "photographer", "organizer", "user"]) {
      vi.mocked(sdk.authenticateRequest).mockResolvedValue({ id: 5, role } as any);
      expect((await fetch(base + "/api/admin/dropbox-archive")).status).toBe(403);
      expect((await fetch(base + "/api/admin/dropbox-archive/connect", { method: "POST" })).status).toBe(403);
    }
    expect(archiveRepository.stats).not.toHaveBeenCalled();
  });
  it("binds the authorization attempt to its administrator and refuses another Dropbox identity without saving credentials", async () => {
    vi.stubEnv("DROPBOX_OLIVIER_APP_KEY", "public-app-key"); vi.stubEnv("DROPBOX_OLIVIER_APP_SECRET", "server-secret"); vi.stubEnv("PRIVATE_STORAGE_KEY", "x".repeat(40));
    const app = express(); app.use(express.json()); registerCandidateArchiveRoutes(app);
    const server = app.listen(0, "127.0.0.1"); servers.push(server); await new Promise<void>(resolve => server.once("listening", resolve));
    const base = `http://127.0.0.1:${(server.address() as { port: number }).port}`;
    const request = fetch;
    vi.mocked(sdk.authenticateRequest).mockResolvedValue({ id: 1, role: "admin" } as any);
    const begin = () => request(base + "/api/admin/dropbox-archive/connect", { method: "POST" }).then(r => r.json());
    const first = await begin();
    const query = new URL(first.url).searchParams;
    expect(query.get("code_challenge_method")).toBe("S256");
    expect(query.get("token_access_type")).toBe("offline");
    expect(first).not.toHaveProperty("verifier");
    vi.mocked(sdk.authenticateRequest).mockResolvedValue({ id: 2, role: "admin" } as any);
    const finish = (attempt: string) => request(base + "/api/admin/dropbox-archive/connect/complete", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ attempt, code: "temporary-code" }) });
    expect((await finish(first.attempt)).status).toBe(400);
    vi.mocked(sdk.authenticateRequest).mockResolvedValue({ id: 1, role: "admin" } as any);
    const second = await begin();
    const provider = vi.fn().mockResolvedValueOnce(Response.json({ access_token: "access-secret", refresh_token: "refresh-secret", expires_in: 3600 })).mockResolvedValueOnce(Response.json({ account_id: "dbid:wrong", email: "other@example.test", email_verified: true }));
    vi.stubGlobal("fetch", provider);
    const response = await finish(second.attempt);
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "wrong_dropbox_account" });
    expect(storagePutPrivate).not.toHaveBeenCalled();
  });
});
