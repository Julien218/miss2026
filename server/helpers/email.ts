/**
 * Email helper module - Miss & Mister Dour 2026
 * Sends real emails via the Forge API.
 */

import { ENV } from "../_core/env";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface CommentNotificationData {
  candidateName: string;
  commenterName: string;
  commentContent: string;
  candidateUrl: string;
}

/**
 * Send an email via the Forge API.
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
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

/**
 * Build an HTML email for comment notifications.
 */
export function buildCommentNotificationEmail(data: CommentNotificationData): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = `Nouveau commentaire sur ${data.candidateName} — Miss & Mister Dour 2026`;

  const html = `
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0A0A0A; color: #FFFFFF; padding: 32px; border-radius: 12px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #D4AF37; font-size: 24px; margin: 0;">Miss & Mister Dour 2026</h1>
      </div>
      <div style="background: rgba(212, 175, 55, 0.1); border: 1px solid rgba(212, 175, 55, 0.3); border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <h2 style="color: #D4AF37; font-size: 18px; margin: 0 0 12px 0;">Nouveau commentaire</h2>
        <p style="color: #B0B0B0; margin: 0 0 8px 0;"><strong style="color: #FFFFFF;">${data.commenterName}</strong> a commenté sur <strong style="color: #D4AF37;">${data.candidateName}</strong></p>
        <blockquote style="border-left: 3px solid #D4AF37; padding-left: 12px; margin: 12px 0; color: #E0E0E0; font-style: italic;">
          ${data.commentContent}
        </blockquote>
      </div>
      <div style="text-align: center;">
        <a href="${data.candidateUrl}" style="display: inline-block; background: linear-gradient(135deg, #D4AF37, #B8941E); color: #000000; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
          Voir le profil
        </a>
      </div>
      <div style="text-align: center; margin-top: 24px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.1);">
        <p style="color: #666; font-size: 12px; margin: 0;">Créé par Pagin Julien — Dour, Belgique</p>
        <p style="color: #666; font-size: 12px; margin: 4px 0 0 0;">© 2026 Js-Innov.IA — Tous droits réservés</p>
      </div>
    </div>
  `;

  const text = `Nouveau commentaire sur ${data.candidateName}\n\n${data.commenterName} a écrit:\n"${data.commentContent}"\n\nVoir le profil: ${data.candidateUrl}`;

  return { subject, html, text };
}

/**
 * Build an HTML email for gallery photo approval notification.
 */
export function buildPhotoApprovedEmail(data: {
  photoTitle: string;
  photoUrl: string;
  galleryUrl: string;
  recipientName?: string;
}): { subject: string; html: string; text: string } {
  const subject = `Votre photo a été approuvée — Miss & Mister Dour 2026`;
  const name = data.recipientName || "Bonjour";

  const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#0A0A0F;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0A0A0F;padding:40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#111;border-radius:16px;border:1px solid #C87941;overflow:hidden;max-width:600px;">
<tr><td style="background:linear-gradient(135deg,#1a0f08,#2a1a0a);padding:40px;text-align:center;border-bottom:2px solid #C87941;">
<p style="color:#C87941;font-size:12px;letter-spacing:4px;text-transform:uppercase;margin:0 0 8px;">MISS &amp; MISTER DOUR 2026</p>
<h1 style="color:#E8D5B7;font-size:24px;margin:0;">Photo approuvée</h1>
</td></tr>
<tr><td style="padding:40px;text-align:center;">
<img src="${data.photoUrl}" alt="${data.photoTitle}" style="max-width:100%;border-radius:12px;margin-bottom:24px;" />
<p style="color:#E8D5B7;font-size:16px;margin:0 0 8px;">${name},</p>
<p style="color:#ccc;font-size:15px;line-height:1.7;margin:0 0 24px;">
Votre photo <strong style="color:#C87941;">${data.photoTitle}</strong> a été approuvée et est maintenant visible dans la galerie publique.
</p>
<table cellpadding="0" cellspacing="0" style="margin:0 auto 32px;">
<tr><td style="background:linear-gradient(135deg,#C87941,#D4956A);border-radius:12px;">
<a href="${data.galleryUrl}" style="display:block;padding:16px 40px;color:#0A0A0F;font-weight:700;font-size:16px;text-decoration:none;">Voir la galerie</a>
</td></tr></table>
</td></tr>
<tr><td style="background:#0a0a0a;padding:20px;text-align:center;border-top:1px solid #222;">
<p style="color:#444;font-size:11px;margin:0;">STARLIGHT ASBL · Grand'Place 9, 7370 Dour · © 2026 Miss &amp; Mister Dour</p>
</td></tr></table></td></tr></table></body></html>`;

  const text = `Votre photo "${data.photoTitle}" a été approuvée.\nVoir la galerie: ${data.galleryUrl}`;
  return { subject, html, text };
}

/**
 * Build an HTML email for new gallery photo notification to subscribers.
 */
export function buildGalleryUpdateEmail(data: {
  photoCount: number;
  galleryUrl: string;
  recipientName?: string;
}): { subject: string; html: string; text: string } {
  const subject = `Nouvelles photos dans la galerie — Miss & Mister Dour 2026`;
  const name = data.recipientName || "Bonjour";

  const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#0A0A0F;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0A0A0F;padding:40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#111;border-radius:16px;border:1px solid #C87941;overflow:hidden;max-width:600px;">
<tr><td style="background:linear-gradient(135deg,#1a0f08,#2a1a0a);padding:40px;text-align:center;border-bottom:2px solid #C87941;">
<p style="color:#C87941;font-size:12px;letter-spacing:4px;text-transform:uppercase;margin:0 0 8px;">MISS &amp; MISTER DOUR 2026</p>
<h1 style="color:#E8D5B7;font-size:24px;margin:0;">Galerie mise à jour</h1>
</td></tr>
<tr><td style="padding:40px;text-align:center;">
<p style="color:#E8D5B7;font-size:16px;margin:0 0 8px;">${name},</p>
<p style="color:#ccc;font-size:15px;line-height:1.7;margin:0 0 24px;">
<strong style="color:#C87941;">${data.photoCount} nouvelle(s) photo(s)</strong> viennent d'être ajoutées à la galerie Miss &amp; Mister Dour 2026.
</p>
<table cellpadding="0" cellspacing="0" style="margin:0 auto 32px;">
<tr><td style="background:linear-gradient(135deg,#C87941,#D4956A);border-radius:12px;">
<a href="${data.galleryUrl}" style="display:block;padding:16px 40px;color:#0A0A0F;font-weight:700;font-size:16px;text-decoration:none;">Découvrir les photos</a>
</td></tr></table>
</td></tr>
<tr><td style="background:#0a0a0a;padding:20px;text-align:center;border-top:1px solid #222;">
<p style="color:#444;font-size:11px;margin:0;">STARLIGHT ASBL · Grand'Place 9, 7370 Dour · © 2026 Miss &amp; Mister Dour</p>
<p style="color:#444;font-size:11px;margin:4px 0 0;"><a href="${data.galleryUrl}?unsubscribe=1" style="color:#666;">Se désabonner</a></p>
</td></tr></table></td></tr></table></body></html>`;

  const text = `${data.photoCount} nouvelle(s) photo(s) dans la galerie.\nVoir: ${data.galleryUrl}`;
  return { subject, html, text };
}
