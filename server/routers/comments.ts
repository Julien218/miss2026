import crypto from "node:crypto";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { sql } from "drizzle-orm";
import { sendEmail, buildCommentNotificationEmail } from "../helpers/email";
import { getPublicBaseUrl } from "../url-helpers";

function hashIp(ip: string): string {
  const secret = process.env.COMMENT_HASH_SECRET || process.env.COOKIE_SECRET;
  if (!secret) {
    // On ne persiste jamais l'IP brute ; le fallback est spécifique au runtime.
    return crypto.createHash("sha256").update(`mmd:${ip}`).digest("hex").slice(0, 32);
  }
  return crypto.createHmac("sha256", secret).update(ip).digest("hex").slice(0, 32);
}

async function assertPublicCandidate(database: any, candidateId: number) {
  const [rows] = await database.execute(sql`
    SELECT id, firstName, lastName, status
    FROM candidates
    WHERE id = ${candidateId}
      AND status IN ('approved', 'finalist', 'winner')
    LIMIT 1
  `) as any;
  const candidate = (rows as any[])[0];
  if (!candidate) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Profil candidat indisponible." });
  }
  return candidate;
}

export const commentsRouter = router({
  getByCandidate: publicProcedure
    .input(z.object({
      candidateId: z.number().int().positive(),
      limit: z.number().int().min(1).max(100).default(50),
    }))
    .query(async ({ input }) => {
      const database = await getDb();
      if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB indisponible" });
      await assertPublicCandidate(database, input.candidateId);

      const rows = await database.execute(sql`
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
      const topLevel = comments.filter((comment: any) => !comment.parentId);
      const replies = comments.filter((comment: any) => !!comment.parentId);

      return topLevel.map((comment: any) => ({
        ...comment,
        createdAt: new Date(comment.createdAt),
        replies: replies
          .filter((reply: any) => reply.parentId === comment.id)
          .map((reply: any) => ({ ...reply, createdAt: new Date(reply.createdAt) })),
      }));
    }),

  add: publicProcedure
    .input(z.object({
      candidateId: z.number().int().positive(),
      parentId: z.number().int().positive().optional(),
      authorName: z.string().trim().min(2).max(100),
      authorEmail: z.string().trim().email().max(320).optional(),
      content: z.string().trim().min(3).max(1000),
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB indisponible" });
      const candidate = await assertPublicCandidate(database, input.candidateId);

      const ip = ctx.req.ip || ctx.req.socket?.remoteAddress || "unknown";
      const ipHash = hashIp(String(ip));

      const [spamCheck] = await database.execute(sql`
        SELECT COUNT(*) AS cnt
        FROM candidate_comments
        WHERE ip_hash = ${ipHash}
          AND created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)
      `) as any;
      if (Number((spamCheck as any[])[0]?.cnt ?? 0) >= 5) {
        throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Trop de commentaires. Réessayez dans une heure." });
      }

      const lowerContent = input.content.toLowerCase();
      const forbidden = ["http://", "https://", "javascript:", "data:text/html"];
      if (forbidden.some((term) => lowerContent.includes(term))) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Les liens ne sont pas autorisés dans les commentaires." });
      }

      if (input.parentId) {
        const [parentRows] = await database.execute(sql`
          SELECT id FROM candidate_comments
          WHERE id = ${input.parentId}
            AND candidate_id = ${input.candidateId}
            AND status = 'approved'
          LIMIT 1
        `) as any;
        if (!(parentRows as any[]).length) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Commentaire parent invalide." });
        }
      }

      // Toute publication publique passe d'abord en modération humaine.
      await database.execute(sql`
        INSERT INTO candidate_comments
          (candidate_id, parent_id, author_name, author_email, content, status, ip_hash)
        VALUES
          (${input.candidateId}, ${input.parentId ?? null}, ${input.authorName},
           ${input.authorEmail ?? null}, ${input.content}, 'pending', ${ipHash})
      `);

      // Notification non bloquante ; aucune donnée sensible n'est exposée au visiteur.
      void (async () => {
        try {
          const [adminRows] = await database.execute(sql`
            SELECT email FROM users
            WHERE role IN ('admin', 'super_admin') AND email IS NOT NULL
            LIMIT 10
          `) as any;
          const adminEmails: string[] = (adminRows as any[]).map((row: any) => row.email).filter(Boolean);
          if (!adminEmails.length) return;
          const candidateName = `${candidate.firstName} ${candidate.lastName}`.trim();
          const candidateUrl = `${getPublicBaseUrl().replace(/\/$/, "")}/candidat/${input.candidateId}`;
          const emailData = buildCommentNotificationEmail({
            commenterName: input.authorName,
            commentContent: input.content,
            candidateName,
            candidateUrl,
          });
          const subject = `Nouveau commentaire à modérer · ${candidateName} · Miss & Mister Dour 2027`;
          await Promise.allSettled(
            adminEmails.map((email) => sendEmail({ to: email, subject, html: emailData.html, text: emailData.text }))
          );
        } catch (error) {
          console.warn("[Comments] Admin notification failed", error);
        }
      })();

      return { success: true, pendingModeration: true };
    }),

  like: publicProcedure
    .input(z.object({ commentId: z.number().int().positive() }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB indisponible" });

      const [commentRows] = await database.execute(sql`
        SELECT id FROM candidate_comments WHERE id = ${input.commentId} AND status = 'approved' LIMIT 1
      `) as any;
      if (!(commentRows as any[]).length) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Commentaire indisponible." });
      }

      const ip = ctx.req.ip || ctx.req.socket?.remoteAddress || "unknown";
      const ipHash = hashIp(String(ip));
      const [existing] = await database.execute(sql`
        SELECT id FROM comment_likes
        WHERE comment_id = ${input.commentId} AND ip_hash = ${ipHash}
        LIMIT 1
      `) as any;

      if ((existing as any[]).length > 0) {
        await database.execute(sql`DELETE FROM comment_likes WHERE comment_id = ${input.commentId} AND ip_hash = ${ipHash}`);
        await database.execute(sql`UPDATE candidate_comments SET likes = GREATEST(0, likes - 1) WHERE id = ${input.commentId}`);
        return { liked: false };
      }

      await database.execute(sql`INSERT INTO comment_likes (comment_id, ip_hash) VALUES (${input.commentId}, ${ipHash})`);
      await database.execute(sql`UPDATE candidate_comments SET likes = likes + 1 WHERE id = ${input.commentId}`);
      return { liked: true };
    }),

  listForModeration: protectedProcedure
    .input(z.object({
      status: z.enum(["all", "pending", "approved", "rejected"]).default("all"),
      limit: z.number().int().min(1).max(200).default(100),
    }))
    .query(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin" && ctx.user.role !== "super_admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const database = await getDb();
      if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const whereClause = input.status === "all" ? sql`` : sql`AND c.status = ${input.status}`;
      const rows = await database.execute(sql`
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
          CONCAT(ca.firstName, ' ', ca.lastName) AS candidateName,
          ca.category AS candidateCategory
        FROM candidate_comments c
        LEFT JOIN candidates ca ON ca.id = c.candidate_id
        WHERE 1=1 ${whereClause}
        ORDER BY c.created_at DESC
        LIMIT ${input.limit}
      `);
      const comments = (rows as any[])[0] as any[];
      return comments.map((comment: any) => ({ ...comment, createdAt: new Date(comment.createdAt) }));
    }),

  moderate: protectedProcedure
    .input(z.object({
      commentId: z.number().int().positive(),
      action: z.enum(["approve", "reject", "delete"]),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin" && ctx.user.role !== "super_admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const database = await getDb();
      if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      if (input.action === "delete") {
        await database.execute(sql`DELETE FROM candidate_comments WHERE id = ${input.commentId}`);
      } else {
        const newStatus = input.action === "approve" ? "approved" : "rejected";
        await database.execute(sql`UPDATE candidate_comments SET status = ${newStatus} WHERE id = ${input.commentId}`);
      }
      return { success: true };
    }),

  getStats: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin" && ctx.user.role !== "super_admin") {
      throw new TRPCError({ code: "FORBIDDEN" });
    }
    const database = await getDb();
    if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    const [stats] = await database.execute(sql`
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
