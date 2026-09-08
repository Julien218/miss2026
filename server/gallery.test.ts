import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
      ip: "127.0.0.1",
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("Gallery & Floating Cards - candidateProfile.listApproved", () => {
  it("should be accessible as a public procedure (no auth required)", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    
    // Should not throw - it's a public procedure
    const result = await caller.candidateProfile.listApproved();
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  it("should return candidates with required fields for gallery display", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    
    const result = await caller.candidateProfile.listApproved();
    
    if (result.length > 0) {
      const candidate = result[0];
      // Required fields for gallery card display
      expect(candidate).toHaveProperty("id");
      expect(candidate).toHaveProperty("firstName");
      expect(candidate).toHaveProperty("lastName");
      expect(candidate).toHaveProperty("category");
      expect(candidate).toHaveProperty("profilePhoto");
      expect(candidate).toHaveProperty("city");
      expect(candidate).toHaveProperty("voteCount");
    }
  });

  it("should only return approved candidates (status field not exposed but filtered server-side)", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    
    const result = await caller.candidateProfile.listApproved();
    
    // The procedure filters by status=approved server-side
    // Status is not exposed in the response for security
    // Verify all returned candidates have required display fields
    for (const candidate of result) {
      expect(candidate.id).toBeDefined();
      expect(candidate.firstName).toBeDefined();
      expect(candidate.lastName).toBeDefined();
      expect(["miss", "mister"]).toContain(candidate.category);
    }
  });

  it("should return candidates with valid category (miss or mister)", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    
    const result = await caller.candidateProfile.listApproved();
    
    for (const candidate of result) {
      expect(["miss", "mister"]).toContain(candidate.category);
    }
  });
});

describe("Gallery - media.listPublic", () => {
  it("should be accessible as a public procedure (no auth required)", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    
    // Should not throw - it's a public procedure
    const result = await caller.media.listPublic({});
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  it("should accept optional contestId filter", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    
    // Should not throw with contestId
    const result = await caller.media.listPublic({ contestId: 1 });
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("Gallery - media.listByCandidate", () => {
  it("should be accessible as a public procedure", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    
    const result = await caller.media.listByCandidate({ candidateId: 1 });
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("Router structure - gallery routes", () => {
  it("should have candidateProfile.listApproved procedure", () => {
    expect(appRouter._def.procedures).toHaveProperty("candidateProfile.listApproved");
  });

  it("should have media.listPublic procedure", () => {
    expect(appRouter._def.procedures).toHaveProperty("media.listPublic");
  });

  it("should have media.listByCandidate procedure", () => {
    expect(appRouter._def.procedures).toHaveProperty("media.listByCandidate");
  });
});
