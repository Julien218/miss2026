import fs from "node:fs";
import path from "node:path";
import PDFDocument from "pdfkit";
import type { CandidateContract2027Data } from "./candidateContract2027";
import type { ContractSnapshot } from "../../shared/candidate-contract";
import { MEDIA_CHOICES, ORGANIZER_NAME } from "../../shared/candidate-contract";
import { verifyTemplate } from "./candidateContractTemplate";

export async function generateCandidateContractV2(
  data: CandidateContract2027Data,
  snapshot: ContractSnapshot
) {
  if (!verifyTemplate(snapshot.template))
    throw new Error("Modèle contractuel altéré ou non identifié.");
  const doc = new PDFDocument({
    size: "A4",
    margin: 44,
    autoFirstPage: false,
    bufferPages: true,
    info: {
      Title: `Contrat 2027 - ${data.firstName} ${data.lastName}`,
      Author: "STARLIGHT ASBL",
      Subject: snapshot.template.version,
    },
  });
  const assets = (name: string) =>
    [
      path.resolve("client/public", name),
      path.resolve("dist/client", name),
      path.resolve("dist/public", name),
    ].find(fs.existsSync);
  const regular = assets("fonts/contracts/DejaVuSans.ttf");
  const bold = assets("fonts/contracts/DejaVuSans-Bold.ttf");
  if (!regular || !bold) throw new Error("Polices du contrat indisponibles");
  doc.registerFont("Body", regular);
  doc.registerFont("Bold", bold);
  const parts: Buffer[] = [];
  const result = new Promise<Buffer>((resolve, reject) => {
    doc.on("data", p => parts.push(p));
    doc.on("end", () => resolve(Buffer.concat(parts)));
    doc.on("error", reject);
  });
  const date = (value: Date | string | undefined | null) =>
    value
      ? new Intl.DateTimeFormat("fr-BE", {
          dateStyle: "long",
          timeZone: "Europe/Brussels",
        }).format(new Date(value))
      : "En attente";
  const values: Record<string, string> = {
    nom: data.lastName,
    prenom: data.firstName,
    date_naissance: date(data.dateOfBirth),
    gsm: data.phone,
    adresse: `${data.street} ${data.houseNumber}`,
    code_postal: data.postalCode,
    localite: data.city,
    email: data.email,
    lieu_signature: data.city,
    date_signature: data.candidateSignedAt
      ? new Date(data.candidateSignedAt).toISOString()
      : "En attente",
    signature_candidat: data.candidateSignedAt
      ? data.candidateSignatureName
      : "En attente",
    nom_parent: data.guardianFullName || "Non requis",
    signature_parent: data.guardianFullName
      ? data.guardianSignedAt
        ? `${data.guardianSignatureName} — déclaration lors du dépôt`
        : "En attente"
      : "Non requis",
    validation_organisateur: data.organizationSignedAt
      ? `${ORGANIZER_NAME} — ${new Date(data.organizationSignedAt).toISOString()}`
      : "En attente de validation expresse dans le Cockpit",
  };
  let y = 66;
  const newPage = () => {
    doc.addPage();
    y = 66;
  };
  function write(text: string, style = "Normal") {
    text = text.replace(
      /\{\{([^}]+)\}\}/g,
      (_, key) => values[key] || "Non renseigné"
    );
    const heading = style.startsWith("Heading") || style === "Title";
    const size =
      style === "Title" ? 23 : style === "Heading 1" ? 16 : heading ? 11 : 9;
    doc
      .font(heading ? "Bold" : "Body")
      .fontSize(size)
      .fillColor(heading ? "#151719" : "#303438");
    const height = doc.heightOfString(text, { width: 507, lineGap: 2 });
    if (y + height > 774) newPage();
    doc.text(text, 44, y, { width: 507, lineGap: 2 });
    y += height + (heading ? 10 : 7);
  }
  for (
    let pageIndex = 0;
    pageIndex < snapshot.template.pages.length;
    pageIndex++
  ) {
    const page = snapshot.template.pages[pageIndex];
    newPage();
    if (pageIndex === 0) {
      const starlight = assets("contracts/starlight.jpg"),
        mmd = assets("contracts/miss-mister-dour.jpg");
      if (starlight) doc.image(starlight, 44, y, { fit: [110, 55] });
      if (mmd) doc.image(mmd, 455, y, { fit: [65, 65] });
      y += 80;
    }
    let choiceIndex = 0;
    const choices = [
      ...Object.keys(MEDIA_CHOICES).map(
        key => snapshot.media[key as keyof typeof MEDIA_CHOICES]
      ),
      snapshot.newsletter,
    ];
    for (const p of page) {
      let text = p.text;
      if (text.startsWith("☐ Oui   ☐ Non")) {
        const selected = choices[choiceIndex++];
        text = text.replace(
          "☐ Oui   ☐ Non",
          selected ? "[X] Oui   [ ] Non" : "[ ] Oui   [X] Non"
        );
      }
      if (text.startsWith("E-mail :"))
        text = text.replace(
          /Nom public choisi :.*/,
          `Nom public choisi : ${snapshot.publicName}`
        );
      if (text.startsWith("☐ Je confirme"))
        text = text.replace("☐", snapshot.guardianDeclaration ? "[X]" : "[ ]");
      write(text, p.style);
    }
  }
  newPage();
  write("Récapitulatif individuel et preuve des accords", "Heading 1");
  write(
    `Dossier MMD27-${data.applicationId} — ${data.firstName} ${data.lastName}`
  );
  write(
    `Version : ${snapshot.template.version}\nEmpreinte du texte : ${snapshot.template.sha256}`
  );
  for (const [key, label] of Object.entries(MEDIA_CHOICES))
    write(
      `${snapshot.media[key as keyof typeof MEDIA_CHOICES] ? "OUI" : "NON"} — ${label}`
    );
  write(
    `Newsletter : ${snapshot.newsletter ? "OUI" : "NON"}\nDéclaration du représentant légal : ${snapshot.guardianDeclaration ? "recueillie lors du dépôt, identité non certifiée" : "non requise"}`
  );
  write(
    `Candidat : ${values.signature_candidat} — ${values.date_signature}\nReprésentant légal : ${values.signature_parent}\nOrganisateur : ${values.validation_organisateur}`
  );
  write(
    "La présence d’un nom ou d’une image ne remplace pas un acte de validation. Aucun accord facultatif n’est déduit de la signature générale."
  );
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    const bottom = doc.page.margins.bottom;
    doc.page.margins.bottom = 0;
    doc
      .font("Bold")
      .fontSize(7)
      .fillColor("#151719")
      .text("MISS & MISTER DOUR 2027  /  STARLIGHT ASBL", 44, 27, {
        lineBreak: false,
      });
    doc
      .moveTo(44, 44)
      .lineTo(551, 44)
      .strokeColor("#c6ac75")
      .lineWidth(0.7)
      .stroke();
    doc
      .font("Body")
      .fontSize(6.5)
      .fillColor("#606469")
      .text(
        `Automatisé par Js-Innov.IA  •  ${snapshot.template.version}`,
        44,
        808,
        { lineBreak: false }
      );
    doc.text(`${i + 1} / ${range.count}`, 505, 808, { lineBreak: false });
    doc.page.margins.bottom = bottom;
  }
  doc.end();
  return result;
}
