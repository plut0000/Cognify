import { BookOpenCheck, FileSearch, GitFork, ShieldCheck } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import Breadcrumbs from "@/components/breadcrumbs";
import JsonLd from "@/components/json-ld";
import PublicPageShell from "@/components/public-page-shell";
import { absoluteUrl, siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "About the study method",
  description: "Learn how Cognify turns your own PDFs and notes into source-based summaries, flashcards, quizzes, and study help.",
  alternates: { canonical: "/about" },
  openGraph: {
    url: "/about",
    title: "About Cognify's study method | Cognify",
    description: "See how Cognify organizes your own source material into focused study tools.",
  },
};

export default function AboutPage() {
  return (
    <PublicPageShell>
      <main className="public-main">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "About", href: "/about" }]} />
        <section className="public-hero">
          <p className="public-eyebrow">ABOUT COGNIFY</p>
          <h1>Your material stays at the center of the study session.</h1>
          <p>Cognify helps learners move from a long PDF or a page of rough notes to a smaller set of useful study actions. The product is open source, and its AI features are designed to work from the source a learner provides.</p>
          <div className="public-actions">
            <Link className="hero-primary" href="/login">Open your workspace</Link>
            <a className="hero-secondary" href={siteConfig.githubUrl} rel="noreferrer" target="_blank">View the source code</a>
          </div>
        </section>

        <section className="public-grid" aria-label="How Cognify works">
          <article><FileSearch size={22} /><h2>Read the source</h2><p>Upload a text-based PDF, TXT, or Markdown file, or paste notes directly. PDF text extraction happens in the browser before a notebook is organized.</p></article>
          <article><BookOpenCheck size={22} /><h2>Build focused practice</h2><p>Create a summary, key terms, flashcards, and quizzes from the selected notebook instead of mixing unrelated material into the session.</p></article>
          <article><ShieldCheck size={22} /><h2>Show the boundary</h2><p>The study coach cites the selected notebook name and is instructed to say when an answer is not supported by the supplied material. Learners should still verify important details.</p></article>
          <article><GitFork size={22} /><h2>Keep the implementation open</h2><p>The MIT-licensed Next.js code is public so developers can inspect the approach, report issues, and propose improvements.</p></article>
        </section>

        <section className="public-callout" id="source-grounding">
          <div>
            <p className="public-eyebrow">SOURCE GROUNDING</p>
            <h2>What “grounded” means here</h2>
          </div>
          <p>Cognify sends the current notebook context with an AI request and asks the model to use that context for course-content answers. This reduces unrelated answers, but it does not make AI output automatically correct. Compare generated material with your original notes before relying on it.</p>
        </section>
      </main>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          "@id": `${absoluteUrl("/about")}#page`,
          url: absoluteUrl("/about"),
          name: "About Cognify's study method",
          description: "How Cognify turns learner-provided notes into source-based study tools.",
          isPartOf: { "@id": `${siteConfig.url}/#website` },
        }}
      />
    </PublicPageShell>
  );
}
