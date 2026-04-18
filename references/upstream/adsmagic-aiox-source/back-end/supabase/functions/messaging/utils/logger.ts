/**
 * Logger melhorado com contexto e métricas
 * 
 * Fornece logs estruturados com:
 * - Timestamp
 * - Contexto (handler, método)
 * - Métricas (tempo de processamento)
 * - Dados relevantes (sem informações sensíveis)
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

/**
 * Cria logger com contexto
 */
export class WebhookLogger {
  private context: LogContext
  
  constructor(context: LogContext = {}) {
    this.context = context
  }
  
  /**
   * Log de informação
   */
  info(message: string, data?: Record<string, unknown>): void {
    console.log(this.formatLog('INFO', message, data))
  }
  
  /**
   * Log de warning
   */
  warn(message: string, data?: Record<string, unknown>): void {
    console.warn(this.formatLog('WARN', message, data))
  }
  
  /**
   * Log de erro
   */
  error(message: string, error?: Error | unknown, data?: Record<string, unknown>): void {
    const errorData = error instanceof Error 
      ? { errorMessage: error.message, errorStack: error.stack }
      : { error: String(error) }
    
    console.error(this.formatLog('ERROR', message, { ...errorData, ...data }))
  }
  
  /**
   * Log com métricas
   */
  metrics(message: string, metrics: Metrics, data?: Record<string, unknown>): void {
    console.log(this.formatLog('METRICS', message, { ...metrics, ...data }))
  }
  
  /**
   * Formata log com timestamp e contexto
   */
  private formatLog(level: string, message: string, data?: Record<string, unknown>): string {
    const timestamp = new Date().toISOString()
    const logData = {
      timestamp,
      level,
      message,
      ...this.context,
      ...data,
    }
    
    return JSON.stringify(logData)
  }
  
  /**
   * Cria novo logger com contexto adicional
   */
  withContext(additionalContext: LogContext): WebhookLogger {
    return new WebhookLogger({ ...this.context, ...additionalContext })
  }
}

/**
 * Mede tempo de execução de uma função
 */
export async function measureTime<T>(
  fn: () => Promise<T>,
  logger?: WebhookLogger
): Promise<{ result: T; timeMs: number }> {
  const startTime = performance.now()
  
  try {
    const result = await fn()
    const timeMs = performance.now() - startTime
    
    if (logger) {
      logger.metrics('Function execution time', { processingTimeMs: timeMs })
    }
    
    return { result, timeMs }
  } catch (error) {
    const timeMs = performance.now() - startTime
    
    if (logger) {
      logger.error('Function execution failed', error, { processingTimeMs: timeMs })
    }
    
    throw error
  }
}
