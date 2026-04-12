/// <reference types="vite/client" />

interface LandingPagesManifestLinks {
	primaryCta?: string
	primaryNavCta?: string
	login?: string
	contact?: string
	privacy?: string
	cookies?: string
	terms?: string
}

interface LandingPagesManifestPage {
	id: string
	slug: string
	name: string
	description: string
	owner: string
	status: string
	entry: string
	previewPath: string
	deliverableDir: string
	canonicalUrl: string
	links: LandingPagesManifestLinks
}

interface LandingPagesManifest {
	version: number
	lastUpdated: string
	pages: LandingPagesManifestPage[]
}

interface ImportMetaEnv {
	readonly VITE_DOCS_PORTAL_URL?: string
	readonly VITE_LANDING_PAGES_PREVIEW_URL?: string
}

declare const __GIT_BRANCH__: string
declare const __GIT_SHA__: string
declare const __APP_VERSION__: string
declare const __LANDING_PAGES_MANIFEST__: LandingPagesManifest