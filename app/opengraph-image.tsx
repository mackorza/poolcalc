import { ImageResponse } from "next/og"
import { SITE_NAME, SITE_TAGLINE } from "@/lib/seo"

export const runtime = "edge"
export const alt = `${SITE_NAME} — ${SITE_TAGLINE}`
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #0d1c0d 0%, #134e4a 100%)",
          color: "white",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ fontSize: 32, fontWeight: 500, color: "#5eead4", marginBottom: 16 }}>
          futronix.co.za/poolcalc
        </div>
        <div style={{ fontSize: 148, fontWeight: 800, lineHeight: 1.05, marginBottom: 24 }}>
          {SITE_NAME}
        </div>
        <div style={{ fontSize: 40, fontWeight: 400, opacity: 0.95, maxWidth: "85%", lineHeight: 1.2 }}>
          {SITE_TAGLINE}
        </div>
      </div>
    ),
    { ...size },
  )
}
