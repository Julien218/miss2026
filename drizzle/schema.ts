import { int, bigint, mysqlEnum, mysqlTable, text, timestamp, varchar, index, uniqueIndex, date } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Organization ID for multi-tenant isolation. Every user belongs to an organization. */
  organizationId: int("organizationId").notNull().default(1),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", [
    "user",           // Niveau 1: Utilisateur basique
    "candidate",      // Niveau 2: Candidat
    "press",          // Niveau 3: Presse
    "photographer",   // Niveau 4: Photographe
    "staff",          // Niveau 5: Staff événement
    "marketing",      // Niveau 6: Marketing
    "organizer",      // Niveau 7: Organisateur
    "admin",          // Niveau 8: Administrateur
    "super_admin",    // Niveau 9: Super administrateur
    // Rôles legacy (à migrer)
    "owner",
    "jury",
    "partner"
  ]).default("user").notNull(),
  permissionOverrides: text("permissionOverrides"), // JSON: {add: [], remove: []}
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
}, (table) => ({
  orgIdx: index("user_org_idx").on(table.organizationId),
}));

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Contests table - stores information about each edition of the contest
 */
export const contests = mysqlTable("contests", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  year: int("year").notNull(),
  description: text("description"),
  status: mysqlEnum("status", ["draft", "registration", "selection", "ongoing", "completed"]).default("draft").notNull(),
  startDate: timestamp("startDate"),
  endDate: timestamp("endDate"),
  location: varchar("location", { length: 255 }),
  rules: text("rules"),
  prizes: text("prizes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Contest = typeof contests.$inferSelect;
export type InsertContest = typeof contests.$inferInsert;

/**
 * Candidates table - stores candidate information and applications
 */
export const candidates = mysqlTable("candidates", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  contestId: int("contestId").notNull(),
  category: mysqlEnum("category", ["miss", "mister", "teen_miss", "teen_mister"]).notNull(),
  firstName: varchar("firstName", { length: 100 }).notNull(),
  lastName: varchar("lastName", { length: 100 }).notNull(),
  dateOfBirth: timestamp("dateOfBirth"),
  phone: varchar("phone", { length: 50 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  country: varchar("country", { length: 100 }),
  height: int("height"), // in cm
  weight: int("weight"), // in kg
  measurements: varchar("measurements", { length: 100 }), // e.g., "90-60-90"
  experience: text("experience"),
  motivation: text("motivation"),
  bio: text("bio"),
  profilePhoto: text("profilePhoto"),
  
  // Social Media
  instagram: varchar("instagram", { length: 100 }),
  facebook: varchar("facebook", { length: 100 }),
  tiktok: varchar("tiktok", { length: 100 }),
  linkedin: varchar("linkedin", { length: 100 }),
  
  // Consentements RGPD (tracés lors de l'inscription)
  acceptRules: int("acceptRules").default(0).notNull(), // 0=false, 1=true
  acceptMedia: int("acceptMedia").default(0).notNull(),
  acceptNewsletter: int("acceptNewsletter").default(0).notNull(),
  acceptCGU: int("acceptCGU").default(0).notNull(), // Acceptation CGU + Politique de confidentialité
  acceptCGUAt: timestamp("acceptCGUAt"), // Horodatage du consentement CGU (RGPD)
  consentVersion: varchar("consentVersion", { length: 20 }).default("v1.0"), // Version des CGU acceptées

  // Accès candidat (auth locale email/password)
  accountEmail: varchar("accountEmail", { length: 320 }), // Email de connexion candidat
  passwordHash: text("passwordHash"), // Hash bcrypt du mot de passe (cost=12)
  accountCreatedAt: timestamp("accountCreatedAt"), // Date de création du compte

  voteCount: int("voteCount").default(0).notNull(), // Total votes received
  shareCount: int("shareCount").default(0).notNull(), // Total shares on social media
  status: mysqlEnum("status", ["pending", "approved", "rejected", "finalist", "winner"]).default("pending").notNull(),
  // Workflow de validation du profil
  profileSubmittedAt: timestamp("profileSubmittedAt"), // Date de soumission du profil complet
  profileReviewNote: text("profileReviewNote"), // Note de l'admin lors du rejet
  registrationDate: timestamp("registrationDate").defaultNow().notNull(),
  validatedAt: timestamp("validatedAt"),
  validatedBy: int("validatedBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Candidate = typeof candidates.$inferSelect;
export type InsertCandidate = typeof candidates.$inferInsert;

/**
 * Media table - stores photos and videos for candidates
 */
export const media = mysqlTable("media", {
  id: int("id").autoincrement().primaryKey(),
  candidateId: int("candidateId"),
  uploadedBy: int("uploadedBy").notNull(),
  type: mysqlEnum("type", ["photo", "video", "document"]).notNull(),
  url: text("url").notNull(),
  fileKey: text("fileKey").notNull(),
  thumbnail: text("thumbnail"),
  title: varchar("title", { length: 255 }),
  description: text("description"),
  mimeType: varchar("mimeType", { length: 100 }),
  fileSize: int("fileSize"),
  contestId: int("contestId"),
  eventId: int("eventId"),
  sessionName: varchar("sessionName", { length: 255 }),
  isPublic: int("isPublic").default(0).notNull(), // 0 = private, 1 = public
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Media = typeof media.$inferSelect;
export type InsertMedia = typeof media.$inferInsert;

/**
 * Events table - stores rehearsals, photo sessions, and public events
 */
export const events = mysqlTable("events", {
  id: int("id").autoincrement().primaryKey(),
  contestId: int("contestId").notNull(),
  type: mysqlEnum("type", ["rehearsal", "photo_session", "public_event", "finale", "other"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  date: timestamp("date").notNull(),
  endDate: timestamp("endDate"),
  location: varchar("location", { length: 255 }),
  duration: int("duration"), // in minutes
  maxAttendees: int("maxAttendees"),
  organizerId: int("organizerId").notNull(),
  status: mysqlEnum("status", ["scheduled", "ongoing", "completed", "cancelled"]).default("scheduled").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Event = typeof events.$inferSelect;
export type InsertEvent = typeof events.$inferInsert;

/**
 * Event attendees table - tracks who attends which events
 */
export const eventAttendees = mysqlTable("eventAttendees", {
  id: int("id").autoincrement().primaryKey(),
  eventId: int("eventId").notNull(),
  userId: int("userId").notNull(),
  candidateId: int("candidateId"),
  status: mysqlEnum("status", ["invited", "confirmed", "attended", "absent"]).default("invited").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EventAttendee = typeof eventAttendees.$inferSelect;
export type InsertEventAttendee = typeof eventAttendees.$inferInsert;

/**
 * Event proposals table - sorties proposées par les membres (candidats/bénévoles)
 * Chaque proposition est validée par un admin (Olivier) avant d'entrer au calendrier.
 * Une date déjà occupée au calendrier (annuel ou 3 mois) ne peut pas être proposée.
 */
export const eventProposals = mysqlTable("event_proposals", {
  id: int("id").autoincrement().primaryKey(),
  proposerId: int("proposerId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  proposedDate: timestamp("proposedDate").notNull(),
  endDate: timestamp("endDate"),
  location: varchar("location", { length: 255 }),
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  priority: int("priority").default(100).notNull(), // 0-49 = calendrier officiel, 100+ = propositions validées
  reviewedBy: int("reviewedBy"),
  reviewedAt: timestamp("reviewedAt"),
  reviewNote: text("reviewNote"),
  eventId: int("eventId"), // événement créé au calendrier une fois approuvé
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EventProposal = typeof eventProposals.$inferSelect;
export type InsertEventProposal = typeof eventProposals.$inferInsert;

/**
 * Evaluations table - stores jury evaluations and scores
 */
export const evaluations = mysqlTable("evaluations", {
  id: int("id").autoincrement().primaryKey(),
  candidateId: int("candidateId").notNull(),
  juryId: int("juryId").notNull(),
  contestId: int("contestId").notNull(),
  eventId: int("eventId"),
  phase: mysqlEnum("phase", ["preliminary", "semifinal", "final"]).notNull(),
  presentationScore: int("presentationScore"), // 0-10
  talentScore: int("talentScore"), // 0-10
  charismaScore: int("charismaScore"), // 0-10
  communicationScore: int("communicationScore"), // 0-10
  overallScore: int("overallScore"), // 0-10
  comments: text("comments"),
  strengths: text("strengths"),
  improvements: text("improvements"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Evaluation = typeof evaluations.$inferSelect;
export type InsertEvaluation = typeof evaluations.$inferInsert;

/**
 * Professionals table - stores photographers and choreographers
 */
export const professionals = mysqlTable("professionals", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  type: mysqlEnum("type", ["photographer", "choreographer", "jury"]).notNull(),
  companyName: varchar("companyName", { length: 255 }),
  specialties: text("specialties"),
  experience: text("experience"),
  portfolio: text("portfolio"),
  bio: text("bio"),
  rate: int("rate"),
  availability: text("availability"),
  certifications: text("certifications"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Professional = typeof professionals.$inferSelect;
export type InsertProfessional = typeof professionals.$inferInsert;

/**
 * Messages table - internal messaging system
 */
export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  senderId: int("senderId").notNull(),
  recipientId: int("recipientId").notNull(),
  subject: varchar("subject", { length: 255 }),
  content: text("content").notNull(),
  isRead: int("isRead").default(0).notNull(), // 0 = unread, 1 = read
  readAt: timestamp("readAt"),
  parentId: int("parentId"), // for threading
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

/**
 * Notifications table - system notifications
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", ["info", "success", "warning", "error", "message", "event", "evaluation"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content"),
  link: varchar("link", { length: 500 }),
  isRead: int("isRead").default(0).notNull(),
  readAt: timestamp("readAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * Articles table - stores AI-generated and manual articles about events, candidates, and news
 */
export const articles = mysqlTable("articles", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  slug: varchar("slug", { length: 500 }).notNull().unique(),
  content: text("content").notNull(),
  excerpt: text("excerpt"),
  imageUrl: text("imageUrl"),
  imageKey: text("imageKey"),
  category: mysqlEnum("category", ["event", "good_action", "candidate", "news_dour", "announcement"]).notNull(),
  tags: text("tags"), // JSON array of tags
  authorId: int("authorId").notNull(),
  authorName: varchar("authorName", { length: 255 }),
  
  // AI generation metadata
  isAiGenerated: int("isAiGenerated").default(0).notNull(), // 0 = manual, 1 = AI
  aiPrompt: text("aiPrompt"), // Original prompt used for generation
  aiModel: varchar("aiModel", { length: 100 }), // Model used (e.g., "gpt-4-vision")
  
  // Related entities
  candidateId: int("candidateId"),
  eventId: int("eventId"),
  contestId: int("contestId"),
  
  // Publishing
  status: mysqlEnum("status", ["draft", "published", "archived"]).default("draft").notNull(),
  publishedAt: timestamp("publishedAt"),
  
  // Engagement metrics
  viewCount: int("viewCount").default(0).notNull(),
  shareCount: int("shareCount").default(0).notNull(),
  likeCount: int("likeCount").default(0).notNull(),
  
  // SEO
  metaTitle: varchar("metaTitle", { length: 255 }),
  metaDescription: text("metaDescription"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  slugIdx: uniqueIndex("article_slug_idx").on(table.slug),
  categoryIdx: index("article_category_idx").on(table.category),
  statusIdx: index("article_status_idx").on(table.status),
}));

export type Article = typeof articles.$inferSelect;
export type InsertArticle = typeof articles.$inferInsert;

/**
 * Votes table - stores public votes for candidates
 */
export const votes = mysqlTable("votes", {
  id: int("id").autoincrement().primaryKey(),
  contestId: int("contestId").notNull(),
  candidateId: int("candidateId").notNull(),
  
  // Voter identification (can be anonymous or authenticated)
  userId: int("userId"), // If authenticated user
  voterIp: varchar("voterIp", { length: 45 }), // IPv4 or IPv6
  voterFingerprint: varchar("voterFingerprint", { length: 64 }), // Browser fingerprint
  voterEmail: varchar("voterEmail", { length: 320 }), // Optional email verification
  
  // Vote metadata
  voteCategory: varchar("voteCategory", { length: 100 }), // e.g., "public_choice", "talent", "style"
  voteWeight: int("voteWeight").default(1).notNull(), // For weighted voting systems
  
  // Verification
  isVerified: int("isVerified").default(0).notNull(), // 0 = unverified, 1 = verified (email/SMS)
  verificationToken: varchar("verificationToken", { length: 64 }),
  verifiedAt: timestamp("verifiedAt"),
  
  // Fraud detection
  userAgent: text("userAgent"),
  referrer: varchar("referrer", { length: 500 }),
  geoCountry: varchar("geoCountry", { length: 2 }),
  geoCity: varchar("geoCity", { length: 100 }),
  isFraudulent: int("isFraudulent").default(0).notNull(), // 0 = legitimate, 1 = flagged as fraud
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Vote = typeof votes.$inferSelect;
export type InsertVote = typeof votes.$inferInsert;

/**
 * Vote sessions table - tracks voting sessions to prevent duplicate votes
 */
export const voteSessions = mysqlTable("voteSessions", {
  id: int("id").autoincrement().primaryKey(),
  contestId: int("contestId").notNull(),
  sessionFingerprint: varchar("sessionFingerprint", { length: 64 }).notNull(), // Unique session identifier
  voterIp: varchar("voterIp", { length: 45 }),
  userId: int("userId"),
  votesCount: int("votesCount").default(0).notNull(),
  lastVoteAt: timestamp("lastVoteAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type VoteSession = typeof voteSessions.$inferSelect;
export type InsertVoteSession = typeof voteSessions.$inferInsert;
/**
 * Tracking events table - stores all tracking events for social media scoring
 */
export const trackingEvents = mysqlTable("tracking_events", {
  id: int("id").autoincrement().primaryKey(),
  contestId: int("contestId").notNull(),
  candidateId: int("candidateId").notNull(),
  eventType: mysqlEnum("eventType", ["view", "click", "share", "qr_scan"]).notNull(),
  fingerprint: varchar("fingerprint", { length: 255 }).notNull(), // Browser fingerprint for anti-fraud
  ipAddress: varchar("ipAddress", { length: 45 }), // IPv4 or IPv6
  userAgent: text("userAgent"),
  referrer: text("referrer"),
  shareUrl: varchar("shareUrl", { length: 500 }),
  metadata: text("metadata"), // JSON string for additional data
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TrackingEvent = typeof trackingEvents.$inferSelect;
export type InsertTrackingEvent = typeof trackingEvents.$inferInsert;

/**
 * Social scores table - aggregated scores per candidate
 */
export const socialScores = mysqlTable("social_scores", {
  id: int("id").autoincrement().primaryKey(),
  contestId: int("contestId").notNull(),
  candidateId: int("candidateId").notNull(),
  viewCount: int("viewCount").default(0).notNull(),
  clickCount: int("clickCount").default(0).notNull(),
  shareCount: int("shareCount").default(0).notNull(),
  qrScanCount: int("qrScanCount").default(0).notNull(),
  totalScore: int("totalScore").default(0).notNull(), // Weighted score
  isClosed: int("isClosed").default(0).notNull(), // 0 = open, 1 = closed
  closedAt: timestamp("closedAt"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SocialScore = typeof socialScores.$inferSelect;
export type InsertSocialScore = typeof socialScores.$inferInsert;

/**
 * Event participants table - tracks who is registered for each event
 */
export const eventParticipants = mysqlTable("event_participants", {
  id: int("id").autoincrement().primaryKey(),
  eventId: int("eventId").notNull(),
  userId: int("userId").notNull(),
  candidateId: int("candidateId"), // If participant is a candidate
  status: mysqlEnum("status", ["registered", "confirmed", "attended", "absent", "cancelled"]).default("registered").notNull(),
  registeredAt: timestamp("registeredAt").defaultNow().notNull(),
  confirmedAt: timestamp("confirmedAt"),
  notes: text("notes"),
});

export type EventParticipant = typeof eventParticipants.$inferSelect;
export type InsertEventParticipant = typeof eventParticipants.$inferInsert;


// ========== MULTI-TENANT TABLES (PROGRESSIVE MIGRATION) ==========

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

export type Organization = typeof organizations.$inferSelect;
export type InsertOrganization = typeof organizations.$inferInsert;

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
  orgIdx: index("org_settings_idx").on(table.organizationId),
}));

export type OrganizationSetting = typeof organizationSettings.$inferSelect;
export type InsertOrganizationSetting = typeof organizationSettings.$inferInsert;

/**
 * Certificates table - Blockchain-ready with multiple hashes
 */
export const certificates = mysqlTable("certificates", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  contestId: int("contestId").notNull(),
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
  orgIdx: index("cert_org_idx").on(table.organizationId),
  certIdIdx: uniqueIndex("cert_id_idx").on(table.certificateId),
  certHashIdx: index("cert_hash_idx").on(table.certificateHash),
}));

export type Certificate = typeof certificates.$inferSelect;
export type InsertCertificate = typeof certificates.$inferInsert;

/**
 * Audit logs table - Append-only for compliance and security
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
  orgIdx: index("audit_org_idx").on(table.organizationId),
  actorIdx: index("audit_actor_idx").on(table.actorUserId),
  entityIdx: index("audit_entity_idx").on(table.entityType, table.entityId),
  createdIdx: index("audit_created_idx").on(table.createdAt),
}));

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;

/**
 * Partners table - stores sponsors and partners information
 */
export const partners = mysqlTable("partners", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  contestId: int("contestId").notNull(),
  companyName: varchar("companyName", { length: 255 }).notNull(),
  contactName: varchar("contactName", { length: 255 }),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 50 }),
  website: varchar("website", { length: 500 }),
  
  // Sponsorship details
  level: mysqlEnum("level", ["platinum", "gold", "silver", "bronze", "supporter"]).notNull(),
  contributionAmount: int("contributionAmount"), // in cents
  contributionType: mysqlEnum("contributionType", ["financial", "inkind", "both"]).default("financial").notNull(),
  
  // Branding
  logoUrl: text("logoUrl"),
  logoKey: text("logoKey"),
  description: text("description"),
  slogan: varchar("slogan", { length: 255 }),
  
  // Social media
  facebookUrl: varchar("facebookUrl", { length: 500 }),
  instagramUrl: varchar("instagramUrl", { length: 500 }),
  linkedinUrl: varchar("linkedinUrl", { length: 500 }),
  twitterUrl: varchar("twitterUrl", { length: 500 }),
  
  // Visibility settings
  isVisible: int("isVisible").default(1).notNull(),
  displayOrder: int("displayOrder").default(0).notNull(),
  
  // Engagement metrics
  impressionCount: int("impressionCount").default(0).notNull(),
  clickCount: int("clickCount").default(0).notNull(),
  
  // Contract
  contractStartDate: timestamp("contractStartDate"),
  contractEndDate: timestamp("contractEndDate"),
  contractDocument: text("contractDocument"),
  
  status: mysqlEnum("status", ["pending", "active", "expired", "cancelled"]).default("pending").notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  contestIdx: index("partner_contest_idx").on(table.contestId),
  levelIdx: index("partner_level_idx").on(table.level),
  statusIdx: index("partner_status_idx").on(table.status),
}));

export type Partner = typeof partners.$inferSelect;
export type InsertPartner = typeof partners.$inferInsert;

/**
 * Partner benefits table - tracks what benefits each partner receives
 */
export const partnerBenefits = mysqlTable("partner_benefits", {
  id: int("id").autoincrement().primaryKey(),
  partnerId: int("partnerId").notNull(),
  benefitType: mysqlEnum("benefitType", [
    "logo_website",
    "logo_event",
    "social_media_mention",
    "vip_tickets",
    "booth_space",
    "program_ad",
    "email_mention",
    "certificate"
  ]).notNull(),
  quantity: int("quantity").default(1).notNull(),
  description: text("description"),
  isDelivered: int("isDelivered").default(0).notNull(),
  deliveredAt: timestamp("deliveredAt"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  partnerIdx: index("benefit_partner_idx").on(table.partnerId),
}));

export type PartnerBenefit = typeof partnerBenefits.$inferSelect;
export type InsertPartnerBenefit = typeof partnerBenefits.$inferInsert;

/**
 * Badges table - defines all available badges in the system
 */
export const badges = mysqlTable("badges", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 64 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 64 }).notNull(), // Lucide icon name
  rarity: mysqlEnum("rarity", ["common", "rare", "epic", "legendary"]).default("common").notNull(),
  category: mysqlEnum("category", ["voting", "sharing", "engagement", "special"]).default("engagement").notNull(),
  requirement: text("requirement"), // Description of how to earn
  isActive: int("isActive").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  rarityIdx: index("badge_rarity_idx").on(table.rarity),
  categoryIdx: index("badge_category_idx").on(table.category),
}));

export type Badge = typeof badges.$inferSelect;
export type InsertBadge = typeof badges.$inferInsert;

/**
 * User badges table - tracks which badges each user has earned
 */
export const userBadges = mysqlTable("user_badges", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  badgeCode: varchar("badgeCode", { length: 64 }).notNull(),
  earnedAt: timestamp("earnedAt").defaultNow().notNull(),
  isDisplayed: int("isDisplayed").default(1).notNull(), // Whether to show on profile
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("user_badge_user_idx").on(table.userId),
  badgeIdx: index("user_badge_badge_idx").on(table.badgeCode),
  uniqueUserBadge: index("unique_user_badge").on(table.userId, table.badgeCode),
}));

export type UserBadge = typeof userBadges.$inferSelect;
export type InsertUserBadge = typeof userBadges.$inferInsert;

/**
 * Candidate analytics table - tracks advanced metrics for each candidate
 */
export const candidateAnalytics = mysqlTable("candidate_analytics", {
  id: int("id").autoincrement().primaryKey(),
  candidateId: int("candidateId").notNull().unique(),
  
  // Share tracking
  shareClicksTotal: int("shareClicksTotal").default(0).notNull(),
  uniqueShareClicks: int("uniqueShareClicks").default(0).notNull(),
  shareClicksToday: int("shareClicksToday").default(0).notNull(),
  
  // Profile view tracking
  profileViews: int("profileViews").default(0).notNull(),
  uniqueProfileViews: int("uniqueProfileViews").default(0).notNull(),
  profileViewsToday: int("profileViewsToday").default(0).notNull(),
  
  // Influence index (0-1000)
  influenceIndex: int("influenceIndex").default(0).notNull(),
  influenceTrend: int("influenceTrend").default(0).notNull(), // Daily change
  
  // Reset tracking
  lastResetDate: timestamp("lastResetDate").defaultNow().notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  candidateIdx: uniqueIndex("analytics_candidate_idx").on(table.candidateId),
}));

export type CandidateAnalytics = typeof candidateAnalytics.$inferSelect;
export type InsertCandidateAnalytics = typeof candidateAnalytics.$inferInsert;

/**
 * IP tracking table - rate limiting for share clicks and profile views
 */
export const ipTracking = mysqlTable("ip_tracking", {
  id: int("id").autoincrement().primaryKey(),
  ipHash: varchar("ipHash", { length: 64 }).notNull(), // SHA-256 hash of IP
  candidateId: int("candidateId").notNull(),
  actionType: mysqlEnum("actionType", ["share", "view"]).notNull(),
  lastActionAt: timestamp("lastActionAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  ipCandidateActionIdx: index("ip_candidate_action_idx").on(table.ipHash, table.candidateId, table.actionType),
  lastActionIdx: index("last_action_idx").on(table.lastActionAt),
}));

export type IpTracking = typeof ipTracking.$inferSelect;
export type InsertIpTracking = typeof ipTracking.$inferInsert;

/**
 * Event config table - stores live event configuration
 */
export const eventConfig = mysqlTable("event_config", {
  id: int("id").autoincrement().primaryKey(),
  contestId: int("contestId").notNull().unique(),
  
  // Live mode settings
  isLiveMode: int("isLiveMode").default(0).notNull(), // 0 = off, 1 = on
  eventDate: timestamp("eventDate").notNull(),
  liveStartTime: timestamp("liveStartTime"),
  liveEndTime: timestamp("liveEndTime"),
  
  // Display settings
  showLiveBanner: int("showLiveBanner").default(1).notNull(),
  showConfetti: int("showConfetti").default(1).notNull(),
  enableLiveNotifications: int("enableLiveNotifications").default(1).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  contestIdx: uniqueIndex("event_config_contest_idx").on(table.contestId),
}));

export type EventConfig = typeof eventConfig.$inferSelect;
export type InsertEventConfig = typeof eventConfig.$inferInsert;


/**
 * Media jobs table - tracks video generation jobs with FlowithOS
 */
export const mediaJobs = mysqlTable("media_jobs", {
  id: int("id").autoincrement().primaryKey(),
  candidateId: int("candidateId").notNull(),
  contestId: int("contestId").notNull().default(1),
  
  // Provider and job details
  provider: varchar("provider", { length: 50 }).notNull().default("flowithOS"), // flowithOS, elevenlabs, runwayml, etc.
  kind: varchar("kind", { length: 100 }).notNull(), // intro_video, candidate_video, teaser, banner, voiceover
  status: mysqlEnum("status", ["pending", "ready", "running", "done", "failed", "needs_approval"]).default("pending").notNull(),
  
  // Mission configuration
  format: varchar("format", { length: 50 }), // "vertical_9_16", "square_1_1", "horizontal_16_9"
  durationSeconds: int("durationSeconds"), // 15, 30, 60
  videoType: varchar("videoType", { length: 100 }), // "intro", "profile", "campaign"
  
  // Reliability
  idempotencyKey: varchar("idempotencyKey", { length: 255 }).unique(), // Prevent duplicate jobs
  retries: int("retries").default(0).notNull(), // Retry count (max 2)
  promptUsed: text("promptUsed"), // Actual prompt sent to provider
  
  // Mission Pack JSON (instructions for FlowithOS)
  missionPackJson: text("missionPackJson"), // JSON string with steps, knowledge refs, etc.
  
  // Results
  outputUrl: varchar("outputUrl", { length: 500 }), // URL to generated video/audio
  previewUrl: varchar("previewUrl", { length: 500 }), // URL to preview (lower quality)
  thumbnailUrl: varchar("thumbnailUrl", { length: 500 }), // URL to thumbnail
  logsJson: text("logsJson"), // Execution logs from provider (JSON)
  errorMessage: text("errorMessage"), // Error details if failed
  
  // Metadata
  requestedBy: int("requestedBy").notNull(), // User ID who requested the job
  processingStartedAt: timestamp("processingStartedAt"),
  processingCompletedAt: timestamp("processingCompletedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  candidateIdx: index("media_jobs_candidate_idx").on(table.candidateId),
  statusIdx: index("media_jobs_status_idx").on(table.status),
  createdAtIdx: index("media_jobs_created_at_idx").on(table.createdAt),
}));

export type MediaJob = typeof mediaJobs.$inferSelect;
export type InsertMediaJob = typeof mediaJobs.$inferInsert;

/**
 * Knowledge Garden table - stores internal documents for AI agents
 * These documents define brand guidelines, video templates, and execution protocols
 */
export const knowledgeGarden = mysqlTable("knowledge_garden", {
  id: int("id").autoincrement().primaryKey(),
  
  // Document classification
  docType: mysqlEnum("docType", ["brand_style", "video_template", "execution_protocol", "general"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(), // URL-friendly identifier
  
  // Content
  content: text("content").notNull(), // Markdown or structured text
  metadata: text("metadata"), // JSON string with additional data
  
  // Versioning
  version: varchar("version", { length: 20 }).notNull().default("1.0.0"),
  isActive: int("isActive").default(1).notNull(), // 0 = archived, 1 = active
  
  // Access control
  visibility: mysqlEnum("visibility", ["public", "internal", "admin_only"]).default("internal").notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  slugIdx: uniqueIndex("knowledge_garden_slug_idx").on(table.slug),
  docTypeIdx: index("knowledge_garden_doc_type_idx").on(table.docType),
  activeIdx: index("knowledge_garden_active_idx").on(table.isActive),
}));

export type KnowledgeGarden = typeof knowledgeGarden.$inferSelect;
export type InsertKnowledgeGarden = typeof knowledgeGarden.$inferInsert;


/**
 * Assets table - stores media assets (videos, audios, images, logos)
 */
export const assets = mysqlTable("assets", {
  id: int("id").autoincrement().primaryKey(),
  
  // Asset details
  type: varchar("type", { length: 50 }).notNull(), // video, audio, image, logo
  url: varchar("url", { length: 500 }).notNull(), // CDN URL
  sha256: varchar("sha256", { length: 64 }).notNull().unique(), // Content hash for deduplication
  
  // Metadata
  filename: varchar("filename", { length: 255 }),
  mimeType: varchar("mimeType", { length: 100 }),
  sizeBytes: int("sizeBytes"),
  durationSeconds: int("durationSeconds"), // For video/audio
  width: int("width"), // For images/videos
  height: int("height"), // For images/videos
  
  // Tagging and categorization
  tags: text("tags"), // JSON array of tags
  description: text("description"),
  
  // Relations
  candidateId: int("candidateId"), // Optional: linked to candidate
  mediaJobId: int("mediaJobId"), // Optional: linked to media job
  uploadedBy: int("uploadedBy").notNull(), // User ID who uploaded
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  sha256Idx: index("assets_sha256_idx").on(table.sha256),
  candidateIdx: index("assets_candidate_idx").on(table.candidateId),
  mediaJobIdx: index("assets_media_job_idx").on(table.mediaJobId),
}));

export type Asset = typeof assets.$inferSelect;
export type InsertAsset = typeof assets.$inferInsert;


// ========== PHOTOS ==========
export const photos = mysqlTable("photos", {
  id: int("id").autoincrement().primaryKey(),
  
  // Storage URLs
  url: varchar("url", { length: 512 }).notNull(), // Full resolution S3 URL
  thumbnail: varchar("thumbnail", { length: 512 }), // Thumbnail S3 URL
  
  // Metadata
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  filename: varchar("filename", { length: 255 }),
  mimeType: varchar("mimeType", { length: 100 }),
  sizeBytes: int("sizeBytes"),
  width: int("width"),
  height: int("height"),
  
  // Categorization
  category: mysqlEnum("category", ["portrait", "event", "backstage", "performance", "other"]).default("other").notNull(),
  tags: text("tags"), // JSON array of tags
  
  // Relations
  candidateId: int("candidateId"), // Optional: linked to candidate
  uploadedBy: int("uploadedBy").notNull(), // User ID who uploaded
  
  // Approval workflow
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  approvedBy: int("approvedBy"), // User ID who approved/rejected
  approvedAt: timestamp("approvedAt"),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  candidateIdx: index("photos_candidate_idx").on(table.candidateId),
  uploadedByIdx: index("photos_uploaded_by_idx").on(table.uploadedBy),
  statusIdx: index("photos_status_idx").on(table.status),
  categoryIdx: index("photos_category_idx").on(table.category),
}));

export type Photo = typeof photos.$inferSelect;
export type InsertPhoto = typeof photos.$inferInsert;


// ========== CANDIDATE APPLICATIONS ==========
export const candidateApplications = mysqlTable("candidateApplications", {
  id: int("id").autoincrement().primaryKey(),
  
  // Personal Information
  firstName: varchar("firstName", { length: 100 }).notNull(),
  lastName: varchar("lastName", { length: 100 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  dateOfBirth: date("dateOfBirth").notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  country: varchar("country", { length: 100 }).default("Belgique").notNull(),
  region: mysqlEnum("region", ["wallonie", "flandre", "bruxelles"]),
  
  // Category
  category: mysqlEnum("category", ["miss", "mister", "teen_miss", "teen_mister"]),
  
  // Media
  profilePhoto: text("profilePhoto"), // S3 URL
  galleryPhotos: text("galleryPhotos"), // JSON array of S3 URLs
  videoPresentation: text("videoPresentation"), // S3 URL (optional)
  
  // Bio & Social
  bio: text("bio"),
  motivation: text("motivation"),
  interests: text("interests"),
  profession: varchar("profession", { length: 255 }),
  instagram: varchar("instagram", { length: 100 }),
  facebook: varchar("facebook", { length: 100 }),
  tiktok: varchar("tiktok", { length: 100 }),
  linkedin: varchar("linkedin", { length: 100 }),
  
  // Application Status
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  rejectionReason: text("rejectionReason"), // Reason if rejected
  
  // Validation
  acceptedTerms: int("acceptedTerms").default(0).notNull(), // 0 = false, 1 = true
  acceptedMedia: int("acceptedMedia").default(0).notNull(),
  acceptedNewsletter: int("acceptedNewsletter").default(0).notNull(),
  
  // RGPD
  ipAddressHash: varchar("ipAddressHash", { length: 64 }), // SHA256 hash of IP address
  
  // Relations
  contestId: int("contestId").notNull(), // Which contest edition
  reviewedBy: int("reviewedBy"), // User ID who approved/rejected (Olivier Trevis)
  reviewedAt: timestamp("reviewedAt"),
  candidateId: int("candidateId"), // Created candidate ID after approval
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  emailIdx: index("candidateApplications_email_idx").on(table.email),
  statusIdx: index("candidateApplications_status_idx").on(table.status),
  contestIdx: index("candidateApplications_contest_idx").on(table.contestId),
}));

export type CandidateApplication = typeof candidateApplications.$inferSelect;
export type InsertCandidateApplication = typeof candidateApplications.$inferInsert;

// ========== INVITATIONS ==========
export const invitations = mysqlTable("invitations", {
  id: int("id").primaryKey().autoincrement(),
  role: mysqlEnum("role", ["admin", "directeur", "manager", "photographe", "candidat", "jury", "viewer"]).notNull(),
  email: varchar("email", { length: 255 }).notNull(), // Email obligatoire
  token: varchar("token", { length: 64 }).notNull().unique(),
  expiresAt: timestamp("expires_at"),
  maxUses: int("max_uses").default(1),
  usedCount: int("used_count").default(0),
  isActive: int("is_active").default(1).notNull(), // 0 = inactive, 1 = active
  permissionOverrides: text("permission_overrides"), // JSON: {add: [], remove: []}
  createdBy: int("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  
  // Onboarding candidat
  candidateApplicationId: int("candidate_application_id"), // Lien vers candidateApplications après soumission
  contestId: int("contest_id"), // Édition du concours (2026, 2027, etc.)
  category: mysqlEnum("category", ["miss", "mister", "teen_miss", "teen_mister"]), // Catégorie du candidat
});

export type Invitation = typeof invitations.$inferSelect;
export type InsertInvitation = typeof invitations.$inferInsert;

// ========== PROFILE EDIT TOKENS ==========
/**
 * Profile edit tokens - lien unique partageable pour qu'un candidat remplisse son profil
 * L'admin génère un token par candidat, le candidat remplit ses infos via /profile/edit/:token
 */
export const profileEditTokens = mysqlTable("profileEditTokens", {
  id: int("id").autoincrement().primaryKey(),
  candidateId: int("candidateId").notNull(),
  token: varchar("token", { length: 64 }).notNull().unique(),
  isActive: int("isActive").default(1).notNull(), // 0 = révoqué, 1 = actif
  usedCount: int("usedCount").default(0).notNull(), // Nombre de fois utilisé
  lastUsedAt: timestamp("lastUsedAt"),
  expiresAt: timestamp("expiresAt"), // null = pas d'expiration
  createdBy: int("createdBy").notNull(), // Admin qui a généré le token
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  candidateIdx: index("profile_token_candidate_idx").on(table.candidateId),
  tokenIdx: uniqueIndex("profile_token_token_idx").on(table.token),
}));

export type ProfileEditToken = typeof profileEditTokens.$inferSelect;
export type InsertProfileEditToken = typeof profileEditTokens.$inferInsert;


// ========== NOTIFICATION SETTINGS ==========
/**
 * Paramètres de notifications configurables par le super_admin
 * Chaque type de notification peut être activé/désactivé indépendamment
 */
export const notificationSettings = mysqlTable("notificationSettings", {
  id: int("id").autoincrement().primaryKey(),
  // Type d'événement déclencheur
  eventType: varchar("eventType", { length: 64 }).notNull().unique(),
  // Libellé affiché dans le dashboard
  label: varchar("label", { length: 255 }).notNull(),
  description: text("description"),
  // Catégorie de la notification
  category: mysqlEnum("category", ["admin", "candidate", "both"]).default("admin").notNull(),
  // Canaux activés
  emailEnabled: int("emailEnabled").default(1).notNull(),    // 0 = off, 1 = on
  dashboardEnabled: int("dashboardEnabled").default(1).notNull(),
  // Destinataires admin (JSON array de rôles)
  adminRecipients: text("adminRecipients"),
  // Template email (optionnel, sinon template par défaut)
  emailSubjectTemplate: varchar("emailSubjectTemplate", { length: 512 }),
  emailBodyTemplate: text("emailBodyTemplate"),
  // Priorité (low, normal, high, urgent)
  priority: mysqlEnum("priority", ["low", "normal", "high", "urgent"]).default("normal").notNull(),
  // Actif globalement
  isActive: int("isActive").default(1).notNull(),
  updatedBy: int("updatedBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type NotificationSetting = typeof notificationSettings.$inferSelect;
export type InsertNotificationSetting = typeof notificationSettings.$inferInsert;

// ========== NOTIFICATIONS LOG ==========
/**
 * Journal des notifications envoyées (admin + candidats)
 */
export const notificationsLog = mysqlTable("notificationsLog", {
  id: int("id").autoincrement().primaryKey(),
  // Référence au type d'événement
  eventType: varchar("eventType", { length: 64 }).notNull(),
  // Destinataire
  recipientType: mysqlEnum("recipientType", ["admin", "candidate", "super_admin"]).notNull(),
  recipientUserId: int("recipientUserId"),    // null si email externe
  recipientEmail: varchar("recipientEmail", { length: 320 }),
  // Contenu
  title: varchar("title", { length: 512 }).notNull(),
  body: text("body"),
  // Canaux utilisés
  emailSent: int("emailSent").default(0).notNull(),
  dashboardSent: int("dashboardSent").default(0).notNull(),
  // Statut
  status: mysqlEnum("status", ["pending", "sent", "failed", "read"]).default("pending").notNull(),
  readAt: timestamp("readAt"),
  // Contexte (JSON : candidateId, contestId, etc.)
  context: text("context"),
  // Priorité
  priority: mysqlEnum("priority", ["low", "normal", "high", "urgent"]).default("normal").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  eventTypeIdx: index("notif_event_type_idx").on(table.eventType),
  recipientIdx: index("notif_recipient_idx").on(table.recipientUserId),
  statusIdx: index("notif_status_idx").on(table.status),
}));
export type NotificationLog = typeof notificationsLog.$inferSelect;
export type InsertNotificationLog = typeof notificationsLog.$inferInsert;

// ─── WhatsApp Business Logs ────────────────────────────────────────────────────
export const whatsappLogs = mysqlTable("whatsappLogs", {
  id: int("id").autoincrement().primaryKey(),
  candidateId: int("candidateId"),
  phone: varchar("phone", { length: 30 }).notNull(),
  candidateName: varchar("candidateName", { length: 200 }),
  message: text("message").notNull(),
  templateType: varchar("templateType", { length: 50 }).default("custom"),
  messageId: varchar("messageId", { length: 100 }),
  status: mysqlEnum("status", ["sent", "delivered", "read", "failed"]).default("sent").notNull(),
  errorMessage: text("errorMessage"),
  sentBy: int("sentBy"),
  sentAt: bigint("sentAt", { mode: "number" }).notNull(),
  deliveredAt: bigint("deliveredAt", { mode: "number" }),
  readAt: bigint("readAt", { mode: "number" }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  wbaCandidateIdx: index("wba_candidate_idx").on(table.candidateId),
  wbaStatusIdx: index("wba_status_idx").on(table.status),
  wbaSentAtIdx: index("wba_sent_at_idx").on(table.sentAt),
}));
export type WhatsAppLog = typeof whatsappLogs.$inferSelect;
export type InsertWhatsAppLog = typeof whatsappLogs.$inferInsert;


// ─── Commentaires de soutien sur profils candidats ──────────────────────────
export const candidateComments = mysqlTable("candidate_comments", {
  id: int("id").autoincrement().primaryKey(),
  candidateId: int("candidate_id").notNull(),
  parentId: int("parent_id"),
  authorName: varchar("author_name", { length: 100 }).notNull(),
  authorEmail: varchar("author_email", { length: 320 }),
  content: text("content").notNull(),
  likes: int("likes").notNull().default(0),
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).notNull().default("approved"),
  ipHash: varchar("ip_hash", { length: 64 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  candidateIdx: index("cc_candidate_idx").on(table.candidateId),
  statusIdx: index("cc_status_idx").on(table.status),
  parentIdx: index("cc_parent_idx").on(table.parentId),
}));
export type CandidateComment = typeof candidateComments.$inferSelect;
export type InsertCandidateComment = typeof candidateComments.$inferInsert;

export const commentLikes = mysqlTable("comment_likes", {
  id: int("id").autoincrement().primaryKey(),
  commentId: int("comment_id").notNull(),
  ipHash: varchar("ip_hash", { length: 64 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  commentIdx: index("cl_comment_idx").on(table.commentId),
  ipIdx: index("cl_ip_idx").on(table.ipHash),
  uniqueLike: uniqueIndex("cl_unique_like").on(table.commentId, table.ipHash),
}));
export type CommentLike = typeof commentLikes.$inferSelect;
export type InsertCommentLike = typeof commentLikes.$inferInsert;

// ─── Galerie : abonnés aux nouveautés ─────────────────────────────────────────
export const gallerySubscribers = mysqlTable("gallery_subscribers", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull(),
  name: varchar("name", { length: 100 }),
  status: mysqlEnum("status", ["active", "unsubscribed"]).default("active").notNull(),
  unsubscribedAt: timestamp("unsubscribedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  emailIdx: index("gs_email_idx").on(table.email),
  statusIdx: index("gs_status_idx").on(table.status),
  uniqueEmail: uniqueIndex("gs_unique_email").on(table.email),
}));
export type GallerySubscriber = typeof gallerySubscribers.$inferSelect;
export type InsertGallerySubscriber = typeof gallerySubscribers.$inferInsert;
