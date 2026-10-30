import crypto from "node:crypto";
import type { Express } from "express";
import { and, eq, gt, isNull } from "drizzle-orm";
import { z } from "zod";
import rateLimit from "express-rate-limit";
import { candidateApplications } from "../../drizzle/schema";
import * as db from "../db";
import { sdk } from "../_core/sdk";
import {
  canValidateContracts,
  canAccessApplication,
} from "../helpers/contractAccess";
import { getPublishedContract } from "../helpers/contractStore";
import {
  ageAt,
  MEDIA_CHOICES,
  NO_MEDIA,
  type ContractSnapshot,
} from "../../shared/candidate-contract";
import { escapeEmailHtml as escape } from "../helpers/email-brand";
import { generateCandidateContract2027 } from "../helpers/candidateContract2027";
import { storagePutPrivate } from "../storage";

const hash = (value: string) =>
  crypto.createHash("sha256").update(value).digest("hex");
const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
const acceptance = z.object({
  version: z.string(),
  sha256: z.string(),
  candidateName: z.string().trim().min(3).max(200),
  confirm: z.literal(true),
  eligibility: z.literal(true),
  cgu: z.literal(true),
  newsletter: z.boolean(),
  media: z.object({
    capture: z.boolean(),
    profile: z.boolean(),
    print: z.boolean(),
    social: z.boolean(),
    live: z.boolean(),
    advertising: z.boolean(),
    partners: z.boolean(),
    archives: z.boolean(),
  }),
  guardianName: z.string().trim().max(200).optional(),
  guardianConfirm: z.boolean(),
});
export function registerContractRenewalRoutes(app: Express) {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 40,
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.post(
    "/api/admin/candidate-applications/:id/renewal",
    async (req, res) => {
      let user;
      try {
        user = await sdk.authenticateRequest(req);
      } catch {
        return res.sendStatus(401);
      }
      if (!canValidateContracts(user, req)) return res.sendStatus(403);
      const id = Number(req.params.id);
      if (!Number.isSafeInteger(id) || id <= 0) return res.sendStatus(400);
      try {
        if (!(await getPublishedContract()))
          return res
            .status(409)
            .json({
              error: "Complétez et validez d’abord le modèle contractuel.",
            });
        const application = await db.getCandidateApplicationById(id);
        if (!application) return res.sendStatus(404);
        if (!canAccessApplication(user, application))
          return res.sendStatus(403);
        const contest = await db.getContestById(application.contestId);
        if (contest?.year !== 2027)
          return res
            .status(409)
            .json({ error: "Ce contrat concerne uniquement l’édition 2027." });
        if (
          !application.street ||
          !application.houseNumber ||
          !application.postalCode
        )
          return res
            .status(409)
            .json({
              error:
                "Complétez les coordonnées contractuelles du dossier avant de demander un nouvel accord.",
            });
        if (
          application.status !== "pending" ||
          application.organizationSignedAt
        )
          return res
            .status(409)
            .json({
              error: "Une candidature déjà validée ne peut pas être remplacée.",
            });
        const token = crypto.randomBytes(32).toString("hex"),
          database = await db.getDb();
        if (!database) throw new Error();
        const updated = await database
          .update(candidateApplications)
          .set({
            contractRenewalHash: hash(token),
            contractRenewalExpiresAt: new Date(Date.now() + 7 * 86400_000),
          })
          .where(
            and(
              eq(candidateApplications.id, id),
              eq(candidateApplications.status, "pending"),
              isNull(candidateApplications.organizationSignedAt)
            )
          );
        if (!updated[0].affectedRows)
          return res
            .status(409)
            .json({
              error: "Le dossier vient d’être validé. Actualisez la liste.",
            });
        res.setHeader("Cache-Control", "private, no-store");
        // The UI offers copying a relative, same-origin link; no message is sent.
        res.json({ url: `/contrats/accord/${token}`, expiresInDays: 7 });
      } catch {
        res.status(503).json({ error: "Lien de renouvellement indisponible." });
      }
    }
  );
  app.use("/contrats/accord", limiter, (_req, res, next) => {
    res.setHeader("Cache-Control", "private, no-store");
    res.setHeader("Referrer-Policy", "no-referrer");
    res.setHeader("X-Robots-Tag", "noindex, nofollow");
    next();
  });
  async function lookup(token: string) {
    if (!/^[a-f0-9]{64}$/.test(token)) return null;
    const database = await db.getDb();
    if (!database) throw new Error();
    const [application] = await database
      .select()
      .from(candidateApplications)
      .where(
        and(
          eq(candidateApplications.contractRenewalHash, hash(token)),
          gt(candidateApplications.contractRenewalExpiresAt, new Date()),
          eq(candidateApplications.status, "pending")
        )
      )
      .limit(1);
    return application || null;
  }
  app.get("/contrats/accord/:token", async (req, res) => {
    try {
      const application = await lookup(req.params.token);
      if (!application)
        return res
          .status(410)
          .send(
            "Ce lien est expiré ou a déjà été utilisé. Demandez un nouveau lien à l’organisation."
          );
      const template = await getPublishedContract();
      if (!template) return res.sendStatus(409);
      const minor =
        ageAt(
          new Date(application.dateOfBirth).toISOString().slice(0, 10),
          new Date().toISOString().slice(0, 10)
        ) < 18;
      const nonce = crypto.randomBytes(24).toString("base64url");
      res.setHeader(
        "Content-Security-Policy",
        `default-src 'none'; script-src 'nonce-${nonce}'; style-src 'unsafe-inline'; connect-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'`
      );
      const pages = template.pages
        .map(page =>
          page
            .map(
              p =>
                `<${p.style.startsWith("Heading") ? "h2" : "p"}>${escape(p.text)}</${p.style.startsWith("Heading") ? "h2" : "p"}>`
            )
            .join("")
        )
        .join("<hr>");
      const choices = Object.entries(MEDIA_CHOICES)
        .map(
          ([key, label]) =>
            `<label><input type="checkbox" name="${key}"> ${escape(label)}</label>`
        )
        .join("");
      const guardian = minor
        ? `<h2>Représentant légal</h2><p>Le représentant légal lit le contrat et complète lui-même cette autorisation avec le mineur.</p><label>Nom complet <input name="guardianName" required maxlength="200" value="${escape(application.guardianFullName || "")}"></label><label><input name="guardianConfirm" type="checkbox" required> Je suis le représentant légal habilité, j’autorise la participation et je confirme les seuls choix cochés avec le mineur.</label>`
        : "";
      res
        .type("html")
        .send(
          `<!doctype html><html lang="fr"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Relire et accepter le contrat 2027</title><style>body{font:16px/1.6 system-ui;background:#faf8f2;color:#171719;margin:0}main{max-width:850px;margin:auto;padding:24px}label{display:block;margin:16px 0}input:not([type=checkbox]){display:block;width:95%;padding:12px}button{padding:14px;background:#171719;color:white;cursor:pointer}details{padding:20px;background:white;border:1px solid #c6ac75}h2{font-size:20px}#message{font-weight:bold}</style><main><h1>Accord au contrat Miss & Mister Dour 2027</h1><p>${escape(application.firstName)} ${escape(application.lastName)} — ${escape(template.version)}</p><p>Votre ancienne version est conservée. Ce nouvel accord ne valide pas automatiquement votre candidature.</p><details><summary>Lire le contrat complet et les annexes</summary>${pages}</details><form id="agreement"><h2>Vos choix facultatifs</h2>${choices}<label><input name="newsletter" type="checkbox"> Je souhaite recevoir la newsletter.</label><label>Votre nom complet <input name="candidateName" autocomplete="name" required maxlength="200"></label><label><input name="confirm" type="checkbox" required> J’ai lu et j’accepte cette version du contrat et le règlement identifié dans sa fiche pratique.</label>${guardian}<label><input name="eligibility" type="checkbox" required> Je confirme respecter les critères d’éligibilité indiqués dans le contrat.</label><label><input name="cgu" type="checkbox" required> J’accepte les CGU et j’ai pris connaissance de la notice RGPD.</label><button>Signer ce nouvel accord et transmettre à Olivier</button></form><p id="message" role="status"></p><script nonce="${nonce}">document.getElementById('agreement').addEventListener('submit',async event=>{event.preventDefault();const form=event.target;const button=form.querySelector('button');button.disabled=true;const data=new FormData(form);const keys=${JSON.stringify(Object.keys(NO_MEDIA))};const media=Object.fromEntries(keys.map(key=>[key,data.has(key)]));const payload={version:${JSON.stringify(template.version)},sha256:${JSON.stringify(template.sha256)},candidateName:data.get('candidateName'),confirm:data.has('confirm'),eligibility:data.has('eligibility'),cgu:data.has('cgu'),media,newsletter:data.has('newsletter'),guardianName:data.get('guardianName')||undefined,guardianConfirm:data.has('guardianConfirm')};try{const response=await fetch(location.pathname,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});const body=await response.json();document.getElementById('message').textContent=body.message||body.error;if(response.ok){form.hidden=true;if(body.pdfBase64){const bytes=Uint8Array.from(atob(body.pdfBase64),c=>c.charCodeAt(0));const url=URL.createObjectURL(new Blob([bytes],{type:'application/pdf'}));const link=document.createElement('a');link.href=url;link.download='Mon-contrat-Miss-Mister-Dour-2027.pdf';link.textContent='Télécharger mon exemplaire du contrat';document.getElementById('message').after(link);}}else button.disabled=false;}catch{document.getElementById('message').textContent='Transmission impossible. Réessayez.';button.disabled=false;}});</script></main></html>`
        );
    } catch {
      res.status(503).send("Contrat temporairement indisponible.");
    }
  });
  app.post("/contrats/accord/:token", async (req, res) => {
    const input = acceptance.safeParse(req.body);
    if (!input.success)
      return res
        .status(400)
        .json({ error: "Complétez les accords et les signatures." });
    try {
      const application = await lookup(req.params.token),
        template = await getPublishedContract();
      if (!application || !template)
        return res
          .status(410)
          .json({ error: "Ce lien a expiré ou a déjà été utilisé." });
      if (
        template.version !== input.data.version ||
        template.sha256 !== input.data.sha256
      )
        return res
          .status(409)
          .json({
            error:
              "Le contrat a changé. Rechargez et relisez la nouvelle version.",
          });
      if (
        ![
          `${application.firstName} ${application.lastName}`,
          `${application.lastName} ${application.firstName}`,
        ].some(name => normalize(name) === normalize(input.data.candidateName))
      )
        return res
          .status(400)
          .json({
            error: "Saisissez votre nom complet tel qu’il figure au dossier.",
          });
      const now = new Date(),
        minor =
          ageAt(
            new Date(application.dateOfBirth).toISOString().slice(0, 10),
            now.toISOString().slice(0, 10)
          ) < 18;
      if (
        minor &&
        (!input.data.guardianConfirm ||
          !application.guardianFullName ||
          normalize(input.data.guardianName || "") !==
            normalize(application.guardianFullName))
      )
        return res
          .status(400)
          .json({
            error:
              "L’autorisation du représentant légal identifié au dossier est nécessaire. Contactez Olivier si ses coordonnées ont changé.",
          });
      const snapshot: ContractSnapshot = {
        acceptedAt: now.toISOString(),
        template,
        media: input.data.media,
        newsletter: input.data.newsletter,
        guardianDeclaration: minor && input.data.guardianConfirm,
        publicName: `${application.firstName} ${application.lastName}`,
      };
      const database = await db.getDb();
      if (!database) throw new Error();
      const history = [
        ...JSON.parse(application.contractHistory || "[]"),
        {
          version: application.contractVersion,
          pdfKey: application.contractPdfKey,
          pdfSha256: application.contractPdfSha256,
          snapshot: application.contractSnapshot,
          candidateSignatureName: application.candidateSignatureName,
          candidateSignedAt: application.candidateSignedAt,
          guardianSignatureName: application.guardianSignatureName,
          guardianSignedAt: application.guardianSignedAt,
          consentVersion: application.consentVersion,
          consentedAt: application.consentedAt,
          acceptedMedia: application.acceptedMedia,
          acceptedNewsletter: application.acceptedNewsletter,
          acceptedTerms: application.acceptedTerms,
          acceptedCGU: application.acceptedCGU,
          acceptedEligibility: application.acceptedEligibility,
          renewedAt: now.toISOString(),
        },
      ];
      const updated = await database
        .update(candidateApplications)
        .set({
          contractHistory: JSON.stringify(history),
          contractSnapshot: JSON.stringify(snapshot),
          contractVersion: template.version,
          consentVersion: template.version,
          consentedAt: now,
          candidateSignedAt: now,
          candidateSignatureName: input.data.candidateName,
          guardianSignedAt: minor ? now : null,
          guardianSignatureName: minor ? input.data.guardianName : null,
          contractStatus: "generation_failed",
          contractPdfKey: null,
          contractPdfSha256: null,
          contractRenewalHash: null,
          contractRenewalExpiresAt: null,
          acceptedMedia: snapshot.media.profile ? 1 : 0,
          acceptedNewsletter: snapshot.newsletter ? 1 : 0,
          acceptedTerms: 1,
          acceptedEligibility: 1,
          acceptedCGU: 1,
        })
        .where(
          and(
            eq(candidateApplications.id, application.id),
            eq(
              candidateApplications.contractRenewalHash,
              hash(req.params.token)
            ),
            gt(candidateApplications.contractRenewalExpiresAt, now),
            eq(candidateApplications.status, "pending"),
            isNull(candidateApplications.organizationSignedAt)
          )
        );
      if (!updated[0].affectedRows)
        return res
          .status(409)
          .json({
            error: "Cet accord a déjà été transmis ou le dossier a changé.",
          });
      let pdfBase64: string | undefined;
      try {
        const pdf = await generateCandidateContract2027({
          ...application,
          height: application.height || 0,
          weight: application.weight || 0,
          street: application.street || "",
          houseNumber: application.houseNumber || "",
          postalCode: application.postalCode || "",
          phone: application.phone || "",
          category: application.category as "miss" | "mister",
          candidateSignatureName: input.data.candidateName,
          candidateSignedAt: now,
          guardianSignedAt: minor ? now : null,
          guardianSignatureName: minor ? input.data.guardianName : null,
          applicationId: application.id,
          snapshot,
        });
        const key = `candidate-contracts/2027/${application.id}-${crypto.randomUUID()}.pdf`;
        await storagePutPrivate(key, pdf, "application/pdf");
        await db.updateCandidateApplicationContract(
          application.id,
          {
            contractPdfKey: key,
            contractPdfSha256: crypto
              .createHash("sha256")
              .update(pdf)
              .digest("hex"),
            contractStatus: minor ? "guardian_signed" : "candidate_signed",
          },
          JSON.stringify(snapshot)
        );
        pdfBase64 = pdf.toString("base64");
      } catch {
        /* Positive act retained; Olivier can retry PDF generation. */
      }
      res.json({
        success: true,
        pdfBase64,
        message:
          "Votre nouvel accord est enregistré. Le contrat attend désormais la validation d’Olivier dans le Cockpit." +
          (pdfBase64
            ? " Téléchargez votre exemplaire ci-dessous."
            : " Contactez l’organisation pour recevoir votre exemplaire ; le PDF doit être régénéré."),
      });
    } catch {
      res
        .status(503)
        .json({ error: "Transmission momentanément indisponible. Réessayez." });
    }
  });
}
