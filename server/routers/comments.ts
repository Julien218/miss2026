/**
 * comments.ts — Router tRPC pour les commentaires sur les profils candidats
 * - Public : lire et poster des commentaires (sans connexion)
 * - Public : liker un commentaire (anti-doublon par IP)
 * - Admin : modérer (approuver/rejeter/supprimer) les commentaires
 */
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { sql } from "drizzle-orm";
import { sendEmail, buildCommentNotificationEmail } from "../helpers/email";

// ─── Helpers ─────────────────────────────────────────────────────────────────
function hashIp(ip: string): string {
  const crypto = require("crypto");
  return crypto.createHash("sha256").update(ip + "salt_mmd2026").digest("hex").slice(0, 16);
}

// ─── Router ──────────────────────────────────────────────────────────────────
export const commentsRouter = router({

  // ─── PUBLIC : Récupérer les commentaires d'un candidat ─────────────────
  getByCandidate: publicProcedure
    .input(z.object({
      candidateId: z.number().int().positive(),
      limit: z.number().int().min(1).max(100).default(50),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB indisponible" });

      const rows = await db.execute(sql`
        SELECT
          c.id,
          c.candidate_id AS candidateId,
          c.parent_id AS parentId,
          c.author_name AS authorName,
          c.content,
          c.likes,
          c.status,
          c.created_at AS createdAt
        FROM candidate_comments c
        WHERE c.candidate_id = ${input.candidateId}
          AND c.status = 'approved'
        ORDER BY c.created_at ASC
        LIMIT ${input.limit}
      `);

      const comments = (rows as any[])[0] as any[];

      // Organiser en arbre (parent → enfants)
      const topLevel = comments.filter((c: any) => !c.parentId);
      const replies = comments.filter((c: any) => !!c.parentId);

      return topLevel.map((comment: any) => ({
        ...comment,
        createdAt: new Date(comment.createdAt),
        replies: replies
          .filter((r: any) => r.parentId === comment.id)
          .map((r: any) => ({ ...r, createdAt: new Date(r.createdAt) })),
      }));
    }),

  // ─── PUBLIC : Poster un commentaire ────────────────────────────────────
  add: publicProcedure
    .input(z.object({
      candidateId: z.number().int().positive(),
      parentId: z.number().int().positive().optional(),
      authorName: z.string().min(2).max(100),
      authorEmail: z.string().email().optional(),
      content: z.string().min(3).max(1000),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB indisponible" });

      // Anti-spam basique : max 5 commentaires par IP par heure
      const ip = (ctx as any).req?.ip || (ctx as any).req?.headers?.["x-forwarded-for"] || "unknown";
      const ipHash = hashIp(String(ip));

      const [spamCheck] = await db.execute(sql`
        SELECT COUNT(*) AS cnt
        FROM candidate_comments
        WHERE ip_hash = ${ipHash}
          AND created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)
      `) as any;
      const spamCount = (spamCheck as any[])[0]?.cnt ?? 0;
      if (Number(spamCount) >= 5) {
        throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Trop de commentaires. Réessayez dans une heure." });
      }

      // Filtrage contenu basique (mots interdits)
      const forbidden = ["spam", "pub", "promo", "http://", "https://"];
      const lowerContent = input.content.toLowerCase();
      if (forbidden.some(w => lowerContent.includes(w))) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Contenu non autorisé dans le commentaire." });
      }

      await db.execute(sql`
        INSERT INTO candidate_comments
          (candidate_id, parent_id, author_name, author_email, content, status, ip_hash)
        VALUES
          (${input.candidateId}, ${input.parentId ?? null}, ${input.authorName},
           ${input.authorEmail ?? null}, ${input.content}, 'approved', ${ipHash})
      `);

      // ── Notification email admin (non bloquante) ─────────────────────────
      (async () => {
        try {
          const db2 = await getDb();
          if (!db2) return;
          // Nom du candidat
          const [candRows] = await db2.execute(sql`
            SELECT CONCAT(first_name, ' ', last_name) AS fullName FROM candidates WHERE id = ${input.candidateId} LIMIT 1
          `) as any;
          const candidateName = (candRows as any[])[0]?.fullName ?? `Candidat #${input.candidateId}`;
          // Emails des admins
          const [adminRows] = await db2.execute(sql`
            SELECT email FROM users WHERE role IN ('admin', 'super_admin') AND email IS NOT NULL LIMIT 10
          `) as any;
          const adminEmails: string[] = (adminRows as any[]).map((r: any) => r.email).filter(Boolean);
          const recipients = adminEmails.length > 0 ? adminEmails : ['Olivier.trevis@outlook.be'];
          const baseUrl = 'https://missdourweb-fqsyubas.manus.space';
          const subject = `💬 Nouveau commentaire • ${candidateName} • Miss & Mister Dour 2026`;
          const emailData = buildCommentNotificationEmail({
            commenterName: input.authorName,
            commentContent: input.content,
            candidateName,
            candidateUrl: `${baseUrl}/candidates/${input.candidateId}`,
          });
          await Promise.allSettled(recipients.map(email => sendEmail({ to: email, subject: emailData.subject, html: emailData.html, text: emailData.text })));
        } catch { /* silencieux */ }
      })();

      return { success: true };
    }),

  // ─── PUBLIC : Liker un commentaire ─────────────────────────────────────
  like: publicProcedure
    .input(z.object({ commentId: z.number().int().positive() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB indisponible" });

      const ip = (ctx as any).req?.ip || (ctx as any).req?.headers?.["x-forwarded-for"] || "unknown";
      const ipHash = hashIp(String(ip));

      // Vérifier si déjà liké
      const [existing] = await db.execute(sql`
        SELECT id FROM comment_likes
        WHERE comment_id = ${input.commentId} AND ip_hash = ${ipHash}
        LIMIT 1
      `) as any;
      const existingRows = (existing as any[]);

      if (existingRows.length > 0) {
        // Retirer le like
        await db.execute(sql`
          DELETE FROM comment_likes
          WHERE comment_id = ${input.commentId} AND ip_hash = ${ipHash}
        `);
        await db.execute(sql`
          UPDATE candidate_comments
          SET likes = GREATEST(0, likes - 1)
          WHERE id = ${input.commentId}
        `);
        return { liked: false };
      } else {
        // Ajouter le like
        await db.execute(sql`
          INSERT INTO comment_likes (comment_id, ip_hash) VALUES (${input.commentId}, ${ipHash})
        `);
        await db.execute(sql`
          UPDATE candidate_comments SET likes = likes + 1 WHERE id = ${input.commentId}
        `);
        return { liked: true };
      }
    }),

  // ─── ADMIN : Lister tous les commentaires pour modération ──────────────
  listForModeration: protectedProcedure
    .input(z.object({
      status: z.enum(["all", "pending", "approved", "rejected"]).default("all"),
      limit: z.number().int().min(1).max(200).default(100),
    }))
    .query(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin" && ctx.user.role !== "super_admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const whereClause = input.status === "all"
        ? sql``
        : sql`AND c.status = ${input.status}`;

      const rows = await db.execute(sql`
        SELECT
          c.id,
          c.candidate_id AS candidateId,
          c.parent_id AS parentId,
          c.author_name AS authorName,
          c.author_email AS authorEmail,
          c.content,
          c.likes,
          c.status,
          c.created_at AS createdAt,
          CONCAT(ca.first_name, ' ', ca.last_name) AS candidateName,
          ca.category AS candidateCategory
        FROM candidate_comments c
        LEFT JOIN candidates ca ON ca.id = c.candidate_id
        WHERE 1=1 ${whereClause}
        ORDER BY c.created_at DESC
        LIMIT ${input.limit}
      `);

      const comments = (rows as any[])[0] as any[];
      return comments.map((c: any) => ({ ...c, createdAt: new Date(c.createdAt) }));
    }),

  // ─── ADMIN : Modérer un commentaire ────────────────────────────────────
  moderate: protectedProcedure
    .input(z.object({
      commentId: z.number().int().positive(),
      action: z.enum(["approve", "reject", "delete"]),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin" && ctx.user.role !== "super_admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      if (input.action === "delete") {
        await db.execute(sql`
          DELETE FROM candidate_comments WHERE id = ${input.commentId}
        `);
      } else {
        const newStatus = input.action === "approve" ? "approved" : "rejected";
        await db.execute(sql`
          UPDATE candidate_comments SET status = ${newStatus} WHERE id = ${input.commentId}
        `);
      }

      return { success: true };
    }),

  // ─── ADMIN : Statistiques commentaires ─────────────────────────────────
  getStats: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin" && ctx.user.role !== "super_admin") {
      throw new TRPCError({ code: "FORBIDDEN" });
    }
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    const [stats] = await db.execute(sql`
      SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) AS approved,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) AS rejected,
        SUM(likes) AS totalLikes
      FROM candidate_comments
    `) as any;

    const row = (stats as any[])[0] ?? {};
    return {
      total: Number(row.total ?? 0),
      approved: Number(row.approved ?? 0),
      pending: Number(row.pending ?? 0),
      rejected: Number(row.rejected ?? 0),
      totalLikes: Number(row.totalLikes ?? 0),
    };
  }),
});
