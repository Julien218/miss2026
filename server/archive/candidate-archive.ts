import { createHash, randomBytes } from "node:crypto";
import type { Express, Request, Response } from "express";
import { storageGetPrivate, storagePutPrivate } from "../storage";
import { sdk } from "../_core/sdk";
import { archiveRepository } from "./archive-repository";
import { ArchiveError, DropboxArchiveClient, exchangeDropboxToken, sha256, type FileReceipt } from "./dropbox-client";

const CREDENTIAL_KEY = "integrations/dropbox/candidate-archive-olivier.json";
const expectedEmail = () => process.env.DROPBOX_ARCHIVE_EXPECTED_EMAIL || "olivier.trevis@outlook.be";
const enabled = () => process.env.DROPBOX_ARCHIVE_ENABLED === "true";
const root = () => (process.env.DROPBOX_ARCHIVE_ROOT || "/Miss & Mister Dour/Election Miss Mister Dour 2007").normalize("NFC").replace(/\/+$/, "");
export const cleanName = (value: unknown) => String(value || "").normalize("NFC").replace(/[<>:"/\\|?*\u0000-\u001f]/g, "-").replace(/\s+/g, " ").trim().replace(/[. ]+$/, "").slice(0, 160);
const jsonBytes = (value: unknown) => Buffer.from(JSON.stringify(value, null, 2) + "\n");
let tokenCache: { token: string; until: number; account: { id: string; email: string } } | null = null;
let serviceError: string | null = null;
let running = false;
const pendingConnections = new Map<string, { actor: number; verifier: string; expires: number }>();
const codeFor = (error: unknown) => error instanceof ArchiveError ? error.code : "archive_temporarily_unavailable";

async function credentials() {
  try { return JSON.parse((await storageGetPrivate(CREDENTIAL_KEY)).data.toString("utf8")) as { refreshToken: string }; }
  catch { if (process.env.DROPBOX_OLIVIER_REFRESH_TOKEN) return { refreshToken: process.env.DROPBOX_OLIVIER_REFRESH_TOKEN }; throw new ArchiveError("authorization_required"); }
}
async function client() {
  if (tokenCache && tokenCache.until > Date.now()) return new DropboxArchiveClient(tokenCache.token);
  const stored = await credentials();
  const token = await exchangeDropboxToken(new URLSearchParams({ grant_type: "refresh_token", refresh_token: stored.refreshToken, client_id: process.env.DROPBOX_OLIVIER_APP_KEY || "", client_secret: process.env.DROPBOX_OLIVIER_APP_SECRET || "" }));
  const api = new DropboxArchiveClient(token.access_token);
  const account = await api.identity(expectedEmail()); // no default account fallback
  tokenCache = { token: token.access_token, until: Date.now() + Math.max(30, Number(token.expires_in || 3600) - 120) * 1000, account };
  return api;
}

export function referenceDocument(application: any) {
  return Buffer.from([
    `# ${application.firstName} ${application.lastName}`,
    "Édition : 2027", `Identifiant d'inscription : ${application.id}`,
    `Statut du dossier : ${application.status} (une inscription ne vaut pas validation)`,
    `Catégorie déclarée : ${application.category || "Non renseignée"}`, `Ville : ${application.city || "Non renseignée"}`,
    "## Présentation déclarée", application.bio || "Non renseignée", "## Motivation déclarée", application.motivation || "Non renseignée",
    "## Centres d’intérêt déclarés", application.interests || "Non renseignés",
    "Informations fournies par le formulaire. Ne pas inventer de validation, résultat ou témoignage.",
    "Les coordonnées privées et signatures de la copie administrative ne doivent pas être reprises dans une publication.",
  ].join("\n\n") + "\n");
}

export async function downloadPhoto(url: string, request: typeof fetch = fetch) {
  if(url.startsWith("private:candidate-applications/2027/")){
    const photo=await storageGetPrivate(url.slice(8));
    return {bytes:photo.data,extension:".webp"};
  }
  const address = new URL(url);
  const allowed = new URL(process.env.R2_PUBLIC_URL || "https://pub-c511375d0e9444d8bb8dfdb7dbb81b08.r2.dev");
  if (address.protocol !== "https:" || address.origin !== allowed.origin || address.username || address.password) throw new ArchiveError("invalid_media_origin");
  const response = await request(address, { redirect: "error", signal: AbortSignal.timeout(30_000) });
  if (!response.ok || !response.body) throw new ArchiveError("media_unavailable");
  const type = (response.headers.get("content-type") || "").split(";")[0];
  const extension = ({ "image/webp": ".webp", "image/jpeg": ".jpg", "image/png": ".png" } as Record<string, string>)[type];
  if (!extension) throw new ArchiveError("unsupported_media_type");
  const chunks: Buffer[] = []; let length = 0;
  for await (const chunk of response.body as any) {
    length += chunk.length;
    if (length > 10 * 1024 * 1024) { throw new ArchiveError("media_too_large"); }
    chunks.push(Buffer.from(chunk));
  }
  return { bytes: Buffer.concat(chunks), extension };
}

export async function archiveOne(job: any, application: any, api: DropboxArchiveClient, dependencies = { downloadPhoto, storageGetPrivate }) {
  const base = root();
  if (!base.startsWith("/") || base.includes("..") || base.length > 1000) throw new ArchiveError("invalid_archive_root");
  // The parent was explicitly chosen by the user. Never create a different root.
  if ((await api.metadata(base))?.[".tag"] !== "folder") throw new ArchiveError("archive_root_missing");
  const folder = job.folder || `${base}/${cleanName(`Édition 2027_${application.lastName} ${application.firstName}`)}`;
  if (!folder.startsWith(base + "/")) throw new ArchiveError("invalid_archive_folder");
  await api.folder(folder);
  const files: FileReceipt[] = [];
  const put = async (label: string, extension: string, bytes: Buffer) => {
    const filename = `${label}-${application.id}-${sha256(bytes).slice(0, 16)}${extension}`;
    const receipt = await api.put(`${folder}/${filename}`, bytes); files.push(receipt); return filename;
  };
  await put("inscription", ".json", jsonBytes(application));
  await put("Fiche-reference", ".md", referenceDocument(application));
  const media: any[] = [];
  if (application.profilePhoto) {
    const photo = await dependencies.downloadPhoto(application.profilePhoto);
    const filename = await put("photo-profil", photo.extension, photo.bytes);
    media.push({ kind: "profil", file: filename, sha256: sha256(photo.bytes) });
  }
  if (application.contractPdfKey) {
    const contract = await dependencies.storageGetPrivate(application.contractPdfKey);
    if (application.contractPdfSha256 && sha256(contract.data) !== application.contractPdfSha256) throw new ArchiveError("contract_hash_mismatch");
    await put("contrat", ".pdf", contract.data);
  }
  await put("Medias-sources", ".json", jsonBytes({ applicationId: application.id, media }));
  const receiptData = { applicationId: application.id, edition: 2027, folder, account: expectedEmail(), files };
  const receipt = await api.put(`${folder}/RECU_ARCHIVAGE-${application.id}-${sha256(jsonBytes(receiptData)).slice(0, 16)}.json`, jsonBytes(receiptData));
  return { ...receiptData, receipt };
}

export async function archiveTick() {
  if (!enabled() || running) return;
  running = true;
  try {
    await archiveRepository.reconcile();
    const api = await client();
    serviceError = null;
    for (let index = 0; index < 10; index++) {
      const job = await archiveRepository.claim(); if (!job) break;
      try {
        const application = await archiveRepository.application(job.applicationId);
        const suffix = !job.folder && await archiveRepository.hasHomonym(application) ? ` - dossier ${application.id}` : "";
        const folder = job.folder || `${root()}/${cleanName(`Édition 2027_${application.lastName} ${application.firstName}${suffix}`)}`;
        await archiveRepository.saveFolder(job, folder);
        const receipt = await archiveOne({ ...job, folder }, application, api);
        await archiveRepository.complete(job, receipt, application.updatedAt);
      } catch (error) {
        const code = codeFor(error);
        await archiveRepository.fail(job, code);
        if (code === "authorization_required") { tokenCache = null; serviceError = code; break; }
      }
    }
  } catch (error) { serviceError = codeFor(error); }
  finally { running = false; }
}
export function startCandidateArchiveWorker() {
  if (!enabled()) return;
  setTimeout(() => void archiveTick(), 1000).unref();
  setInterval(() => void archiveTick(), 15_000).unref();
}

async function admin(req: Request, res: Response) {
  try {
    const user = await sdk.authenticateRequest(req);
    if (!["admin", "super_admin", "owner"].includes(user.role)) { res.status(403).json({ error: "Accès administrateur requis." }); return null; }
    return user;
  } catch { res.status(401).json({ error: "Connexion requise." }); return null; }
}
export function registerCandidateArchiveRoutes(app: Express) {
  app.get("/api/admin/dropbox-archive", async (req, res) => {
    if (!await admin(req, res)) return;
    try { res.json({ enabled: enabled(), account: expectedEmail(), root: root(), connected: Boolean(tokenCache), error: serviceError, ...(await archiveRepository.stats()) }); }
    catch { res.status(503).json({ error: "archive_temporarily_unavailable" }); }
  });
  app.post("/api/admin/dropbox-archive/retry", async (req, res) => {
    if (!await admin(req, res)) return;
    try { await archiveRepository.retry(); void archiveTick(); res.json({ queued: true }); }
    catch { res.status(503).json({ error: "archive_temporarily_unavailable" }); }
  });
  app.post("/api/admin/dropbox-archive/connect", async (req, res) => {
    const user = await admin(req, res); if (!user) return;
    const key = process.env.DROPBOX_OLIVIER_APP_KEY;
    if (!key || !process.env.DROPBOX_OLIVIER_APP_SECRET || !process.env.PRIVATE_STORAGE_KEY) { res.status(503).json({ error: "Configuration serveur Dropbox incomplète." }); return; }
    pendingConnections.forEach((entry, id) => { if (entry.expires < Date.now()) pendingConnections.delete(id); });
    if (pendingConnections.size >= 20) { res.sendStatus(429); return; }
    const id = randomBytes(24).toString("base64url"); const verifier = randomBytes(32).toString("base64url");
    pendingConnections.set(id, { actor: user.id, verifier, expires: Date.now() + 10 * 60_000 });
    const query = new URLSearchParams({ client_id: key, response_type: "code", token_access_type: "offline", code_challenge_method: "S256", code_challenge: createHash("sha256").update(verifier).digest("base64url"), scope: "account_info.read files.metadata.read files.content.read files.content.write" });
    res.json({ attempt: id, url: `https://www.dropbox.com/oauth2/authorize?${query}` });
  });
  app.post("/api/admin/dropbox-archive/connect/complete", async (req, res) => {
    const user = await admin(req, res); if (!user) return;
    const id = String(req.body?.attempt || ""); const pending = pendingConnections.get(id);
    pendingConnections.delete(id);
    if (!pending || pending.actor !== user.id || pending.expires < Date.now() || typeof req.body?.code !== "string" || req.body.code.length > 500) { res.status(400).json({ error: "Demande expirée. Recommencez la connexion Dropbox." }); return; }
    try {
      const token = await exchangeDropboxToken(new URLSearchParams({ grant_type: "authorization_code", code: req.body.code.trim(), code_verifier: pending.verifier, client_id: process.env.DROPBOX_OLIVIER_APP_KEY || "", client_secret: process.env.DROPBOX_OLIVIER_APP_SECRET || "" }));
      const api = new DropboxArchiveClient(token.access_token); const account = await api.identity(expectedEmail());
      if (!token.refresh_token) throw new ArchiveError("authorization_required");
      const credentialBytes = jsonBytes({ refreshToken: token.refresh_token, account });
      await storagePutPrivate(CREDENTIAL_KEY, credentialBytes, "application/json");
      if (sha256((await storageGetPrivate(CREDENTIAL_KEY)).data) !== sha256(credentialBytes)) throw new ArchiveError("credential_storage_unconfirmed");
      tokenCache = { token: token.access_token, until: Date.now() + Math.max(30, Number(token.expires_in || 3600) - 120) * 1000, account };
      serviceError = null; await archiveRepository.retry(); void archiveTick();
      res.json({ connected: true, account: account.email });
    } catch (error) { res.status(400).json({ error: codeFor(error) }); }
  });
}
