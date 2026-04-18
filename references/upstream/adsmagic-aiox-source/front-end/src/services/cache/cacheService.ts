/**
 * Serviço centralizado de cache para reduzir chamadas ao Supabase
 * Implementa cache em memória com expiração automática
 */

interface CacheEntry<T> {
  data: T
  timestamp: number
  expiresIn: number
}

class CacheService {
  private cache = new Map<string, CacheEntry<any>>()
  
  // Tempo de expiração padrão: 5 minutos
  private readonly DEFAULT_EXPIRATION = 5 * 60 * 1000
  
  /**
   * Armazena dados no cache
   * @param key Chave única para o cache
   * @param data Dados a serem armazenados
   * @param expiresIn Tempo de expiração em ms (padrão: 5 minutos)
   */
  set<T>(key: string, data: T, expiresIn?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresIn: expiresIn || this.DEFAULT_EXPIRATION
    })
  }
  
  /**
   * Recupera dados do cache
   * @param key Chave do cache
   * @returns Dados armazenados ou null se expirado/inexistente
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null
    
    const isExpired = Date.now() - entry.timestamp > entry.expiresIn
    if (isExpired) {
      this.cache.delete(key)
      return null
    }
    
    return entry.data as T
  }
  
  /**
   * Remove entrada específica do cache
   * @param key Chave a ser removida
   */
  invalidate(key: string): void {
    this.cache.delete(key)
  }
  
  /**
   * Remove todas as entradas que correspondem ao padrão
   * @param pattern Padrão para busca (ex: "companies:" remove todas as chaves que começam com "companies:")
   */
  invalidatePattern(pattern: string): void {
    const keys = Array.from(this.cache.keys())
    keys.forEach(key => {
      if (key.includes(pattern)) {
        this.cache.delete(key)
      }
    })
  }
  
  /**
   * Limpa todo o cache
   */
  clear(): void {
    this.cache.clear()
  }
  
  /**
   * Retorna estatísticas do cache
   */
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    }
  }
}

export const cacheService = new CacheService()
