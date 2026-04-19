/**
 * usePagination Composable
 *
 * Gerencia estado e lógica de paginação.
 * Facilita navegação entre páginas, cálculo de ranges, etc.
 *
 * Uso:
 * ```typescript
 * const {
 *   currentPage,
 *   pageSize,
 *   goToPage,
 *   nextPage,
 *   previousPage
 * } = usePagination({ pageSize: 10, onPageChange: fetchData })
 * ```
 *
 * @module composables/usePagination
 */

import { ref, computed, watch } from 'vue'
import type { Ref, ComputedRef } from 'vue'

export interface UsePaginationOptions {
  /**
   * Tamanho da página (itens por página)
   * @default 10
   */
  pageSize?: number

  /**
   * Página inicial
   * @default 1
   */
  initialPage?: number

  /**
   * Total de itens (para calcular totalPages)
   */
  total?: number

  /**
   * Callback executado quando página muda
   */
  onPageChange?: (page: number) => void | Promise<void>
}

export interface UsePaginationReturn {
  /**
   * Página atual (1-indexed)
   */
  currentPage: Ref<number>

  /**
   * Tamanho da página
   */
  pageSize: Ref<number>

  /**
   * Total de itens
   */
  total: Ref<number>

  /**
   * Total de páginas
   */
  totalPages: ComputedRef<number>

  /**
   * Tem página anterior?
   */
  hasPreviousPage: ComputedRef<boolean>

  /**
   * Tem próxima página?
   */
  hasNextPage: ComputedRef<boolean>

  /**
   * Índice do primeiro item da página atual (0-indexed)
   */
  startIndex: ComputedRef<number>

  /**
   * Índice do último item da página atual (0-indexed)
   */
  endIndex: ComputedRef<number>

  /**
   * Range de itens (ex: "1-10 de 100")
   */
  itemsRange: ComputedRef<string>

  /**
   * Array de números de páginas para navegação
   * (ex: [1, 2, 3, '...', 10])
   */
  pageNumbers: ComputedRef<(number | string)[]>

  /**
   * Vai para página específica
   */
  goToPage: (page: number) => void

  /**
   * Vai para próxima página
   */
  nextPage: () => void

  /**
   * Vai para página anterior
   */
  previousPage: () => void

  /**
   * Vai para primeira página
   */
  firstPage: () => void

  /**
   * Vai para última página
   */
  lastPage: () => void

  /**
   * Define o total de itens
   */
  setTotal: (total: number) => void

  /**
   * Define o tamanho da página
   */
  setPageSize: (size: number) => void

  /**
   * Reseta para página inicial
   */
  reset: () => void
}

/**
 * Composable para gerenciar paginação
 *
 * @param options - Opções de configuração
 * @returns Objeto com estado e métodos de paginação
 *
 * @example
 * ```typescript
 * // Uso básico
 * const {
 *   currentPage,
 *   totalPages,
 *   goToPage,
 *   nextPage,
 *   previousPage
 * } = usePagination({
 *   pageSize: 10,
 *   total: 100,
 *   onPageChange: (page) => fetchData(page)
 * })
 *
 * // Em template
 * <button @click="previousPage" :disabled="!hasPreviousPage">Anterior</button>
 * <span>Página {{ currentPage }} de {{ totalPages }}</span>
 * <button @click="nextPage" :disabled="!hasNextPage">Próxima</button>
 * ```
 */
export function usePagination(options: UsePaginationOptions = {}): UsePaginationReturn {
  const {
    pageSize: initialPageSize = 10,
    initialPage = 1,
    total: initialTotal = 0,
    onPageChange
  } = options

  // State
  const currentPage = ref(initialPage)
  const pageSize = ref(initialPageSize)
  const total = ref(initialTotal)

  // Computed
  const totalPages = computed(() => {
    if (total.value === 0) return 0
    return Math.ceil(total.value / pageSize.value)
  })

  const hasPreviousPage = computed(() => currentPage.value > 1)

  const hasNextPage = computed(() => currentPage.value < totalPages.value)

  const startIndex = computed(() => {
    if (total.value === 0) return 0
    return (currentPage.value - 1) * pageSize.value
  })

  const endIndex = computed(() => {
    if (total.value === 0) return 0
    const end = currentPage.value * pageSize.value
    return Math.min(end, total.value) - 1
  })

  const itemsRange = computed(() => {
    if (total.value === 0) return '0 itens'
    const start = startIndex.value + 1
    const end = endIndex.value + 1
    return `${start}-${end} de ${total.value}`
  })

  /**
   * Gera array de números de páginas para navegação
   * Mostra primeiras, últimas e páginas próximas à atual
   * Ex: [1, 2, 3, '...', 10] ou [1, '...', 5, 6, 7, '...', 10]
   */
  const pageNumbers = computed(() => {
    const pages: (number | string)[] = []
    const total = totalPages.value
    const current = currentPage.value

    if (total <= 7) {
      // Mostra todas as páginas se forem poucas
      for (let i = 1; i <= total; i++) {
        pages.push(i)
      }
    } else {
      // Sempre mostra primeira página
      pages.push(1)

      // Páginas ao redor da atual
      const startPage = Math.max(2, current - 1)
      const endPage = Math.min(total - 1, current + 1)

      // Adiciona '...' se necessário
      if (startPage > 2) {
        pages.push('...')
      }

      // Páginas do meio
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i)
      }

      // Adiciona '...' se necessário
      if (endPage < total - 1) {
        pages.push('...')
      }

      // Sempre mostra última página
      pages.push(total)
    }

    return pages
  })

  // Methods
  const goToPage = (page: number): void => {
    if (page < 1 || page > totalPages.value) return
    if (page === currentPage.value) return

    currentPage.value = page

    if (onPageChange) {
      onPageChange(page)
    }
  }

  const nextPage = (): void => {
    if (hasNextPage.value) {
      goToPage(currentPage.value + 1)
    }
  }

  const previousPage = (): void => {
    if (hasPreviousPage.value) {
      goToPage(currentPage.value - 1)
    }
  }

  const firstPage = (): void => {
    goToPage(1)
  }

  const lastPage = (): void => {
    if (totalPages.value > 0) {
      goToPage(totalPages.value)
    }
  }

  const setTotal = (newTotal: number): void => {
    total.value = newTotal

    // Ajusta página atual se estiver fora do range
    if (currentPage.value > totalPages.value && totalPages.value > 0) {
      currentPage.value = totalPages.value
    }
  }

  const setPageSize = (size: number): void => {
    pageSize.value = size
    // Volta para primeira página ao mudar tamanho
    currentPage.value = 1

    if (onPageChange) {
      onPageChange(1)
    }
  }

  const reset = (): void => {
    currentPage.value = initialPage
    pageSize.value = initialPageSize
    total.value = initialTotal
  }

  // Watch para debug (opcional)
  if (import.meta.env.DEV) {
    watch(
      () => currentPage.value,
      (newPage) => {
        console.log('[usePagination] Page changed to:', newPage)
      }
    )
  }

  return {
    currentPage,
    pageSize,
    total,
    totalPages,
    hasPreviousPage,
    hasNextPage,
    startIndex,
    endIndex,
    itemsRange,
    pageNumbers,
    goToPage,
    nextPage,
    previousPage,
    firstPage,
    lastPage,
    setTotal,
    setPageSize,
    reset
  }
}
