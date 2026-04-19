/**
 * Logger — ported from Deno Edge Function (pure logic)
 */

export interface LogContext {
  handler?: string
  method?: string
  accountId?: string
  brokerType?: string
  strategy?: string
  [key: string]: unknown
}

export interface Metrics {
  processingTimeMs?: number
  webhookType?: 'global' | 'by_account'
  eventType?: string
  messageIgnored?: boolean
  [key: string]: unknown
}

export class WebhookLogger {
  private context: LogContext

  constructor(context: LogContext = {}) {
    this.context = context
  }

  info(message: string, data?: Record<string, unknown>): void {
    console.log(this.formatLog('INFO', message, data))
  }

  warn(message: string, data?: Record<string, unknown>): void {
    console.warn(this.formatLog('WARN', message, data))
  }

  error(message: string, error?: Error | unknown, data?: Record<string, unknown>): void {
    const errorData = error instanceof Error
      ? { errorMessage: error.message, errorStack: error.stack }
      : { error: String(error) }
    console.error(this.formatLog('ERROR', message, { ...errorData, ...data }))
  }

  metrics(message: string, metrics: Metrics, data?: Record<string, unknown>): void {
    console.log(this.formatLog('METRICS', message, { ...metrics, ...data }))
  }

  private formatLog(level: string, message: string, data?: Record<string, unknown>): string {
    return JSON.stringify({ timestamp: new Date().toISOString(), level, message, ...this.context, ...data })
  }

  withContext(additionalContext: LogContext): WebhookLogger {
    return new WebhookLogger({ ...this.context, ...additionalContext })
  }
}

export async function measureTime<T>(
  fn: () => Promise<T>,
  logger?: WebhookLogger
): Promise<{ result: T; timeMs: number }> {
  const startTime = performance.now()
  try {
    const result = await fn()
    const timeMs = performance.now() - startTime
    if (logger) logger.metrics('Function execution time', { processingTimeMs: timeMs })
    return { result, timeMs }
  } catch (error) {
    const timeMs = performance.now() - startTime
    if (logger) logger.error('Function execution failed', error, { processingTimeMs: timeMs })
    throw error
  }
}
