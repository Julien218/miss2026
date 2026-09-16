import { useEffect, useRef } from "react";

const SPRITE_COLUMNS = 5;
const SPRITE_ROWS = 9;
const SPRITE_SOURCES = [
  "/sponsors/sponsors-2026-runtime.webp",
  "/sponsors/sponsors-2026.webp",
] as const;

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

/*
 * Rendu volontairement hybride :
 * - transparent   : vrais logos simples, détourage très conservateur ;
 * - framed-light  : logos fins/sombres conservés intacts sur verre champagne ;
 * - poster        : publicité, carte commerciale ou flyer, jamais détouré.
 *
 * La carte active de l'orbite reçoit en plus un traitement hero via CSS.
 */
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

type RGB = [number, number, number];
type ColorCluster = { color: RGB; count: number };
type Bounds = { left: number; top: number; width: number; height: number };

let spritePromise: Promise<HTMLImageElement> | null = null;

function colorDistance(a: RGB, b: RGB) {
  const dr = a[0] - b[0];
  const dg = a[1] - b[1];
  const db = a[2] - b[2];
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

function loadSprite() {
  if (spritePromise) return spritePromise;

  spritePromise = new Promise<HTMLImageElement>((resolve, reject) => {
    let sourceIndex = 0;
    const tryNext = () => {
      if (sourceIndex >= SPRITE_SOURCES.length) {
        reject(new Error("Planche partenaires 2026 introuvable"));
        return;
      }
      const image = new Image();
      image.decoding = "async";
      image.onload = () => resolve(image);
      image.onerror = () => {
        sourceIndex += 1;
        tryNext();
      };
      image.src = SPRITE_SOURCES[sourceIndex];
    };
    tryNext();
  });

  return spritePromise;
}

function patchColor(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  centerX: number,
  centerY: number,
  radius = 2,
): RGB {
  let r = 0;
  let g = 0;
  let b = 0;
  let count = 0;

  for (let y = Math.max(0, centerY - radius); y <= Math.min(height - 1, centerY + radius); y += 1) {
    for (let x = Math.max(0, centerX - radius); x <= Math.min(width - 1, centerX + radius); x += 1) {
      const offset = (y * width + x) * 4;
      r += data[offset];
      g += data[offset + 1];
      b += data[offset + 2];
      count += 1;
    }
  }

  return [r / count, g / count, b / count];
}

function getBackgroundClusters(data: Uint8ClampedArray, width: number, height: number) {
  const points = [
    [2, 2],
    [Math.floor(width / 2), 2],
    [width - 3, 2],
    [2, Math.floor(height / 2)],
    [width - 3, Math.floor(height / 2)],
    [2, height - 3],
    [Math.floor(width / 2), height - 3],
    [width - 3, height - 3],
  ] as const;

  const samples = points.map(([x, y]) => patchColor(data, width, height, x, y));
  const clusters: ColorCluster[] = [];

  samples.forEach((sample) => {
    const target = clusters.find((cluster) => colorDistance(cluster.color, sample) < 30);
    if (!target) {
      clusters.push({ color: sample, count: 1 });
      return;
    }
    const nextCount = target.count + 1;
    target.color = [
      (target.color[0] * target.count + sample[0]) / nextCount,
      (target.color[1] * target.count + sample[1]) / nextCount,
      (target.color[2] * target.count + sample[2]) / nextCount,
    ];
    target.count = nextCount;
  });

  return clusters
    .filter((cluster) => cluster.count >= 2)
    .sort((a, b) => b.count - a.count)
    .slice(0, 2);
}

function distanceToClusters(data: Uint8ClampedArray, index: number, clusters: ColorCluster[]) {
  const offset = index * 4;
  const pixel: RGB = [data[offset], data[offset + 1], data[offset + 2]];
  let distance = Number.POSITIVE_INFINITY;
  clusters.forEach((cluster) => {
    distance = Math.min(distance, colorDistance(pixel, cluster.color));
  });
  return distance;
}

function conservativeTransparentBackground(imageData: ImageData, width: number, height: number) {
  const { data } = imageData;
  const clusters = getBackgroundClusters(data, width, height);
  if (!clusters.length) return imageData;

  const visited = new Uint8Array(width * height);
  const queue = new Int32Array(width * height);
  let head = 0;
  let tail = 0;

  const pushSeed = (index: number) => {
    if (visited[index]) return;
    // Très strict : ne retire que le fond réellement proche de la couleur du bord.
    if (distanceToClusters(data, index, clusters) > 20) return;
    visited[index] = 1;
    queue[tail++] = index;
  };

  for (let x = 0; x < width; x += 1) {
    pushSeed(x);
    pushSeed((height - 1) * width + x);
  }
  for (let y = 1; y < height - 1; y += 1) {
    pushSeed(y * width);
    pushSeed(y * width + width - 1);
  }

  while (head < tail) {
    const index = queue[head++];
    const x = index % width;
    const y = Math.floor(index / width);
    const neighbors = [index - 1, index + 1, index - width, index + width];

    for (const next of neighbors) {
      if (next < 0 || next >= width * height || visited[next]) continue;
      const nx = next % width;
      const ny = Math.floor(next / width);
      if (Math.abs(nx - x) + Math.abs(ny - y) !== 1) continue;
      if (distanceToClusters(data, next, clusters) > 31) continue;
      visited[next] = 1;
      queue[tail++] = next;
    }
  }

  for (let index = 0; index < visited.length; index += 1) {
    if (visited[index]) data[index * 4 + 3] = 0;
  }

  // Une lisière très fine, afin de conserver les lettres blanches et les traits fins.
  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const index = y * width + x;
      if (visited[index]) continue;
      const touchesTransparent =
        visited[index - 1] || visited[index + 1] || visited[index - width] || visited[index + width];
      if (!touchesTransparent) continue;
      const distance = distanceToClusters(data, index, clusters);
      if (distance < 39) {
        const alpha = Math.max(130, Math.min(255, Math.round(((distance - 31) / 8) * 255)));
        data[index * 4 + 3] = Math.min(data[index * 4 + 3], alpha);
      }
    }
  }

  return imageData;
}

function visibleBounds(data: Uint8ClampedArray, width: number, height: number): Bounds | null {
  let left = width;
  let top = height;
  let right = -1;
  let bottom = -1;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const alpha = data[(y * width + x) * 4 + 3];
      if (alpha < 20) continue;
      left = Math.min(left, x);
      top = Math.min(top, y);
      right = Math.max(right, x);
      bottom = Math.max(bottom, y);
    }
  }

  if (right < left || bottom < top) return null;
  return { left, top, width: right - left + 1, height: bottom - top + 1 };
}

function contentBounds(data: Uint8ClampedArray, width: number, height: number): Bounds {
  const clusters = getBackgroundClusters(data, width, height);
  if (!clusters.length) return { left: 0, top: 0, width, height };

  let left = width;
  let top = height;
  let right = -1;
  let bottom = -1;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = y * width + x;
      if (distanceToClusters(data, index, clusters) < 34) continue;
      left = Math.min(left, x);
      top = Math.min(top, y);
      right = Math.max(right, x);
      bottom = Math.max(bottom, y);
    }
  }

  if (right < left || bottom < top) return { left: 0, top: 0, width, height };

  const padX = Math.max(4, Math.round((right - left + 1) * 0.07));
  const padY = Math.max(4, Math.round((bottom - top + 1) * 0.09));
  left = Math.max(0, left - padX);
  top = Math.max(0, top - padY);
  right = Math.min(width - 1, right + padX);
  bottom = Math.min(height - 1, bottom + padY);

  return { left, top, width: right - left + 1, height: bottom - top + 1 };
}

function drawFallback(canvas: HTMLCanvasElement, label: string) {
  const width = 560;
  const height = 380;
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) return;
  context.clearRect(0, 0, width, height);
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillStyle = "#ead3a5";
  context.font = "600 26px Georgia, serif";
  context.fillText(label, width / 2, height / 2, width * 0.82);
}

function renderSponsor(
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  index: number,
  mode: SponsorRenderMode,
) {
  const sourceWidth = Math.floor(image.naturalWidth / SPRITE_COLUMNS);
  const sourceHeight = Math.floor(image.naturalHeight / SPRITE_ROWS);
  const sourceX = (index % SPRITE_COLUMNS) * sourceWidth;
  const sourceY = Math.floor(index / SPRITE_COLUMNS) * sourceHeight;

  const working = document.createElement("canvas");
  working.width = sourceWidth;
  working.height = sourceHeight;
  const workingContext = working.getContext("2d", { willReadFrequently: true });
  if (!workingContext) return;

  workingContext.clearRect(0, 0, sourceWidth, sourceHeight);
  workingContext.drawImage(
    image,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    0,
    0,
    sourceWidth,
    sourceHeight,
  );

  const originalData = workingContext.getImageData(0, 0, sourceWidth, sourceHeight);
  let bounds: Bounds;

  if (mode === "transparent") {
    const cleaned = conservativeTransparentBackground(originalData, sourceWidth, sourceHeight);
    workingContext.putImageData(cleaned, 0, 0);
    bounds = visibleBounds(cleaned.data, sourceWidth, sourceHeight) || {
      left: 0,
      top: 0,
      width: sourceWidth,
      height: sourceHeight,
    };
  } else {
    // Framed-light et poster conservent tous les pixels de la création d'origine.
    bounds = contentBounds(originalData.data, sourceWidth, sourceHeight);
  }

  const outputWidth = 560;
  const outputHeight = 380;
  canvas.width = outputWidth;
  canvas.height = outputHeight;
  const context = canvas.getContext("2d");
  if (!context) return;
  context.clearRect(0, 0, outputWidth, outputHeight);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";

  const widthRatio = mode === "poster" ? 0.93 : mode === "framed-light" ? 0.89 : 0.92;
  const heightRatio = mode === "poster" ? 0.90 : mode === "framed-light" ? 0.86 : 0.87;
  const maxWidth = outputWidth * widthRatio;
  const maxHeight = outputHeight * heightRatio;
  const scale = Math.min(maxWidth / bounds.width, maxHeight / bounds.height);
  const drawWidth = bounds.width * scale;
  const drawHeight = bounds.height * scale;
  const drawX = (outputWidth - drawWidth) / 2;
  const drawY = (outputHeight - drawHeight) / 2;

  context.drawImage(
    working,
    bounds.left,
    bounds.top,
    bounds.width,
    bounds.height,
    drawX,
    drawY,
    drawWidth,
    drawHeight,
  );
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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const accessibleLabel = label || SPONSORS_2026[index]?.name || "Partenaire Miss & Mister Dour 2026";
  const mode = sponsorRenderMode(index);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let cancelled = false;

    loadSprite()
      .then((image) => {
        if (!cancelled && canvasRef.current) renderSponsor(canvasRef.current, image, index, mode);
      })
      .catch(() => {
        if (!cancelled && canvasRef.current) drawFallback(canvasRef.current, accessibleLabel);
      });

    return () => {
      cancelled = true;
    };
  }, [index, accessibleLabel, mode]);

  return (
    <canvas
      ref={canvasRef}
      className={`mmd-sponsor-sprite mmd-sponsor-render mmd-sponsor-mode-${mode} ${className}`.trim()}
      data-sponsor-index={index}
      data-sponsor-mode={mode}
      role="img"
      aria-label={accessibleLabel}
    />
  );
}
