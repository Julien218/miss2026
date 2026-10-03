function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY manquante");

  const from =
    process.env.RESEND_FROM_EMAIL ||
    "Miss & Mister Dour <invitations@missetmisterdour.be>";

  const safeResetUrl = escapeHtml(resetUrl);

  const payload = {
    from,
    to: [email],
    reply_to: "olivier.trevis@outlook.be",
    subject: "Réinitialisation de votre mot de passe — Miss & Mister Dour",
    text: [
      "Miss & Mister Dour 2027",
      "",
      "Une demande de réinitialisation de votre mot de passe a été reçue.",
      "Pour choisir un nouveau mot de passe, ouvrez ce lien :",
      resetUrl,
      "",
      "Ce lien est valable 1 heure et ne peut être utilisé qu’une seule fois.",
      "Si vous n’êtes pas à l’origine de cette demande, vous pouvez ignorer cet e-mail.",
      "",
      "STARLIGHT ASBL · Grand’Place 9 · 7370 Dour · Belgique",
    ].join("\n"),
    html: `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Réinitialisation de votre mot de passe</title>
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
              <p style="font-family:Georgia,'Times New Roman',serif;font-size:24px;line-height:31px;color:#fffaf2;margin-top:0;margin-right:0;margin-bottom:0;margin-left:0;">Réinitialisation du mot de passe</p>
            </td>
          </tr>
          <tr>
            <td style="padding-top:30px;padding-right:28px;padding-bottom:28px;padding-left:28px;">
              <p style="font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:25px;color:#2b2722;margin-top:0;margin-right:0;margin-bottom:16px;margin-left:0;">Bonjour,</p>
              <p style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:24px;color:#4f4942;margin-top:0;margin-right:0;margin-bottom:22px;margin-left:0;">Une demande de réinitialisation a été reçue pour votre espace Miss &amp; Mister Dour.</p>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
                <tr>
                  <td bgcolor="#d5b06c" align="center" style="background-color:#d5b06c;border-radius:4px;">
                    <a href="${safeResetUrl}" style="display:inline-block;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:22px;font-weight:700;color:#17130f;text-decoration:none;padding-top:13px;padding-right:24px;padding-bottom:13px;padding-left:24px;">Choisir un nouveau mot de passe</a>
                  </td>
                </tr>
              </table>
              <p style="font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:21px;color:#756d64;margin-top:24px;margin-right:0;margin-bottom:8px;margin-left:0;">Ce lien est valable 1 heure et ne peut être utilisé qu’une seule fois.</p>
              <p style="font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:21px;color:#756d64;margin-top:0;margin-right:0;margin-bottom:20px;margin-left:0;">Si le bouton ne fonctionne pas, copiez cette adresse dans votre navigateur :</p>
              <p style="font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:20px;color:#5e554d;word-break:break-all;margin-top:0;margin-right:0;margin-bottom:24px;margin-left:0;"><a href="${safeResetUrl}" style="font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:20px;color:#72562a;text-decoration:underline;">${safeResetUrl}</a></p>
              <p style="font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:21px;color:#756d64;margin-top:0;margin-right:0;margin-bottom:0;margin-left:0;">Si vous n’êtes pas à l’origine de cette demande, aucune action n’est nécessaire.</p>
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
    throw new Error(
      `Resend API ${response.status}: ${details || response.statusText}`
    );
  }
}
