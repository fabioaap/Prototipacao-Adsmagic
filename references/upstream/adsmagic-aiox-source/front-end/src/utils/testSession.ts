/**
 * Utilitário para testar preservação de sessão durante desenvolvimento
 * 
 * Use este arquivo no console do navegador para verificar se a sessão
 * está sendo preservada corretamente durante operações OAuth.
 * 
 * @example
 * ```typescript
 * // No console do navegador:
 * import { testSessionPreservation } from '@/utils/testSession'
 * await testSessionPreservation()
 * ```
 */

import { ensureSession } from '@/services/api/client'
import { supabase } from '@/services/api/supabaseClient'

/**
 * Testa se a sessão está sendo preservada corretamente
 * 
 * @returns Promise com resultado do teste
 */
export async function testSessionPreservation(): Promise<{
  success: boolean
  message: string
  details: {
    hasSession: boolean
    hasAccessToken: boolean
    hasRefreshToken: boolean
    sessionExpiresAt?: string
  }
}> {
  console.log('🧪 [Test Session] Iniciando teste de preservação de sessão...')
  
  try {
    // 1. Verificar sessão direta do Supabase
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      return {
        success: false,
        message: `Erro ao obter sessão: ${error.message}`,
        details: {
          hasSession: false,
          hasAccessToken: false,
          hasRefreshToken: false,
        },
      }
    }
    
    const hasSession = !!session
    const hasAccessToken = !!session?.access_token
    const hasRefreshToken = !!session?.refresh_token
    const sessionExpiresAt = session?.expires_at 
      ? new Date(session.expires_at * 1000).toISOString()
      : undefined
    
    // 2. Testar ensureSession()
    const ensuredSession = await ensureSession()
    const ensureSessionSuccess = !!ensuredSession
    
    // 3. Resultado
    const success = hasSession && hasAccessToken && ensureSessionSuccess
    
    const result = {
      success,
      message: success
        ? '✅ Sessão está sendo preservada corretamente!'
        : '❌ Sessão não está disponível ou inválida',
      details: {
        hasSession,
        hasAccessToken,
        hasRefreshToken,
        sessionExpiresAt,
      },
    }
    
    console.log('🧪 [Test Session] Resultado:', result)
    return result
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
    console.error('🧪 [Test Session] Erro:', errorMessage)
    
    return {
      success: false,
      message: `Erro durante teste: ${errorMessage}`,
      details: {
        hasSession: false,
        hasAccessToken: false,
        hasRefreshToken: false,
      },
    }
  }
}

/**
 * Monitora mudanças na sessão em tempo real
 * 
 * Útil para detectar quando a sessão é perdida durante OAuth
 * 
 * @param duration - Duração do monitoramento em milissegundos (padrão: 5 minutos)
 */
export function monitorSessionChanges(duration = 5 * 60 * 1000): () => void {
  console.log(`🔍 [Monitor Session] Iniciando monitoramento por ${duration / 1000}s...`)
  
  const startTime = Date.now()
  let lastSessionState: { hasSession: boolean; timestamp: string } | null = null
  
  const checkInterval = setInterval(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    const hasSession = !!session?.access_token
    const timestamp = new Date().toISOString()
    
    const currentState = { hasSession, timestamp }
    
    // Log apenas se estado mudou
    if (!lastSessionState || lastSessionState.hasSession !== hasSession) {
      if (hasSession) {
        console.log('✅ [Monitor Session] Sessão válida:', timestamp)
      } else {
        console.warn('⚠️ [Monitor Session] Sessão perdida:', timestamp)
      }
      lastSessionState = currentState
    }
    
    // Parar após duração especificada
    if (Date.now() - startTime >= duration) {
      clearInterval(checkInterval)
      console.log('🔍 [Monitor Session] Monitoramento finalizado')
    }
  }, 1000) // Verificar a cada 1 segundo
  
  // Cleanup ao sair
  return () => {
    clearInterval(checkInterval)
    console.log('🔍 [Monitor Session] Monitoramento interrompido')
  }
}

/**
 * Testa se ensureSession() funciona corretamente em diferentes cenários
 */
export async function testEnsureSession(): Promise<void> {
  console.log('🧪 [Test EnsureSession] Testando ensureSession()...')
  
  // Teste 1: Sessão válida
  console.log('📝 Teste 1: Sessão válida')
  const result1 = await ensureSession()
  console.log('Resultado:', result1 ? '✅ Sessão obtida' : '❌ Sessão não disponível')
  
  // Teste 2: Verificar se refresh funciona (se sessão expirada)
  console.log('📝 Teste 2: Verificar refresh automático')
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.refresh_token && !session?.access_token) {
    console.log('Sessão expirada detectada, testando refresh...')
    const refreshed = await ensureSession()
    console.log('Resultado do refresh:', refreshed ? '✅ Refresh bem-sucedido' : '❌ Refresh falhou')
  } else {
    console.log('Sessão ainda válida, não é possível testar refresh')
  }
  
  console.log('🧪 [Test EnsureSession] Testes concluídos')
}

// Exportar para uso no console do navegador
if (import.meta.env.DEV) {
  // @ts-ignore - Disponibilizar globalmente apenas em DEV
  if (typeof window !== 'undefined') {
    // @ts-ignore
    window.testSessionPreservation = testSessionPreservation
    // @ts-ignore
    window.monitorSessionChanges = monitorSessionChanges
    // @ts-ignore
    window.testEnsureSession = testEnsureSession
    
    console.log('🧪 Utilitários de teste de sessão disponíveis:')
    console.log('  - window.testSessionPreservation()')
    console.log('  - window.monitorSessionChanges(duration)')
    console.log('  - window.testEnsureSession()')
  }
}

