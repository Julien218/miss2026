import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import * as db from "../db";
import { checkRateLimit, rateLimitConfigs } from "../_core/rateLimit";

export const votesRouter = router({
  cast: publicProcedure
    .input(z.object({
      contestId: z.number().int().positive(),
      candidateId: z.number().int().positive(),
      fingerprint: z.string().min(16).max(128),
      email: z.string().email().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const candidate = await db.getCandidateById(input.candidateId);
      if (!candidate || candidate.contestId !== input.contestId || !["approved", "finalist", "winner"].includes(candidate.status)) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Ce profil n’est pas disponible pour ce vote." });
      }

      const rateLimit = checkRateLimit("vote", input.fingerprint, rateLimitConfigs.vote);
      if (rateLimit.limited) {
        throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: rateLimit.message });
      }

      const existingVote = await db.hasVoted(input.contestId, input.fingerprint);
      if (existingVote) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Vous avez déjà voté pour cette édition." });
      }

      const voteId = await db.createVote({
        contestId: input.contestId,
        candidateId: input.candidateId,
        userId: ctx.user?.id,
        voterIp: ctx.req.ip || "unknown",
        voterFingerprint: input.fingerprint,
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
    .input(z.object({ contestId: z.number().int().positive(), fingerprint: z.string().min(16).max(128) }))
    .query(async ({ input }) => {
      const hasVoted = await db.hasVoted(input.contestId, input.fingerprint);
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
