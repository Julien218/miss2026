export const CONTRACT_BASE_VERSION = "MMD-2027-CANDIDAT-v2.0";
export const ELECTION_DATE = "2027-05-22";
export const ORGANIZER_NAME = "Olivier TREVIS";
export const ORGANIZER_EMAIL = "olivier.trevis@outlook.be";
export const MEDIA_CHOICES = {
  capture: "Photos, vidéos et voix pendant les activités officielles annoncées",
  profile: "Portrait et nom public sur le site et l’application officiels",
  print: "Programme, affiches, écrans de scène et classement avec images",
  social: "Publications organiques Facebook, Instagram et TikTok officiels",
  live: "Retransmission en direct du gala sur les canaux identifiés",
  advertising: "Campagnes publicitaires payantes de l’Organisateur",
  partners: "Usage par les seuls partenaires identifiés dans le contrat",
  archives: "Archives historiques publiques jusqu’au 22 mai 2032",
} as const;
export type MediaChoices = Record<keyof typeof MEDIA_CHOICES, boolean>;
export const NO_MEDIA: MediaChoices = {
  capture: false,
  profile: false,
  print: false,
  social: false,
  live: false,
  advertising: false,
  partners: false,
  archives: false,
};
export type ContractParagraph = { text: string; style: string };
export type ContractTemplate = {
  version: string;
  sha256: string;
  pages: ContractParagraph[][];
  publishedAt: string;
  publishedBy: number;
  values?: string[];
};
export type ContractSnapshot = {
  template: ContractTemplate;
  media: MediaChoices;
  newsletter: boolean;
  guardianDeclaration: boolean;
  publicName: string;
  acceptedAt?: string;
};
export const MEDIA_SCHEMA_KEYS = Object.keys(
  MEDIA_CHOICES
) as (keyof MediaChoices)[];

// These are organizer facts, not values to infer from the applicant's acceptance.
export const CONTRACT_SETUP_FIELDS = [
  "Identité BCE, siège et pouvoir du représentant vérifiés le",
  "Règlement remis : titre, version, date et copie durable",
  "Catégories, périmètre géographique et mode de calcul",
  "Lieu du gala, lieux et horaires confirmés des répétitions",
  "Référent sécurité et autre administrateur pour les signalements",
  "Encadrement, transports et départs des mineurs",
  "Frais d’inscription, cotisation, achats, tenues, caution",
  "Billets, ventes, sponsoring : caractère obligatoire ou facultatif, minimum et destination des fonds",
  "Dépenses prises en charge, prix et avantages promis",
  "Paiement, retrait, report, annulation et remboursement",
  "Rétractation si applicable : informations et formulaire remis, ou exception légalement vérifiée et expliquée",
  "Assureur, numéro de police et attestation",
  "Période, activités, personnes couvertes et territoire",
  "RC, accident individuel éventuel, exclusions, plafonds et franchises",
  "Procédure et contact pour déclarer un sinistre",
  "Hébergement, inscription, stockage, e-mail et signature : noms, rôles, pays et garanties de transfert",
  "Réseaux et comptes officiels effectivement utilisés, retransmission prévue",
  "Partenaires bénéficiaires d’images : identité, supports, finalité et choix distinct A3",
  "Avenant de mandat : dates, activités, charge, frais, avantages, fin et retrait du titre",
] as const;

export function ageAt(birthDate: string, at: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) return -1;
  const birth = new Date(`${birthDate}T12:00:00Z`);
  if (
    !Number.isFinite(birth.getTime()) ||
    birth.toISOString().slice(0, 10) !== birthDate ||
    birthDate > at
  )
    return -1;
  return (
    Number(at.slice(0, 4)) -
    Number(birthDate.slice(0, 4)) -
    (at.slice(5) < birthDate.slice(5) ? 1 : 0)
  );
}
