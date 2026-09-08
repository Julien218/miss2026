/**
 * Générateur de sitemap.xml pour le domaine officiel https://missetmisterdour.be
 * Permet aux moteurs de recherche de découvrir toutes les pages du site
 */

import { getCandidatesByContest } from "./db";
import type { Candidate } from "../drizzle/schema";
import { getPublicBaseUrl, getCandidateUrl, getCanonicalUrl } from "./url-helpers";

/**
 * Génère le contenu XML du sitemap
 * @returns XML string du sitemap
 */
export async function generateSitemap(): Promise<string> {
  const baseUrl = getPublicBaseUrl();
  const now = new Date().toISOString();
  
  // Pages statiques du site
  const staticPages = [
    { url: baseUrl, priority: "1.0", changefreq: "daily" },
    { url: getCanonicalUrl("/about"), priority: "0.8", changefreq: "monthly" },
    { url: getCanonicalUrl("/press"), priority: "0.7", changefreq: "weekly" },
    { url: getCanonicalUrl("/sponsors"), priority: "0.7", changefreq: "monthly" },
    { url: getCanonicalUrl("/contact"), priority: "0.6", changefreq: "monthly" },
    { url: getCanonicalUrl("/legal/cgu"), priority: "0.3", changefreq: "yearly" },
    { url: getCanonicalUrl("/legal/privacy"), priority: "0.3", changefreq: "yearly" },
    { url: getCanonicalUrl("/legal/cookies"), priority: "0.3", changefreq: "yearly" },
  ];
  
  // Récupérer tous les candidats approuvés (contest ID 1 = Miss & Mister Dour 2026)
  let candidateUrls: string[] = [];
  try {
    const candidates = await getCandidatesByContest(1);
    candidateUrls = candidates
      .filter((c: Candidate) => c.status === "approved" || c.status === "finalist" || c.status === "winner")
      .map((c: Candidate) => getCandidateUrl(c.id));
  } catch (error) {
    console.error("Error fetching candidates for sitemap:", error);
  }
  
  // Générer le XML
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  // Ajouter les pages statiques
  for (const page of staticPages) {
    xml += "  <url>\n";
    xml += `    <loc>${page.url}</loc>\n`;
    xml += `    <lastmod>${now}</lastmod>\n`;
    xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
    xml += `    <priority>${page.priority}</priority>\n`;
    xml += "  </url>\n";
  }
  
  // Ajouter les pages candidats
  for (const url of candidateUrls) {
    xml += "  <url>\n";
    xml += `    <loc>${url}</loc>\n`;
    xml += `    <lastmod>${now}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.9</priority>\n`;
    xml += "  </url>\n";
  }
  
  xml += "</urlset>";
  
  return xml;
}

/**
 * Génère le contenu du fichier robots.txt
 * @returns Contenu du robots.txt
 */
export function generateRobotsTxt(): string {
  const baseUrl = getPublicBaseUrl();
  const sitemapUrl = `${baseUrl}/sitemap.xml`;
  
  return `# Robots.txt pour Miss & Mister Dour 2026
# Domaine officiel: ${baseUrl}

User-agent: *
Allow: /

# Pages à ne pas indexer
Disallow: /admin/
Disallow: /api/
Disallow: /dashboard-internal/
Disallow: /video-factory/

# Sitemap
Sitemap: ${sitemapUrl}

# Crawl-delay pour éviter surcharge serveur
Crawl-delay: 1
`;
}
