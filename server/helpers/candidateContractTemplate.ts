import crypto from "node:crypto";
import { CONTRACT_SOURCE_PAGES } from "../../shared/candidate-contract-source";
import {
  CONTRACT_BASE_VERSION,
  CONTRACT_SETUP_FIELDS,
  type ContractTemplate,
} from "../../shared/candidate-contract";

export function publishTemplate(
  values: string[],
  userId: number
): ContractTemplate {
  if (
    values.length !== CONTRACT_SETUP_FIELDS.length ||
    values.some(
      value =>
        typeof value !== "string" ||
        value.trim().length < 3 ||
        value.length > 4000 ||
        /\[|à compléter|à renseigner/i.test(value)
    )
  ) {
    throw new Error(
      "Complétez chaque rubrique du modèle, ou indiquez Néant lorsqu’elle ne s’applique pas."
    );
  }
  if (
    [0, 1, 2, 3, 4, 5, 11, 12, 13, 14, 15, 16].some(index =>
      /^(néant|neant|non applicable|aucun)$/i.test(values[index].trim())
    )
  )
    throw new Error(
      "L’identité, le règlement, l’encadrement, l’assurance et les traitements de données doivent être renseignés explicitement."
    );
  let index = 0;
  const pages = CONTRACT_SOURCE_PAGES.map(page =>
    page.map(p => {
      let text: string = p.text;
      if (text.includes("[")) {
        if (text.startsWith("Partenaire bénéficiaire,")) {
          text = `Partenaire bénéficiaire, support et finalité : ${values[17].trim()}.`;
        } else {
          text = text.replace(/\[[^\]]+\]/g, () => values[index++].trim());
        }
      }
      text = text.replace(
        "Annexe D à compléter avant signature",
        "Annexe D complétée par l’Organisateur"
      );
      return { text, style: p.style };
    })
  );
  if (index !== CONTRACT_SETUP_FIELDS.length)
    throw new Error("Le modèle doit être revérifié avant publication.");
  const sha256 = crypto
    .createHash("sha256")
    .update(JSON.stringify(pages))
    .digest("hex");
  return {
    pages,
    sha256,
    version: `MMD27-v2-${sha256.slice(0, 20)}`,
    publishedAt: new Date().toISOString(),
    publishedBy: userId,
    values: values.map(value => value.trim()),
  };
}

export function verifyTemplate(template: ContractTemplate) {
  return (
    template.version === `MMD27-v2-${template.sha256.slice(0, 20)}` &&
    template.sha256 ===
      crypto
        .createHash("sha256")
        .update(JSON.stringify(template.pages))
        .digest("hex")
  );
}

export const draftContract = {
  version: CONTRACT_BASE_VERSION,
  pages: CONTRACT_SOURCE_PAGES,
};
