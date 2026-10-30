import { describe, expect, it, vi } from "vitest";
import { contentHash, DropboxArchiveClient } from "./dropbox-client";

const bytes = Buffer.from("reference candidate 2027");
const path = "/Miss & Mister Dour/Édition 2027_Exemple Test/fiche.md";
const metadata = (overrides = {}) => ({ ".tag": "file", id: "id:ABC_123", rev: "rev-1", path_lower: path.toLowerCase(), path_display: path, size: bytes.length, content_hash: contentHash(bytes), ...overrides });
const missing = () => Response.json({ error_summary: "path/not_found/" }, { status: 409 });

describe("verified Dropbox archive transport", () => {
  it("uses the documented empty-file content hash", () => {
    expect(contentHash(Buffer.alloc(0))).toBe("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
  });
  it("rejects another account and an unverified email", async () => {
    for (const identity of [{ account_id: "dbid:x", email: "other@example.test", email_verified: true }, { account_id: "dbid:x", email: "olivier.trevis@outlook.be", email_verified: false }]) {
      const request = vi.fn(async () => Response.json(identity));
      await expect(new DropboxArchiveClient("token", request as typeof fetch).identity("olivier.trevis@outlook.be")).rejects.toThrow("wrong_dropbox_account");
      expect(request).toHaveBeenCalledTimes(1);
    }
  });
  it("does not consider HTTP 200 without a structural receipt a success", async () => {
    const request = vi.fn().mockResolvedValueOnce(missing()).mockResolvedValueOnce(Response.json({ success: true }));
    await expect(new DropboxArchiveClient("token", request).put(path, bytes)).rejects.toThrow("invalid_archive_receipt");
  });
  it("verifies the upload by reading metadata back, including hash, path, size and revision", async () => {
    for (const override of [{ size: 0 }, { content_hash: "wrong" }, { path_lower: "/wrong" }, { rev: "changed" }]) {
      const request = vi.fn().mockResolvedValueOnce(missing()).mockResolvedValueOnce(Response.json(metadata())).mockResolvedValueOnce(Response.json(metadata(override)));
      await expect(new DropboxArchiveClient("token", request).put(path, bytes)).rejects.toThrow(/invalid_archive_receipt|archive_changed/);
    }
  });
  it("replays an already confirmed identical file without uploading or overwriting it", async () => {
    const request = vi.fn(async () => Response.json(metadata()));
    const result = await new DropboxArchiveClient("token", request as typeof fetch).put(path, bytes);
    expect(result.id).toBe("id:ABC_123");
    expect(request).toHaveBeenCalledTimes(1);
    expect(String(request.mock.calls[0][0])).toContain("get_metadata");
  });
  it("refuses an existing different file without an overwrite", async () => {
    const request = vi.fn(async () => Response.json(metadata({ content_hash: "different" })));
    await expect(new DropboxArchiveClient("token", request as typeof fetch).put(path, bytes)).rejects.toThrow("invalid_archive_receipt");
    expect(request).toHaveBeenCalledTimes(1);
  });
  it("sends accented paths as ASCII JSON headers and uses add-only writes", async () => {
    const request = vi.fn().mockResolvedValueOnce(missing()).mockResolvedValueOnce(Response.json(metadata())).mockResolvedValueOnce(Response.json(metadata()));
    await new DropboxArchiveClient("token", request).put(path, bytes);
    const header = request.mock.calls[1][1].headers["Dropbox-API-Arg"];
    expect(header).toMatch(/^[\x20-\x7e]+$/);
    expect(JSON.parse(header)).toEqual({ path, mode: "add", autorename: false, strict_conflict: true, mute: true });
  });
});
