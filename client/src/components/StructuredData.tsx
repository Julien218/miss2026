import { useEffect } from "react";

// ==================== TYPES ====================

interface EventSchema {
  "@context": "https://schema.org";
  "@type": "Event";
  name: string;
  startDate: string;
  endDate: string;
  location: {
    "@type": "Place";
    name: string;
    address: {
      "@type": "PostalAddress";
      addressLocality: string;
      addressCountry: string;
    };
  };
  description: string;
  image: string;
  organizer: OrganizationSchema;
  eventStatus: string;
  eventAttendanceMode: string;
}

interface OrganizationSchema {
  "@context"?: "https://schema.org";
  "@type": "Organization";
  name: string;
  url: string;
  logo: string | { "@type": "ImageObject"; url: string };
  description: string;
  foundingDate?: string;
  address?: {
    "@type": "PostalAddress";
    addressLocality: string;
    addressCountry: string;
  };
  sameAs?: string[];
}

interface PersonSchema {
  "@context": "https://schema.org";
  "@type": "Person";
  name: string;
  image: string;
  description: string;
  jobTitle: string;
  address?: {
    "@type": "PostalAddress";
    addressLocality: string;
    addressCountry: string;
  };
  sameAs?: string[];
}

interface ArticleSchema {
  "@context": "https://schema.org";
  "@type": "Article";
  headline: string;
  image: string;
  datePublished: string;
  dateModified: string;
  author: OrganizationSchema;
  publisher: OrganizationSchema & { logo: { "@type": "ImageObject"; url: string } };
  description: string;
}

type StructuredDataProps = {
  data: EventSchema | OrganizationSchema | PersonSchema | ArticleSchema;
};

// ==================== COMPONENT ====================

export function StructuredData({ data }: StructuredDataProps) {
  useEffect(() => {
    // Inject JSON-LD script into head
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify(data);
    document.head.appendChild(script);

    return () => {
      // Cleanup on unmount
      document.head.removeChild(script);
    };
  }, [data]);

  return null; // This component doesn't render anything
}

// ==================== HELPERS ====================

export function createEventSchema(baseUrl: string): EventSchema {
  const organizationSchema = createOrganizationSchema(baseUrl);

  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: "Miss & Mister Dour 2026 - Finale",
    startDate: "2026-04-19T19:00:00+02:00",
    endDate: "2026-04-19T23:59:00+02:00",
    location: {
      "@type": "Place",
      name: "Liligaga Mirror",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Dour",
        addressCountry: "BE",
      },
    },
    description:
      "Finale de l'élection Miss & Mister Dour 2026. Un miroir ne reflète pas seulement l'image… Il révèle l'essence. Découvrez les candidats et votez pour votre favori(te).",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/87304619/ikVKix4dpn7zVKKnzoiv6V/miss-mister-dour-logo-transparent_68980609.png",
    organizer: organizationSchema,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  };
}

export function createOrganizationSchema(baseUrl: string): OrganizationSchema {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Miss & Mister Dour",
    url: baseUrl,
    logo: "https://d2xsxph8kpxj0f.cloudfront.net/87304619/ikVKix4dpn7zVKKnzoiv6V/miss-mister-dour-logo-transparent_68980609.png",
    description:
      "Organisation de l'élection Miss & Mister Dour 2026. Un événement prestigieux célébrant l'élégance, le talent et l'engagement communautaire à Dour, Belgique.",
    foundingDate: "2026",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Dour",
      addressCountry: "BE",
    },
    sameAs: [
      // Add social media URLs when available
      // "https://www.facebook.com/missmisterdour",
      // "https://www.instagram.com/missmisterdour",
    ],
  };
}

export function createPersonSchema(
  name: string,
  image: string,
  bio: string,
  city: string,
  category: "Miss" | "Mister",
  socialLinks?: { instagram?: string; facebook?: string; tiktok?: string; linkedin?: string }
): PersonSchema {
  const sameAs: string[] = [];
  if (socialLinks?.instagram) sameAs.push(socialLinks.instagram);
  if (socialLinks?.facebook) sameAs.push(socialLinks.facebook);
  if (socialLinks?.tiktok) sameAs.push(socialLinks.tiktok);
  if (socialLinks?.linkedin) sameAs.push(socialLinks.linkedin);

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    image,
    description: bio,
    jobTitle: `Candidat(e) ${category} Dour 2026`,
    address: {
      "@type": "PostalAddress",
      addressLocality: city,
      addressCountry: "BE",
    },
    ...(sameAs.length > 0 && { sameAs }),
  };
}

export function createArticleSchema(
  baseUrl: string,
  title: string,
  image: string,
  excerpt: string,
  publishedDate: string,
  modifiedDate: string
): ArticleSchema {
  const organizationSchema = createOrganizationSchema(baseUrl);
  const logoUrl = typeof organizationSchema.logo === 'string' ? organizationSchema.logo : organizationSchema.logo.url;

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    image,
    datePublished: publishedDate,
    dateModified: modifiedDate,
    author: organizationSchema,
    publisher: {
      ...organizationSchema,
      logo: {
        "@type": "ImageObject",
        url: logoUrl,
      },
    },
    description: excerpt,
  };
}
