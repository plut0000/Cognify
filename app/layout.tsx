import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Cognify — Learn from your own notes",
    template: "%s · Cognify",
  },
  description: "Upload PDFs and class notes, get clear summaries, generate flashcards and quizzes, and study with a source-grounded Gemini coach.",
  icons: {
    icon: "/cognify-logo.png",
    shortcut: "/cognify-logo.png",
    apple: "/apple-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f7f7fb",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
