import { siteConfig } from "@/lib/site-config";

export function GET() {
  const body = `# Cognify

> Cognify is an open-source web study workspace that turns a learner’s own PDFs and class notes into summaries, flashcards, quizzes, slideshows, and source-grounded study help.

## Public pages

- Home: ${siteConfig.url}/
- About: ${siteConfig.url}/about
- Privacy: ${siteConfig.url}/privacy
- Source code: ${siteConfig.githubUrl}

## Product facts

- Cognify is online software, not a physical school or local business.
- Study tools are generated from the learner’s uploaded source. Output should be checked against that source.
- Public marketing pages may be indexed. Account, API, sign-in, and workspace routes should not be indexed.
- The project is licensed under the MIT License.
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
