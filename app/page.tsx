import {
  ArrowRight,
  BrainCircuit,
  Check,
  FileText,
  Layers3,
  ListChecks,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  UploadCloud,
} from "lucide-react";
import Link from "next/link";
import { auth } from "@/auth";

const steps = [
  {
    number: "01",
    icon: UploadCloud,
    title: "Bring your notes",
    copy: "Upload a PDF, TXT, Markdown file, or paste notes straight from class.",
  },
  {
    number: "02",
    icon: Sparkles,
    title: "Get the big picture",
    copy: "Turn a long source into a clean summary, key ideas, sections, and terms.",
  },
  {
    number: "03",
    icon: BrainCircuit,
    title: "Practice until it sticks",
    copy: "Create multiple flashcard decks and quizzes, then ask your grounded AI coach.",
  },
];

export default async function LandingPage() {
  const session = await auth();
  const primaryHref = session?.user ? "/study" : "/login";

  return (
    <main className="landing-page">
      <header className="landing-nav">
        <Link className="landing-brand" href="/" aria-label="Study Focus home">
          <span className="logo-glyph"><Sparkles size={20} /></span>
          <span><strong>Study Focus</strong><small>LEARN FROM YOUR NOTES</small></span>
        </Link>
        <nav aria-label="Main navigation">
          <a href="#how-it-works">How it works</a>
          <a href="#features">Features</a>
        </nav>
        <div className="landing-actions">
          {!session?.user && <Link className="nav-login" href="/login">Log in</Link>}
          <Link className="nav-start" href={primaryHref}>{session?.user ? "Open workspace" : "Start studying"} <ArrowRight size={15} /></Link>
        </div>
      </header>

      <section className="hero-section">
        <div className="hero-copy">
          <div className="hero-pill"><span><Sparkles size={14} /></span> Your notes, finally useful</div>
          <h1>Turn class notes into <em>study sessions</em> that work.</h1>
          <p>Upload a PDF, get the important ideas, build as many flashcard decks and quizzes as you need, and ask a Gemini-powered coach that stays grounded in your source.</p>
          <div className="hero-actions">
            <Link className="hero-primary" href={primaryHref}>{session?.user ? "Continue studying" : "Start studying free"} <ArrowRight size={18} /></Link>
            <a className="hero-secondary" href="#how-it-works">See how it works</a>
          </div>
          <div className="hero-trust">
            <span><Check size={14} /> Multiple notebooks</span>
            <span><Check size={14} /> Unlimited study sets</span>
            <span><ShieldCheck size={14} /> Private API key</span>
          </div>
        </div>

        <div className="product-showcase" aria-label="Study Focus product preview">
          <div className="showcase-orbit orbit-one" />
          <div className="showcase-orbit orbit-two" />
          <div className="showcase-window">
            <div className="showcase-sidebar">
              <div className="mini-brand"><span /><span /><span /></div>
              <button><span>+</span> New notebook</button>
              <small>LIBRARY</small>
              <div className="mini-source active"><FileText size={14} /><span><strong>Cell Biology</strong><small>3 decks · 2 quizzes</small></span></div>
              <div className="mini-source"><FileText size={14} /><span><strong>History Review</strong><small>1 deck · 1 quiz</small></span></div>
            </div>
            <div className="showcase-main">
              <div className="showcase-top"><span>My library / <strong>Cell Biology</strong></span><i>AS</i></div>
              <div className="showcase-title"><span><FileText size={18} /></span><div><small>ACTIVE NOTEBOOK</small><strong>Cell Biology — Unit 3</strong><p>28 pages · 4,620 words</p></div></div>
              <div className="showcase-tabs"><strong>Overview</strong><span>Notes</span><span>Flashcards</span><span>Quizzes</span></div>
              <div className="showcase-summary">
                <small><Sparkles size={12} /> NOTEBOOK SUMMARY</small>
                <h3>Start with the big picture.</h3>
                <p>Cells use specialized structures to move energy, build proteins, and maintain the conditions needed for life.</p>
                <div><span><strong>6</strong> topics</span><span><strong>12</strong> terms</span><span><strong>5</strong> study tools</span></div>
              </div>
              <div className="showcase-tools"><div><Layers3 size={16} /><span><strong>Flashcards</strong><small>12 cards ready</small></span></div><div><ListChecks size={16} /><span><strong>Practice quiz</strong><small>10 questions</small></span></div></div>
            </div>
            <div className="showcase-coach">
              <div><span><Sparkles size={15} /></span><strong>Study Coach</strong></div>
              <small><i /> GEMINI GROUNDED</small>
              <div className="coach-bubble">How does ATP connect to cellular respiration?</div>
              <div className="coach-answer"><MessageCircle size={15} /><p>ATP stores usable energy. Cellular respiration transfers energy from glucose into ATP so the cell can power its work.</p></div>
              <div className="coach-input">Ask about these notes… <ArrowRight size={14} /></div>
            </div>
          </div>
          <div className="floating-chip chip-one"><Sparkles size={16} /><span><strong>Summary ready</strong><small>12 key ideas found</small></span></div>
          <div className="floating-chip chip-two"><ListChecks size={16} /><span><strong>Quiz created</strong><small>10 new questions</small></span></div>
        </div>
      </section>

      <section className="process-section" id="how-it-works">
        <div className="section-heading"><p>HOW IT WORKS</p><h2>From messy notes to focused practice.</h2><span>Three simple steps. No blank-page problem.</span></div>
        <div className="process-grid">
          {steps.map(({ number, icon: Icon, title, copy }) => (
            <article key={number}><div><span>{number}</span><i><Icon size={21} /></i></div><h3>{title}</h3><p>{copy}</p></article>
          ))}
        </div>
      </section>

      <section className="feature-band" id="features">
        <div><p>BUILT FOR REAL STUDYING</p><h2>One source. Every way you need to learn it.</h2></div>
        <ul>
          <li><Sparkles size={18} /><span><strong>Smart summaries</strong><small>See the main ideas before the details.</small></span></li>
          <li><Layers3 size={18} /><span><strong>Multiple flashcard decks</strong><small>Make focused sets for every topic.</small></span></li>
          <li><ListChecks size={18} /><span><strong>Multiple practice quizzes</strong><small>Change length and difficulty each time.</small></span></li>
          <li><MessageCircle size={18} /><span><strong>Grounded AI coach</strong><small>Answers stay tied to your uploaded notes.</small></span></li>
        </ul>
      </section>

      <section className="landing-cta">
        <span><BrainCircuit size={26} /></span>
        <div><p>READY WHEN YOU ARE</p><h2>Your next study session starts with one upload.</h2></div>
        <Link href={primaryHref}>{session?.user ? "Open workspace" : "Start studying"} <ArrowRight size={18} /></Link>
      </section>

      <footer className="landing-footer"><span>© 2026 Study Focus</span><span>Powered by Google Gemini · Built for focused learning</span></footer>
    </main>
  );
}
