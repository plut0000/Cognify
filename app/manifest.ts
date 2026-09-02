import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Cognify — Learn from your notes",
    short_name: "Cognify",
    description: "Turn PDFs and class notes into summaries, flashcards, quizzes, and grounded study help.",
    start_url: "/",
    display: "standalone",
    background_color: "#f6f7fb",
    theme_color: "#6d5ce8",
    icons: [
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
