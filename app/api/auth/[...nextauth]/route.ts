import { handlers } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { authContinuePage, copySetCookies } from "@/lib/auth-continue-page";

function isGoogleCallback(request: NextRequest) {
  return request.nextUrl.pathname === "/api/auth/callback/google";
}

function wantsHtml(request: NextRequest) {
  return (request.headers.get("accept") ?? "").includes("text/html");
}

export async function GET(request: NextRequest) {
  const response = await handlers.GET(request);
  if (!isGoogleCallback(request) || !wantsHtml(request)) return response;
  if (response.status < 300 || response.status >= 400) return response;

  const location = response.headers.get("location");
  if (!location) return response;

  const origin = request.nextUrl.origin;
  let href = location;
  try {
    href = new URL(location, origin).toString();
  } catch {
    return response;
  }

  const sameOrigin = href.startsWith(`${origin}/`);
  const htmlResponse = new NextResponse(
    authContinuePage({
      href,
      title: sameOrigin ? "Finishing sign-in · Cognify" : "Continue · Cognify",
      heading: sameOrigin && href.includes("/login") ? "Sign-in did not finish" : "Finishing sign-in",
      copy: sameOrigin
        ? "Your browser is ready to continue on Cognify."
        : "Continue to finish signing in.",
      button: sameOrigin && href.includes("/study") ? "Open study workspace" : "Continue",
      autoRedirect: sameOrigin,
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "private, no-store",
        "Referrer-Policy": "strict-origin-when-cross-origin",
        "X-Robots-Tag": "noindex, nofollow",
      },
    },
  );
  copySetCookies(response, htmlResponse);
  return htmlResponse;
}

export const POST = handlers.POST;
