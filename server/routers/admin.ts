/**
 * Admin Router - Multi-Tenant Administration
 * 
 * Gestion des settings d'organisation, audit logs, statistiques
 * 
 * Créé par JS-Innov.IA (Pagin Julien) - Dour, Belgique
 * © Tous droits réservés - Copie strictement interdite
 */

import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getOrganizationId, requireAdmin, requireOwner } from "../_core/isolation";
import * as dbMultitenant from "../db-multitenant";
import { storagePut } from "../storage";
import { exportVotesPDF, exportVotesExcel } from "../export-votes";
import mysql from "mysql2/promise";

export const adminRouter = router({
  /**
   * Récupérer les informations de l'organisation
   */
  getOrganization: protectedProcedure.query(async ({ ctx }) => {
    const organizationId = getOrganizationId(ctx);
    return await dbMultitenant.getOrganizationById(organizationId);
  }),

  /**
   * Récupérer les settings de l'organisation
   */
  getSettings: protectedProcedure.query(async ({ ctx }) => {
    const organizationId = getOrganizationId(ctx);
    return await dbMultitenant.getOrganizationSettings(organizationId);
  }),

  /**
   * Mettre à jour les settings de l'organisation
   */
  updateSettings: protectedProcedure
    .input(
      z.object({
        primaryColor: z.string().optional(),
        secondaryColor: z.string().optional(),
        logoUrl: z.string().optional(),
        certificateStyle: z.enum(["bronze", "gold", "champagne"]).optional(),
        verifyPageStyle: z.enum(["classic", "festival", "premium"]).optional(),
        blockchainEnabled: z.boolean().optional(),
        socialScoringEnabled: z.boolean().optional(),
        voteAntiFraudEnabled: z.boolean().optional(),
        auditLogsEnabled: z.boolean().optional(),
        customDomain: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      requireAdmin(ctx);
      const organizationId = getOrganizationId(ctx);

      // Convertir les booléens en nombres pour MySQL
      const dbInput: any = { ...input };
      if (input.blockchainEnabled !== undefined) {
        dbInput.blockchainEnabled = input.blockchainEnabled ? 1 : 0;
      }
      if (input.socialScoringEnabled !== undefined) {
        dbInput.socialScoringEnabled = input.socialScoringEnabled ? 1 : 0;
      }
      if (input.voteAntiFraudEnabled !== undefined) {
        dbInput.voteAntifraudEnabled = input.voteAntiFraudEnabled ? 1 : 0;
        delete dbInput.voteAntiFraudEnabled;
      }
      if (input.auditLogsEnabled !== undefined) {
        dbInput.auditLogsEnabled = input.auditLogsEnabled ? 1 : 0;
      }

      const updated = await dbMultitenant.updateOrganizationSettings(
        organizationId,
        dbInput
      );

      // Log audit
      await dbMultitenant.createAuditLog({
        organizationId,
        actorUserId: ctx.user!.id,
        action: "settings_updated",
        entityType: "organization_settings",
        entityId: organizationId,
        payloadJson: JSON.stringify(input),
      });

      return updated;
    }),

  /**
   * Upload logo de l'organisation
   */
  uploadLogo: protectedProcedure
    .input(
      z.object({
        fileName: z.string(),
        fileData: z.string(), // base64
        mimeType: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      requireAdmin(ctx);
      const organizationId = getOrganizationId(ctx);

      // Convertir base64 en buffer
      const buffer = Buffer.from(input.fileData, "base64");

      // Upload vers S3
      const key = `organizations/${organizationId}/logo-${Date.now()}.${\n        input.fileName.split(".").pop()\n      }`;\n      const result = await storagePut(key, buffer, input.mimeType);\n\n      // Mettre à jour les settings\n      await dbMultitenant.updateOrganizationSettings(organizationId, {\n        logoUrl: result.url,\n      });\n\n      // Log audit\n      await dbMultitenant.createAuditLog({\n        organizationId,\n        actorUserId: ctx.user!.id,\n        action: "logo_uploaded",\n        entityType: "organization_settings",\n        entityId: organizationId,\n        payloadJson: JSON.stringify({ logoUrl: result.url }),\n      });\n\n      return { logoUrl: result.url };\n    }),\n\n  /**\n   * Récupérer les audit logs\n   */\n  getAuditLogs: protectedProcedure\n    .input(\n      z.object({\n        limit: z.number().optional().default(100),\n      })\n    )\n    .query(async ({ ctx, input }) => {\n      requireAdmin(ctx);\n      const organizationId = getOrganizationId(ctx);\n      return await dbMultitenant.getAuditLogsByOrganization(\n        organizationId,\n        input.limit\n      );\n    }),\n\n  /**\n   * Récupérer les statistiques de l'organisation\n   */\n  getStatistics: protectedProcedure.query(async ({ ctx }) => {\n    requireAdmin(ctx);\n    const organizationId = getOrganizationId(ctx);\n    return await dbMultitenant.getOrganizationStats(organizationId);\n  }),\n\n  /**\n   * Diagnostic Dropbox - vérifie schema et configuration\n   */\n  dropboxDiagnostic: protectedProcedure.query(async ({ ctx }) => {\n    requireAdmin(ctx);\n    \n    if (!process.env.DATABASE_URL) {\n      return { success: false, error: \"DATABASE_URL not configured\" };\n    }\n\n    const connection = await mysql.createConnection(process.env.DATABASE_URL);\n    \n    try {\n      // Check table existence\n      const [tables] = await connection.execute<any[]>(\n        `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE()`\n      );\n      const tableNames = new Set(tables.map((r) => r.TABLE_NAME));\n\n      // Check critical tables\n      const criticalTables = [\"users\", \"candidates\", \"photos\", \"media\", \"dropbox_integrations\", \"dropbox_media_sync\"];\n      const missing = criticalTables.filter((t) => !tableNames.has(t));\n      const present = criticalTables.filter((t) => tableNames.has(t));\n\n      // Count records in key tables\n      const stats: Record<string, number> = {};\n      for (const table of [\"users\", \"candidates\", \"photos\", \"dropbox_integrations\", \"dropbox_media_sync\"]) {\n        if (tableNames.has(table)) {\n          try {\n            const [[{ count }]] = await connection.execute<any[]>(`SELECT COUNT(*) as count FROM ${table}`);\n            stats[table] = count;\n          } catch (e) {\n            stats[table] = -1;\n          }\n        }\n      }\n\n      return {\n        success: missing.length === 0,\n        totalTables: tableNames.size,\n        presentTables: present,\n        missingTables: missing,\n        recordCounts: stats,\n        dropboxReady: tableNames.has(\"dropbox_integrations\") && tableNames.has(\"dropbox_media_sync\"),\n      };\n    } finally {\n      await connection.end();\n    }\n  }),\n\n  /**\n   * Activer/désactiver la blockchain\n   */\n  toggleBlockchain: protectedProcedure\n    .input(z.object({ enabled: z.boolean() }))\n    .mutation(async ({ ctx, input }) => {\n      requireOwner(ctx);\n      const organizationId = getOrganizationId(ctx);\n\n      await dbMultitenant.updateOrganizationSettings(organizationId, {\n        blockchainEnabled: input.enabled ? 1 : 0,\n      });\n\n      // Log audit\n      await dbMultitenant.createAuditLog({\n        organizationId,\n        actorUserId: ctx.user!.id,\n        action: input.enabled ? \"blockchain_enabled\" : \"blockchain_disabled\",\n        entityType: \"organization_settings\",\n        entityId: organizationId,\n        payloadJson: JSON.stringify({ enabled: input.enabled }),\n      });\n\n      return { success: true };\n    }),\n\n  /**\n   * Activer/désactiver le social scoring\n   */\n  toggleSocialScoring: protectedProcedure\n    .input(z.object({ enabled: z.boolean() }))\n    .mutation(async ({ ctx, input }) => {\n      requireAdmin(ctx);\n      const organizationId = getOrganizationId(ctx);\n\n      await dbMultitenant.updateOrganizationSettings(organizationId, {\n        socialScoringEnabled: input.enabled ? 1 : 0,\n      });\n\n      // Log audit\n      await dbMultitenant.createAuditLog({\n        organizationId,\n        actorUserId: ctx.user!.id,\n        action: input.enabled\n          ? \"social_scoring_enabled\"\n          : \"social_scoring_disabled\",\n        entityType: \"organization_settings\",\n        entityId: organizationId,\n        payloadJson: JSON.stringify({ enabled: input.enabled }),\n      });\n\n      return { success: true };\n    }),\n\n  /**\n   * Activer/désactiver le vote anti-fraude\n   */\n  toggleVoteAntiFraud: protectedProcedure\n    .input(z.object({ enabled: z.boolean() }))\n    .mutation(async ({ ctx, input }) => {\n      requireAdmin(ctx);\n      const organizationId = getOrganizationId(ctx);\n\n      await dbMultitenant.updateOrganizationSettings(organizationId, {\n        voteAntifraudEnabled: input.enabled ? 1 : 0,\n      });\n\n      // Log audit\n      await dbMultitenant.createAuditLog({\n        organizationId,\n        actorUserId: ctx.user!.id,\n        action: input.enabled\n          ? \"vote_antifraud_enabled\"\n          : \"vote_antifraud_disabled\",\n        entityType: \"organization_settings\",\n        entityId: organizationId,\n        payloadJson: JSON.stringify({ enabled: input.enabled }),\n      });\n\n      return { success: true };\n    }),\n\n  /**\n   * Exporter les votes en PDF\n   */\n  exportVotesPDF,\n\n  /**\n   * Exporter les votes en Excel\n   */\n  exportVotesExcel,\n\n  /**\n   * Récupérer tous les utilisateurs (admin only)\n   */\n  getAllUsers: protectedProcedure.query(async ({ ctx }) => {\n    requireAdmin(ctx);\n    const { getAllUsers } = await import(\"../db\");\n    const allUsers = await getAllUsers();\n    return allUsers;\n  }),\n});\n
