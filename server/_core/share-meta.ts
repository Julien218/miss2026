/**
 * Génération des meta OG pour la route /share/:candidateId/:assetId
 * Permet de partager des photos/vidéos spécifiques avec previews optimisées
 */

import { getShareUrl } from "../url-helpers";

export interface ShareAsset {
  id: number;
  candidateId: number;
  candidateName: string;
  candidateCategory: string;
  assetType: "photo" | "video";
  assetUrl: string;
  caption?: string | null;
}

/**
 * Génère les meta tags OG/Twitter pour une page de partage d'asset
 */
export function generateShareAssetOGMeta(asset: ShareAsset) {
  const candidateTitle = `${asset.candidateName} - ${asset.candidateCategory}`;
  const assetTypeLabel = asset.assetType === "photo" ? "Photo" : "Vidéo";
  const title = `${assetTypeLabel} de ${asset.candidateName} | Miss & Mister Dour 2026`;
  const description = asset.caption || `Découvrez cette ${asset.assetType === "photo" ? "photo" : "vidéo"} de ${asset.candidateName}, candidat${asset.candidateCategory === "miss" ? "e" : ""} ${asset.candidateCategory} pour Miss & Mister Dour 2026. 🚀 by JS-INNOV.IA`;
  const image = asset.assetUrl;
  const url = getShareUrl(asset.candidateId, asset.id);
  
  // Pour les vidéos, utiliser og:video
  const videoMeta = asset.assetType === "video" ? `
    <meta property="og:video" content="${asset.assetUrl}" />
    <meta property="og:video:type" content="video/mp4" />
    <meta property="og:video:width" content="1280" />
    <meta property="og:video:height" content="720" />
  ` : "";

  return `
    <!-- SEO Meta Tags -->
    <meta name="description" content="${description}" />
    <meta name="robots" content="index, follow" />
    <link rel="canonical" href="${url}" />
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="${asset.assetType === "video" ? "video.other" : "article"}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:site_name" content="Miss & Mister Dour 2026" />
    ${videoMeta}
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="${url}" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${image}" />
    
    <!-- LinkedIn -->
    <meta property="og:locale" content="fr_BE" />
    <meta property="og:updated_time" content="${new Date().toISOString()}" />
    
    <!-- Author -->
    <meta name="author" content="JS-Innov.IA - Pagin Julien" />
  `;
}
