/**
 * useApi Composable
 *
 * Gerencia estado de chamadas à API (loading, error, data).
 * Facilita o pattern de loading/error/success em componentes.
 *
 * Uso:
 * ```typescript
 * const { data, isLoading, error, execute } = useApi(fetchContacts)
 *
 * onMounted(() => {
 *   execute()
 * })
 * ```
 *
 * @module composables/useApi
 */

import { ref } from 'vue'
import type { Ref } from 'vue'
import type { Result } from '@/types'

interface UseApiOptions {
  /**
   * Executar automaticamente ao montar componente
   */
  immediate?: boolean

  /**
   * Callback executado em caso de sucesso
   */
  onSuccess?: <T>(data: T) => void

  /**
   * Callback executado em caso de erro
   */
  onError?: (error: Error) => void

  /**
   * Resetar dados antes de cada execução
   */
  resetDataOnExecute?: boolean
}

interface UseApiReturn<T, Args extends unknown[] = []> {
  /**
   * Dados retornados pela API
   */
  data: Ref<T | null>

  /**
   * Indica se está carregando
   */
  isLoading: Ref<boolean>

  /**
   * Mensagem de erro, se houver
   */
  error: Ref<string | null>

  /**
   * Executa a chamada à API
   */
  execute: (...args: Args) => Promise<T | null>

  /**
   * Reseta o estado (data, error)
   */
  reset: () => void
}

/**
 * Composable para gerenciar estado de chamadas à API
 *
 * @template T - Tipo dos dados retornados
 * @param apiFunction - Função que retorna uma Promise<Result<T, Error>>
 * @param options - Opções do composable
 * @returns Objeto com data, isLoading, error, execute e reset
 *
 * @example
 * ```typescript
 * // Uso básico
 * const { data, isLoading, error, execute } = useApi(getContacts)
 *
 * // Com opções
 * const { data, execute } = useApi(getContacts, {
 *   immediate: true,
 *   onSuccess: (data) => console.log('Sucesso!', data),
 *   onError: (error) => console.error('Erro!', error)
 * })
 *
 * // Com parâmetros
 * const { data, execute } = useApi(getContactById)
 * execute('contact-123')
 * ```
 */
export function useApi<T, Args extends unknown[] = []>(
  apiFunction: (...args: Args) => Promise<Result<T, Error>>,
  options: UseApiOptions = {}
): UseApiReturn<T, Args> {
  const { immediate = false, onSuccess, onError, resetDataOnExecute = false } = options

  const data = ref<T | null>(null) as Ref<T | null>
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Executa a chamada à API
   */
  const execute = async (...args: Args): Promise<T | null> => {
    isLoading.value = true
    error.value = null

    if (resetDataOnExecute) {
      data.value = null
    }

    try {
      const result = await apiFunction(...args)

      if (result.ok) {
        data.value = result.value
        if (onSuccess) {
          onSuccess(result.value)
        }
        return result.value
      } else {
        const errorMessage = result.error.message || 'Erro desconhecido'
        error.value = errorMessage
        if (onError) {
          onError(result.error)
        }
        return null
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      error.value = errorMessage
      if (onError) {
        onError(err instanceof Error ? err : new Error(errorMessage))
      }
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Reseta o estado
   */
  const reset = (): void => {
    data.value = null
    error.value = null
    isLoading.value = false
  }

  // Executa imediatamente se configurado
  if (immediate) {
    execute(...([] as unknown as Args))
  }

  return {
    data,
    isLoading,
    error,
    execute,
    reset
  }
}

/**
 * Variante do useApi para múltiplas requisições paralelas
 *
 * @example
 * ```typescript
 * const { data, isLoading, execute } = useApiParallel([
 *   () => getContacts(),
 *   () => getStages(),
 *   () => getOrigins()
 * ])
 *
 * await execute() // Executa todas em paralelo
 * // data.value = [contactsResult, stagesResult, originsResult]
 * ```
 */
export function useApiParallel<T extends unknown[]>(
  apiFunctions: Array<() => Promise<Result<unknown, Error>>>
): UseApiReturn<T> {
  const data = ref<unknown[] | null>(null) as Ref<T | null>
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const execute = async (): Promise<T | null> => {
    isLoading.value = true
    error.value = null
    data.value = null

    try {
      const results = await Promise.all(apiFunctions.map(fn => fn()))

      // Verifica se algum falhou
      const failedResult = results.find(r => !r.ok)
      if (failedResult && !failedResult.ok) {
        const errorMessage = failedResult.error.message || 'Erro em uma das requisições'
        error.value = errorMessage
        return null
      }

      // Extrai os valores
      data.value = results.map(r => (r.ok ? r.value : null)) as T
      return data.value
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      error.value = errorMessage
      return null
    } finally {
      isLoading.value = false
    }
  }

  const reset = (): void => {
    data.value = null
    error.value = null
    isLoading.value = false
  }

  return {
    data,
    isLoading,
    error,
    execute,
    reset
  }
}
