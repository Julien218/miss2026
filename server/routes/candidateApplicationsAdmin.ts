import crypto from "node:crypto";
import type { Express, Request, Response } from "express";
import { sdk } from "../_core/sdk";
import * as db from "../db";
import { generateCandidateContract2027 } from "../helpers/candidateContract2027";
import { storageGetPrivate, storagePutPrivate } from "../storage";
import {
  canReadContracts,
  canValidateContracts,
  canAccessApplication,
} from "../helpers/contractAccess";
import {
  ORGANIZER_NAME,
  ageAt,
  type ContractSnapshot,
} from "../../shared/candidate-contract";

async function requireAdmin(req: Request, res: Response) {
  try {
    const user = await sdk.authenticateRequest(req);
    if (!canReadContracts(user)) {
      res.status(403).json({ error: "Accès administrateur requis" });
      return null;
    }
    return user;
  } catch {
    res.status(401).json({ error: "Authentification requise" });
    return null;
  }
}

function contractDataFromApplication(
  application: NonNullable<
    Awaited<ReturnType<typeof db.getCandidateApplicationById>>
  >,
  organization?: { name: string; signedAt: Date }
) {
  if (
    !application.street ||
    !application.houseNumber ||
    !application.postalCode ||
    !application.candidateSignatureName ||
    !application.candidateSignedAt ||
    (application.category !== "miss" && application.category !== "mister")
  ) {
    throw new Error(
      "Ce dossier ne contient pas encore toutes les données contractuelles 2027."
    );
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
    height: application.height || 0,
    weight: application.weight || 0,
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
    organizationSignatureName:
      organization?.name || application.organizationSignatureName,
    organizationSignedAt:
      organization?.signedAt || application.organizationSignedAt,
    snapshot: application.contractSnapshot
      ? (JSON.parse(application.contractSnapshot) as ContractSnapshot)
      : undefined,
  };
}

export function registerCandidateApplicationAdminRoutes(app: Express) {
  app.post(
    "/api/admin/candidate-applications/:id/regenerate-contract",
    async (req, res) => {
      const user = await requireAdmin(req, res);
      if (!user) return;
      if (!canValidateContracts(user, req)) return res.sendStatus(403);
      const id = Number(req.params.id);
      if (!Number.isSafeInteger(id) || id <= 0) return res.sendStatus(400);
      try {
        const application = await db.getCandidateApplicationById(id);
        if (!application) return res.sendStatus(404);
        if (!canAccessApplication(user, application))
          return res.sendStatus(403);
        if (
          application.status !== "pending" ||
          application.organizationSignedAt ||
          application.contractStatus === "completed"
        )
          return res
            .status(409)
            .json({ error: "Un contrat validé ne peut être régénéré." });
        if (!application.contractSnapshot)
          return res
            .status(409)
            .json({
              error: "Ancienne version : un nouvel accord est nécessaire.",
            });
        const pdf = await generateCandidateContract2027(
          contractDataFromApplication(application)
        );
        const key = `candidate-contracts/2027/${id}-${crypto.randomUUID()}.pdf`;
        await storagePutPrivate(key, pdf, "application/pdf");
        const updated = await db.updateCandidateApplicationContract(
          id,
          {
            contractPdfKey: key,
            contractPdfSha256: crypto
              .createHash("sha256")
              .update(pdf)
              .digest("hex"),
            contractStatus: application.guardianSignedAt
              ? "guardian_signed"
              : "candidate_signed",
          },
          application.contractSnapshot
        );
        res.json({ application: updated });
      } catch (error) {
        res
          .status(400)
          .json({
            error:
              error instanceof Error ? error.message : "Génération impossible.",
          });
      }
    }
  );
  app.get("/api/admin/candidate-applications/:id/photo", async (req, res) => {
    const user = await requireAdmin(req, res);
    if (!user) return;
    const id = Number(req.params.id);
    if (!Number.isSafeInteger(id) || id <= 0) return res.sendStatus(400);
    try {
      const application = await db.getCandidateApplicationById(id);
      if (!application) return res.sendStatus(404);
      if (!canAccessApplication(user, application)) return res.sendStatus(403);
      if (!application.profilePhoto?.startsWith("private:"))
        return res.sendStatus(404);
      const photo = await storageGetPrivate(application.profilePhoto.slice(8));
      res.setHeader("Cache-Control", "private, no-store");
      res.type("image/webp").send(photo.data);
    } catch {
      res.sendStatus(503);
    }
  });
  app.get("/api/admin/candidate-applications", async (req, res) => {
    const user = await requireAdmin(req, res);
    if (!user) return;

    try {
      const contestIdRaw =
        typeof req.query.contestId === "string"
          ? Number(req.query.contestId)
          : undefined;
      const contestId =
        contestIdRaw && Number.isFinite(contestIdRaw)
          ? contestIdRaw
          : undefined;
      const applications = await db.getAllCandidateApplications(
        contestId,
        user.organizationId
      );
      res.setHeader("Cache-Control", "private, no-store");
      res.json({ applications, canValidate: canValidateContracts(user, req) });
    } catch (error) {
      console.error("[CandidateApplications] list failed", error);
      res.status(500).json({ error: "Impossible de charger les candidatures" });
    }
  });

  app.get(
    "/api/admin/candidate-applications/:id/contract",
    async (req, res) => {
      const user = await requireAdmin(req, res);
      if (!user) return;

      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id <= 0)
        return res
          .status(400)
          .json({ error: "Identifiant de candidature invalide" });

      try {
        const application = await db.getCandidateApplicationById(id);
        if (!application)
          return res.status(404).json({ error: "Candidature non trouvée" });
        if (!canAccessApplication(user, application))
          return res.sendStatus(403);
        if (!application.contractPdfKey)
          return res
            .status(404)
            .json({ error: "Le PDF contractuel n’a pas encore été généré" });
        const contract = await storageGetPrivate(application.contractPdfKey);
        res.setHeader(
          "Content-Type",
          contract.contentType === "application/pdf"
            ? contract.contentType
            : "application/pdf"
        );
        res.setHeader(
          "Content-Disposition",
          `inline; filename="contrat-candidat-${application.id}.pdf"`
        );
        res.setHeader("Cache-Control", "private, no-store");
        return res.send(contract.data);
      } catch (error) {
        console.error("[CandidateApplications] contract access failed", error);
        return res
          .status(500)
          .json({ error: "Impossible d’ouvrir le contrat" });
      }
    }
  );

  app.post(
    "/api/admin/candidate-applications/:id/sign-contract",
    async (req, res) => {
      const user = await requireAdmin(req, res);
      if (!user) return;
      if (!canValidateContracts(user, req))
        return res
          .status(403)
          .json({ error: "Validation réservée à Olivier depuis le Cockpit." });

      const id = Number(req.params.id);
      const signatureName =
        typeof req.body?.signatureName === "string"
          ? req.body.signatureName.trim()
          : "";
      if (!Number.isInteger(id) || id <= 0)
        return res
          .status(400)
          .json({ error: "Identifiant de candidature invalide" });
      if (
        req.body?.confirm !== true ||
        signatureName.length < 3 ||
        signatureName.length > 200
      ) {
        return res
          .status(400)
          .json({
            error:
              "Saisissez le nom complet du signataire et confirmez la signature",
          });
      }

      try {
        const application = await db.getCandidateApplicationById(id);
        if (!application)
          return res.status(404).json({ error: "Candidature non trouvée" });
        if (!canAccessApplication(user, application))
          return res.sendStatus(403);
        if (!application.contractSnapshot)
          return res
            .status(409)
            .json({
              error:
                "Ancienne version : un nouvel accord du candidat est nécessaire. Le document déjà accepté est conservé.",
            });
        if (signatureName !== ORGANIZER_NAME)
          return res
            .status(400)
            .json({ error: "Le signataire doit être Olivier TREVIS." });
        if (
          application.organizationSignedAt ||
          application.contractStatus === "completed"
        )
          return res
            .status(409)
            .json({
              error: "Ce contrat est déjà validé et ne peut être remplacé.",
            });
        if (
          req.body?.expectedSha256 !== application.contractPdfSha256 ||
          !application.contractPdfSha256
        )
          return res
            .status(409)
            .json({
              error: "Ouvrez le PDF à jour avant de confirmer sa validation.",
            });
        const snapshot = JSON.parse(
          application.contractSnapshot
        ) as ContractSnapshot;
        const signedDate = application.candidateSignedAt
          ?.toISOString()
          .slice(0, 10);
        const birthDate = new Date(application.dateOfBirth)
          .toISOString()
          .slice(0, 10);
        if (
          !signedDate ||
          (ageAt(birthDate, signedDate) < 18 &&
            (!snapshot.guardianDeclaration ||
              !application.guardianSignedAt ||
              !application.guardianSignatureName))
        )
          return res
            .status(409)
            .json({
              error: "L’accord du candidat ou du représentant légal manque.",
            });
        if (application.status !== "pending")
          return res
            .status(409)
            .json({
              error: "Seule une candidature en attente peut encore être signée",
            });
        const signedAt = new Date();
        const contract = await generateCandidateContract2027(
          contractDataFromApplication(application, {
            name: signatureName,
            signedAt,
          })
        );
        const contractKey = `candidate-contracts/2027/final/${application.id}-${crypto.randomUUID()}.pdf`;
        await storagePutPrivate(contractKey, contract, "application/pdf");
        const updated = await db.finalizeCandidateContract(
          application.id,
          application.contractPdfSha256,
          {
            contractPdfKey: contractKey,
            contractPdfSha256: crypto
              .createHash("sha256")
              .update(contract)
              .digest("hex"),
            contractStatus: "completed",
            organizationSignatureName: signatureName,
            organizationSignedAt: signedAt,
            organizationSignedBy: user.id,
          }
        );
        return res.json({
          success: true,
          application: updated,
          url: `/api/admin/candidate-applications/${application.id}/contract`,
        });
      } catch (error) {
        console.error(
          "[CandidateApplications] contract signature failed",
          error
        );
        return res
          .status(400)
          .json({
            error:
              error instanceof Error
                ? error.message
                : "Signature du contrat impossible",
          });
      }
    }
  );

  app.post(
    "/api/admin/candidate-applications/:id/approve",
    async (req, res) => {
      const user = await requireAdmin(req, res);
      if (!user) return;
      if (!canValidateContracts(user, req))
        return res
          .status(403)
          .json({ error: "Validation réservée à Olivier depuis le Cockpit." });

      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id <= 0) {
        return res
          .status(400)
          .json({ error: "Identifiant de candidature invalide" });
      }

      try {
        const application = await db.getCandidateApplicationById(id);
        if (!application) return res.sendStatus(404);
        if (!canAccessApplication(user, application))
          return res.sendStatus(403);
        if (
          !application.contractSnapshot ||
          !application.organizationSignedBy ||
          !application.contractPdfKey ||
          !application.contractPdfSha256 ||
          application.contractStatus !== "completed"
        )
          return res
            .status(409)
            .json({
              error:
                "Le contrat à jour doit être accepté puis validé par Olivier avant la création du candidat.",
            });
        const result = await db.approveCandidateApplication(id, user.id);
        res.json(result);
      } catch (error) {
        console.error("[CandidateApplications] approve failed", error);
        res
          .status(400)
          .json({
            error:
              error instanceof Error ? error.message : "Validation impossible",
          });
      }
    }
  );

  app.post("/api/admin/candidate-applications/:id/reject", async (req, res) => {
    const user = await requireAdmin(req, res);
    if (!user) return;
    if (!canValidateContracts(user, req)) return res.sendStatus(403);

    const id = Number(req.params.id);
    const reason =
      typeof req.body?.reason === "string" ? req.body.reason.trim() : "";
    if (!Number.isInteger(id) || id <= 0) {
      return res
        .status(400)
        .json({ error: "Identifiant de candidature invalide" });
    }
    if (!reason || reason.length > 1000) {
      return res
        .status(400)
        .json({
          error: "Un motif de refus est requis (1000 caractères maximum)",
        });
    }

    try {
      const application = await db.getCandidateApplicationById(id);
      if (!application) return res.sendStatus(404);
      if (!canAccessApplication(user, application)) return res.sendStatus(403);
      if (application.status !== "pending")
        return res
          .status(409)
          .json({ error: "Cette candidature a déjà été examinée." });
      const result = await db.rejectCandidateApplication(id, user.id, reason);
      res.json(result);
    } catch (error) {
      console.error("[CandidateApplications] reject failed", error);
      res
        .status(400)
        .json({
          error: error instanceof Error ? error.message : "Refus impossible",
        });
    }
  });
}
