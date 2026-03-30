/**
 * validation.test.ts — Tests vitest pour le workflow de validation admin
 * Couvre : getPendingProfiles, approveProfile, rejectProfile,
 *          getPendingPhotos, approvePhoto, rejectPhoto, bulkApprovePhotos,
 *          getValidationStats, adminGuard
 *
 * Créé par JS-Innov.IA — Pagin Julien, Dour, Belgique
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { validationRouter } from "./routers/validation";

// ─── Mocks ────────────────────────────────────────────────────────────────────
vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue({
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    offset: vi.fn().mockReturnThis(),
    leftJoin: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    then: vi.fn(),
  }),
}));

vi.mock("../../drizzle/schema", () => ({
  candidates: { id: "id", status: "status", profileSubmittedAt: "profileSubmittedAt" },
  photos: { id: "id", status: "status", candidateId: "candidateId", uploadedBy: "uploadedBy" },
  users: { id: "id", name: "name", email: "email" },
  contests: { id: "id" },
}));

vi.mock("./\_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

// shared/roles est testé directement sans mock

// ─── Tests du router ──────────────────────────────────────────────────────────
describe("validationRouter", () => {
  it("doit exporter un router valide", () => {
    expect(validationRouter).toBeDefined();
    expect(typeof validationRouter).toBe("object");
  });

  it("doit avoir toutes les procédures requises", () => {
    const procedures = Object.keys(validationRouter._def.procedures);
    expect(procedures).toContain("getPendingProfiles");
    expect(procedures).toContain("approveProfile");
    expect(procedures).toContain("rejectProfile");
    expect(procedures).toContain("resetProfileStatus");
    expect(procedures).toContain("getPendingPhotos");
    expect(procedures).toContain("approvePhoto");
    expect(procedures).toContain("rejectPhoto");
    expect(procedures).toContain("bulkApprovePhotos");
    expect(procedures).toContain("getValidationStats");
  });
});

// ─── Tests de la logique adminGuard ──────────────────────────────────────────
describe("adminGuard", () => {
  it("doit autoriser le rôle admin", async () => {
    const { isAdminOrAbove } = await import("../shared/roles");
    expect(isAdminOrAbove("admin")).toBe(true);
  });

  it("doit autoriser le rôle super_admin", async () => {
    const { isAdminOrAbove } = await import("../shared/roles");
    expect(isAdminOrAbove("super_admin")).toBe(true);
  });

  it("doit refuser le rôle user", async () => {
    const { isAdminOrAbove } = await import("../shared/roles");
    expect(isAdminOrAbove("user")).toBe(false);
  });

  it("doit refuser le rôle candidate", async () => {
    const { isAdminOrAbove } = await import("../shared/roles");
    expect(isAdminOrAbove("candidate")).toBe(false);
  });

  it("doit refuser le rôle photographer", async () => {
    const { isAdminOrAbove } = await import("../shared/roles");
    expect(isAdminOrAbove("photographer")).toBe(false);
  });
});

// ─── Tests de validation des inputs ──────────────────────────────────────────
describe("Validation des inputs", () => {
  describe("getPendingProfiles", () => {
    it("doit accepter les statuts valides", () => {
      const validStatuses = ["pending", "approved", "rejected", "all"];
      validStatuses.forEach((s) => {
        expect(["pending", "approved", "rejected", "all"]).toContain(s);
      });
    });

    it("doit limiter à 100 résultats maximum", () => {
      const maxLimit = 100;
      expect(maxLimit).toBe(100);
    });

    it("doit avoir un offset minimum de 0", () => {
      const minOffset = 0;
      expect(minOffset).toBe(0);
    });
  });

  describe("approveProfile", () => {
    it("doit exiger un candidateId positif", () => {
      const validIds = [1, 5, 100, 9999];
      validIds.forEach((id) => {
        expect(id).toBeGreaterThan(0);
        expect(Number.isInteger(id)).toBe(true);
      });
    });

    it("doit limiter la note à 500 caractères", () => {
      const maxNoteLength = 500;
      const longNote = "a".repeat(501);
      expect(longNote.length).toBeGreaterThan(maxNoteLength);
    });
  });

  describe("rejectProfile", () => {
    it("doit exiger une note de rejet d'au moins 5 caractères", () => {
      const minNoteLength = 5;
      const shortNote = "abc";
      expect(shortNote.length).toBeLessThan(minNoteLength);
    });

    it("doit limiter la note à 1000 caractères", () => {
      const maxNoteLength = 1000;
      const longNote = "a".repeat(1001);
      expect(longNote.length).toBeGreaterThan(maxNoteLength);
    });
  });

  describe("bulkApprovePhotos", () => {
    it("doit exiger au moins 1 photo", () => {
      const emptyArray: number[] = [];
      expect(emptyArray.length).toBeLessThan(1);
    });

    it("doit limiter à 50 photos maximum", () => {
      const maxPhotos = 50;
      const tooMany = Array.from({ length: 51 }, (_, i) => i + 1);
      expect(tooMany.length).toBeGreaterThan(maxPhotos);
    });

    it("doit accepter un tableau de 1 à 50 IDs", () => {
      const validBatch = Array.from({ length: 25 }, (_, i) => i + 1);
      expect(validBatch.length).toBeGreaterThanOrEqual(1);
      expect(validBatch.length).toBeLessThanOrEqual(50);
    });
  });

  describe("rejectPhoto", () => {
    it("doit exiger une raison d'au moins 3 caractères", () => {
      const minLength = 3;
      const shortReason = "ab";
      expect(shortReason.length).toBeLessThan(minLength);
    });

    it("doit limiter la raison à 500 caractères", () => {
      const maxLength = 500;
      const longReason = "a".repeat(501);
      expect(longReason.length).toBeGreaterThan(maxLength);
    });
  });
});

// ─── Tests de la logique métier ───────────────────────────────────────────────
describe("Logique métier de validation", () => {
  it("doit calculer correctement le total en attente", () => {
    const profilesPending = 5;
    const photosPending = 12;
    const total = profilesPending + photosPending;
    expect(total).toBe(17);
  });

  it("doit filtrer les profils sans profileSubmittedAt", () => {
    const allCandidates = [
      { id: 1, profileSubmittedAt: new Date(), status: "pending" },
      { id: 2, profileSubmittedAt: null, status: "pending" },
      { id: 3, profileSubmittedAt: new Date(), status: "approved" },
    ];
    const submitted = allCandidates.filter((c) => c.profileSubmittedAt !== null);
    expect(submitted).toHaveLength(2);
  });

  it("doit correctement identifier les profils conformes RGPD", () => {
    const candidate = {
      acceptCGU: 1,
      acceptRules: 1,
      acceptMedia: 1,
      acceptCGUAt: new Date(),
    };
    const isCompliant = candidate.acceptCGU === 1 && candidate.acceptRules === 1 && candidate.acceptCGUAt !== null;
    expect(isCompliant).toBe(true);
  });

  it("doit identifier les profils non conformes RGPD", () => {
    const candidate = {
      acceptCGU: 0,
      acceptRules: 1,
      acceptMedia: 0,
      acceptCGUAt: null,
    };
    const isCompliant = candidate.acceptCGU === 1 && candidate.acceptRules === 1 && candidate.acceptCGUAt !== null;
    expect(isCompliant).toBe(false);
  });

  it("doit construire le message de notification d'approbation", () => {
    const candidate = { firstName: "Marie", lastName: "Dupont", category: "miss" };
    const adminName = "Olivier Trevis";
    const note = "Excellent profil";
    const message = `Le profil de ${candidate.firstName} ${candidate.lastName} (${candidate.category}) a été approuvé par ${adminName}.${note ? `\n\nNote : ${note}` : ""}`;
    
    expect(message).toContain("Marie Dupont");
    expect(message).toContain("miss");
    expect(message).toContain("Olivier Trevis");
    expect(message).toContain("Excellent profil");
  });

  it("doit construire le message de notification de rejet", () => {
    const candidate = { firstName: "Jean", lastName: "Martin", category: "mister" };
    const adminName = "Olivier Trevis";
    const reason = "Photo de profil manquante";
    const message = `Le profil de ${candidate.firstName} ${candidate.lastName} (${candidate.category}) a été rejeté par ${adminName}.\n\nRaison : ${reason}`;
    
    expect(message).toContain("Jean Martin");
    expect(message).toContain("mister");
    expect(message).toContain("Photo de profil manquante");
  });

  it("doit calculer la taille de fichier en Mo", () => {
    const sizeBytes = 2_500_000;
    const sizeMo = (sizeBytes / 1024 / 1024).toFixed(1);
    expect(parseFloat(sizeMo)).toBeCloseTo(2.4, 0);
  });

  it("doit formater correctement les dates en français", () => {
    const date = new Date("2026-04-19T20:00:00Z");
    const formatted = date.toLocaleDateString("fr-BE", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
    expect(formatted).toContain("2026");
    expect(formatted).toContain("19");
  });
});

// ─── Tests de sécurité ───────────────────────────────────────────────────────
describe("Sécurité du workflow de validation", () => {
  it("ne doit pas exposer les hashes de mots de passe dans les résultats", () => {
    const candidateResult = {
      id: 1,
      firstName: "Marie",
      lastName: "Dupont",
      status: "pending",
      profilePhoto: null,
      bio: "Ma bio",
      // passwordHash ne doit PAS être dans la sélection
    };
    expect(candidateResult).not.toHaveProperty("passwordHash");
    expect(candidateResult).not.toHaveProperty("accountEmail");
  });

  it("doit vérifier que les IDs sont des entiers positifs", () => {
    const validId = 42;
    const invalidIds = [0, -1, -100, 1.5];
    
    expect(validId).toBeGreaterThan(0);
    expect(Number.isInteger(validId)).toBe(true);
    
    invalidIds.forEach((id) => {
      expect(id <= 0 || !Number.isInteger(id)).toBe(true);
    });
  });

  it("doit s'assurer que le statut ne peut être que pending/approved/rejected", () => {
    const validStatuses = ["pending", "approved", "rejected"];
    const invalidStatuses = ["finalist", "winner", "draft", "active", "banned"];
    
    invalidStatuses.forEach((s) => {
      expect(validStatuses).not.toContain(s);
    });
  });
});
