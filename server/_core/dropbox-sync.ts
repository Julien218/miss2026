import crypto from "crypto";
import mysql, { type Connection } from "mysql2/promise";
import sharp from "sharp";
import { storagePut } from "../storage";

type IntegrationRow = {
  organization_id: number;
  connected_by_user_id: number;
  refresh_token_encrypted: string;
  source_shared_link: string | null;
};

function key() {
  const value = process.env.DROPBOX_TOKEN_ENCRYPTION_KEY || process.env.JWT_SECRET || "";
  return crypto.createHash("sha256").update(value).digest();
}

function decrypt(value: string) {
  const [iv, tag, data] = value.split(".");
  const decipher = crypto.createDecipheriv("aes-256-gcm", key(), Buffer.from(iv, "base64url"));
  decipher.setAuthTag(Buffer.from(tag, "base64url"));
  return Buffer.concat([decipher.update(Buffer.from(data, "base64url")), decipher.final()]).toString("utf8");
}

async function dbConnection() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL absent");
  return mysql.createConnection(process.env.DATABASE_URL);
}

async function ensureSyncTable(db: Connection) {
  await db.execute(`CREATE TABLE IF NOT EXISTS dropbox_media_sync (
    source_file_id VARCHAR(255) NOT NULL PRIMARY KEY,
    source_rev VARCHAR(255) NULL,
    source_path TEXT NOT NULL,
    media_kind VARCHAR(20) NOT NULL,
    storage_key TEXT NULL,
    sha256 VARCHAR(64) NULL,
    photo_id INT NULL,
    media_id INT NULL,
    candidate_id INT NULL,
    metadata_json LONGTEXT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'pending',
    error_message TEXT NULL,
    processed_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`);
}

async function accessToken(refreshToken: string) {
  const response = await fetch("https://api.dropboxapi.com/oauth2/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: process.env.DROPBOX_APP_KEY || "",
      client_secret: process.env.DROPBOX_APP_SECRET || "",
    }),
  });
  if (!response.ok) throw new Error(`Dropbox refresh token: ${response.status}`);
  return ((await response.json()) as any).access_token as string;
}

async function listSharedFiles(token: string, sharedLink: string) {
  const files: any[] = [];
  const folders = [""];
  const visitedFolders = new Set<string>();
  const seenFiles = new Set<string>();
  const headers = { authorization: `Bearer ${token}`, "content-type": "application/json" };

  // Dropbox does not support recursive=true for shared links. Walk every
  // directory explicitly while keeping pagination for folders with many files.
  while (folders.length) {
    const folderPath = folders.shift() || "";
    const folderKey = folderPath.toLowerCase();
    if (visitedFolders.has(folderKey)) continue;
    visitedFolders.add(folderKey);
    if (visitedFolders.size > 1000) throw new Error("Dropbox: arborescence anormalement profonde");
    const seenCursors = new Set<string>();
    let pageCount = 0;
    let response = await fetch("https://api.dropboxapi.com/2/files/list_folder", {
      method: "POST",
      headers,
      body: JSON.stringify({
        path: folderPath,
        recursive: false,
        include_deleted: false,
        shared_link: { url: sharedLink },
      }),
    });

    while (true) {
      if (!response.ok) {
        const detail = await response.text();
        throw new Error(`Dropbox list_folder ${response.status}: ${detail.slice(0, 300)}`);
      }
      const payload = await response.json() as any;
      pageCount++;
      if (pageCount > 200) throw new Error(`Dropbox: pagination anormale pour ${folderPath || "/"}`);
      for (const entry of payload.entries) {
        const joinedPath = `${folderPath.replace(/\/$/, "")}/${entry.name}`;
        const sharedPath = entry.path_lower || entry.path_display || joinedPath;
        if (entry[".tag"] === "file" && !seenFiles.has(entry.id || sharedPath)) {
          seenFiles.add(entry.id || sharedPath);
          files.push({ ...entry, _shared_path: sharedPath });
        }
        if (entry[".tag"] === "folder" && !visitedFolders.has(sharedPath.toLowerCase())) folders.push(sharedPath);
      }
      if (!payload.has_more) break;
      if (!payload.cursor || seenCursors.has(payload.cursor)) {
        throw new Error(`Dropbox: curseur de pagination répété pour ${folderPath || "/"}`);
      }
      seenCursors.add(payload.cursor);
      response = await fetch("https://api.dropboxapi.com/2/files/list_folder/continue", {
        method: "POST",
        headers,
        body: JSON.stringify({ cursor: payload.cursor }),
      });
    }
  }
  return files;
}

async function downloadSharedFile(token: string, sharedLink: string, path: string) {
  const response = await fetch("https://content.dropboxapi.com/2/files/download", {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "Dropbox-API-Arg": JSON.stringify({ path, shared_link: { url: sharedLink } }),
    },
  });
  if (!response.ok) throw new Error(`Dropbox download ${response.status}: ${(await response.text()).slice(0, 250)}`);
  return Buffer.from(await response.arrayBuffer());
}

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function inferCategory(path: string) {
  const p = normalize(path);
  if (p.includes("portrait")) return "portrait";
  if (p.includes("coulisse") || p.includes("backstage")) return "backstage";
  if (p.includes("performance") || p.includes("danse") || p.includes("scene")) return "performance";
  return "event";
}

function watermarkSvg(width: number, height: number) {
  const fontSize = Math.max(16, Math.round(Math.min(width, height) * 0.026));
  const pad = Math.max(18, Math.round(fontSize * 1.2));
  const boxWidth = Math.round(fontSize * 17.5);
  const boxHeight = Math.round(fontSize * 3.1);
  const x = Math.max(0, width - boxWidth - pad);
  const y = Math.max(0, height - boxHeight - pad);
  return Buffer.from(`<svg width="${width}" height="${height}">
    <rect x="${x}" y="${y}" width="${boxWidth}" height="${boxHeight}" rx="${Math.round(fontSize * .5)}" fill="rgba(0,0,0,.34)"/>
    <text x="${x + fontSize}" y="${y + fontSize * 1.35}" fill="rgba(255,255,255,.90)" font-family="Arial,sans-serif" font-size="${fontSize}" font-weight="700">MISS &amp; MISTER DOUR · 2026</text>
    <text x="${x + fontSize}" y="${y + fontSize * 2.35}" fill="rgba(255,255,255,.68)" font-family="Arial,sans-serif" font-size="${Math.round(fontSize * .68)}">JS-Innov.IA · Média officiel</text>
  </svg>`);
}

async function processImage(buffer: Buffer, sourcePath: string, candidateName: string | null) {
  const input = sharp(buffer, { failOn: "none" }).rotate();
  const meta = await input.metadata();
  const maxWidth = 2200;
  const width = Math.min(meta.width || maxWidth, maxWidth);
  const ratio = (meta.height || width) / (meta.width || width);
  const height = Math.max(1, Math.round(width * ratio));
  const description = `Photo officielle Miss & Mister Dour 2026${candidateName ? ` — ${candidateName}` : ""} — JS-Innov.IA`;
  const full = await input.resize({ width: maxWidth, withoutEnlargement: true })
    .composite([{ input: watermarkSvg(width, height), top: 0, left: 0 }])
    .withMetadata({ exif: { IFD0: {
      Copyright: "© 2026 Miss & Mister Dour · JS-Innov.IA",
      Artist: "JS-Innov.IA",
      ImageDescription: description,
      Software: "Miss & Mister Dour Media Pipeline",
    } } })
    .webp({ quality: 88 }).toBuffer();
  const thumb = await sharp(full).resize({ width: 640, withoutEnlargement: true }).webp({ quality: 78 }).toBuffer();
  const outMeta = await sharp(full).metadata();
  return { full, thumb, width: outMeta.width || width, height: outMeta.height || height, description };
}

export async function syncDropboxMedia(organizationId = 1) {
  const db = await dbConnection();
  let imported = 0, skipped = 0, failed = 0, total = 0;
  try {
    await ensureSyncTable(db);
    const [rows] = await db.execute<any[]>("SELECT * FROM dropbox_integrations WHERE organization_id=? LIMIT 1", [organizationId]);
    const integration = rows[0] as IntegrationRow | undefined;
    if (!integration?.source_shared_link) throw new Error("Dossier partagé Dropbox non configuré");
    await db.execute("UPDATE dropbox_integrations SET last_sync_status='running', last_sync_message=NULL WHERE organization_id=?", [organizationId]);
    const token = await accessToken(decrypt(integration.refresh_token_encrypted));
    const entries = await listSharedFiles(token, integration.source_shared_link);
    total = entries.length;
    const [candidateRows] = await db.execute<any[]>("SELECT id, firstName, lastName FROM candidates");
    const candidates = candidateRows.map((row: any) => ({ ...row, normalized: normalize(`${row.firstName} ${row.lastName}`) }));
    const supported = /\.(jpe?g|png|webp|heic|avif|mp4|mov|m4v|webm)$/i;

    for (const entry of entries) {
      const sourcePath = entry.path_display || entry.path_lower || entry.name;
      if (!supported.test(entry.name || "")) { skipped++; continue; }
      const [existingRows] = await db.execute<any[]>("SELECT source_rev, status FROM dropbox_media_sync WHERE source_file_id=? LIMIT 1", [entry.id]);
      if (existingRows[0]?.source_rev === entry.rev && existingRows[0]?.status === "imported") { skipped++; continue; }
      try {
        const pathNormalized = normalize(sourcePath);
        const candidate = candidates.find((item: any) => pathNormalized.includes(item.normalized)) || null;
        const kind = /\.(mp4|mov|m4v|webm)$/i.test(entry.name) ? "video" : "photo";
        const original = await downloadSharedFile(token, integration.source_shared_link, entry._shared_path || entry.path_lower || sourcePath);
        const digest = crypto.createHash("sha256").update(original).digest("hex");
        const slug = entry.id.replace(/[^a-zA-Z0-9_-]/g, "_");
        const year = 2026;
        let photoId: number | null = null, mediaId: number | null = null, storageKey = "";

        const trace = {
          source: "dropbox_shared_folder", sourceFileId: entry.id, sourceRevision: entry.rev,
          sourcePath, sourceModified: entry.server_modified, sha256: digest,
          edition: year, person: candidate ? `${candidate.firstName} ${candidate.lastName}` : null,
          brand: "Miss & Mister Dour", technologyPartner: "JS-Innov.IA",
          importedAt: new Date().toISOString(),
        };

        if (kind === "photo") {
          const candidateName = trace.person;
          const processed = await processImage(original, sourcePath, candidateName);
          storageKey = `official/2026/photos/${slug}.webp`;
          const thumbKey = `official/2026/thumbnails/${slug}.webp`;
          const [fullUpload, thumbUpload] = await Promise.all([
            storagePut(storageKey, processed.full, "image/webp"),
            storagePut(thumbKey, processed.thumb, "image/webp"),
          ]);
          const title = candidateName ? `${candidateName} — Miss & Mister Dour 2026` : "Miss & Mister Dour 2026 — Photo officielle";
          const tags = JSON.stringify(["Miss Mister Dour", "Miss et Mister Dour", "Dour", "2026", "JS-Innov.IA", candidateName].filter(Boolean));
          const [insert] = await db.execute<any>(
            `INSERT INTO photos (url, thumbnail, title, description, filename, mimeType, sizeBytes, width, height, category, tags, candidateId, uploadedBy, status, approvedBy, approvedAt)
             VALUES (?, ?, ?, ?, ?, 'image/webp', ?, ?, ?, ?, ?, ?, ?, 'approved', ?, NOW())`,
            [fullUpload.url, thumbUpload.url, title, processed.description, entry.name, processed.full.length,
             processed.width, processed.height, inferCategory(sourcePath), tags, candidate?.id || null,
             integration.connected_by_user_id, integration.connected_by_user_id]
          );
          photoId = Number(insert.insertId);
        } else {
          storageKey = `official/2026/videos/${slug}-${entry.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
          const upload = await storagePut(storageKey, original, entry.name.toLowerCase().endsWith(".webm") ? "video/webm" : "video/mp4");
          const [insert] = await db.execute<any>(
            `INSERT INTO media (candidateId, uploadedBy, type, url, fileKey, title, description, mimeType, fileSize, contestId, sessionName, isPublic)
             VALUES (?, ?, 'video', ?, ?, ?, ?, ?, ?, 1, 'Dropbox officiel 2026', 1)`,
            [candidate?.id || null, integration.connected_by_user_id, upload.url, storageKey,
             trace.person ? `${trace.person} — Vidéo officielle 2026` : "Miss & Mister Dour 2026 — Vidéo officielle",
             "Média officiel Miss & Mister Dour 2026 · JS-Innov.IA", "video/mp4", original.length]
          );
          mediaId = Number(insert.insertId);
        }

        await db.execute(
          `INSERT INTO dropbox_media_sync (source_file_id, source_rev, source_path, media_kind, storage_key, sha256, photo_id, media_id, candidate_id, metadata_json, status, processed_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'imported', NOW())
           ON DUPLICATE KEY UPDATE source_rev=VALUES(source_rev), source_path=VALUES(source_path), storage_key=VALUES(storage_key),
           sha256=VALUES(sha256), photo_id=VALUES(photo_id), media_id=VALUES(media_id), candidate_id=VALUES(candidate_id),
           metadata_json=VALUES(metadata_json), status='imported', error_message=NULL, processed_at=NOW()`,
          [entry.id, entry.rev || null, sourcePath, kind, storageKey, digest, photoId, mediaId, candidate?.id || null, JSON.stringify(trace)]
        );
        imported++;
      } catch (error) {
        failed++;
        const message = error instanceof Error ? error.message : String(error);
        await db.execute(
          `INSERT INTO dropbox_media_sync (source_file_id, source_rev, source_path, media_kind, status, error_message)
           VALUES (?, ?, ?, 'unknown', 'failed', ?)
           ON DUPLICATE KEY UPDATE source_rev=VALUES(source_rev), status='failed', error_message=VALUES(error_message)`,
          [entry.id, entry.rev || null, sourcePath, message.slice(0, 1000)]
        );
      }
    }
    const summary = `${imported} importé(s), ${skipped} ignoré(s), ${failed} erreur(s), ${total} fichier(s) détecté(s)`;
    await db.execute("UPDATE dropbox_integrations SET last_sync_at=NOW(), last_sync_status=?, last_sync_message=? WHERE organization_id=?",
      [failed ? "partial" : "success", summary, organizationId]);
    return { imported, skipped, failed, total, summary };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await db.execute("UPDATE dropbox_integrations SET last_sync_at=NOW(), last_sync_status='failed', last_sync_message=? WHERE organization_id=?",
      [message.slice(0, 1000), organizationId]).catch(() => {});
    throw error;
  } finally { await db.end(); }
}

let timerStarted = false;
export function startDropboxAutoSync() {
  if (timerStarted || process.env.NODE_ENV !== "production") return;
  timerStarted = true;
  setTimeout(() => syncDropboxMedia().catch(error => console.warn("[Dropbox Sync]", error instanceof Error ? error.message : String(error))), 30_000);
  setInterval(() => syncDropboxMedia().catch(error => console.warn("[Dropbox Sync]", error instanceof Error ? error.message : String(error))), 10 * 60_000);
}
