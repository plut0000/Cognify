import Link from "next/link";
import type { Metadata } from "next";
import Breadcrumbs from "@/components/breadcrumbs";
import JsonLd from "@/components/json-ld";
import { PublicPageShell } from "@/components/site-chrome";
import { absoluteUrl, pageMetadata, siteConfig, websiteId } from "@/lib/site-config";

export const metadata: Metadata = pageMetadata({
  title: "Privacy",
  description: "How Cognify handles Google sign-in, locally saved notebooks, uploaded notes, and Gemini study requests.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <PublicPageShell current="privacy">
      <main id="main-content" className="public-main legal-page">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Privacy" }]} />
        <section className="public-hero legal-hero">
          <p className="hero-kicker">Privacy overview</p>
          <h1>Know where your study data goes.</h1>
          <p>This page describes the current open-source Cognify app in plain language. Last updated September 11, 2026.</p>
        </section>

        <div className="legal-sections">
          <section>
            <h2>Google sign-in</h2>
            <p>Cognify uses Google through Auth.js to identify the signed-in account. The app receives the name, email address, and profile image Google provides for that account. The session is kept with a signed token.</p>
          </section>
          <section>
            <h2>Notebooks saved in your browser</h2>
            <p>Notebooks and coach history are stored in this browser for the signed-in email. This version does not sync that library through a Cognify database. Clearing site data removes locally saved notebooks.</p>
          </section>
          <section>
            <h2>PDFs and pasted notes</h2>
            <p>Text extraction for supported PDFs happens in your browser. When you generate flashcards, quizzes, or slideshows, or when you ask the study coach, relevant notebook text and your request are sent to Cognify’s server routes and then to Google Gemini.</p>
          </section>
          <section>
            <h2>What is public</h2>
            <p>The home, about, and privacy pages are public. Sign-in, the private workspace, and API routes are marked so search engines should not index them. Application source is available on GitHub under the MIT License.</p>
          </section>
          <section>
            <h2>Your choices</h2>
            <p>Do not upload material you are not allowed to process. You can delete notebooks in the workspace or clear Cognify site data in your browser. Review Google’s policies for Google account and Gemini processing.</p>
          </section>
        </div>

        <section className="public-callout">
          <div>
            <p className="hero-kicker">Open source</p>
            <h2>Questions or corrections</h2>
          </div>
          <p>
            If this page no longer matches the code, open a GitHub issue on the <a href={siteConfig.githubUrl} rel="noreferrer" target="_blank">public repository</a>. You can also read <Link href="/about">how source grounding works</Link>.
          </p>
        </section>
      </main>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          "@id": `${absoluteUrl("/privacy")}#page`,
          url: absoluteUrl("/privacy"),
          name: "Cognify privacy overview",
          description: "How Cognify handles sign-in, local notebook storage, uploads, and AI requests.",
          isPartOf: { "@id": websiteId },
          dateModified: "2026-09-11",
        }}
      />
    </PublicPageShell>
  );
}
