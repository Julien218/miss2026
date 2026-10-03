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
  const siteUrl = (
    process.env.PUBLIC_BASE_URL || "https://www.missetmisterdour.be"
  ).replace(/\/$/, "");
  const safeResetUrl = escapeHtml(resetUrl);
  const safeSiteUrl = escapeHtml(siteUrl);

  const subject = "Miss & Mister Dour — Réinitialisation du mot de passe";
  const text = [
    "Miss & Mister Dour — Réinitialisation du mot de passe",
    "",
    "Vous avez demandé à modifier le mot de passe de votre espace.",
    "Le lien ci-dessous est valable pendant 1 heure et ne peut être utilisé qu’une seule fois :",
    "",
    resetUrl,
    "",
    "Si vous n’êtes pas à l’origine de cette demande, vous pouvez ignorer cet e-mail. Votre mot de passe actuel restera inchangé.",
    "",
    "Miss & Mister Dour",
    siteUrl,
    "STARLIGHT ASBL · Grand’Place 9 · 7370 Dour · Belgique",
  ].join("\n");

  const html = `<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="light">
  <title>Réinitialisation du mot de passe</title>
</head>
<body style="margin:0;padding:0;background:#f4f1ec;color:#24211d;font-family:Arial,Helvetica,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
    Lien sécurisé valable 1 heure pour modifier votre mot de passe Miss &amp; Mister Dour.
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;background:#f4f1ec;">
    <tr>
      <td align="center" style="padding:36px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background:#ffffff;border:1px solid #e4ddd3;">
          <tr>
            <td style="padding:30px 34px 20px;border-bottom:3px solid #b58a50;">
              <p style="margin:0 0 8px;font-size:11px;line-height:18px;letter-spacing:1.8px;color:#8b6b42;font-weight:700;">MISS &amp; MISTER DOUR · ÉDITION 2027</p>
              <h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:28px;line-height:36px;font-weight:400;color:#1f1c18;">Réinitialiser votre mot de passe</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:30px 34px;">
              <p style="margin:0 0 16px;font-size:16px;line-height:26px;color:#3f3932;">Bonjour,</p>
              <p style="margin:0 0 24px;font-size:15px;line-height:25px;color:#5c554d;">Une demande de modification du mot de passe a été enregistrée pour votre espace sécurisé Miss &amp; Mister Dour.</p>

              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 26px;">
                <tr>
                  <td bgcolor="#b58a50" style="background:#b58a50;border-radius:4px;">
                    <a href="${safeResetUrl}" style="display:inline-block;padding:14px 22px;font-size:15px;line-height:20px;font-weight:700;color:#ffffff;text-decoration:none;">Choisir un nouveau mot de passe</a>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 12px;font-size:13px;line-height:21px;color:#766e65;">Ce lien est valable <strong>1 heure</strong> et ne peut être utilisé qu’une seule fois.</p>
              <p style="margin:0 0 24px;font-size:13px;line-height:21px;color:#766e65;">Si vous n’avez pas demandé cette modification, ignorez simplement cet e-mail. Votre mot de passe actuel restera inchangé.</p>

              <div style="height:1px;background:#eee8df;margin:24px 0;"></div>

              <p style="margin:0 0 8px;font-size:12px;line-height:19px;color:#8a837b;">Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :</p>
              <p style="margin:0;font-size:12px;line-height:19px;word-break:break-all;"><a href="${safeResetUrl}" style="color:#7c5d36;text-decoration:underline;">${safeResetUrl}</a></p>
            </td>
          </tr>
          <tr>
            <td style="padding:22px 34px;background:#faf8f5;border-top:1px solid #eee8df;">
              <p style="margin:0 0 6px;font-size:12px;line-height:19px;color:#6f675f;"><strong>Miss &amp; Mister Dour</strong> · STARLIGHT ASBL</p>
              <p style="margin:0 0 6px;font-size:12px;line-height:19px;color:#8a837b;">Grand’Place 9 · 7370 Dour · Belgique</p>
              <p style="margin:0;font-size:12px;line-height:19px;"><a href="${safeSiteUrl}" style="color:#7c5d36;text-decoration:none;">${safeSiteUrl}</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const payload = {
    from,
    to: [email],
    reply_to: "olivier.trevis@outlook.be",
    subject,
    text,
    html,
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
