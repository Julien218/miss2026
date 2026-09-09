import crypto from "node:crypto";
import type { Express, Request, Response } from "express";
import mysql, { type RowDataPacket } from "mysql2/promise";
import rateLimit from "express-rate-limit";

export const PAGE_SIZE = 200;
// Read-only projection: never select passwords, tokens, birth dates, IPs or photos.
export const REGISTRATIONS_SQL = `
SELECT * FROM (
 SELECT CONCAT('candidate:', LPAD(c.id, 10, '0')) AS id, 'candidate' AS source,
 c.firstName AS first_name, c.lastName AS last_name,
 COALESCE(NULLIF(c.accountEmail, ''), u.email) AS email, c.phone, c.city,
 c.category, c.status, t.year, c.registrationDate AS created_at, c.updatedAt AS updated_at
 FROM candidates c JOIN contests t ON t.id = c.contestId
 LEFT JOIN users u ON u.id = c.userId
 WHERE t.year >= 2026
 UNION ALL
 SELECT CONCAT('application:', LPAD(a.id, 10, '0')) AS id, 'application' AS source,
 a.firstName AS first_name, a.lastName AS last_name, a.email, a.phone, a.city,
 a.category, a.status, t.year, a.createdAt AS created_at, a.updatedAt AS updated_at
 FROM candidateApplications a JOIN contests t ON t.id = a.contestId
 WHERE t.year >= 2026 AND NOT EXISTS (
   SELECT 1 FROM candidates c WHERE c.id = a.candidateId AND c.contestId = a.contestId
 )
) registrations WHERE id > ? ORDER BY id ASC LIMIT 201`;

export function validIntegrationToken(header: string | undefined, secret: string) {
  if (secret.length < 32 || !header?.startsWith("Bearer ")) return false;
  const supplied = Buffer.from(header.slice(7));
  const expected = Buffer.from(secret);
  return supplied.length === expected.length && crypto.timingSafeEqual(supplied, expected);
}

export async function readRegistrationPage(cursor: string) {
  if (!process.env.DATABASE_URL) throw Object.assign(new Error("Database unavailable"), { code: "DB_NOT_CONFIGURED" });
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  try {
    const [rows] = await connection.query<RowDataPacket[]>({ sql: REGISTRATIONS_SQL, timeout: 10000 }, [cursor]);
    const records = rows.slice(0, PAGE_SIZE);
    return { records, nextCursor: rows.length > PAGE_SIZE ? String(records.at(-1)!.id) : null };
  } finally {
    await connection.end();
  }
}

export function registrationHandler(readPage = readRegistrationPage) {
  return async (req: Request, res: Response) => {
    res.setHeader("Cache-Control", "private, no-store");
    res.setHeader("X-Content-Type-Options", "nosniff");
    if (!validIntegrationToken(req.get("authorization"), process.env.COCKPIT_REGISTRATIONS_TOKEN || "")) {
      res.status(401).json({ error: "Accès non autorisé." });
      return;
    }
    const cursor = req.query.cursor ?? "";
    if (typeof cursor !== "string" || (cursor !== "" && !/^(candidate|application):[0-9]{10}$/.test(cursor))) {
      res.status(400).json({ error: "Curseur invalide." });
      return;
    }
    try {
      const page = await readPage(cursor);
      const years = page.records.map((r) => Number((r as { year?: number }).year ?? 0)).filter(Boolean);
      res.json({ collection: "miss-mister-dour-inscriptions", year: years.length ? Math.max(...years) : 2026, ...page, fetchedAt: new Date().toISOString() });
    } catch (error) {
      const raw = (error as { code?: string }).code || "SOURCE_UNAVAILABLE";
      const code = /^[A-Z0-9_]{1,64}$/.test(raw) ? raw : "SOURCE_UNAVAILABLE";
      console.error("[Cockpit registrations] source unavailable", { code });
      res.status(503).json({ error: "Les inscriptions du site sont momentanément indisponibles." });
    }
  };
}

export function registerCockpitRegistrationRoutes(app: Express) {
  app.get("/api/integrations/cockpit/registrations", rateLimit({
    windowMs: 60000, max: 120, standardHeaders: true, legacyHeaders: false,
  }), registrationHandler());
}
