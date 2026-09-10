import { useEffect } from "react";

interface SEOHeadProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: "website" | "article";
  author?: string;
  publishedTime?: string;
  tags?: string[];
  noindex?: boolean;
}

const SITE = "https://missetmisterdour.be";
const DEFAULT_IMAGE = `${SITE}/logo/miss-mister-dour-logo-transparent.webp`;

function absoluteUrl(value?: string) {
  if (!value) return DEFAULT_IMAGE;
  try { return new URL(value, SITE).toString(); } catch { return DEFAULT_IMAGE; }
}

export function SEOHead({ title, description, image, url, type = "website", author, publishedTime, tags, noindex = false }: SEOHeadProps) {
  useEffect(() => {
    const textarea = document.createElement("textarea");
    textarea.innerHTML = title;
    const decodedTitle = textarea.value;
    const canonicalUrl = url || `${SITE}${window.location.pathname}`;
    const socialImage = absoluteUrl(image);
    document.title = decodedTitle;

    const meta = (key: string, content: string, byName = false) => {
      const attribute = byName ? "name" : "property";
      let element = document.head.querySelector(`meta[${attribute}="${key}"]`);
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attribute, key);
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    };

    const link = (rel: string, href: string, hreflang?: string) => {
      const selector = hreflang ? `link[rel="${rel}"][hreflang="${hreflang}"]` : `link[rel="${rel}"]:not([hreflang])`;
      let element = document.head.querySelector(selector) as HTMLLinkElement | null;
      if (!element) {
        element = document.createElement("link");
        element.rel = rel;
        if (hreflang) element.hreflang = hreflang;
        document.head.appendChild(element);
      }
      element.href = href;
    };

    meta("description", description, true);
    meta("robots", noindex ? "noindex, nofollow, noarchive" : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1", true);
    meta("googlebot", noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large", true);
    meta("keywords", tags?.join(", ") || "Miss Mister Dour, Dour, Hainaut, Belgique, édition 2027", true);
    meta("author", author || "STARLIGHT ASBL", true);

    meta("og:title", decodedTitle);
    meta("og:description", description);
    meta("og:type", type);
    meta("og:site_name", "Miss & Mister Dour 2027");
    meta("og:locale", "fr_BE");
    meta("og:url", canonicalUrl);
    meta("og:image", socialImage);
    meta("og:image:secure_url", socialImage);
    meta("og:image:alt", decodedTitle);

    meta("twitter:card", "summary_large_image", true);
    meta("twitter:title", decodedTitle, true);
    meta("twitter:description", description, true);
    meta("twitter:image", socialImage, true);
    meta("twitter:image:alt", decodedTitle, true);

    link("canonical", canonicalUrl);
    link("alternate", canonicalUrl, "fr-BE");
    link("alternate", canonicalUrl, "x-default");

    document.documentElement.lang = "fr-BE";

    document.head.querySelectorAll('meta[property="article:tag"]').forEach((node) => node.remove());
    if (type === "article") {
      if (author) meta("article:author", author);
      if (publishedTime) meta("article:published_time", publishedTime);
      tags?.forEach((tag) => {
        const element = document.createElement("meta");
        element.setAttribute("property", "article:tag");
        element.setAttribute("content", tag);
        document.head.appendChild(element);
      });
    }
  }, [title, description, image, url, type, author, publishedTime, tags, noindex]);

  return null;
}
