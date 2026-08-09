# Contributing to Cognify

Thanks for helping improve Cognify. Contributions that make studying more reliable, accessible, private, and useful are welcome.

## Good places to contribute

- Fix a reproducible bug or improve an error message.
- Add tests for document parsing or study-set generation.
- Improve keyboard navigation, screen-reader support, or mobile layouts.
- Reduce repeated or weak flashcards and quiz questions.
- Improve setup instructions or other documentation.
- Propose a focused study workflow through a GitHub issue.

## Development setup

1. Fork and clone the repository.
2. Install dependencies with `npm install`.
3. Copy `.env.example` to `.env.local` and add your own development credentials.
4. Run `npm run dev`.
5. Before submitting changes, run:

```bash
npm run lint
npm run build
```

Never commit API keys, OAuth secrets, `.env.local`, or personal study documents.

## Pull requests

Keep pull requests focused and explain:

- What problem the change solves
- How the change was tested
- Any UI, environment-variable, or deployment impact
- Screenshots for visible interface changes, when useful

Use clear commit messages and avoid unrelated formatting changes. Link the relevant issue when one exists.

## Bug reports

Open a GitHub issue with reproduction steps, expected behavior, actual behavior, browser/device information, and relevant non-sensitive logs. Remove credentials and personal material before posting.

## Responsible AI changes

Changes to prompts or AI routes should preserve source grounding, avoid inventing unsupported facts, reduce repetition, and return clear errors when a provider is unavailable. Include an example or test showing the intended behavior.

## Community expectations

Be respectful, constructive, and welcoming. Harassment, discrimination, and sharing another person's private information are not acceptable.
