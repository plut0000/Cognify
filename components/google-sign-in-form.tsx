"use client";

import { useEffect, useState } from "react";

const AUTH_ERROR_COPY: Record<string, string> = {
  Configuration:
    "Google sign-in is not fully configured, or the callback URL does not match this site. In Google Cloud, the authorized redirect URI must be exactly https://cognify-alpha.vercel.app/api/auth/callback/google.",
  AccessDenied: "Google sign-in was cancelled. You can try again when you are ready.",
  Verification: "That sign-in link expired. Start again from this page.",
  OAuthSignin: "Cognify could not start Google sign-in. Refresh and try once more.",
  OAuthCallback:
    "Google returned to Cognify, but the sign-in session was missing. This is common in Safari if cookies were blocked — try again, or allow cookies for this site.",
  OAuthCreateAccount: "Your Google account could not be linked. Try another account.",
  OAuthAccountNotLinked: "That Google account is already linked another way. Try the original sign-in method.",
  Callback: "Sign-in could not be completed. Refresh this page and try again.",
  Default: "Sign-in did not finish. Refresh this page and try again.",
};

export function SignInError({ error }: { error?: string }) {
  if (!error) return null;
  const message = AUTH_ERROR_COPY[error] ?? AUTH_ERROR_COPY.Default;
  return (
    <p className="auth-alert" role="alert">
      {message}
    </p>
  );
}

export default function GoogleSignInForm() {
  const [csrfToken, setCsrfToken] = useState("");
  const [csrfError, setCsrfError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/csrf", { credentials: "same-origin" })
      .then((response) => {
        if (!response.ok) throw new Error("csrf");
        return response.json() as Promise<{ csrfToken?: string }>;
      })
      .then((payload) => {
        if (!cancelled) setCsrfToken(payload.csrfToken ?? "");
      })
      .catch(() => {
        if (!cancelled) setCsrfError(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      {csrfError ? (
        <p className="auth-alert" role="alert">
          Cognify could not start a secure sign-in session. Refresh this page and try again.
        </p>
      ) : null}
      <form action="/api/auth/signin/google" method="post" encType="application/x-www-form-urlencoded">
        <input type="hidden" name="csrfToken" value={csrfToken} />
        <input type="hidden" name="callbackUrl" value="/study" />
        <button className="google-button" type="submit" disabled={!csrfToken}>
          <span className="google-mark" aria-hidden="true">G</span>
          {csrfToken ? "Continue with Google" : "Preparing Google…"}
        </button>
      </form>
    </>
  );
}
