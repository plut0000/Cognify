import type { Metadata } from "next";

const FALLBACK_SITE_URL = "https://cognify-alpha.vercel.app";

function normalizeSiteUrl(value: string) {
  const trimmed = value.trim().replace(/\/$/, "");
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function resolveSiteUrl() {
  const configured = normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL || "");
  const candidate = configured || FALLBACK_SITE_URL;
  try {
    const url = new URL(candidate);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return FALLBACK_SITE_URL;
    }
    return url.origin;
  } catch {
    return FALLBACK_SITE_URL;
  }
}

export const siteConfig = {
  name: "Cognify",
  url: resolveSiteUrl(),
  githubUrl: "https://github.com/plut0000/Cognify",
  title: "Cognify — Learn from your own notes",
  description:
    "Upload PDFs and class notes, get clear summaries, generate flashcards, quizzes, and slideshows, and study with a source-grounded Gemini coach.",
  shortDescription:
    "Turn class notes into summaries, flashcards, quizzes, slideshows, and source-grounded study help.",
} as const;

export const metadataBase = new URL(siteConfig.url);

export function absoluteUrl(path = "/") {
  return new URL(path, `${siteConfig.url}/`).toString();
}

type PageMetadataInput = {
  title: string | { absolute: string };
  description: string;
  path: string;
  index?: boolean;
};

export function pageMetadata({
  title,
  description,
  path,
  index = true,
}: PageMetadataInput): Metadata {
  const resolvedTitle = typeof title === "string" ? `${title} · Cognify` : title.absolute;

  const canonical = absoluteUrl(path);

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title: resolvedTitle,
      description,
      url: canonical,
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: "Cognify — learn from your own notes",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: resolvedTitle,
      description,
      images: ["/twitter-image"],
    },
    robots: index
      ? undefined
      : {
          index: false,
          follow: false,
          nocache: true,
        },
  };
}

export const organizationId = `${siteConfig.url}/#organization`;
export const websiteId = `${siteConfig.url}/#website`;
export const appId = `${siteConfig.url}/#application`;

export function siteGraphJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": organizationId,
        name: siteConfig.name,
        url: siteConfig.url,
        logo: {
          "@type": "ImageObject",
          url: absoluteUrl("/cognify-logo.png"),
        },
        sameAs: [siteConfig.githubUrl],
      },
      {
        "@type": "WebSite",
        "@id": websiteId,
        name: siteConfig.name,
        url: siteConfig.url,
        description: siteConfig.description,
        inLanguage: "en",
        publisher: { "@id": organizationId },
      },
    ],
  };
}

export function softwareApplicationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": ["SoftwareApplication", "WebApplication"],
    "@id": appId,
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    applicationCategory: "EducationalApplication",
    applicationSubCategory: "Study software",
    operatingSystem: "Web",
    browserRequirements: "Requires a modern JavaScript-enabled web browser.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "PDF and notes upload",
      "Source-grounded summaries",
      "Flashcard generation",
      "Practice quizzes",
      "Notebook slideshows",
      "Gemini study coach",
    ],
    author: { "@id": organizationId },
    isPartOf: { "@id": websiteId },
  };
}
