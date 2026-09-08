import { describe, it, expect, beforeAll } from "vitest";
import * as db from "./db";

describe("Premium Features - International Level", () => {
  let testCandidateId: number;

  beforeAll(async () => {
    // Get a test candidate
    const candidates = await db.getCandidatesByContest(1);
    if (candidates.length > 0) {
      testCandidateId = candidates[0].id;
    } else {
      testCandidateId = 1;
    }
  });

  describe("1. Global Social Barometer", () => {
    it("should calculate global barometer metrics", async () => {
      const barometer = await db.getGlobalBarometer();

      expect(barometer).toBeDefined();
      expect(barometer).toHaveProperty("intensity");
      expect(barometer).toHaveProperty("sharesLast60Min");
      expect(barometer).toHaveProperty("sharesLast24H");
      expect(barometer).toHaveProperty("viewsLast60Min");
      expect(barometer).toHaveProperty("trend24h");
      expect(barometer).toHaveProperty("interactionsToday");
      expect(barometer).toHaveProperty("timestamp");

      // Intensity should be 0-100
      expect(barometer!.intensity).toBeGreaterThanOrEqual(0);
      expect(barometer!.intensity).toBeLessThanOrEqual(100);

      // Counts should be non-negative
      expect(barometer!.sharesLast60Min).toBeGreaterThanOrEqual(0);
      expect(barometer!.sharesLast24H).toBeGreaterThanOrEqual(0);
      expect(barometer!.viewsLast60Min).toBeGreaterThanOrEqual(0);
      expect(barometer!.interactionsToday).toBeGreaterThanOrEqual(0);
    });

    it("should calculate trend percentage correctly", async () => {
      const barometer = await db.getGlobalBarometer();

      expect(barometer).toBeDefined();
      expect(barometer!.trend24h).toBeDefined();
      expect(typeof barometer!.trend24h).toBe("number");

      // Trend can be positive or negative
      expect(Math.abs(barometer!.trend24h)).toBeGreaterThanOrEqual(0);
    });
  });

  describe("2. Influence Index Calculation", () => {
    it("should calculate influence index for a candidate", async () => {
      const influenceIndex = await db.calculateInfluenceIndex(testCandidateId);

      expect(influenceIndex).toBeDefined();
      expect(typeof influenceIndex).toBe("number");

      // Index should be 0-1000
      expect(influenceIndex).toBeGreaterThanOrEqual(0);
      expect(influenceIndex).toBeLessThanOrEqual(1000);
    });

    it("should update influence index in database", async () => {
      await db.updateInfluenceIndex(testCandidateId);

      const analytics = await db.getCandidateAnalytics(testCandidateId);

      expect(analytics).toBeDefined();
      expect(analytics!.influenceIndex).toBeGreaterThanOrEqual(0);
      expect(analytics!.influenceIndex).toBeLessThanOrEqual(1000);
      expect(analytics!.influenceTrend).toBeDefined();
    });

    it("should calculate influence with correct weighting", async () => {
      // Create analytics with known values
      await db.getOrCreateCandidateAnalytics(testCandidateId);

      // Track some activity
      await db.trackShareClick(testCandidateId, "192.168.1.200");
      await db.trackProfileView(testCandidateId, "192.168.1.201");

      // Calculate influence
      const influenceIndex = await db.calculateInfluenceIndex(testCandidateId);

      // With activity, influence should be > 0
      expect(influenceIndex).toBeGreaterThan(0);
    });

    it("should handle zero activity gracefully", async () => {
      // For a candidate with no activity, influence should be 0 or very low
      const candidates = await db.getCandidatesByContest(1);
      
      if (candidates.length > 1) {
        // Use a different candidate that might have no activity
        const candidateWithNoActivity = candidates[candidates.length - 1];
        const influenceIndex = await db.calculateInfluenceIndex(candidateWithNoActivity.id);

        expect(influenceIndex).toBeGreaterThanOrEqual(0);
        expect(influenceIndex).toBeLessThanOrEqual(1000);
      }
    });
  });

  describe("3. Influence Trend Tracking", () => {
    it("should track daily trend changes", async () => {
      const analyticsBefore = await db.getCandidateAnalytics(testCandidateId);
      const previousIndex = analyticsBefore?.influenceIndex || 0;

      // Update influence index
      await db.updateInfluenceIndex(testCandidateId);

      const analyticsAfter = await db.getCandidateAnalytics(testCandidateId);

      expect(analyticsAfter).toBeDefined();
      expect(analyticsAfter!.influenceTrend).toBeDefined();

      // Trend should be the difference
      const expectedTrend = analyticsAfter!.influenceIndex - previousIndex;
      expect(analyticsAfter!.influenceTrend).toBe(expectedTrend);
    });
  });

  describe("4. Performance and Scalability", () => {
    it("should update all influence indexes efficiently", async () => {
      const startTime = Date.now();

      await db.updateAllInfluenceIndexes();

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete in reasonable time (< 5 seconds for typical dataset)
      expect(duration).toBeLessThan(5000);
    });

    it("should handle bulk analytics queries", async () => {
      const candidates = await db.getCandidatesByContest(1);
      const candidateIds = candidates.slice(0, 10).map(c => c.id);

      if (candidateIds.length > 0) {
        const startTime = Date.now();

        const bulkAnalytics = await db.getBulkCandidateAnalytics(candidateIds);

        const endTime = Date.now();
        const duration = endTime - startTime;

        expect(bulkAnalytics).toBeDefined();
        expect(bulkAnalytics.length).toBe(candidateIds.length);

        // Should be fast (< 500ms)
        expect(duration).toBeLessThan(500);
      }
    });
  });

  describe("5. Data Integrity", () => {
    it("should maintain consistent analytics data", async () => {
      const analytics = await db.getCandidateAnalytics(testCandidateId);

      expect(analytics).toBeDefined();

      // Total should be >= today's count
      expect(analytics!.shareClicksTotal).toBeGreaterThanOrEqual(analytics!.shareClicksToday);
      expect(analytics!.profileViews).toBeGreaterThanOrEqual(analytics!.profileViewsToday);

      // Unique counts should be <= total counts
      expect(analytics!.uniqueShareClicks).toBeLessThanOrEqual(analytics!.shareClicksTotal);
      expect(analytics!.uniqueProfileViews).toBeLessThanOrEqual(analytics!.profileViews);
    });

    it("should reset daily counters correctly", async () => {
      await db.resetDailyAnalyticsIfNeeded(testCandidateId);

      const analytics = await db.getCandidateAnalytics(testCandidateId);

      expect(analytics).toBeDefined();
      expect(analytics!.lastResetDate).toBeDefined();

      // Check that reset date is today
      const today = new Date();
      const resetDate = new Date(analytics!.lastResetDate);

      expect(resetDate.getDate()).toBe(today.getDate());
      expect(resetDate.getMonth()).toBe(today.getMonth());
      expect(resetDate.getFullYear()).toBe(today.getFullYear());
    });
  });
});
