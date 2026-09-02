import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { siteConfig } from "@/lib/site-config";

export default function PublicPageShell({ children }: { children: ReactNode }) {
  return (
    <div className="public-shell">
      <header className="public-header">
        <Link className="landing-brand" href="/" aria-label="Cognify home">
          <Image className="brand-logo-image public-logo" src="/cognify-logo.png" alt="Cognify logo" width={36} height={36} priority />
          <span><strong>Cognify</strong><small>LEARN FROM YOUR NOTES</small></span>
        </Link>
        <nav aria-label="Main navigation">
          <Link href="/">Home</Link>
          <Link href="/about">About</Link>
          <Link href="/privacy">Privacy</Link>
          <Link className="public-header-action" href="/login">Open Cognify</Link>
        </nav>
      </header>
      {children}
      <footer className="public-footer">
        <span>© 2026 Cognify</span>
        <nav aria-label="Footer navigation">
          <Link href="/about">About</Link>
          <Link href="/privacy">Privacy</Link>
          <a href={siteConfig.githubUrl} rel="noreferrer" target="_blank">Source code</a>
        </nav>
      </footer>
    </div>
  );
}
