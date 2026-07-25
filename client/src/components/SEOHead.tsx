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
}

/**
 * SEOHead component - Manages meta tags for SEO and social sharing
 * Dynamically updates Open Graph, Twitter Card, and standard meta tags
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
}: SEOHeadProps) {
  useEffect(() => {
    // Decode HTML entities before assigning to document.title
    // (e.g. &amp; → &) so the browser reports the correct character count
    const decodeHtml = (str: string): string => {
      const textarea = document.createElement("textarea");
      textarea.innerHTML = str;
      return textarea.value;
    };
    const decodedTitle = decodeHtml(title);
    // Update document title — use decoded title directly (no suffix) to stay ≤60 chars
    document.title = decodedTitle;

    // Get or create meta tags
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

    // Standard meta tags
    updateMetaTag("description", description, true);
    if (tags && tags.length > 0) {
      updateMetaTag("keywords", tags.join(", "), true);
    }

    // Open Graph meta tags
    updateMetaTag("og:title", title);
    updateMetaTag("og:description", description);
    updateMetaTag("og:type", type);
    updateMetaTag("og:site_name", "Miss & Mister Dour 2026");
    updateMetaTag("og:locale", "fr_FR");
    
    if (image) {
      updateMetaTag("og:image", image);
      updateMetaTag("og:image:width", "1200");
      updateMetaTag("og:image:height", "630");
      updateMetaTag("og:image:alt", title);
    }
    
    if (url) {
      updateMetaTag("og:url", url);
      
      // Canonical URL
      let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!canonical) {
        canonical = document.createElement("link");
        canonical.rel = "canonical";
        document.head.appendChild(canonical);
      }
      canonical.href = url;
    }

    // Twitter Card meta tags
    updateMetaTag("twitter:card", image ? "summary_large_image" : "summary", true);
    updateMetaTag("twitter:title", title, true);
    updateMetaTag("twitter:description", description, true);
    if (image) {
      updateMetaTag("twitter:image", image, true);
      updateMetaTag("twitter:image:alt", title, true);
    }

    // Article-specific meta tags
    if (type === "article") {
      if (author) {
        updateMetaTag("article:author", author);
      }
      if (publishedTime) {
        updateMetaTag("article:published_time", publishedTime);
      }
      if (tags && tags.length > 0) {
        tags.forEach((tag) => {
          updateMetaTag("article:tag", tag);
        });
      }
    }

    // Cleanup function to reset title on unmount
    return () => {
      document.title = "Miss & Mister Dour 2026";
    };
  }, [title, description, image, url, type, author, publishedTime, tags]);

  return null; // This component doesn't render anything
}
