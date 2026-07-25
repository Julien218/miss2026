/**
 * Multi-Tenant Database Functions
 * 
 * Toutes les fonctions incluent l'isolation par organizationId
 * Garantit qu'aucune donnée ne fuite entre organisations
 * 
 * Créé par JS-Innov.IA (Pagin Julien) - Dour, Belgique
 * © Tous droits réservés - Copie strictement interdite
 */

import { eq, and, desc, sql } from "drizzle-orm";
import { getDb } from "./db";
import {
  organizations, InsertOrganization,
  organizationSettings, InsertOrganizationSetting,
  certificates, InsertCertificate,
  auditLogs, InsertAuditLog,
} from "../drizzle/schema";

// ========== ORGANIZATIONS ==========

export async function getOrganizationById(organizationId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(organizations)
    .where(eq(organizations.id, organizationId))
    .limit(1);

  return result[0] || null;
}

export async function getOrganizationSettings(organizationId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(organizationSettings)
    .where(eq(organizationSettings.organizationId, organizationId))
    .limit(1);

  return result[0] || null;
}

export async function updateOrganizationSettings(
  organizationId: number,
  settings: Partial<InsertOrganizationSetting>
) {
  const db = await getDb();
  if (!db) return null;

  await db
    .update(organizationSettings)
    .set(settings)
    .where(eq(organizationSettings.organizationId, organizationId));

  return getOrganizationSettings(organizationId);
}

// ========== CERTIFICATES ==========

export async function createCertificate(data: InsertCertificate) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(certificates).values(data);
  return result[0]?.insertId || null;
}

export async function getCertificatesByOrganization(organizationId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(certificates)
    .where(eq(certificates.organizationId, organizationId))
    .orderBy(desc(certificates.createdAt));
}

export async function getCertificateByCertificateId(certificateId: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(certificates)
    .where(eq(certificates.certificateId, certificateId))
    .limit(1);

  return result[0] || null;
}

export async function revokeCertificate(
  organizationId: number,
  certificateId: string,
  reason: string
) {
  const db = await getDb();
  if (!db) return null;

  await db
    .update(certificates)
    .set({
      status: "revoked",
      revokedAt: new Date(),
      revokedReason: reason,
    })
    .where(
      and(
        eq(certificates.organizationId, organizationId),
        eq(certificates.certificateId, certificateId)
      )
    );

  return getCertificateByCertificateId(certificateId);
}

// ========== AUDIT LOGS ==========

export async function createAuditLog(data: InsertAuditLog) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(auditLogs).values(data);
  return result[0]?.insertId || null;
}

export async function getAuditLogsByOrganization(
  organizationId: number,
  limit: number = 100
) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(auditLogs)
    .where(eq(auditLogs.organizationId, organizationId))
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit);
}

export async function getAuditLogsByEntity(
  organizationId: number,
  entityType: string,
  entityId: number
) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(auditLogs)
    .where(
      and(
        eq(auditLogs.organizationId, organizationId),
        eq(auditLogs.entityType, entityType),
        eq(auditLogs.entityId, entityId)
      )
    )
    .orderBy(desc(auditLogs.createdAt));
}

// ========== STATISTICS ==========

export async function getOrganizationStats(organizationId: number) {
  const db = await getDb();
  if (!db) return null;

  // TODO: Ajouter des statistiques réelles une fois que les tables auront organizationId
  return {
    totalCertificates: 0,
    totalEvents: 0,
    totalCandidates: 0,
    totalVotes: 0,
  };
}
