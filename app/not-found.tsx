import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import Breadcrumbs from "@/components/breadcrumbs";
import { BrandLogo, PublicPageShell } from "@/components/site-chrome";

export const metadata: Metadata = {
  title: "Page not found",
  description: "This Cognify page does not exist. Return home or open the study workspace.",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <PublicPageShell current="missing">
      <main id="main-content" className="not-found-page">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Page not found" }]} />
        <section className="not-found-card">
          <BrandLogo className="not-found-logo" size={48} priority />
          <p className="hero-kicker">Error 404</p>
          <h1>This page is not in your notebook.</h1>
          <p>The address may be outdated or typed incorrectly. Go back to the homepage, or open the workspace if you already have an account.</p>
          <div className="hero-actions">
            <Link className="hero-primary" href="/">
              Go to the homepage
              <ArrowRight size={17} />
            </Link>
            <Link className="hero-secondary" href="/about">About Cognify</Link>
          </div>
        </section>
      </main>
    </PublicPageShell>
  );
}
