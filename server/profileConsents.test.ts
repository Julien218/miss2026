/**
 * profileConsents.test.ts
 * Tests unitaires pour les consentements RGPD dans updateProfileByToken
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Helpers de validation (logique extraite du router) ───────────────────────

interface ConsentInput {
  acceptRules?: boolean;
  acceptMedia?: boolean;
  acceptCGU?: boolean;
  acceptNewsletter?: boolean;
}

function buildConsentFields(input: ConsentInput): Record<string, any> {
  const fields: Record<string, any> = {};
  if (input.acceptRules !== undefined) fields.acceptRules = input.acceptRules ? 1 : 0;
  if (input.acceptMedia !== undefined) fields.acceptMedia = input.acceptMedia ? 1 : 0;
  if (input.acceptNewsletter !== undefined) fields.acceptNewsletter = input.acceptNewsletter ? 1 : 0;
  if (input.acceptCGU !== undefined) {
    fields.acceptCGU = input.acceptCGU ? 1 : 0;
    if (input.acceptCGU) fields.acceptCGUAt = expect.any(Date);
    fields.consentVersion = "v1.0";
  }
  return fields;
}

function validateConsents(consents: { acceptRules: boolean; acceptMedia: boolean; acceptCGU: boolean }): string[] {
  const errors: string[] = [];
  if (!consents.acceptRules) errors.push("Vous devez accepter le règlement du concours");
  if (!consents.acceptMedia) errors.push("Vous devez autoriser l'utilisation de votre image");
  if (!consents.acceptCGU) errors.push("Vous devez accepter les CGU et la Politique de Confidentialité");
  return errors;
}

function isCompliant(candidate: {
  acceptCGU: number | boolean;
  acceptRules: number | boolean;
  acceptCGUAt: Date | null;
}): boolean {
  return (
    (candidate.acceptCGU === 1 || candidate.acceptCGU === true) &&
    (candidate.acceptRules === 1 || candidate.acceptRules === true) &&
    !!candidate.acceptCGUAt
  );
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("Consentements RGPD — buildConsentFields", () => {
  it("convertit acceptRules true → 1", () => {
    const fields = buildConsentFields({ acceptRules: true });
    expect(fields.acceptRules).toBe(1);
  });

  it("convertit acceptRules false → 0", () => {
    const fields = buildConsentFields({ acceptRules: false });
    expect(fields.acceptRules).toBe(0);
  });

  it("convertit acceptMedia true → 1", () => {
    const fields = buildConsentFields({ acceptMedia: true });
    expect(fields.acceptMedia).toBe(1);
  });

  it("convertit acceptNewsletter false → 0", () => {
    const fields = buildConsentFields({ acceptNewsletter: false });
    expect(fields.acceptNewsletter).toBe(0);
  });

  it("ajoute acceptCGUAt et consentVersion quand acceptCGU = true", () => {
    const fields = buildConsentFields({ acceptCGU: true });
    expect(fields.acceptCGU).toBe(1);
    expect(fields.consentVersion).toBe("v1.0");
    // acceptCGUAt doit être défini (Date)
    expect(fields).toHaveProperty("acceptCGUAt");
  });

  it("n'ajoute PAS acceptCGUAt quand acceptCGU = false", () => {
    const fields = buildConsentFields({ acceptCGU: false });
    expect(fields.acceptCGU).toBe(0);
    expect(fields).not.toHaveProperty("acceptCGUAt");
    expect(fields.consentVersion).toBe("v1.0");
  });

  it("n'inclut pas les champs non fournis", () => {
    const fields = buildConsentFields({ acceptRules: true });
    expect(fields).not.toHaveProperty("acceptMedia");
    expect(fields).not.toHaveProperty("acceptCGU");
    expect(fields).not.toHaveProperty("acceptNewsletter");
  });

  it("gère tous les consentements simultanément", () => {
    const fields = buildConsentFields({
      acceptRules: true,
      acceptMedia: true,
      acceptCGU: true,
      acceptNewsletter: false,
    });
    expect(fields.acceptRules).toBe(1);
    expect(fields.acceptMedia).toBe(1);
    expect(fields.acceptCGU).toBe(1);
    expect(fields.acceptNewsletter).toBe(0);
    expect(fields.consentVersion).toBe("v1.0");
  });
});

describe("Validation des consentements obligatoires", () => {
  it("retourne 0 erreur quand tous les consentements obligatoires sont cochés", () => {
    const errors = validateConsents({
      acceptRules: true,
      acceptMedia: true,
      acceptCGU: true,
    });
    expect(errors).toHaveLength(0);
  });

  it("retourne une erreur si acceptRules manque", () => {
    const errors = validateConsents({
      acceptRules: false,
      acceptMedia: true,
      acceptCGU: true,
    });
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain("règlement");
  });

  it("retourne une erreur si acceptMedia manque", () => {
    const errors = validateConsents({
      acceptRules: true,
      acceptMedia: false,
      acceptCGU: true,
    });
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain("image");
  });

  it("retourne une erreur si acceptCGU manque", () => {
    const errors = validateConsents({
      acceptRules: true,
      acceptMedia: true,
      acceptCGU: false,
    });
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain("CGU");
  });

  it("retourne 3 erreurs si aucun consentement n'est coché", () => {
    const errors = validateConsents({
      acceptRules: false,
      acceptMedia: false,
      acceptCGU: false,
    });
    expect(errors).toHaveLength(3);
  });

  it("la newsletter est optionnelle — aucune erreur sans elle", () => {
    const errors = validateConsents({
      acceptRules: true,
      acceptMedia: true,
      acceptCGU: true,
    });
    expect(errors).toHaveLength(0);
  });
});

describe("Conformité RGPD — isCompliant", () => {
  it("candidat conforme avec CGU, règlement et date de consentement", () => {
    expect(isCompliant({
      acceptCGU: 1,
      acceptRules: 1,
      acceptCGUAt: new Date(),
    })).toBe(true);
  });

  it("candidat non conforme sans CGU", () => {
    expect(isCompliant({
      acceptCGU: 0,
      acceptRules: 1,
      acceptCGUAt: new Date(),
    })).toBe(false);
  });

  it("candidat non conforme sans règlement", () => {
    expect(isCompliant({
      acceptCGU: 1,
      acceptRules: 0,
      acceptCGUAt: new Date(),
    })).toBe(false);
  });

  it("candidat non conforme sans date de consentement CGU", () => {
    expect(isCompliant({
      acceptCGU: 1,
      acceptRules: 1,
      acceptCGUAt: null,
    })).toBe(false);
  });

  it("accepte les booléens natifs en plus des entiers 0/1", () => {
    expect(isCompliant({
      acceptCGU: true,
      acceptRules: true,
      acceptCGUAt: new Date(),
    })).toBe(true);
  });
});
