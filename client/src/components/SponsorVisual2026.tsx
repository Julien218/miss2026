import type { CSSProperties } from "react";

const SPRITE_COLUMNS = 5;
const SPRITE_ROWS = 9;

export type Sponsor2026 = {
  index: number;
  name?: string;
};

// Ordre exact des 43 visuels du ZIP officiel 2026 fourni par l'organisation.
// Les fichiers non identifiés restent volontairement sans nom : leur visuel est conservé
// sans inventer l'identité d'un partenaire.
export const SPONSORS_2026: Sponsor2026[] = [
  { index: 0, name: "La Perla" },
  { index: 1 },
  { index: 2 },
  { index: 3, name: "Belfius" },
  { index: 4, name: "Blio Nails" },
  { index: 5 },
  { index: 6, name: "Ferrbatir" },
  { index: 7, name: "Don Bosco" },
  { index: 8, name: "L'Indispensable" },
  { index: 9, name: "Piazetta" },
  { index: 10, name: "La Saline" },
  { index: 11 },
  { index: 12, name: "P&V Dour" },
  { index: 13 },
  { index: 14, name: "Place To Be" },
  { index: 15, name: "DRJ" },
  { index: 16, name: "ART 2 DANSE" },
  { index: 17 },
  { index: 18 },
  { index: 19 },
  { index: 20, name: "RSMB" },
  { index: 21, name: "Dour Matériaux" },
  { index: 22, name: "Baccara" },
  { index: 23, name: "Resto Cablerie" },
  { index: 24, name: "Arômes et Délices" },
  { index: 25 },
  { index: 26 },
  { index: 27, name: "Etiacel" },
  { index: 28, name: "Beobank" },
  { index: 29, name: "Fun Zone Dour" },
  { index: 30, name: "Verpoort JB" },
  { index: 31 },
  { index: 32, name: "Table Auguste" },
  { index: 33, name: "Barbara" },
  { index: 34, name: "JS-Innov.IA" },
  { index: 35 },
  { index: 36, name: "Business Marketing Agency" },
  { index: 37, name: "CG Car" },
  { index: 38, name: "PubliDesign" },
  { index: 39 },
  { index: 40 },
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
    backgroundImage: 'url("/sponsors/sponsors-2026.webp")',
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
