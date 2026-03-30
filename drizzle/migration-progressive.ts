/**
 * MIGRATION PROGRESSIVE VERS MULTI-TENANT
 * 
 * Ce script ajoute les tables multi-tenant sans toucher aux données existantes
 * Étapes:
 * 1. Créer les nouvelles tables (organizations, organization_settings, etc.)
 * 2. Créer l'organisation "Miss & Mister Dour" (plan: founder)
 * 3. Ajouter organization_id aux tables existantes
 * 4. Migrer les données existantes
 * 
 * Créé par JS-Innov.IA (Pagin Julien) - Dour, Belgique
 * © Tous droits réservés - Copie strictement interdite
 */

import { mysqlTable, int, varchar, text, timestamp, mysqlEnum, index, uniqueIndex } from "drizzle-orm/mysql-core";

// ========== NOUVELLES TABLES MULTI-TENANT ==========

/**
 * Organizations table - Each client organization
 */
export const organizations = mysqlTable("organizations", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  ownerUserId: int("ownerUserId").notNull(),
  plan: mysqlEnum("plan", ["free", "starter", "professional", "enterprise", "founder"]).default("free").notNull(),
  status: mysqlEnum("status", ["active", "suspended", "cancelled"]).default("active").notNull(),
  maxEvents: int("maxEvents").default(1).notNull(),
  maxCandidates: int("maxCandidates").default(50).notNull(),
  maxVotes: int("maxVotes").default(10000).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  slugIdx: uniqueIndex("slug_idx").on(table.slug),
}));

/**
 * Organization settings - White-label customization
 */
export const organizationSettings = mysqlTable("organization_settings", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull().unique(),
  primaryColor: varchar("primaryColor", { length: 7 }).default("#D4AF37").notNull(),
  secondaryColor: varchar("secondaryColor", { length: 7 }).default("#B8941E").notNull(),
  logoUrl: text("logoUrl"),
  faviconUrl: text("faviconUrl"),
  certificateStyle: mysqlEnum("certificateStyle", ["bronze", "gold", "champagne"]).default("gold").notNull(),
  certificateLogoUrl: text("certificateLogoUrl"),
  certificateSignature: text("certificateSignature"),
  verifyPageStyle: mysqlEnum("verifyPageStyle", ["classic", "festival", "premium"]).default("premium").notNull(),
  verifyPageBanner: text("verifyPageBanner"),
  blockchainEnabled: int("blockchainEnabled").default(0).notNull(),
  socialScoringEnabled: int("socialScoringEnabled").default(1).notNull(),
  voteAntifraudEnabled: int("voteAntifraudEnabled").default(1).notNull(),
  auditLogsEnabled: int("auditLogsEnabled").default(1).notNull(),
  customDomain: varchar("customDomain", { length: 255 }),
  customDomainVerified: int("customDomainVerified").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  orgIdx: index("org_idx").on(table.organizationId),
}));

/**
 * Certificates table - Blockchain-ready
 */
export const certificates = mysqlTable("certificates", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  eventId: int("eventId").notNull(),
  candidateId: int("candidateId").notNull(),
  certificateId: varchar("certificateId", { length: 64 }).notNull().unique(),
  assetHash: varchar("assetHash", { length: 64 }).notNull(),
  metadataHash: varchar("metadataHash", { length: 64 }).notNull(),
  certificateHash: varchar("certificateHash", { length: 64 }).notNull(),
  pdfUrl: text("pdfUrl").notNull(),
  thumbnailUrl: text("thumbnailUrl"),
  qrPayloadJson: text("qrPayloadJson").notNull(),
  qrCodeUrl: text("qrCodeUrl"),
  publicVerifyUrl: text("publicVerifyUrl").notNull(),
  blockchainTxHash: varchar("blockchainTxHash", { length: 66 }),
  blockchainTimestamp: timestamp("blockchainTimestamp"),
  blockchainNetwork: varchar("blockchainNetwork", { length: 50 }),
  status: mysqlEnum("status", ["draft", "issued", "revoked"]).default("issued").notNull(),
  issuedAt: timestamp("issuedAt").defaultNow().notNull(),
  revokedAt: timestamp("revokedAt"),
  revokedReason: text("revokedReason"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  orgIdx: index("org_idx").on(table.organizationId),
  certIdIdx: uniqueIndex("cert_id_idx").on(table.certificateId),
  certHashIdx: index("cert_hash_idx").on(table.certificateHash),
}));

/**
 * Audit logs table - Append-only
 */
export const auditLogs = mysqlTable("audit_logs", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  actorUserId: int("actorUserId"),
  action: varchar("action", { length: 100 }).notNull(),
  entityType: varchar("entityType", { length: 50 }).notNull(),
  entityId: int("entityId"),
  payloadJson: text("payloadJson"),
  ipHash: varchar("ipHash", { length: 64 }),
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  orgIdx: index("org_idx").on(table.organizationId),
  actorIdx: index("actor_idx").on(table.actorUserId),
  entityIdx: index("entity_idx").on(table.entityType, table.entityId),
  createdIdx: index("created_idx").on(table.createdAt),
}));

/**
 * Media assets table - Files with SHA256 hash
 */
export const mediaAssets = mysqlTable("media_assets", {
  id: int("id").autoincrement().primaryKey(),
  ownerType: mysqlEnum("ownerType", ["candidate", "event", "organization"]).notNull(),
  ownerId: int("ownerId").notNull(),
  fileUrl: text("fileUrl").notNull(),
  sha256Hash: varchar("sha256Hash", { length: 64 }).notNull(),
  fileType: varchar("fileType", { length: 50 }).notNull(),
  fileSize: int("fileSize"),
  width: int("width"),
  height: int("height"),
  duration: int("duration"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  ownerIdx: index("owner_idx").on(table.ownerType, table.ownerId),
  hashIdx: index("hash_idx").on(table.sha256Hash),
}));

/**
 * Submissions table - Candidate applications
 */
export const submissions = mysqlTable("submissions", {
  id: int("id").autoincrement().primaryKey(),
  candidateId: int("candidateId").notNull().unique(),
  answersJson: text("answersJson").notNull(),
  reviewStatus: mysqlEnum("reviewStatus", ["pending", "approved", "rejected"]).default("pending").notNull(),
  reviewNotes: text("reviewNotes"),
  reviewedBy: int("reviewedBy"),
  reviewedAt: timestamp("reviewedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  candidateIdx: uniqueIndex("candidate_idx").on(table.candidateId),
}));
