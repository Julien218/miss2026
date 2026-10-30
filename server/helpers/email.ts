/**
 * Email helper module - Miss & Mister Dour 2026
 * Sends transactional emails via Resend, with legacy Forge compatibility.
 */

import { ENV } from "../_core/env";
import { randomUUID } from "node:crypto";
import { brandEmail, brandEmailText, emailButton, escapeEmailHtml as escape } from "./email-brand";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  idempotencyKey?: string;
  attachments?: Array<{ filename: string; content: string; contentType: string }>;
}

interface CommentNotificationData {
  candidateName: string;
  commenterName: string;
  commentContent: string;
  candidateUrl: string;
}

export function emailProvider(): "resend" | "forge" | null {
  if (process.env.RESEND_API_KEY?.trim()) return "resend";
  return ENV.forgeApiUrl && ENV.forgeApiKey ? "forge" : null;
}

async function sendResendEmail(options: EmailOptions): Promise<boolean> {
  const key = options.idempotencyKey || randomUUID();
  const payload = {
    from: process.env.RESEND_FROM_EMAIL || "Miss & Mister Dour <inscriptions@missetmisterdour.be>",
    to: [options.to],
    reply_to: "olivier.trevis@outlook.be",
    subject: options.subject,
    html: options.html,
    ...(options.text ? { text: options.text } : {}),
    ...(options.attachments?.length ? { attachments: options.attachments.map(file => ({ filename: file.filename, content: file.content, content_type: file.contentType })) } : {}),
  };
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json", "Idempotency-Key": key },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(10_000),
      });
      if (response.ok) {
        const data = await response.json().catch(() => null);
        if (typeof data?.id !== "string" || !/^[0-9a-f-]{36}$/i.test(data.id)) {
          console.error("[Email] Resend returned an invalid acceptance receipt");
          return false;
        }
        console.info("[Email] Resend accepted message", data.id);
        return true;
      }
      console.error("[Email] Resend rejected request", response.status);
      if (response.status !== 429 && response.status < 500) return false;
    } catch {
      console.error("[Email] Resend request interrupted");
    }
    if (attempt < 2) await new Promise(resolve => setTimeout(resolve, 1000 * 2 ** attempt));
  }
  return false;
}

/** Resend failures never fall through to a second provider (duplicate risk). */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  options = { ...options, html: brandEmail(options.html), ...(options.text ? { text: brandEmailText(options.text) } : {}) };
  if (emailProvider() === "resend") return sendResendEmail(options);
  if (!ENV.forgeApiUrl || !ENV.forgeApiKey) {
    console.warn("[Email] Forge API not configured — email not sent to", options.to);
    return false;
  }

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
      body: JSON.stringify({
        to: options.to,
        subject: options.subject,
        html: options.html,
        ...(options.attachments?.length ? { attachments: options.attachments } : {}),
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error(`[Email] Failed to send to ${options.to} (${res.status}): ${detail}`);
      return false;
    }

    console.log(`[Email] Successfully sent to ${options.to}: ${options.subject}`);
    return true;
  } catch (error) {
    console.error("[Email] Error sending email:", error);
    return false;
  }
}

export function buildCommentNotificationEmail(data: CommentNotificationData) {
  const subject = `Nouveau commentaire sur ${data.candidateName} — Miss & Mister Dour`;
  return { subject,
    html: `<h1 style="color:#84512c;font-family:Georgia,serif;">Nouveau commentaire</h1><p><strong>${escape(data.commenterName)}</strong> a commenté sur ${escape(data.candidateName)}.</p><blockquote style="border-left:3px solid #C87941;padding-left:14px;">${escape(data.commentContent)}</blockquote>${emailButton(data.candidateUrl, "Voir le profil")}`,
    text: `Nouveau commentaire sur ${data.candidateName}\n${data.commenterName} : ${data.commentContent}\n${data.candidateUrl}` };
}

export function buildPhotoApprovedEmail(data: { photoTitle: string; photoUrl: string; galleryUrl: string; recipientName?: string }) {
  return { subject: "Votre photo a été approuvée — Miss & Mister Dour",
    html: `<h1 style="color:#84512c;font-family:Georgia,serif;">Photo approuvée</h1><p>Bonjour ${escape(data.recipientName || "")},</p><p>Votre photo <strong>${escape(data.photoTitle)}</strong> est maintenant visible dans la galerie publique.</p><img src="${escape(data.photoUrl)}" alt="${escape(data.photoTitle)}" width="500" style="width:100%;max-width:500px;height:auto;">${emailButton(data.galleryUrl, "Voir la galerie")}`,
    text: `Votre photo "${data.photoTitle}" a été approuvée.\nVoir la galerie : ${data.galleryUrl}` };
}

export function buildGalleryUpdateEmail(data: { photoCount: number; galleryUrl: string; recipientName?: string }) {
  return { subject: "Nouvelles photos dans la galerie — Miss & Mister Dour",
    html: `<h1 style="color:#84512c;font-family:Georgia,serif;">La galerie s’enrichit</h1><p>Bonjour ${escape(data.recipientName || "")},</p><p>${data.photoCount} nouvelle(s) photo(s) ont été ajoutées à la galerie.</p>${emailButton(data.galleryUrl, "Découvrir les photos")}<p style="font-size:12px;"><a href="${escape(data.galleryUrl)}?unsubscribe=1" style="color:#6b5547;">Se désabonner</a></p>`,
    text: `${data.photoCount} nouvelle(s) photo(s) dans la galerie.\n${data.galleryUrl}\nSe désabonner : ${data.galleryUrl}?unsubscribe=1` };
}
