import { ArrowRight, Compass } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import Breadcrumbs from "@/components/breadcrumbs";

export const metadata: Metadata = {
  title: "Page not found",
  description: "The Cognify page you requested could not be found.",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="not-found-page">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Page not found" }]} />
      <section className="not-found-card">
        <Image className="brand-logo-image not-found-logo" src="/cognify-logo.png" alt="Cognify logo" width={58} height={58} priority />
        <p className="public-eyebrow">ERROR 404</p>
        <h1>This page is not in your notebook.</h1>
        <p>The address may be outdated or typed incorrectly. Head home, learn how Cognify works, or open your study workspace.</p>
        <div className="public-actions">
          <Link className="hero-primary" href="/">Go to the homepage <ArrowRight size={17} /></Link>
          <Link className="hero-secondary" href="/about"><Compass size={17} /> About Cognify</Link>
        </div>
      </section>
    </main>
  );
}
