function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

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

export async function sendInvitationEmail(
  to: string,
  inviteUrl: string,
  role: string,
  inviterName: string
): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("[Email] RESEND_API_KEY manquante pour l’invitation");
    return false;
  }

  const from =
    process.env.RESEND_FROM_EMAIL ||
    "Miss & Mister Dour <invitations@missetmisterdour.be>";

  const roleLabel = ROLE_LABELS[role] || role;
  const safeInviteUrl = escapeHtml(inviteUrl);
  const safeRole = escapeHtml(roleLabel);
  const safeInviter = escapeHtml(inviterName);

  const payload = {
    from,
    to: [to],
    reply_to: "olivier.trevis@outlook.be",
    subject: "Invitation à votre espace — Miss & Mister Dour 2027",
    text: [
      "Miss & Mister Dour 2027",
      "",
      `${inviterName} vous invite à rejoindre l’espace Miss & Mister Dour 2027 en tant que ${roleLabel}.`,
      "",
      "Pour créer votre accès personnel, ouvrez ce lien :",
      inviteUrl,
      "",
      "Ce lien est personnel. Ne le transférez pas à une autre personne.",
      "Si cette invitation ne vous concerne pas, vous pouvez ignorer cet e-mail.",
      "",
      "STARLIGHT ASBL · Grand’Place 9 · 7370 Dour · Belgique",
    ].join("\n"),
    html: `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Invitation Miss &amp; Mister Dour 2027</title>
</head>
<body style="margin:0;background-color:#f5f3ef;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f5f3ef;">
    <tr>
      <td align="center" style="padding-top:32px;padding-right:16px;padding-bottom:32px;padding-left:16px;">
        <!--[if mso]><table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background-color:#ffffff;border:1px solid #e7e1d8;">
          <tr>
            <td bgcolor="#17130f" style="background-color:#17130f;padding-top:24px;padding-right:28px;padding-bottom:24px;padding-left:28px;">
              <p style="font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;color:#d7b77a;letter-spacing:1.5px;margin-top:0;margin-right:0;margin-bottom:7px;margin-left:0;">MISS &amp; MISTER DOUR · ÉDITION 2027</p>
              <p style="font-family:Georgia,'Times New Roman',serif;font-size:24px;line-height:31px;color:#fffaf2;margin-top:0;margin-right:0;margin-bottom:0;margin-left:0;">Votre invitation personnelle</p>
            </td>
          </tr>
          <tr>
            <td style="padding-top:30px;padding-right:28px;padding-bottom:28px;padding-left:28px;">
              <p style="font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:25px;color:#2b2722;margin-top:0;margin-right:0;margin-bottom:14px;margin-left:0;">Bonjour,</p>
              <p style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:24px;color:#4f4942;margin-top:0;margin-right:0;margin-bottom:18px;margin-left:0;"><strong style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:24px;color:#2b2722;">${safeInviter}</strong> vous invite à rejoindre l’espace Miss &amp; Mister Dour 2027.</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td bgcolor="#f7f4ef" style="background-color:#f7f4ef;border-left:3px solid #d5b06c;padding-top:14px;padding-right:16px;padding-bottom:14px;padding-left:16px;">
                    <p style="font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;color:#7b736b;letter-spacing:1px;margin-top:0;margin-right:0;margin-bottom:4px;margin-left:0;">RÔLE PRÉVU</p>
                    <p style="font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:24px;color:#2b2722;margin-top:0;margin-right:0;margin-bottom:0;margin-left:0;">${safeRole}</p>
                  </td>
                </tr>
              </table>
              <p style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:23px;color:#5d554d;margin-top:20px;margin-right:0;margin-bottom:22px;margin-left:0;">Ouvrez votre invitation pour créer votre accès personnel et choisir votre mot de passe.</p>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
                <tr>
                  <td bgcolor="#d5b06c" align="center" style="background-color:#d5b06c;border-radius:4px;">
                    <a href="${safeInviteUrl}" style="display:inline-block;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:22px;font-weight:700;color:#17130f;text-decoration:none;padding-top:13px;padding-right:24px;padding-bottom:13px;padding-left:24px;">Ouvrir mon invitation</a>
                  </td>
                </tr>
              </table>
              <p style="font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:21px;color:#756d64;margin-top:24px;margin-right:0;margin-bottom:8px;margin-left:0;">Ce lien est personnel. Ne le transférez pas à une autre personne.</p>
              <p style="font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:21px;color:#756d64;margin-top:0;margin-right:0;margin-bottom:8px;margin-left:0;">Si le bouton ne fonctionne pas, copiez cette adresse dans votre navigateur :</p>
              <p style="font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:20px;color:#5e554d;word-break:break-all;margin-top:0;margin-right:0;margin-bottom:22px;margin-left:0;"><a href="${safeInviteUrl}" style="font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:20px;color:#72562a;text-decoration:underline;">${safeInviteUrl}</a></p>
              <p style="font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:21px;color:#756d64;margin-top:0;margin-right:0;margin-bottom:0;margin-left:0;">Si cette invitation ne vous concerne pas, aucune action n’est nécessaire.</p>
            </td>
          </tr>
          <tr>
            <td bgcolor="#f7f4ef" style="background-color:#f7f4ef;border-top:1px solid #e7e1d8;padding-top:18px;padding-right:28px;padding-bottom:18px;padding-left:28px;">
              <p style="font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:19px;color:#7b736b;margin-top:0;margin-right:0;margin-bottom:0;margin-left:0;text-align:center;">STARLIGHT ASBL · Grand’Place 9 · 7370 Dour · Belgique</p>
            </td>
          </tr>
        </table>
        <!--[if mso]></td></tr></table><![endif]-->
      </td>
    </tr>
  </table>
</body>
</html>`,
  };

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const details = await response.text().catch(() => "");
      console.error(
        `[Email] Resend invitation failed (${response.status}): ${details || response.statusText}`
      );
      return false;
    }

    return true;
  } catch (error) {
    console.error("[Email] Invitation send failed:", error);
    return false;
  }
}
