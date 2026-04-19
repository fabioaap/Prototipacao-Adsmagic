/**
 * URL routing for webhook producer
 *
 * Parses: /webhook/{brokerType} or /webhook/{brokerType}/{accountId}
 */

export interface ParsedRoute {
  brokerType: string
  accountId: string | null
  webhookType: 'global' | 'by_account'
}

/**
 * Parse the incoming request URL to extract routing information.
 * Returns null if the URL doesn't match the expected pattern.
 */
export function parseRoute(url: URL): ParsedRoute | null {
  const parts = url.pathname.split('/').filter(Boolean)

  // /webhook/{brokerType}
  if (parts.length === 2 && parts[0] === 'webhook') {
    return {
      brokerType: parts[1],
      accountId: null,
      webhookType: 'global',
    }
  }

  // /webhook/{brokerType}/{accountId}
  if (parts.length === 3 && parts[0] === 'webhook') {
    return {
      brokerType: parts[1],
      accountId: parts[2],
      webhookType: 'by_account',
    }
  }

  return null
}
