/**
 * Certificates Router - tRPC routes for certificate management
 * 
 * Créé par JS-Innov.IA (Pagin Julien) - Dour, Belgique
 * © Tous droits réservés - Copie strictement interdite
 */

import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { getOrganizationId, requireAdmin } from "../_core/isolation";
import * as dbMultitenant from "../db-multitenant";
import {
  generateCertificateId,
  generateAndUploadCertificate,
  type CertificateStyle,
} from "../_core/certificate-generator";

export const certificatesRouter = router({
  /**
   * Générer un nouveau certificat
   */
  generate: protectedProcedure
    .input(
      z.object({
        contestId: z.number(),
        candidateId: z.number(),
        candidateName: z.string(),
        category: z.string(),
        rank: z.string().optional(),
        eventName: z.string(),
        editionYear: z.number(),
        location: z.string(),
        date: z.date(),
        style: z.enum(["bronze", "gold", "champagne"]).default("gold"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      requireAdmin(ctx);
      const organizationId = getOrganizationId(ctx);

      // Récupérer les settings de l'organisation
      const org = await dbMultitenant.getOrganizationById(organizationId);
      const settings = await dbMultitenant.getOrganizationSettings(organizationId);

      if (!org) {
        throw new Error("Organization not found");
      }

      // Générer le certificat ID
      const certificateId = generateCertificateId();

      // Générer et uploader le certificat
      const result = await generateAndUploadCertificate(
        {
          organizationId,
          organizationName: org.name,
          eventName: input.eventName,
          editionYear: input.editionYear,
          candidateName: input.candidateName,
          category: input.category,
          rank: input.rank,
          date: input.date,
          location: input.location,
          logoUrl: settings?.logoUrl || undefined,
          style: input.style as CertificateStyle,
        },
        certificateId
      );

      // Sauvegarder dans la base de données
      const certId = await dbMultitenant.createCertificate({
        organizationId,
        contestId: input.contestId,
        candidateId: input.candidateId,
        certificateId,
        assetHash: result.hashes.assetHash,
        metadataHash: result.hashes.metadataHash,
        certificateHash: result.hashes.certificateHash,
        pdfUrl: result.pdfUrl,
        qrCodeUrl: result.qrCodeUrl,
        qrPayloadJson: JSON.stringify({
          certificateId,
          verifyUrl: `https://miss-mister-dour.manus.space/verify/${certificateId}`,
          ...result.hashes,
        }),
        publicVerifyUrl: `https://miss-mister-dour.manus.space/verify/${certificateId}`,
        status: "issued",
        issuedAt: new Date(),
      });

      // Log audit
      await dbMultitenant.createAuditLog({
        organizationId,
        actorUserId: ctx.user!.id,
        action: "certificate_generated",
        entityType: "certificate",
        entityId: certId as number,
        payloadJson: JSON.stringify({
          certificateId,
          candidateName: input.candidateName,
          eventName: input.eventName,
        }),
      });

      return {
        certificateId,
        pdfUrl: result.pdfUrl,
        qrCodeUrl: result.qrCodeUrl,
        verifyUrl: `https://miss-mister-dour.manus.space/verify/${certificateId}`,
      };
    }),

  /**
   * Lister tous les certificats de l'organisation
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    const organizationId = getOrganizationId(ctx);
    return await dbMultitenant.getCertificatesByOrganization(organizationId);
  }),

  /**
   * Vérifier un certificat (public)
   */
  verify: publicProcedure
    .input(z.object({ certificateId: z.string() }))
    .query(async ({ input }) => {
      const certificate = await dbMultitenant.getCertificateByCertificateId(
        input.certificateId
      );

      if (!certificate) {
        throw new Error("Certificate not found");
      }

      // Récupérer l'organisation
      const org = await dbMultitenant.getOrganizationById(
        certificate.organizationId
      );

      return {
        certificate,
        organization: org,
        isValid: certificate.status === "issued",
        isRevoked: certificate.status === "revoked",
      };
    }),

  /**
   * Révoquer un certificat
   */
  revoke: protectedProcedure
    .input(
      z.object({
        certificateId: z.string(),
        reason: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      requireAdmin(ctx);
      const organizationId = getOrganizationId(ctx);

      const certificate = await dbMultitenant.revokeCertificate(
        organizationId,
        input.certificateId,
        input.reason
      );

      // Log audit
      await dbMultitenant.createAuditLog({
        organizationId,
        actorUserId: ctx.user!.id,
        action: "certificate_revoked",
        entityType: "certificate",
        payloadJson: JSON.stringify({
          certificateId: input.certificateId,
          reason: input.reason,
        }),
      });

      return certificate;
    }),
});
