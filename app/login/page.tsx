import { ArrowLeft, BookOpenCheck, Check, LockKeyhole } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { loginWithGoogle } from "@/app/auth-actions";

export const metadata = {
  title: "Sign in",
};

export default async function LoginPage() {
  const authReady = Boolean(
    process.env.AUTH_SECRET
      && process.env.AUTH_GOOGLE_ID
      && process.env.AUTH_GOOGLE_SECRET,
  );
  const session = authReady ? await auth() : null;
  if (session?.user) redirect("/study");

  return (
    <main className="auth-page">
      <Link className="auth-back" href="/"><ArrowLeft size={17} /> Back home</Link>
      <section className="auth-card" aria-labelledby="sign-in-title">
        <div className="auth-brand"><Image className="brand-logo-image auth-logo" src="/cognify-logo.png" alt="" width={34} height={34} priority /><strong>Cognify</strong></div>
        <div className="auth-icon"><BookOpenCheck size={28} /></div>
        <p className="auth-eyebrow">YOUR STUDY SPACE</p>
        <h1 id="sign-in-title">Pick up where you left off.</h1>
        <p className="auth-copy">Sign in with Google to open your private study workspace and keep your AI coach protected.</p>
        {authReady ? (
          <form action={loginWithGoogle}>
            <button className="google-button" type="submit">
              <span className="google-mark" aria-hidden="true">G</span>
              Continue with Google
            </button>
          </form>
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
        <p className="auth-legal">By continuing, you agree to use Cognify for learning and personal study.</p>
      </section>
    </main>
  );
}
