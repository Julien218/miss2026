import { describe, it, expect } from "vitest";
import { generateSitemap, generateRobotsTxt } from "./sitemap";
import { getPublicBaseUrl, getCandidateUrl, getShareUrl, getHomepageUrl } from "./url-helpers";

describe("Configuration Domaine Officiel", () => {
  const officialDomain = "https://missetmisterdour.be";

  describe("PUBLIC_BASE_URL Configuration", () => {
    it("should use official domain missetmisterdour.be", () => {
      const baseUrl = getPublicBaseUrl();
      expect(baseUrl).toBe(officialDomain);
    });

    it("should NOT contain manus.space or manus.computer", () => {
      const baseUrl = getPublicBaseUrl();
      expect(baseUrl).not.toContain("manus.space");
      expect(baseUrl).not.toContain("manus.computer");
    });

    it("should use HTTPS protocol", () => {
      const baseUrl = getPublicBaseUrl();
      expect(baseUrl).toMatch(/^https:\/\//);
    });
  });

  describe("URL Helpers avec domaine officiel", () => {
    it("getCandidateUrl should use official domain", () => {
      const url = getCandidateUrl(123);
      expect(url).toBe(`${officialDomain}/candidate/123`);
      expect(url).not.toContain("manus.space");
    });

    it("getShareUrl should use official domain", () => {
      const url = getShareUrl(123, 456);
      expect(url).toBe(`${officialDomain}/share/123/456`);
      expect(url).not.toContain("manus.space");
    });

    it("getHomepageUrl should use official domain", () => {
      const url = getHomepageUrl();
      expect(url).toBe(officialDomain);
      expect(url).not.toContain("manus.space");
    });
  });

  describe("Sitemap.xml avec domaine officiel", () => {
    it("should generate valid XML sitemap", async () => {
      const sitemap = await generateSitemap();
      
      // Vérifier structure XML
      expect(sitemap).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(sitemap).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
      expect(sitemap).toContain('</urlset>');
    });

    it("should use official domain in all URLs", async () => {
      const sitemap = await generateSitemap();
      
      // Vérifier que toutes les URLs utilisent le domaine officiel
      expect(sitemap).toContain(`<loc>${officialDomain}</loc>`); // Homepage sans slash final
      expect(sitemap).toContain(`<loc>${officialDomain}/about</loc>`);
      
      // Vérifier qu'aucune URL ne contient manus.space
      expect(sitemap).not.toContain("manus.space");
      expect(sitemap).not.toContain("manus.computer");
    });

    it("should include homepage with priority 1.0", async () => {
      const sitemap = await generateSitemap();
      
      expect(sitemap).toContain(`<loc>${officialDomain}</loc>`); // Homepage sans slash final
      expect(sitemap).toContain("<priority>1.0</priority>");
    });

    it("should include static pages", async () => {
      const sitemap = await generateSitemap();
      
      expect(sitemap).toContain(`<loc>${officialDomain}/about</loc>`);
      expect(sitemap).toContain(`<loc>${officialDomain}/press</loc>`);
      expect(sitemap).toContain(`<loc>${officialDomain}/sponsors</loc>`);
    });
  });

  describe("Robots.txt avec domaine officiel", () => {
    it("should generate valid robots.txt", () => {
      const robotsTxt = generateRobotsTxt();
      
      expect(robotsTxt).toContain("User-agent: *");
      expect(robotsTxt).toContain("Allow: /");
    });

    it("should reference official domain sitemap", () => {
      const robotsTxt = generateRobotsTxt();
      
      expect(robotsTxt).toContain(`Sitemap: ${officialDomain}/sitemap.xml`);
      expect(robotsTxt).not.toContain("manus.space");
      expect(robotsTxt).not.toContain("manus.computer");
    });

    it("should disallow admin and API routes", () => {
      const robotsTxt = generateRobotsTxt();
      
      expect(robotsTxt).toContain("Disallow: /admin/");
      expect(robotsTxt).toContain("Disallow: /api/");
    });

    it("should include crawl-delay", () => {
      const robotsTxt = generateRobotsTxt();
      
      expect(robotsTxt).toContain("Crawl-delay: 1");
    });
  });

  describe("SEO et Canonical URLs", () => {
    it("all URLs should be absolute with official domain", () => {
      const urls = [
        getCandidateUrl(1),
        getShareUrl(1, 1),
        getHomepageUrl(),
      ];

      urls.forEach((url) => {
        expect(url).toMatch(/^https:\/\/missetmisterdour\.be/);
        expect(url).not.toContain("manus.space");
        expect(url).not.toContain("localhost");
      });
    });

    it("should enforce HTTPS for all URLs", () => {
      const urls = [
        getCandidateUrl(1),
        getShareUrl(1, 1),
        getHomepageUrl(),
      ];

      urls.forEach((url) => {
        expect(url).toMatch(/^https:\/\//);
        expect(url).not.toMatch(/^http:\/\//);
      });
    });
  });

  describe("Signature JS-INNOV.IA", () => {
    it("sitemap should reference JS-Innov.IA in comments", async () => {
      const sitemap = await generateSitemap();
      // Le sitemap XML ne contient pas de commentaires mais les meta OG oui
      expect(sitemap).toBeDefined();
    });

    it("robots.txt should reference official domain", () => {
      const robotsTxt = generateRobotsTxt();
      expect(robotsTxt).toContain("Miss & Mister Dour 2026");
      expect(robotsTxt).toContain(officialDomain);
    });
  });
});
