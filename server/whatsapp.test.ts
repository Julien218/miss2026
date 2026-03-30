/**
 * Tests vitest — WhatsApp Business Service & Router
 * Miss & Mister Dour 2026 — JS-Innov.IA
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  normalizePhone,
  OFFICIAL_MESSAGE_TEMPLATES,
} from "./services/whatsappBusiness";

// ─── Tests normalizePhone ─────────────────────────────────────────────────────

describe("normalizePhone", () => {
  it("supprime le + d'un numéro international", () => {
    expect(normalizePhone("+32494119090")).toBe("32494119090");
  });

  it("convertit un numéro belge local (0xxx) en format international", () => {
    expect(normalizePhone("0494119090")).toBe("32494119090");
  });

  it("supprime les espaces, tirets et parenthèses", () => {
    expect(normalizePhone("+32 494 11 90 90")).toBe("32494119090");
    expect(normalizePhone("0494-11-90-90")).toBe("32494119090");
    expect(normalizePhone("(+32) 494 119 090")).toBe("32494119090");
  });

  it("laisse intact un numéro déjà normalisé", () => {
    expect(normalizePhone("32494119090")).toBe("32494119090");
  });

  it("gère un numéro français", () => {
    expect(normalizePhone("+33612345678")).toBe("33612345678");
  });
});

// ─── Tests OFFICIAL_MESSAGE_TEMPLATES ────────────────────────────────────────

describe("OFFICIAL_MESSAGE_TEMPLATES", () => {
  it("profile_reminder contient le nom du candidat, le taux et la signature", () => {
    const msg = OFFICIAL_MESSAGE_TEMPLATES.profile_reminder(
      "Marie Dupont",
      45,
      ["Biographie", "Photo principale"],
      "https://example.com/candidat/1"
    );
    expect(msg).toContain("Marie Dupont");
    expect(msg).toContain("45%");
    expect(msg).toContain("Biographie");
    expect(msg).toContain("Photo principale");
    expect(msg).toContain("Julien P.");
    expect(msg).toContain("By Js-Innov.IA");
  });

  it("vote_reminder contient le nombre de votes et la signature", () => {
    const msg = OFFICIAL_MESSAGE_TEMPLATES.vote_reminder(
      "Jean Martin",
      12,
      "https://example.com/candidat/2"
    );
    expect(msg).toContain("Jean Martin");
    expect(msg).toContain("12 votes");
    expect(msg).toContain("Julien P.");
    expect(msg).toContain("By Js-Innov.IA");
  });

  it("vote_reminder singulier quand 1 vote", () => {
    const msg = OFFICIAL_MESSAGE_TEMPLATES.vote_reminder(
      "Sophie",
      1,
      "https://example.com/candidat/3"
    );
    expect(msg).toContain("1 vote");
    expect(msg).not.toContain("1 votes");
  });

  it("event_reminder contient l'événement, la date et le lieu", () => {
    const msg = OFFICIAL_MESSAGE_TEMPLATES.event_reminder(
      "Lucas",
      "Lady Gaga Night",
      "19 avril 2026 à 20h00",
      "Salle des Fêtes de Dour"
    );
    expect(msg).toContain("Lucas");
    expect(msg).toContain("Lady Gaga Night");
    expect(msg).toContain("19 avril 2026");
    expect(msg).toContain("Salle des Fêtes de Dour");
    expect(msg).toContain("Julien P.");
  });

  it("welcome contient le nom et l'URL de profil", () => {
    const msg = OFFICIAL_MESSAGE_TEMPLATES.welcome(
      "Emma",
      "https://example.com/candidat/4"
    );
    expect(msg).toContain("Emma");
    expect(msg).toContain("https://example.com/candidat/4");
    expect(msg).toContain("Julien P.");
  });

  it("congratulations contient le titre", () => {
    const msg = OFFICIAL_MESSAGE_TEMPLATES.congratulations(
      "Clara",
      "Miss Dour 2026"
    );
    expect(msg).toContain("Clara");
    expect(msg).toContain("Miss Dour 2026");
    expect(msg).toContain("Julien P.");
  });

  it("urgent contient le message d'urgence", () => {
    const msg = OFFICIAL_MESSAGE_TEMPLATES.urgent(
      "Thomas",
      "Votre présence est requise demain à 18h."
    );
    expect(msg).toContain("URGENT");
    expect(msg).toContain("Thomas");
    expect(msg).toContain("Votre présence est requise demain");
    expect(msg).toContain("Julien P.");
  });

  it("custom contient le message personnalisé", () => {
    const msg = OFFICIAL_MESSAGE_TEMPLATES.custom(
      "Alice",
      "Votre dossier est en cours de validation."
    );
    expect(msg).toContain("Alice");
    expect(msg).toContain("Votre dossier est en cours de validation.");
    expect(msg).toContain("Julien P.");
    expect(msg).toContain("By Js-Innov.IA");
  });

  it("tous les templates se terminent par la signature JS-Innov.IA", () => {
    const templates = [
      OFFICIAL_MESSAGE_TEMPLATES.profile_reminder("X", 50, [], "https://x.com"),
      OFFICIAL_MESSAGE_TEMPLATES.vote_reminder("X", 5, "https://x.com"),
      OFFICIAL_MESSAGE_TEMPLATES.event_reminder("X", "Evt", "Date", "Lieu"),
      OFFICIAL_MESSAGE_TEMPLATES.welcome("X", "https://x.com"),
      OFFICIAL_MESSAGE_TEMPLATES.congratulations("X", "Titre"),
      OFFICIAL_MESSAGE_TEMPLATES.urgent("X", "Message urgent"),
      OFFICIAL_MESSAGE_TEMPLATES.custom("X", "Message custom"),
    ];
    for (const msg of templates) {
      expect(msg).toContain("By Js-Innov.IA");
    }
  });
});

// ─── Tests structure des données ─────────────────────────────────────────────

describe("WhatsApp message structure", () => {
  it("les messages ne dépassent pas 4096 caractères (limite API Meta)", () => {
    const longMissing = Array.from({ length: 20 }, (_, i) => `Champ manquant ${i + 1}`);
    const msg = OFFICIAL_MESSAGE_TEMPLATES.profile_reminder(
      "Candidat avec un très long nom et prénom",
      12,
      longMissing,
      "https://example.com/candidat/123456789"
    );
    expect(msg.length).toBeLessThanOrEqual(4096);
  });

  it("normalizePhone retourne uniquement des chiffres", () => {
    const phones = ["+32494119090", "0494119090", "32 494 11 90 90", "+33 6 12 34 56 78"];
    for (const phone of phones) {
      const normalized = normalizePhone(phone);
      expect(normalized).toMatch(/^\d+$/);
    }
  });
});
