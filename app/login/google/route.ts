import { NextResponse } from "next/server";
import { authContinuePage, copySetCookies } from "@/lib/auth-continue-page";

export const dynamic = "force-dynamic";

function cookiePairs(response: Response) {
  return response.headers.getSetCookie().map((cookie) => cookie.split(";")[0]?.trim() ?? "");
}

function isGoogleAuthorizationUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && (url.hostname === "accounts.google.com" || url.hostname.endsWith(".google.com"));
  } catch {
    return false;
  }
}

function redirectToLogin(origin: string, error: string) {
  return NextResponse.redirect(new URL(`/login?error=${error}`, origin));
}

async function startGoogleSignIn(request: Request) {
  const origin = new URL(request.url).origin;

  try {
    const csrfResponse = await fetch(new URL("/api/auth/csrf", origin), {
      cache: "no-store",
    });
    if (!csrfResponse.ok) {
      return redirectToLogin(origin, "OAuthSignin");
    }

    const csrfPayload = (await csrfResponse.json()) as { csrfToken?: string };
    const csrfToken = csrfPayload.csrfToken;
    if (!csrfToken) {
      return redirectToLogin(origin, "OAuthSignin");
    }

    const signInResponse = await fetch(new URL("/api/auth/signin/google", origin), {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "X-Auth-Return-Redirect": "1",
        cookie: cookiePairs(csrfResponse).filter(Boolean).join("; "),
      },
      body: new URLSearchParams({
        csrfToken,
        callbackUrl: "/study",
      }),
      cache: "no-store",
      redirect: "manual",
    });

    const payload = (await signInResponse.json().catch(() => null)) as { url?: string } | null;
    const nextUrl = payload?.url || signInResponse.headers.get("location") || "";
    if (nextUrl.startsWith(`${origin}/login`)) {
      return NextResponse.redirect(nextUrl);
    }
    if (!isGoogleAuthorizationUrl(nextUrl)) {
      return redirectToLogin(origin, "Configuration");
    }

    const response = new NextResponse(
      authContinuePage({
        href: nextUrl,
        title: "Continue to Google · Cognify",
        heading: "Continue to Google",
        copy: "Tap once more so Safari can keep the sign-in cookie on this site, then choose your Google account.",
        button: "Continue to Google",
        autoRedirect: false,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "private, no-store",
          "Referrer-Policy": "no-referrer",
          "X-Robots-Tag": "noindex, nofollow",
        },
      },
    );
    copySetCookies(csrfResponse, response);
    copySetCookies(signInResponse, response);
    return response;
  } catch {
    return redirectToLogin(origin, "OAuthSignin");
  }
}

export function GET(request: Request) {
  return startGoogleSignIn(request);
}

export function POST(request: Request) {
  return startGoogleSignIn(request);
}
