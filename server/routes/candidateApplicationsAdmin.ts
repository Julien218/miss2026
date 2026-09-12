import crypto from "node:crypto";
import type { Express, Request, Response } from "express";
import { sdk } from "../_core/sdk";
import * as db from "../db";
import { generateCandidateContract2027 } from "../helpers/candidateContract2027";
import { storageGetPrivate, storagePutPrivate } from "../storage";

function canManageApplications(role: string | null | undefined) {
  return role === "admin" || role === "super_admin" || role === "owner" || role === "organizer";
}

async function requireAdmin(req: Request, res: Response) {
  try {
    const user = await sdk.authenticateRequest(req);
    if (!canManageApplications(user.role)) {
      res.status(403).json({ error: "Accès administrateur requis" });
      return null;
    }
    return user;
  } catch {
    res.status(401).json({ error: "Authentification requise" });
    return null;
  }
}

function contractDataFromApplication(application: NonNullable<Awaited<ReturnType<typeof db.getCandidateApplicationById>>>, organization?: { name: string; signedAt: Date }) {
  if (
    !application.street
    || !application.houseNumber
    || !application.postalCode
    || !application.height
    || !application.weight
    || !application.candidateSignatureName
    || !application.candidateSignedAt
    || (application.category !== "miss" && application.category !== "mister")
  ) {
    throw new Error("Ce dossier ne contient pas encore toutes les données contractuelles 2027.");
  }

  return {
    applicationId: application.id,
    firstName: application.firstName,
    lastName: application.lastName,
    dateOfBirth: application.dateOfBirth,
    street: application.street,
    houseNumber: application.houseNumber,
    postalCode: application.postalCode,
    city: application.city,
    height: application.height,
    weight: application.weight,
    email: application.email,
    phone: application.phone || "—",
    category: application.category,
    candidateSignatureName: application.candidateSignatureName,
    candidateSignedAt: application.candidateSignedAt,
    guardianFullName: application.guardianFullName,
    guardianEmail: application.guardianEmail,
    guardianPhone: application.guardianPhone,
    guardianSignatureName: application.guardianSignatureName,
    guardianSignedAt: application.guardianSignedAt,
    organizationSignatureName: organization?.name || application.organizationSignatureName,
    organizationSignedAt: organization?.signedAt || application.organizationSignedAt,
  };
}

export function registerCandidateApplicationAdminRoutes(app: Express) {
  app.get("/api/admin/candidate-applications", async (req, res) => {
    const user = await requireAdmin(req, res);
    if (!user) return;

    try {
      const contestIdRaw = typeof req.query.contestId === "string" ? Number(req.query.contestId) : undefined;
      const contestId = contestIdRaw && Number.isFinite(contestIdRaw) ? contestIdRaw : undefined;
      const applications = await db.getAllCandidateApplications(contestId);
      res.json({ applications });
    } catch (error) {
      console.error("[CandidateApplications] list failed", error);
      res.status(500).json({ error: "Impossible de charger les candidatures" });
    }
  });

  app.get("/api/admin/candidate-applications/:id/contract", async (req, res) => {
    const user = await requireAdmin(req, res);
    if (!user) return;

    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: "Identifiant de candidature invalide" });

    try {
      const application = await db.getCandidateApplicationById(id);
      if (!application) return res.status(404).json({ error: "Candidature non trouvée" });
      if (!application.contractPdfKey) return res.status(404).json({ error: "Le PDF contractuel n’a pas encore été généré" });
      const contract = await storageGetPrivate(application.contractPdfKey, 15 * 60);
      return res.json({ url: contract.url, expiresIn: 900, status: application.contractStatus });
    } catch (error) {
      console.error("[CandidateApplications] contract access failed", error);
      return res.status(500).json({ error: "Impossible d’ouvrir le contrat" });
    }
  });

  app.post("/api/admin/candidate-applications/:id/sign-contract", async (req, res) => {
    const user = await requireAdmin(req, res);
    if (!user) return;

    const id = Number(req.params.id);
    const signatureName = typeof req.body?.signatureName === "string" ? req.body.signatureName.trim() : "";
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: "Identifiant de candidature invalide" });
    if (req.body?.confirm !== true || signatureName.length < 3 || signatureName.length > 200) {
      return res.status(400).json({ error: "Saisissez le nom complet du signataire et confirmez la signature" });
    }

    try {
      const application = await db.getCandidateApplicationById(id);
      if (!application) return res.status(404).json({ error: "Candidature non trouvée" });
      if (application.status !== "pending") return res.status(409).json({ error: "Seule une candidature en attente peut encore être signée" });
      const signedAt = new Date();
      const contract = await generateCandidateContract2027(contractDataFromApplication(application, { name: signatureName, signedAt }));
      const contractKey = `candidate-contracts/2027/final/${application.id}-${crypto.randomUUID()}.pdf`;
      await storagePutPrivate(contractKey, contract, "application/pdf");
      const updated = await db.updateCandidateApplicationContract(application.id, {
        contractPdfKey: contractKey,
        contractPdfSha256: crypto.createHash("sha256").update(contract).digest("hex"),
        contractStatus: "completed",
        organizationSignatureName: signatureName,
        organizationSignedAt: signedAt,
      });
      const access = await storageGetPrivate(contractKey, 15 * 60);
      return res.json({ success: true, application: updated, url: access.url, expiresIn: 900 });
    } catch (error) {
      console.error("[CandidateApplications] contract signature failed", error);
      return res.status(400).json({ error: error instanceof Error ? error.message : "Signature du contrat impossible" });
    }
  });

  app.post("/api/admin/candidate-applications/:id/approve", async (req, res) => {
    const user = await requireAdmin(req, res);
    if (!user) return;

    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "Identifiant de candidature invalide" });
    }

    try {
      const result = await db.approveCandidateApplication(id, user.id);
      res.json(result);
    } catch (error) {
      console.error("[CandidateApplications] approve failed", error);
      res.status(400).json({ error: error instanceof Error ? error.message : "Validation impossible" });
    }
  });

  app.post("/api/admin/candidate-applications/:id/reject", async (req, res) => {
    const user = await requireAdmin(req, res);
    if (!user) return;

    const id = Number(req.params.id);
    const reason = typeof req.body?.reason === "string" ? req.body.reason.trim() : "";
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "Identifiant de candidature invalide" });
    }
    if (!reason || reason.length > 1000) {
      return res.status(400).json({ error: "Un motif de refus est requis (1000 caractères maximum)" });
    }

    try {
      const result = await db.rejectCandidateApplication(id, user.id, reason);
      res.json(result);
    } catch (error) {
      console.error("[CandidateApplications] reject failed", error);
      res.status(400).json({ error: error instanceof Error ? error.message : "Refus impossible" });
    }
  });
}
