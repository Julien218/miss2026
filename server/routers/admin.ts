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
      const key = `organizations/${organizationId}/logo-${Date.now()}.${
        input.fileName.split(".").pop()
      }`;
      const result = await storagePut(key, buffer, input.mimeType);

      // Mettre à jour les settings
      await dbMultitenant.updateOrganizationSettings(organizationId, {
        logoUrl: result.url,
      });

      // Log audit
      await dbMultitenant.createAuditLog({
        organizationId,
        actorUserId: ctx.user!.id,
        action: "logo_uploaded",
        entityType: "organization_settings",
        entityId: organizationId,
        payloadJson: JSON.stringify({ logoUrl: result.url }),
      });

      return { logoUrl: result.url };
    }),

  /**
   * Récupérer les audit logs
   */
  getAuditLogs: protectedProcedure
    .input(
      z.object({
        limit: z.number().optional().default(100),
      })
    )
    .query(async ({ ctx, input }) => {
      requireAdmin(ctx);
      const organizationId = getOrganizationId(ctx);
      return await dbMultitenant.getAuditLogsByOrganization(
        organizationId,
        input.limit
      );
    }),

  /**
   * Récupérer les statistiques de l'organisation
   */
  getStatistics: protectedProcedure.query(async ({ ctx }) => {
    requireAdmin(ctx);
    const organizationId = getOrganizationId(ctx);
    return await dbMultitenant.getOrganizationStats(organizationId);
  }),

  /**
   * Activer/désactiver la blockchain
   */
  toggleBlockchain: protectedProcedure
    .input(z.object({ enabled: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      requireOwner(ctx);
      const organizationId = getOrganizationId(ctx);

      await dbMultitenant.updateOrganizationSettings(organizationId, {
        blockchainEnabled: input.enabled ? 1 : 0,
      });

      // Log audit
      await dbMultitenant.createAuditLog({
        organizationId,
        actorUserId: ctx.user!.id,
        action: input.enabled ? "blockchain_enabled" : "blockchain_disabled",
        entityType: "organization_settings",
        entityId: organizationId,
        payloadJson: JSON.stringify({ enabled: input.enabled }),
      });

      return { success: true };
    }),

  /**
   * Activer/désactiver le social scoring
   */
  toggleSocialScoring: protectedProcedure
    .input(z.object({ enabled: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      requireAdmin(ctx);
      const organizationId = getOrganizationId(ctx);

      await dbMultitenant.updateOrganizationSettings(organizationId, {
        socialScoringEnabled: input.enabled ? 1 : 0,
      });

      // Log audit
      await dbMultitenant.createAuditLog({
        organizationId,
        actorUserId: ctx.user!.id,
        action: input.enabled
          ? "social_scoring_enabled"
          : "social_scoring_disabled",
        entityType: "organization_settings",
        entityId: organizationId,
        payloadJson: JSON.stringify({ enabled: input.enabled }),
      });

      return { success: true };
    }),

  /**
   * Activer/désactiver le vote anti-fraude
   */
  toggleVoteAntiFraud: protectedProcedure
    .input(z.object({ enabled: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      requireAdmin(ctx);
      const organizationId = getOrganizationId(ctx);

      await dbMultitenant.updateOrganizationSettings(organizationId, {
        voteAntifraudEnabled: input.enabled ? 1 : 0,
      });

      // Log audit
      await dbMultitenant.createAuditLog({
        organizationId,
        actorUserId: ctx.user!.id,
        action: input.enabled
          ? "vote_antifraud_enabled"
          : "vote_antifraud_disabled",
        entityType: "organization_settings",
        entityId: organizationId,
        payloadJson: JSON.stringify({ enabled: input.enabled }),
      });

      return { success: true };
    }),

  /**
   * Exporter les votes en PDF
   */
  exportVotesPDF,

  /**
   * Exporter les votes en Excel
   */
  exportVotesExcel,

  /**
   * Récupérer tous les utilisateurs (admin only)
   */
  getAllUsers: protectedProcedure.query(async ({ ctx }) => {
    requireAdmin(ctx);
    const { getAllUsers } = await import("../db");
    const allUsers = await getAllUsers();
    return allUsers;
  }),
});
