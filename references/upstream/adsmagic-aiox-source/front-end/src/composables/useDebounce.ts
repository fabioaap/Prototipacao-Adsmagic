/**
 * useDebounce Composable
 *
 * Implementa debounce e throttle para otimizar performance.
 * Útil para:
 * - Busca em tempo real (evitar requisições excessivas)
 * - Eventos de scroll/resize
 * - Validação de inputs
 *
 * Uso:
 * ```typescript
 * const debouncedSearch = useDebounce((query) => search(query), 300)
 * ```
 *
 * @module composables/useDebounce
 */

import { ref, watch } from 'vue'
import type { Ref } from 'vue'

/**
 * Debounce: Aguarda um período de inatividade antes de executar
 *
 * @param fn - Função a ser executada
 * @param delay - Delay em milissegundos (padrão: 300ms)
 * @returns Função debounced
 *
 * @example
 * ```typescript
 * const searchQuery = ref('')
 * const debouncedSearch = useDebounce((query: string) => {
 *   console.log('Searching for:', query)
 * }, 500)
 *
 * watch(searchQuery, (newQuery) => {
 *   debouncedSearch(newQuery)
 * })
 * ```
 */
export function useDebounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      fn(...args)
      timeoutId = null
    }, delay)
  }
}

/**
 * Throttle: Executa no máximo uma vez a cada período
 *
 * @param fn - Função a ser executada
 * @param delay - Delay em milissegundos (padrão: 300ms)
 * @returns Função throttled
 *
 * @example
 * ```typescript
 * const handleScroll = useThrottle(() => {
 *   console.log('Scrolled!')
 * }, 200)
 *
 * window.addEventListener('scroll', handleScroll)
 * ```
 */
export function useThrottle<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300
): (...args: Parameters<T>) => void {
  let lastCall = 0

  return (...args: Parameters<T>) => {
    const now = Date.now()

    if (now - lastCall >= delay) {
      lastCall = now
      fn(...args)
    }
  }
}

/**
 * Debounced Ref: Cria uma ref que atualiza com debounce
 *
 * @param initialValue - Valor inicial
 * @param delay - Delay em milissegundos (padrão: 300ms)
 * @returns Objeto com value (imediato) e debouncedValue (debounced)
 *
 * @example
 * ```typescript
 * const { value: searchQuery, debouncedValue } = useDebouncedRef('', 500)
 *
 * watch(debouncedValue, (query) => {
 *   // Esta função só executa 500ms após parar de digitar
 *   fetchResults(query)
 * })
 * ```
 */
export function useDebouncedRef<T>(initialValue: T, delay: number = 300) {
  const value = ref<T>(initialValue) as Ref<T>
  const debouncedValue = ref<T>(initialValue) as Ref<T>
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  watch(value, (newValue) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      debouncedValue.value = newValue
      timeoutId = null
    }, delay)
  })

  return {
    value,
    debouncedValue
  }
}

/**
 * Debounced Watch: Observa uma ref com debounce
 *
 * @param source - Ref a ser observada
 * @param callback - Função a ser executada
 * @param delay - Delay em milissegundos (padrão: 300ms)
 *
 * @example
 * ```typescript
 * const searchQuery = ref('')
 *
 * useDebouncedWatch(searchQuery, (newValue) => {
 *   console.log('Debounced search:', newValue)
 *   fetchResults(newValue)
 * }, 500)
 * ```
 */
export function useDebouncedWatch<T>(
  source: Ref<T>,
  callback: (value: T, oldValue: T) => void,
  delay: number = 300
): void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  watch(source, (newValue, oldValue) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      callback(newValue, oldValue)
      timeoutId = null
    }, delay)
  })
}

/**
 * Throttled Watch: Observa uma ref com throttle
 *
 * @param source - Ref a ser observada
 * @param callback - Função a ser executada
 * @param delay - Delay em milissegundos (padrão: 300ms)
 *
 * @example
 * ```typescript
 * const scrollY = ref(0)
 *
 * useThrottledWatch(scrollY, (newValue) => {
 *   console.log('Throttled scroll:', newValue)
 * }, 200)
 * ```
 */
export function useThrottledWatch<T>(
  source: Ref<T>,
  callback: (value: T, oldValue: T) => void,
  delay: number = 300
): void {
  let lastCall = 0

  watch(source, (newValue, oldValue) => {
    const now = Date.now()

    if (now - lastCall >= delay) {
      lastCall = now
      callback(newValue, oldValue)
    }
  })
}

/**
 * Debounced Async Function: Wrapper para funções assíncronas com debounce
 *
 * @param fn - Função assíncrona
 * @param delay - Delay em milissegundos (padrão: 300ms)
 * @returns Objeto com execute (debounced), cancel e isPending
 *
 * @example
 * ```typescript
 * const { execute, cancel, isPending } = useDebouncedAsync(
 *   async (query: string) => {
 *     const results = await searchAPI(query)
 *     return results
 *   },
 *   500
 * )
 *
 * // Uso
 * execute('search term')
 *
 * // Cancelar se necessário
 * cancel()
 * ```
 */
export function useDebouncedAsync<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  delay: number = 300
) {
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  const isPending = ref(false)

  const execute = (...args: Parameters<T>): Promise<ReturnType<T> | null> => {
    return new Promise((resolve) => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }

      isPending.value = true

      timeoutId = setTimeout(async () => {
        try {
          const result = await fn(...args)
          resolve(result)
        } catch (error) {
          console.error('[useDebouncedAsync] Error:', error)
          resolve(null)
        } finally {
          isPending.value = false
          timeoutId = null
        }
      }, delay)
    })
  }

  const cancel = (): void => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
      isPending.value = false
    }
  }

  return {
    execute,
    cancel,
    isPending
  }
}
