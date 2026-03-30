/**
 * Tests pour le système de commentaires sur les profils candidats
 * Vérifie : structure du router, procédures publiques/protégées, validation des entrées
 */
import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// ─── Helpers pour créer des contextes de test ─────────────────────────────────

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: { "x-forwarded-for": "127.0.0.1" },
      ip: "127.0.0.1",
    } as unknown as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as unknown as TrpcContext["res"],
  };
}

function createAdminContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "admin-test",
      email: "admin@test.com",
      name: "Admin Test",
      loginMethod: "manus",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: { "x-forwarded-for": "127.0.0.1" },
      ip: "127.0.0.1",
    } as unknown as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as unknown as TrpcContext["res"],
  };
}

function createUserContext(): TrpcContext {
  return {
    user: {
      id: 2,
      openId: "user-test",
      email: "user@test.com",
      name: "User Test",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: { "x-forwarded-for": "127.0.0.1" },
      ip: "127.0.0.1",
    } as unknown as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as unknown as TrpcContext["res"],
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("comments router - structure", () => {
  it("expose les procédures attendues", () => {
    const router = appRouter._def.record;
    expect(router).toHaveProperty("comments");
    
    // Vérifier que le sous-router comments existe et contient les procédures
    const commentsRecord = (router.comments as any)?._def?.record 
      ?? (router.comments as any)?._def?.procedures
      ?? router.comments;
    expect(commentsRecord).toBeDefined();
    // Vérifier via le caller que les procédures sont accessibles
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    expect(caller.comments).toBeDefined();
    expect(caller.comments.getByCandidate).toBeDefined();
    expect(caller.comments.add).toBeDefined();
    expect(caller.comments.like).toBeDefined();
  });
});

describe("comments.getByCandidate (public)", () => {
  it("retourne un tableau vide pour un candidat sans commentaires", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    
    // Candidat ID 99999 n'existe probablement pas, mais la requête doit retourner un tableau vide
    const result = await caller.comments.getByCandidate({ candidateId: 99999 });
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
  });

  it("accepte un paramètre limit optionnel", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    
    const result = await caller.comments.getByCandidate({ candidateId: 99999, limit: 10 });
    expect(Array.isArray(result)).toBe(true);
  });

  it("rejette un candidateId invalide (négatif)", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    
    await expect(
      caller.comments.getByCandidate({ candidateId: -1 })
    ).rejects.toThrow();
  });

  it("rejette un candidateId invalide (zéro)", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    
    await expect(
      caller.comments.getByCandidate({ candidateId: 0 })
    ).rejects.toThrow();
  });
});

describe("comments.add (public)", () => {
  it("rejette un commentaire avec un nom trop court", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    
    await expect(
      caller.comments.add({
        candidateId: 1,
        authorName: "A", // min 2 caractères
        content: "Super candidat !",
      })
    ).rejects.toThrow();
  });

  it("rejette un commentaire avec un contenu trop court", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    
    await expect(
      caller.comments.add({
        candidateId: 1,
        authorName: "Jean",
        content: "AB", // min 3 caractères
      })
    ).rejects.toThrow();
  });

  it("rejette un commentaire contenant des URLs (anti-spam)", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    
    await expect(
      caller.comments.add({
        candidateId: 1,
        authorName: "Spammer",
        content: "Visitez https://spam.com pour gagner !",
      })
    ).rejects.toThrow();
  });

  it("rejette un commentaire contenant http:// (anti-spam)", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    
    await expect(
      caller.comments.add({
        candidateId: 1,
        authorName: "Spammer",
        content: "Allez sur http://mauvais-site.com maintenant",
      })
    ).rejects.toThrow();
  });

  it("accepte un email optionnel valide", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    
    // Ceci devrait passer la validation de schéma (même si le candidat n'existe pas en DB)
    // On teste juste que le schéma accepte un email valide
    try {
      await caller.comments.add({
        candidateId: 1,
        authorName: "Marie",
        content: "Bonne chance !",
        authorEmail: "marie@example.com",
      });
    } catch (e: any) {
      // L'erreur ne devrait PAS être une erreur de validation zod sur l'email
      expect(e.message).not.toContain("authorEmail");
    }
  });

  it("rejette un email invalide", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    
    await expect(
      caller.comments.add({
        candidateId: 1,
        authorName: "Marie",
        content: "Bonne chance !",
        authorEmail: "pas-un-email",
      })
    ).rejects.toThrow();
  });
});

describe("comments.like (public)", () => {
  it("rejette un commentId invalide (négatif)", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    
    await expect(
      caller.comments.like({ commentId: -1 })
    ).rejects.toThrow();
  });

  it("rejette un commentId invalide (zéro)", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    
    await expect(
      caller.comments.like({ commentId: 0 })
    ).rejects.toThrow();
  });
});

describe("comments.listForModeration (admin only)", () => {
  it("refuse l'accès à un utilisateur non authentifié", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    
    await expect(
      caller.comments.listForModeration({ status: "all" })
    ).rejects.toThrow();
  });

  it("refuse l'accès à un utilisateur non-admin", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);
    
    await expect(
      caller.comments.listForModeration({ status: "all" })
    ).rejects.toThrow();
  });

  it("autorise l'accès à un admin", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    
    const result = await caller.comments.listForModeration({ status: "all" });
    expect(Array.isArray(result)).toBe(true);
  });

  it("filtre par statut 'approved'", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    
    const result = await caller.comments.listForModeration({ status: "approved" });
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("comments.moderate (admin only)", () => {
  it("refuse l'accès à un utilisateur non authentifié", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    
    await expect(
      caller.comments.moderate({ commentId: 1, action: "approve" })
    ).rejects.toThrow();
  });

  it("refuse l'accès à un utilisateur non-admin", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);
    
    await expect(
      caller.comments.moderate({ commentId: 1, action: "approve" })
    ).rejects.toThrow();
  });

  it("accepte les actions valides (approve, reject, delete)", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    
    // Ces actions sont valides dans le schéma zod
    // Elles peuvent échouer en DB si le commentaire n'existe pas, mais le schéma est validé
    for (const action of ["approve", "reject", "delete"] as const) {
      try {
        await caller.comments.moderate({ commentId: 999999, action });
      } catch (e: any) {
        // L'erreur ne devrait pas être une erreur de validation zod
        expect(e.code).not.toBe("BAD_REQUEST");
      }
    }
  });
});

describe("comments.getStats (admin only)", () => {
  it("refuse l'accès à un utilisateur non authentifié", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    
    await expect(caller.comments.getStats()).rejects.toThrow();
  });

  it("refuse l'accès à un utilisateur non-admin", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);
    
    await expect(caller.comments.getStats()).rejects.toThrow();
  });

  it("retourne les statistiques pour un admin", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    
    const stats = await caller.comments.getStats();
    expect(stats).toHaveProperty("total");
    expect(stats).toHaveProperty("approved");
    expect(stats).toHaveProperty("pending");
    expect(stats).toHaveProperty("rejected");
    expect(stats).toHaveProperty("totalLikes");
    expect(typeof stats.total).toBe("number");
    expect(typeof stats.approved).toBe("number");
    expect(typeof stats.pending).toBe("number");
    expect(typeof stats.rejected).toBe("number");
    expect(typeof stats.totalLikes).toBe("number");
  });
});
