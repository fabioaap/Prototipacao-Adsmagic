/**
 * Strategy Pattern para resolver identificação de conta em webhooks
 * 
 * Suporta dois métodos:
 * 1. Por header (x-account-id) - Para webhooks específicos por conta
 * 2. Por token no body - Para webhooks globais (ex: UAZAPI)
 */

import type { MessagingAccount } from '../types.ts'
import type { MessagingAccountRepository } from '../repositories/MessagingAccountRepository.ts'

/**
 * Interface para estratégias de resolução de conta
 */
export interface AccountResolverStrategy {
  /**
   * Resolve conta a partir do request
   * @returns Conta encontrada ou null
   */
  resolve(req: Request, body: unknown, accountRepo: MessagingAccountRepository): Promise<MessagingAccount | null>
  
  /**
   * Nome da estratégia para logs
   */
  readonly name: string
}

/**
 * Estratégia: Resolver conta por header x-account-id
 * Usado por webhooks específicos por conta
 */
export class HeaderAccountResolver implements AccountResolverStrategy {
  readonly name = 'header'
  
  async resolve(
    req: Request,
    _body: unknown,
    accountRepo: MessagingAccountRepository
  ): Promise<MessagingAccount | null> {
    const accountId = req.headers.get('x-account-id')
    
    if (!accountId) {
      return null
    }
    
    return await accountRepo.findById(accountId)
  }
}

/**
 * Estratégia: Resolver conta por token no body
 * Usado por webhooks globais (ex: UAZAPI)
 */
export class TokenAccountResolver implements AccountResolverStrategy {
  readonly name = 'token'
  
  /**
   * Extrai token do body do webhook
   * Suporta diferentes formatos de webhook
   */
  private extractToken(body: unknown): string | null {
    if (!body || typeof body !== 'object') {
      return null
    }
    
    const data = body as Record<string, unknown>
    
    // UAZAPI: token direto no body
    if (typeof data.token === 'string') {
      return data.token
    }
    
    // Outros formatos possíveis
    if (typeof data.instanceToken === 'string') {
      return data.instanceToken
    }
    
    if (typeof data.instance_token === 'string') {
      return data.instance_token
    }
    
    return null
  }
  
  /**
   * Detecta tipo de broker pelo formato do body
   */
  private detectBrokerType(body: unknown): string | null {
    if (!body || typeof body !== 'object') {
      return null
    }
    
    const data = body as Record<string, unknown>
    
    // UAZAPI: tem EventType e message
    if (data.EventType && data.message) {
      return 'uazapi'
    }
    
    // WhatsApp Business API: tem entry[]
    if (Array.isArray(data.entry)) {
      return 'official_whatsapp'
    }
    
    return null
  }
  
  async resolve(
    _req: Request,
    body: unknown,
    accountRepo: MessagingAccountRepository
  ): Promise<MessagingAccount | null> {
    const token = this.extractToken(body)
    
    if (!token) {
      return null
    }
    
    // Tentar detectar broker type para otimizar busca
    const brokerType = this.detectBrokerType(body)
    
    return await accountRepo.findByToken(token, brokerType || undefined)
  }
}

/**
 * Factory para criar resolver apropriado
 * Tenta header primeiro, depois token
 */
export class AccountResolverFactory {
  /**
   * Resolve conta usando estratégias em ordem de prioridade
   * 1. Header (x-account-id) - mais específico
   * 2. Token no body - para webhooks globais
   */
  static async resolve(
    req: Request,
    body: unknown,
    accountRepo: MessagingAccountRepository
  ): Promise<{ account: MessagingAccount | null; strategy: string }> {
    // Estratégia 1: Por header (prioridade)
    const headerResolver = new HeaderAccountResolver()
    const accountByHeader = await headerResolver.resolve(req, body, accountRepo)
    
    if (accountByHeader) {
      return { account: accountByHeader, strategy: headerResolver.name }
    }
    
    // Estratégia 2: Por token no body (webhook global)
    const tokenResolver = new TokenAccountResolver()
    const accountByToken = await tokenResolver.resolve(req, body, accountRepo)
    
    if (accountByToken) {
      return { account: accountByToken, strategy: tokenResolver.name }
    }
    
    // Nenhuma estratégia encontrou conta
    return { account: null, strategy: 'none' }
  }
}
