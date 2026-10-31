import { describe, it, expect } from "vitest";
import { publishTemplate, verifyTemplate } from "./candidateContractTemplate";
import {
  CONTRACT_SETUP_FIELDS,
  ageAt,
  NO_MEDIA,
} from "../../shared/candidate-contract";
import { generateCandidateContract2027 } from "./candidateContract2027";

const values = CONTRACT_SETUP_FIELDS.map(
  (_, i) => `Information de test ${i} confirmée par l’organisateur`
);
describe("contract publication and immutable agreement", () => {
  it("refuses missing organizer facts and unresolved draft markers", () => {
    expect(() => publishTemplate([], 1)).toThrow();
    expect(() =>
      publishTemplate(
        values.map((v, i) => (i === 11 ? "Néant" : v)),
        1
      )
    ).toThrow();
    expect(() =>
      publishTemplate(
        values.map((v, i) => (i === 0 ? "[À COMPLÉTER]" : v)),
        1
      )
    ).toThrow();
  });
  it("fills every practical field and identifies the exact text", () => {
    const template = publishTemplate(values, 7);
    expect(verifyTemplate(template)).toBe(true);
    expect(JSON.stringify(template.pages)).not.toMatch(/\[À|\[NÉANT/);
    expect(JSON.stringify(template.pages)).not.toContain("13 mars 2027");
    expect(JSON.stringify(template.pages)).toContain("22 mai 2027");
    const changed = publishTemplate(
      values.map((v, i) => (i === 6 ? "Aucun frais d’inscription" : v)),
      7
    );
    expect(changed.version).not.toBe(template.version);
    const tampered = structuredClone(template);
    tampered.pages[0][0].text = "Texte substitué";
    expect(verifyTemplate(tampered)).toBe(false);
  });
  it("generates the complete personalized version with optional media refused", async () => {
    const snapshot = {
      template: publishTemplate(values, 7),
      media: { ...NO_MEDIA },
      newsletter: false,
      guardianDeclaration: false,
      publicName: "Camille Dupont",
    };
    const data = {
      applicationId: 42,
      firstName: "Camille",
      lastName: "Dupont",
      dateOfBirth: "2003-02-21",
      street: "Rue Exemple",
      houseNumber: "3",
      postalCode: "7370",
      city: "Dour",
      height: 0,
      weight: 0,
      email: "camille@example.test",
      phone: "0470000000",
      category: "miss" as const,
      candidateSignatureName: "Camille Dupont",
      candidateSignedAt: new Date("2026-10-30T10:00:00Z"),
      snapshot,
    };
    const pdf = await generateCandidateContract2027(data);
    expect(pdf.subarray(0, 5).toString()).toBe("%PDF-");
    expect(
      pdf.toString("latin1").match(/\/Type \/Page\b/g)!.length
    ).toBeGreaterThanOrEqual(11);
    expect(snapshot.media.profile).toBe(false);
    snapshot.template.pages[0][0].text = "Texte remplacé";
    await expect(generateCandidateContract2027(data)).rejects.toThrow(
      "Modèle contractuel altéré"
    );
  });
  it("checks eligibility at the election and rejects impossible calendar dates", () => {
    expect(ageAt("2011-05-22", "2027-05-22")).toBe(16);
    expect(ageAt("2011-05-23", "2027-05-22")).toBe(15);
    expect(ageAt("2000-05-23", "2027-05-22")).toBe(26);
    expect(ageAt("2000-05-22", "2027-05-22")).toBe(27);
    expect(ageAt("2008-02-31", "2027-05-22")).toBe(-1);
  });
});
