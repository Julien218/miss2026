import bcrypt from "bcryptjs";
import { eq, sql } from "drizzle-orm";
import { getDb } from "../db";
import { users } from "../../drizzle/schema";

const BCRYPT_COST = 12;
let credentialsReady: Promise<void> | null = null;

function buildLocalOpenId(email: string): string {
  return `local:${email.toLowerCase().trim()}`;
}

function safePermissionOverrides(raw: string | null | undefined) {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    const sanitized: Record<string, unknown> = {};
    if (Array.isArray(parsed?.add)) sanitized.add = parsed.add;
    if (Array.isArray(parsed?.remove)) sanitized.remove = parsed.remove;
    return Object.keys(sanitized).length ? JSON.stringify(sanitized) : null;
  } catch {
    return null;
  }
}

/**
 * Stockage dédié aux credentials locaux. Le CREATE IF NOT EXISTS permet de
 * migrer la production sans exposer une migration manuelle risquée.
 */
export function ensureLocalCredentialsStorage(): Promise<void> {
  if (credentialsReady) return credentialsReady;
  credentialsReady = (async () => {
    const db = await getDb();
    if (!db) throw new Error("Base de données non disponible");

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS localCredentials (
        userId INT NOT NULL PRIMARY KEY,
        passwordHash VARCHAR(255) NOT NULL,
        createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_localCredentials_updatedAt (updatedAt)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Migration des comptes historiques : copier le bcrypt hors du JSON puis
    // retirer toute donnée d'authentification de permissionOverrides.
    const rows = await db.select({
      id: users.id,
      permissionOverrides: users.permissionOverrides,
      loginMethod: users.loginMethod,
    }).from(users);

    for (const user of rows) {
      let passwordHash: string | null = null;
      try {
        const parsed = JSON.parse(user.permissionOverrides || "{}");
        if (typeof parsed?.passwordHash === "string" && parsed.passwordHash.startsWith("$2")) {
          passwordHash = parsed.passwordHash;
        }
      } catch {
        // Le JSON invalide est nettoyé plus bas pour éviter de le propager au client.
      }

      if (passwordHash) {
        await db.execute(sql`
          INSERT INTO localCredentials (userId, passwordHash)
          VALUES (${user.id}, ${passwordHash})
          ON DUPLICATE KEY UPDATE passwordHash = VALUES(passwordHash), updatedAt = CURRENT_TIMESTAMP
        `);
      }

      const sanitized = safePermissionOverrides(user.permissionOverrides);
      if (sanitized !== user.permissionOverrides) {
        await db.update(users).set({ permissionOverrides: sanitized }).where(eq(users.id, user.id));
      }
    }
  })().catch((error) => {
    credentialsReady = null;
    throw error;
  });
  return credentialsReady;
}

export type RegisterUserInput = {
  email: string;
  password: string;
  role?: "user" | "candidate" | "press" | "photographer" | "staff" | "marketing" | "organizer" | "admin" | "super_admin";
  organizationId?: number;
  name?: string;
};

export type RegisterUserResult = {
  id: number;
  email: string;
  role: string;
  organizationId: number;
  openId: string;
  createdAt: Date;
};

export async function registerUser(input: RegisterUserInput): Promise<RegisterUserResult> {
  const { email, password, role = "user", organizationId = 1, name } = input;
  const normalizedEmail = email.toLowerCase().trim();
  if (!normalizedEmail || !password) throw new Error("Email et mot de passe sont requis");
  if (password.length < 10 || password.length > 512) throw new Error("Le mot de passe doit contenir au moins 10 caractères");

  const db = await getDb();
  if (!db) throw new Error("Base de données non disponible");
  await ensureLocalCredentialsStorage();

  const openId = buildLocalOpenId(normalizedEmail);
  const existing = await db.select({ id: users.id }).from(users).where(eq(users.openId, openId)).limit(1);
  if (existing.length > 0) throw new Error("Un compte existe déjà pour cette adresse email");

  const passwordHash = await bcrypt.hash(password, BCRYPT_COST);
  const [result] = await db.insert(users).values({
    openId,
    email: normalizedEmail,
    name: name ?? normalizedEmail.split("@")[0],
    role,
    organizationId,
    loginMethod: "password",
    permissionOverrides: null,
    lastSignedIn: new Date(),
  });

  const insertId = Number((result as any).insertId);
  if (!insertId) throw new Error("Création du compte impossible");

  try {
    await db.execute(sql`INSERT INTO localCredentials (userId, passwordHash) VALUES (${insertId}, ${passwordHash})`);
  } catch (error) {
    await db.delete(users).where(eq(users.id, insertId)).catch(() => undefined);
    throw error;
  }

  console.log(`[Auth] Utilisateur local créé (id=${insertId}, role=${role})`);
  return { id: insertId, email: normalizedEmail, role, organizationId, openId, createdAt: new Date() };
}

export async function verifyPasswordUser(email: string, password: string) {
  const db = await getDb();
  if (!db) return null;
  await ensureLocalCredentialsStorage();

  const openId = buildLocalOpenId(email);
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  if (result.length === 0) return null;
  const user = result[0];

  const [credentialRows] = await db.execute(sql`
    SELECT passwordHash FROM localCredentials WHERE userId = ${user.id} LIMIT 1
  `) as any;
  const passwordHash = (credentialRows as any[])?.[0]?.passwordHash;
  if (!passwordHash || typeof passwordHash !== "string") return null;

  const valid = await bcrypt.compare(password, passwordHash);
  if (!valid) return null;
  return user;
}
