import { BookOpen, FileText, GitFork, ShieldCheck } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import Breadcrumbs from "@/components/breadcrumbs";
import JsonLd from "@/components/json-ld";
import { PublicPageShell } from "@/components/site-chrome";
import { absoluteUrl, pageMetadata, siteConfig, websiteId } from "@/lib/site-config";

export const metadata: Metadata = pageMetadata({
  title: "About",
  description: "How Cognify turns your own PDFs and class notes into summaries, flashcards, quizzes, slideshows, and source-grounded study help.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <PublicPageShell current="about">
      <main id="main-content" className="public-main">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "About" }]} />
        <section className="public-hero">
          <p className="hero-kicker">About Cognify</p>
          <h1>Study from the notes you already have.</h1>
          <p>
            Cognify is an open-source study workspace. Upload a source, get a structured notebook, then practice with flashcards, quizzes, slideshows, and a coach that is instructed to stay tied to that material.
          </p>
          <div className="hero-actions">
            <Link className="hero-primary" href="/login">Open the workspace</Link>
            <a className="hero-secondary" href={siteConfig.githubUrl} rel="noreferrer" target="_blank">View the source code</a>
          </div>
        </section>

        <section className="public-grid" aria-label="How Cognify is built">
          <article>
            <FileText size={22} />
            <h2>Start from your source</h2>
            <p>Upload a text-based PDF, TXT, or Markdown file, or paste notes directly. PDF text is extracted in the browser before the notebook is organized.</p>
          </article>
          <article>
            <BookOpen size={22} />
            <h2>Practice in more than one way</h2>
            <p>Each notebook can hold a summary, key terms, multiple flashcard decks, quizzes, and lecture-style slideshows generated from the same source.</p>
          </article>
          <article>
            <ShieldCheck size={22} />
            <h2>Keep answers bounded</h2>
            <p>The study coach is given the active notebook and asked to say when a question is not supported by that material. Generated output still needs a human check against the original notes.</p>
          </article>
          <article>
            <GitFork size={22} />
            <h2>Inspect the implementation</h2>
            <p>The MIT-licensed Next.js code is public so students and developers can read how authentication, generation, and grounding are wired.</p>
          </article>
        </section>

        <section className="public-callout" id="source-grounding">
          <div>
            <p className="hero-kicker">Source grounding</p>
            <h2>What “grounded” means here</h2>
          </div>
          <p>
            Cognify sends the current notebook with an AI request and asks the model to use that context for course-content answers. That reduces unrelated replies. It does not make the output automatically correct. Compare generated cards, quiz items, and slides with your original source before relying on them.
          </p>
        </section>
      </main>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          "@id": `${absoluteUrl("/about")}#page`,
          url: absoluteUrl("/about"),
          name: "About Cognify",
          description: "How Cognify turns learner-provided notes into source-based study tools.",
          isPartOf: { "@id": websiteId },
        }}
      />
    </PublicPageShell>
  );
}
