import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "Cognify — learn from your own notes";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const logo = await readFile(join(process.cwd(), "public/cognify-logo.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "#f3efe6",
          color: "#16191f",
          fontFamily: "Georgia, 'Times New Roman', serif",
        }}
      >
        <div
          style={{
            width: 520,
            height: 520,
            position: "absolute",
            right: -140,
            top: -180,
            border: "1px solid #ddd6c8",
            borderRadius: "50%",
          }}
        />
        <div style={{ width: 700, display: "flex", flexDirection: "column", position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 28, fontWeight: 600, fontFamily: "Arial, sans-serif" }}>
            <img src={logoSrc} width={64} height={64} alt="" />
            Cognify
          </div>
          <div style={{ marginTop: 44, fontSize: 58, lineHeight: 1.08, letterSpacing: "-1.5px" }}>
            Learn from the notes you already have.
          </div>
          <div style={{ marginTop: 28, color: "#5c6168", fontSize: 26, lineHeight: 1.45, fontFamily: "Arial, sans-serif" }}>
            Summaries, flashcards, quizzes, slideshows, and a coach grounded in your source.
          </div>
        </div>
        <div
          style={{
            width: 280,
            display: "flex",
            flexDirection: "column",
            gap: 18,
            padding: 28,
            position: "relative",
            border: "1px solid #ddd6c8",
            borderRadius: 14,
            background: "#fbf8f1",
          }}
        >
          {["Clear summary", "Fresh flashcards", "Practice quiz", "Notebook slideshow"].map((label, index) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 20, fontFamily: "Arial, sans-serif" }}>
              <span
                style={{
                  width: 34,
                  height: 34,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 8,
                  background: index % 2 ? "#e6f2eb" : "#e6eef4",
                  color: index % 2 ? "#2a6b4f" : "#1f3d5c",
                  fontSize: 16,
                }}
              >
                {index + 1}
              </span>
              {label}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
