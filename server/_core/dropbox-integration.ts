import type { Express, Request, Response } from "express";
import crypto from "crypto";
import mysql from "mysql2/promise";
import { SignJWT, jwtVerify } from "jose";
import { sdk } from "./sdk";

const ADMIN_ROLES = new Set(["admin", "super_admin", "owner"]);

function secretKey() {
  const secret = process.env.DROPBOX_TOKEN_ENCRYPTION_KEY || process.env.JWT_SECRET || "";
  if (secret.length < 32) throw new Error("DROPBOX_TOKEN_ENCRYPTION_KEY doit contenir au moins 32 caractères");
  return crypto.createHash("sha256").update(secret).digest();
}

function encrypt(value: string) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", secretKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  return [iv.toString("base64url"), cipher.getAuthTag().toString("base64url"), encrypted.toString("base64url")].join(".");
}

async function connection() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL absent");
  return mysql.createConnection(process.env.DATABASE_URL);
}

async function ensureTable() {
  const db = await connection();
  try {
    await db.execute(`CREATE TABLE IF NOT EXISTS dropbox_integrations (
      organization_id INT NOT NULL PRIMARY KEY,
      connected_by_user_id INT NOT NULL,
      account_id VARCHAR(255) NULL,
      account_name VARCHAR(255) NULL,
      account_email VARCHAR(255) NULL,
      refresh_token_encrypted TEXT NOT NULL,
      access_token_encrypted TEXT NULL,
      source_folder VARCHAR(1024) NOT NULL DEFAULT '',
      sync_cursor TEXT NULL,
      last_sync_at TIMESTAMP NULL,
      last_sync_status VARCHAR(32) NOT NULL DEFAULT 'never',
      last_sync_message TEXT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`);
  } finally {
    await db.end();
  }
}

async function requireAdmin(req: Request, res: Response) {
  try {
    const user = await sdk.authenticateRequest(req);
    if (!ADMIN_ROLES.has(user.role)) {
      res.status(403).json({ error: "Accès administrateur requis" });
      return null;
    }
    return user;
  } catch {
    res.status(401).json({ error: "Connexion requise" });
    return null;
  }
}

function publicBaseUrl(req: Request) {
  return (process.env.PUBLIC_BASE_URL || `${req.protocol}://${req.get("host")}`).replace(/\/$/, "");
}

function dropboxRedirectUri(req: Request) {
  return process.env.DROPBOX_REDIRECT_URI || `${publicBaseUrl(req)}/api/integrations/dropbox/callback`;
}

function configured() {
  return Boolean(process.env.DROPBOX_APP_KEY && process.env.DROPBOX_APP_SECRET);
}

export function registerDropboxIntegrationRoutes(app: Express) {
  app.get("/api/integrations/dropbox/status", async (req, res) => {
    const user = await requireAdmin(req, res); if (!user) return;
    if (!configured()) {
      res.json({ configured: false, connected: false, redirectUri: dropboxRedirectUri(req) });
      return;
    }
    await ensureTable();
    const db = await connection();
    try {
      const [rows] = await db.execute<any[]>(
        "SELECT account_name, account_email, source_folder, last_sync_at, last_sync_status, last_sync_message, updated_at FROM dropbox_integrations WHERE organization_id = ? LIMIT 1",
        [user.organizationId || 1]
      );
      const item = rows[0];
      res.json({
        configured: true,
        connected: Boolean(item),
        accountName: item?.account_name || null,
        accountEmail: item?.account_email || null,
        sourceFolder: item?.source_folder || "",
        lastSyncAt: item?.last_sync_at || null,
        lastSyncStatus: item?.last_sync_status || "never",
        lastSyncMessage: item?.last_sync_message || null,
        redirectUri: dropboxRedirectUri(req),
      });
    } finally { await db.end(); }
  });

  app.get("/api/integrations/dropbox/start", async (req, res) => {
    const user = await requireAdmin(req, res); if (!user) return;
    if (!configured()) {
      res.status(503).send("Dropbox n’est pas encore configuré dans Railway.");
      return;
    }
    const state = await new SignJWT({
      userId: user.id,
      organizationId: user.organizationId || 1,
      purpose: "dropbox-connect",
    }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("10m").sign(secretKey());
    const redirectUri = dropboxRedirectUri(req);
    const url = new URL("https://www.dropbox.com/oauth2/authorize");
    url.searchParams.set("client_id", process.env.DROPBOX_APP_KEY!);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("token_access_type", "offline");
    url.searchParams.set("redirect_uri", redirectUri);
    url.searchParams.set("state", state);
    res.redirect(url.toString());
  });

  app.get("/api/integrations/dropbox/callback", async (req, res) => {
    try {
      const user = await requireAdmin(req, res); if (!user) return;
      const code = String(req.query.code || "");
      const state = String(req.query.state || "");
      const verified = await jwtVerify(state, secretKey(), { algorithms: ["HS256"] });
      if (verified.payload.purpose !== "dropbox-connect" || Number(verified.payload.userId) !== user.id) {
        throw new Error("État OAuth invalide");
      }
      const redirectUri = dropboxRedirectUri(req);
      const tokenResponse = await fetch("https://api.dropboxapi.com/oauth2/token", {
        method: "POST",
        headers: {
          authorization: "Basic " + Buffer.from(`${process.env.DROPBOX_APP_KEY}:${process.env.DROPBOX_APP_SECRET}`).toString("base64"),
          "content-type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ code, grant_type: "authorization_code", redirect_uri: redirectUri }),
      });
      if (!tokenResponse.ok) throw new Error("Dropbox a refusé l’échange du code");
      const tokens = await tokenResponse.json() as any;
      const accountResponse = await fetch("https://api.dropboxapi.com/2/users/get_current_account", {
        method: "POST",
        headers: { authorization: `Bearer ${tokens.access_token}`, "content-type": "application/json" },
        body: "null",
      });
      if (!accountResponse.ok) throw new Error("Compte Dropbox inaccessible");
      const account = await accountResponse.json() as any;
      await ensureTable();
      const db = await connection();
      try {
        await db.execute(
          `INSERT INTO dropbox_integrations
           (organization_id, connected_by_user_id, account_id, account_name, account_email, refresh_token_encrypted, access_token_encrypted)
           VALUES (?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE connected_by_user_id=VALUES(connected_by_user_id), account_id=VALUES(account_id),
           account_name=VALUES(account_name), account_email=VALUES(account_email),
           refresh_token_encrypted=VALUES(refresh_token_encrypted), access_token_encrypted=VALUES(access_token_encrypted),
           sync_cursor=NULL, last_sync_status='never', last_sync_message=NULL`,
          [user.organizationId || 1, user.id, account.account_id || "", account.name?.display_name || "Dropbox",
           account.email || "", encrypt(tokens.refresh_token || tokens.access_token), encrypt(tokens.access_token)]
        );
      } finally { await db.end(); }
      res.redirect("/admin/dropbox?connected=1");
    } catch (error) {
      console.error("[Dropbox] OAuth callback failed", error instanceof Error ? error.message : String(error));
      res.redirect("/admin/dropbox?error=connection");
    }
  });

  app.post("/api/integrations/dropbox/folder", async (req, res) => {
    const user = await requireAdmin(req, res); if (!user) return;
    const folder = String(req.body?.folder || "").trim();
    if (!folder.startsWith("/") || folder.length > 1024) {
      res.status(400).json({ error: "Le chemin doit commencer par /" }); return;
    }
    await ensureTable();
    const db = await connection();
    try {
      const [result] = await db.execute<any>(
        "UPDATE dropbox_integrations SET source_folder=?, sync_cursor=NULL, last_sync_status='never' WHERE organization_id=?",
        [folder, user.organizationId || 1]
      );
      if (!result.affectedRows) { res.status(404).json({ error: "Connectez Dropbox avant de choisir le dossier" }); return; }
      res.json({ success: true, sourceFolder: folder });
    } finally { await db.end(); }
  });
}
