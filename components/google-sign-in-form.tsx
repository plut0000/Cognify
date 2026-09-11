"use client";

import { useSearchParams } from "next/navigation";

const AUTH_ERROR_COPY: Record<string, string> = {
  Configuration:
    "Google sign-in did not finish. This is common in Safari if the sign-in cookie was dropped — try again, and allow cookies for this site. If it still fails, the Google Cloud redirect URI must be exactly https://cognify-alpha.vercel.app/api/auth/callback/google.",
  AccessDenied: "Google sign-in was cancelled. You can try again when you are ready.",
  Verification: "That sign-in link expired. Start again from this page.",
  OAuthSignin: "Cognify could not start Google sign-in. Refresh and try once more.",
  OAuthCallback:
    "Google returned to Cognify, but the sign-in session was missing. This is common in Safari if cookies were blocked — try again, or allow cookies for this site.",
  OAuthCreateAccount: "Your Google account could not be linked. Try another account.",
  OAuthAccountNotLinked: "That Google account is already linked another way. Try the original sign-in method.",
  MissingCSRF: "The sign-in form expired. Refresh this page and tap Continue with Google again.",
  Callback: "Sign-in could not be completed. Refresh this page and try again.",
  Default: "Sign-in did not finish. Refresh this page and try again.",
};

export function SignInError({ error }: { error?: string | null }) {
  const searchParams = useSearchParams();
  const code = error || searchParams.get("error");
  if (!code) return null;
  const message = AUTH_ERROR_COPY[code] ?? AUTH_ERROR_COPY.Default;
  return (
    <p className="auth-alert" role="alert" data-auth-error={code}>
      {message}
    </p>
  );
}

export default function GoogleSignInForm() {
  return (
    <form action="/login/google" method="post">
      <button className="google-button" type="submit">
        <span className="google-mark" aria-hidden="true">G</span>
        Continue with Google
      </button>
    </form>
  );
}
