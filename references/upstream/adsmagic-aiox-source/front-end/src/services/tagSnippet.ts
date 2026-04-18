/**
 * Shared utilities to build the AdsMagic tag snippet.
 *
 * Single source of truth for script generation across UI/store/services.
 */

export const DEFAULT_TAG_SCRIPT_PATH = '/adsmagic-tag.js'
export const DEFAULT_TRACKING_ENDPOINT_PATH = '/api/events/track'

export interface TagSnippetConfig {
  projectId: string
  scriptUrl: string
  debug?: boolean
  autoInit?: boolean
  /** @deprecated The tag now auto-resolves the endpoint from its script src. Kept for backwards-compat. */
  apiEndpoint?: string
}

const normalizeOrigin = (origin: string): string => {
  return origin.endsWith('/') ? origin.slice(0, -1) : origin
}

const sanitizeScriptUrl = (url: string): string => {
  return url
    .replace(/"/g, '%22')
    .replace(/</g, '%3C')
    .replace(/>/g, '%3E')
}

const sanitizeInlineScript = (value: string): string => {
  // Prevent accidental closing of the script tag if values contain '</script>'
  return value.replace(/<\//g, '<\\/')
}

const serializeJsString = (value: string): string => {
  return sanitizeInlineScript(JSON.stringify(value))
}

const toInlineConfig = (config: Pick<TagSnippetConfig, 'projectId' | 'debug' | 'autoInit'>): string => {
  return [
    `projectId: ${serializeJsString(config.projectId)},`,
    `debug: ${String(config.debug ?? false)},`,
    `autoInit: ${String(config.autoInit ?? true)}`,
  ]
    .map((line) => `    ${line}`)
    .join('\n')
}

export const buildDefaultTagScriptUrl = (origin: string): string => {
  return `${normalizeOrigin(origin)}${DEFAULT_TAG_SCRIPT_PATH}`
}

export const buildDefaultTrackingEndpoint = (origin: string): string => {
  return `${normalizeOrigin(origin)}${DEFAULT_TRACKING_ENDPOINT_PATH}`
}

/**
 * Builds the install snippet used by integrations and tracking settings.
 */
export const buildTagSnippet = (config: TagSnippetConfig): string => {
  const projectId = config.projectId.trim()
  const scriptUrl = sanitizeScriptUrl(config.scriptUrl.trim())

  if (!projectId) {
    throw new Error('projectId is required to build tag snippet')
  }

  if (!scriptUrl) {
    throw new Error('scriptUrl is required to build tag snippet')
  }

  const inlineConfig = toInlineConfig({
    projectId,
    debug: config.debug,
    autoInit: config.autoInit,
  })

  return `<!-- Adsmagic Tracking Tag -->
<script>
  window.adsmagicConfig = {
${inlineConfig}
  };
</script>
<script src="${scriptUrl}"></script>
<!-- End Adsmagic Tracking Tag -->`
}
