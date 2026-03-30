/**
 * WhatsApp Business API Service — Meta Cloud API
 * Miss & Mister Dour 2026 — JS-Innov.IA
 *
 * Documentation: https://developers.facebook.com/docs/whatsapp/cloud-api
 */

const META_API_URL = "https://graph.facebook.com/v19.0";

export interface WBAMessageResult {
  success: boolean;
  messageId?: string;
  error?: string;
  status?: string;
}

export interface WBAContact {
  name: string;
  phone: string; // Format international sans + : "32494119090"
}

export interface WBATemplateMessage {
  to: string;
  templateName: string;
  languageCode?: string;
  components?: WBATemplateComponent[];
}

export interface WBATemplateComponent {
  type: "header" | "body" | "button";
  parameters: WBAParameter[];
}

export interface WBAParameter {
  type: "text" | "image" | "document" | "video";
  text?: string;
  image?: { link: string };
}

export interface WBATextMessage {
  to: string;
  text: string;
  previewUrl?: boolean;
}

export interface WBABulkResult {
  total: number;
  sent: number;
  failed: number;
  results: Array<{ phone: string; name: string; success: boolean; messageId?: string; error?: string }>;
}

/**
 * Normalise un numéro de téléphone belge/international pour l'API Meta
 * Exemples : +32494119090 → 32494119090 | 0494119090 → 32494119090
 */
export function normalizePhone(phone: string): string {
  let cleaned = phone.replace(/[\s\-\(\)\.]/g, "");
  if (cleaned.startsWith("+")) cleaned = cleaned.slice(1);
  if (cleaned.startsWith("0")) cleaned = "32" + cleaned.slice(1);
  return cleaned;
}

/**
 * Envoie un message texte libre via WhatsApp Business API
 * Note : les messages texte libres ne peuvent être envoyés qu'en réponse à un message entrant (fenêtre 24h)
 * Pour les messages proactifs, utiliser sendTemplateMessage()
 */
export async function sendTextMessage(
  msg: WBATextMessage,
  token: string,
  phoneNumberId: string
): Promise<WBAMessageResult> {
  try {
    const phone = normalizePhone(msg.to);
    const body = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: phone,
      type: "text",
      text: {
        preview_url: msg.previewUrl ?? false,
        body: msg.text,
      },
    };

    const response = await fetch(`${META_API_URL}/${phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json() as any;

    if (!response.ok) {
      return {
        success: false,
        error: data?.error?.message ?? `HTTP ${response.status}`,
      };
    }

    return {
      success: true,
      messageId: data?.messages?.[0]?.id,
      status: data?.messages?.[0]?.message_status ?? "sent",
    };
  } catch (err: any) {
    return { success: false, error: err?.message ?? "Erreur réseau" };
  }
}

/**
 * Envoie un message template approuvé Meta (pour les messages proactifs)
 * Les templates doivent être créés et approuvés dans Meta Business Manager
 */
export async function sendTemplateMessage(
  msg: WBATemplateMessage,
  token: string,
  phoneNumberId: string
): Promise<WBAMessageResult> {
  try {
    const phone = normalizePhone(msg.to);
    const body = {
      messaging_product: "whatsapp",
      to: phone,
      type: "template",
      template: {
        name: msg.templateName,
        language: { code: msg.languageCode ?? "fr" },
        components: msg.components ?? [],
      },
    };

    const response = await fetch(`${META_API_URL}/${phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json() as any;

    if (!response.ok) {
      return {
        success: false,
        error: data?.error?.message ?? `HTTP ${response.status}`,
      };
    }

    return {
      success: true,
      messageId: data?.messages?.[0]?.id,
      status: data?.messages?.[0]?.message_status ?? "sent",
    };
  } catch (err: any) {
    return { success: false, error: err?.message ?? "Erreur réseau" };
  }
}

/**
 * Récupère la liste des templates approuvés pour ce compte WhatsApp Business
 */
export async function listApprovedTemplates(
  token: string,
  wabaId: string
): Promise<{ name: string; status: string; language: string; category: string }[]> {
  try {
    const response = await fetch(
      `${META_API_URL}/${wabaId}/message_templates?fields=name,status,language,category&limit=50`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const data = await response.json() as any;
    return data?.data ?? [];
  } catch {
    return [];
  }
}

/**
 * Envoie un message texte en masse à une liste de contacts
 * Utilise un délai de 500ms entre chaque envoi pour respecter les rate limits Meta
 */
export async function sendBulkTextMessages(
  contacts: WBAContact[],
  messageText: string,
  token: string,
  phoneNumberId: string
): Promise<WBABulkResult> {
  const results: WBABulkResult["results"] = [];
  let sent = 0;
  let failed = 0;

  for (const contact of contacts) {
    const result = await sendTextMessage(
      { to: contact.phone, text: messageText },
      token,
      phoneNumberId
    );

    results.push({
      phone: contact.phone,
      name: contact.name,
      success: result.success,
      messageId: result.messageId,
      error: result.error,
    });

    if (result.success) sent++;
    else failed++;

    // Délai anti-rate-limit Meta (500ms entre chaque message)
    await new Promise((r) => setTimeout(r, 500));
  }

  return { total: contacts.length, sent, failed, results };
}

/**
 * Vérifie le token Meta et retourne les infos du compte WhatsApp Business
 */
export async function verifyWhatsAppAccount(
  token: string,
  phoneNumberId: string
): Promise<{ valid: boolean; displayName?: string; phoneNumber?: string; error?: string }> {
  try {
    const response = await fetch(
      `${META_API_URL}/${phoneNumberId}?fields=display_phone_number,verified_name,quality_rating`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const data = await response.json() as any;

    if (!response.ok) {
      return { valid: false, error: data?.error?.message ?? "Token invalide" };
    }

    return {
      valid: true,
      displayName: data?.verified_name,
      phoneNumber: data?.display_phone_number,
    };
  } catch (err: any) {
    return { valid: false, error: err?.message ?? "Erreur réseau" };
  }
}

/**
 * Templates de messages officiels Miss & Mister Dour
 * Ces textes sont utilisés pour les messages proactifs (hors fenêtre 24h)
 * Ils doivent correspondre aux templates approuvés dans Meta Business Manager
 */
export const OFFICIAL_MESSAGE_TEMPLATES = {
  profile_reminder: (candidateName: string, completionRate: number, missingFields: string[], profileUrl: string) =>
    `Bonjour ${candidateName} 👑\n\nNous avons remarqué que votre profil Miss & Mister Dour 2026 est complété à ${completionRate}%.\n\nChamps manquants :\n${missingFields.map((f) => `• ${f}`).join("\n")}\n\nComplétez votre profil ici :\n${profileUrl}\n\nUn profil complet maximise vos chances de sélection. ✨\n\nCordialement,\nJulien P.\nBy Js-Innov.IA`,

  vote_reminder: (candidateName: string, voteCount: number, profileUrl: string) =>
    `Bonjour ${candidateName} 👑\n\nVotre compteur de votes Miss & Mister Dour 2026 est à ${voteCount} vote${voteCount > 1 ? "s" : ""}.\n\nPartagez votre lien personnel pour augmenter vos chances :\n${profileUrl}\n\nChaque vote compte ! 🌟\n\nCordialement,\nJulien P.\nBy Js-Innov.IA`,

  event_reminder: (candidateName: string, eventName: string, eventDate: string, eventLocation: string) =>
    `Bonjour ${candidateName} 👑\n\nRappel important : ${eventName}\n📅 ${eventDate}\n📍 ${eventLocation}\n\nVotre présence est obligatoire. En cas d'empêchement, contactez-nous immédiatement.\n\nCordialement,\nJulien P.\nBy Js-Innov.IA`,

  welcome: (candidateName: string, profileUrl: string) =>
    `Bienvenue ${candidateName} 👑\n\nVotre inscription Miss & Mister Dour 2026 a bien été enregistrée !\n\nVotre espace personnel :\n${profileUrl}\n\nComplétez votre profil pour maximiser vos chances de sélection.\n\nNous vous souhaitons la meilleure des chances ! ✨\n\nCordialement,\nJulien P.\nBy Js-Innov.IA`,

  congratulations: (candidateName: string, title: string) =>
    `Félicitations ${candidateName} 🏆\n\nNous avons l'honneur de vous annoncer que vous avez été sélectionné(e) comme ${title} Miss & Mister Dour 2026 !\n\nDes informations complémentaires vous seront communiquées prochainement.\n\nToutes nos félicitations ! 🌟\n\nCordialement,\nJulien P.\nBy Js-Innov.IA`,

  urgent: (candidateName: string, message: string) =>
    `⚠️ URGENT — ${candidateName}\n\n${message}\n\nMerci de nous contacter rapidement.\n\nCordialement,\nJulien P.\nBy Js-Innov.IA`,

  custom: (candidateName: string, message: string) =>
    `Bonjour ${candidateName} 👑\n\n${message}\n\nCordialement,\nJulien P.\nBy Js-Innov.IA`,
} as const;
