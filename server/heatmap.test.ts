import { describe, it, expect, beforeAll } from "vitest";
import * as db from "./db";

describe("Heatmap Engagement 7j×24h", () => {
  const contestId = 1;
  let testCandidateId: number;

  beforeAll(async () => {
    // Get a test candidate
    const candidates = await db.getCandidatesByContest(contestId);
    if (candidates.length > 0) {
      testCandidateId = candidates[0].id;
    } else {
      testCandidateId = 1;
    }
  });

  describe("1. Heatmap Data Aggregation", () => {
    it("should aggregate events into 7×24 grid", async () => {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);

      const heatmapData = await db.getHeatmapData({
        startDate,
        endDate,
        eventType: "all",
        contestId,
      });

      expect(heatmapData).toBeDefined();
      expect(Array.isArray(heatmapData)).toBe(true);

      // Should have 7 days × 24 hours = 168 cells
      expect(heatmapData.length).toBe(168);

      // Each cell should have required properties
      const firstCell = heatmapData[0];
      expect(firstCell).toHaveProperty("day");
      expect(firstCell).toHaveProperty("dayName");
      expect(firstCell).toHaveProperty("hour");
      expect(firstCell).toHaveProperty("count");

      // Day should be 0-6
      expect(firstCell.day).toBeGreaterThanOrEqual(0);
      expect(firstCell.day).toBeLessThanOrEqual(6);

      // Hour should be 0-23
      expect(firstCell.hour).toBeGreaterThanOrEqual(0);
      expect(firstCell.hour).toBeLessThanOrEqual(23);

      // Count should be non-negative
      expect(firstCell.count).toBeGreaterThanOrEqual(0);
    });

    it("should filter by event type", async () => {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);

      const allEvents = await db.getHeatmapData({
        startDate,
        endDate,
        eventType: "all",
        contestId,
      });

      const viewEvents = await db.getHeatmapData({
        startDate,
        endDate,
        eventType: "view",
        contestId,
      });

      const shareEvents = await db.getHeatmapData({
        startDate,
        endDate,
        eventType: "share",
        contestId,
      });

      // All three should return 168 cells
      expect(allEvents.length).toBe(168);
      expect(viewEvents.length).toBe(168);
      expect(shareEvents.length).toBe(168);

      // Total count of "all" should be >= sum of specific types
      const allTotal = allEvents.reduce((sum, cell) => sum + cell.count, 0);
      const viewTotal = viewEvents.reduce((sum, cell) => sum + cell.count, 0);
      const shareTotal = shareEvents.reduce((sum, cell) => sum + cell.count, 0);

      expect(allTotal).toBeGreaterThanOrEqual(viewTotal);
      expect(allTotal).toBeGreaterThanOrEqual(shareTotal);
    });

    it("should filter by candidate", async () => {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);

      const allCandidates = await db.getHeatmapData({
        startDate,
        endDate,
        eventType: "all",
        contestId,
      });

      const singleCandidate = await db.getHeatmapData({
        startDate,
        endDate,
        eventType: "all",
        candidateId: testCandidateId,
        contestId,
      });

      // Both should return 168 cells
      expect(allCandidates.length).toBe(168);
      expect(singleCandidate.length).toBe(168);

      // Single candidate total should be <= all candidates total
      const allTotal = allCandidates.reduce((sum, cell) => sum + cell.count, 0);
      const singleTotal = singleCandidate.reduce((sum, cell) => sum + cell.count, 0);

      expect(singleTotal).toBeLessThanOrEqual(allTotal);
    });
  });

  describe("2. Heatmap Summary Statistics", () => {
    it("should calculate summary statistics", async () => {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);

      const summary = await db.getHeatmapSummary({
        startDate,
        endDate,
        eventType: "all",
        contestId,
      });

      expect(summary).toBeDefined();
      expect(summary).toHaveProperty("totalEvents");
      expect(summary).toHaveProperty("avgEventsPerCell");
      expect(summary).toHaveProperty("peakHour");
      expect(summary).toHaveProperty("quietestHour");

      // Total events should be non-negative
      expect(summary.totalEvents).toBeGreaterThanOrEqual(0);

      // Average should be non-negative
      expect(summary.avgEventsPerCell).toBeGreaterThanOrEqual(0);

      // Peak hour should have required properties
      expect(summary.peakHour).toHaveProperty("day");
      expect(summary.peakHour).toHaveProperty("hour");
      expect(summary.peakHour).toHaveProperty("count");

      // Quietest hour should have required properties
      expect(summary.quietestHour).toHaveProperty("day");
      expect(summary.quietestHour).toHaveProperty("hour");
      expect(summary.quietestHour).toHaveProperty("count");

      // Peak count should be >= quietest count
      expect(summary.peakHour.count).toBeGreaterThanOrEqual(summary.quietestHour.count);
    });

    it("should calculate correct average", async () => {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);

      const summary = await db.getHeatmapSummary({
        startDate,
        endDate,
        eventType: "all",
        contestId,
      });

      // Average = total / (7 days × 24 hours)
      const expectedAvg = summary.totalEvents / (7 * 24);
      const actualAvg = summary.avgEventsPerCell;

      // Allow small rounding difference
      expect(Math.abs(actualAvg - expectedAvg)).toBeLessThan(0.1);
    });
  });

  describe("3. Export Functions", () => {
    it("should export to CSV format", async () => {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);

      const csv = await db.exportHeatmapToCSV({
        startDate,
        endDate,
        eventType: "all",
        contestId,
      });

      expect(csv).toBeDefined();
      expect(typeof csv).toBe("string");

      // Should have CSV header
      expect(csv).toContain("Jour,Heure,Nombre d'événements");

      // Should have data rows (at least header + 1 row)
      const lines = csv.split("\n").filter(line => line.trim() !== "");
      expect(lines.length).toBeGreaterThan(1);

      // Should have 168 data rows + 1 header
      expect(lines.length).toBe(169);
    });

    it("should export to JSON format", async () => {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);

      const json = await db.exportHeatmapToJSON({
        startDate,
        endDate,
        eventType: "all",
        contestId,
      });

      expect(json).toBeDefined();
      expect(typeof json).toBe("string");

      // Should be valid JSON
      const parsed = JSON.parse(json);
      expect(parsed).toHaveProperty("metadata");
      expect(parsed).toHaveProperty("data");

      // Metadata should have required fields
      expect(parsed.metadata).toHaveProperty("startDate");
      expect(parsed.metadata).toHaveProperty("endDate");
      expect(parsed.metadata).toHaveProperty("eventType");
      expect(parsed.metadata).toHaveProperty("generatedAt");

      // Data should be array of 168 cells
      expect(Array.isArray(parsed.data)).toBe(true);
      expect(parsed.data.length).toBe(168);
    });
  });

  describe("4. Performance", () => {
    it("should aggregate heatmap data efficiently", async () => {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);

      const startTime = Date.now();

      await db.getHeatmapData({
        startDate,
        endDate,
        eventType: "all",
        contestId,
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete in < 1 second
      expect(duration).toBeLessThan(1000);
    });

    it("should calculate summary efficiently", async () => {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);

      const startTime = Date.now();

      await db.getHeatmapSummary({
        startDate,
        endDate,
        eventType: "all",
        contestId,
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete in < 1 second
      expect(duration).toBeLessThan(1000);
    });
  });

  describe("5. Data Integrity", () => {
    it("should handle empty date ranges", async () => {
      const endDate = new Date();
      const startDate = new Date(endDate);
      startDate.setHours(startDate.getHours() - 1); // 1 hour range

      const heatmapData = await db.getHeatmapData({
        startDate,
        endDate,
        eventType: "all",
        contestId,
      });

      // Should still return 168 cells (with mostly 0 counts)
      expect(heatmapData.length).toBe(168);
    });

    it("should handle non-existent candidate", async () => {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);

      const heatmapData = await db.getHeatmapData({
        startDate,
        endDate,
        eventType: "all",
        candidateId: 999999, // Non-existent ID
        contestId,
      });

      // Should return 168 cells with all 0 counts
      expect(heatmapData.length).toBe(168);
      const totalCount = heatmapData.reduce((sum, cell) => sum + cell.count, 0);
      expect(totalCount).toBe(0);
    });
  });
});
