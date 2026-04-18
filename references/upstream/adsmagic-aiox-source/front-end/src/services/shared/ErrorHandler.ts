/**
 * Error Handler Service
 * 
 * Centraliza tratamento de erros seguindo princípios SOLID
 * Segue SRP (Single Responsibility Principle)
 */

export class ErrorHandler implements IErrorHandler {
  /**
   * Trata erros de forma centralizada
   * @param error Erro capturado
   * @param context Contexto onde o erro ocorreu
   */
  handle(error: unknown, context: string): void {
    const errorMessage = this.extractErrorMessage(error)
    
    // Log estruturado para debug
    console.error(`[ErrorHandler] ${context}:`, {
      message: errorMessage,
      error,
      timestamp: new Date().toISOString(),
      context
    })

    // Em produção, enviar para serviço de monitoramento
    if (process.env.NODE_ENV === 'production') {
      this.sendToMonitoring(error, context)
    }
  }

  /**
   * Extrai mensagem de erro de forma segura
   * @param error Erro desconhecido
   * @returns Mensagem de erro
   */
  private extractErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message
    }
    
    if (typeof error === 'string') {
      return error
    }
    
    if (error && typeof error === 'object' && 'message' in error) {
      return String(error.message)
    }
    
    return 'Unknown error occurred'
  }

  /**
   * Envia erro para serviço de monitoramento (produção)
   * @param error Erro
   * @param context Contexto
   */
  private sendToMonitoring(_error: unknown, _context: string): void {
    // TODO: Implementar integração com serviço de monitoramento
    // Exemplo: Sentry, LogRocket, etc.
    console.warn('[ErrorHandler] Monitoring service not implemented yet')
  }
}

/**
 * Interface para ErrorHandler (para injeção de dependência)
 */
export interface IErrorHandler {
  handle(error: unknown, context: string): void
}
