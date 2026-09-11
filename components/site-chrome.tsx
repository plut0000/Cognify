import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { siteConfig } from "@/lib/site-config";

type CurrentPage = "home" | "about" | "privacy" | "login" | "missing";

export function BrandLogo({
  className,
  size,
  priority = false,
}: {
  className?: string;
  size: number;
  priority?: boolean;
}) {
  return (
    // Native img keeps marketing pages free of the next/image client runtime.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={`brand-logo-image ${className ?? ""}`.trim()}
      src="/cognify-logo.png"
      alt="Cognify logo"
      width={size}
      height={size}
      decoding="async"
      fetchPriority={priority ? "high" : "auto"}
    />
  );
}

export function SiteHeader({ current = "home" }: { current?: CurrentPage }) {
  return (
    <header className="landing-nav">
      <Link className="landing-brand" href="/" aria-label="Cognify home">
        <BrandLogo className="landing-logo" size={36} priority />
        <span>
          <strong>Cognify</strong>
          <small>Learn from your notes</small>
        </span>
      </Link>
      <nav aria-label="Primary">
        <Link href="/#how-it-works">How it works</Link>
        <Link href="/#features">Features</Link>
        <Link href="/about" aria-current={current === "about" ? "page" : undefined}>About</Link>
      </nav>
      <div className="landing-actions">
        <Link className="nav-login" href="/login">Log in</Link>
        <Link className="nav-start" href="/login">
          Start studying
          <ArrowRight size={16} />
        </Link>
      </div>
    </header>
  );
}

export function SiteFooter({ tone = "light" }: { tone?: "light" | "dark" }) {
  return (
    <footer className={tone === "dark" ? "landing-footer" : "site-footer"}>
      <span>© 2026 Cognify</span>
      <nav aria-label="Footer">
        <Link href="/about">About</Link>
        <Link href="/privacy">Privacy</Link>
        <a href={siteConfig.githubUrl} rel="noreferrer" target="_blank">Source</a>
      </nav>
    </footer>
  );
}

export function PublicPageShell({
  children,
  current,
}: {
  children: ReactNode;
  current?: CurrentPage;
}) {
  return (
    <div className="landing-page public-page">
      <SiteHeader current={current} />
      {children}
      <SiteFooter />
    </div>
  );
}
