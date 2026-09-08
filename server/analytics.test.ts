import { describe, it, expect, beforeAll } from "vitest";
import * as db from "./db";

describe("Analytics Tracking System", () => {
  let testCandidateId: number;

  beforeAll(async () => {
    // Create a test candidate for analytics
    const candidates = await db.getCandidatesByContest(1);
    if (candidates.length > 0) {
      testCandidateId = candidates[0].id;
    } else {
      // If no candidates exist, use a default ID
      testCandidateId = 1;
    }
  });

  it("should create analytics record for new candidate", async () => {
    const analytics = await db.getOrCreateCandidateAnalytics(testCandidateId);
    
    expect(analytics).toBeDefined();
    expect(analytics.candidateId).toBe(testCandidateId);
    expect(analytics.shareClicksTotal).toBe(0);
    expect(analytics.uniqueShareClicks).toBe(0);
    expect(analytics.shareClicksToday).toBe(0);
    expect(analytics.profileViews).toBe(0);
    expect(analytics.uniqueProfileViews).toBe(0);
    expect(analytics.profileViewsToday).toBe(0);
  });

  it("should track share click with unique IP", async () => {
    const testIp = "192.168.1.100";
    
    const result = await db.trackShareClick(testCandidateId, testIp);
    
    expect(result.success).toBe(true);
    expect(result.message).toBe("Share tracked successfully");
    
    const analytics = await db.getCandidateAnalytics(testCandidateId);
    expect(analytics).toBeDefined();
    expect(analytics!.shareClicksTotal).toBeGreaterThan(0);
    expect(analytics!.uniqueShareClicks).toBeGreaterThan(0);
  });

  it("should enforce rate limiting (10 minutes)", async () => {
    const testIp = "192.168.1.101";
    
    // First click should succeed
    const result1 = await db.trackShareClick(testCandidateId, testIp);
    expect(result1.success).toBe(true);
    
    // Second click immediately should fail (rate limited)
    const result2 = await db.trackShareClick(testCandidateId, testIp);
    expect(result2.success).toBe(false);
    expect(result2.message).toContain("10 minutes");
  });

  it("should track profile view with unique IP", async () => {
    const testIp = "192.168.1.102";
    
    const result = await db.trackProfileView(testCandidateId, testIp);
    
    expect(result.success).toBe(true);
    expect(result.message).toBe("View tracked successfully");
    
    const analytics = await db.getCandidateAnalytics(testCandidateId);
    expect(analytics).toBeDefined();
    expect(analytics!.profileViews).toBeGreaterThan(0);
    expect(analytics!.uniqueProfileViews).toBeGreaterThan(0);
  });

  it("should hash IP addresses for privacy", () => {
    const testIp = "192.168.1.1";
    const hash1 = db.hashIpAddress(testIp);
    const hash2 = db.hashIpAddress(testIp);
    
    // Same IP should produce same hash
    expect(hash1).toBe(hash2);
    
    // Hash should be 64 characters (SHA256)
    expect(hash1.length).toBe(64);
    
    // Different IP should produce different hash
    const hash3 = db.hashIpAddress("192.168.1.2");
    expect(hash1).not.toBe(hash3);
  });

  it("should get analytics for multiple candidates", async () => {
    const candidates = await db.getCandidatesByContest(1);
    const candidateIds = candidates.slice(0, 3).map(c => c.id);
    
    if (candidateIds.length > 0) {
      const bulkAnalytics = await db.getBulkCandidateAnalytics(candidateIds);
      
      expect(bulkAnalytics).toBeDefined();
      expect(bulkAnalytics.length).toBe(candidateIds.length);
      
      // Each candidate should have analytics
      bulkAnalytics.forEach(analytics => {
        expect(candidateIds).toContain(analytics.candidateId);
        expect(analytics.shareClicksTotal).toBeGreaterThanOrEqual(0);
        expect(analytics.profileViews).toBeGreaterThanOrEqual(0);
      });
    }
  });

  it("should reset daily analytics at midnight", async () => {
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
