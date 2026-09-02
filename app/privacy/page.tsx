import Link from "next/link";
import type { Metadata } from "next";
import Breadcrumbs from "@/components/breadcrumbs";
import JsonLd from "@/components/json-ld";
import PublicPageShell from "@/components/public-page-shell";
import { absoluteUrl, siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Privacy and data handling",
  description: "Understand how Cognify handles Google sign-in, locally saved notebooks, uploaded text, and AI study requests.",
  alternates: { canonical: "/privacy" },
  openGraph: {
    url: "/privacy",
    title: "Privacy and data handling | Cognify",
    description: "A plain-language overview of how data moves through Cognify.",
  },
};

export default function PrivacyPage() {
  return (
    <PublicPageShell>
      <main className="public-main legal-page">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Privacy", href: "/privacy" }]} />
        <section className="public-hero legal-hero">
          <p className="public-eyebrow">PRIVACY OVERVIEW</p>
          <h1>Know where your study data goes.</h1>
          <p>This page describes the current open-source version of Cognify in plain language. Last updated September 2, 2026.</p>
        </section>

        <div className="legal-sections">
          <section>
            <h2>Google sign-in</h2>
            <p>Cognify uses Google through Auth.js to identify the signed-in account. The app receives basic account details provided by Google, such as your name, email address, and profile image. Authentication is maintained with a signed session token.</p>
          </section>
          <section>
            <h2>Notebooks saved in your browser</h2>
            <p>Your notebook workspace and chat history are saved in your browser&apos;s local storage for the signed-in email. The current version does not provide a server database that syncs those notebooks across devices. Clearing site data can remove locally saved notebooks.</p>
          </section>
          <section>
            <h2>PDFs and pasted notes</h2>
            <p>Text extraction for supported PDFs happens in your browser. When you ask the AI coach or generate AI flashcards or quizzes, relevant notebook text and your request are sent to Cognify&apos;s server route and then to Google Gemini to produce the response.</p>
          </section>
          <section>
            <h2>Public pages and source code</h2>
            <p>The home, about, and privacy pages are public. The sign-in, private workspace, and API routes are marked so search engines should not index them. The application source is available on GitHub under the MIT License.</p>
          </section>
          <section>
            <h2>Your choices</h2>
            <p>Do not upload material you are not allowed to share. You can remove saved notebooks by deleting them in the workspace or clearing Cognify&apos;s site data in your browser. Review Google&apos;s policies for information about Google account and Gemini processing.</p>
          </section>
        </div>

        <section className="public-callout">
          <div><p className="public-eyebrow">OPEN SOURCE</p><h2>Questions or corrections</h2></div>
          <p>Review the <a href={siteConfig.githubUrl} rel="noreferrer" target="_blank">public repository</a> or open a GitHub issue if this description no longer matches the code. You can also read <Link href="/about">how source grounding works</Link>.</p>
        </section>
      </main>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          "@id": `${absoluteUrl("/privacy")}#page`,
          url: absoluteUrl("/privacy"),
          name: "Cognify privacy and data handling",
          description: "How Cognify handles sign-in, local notebook storage, uploads, and AI requests.",
          isPartOf: { "@id": `${siteConfig.url}/#website` },
          dateModified: "2026-09-02",
        }}
      />
    </PublicPageShell>
  );
}
