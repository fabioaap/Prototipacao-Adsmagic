import manifestData from '../../../marketing/lps.manifest.json'

export type LandingPageId = 'lp-vendas-whatsapp' | 'lp-para-agencias'

export interface LandingPageLinks {
  primaryCta: string
  primaryNavCta?: string
  login: string
  contact: string
  privacy: string
  cookies: string
  terms: string
}

export interface LandingPageManifestEntry {
  id: LandingPageId
  slug: string
  name: string
  seoTitle?: string
  description: string
  owner: string
  status: 'pilot' | 'active' | 'archived'
  entry: string
  previewPath: string
  deliverableDir: string
  canonicalUrl: string
  links: LandingPageLinks
}

export interface LandingPagesManifest {
  version: number
  lastUpdated: string
  pages: LandingPageManifestEntry[]
}

export const landingPagesManifest = manifestData as LandingPagesManifest

export function getLandingPageById(id: LandingPageId) {
  const page = landingPagesManifest.pages.find((entry) => entry.id === id)

  if (!page) {
    throw new Error(`Landing page ${id} nao encontrada no manifesto central.`)
  }

  return page
}