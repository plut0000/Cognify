import {
  ArrowRight,
  BookOpen,
  Check,
  FileText,
  Layers3,
  ListChecks,
  MessageCircle,
  Presentation,
  ShieldCheck,
  UploadCloud,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/json-ld";
import { SiteFooter, SiteHeader, BrandLogo } from "@/components/site-chrome";
import { pageMetadata, softwareApplicationJsonLd } from "@/lib/site-config";

export const metadata: Metadata = pageMetadata({
  title: { absolute: "Cognify — Learn from your own notes" },
  description: "Upload PDFs and class notes, get clear summaries, generate flashcards, quizzes, and slideshows, and study with a source-grounded Gemini coach.",
  path: "/",
});

const steps = [
  {
    number: "01",
    icon: UploadCloud,
    title: "Bring your notes",
    copy: "Upload a PDF, TXT, Markdown file, or paste notes straight from class.",
  },
  {
    number: "02",
    icon: BookOpen,
    title: "Get the big picture",
    copy: "Turn a long source into a clean summary, key ideas, sections, and terms.",
  },
  {
    number: "03",
    icon: Layers3,
    title: "Practice until it sticks",
    copy: "Create flashcard decks, quizzes, and slideshows, then ask your grounded AI coach.",
  },
];

export default function LandingPage() {
  return (
    <div className="landing-page">
      <SiteHeader current="home" />

      <main id="main-content">
        <section className="hero-section">
          <div className="hero-copy">
            <p className="hero-kicker">Your notes, finally useful</p>
            <h1>Turn class notes into <em>study sessions</em> that work.</h1>
            <p>
              Upload a PDF, get the important ideas, build flashcard decks, quizzes, and slideshows, and ask a Gemini-powered coach that stays grounded in your source.
            </p>
            <div className="hero-actions">
              <Link className="hero-primary" href="/login">
                Start studying free
                <ArrowRight size={17} />
              </Link>
              <a className="hero-secondary" href="#how-it-works">See how it works</a>
            </div>
            <ul className="hero-trust">
              <li><Check size={15} /> Multiple notebooks</li>
              <li><Check size={15} /> Unlimited study sets</li>
              <li><ShieldCheck size={15} /> Private API key</li>
            </ul>
          </div>
        </section>

        <section className="product-showcase" aria-label="Cognify product preview">
          <div className="showcase-window" aria-hidden="true">
            <div className="showcase-sidebar">
              <BrandLogo className="mini-brand-logo" size={24} />
              <div className="showcase-new-notebook"><span>+</span> New notebook</div>
              <small>Library</small>
              <div className="mini-source active">
                <FileText size={13} />
                <span><strong>Cell Biology</strong><small>3 decks · 2 quizzes</small></span>
              </div>
              <div className="mini-source">
                <FileText size={13} />
                <span><strong>History Review</strong><small>1 deck · 1 quiz</small></span>
              </div>
            </div>
            <div className="showcase-main">
              <div className="showcase-top">
                <span>My library / <strong>Cell Biology</strong></span>
                <i>AS</i>
              </div>
              <div className="showcase-title">
                <span><FileText size={16} /></span>
                <div>
                  <small>Active notebook</small>
                  <strong>Cell Biology — Unit 3</strong>
                  <p>28 pages · 4,620 words</p>
                </div>
              </div>
              <div className="showcase-tabs">
                <strong>Overview</strong>
                <span>Notes</span>
                <span>Flashcards</span>
                <span>Quizzes</span>
                <span>Slideshows</span>
              </div>
              <div className="showcase-summary">
                <small>Notebook summary</small>
                <p className="showcase-summary-title">Start with the big picture.</p>
                <p>Cells use specialized structures to move energy, build proteins, and maintain the conditions needed for life.</p>
                <div>
                  <span><strong>6</strong> topics</span>
                  <span><strong>12</strong> terms</span>
                  <span><strong>5</strong> study tools</span>
                </div>
              </div>
              <div className="showcase-tools">
                <div><Layers3 size={15} /><span><strong>Flashcards</strong><small>12 cards ready</small></span></div>
                <div><ListChecks size={15} /><span><strong>Practice quiz</strong><small>10 questions</small></span></div>
                <div><Presentation size={15} /><span><strong>Slideshow</strong><small>8 slides</small></span></div>
              </div>
            </div>
            <div className="showcase-coach">
              <div>
                <span><MessageCircle size={14} /></span>
                <strong>Study Coach</strong>
              </div>
              <small>Gemini grounded</small>
              <div className="coach-bubble">How does ATP connect to cellular respiration?</div>
              <div className="coach-answer">
                <p>ATP stores usable energy. Cellular respiration transfers energy from glucose into ATP so the cell can power its work.</p>
              </div>
              <div className="coach-input">Ask about these notes… <ArrowRight size={13} /></div>
            </div>
          </div>
        </section>

        <section className="process-section" id="how-it-works">
          <div className="section-heading">
            <p>How it works</p>
            <h2>From messy notes to focused practice.</h2>
            <span>Three simple steps. No blank-page problem.</span>
          </div>
          <div className="process-grid">
            {steps.map(({ number, icon: Icon, title, copy }) => (
              <article key={number}>
                <div>
                  <span>{number}</span>
                  <i><Icon size={18} /></i>
                </div>
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="feature-band" id="features">
          <div>
            <p>Built for real studying</p>
            <h2>One source. Every way you need to learn it.</h2>
          </div>
          <ul>
            <li>
              <BookOpen size={18} />
              <span><strong>Smart summaries</strong><small>See the main ideas before the details.</small></span>
            </li>
            <li>
              <Layers3 size={18} />
              <span><strong>Multiple flashcard decks</strong><small>Make focused sets for every topic.</small></span>
            </li>
            <li>
              <ListChecks size={18} />
              <span><strong>Multiple practice quizzes</strong><small>Change length and difficulty each time.</small></span>
            </li>
            <li>
              <Presentation size={18} />
              <span><strong>Notebook slideshows</strong><small>Present your notes as a lecture deck.</small></span>
            </li>
            <li>
              <MessageCircle size={18} />
              <span><strong>Grounded AI coach</strong><small>Answers stay tied to your uploaded notes.</small></span>
            </li>
          </ul>
        </section>

        <section className="landing-close">
          <div className="landing-cta">
            <div>
              <p>Ready when you are</p>
              <h2>Your next study session starts with one upload.</h2>
            </div>
            <Link href="/login">
              Start studying
              <ArrowRight size={17} />
            </Link>
          </div>
          <SiteFooter tone="dark" />
        </section>
      </main>
      <JsonLd data={softwareApplicationJsonLd()} />
    </div>
  );
}
