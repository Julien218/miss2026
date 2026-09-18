export type SponsorRenderMode = "transparent" | "framed-light" | "poster";

export type Sponsor2026 = {
  index: number;
  name: string;
  src: string;
  aspect: number;
  mode: SponsorRenderMode;
  source: "drive-local" | "drive-direct";
};

const D = "/sponsors/drive";
const DRIVE_DIRECT = (id: string) => `https://drive.google.com/uc?export=view&id=${id}`;

/**
 * Référentiel sponsor 2025–2026.
 * Chaque entrée pointe vers le fichier maître Google Drive fourni par l'organisation.
 * Aucun détourage, recoloriage ou redessin automatique n'est appliqué côté navigateur.
 */
export const SPONSORS_2026: Sponsor2026[] = [
  { index: 0, name: "La Perla del Sol Immobilier", src: `${D}/00-la-perla-del-sol.png`, aspect: 845 / 546, mode: "framed-light", source: "drive-local" },
  { index: 1, name: "JV Sport — Julien Van Melkebeke", src: `${D}/01-jv-sport.jpeg`, aspect: 575 / 376, mode: "poster", source: "drive-local" },
  { index: 2, name: "Pépites Boutique", src: `${D}/02-pepites.jpeg`, aspect: 1414 / 1347, mode: "poster", source: "drive-local" },
  { index: 3, name: "Belfius — Hainaut Sud-Ouest", src: `${D}/03-belfius.jpg`, aspect: 2048 / 1152, mode: "poster", source: "drive-local" },
  { index: 4, name: "Blio Nails", src: `${D}/04-blio-nails.jpg`, aspect: 1288 / 1716, mode: "poster", source: "drive-local" },
  { index: 5, name: "Leblanc Philippe — Traiteur", src: `${D}/05-leblanc-traiteur.png`, aspect: 579 / 452, mode: "poster", source: "drive-local" },
  { index: 6, name: "FerrBatir", src: `${D}/06-ferrbatir.jpg`, aspect: 1064 / 644, mode: "framed-light", source: "drive-local" },
  { index: 7, name: "Centre Scolaire Don Bosco", src: `${D}/07-don-bosco.png`, aspect: 750 / 675, mode: "transparent", source: "drive-local" },
  { index: 8, name: "L’Indispensable", src: `${D}/08-indispensable.jpg`, aspect: 2048 / 1694, mode: "framed-light", source: "drive-local" },
  { index: 9, name: "La Piazzetta Dour", src: `${D}/09-la-piazzetta.jpg`, aspect: 1024 / 646, mode: "framed-light", source: "drive-local" },
  { index: 10, name: "La Saline", src: `${D}/10-la-saline.jpg`, aspect: 1156 / 1449, mode: "poster", source: "drive-local" },
  { index: 11, name: "Brasserie du Belvédère", src: `${D}/11-brasserie-belvedere.jpg`, aspect: 1, mode: "framed-light", source: "drive-local" },
  { index: 12, name: "P&V — Agence de Dour", src: `${D}/12-pv-agence-dour.jpg`, aspect: 1072 / 1038, mode: "framed-light", source: "drive-local" },
  { index: 13, name: "Cycles Au Liégeois", src: `${D}/13-cycles-au-liegeois.jpg`, aspect: 1, mode: "framed-light", source: "drive-local" },
  { index: 14, name: "The Place To Be", src: DRIVE_DIRECT("1llNu9jFcRsAkwZBqjRQ28vWyGdTlY_HU"), aspect: 1799 / 2000, mode: "poster", source: "drive-direct" },
  { index: 15, name: "DAREN", src: `${D}/15-daren.jpeg`, aspect: 2, mode: "framed-light", source: "drive-local" },
  { index: 16, name: "ART 2 DANSE", src: `${D}/16-art-2-danse.jpg`, aspect: 851 / 315, mode: "framed-light", source: "drive-local" },
  { index: 17, name: "Le Tour de Dour", src: `${D}/17-le-tour-de-dour.jpg`, aspect: 1381 / 1990, mode: "poster", source: "drive-local" },
  { index: 18, name: "Campagna Construct", src: `${D}/18-campagna-construct.png`, aspect: 1084 / 658, mode: "framed-light", source: "drive-local" },
  { index: 19, name: "S Make-Up Artist Serena", src: `${D}/19-serena.jpg`, aspect: 1240 / 1754, mode: "poster", source: "drive-local" },
  { index: 20, name: "R.S.M.B. Façade", src: `${D}/20-rsmb-facade.jpeg`, aspect: 697 / 1074, mode: "poster", source: "drive-local" },
  { index: 21, name: "Dour Matériaux", src: `${D}/21-dour-materiaux.jpg`, aspect: 273 / 185, mode: "poster", source: "drive-local" },
  { index: 22, name: "Baccara", src: `${D}/22-baccara.png`, aspect: 1, mode: "framed-light", source: "drive-local" },
  { index: 23, name: "La Cablerie", src: `${D}/23-la-cablerie.png`, aspect: 401 / 276, mode: "poster", source: "drive-local" },
  { index: 24, name: "Arômes & Délices", src: `${D}/24-aromes-delices.png`, aspect: 961 / 630, mode: "poster", source: "drive-local" },
  { index: 25, name: "Vanden Borre Kitchen Dour", src: `${D}/25-vanden-borre-kitchen.png`, aspect: 1139 / 758, mode: "poster", source: "drive-local" },
  { index: 26, name: "SGI — Spiteri Group Insurance", src: `${D}/26-sgi.jpg`, aspect: 1320 / 752, mode: "poster", source: "drive-local" },
  { index: 27, name: "Etiacel", src: `${D}/27-etiacel.jpg`, aspect: 1004 / 650, mode: "poster", source: "drive-local" },
  { index: 28, name: "Beobank", src: `${D}/28-beobank.png`, aspect: 467 / 560, mode: "poster", source: "drive-local" },
  { index: 29, name: "Fun Zone Dour", src: `${D}/29-fun-zone.png`, aspect: 1, mode: "transparent", source: "drive-local" },
  { index: 30, name: "Verpoort Jean-Baptiste", src: `${D}/30-verpoort.jpg`, aspect: 4 / 3, mode: "poster", source: "drive-local" },
  { index: 31, name: "Tempo Concept", src: `${D}/31-tempo.png`, aspect: 553 / 795, mode: "poster", source: "drive-local" },
  { index: 32, name: "La Table d’Auguste", src: `${D}/32-table-auguste.png`, aspect: 1024 / 1453, mode: "poster", source: "drive-local" },
  { index: 33, name: "Barbara Beauty Salon", src: `${D}/33-barbara.jpeg`, aspect: 1051 / 697, mode: "poster", source: "drive-local" },
  { index: 34, name: "JS-Innov.IA", src: `${D}/34-js-innov-ia.jpg`, aspect: 1, mode: "framed-light", source: "drive-local" },
  { index: 35, name: "Dour Festival", src: `${D}/35-dour-festival.png`, aspect: 269 / 162, mode: "framed-light", source: "drive-local" },
  { index: 36, name: "DécoCeram", src: `${D}/36-decoceram.jpg`, aspect: 16 / 9, mode: "poster", source: "drive-local" },
  { index: 37, name: "CG Car", src: `${D}/37-cg-car.jpg`, aspect: 661 / 377, mode: "poster", source: "drive-local" },
  { index: 38, name: "PubliDesign", src: `${D}/38-publidesign.png`, aspect: 1313 / 1823, mode: "poster", source: "drive-local" },
  { index: 39, name: "Chaussea Dour", src: `${D}/39-chaussea.png`, aspect: 1, mode: "poster", source: "drive-local" },
  { index: 40, name: "Centre Scolaire Don Bosco", src: `${D}/07-don-bosco.png`, aspect: 750 / 675, mode: "transparent", source: "drive-local" },
  { index: 41, name: "MMD Pics & Prod", src: `${D}/41-mmd-pics-prod.jpeg`, aspect: 0.8, mode: "poster", source: "drive-local" },
  { index: 42, name: "Danse Dour", src: `${D}/42-danse-dour.jpg`, aspect: 821 / 820, mode: "framed-light", source: "drive-local" },
];

export function sponsorRenderMode(index: number): SponsorRenderMode {
  return SPONSORS_2026[index]?.mode || "poster";
}

export function SponsorVisual2026({
  index,
  label,
  className = "",
}: {
  index: number;
  label?: string;
  className?: string;
}) {
  const sponsor = SPONSORS_2026[index];
  const accessibleLabel = label || sponsor?.name || "Partenaire Miss & Mister Dour 2026";
  const mode = sponsor?.mode || "poster";

  if (!sponsor) return null;

  return (
    <img
      className={`mmd-sponsor-render mmd-sponsor-drive mmd-sponsor-mode-${mode} ${className}`.trim()}
      src={sponsor.src}
      alt={accessibleLabel}
      data-sponsor-index={index}
      data-sponsor-mode={mode}
      data-sponsor-source={sponsor.source}
      data-sponsor-aspect={sponsor.aspect}
      loading={index < 6 ? "eager" : "lazy"}
      decoding="async"
      draggable={false}
      referrerPolicy="no-referrer"
    />
  );
}
