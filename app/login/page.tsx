import { ArrowLeft, Check, LockKeyhole } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import GoogleSignInForm, { SignInError } from "@/components/google-sign-in-form";
import Breadcrumbs from "@/components/breadcrumbs";
import { BrandLogo } from "@/components/site-chrome";
import { pageMetadata } from "@/lib/site-config";

export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMetadata({
  title: "Sign in",
  description: "Sign in to Cognify with Google to open your private study workspace and continue from your saved notes.",
  path: "/login",
  index: false,
});

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const authReady = Boolean(
    process.env.AUTH_SECRET
      && process.env.AUTH_GOOGLE_ID
      && process.env.AUTH_GOOGLE_SECRET,
  );
  const session = authReady ? await auth() : null;
  if (session?.user) redirect("/study");

  return (
    <main id="main-content" className="auth-page">
      <Link className="auth-back" href="/">
        <ArrowLeft size={16} /> Back home
      </Link>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Sign in" }]} />
      <section className="auth-card" aria-labelledby="sign-in-title">
        <div className="auth-brand">
          <BrandLogo className="auth-logo" size={32} priority />
          <strong>Cognify</strong>
        </div>
        <p className="auth-eyebrow">Your study space</p>
        <h1 id="sign-in-title">Pick up where you left off.</h1>
        <p className="auth-copy">
          Sign in with Google to open your private study workspace and keep your AI coach protected.
        </p>
        <SignInError error={error} />
        {authReady ? (
          <GoogleSignInForm />
        ) : (
          <>
            <button className="google-button" type="button" disabled>
              <span className="google-mark" aria-hidden="true">G</span>
              Google sign-in needs setup
            </button>
            <p className="auth-setup-note">Add the five server environment variables in Vercel, then redeploy this preview.</p>
          </>
        )}
        <div className="auth-points">
          <span><Check size={15} /> No password to remember</span>
          <span><LockKeyhole size={15} /> Your Gemini key stays server-side</span>
        </div>
        <p className="auth-legal">
          By continuing, you agree to use Cognify for learning and personal study. Read the <Link href="/privacy">privacy overview</Link>.
        </p>
      </section>
    </main>
  );
}
