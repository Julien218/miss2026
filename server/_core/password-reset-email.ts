import { Resend } from "resend";

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY manquante");
  const resend = new Resend(apiKey);
  const from = process.env.RESEND_FROM_EMAIL || "Miss & Mister Dour 2027 <invitations@missetmisterdour.be>";
  const { error } = await resend.emails.send({
    from,
    to: email,
    replyTo: "olivier.trevis@outlook.be",
    subject: "Miss & Mister Dour — Réinitialisation de votre mot de passe",
    text: `Réinitialisez votre mot de passe Miss & Mister Dour avec ce lien valable 1 heure :\n\n${resetUrl}\n\nSi vous n’êtes pas à l’origine de cette demande, ignorez cet e-mail.`,
    html: `<!doctype html><html><body style="margin:0;background:#080706;color:#f7f0e4;font-family:Arial,Helvetica,sans-serif"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="padding:40px 16px"><table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:#15110e;border:1px solid #4b3b29"><tr><td style="padding:40px"><p style="font-size:12px;line-height:18px;color:#d4a36f;letter-spacing:2px">MISS &amp; MISTER DOUR · ÉDITION 2027</p><h1 style="font-size:30px;line-height:38px;color:#fff7eb">Réinitialiser votre mot de passe</h1><p style="font-size:16px;line-height:25px;color:#c8b9aa">Une demande de réinitialisation a été effectuée pour votre espace sécurisé.</p><table cellpadding="0" cellspacing="0" border="0"><tr><td bgcolor="#d2a06e" style="background-color:#d2a06e;padding:14px 24px;border-radius:8px"><a href="${resetUrl}" style="font-size:16px;line-height:20px;color:#100d0a;text-decoration:none;font-weight:bold">Choisir un nouveau mot de passe</a></td></tr></table><p style="font-size:13px;line-height:21px;color:#897b6e;margin-top:28px">Ce lien expire dans 1 heure et ne peut être utilisé qu’une seule fois.</p></td></tr></table></td></tr></table></body></html>`
  });
  if (error) throw new Error(error.message);
}
