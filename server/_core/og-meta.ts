/**
 * Middleware SSR pour injecter les meta OG/Twitter dans le HTML
 * Permet aux réseaux sociaux (Facebook, LinkedIn, X) de lire les previews
 */

import { Request, Response, NextFunction } from "express";
import { getCandidateById } from "../db";
import { getPublicBaseUrl, getCandidateUrl, getHomepageUrl } from "../url-helpers";
import { generateShareAssetOGMeta, type ShareAsset } from "./share-meta";

/**
 * Génère les meta tags SEO pour la homepage
 */
export function generateHomepageOGMeta() {
  const title = "Miss & Mister Dour 2026 | Élection de Prestige Internationale - Belgique";
  const description = "Miss & Mister Dour 2026 : soirée de prestige internationale le 19 avril au Centre Culturel de Dour, Belgique. Élection célébrant élégance, talent et charisme. Créé par JS-Innov.IA - Pagin Julien.";
  const keywords = "Miss Mister Dour, élection beauté Belgique, concours élégance, Miss Dour 2026, Mister Dour 2026, Centre Culturel Dour, élection prestige, concours talent, JS-Innov.IA, Pagin Julien, SaaS élection, plateforme vote, Dour Belgique, élection internationale";
  const image = "https://files.manuscdn.com/user_upload_by_module/session_file/87304619/HologrammeMiss&MisterDouretJs-innov.ia.png";
  const url = getHomepageUrl();
  const schemaEvent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Event",
    "name": "Miss & Mister Dour 2026",
    "description": "Soirée de prestige internationale célébrant l'élégance, le talent et le charisme.",
    "startDate": "2026-04-19T19:00:00+02:00",
    "endDate": "2026-04-19T23:59:00+02:00",
    "eventStatus": "https://schema.org/EventScheduled",
    "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
    "location": {
      "@type": "Place",
      "name": "Centre Culturel de Dour",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Dour",
        "postalCode": "7370",
        "addressCountry": "BE"
      }
    },
    "image": image,
    "organizer": {
      "@type": "Organization",
      "name": "JS-Innov.IA",
      "url": "https://jsinnovia.com",
      "founder": {
        "@type": "Person",
        "name": "Pagin Julien",
        "email": "paginjulien@gmail.com",
        "address": { "@type": "PostalAddress", "addressLocality": "Dour", "addressCountry": "BE" }
      }
    },
    "offers": { "@type": "Offer", "url": url, "availability": "https://schema.org/InStock" }
  });
  const schemaWebSite = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Miss & Mister Dour 2026",
    "url": url,
    "description": "Plateforme événementielle internationale créée par JS-Innov.IA - Pagin Julien.",
    "creator": {
      "@type": "Organization",
      "name": "JS-Innov.IA",
      "url": "https://jsinnovia.com",
      "founder": { "@type": "Person", "name": "Pagin Julien", "email": "paginjulien@gmail.com" }
    }
  });

  return `
    <!-- SEO Meta Tags -->
    <meta name="description" content="${description}" />
    <meta name="keywords" content="${keywords}" />
    <meta name="author" content="JS-Innov.IA - Pagin Julien, Dour, Belgique" />
    <meta name="robots" content="index, follow" />
    <meta name="googlebot" content="index, follow" />
    <link rel="canonical" href="${url}" />
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${url}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="Soirée de prestige internationale le 19 avril 2026 au Centre Culturel de Dour, Belgique. Célébration de l'élégance, du talent et du charisme." />
    <meta property="og:image" content="${image}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:site_name" content="Miss & Mister Dour 2026" />
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="${url}" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="Soirée de prestige internationale le 19 avril 2026 au Centre Culturel de Dour, Belgique." />
    <meta name="twitter:image" content="${image}" />
    
    <!-- LinkedIn -->
    <meta property="og:locale" content="fr_BE" />
    <meta property="og:updated_time" content="${new Date().toISOString()}" />
    
    <!-- Schema.org JSON-LD for Rich Snippets -->
    <script type="application/ld+json">${schemaEvent}</script>
    <script type="application/ld+json">${schemaWebSite}</script>
  `;
}

/**
 * Génère les meta tags OG/Twitter pour une page candidat
 */
export function generateCandidateOGMeta(candidate: {
  id: number;
  firstName: string;
  lastName: string;
  category: string;
  bio?: string | null;
  profilePhoto?: string | null;
}) {
  const title = `${candidate.firstName} ${candidate.lastName} - ${candidate.category} | Miss & Mister Dour 2026`;
  const description = candidate.bio || `Découvrez le profil de ${candidate.firstName} ${candidate.lastName}, candidat${candidate.category === "miss" ? "e" : ""} ${candidate.category} pour Miss & Mister Dour 2026.`;
  const image = candidate.profilePhoto || "https://files.manuscdn.com/user_upload_by_module/session_file/87304619/HologrammeMiss&MisterDouretJs-innov.ia.png";
  const url = getCandidateUrl(candidate.id);

  return `
    <!-- SEO Meta Tags -->
    <meta name="description" content="${description}" />
    <meta name="robots" content="index, follow" />
    <link rel="canonical" href="${url}" />
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="profile" />
    <meta property="og:url" content="${url}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:site_name" content="Miss & Mister Dour 2026" />
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="${url}" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${image}" />
    
    <!-- LinkedIn -->
    <meta property="og:locale" content="fr_BE" />
    <meta property="og:updated_time" content="${new Date().toISOString()}" />
  `;
}

/**
 * Middleware Express pour injecter les meta OG dans le HTML
 */
export async function ogMetaMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Vérifier si la route est la homepage
  if (req.path === "/") {
    res.locals.ogMeta = generateHomepageOGMeta();
    res.locals.pageTitle = "Miss & Mister Dour 2026 | Élection de Prestige Internationale - Belgique";
    return next();
  }
  
  // Vérifier si la route correspond à /share/:candidateId/:assetId
  const shareMatch = req.path.match(/^\/share\/(\d+)\/(\d+)$/);
  
  if (shareMatch) {
    const candidateId = parseInt(shareMatch[1], 10);
    const assetId = parseInt(shareMatch[2], 10);
    
    try {
      // TODO: Récupérer l'asset depuis la base de données
      // Pour l'instant, générer des meta basiques
      const candidate = await getCandidateById(candidateId);
      
      if (candidate) {
        // Créer un asset fictif pour les meta (à remplacer par vraie requête DB)
        const asset: ShareAsset = {
          id: assetId,
          candidateId: candidateId,
          candidateName: `${candidate.firstName} ${candidate.lastName}`,
          candidateCategory: candidate.category,
          assetType: "photo",
          assetUrl: candidate.profilePhoto || "https://files.manuscdn.com/user_upload_by_module/session_file/87304619/HologrammeMiss&MisterDouretJs-innov.ia.png",
          caption: `Photo de ${candidate.firstName} ${candidate.lastName} - Miss & Mister Dour 2026`,
        };
        
        res.locals.ogMeta = generateShareAssetOGMeta(asset);
        res.locals.pageTitle = `Photo de ${candidate.firstName} ${candidate.lastName}`;
      }
    } catch (error) {
      console.error("Error fetching asset for OG meta:", error);
    }
    
    return next();
  }
  
  // Vérifier si la route correspond à /candidate/:id
  const candidateMatch = req.path.match(/^\/candidate\/(\d+)$/);
  
  if (candidateMatch) {
    const candidateId = parseInt(candidateMatch[1], 10);
    
    try {
      const candidate = await getCandidateById(candidateId);
      
      if (candidate) {
        // Stocker les meta OG dans res.locals pour injection ultérieure
        res.locals.ogMeta = generateCandidateOGMeta(candidate);
        res.locals.pageTitle = `${candidate.firstName} ${candidate.lastName} - ${candidate.category}`;
      }
    } catch (error) {
      console.error("Error fetching candidate for OG meta:", error);
    }
  }
  
  next();
}

/**
 * Injecte les meta OG dans le HTML avant envoi au client
 */
export function injectOGMetaIntoHTML(html: string, ogMeta?: string, pageTitle?: string): string {
  if (!ogMeta) return html;
  
  // Remplacer le title si fourni
  if (pageTitle) {
    html = html.replace(
      /<title>.*?<\/title>/,
      `<title>${pageTitle} | Miss & Mister Dour 2026</title>`
    );
  }
  
  // Injecter les meta OG juste avant </head>
  html = html.replace("</head>", `${ogMeta}\n  </head>`);
  
  return html;
}
