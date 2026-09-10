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

/**
 * SEOHead component - Manages meta tags for SEO and social sharing.
 * Dynamically updates Open Graph, Twitter Card, and standard meta tags.
 */
export function SEOHead({
  title,
  description,
  image,
  url,
  type = "website",
  author,
  publishedTime,
  tags,
  noindex = false,
}: SEOHeadProps) {
  useEffect(() => {
    const decodeHtml = (str: string): string => {
      const textarea = document.createElement("textarea");
      textarea.innerHTML = str;
      return textarea.value;
    };
    const decodedTitle = decodeHtml(title);
    document.title = decodedTitle;

    const updateMetaTag = (property: string, content: string, isName = false) => {
      const attribute = isName ? "name" : "property";
      let element = document.querySelector(`meta[${attribute}="${property}"]`);

      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attribute, property);
        document.head.appendChild(element);
      }

      element.setAttribute("content", content);
    };

    updateMetaTag("description", description, true);
    updateMetaTag("robots", noindex ? "noindex, nofollow" : "index, follow", true);
    if (tags && tags.length > 0) {
      updateMetaTag("keywords", tags.join(", "), true);
    }

    updateMetaTag("og:title", title);
    updateMetaTag("og:description", description);
    updateMetaTag("og:type", type);
    updateMetaTag("og:site_name", "Miss & Mister Dour 2027");
    updateMetaTag("og:locale", "fr_FR");

    if (image) {
      updateMetaTag("og:image", image);
      updateMetaTag("og:image:width", "1200");
      updateMetaTag("og:image:height", "630");
      updateMetaTag("og:image:alt", title);
    }

    if (url) {
      updateMetaTag("og:url", url);

      let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!canonical) {
        canonical = document.createElement("link");
        canonical.rel = "canonical";
        document.head.appendChild(canonical);
      }
      canonical.href = url;
    }

    updateMetaTag("twitter:card", image ? "summary_large_image" : "summary", true);
    updateMetaTag("twitter:title", title, true);
    updateMetaTag("twitter:description", description, true);
    if (image) {
      updateMetaTag("twitter:image", image, true);
      updateMetaTag("twitter:image:alt", title, true);
    }

    if (type === "article") {
      if (author) updateMetaTag("article:author", author);
      if (publishedTime) updateMetaTag("article:published_time", publishedTime);
      if (tags && tags.length > 0) {
        tags.forEach((tag) => updateMetaTag("article:tag", tag));
      }
    }

    return () => {
      document.title = "Miss & Mister Dour 2027";
    };
  }, [title, description, image, url, type, author, publishedTime, tags, noindex]);

  return null;
}
