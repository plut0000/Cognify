import { ImageResponse } from "next/og";
import { absoluteUrl } from "@/lib/site-config";

export const alt = "Cognify — study smarter from your own notes";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "74px 82px",
          overflow: "hidden",
          position: "relative",
          background: "linear-gradient(135deg, #f8f7ff 0%, #ffffff 58%, #eeebff 100%)",
          color: "#202330",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            width: 470,
            height: 470,
            position: "absolute",
            right: -115,
            top: -190,
            border: "2px solid #dcd7ff",
            borderRadius: "50%",
            boxShadow: "0 0 0 55px rgba(109,92,232,.05), 0 0 0 110px rgba(109,92,232,.025)",
          }}
        />
        <div style={{ width: 720, display: "flex", flexDirection: "column", position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 29, fontWeight: 700 }}>
            <img src={absoluteUrl("/cognify-logo.png")} width={68} height={68} alt="" />
            Cognify
          </div>
          <div style={{ marginTop: 46, fontSize: 66, lineHeight: 1.03, letterSpacing: "-3px", fontWeight: 760 }}>
            Study smarter from the notes you already have.
          </div>
          <div style={{ marginTop: 30, color: "#646a78", fontSize: 27, lineHeight: 1.45 }}>
            Summaries, flashcards, quizzes, and source-grounded study help in one focused workspace.
          </div>
        </div>
        <div
          style={{
            width: 250,
            height: 350,
            display: "flex",
            flexDirection: "column",
            gap: 20,
            padding: 30,
            position: "relative",
            border: "1px solid #ddd8ff",
            borderRadius: 28,
            background: "rgba(255,255,255,.9)",
            boxShadow: "0 30px 80px rgba(49,40,102,.16)",
          }}
        >
          {["Clear summary", "Fresh flashcards", "Practice quiz", "Grounded coach"].map((label, index) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 15, fontSize: 18, fontWeight: 650 }}>
              <span
                style={{
                  width: 36,
                  height: 36,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 11,
                  background: index % 2 ? "#eaf8f3" : "#f0edff",
                  color: index % 2 ? "#168163" : "#5b49d6",
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
