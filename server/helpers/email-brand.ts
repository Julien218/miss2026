export const EMAIL_SITE = "https://www.missetmisterdour.be";
export function escapeEmailHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

/** Email-safe tables, inline colors and a plain-text identity when images are blocked. */
export function brandEmail(html: string): string {
  if (html.includes('data-mmd-email="2027"')) return html;
  const content = html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i)?.[1] || html;
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Miss &amp; Mister Dour</title></head>
<body data-mmd-email="2027" style="margin:0;padding:0;background-color:#0A0A0F;font-family:Arial,Helvetica,sans-serif;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" bgcolor="#0A0A0F"><tr><td align="center" style="padding:28px 12px;">
<!--[if mso]><table role="presentation" width="600"><tr><td><![endif]-->
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;border:1px solid #C87941;background-color:#fffaf3;">
<tr><td align="center" bgcolor="#111015" style="padding:24px;border-bottom:2px solid #C87941;">
<img src="${EMAIL_SITE}/logo/miss-mister-dour-logo-transparent.png" width="150" alt="Logo officiel Miss &amp; Mister Dour" style="display:block;width:150px;max-width:100%;height:auto;border:0;">
<p style="font-family:Georgia,serif;font-size:24px;line-height:32px;color:#E8D5B7;margin:12px 0 4px;">Miss &amp; Mister Dour</p>
<p style="font-size:11px;letter-spacing:3px;line-height:18px;color:#D4AF37;margin:0;">ÉDITION 2027</p></td></tr>
<tr><td bgcolor="#fffaf3" style="padding:28px 24px;color:#29211c;font-size:15px;line-height:25px;">${content}</td></tr>
<tr><td align="center" bgcolor="#171317" style="padding:20px 18px;border-top:1px solid #C87941;">
<p style="font-size:12px;line-height:19px;color:#E8D5B7;margin:0 0 5px;">STARLIGHT ASBL · Grand’Place 9 · 7370 Dour · Belgique</p>
<p style="font-size:12px;line-height:19px;margin:0;"><a href="${EMAIL_SITE}" style="color:#E8D5B7;text-decoration:underline;">missetmisterdour.be</a></p>
<p style="font-size:11px;line-height:18px;color:#b6aaa2;margin:14px 0 0;">Avec le soutien technique de <a href="https://jsinnovia.com" style="color:#b6aaa2;text-decoration:none;">Js-Innov.IA</a></p>
</td></tr></table><!--[if mso]></td></tr></table><![endif]--></td></tr></table></body></html>`;
}

export function brandEmailText(text: string): string {
  return `${text.trim()}\n\n—\nMiss & Mister Dour · Édition 2027\nSTARLIGHT ASBL · Grand’Place 9 · 7370 Dour · Belgique\n${EMAIL_SITE}\nAvec le soutien technique de Js-Innov.IA`;
}

export function emailButton(url: string, label: string): string {
  const safeUrl = escapeEmailHtml(url);
  return `<table role="presentation" cellpadding="0" cellspacing="0"><tr><td bgcolor="#C87941" style="padding:12px 20px;"><a href="${safeUrl}" style="color:#17120e;font-weight:bold;text-decoration:none;">${escapeEmailHtml(label)}</a></td></tr></table><p style="font-size:12px;word-break:break-all;">Ou ouvrez ce lien : <a href="${safeUrl}" style="color:#84512c;">${safeUrl}</a></p>`;
}
