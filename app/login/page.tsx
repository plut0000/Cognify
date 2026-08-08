import { ArrowLeft, BookOpenCheck, Check, LockKeyhole, Sparkles } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { loginWithGoogle } from "@/app/auth-actions";

export const metadata = {
  title: "Sign in",
};

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/study");

  return (
    <main className="auth-page">
      <Link className="auth-back" href="/"><ArrowLeft size={17} /> Back home</Link>
      <section className="auth-card" aria-labelledby="sign-in-title">
        <div className="auth-brand"><span className="logo-glyph"><Sparkles size={21} /></span><strong>Study Focus</strong></div>
        <div className="auth-icon"><BookOpenCheck size={28} /></div>
        <p className="auth-eyebrow">YOUR STUDY SPACE</p>
        <h1 id="sign-in-title">Pick up where you left off.</h1>
        <p className="auth-copy">Sign in with Google to open your private study workspace and keep your AI coach protected.</p>
        <form action={loginWithGoogle}>
          <button className="google-button" type="submit">
            <span className="google-mark" aria-hidden="true">G</span>
            Continue with Google
          </button>
        </form>
        <div className="auth-points">
          <span><Check size={15} /> No password to remember</span>
          <span><LockKeyhole size={15} /> Your Gemini key stays server-side</span>
        </div>
        <p className="auth-legal">By continuing, you agree to use Study Focus for learning and personal study.</p>
      </section>
    </main>
  );
}
