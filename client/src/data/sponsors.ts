export type SponsorRecord = {
  name: string;
  edition: number;
  featured?: boolean;
};

/**
 * Sponsors récupérés de l'ancienne version officielle du site.
 * Les noms restent visibles même lorsqu'un ancien logo n'est pas encore
 * disponible dans le stockage public de la production actuelle.
 */
export const HISTORICAL_SPONSORS: SponsorRecord[] = [
  { name: "Arômes et Délices", edition: 2026 },
  { name: "ART 2 DANSE", edition: 2026 },
  { name: "Barbara", edition: 2026 },
  { name: "Belfius", edition: 2026 },
  { name: "Beobank", edition: 2026 },
  { name: "Blio Nails", edition: 2026 },
  { name: "Business Marketing Agency", edition: 2026 },
  { name: "CG Car", edition: 2026 },
  { name: "Danse Dour", edition: 2026 },
  { name: "Don Bosco", edition: 2026 },
  { name: "Dour Matériaux", edition: 2026 },
  { name: "DRJ", edition: 2026 },
  { name: "Etiacel", edition: 2026 },
  { name: "Ferrbatir", edition: 2026 },
  { name: "Fun Zone Dour", edition: 2026, featured: true },
  { name: "L'Indispensable", edition: 2026 },
  { name: "La Perla", edition: 2026 },
  { name: "La Saline", edition: 2026 },
  { name: "MMD Pics & Prod", edition: 2026 },
  { name: "Piazetta", edition: 2026 },
  { name: "Place To Be", edition: 2026 },
  { name: "PubliDesign", edition: 2026 },
  { name: "P&V Dour", edition: 2026 },
  { name: "Resto Cablerie", edition: 2026 },
  { name: "RSMB", edition: 2026 },
  { name: "Table Auguste", edition: 2026 },
  { name: "Verpoort JB", edition: 2026 },
  { name: "Chaussea Dour", edition: 2026 },
  { name: "Traiteur Leblanc", edition: 2026 },
  { name: "Cycles au Liégeois", edition: 2026 },
  { name: "Synergie Dour", edition: 2026, featured: true },
];

export const FOUNDING_PARTNERS = [
  { name: "STARLIGHT ASBL", role: "Organisation" },
  { name: "JS-Innov.IA®", role: "Expérience digitale" },
];
