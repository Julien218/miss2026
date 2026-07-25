import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import { COOKIE_NAME } from "../shared/const";
import type { TrpcContext } from "./_core/context";

// ─── Test Helpers ──────────────────────────────────────────────────────────

type CookieCall = {
  name: string;
  options: Record<string, unknown>;
};

function createMockContext(
  role: string = "user",
  overrides: Partial<NonNullable<TrpcContext["user"]>> = {}
): { ctx: TrpcContext; clearedCookies: CookieCall[] } {
  const clearedCookies: CookieCall[] = [];

  const user: NonNullable<TrpcContext["user"]> = {
    id: 1,
    openId: "test-user-123",
    email: "test@missetmisterdour.be",
    name: "Test User",
    loginMethod: "manus",
    role: role as any,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
    ...overrides,
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: { "x-forwarded-for": "127.0.0.1" },
      ip: "127.0.0.1",
    } as TrpcContext["req"],
    res: {
      clearCookie: (name: string, options: Record<string, unknown>) => {
        clearedCookies.push({ name, options });
      },
    } as TrpcContext["res"],
  };

  return { ctx, clearedCookies };
}

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: { "x-forwarded-for": "127.0.0.1" },
      ip: "127.0.0.1",
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

// ─── Auth Tests ────────────────────────────────────────────────────────────

describe("auth.me", () => {
  it("returns null for unauthenticated users", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });

  it("returns user data for authenticated users", async () => {
    const { ctx } = createMockContext("admin", { name: "Julien Pagin" });
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).toBeDefined();
    expect(result?.name).toBe("Julien Pagin");
    expect(result?.role).toBe("admin");
  });
});

describe("auth.logout", () => {
  it("clears the session cookie and reports success", async () => {
    const { ctx, clearedCookies } = createMockContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();

    expect(result).toEqual({ success: true });
    expect(clearedCookies).toHaveLength(1);
    expect(clearedCookies[0]?.name).toBe(COOKIE_NAME);
    expect(clearedCookies[0]?.options).toMatchObject({
      maxAge: -1,
    });
  });
});

// ─── RBAC Tests ────────────────────────────────────────────────────────────

describe("RBAC - Role-based access control", () => {
  it("allows admin to create a contest", async () => {
    const { ctx } = createMockContext("admin");
    const caller = appRouter.createCaller(ctx);
    // This should not throw FORBIDDEN
    // It may throw a DB error since we're not connected, but NOT a FORBIDDEN error
    try {
      await caller.contests.create({
        title: "Miss & Mister Dour 2026",
        year: 2026,
        description: "Born to Dance - 19 avril 2026",
      });
    } catch (error: any) {
      // DB errors are expected in test env, but FORBIDDEN should not happen
      expect(error.code).not.toBe("FORBIDDEN");
    }
  });

  it("blocks regular user from creating a contest", async () => {
    const { ctx } = createMockContext("user");
    const caller = appRouter.createCaller(ctx);
    try {
      await caller.contests.create({
        title: "Test Contest",
        year: 2026,
      });
      // Should not reach here
      expect(true).toBe(false);
    } catch (error: any) {
      expect(error.code).toBe("FORBIDDEN");
    }
  });

  it("blocks candidate from creating a contest", async () => {
    const { ctx } = createMockContext("candidate");
    const caller = appRouter.createCaller(ctx);
    try {
      await caller.contests.create({
        title: "Test Contest",
        year: 2026,
      });
      expect(true).toBe(false);
    } catch (error: any) {
      expect(error.code).toBe("FORBIDDEN");
    }
  });

  it("allows super_admin to create a contest", async () => {
    const { ctx } = createMockContext("super_admin");
    const caller = appRouter.createCaller(ctx);
    try {
      await caller.contests.create({
        title: "Miss & Mister Dour 2026",
        year: 2026,
      });
    } catch (error: any) {
      // DB errors are expected in test env, but FORBIDDEN should not happen
      expect(error.code).not.toBe("FORBIDDEN");
    }
  });
});

// ─── Email Helper Tests ────────────────────────────────────────────────────

describe("Email helper", () => {
  it("buildCommentNotificationEmail returns correct structure", async () => {
    const { buildCommentNotificationEmail } = await import("./helpers/email");
    const result = buildCommentNotificationEmail({
      candidateName: "Marie Dupont",
      commenterName: "Jean Martin",
      commentContent: "Bonne chance pour le concours !",
      candidateUrl: "https://missetmisterdour.be/candidates/1",
    });

    expect(result).toHaveProperty("subject");
    expect(result).toHaveProperty("html");
    expect(result).toHaveProperty("text");
    expect(result.subject).toContain("Marie Dupont");
    expect(result.html).toContain("Jean Martin");
    expect(result.html).toContain("Bonne chance pour le concours !");
    expect(result.html).toContain("Js-Innov.IA");
    expect(result.text).toContain("Marie Dupont");
  });
});

// ─── Public Endpoints Tests ────────────────────────────────────────────────

describe("Public endpoints accessibility", () => {
  it("contests.list is accessible without authentication", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    try {
      await caller.contests.list();
    } catch (error: any) {
      // DB errors are expected, but UNAUTHORIZED should not happen
      expect(error.code).not.toBe("UNAUTHORIZED");
      expect(error.code).not.toBe("FORBIDDEN");
    }
  });

  it("contests.getById is accessible without authentication", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    try {
      await caller.contests.getById({ id: 1 });
    } catch (error: any) {
      expect(error.code).not.toBe("UNAUTHORIZED");
      expect(error.code).not.toBe("FORBIDDEN");
    }
  });
});

// ─── Router Structure Tests ────────────────────────────────────────────────

describe("Router structure", () => {
  it("has all required sub-routers", () => {
    const routerKeys = Object.keys(appRouter._def.procedures).concat(
      Object.keys(appRouter._def.record || {})
    );
    // Check that the main routers exist
    expect(appRouter._def.record).toHaveProperty("auth");
    expect(appRouter._def.record).toHaveProperty("system");
    expect(appRouter._def.record).toHaveProperty("contests");
    expect(appRouter._def.record).toHaveProperty("candidates");
    expect(appRouter._def.record).toHaveProperty("certificates");
    expect(appRouter._def.record).toHaveProperty("admin");
    expect(appRouter._def.record).toHaveProperty("articles");
    expect(appRouter._def.record).toHaveProperty("votes");
    expect(appRouter._def.record).toHaveProperty("badges");
    expect(appRouter._def.record).toHaveProperty("notifications");
    expect(appRouter._def.record).toHaveProperty("comments");
    expect(appRouter._def.record).toHaveProperty("assistant");
    expect(appRouter._def.record).toHaveProperty("whatsapp");
    expect(appRouter._def.record).toHaveProperty("videoGenerator");
    expect(appRouter._def.record).toHaveProperty("validation");
  });
});
