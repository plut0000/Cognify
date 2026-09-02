const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

export const siteConfig = {
  name: "Cognify",
  shortDescription: "Turn your own notes into summaries, flashcards, quizzes, and source-grounded study help.",
  description:
    "Cognify is an open-source study workspace that turns PDFs and class notes into summaries, flashcards, quizzes, and source-grounded study help.",
  url: (configuredUrl || "https://cognify-alpha.vercel.app").replace(/\/$/, ""),
  githubUrl: "https://github.com/plut0000/Cognify",
} as const;

export function absoluteUrl(path = "/") {
  return new URL(path, `${siteConfig.url}/`).toString();
}
