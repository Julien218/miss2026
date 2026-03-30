/**
 * candidateProfile.ts
 * Gestion des profils publics candidats et des liens de remplissage partageable
 *
 * Fonctionnalités :
 * - Admin : générer un token unique par candidat (lien partageable)
 * - Candidat : remplir son profil via le lien unique (sans connexion requise)
 * - Public : consulter le profil public d'un candidat
 */

import { publicProcedure, protectedProcedure, router } from "../\_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getDb } from "../db";
import { candidates, profileEditTokens, contests, users } from "../../drizzle/schema";
import { dispatchNotification } from "./notifications";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";
import { ENV } from "../\_core/env";

// ─── Helper : Envoi email via Forge API ──────────────────────────────────────
async function sendEmailViaForge(to: string, subject: string, htmlBody: string): Promise<boolean> {
  if (!ENV.forgeApiUrl || !ENV.forgeApiKey) return false;
  try {
    const baseUrl = ENV.forgeApiUrl.endsWith("/") ? ENV.forgeApiUrl : `${ENV.forgeApiUrl}/`;
    const endpoint = new URL("webdevtoken.v1.WebDevService/SendEmail", baseUrl).toString();
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1",
      },
      body: JSON.stringify({ to, subject, html: htmlBody }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// ─── Helper : Générer le HTML de l'email de profil ───────────────────────────
function buildProfileEmailHtml(firstName: string, lastName: string, profileLink: string): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#111;border-radius:16px;border:1px solid #D4AF37;overflow:hidden;max-width:600px;">
        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#1a1a1a,#2a2a1a);padding:40px;text-align:center;border-bottom:2px solid #D4AF37;">
          <p style="color:#D4AF37;font-size:14px;letter-spacing:4px;text-transform:uppercase;margin:0 0 8px;">MISS &amp; MISTER DOUR 2026</p>
          <h1 style="color:#fff;font-size:28px;margin:0;font-weight:700;">Complétez votre profil</h1>
          <p style="color:#aaa;font-size:14px;margin:12px 0 0;">Centre Sportif d'Elouges · 19 Avril 2026</p>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:40px;">
          <p style="color:#e0e0e0;font-size:16px;margin:0 0 16px;">Bonjour <strong style="color:#D4AF37;">${firstName} ${lastName}</strong>,</p>
          <p style="color:#ccc;font-size:15px;line-height:1.7;margin:0 0 24px;">
            Félicitations pour votre inscription au concours <strong>Miss &amp; Mister Dour 2026</strong> !
            Pour maximiser vos chances de victoire, complétez votre profil public en cliquant sur le bouton ci-dessous.
          </p>
          <p style="color:#ccc;font-size:15px;line-height:1.7;margin:0 0 32px;">
            Vous pourrez renseigner votre biographie, vos réseaux sociaux (Instagram, Facebook, TikTok)
            et vos coordonnées. Ces informations apparaîtront sur votre page publique de vote.
          </p>
          <!-- CTA Button -->
          <table cellpadding="0" cellspacing="0" style="margin:0 auto 32px;">
            <tr><td style="background:linear-gradient(135deg,#D4AF37,#B8941E);border-radius:12px;">
              <a href="${profileLink}" style="display:block;padding:16px 40px;color:#000;font-weight:700;font-size:16px;text-decoration:none;letter-spacing:1px;">✨ Compléter mon profil</a>
            </td></tr>
          </table>
          <!-- Link fallback -->
          <p style="color:#888;font-size:13px;text-align:center;margin:0 0 8px;">Ou copiez ce lien dans votre navigateur :</p>
          <p style="text-align:center;margin:0 0 32px;">
            <a href="${profileLink}" style="color:#D4AF37;font-size:12px;word-break:break-all;">${profileLink}</a>
          </p>
          <!-- Info box -->
          <div style="background:#1a1a1a;border-left:3px solid #D4AF37;border-radius:8px;padding:16px;">
            <p style="color:#D4AF37;font-size:13px;font-weight:700;margin:0 0 8px;">ℹ️ Information importante</p>
            <p style="color:#aaa;font-size:13px;margin:0;line-height:1.6;">Ce lien est personnel et sécurisé. Ne le partagez pas avec d'autres personnes. Il vous permet de modifier votre profil à tout moment.</p>
          </div>
        </td></tr>
        <!-- Footer -->
        <tr><td style="background:#0a0a0a;padding:24px;text-align:center;border-top:1px solid #333;">
          <p style="color:#555;font-size:12px;margin:0 0 4px;">STARLIGHT ASBL · Grand'Place 9, 7370 Dour, Belgique</p>
          <p style="color:#555;font-size:12px;margin:0;">© 2026 Miss &amp; Mister Dour · Conçu par <a href="#" style="color:#D4AF37;text-decoration:none;">JS-Innov.IA</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// Admin-only middleware
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (
    ctx.user.role !== "admin" &&
    ctx.user.role !== "super_admin" &&
    ctx.user.role !== "organizer"
  ) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Accès réservé aux administrateurs" });
  }
  return next({ ctx });
});

export const candidateProfileRouter = router({
  // ─── ADMIN : Générer un token de remplissage de profil ───────────────────
  generateProfileLink: adminProcedure
    .input(z.object({ candidateId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB indisponible" });

      // Vérifier que le candidat existe
      const [candidate] = await db
        .select()
        .from(candidates)
        .where(eq(candidates.id, input.candidateId))
        .limit(1);

      if (!candidate) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Candidat introuvable" });
      }

      // Désactiver les anciens tokens actifs pour ce candidat
      await db
        .update(profileEditTokens)
        .set({ isActive: 0 })
        .where(
          and(
            eq(profileEditTokens.candidateId, input.candidateId),
            eq(profileEditTokens.isActive, 1)
          )
        );

      // Générer un nouveau token sécurisé
      const token = crypto.randomBytes(32).toString("hex");

      await db.insert(profileEditTokens).values({
        candidateId: input.candidateId,
        token,
        isActive: 1,
        usedCount: 0,
        createdBy: ctx.user.id,
      });

      return { token, candidateId: input.candidateId };
    }),

  // ─── ADMIN : Lister les tokens pour un candidat ──────────────────────────
  getProfileTokens: adminProcedure
    .input(z.object({ candidateId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB indisponible" });

      return await db
        .select()
        .from(profileEditTokens)
        .where(eq(profileEditTokens.candidateId, input.candidateId));
    }),

  // ─── PUBLIC : Récupérer le profil candidat via token (formulaire) ─────────
  getProfileByToken: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB indisponible" });

      // Trouver le token
      const [tokenRow] = await db
        .select()
        .from(profileEditTokens)
        .where(
          and(
            eq(profileEditTokens.token, input.token),
            eq(profileEditTokens.isActive, 1)
          )
        )
        .limit(1);

      if (!tokenRow) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Lien invalide ou expiré" });
      }

      // Vérifier l'expiration
      if (tokenRow.expiresAt && new Date() > tokenRow.expiresAt) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Ce lien a expiré" });
      }

      // Récupérer le candidat
      const [candidate] = await db
        .select()
        .from(candidates)
        .where(eq(candidates.id, tokenRow.candidateId))
        .limit(1);

      if (!candidate) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Candidat introuvable" });
      }

      return {
        candidateId: candidate.id,
        firstName: candidate.firstName,
        lastName: candidate.lastName,
        category: candidate.category,
        bio: candidate.bio,
        phone: candidate.phone,
        address: candidate.address,
        city: candidate.city,
        profilePhoto: candidate.profilePhoto,
        instagram: candidate.instagram,
        facebook: candidate.facebook,
        tiktok: candidate.tiktok,
        linkedin: candidate.linkedin,
        experience: candidate.experience,
        motivation: candidate.motivation,
      };
    }),

  // ─── PUBLIC : Mettre à jour le profil via token ──────────────────────────
  updateProfileByToken: publicProcedure
    .input(
      z.object({
        token: z.string(),
        // Infos personnelles
        phone: z.string().max(50).optional(),
        address: z.string().optional(),
        city: z.string().max(100).optional(),
        bio: z.string().max(2000).optional(),
        motivation: z.string().max(2000).optional(),
        experience: z.string().max(2000).optional(),
        // Réseaux sociaux
        instagram: z.string().max(200).optional(),
        facebook: z.string().max(200).optional(),
        tiktok: z.string().max(200).optional(),
        linkedin: z.string().max(200).optional(),
        // Consentements RGPD
        acceptRules: z.boolean().optional(),
        acceptMedia: z.boolean().optional(),
        acceptCGU: z.boolean().optional(),
        acceptNewsletter: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB indisponible" });

      const { token, acceptRules, acceptMedia, acceptCGU, acceptNewsletter, ...profileData } = input;

      // Valider le token
      const [tokenRow] = await db
        .select()
        .from(profileEditTokens)
        .where(
          and(
            eq(profileEditTokens.token, token),
            eq(profileEditTokens.isActive, 1)
          )
        )
        .limit(1);

      if (!tokenRow) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Lien invalide ou expiré" });
      }

      if (tokenRow.expiresAt && new Date() > tokenRow.expiresAt) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Ce lien a expiré" });
      }

      // Construire les champs de consentement à mettre à jour
      const consentFields: Record<string, any> = {};
      if (acceptRules !== undefined) consentFields.acceptRules = acceptRules ? 1 : 0;
      if (acceptMedia !== undefined) consentFields.acceptMedia = acceptMedia ? 1 : 0;
      if (acceptNewsletter !== undefined) consentFields.acceptNewsletter = acceptNewsletter ? 1 : 0;
      if (acceptCGU !== undefined) {
        consentFields.acceptCGU = acceptCGU ? 1 : 0;
        // Horodater le consentement CGU si accepté pour la première fois
        if (acceptCGU) consentFields.acceptCGUAt = new Date();
        consentFields.consentVersion = "v1.0";
      }

      // Déterminer si le profil est considéré comme "soumis" (bio remplie + CGU acceptées)
      const isProfileComplete = !!profileData.bio && (consentFields.acceptCGU === 1 || acceptCGU === true);
      const submissionFields: Record<string, any> = {};
      if (isProfileComplete) {
        submissionFields.profileSubmittedAt = new Date();
        submissionFields.status = "pending"; // En attente de validation admin
        submissionFields.profileReviewNote = null; // Effacer les notes précédentes
      }

      // Mettre à jour le profil candidat
      await db
        .update(candidates)
        .set({
          ...profileData,
          ...consentFields,
          ...submissionFields,
          updatedAt: new Date(),
        })
        .where(eq(candidates.id, tokenRow.candidateId));

      // Incrémenter le compteur d'utilisation
      await db
        .update(profileEditTokens)
        .set({
          usedCount: tokenRow.usedCount + 1,
          lastUsedAt: new Date(),
        })
        .where(eq(profileEditTokens.token, token));

      // Récupérer le nom du candidat pour la notification
      const [cand] = await db
        .select({ firstName: candidates.firstName, lastName: candidates.lastName, category: candidates.category })
        .from(candidates)
        .where(eq(candidates.id, tokenRow.candidateId))
        .limit(1);

      if (cand) {
        const name = `${cand.firstName} ${cand.lastName}`;
        const notifTitle = isProfileComplete
          ? `✅ Profil soumis — ${name} (en attente de validation)`
          : `✏️ Profil mis à jour — ${name}`;
        const notifBody = isProfileComplete
          ? `${name} (${cand.category}) a soumis son profil complet. Validation requise avant publication. Rendez-vous dans /admin/validation.`
          : `${name} (${cand.category}) a mis à jour son profil (incomplet — bio ou CGU manquants).`;
        await dispatchNotification({
          eventType: "profile_submitted",
          title: notifTitle,
          body: notifBody,
          recipientType: "admin",
          priority: isProfileComplete ? "high" : "normal",
          context: { candidateId: tokenRow.candidateId, name, category: cand.category, requiresValidation: isProfileComplete },
        });
      }
      return {
        success: true,
        candidateId: tokenRow.candidateId,
        requiresValidation: isProfileComplete,
        message: isProfileComplete
          ? "Profil soumis avec succès ! Il sera visible après validation par l'organisateur."
          : "Profil mis à jour avec succès.",
      };
    }),

  // ─── PUBLIC : Récupérer le profil public d'un candidat (page de vote) ─────
  getPublicProfile: publicProcedure
    .input(z.object({ candidateId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB indisponible" });

      const [candidate] = await db
        .select({
          id: candidates.id,
          firstName: candidates.firstName,
          lastName: candidates.lastName,
          category: candidates.category,
          bio: candidates.bio,
          city: candidates.city,
          profilePhoto: candidates.profilePhoto,
          instagram: candidates.instagram,
          facebook: candidates.facebook,
          tiktok: candidates.tiktok,
          linkedin: candidates.linkedin,
          voteCount: candidates.voteCount,
          shareCount: candidates.shareCount,
          status: candidates.status,
          contestId: candidates.contestId,
        })
        .from(candidates)
        .where(eq(candidates.id, input.candidateId))
        .limit(1);

      if (!candidate) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Profil candidat introuvable" });
      }

      return candidate;
    }),

  // ─── ADMIN : Envoyer le lien de profil par email au candidat ────────────────
  sendProfileLinkEmail: adminProcedure
    .input(
      z.object({
        candidateId: z.number(),
        origin: z.string().url(), // URL de base du site (window.location.origin)
        overrideEmail: z.string().email().optional(), // Email manuel si pas dans users
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB indisponible" });

      // 1. Récupérer le candidat
      const [candidate] = await db
        .select()
        .from(candidates)
        .where(eq(candidates.id, input.candidateId))
        .limit(1);

      if (!candidate) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Candidat introuvable" });
      }

      // 2. Récupérer l'email depuis la table users
      const [userRow] = await db
        .select({ email: users.email, name: users.name })
        .from(users)
        .where(eq(users.id, candidate.userId))
        .limit(1);

      const recipientEmail = input.overrideEmail || userRow?.email;

      if (!recipientEmail) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Aucun email trouvé pour ce candidat. Renseignez un email manuellement.",
        });
      }

      // 3. Générer ou récupérer le token actif
      let activeToken: string | null = null;

      const [existingToken] = await db
        .select()
        .from(profileEditTokens)
        .where(
          and(
            eq(profileEditTokens.candidateId, input.candidateId),
            eq(profileEditTokens.isActive, 1)
          )
        )
        .limit(1);

      if (existingToken) {
        activeToken = existingToken.token;
      } else {
        // Générer un nouveau token
        const newToken = crypto.randomBytes(32).toString("hex");
        await db.insert(profileEditTokens).values({
          candidateId: input.candidateId,
          token: newToken,
          isActive: 1,
          usedCount: 0,
          createdBy: ctx.user.id,
        });
        activeToken = newToken;
      }

      // 4. Construire le lien de profil
      const profileLink = `${input.origin}/profile/edit/${activeToken}`;

      // 5. Envoyer l'email
      const subject = `👑 Miss & Mister Dour 2026 - Complétez votre profil, ${candidate.firstName} !`;
      const htmlBody = buildProfileEmailHtml(candidate.firstName, candidate.lastName, profileLink);

      const emailSent = await sendEmailViaForge(recipientEmail, subject, htmlBody);

      return {
        success: true,
        emailSent,
        recipientEmail,
        profileLink,
        // Si l'email n'a pas pu être envoyé via l'API, fournir un lien mailto de secours
        mailtoFallback: emailSent
          ? null
          : `mailto:${recipientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`Bonjour ${candidate.firstName},\n\nVoici votre lien pour compléter votre profil Miss & Mister Dour 2026 :\n\n${profileLink}\n\nBonne chance !\n\nL'équipe STARLIGHT ASBL`)}`,
      };
    }),

  // ─── ADMIN : Lister tous les candidats avec leur statut de token ─────────
  listCandidatesWithTokenStatus: adminProcedure
    .input(z.object({ contestId: z.number().optional() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB indisponible" });

      const rows = await db
        .select({
          id: candidates.id,
          firstName: candidates.firstName,
          lastName: candidates.lastName,
          category: candidates.category,
          status: candidates.status,
          profilePhoto: candidates.profilePhoto,
          bio: candidates.bio,
          phone: candidates.phone,
          instagram: candidates.instagram,
          facebook: candidates.facebook,
          tiktok: candidates.tiktok,
          contestId: candidates.contestId,
          // Consentements RGPD
          acceptCGU: candidates.acceptCGU,
          acceptCGUAt: candidates.acceptCGUAt,
          acceptRules: candidates.acceptRules,
          acceptMedia: candidates.acceptMedia,
          acceptNewsletter: candidates.acceptNewsletter,
          consentVersion: candidates.consentVersion,
          // Token info
          tokenId: profileEditTokens.id,
          token: profileEditTokens.token,
          tokenActive: profileEditTokens.isActive,
          tokenUsedCount: profileEditTokens.usedCount,
          tokenCreatedAt: profileEditTokens.createdAt,
        })
        .from(candidates)
        .leftJoin(
          profileEditTokens,
          and(
            eq(profileEditTokens.candidateId, candidates.id),
            eq(profileEditTokens.isActive, 1)
          )
        )
         .where(input.contestId ? eq(candidates.contestId, input.contestId) : undefined);
      return rows;
    }),

  // ─── ADMIN : Export RGPD — fichier de conformité des consentements ─────────
  // Retourne les données structurées pour générer un CSV côté client
  // Conformément au RGPD (Art. 7 & 30), l'export inclut :
  //   - Identité du candidat (prénom, nom, catégorie)
  //   - Statut de chaque consentement (CGU, règlement, médias, newsletter)
  //   - Horodatage du consentement CGU (preuve de consentement)
  //   - Version des CGU acceptées
  //   - Statut de conformité global
  exportRgpd: adminProcedure
    .input(
      z.object({
        contestId: z.number().optional(),
        onlyNonCompliant: z.boolean().optional().default(false),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB indisponible" });

      const rows = await db
        .select({
          id: candidates.id,
          firstName: candidates.firstName,
          lastName: candidates.lastName,
          category: candidates.category,
          status: candidates.status,
          phone: candidates.phone,
          registrationDate: candidates.registrationDate,
          // Consentements RGPD
          acceptCGU: candidates.acceptCGU,
          acceptCGUAt: candidates.acceptCGUAt,
          acceptRules: candidates.acceptRules,
          acceptMedia: candidates.acceptMedia,
          acceptNewsletter: candidates.acceptNewsletter,
          consentVersion: candidates.consentVersion,
          // Email via jointure users
          userId: candidates.userId,
        })
        .from(candidates)
        .leftJoin(users, eq(users.id, candidates.userId))
        .where(input.contestId ? eq(candidates.contestId, input.contestId) : undefined);

      // Enrichir chaque ligne avec le statut de conformité calculé
      const enriched = rows.map((r) => {
        const isCompliant =
          r.acceptCGU === 1 &&
          r.acceptRules === 1 &&
          !!r.acceptCGUAt;

        const consentDate = r.acceptCGUAt
          ? new Date(r.acceptCGUAt).toLocaleString("fr-BE", { timeZone: "Europe/Brussels" })
          : null;

        const regDate = r.registrationDate
          ? new Date(r.registrationDate).toLocaleString("fr-BE", { timeZone: "Europe/Brussels" })
          : null;

        return {
          id: r.id,
          firstName: r.firstName,
          lastName: r.lastName,
          category: r.category,
          status: r.status,
          phone: r.phone,
          registrationDate: regDate,
          // Consentements
          acceptCGU: r.acceptCGU === 1,
          acceptCGUAt: consentDate,
          acceptRules: r.acceptRules === 1,
          acceptMedia: r.acceptMedia === 1,
          acceptNewsletter: r.acceptNewsletter === 1,
          consentVersion: r.consentVersion ?? "v1.0",
          // Conformité globale
          isCompliant,
          complianceStatus: isCompliant ? "CONFORME" : "NON_CONFORME",
        };
      });

      // Filtrer si demandé
      const result = input.onlyNonCompliant
        ? enriched.filter((r) => !r.isCompliant)
        : enriched;

      return {
        exportedAt: new Date().toISOString(),
        exportedBy: "admin",
        totalCandidates: enriched.length,
        compliantCount: enriched.filter((r) => r.isCompliant).length,
        nonCompliantCount: enriched.filter((r) => !r.isCompliant).length,
        rgpdVersion: "RGPD-2016/679",
        legalBasis: "Consentement explicite (Art. 6.1.a RGPD) — Miss & Mister Dour 2026",
        dataController: "STARLIGHT ASBL — Grand'Place 9, 7370 Dour, Belgique",
        candidates: result,
      };
    }),

  // ─── PUBLIC : Créer un compte candidat (email + mot de passe) ──────────────────────
  createCandidateAccount: publicProcedure
    .input(
      z.object({
        token: z.string(),
        email: z.string().email("Email invalide"),
        password: z
          .string()
          .min(8, "Le mot de passe doit contenir au moins 8 caractères")
          .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule")
          .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre"),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB indisponible" });

      // Valider le token
      const [tokenRow] = await db
        .select()
        .from(profileEditTokens)
        .where(
          and(
            eq(profileEditTokens.token, input.token),
            eq(profileEditTokens.isActive, 1)
          )
        )
        .limit(1);

      if (!tokenRow) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Lien invalide ou expiré" });
      }

      if (tokenRow.expiresAt && new Date() > tokenRow.expiresAt) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Ce lien a expiré" });
      }

      // Vérifier que le candidat existe
      const [candidate] = await db
        .select()
        .from(candidates)
        .where(eq(candidates.id, tokenRow.candidateId))
        .limit(1);

      if (!candidate) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Candidat introuvable" });
      }

      // Vérifier si un compte existe déjà avec cet email
      const [existingByEmail] = await db
        .select({ id: candidates.id, accountEmail: candidates.accountEmail })
        .from(candidates)
        .where(eq(candidates.accountEmail, input.email))
        .limit(1);

      if (existingByEmail && existingByEmail.id !== candidate.id) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Un compte existe déjà avec cet email. Utilisez un autre email.",
        });
      }

      // Vérifier si le candidat a déjà un compte
      if (candidate.accountEmail && candidate.passwordHash) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Un compte est déjà associé à ce profil. Connectez-vous avec votre email.",
        });
      }

      // Hasher le mot de passe avec bcrypt (cost=12)
      const bcrypt = await import("bcryptjs");
      const passwordHash = await bcrypt.hash(input.password, 12);

      // Enregistrer le compte
      await db
        .update(candidates)
        .set({
          accountEmail: input.email,
          passwordHash,
          accountCreatedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(candidates.id, candidate.id));

      // Notifier l'admin
      await dispatchNotification({
        eventType: "profile_submitted",
        title: `Compte créé — ${candidate.firstName} ${candidate.lastName}`,
        body: `${candidate.firstName} ${candidate.lastName} (${candidate.category}) vient de créer son accès candidat avec l'email ${input.email}.`,
        recipientType: "admin",
        priority: "normal",
        context: { candidateId: candidate.id, email: input.email },
      });

      return {
        success: true,
        candidateId: candidate.id,
        message: "Compte créé avec succès ! Vous pourrez vous connecter une fois le site lancé.",
      };
    }),

  // ─── PUBLIC : Connexion candidat (email + mot de passe) ───────────────────────────
  loginCandidate: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB indisponible" });

      // Trouver le candidat par email
      const [candidate] = await db
        .select()
        .from(candidates)
        .where(eq(candidates.accountEmail, input.email))
        .limit(1);

      if (!candidate || !candidate.passwordHash) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Email ou mot de passe incorrect",
        });
      }

      // Vérifier le mot de passe
      const bcrypt = await import("bcryptjs");
      const isValid = await bcrypt.compare(input.password, candidate.passwordHash);

      if (!isValid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Email ou mot de passe incorrect",
        });
      }

      return {
        success: true,
        candidateId: candidate.id,
        firstName: candidate.firstName,
        lastName: candidate.lastName,
        category: candidate.category,
        email: candidate.accountEmail,
        message: "Connexion réussie",
      };
    }),

  // ─── PUBLIC : Vérifier si un compte existe pour ce token ──────────────────────────
  checkCandidateAccount: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB indisponible" });

      const [tokenRow] = await db
        .select()
        .from(profileEditTokens)
        .where(
          and(
            eq(profileEditTokens.token, input.token),
            eq(profileEditTokens.isActive, 1)
          )
        )
        .limit(1);

      if (!tokenRow) return { hasAccount: false, email: null };

      const [candidate] = await db
        .select({ accountEmail: candidates.accountEmail, passwordHash: candidates.passwordHash })
        .from(candidates)
        .where(eq(candidates.id, tokenRow.candidateId))
        .limit(1);

      return {
        hasAccount: !!(candidate?.accountEmail && candidate?.passwordHash),
        email: candidate?.accountEmail ?? null,
      };
    }),
});
