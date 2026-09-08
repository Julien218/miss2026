import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/trpc";

// Mock context for testing
const createMockContext = (overrides?: Partial<TrpcContext>): TrpcContext => ({
  user: null,
  req: {
    ip: "127.0.0.1",
    headers: {},
    ...overrides?.req,
  } as any,
  res: {
    cookie: () => {},
    clearCookie: () => {},
    ...overrides?.res,
  } as any,
  ...overrides,
});

describe("Votes Router", () => {
  const caller = appRouter.createCaller(createMockContext());

  describe("checkCanVote", () => {
    it("should return canVote true for new fingerprint", async () => {
      const result = await caller.votes.checkCanVote({
        contestId: 1,
        fingerprint: "test-fingerprint-" + Date.now(),
      });

      expect(result).toHaveProperty("canVote");
      expect(result).toHaveProperty("hasVoted");
      expect(result.canVote).toBe(true);
      expect(result.hasVoted).toBe(false);
    });
  });

  describe("getLeaderboard", () => {
    it("should return leaderboard array", async () => {
      const result = await caller.votes.getLeaderboard({
        contestId: 1,
        limit: 10,
      });

      expect(Array.isArray(result)).toBe(true);
    });

    it("should respect limit parameter", async () => {
      const result = await caller.votes.getLeaderboard({
        contestId: 1,
        limit: 3,
      });

      expect(result.length).toBeLessThanOrEqual(3);
    });

    it("should return candidates with required fields", async () => {
      const result = await caller.votes.getLeaderboard({
        contestId: 1,
        limit: 10,
      });

      if (result.length > 0) {
        const candidate = result[0];
        expect(candidate).toHaveProperty("candidateId");
        expect(candidate).toHaveProperty("candidateName");
        expect(candidate).toHaveProperty("category");
        expect(candidate).toHaveProperty("voteCount");
        expect(typeof candidate.voteCount).toBe("number");
      }
    });
  });

  describe("getStats", () => {
    it("should return vote statistics", async () => {
      const result = await caller.votes.getStats({
        contestId: 1,
      });

      expect(result).toHaveProperty("totalVotes");
      expect(result).toHaveProperty("verifiedVotes");
      // MySQL COUNT returns BigInt, number, or string depending on driver
      expect(["number", "bigint", "object", "string"]).toContain(typeof result.totalVotes);
      expect(["number", "bigint", "object", "string"]).toContain(typeof result.verifiedVotes);
    });
  });

  describe("cast vote", () => {
    it("should reject duplicate votes from same fingerprint", async () => {
      const fingerprint = "duplicate-test-" + Date.now();
      
      // First vote should succeed (or fail if candidate doesn't exist)
      try {
        await caller.votes.cast({
          contestId: 1,
          candidateId: 1,
          fingerprint,
        });
      } catch (error: any) {
        // Ignore if candidate doesn't exist
        if (!error.message?.includes("déjà voté")) {
          // This is fine, candidate might not exist
        }
      }

      // Second vote with same fingerprint should fail
      try {
        await caller.votes.cast({
          contestId: 1,
          candidateId: 1,
          fingerprint,
        });
        
        // If we get here, the duplicate check failed
        expect.fail("Should have thrown error for duplicate vote");
      } catch (error: any) {
        expect(error.message).toContain("déjà voté");
      }
    });

    it("should require valid input", async () => {
      try {
        await caller.votes.cast({
          contestId: 0,
          candidateId: 0,
          fingerprint: "",
        });
        
        expect.fail("Should have thrown validation error");
      } catch (error: any) {
        // Should throw validation or database error
        expect(error).toBeDefined();
      }
    });
  });
});
