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

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

export function generateShareAssetOGMeta(asset: ShareAsset) {
  const assetTypeLabel = asset.assetType === "photo" ? "Photo" : "Vidéo";
  const category = asset.candidateCategory === "miss" ? "Miss" : asset.candidateCategory === "mister" ? "Mister" : asset.candidateCategory;
  const title = `${assetTypeLabel} de ${asset.candidateName} — Miss & Mister Dour 2027`;
  const description = asset.caption || `Découvrez ${asset.candidateName}, ${category}, dans l’expérience Miss & Mister Dour 2027.`;
  const url = getShareUrl(asset.candidateId, asset.id);
  const safeTitle = escapeHtml(title), safeDescription = escapeHtml(description), safeUrl = escapeHtml(url), safeAsset = escapeHtml(asset.assetUrl);
  const videoMeta = asset.assetType === "video" ? `<meta property="og:video" content="${safeAsset}" /><meta property="og:video:type" content="video/mp4" />` : "";

  return `
    <meta name="description" content="${safeDescription}" />
    <meta name="robots" content="index, follow, max-image-preview:large" />
    <link rel="canonical" href="${safeUrl}" />
    <meta property="og:type" content="${asset.assetType === "video" ? "video.other" : "article"}" />
    <meta property="og:url" content="${safeUrl}" />
    <meta property="og:title" content="${safeTitle}" />
    <meta property="og:description" content="${safeDescription}" />
    <meta property="og:image" content="${safeAsset}" />
    <meta property="og:image:alt" content="${safeTitle}" />
    <meta property="og:site_name" content="Miss &amp; Mister Dour 2027" />
    <meta property="og:locale" content="fr_BE" />
    ${videoMeta}
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${safeTitle}" />
    <meta name="twitter:description" content="${safeDescription}" />
    <meta name="twitter:image" content="${safeAsset}" />
  `;
}
