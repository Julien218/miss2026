import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "./db";
import crypto from "crypto";
import { storagePut } from "./storage";
import { certificatesRouter } from "./routers/certificates";
import { adminRouter } from "./routers/admin";
import { articlesRouter } from "./routers/articles";
import { votesRouter } from "./routers/votes";
import { badgesRouter } from "./routers/badges";
import { candidateOnboardingRouter } from "./routers/candidateOnboarding";
import { candidateProfileRouter } from "./routers/candidateProfile";
import { notificationsRouter } from "./routers/notifications";
import { commentsRouter } from "./routers/comments";
import { assistantRouter } from "./routers/assistant";
import { whatsappRouter } from "./routers/whatsapp";
import { videoGeneratorRouter } from "./routers/videoGenerator";
import { validationRouter } from "./routers/validation";
import { checkRateLimit, rateLimitConfigs } from "./_core/rateLimit";

// Admin-only procedure (admin + super_admin)
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin' && ctx.user.role !== 'super_admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }
  return next({ ctx });
});

// Super admin only procedure
const superAdminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'super_admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Super admin access required' });
  }
  return next({ ctx });
});

// Helper email invitation
async function sendInvitationEmail(to: string, inviteUrl: string, role: string, inviterName: string): Promise<boolean> {
  const { ENV } = await import('./_core/env');
  if (!ENV.forgeApiUrl || !ENV.forgeApiKey) return false;
  const roleLabels: Record<string, string> = {
    admin: 'Administrateur', super_admin: 'Super Administrateur',
    photographe: 'Photographe', jury: 'Jury', manager: 'Manager',
    directeur: 'Directeur', candidat: 'Candidat', viewer: 'Observateur',
  };
  const roleLabel = roleLabels[role] || role;
  const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#0A0A0F;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0A0A0F;padding:40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#111;border-radius:16px;border:1px solid #C87941;overflow:hidden;max-width:600px;">
<tr><td style="background:linear-gradient(135deg,#1a0f08,#2a1a0a);padding:40px;text-align:center;border-bottom:2px solid #C87941;">
<p style="color:#C87941;font-size:12px;letter-spacing:4px;text-transform:uppercase;margin:0 0 8px;">MISS &amp; MISTER DOUR 2026</p>
<h1 style="color:#E8D5B7;font-size:24px;margin:0;">Vous êtes invité(e)</h1>
<p style="color:#aaa;font-size:13px;margin:10px 0 0;">Rôle : <strong style="color:#C87941;">${roleLabel}</strong></p>
</td></tr>
<tr><td style="padding:40px;">
<p style="color:#E8D5B7;font-size:16px;margin:0 0 16px;">Bonjour,</p>
<p style="color:#ccc;font-size:15px;line-height:1.7;margin:0 0 24px;">
<strong style="color:#C87941;">${inviterName}</strong> vous invite à rejoindre la plateforme
<strong>Miss &amp; Mister Dour 2026</strong> en tant que <strong style="color:#C87941;">${roleLabel}</strong>.
</p>
<table cellpadding="0" cellspacing="0" style="margin:0 auto 32px;">
<tr><td style="background:linear-gradient(135deg,#C87941,#D4956A);border-radius:12px;">
<a href="${inviteUrl}" style="display:block;padding:16px 40px;color:#0A0A0F;font-weight:700;font-size:16px;text-decoration:none;">✨ Accepter l'invitation</a>
</td></tr></table>
<p style="color:#888;font-size:12px;text-align:center;">Ou copiez ce lien : <a href="${inviteUrl}" style="color:#C87941;">${inviteUrl}</a></p>
</td></tr>
<tr><td style="background:#0a0a0a;padding:20px;text-align:center;border-top:1px solid #222;">
<p style="color:#444;font-size:11px;margin:0;">STARLIGHT ASBL · Grand'Place 9, 7370 Dour · © 2026 Miss &amp; Mister Dour</p>
</td></tr></table></td></tr></table></body></html>`;
  try {
    const baseUrl = ENV.forgeApiUrl.endsWith('/') ? ENV.forgeApiUrl : `${ENV.forgeApiUrl}/`;
    const endpoint = new URL('webdevtoken.v1.WebDevService/SendEmail', baseUrl).toString();
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { accept: 'application/json', authorization: `Bearer ${ENV.forgeApiKey}`, 'content-type': 'application/json', 'connect-protocol-version': '1' },
      body: JSON.stringify({ to, subject: `Invitation Miss & Mister Dour 2026 - Rôle : ${roleLabel}`, html }),
    });
    return res.ok;
  } catch { return false; }
}

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ========== CONTESTS ==========
  contests: router({
    list: publicProcedure.query(async () => {
      return await db.getAllContests();
    }),
    
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getContestById(input.id);
      }),
    
    create: adminProcedure
      .input(z.object({
        title: z.string(),
        year: z.number(),
        description: z.string().optional(),
        status: z.enum(["draft", "registration", "selection", "ongoing", "completed"]).optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        location: z.string().optional(),
        rules: z.string().optional(),
        prizes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.createContest(input);
        return { success: true };
      }),
    
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        year: z.number().optional(),
        description: z.string().optional(),
        status: z.enum(["draft", "registration", "selection", "ongoing", "completed"]).optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        location: z.string().optional(),
        rules: z.string().optional(),
        prizes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateContest(id, data);
        return { success: true };
      }),
    
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteContest(input.id);
        return { success: true };
      }),
  }),

  // ========== CANDIDATES ==========
  candidates: router({
    listByContest: protectedProcedure
      .input(z.object({ contestId: z.number() }))
      .query(async ({ ctx, input }) => {
        // Vérifier permission CAN_VIEW_CANDIDATES
        const { hasPermission, Permission } = await import("./permissions");
        if (!hasPermission(ctx.user.role, Permission.CAN_VIEW_CANDIDATES, ctx.user.permissionOverrides)) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Permission CAN_VIEW_CANDIDATES requise' });
        }
        return await db.getCandidatesByContest(input.contestId);
      }),
    
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        // Vérifier permission CAN_VIEW_CANDIDATES
        const { hasPermission, Permission } = await import("./permissions");
        if (!hasPermission(ctx.user.role, Permission.CAN_VIEW_CANDIDATES, ctx.user.permissionOverrides)) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Permission CAN_VIEW_CANDIDATES requise' });
        }
        return await db.getCandidateById(input.id);
      }),
    
    incrementShareCount: publicProcedure
      .input(z.object({ candidateId: z.number().int().positive() }))
      .mutation(async ({ input }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) throw new Error("Database not available");
        
        const { candidates } = await import("../drizzle/schema");
        const { eq, sql } = await import("drizzle-orm");
        
        // Récupérer les infos du candidat avant incrémentation
        const [candidateBefore] = await dbInstance
          .select({
            userId: candidates.userId,
            firstName: candidates.firstName,
            lastName: candidates.lastName,
            shareCount: candidates.shareCount,
          })
          .from(candidates)
          .where(eq(candidates.id, input.candidateId))
          .limit(1);
        
        if (!candidateBefore) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Candidat non trouvé" });
        }
        
        // Incrémenter shareCount by 1
        await dbInstance
          .update(candidates)
          .set({ shareCount: sql`${candidates.shareCount} + 1` })
          .where(eq(candidates.id, input.candidateId));
        
        // Return updated candidate
        const [updated] = await dbInstance
          .select()
          .from(candidates)
          .where(eq(candidates.id, input.candidateId))
          .limit(1);
        
        // Envoyer notification au candidat
        const { sendCandidateNotification } = await import("./_core/notification");
        const newShareCount = (candidateBefore.shareCount || 0) + 1;
        
        await sendCandidateNotification(candidateBefore.userId.toString(), {
          title: "🎉 Nouveau partage !",
          content: `Votre profil a été partagé sur les réseaux sociaux ! Vous avez maintenant ${newShareCount} partage${newShareCount > 1 ? 's' : ''}. Continuez à encourager vos supporters à partager votre profil pour maximiser vos chances !`,
        }).catch(err => {
          console.warn("[incrementShareCount] Failed to send notification:", err);
        });
        
        return {
          success: true,
          shareCount: updated?.shareCount || 0,
        };
      }),
    
    getMine: protectedProcedure
      .input(z.object({ contestId: z.number() }))
      .query(async ({ ctx, input }) => {
        return await db.getCandidateByUserId(ctx.user.id, input.contestId);
      }),
    
    search: protectedProcedure
      .input(z.object({
        contestId: z.number(),
        search: z.string().optional(),
        category: z.string().optional(),
        status: z.string().optional(),
      }))
      .query(async ({ ctx, input }) => {
        // Vérifier permission CAN_VIEW_CANDIDATES
        const { hasPermission, Permission } = await import("./permissions");
        if (!hasPermission(ctx.user.role, Permission.CAN_VIEW_CANDIDATES, ctx.user.permissionOverrides)) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Permission CAN_VIEW_CANDIDATES requise' });
        }
        return await db.searchCandidates(input.contestId, input.search, input.category, input.status);
      }),
    
    // Public registration for Miss & Mister Dour 2026
    registerPublic: publicProcedure
      .input(z.object({
        // Étape 1: Informations personnelles
        firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
        lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
        email: z.string().email("Email invalide"),
        phone: z.string().regex(/^(\+32|0)[0-9]{9}$/, "Téléphone invalide (format belge)"),
        birthDate: z.string(),
        city: z.string().min(1, "Ville requise"),
        category: z.enum(["miss", "mister"]),
        
        // Étape 2: Photo et présentation
        photoBase64: z.string().min(1, "Photo requise"),
        photoFilename: z.string(),
        bio: z.string().min(100, "La bio doit contenir au moins 100 caractères").max(500, "La bio ne doit pas dépasser 500 caractères"),
        motivation: z.string().min(50, "La motivation doit contenir au moins 50 caractères"),
        interests: z.array(z.string()),
        profession: z.string().min(1, "Profession/Études requise"),
        
        // Étape 3: Réseaux sociaux (optionnels)
        instagram: z.string().optional(),
        facebook: z.string().optional(),
        tiktok: z.string().optional(),
        linkedin: z.string().optional(),
        
        // Étape 4: Validation
        acceptRules: z.boolean().refine(val => val === true, "Vous devez accepter le règlement"),
        acceptMedia: z.boolean().refine(val => val === true, "Vous devez autoriser l'utilisation des photos/vidéos"),
        acceptNewsletter: z.boolean(),
        acceptCGU: z.boolean().refine(val => val === true, "Vous devez accepter les Conditions Générales d'Utilisation et la Politique de Confidentialité"),
        consentVersion: z.string().optional().default("v1.0"),
      }))
      .mutation(async ({ input }) => {
        // Validation de l'âge
        const age = new Date().getFullYear() - new Date(input.birthDate).getFullYear();
        if (age < 18 || age > 35) {
          throw new TRPCError({ 
            code: 'BAD_REQUEST', 
            message: 'Vous devez avoir entre 18 et 35 ans' 
          });
        }

        // Vérifier si l'email existe déjà
        // TODO: Implémenter la vérification email unique
        
        // Vérifier si l'email existe déjà (anti-doublon)
        const existing = await db.getCandidateApplicationByEmail(input.email);
        if (existing) {
          throw new TRPCError({ 
            code: 'CONFLICT', 
            message: "Une candidature avec cet email existe déjà. Si vous pensez qu'il s'agit d'une erreur, contactez-nous." 
          });
        }

        // Upload de la photo vers le stockage
        const photoBuffer = Buffer.from(input.photoBase64.split(',')[1], 'base64');
        const photoExtension = input.photoFilename.split('.').pop() || 'jpg';
        const photoKey = `candidates/${Date.now()}-${Math.random().toString(36).substring(7)}.${photoExtension}`;
        
        const { url: photoUrl } = await storagePut(
          photoKey,
          photoBuffer,
          `image/${photoExtension}`
        );

        // Insérer la candidature dans la base de données
        const application = await db.createCandidateApplication({
          email: input.email,
          firstName: input.firstName,
          lastName: input.lastName,
          phone: input.phone,
          dateOfBirth: new Date(input.birthDate),
          city: input.city,
          country: "Belgique",
          category: input.category,
          photoProfile: photoUrl,
          bio: input.bio,
          motivation: input.motivation,
          interests: JSON.stringify(input.interests || []),
          profession: input.profession,
          instagram: input.instagram || undefined,
          facebook: input.facebook || undefined,
          tiktok: input.tiktok || undefined,
          linkedin: input.linkedin || undefined,
          acceptedTerms: input.acceptCGU,
          acceptedMedia: input.acceptMedia,
          acceptedNewsletter: input.acceptNewsletter,
          status: "pending",
        });

        // Notifier les admins de la nouvelle candidature
        (async () => {
          try {
            const admins = await db.getAllAdmins();
            for (const admin of admins) {
              await db.createNotification({
                userId: admin.id,
                type: "info",
                title: "Nouvelle candidature 2027",
                content: `${input.firstName} ${input.lastName} s'est inscrit(e) en tant que ${input.category === 'miss' ? 'Miss' : 'Mister'} Dour 2027. Candidature #${application.id} en attente de validation.`,
              });
            }
          } catch (err) {
            console.error("[Registration] Failed to notify admins:", err);
          }
        })().catch(() => {});

        return { 
          success: true,
          candidateId: application.id,
          photoUrl,
          consentTraced: {
            acceptCGU: input.acceptCGU,
            acceptCGUAt: new Date().toISOString(),
            consentVersion: input.consentVersion || 'v1.0',
          },
        };
      }),

    register: protectedProcedure
      .input(z.object({
        contestId: z.number(),
        category: z.enum(["miss", "mister", "teen_miss", "teen_mister"]),
        firstName: z.string(),
        lastName: z.string(),
        dateOfBirth: z.date().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        country: z.string().optional(),
        height: z.number().optional(),
        weight: z.number().optional(),
        measurements: z.string().optional(),
        experience: z.string().optional(),
        motivation: z.string().optional(),
        bio: z.string().optional(),
        profilePhoto: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.createCandidate({
          userId: ctx.user.id,
          ...input,
        });
        
        // Create notification for admin
        await db.createNotification({
          userId: ctx.user.id,
          type: "info",
          title: "Candidature enregistrée",
          content: "Votre candidature a été enregistrée avec succès. Elle sera examinée par notre équipe.",
        });
        
        return { success: true };
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        dateOfBirth: z.date().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        country: z.string().optional(),
        height: z.number().optional(),
        weight: z.number().optional(),
        measurements: z.string().optional(),
        experience: z.string().optional(),
        motivation: z.string().optional(),
        bio: z.string().optional(),
        profilePhoto: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        const candidate = await db.getCandidateById(id);
        
        if (!candidate) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Candidat non trouvé' });
        }
        
        if (candidate.userId !== ctx.user.id && ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Non autorisé' });
        }
        
        await db.updateCandidate(id, data);
        return { success: true };
      }),
    
    updateStatus: adminProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["pending", "approved", "rejected", "finalist", "winner"]),
      }))
      .mutation(async ({ ctx, input }) => {
        const candidate = await db.getCandidateById(input.id);
        if (!candidate) {
          throw new TRPCError({ code: 'NOT_FOUND' });
        }
        
        await db.updateCandidate(input.id, {
          status: input.status,
          validatedAt: new Date(),
          validatedBy: ctx.user.id,
        });
        
        // Notify candidate
        await db.createNotification({
          userId: candidate.userId,
          type: input.status === "approved" ? "success" : input.status === "rejected" ? "error" : "info",
          title: "Statut de candidature mis à jour",
          content: `Votre candidature a été ${input.status === "approved" ? "approuvée" : input.status === "rejected" ? "rejetée" : "mise à jour"}.`,
        });
        
        return { success: true };
      }),
  }),

  // ========== MEDIA ==========
  media: router({
    listByCandidate: publicProcedure
      .input(z.object({ candidateId: z.number() }))
      .query(async ({ input }) => {
        return await db.getMediaByCandidate(input.candidateId);
      }),
    
    listPublic: publicProcedure
      .input(z.object({ contestId: z.number().optional() }))
      .query(async ({ input }) => {
        return await db.getPublicMedia(input.contestId);
      }),
    
    upload: protectedProcedure
      .input(z.object({
        candidateId: z.number().optional(),
        type: z.enum(["photo", "video", "document"]),
        fileData: z.string(), // base64
        fileName: z.string(),
        mimeType: z.string(),
        title: z.string().optional(),
        description: z.string().optional(),
        contestId: z.number().optional(),
        eventId: z.number().optional(),
        sessionName: z.string().optional(),
        isPublic: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Convert base64 to buffer
        const buffer = Buffer.from(input.fileData, 'base64');
        
        // Generate unique file key
        const timestamp = Date.now();
        const fileKey = `media/${ctx.user.id}/${timestamp}-${input.fileName}`;
        
        // Upload to S3
        const { url } = await storagePut(fileKey, buffer, input.mimeType);
        
        // Save to database
        await db.createMedia({
          candidateId: input.candidateId,
          uploadedBy: ctx.user.id,
          type: input.type,
          url,
          fileKey,
          title: input.title,
          description: input.description,
          mimeType: input.mimeType,
          fileSize: buffer.length,
          contestId: input.contestId,
          eventId: input.eventId,
          sessionName: input.sessionName,
          isPublic: input.isPublic ? 1 : 0,
        });
        
        return { success: true, url };
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        isPublic: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, isPublic, ...data } = input;
        await db.updateMedia(id, {
          ...data,
          ...(isPublic !== undefined ? { isPublic: isPublic ? 1 : 0 } : {}),
        });
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteMedia(input.id);
        return { success: true };
      }),
  }),

  // ========== EVENTS ==========
  events: router({
    listByContest: publicProcedure
      .input(z.object({ contestId: z.number() }))
      .query(async ({ input }) => {
        return await db.getEventsByContest(input.contestId);
      }),
    
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getEventById(input.id);
      }),
    
    create: adminProcedure
      .input(z.object({
        contestId: z.number(),
        type: z.enum(["rehearsal", "photo_session", "public_event", "finale", "other"]),
        title: z.string(),
        description: z.string().optional(),
        date: z.date(),
        endDate: z.date().optional(),
        location: z.string().optional(),
        duration: z.number().optional(),
        maxAttendees: z.number().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.createEvent({
          ...input,
          organizerId: ctx.user.id,
        });
        return { success: true };
      }),
    
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        type: z.enum(["rehearsal", "photo_session", "public_event", "finale", "other"]).optional(),
        title: z.string().optional(),
        description: z.string().optional(),
        date: z.date().optional(),
        endDate: z.date().optional(),
        location: z.string().optional(),
        duration: z.number().optional(),
        maxAttendees: z.number().optional(),
        status: z.enum(["scheduled", "ongoing", "completed", "cancelled"]).optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateEvent(id, data);
        return { success: true };
      }),
    
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteEvent(input.id);
        return { success: true };
      }),
    
    getAttendees: publicProcedure
      .input(z.object({ eventId: z.number() }))
      .query(async ({ input }) => {
        return await db.getEventAttendees(input.eventId);
      }),
    
    addAttendee: adminProcedure
      .input(z.object({
        eventId: z.number(),
        userId: z.number(),
        candidateId: z.number().optional(),
        status: z.enum(["invited", "confirmed", "attended", "absent"]).optional(),
      }))
      .mutation(async ({ input }) => {
        await db.createEventAttendee(input);
        return { success: true };
      }),
    
    updateAttendeeStatus: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["invited", "confirmed", "attended", "absent"]),
      }))
      .mutation(async ({ input }) => {
        await db.updateEventAttendee(input.id, { status: input.status });
        return { success: true };
      }),

    // Event Participants (new registration system)
    register: protectedProcedure
      .input(z.object({
        eventId: z.number(),
        candidateId: z.number().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return await db.registerForEvent({ ...input, userId: ctx.user.id, status: "registered" });
      }),

    getParticipants: publicProcedure
      .input(z.object({ eventId: z.number() }))
      .query(async ({ input }) => await db.getEventParticipants(input.eventId)),

    getUserEvents: protectedProcedure
      .query(async ({ ctx }) => await db.getUserEvents(ctx.user.id)),

    updateParticipantStatus: adminProcedure
      .input(z.object({
        participantId: z.number(),
        status: z.enum(["registered", "confirmed", "attended", "absent", "cancelled"]),
      }))
      .mutation(async ({ input }) => await db.updateParticipantStatus(input.participantId, input.status)),

    cancelRegistration: protectedProcedure
      .input(z.object({ eventId: z.number() }))
      .mutation(async ({ ctx, input }) => await db.cancelEventRegistration(input.eventId, ctx.user.id)),
  }),

  // ========== EVALUATIONS ==========
  evaluations: router({
    listByCandidate: publicProcedure
      .input(z.object({ candidateId: z.number() }))
      .query(async ({ input }) => {
        return await db.getEvaluationsByCandidate(input.candidateId);
      }),
    
    listByJury: protectedProcedure
      .query(async ({ ctx }) => {
        return await db.getEvaluationsByJury(ctx.user.id);
      }),
    
    getScores: publicProcedure
      .input(z.object({
        contestId: z.number(),
        phase: z.string().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getCandidateScores(input.contestId, input.phase);
      }),
    
    create: protectedProcedure
      .input(z.object({
        candidateId: z.number(),
        contestId: z.number(),
        eventId: z.number().optional(),
        phase: z.enum(["preliminary", "semifinal", "final"]),
        presentationScore: z.number().min(0).max(10).optional(),
        talentScore: z.number().min(0).max(10).optional(),
        charismaScore: z.number().min(0).max(10).optional(),
        communicationScore: z.number().min(0).max(10).optional(),
        overallScore: z.number().min(0).max(10).optional(),
        comments: z.string().optional(),
        strengths: z.string().optional(),
        improvements: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Check if user is jury
        const professional = await db.getProfessionalByUserId(ctx.user.id);
        if (!professional || (professional.type !== 'jury' && ctx.user.role !== 'admin')) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Jury access required' });
        }
        
        await db.createEvaluation({
          ...input,
          juryId: ctx.user.id,
        });
        
        return { success: true };
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        presentationScore: z.number().min(0).max(10).optional(),
        talentScore: z.number().min(0).max(10).optional(),
        charismaScore: z.number().min(0).max(10).optional(),
        communicationScore: z.number().min(0).max(10).optional(),
        overallScore: z.number().min(0).max(10).optional(),
        comments: z.string().optional(),
        strengths: z.string().optional(),
        improvements: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateEvaluation(id, data);
        return { success: true };
      }),
  }),

  // ========== PROFESSIONALS ==========
  professionals: router({
    getProfile: protectedProcedure
      .query(async ({ ctx }) => {
        return await db.getProfessionalByUserId(ctx.user.id);
      }),
    
    listByType: publicProcedure
      .input(z.object({ type: z.enum(["photographer", "choreographer", "jury"]) }))
      .query(async ({ input }) => {
        return await db.getProfessionalsByType(input.type);
      }),
    
    createProfile: protectedProcedure
      .input(z.object({
        type: z.enum(["photographer", "choreographer", "jury"]),
        companyName: z.string().optional(),
        specialties: z.string().optional(),
        experience: z.string().optional(),
        portfolio: z.string().optional(),
        bio: z.string().optional(),
        rate: z.number().optional(),
        availability: z.string().optional(),
        certifications: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.createProfessional({
          userId: ctx.user.id,
          ...input,
        });
        return { success: true };
      }),
    
    updateProfile: protectedProcedure
      .input(z.object({
        companyName: z.string().optional(),
        specialties: z.string().optional(),
        experience: z.string().optional(),
        portfolio: z.string().optional(),
        bio: z.string().optional(),
        rate: z.number().optional(),
        availability: z.string().optional(),
        certifications: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.updateProfessional(ctx.user.id, input);
        return { success: true };
      }),
  }),

  // ========== MESSAGES ==========
  messages: router({
    list: protectedProcedure
      .query(async ({ ctx }) => {
        return await db.getUserMessages(ctx.user.id);
      }),
    
    getConversation: protectedProcedure
      .input(z.object({ otherUserId: z.number() }))
      .query(async ({ ctx, input }) => {
        return await db.getMessagesBetweenUsers(ctx.user.id, input.otherUserId);
      }),
    
    send: protectedProcedure
      .input(z.object({
        recipientId: z.number(),
        subject: z.string().optional(),
        content: z.string(),
        parentId: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.createMessage({
          senderId: ctx.user.id,
          ...input,
        });
        
        // Create notification for recipient
        await db.createNotification({
          userId: input.recipientId,
          type: "message",
          title: "Nouveau message",
          content: `Vous avez reçu un nouveau message de ${ctx.user.name || 'un utilisateur'}`,
          link: `/messages/${ctx.user.id}`,
        });
        
        return { success: true };
      }),
    
    markAsRead: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.markMessageAsRead(input.id);
        return { success: true };
      }),
  }),

  // ========== VOTES ==========
  votes: votesRouter,

  // ========== NOTIFICATIONS ==========
  notifications: router({
    list: protectedProcedure
      .input(z.object({ limit: z.number().optional() }))
      .query(async ({ ctx, input }) => {
        return await db.getUserNotifications(ctx.user.id, input.limit);
      }),
    
    markAsRead: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.markNotificationAsRead(input.id);
        return { success: true };
      }),
    
    markAllAsRead: protectedProcedure
      .mutation(async ({ ctx }) => {
        await db.markAllNotificationsAsRead(ctx.user.id);
        return { success: true };
      }),
  }),
  
  // ========== SHARING ==========
  sharing: router({
    trackShare: publicProcedure
      .input(z.object({
        contestId: z.number(),
        candidateId: z.number(),
        platform: z.string(),
        fingerprint: z.string(),
        ipAddress: z.string().optional(),
        userAgent: z.string().optional(),
        referrer: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        // Rate limiting : 50 req/heure par fingerprint
        const rateLimit = checkRateLimit('shareTracking', input.fingerprint, rateLimitConfigs.shareTracking);
        
        if (rateLimit.limited) {
          throw new TRPCError({
            code: 'TOO_MANY_REQUESTS',
            message: rateLimit.message,
          });
        }
        
        await db.trackShare(input);
        return { success: true };
      }),
    
    getShareStats: publicProcedure
      .input(z.object({ candidateId: z.number() }))
      .query(async ({ input }) => {
        return await db.getShareStats(input.candidateId);
      }),
    
    getDetailedAnalytics: publicProcedure
      .input(z.object({ 
        candidateId: z.number(),
        contestId: z.number()
      }))
      .query(async ({ input }) => {
        return await db.getDetailedAnalytics(input.candidateId, input.contestId);
      }),
  }),

  // ========== ADMIN MULTI-TENANT ==========
  admin: adminRouter,

  // ========== CERTIFICATES ==========
  certificates: certificatesRouter,

  // ========== ARTICLES ==========
  articles: articlesRouter,

  // ========== BADGES ==========
  badges: badgesRouter,

  // ========== TRACKING & SOCIAL SCORING ==========
  tracking: router({
    recordEvent: publicProcedure
      .input(z.object({
        contestId: z.number(),
        candidateId: z.number(),
        eventType: z.enum(["view", "click", "share", "qr_scan"]),
        fingerprint: z.string(),
        ipAddress: z.string().optional(),
        userAgent: z.string().optional(),
        referrer: z.string().optional(),
        shareUrl: z.string().optional(),
        metadata: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const isDuplicate = await db.isDuplicateTrackingEvent(input.fingerprint, input.candidateId, input.eventType, 5);
        if (isDuplicate) return { success: false, message: "Duplicate event detected" };
        return await db.recordTrackingEvent(input);
      }),
    getScoresByContest: publicProcedure
      .input(z.object({ contestId: z.number() }))
      .query(async ({ input }) => await db.getSocialScoresByContest(input.contestId)),
    getScoreByCandidate: publicProcedure
      .input(z.object({ contestId: z.number(), candidateId: z.number() }))
      .query(async ({ input }) => await db.getSocialScoreByCandidate(input.contestId, input.candidateId)),
    closeScoring: adminProcedure
      .input(z.object({ contestId: z.number() }))
      .mutation(async ({ input }) => await db.closeSocialScoring(input.contestId)),
  }),

  // ========== ANALYTICS ==========
  analytics: router({
    // Track share click with IP rate limiting
    trackShareClick: publicProcedure
      .input(z.object({ 
        candidateId: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        // Get IP from request
        const ipAddress = ctx.req.ip || ctx.req.socket.remoteAddress || "unknown";
        return await db.trackShareClick(input.candidateId, ipAddress);
      }),
    
    // Track profile view with IP rate limiting
    trackProfileView: publicProcedure
      .input(z.object({ 
        candidateId: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        // Get IP from request
        const ipAddress = ctx.req.ip || ctx.req.socket.remoteAddress || "unknown";
        return await db.trackProfileView(input.candidateId, ipAddress);
      }),
    
    // Get analytics for a single candidate
    getCandidateAnalytics: publicProcedure
      .input(z.object({ 
        candidateId: z.number(),
      }))
      .query(async ({ input }) => {
        return await db.getCandidateAnalytics(input.candidateId);
      }),
    
    // Get analytics for multiple candidates (for ranking page)
    getBulkAnalytics: publicProcedure
      .input(z.object({ 
        candidateIds: z.array(z.number()),
      }))
      .query(async ({ input }) => {
        return await db.getBulkCandidateAnalytics(input.candidateIds);
      }),
    
    // Get global social barometer metrics
    getGlobalBarometer: publicProcedure
      .query(async () => {
        return await db.getGlobalBarometer();
      }),
    
    // Calculate and update influence index for a candidate
    updateInfluenceIndex: publicProcedure
      .input(z.object({ candidateId: z.number() }))
      .mutation(async ({ input }) => {
        await db.updateInfluenceIndex(input.candidateId);
        return { success: true };
      }),
    
    // Update influence indexes for all candidates
    updateAllInfluenceIndexes: adminProcedure
      .mutation(async () => {
        await db.updateAllInfluenceIndexes();
        return { success: true };
      }),
    
    // Get heatmap data for engagement tracking
    getHeatmapData: adminProcedure
      .input(z.object({
        startDate: z.string().transform(str => new Date(str)),
        endDate: z.string().transform(str => new Date(str)),
        eventType: z.enum(["view", "click", "share", "qr_scan", "all"]).optional(),
        candidateId: z.number().optional(),
        contestId: z.number().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getHeatmapData(input);
      }),
    
    // Get heatmap summary statistics
    getHeatmapSummary: adminProcedure
      .input(z.object({
        startDate: z.string().transform(str => new Date(str)),
        endDate: z.string().transform(str => new Date(str)),
        eventType: z.enum(["view", "click", "share", "qr_scan", "all"]).optional(),
        candidateId: z.number().optional(),
        contestId: z.number().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getHeatmapSummary(input);
      }),
    
    // Export heatmap to CSV
    exportHeatmapCSV: adminProcedure
      .input(z.object({
        startDate: z.string().transform(str => new Date(str)),
        endDate: z.string().transform(str => new Date(str)),
        eventType: z.enum(["view", "click", "share", "qr_scan", "all"]).optional(),
        candidateId: z.number().optional(),
        contestId: z.number().optional(),
      }))
      .query(async ({ input }) => {
        return await db.exportHeatmapToCSV(input);
      }),
    
    // Export heatmap to JSON
    exportHeatmapJSON: adminProcedure
      .input(z.object({
        startDate: z.string().transform(str => new Date(str)),
        endDate: z.string().transform(str => new Date(str)),
        eventType: z.enum(["view", "click", "share", "qr_scan", "all"]).optional(),
        candidateId: z.number().optional(),
        contestId: z.number().optional(),
      }))
      .query(async ({ input }) => {
        return await db.exportHeatmapToJSON(input);
      }),
  }),

  // FlowithOS Video Factory router
  flowithos: router({
    // Create a new video generation mission
    createMission: protectedProcedure
      .input(z.object({
        candidateId: z.number(),
        format: z.enum(["vertical_9_16", "square_1_1", "horizontal_16_9"]).default("vertical_9_16"),
        durationSeconds: z.number().min(15).max(60).default(30),
        videoType: z.enum(["intro", "profile", "campaign"]).default("profile"),
      }))
      .mutation(async ({ input, ctx }) => {
        // Generate mission pack JSON
        const missionPack = await db.generateMissionPack({
          candidateId: input.candidateId,
          format: input.format,
          durationSeconds: input.durationSeconds,
          videoType: input.videoType,
        });

        if (!missionPack) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Candidate not found" });
        }

        // Create media job
        const jobId = await db.createMediaJob({
          candidateId: input.candidateId,
          kind: input.videoType || "candidate_video", // Use videoType as kind
          format: input.format,
          durationSeconds: input.durationSeconds,
          videoType: input.videoType,
          missionPackJson: JSON.stringify(missionPack, null, 2),
          requestedBy: ctx.user.id,
        });

        // Generate open URL (FlowithOS integration placeholder)
        const openUrl = `https://flowithos.ai/mission?id=${missionPack.mission_id}`;

        return {
          jobId,
          missionPack,
          openUrl,
        };
      }),

    // Webhook callback from FlowithOS
    callback: publicProcedure
      .input(z.object({
        jobId: z.number(),
        status: z.enum(["running", "done", "failed"]),
        outputUrl: z.string().optional(),
        thumbnailUrl: z.string().optional(),
        logs: z.string().optional(),
        errorMessage: z.string().optional(),
        signature: z.string().optional(), // HMAC-SHA256 signature for verification
      }))
      .mutation(async ({ input }) => {
        // Verify webhook signature (HMAC-SHA256)
        if (!process.env.FLOWITHOS_WEBHOOK_SECRET) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Webhook secret not configured" });
        }

        if (!input.signature) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Missing signature" });
        }

        // Create payload to sign (jobId + status for simplicity and security)
        const payload = JSON.stringify({ jobId: input.jobId, status: input.status });
        const expectedSignature = crypto
          .createHmac('sha256', process.env.FLOWITHOS_WEBHOOK_SECRET)
          .update(payload)
          .digest('hex');

        // Timing-safe comparison to prevent timing attacks
        // First check if lengths match (constant time for same length)
        if (input.signature.length !== expectedSignature.length) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid signature" });
        }
        
        // Then use timingSafeEqual for constant-time comparison
        if (!crypto.timingSafeEqual(Buffer.from(input.signature), Buffer.from(expectedSignature))) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid signature" });
        }

        // Update media job
        const updateData: any = {
          status: input.status,
          logs: input.logs,
          errorMessage: input.errorMessage,
        };

        if (input.status === "running") {
          updateData.processingStartedAt = new Date();
        }

        if (input.status === "done") {
          updateData.outputUrl = input.outputUrl;
          updateData.thumbnailUrl = input.thumbnailUrl;
          updateData.processingCompletedAt = new Date();
        }

        if (input.status === "failed") {
          updateData.processingCompletedAt = new Date();
        }

        await db.updateMediaJob(input.jobId, updateData);

        return { success: true };
      }),

    // Get media job by ID
    getJob: protectedProcedure
      .input(z.object({ jobId: z.number() }))
      .query(async ({ input }) => {
        return await db.getMediaJobById(input.jobId);
      }),

    // Get all media jobs for a candidate
    getJobsByCandidate: protectedProcedure
      .input(z.object({ candidateId: z.number() }))
      .query(async ({ input }) => {
        return await db.getMediaJobsByCandidate(input.candidateId);
      }),

    // Get knowledge garden documents
    getKnowledgeDocs: protectedProcedure
      .input(z.object({
        docType: z.enum(["brand_style", "video_template", "execution_protocol", "general"]).optional(),
        isActive: z.boolean().optional(),
      }).optional())
      .query(async ({ input }) => {
        return await db.getKnowledgeGardenDocs(input || {});
      }),
  }),

  // ========== ELEVENLABS TTS ==========
  elevenlabs: router({
    generateTTS: protectedProcedure
      .input(z.object({
        text: z.string().min(1).max(5000),
        voiceId: z.string().optional(),
        candidateId: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { generateTTS } = await import("./_core/elevenlabs");
        
        const result = await generateTTS({
          text: input.text,
          voiceId: input.voiceId,
        });

        // Create Asset
        const asset = await db.createAsset({
          type: "audio",
          url: result.audioUrl,
          sha256: result.hash,
          tags: ["elevenlabs", "tts"],
          candidateId: input.candidateId,
        });

        return {
          assetId: asset.id,
          audioUrl: result.audioUrl,
          hash: result.hash,
          cached: result.cached,
        };
      }),

    getVoices: protectedProcedure
      .query(async () => {
        const { getVoices } = await import("./_core/elevenlabs");
        return await getVoices();
      }),
  }),

  // ========== INVITATIONS ==========
  invitations: router({
    validateToken: publicProcedure
      .input(z.object({ token: z.string() }))
      .query(async ({ input }) => {
        const invitation = await db.getInvitationByToken(input.token);
        
        if (!invitation) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Invitation non trouvée' });
        }

        // Check if active
        if (!invitation.isActive) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Cette invitation a été désactivée' });
        }

        // Check expiration
        if (invitation.expiresAt && new Date(invitation.expiresAt) < new Date()) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Cette invitation a expiré' });
        }

        // Check max uses
        if (invitation.maxUses && (invitation.usedCount || 0) >= invitation.maxUses) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Cette invitation a atteint le nombre maximum d\'utilisations' });
        }

        return {
          valid: true,
          invitation: {
            id: invitation.id,
            role: invitation.role,
            email: invitation.email,
            expiresAt: invitation.expiresAt,
            maxUses: invitation.maxUses,
            usedCount: invitation.usedCount || 0,
            permissionOverrides: invitation.permissionOverrides,
          },
        };
      }),

    create: adminProcedure
      .input(z.object({
        // super_admin peut inviter admin ; admin peut inviter les autres
        role: z.enum(["admin", "directeur", "manager", "photographe", "candidat", "jury", "viewer"]),
        email: z.string().email(),
        expiresIn: z.enum(["1h", "24h", "7d", "30d", "never"]),
        maxUses: z.number().min(1).optional(),
        permissionOverrides: z.string().optional(),
        origin: z.string().url().optional(), // Pour construire l'URL d'invitation
        sendEmail: z.boolean().default(true), // Envoyer l'email automatiquement
      }))
      .mutation(async ({ input, ctx }) => {
        // Règle hiérarchique : seul super_admin peut inviter un admin
        if (input.role === 'admin' && ctx.user.role !== 'super_admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Seul le super administrateur peut inviter un administrateur' });
        }

        let expiresAt: Date | undefined;
        if (input.expiresIn !== "never") {
          const now = new Date();
          switch (input.expiresIn) {
            case "1h":  expiresAt = new Date(now.getTime() + 60 * 60 * 1000); break;
            case "24h": expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); break;
            case "7d":  expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); break;
            case "30d": expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); break;
          }
        }

        const invitation = await db.createInvitation({
          role: input.role,
          email: input.email,
          expiresAt,
          maxUses: input.maxUses || 1,
          createdBy: ctx.user.id,
          permissionOverrides: input.permissionOverrides,
        });

        // Envoyer l'email d'invitation si demandé
        if (input.sendEmail && invitation.token) {
          const baseUrl = input.origin || 'https://missdourweb-fqsyubas.manus.space';
          const inviteUrl = `${baseUrl}/invitation/${invitation.token}`;
          const inviterName = ctx.user.name || 'L\'équipe Miss & Mister Dour';
          // Non bloquant
          sendInvitationEmail(input.email, inviteUrl, input.role, inviterName).catch(() => {});
        }

        return {
          ...invitation,
          inviteUrl: `${input.origin || 'https://missdourweb-fqsyubas.manus.space'}/invitation/${invitation.token}`,
        };
      }),

    list: adminProcedure
      .query(async () => {
        return await db.getAllInvitations();
      }),

    deactivate: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deactivateInvitation(input.id);
        return { success: true };
      }),

    markUsed: publicProcedure
      .input(z.object({ token: z.string() }))
      .mutation(async ({ input }) => {
        const invitation = await db.getInvitationByToken(input.token);
        if (!invitation) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Invitation non trouvée' });
        }

        await db.incrementInvitationUsedCount(invitation.id);

        // Deactivate if max uses reached
        if (invitation.maxUses && (invitation.usedCount || 0) + 1 >= invitation.maxUses) {
          await db.deactivateInvitation(invitation.id);
        }

        return { success: true };
      }),

    // Accept invitation and create/update user account
    acceptInvitation: protectedProcedure
      .input(z.object({ token: z.string() }))
      .mutation(async ({ input, ctx }) => {
        const invitation = await db.getInvitationByToken(input.token);
        
        if (!invitation) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Invitation non trouvée' });
        }

        // Check if active
        if (!invitation.isActive) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Cette invitation a été désactivée' });
        }

        // Check expiration
        if (invitation.expiresAt && new Date(invitation.expiresAt) < new Date()) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Cette invitation a expiré' });
        }

        // Check max uses
        if (invitation.maxUses && (invitation.usedCount || 0) >= invitation.maxUses) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Cette invitation a atteint le nombre maximum d\'utilisations' });
        }

        // Check if email matches
        if (ctx.user.email !== invitation.email) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Cette invitation est réservée à un autre email' });
        }

        // Update user role and permission overrides
        await db.updateUserPermissionOverrides(ctx.user.id, {
          role: invitation.role,
          permissionOverrides: invitation.permissionOverrides || null,
        });

        // Increment used count
        await db.incrementInvitationUsedCount(invitation.id);

        // Deactivate if max uses reached
        if (invitation.maxUses && (invitation.usedCount || 0) + 1 >= invitation.maxUses) {
          await db.deactivateInvitation(invitation.id);
        }

        return { success: true };
      }),
  }),

  // ========== PHOTOS ==========
  photos: router({
    // Upload photos with S3 integration
    upload: protectedProcedure
      .input(z.object({
        files: z.array(z.object({
          base64: z.string(),
          filename: z.string(),
          mimeType: z.string(),
          sizeBytes: z.number(),
        })),
        title: z.string(),
        description: z.string().optional(),
        category: z.enum(["portrait", "event", "backstage", "performance", "other"]),
        candidateId: z.number().optional(),
        tags: z.array(z.string()).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        // Check permission
        const { hasPermission, Permission } = await import('./permissions');
        if (!hasPermission(ctx.user.role, Permission.CAN_VIEW_CANDIDATES, ctx.user.permissionOverrides)) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Vous n\'avez pas la permission d\'uploader des photos' });
        }

        const { storagePut } = await import('./storage');
        const uploadedPhotos = [];

        for (const file of input.files) {
          // Convert base64 to Buffer
          const buffer = Buffer.from(file.base64.split(',')[1], 'base64');

          // Generate unique filename with timestamp
          const timestamp = Date.now();
          const randomSuffix = Math.random().toString(36).substring(7);
          const ext = file.filename.split('.').pop();
          const fileKey = `photos/${ctx.user.id}/${timestamp}-${randomSuffix}.${ext}`;

          // Upload to S3
          const { url } = await storagePut(fileKey, buffer, file.mimeType);

          // Create photo record
          const result = await db.createPhoto({
            url,
            thumbnail: url, // TODO: Generate actual thumbnail
            title: input.title,
            description: input.description,
            filename: file.filename,
            mimeType: file.mimeType,
            sizeBytes: file.sizeBytes,
            category: input.category,
            tags: input.tags,
            candidateId: input.candidateId,
            uploadedBy: ctx.user.id,
          });

          uploadedPhotos.push(result);
        }

        return { success: true, count: uploadedPhotos.length };
      }),

    // List photos with filters
    list: protectedProcedure
      .input(z.object({
        category: z.enum(["portrait", "event", "backstage", "performance", "other", "all"]).optional(),
        status: z.enum(["pending", "approved", "rejected", "all"]).optional(),
        candidateId: z.number().optional(),
      }))
      .query(async ({ input, ctx }) => {
        // Check permission
        const { hasPermission, Permission } = await import('./permissions');
        if (!hasPermission(ctx.user.role, Permission.CAN_VIEW_CANDIDATES, ctx.user.permissionOverrides)) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Vous n\'avez pas la permission de voir les photos' });
        }

        const filters: any = {};
        if (input.category && input.category !== "all") filters.category = input.category;
        if (input.status && input.status !== "all") filters.status = input.status;
        if (input.candidateId) filters.candidateId = input.candidateId;

        const photos = await db.getPhotos(filters);

        // Get uploader names
        const photosWithUploaders = await Promise.all(
          photos.map(async (photo) => {
            const uploader = await db.getUserById(photo.uploadedBy);
            return {
              ...photo,
              uploadedByName: uploader?.name || "Inconnu",
            };
          })
        );

        return photosWithUploaders;
      }),

    // Get photo by ID
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        // Check permission
        const { hasPermission, Permission } = await import('./permissions');
        if (!hasPermission(ctx.user.role, Permission.CAN_VIEW_CANDIDATES, ctx.user.permissionOverrides)) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Vous n\'avez pas la permission de voir cette photo' });
        }

        const photo = await db.getPhotoById(input.id);

        if (!photo) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Photo non trouvée' });
        }

        const uploader = await db.getUserById(photo.uploadedBy);

        return {
          ...photo,
          uploadedByName: uploader?.name || "Inconnu",
        };
      }),

    // Approve photo (admin only) + notify uploader & gallery subscribers
    approve: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await db.updatePhotoStatus(input.id, "approved", ctx.user.id);

        // Send email notifications (non-blocking)
        (async () => {
          try {
            const photo = await db.getPhotoById(input.id);
            if (!photo) return;

            // 1. Notify the uploader
            const uploader = await db.getUserById(photo.uploadedBy);
            if (uploader?.email) {
              const { buildPhotoApprovedEmail, sendEmail } = await import("./helpers/email");
              const baseUrl = process.env.PUBLIC_URL || "https://missetmisterdour.be";
              const emailContent = buildPhotoApprovedEmail({
                photoTitle: photo.title,
                photoUrl: photo.url,
                galleryUrl: `${baseUrl}/gallery`,
                recipientName: uploader.name ?? undefined,
              });
              await sendEmail({ to: uploader.email, ...emailContent });
            }

            // 2. Notify gallery subscribers
            const subscribers = await db.getActiveGallerySubscribers();
            if (subscribers.length > 0) {
              const { buildGalleryUpdateEmail, sendEmail } = await import("./helpers/email");
              const baseUrl = process.env.PUBLIC_URL || "https://missetmisterdour.be";
              for (const sub of subscribers) {
                const emailContent = buildGalleryUpdateEmail({
                  photoCount: 1,
                  galleryUrl: `${baseUrl}/gallery`,
                  recipientName: sub.name ?? undefined,
                });
                await sendEmail({ to: sub.email, ...emailContent });
              }
            }
          } catch (err) {
            console.error("[Gallery] Failed to send approval notifications:", err);
          }
        })().catch(() => {});

        return { success: true };
      }),

    // Reject photo (admin only) + notify uploader
    reject: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await db.updatePhotoStatus(input.id, "rejected", ctx.user.id);

        // Send email notification to uploader (non-blocking)
        (async () => {
          try {
            const photo = await db.getPhotoById(input.id);
            if (!photo) return;
            const uploader = await db.getUserById(photo.uploadedBy);
            if (uploader?.email) {
              const { sendEmail } = await import("./helpers/email");
              const baseUrl = process.env.PUBLIC_URL || "https://missetmisterdour.be";
              await sendEmail({
                to: uploader.email,
                subject: "Mise à jour de votre photo — Miss & Mister Dour 2026",
                html: `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;background:#0A0A0F;color:#fff;padding:40px;">
<div style="max-width:600px;margin:0 auto;background:#111;border-radius:16px;border:1px solid #C87941;overflow:hidden;">
<div style="background:linear-gradient(135deg,#1a0f08,#2a1a0a);padding:30px;text-align:center;">
<h1 style="color:#E8D5B7;margin:0;">Photo non retenue</h1>
</div>
<div style="padding:30px;">
<p style="color:#ccc;">Bonjour ${uploader.name || ""},</p>
<p style="color:#ccc;">Votre photo <strong style="color:#C87941;">${photo.title}</strong> n'a pas été retenue pour la galerie publique.
Si vous pensez qu'il s'agit d'une erreur, vous pouvez contacter l'équipe.</p>
</div></div></body></html>`,
                text: `Bonjour, votre photo "${photo.title}" n'a pas été retenue pour la galerie.`,
              });
            }
          } catch (err) {
            console.error("[Gallery] Failed to send rejection notification:", err);
          }
        })().catch(() => {});

        return { success: true };
      }),

    // Delete photo (admin only)
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deletePhoto(input.id);
        return { success: true };
      }),

    // Public: list approved photos with optional category filter
    listPublic: publicProcedure
      .input(z.object({
        category: z.enum(["portrait", "event", "backstage", "performance", "other", "all"]).optional(),
        candidateId: z.number().optional(),
      }).optional())
      .query(async ({ input }) => {
        const filters: any = { status: "approved" };
        if (input?.category && input.category !== "all") filters.category = input.category;
        if (input?.candidateId) filters.candidateId = input.candidateId;
        const photosList = await db.getPhotos(filters);
        // Join with candidate info
        const photosWithCandidate = await Promise.all(
          photosList.map(async (photo) => {
            let candidateName = null;
            let candidateCategory = null;
            if (photo.candidateId) {
              const candidate = await db.getCandidateById(photo.candidateId);
              if (candidate) {
                candidateName = `${candidate.firstName} ${candidate.lastName}`;
                candidateCategory = candidate.category;
              }
            }
            return {
              id: photo.id,
              url: photo.url,
              thumbnail: photo.thumbnail,
              title: photo.title,
              description: photo.description,
              category: photo.category,
              candidateId: photo.candidateId,
              candidateName,
              candidateCategory,
              createdAt: photo.createdAt,
            };
          })
        );
        return photosWithCandidate;
      }),

    // Public: subscribe to gallery updates
    subscribe: publicProcedure
      .input(z.object({
        email: z.string().email(),
        name: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.subscribeToGallery(input.email, input.name);
        return { success: true, message: "Vous êtes abonné aux nouveautés de la galerie !" };
      }),

    // Public: unsubscribe from gallery updates
    unsubscribe: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .mutation(async ({ input }) => {
        await db.unsubscribeFromGallery(input.email);
        return { success: true, message: "Vous avez été désabonné." };
      }),
  }),

  // ========== PERMISSIONS ==========
  permissions: router({
    // Get effective permissions for a user (role + overrides)
    getEffective: protectedProcedure
      .input(z.object({
        userId: z.number().optional(), // If not provided, use current user
      }))
      .query(async ({ input, ctx }) => {
        const targetUserId = input.userId || ctx.user.id;
        
        // Get user from database
        const user = await db.getUserById(targetUserId);

        if (!user) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Utilisateur non trouvé' });
        }

        // Import permissions module
        const { getEffectivePermissions } = await import('./permissions');
        const effectivePermissions = getEffectivePermissions(user.role, user.permissionOverrides);

        return {
          userId: user.id,
          role: user.role,
          permissions: effectivePermissions,
          overrides: user.permissionOverrides ? JSON.parse(user.permissionOverrides) : null,
        };
      }),

    // Update user permission overrides (admin only)
    updateUserOverrides: adminProcedure
      .input(z.object({
        userId: z.number(),
        overrides: z.object({
          add: z.array(z.string()).optional(),
          remove: z.array(z.string()).optional(),
        }),
      }))
      .mutation(async ({ input }) => {
        // Validate user exists
        const user = await db.getUserById(input.userId);

        if (!user) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Utilisateur non trouvé' });
        }

        // Update permission overrides
        await db.updateUserPermissionOverrides(input.userId, { permissionOverrides: JSON.stringify(input.overrides) });

        return { success: true };
      }),

    // Check if user has a specific permission
    checkPermission: protectedProcedure
      .input(z.object({
        permission: z.string(),
        userId: z.number().optional(),
      }))
      .query(async ({ input, ctx }) => {
        const targetUserId = input.userId || ctx.user.id;
        
        const user = await db.getUserById(targetUserId);

        if (!user) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Utilisateur non trouvé' });
        }

                        const { hasPermission, Permission } = await import('./permissions');
                        const allowed = hasPermission(user.role, input.permission as any, user.permissionOverrides);

        return { allowed };
      }),
  }),

  // ========== CANDIDATE ONBOARDING ==========
  candidateOnboarding: candidateOnboardingRouter,

  // ========== CANDIDATE PROFILE (LIEN PARTAGEABLE) ==========
  candidateProfile: candidateProfileRouter,
  notificationsAdmin: notificationsRouter,
  comments: commentsRouter,
  // ========== ASSISTANT IA ==========
  assistant: assistantRouter,
  whatsapp: whatsappRouter,
  // ========== VIDEO GENERATOR (SUPER ADMIN) ==========
  videoGenerator: videoGeneratorRouter,
  // ========== VALIDATION ADMIN ==========
  validation: validationRouter,

});

export type AppRouter = typeof appRouter;
