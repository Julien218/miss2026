import { describe, it, expect, beforeAll, afterAll } from "vitest";
import * as db from "./db";
import crypto from "crypto";

describe("Candidate Onboarding System", () => {
  let testToken: string;
  let testInvitationId: number;
  let testApplicationId: number;

  beforeAll(async () => {
    // Créer une invitation de test
    testToken = crypto.randomBytes(32).toString("hex");
    const invitation = await db.createInvitation({
      role: "candidat",
      email: "test-candidate@example.com",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours
      maxUses: 1,
      createdBy: 1, // Admin user
      token: testToken,
    });
    testInvitationId = invitation.id;
  });

  afterAll(async () => {
    // Nettoyer les données de test
    if (testApplicationId) {
      await db.deleteCandidateApplication(testApplicationId);
    }
    if (testInvitationId) {
      await db.deactivateInvitation(testInvitationId);
    }
  });

  describe("validateToken", () => {
    it("devrait valider un token actif et non expiré", async () => {
      const invitation = await db.getInvitationByToken(testToken);
      
      expect(invitation).toBeDefined();
      expect(invitation?.token).toBe(testToken);
      expect(invitation?.role).toBe("candidat");
      expect(invitation?.isActive).toBe(1); // MySQL retourne INT
      expect(invitation?.email).toBe("test-candidate@example.com");
    });

    it("devrait rejeter un token inexistant", async () => {
      const fakeToken = "fake-token-that-does-not-exist";
      const invitation = await db.getInvitationByToken(fakeToken);
      
      expect(invitation).toBeNull();
    });

    it("devrait rejeter un token expiré", async () => {
      // Créer une invitation expirée
      const expiredToken = crypto.randomBytes(32).toString("hex");
      const expiredInvitation = await db.createInvitation({
        role: "candidat",
        email: "expired@example.com",
        expiresAt: new Date(Date.now() - 1000), // Expiré il y a 1 seconde
        maxUses: 1,
        createdBy: 1,
        token: expiredToken,
      });

      const invitation = await db.getInvitationByToken(expiredToken);
      const isExpired = invitation && invitation.expiresAt && new Date(invitation.expiresAt) < new Date();
      
      expect(isExpired).toBe(true);

      // Nettoyer
      await db.deactivateInvitation(expiredInvitation.id);
    });

    it("devrait rejeter un token désactivé", async () => {
      // Créer et désactiver une invitation
      const inactiveToken = crypto.randomBytes(32).toString("hex");
      const inactiveInvitation = await db.createInvitation({
        role: "candidat",
        email: "inactive@example.com",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        maxUses: 1,
        createdBy: 1,
        token: inactiveToken,
      });

      await db.deactivateInvitation(inactiveInvitation.id);

      const invitation = await db.getInvitationByToken(inactiveToken);
      
      expect(invitation?.isActive).toBe(0); // MySQL retourne INT
    });

    it("devrait rejeter un token qui a atteint maxUses", async () => {
      // Créer une invitation avec maxUses=1
      const maxUsesToken = crypto.randomBytes(32).toString("hex");
      const maxUsesInvitation = await db.createInvitation({
        role: "candidat",
        email: "maxuses@example.com",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        maxUses: 1,
        createdBy: 1,
        token: maxUsesToken,
      });

      // Incrémenter usedCount pour atteindre maxUses
      await db.incrementInvitationUsedCount(maxUsesInvitation.id);

      const invitation = await db.getInvitationByToken(maxUsesToken);
      const isExhausted = invitation && invitation.maxUses && (invitation.usedCount || 0) >= invitation.maxUses;
      
      expect(isExhausted).toBe(true);

      // Nettoyer
      await db.deactivateInvitation(maxUsesInvitation.id);
    });
  });

  describe("submitOnboarding", () => {
    it("devrait créer une candidature avec toutes les données requises", async () => {
      const applicationData = {
        invitationToken: testToken,
        email: "test-candidate@example.com",
        firstName: "Jean",
        lastName: "Dupont",
        dateOfBirth: new Date("1995-05-15"),
        phone: "+32 475 12 34 56",
        address: "Rue de la Paix 123",
        city: "Dour",
        postalCode: "7370",
        country: "Belgique",
        region: "Wallonie",
        category: "miss",
        photoProfile: "https://example.com/photo.jpg",
        photoFullBody: "https://example.com/fullbody.jpg",
        videoPresentation: "https://example.com/video.mp4",
        bio: "Je suis passionnée par la mode et le chant.",
        motivation: "Je veux représenter ma région et promouvoir la diversité.",
        interests: "Mode, chant, danse, photographie",
        profession: "Étudiante en communication",
        instagram: "@jeandupont",
        facebook: "Jean Dupont",
        tiktok: "@jeandupont",
        linkedin: "Jean Dupont",
        acceptedTerms: true,
        acceptedMedia: true,
        acceptedNewsletter: true,
        ipAddress: "192.168.1.1",
      };

      const application = await db.createCandidateApplication(applicationData);
      testApplicationId = application.id;

      expect(application).toBeDefined();
      expect(application.email).toBe("test-candidate@example.com");
      expect(application.firstName).toBe("Jean");
      expect(application.lastName).toBe("Dupont");
      expect(application.category).toBe("miss");
      expect(application.status).toBe("pending");
      expect(application.ipAddressHash).toBeDefined(); // IP hashée pour RGPD
    });

    it("devrait lier l'invitation à la candidature", async () => {
      const invitation = await db.getInvitationByToken(testToken);
      
      expect(invitation?.candidateApplicationId).toBe(testApplicationId);
    });

    it("devrait hasher l'adresse IP pour RGPD", async () => {
      const application = await db.getCandidateApplicationById(testApplicationId);
      
      expect(application?.ipAddressHash).toBeDefined();
      expect(application?.ipAddressHash).not.toBe("192.168.1.1"); // IP hashée, pas en clair
      expect(application?.ipAddressHash?.length).toBe(64); // SHA256 = 64 caractères hex
    });
  });

  describe("approveApplication", () => {
    it("devrait approuver une candidature et créer un profil candidat", async () => {
      // Approuver la candidature
      await db.approveCandidateApplication(testApplicationId, 1); // Admin user ID = 1

      const application = await db.getCandidateApplicationById(testApplicationId);
      
      expect(application?.status).toBe("approved");
      expect(application?.reviewedBy).toBe(1);
      expect(application?.reviewedAt).toBeDefined();
    });

    it("devrait créer un candidat dans la table candidates après approbation", async () => {
      const application = await db.getCandidateApplicationById(testApplicationId);
      
      // Vérifier que candidateId est défini (lien vers table candidates)
      expect(application?.candidateId).toBeDefined();
      
      // Récupérer le candidat créé
      if (application?.candidateId) {
        const candidate = await db.getCandidateById(application.candidateId);
        
        expect(candidate).toBeDefined();
        expect(candidate?.firstName).toBe("Jean");
        expect(candidate?.lastName).toBe("Dupont");
        expect(candidate?.email).toBe("test-candidate@example.com");
      }
    });
  });

  describe("rejectApplication", () => {
    it("devrait rejeter une candidature avec motif", async () => {
      // Créer une nouvelle candidature pour test de rejet
      const rejectToken = crypto.randomBytes(32).toString("hex");
      const rejectInvitation = await db.createInvitation({
        role: "candidat",
        email: "reject-test@example.com",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        maxUses: 1,
        createdBy: 1,
        token: rejectToken,
      });

      const rejectApplication = await db.createCandidateApplication({
        invitationToken: rejectToken,
        email: "reject-test@example.com",
        firstName: "Marie",
        lastName: "Martin",
        dateOfBirth: new Date("1998-08-20"),
        phone: "+32 475 98 76 54",
        address: "Rue du Test 456",
        city: "Dour",
        postalCode: "7370",
        country: "Belgique",
        region: "Wallonie",
        category: "mister",
        photoProfile: "https://example.com/marie.jpg",
        photoFullBody: "https://example.com/marie-full.jpg",
        bio: "Test bio",
        acceptedTerms: true,
        ipAddress: "192.168.1.2",
      });

      // Rejeter la candidature
      const rejectionReason = "Photos de mauvaise qualité";
      await db.rejectCandidateApplication(rejectApplication.id, 1, rejectionReason);

      const application = await db.getCandidateApplicationById(rejectApplication.id);
      
      expect(application?.status).toBe("rejected");
      expect(application?.reviewedBy).toBe(1);
      expect(application?.reviewedAt).toBeDefined();
      expect(application?.rejectionReason).toBe(rejectionReason);

      // Nettoyer
      await db.deleteCandidateApplication(rejectApplication.id);
      await db.deactivateInvitation(rejectInvitation.id);
    });
  });

  describe("RGPD Compliance", () => {
    it("devrait stocker les consentements (terms, media, newsletter)", async () => {
      const application = await db.getCandidateApplicationById(testApplicationId);
      
      expect(application?.acceptedTerms).toBe(1); // MySQL retourne INT
      expect(application?.acceptedMedia).toBe(1);
      expect(application?.acceptedNewsletter).toBe(1);
    });

    it("devrait hasher l'IP avec SHA256", async () => {
      const application = await db.getCandidateApplicationById(testApplicationId);
      const ipHash = application?.ipAddressHash;
      
      expect(ipHash).toBeDefined();
      expect(ipHash?.length).toBe(64); // SHA256 = 64 caractères hex
      expect(/^[a-f0-9]{64}$/.test(ipHash || "")).toBe(true); // Format hex valide
    });
  });
});
