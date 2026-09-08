import type { Request, Response } from 'express';
import sharp from 'sharp';

/**
 * Génère une image de compte à rebours pour le partage social
 * Formats supportés: standard (1200x630), instagram (1080x1080), story (1080x1920)
 * 
 * Note: Cette implémentation utilise une approche simplifiée sans canvas natif
 * pour être compatible avec le déploiement. Elle génère un SVG converti en PNG.
 */
export async function generateCountdownImage(req: Request, res: Response) {
  try {
    const { format = 'standard' } = req.query;

    const eventDate = new Date('2026-04-19T20:00:00');
    const now = new Date();
    const diff = eventDate.getTime() - now.getTime();

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    // Dimensions selon le format
  let width = 1200;
  let height = 630;
  let layout: 'horizontal' | 'vertical' | 'story' | 'instagram' = 'horizontal';
    let fontSize = { title: 64, number: 72, label: 20, subtitle: 28, signature: 18, watermark: 24 };
    let spacing = { boxGap: 30, marginTop: 40, subtitleMargin: 50 };

    if (format === 'instagram') {
      width = 1080;
      height = 1080;
      layout = 'instagram';
      fontSize = { title: 48, number: 72, label: 20, subtitle: 28, signature: 18, watermark: 24 };
      spacing = { boxGap: 20, marginTop: 40, subtitleMargin: 50 };
    } else if (format === 'story') {
      width = 1080;
      height = 1920;
      layout = 'story';
      fontSize = { title: 56, number: 64, label: 18, subtitle: 24, signature: 16, watermark: 20 };
      spacing = { boxGap: 20, marginTop: 60, subtitleMargin: 60 };
    }

    // Générer SVG
    const svg = generateSVG(
      width,
      height,
      layout,
      days,
      hours,
      minutes,
      fontSize,
      spacing
    );

    // Convertir SVG en PNG avec sharp
    const pngBuffer = await sharp(Buffer.from(svg))
      .png()
      .toBuffer();

    // Set response headers
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=60'); // Cache 1 minute
    res.send(pngBuffer);
  } catch (error) {
    console.error('Error generating countdown image:', error);
    res.status(500).json({ error: 'Failed to generate image' });
  }
}

function generateSVG(
  width: number,
  height: number,
  layout: 'horizontal' | 'vertical' | 'story' | 'instagram',
  days: number,
  hours: number,
  minutes: number,
  fontSize: any,
  spacing: any
): string {
  const isVertical = layout === 'vertical' || layout === 'instagram' || layout === 'story';
  const boxWidth = isVertical ? width * 0.8 : 180;
  const boxHeight = isVertical ? 100 : 140;
  const boxPadding = isVertical ? 20 : 30;

  // Position des boîtes
  let boxesY = height / 2 - (isVertical ? 150 : 0);
  let boxesX = width / 2;

  const timeUnits = [
    { value: days, label: 'JOURS' },
    { value: hours, label: 'HEURES' },
    { value: minutes, label: 'MINUTES' },
  ];

  // Générer les boîtes de compte à rebours
  const boxes = timeUnits
    .map((unit, index) => {
      const x = isVertical
        ? (width - boxWidth) / 2
        : boxesX - (boxWidth * 3 + spacing.boxGap * 2) / 2 + (boxWidth + spacing.boxGap) * index;
      const y = isVertical
        ? boxesY + (boxHeight + spacing.boxGap) * index
        : boxesY;

      return `
        <!-- Box ${unit.label} -->
        <rect
          x="${x}"
          y="${y}"
          width="${boxWidth}"
          height="${boxHeight}"
          rx="20"
          fill="rgba(255, 255, 255, 0.05)"
          stroke="rgba(212, 175, 55, 0.3)"
          stroke-width="2"
        />
        <defs>
          <linearGradient id="numberGradient${index}" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:#E8C547;stop-opacity:1" />
            <stop offset="50%" style="stop-color:#D4AF37;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#B8941E;stop-opacity:1" />
          </linearGradient>
        </defs>
        <text
          x="${x + boxWidth / 2}"
          y="${y + boxHeight / 2 + 10}"
          font-family="Arial, sans-serif"
          font-size="${fontSize.number}"
          font-weight="bold"
          fill="url(#numberGradient${index})"
          text-anchor="middle"
        >
          ${String(unit.value).padStart(2, '0')}
        </text>
        <text
          x="${x + boxWidth / 2}"
          y="${y + boxHeight - boxPadding}"
          font-family="Arial, sans-serif"
          font-size="${fontSize.label}"
          font-weight="bold"
          fill="#D4AF37"
          text-anchor="middle"
          letter-spacing="2"
        >
          ${unit.label}
        </text>
      `;
    })
    .join('');

  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <!-- Background gradient -->
      <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#0A0A0A;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#1A1A1A;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="titleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#E8C547;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#D4AF37;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#B8941E;stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <rect width="${width}" height="${height}" fill="url(#bgGradient)" />
      
      <!-- Title -->
      <text
        x="${width / 2}"
        y="${layout === 'vertical' ? 100 : 120}"
        font-family="Arial, sans-serif"
        font-size="${fontSize.title}"
        font-weight="bold"
        fill="url(#titleGradient)"
        text-anchor="middle"
      >
        Miss &amp; Mister Dour 2026
      </text>
      
      <!-- Countdown boxes -->
      ${boxes}
      
      <!-- Subtitle -->
      <text
        x="${width / 2}"
        y="${height - (layout === 'story' ? 200 : layout === 'instagram' ? 180 : 150)}"
        font-family="Arial, sans-serif"
        font-size="${fontSize.subtitle}"
        fill="#FAF8F5"
        text-anchor="middle"
      >
        19 Avril 2026
      </text>
      <text
        x="${width / 2}"
        y="${height - (layout === 'story' ? 160 : layout === 'instagram' ? 145 : 115)}"
        font-family="Arial, sans-serif"
        font-size="${fontSize.subtitle}"
        fill="#FAF8F5"
        text-anchor="middle"
      >
        Centre Culturel de Dour, Belgique
      </text>
      
      <!-- Signature -->
      <text
        x="${width - 40}"
        y="${height - 30}"
        font-family="Arial, sans-serif"
        font-size="${fontSize.signature}"
        fill="rgba(212, 175, 55, 0.6)"
        text-anchor="end"
      >
        by JS-INNOV.IA | Julien Pagin
      </text>
      
      <!-- Watermark -->
      <text
        x="40"
        y="${height - 30}"
        font-family="Arial, sans-serif"
        font-size="${fontSize.watermark}"
        font-weight="bold"
        fill="rgba(212, 175, 55, 0.2)"
        text-anchor="start"
      >
        MISS &amp; MISTER DOUR
      </text>
    </svg>
  `;
}
