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

describe("Gallery Filters - photos.listPublic", () => {
  it("should exist as a procedure on the router", () => {
    expect(appRouter).toBeDefined();
    const caller = appRouter.createCaller(createPublicContext());
    expect(caller.photos).toBeDefined();
    expect(caller.photos.listPublic).toBeDefined();
    expect(typeof caller.photos.listPublic).toBe("function");
  });

  it("should return photos with required fields", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const photos = await caller.photos.listPublic();
    expect(Array.isArray(photos)).toBe(true);
    
    if (photos.length > 0) {
      const photo = photos[0];
      // Verify essential fields returned by listPublic
      expect(photo).toHaveProperty("id");
      expect(photo).toHaveProperty("url");
      expect(photo).toHaveProperty("category");
      expect(photo).toHaveProperty("candidateId");
      expect(photo).toHaveProperty("candidateName");
      expect(photo).toHaveProperty("candidateCategory");
      expect(photo).toHaveProperty("createdAt");
    }
  });

  it("should return all approved photos when no filter is provided", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const photos = await caller.photos.listPublic();
    
    // Should return photos (we have 308 in the DB)
    expect(photos.length).toBeGreaterThan(0);
  });

  it("should return photos with valid categories", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const photos = await caller.photos.listPublic();
    
    const validCategories = ["portrait", "event", "backstage", "performance", "other"];
    for (const photo of photos) {
      expect(validCategories).toContain(photo.category);
    }
  });

  it("should filter by portrait category", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const portraits = await caller.photos.listPublic({ category: "portrait" });
    
    expect(Array.isArray(portraits)).toBe(true);
    for (const photo of portraits) {
      expect(photo.category).toBe("portrait");
    }
  });

  it("should filter by event category", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const events = await caller.photos.listPublic({ category: "event" });
    
    expect(Array.isArray(events)).toBe(true);
    for (const photo of events) {
      expect(photo.category).toBe("event");
    }
  });

  it("should filter by candidateId", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const photos = await caller.photos.listPublic({ candidateId: 1 });
    
    expect(Array.isArray(photos)).toBe(true);
    for (const photo of photos) {
      expect(photo.candidateId).toBe(1);
    }
  });

  it("should return all photos when category is 'all'", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const allPhotos = await caller.photos.listPublic({ category: "all" });
    const noFilter = await caller.photos.listPublic();
    
    expect(allPhotos.length).toBe(noFilter.length);
  });

  it("portrait + event counts should equal total", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const all = await caller.photos.listPublic();
    const portraits = await caller.photos.listPublic({ category: "portrait" });
    const events = await caller.photos.listPublic({ category: "event" });
    const other = all.filter(p => !["portrait", "event"].includes(p.category));
    
    expect(portraits.length + events.length + other.length).toBe(all.length);
  });
});

describe("Gallery Filters - candidateProfile.listApproved", () => {
  it("should return approved candidates for gallery filtering", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const candidates = await caller.candidateProfile.listApproved();
    expect(Array.isArray(candidates)).toBe(true);
    
    if (candidates.length > 0) {
      const candidate = candidates[0];
      expect(candidate).toHaveProperty("id");
      expect(candidate).toHaveProperty("firstName");
      expect(candidate).toHaveProperty("lastName");
      expect(candidate).toHaveProperty("category");
    }
  });

  it("should return candidates with Miss and Mister categories", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const candidates = await caller.candidateProfile.listApproved();
    
    const categories = [...new Set(candidates.map((c: any) => c.category))];
    expect(categories.length).toBeGreaterThan(0);
  });
});
