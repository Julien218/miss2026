import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import * as db from "../db";
import { storagePut } from "../storage";
import crypto from "crypto";
import { checkRateLimit, rateLimitConfigs } from "../_core/rateLimit";

/**
 * Router pour l'onboarding des candidats par token d'invitation
 * 
 * Workflow:
 * 1. Admin crée invitation avec role=candidat et email
 * 2. Candidat reçoit lien /onboarding/candidate/:token
 * 3. Candidat valide token (validateToken)
 * 4. Candidat remplit formulaire et soumet (submitOnboarding)
 * 5. Admin review candidature (listApplications)
 * 6. Admin approve (approveApplication) → crée profil candidates
 */

// Helper pour hasher IP (RGPD)
function hashIP(ip: string): string {
  return crypto.createHash('sha256').update(ip).digest('hex');
}

export const candidateOnboardingRouter = router({
  /**
   * Valider un token d'invitation candidat
   * Public - utilisé pour vérifier si le lien est valide avant d'afficher le formulaire
   */
  validateToken: publicProcedure
    .input(z.object({
      token: z.string().min(1),
    }))
    .query(async ({ input, ctx }) => {
      // Rate limiting : 10 req/min par IP
      const clientIp = ctx.req?.ip || ctx.req?.socket?.remoteAddress || 'unknown';
      const rateLimit = checkRateLimit('validateToken', clientIp, rateLimitConfigs.validateToken);
      
      if (rateLimit.limited) {
        throw new TRPCError({
          code: 'TOO_MANY_REQUESTS',
          message: rateLimit.message,
        });
      }
      
      const invitation = await db.getInvitationByToken(input.token);
      
      if (!invitation) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Token invalide ou expiré',
        });
      }

      // Vérifier que c'est bien une invitation candidat
      if (invitation.role !== 'candidat') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Ce lien n\'est pas valide pour une candidature',
        });
      }

      // Vérifier expiration
      if (invitation.expiresAt && new Date(invitation.expiresAt) < new Date()) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Ce lien a expiré',
        });
      }

      // Vérifier maxUses
      const usedCount = invitation.usedCount || 0;
      if (invitation.maxUses && usedCount >= invitation.maxUses) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Ce lien a atteint son nombre maximum d\'utilisations',
        });
      }

      // Vérifier si déjà utilisé (candidature existe)
      if (invitation.candidateApplicationId) {
        const application = await db.getCandidateApplicationById(invitation.candidateApplicationId);
        if (application) {
          return {
            valid: true,
            alreadySubmitted: true,
            email: invitation.email,
            applicationStatus: application.status,
          };
        }
      }

      return {
        valid: true,
        alreadySubmitted: false,
        email: invitation.email,
      };
    }),

  /**
   * Soumettre une candidature via onboarding
   * Public - mais nécessite un token valide
   */
  submitOnboarding: publicProcedure
    .input(z.object({
      token: z.string().min(1),
      firstName: z.string().min(2),
      lastName: z.string().min(2),
      phone: z.string().min(8),
      birthDate: z.string(), // Format ISO date
      city: z.string().min(2),
      region: z.enum(["wallonie", "flandre", "bruxelles"]),
      bio: z.string().min(50, "La bio doit contenir au moins 50 caractères"),
      motivation: z.string().optional(),
      interests: z.array(z.string()).optional(),
      profession: z.string().min(2),
      photo: z.object({
        data: z.string(), // Base64
        mimeType: z.string(),
        filename: z.string(),
      }),
      galleryPhotos: z.array(z.object({
        data: z.string(),
        mimeType: z.string(),
        filename: z.string(),
      })).optional(),
      instagram: z.string().optional(),
      facebook: z.string().optional(),
      tiktok: z.string().optional(),
      linkedin: z.string().optional(),
      acceptRules: z.boolean(),
      acceptMedia: z.boolean().optional(),
      acceptNewsletter: z.boolean().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Rate limiting : 3 req/heure par IP
      const clientIp = ctx.req?.ip || ctx.req?.socket?.remoteAddress || 'unknown';
      const rateLimit = checkRateLimit('submitOnboarding', clientIp, rateLimitConfigs.submitOnboarding);
      
      if (rateLimit.limited) {
        throw new TRPCError({
          code: 'TOO_MANY_REQUESTS',
          message: rateLimit.message,
        });
      }
      
      // 1. Valider le token
      const invitation = await db.getInvitationByToken(input.token);
      
      if (!invitation) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Token invalide',
        });
      }

      if (invitation.role !== 'candidat') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Token invalide pour une candidature',
        });
      }

      // Vérifier expiration
      if (invitation.expiresAt && new Date(invitation.expiresAt) < new Date()) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Ce lien a expiré',
        });
      }

      // Vérifier maxUses
      const usedCount = invitation.usedCount || 0;
      if (invitation.maxUses && usedCount >= invitation.maxUses) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Ce lien a atteint son nombre maximum d\'utilisations',
        });
      }

      // Vérifier si déjà soumis
      if (invitation.candidateApplicationId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Vous avez déjà soumis votre candidature',
        });
      }

      // Vérifier consentements obligatoires
      if (!input.acceptRules) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Vous devez accepter le règlement',
        });
      }

      // 2. Upload photo principale vers S3
      const photoBuffer = Buffer.from(input.photo.data, 'base64');
      const photoKey = `candidates/${invitation.email}/${Date.now()}-${input.photo.filename}`;
      const { url: photoUrl } = await storagePut(photoKey, photoBuffer, input.photo.mimeType);

      // 3. Upload photos galerie vers S3 (optionnel)
      const galleryUrls: string[] = [];
      if (input.galleryPhotos && input.galleryPhotos.length > 0) {
        for (const photo of input.galleryPhotos) {
          const buffer = Buffer.from(photo.data, 'base64');
          const key = `candidates/${invitation.email}/gallery/${Date.now()}-${photo.filename}`;
          const { url } = await storagePut(key, buffer, photo.mimeType);
          galleryUrls.push(url);
        }
      }

      // 4. Hash IP pour RGPD
      const clientIP = ctx.req.ip || ctx.req.connection.remoteAddress || 'unknown';
      const hashedIP = hashIP(clientIP);

      // 5. Créer candidateApplication dans la DB (PERSISTENCE RÉELLE)
      const contestId = invitation.contestId || 1; // Par défaut concours 1 si non spécifié
      const category = invitation.category || 'miss'; // Par défaut miss si non spécifié
      
      const applicationId = await db.createCandidateApplication({
        email: invitation.email,
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone,
        dateOfBirth: new Date(input.birthDate),
        city: input.city,
        region: input.region,
        category: category as "miss" | "mister" | "teen_miss" | "teen_mister",
        bio: input.bio,
        motivation: input.motivation,
        interests: input.interests?.join(', '),
        profession: input.profession,
        photoProfile: photoUrl,
        photoFullBody: galleryUrls.length > 0 ? JSON.stringify(galleryUrls) : undefined,
        instagram: input.instagram,
        facebook: input.facebook,
        tiktok: input.tiktok,
        linkedin: input.linkedin,
        acceptedTerms: input.acceptRules,
        acceptedMedia: input.acceptMedia,
        acceptedNewsletter: input.acceptNewsletter,
        contestId: contestId,
        status: 'pending',
      });

      // 6. Lier l'invitation à la candidature
      await db.linkInvitationToApplication(invitation.id, applicationId.id);

      // 7. Incrémenter usedCount
      await db.incrementInvitationUsedCount(invitation.id);

      return {
        success: true,
        applicationId,
        message: 'Candidature soumise avec succès ! Vous recevrez une réponse par email.',
      };
    }),

  /**
   * Récupérer la candidature d'un candidat par token
   * Public - permet au candidat de voir l'état de sa candidature
   */
  getMyApplication: publicProcedure
    .input(z.object({
      token: z.string().min(1),
    }))
    .query(async ({ input }) => {
      const invitation = await db.getInvitationByToken(input.token);
      
      if (!invitation) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Token invalide',
        });
      }

      if (!invitation.candidateApplicationId) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Aucune candidature trouvée',
        });
      }

      const application = await db.getCandidateApplicationById(invitation.candidateApplicationId);
      
      if (!application) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Candidature introuvable',
        });
      }

      return {
        id: application.id,
        firstName: application.firstName,
        lastName: application.lastName,
        email: application.email,
        phone: application.phone,
        city: application.city,
        region: application.region,
        category: application.category,
        bio: application.bio,
        profilePhoto: application.profilePhoto,
        status: application.status,
        createdAt: application.createdAt,
        rejectionReason: application.rejectionReason,
        candidateId: application.candidateId, // Si approuvé
      };
    }),

  /**
   * Lister toutes les candidatures (admin only)
   * Avec filtres par statut
   */
  listApplications: protectedProcedure
    .input(z.object({
      status: z.enum(["pending", "approved", "rejected"]).optional(),
      contestId: z.number().optional(),
    }))
    .query(async ({ input, ctx }) => {
      // Vérifier que l'utilisateur est admin
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Accès réservé aux administrateurs',
        });
      }

      const applications = await db.getAllCandidateApplications(input.contestId);
      
      // Filtrer par statut si spécifié
      if (input.status) {
        return applications.filter(app => app.status === input.status);
      }
      
      return applications;
    }),

  /**
   * Approuver une candidature (admin only)
   * Crée un profil dans la table candidates
   */
  approveApplication: protectedProcedure
    .input(z.object({
      applicationId: z.number(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Vérifier que l'utilisateur est admin
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Accès réservé aux administrateurs',
        });
      }

      // Récupérer la candidature
      const application = await db.getCandidateApplicationById(input.applicationId);
      
      if (!application) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Candidature introuvable',
        });
      }

      if (application.status === 'approved') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cette candidature est déjà approuvée',
        });
      }

      // Créer le profil candidat dans la table candidates
      // Note: userId est requis mais on n'a pas de compte utilisateur pour le candidat
      // On va créer un userId temporaire ou utiliser un userId par défaut
      const result = await db.createCandidate({
        userId: 1, // TODO: Créer un compte utilisateur pour le candidat
        contestId: application.contestId,
        category: application.category || 'miss',
        firstName: application.firstName,
        lastName: application.lastName,
        dateOfBirth: application.dateOfBirth,
        phone: application.phone || undefined,
        city: application.city,
        country: application.country,
        profilePhoto: application.profilePhoto || undefined,
        bio: application.bio || undefined,
        motivation: application.motivation || undefined,
        status: 'approved', // Statut valide du schéma candidates
      });

      const candidateId = Number(result);

      // Mettre à jour la candidature
      await db.updateCandidateApplicationStatus(
        input.applicationId,
        'approved',
        ctx.user.id
      );

      // Lier la candidature au profil créé
      await db.linkApplicationToCandidate(input.applicationId, candidateId);

      return {
        success: true,
        candidateId,
        message: 'Candidature approuvée et profil créé avec succès',
      };
    }),

  /**
   * Rejeter une candidature (admin only)
   */
  rejectApplication: protectedProcedure
    .input(z.object({
      applicationId: z.number(),
      reason: z.string().min(10, 'La raison doit contenir au moins 10 caractères'),
    }))
    .mutation(async ({ input, ctx }) => {
      // Vérifier que l'utilisateur est admin
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Accès réservé aux administrateurs',
        });
      }

      // Récupérer la candidature
      const application = await db.getCandidateApplicationById(input.applicationId);
      
      if (!application) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Candidature introuvable',
        });
      }

      // Mettre à jour le statut
      await db.updateCandidateApplicationStatus(
        input.applicationId,
        'rejected',
        ctx.user.id,
        input.reason
      );

      return {
        success: true,
        message: 'Candidature rejetée',
      };
    }),
});
