import type { MetadataRoute } from "next"
import { absoluteUrl } from "@/lib/seo"

export const revalidate = 3600

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  return [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: absoluteUrl("/tournaments"), lastModified: now, changeFrequency: "daily", priority: 0.8 },
  ]
}
