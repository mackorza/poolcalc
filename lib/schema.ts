/**
 * Pure JSON-LD schema builders. Site-agnostic — reuse verbatim across sites.
 *
 * Each function returns a plain JS object you can serialize into an inline
 * <script type="application/ld+json"> tag. Callers pass the site-specific
 * values so this file has zero imports.
 *
 * Reference: https://schema.org / https://developers.google.com/search/docs/appearance/structured-data
 */

type Thing = Record<string, unknown>

export interface OrganizationInput {
  name: string
  url: string
  logo?: string
  sameAs?: string[]
  description?: string
}

export function organizationSchema(i: OrganizationInput): Thing {
  return stripEmpty({
    "@context": "https://schema.org",
    "@type": "Organization",
    name: i.name,
    url: i.url,
    logo: i.logo,
    description: i.description,
    sameAs: i.sameAs && i.sameAs.length > 0 ? i.sameAs : undefined,
  })
}

export interface WebsiteInput {
  name: string
  url: string
  description?: string
  inLanguage?: string
  searchUrlTemplate?: string
}

export function websiteSchema(i: WebsiteInput): Thing {
  const potentialAction = i.searchUrlTemplate
    ? {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: i.searchUrlTemplate,
        },
        "query-input": "required name=search_term_string",
      }
    : undefined

  return stripEmpty({
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: i.name,
    url: i.url,
    description: i.description,
    inLanguage: i.inLanguage,
    potentialAction,
  })
}

export interface LocalBusinessInput {
  /** Primary schema.org type, e.g. "GroceryStore", "LegalService", "LodgingBusiness". Defaults to "LocalBusiness". */
  type?: string
  name: string
  url: string
  logo?: string
  description?: string
  telephone?: string
  email?: string
  priceRange?: string
  streetAddress?: string
  addressLocality?: string
  addressRegion?: string
  postalCode?: string
  /** ISO 3166 country code, e.g. "ZA". */
  addressCountry?: string
  latitude?: number | null
  longitude?: number | null
  /** Schema.org openingHours format: ["Mo-Fr 07:00-19:00", ...] */
  openingHours?: string[]
  sameAs?: string[]
  areaServed?: string[]
}

/**
 * Build LocalBusiness JSON-LD. Returns `null` if no telephone is set, so
 * callers can safely skip emission when business details haven't been filled
 * at all. (streetAddress is optional — some sites start with just
 * locality/region until the address is confirmed.)
 */
export function localBusinessSchema(i: LocalBusinessInput): Thing | null {
  if (!i.telephone) return null

  const address = stripEmpty({
    "@type": "PostalAddress",
    streetAddress: i.streetAddress,
    addressLocality: i.addressLocality,
    addressRegion: i.addressRegion,
    postalCode: i.postalCode,
    addressCountry: i.addressCountry,
  })

  const geo =
    i.latitude != null && i.longitude != null
      ? {
          "@type": "GeoCoordinates",
          latitude: i.latitude,
          longitude: i.longitude,
        }
      : undefined

  return stripEmpty({
    "@context": "https://schema.org",
    "@type": i.type || "LocalBusiness",
    name: i.name,
    url: i.url,
    logo: i.logo,
    description: i.description,
    telephone: i.telephone,
    email: i.email,
    priceRange: i.priceRange,
    address,
    geo,
    openingHours: i.openingHours && i.openingHours.length > 0 ? i.openingHours : undefined,
    sameAs: i.sameAs && i.sameAs.length > 0 ? i.sameAs : undefined,
    areaServed: i.areaServed && i.areaServed.length > 0 ? i.areaServed : undefined,
  })
}

export interface WebApplicationInput {
  name: string
  url: string
  description?: string
  applicationCategory?: string // e.g. "BusinessApplication", "UtilitiesApplication"
  operatingSystem?: string // default "Web"
  priceCurrency?: string // e.g. "ZAR"
  price?: string // e.g. "0" for free
}

export function webApplicationSchema(i: WebApplicationInput): Thing {
  const offers =
    i.price !== undefined
      ? {
          "@type": "Offer",
          price: i.price,
          priceCurrency: i.priceCurrency || "ZAR",
        }
      : undefined

  return stripEmpty({
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: i.name,
    url: i.url,
    description: i.description,
    applicationCategory: i.applicationCategory || "BusinessApplication",
    operatingSystem: i.operatingSystem || "Web",
    offers,
  })
}

export interface ServiceInput {
  name: string
  url: string
  description?: string
  provider: { name: string; url: string }
  serviceType?: string
  areaServed?: string[]
}

export function serviceSchema(i: ServiceInput): Thing {
  return stripEmpty({
    "@context": "https://schema.org",
    "@type": "Service",
    name: i.name,
    url: i.url,
    description: i.description,
    serviceType: i.serviceType,
    provider: {
      "@type": "Organization",
      name: i.provider.name,
      url: i.provider.url,
    },
    areaServed: i.areaServed && i.areaServed.length > 0 ? i.areaServed : undefined,
  })
}

export interface ProductInput {
  name: string
  url: string
  description?: string
  image?: string | string[]
  sku?: string
  brand?: string
  price: number | string
  priceCurrency?: string // default "ZAR"
  availability?: "InStock" | "OutOfStock" | "PreOrder"
}

export function productSchema(i: ProductInput): Thing {
  return stripEmpty({
    "@context": "https://schema.org",
    "@type": "Product",
    name: i.name,
    url: i.url,
    description: i.description,
    image: i.image,
    sku: i.sku,
    brand: i.brand ? { "@type": "Brand", name: i.brand } : undefined,
    offers: {
      "@type": "Offer",
      url: i.url,
      price: typeof i.price === "number" ? i.price.toFixed(2) : i.price,
      priceCurrency: i.priceCurrency || "ZAR",
      availability: `https://schema.org/${i.availability || "InStock"}`,
    },
  })
}

export interface BreadcrumbItem {
  name: string
  url: string
}

export function breadcrumbSchema(items: BreadcrumbItem[]): Thing {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

/** Remove undefined/null/empty-string values from an object (one level deep). */
function stripEmpty<T extends Record<string, unknown>>(obj: T): T {
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null || v === "") continue
    if (typeof v === "object" && !Array.isArray(v)) {
      const cleaned = stripEmpty(v as Record<string, unknown>)
      if (Object.keys(cleaned).length > 0) out[k] = cleaned
    } else {
      out[k] = v
    }
  }
  return out as T
}
