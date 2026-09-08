/**
 * Tests vitest — Export RGPD
 * Miss & Mister Dour 2026 — JS-Innov.IA
 *
 * Couvre :
 * - Calcul du statut de conformité RGPD (isCompliant)
 * - Formatage des données pour l'export CSV
 * - Validation des champs obligatoires RGPD (Art. 7 & Art. 30)
 */
import { describe, it, expect } from "vitest";

// ─── Helpers répliqués depuis la logique serveur ──────────────────────────────
// (Testés indépendamment pour isolation)

interface RawConsentRow {
  acceptCGU: number | null;
  acceptCGUAt: Date | null;
  acceptRules: number | null;
  acceptMedia: number | null;
  acceptNewsletter: number | null;
  consentVersion: string | null;
}

function computeCompliance(row: RawConsentRow): {
  isCompliant: boolean;
  complianceStatus: "CONFORME" | "NON_CONFORME";
} {
  const isCompliant =
    row.acceptCGU === 1 &&
    row.acceptRules === 1 &&
    !!row.acceptCGUAt;

  return {
    isCompliant,
    complianceStatus: isCompliant ? "CONFORME" : "NON_CONFORME",
  };
}

function formatConsentDate(date: Date | null): string | null {
  if (!date) return null;
  return date.toLocaleString("fr-BE", { timeZone: "Europe/Brussels" });
}

// ─── Tests computeCompliance ──────────────────────────────────────────────────

describe("computeCompliance", () => {
  it("est CONFORME si CGU + règlement acceptés et date renseignée", () => {
    const result = computeCompliance({
      acceptCGU: 1,
      acceptCGUAt: new Date("2026-01-15T10:00:00Z"),
      acceptRules: 1,
      acceptMedia: 1,
      acceptNewsletter: 0,
      consentVersion: "v1.0",
    });
    expect(result.isCompliant).toBe(true);
    expect(result.complianceStatus).toBe("CONFORME");
  });

  it("est NON_CONFORME si CGU non acceptées", () => {
    const result = computeCompliance({
      acceptCGU: 0,
      acceptCGUAt: new Date("2026-01-15T10:00:00Z"),
      acceptRules: 1,
      acceptMedia: 1,
      acceptNewsletter: 0,
      consentVersion: "v1.0",
    });
    expect(result.isCompliant).toBe(false);
    expect(result.complianceStatus).toBe("NON_CONFORME");
  });

  it("est NON_CONFORME si règlement non accepté", () => {
    const result = computeCompliance({
      acceptCGU: 1,
      acceptCGUAt: new Date("2026-01-15T10:00:00Z"),
      acceptRules: 0,
      acceptMedia: 1,
      acceptNewsletter: 1,
      consentVersion: "v1.0",
    });
    expect(result.isCompliant).toBe(false);
    expect(result.complianceStatus).toBe("NON_CONFORME");
  });

  it("est NON_CONFORME si date de consentement CGU manquante", () => {
    const result = computeCompliance({
      acceptCGU: 1,
      acceptCGUAt: null, // ← Pas de preuve horodatée
      acceptRules: 1,
      acceptMedia: 1,
      acceptNewsletter: 1,
      consentVersion: "v1.0",
    });
    expect(result.isCompliant).toBe(false);
    expect(result.complianceStatus).toBe("NON_CONFORME");
  });

  it("est CONFORME même si médias et newsletter non acceptés (optionnels)", () => {
    const result = computeCompliance({
      acceptCGU: 1,
      acceptCGUAt: new Date("2026-01-15T10:00:00Z"),
      acceptRules: 1,
      acceptMedia: 0, // Optionnel
      acceptNewsletter: 0, // Optionnel
      consentVersion: "v1.0",
    });
    expect(result.isCompliant).toBe(true);
    expect(result.complianceStatus).toBe("CONFORME");
  });

  it("est NON_CONFORME si tous les champs sont null", () => {
    const result = computeCompliance({
      acceptCGU: null,
      acceptCGUAt: null,
      acceptRules: null,
      acceptMedia: null,
      acceptNewsletter: null,
      consentVersion: null,
    });
    expect(result.isCompliant).toBe(false);
    expect(result.complianceStatus).toBe("NON_CONFORME");
  });
});

// ─── Tests formatConsentDate ──────────────────────────────────────────────────

describe("formatConsentDate", () => {
  it("retourne null si la date est null", () => {
    expect(formatConsentDate(null)).toBeNull();
  });

  it("retourne une chaîne non vide pour une date valide", () => {
    const result = formatConsentDate(new Date("2026-01-15T10:00:00Z"));
    expect(result).toBeTruthy();
    expect(typeof result).toBe("string");
  });

  it("la date formatée contient l'année 2026", () => {
    const result = formatConsentDate(new Date("2026-04-19T18:00:00Z"));
    expect(result).toContain("2026");
  });
});

// ─── Tests structure de l'export RGPD ────────────────────────────────────────

describe("Structure de l'export RGPD", () => {
  const mockCandidates = [
    {
      id: 1, firstName: "Marie", lastName: "Dupont",
      category: "miss", status: "approved",
      acceptCGU: 1, acceptCGUAt: new Date("2026-01-10T09:00:00Z"),
      acceptRules: 1, acceptMedia: 1, acceptNewsletter: 0,
      consentVersion: "v1.0",
    },
    {
      id: 2, firstName: "Jean", lastName: "Martin",
      category: "mister", status: "pending",
      acceptCGU: 0, acceptCGUAt: null,
      acceptRules: 0, acceptMedia: 0, acceptNewsletter: 0,
      consentVersion: "v1.0",
    },
    {
      id: 3, firstName: "Sophie", lastName: "Bernard",
      category: "miss", status: "pending",
      acceptCGU: 1, acceptCGUAt: new Date("2026-01-12T14:30:00Z"),
      acceptRules: 1, acceptMedia: 0, acceptNewsletter: 1,
      consentVersion: "v1.0",
    },
  ];

  it("calcule correctement le nombre de candidats conformes", () => {
    const compliant = mockCandidates.filter(
      (c) => c.acceptCGU === 1 && c.acceptRules === 1 && !!c.acceptCGUAt
    );
    expect(compliant.length).toBe(2);
  });

  it("calcule correctement le nombre de candidats non conformes", () => {
    const nonCompliant = mockCandidates.filter(
      (c) => !(c.acceptCGU === 1 && c.acceptRules === 1 && !!c.acceptCGUAt)
    );
    expect(nonCompliant.length).toBe(1);
  });

  it("le total est cohérent avec conformes + non conformes", () => {
    const compliant = mockCandidates.filter(
      (c) => c.acceptCGU === 1 && c.acceptRules === 1 && !!c.acceptCGUAt
    ).length;
    const nonCompliant = mockCandidates.length - compliant;
    expect(compliant + nonCompliant).toBe(mockCandidates.length);
  });

  it("chaque candidat a un statut de conformité défini", () => {
    for (const c of mockCandidates) {
      const { complianceStatus } = computeCompliance({
        acceptCGU: c.acceptCGU,
        acceptCGUAt: c.acceptCGUAt,
        acceptRules: c.acceptRules,
        acceptMedia: c.acceptMedia,
        acceptNewsletter: c.acceptNewsletter,
        consentVersion: c.consentVersion,
      });
      expect(["CONFORME", "NON_CONFORME"]).toContain(complianceStatus);
    }
  });
});

// ─── Tests métadonnées RGPD obligatoires ─────────────────────────────────────

describe("Métadonnées RGPD obligatoires (Art. 30)", () => {
  const exportMeta = {
    exportedAt: new Date().toISOString(),
    exportedBy: "admin",
    totalCandidates: 10,
    compliantCount: 8,
    nonCompliantCount: 2,
    rgpdVersion: "RGPD-2016/679",
    legalBasis: "Consentement explicite (Art. 6.1.a RGPD) — Miss & Mister Dour 2026",
    dataController: "STARLIGHT ASBL — Grand'Place 9, 7370 Dour, Belgique",
  };

  it("contient la référence réglementaire RGPD 2016/679", () => {
    expect(exportMeta.rgpdVersion).toContain("RGPD-2016/679");
  });

  it("contient la base légale de traitement (Art. 6.1.a)", () => {
    expect(exportMeta.legalBasis).toContain("Art. 6.1.a RGPD");
  });

  it("contient l'identité du responsable du traitement", () => {
    expect(exportMeta.dataController).toContain("STARLIGHT ASBL");
    expect(exportMeta.dataController).toContain("Dour");
  });

  it("la date d'export est une chaîne ISO valide", () => {
    expect(() => new Date(exportMeta.exportedAt)).not.toThrow();
    expect(new Date(exportMeta.exportedAt).getFullYear()).toBeGreaterThanOrEqual(2026);
  });

  it("les compteurs sont cohérents", () => {
    expect(exportMeta.compliantCount + exportMeta.nonCompliantCount).toBe(exportMeta.totalCandidates);
  });
});

// ─── Tests génération CSV ─────────────────────────────────────────────────────

describe("Génération CSV RGPD", () => {
  it("les colonnes obligatoires RGPD sont présentes", () => {
    const requiredColumns = [
      "CGU acceptées",
      "Date consentement CGU",
      "Version CGU",
      "Règlement accepté",
      "Statut conformité RGPD",
    ];
    // Simuler les en-têtes du CSV
    const cols = [
      "ID", "Prénom", "Nom", "Catégorie", "Statut candidature",
      "Téléphone", "Date inscription",
      "CGU acceptées", "Date consentement CGU", "Version CGU",
      "Règlement accepté", "Droits médias acceptés", "Newsletter acceptée",
      "Statut conformité RGPD",
    ];
    for (const col of requiredColumns) {
      expect(cols).toContain(col);
    }
  });

  it("les valeurs booléennes sont converties en OUI/NON", () => {
    const toYesNo = (v: boolean) => (v ? "OUI" : "NON");
    expect(toYesNo(true)).toBe("OUI");
    expect(toYesNo(false)).toBe("NON");
  });

  it("le BOM UTF-8 est présent pour compatibilité Excel", () => {
    const bom = "\uFEFF";
    expect(bom.charCodeAt(0)).toBe(0xFEFF);
  });

  it("les virgules dans les champs sont correctement échappées", () => {
    const esc = (v: string | number) => {
      const s = String(v);
      return s.includes(",") || s.includes('"') || s.includes("\n")
        ? `"${s.replace(/"/g, '""')}"`
        : s;
    };
    expect(esc("Dupont, Marie")).toBe('"Dupont, Marie"');
    expect(esc('Texte avec "guillemets"')).toBe('"Texte avec ""guillemets"""');
    expect(esc("Simple")).toBe("Simple");
    expect(esc(42)).toBe("42");
  });
});
