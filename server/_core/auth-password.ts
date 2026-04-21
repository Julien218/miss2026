/**
 * Auth Password - Authentification locale par email/mot de passe
 *
 * Permet la création et la vérification de comptes utilisateurs
 * avec email et mot de passe (bcrypt), indépendamment du flux OAuth.
 *
 * Créé par JS-Innov.IA (Pagin Julien) - Dour, Belgique
 * © Tous droits réservés - Copie strictement interdite
 */

import bcrypt from "bcryptjs";
import { getDb } from "../db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

const BCRYPT_COST = 12;

/**
 * Génère un openId synthétique déterministe pour les comptes locaux.
 * Format: "local:<email>"
 */
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
  createdAt: Date;
};

/**
 * Crée un utilisateur avec email et mot de passe.
 *
 * - Hash le mot de passe avec bcrypt (cost=12)
 * - Génère un openId synthétique "local:<email>"
 * - Insère l'utilisateur dans la table `users`
 * - Retourne les données de l'utilisateur créé (sans le hash)
 *
 * Lance une erreur si l'email est déjà utilisé.
 */
export async function registerUser(input: RegisterUserInput): Promise<RegisterUserResult> {
  const { email, password, role = "user", organizationId = 1, name } = input;

  if (!email || !password) {
    throw new Error("Email et mot de passe sont requis");
  }

  const db = await getDb();
  if (!db) {
    throw new Error("Base de données non disponible");
  }

  const openId = buildLocalOpenId(email);

  // Vérifier si l'utilisateur existe déjà
  const existing = await db
    .select({ id: users.id, email: users.email })
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);

  if (existing.length > 0) {
    throw new Error(`Un compte existe déjà pour l'email: ${email}`);
  }

  // Hasher le mot de passe
  const passwordHash = await bcrypt.hash(password, BCRYPT_COST);

  // Insérer l'utilisateur
  // Le hash est stocké dans permissionOverrides (JSON) car la table users
  // n'a pas de colonne passwordHash dédiée.
  const permissionData = JSON.stringify({ passwordHash, loginMethod: "password" });

  const [result] = await db.insert(users).values({
    openId,
    email: email.toLowerCase().trim(),
    name: name ?? email.split("@")[0],
    role,
    organizationId,
    loginMethod: "password",
    permissionOverrides: permissionData,
    lastSignedIn: new Date(),
  });

  const insertId = Number((result as any).insertId);

  console.log(`[Auth] Utilisateur créé: ${email} (id=${insertId}, role=${role})`);

  return {
    id: insertId,
    email: email.toLowerCase().trim(),
    role,
    organizationId,
    openId,
    createdAt: new Date(),
  };
}

/**
 * Vérifie les credentials email/mot de passe d'un utilisateur local.
 * Retourne l'utilisateur si valide, null sinon.
 */
export async function verifyPasswordUser(email: string, password: string) {
  const db = await getDb();
  if (!db) return null;

  const openId = buildLocalOpenId(email);

  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);

  if (result.length === 0) return null;

  const user = result[0];

  // Extraire le hash depuis permissionOverrides
  let passwordHash: string | null = null;
  try {
    const parsed = JSON.parse(user.permissionOverrides ?? "{}");
    passwordHash = parsed.passwordHash ?? null;
  } catch {
    return null;
  }

  if (!passwordHash) return null;

  const valid = await bcrypt.compare(password, passwordHash);
  if (!valid) return null;

  return user;
}
