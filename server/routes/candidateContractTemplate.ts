import type { Express } from "express";
import { z } from "zod";
import { sdk } from "../_core/sdk";
import {
  canReadContracts,
  canValidateContracts,
} from "../helpers/contractAccess";
import {
  draftContract,
  publishTemplate,
} from "../helpers/candidateContractTemplate";
import {
  getPublishedContract,
  savePublishedContract,
} from "../helpers/contractStore";
import {
  CONTRACT_SETUP_FIELDS,
  NO_MEDIA,
  type ContractTemplate,
} from "../../shared/candidate-contract";
import { generateCandidateContract2027 } from "../helpers/candidateContract2027";

function preview(template: ContractTemplate) {
  return generateCandidateContract2027({
    applicationId: 0,
    firstName: "À renseigner",
    lastName: "À renseigner",
    dateOfBirth: "2000-01-01",
    street: "À renseigner",
    houseNumber: "",
    postalCode: "",
    city: "",
    height: 0,
    weight: 0,
    email: "",
    phone: "",
    category: "miss",
    candidateSignatureName: "En attente",
    candidateSignedAt: undefined as unknown as Date,
    snapshot: {
      template,
      media: NO_MEDIA,
      newsletter: false,
      guardianDeclaration: false,
      publicName: "À renseigner",
    },
  });
}
export function registerCandidateContractTemplateRoutes(app: Express) {
  app.post(
    "/api/admin/candidate-contract-template/preview",
    async (req, res) => {
      let user;
      try {
        user = await sdk.authenticateRequest(req);
      } catch {
        return res.sendStatus(401);
      }
      if (!canValidateContracts(user, req)) return res.sendStatus(403);
      const input = z
        .object({
          values: z
            .array(z.string().trim().min(3).max(4000))
            .length(CONTRACT_SETUP_FIELDS.length),
        })
        .safeParse(req.body);
      if (!input.success)
        return res
          .status(400)
          .json({
            error:
              "Complétez toutes les rubriques pour prévisualiser le modèle.",
          });
      try {
        const pdf = await preview(publishTemplate(input.data.values, user.id));
        res.setHeader("Cache-Control", "private, no-store");
        res.type("application/pdf").send(pdf);
      } catch (error) {
        res
          .status(400)
          .json({
            error:
              error instanceof Error ? error.message : "Aperçu indisponible.",
          });
      }
    }
  );
  app.get("/api/public/candidate-contract", async (_req, res) => {
    res.setHeader("Cache-Control", "no-store");
    try {
      const template = await getPublishedContract();
      res.json({ ready: Boolean(template), template });
    } catch {
      res
        .status(503)
        .json({ error: "Le contrat est temporairement indisponible." });
    }
  });
  app.get("/api/public/candidate-contract/pdf", async (req, res) => {
    res.setHeader("Cache-Control", "no-store");
    try {
      const template = await getPublishedContract();
      if (!template)
        return res
          .status(409)
          .json({
            error:
              "Le modèle doit encore être complété et validé par l’organisation.",
          });
      if (req.query.version && req.query.version !== template.version)
        return res
          .status(409)
          .json({
            error:
              "Le modèle a changé. Relisez sa nouvelle version avant acceptation.",
          });
      const pdf = await preview(template);
      res.type("application/pdf").send(pdf);
    } catch {
      res.status(503).json({ error: "Aperçu indisponible." });
    }
  });
  app.get("/api/admin/candidate-contract-template", async (req, res) => {
    try {
      const user = await sdk.authenticateRequest(req);
      if (!canReadContracts(user)) return res.sendStatus(403);
      res.setHeader("Cache-Control", "private, no-store");
      res.json({
        template: await getPublishedContract(),
        fields: CONTRACT_SETUP_FIELDS,
        draft: draftContract,
        canValidate: canValidateContracts(user, req),
      });
    } catch {
      res.status(401).json({ error: "Connexion Cockpit requise." });
    }
  });
  app.post("/api/admin/candidate-contract-template", async (req, res) => {
    let user;
    try {
      user = await sdk.authenticateRequest(req);
    } catch {
      return res.sendStatus(401);
    }
    if (!canValidateContracts(user, req))
      return res
        .status(403)
        .json({
          error:
            "Seul Olivier connecté depuis le Cockpit peut valider le modèle.",
        });
    const input = z
      .object({
        values: z
          .array(z.string().trim().min(3).max(4000))
          .length(CONTRACT_SETUP_FIELDS.length),
        confirm: z.literal(true),
      })
      .safeParse(req.body);
    if (!input.success)
      return res
        .status(400)
        .json({
          error:
            "Complétez la fiche pratique et confirmez la validation du modèle.",
        });
    try {
      const template = publishTemplate(input.data.values, user.id);
      await savePublishedContract(template);
      res.json({ success: true, template });
    } catch (error) {
      res
        .status(400)
        .json({
          error:
            error instanceof Error ? error.message : "Publication impossible.",
        });
    }
  });
}
