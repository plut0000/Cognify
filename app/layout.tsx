import type { Metadata, Viewport } from "next";
import { absoluteUrl, siteConfig } from "@/lib/site-config";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  applicationName: "Cognify",
  title: {
    default: "Cognify | Study smarter from your own notes",
    template: "%s | Cognify",
  },
  description: siteConfig.description,
  keywords: [
    "AI study tool",
    "flashcard generator",
    "quiz generator",
    "PDF study notes",
    "source-grounded tutoring",
  ],
  authors: [{ name: "Cognify", url: siteConfig.githubUrl }],
  creator: "Cognify",
  publisher: "Cognify",
  category: "education",
  referrer: "origin-when-cross-origin",
  formatDetection: {
    address: false,
    email: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
      { url: "/cognify-logo.png", type: "image/png" },
    ],
    shortcut: "/icon.png",
    apple: "/apple-icon.png",
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    locale: "en_CA",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: "Cognify | Study smarter from your own notes",
    description: siteConfig.shortDescription,
    images: [
      {
        url: absoluteUrl("/opengraph-image"),
        width: 1200,
        height: 630,
        alt: "Cognify study workspace preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cognify | Study smarter from your own notes",
    description: siteConfig.shortDescription,
    images: [absoluteUrl("/opengraph-image")],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  appleWebApp: {
    title: "Cognify",
    capable: true,
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f7f7fb",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
