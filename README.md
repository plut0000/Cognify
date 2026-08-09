<p align="center">
  <img src="public/favicon.svg" width="84" alt="Cognify logo" />
</p>

<h1 align="center">Cognify</h1>

<p align="center">
  An open-source AI study workspace that turns notes into grounded summaries, flashcards, quizzes, and tutoring.
</p>

<p align="center">
  <a href="https://study-focus-beta.vercel.app"><strong>Try the live app</strong></a>
  ·
  <a href="https://github.com/plut0000/Cognify/issues">Report an issue</a>
  ·
  <a href="CONTRIBUTING.md">Contribute</a>
</p>

<p align="center">
  <img alt="GitHub stars" src="https://img.shields.io/github/stars/plut0000/Cognify?style=flat-square" />
  <img alt="MIT license" src="https://img.shields.io/badge/license-MIT-6c5ce7?style=flat-square" />
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript&logoColor=white" />
</p>

## Why Cognify?

Students often have useful class material spread across PDFs, text files, and handwritten notes, but turning that material into effective practice takes time. Cognify creates a focused study loop from the student's own source material and keeps generated content grounded in the active notebook.

Cognify is also intended to be a reusable reference for developers building educational AI products with document processing, authentication, grounded generation, and multiple study modes.

## Features

- Upload PDF, TXT, or Markdown notes.
- Generate structured summaries, key ideas, sections, and terminology.
- Create multiple flashcard decks from the same notebook.
- Create multiple quizzes with selectable difficulty and question count.
- Reduce repeated facts and answers across newly generated study sets.
- Chat with a study coach grounded in the active notebook.
- Sign in securely with Google OAuth.
- Use a responsive interface designed for desktop and mobile study sessions.

## How it works

1. A student uploads notes or starts with the sample notebook.
2. Cognify extracts and structures the source material.
3. Server-side AI routes generate grounded study content.
4. Previously generated material is supplied as history to reduce repetition.
5. The student reviews cards, completes quizzes, or asks the study coach questions.

## Technology

| Area | Implementation |
| --- | --- |
| Application | Next.js 16 App Router, React 19, TypeScript |
| Document processing | PDF.js with PDF, TXT, and Markdown support |
| AI | Google Gemini through server-only API routes; additional providers are planned |
| Authentication | Auth.js with Google OAuth |
| Deployment | Vercel |

## Local development

### Requirements

- Node.js 22.13 or newer
- A Gemini API key
- A Google OAuth web client

### Setup

```bash
git clone https://github.com/plut0000/Cognify.git
cd Cognify
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000` after adding the required values to `.env.local`.

Generate an Auth.js session secret with:

```bash
npx auth secret
```

Use this local Google OAuth callback URL:

```text
http://localhost:3000/api/auth/callback/google
```

For production, add your deployed domain in Google Cloud:

```text
https://YOUR-DOMAIN/api/auth/callback/google
```

## Environment variables

| Variable | Purpose |
| --- | --- |
| `GEMINI_API_KEY` | Server-only Gemini API key |
| `GEMINI_MODEL` | Optional model override; defaults to `gemini-3.5-flash-lite` |
| `AUTH_SECRET` | Random secret used to encrypt sessions |
| `AUTH_GOOGLE_ID` | Google OAuth client ID |
| `AUTH_GOOGLE_SECRET` | Google OAuth client secret |
| `AUTH_TRUST_HOST` | Set to `true` on Vercel |

Never commit `.env.local`, API keys, OAuth secrets, or user study documents.

## Roadmap

- [x] Grounded study chatbot
- [x] PDF and text-note ingestion
- [x] Multiple flashcard decks and quiz sets
- [x] Cross-set repetition reduction
- [x] Google authentication
- [ ] Optional OpenAI model provider
- [ ] Automated evaluations for grounding, variety, and response quality
- [ ] Persistent notebook and progress storage
- [ ] Expanded accessibility testing and keyboard support
- [ ] Additional automated tests and contributor tooling

## Contributing

Bug reports, documentation improvements, tests, accessibility fixes, and new study workflows are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request.

## License

Cognify is available under the [MIT License](LICENSE).
