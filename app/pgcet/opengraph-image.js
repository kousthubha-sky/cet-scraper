import { ImageResponse } from "next/og";

export const alt =
  "PGCET College Finder 2026 — predict Karnataka MBA & MCA colleges by your PGCET rank";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #ffffff 0%, #f4f8f9 55%, #eef2ff 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 30,
            fontWeight: 700,
            color: "#a855f7",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}
        >
          PGCET 2026 · MBA &amp; MCA Finder
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 24,
            fontSize: 86,
            fontWeight: 800,
            color: "#0f172a",
            lineHeight: 1.05,
            letterSpacing: "-0.03em",
          }}
        >
          Got your PGCET rank? Find your college.
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 30,
            fontSize: 34,
            color: "#475569",
          }}
        >
          Genuine KEA 2025 cut-offs · MBA &amp; MCA · 467 Karnataka colleges
        </div>
      </div>
    ),
    { ...size }
  );
}
