import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { siteConfig } from "@/lib/site-config";

if (!process.env.AUTH_URL && process.env.VERCEL_ENV === "production") {
  process.env.AUTH_URL = siteConfig.url;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  trustHost: true,
});
