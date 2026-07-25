/**
 * Email helper module - Miss & Mister Dour 2026
 * Provides email sending and template building functions.
 * Currently uses notifyOwner as fallback; can be extended with SMTP/SendGrid later.
 */

import { notifyOwner } from "../_core/notification";

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
 * Send an email notification.
 * Currently logs and notifies the owner; extend with real SMTP when needed.
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    console.log(`[Email] Sending to ${options.to}: ${options.subject}`);
    // Fallback: notify owner about the email
    await notifyOwner({
      title: `Email: ${options.subject}`,
      content: `To: ${options.to}\n${options.text || options.html.substring(0, 200)}`,
    });
    return true;
  } catch (error) {
    console.error("[Email] Failed to send:", error);
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
