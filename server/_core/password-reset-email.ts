import { sendEmail } from "../helpers/email";
import { emailButton } from "../helpers/email-brand";

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  const accepted = await sendEmail({ to: email, subject: "Réinitialisation de votre mot de passe — Miss & Mister Dour",
    html: `<h1 style="font-family:Georgia,serif;color:#84512c;">Retrouver votre accès</h1><p>Bonjour,</p><p>Une demande de réinitialisation a été reçue pour votre espace Miss &amp; Mister Dour.</p>${emailButton(resetUrl, "Choisir un nouveau mot de passe")}<p>Ce lien est valable 1 heure et ne peut être utilisé qu’une seule fois.</p><p>Si vous n’êtes pas à l’origine de cette demande, aucune action n’est nécessaire.</p>`,
    text: `Une demande de réinitialisation a été reçue pour votre espace Miss & Mister Dour.\n${resetUrl}\nCe lien est valable 1 heure et ne peut être utilisé qu’une seule fois. Si vous n’êtes pas à l’origine de cette demande, ignorez cet email.` });
  if (!accepted) throw new Error("Email de réinitialisation non accepté par le service d’envoi");
}
