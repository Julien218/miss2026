/**
 * notifications.ts — Router tRPC pour le système de notifications
 * Gestion des paramètres (super_admin) + journal + envoi automatique
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { eq, desc, and, isNull } from "drizzle-orm";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { notificationSettings, notificationsLog, users } from "../../drizzle/schema";
import { ENV } from "../_core/env";

// ─── Middleware super_admin ───────────────────────────────────────────────────
const superAdminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "super_admin" && ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Accès réservé aux administrateurs" });
  }
  return next({ ctx });
});

const strictSuperAdminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "super_admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Accès réservé aux super_admin" });
  }
  return next({ ctx });
});

// ─── Helper : envoyer un email via l'API Forge ────────────────────────────────
async function sendEmailViaForge(to: string, subject: string, html: string): Promise<boolean> {
  try {
    const res = await fetch(`${ENV.forgeApiUrl}/api/email/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ENV.forgeApiKey}`,
      },
      body: JSON.stringify({ to, subject, html }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// ─── Helper : dispatcher une notification ────────────────────────────────────
export async function dispatchNotification(params: {
  eventType: string;
  title: string;
  body: string;
  recipientType: "admin" | "candidate" | "super_admin";
  recipientUserId?: number;
  recipientEmail?: string;
  context?: Record<string, unknown>;
  priority?: "low" | "normal" | "high" | "urgent";
}) {
  try {
    const db = await getDb();
    if (!db) return;

    // Vérifier si ce type de notification est activé
    const [setting] = await db
      .select()
      .from(notificationSettings)
      .where(eq(notificationSettings.eventType, params.eventType))
      .limit(1);

    if (!setting || !setting.isActive) return;

    const priority = params.priority || setting.priority;

    // Insérer dans le journal
    await db.insert(notificationsLog).values({
      eventType: params.eventType,
      recipientType: params.recipientType,
      recipientUserId: params.recipientUserId ?? null,
      recipientEmail: params.recipientEmail ?? null,
      title: params.title,
      body: params.body,
      emailSent: 0,
      dashboardSent: setting.dashboardEnabled,
      status: "pending",
      context: params.context ? JSON.stringify(params.context) : null,
      priority,
    });

    // Envoyer email si activé et email disponible
    if (setting.emailEnabled && params.recipientEmail) {
      const subject = setting.emailSubjectTemplate
        ? setting.emailSubjectTemplate.replace("{title}", params.title)
        : `👑 Miss & Mister Dour 2026 — ${params.title}`;

      const html = buildNotificationEmail(params.title, params.body, priority);
      const sent = await sendEmailViaForge(params.recipientEmail, subject, html);

      if (sent) {
        // Marquer comme envoyé dans le dernier log
        await db
          .update(notificationsLog)
          .set({ emailSent: 1, status: "sent" })
          .where(
            and(
              eq(notificationsLog.eventType, params.eventType),
              eq(notificationsLog.status, "pending")
            )
          );
      }
    }
  } catch (err) {
    console.error("[notifications] dispatchNotification error:", err);
  }
}

function buildNotificationEmail(title: string, body: string, priority: string): string {
  const priorityColor =
    priority === "urgent" ? "#ef4444" :
    priority === "high"   ? "#f59e0b" :
    priority === "normal" ? "#d4af37" : "#6b7280";

  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Georgia,serif;">
  <div style="max-width:600px;margin:40px auto;background:#111;border:1px solid #d4af37;border-radius:16px;overflow:hidden;">
    <div style="background:linear-gradient(135deg,#1a1a1a,#0a0a0a);padding:32px;text-align:center;border-bottom:1px solid #d4af37;">
      <div style="font-size:28px;margin-bottom:8px;">👑</div>
      <h1 style="color:#d4af37;font-size:20px;margin:0;">Miss &amp; Mister Dour 2026</h1>
      <p style="color:#888;font-size:12px;margin:4px 0 0;">Notification STARLIGHT ASBL</p>
    </div>
    <div style="padding:32px;">
      <div style="display:inline-block;background:${priorityColor}22;border:1px solid ${priorityColor};border-radius:20px;padding:4px 12px;margin-bottom:16px;">
        <span style="color:${priorityColor};font-size:11px;font-weight:bold;text-transform:uppercase;">${priority}</span>
      </div>
      <h2 style="color:#fff;font-size:18px;margin:0 0 16px;">${title}</h2>
      <p style="color:#ccc;font-size:14px;line-height:1.7;margin:0 0 24px;">${body}</p>
      <a href="https://missetmisterdour.be/admin" style="display:inline-block;background:linear-gradient(135deg,#d4af37,#f0d060);color:#000;font-weight:bold;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:14px;">
        Voir le dashboard →
      </a>
    </div>
    <div style="padding:20px 32px;border-top:1px solid #222;text-align:center;">
      <p style="color:#555;font-size:11px;margin:0;">STARLIGHT ASBL — Grand'Place 9, 7370 Dour — BCE: BE 1012.267.056</p>
    </div>
  </div>
</body>
</html>`;
}

// ─── Router ───────────────────────────────────────────────────────────────────
export const notificationsRouter = router({

  // ─── SUPER_ADMIN : Lire tous les paramètres de notification ───────────────
  getSettings: superAdminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    return db.select().from(notificationSettings).orderBy(notificationSettings.category, notificationSettings.priority);
  }),

  // ─── SUPER_ADMIN : Mettre à jour un paramètre ─────────────────────────────
  updateSetting: strictSuperAdminProcedure
    .input(z.object({
      eventType: z.string(),
      isActive: z.boolean().optional(),
      emailEnabled: z.boolean().optional(),
      dashboardEnabled: z.boolean().optional(),
      priority: z.enum(["low", "normal", "high", "urgent"]).optional(),
      emailSubjectTemplate: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const updateData: Partial<typeof notificationSettings.$inferInsert> = { updatedBy: ctx.user.id };
      if (input.isActive !== undefined) updateData.isActive = input.isActive ? 1 : 0;
      if (input.emailEnabled !== undefined) updateData.emailEnabled = input.emailEnabled ? 1 : 0;
      if (input.dashboardEnabled !== undefined) updateData.dashboardEnabled = input.dashboardEnabled ? 1 : 0;
      if (input.priority !== undefined) updateData.priority = input.priority;
      if (input.emailSubjectTemplate !== undefined) updateData.emailSubjectTemplate = input.emailSubjectTemplate;

      await db
        .update(notificationSettings)
        .set(updateData)
        .where(eq(notificationSettings.eventType, input.eventType));

      return { success: true };
    }),

  // ─── ADMIN : Lire le journal des notifications ────────────────────────────
  getLog: superAdminProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(50),
      status: z.enum(["pending", "sent", "failed", "read", "all"]).default("all"),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const query = db
        .select()
        .from(notificationsLog)
        .orderBy(desc(notificationsLog.createdAt))
        .limit(input.limit);

      if (input.status !== "all") {
        return db
          .select()
          .from(notificationsLog)
          .where(eq(notificationsLog.status, input.status as "pending" | "sent" | "failed" | "read"))
          .orderBy(desc(notificationsLog.createdAt))
          .limit(input.limit);
      }

      return query;
    }),

  // ─── ADMIN : Compter les notifications non lues ───────────────────────────
  getUnreadCount: superAdminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    const rows = await db
      .select()
      .from(notificationsLog)
      .where(
        and(
          eq(notificationsLog.status, "sent"),
          isNull(notificationsLog.readAt)
        )
      );

    return { count: rows.length };
  }),

  // ─── ADMIN : Marquer une notification comme lue ───────────────────────────
  markAsRead: superAdminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      await db
        .update(notificationsLog)
        .set({ status: "read", readAt: new Date() })
        .where(eq(notificationsLog.id, input.id));

      return { success: true };
    }),

  // ─── ADMIN : Marquer toutes les notifications comme lues ─────────────────
  markAllAsRead: superAdminProcedure.mutation(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    await db
      .update(notificationsLog)
      .set({ status: "read", readAt: new Date() })
      .where(eq(notificationsLog.status, "sent"));

    return { success: true };
  }),

  // ─── SUPER_ADMIN : Envoyer une notification manuelle ─────────────────────
  sendManual: strictSuperAdminProcedure
    .input(z.object({
      title: z.string().min(1).max(200),
      body: z.string().min(1),
      recipientType: z.enum(["admin", "candidate", "super_admin"]),
      recipientEmail: z.string().email().optional(),
      priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      // Insérer dans le journal
      await db.insert(notificationsLog).values({
        eventType: "manual",
        recipientType: input.recipientType,
        recipientUserId: ctx.user.id,
        recipientEmail: input.recipientEmail ?? null,
        title: input.title,
        body: input.body,
        emailSent: 0,
        dashboardSent: 1,
        status: "sent",
        priority: input.priority,
        context: JSON.stringify({ sentBy: ctx.user.id, manual: true }),
      });

      // Envoyer email si fourni
      let emailSent = false;
      if (input.recipientEmail) {
        const html = buildNotificationEmail(input.title, input.body, input.priority);
        emailSent = await sendEmailViaForge(
          input.recipientEmail,
          `👑 Miss & Mister Dour 2026 — ${input.title}`,
          html
        );
      }

      return { success: true, emailSent };
    }),

  // ─── ADMIN : Récupérer les notifications pour l'utilisateur connecté ──────
  getMyNotifications: protectedProcedure
    .input(z.object({ limit: z.number().default(20) }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      return db
        .select()
        .from(notificationsLog)
        .where(eq(notificationsLog.recipientUserId, ctx.user.id))
        .orderBy(desc(notificationsLog.createdAt))
        .limit(input.limit);
    }),
});
