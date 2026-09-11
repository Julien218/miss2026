import type { CSSProperties } from "react";

const SPRITE_COLUMNS = 5;
const SPRITE_ROWS = 9;

export type Sponsor2026 = {
  index: number;
  name: string;
};

// Ordre exact des 43 visuels du ZIP officiel 2026 fourni par l'organisation.
// Chaque intitulé correspond au visuel réellement présent dans la planche source.
export const SPONSORS_2026: Sponsor2026[] = [
  { index: 0, name: "La Perla del Sol Immobilier" },
  { index: 1, name: "JV Sport — Julien Van Melkebeke" },
  { index: 2, name: "Pépites" },
  { index: 3, name: "Belfius" },
  { index: 4, name: "Blio Nails" },
  { index: 5, name: "Leblanc Philippe Traiteur" },
  { index: 6, name: "FerrBatir" },
  { index: 7, name: "Centre Scolaire Don Bosco" },
  { index: 8, name: "L’Indispensable" },
  { index: 9, name: "La Piazzetta Dour" },
  { index: 10, name: "La Saline" },
  { index: 11, name: "Brasserie du Belvédère" },
  { index: 12, name: "P&V Agence de Dour" },
  { index: 13, name: "Cycles Au Liégeois" },
  { index: 14, name: "The Place To Be" },
  { index: 15, name: "DRJ" },
  { index: 16, name: "ART 2 DANSE" },
  { index: 17, name: "Le Tour de Dour" },
  { index: 18, name: "Campagna Construct" },
  { index: 19, name: "S Make-Up Artist Serena" },
  { index: 20, name: "R.S.M.B. Façade" },
  { index: 21, name: "Dour Matériaux" },
  { index: 22, name: "Baccara" },
  { index: 23, name: "La Cablerie" },
  { index: 24, name: "Arômes & Délices" },
  { index: 25, name: "Vanden Borre Kitchen Dour" },
  { index: 26, name: "SGI — Spiteri Group Insurance" },
  { index: 27, name: "Etiacel" },
  { index: 28, name: "Beobank" },
  { index: 29, name: "Fun Zone Dour" },
  { index: 30, name: "Verpoort Jean-Baptiste" },
  { index: 31, name: "Tempo" },
  { index: 32, name: "La Table d’Auguste" },
  { index: 33, name: "Barbara Beauty Salon" },
  { index: 34, name: "JS-Innov.IA" },
  { index: 35, name: "Dour Festival" },
  { index: 36, name: "DécoCeram" },
  { index: 37, name: "CG Car" },
  { index: 38, name: "PubliDesign" },
  { index: 39, name: "Chaussea Dour" },
  { index: 40, name: "Centre Scolaire Don Bosco" },
  { index: 41, name: "MMD Pics & Prod" },
  { index: 42, name: "Danse Dour" },
];

export function SponsorVisual2026({
  index,
  label,
  className = "",
}: {
  index: number;
  label?: string;
  className?: string;
}) {
  const column = index % SPRITE_COLUMNS;
  const row = Math.floor(index / SPRITE_COLUMNS);
  const backgroundPositionX = (column / (SPRITE_COLUMNS - 1)) * 100;
  const backgroundPositionY = (row / (SPRITE_ROWS - 1)) * 100;

  const style: CSSProperties = {
    backgroundImage: 'url("/sponsors/sponsors-2026-runtime.webp")',
    backgroundSize: `${SPRITE_COLUMNS * 100}% ${SPRITE_ROWS * 100}%`,
    backgroundPosition: `${backgroundPositionX}% ${backgroundPositionY}%`,
    backgroundRepeat: "no-repeat",
  };

  return (
    <span
      className={`mmd-sponsor-sprite ${className}`.trim()}
      style={style}
      role="img"
      aria-label={label || "Partenaire Miss & Mister Dour 2026"}
    />
  );
}
