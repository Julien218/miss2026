import { describe, expect, it } from "vitest";
import { CANDIDATE_CONTRACT_VERSION, generateCandidateContract2027 } from "./candidateContract2027";

describe("candidate contract 2027", () => {
  it("generates a two-page private-ready PDF with a stable reference", async () => {
    const pdf = await generateCandidateContract2027({
      applicationId: 42,
      firstName: "Camille",
      lastName: "Dupont",
      dateOfBirth: "2008-10-21",
      street: "Rue de la Grande Veine",
      houseNumber: "12",
      postalCode: "7370",
      city: "Dour",
      height: 172,
      weight: 62,
      email: "camille@example.test",
      phone: "0470000000",
      category: "miss",
      candidateSignatureName: "Camille Dupont",
      candidateSignedAt: new Date("2026-09-12T10:00:00Z"),
      guardianFullName: "Alex Dupont",
      guardianEmail: "alex@example.test",
      guardianPhone: "0470000001",
      guardianSignatureName: "Alex Dupont",
      guardianSignedAt: new Date("2026-09-12T10:00:00Z"),
    });

    expect(pdf.subarray(0, 5).toString()).toBe("%PDF-");
    expect(pdf.length).toBeGreaterThan(8_000);
    expect(pdf.toString("latin1").match(/\/Type \/Page\b/g)).toHaveLength(2);
    expect(CANDIDATE_CONTRACT_VERSION).toBe("contract-2027-v1");
  });
});
