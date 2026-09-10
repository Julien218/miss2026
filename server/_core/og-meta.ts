import type { Request, Response, NextFunction } from "express";
import { getCandidateById } from "../db";
import { getCandidateUrl, getHomepageUrl } from "../url-helpers";
import { generateShareAssetOGMeta, type ShareAsset } from "./share-meta";

const DEFAULT_IMAGE = "https://missetmisterdour.be/logo/miss-mister-dour-logo-transparent.webp";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function baseMeta({ title, description, url, image = DEFAULT_IMAGE, type = "website" }: { title: string; description: string; url: string; image?: string; type?: string }) {
  const safeTitle = escapeHtml(title);
  const safeDescription = escapeHtml(description);
  const safeUrl = escapeHtml(url);
  const safeImage = escapeHtml(image);
  return `
    <meta name="description" content="${safeDescription}" />
    <meta name="robots" content="index, follow, max-image-preview:large" />
    <link rel="canonical" href="${safeUrl}" />
    <meta property="og:type" content="${type}" />
    <meta property="og:url" content="${safeUrl}" />
    <meta property="og:title" content="${safeTitle}" />
    <meta property="og:description" content="${safeDescription}" />
    <meta property="og:image" content="${safeImage}" />
    <meta property="og:image:secure_url" content="${safeImage}" />
    <meta property="og:image:alt" content="${safeTitle}" />
    <meta property="og:site_name" content="Miss &amp; Mister Dour 2027" />
    <meta property="og:locale" content="fr_BE" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${safeTitle}" />
    <meta name="twitter:description" content="${safeDescription}" />
    <meta name="twitter:image" content="${safeImage}" />
  `;
}

export function generateHomepageOGMeta() {
  const title = "Miss & Mister Dour 2027 — Site officiel";
  const description = "Découvrez les candidats, la galerie, le classement, les actualités, les partenaires et les inscriptions de Miss & Mister Dour 2027 à Dour, en Belgique.";
  return baseMeta({ title, description, url: getHomepageUrl() });
}

export function generateCandidateOGMeta(candidate: { id: number; firstName: string; lastName: string; category: string; bio?: string | null; profilePhoto?: string | null }) {
  const category = candidate.category === "miss" ? "Miss" : candidate.category === "mister" ? "Mister" : candidate.category;
  const title = `${candidate.firstName} ${candidate.lastName} — ${category} · Miss & Mister Dour 2027`;
  const description = candidate.bio || `Découvrez le profil officiel de ${candidate.firstName} ${candidate.lastName} pour Miss & Mister Dour 2027.`;
  return baseMeta({ title, description, url: getCandidateUrl(candidate.id), image: candidate.profilePhoto || DEFAULT_IMAGE, type: "profile" });
}

export async function ogMetaMiddleware(req: Request, res: Response, next: NextFunction) {
  if (req.path === "/") {
    res.locals.ogMeta = generateHomepageOGMeta();
    res.locals.pageTitle = "Miss & Mister Dour 2027 — Site officiel";
    return next();
  }

  const shareMatch = req.path.match(/^\/share\/(\d+)\/(\d+)$/);
  if (shareMatch) {
    const candidateId = Number(shareMatch[1]);
    const assetId = Number(shareMatch[2]);
    try {
      const candidate = await getCandidateById(candidateId);
      if (candidate) {
        const asset: ShareAsset = {
          id: assetId,
          candidateId,
          candidateName: `${candidate.firstName} ${candidate.lastName}`,
          candidateCategory: candidate.category,
          assetType: "photo",
          assetUrl: candidate.profilePhoto || DEFAULT_IMAGE,
          caption: `Profil de ${candidate.firstName} ${candidate.lastName} — Miss & Mister Dour 2027`,
        };
        res.locals.ogMeta = generateShareAssetOGMeta(asset);
        res.locals.pageTitle = `Profil de ${candidate.firstName} ${candidate.lastName}`;
      }
    } catch (error) {
      console.error("[OG] share metadata error", error);
    }
    return next();
  }

  const candidateMatch = req.path.match(/^\/(?:candidate|candidat|candidates)\/(\d+)$/);
  if (candidateMatch) {
    try {
      const candidate = await getCandidateById(Number(candidateMatch[1]));
      if (candidate) {
        res.locals.ogMeta = generateCandidateOGMeta(candidate);
        res.locals.pageTitle = `${candidate.firstName} ${candidate.lastName} — Miss & Mister Dour 2027`;
      }
    } catch (error) {
      console.error("[OG] candidate metadata error", error);
    }
  }
  next();
}

export function injectOGMetaIntoHTML(html: string, ogMeta?: string, pageTitle?: string): string {
  if (!ogMeta) return html;
  if (pageTitle) html = html.replace(/<title>.*?<\/title>/, `<title>${escapeHtml(pageTitle)}</title>`);
  return html.replace("</head>", `${ogMeta}\n</head>`);
}
