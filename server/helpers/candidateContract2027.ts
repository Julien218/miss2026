import fs from "node:fs";
import path from "node:path";
import PDFDocument from "pdfkit";

export const CANDIDATE_CONTRACT_VERSION = "contract-2027-v1";

export type CandidateContract2027Data = {
  applicationId: number;
  firstName: string;
  lastName: string;
  dateOfBirth: Date | string;
  street: string;
  houseNumber: string;
  postalCode: string;
  city: string;
  height: number;
  weight: number;
  email: string;
  phone: string;
  category: "miss" | "mister";
  candidateSignatureName: string;
  candidateSignedAt: Date;
  guardianFullName?: string | null;
  guardianEmail?: string | null;
  guardianPhone?: string | null;
  guardianSignatureName?: string | null;
  guardianSignedAt?: Date | null;
  organizationSignatureName?: string | null;
  organizationSignedAt?: Date | null;
};

const COLOR = {
  ink: "#17131f",
  muted: "#6d6676",
  gold: "#b88a3e",
  goldLight: "#f4ead3",
  purple: "#6b4bd3",
  line: "#ded8e5",
  paper: "#fffdf9",
  white: "#ffffff",
};

function formatDate(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : new Intl.DateTimeFormat("fr-BE", { dateStyle: "long", timeZone: "Europe/Brussels" }).format(date);
}

function formatTimestamp(value?: Date | null) {
  if (!value) return "En attente";
  return new Intl.DateTimeFormat("fr-BE", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Europe/Brussels",
  }).format(value);
}

function publicAssetPath(relativePath: string) {
  const possible = [
    path.resolve(process.cwd(), "client/public", relativePath),
    path.resolve(process.cwd(), "dist/public", relativePath),
  ];
  return possible.find((candidate) => fs.existsSync(candidate));
}

function addPageBase(doc: PDFKit.PDFDocument, pageNumber: number, reference: string) {
  const bottomMargin = doc.page.margins.bottom;
  doc.page.margins.bottom = 0;
  doc.rect(0, 0, doc.page.width, doc.page.height).fill(COLOR.paper);
  doc.rect(0, 0, doc.page.width, 105).fill(COLOR.ink);
  doc.rect(0, 102, doc.page.width, 3).fill(COLOR.gold);

  const logo = publicAssetPath("logo/miss-mister-dour-logo-transparent.png");
  if (logo) doc.image(logo, 42, 17, { fit: [70, 70], align: "center", valign: "center" });

  doc
    .fillColor(COLOR.white)
    .font("MMD-Sans-Bold")
    .fontSize(8)
    .text("MISS & MISTER DOUR", 126, 31, { characterSpacing: 1.8 });
  doc
    .fillColor("#d8c8f7")
    .font("MMD-Sans")
    .fontSize(7)
    .text("ÉDITION OFFICIELLE 2027 · STARLIGHT ASBL", 126, 47, { characterSpacing: 1.05 });
  doc
    .fillColor("#c5becd")
    .fontSize(7)
    .text(`DOSSIER ${reference}`, 126, 65, { characterSpacing: .65 });

  doc
    .moveTo(42, doc.page.height - 58)
    .lineTo(doc.page.width - 42, doc.page.height - 58)
    .lineWidth(.6)
    .strokeColor(COLOR.line)
    .stroke();
  doc
    .fillColor(COLOR.muted)
    .font("MMD-Sans")
    .fontSize(6.5)
    .text(`${CANDIDATE_CONTRACT_VERSION} · Document généré électroniquement`, 42, doc.page.height - 49, { lineBreak: false, characterSpacing: 0 });
  doc.text(`Page ${pageNumber} / 2`, doc.page.width - 100, doc.page.height - 49, { width: 58, align: "right", lineBreak: false, characterSpacing: 0 });
  doc.page.margins.bottom = bottomMargin;
}

function sectionTitle(doc: PDFKit.PDFDocument, number: string, title: string, y: number) {
  doc.roundedRect(42, y, 25, 18, 4).fill(COLOR.goldLight);
  doc.fillColor(COLOR.gold).font("MMD-Sans-Bold").fontSize(7).text(number, 42, y + 5, { width: 25, align: "center" });
  doc.fillColor(COLOR.ink).font("MMD-Sans-Bold").fontSize(10).text(title, 76, y + 4, { characterSpacing: 0 });
  return y + 25;
}

function paragraph(doc: PDFKit.PDFDocument, text: string, y: number, options: { indent?: number; width?: number } = {}) {
  const indent = options.indent ?? 0;
  const width = options.width ?? doc.page.width - 84 - indent;
  doc.fillColor(COLOR.muted).font("MMD-Sans").fontSize(8.2);
  const height = doc.heightOfString(text, { width, lineGap: 2, align: "justify", characterSpacing: 0 });
  doc.text(text, 42 + indent, y, { width, lineGap: 2, align: "justify", characterSpacing: 0 });
  return y + height + 8;
}

function bullets(doc: PDFKit.PDFDocument, items: string[], y: number) {
  for (const item of items) {
    doc.circle(49, y + 4, 1.7).fill(COLOR.gold);
    y = paragraph(doc, item, y, { indent: 14, width: doc.page.width - 98 });
  }
  return y;
}

function dataRow(doc: PDFKit.PDFDocument, label: string, value: string, x: number, y: number, width: number) {
  doc.fillColor(COLOR.muted).font("MMD-Sans").fontSize(6.4).text(label.toUpperCase(), x, y, { width, characterSpacing: .5 });
  doc.fillColor(COLOR.ink).font("MMD-Sans-Bold").fontSize(8.2).text(value || "—", x, y + 11, { width, characterSpacing: 0 });
}

function signatureCard(
  doc: PDFKit.PDFDocument,
  title: string,
  name: string | null | undefined,
  timestamp: Date | null | undefined,
  x: number,
  y: number,
  width: number,
) {
  doc.roundedRect(x, y, width, 74, 8).fillAndStroke("#faf7ff", COLOR.line);
  doc.fillColor(COLOR.purple).font("MMD-Sans-Bold").fontSize(6.5).text(title.toUpperCase(), x + 12, y + 11, { width: width - 24, characterSpacing: .65 });
  doc.fillColor(COLOR.ink).font("MMD-Serif").fontSize(12).text(name || "En attente", x + 12, y + 28, { width: width - 24, characterSpacing: 0 });
  doc.fillColor(COLOR.muted).font("MMD-Sans").fontSize(6.5).text(formatTimestamp(timestamp), x + 12, y + 54, { width: width - 24, characterSpacing: 0 });
}

export async function generateCandidateContract2027(data: CandidateContract2027Data) {
  const doc = new PDFDocument({ size: "A4", margin: 42, autoFirstPage: false, info: {
    Title: `Contrat candidat 2027 — ${data.firstName} ${data.lastName}`,
    Author: "Starlight ASBL — Miss & Mister Dour",
    Subject: "Contrat de participation à l’élection Miss & Mister Dour 2027",
  } });
  const regularFont = publicAssetPath("fonts/contracts/DejaVuSans.ttf");
  const boldFont = publicAssetPath("fonts/contracts/DejaVuSans-Bold.ttf");
  const serifFont = publicAssetPath("fonts/contracts/DejaVuSerif.ttf");
  if (!regularFont || !boldFont || !serifFont) throw new Error("Contract fonts are unavailable");
  doc.registerFont("MMD-Sans", regularFont);
  doc.registerFont("MMD-Sans-Bold", boldFont);
  doc.registerFont("MMD-Serif", serifFont);
  const chunks: Buffer[] = [];
  doc.on("data", (chunk: Buffer) => chunks.push(chunk));
  const completed = new Promise<Buffer>((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });

  const reference = `MMD27-${String(data.applicationId).padStart(6, "0")}`;
  doc.addPage();
  addPageBase(doc, 1, reference);

  doc.fillColor(COLOR.gold).font("MMD-Sans-Bold").fontSize(7).text("CONTRAT DE PARTICIPATION", 42, 127, { characterSpacing: 1.2 });
  doc.fillColor(COLOR.ink).font("MMD-Sans-Bold").fontSize(21).text("Miss & Mister Dour 2027", 42, 144, { characterSpacing: 0 });
  doc.fillColor(COLOR.muted).font("MMD-Sans").fontSize(7.1).text("Entre Starlight ASBL, organisatrice de l’élection, établie Grand Place n°9 à Dour et représentée par Olivier Trevis, administrateur de l’ASBL et président du comité, et le candidat identifié ci-dessous.", 42, 171, { width: doc.page.width - 84, lineGap: 1.2, characterSpacing: 0 });

  doc.roundedRect(42, 210, doc.page.width - 84, 112, 10).fillAndStroke("#faf7f0", COLOR.line);
  dataRow(doc, "Candidat", `${data.firstName} ${data.lastName}`, 57, 225, 215);
  dataRow(doc, "Catégorie", data.category === "miss" ? "Miss" : "Mister", 310, 225, 90);
  dataRow(doc, "Date de naissance", formatDate(data.dateOfBirth), 57, 262, 215);
  dataRow(doc, "Taille / poids", `${data.height} cm · ${data.weight} kg`, 310, 262, 150);
  dataRow(doc, "Adresse", `${data.street} ${data.houseNumber}, ${data.postalCode} ${data.city}`, 57, 295, 255);
  dataRow(doc, "Contact", `${data.email} · ${data.phone}`, 335, 295, 175);

  let y = sectionTitle(doc, "01", "Objet du contrat", 343);
  y = paragraph(doc, "Le présent contrat définit les conditions de participation du candidat à l’élection de Miss & Mister Dour, organisée le 13 mars 2027.", y);

  y = sectionTitle(doc, "02", "Conditions de participation", y + 3);
  y = bullets(doc, [
    "Être âgé de 16 ans minimum et de 26 ans maximum.",
    "N’être ni marié ni divorcé.",
    "Résider dans la région de Dour ou dans un périmètre maximal de 20 km.",
    "Ne pas avoir d’antécédents judiciaires.",
  ], y);

  y = sectionTitle(doc, "03", "Obligations du candidat", y + 2);
  y = bullets(doc, [
    "Participer aux répétitions et événements préparatoires communiqués par l’organisateur, ainsi qu’aux générales prévues les 10, 11 et 12 mars 2027.",
    "Respecter les consignes concernant les tenues, les horaires et le déroulement de l’élection.",
    "Adopter une attitude respectueuse et professionnelle envers les candidats, l’organisation, le jury, les sponsors et le public.",
    "Accorder à l’organisateur le droit d’utiliser son nom, son image et sa voix pour la promotion et la communication liées à l’élection, sans rémunération supplémentaire.",
  ], y);

  doc.addPage();
  addPageBase(doc, 2, reference);
  y = sectionTitle(doc, "04", "Droits du candidat", 126);
  y = bullets(doc, [
    "Bénéficier d’un accompagnement et de conseils par l’équipe de l’organisateur.",
    "Bénéficier d’une assurance responsabilité civile pendant la durée des événements relatifs à l’élection.",
  ], y);

  y = sectionTitle(doc, "05", "Confidentialité", y + 1);
  y = paragraph(doc, "Le candidat s’engage à ne pas divulguer d’informations confidentielles concernant l’organisation de l’événement, ni à les utiliser à des fins personnelles ou commerciales.", y);

  y = sectionTitle(doc, "06", "Disqualification", y + 1);
  y = paragraph(doc, "Le candidat peut être disqualifié en cas de non-respect du présent contrat ou de comportement inapproprié. En cas de disqualification, le candidat renonce à toute réclamation ou compensation.", y);

  y = sectionTitle(doc, "07", "Assurances et responsabilités", y + 1);
  y = paragraph(doc, "L’organisateur veille à la sécurité des candidats lors des événements officiels. Il n’est toutefois pas responsable des dommages ou pertes de biens personnels. Le candidat est invité à souscrire une assurance personnelle si nécessaire.", y);

  y = sectionTitle(doc, "08", "Durée et résiliation", y + 1);
  y = paragraph(doc, "Le présent contrat prend effet à compter de sa signature par les parties et se termine automatiquement à l’issue de l’élection. L’organisateur peut le résilier en cas de non-respect des obligations du candidat.", y);

  y = sectionTitle(doc, "09", "Litiges", y + 1);
  y = paragraph(doc, "Tout litige relatif à l’interprétation ou à l’exécution du présent contrat sera soumis aux tribunaux compétents de Mons.", y);

  doc.moveTo(42, y + 1).lineTo(doc.page.width - 42, y + 1).lineWidth(.7).strokeColor(COLOR.line).stroke();
  doc.fillColor(COLOR.ink).font("MMD-Sans-Bold").fontSize(9).text("Signatures et traçabilité", 42, y + 13, { characterSpacing: 0 });
  doc.fillColor(COLOR.muted).font("MMD-Sans").fontSize(7).text("La saisie du nom complet constitue une signature électronique simple. La date, l’heure et l’empreinte technique du dépôt sont conservées avec le dossier.", 42, y + 29, { width: doc.page.width - 84, lineGap: 1.5, characterSpacing: 0 });

  const signatureY = y + 62;
  const gap = 10;
  const cardWidth = (doc.page.width - 84 - gap) / 2;
  signatureCard(doc, "Candidat", data.candidateSignatureName, data.candidateSignedAt, 42, signatureY, cardWidth);
  signatureCard(
    doc,
    data.guardianFullName ? "Représentant légal" : "Représentant légal · non requis",
    data.guardianSignatureName,
    data.guardianSignedAt,
    42 + cardWidth + gap,
    signatureY,
    cardWidth,
  );
  signatureCard(doc, "Pour Starlight ASBL", data.organizationSignatureName, data.organizationSignedAt, 42, signatureY + 84, doc.page.width - 84);

  doc.end();
  return completed;
}
