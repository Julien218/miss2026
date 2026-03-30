/**
 * Router tRPC WhatsApp Business — Miss & Mister Dour 2026
 * Procédures : sendMessage, sendBulk, verifyAccount, listTemplates, getLogs
 */

import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { whatsappLogs, candidates } from "../../drizzle/schema";
import { desc, eq, and, gte } from "drizzle-orm";
import {
  sendTextMessage,
  sendBulkTextMessages,
  verifyWhatsAppAccount,
  listApprovedTemplates,
  normalizePhone,
  OFFICIAL_MESSAGE_TEMPLATES,
} from "../services/whatsappBusiness";

// Helper pour récupérer les credentials depuis l'env
function getWBACredentials() {
  const token = process.env.META_WHATSAPP_TOKEN;
  const phoneNumberId = process.env.META_PHONE_NUMBER_ID;
  if (!token || !phoneNumberId) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message: "Les credentials WhatsApp Business API ne sont pas configurés. Veuillez ajouter META_WHATSAPP_TOKEN et META_PHONE_NUMBER_ID dans les secrets.",
    });
  }
  return { token, phoneNumberId };
}

// Helper pour calculer le taux de complétion d'un candidat
function calcCompletion(c: any): number {
  const fields = [
    c.firstName, c.lastName, c.email, c.phone, c.birthDate,
    c.city, c.bio, c.photoUrl, c.instagramHandle,
    c.height, c.shoeSize, c.clothingSize,
  ];
  const filled = fields.filter((f) => f !== null && f !== undefined && f !== "").length;
  return Math.round((filled / fields.length) * 100);
}

export const whatsappRouter = router({
  /**
   * Vérifie la connexion au compte WhatsApp Business
   */
  verifyAccount: protectedProcedure.query(async () => {
    const { token, phoneNumberId } = getWBACredentials();
    return await verifyWhatsAppAccount(token, phoneNumberId);
  }),

  /**
   * Liste les templates approuvés dans Meta Business Manager
   */
  listTemplates: protectedProcedure.query(async () => {
    const { token } = getWBACredentials();
    const wabaId = process.env.META_WABA_ID ?? "";
    if (!wabaId) return [];
    return await listApprovedTemplates(token, wabaId);
  }),

  /**
   * Envoie un message texte à un candidat spécifique
   */
  sendMessage: protectedProcedure
    .input(
      z.object({
        candidateId: z.number(),
        message: z.string().min(1).max(4096),
        templateType: z.enum([
          "profile_reminder",
          "vote_reminder",
          "event_reminder",
          "welcome",
          "congratulations",
          "urgent",
          "custom",
        ]).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
       const { token, phoneNumberId } = getWBACredentials();
      // Récupérer le candidat
      const dbSend = await getDb();
      if (!dbSend) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });
      const candidateList = await dbSend
        .select()
        .from(candidates)
        .where(eq(candidates.id, input.candidateId))
        .limit(1);

      if (!candidateList.length) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Candidat introuvable" });
      }

      const candidate = candidateList[0];
      if (!candidate.phone) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Ce candidat n'a pas de numéro de téléphone enregistré" });
      }

      const result = await sendTextMessage(
        { to: candidate.phone, text: input.message },
        token,
        phoneNumberId
      );

      // Tracer l'envoi en DB
      await dbSend.insert(whatsappLogs).values({
        candidateId: input.candidateId,
        phone: normalizePhone(candidate.phone),
        candidateName: `${candidate.firstName ?? ""} ${candidate.lastName ?? ""}`.trim(),
        message: input.message,
        templateType: input.templateType ?? "custom",
        messageId: result.messageId ?? null,
        status: result.success ? "sent" : "failed",
        errorMessage: result.error ?? null,
        sentBy: ctx.user.id,
        sentAt: Date.now(),
      });

      return result;
    }),

  /**
   * Envoie un message en masse à tous les candidats dont le profil < seuil%
   */
  sendBulkCampaign: protectedProcedure
    .input(
      z.object({
        completionThreshold: z.number().min(10).max(90).default(50),
        templateType: z.enum([
          "profile_reminder",
          "vote_reminder",
          "event_reminder",
          "welcome",
          "congratulations",
          "urgent",
          "custom",
        ]),
        customMessage: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { token, phoneNumberId } = getWBACredentials();

      // Récupérer tous les candidats avec téléphone
      const dbBulk = await getDb();
      if (!dbBulk) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });
      const allCandidates = await dbBulk.select().from(candidates);
      const targets = allCandidates.filter((c: typeof allCandidates[number]) => {
        if (!c.phone) return false;
        const completion = calcCompletion(c);
        return completion < input.completionThreshold;
      });

      if (!targets.length) {
        return {
          total: 0,
          sent: 0,
          failed: 0,
          results: [],
          message: `Aucun candidat avec un profil inférieur à ${input.completionThreshold}%`,
        };
      }

      // Construire les messages personnalisés
      const contacts = targets.map((c: typeof allCandidates[number]) => {
        const name = `${c.firstName ?? ""} ${c.lastName ?? ""}`.trim() || "Candidat";
        const completion = calcCompletion(c);
        const profileUrl = `${process.env.PUBLIC_BASE_URL ?? ""}/candidats/${c.id}`;

        let message = input.customMessage ?? "";
        if (!message) {
          if (input.templateType === "profile_reminder") {
            const missing: string[] = [];
            if (!c.bio) missing.push("Biographie");
            if (!c.profilePhoto) missing.push("Photo principale");
            if (!c.instagram) missing.push("Instagram");
            if (!c.height) missing.push("Taille");
            message = OFFICIAL_MESSAGE_TEMPLATES.profile_reminder(name, completion, missing, profileUrl);
          } else if (input.templateType === "vote_reminder") {
            message = OFFICIAL_MESSAGE_TEMPLATES.vote_reminder(name, 0, profileUrl);
          } else if (input.templateType === "welcome") {
            message = OFFICIAL_MESSAGE_TEMPLATES.welcome(name, profileUrl);
          } else {
            message = OFFICIAL_MESSAGE_TEMPLATES.custom(name, `Votre profil est complété à ${completion}%. Pensez à le finaliser !`);
          }
        }

        return { name, phone: c.phone!, message };
      });

      // Envoi en masse avec délai anti-rate-limit
      const bulkContacts = contacts.map((c: { name: string; phone: string; message: string }) => ({ name: c.name, phone: c.phone }));
      const results = await sendBulkTextMessages(
        bulkContacts,
        "", // message sera personnalisé par candidat ci-dessous
        token,
        phoneNumberId
      );

      // Envoi individuel avec message personnalisé + traçage DB
      let sent = 0;
      let failed = 0;
      const detailedResults = [];

      for (const contact of contacts) {
        const result = await sendTextMessage(
          { to: contact.phone, text: contact.message },
          token,
          phoneNumberId
        );

        const candidate = targets.find((c: typeof allCandidates[number]) => c.phone === contact.phone);
        if (candidate) {
          await dbBulk.insert(whatsappLogs).values({
            candidateId: candidate.id,
            phone: normalizePhone(contact.phone),
            candidateName: contact.name,
            message: contact.message,
            templateType: input.templateType,
            messageId: result.messageId ?? null,
            status: result.success ? "sent" : "failed",
            errorMessage: result.error ?? null,
            sentBy: ctx.user.id,
            sentAt: Date.now(),
          });
        }

        if (result.success) sent++;
        else failed++;

        detailedResults.push({
          name: contact.name,
          phone: contact.phone,
          success: result.success,
          messageId: result.messageId,
          error: result.error,
        });

        await new Promise((r) => setTimeout(r, 600));
      }

      return {
        total: contacts.length,
        sent,
        failed,
        results: detailedResults,
        message: `Campagne terminée : ${sent} envoyé(s), ${failed} échec(s)`,
      };
    }),

  /**
   * Récupère l'historique des messages envoyés
   */
  getLogs: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(200).default(50),
        candidateId: z.number().optional(),
        status: z.enum(["sent", "failed", "delivered", "read"]).optional(),
        since: z.number().optional(), // timestamp ms
      })
    )
    .query(async ({ input }) => {
      const conditions = [];
      if (input.candidateId) conditions.push(eq(whatsappLogs.candidateId, input.candidateId));
      if (input.status) conditions.push(eq(whatsappLogs.status, input.status));
      if (input.since) conditions.push(gte(whatsappLogs.sentAt, input.since));

      const dbInst = await getDb();
      if (!dbInst) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });
      const logs = await dbInst
        .select()
        .from(whatsappLogs)
        .where(conditions.length ? and(...conditions) : undefined)
        .orderBy(desc(whatsappLogs.sentAt))
        .limit(input.limit);
      return logs;
    }),

  /**
   * Récupère les statistiques d'envoi WhatsApp
   */
  getStats: protectedProcedure.query(async () => {
    const dbInst3 = await getDb();
    if (!dbInst3) return { total: 0, sent: 0, failed: 0, delivered: 0, read: 0, recent: 0 };
    const allLogs = await dbInst3.select().from(whatsappLogs);
    const total = allLogs.length;
    const sent = allLogs.filter((l: { status: string }) => l.status === "sent" || l.status === "delivered" || l.status === "read").length;
    const failed = allLogs.filter((l: { status: string }) => l.status === "failed").length;
    const delivered = allLogs.filter((l: { status: string }) => l.status === "delivered").length;
    const read = allLogs.filter((l: { status: string }) => l.status === "read").length;

    // Messages des 7 derniers jours
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recent = allLogs.filter((l: { sentAt: number }) => l.sentAt > sevenDaysAgo).length;

    return { total, sent, failed, delivered, read, recent };
  }),

  /**
   * Met à jour le statut d'un message (appelé par le webhook)
   */
  updateMessageStatus: protectedProcedure
    .input(
      z.object({
        messageId: z.string(),
        status: z.enum(["sent", "delivered", "read", "failed"]),
      })
    )
    .mutation(async ({ input }) => {
       // Mise à jour du statut dans les logs
      const dbInst2 = await getDb();
      if (!dbInst2) return { success: false };
      const logs = await dbInst2
        .select()
        .from(whatsappLogs)
        .where(eq(whatsappLogs.messageId, input.messageId))
        .limit(1);
      if (logs.length) {
        await dbInst2
          .update(whatsappLogs)
          .set({ status: input.status })
          .where(eq(whatsappLogs.messageId, input.messageId));
      }

      return { success: true };
    }),
});
