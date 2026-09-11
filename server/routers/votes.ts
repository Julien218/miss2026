import crypto from "node:crypto";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import * as db from "../db";
import { checkRateLimit, rateLimitConfigs } from "../_core/rateLimit";

function voteIdentity(ctx: any) {
  const ip = ctx.req?.ip || ctx.req?.socket?.remoteAddress || "unknown";
  const userAgent = String(ctx.req?.get?.("user-agent") || ctx.req?.headers?.["user-agent"] || "unknown").slice(0, 500);
  const secret = process.env.VOTE_HASH_SECRET || process.env.JWT_SECRET || "mmd-runtime";
  const stable = ctx.user?.id ? `user:${ctx.user.id}` : `network:${ip}|ua:${userAgent}`;
  return crypto.createHmac("sha256", secret).update(stable).digest("hex");
}

function hashedIp(ctx: any) {
  const ip = ctx.req?.ip || ctx.req?.socket?.remoteAddress || "unknown";
  const secret = process.env.VOTE_HASH_SECRET || process.env.JWT_SECRET || "mmd-runtime";
  return crypto.createHmac("sha256", secret).update(String(ip)).digest("hex");
}

export const votesRouter = router({
  cast: publicProcedure
    .input(z.object({
      contestId: z.number().int().positive(),
      candidateId: z.number().int().positive(),
      // Conservé pour compatibilité avec les anciens clients ; la décision
      // anti-fraude ne fait plus confiance à une valeur contrôlée par le navigateur.
      fingerprint: z.string().min(8).max(128).optional(),
      email: z.string().email().max(320).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const candidate = await db.getCandidateById(input.candidateId);
      if (!candidate || candidate.contestId !== input.contestId || !["approved", "finalist", "winner"].includes(candidate.status)) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Ce profil n’est pas disponible pour ce vote." });
      }

      const identity = voteIdentity(ctx);
      const rateLimit = checkRateLimit("vote", identity, rateLimitConfigs.vote);
      if (rateLimit.limited) {
        throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: rateLimit.message });
      }

      const existingVote = await db.hasVoted(input.contestId, identity);
      if (existingVote) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Un vote a déjà été enregistré depuis cette session/appareil pour cette édition." });
      }

      const voteId = await db.createVote({
        contestId: input.contestId,
        candidateId: input.candidateId,
        userId: ctx.user?.id,
        voterIp: hashedIp(ctx),
        voterFingerprint: identity,
        voterEmail: input.email,
        voteCategory: "public_choice",
        voteWeight: 1,
        isVerified: 0,
        isFraudulent: 0,
      });

      await db.incrementCandidateVoteCount(input.candidateId);
      return { success: true, message: "Vote enregistré avec succès !", voteId };
    }),

  checkCanVote: publicProcedure
    .input(z.object({
      contestId: z.number().int().positive(),
      fingerprint: z.string().min(8).max(128).optional(),
    }))
    .query(async ({ ctx, input }) => {
      const identity = voteIdentity(ctx);
      const hasVoted = await db.hasVoted(input.contestId, identity);
      return { canVote: !hasVoted, hasVoted };
    }),

  getStats: publicProcedure
    .input(z.object({ contestId: z.number().int().positive() }))
    .query(async ({ input }) => db.getVoteStatistics(input.contestId)),

  getLeaderboard: publicProcedure
    .input(z.object({ contestId: z.number().int().positive(), limit: z.number().int().min(1).max(100).default(10) }))
    .query(async ({ input }) => db.getVoteLeaderboard(input.contestId, input.limit)),

  getRecentVotes: protectedProcedure
    .input(z.object({ contestId: z.number().optional(), limit: z.number().int().min(1).max(200).default(50) }))
    .query(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin" && ctx.user.role !== "super_admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return db.getRecentVotes(input.contestId || 0, input.limit);
    }),
});
