/**
 * assistant.ts — Router tRPC pour l'assistant IA "Miss & Mister Dour IA"
 *
 * Fonctionnalités :
 * - Analyse du taux de complétion des profils candidats
 * - Identification des champs manquants
 * - Génération de messages personnalisés via LLM
 * - Préparation des liens WhatsApp
 * - Vue admin globale de l'état des candidats
 * - Envoi de messages importants depuis l'administration
 *
 * Signature systématique : Julien P. / By Js-Innov.IA
 */

import { router, protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "../db";
import { invokeLLM } from "../_core/llm";

// ─── Constantes ───────────────────────────────────────────────────────────────

const SIGNATURE = "\n\nJulien P.\nBy Js-Innov.IA";

const ASSISTANT_SYSTEM_PROMPT = `Tu es "Miss & Mister Dour IA", l'assistant officiel du concours Miss & Mister Dour 2026 organisé à Dour, Belgique.

Ton rôle est d'assister l'équipe organisatrice dans la gestion des candidats.
Tu génères des messages officiels, élégants, humains et personnalisés.

Règles absolues :
1. Ton ton est toujours officiel, chaleureux et bienveillant — jamais robotique.
2. Tu t'adresses aux candidats par leur prénom.
3. Chaque message que tu génères se termine TOUJOURS par la signature suivante, sur deux lignes séparées :
   Julien P.
   By Js-Innov.IA
4. Tu ne révèles jamais que tu es une IA dans tes messages aux candidats.
5. Tu rédiges exclusivement en français, avec une orthographe parfaite.
6. Tes messages sont concis (max 200 mots), percutants et motivants.`;

// ─── Calcul du taux de complétion ─────────────────────────────────────────────

type CandidateRow = {
  id: number;
  firstName: string;
  lastName: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  dateOfBirth: Date | null;
  height: number | null;
  weight: number | null;
  measurements: string | null;
  experience: string | null;
  motivation: string | null;
  bio: string | null;
  profilePhoto: string | null;
  instagram: string | null;
  facebook: string | null;
  tiktok: string | null;
  linkedin: string | null;
  category: string;
  status: string;
  voteCount: number;
  shareCount: number;
  contestId: number;
  userId: number;
  registrationDate: Date;
  createdAt: Date;
  updatedAt: Date;
};

const PROFILE_FIELDS: { key: keyof CandidateRow; label: string; weight: number; priority: "critical" | "important" | "optional" }[] = [
  { key: "firstName",    label: "Prénom",              weight: 10, priority: "critical" },
  { key: "lastName",     label: "Nom",                 weight: 10, priority: "critical" },
  { key: "phone",        label: "Téléphone",           weight: 10, priority: "critical" },
  { key: "dateOfBirth",  label: "Date de naissance",   weight: 8,  priority: "critical" },
  { key: "address",      label: "Adresse",             weight: 6,  priority: "important" },
  { key: "city",         label: "Ville",               weight: 6,  priority: "important" },
  { key: "country",      label: "Pays",                weight: 4,  priority: "important" },
  { key: "bio",          label: "Biographie",          weight: 10, priority: "critical" },
  { key: "motivation",   label: "Lettre de motivation",weight: 10, priority: "critical" },
  { key: "profilePhoto", label: "Photo de profil",     weight: 12, priority: "critical" },
  { key: "height",       label: "Taille",              weight: 4,  priority: "important" },
  { key: "weight",       label: "Poids",               weight: 3,  priority: "optional" },
  { key: "measurements", label: "Mensurations",        weight: 3,  priority: "optional" },
  { key: "experience",   label: "Expériences",         weight: 8,  priority: "important" },
  { key: "instagram",    label: "Instagram",           weight: 4,  priority: "optional" },
  { key: "facebook",     label: "Facebook",            weight: 2,  priority: "optional" },
];

const TOTAL_WEIGHT = PROFILE_FIELDS.reduce((s, f) => s + f.weight, 0);

function computeProfileCompletion(candidate: CandidateRow) {
  const missing: { key: string; label: string; priority: string }[] = [];
  let earned = 0;

  for (const field of PROFILE_FIELDS) {
    const val = candidate[field.key];
    const filled = val !== null && val !== undefined && String(val).trim() !== "";
    if (filled) {
      earned += field.weight;
    } else {
      missing.push({ key: field.key, label: field.label, priority: field.priority });
    }
  }

  const percentage = Math.round((earned / TOTAL_WEIGHT) * 100);
  const criticalMissing = missing.filter((m) => m.priority === "critical");
  const importantMissing = missing.filter((m) => m.priority === "important");

  return { percentage, missing, criticalMissing, importantMissing };
}

function getCompletionStatus(pct: number): "excellent" | "good" | "incomplete" | "critical" {
  if (pct >= 90) return "excellent";
  if (pct >= 70) return "good";
  if (pct >= 40) return "incomplete";
  return "critical";
}

function buildPublicProfileUrl(candidateId: number, baseUrl: string): string {
  return `${baseUrl}/candidates/${candidateId}`;
}

function buildWhatsAppLink(phone: string, message: string): string {
  // Normaliser le numéro belge
  let normalized = phone.replace(/[\s\-\.]/g, "");
  if (normalized.startsWith("0")) normalized = "+32" + normalized.slice(1);
  if (!normalized.startsWith("+")) normalized = "+32" + normalized;
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${normalized.replace("+", "")}?text=${encoded}`;
}

// ─── Router ───────────────────────────────────────────────────────────────────

export const assistantRouter = router({

  /**
   * Analyse complète d'un candidat : complétion, champs manquants, lien, score
   */
  analyzeCandidate: protectedProcedure
    .input(z.object({ candidateId: z.number() }))
    .query(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin" && ctx.user.role !== "super_admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Accès réservé aux administrateurs" });
      }

      const candidate = await db.getCandidateById(input.candidateId) as CandidateRow | null;
      if (!candidate) throw new TRPCError({ code: "NOT_FOUND", message: "Candidat introuvable" });

      const { percentage, missing, criticalMissing, importantMissing } = computeProfileCompletion(candidate);
      const status = getCompletionStatus(percentage);

      const baseUrl = process.env.PUBLIC_BASE_URL || "https://missetmisterdour.be";
      const profileUrl = buildPublicProfileUrl(candidate.id, baseUrl);

      return {
        candidate: {
          id: candidate.id,
          firstName: candidate.firstName,
          lastName: candidate.lastName,
          fullName: `${candidate.firstName} ${candidate.lastName}`,
          phone: candidate.phone,
          category: candidate.category,
          status: candidate.status,
          voteCount: candidate.voteCount,
          shareCount: candidate.shareCount,
          profilePhoto: candidate.profilePhoto,
        },
        completion: {
          percentage,
          status,
          missing,
          criticalMissing,
          importantMissing,
          filledCount: PROFILE_FIELDS.length - missing.length,
          totalFields: PROFILE_FIELDS.length,
        },
        profileUrl,
      };
    }),

  /**
   * Vue d'ensemble admin : tous les candidats avec leur taux de complétion
   */
  listCandidatesStatus: protectedProcedure
    .input(z.object({
      contestId: z.number(),
      filter: z.enum(["all", "critical", "incomplete", "good", "excellent"]).default("all"),
    }))
    .query(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin" && ctx.user.role !== "super_admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Accès réservé aux administrateurs" });
      }

      const allCandidates = await db.getCandidatesByContest(input.contestId) as CandidateRow[];
      const baseUrl = process.env.PUBLIC_BASE_URL || "https://missetmisterdour.be";

      const results = allCandidates.map((c) => {
        const { percentage, criticalMissing, importantMissing, missing } = computeProfileCompletion(c);
        const status = getCompletionStatus(percentage);
        return {
          id: c.id,
          fullName: `${c.firstName} ${c.lastName}`,
          firstName: c.firstName,
          lastName: c.lastName,
          phone: c.phone,
          category: c.category,
          candidateStatus: c.status,
          voteCount: c.voteCount,
          profilePhoto: c.profilePhoto,
          completion: { percentage, status, criticalMissing, importantMissing, missingCount: missing.length },
          profileUrl: buildPublicProfileUrl(c.id, baseUrl),
        };
      });

      const filtered = input.filter === "all"
        ? results
        : results.filter((r) => r.completion.status === input.filter);

      // Statistiques globales
      const stats = {
        total: results.length,
        excellent: results.filter((r) => r.completion.status === "excellent").length,
        good: results.filter((r) => r.completion.status === "good").length,
        incomplete: results.filter((r) => r.completion.status === "incomplete").length,
        critical: results.filter((r) => r.completion.status === "critical").length,
        avgCompletion: results.length > 0
          ? Math.round(results.reduce((s, r) => s + r.completion.percentage, 0) / results.length)
          : 0,
      };

      return { candidates: filtered, stats };
    }),

  /**
   * Générer un message de rappel personnalisé via LLM
   */
  generateMessage: protectedProcedure
    .input(z.object({
      candidateId: z.number(),
      messageType: z.enum([
        "profile_completion",  // Rappel complétion profil
        "vote_encouragement",  // Encouragement votes
        "event_reminder",      // Rappel événement
        "congratulations",     // Félicitations
        "custom",              // Message personnalisé
      ]),
      customContext: z.string().optional(),
      channel: z.enum(["email", "whatsapp", "sms"]).default("whatsapp"),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin" && ctx.user.role !== "super_admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Accès réservé aux administrateurs" });
      }

      const candidate = await db.getCandidateById(input.candidateId) as CandidateRow | null;
      if (!candidate) throw new TRPCError({ code: "NOT_FOUND", message: "Candidat introuvable" });

      const { percentage, criticalMissing, importantMissing } = computeProfileCompletion(candidate);
      const baseUrl = process.env.PUBLIC_BASE_URL || "https://missetmisterdour.be";
      const profileUrl = buildPublicProfileUrl(candidate.id, baseUrl);

      // Construire le contexte pour le LLM
      const contextMap: Record<string, string> = {
        profile_completion: `Le candidat ${candidate.firstName} ${candidate.lastName} a complété ${percentage}% de son profil.
Champs critiques manquants : ${criticalMissing.map((f) => f.label).join(", ") || "aucun"}.
Champs importants manquants : ${importantMissing.map((f) => f.label).join(", ") || "aucun"}.
Lien du profil : ${profileUrl}
Génère un message de rappel chaleureux et motivant pour l'inciter à compléter son profil.
${input.channel === "whatsapp" ? "Format WhatsApp : court, avec emojis appropriés." : "Format email : plus formel."}`,

        vote_encouragement: `Le candidat ${candidate.firstName} ${candidate.lastName} a reçu ${candidate.voteCount} vote(s) et ${candidate.shareCount} partage(s).
Génère un message d'encouragement pour l'inciter à mobiliser ses proches pour voter.
Lien du profil : ${profileUrl}
${input.channel === "whatsapp" ? "Format WhatsApp : court, avec emojis." : "Format email : plus formel."}`,

        event_reminder: `Génère un rappel d'événement pour le candidat ${candidate.firstName} ${candidate.lastName}.
${input.customContext ? `Contexte de l'événement : ${input.customContext}` : "Événement : soirée de clôture Lady Gaga Night, 19 avril 2026, Dour."}
${input.channel === "whatsapp" ? "Format WhatsApp : court, avec emojis." : "Format email : formel."}`,

        congratulations: `Génère un message de félicitations officiel pour ${candidate.firstName} ${candidate.lastName}.
${input.customContext ? `Raison : ${input.customContext}` : "Félicitations générales pour sa participation au concours."}`,

        custom: `Génère un message officiel pour ${candidate.firstName} ${candidate.lastName}.
Contexte : ${input.customContext || "Message de l'administration du concours."}
${input.channel === "whatsapp" ? "Format WhatsApp : concis, avec emojis appropriés." : "Format email : formel et élégant."}`,
      };

      const userPrompt = contextMap[input.messageType];

       const response = await invokeLLM({
        messages: [
          { role: "system" as const, content: ASSISTANT_SYSTEM_PROMPT as any },
          { role: "user" as const, content: userPrompt as any },
        ],
      });
      const rawContent = response.choices?.[0]?.message?.content;
      let generatedMessage: string = typeof rawContent === "string" ? rawContent : "";

      // S'assurer que la signature est présente
      if (!generatedMessage.includes("Julien P.")) {
        generatedMessage += SIGNATURE;
      }

      // Générer le lien WhatsApp si applicable
      let whatsappLink: string | null = null;
      if (candidate.phone) {
        whatsappLink = buildWhatsAppLink(candidate.phone, generatedMessage);
      }

      return {
        message: generatedMessage,
        candidateName: `${candidate.firstName} ${candidate.lastName}`,
        phone: candidate.phone,
        profileUrl,
        whatsappLink,
        channel: input.channel,
        messageType: input.messageType,
      };
    }),

  /**
   * Obtenir le lien WhatsApp pré-rempli pour un candidat
   */
  getWhatsAppLink: protectedProcedure
    .input(z.object({
      candidateId: z.number(),
      messageTemplate: z.enum(["profile_reminder", "vote_call", "event_info", "welcome"]).default("profile_reminder"),
    }))
    .query(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin" && ctx.user.role !== "super_admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Accès réservé aux administrateurs" });
      }

      const candidate = await db.getCandidateById(input.candidateId) as CandidateRow | null;
      if (!candidate) throw new TRPCError({ code: "NOT_FOUND", message: "Candidat introuvable" });

      if (!candidate.phone) {
        return { whatsappLink: null, reason: "Numéro de téléphone manquant" };
      }

      const baseUrl = process.env.PUBLIC_BASE_URL || "https://missetmisterdour.be";
      const profileUrl = buildPublicProfileUrl(candidate.id, baseUrl);
      const { percentage } = computeProfileCompletion(candidate);

      const templates: Record<string, string> = {
        profile_reminder: `Bonjour ${candidate.firstName} 👑\n\nNous sommes l'équipe organisatrice de Miss & Mister Dour 2026.\n\nVotre profil est complété à ${percentage}%. Quelques informations manquantes pourraient réduire vos chances de sélection.\n\n🔗 Complétez votre profil ici :\n${profileUrl}\n\nMerci pour votre engagement !\n\nJulien P.\nBy Js-Innov.IA`,

        vote_call: `Bonjour ${candidate.firstName} 👑\n\nLes votes sont ouverts ! Vous avez actuellement ${candidate.voteCount} vote(s).\n\nPartagez votre lien personnel pour mobiliser vos proches :\n🔗 ${profileUrl}\n\nChaque vote compte ! Bonne chance 🌟\n\nJulien P.\nBy Js-Innov.IA`,

        event_info: `Bonjour ${candidate.firstName} 👑\n\nRappel important : la soirée de clôture Lady Gaga Night se déroulera le 19 avril 2026 à Dour, Belgique.\n\nPréparez-vous pour cette soirée exceptionnelle !\n\n🔗 Votre profil : ${profileUrl}\n\nJulien P.\nBy Js-Innov.IA`,

        welcome: `Bienvenue ${candidate.firstName} 👑\n\nNous sommes ravis de vous accueillir parmi les candidats de Miss & Mister Dour 2026 !\n\nCommencez par compléter votre profil :\n🔗 ${profileUrl}\n\nL'équipe organisatrice est à votre disposition.\n\nJulien P.\nBy Js-Innov.IA`,
      };

      const message = templates[input.messageTemplate];
      const whatsappLink = buildWhatsAppLink(candidate.phone, message);

      return {
        whatsappLink,
        message,
        phone: candidate.phone,
        candidateName: `${candidate.firstName} ${candidate.lastName}`,
        profileUrl,
      };
    }),

  /**
   * Envoyer un message admin important (notification interne)
   */
  sendAdminMessage: protectedProcedure
    .input(z.object({
      candidateId: z.number(),
      message: z.string().min(10, "Le message doit contenir au moins 10 caractères"),
      channel: z.enum(["notification", "whatsapp_manual"]).default("notification"),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin" && ctx.user.role !== "super_admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Accès réservé aux administrateurs" });
      }

      const candidate = await db.getCandidateById(input.candidateId) as CandidateRow | null;
      if (!candidate) throw new TRPCError({ code: "NOT_FOUND", message: "Candidat introuvable" });

      // Ajouter la signature si absente
      let finalMessage = input.message;
      if (!finalMessage.includes("Julien P.")) {
        finalMessage += SIGNATURE;
      }

      // Envoyer via notification interne
      if (input.channel === "notification") {
        const { sendCandidateNotification } = await import("../_core/notification");
        await sendCandidateNotification(candidate.userId.toString(), {
          title: "📩 Message de l'organisation",
          content: finalMessage,
        });
      }

      // Préparer le lien WhatsApp si demandé
      let whatsappLink: string | null = null;
      if (input.channel === "whatsapp_manual" && candidate.phone) {
        whatsappLink = buildWhatsAppLink(candidate.phone, finalMessage);
      }

      return {
        success: true,
        candidateName: `${candidate.firstName} ${candidate.lastName}`,
        channel: input.channel,
        whatsappLink,
        messageSent: finalMessage,
      };
    }),

  /**
   * Chat libre avec l'assistant IA
   */
  chat: protectedProcedure
    .input(z.object({
      message: z.string().min(1),
      history: z.array(z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      })).default([]),
      contestId: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin" && ctx.user.role !== "super_admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Accès réservé aux administrateurs" });
      }

      // Contexte dynamique : stats candidats si contestId fourni
      let contextInfo = "";
      if (input.contestId) {
        try {
          const candidates = await db.getCandidatesByContest(input.contestId) as CandidateRow[];
          const stats = candidates.map((c) => {
            const { percentage } = computeProfileCompletion(c);
            return { name: `${c.firstName} ${c.lastName}`, pct: percentage, votes: c.voteCount, status: c.status };
          });
          const avgPct = stats.length > 0 ? Math.round(stats.reduce((s, c) => s + c.pct, 0) / stats.length) : 0;
          const critical = stats.filter((c) => c.pct < 40).length;
          contextInfo = `\n\nDonnées actuelles du concours (${candidates.length} candidats) :\n- Taux de complétion moyen : ${avgPct}%\n- Candidats en état critique (< 40%) : ${critical}\n- Top votant : ${stats.sort((a, b) => b.votes - a.votes)[0]?.name ?? "N/A"} (${stats[0]?.votes ?? 0} votes)`;
        } catch {
          // Ignorer si pas de données
        }
      }

      const systemPrompt = ASSISTANT_SYSTEM_PROMPT + contextInfo;

      const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
        { role: "system", content: systemPrompt },
        ...input.history.map((h) => ({ role: h.role as "user" | "assistant", content: h.content })),
        { role: "user", content: input.message },
      ];

      const response = await invokeLLM({ messages: messages as any });
      const reply = response.choices?.[0]?.message?.content ?? "Je suis désolé, je n'ai pas pu générer de réponse.";

      return { reply, timestamp: new Date().toISOString() };
    }),

  /**
   * Campagne de rappel groupée : génère les messages et liens WhatsApp
   * pour tous les candidats dont le profil est complété à moins de `threshold`%
   */
  bulkCampaign: protectedProcedure
    .input(z.object({
      contestId: z.number(),
      threshold: z.number().min(1).max(100).default(50),
      messageType: z.enum(["profile_reminder", "vote_call", "event_info", "welcome"]).default("profile_reminder"),
      baseUrl: z.string().default("https://missdourweb-fqsyubas.manus.space"),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin" && ctx.user.role !== "super_admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Accès réservé aux administrateurs" });
      }

      const allCandidates = await db.getCandidatesByContest(input.contestId) as CandidateRow[];

      // Filtrer les candidats sous le seuil
      const targets = allCandidates
        .map((c) => {
          const { percentage, criticalMissing, missing } = computeProfileCompletion(c);
          return { candidate: c, percentage, criticalMissing, missing };
        })
        .filter(({ percentage }) => percentage < input.threshold)
        .sort((a, b) => a.percentage - b.percentage); // Du plus critique au moins critique

      if (targets.length === 0) {
        return {
          total: 0,
          threshold: input.threshold,
          results: [],
          summary: `Aucun candidat n'a un profil complété à moins de ${input.threshold}%. Tous les profils sont au-dessus du seuil.`,
        };
      }

      // Générer les messages et liens pour chaque candidat cible
      const results = await Promise.all(
        targets.map(async ({ candidate, percentage, criticalMissing }) => {
          const profileUrl = buildPublicProfileUrl(candidate.id, input.baseUrl);
          const missingLabels = criticalMissing.slice(0, 3).map((m) => m.label).join(", ");

          // Message selon le type demandé
          let message = "";
          switch (input.messageType) {
            case "profile_reminder":
              message = `Bonjour ${candidate.firstName} 👑\n\nNous sommes l'équipe organisatrice de Miss & Mister Dour 2026.\n\nVotre profil est actuellement complété à ${percentage}%.${missingLabels ? `\n\n⚠️ Éléments manquants : ${missingLabels}.` : ""}\n\nComplétez votre profil pour maximiser vos chances de sélection :\n🔗 ${profileUrl}\n\nMerci pour votre engagement !\n\nJulien P.\nBy Js-Innov.IA`;
              break;
            case "vote_call":
              message = `Bonjour ${candidate.firstName} 👑\n\nLes votes sont ouverts ! Mobilisez vos proches en partageant votre lien personnel :\n🔗 ${profileUrl}\n\nChaque vote compte pour votre sélection 🌟\n\nJulien P.\nBy Js-Innov.IA`;
              break;
            case "event_info":
              message = `Bonjour ${candidate.firstName} 👑\n\nRappel important : la soirée de clôture Lady Gaga Night se déroulera le 19 avril 2026 à Dour, Belgique.\n\nVotre présence est attendue. Préparez-vous pour cette soirée exceptionnelle !\n\n🔗 Votre profil : ${profileUrl}\n\nJulien P.\nBy Js-Innov.IA`;
              break;
            case "welcome":
              message = `Bienvenue ${candidate.firstName} 👑\n\nNous sommes ravis de vous accueillir parmi les candidats de Miss & Mister Dour 2026 !\n\nCommencez par compléter votre profil pour être visible :\n🔗 ${profileUrl}\n\nL'équipe organisatrice est à votre disposition.\n\nJulien P.\nBy Js-Innov.IA`;
              break;
          }

          // Générer le lien WhatsApp si le candidat a un téléphone
          const whatsappLink = candidate.phone
            ? buildWhatsAppLink(candidate.phone, message)
            : null;

          return {
            candidateId: candidate.id,
            name: `${candidate.firstName} ${candidate.lastName}`,
            firstName: candidate.firstName,
            phone: candidate.phone,
            percentage,
            status: getCompletionStatus(percentage),
            profileUrl,
            message,
            whatsappLink,
            criticalMissingCount: criticalMissing.length,
            hasPhone: !!candidate.phone,
          };
        })
      );

      const withPhone = results.filter((r) => r.hasPhone).length;
      const withoutPhone = results.length - withPhone;

      return {
        total: results.length,
        threshold: input.threshold,
        withPhone,
        withoutPhone,
        results,
        summary: `${results.length} candidat(s) identifié(s) avec un profil < ${input.threshold}%. ${withPhone} lien(s) WhatsApp généré(s). ${withoutPhone} candidat(s) sans numéro de téléphone.`,
      };
    }),
});
