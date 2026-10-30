import { sendEmail } from "../helpers/email";
import { emailButton, escapeEmailHtml as escape } from "../helpers/email-brand";

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrateur",
  super_admin: "Super Administrateur",
  photographe: "Photographe",
  jury: "Jury",
  manager: "Manager",
  directeur: "Directeur",
  candidat: "Candidat",
  viewer: "Observateur",
};

export async function sendInvitationEmail(to: string, inviteUrl: string, role: string, inviterName: string): Promise<boolean> {
  const label = ROLE_LABELS[role] || role;
  return sendEmail({ to, subject: "Invitation à votre espace — Miss & Mister Dour 2027",
    html: `<h1 style="font-family:Georgia,serif;color:#84512c;">Votre invitation personnelle</h1><p>Bonjour,</p><p>${escape(inviterName)} vous invite à rejoindre l’espace Miss &amp; Mister Dour 2027.</p><p>Rôle prévu : <strong>${escape(label)}</strong></p>${emailButton(inviteUrl, "Créer mon accès personnel")}<p>Ce lien est personnel. Ne le transférez pas à une autre personne.</p><p>Si cette invitation ne vous concerne pas, vous pouvez ignorer cet email.</p>`,
    text: `${inviterName} vous invite à rejoindre l’espace Miss & Mister Dour 2027 en tant que ${label}.\n${inviteUrl}\nCe lien est personnel. Ne le transférez pas. Si cette invitation ne vous concerne pas, ignorez cet email.` });
}
