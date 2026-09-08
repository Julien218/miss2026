import { mysqlTable, int, varchar, text, timestamp, mysqlEnum, index, uniqueIndex } from "drizzle-orm/mysql-core";

/**
 * ========================================
 * MULTI-TENANT SAAS SCHEMA
 * ========================================
 * Architecture multi-tenant avec isolation stricte des données
 * Chaque organisation a ses propres événements, candidats, votes, certificats
 * Créé par JS-Innov.IA (Pagin Julien) - Dour, Belgique
 * © Tous droits réservés - Copie strictement interdite
 */

// ========== CORE MULTI-TENANT TABLES ==========

/**
 * Organizations table - Each client organization (Miss & Mister Dour, other contests)
 */
export const organizations = mysqlTable("organizations", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(), // URL-friendly identifier
  ownerUserId: int("ownerUserId").notNull(), // User who owns this organization
  plan: mysqlEnum("plan", ["free", "starter", "professional", "enterprise", "founder"]).default("free").notNull(),
  status: mysqlEnum("status", ["active", "suspended", "cancelled"]).default("active").notNull(),
  maxEvents: int("maxEvents").default(1).notNull(), // Limit based on plan
  maxCandidates: int("maxCandidates").default(50).notNull(), // Limit based on plan
  maxVotes: int("maxVotes").default(10000).notNull(), // Limit based on plan
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  slugIdx: uniqueIndex("slug_idx").on(table.slug),
}));

export type Organization = typeof organizations.$inferSelect;
export type InsertOrganization = typeof organizations.$inferInsert;

/**
 * Organization settings - White-label customization per organization
 */
export const organizationSettings = mysqlTable("organization_settings", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull().unique(),
  
  // Visual customization
  primaryColor: varchar("primaryColor", { length: 7 }).default("#D4AF37").notNull(), // Hex color
  secondaryColor: varchar("secondaryColor", { length: 7 }).default("#B8941E").notNull(),
  logoUrl: text("logoUrl"),
  faviconUrl: text("faviconUrl"),
  
  // Certificate customization
  certificateStyle: mysqlEnum("certificateStyle", ["bronze", "gold", "champagne"]).default("gold").notNull(),
  certificateLogoUrl: text("certificateLogoUrl"),
  certificateSignature: text("certificateSignature"),
  
  // Verify page customization
  verifyPageStyle: mysqlEnum("verifyPageStyle", ["classic", "festival", "premium"]).default("premium").notNull(),
  verifyPageBanner: text("verifyPageBanner"),
  
  // Features
  blockchainEnabled: int("blockchainEnabled").default(0).notNull(), // 0 = disabled, 1 = enabled
  socialScoringEnabled: int("socialScoringEnabled").default(1).notNull(),
  voteAntifraudEnabled: int("voteAntifraudEnabled").default(1).notNull(),
  auditLogsEnabled: int("auditLogsEnabled").default(1).notNull(),
  
  // Custom domain
  customDomain: varchar("customDomain", { length: 255 }),
  customDomainVerified: int("customDomainVerified").default(0).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  orgIdx: index("org_idx").on(table.organizationId),
}));

export type OrganizationSetting = typeof organizationSettings.$inferSelect;
export type InsertOrganizationSetting = typeof organizationSettings.$inferInsert;

// ========== USERS & ROLES ==========

/**
 * Users table - Multi-tenant aware with organization_id and role
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(), // CRITICAL: Every user belongs to an organization
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["owner", "admin", "jury", "candidate", "user"]).default("user").notNull(),
  status: mysqlEnum("status", ["active", "inactive", "banned"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
}, (table) => ({
  orgIdx: index("org_idx").on(table.organizationId),
  openIdIdx: uniqueIndex("openId_idx").on(table.openId),
}));

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ========== EVENTS & CONTESTS ==========

/**
 * Events table - Each event belongs to an organization
 */
export const events = mysqlTable("events", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(), // CRITICAL: Isolation
  name: varchar("name", { length: 255 }).notNull(),
  editionYear: int("editionYear").notNull(),
  description: text("description"),
  status: mysqlEnum("status", ["draft", "active", "voting", "closed"]).default("draft").notNull(),
  startDate: timestamp("startDate"),
  endDate: timestamp("endDate"),
  votingOpen: timestamp("votingOpen"),
  votingClose: timestamp("votingClose"),
  location: varchar("location", { length: 255 }),
  maxCandidates: int("maxCandidates"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  orgIdx: index("org_idx").on(table.organizationId),
}));

export type Event = typeof events.$inferSelect;
export type InsertEvent = typeof events.$inferInsert;

// ========== CANDIDATES ==========

/**
 * Candidates table - Linked to events
 */
export const candidates = mysqlTable("candidates", {
  id: int("id").autoincrement().primaryKey(),
  eventId: int("eventId").notNull(),
  userId: int("userId"), // Optional: if candidate is a registered user
  displayName: varchar("displayName", { length: 255 }).notNull(),
  firstName: varchar("firstName", { length: 100 }),
  lastName: varchar("lastName", { length: 100 }),
  bio: text("bio"),
  country: varchar("country", { length: 100 }),
  city: varchar("city", { length: 100 }),
  dateOfBirth: timestamp("dateOfBirth"),
  profilePhoto: text("profilePhoto"),
  category: mysqlEnum("category", ["miss", "mister", "teen_miss", "teen_mister", "other"]),
  status: mysqlEnum("status", ["draft", "submitted", "selected", "finalist", "winner"]).default("draft").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  eventIdx: index("event_idx").on(table.eventId),
}));

export type Candidate = typeof candidates.$inferSelect;
export type InsertCandidate = typeof candidates.$inferInsert;

// ========== SUBMISSIONS ==========

/**
 * Submissions table - Candidate applications with structured answers
 */
export const submissions = mysqlTable("submissions", {
  id: int("id").autoincrement().primaryKey(),
  candidateId: int("candidateId").notNull().unique(),
  answersJson: text("answersJson").notNull(), // JSON string with all answers
  reviewStatus: mysqlEnum("reviewStatus", ["pending", "approved", "rejected"]).default("pending").notNull(),
  reviewNotes: text("reviewNotes"),
  reviewedBy: int("reviewedBy"), // User ID of reviewer
  reviewedAt: timestamp("reviewedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  candidateIdx: uniqueIndex("candidate_idx").on(table.candidateId),
}));

export type Submission = typeof submissions.$inferSelect;
export type InsertSubmission = typeof submissions.$inferInsert;

// ========== MEDIA ASSETS ==========

/**
 * Media assets table - Files with SHA256 hash for integrity
 */
export const mediaAssets = mysqlTable("media_assets", {
  id: int("id").autoincrement().primaryKey(),
  ownerType: mysqlEnum("ownerType", ["candidate", "event", "organization"]).notNull(),
  ownerId: int("ownerId").notNull(),
  fileUrl: text("fileUrl").notNull(),
  sha256Hash: varchar("sha256Hash", { length: 64 }).notNull(), // File integrity hash
  fileType: varchar("fileType", { length: 50 }).notNull(), // image/jpeg, video/mp4, etc.
  fileSize: int("fileSize"), // in bytes
  width: int("width"),
  height: int("height"),
  duration: int("duration"), // for videos, in seconds
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  ownerIdx: index("owner_idx").on(table.ownerType, table.ownerId),
  hashIdx: index("hash_idx").on(table.sha256Hash),
}));

export type MediaAsset = typeof mediaAssets.$inferSelect;
export type InsertMediaAsset = typeof mediaAssets.$inferInsert;

// ========== VOTES ==========

/**
 * Votes table - Multi-tenant with fingerprint hash and risk score
 */
export const votes = mysqlTable("votes", {
  id: int("id").autoincrement().primaryKey(),
  eventId: int("eventId").notNull(),
  candidateId: int("candidateId").notNull(),
  fingerprintHash: varchar("fingerprintHash", { length: 64 }).notNull(), // SHA256 of browser fingerprint
  ipHash: varchar("ipHash", { length: 64 }), // SHA256 of IP address (privacy)
  userAgent: text("userAgent"),
  riskScore: int("riskScore").default(0).notNull(), // 0-100, higher = more suspicious
  isVerified: int("isVerified").default(0).notNull(), // 0 = unverified, 1 = verified
  isFlagged: int("isFlagged").default(0).notNull(), // 0 = legitimate, 1 = flagged as fraud
  metadata: text("metadata"), // JSON string for additional data
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  eventIdx: index("event_idx").on(table.eventId),
  candidateIdx: index("candidate_idx").on(table.candidateId),
  fingerprintIdx: index("fingerprint_idx").on(table.fingerprintHash),
}));

export type Vote = typeof votes.$inferSelect;
export type InsertVote = typeof votes.$inferInsert;

// ========== CERTIFICATES ==========

/**
 * Certificates table - Blockchain-ready with multiple hashes
 */
export const certificates = mysqlTable("certificates", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  eventId: int("eventId").notNull(),
  candidateId: int("candidateId").notNull(),
  certificateId: varchar("certificateId", { length: 64 }).notNull().unique(), // Public identifier
  
  // Hashes for integrity
  assetHash: varchar("assetHash", { length: 64 }).notNull(), // SHA256 of PDF file
  metadataHash: varchar("metadataHash", { length: 64 }).notNull(), // SHA256 of metadata JSON
  certificateHash: varchar("certificateHash", { length: 64 }).notNull(), // Combined hash
  
  // Files
  pdfUrl: text("pdfUrl").notNull(),
  thumbnailUrl: text("thumbnailUrl"),
  
  // QR Code
  qrPayloadJson: text("qrPayloadJson").notNull(), // JSON with all verify data
  qrCodeUrl: text("qrCodeUrl"),
  
  // Verify
  publicVerifyUrl: text("publicVerifyUrl").notNull(),
  
  // Blockchain (optional)
  blockchainTxHash: varchar("blockchainTxHash", { length: 66 }), // Ethereum tx hash
  blockchainTimestamp: timestamp("blockchainTimestamp"),
  blockchainNetwork: varchar("blockchainNetwork", { length: 50 }), // mainnet, polygon, etc.
  
  // Status
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

export type Certificate = typeof certificates.$inferSelect;
export type InsertCertificate = typeof certificates.$inferInsert;

// ========== AUDIT LOGS ==========

/**
 * Audit logs table - Append-only for compliance and security
 */
export const auditLogs = mysqlTable("audit_logs", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  actorUserId: int("actorUserId"), // Who performed the action
  action: varchar("action", { length: 100 }).notNull(), // create, update, delete, vote, etc.
  entityType: varchar("entityType", { length: 50 }).notNull(), // candidate, event, vote, etc.
  entityId: int("entityId"),
  payloadJson: text("payloadJson"), // JSON with action details
  ipHash: varchar("ipHash", { length: 64 }), // SHA256 of IP address
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  orgIdx: index("org_idx").on(table.organizationId),
  actorIdx: index("actor_idx").on(table.actorUserId),
  entityIdx: index("entity_idx").on(table.entityType, table.entityId),
  createdIdx: index("created_idx").on(table.createdAt),
}));

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;

// ========== TRACKING & SOCIAL SCORING ==========

/**
 * Tracking events table - Social media tracking
 */
export const trackingEvents = mysqlTable("tracking_events", {
  id: int("id").autoincrement().primaryKey(),
  eventId: int("eventId").notNull(),
  candidateId: int("candidateId").notNull(),
  eventType: mysqlEnum("eventType", ["view", "click", "share", "qr_scan"]).notNull(),
  fingerprint: varchar("fingerprint", { length: 255 }).notNull(),
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  referrer: text("referrer"),
  shareUrl: varchar("shareUrl", { length: 500 }),
  metadata: text("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  eventIdx: index("event_idx").on(table.eventId),
  candidateIdx: index("candidate_idx").on(table.candidateId),
}));

export type TrackingEvent = typeof trackingEvents.$inferSelect;
export type InsertTrackingEvent = typeof trackingEvents.$inferInsert;

/**
 * Social scores table - Aggregated scores per candidate
 */
export const socialScores = mysqlTable("social_scores", {
  id: int("id").autoincrement().primaryKey(),
  eventId: int("eventId").notNull(),
  candidateId: int("candidateId").notNull(),
  viewCount: int("viewCount").default(0).notNull(),
  clickCount: int("clickCount").default(0).notNull(),
  shareCount: int("shareCount").default(0).notNull(),
  qrScanCount: int("qrScanCount").default(0).notNull(),
  totalScore: int("totalScore").default(0).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  eventIdx: index("event_idx").on(table.eventId),
  candidateIdx: uniqueIndex("candidate_idx").on(table.eventId, table.candidateId),
}));

export type SocialScore = typeof socialScores.$inferSelect;
export type InsertSocialScore = typeof socialScores.$inferInsert;
