import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import * as db from "../db";
import { checkRateLimit, rateLimitConfigs } from "../_core/rateLimit";

export const votesRouter = router({
  // Cast a vote (public)
  cast: publicProcedure
    .input(z.object({
      contestId: z.number(),
      candidateId: z.number(),
      fingerprint: z.string(),
      email: z.string().email().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Rate limiting : 20 req/heure par fingerprint
      const rateLimit = checkRateLimit('vote', input.fingerprint, rateLimitConfigs.vote);
      
      if (rateLimit.limited) {
        throw new TRPCError({
          code: 'TOO_MANY_REQUESTS',
          message: rateLimit.message,
        });
      }
      
      // Check if already voted
      const existingVote = await db.hasVoted(input.contestId, input.fingerprint);
      if (existingVote) {
        throw new TRPCError({ 
          code: 'BAD_REQUEST', 
          message: 'Vous avez déjà voté pour ce concours' 
        });
      }

      // Create vote
      const voteId = await db.createVote({
        contestId: input.contestId,
        candidateId: input.candidateId,
        userId: ctx.user?.id,
        voterIp: ctx.req.ip || 'unknown',
        voterFingerprint: input.fingerprint,
        voterEmail: input.email,
        voteCategory: 'public_choice',
        voteWeight: 1,
        isVerified: 0,
        isFraudulent: 0,
      });

      // Increment candidate vote count
      await db.incrementCandidateVoteCount(input.candidateId);

      return { 
        success: true, 
        message: 'Vote enregistré avec succès!',
        voteId 
      };
    }),

  // Check if user can vote
  checkCanVote: publicProcedure
    .input(z.object({
      contestId: z.number(),
      fingerprint: z.string(),
    }))
    .query(async ({ input }) => {
      const hasVoted = await db.hasVoted(input.contestId, input.fingerprint);
      return {
        canVote: !hasVoted,
        hasVoted,
      };
    }),

  // Get vote statistics for a contest
  getStats: publicProcedure
    .input(z.object({
      contestId: z.number(),
    }))
    .query(async ({ input }) => {
      const stats = await db.getVoteStatistics(input.contestId);
      return stats;
    }),

  // Get leaderboard
  getLeaderboard: publicProcedure
    .input(z.object({
      contestId: z.number(),
      limit: z.number().default(10),
    }))
    .query(async ({ input }) => {
      const leaderboard = await db.getVoteLeaderboard(input.contestId, input.limit);
      return leaderboard;
    }),

  // Get recent votes (admin only)
  getRecentVotes: protectedProcedure
    .input(z.object({
      contestId: z.number().optional(),
      limit: z.number().default(50),
    }))
    .query(async ({ ctx, input }) => {
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }
      const votes = await db.getRecentVotes(input.contestId || 0, input.limit);
      return votes;
    }),
});
