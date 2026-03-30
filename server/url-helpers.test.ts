import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  getPublicBaseUrl,
  getCandidateUrl,
  getShareUrl,
  getInvitationUrl,
  getCanonicalUrl,
  getHomepageUrl,
  getSitemapUrl,
} from "./url-helpers";

describe("URL Helpers", () => {
  const originalEnv = process.env.PUBLIC_BASE_URL;

  afterEach(() => {
    // Restaurer la valeur originale
    if (originalEnv) {
      process.env.PUBLIC_BASE_URL = originalEnv;
    } else {
      delete process.env.PUBLIC_BASE_URL;
    }
  });

  describe("getPublicBaseUrl", () => {
    it("should return PUBLIC_BASE_URL from environment", () => {
      process.env.PUBLIC_BASE_URL = "https://missetmisterdour.be";
      expect(getPublicBaseUrl()).toBe("https://missetmisterdour.be");
    });

    it("should return default domain if PUBLIC_BASE_URL not set", () => {
      delete process.env.PUBLIC_BASE_URL;
      expect(getPublicBaseUrl()).toBe("https://missetmisterdour.be");
    });

    it("should not have trailing slash", () => {
      process.env.PUBLIC_BASE_URL = "https://missetmisterdour.be";
      const baseUrl = getPublicBaseUrl();
      expect(baseUrl.endsWith("/")).toBe(false);
    });
  });

  describe("getCandidateUrl", () => {
    beforeEach(() => {
      process.env.PUBLIC_BASE_URL = "https://missetmisterdour.be";
    });

    it("should generate correct candidate URL", () => {
      expect(getCandidateUrl(123)).toBe("https://missetmisterdour.be/candidate/123");
    });

    it("should work with different candidate IDs", () => {
      expect(getCandidateUrl(1)).toBe("https://missetmisterdour.be/candidate/1");
      expect(getCandidateUrl(999)).toBe("https://missetmisterdour.be/candidate/999");
    });
  });

  describe("getShareUrl", () => {
    beforeEach(() => {
      process.env.PUBLIC_BASE_URL = "https://missetmisterdour.be";
    });

    it("should generate correct share URL", () => {
      expect(getShareUrl(123, 456)).toBe("https://missetmisterdour.be/share/123/456");
    });

    it("should work with different IDs", () => {
      expect(getShareUrl(1, 1)).toBe("https://missetmisterdour.be/share/1/1");
      expect(getShareUrl(999, 888)).toBe("https://missetmisterdour.be/share/999/888");
    });
  });

  describe("getInvitationUrl", () => {
    beforeEach(() => {
      process.env.PUBLIC_BASE_URL = "https://missetmisterdour.be";
    });

    it("should generate correct invitation URL", () => {
      expect(getInvitationUrl("abc123xyz")).toBe("https://missetmisterdour.be/invite/abc123xyz");
    });

    it("should work with UUID tokens", () => {
      const token = "550e8400-e29b-41d4-a716-446655440000";
      expect(getInvitationUrl(token)).toBe(`https://missetmisterdour.be/invite/${token}`);
    });
  });

  describe("getCanonicalUrl", () => {
    beforeEach(() => {
      process.env.PUBLIC_BASE_URL = "https://missetmisterdour.be";
    });

    it("should generate correct canonical URL", () => {
      expect(getCanonicalUrl("/about")).toBe("https://missetmisterdour.be/about");
    });

    it("should handle path without leading slash", () => {
      expect(getCanonicalUrl("about")).toBe("https://missetmisterdour.be/about");
    });

    it("should work with nested paths", () => {
      expect(getCanonicalUrl("/candidate/123")).toBe("https://missetmisterdour.be/candidate/123");
    });

    it("should handle root path", () => {
      expect(getCanonicalUrl("/")).toBe("https://missetmisterdour.be/");
    });
  });

  describe("getHomepageUrl", () => {
    beforeEach(() => {
      process.env.PUBLIC_BASE_URL = "https://missetmisterdour.be";
    });

    it("should return homepage URL", () => {
      expect(getHomepageUrl()).toBe("https://missetmisterdour.be");
    });
  });

  describe("getSitemapUrl", () => {
    beforeEach(() => {
      process.env.PUBLIC_BASE_URL = "https://missetmisterdour.be";
    });

    it("should return sitemap URL", () => {
      expect(getSitemapUrl()).toBe("https://missetmisterdour.be/sitemap.xml");
    });
  });

  describe("Domain consistency", () => {
    beforeEach(() => {
      process.env.PUBLIC_BASE_URL = "https://missetmisterdour.be";
    });

    it("all URLs should use official domain missetmisterdour.be", () => {
      const urls = [
        getCandidateUrl(1),
        getShareUrl(1, 1),
        getInvitationUrl("token"),
        getCanonicalUrl("/about"),
        getHomepageUrl(),
        getSitemapUrl(),
      ];

      urls.forEach((url) => {
        expect(url).toContain("missetmisterdour.be");
        expect(url).not.toContain("manus.space");
        expect(url).not.toContain("manus.computer");
      });
    });

    it("all URLs should use HTTPS protocol", () => {
      const urls = [
        getCandidateUrl(1),
        getShareUrl(1, 1),
        getInvitationUrl("token"),
        getCanonicalUrl("/about"),
        getHomepageUrl(),
        getSitemapUrl(),
      ];

      urls.forEach((url) => {
        expect(url).toMatch(/^https:\/\//);
      });
    });
  });
});
