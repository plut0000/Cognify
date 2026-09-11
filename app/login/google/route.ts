import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function cookiePairs(response: Response) {
  return response.headers.getSetCookie().map((cookie) => cookie.split(";")[0]?.trim() ?? "");
}

function copySetCookies(from: Response, to: NextResponse) {
  for (const cookie of from.headers.getSetCookie()) {
    to.headers.append("Set-Cookie", cookie);
  }
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

export async function GET(request: Request) {
  const origin = new URL(request.url).origin;
  const incomingCookies = request.headers.get("cookie") ?? "";

  try {
    const csrfResponse = await fetch(new URL("/api/auth/csrf", origin), {
      headers: { cookie: incomingCookies },
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
        cookie: [incomingCookies, ...cookiePairs(csrfResponse)].filter(Boolean).join("; "),
      },
      body: new URLSearchParams({
        csrfToken,
        callbackUrl: "/study",
      }),
      cache: "no-store",
      redirect: "manual",
    });

    const payload = (await signInResponse.json().catch(() => null)) as { url?: string } | null;
    const googleUrl = payload?.url || signInResponse.headers.get("location") || "";
    if (!isGoogleAuthorizationUrl(googleUrl)) {
      return redirectToLogin(origin, "Configuration");
    }

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow">
  <title>Continue to Google · Cognify</title>
  <style>
    body { margin: 0; min-height: 100dvh; display: grid; place-items: center; background: #f3efe6; color: #16191f; font: 15px/1.5 "IBM Plex Sans", sans-serif; }
    p { margin: 0; color: #5c6168; }
  </style>
</head>
<body>
  <p>Continuing to Google…</p>
  <script>location.replace(${JSON.stringify(googleUrl)})</script>
  <noscript><a href=${JSON.stringify(googleUrl)}>Continue to Google</a></noscript>
</body>
</html>`;

    const response = new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "private, no-store",
        "Referrer-Policy": "no-referrer",
        "X-Robots-Tag": "noindex, nofollow",
      },
    });
    copySetCookies(csrfResponse, response);
    copySetCookies(signInResponse, response);
    return response;
  } catch {
    return redirectToLogin(origin, "OAuthSignin");
  }
}
