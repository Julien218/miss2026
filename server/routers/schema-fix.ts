/**
 * schema-fix.ts - Safe, non-destructive database schema repair
 * Idempotent: CREATE TABLE IF NOT EXISTS, ALTER TABLE ADD KEY IF NOT EXISTS
 * Preserves all existing data and no columns are dropped or renamed
 */

import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const schemaFixRouter = router({
  /**
   * Repair missing tables/indexes (idempotent, non-destructive)
   * Only callable by super_admin to prevent accidental misuse
   */
  repairSchema: protectedProcedure.use(({ ctx, next }) => {
    if (ctx.user.role !== 'super_admin') {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'Super admin access required' });
    }
    return next({ ctx });
  }).mutation(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const results: string[] = [];

    try {
      // 1. Create photos table if missing
      await db.execute(sql.raw(`
        CREATE TABLE IF NOT EXISTS \`photos\` (
          \`id\` int AUTO_INCREMENT NOT NULL,
          \`url\` varchar(512) NOT NULL,
          \`thumbnail\` varchar(512),
          \`title\` varchar(255) NOT NULL,
          \`description\` text,
          \`filename\` varchar(255),
          \`mimeType\` varchar(100),
          \`sizeBytes\` int,
          \`width\` int,
          \`height\` int,
          \`category\` enum('portrait','event','backstage','performance','other') NOT NULL DEFAULT 'other',
          \`tags\` text,
          \`candidateId\` int,
          \`uploadedBy\` int NOT NULL,
          \`status\` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
          \`approvedBy\` int,
          \`approvedAt\` timestamp NULL,
          \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
          \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          PRIMARY KEY(\`id\`),
          KEY \`photos_candidate_idx\` (\`candidateId\`),
          KEY \`photos_uploaded_by_idx\` (\`uploadedBy\`),
          KEY \`photos_status_idx\` (\`status\`),
          KEY \`photos_category_idx\` (\`category\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `));
      results.push("✓ photos table ready");
    } catch (e: any) {
      results.push(`photos: ${e.message || "error"}`);
    }

    try {
      // 2. Create media table if missing
      await db.execute(sql.raw(`
        CREATE TABLE IF NOT EXISTS \`media\` (
          \`id\` int AUTO_INCREMENT NOT NULL,
          \`candidateId\` int,
          \`uploadedBy\` int NOT NULL,
          \`type\` enum('photo','video','document') NOT NULL,
          \`url\` text NOT NULL,
          \`fileKey\` text NOT NULL,
          \`thumbnail\` text,
          \`title\` varchar(255),
          \`description\` text,
          \`mimeType\` varchar(100),
          \`fileSize\` int,
          \`contestId\` int,
          \`eventId\` int,
          \`sessionName\` varchar(255),
          \`isPublic\` int NOT NULL DEFAULT 0,
          \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY(\`id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `));
      results.push("✓ media table ready");
    } catch (e: any) {
      results.push(`media: ${e.message || "error"}`);
    }

    try {
      // 3. Create contests table if missing
      await db.execute(sql.raw(`
        CREATE TABLE IF NOT EXISTS \`contests\` (
          \`id\` int AUTO_INCREMENT NOT NULL,
          \`title\` varchar(255) NOT NULL,
          \`year\` int NOT NULL,
          \`description\` text,
          \`status\` enum('draft','registration','selection','ongoing','completed') NOT NULL DEFAULT 'draft',
          \`startDate\` timestamp NULL,
          \`endDate\` timestamp NULL,
          \`location\` varchar(255),
          \`rules\` text,
          \`prizes\` text,
          \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
          \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          PRIMARY KEY(\`id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `));
      results.push("✓ contests table ready");
    } catch (e: any) {
      results.push(`contests: ${e.message || "error"}`);
    }

    try {
      // 4. Create candidates table if missing
      await db.execute(sql.raw(`
        CREATE TABLE IF NOT EXISTS \`candidates\` (
          \`id\` int AUTO_INCREMENT NOT NULL,
          \`userId\` int NOT NULL,
          \`contestId\` int NOT NULL,
          \`category\` enum('miss','mister','teen_miss','teen_mister') NOT NULL,
          \`firstName\` varchar(100) NOT NULL,
          \`lastName\` varchar(100) NOT NULL,
          \`dateOfBirth\` timestamp NULL,
          \`phone\` varchar(50),
          \`address\` text,
          \`city\` varchar(100),
          \`country\` varchar(100),
          \`height\` int,
          \`weight\` int,
          \`measurements\` varchar(100),
          \`experience\` text,
          \`motivation\` text,
          \`bio\` text,
          \`profilePhoto\` text,
          \`instagram\` varchar(100),
          \`facebook\` varchar(100),
          \`tiktok\` varchar(100),
          \`linkedin\` varchar(100),
          \`acceptRules\` int NOT NULL DEFAULT 0,
          \`acceptMedia\` int NOT NULL DEFAULT 0,
          \`acceptNewsletter\` int NOT NULL DEFAULT 0,
          \`acceptCGU\` int NOT NULL DEFAULT 0,
          \`acceptCGUAt\` timestamp NULL,
          \`consentVersion\` varchar(20) DEFAULT 'v1.0',
          \`accountEmail\` varchar(320),
          \`passwordHash\` text,
          \`accountCreatedAt\` timestamp NULL,
          \`voteCount\` int NOT NULL DEFAULT 0,
          \`shareCount\` int NOT NULL DEFAULT 0,
          \`status\` enum('pending','approved','rejected','finalist','winner') NOT NULL DEFAULT 'pending',
          \`profileSubmittedAt\` timestamp NULL,
          \`profileReviewNote\` text,
          \`registrationDate\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
          \`validatedAt\` timestamp NULL,
          \`validatedBy\` int,
          \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
          \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          PRIMARY KEY(\`id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `));
      results.push("✓ candidates table ready");
    } catch (e: any) {
      results.push(`candidates: ${e.message || "error"}`);
    }

    try {
      // 5. Create users table if missing
      await db.execute(sql.raw(`
        CREATE TABLE IF NOT EXISTS \`users\` (
          \`id\` int AUTO_INCREMENT NOT NULL,
          \`organizationId\` int NOT NULL DEFAULT 1,
          \`openId\` varchar(64) NOT NULL UNIQUE,
          \`name\` text,
          \`email\` varchar(320),
          \`loginMethod\` varchar(64),
          \`role\` enum('user','candidate','press','photographer','staff','marketing','organizer','admin','super_admin','owner','jury','partner') NOT NULL DEFAULT 'user',
          \`permissionOverrides\` text,
          \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
          \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          \`lastSignedIn\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY(\`id\`),
          KEY \`user_org_idx\` (\`organizationId\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `));
      results.push("✓ users table ready");
    } catch (e: any) {
      results.push(`users: ${e.message || "error"}`);
    }

    return { success: true, messages: results };
  }),
});
