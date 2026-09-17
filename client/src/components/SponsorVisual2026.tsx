import type { CSSProperties } from "react";

const SPRITE_COLUMNS = 5;
const SPRITE_ROWS = 9;
const ORIGINAL_SPRITE_SOURCE = "/sponsors/sponsors-2026.webp";

export type Sponsor2026 = {
  index: number;
  name: string;
};

export type SponsorRenderMode = "transparent" | "framed-light" | "poster";

// Ordre exact des 43 visuels du ZIP officiel 2026 fourni par l'organisation.
export const SPONSORS_2026: Sponsor2026[] = [
  { index: 0, name: "La Perla del Sol Immobilier" },
  { index: 1, name: "JV Sport — Julien Van Melkebeke" },
  { index: 2, name: "Pépites" },
  { index: 3, name: "Belfius — Hainaut Sud-Ouest" },
  { index: 4, name: "Blio Nails" },
  { index: 5, name: "Leblanc Philippe — Traiteur" },
  { index: 6, name: "FerrBatir" },
  { index: 7, name: "Centre Scolaire Don Bosco" },
  { index: 8, name: "L’Indispensable" },
  { index: 9, name: "La Piazzetta Dour" },
  { index: 10, name: "La Saline" },
  { index: 11, name: "Brasserie du Belvédère" },
  { index: 12, name: "P&V — Agence de Dour" },
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

// Ces huit partenaires ont été contrôlés par rapport aux fichiers maîtres fournis
// le 17/09/2026. Leur dessin ne doit jamais être redessiné, détouré par IA ou
// recoloré. Le rendu ci-dessous utilise directement la planche source, sans
// traitement pixel/canvas, afin de conserver tous les blancs et détails du logo.
export const VERIFIED_MASTER_SPONSORS = new Set([0, 3, 5, 8, 9, 12, 21, 26]);

const FRAMED_LIGHT_SPONSORS = new Set([
  0, 2, 3, 6, 8, 9, 10, 11, 12, 14, 18, 19, 20, 23, 28,
]);

const POSTER_SPONSORS = new Set([
  1, 5, 7, 21, 24, 25, 26, 27, 30, 31, 32, 33, 36, 37, 38, 39, 40,
]);

export function sponsorRenderMode(index: number): SponsorRenderMode {
  if (POSTER_SPONSORS.has(index)) return "poster";
  if (FRAMED_LIGHT_SPONSORS.has(index)) return "framed-light";
  return "transparent";
}

function spritePosition(index: number) {
  const column = index % SPRITE_COLUMNS;
  const row = Math.floor(index / SPRITE_COLUMNS);
  const x = SPRITE_COLUMNS <= 1 ? 0 : (column / (SPRITE_COLUMNS - 1)) * 100;
  const y = SPRITE_ROWS <= 1 ? 0 : (row / (SPRITE_ROWS - 1)) * 100;
  return `${x}% ${y}%`;
}

export function SponsorVisual2026({ index, label, className = "" }: { index: number; label?: string; className?: string }) {
  const accessibleLabel = label || SPONSORS_2026[index]?.name || "Partenaire Miss & Mister Dour 2026";
  const mode = sponsorRenderMode(index);
  const verified = VERIFIED_MASTER_SPONSORS.has(index);

  const style: CSSProperties = {
    backgroundImage: `url("${ORIGINAL_SPRITE_SOURCE}")`,
    backgroundSize: `${SPRITE_COLUMNS * 100}% ${SPRITE_ROWS * 100}%`,
    backgroundPosition: spritePosition(index),
    backgroundRepeat: "no-repeat",
  };

  return (
    <span
      className={`mmd-sponsor-sprite mmd-sponsor-render mmd-sponsor-mode-${mode}${verified ? " mmd-sponsor-master-verified" : ""} ${className}`.trim()}
      style={style}
      data-sponsor-index={index}
      data-sponsor-mode={mode}
      data-sponsor-master={verified ? "verified" : "legacy"}
      data-sponsor-aspect="1.4736842105"
      role="img"
      aria-label={accessibleLabel}
    />
  );
}
