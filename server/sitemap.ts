import { getAllContests, getArticles, getCandidatesByContest } from "./db";
import type { Candidate } from "../drizzle/schema";
import { getPublicBaseUrl } from "./url-helpers";

function escapeXml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

function absolute(path = "/") {
  return new URL(path, `${getPublicBaseUrl().replace(/\/$/, "")}/`).toString();
}

export async function generateSitemap(): Promise<string> {
  const now = new Date().toISOString();
  const urls = new Map<string, { changefreq: string; priority: string }>();
  const add = (url: string, changefreq: string, priority: string) => urls.set(url, { changefreq, priority });

  add(absolute("/"), "daily", "1.0");
  add(absolute("/candidates"), "daily", "0.95");
  add(absolute("/ranking"), "daily", "0.9");
  add(absolute("/gallery"), "weekly", "0.9");
  add(absolute("/inscription-candidat"), "weekly", "0.9");
  add(absolute("/public"), "weekly", "0.85");
  add(absolute("/about"), "monthly", "0.8");
  add(absolute("/sponsors"), "monthly", "0.8");
  add(absolute("/press"), "monthly", "0.7");
  add(absolute("/contact"), "monthly", "0.7");
  add(absolute("/legal/cgu"), "yearly", "0.2");
  add(absolute("/legal/privacy"), "yearly", "0.2");
  add(absolute("/legal/cookies"), "yearly", "0.2");
  add(absolute("/mentions-legales"), "yearly", "0.2");

  try {
    const editions = await getAllContests();
    for (const edition of editions) {
      const candidates = await getCandidatesByContest(edition.id);
      for (const candidate of candidates as Candidate[]) {
        if (["approved", "finalist", "winner"].includes(candidate.status)) {
          add(absolute(`/candidat/${candidate.id}`), "weekly", "0.85");
        }
      }
    }
  } catch (error) {
    console.error("[Sitemap] candidates unavailable", error);
  }

  try {
    const articles = await getArticles({ status: "published", limit: 500, offset: 0 });
    for (const article of articles) {
      const identifier = article.slug || article.id;
      if (identifier) add(absolute(`/article/${identifier}`), "monthly", "0.7");
    }
  } catch (error) {
    console.error("[Sitemap] articles unavailable", error);
  }

  const body = Array.from(urls.entries()).map(([url, meta]) => [
    "  <url>",
    `    <loc>${escapeXml(url)}</loc>`,
    `    <lastmod>${now}</lastmod>`,
    `    <changefreq>${meta.changefreq}</changefreq>`,
    `    <priority>${meta.priority}</priority>`,
    "  </url>",
  ].join("\n")).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>`;
}

export function generateRobotsTxt(): string {
  return `# Miss & Mister Dour 2027 — robots.txt
User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin
Disallow: /dashboard
Disallow: /dashboard-internal
Disallow: /login
Disallow: /settings
Disallow: /notifications
Disallow: /candidate/
Disallow: /candidate/register
Disallow: /my-profile
Disallow: /profile/edit/
Disallow: /invite/
Disallow: /invitation/
Disallow: /onboarding/
Disallow: /jury/
Disallow: /choreographer
Disallow: /photographer
Disallow: /video-factory
Disallow: /intro
Disallow: /miss-mister-dour-2026

Sitemap: ${absolute("/sitemap.xml")}
`;
}
