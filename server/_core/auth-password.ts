/**
 * Auth Password - Authentification locale par email/mot de passe
 *
 * Permet la création, la vérification et la réinitialisation sécurisée
 * des comptes utilisateurs locaux avec bcrypt.
 */

import bcrypt from "bcryptjs";
import { getDb } from "../db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

const BCRYPT_COST = 12;

function buildLocalOpenId(email: string): string {
  return `local:${email.toLowerCase().trim()}`;
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
  name: string | null;
  createdAt: Date;
};

export async function registerUser(input: RegisterUserInput): Promise<RegisterUserResult> {
  const { email, password, role = "user", organizationId = 1, name } = input;

  if (!email || !password) throw new Error("Email et mot de passe sont requis");

  const db = await getDb();
  if (!db) throw new Error("Base de données non disponible");

  const normalizedEmail = email.toLowerCase().trim();
  const openId = buildLocalOpenId(normalizedEmail);

  const existing = await db
    .select({ id: users.id, email: users.email })
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);

  if (existing.length > 0) throw new Error(`Un compte existe déjà pour l'email: ${email}`);

  const passwordHash = await bcrypt.hash(password, BCRYPT_COST);
  const permissionData = JSON.stringify({ passwordHash, loginMethod: "password" });

  const [result] = await db.insert(users).values({
    openId,
    email: normalizedEmail,
    name: name ?? normalizedEmail.split("@")[0],
    role,
    organizationId,
    loginMethod: "password",
    permissionOverrides: permissionData,
    lastSignedIn: new Date(),
  });

  const insertId = Number((result as any).insertId);
  console.log(`[Auth] Utilisateur créé: ${normalizedEmail} (id=${insertId}, role=${role})`);

  return { id: insertId, email: normalizedEmail, role, organizationId, openId, name: name ?? null, createdAt: new Date() };
}

export async function resetPasswordUser(
  email: string,
  password: string,
  role?: RegisterUserInput["role"],
) {
  const db = await getDb();
  if (!db) throw new Error("Base de données non disponible");

  const normalizedEmail = email.toLowerCase().trim();
  const openId = buildLocalOpenId(normalizedEmail);
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  if (result.length === 0) throw new Error("Compte introuvable");

  const user = result[0];
  let permissionOverrides: Record<string, unknown> = {};
  try {
    permissionOverrides = JSON.parse(user.permissionOverrides ?? "{}");
  } catch {
    permissionOverrides = {};
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_COST);
  permissionOverrides.passwordHash = passwordHash;
  permissionOverrides.loginMethod = "password";

  await db
    .update(users)
    .set({
      email: normalizedEmail,
      role: role ?? user.role,
      loginMethod: "password",
      permissionOverrides: JSON.stringify(permissionOverrides),
      lastSignedIn: new Date(),
    })
    .where(eq(users.id, user.id));

  console.log(`[Auth] Mot de passe réinitialisé: ${normalizedEmail} (id=${user.id}, role=${role ?? user.role})`);
  return { ...user, email: normalizedEmail, role: role ?? user.role, openId };
}

export async function verifyPasswordUser(email: string, password: string) {
  const db = await getDb();
  if (!db) return null;

  const openId = buildLocalOpenId(email);
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  if (result.length === 0) return null;

  const user = result[0];
  let passwordHash: string | null = null;
  try {
    const parsed = JSON.parse(user.permissionOverrides ?? "{}");
    passwordHash = parsed.passwordHash ?? null;
  } catch {
    return null;
  }

  if (!passwordHash) return null;
  const valid = await bcrypt.compare(password, passwordHash);
  return valid ? user : null;
}
