/**
 * Site-wide SEO constants and helpers for PoolCalc.
 * Hosted at futronix.co.za/poolcalc (basePath).
 */

// NOTE: Hardcoded host. BASE_PATH is the single source of truth for the subpath.
export const SITE_URL = "https://futronix.co.za"
export const BASE_PATH = "/poolcalc"

export const SITE_NAME = "PoolCalc"
export const SITE_TAGLINE = "Pool Tournament Management with Real-Time Leaderboards"
export const SITE_DESCRIPTION =
  "Manage pool tournaments with real-time leaderboards, automatic team randomization, and round-robin scheduling. Fast, free, and built for players."

export const DEFAULT_KEYWORDS = [
  "PoolCalc",
  "pool tournament",
  "tournament management",
  "round-robin scheduler",
  "leaderboard",
  "billiards",
  "pool league",
  "team randomizer",
  "South Africa",
]

export const LOCALE = "en_ZA"
export const LOCALE_HTML = "en-ZA"

export const GSC_VERIFICATION = process.env.NEXT_PUBLIC_GSC_VERIFICATION || ""
export const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID || ""

export function absoluteUrl(path: string = "/"): string {
  const normalized = path.startsWith("/") ? path : `/${path}`
  return `${SITE_URL}${BASE_PATH}${normalized === "/" ? "/" : normalized}`
}

export function canonicalPath(path: string = "/"): string {
  const normalized = path.startsWith("/") ? path : `/${path}`
  return `${BASE_PATH}${normalized === "/" ? "/" : normalized}`
}
