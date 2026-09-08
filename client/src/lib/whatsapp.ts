/**
 * Module WhatsApp officiel — Miss & Mister Dour 2026
 * Centralise la génération de liens wa.me, les templates de messages
 * et les utilitaires de communication WhatsApp.
 *
 * Signature automatique : Julien P. / By Js-Innov.IA
 */

import { BRANDING } from "@/config/branding";

// ─── Types ───────────────────────────────────────────────────────────────────

export type WhatsAppTemplateType =
  | "profil_incomplet"
  | "rappel_vote"
  | "invitation_evenement"
  | "rappel_soiree"
  | "felicitations"
  | "urgence_document"
  | "info_generale"
  | "bienvenue"
  | "personnalise";

export interface CandidateInfo {
  firstName: string;
  lastName: string;
  phone?: string | null;
  profileUrl?: string;
  completionScore?: number;
  missingFields?: string[];
  category?: string;
}

export interface WhatsAppMessage {
  type: WhatsAppTemplateType;
  label: string;
  emoji: string;
  description: string;
  generate: (candidate: CandidateInfo, customText?: string) => string;
}

// ─── Signature officielle ─────────────────────────────────────────────────────

const SIGNATURE = `\n\n---\n✨ *Julien P.*\n_By Js-Innov.IA_`;

const EVENT_DATE = BRANDING.closingNight?.dateDisplay ?? "date à confirmer";
const EVENT_LABEL = BRANDING.closingNight?.label ?? "Miss & Mister Dour";
const EVENT_VENUE = BRANDING.closingNight?.venue ?? "Dour, Belgique";

// ─── Templates officiels ──────────────────────────────────────────────────────

export const WHATSAPP_TEMPLATES: WhatsAppMessage[] = [
  {
    type: "bienvenue",
    label: "Message de bienvenue",
    emoji: "🎉",
    description: "Accueillir un nouveau candidat inscrit",
    generate: (c) =>
      `🎉 *Bienvenue dans l'aventure Miss & Mister Dour 2026 !*\n\nBonjour ${c.firstName},\n\nNous sommes ravis de vous compter parmi les candidat(e)s de cette édition exceptionnelle.\n\n📋 *Votre prochaine étape :* Complétez votre profil pour être visible par le jury et le public.\n${c.profileUrl ? `\n🔗 Votre espace personnel :\n${c.profileUrl}\n` : ""}\nN'hésitez pas à nous contacter pour toute question.${SIGNATURE}`,
  },
  {
    type: "profil_incomplet",
    label: "Rappel profil incomplet",
    emoji: "📋",
    description: "Relancer un candidat dont le profil est incomplet",
    generate: (c) => {
      const score = c.completionScore ?? 0;
      const missing = c.missingFields?.slice(0, 3).join(", ") ?? "plusieurs champs";
      return `📋 *Rappel — Profil Miss & Mister Dour 2026*\n\nBonjour ${c.firstName},\n\nVotre profil est actuellement complété à *${score}%*. Pour maximiser vos chances auprès du jury, nous vous invitons à compléter les informations manquantes : _${missing}_.\n${c.profileUrl ? `\n🔗 Accéder à votre profil :\n${c.profileUrl}\n` : ""}\n⏰ Plus votre profil est complet, plus vous avez de chances d'être sélectionné(e) !${SIGNATURE}`;
    },
  },
  {
    type: "rappel_vote",
    label: "Rappel votes",
    emoji: "🗳️",
    description: "Encourager le candidat à mobiliser ses proches pour voter",
    generate: (c) =>
      `🗳️ *Mobilisez vos proches — Votes Miss & Mister Dour 2026*\n\nBonjour ${c.firstName},\n\nLes votes du public sont ouverts ! Partagez votre profil à votre entourage pour maximiser vos chances.\n${c.profileUrl ? `\n🔗 Lien de vote pour ${c.firstName} :\n${c.profileUrl}\n` : ""}\n💡 *Rappel :* Le vote public représente 30% de la note finale. Chaque voix compte !\n\nBonne chance ! 🌟${SIGNATURE}`,
  },
  {
    type: "invitation_evenement",
    label: "Invitation événement",
    emoji: "📅",
    description: "Inviter le candidat à un événement du concours",
    generate: (c) =>
      `📅 *Invitation officielle — Miss & Mister Dour 2026*\n\nBonjour ${c.firstName},\n\nNous avons le plaisir de vous convier à un événement officiel du concours.\n\nMerci de confirmer votre présence en répondant à ce message ou en contactant l'organisation.\n\nÀ très bientôt ! 🎭${SIGNATURE}`,
  },
  {
    type: "rappel_soiree",
    label: `Rappel soirée ${EVENT_LABEL}`,
    emoji: "🎤",
    description: "Rappel de la soirée de clôture Miss & Mister Dour",
    generate: (c) =>
      `🎤 *${EVENT_LABEL} — Rappel soirée de clôture*\n\nBonjour ${c.firstName},\n\nNous vous rappelons que la grande soirée de clôture *Miss & Mister Dour* aura lieu le :\n\n📅 *${EVENT_DATE}*\n📍 *${EVENT_VENUE}*\n\nVeuillez vous assurer d'être présent(e) à l'heure. Tenue de soirée exigée.\n\nNous avons hâte de vous retrouver pour cette nuit exceptionnelle ! ✨${SIGNATURE}`,
  },
  {
    type: "felicitations",
    label: "Félicitations",
    emoji: "🏆",
    description: "Féliciter un candidat pour ses résultats ou sa sélection",
    generate: (c) =>
      `🏆 *Félicitations ${c.firstName} !*\n\nNous avons le grand plaisir de vous informer d'une excellente nouvelle concernant votre participation au concours *Miss & Mister Dour 2026*.\n\nVotre engagement et votre talent ont été remarqués. Nous vous contacterons très prochainement pour vous communiquer tous les détails.\n\nBravo et continuez ainsi ! 🌟✨${SIGNATURE}`,
  },
  {
    type: "urgence_document",
    label: "Urgence document manquant",
    emoji: "⚠️",
    description: "Demander en urgence un document manquant au dossier",
    generate: (c) =>
      `⚠️ *Action requise — Dossier Miss & Mister Dour 2026*\n\nBonjour ${c.firstName},\n\nNous avons constaté qu'il manque un ou plusieurs documents à votre dossier de candidature.\n\n🔴 *Votre dossier ne pourra pas être traité sans ces éléments.*\n\nMerci de nous transmettre les pièces manquantes dans les plus brefs délais en répondant à ce message ou via votre espace personnel.${c.profileUrl ? `\n\n🔗 ${c.profileUrl}` : ""}${SIGNATURE}`,
  },
  {
    type: "info_generale",
    label: "Information générale",
    emoji: "ℹ️",
    description: "Envoyer une information générale à un candidat",
    generate: (c) =>
      `ℹ️ *Information officielle — Miss & Mister Dour 2026*\n\nBonjour ${c.firstName},\n\nNous souhaitons vous informer d'une mise à jour importante concernant le concours.\n\nMerci de prendre connaissance de ce message et de nous contacter si vous avez des questions.\n\nCordialement,${SIGNATURE}`,
  },
  {
    type: "personnalise",
    label: "Message personnalisé",
    emoji: "✍️",
    description: "Rédiger un message entièrement personnalisé",
    generate: (c, customText) =>
      `${customText ?? `Bonjour ${c.firstName},\n\n[Votre message ici]`}${SIGNATURE}`,
  },
];

// ─── Utilitaires ──────────────────────────────────────────────────────────────

/**
 * Normalise un numéro de téléphone belge ou international
 * pour le format wa.me (sans +, sans espaces)
 */
export function normalizePhone(phone: string): string {
  let normalized = phone.replace(/[\s\-\(\)\.]/g, "");
  if (normalized.startsWith("0032")) normalized = "32" + normalized.slice(4);
  else if (normalized.startsWith("+32")) normalized = "32" + normalized.slice(3);
  else if (normalized.startsWith("0")) normalized = "32" + normalized.slice(1);
  else if (normalized.startsWith("+")) normalized = normalized.slice(1);
  return normalized;
}

/**
 * Génère un lien wa.me avec message pré-rempli
 */
export function buildWhatsAppLink(phone: string, message: string): string {
  const normalized = normalizePhone(phone);
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${normalized}?text=${encoded}`;
}

/**
 * Génère un lien wa.me sans numéro (partage général)
 */
export function buildWhatsAppShareLink(message: string): string {
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

/**
 * Génère un lien QR code pour un lien WhatsApp
 * Utilise l'API QR code publique de Google Charts
 */
export function buildWhatsAppQRCode(whatsappLink: string, size = 200): string {
  return `https://chart.googleapis.com/chart?chs=${size}x${size}&cht=qr&chl=${encodeURIComponent(whatsappLink)}&choe=UTF-8`;
}

/**
 * Retourne le template par type
 */
export function getTemplate(type: WhatsAppTemplateType): WhatsAppMessage | undefined {
  return WHATSAPP_TEMPLATES.find((t) => t.type === type);
}

/**
 * Génère le message complet pour un candidat donné
 */
export function generateMessage(
  type: WhatsAppTemplateType,
  candidate: CandidateInfo,
  customText?: string
): string {
  const template = getTemplate(type);
  if (!template) return "";
  return template.generate(candidate, customText);
}
