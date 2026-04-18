/**
 * Route classification helpers for trackable-links.
 *
 * Keeps endpoint scope detection isolated from request handling logic.
 */

export type EndpointScope = 'public' | 'authenticated'

export interface RouteClassification {
  routeParts: string[]
  scope: EndpointScope
  endpointKey: string
}

/**
 * Normalizes pathname segments to the function-local route.
 * Supports:
 * - /trackable-links
 * - /functions/v1/trackable-links
 */
export function getRouteParts(pathname: string): string[] {
  const parts = pathname.split('/').filter(Boolean)
  const functionIndex = parts.lastIndexOf('trackable-links')

  if (functionIndex >= 0) {
    return parts.slice(functionIndex + 1)
  }

  return parts
}

/**
 * Classifies route as public/authenticated and provides a stable endpoint key
 * for logs and throttling.
 */
export function classifyRoute(method: string, routeParts: string[]): RouteClassification {
  // Endpoints públicos removidos: manter escopo público para retornar 404
  // sem exigir autenticação em rotas legadas.
  if (routeParts[0] === 'by-slug' || routeParts[0] === 'by-short') {
    return { routeParts, scope: 'public', endpointKey: 'removed-public-endpoint' }
  }

  if (method === 'POST' && routeParts.length === 2 && routeParts[1] === 'generate-short') {
    return { routeParts, scope: 'public', endpointKey: 'removed-public-endpoint' }
  }

  if (routeParts[1] === 'generate-whatsapp') {
    return { routeParts, scope: 'public', endpointKey: 'generate-whatsapp' }
  }

  if (routeParts[1] === 'register-access') {
    return { routeParts, scope: 'public', endpointKey: 'register-access' }
  }

  if (method === 'POST' && routeParts.length === 0) {
    return { routeParts, scope: 'authenticated', endpointKey: 'create' }
  }

  if (method === 'GET' && routeParts.length === 0) {
    return { routeParts, scope: 'authenticated', endpointKey: 'list' }
  }

  if (method === 'GET' && routeParts.length === 1) {
    return { routeParts, scope: 'authenticated', endpointKey: 'get' }
  }

  if (method === 'GET' && routeParts.length === 2 && routeParts[1] === 'stats') {
    return { routeParts, scope: 'authenticated', endpointKey: 'stats' }
  }

  if (method === 'PATCH' && routeParts.length === 1) {
    return { routeParts, scope: 'authenticated', endpointKey: 'update' }
  }

  if (method === 'DELETE' && routeParts.length === 1) {
    return { routeParts, scope: 'authenticated', endpointKey: 'delete' }
  }

  return { routeParts, scope: 'authenticated', endpointKey: 'unknown' }
}
