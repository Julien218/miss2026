/**
 * validation.ts — Workflow de validation admin pour profils candidats et photos
 *
 * Procédures :
 * - getPendingProfiles : liste des candidats en attente de validation
 * - approveProfile     : approuver un profil candidat
 * - rejectProfile      : rejeter un profil candidat avec note
 * - getPendingPhotos   : liste des photos en attente de validation
 * - approvePhoto       : approuver une photo
 * - rejectPhoto        : rejeter une photo
 * - getValidationStats : statistiques globales de validation
 *
 * Créé par JS-Innov.IA — Pagin Julien, Dour, Belgique
 */

import { protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getDb } from "../db";
import { candidates, photos, users, contests } from "../../drizzle/schema";
import { eq, and, isNotNull, desc, count, sql } from "drizzle-orm";
import { notifyOwner } from "../_core/notification";
import { isAdminOrAbove } from "../../shared/roles";
import type { Role } from "../../shared/roles";

// ─── Guard admin ──────────────────────────────────────────────────────────────
const adminGuard = (role: string) => {
  if (!isAdminOrAbove(role as Role)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Accès réservé aux administrateurs",
    });
  }
};

export const validationRouter = router({

  // ─── PROFILS : Lister les candidats en attente ──────────────────────────────
  getPendingProfiles: protectedProcedure
    .input(
      z.object({
        contestId: z.number().optional(),
        status: z.enum(["pending", "approved", "rejected", "all"]).default("pending"),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      adminGuard(ctx.user.role);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB indisponible" });

      const conditions = [];
      if (input.status !== "all") {
        conditions.push(eq(candidates.status, input.status as "pending" | "approved" | "rejected"));
      }
      // Uniquement les profils soumis (profileSubmittedAt non null)
      conditions.push(isNotNull(candidates.profileSubmittedAt));
      if (input.contestId) {
        conditions.push(eq(candidates.contestId, input.contestId));
      }

      const rows = await db
        .select({
          id: candidates.id,
          firstName: candidates.firstName,
          lastName: candidates.lastName,
          category: candidates.category,
          status: candidates.status,
          profilePhoto: candidates.profilePhoto,
          bio: candidates.bio,
          city: candidates.city,
          dateOfBirth: candidates.dateOfBirth,
          profileSubmittedAt: candidates.profileSubmittedAt,
          profileReviewNote: candidates.profileReviewNote,
          validatedAt: candidates.validatedAt,
          acceptCGU: candidates.acceptCGU,
          acceptRules: candidates.acceptRules,
          acceptMedia: candidates.acceptMedia,
          contestId: candidates.contestId,
        })
        .from(candidates)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(candidates.profileSubmittedAt))
        .limit(input.limit)
        .offset(input.offset);

      // Compter le total
      const [{ total }] = await db
        .select({ total: count() })
        .from(candidates)
        .where(conditions.length > 0 ? and(...conditions) : undefined);

      return { profiles: rows, total: Number(total) };
    }),

  // ─── PROFILS : Approuver un profil ──────────────────────────────────────────
  approveProfile: protectedProcedure
    .input(
      z.object({
        candidateId: z.number().int().positive(),
        note: z.string().max(500).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      adminGuard(ctx.user.role);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB indisponible" });

      // Vérifier que le candidat existe et est en pending
      const [candidate] = await db
        .select()
        .from(candidates)
        .where(eq(candidates.id, input.candidateId))
        .limit(1);

      if (!candidate) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Candidat introuvable" });
      }

      // Mettre à jour le statut
      await db
        .update(candidates)
        .set({
          status: "approved",
          validatedAt: new Date(),
          validatedBy: ctx.user.id,
          profileReviewNote: input.note ?? null,
        })
        .where(eq(candidates.id, input.candidateId));

      // Notifier le propriétaire
      await notifyOwner({
        title: `✅ Profil approuvé — ${candidate.firstName} ${candidate.lastName}`,
        content: `Le profil de ${candidate.firstName} ${candidate.lastName} (${candidate.category}) a été approuvé par ${ctx.user.name ?? ctx.user.email}.${input.note ? `\n\nNote : ${input.note}` : ""}`,
      }).catch(() => {});

      return {
        success: true,
        message: `Profil de ${candidate.firstName} ${candidate.lastName} approuvé`,
      };
    }),

  // ─── PROFILS : Rejeter un profil ────────────────────────────────────────────
  rejectProfile: protectedProcedure
    .input(
      z.object({
        candidateId: z.number().int().positive(),
        note: z.string().min(5, "Veuillez indiquer la raison du rejet").max(1000),
      })
    )
    .mutation(async ({ ctx, input }) => {
      adminGuard(ctx.user.role);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB indisponible" });

      const [candidate] = await db
        .select()
        .from(candidates)
        .where(eq(candidates.id, input.candidateId))
        .limit(1);

      if (!candidate) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Candidat introuvable" });
      }

      await db
        .update(candidates)
        .set({
          status: "rejected",
          validatedAt: new Date(),
          validatedBy: ctx.user.id,
          profileReviewNote: input.note,
        })
        .where(eq(candidates.id, input.candidateId));

      // Notifier le propriétaire
      await notifyOwner({
        title: `❌ Profil rejeté — ${candidate.firstName} ${candidate.lastName}`,
        content: `Le profil de ${candidate.firstName} ${candidate.lastName} (${candidate.category}) a été rejeté par ${ctx.user.name ?? ctx.user.email}.\n\nRaison : ${input.note}`,
      }).catch(() => {});

      return {
        success: true,
        message: `Profil de ${candidate.firstName} ${candidate.lastName} rejeté`,
      };
    }),

  // ─── PROFILS : Remettre en pending (annuler une décision) ───────────────────
  resetProfileStatus: protectedProcedure
    .input(z.object({ candidateId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      adminGuard(ctx.user.role);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB indisponible" });

      await db
        .update(candidates)
        .set({
          status: "pending",
          validatedAt: null,
          validatedBy: null,
          profileReviewNote: null,
        })
        .where(eq(candidates.id, input.candidateId));

      return { success: true };
    }),

  // ─── PHOTOS : Lister les photos en attente ──────────────────────────────────
  getPendingPhotos: protectedProcedure
    .input(
      z.object({
        status: z.enum(["pending", "approved", "rejected", "all"]).default("pending"),
        candidateId: z.number().optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      adminGuard(ctx.user.role);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB indisponible" });

      const conditions = [];
      if (input.status !== "all") {
        conditions.push(eq(photos.status, input.status as "pending" | "approved" | "rejected"));
      }
      if (input.candidateId) {
        conditions.push(eq(photos.candidateId, input.candidateId));
      }

      const rows = await db
        .select({
          id: photos.id,
          url: photos.url,
          thumbnail: photos.thumbnail,
          title: photos.title,
          description: photos.description,
          category: photos.category,
          status: photos.status,
          candidateId: photos.candidateId,
          uploadedBy: photos.uploadedBy,
          approvedBy: photos.approvedBy,
          approvedAt: photos.approvedAt,
          createdAt: photos.createdAt,
          sizeBytes: photos.sizeBytes,
          width: photos.width,
          height: photos.height,
          // Infos candidat liée
          candidateFirstName: candidates.firstName,
          candidateLastName: candidates.lastName,
          candidateCategory: candidates.category,
          // Infos photographe
          uploaderName: users.name,
          uploaderEmail: users.email,
        })
        .from(photos)
        .leftJoin(candidates, eq(photos.candidateId, candidates.id))
        .leftJoin(users, eq(photos.uploadedBy, users.id))
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(photos.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      const [{ total }] = await db
        .select({ total: count() })
        .from(photos)
        .where(conditions.length > 0 ? and(...conditions) : undefined);

      return { photos: rows, total: Number(total) };
    }),

  // ─── PHOTOS : Approuver une photo ───────────────────────────────────────────
  approvePhoto: protectedProcedure
    .input(
      z.object({
        photoId: z.number().int().positive(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      adminGuard(ctx.user.role);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB indisponible" });

      const [photo] = await db
        .select()
        .from(photos)
        .where(eq(photos.id, input.photoId))
        .limit(1);

      if (!photo) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Photo introuvable" });
      }

      await db
        .update(photos)
        .set({
          status: "approved",
          approvedBy: ctx.user.id,
          approvedAt: new Date(),
        })
        .where(eq(photos.id, input.photoId));

      return { success: true, message: `Photo "${photo.title}" approuvée` };
    }),

  // ─── PHOTOS : Rejeter une photo ─────────────────────────────────────────────
  rejectPhoto: protectedProcedure
    .input(
      z.object({
        photoId: z.number().int().positive(),
        reason: z.string().min(3, "Veuillez indiquer la raison").max(500),
      })
    )
    .mutation(async ({ ctx, input }) => {
      adminGuard(ctx.user.role);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB indisponible" });

      const [photo] = await db
        .select()
        .from(photos)
        .where(eq(photos.id, input.photoId))
        .limit(1);

      if (!photo) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Photo introuvable" });
      }

      await db
        .update(photos)
        .set({
          status: "rejected",
          approvedBy: ctx.user.id,
          approvedAt: new Date(),
        })
        .where(eq(photos.id, input.photoId));

      return { success: true, message: `Photo "${photo.title}" rejetée` };
    }),

  // ─── PHOTOS : Approuver en masse ────────────────────────────────────────────
  bulkApprovePhotos: protectedProcedure
    .input(
      z.object({
        photoIds: z.array(z.number().int().positive()).min(1).max(50),
      })
    )
    .mutation(async ({ ctx, input }) => {
      adminGuard(ctx.user.role);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB indisponible" });

      let approved = 0;
      for (const photoId of input.photoIds) {
        await db
          .update(photos)
          .set({
            status: "approved",
            approvedBy: ctx.user.id,
            approvedAt: new Date(),
          })
          .where(eq(photos.id, photoId));
        approved++;
      }

      return { success: true, approved, message: `${approved} photo(s) approuvée(s)` };
    }),

  // ─── STATISTIQUES de validation ─────────────────────────────────────────────
  getValidationStats: protectedProcedure.query(async ({ ctx }) => {
    adminGuard(ctx.user.role);
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB indisponible" });

    // Stats profils
    const [profileStats] = await db
      .select({
        pending: sql<number>`SUM(CASE WHEN ${candidates.status} = 'pending' AND ${candidates.profileSubmittedAt} IS NOT NULL THEN 1 ELSE 0 END)`,
        approved: sql<number>`SUM(CASE WHEN ${candidates.status} = 'approved' THEN 1 ELSE 0 END)`,
        rejected: sql<number>`SUM(CASE WHEN ${candidates.status} = 'rejected' THEN 1 ELSE 0 END)`,
        total: count(),
      })
      .from(candidates);

    // Stats photos
    const [photoStats] = await db
      .select({
        pending: sql<number>`SUM(CASE WHEN ${photos.status} = 'pending' THEN 1 ELSE 0 END)`,
        approved: sql<number>`SUM(CASE WHEN ${photos.status} = 'approved' THEN 1 ELSE 0 END)`,
        rejected: sql<number>`SUM(CASE WHEN ${photos.status} = 'rejected' THEN 1 ELSE 0 END)`,
        total: count(),
      })
      .from(photos);

    return {
      profiles: {
        pending: Number(profileStats?.pending ?? 0),
        approved: Number(profileStats?.approved ?? 0),
        rejected: Number(profileStats?.rejected ?? 0),
        total: Number(profileStats?.total ?? 0),
      },
      photos: {
        pending: Number(photoStats?.pending ?? 0),
        approved: Number(photoStats?.approved ?? 0),
        rejected: Number(photoStats?.rejected ?? 0),
        total: Number(photoStats?.total ?? 0),
      },
    };
  }),
});
