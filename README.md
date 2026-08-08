# Study Focus

A Vercel-ready Next.js study workspace. Students can upload PDF/TXT/Markdown notes, generate structured summaries, create multiple flashcard decks and quizzes, and chat with a Google Gemini coach grounded in the active notebook.

## Local setup

1. Copy `.env.example` to `.env.local`.
2. Add your Gemini API key.
3. Create a Google OAuth web client and add its ID and secret.
4. Generate `AUTH_SECRET` with `npx auth secret`.
5. Run `npm install`, then `npm run dev`.

Use this local Google OAuth callback URL:

`http://localhost:3000/api/auth/callback/google`

For production, add this callback in Google Cloud after Vercel gives you a domain:

`https://YOUR-VERCEL-DOMAIN/api/auth/callback/google`

## Vercel environment variables

- `GEMINI_API_KEY` — server-only Gemini API key
- `GEMINI_MODEL` — optional; defaults to `gemini-3.5-flash-lite`
- `AUTH_SECRET` — random secret used to encrypt sessions
- `AUTH_GOOGLE_ID` — Google OAuth client ID
- `AUTH_GOOGLE_SECRET` — Google OAuth client secret
- `AUTH_TRUST_HOST` — set to `true`

Never commit `.env.local` or paste secrets into source files.
