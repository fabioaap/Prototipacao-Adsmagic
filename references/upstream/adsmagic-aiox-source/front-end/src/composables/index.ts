/**
 * Composables - Centralized Export Point
 *
 * Este arquivo exporta todos os composables do projeto
 * para facilitar imports consistentes em toda a aplicação.
 *
 * Uso:
 * ```typescript
 * import { useApi, useDebounce, usePagination } from '@/composables'
 * ```
 *
 * @module composables
 */

// API & Data Fetching
export { useApi, useApiParallel } from './useApi'

// Device Detection
export { useDevice, getDeviceMetadata } from './useDevice'
export type { DeviceType, OS, Browser } from './useDevice'

// Pagination
export { usePagination } from './usePagination'
export type { UsePaginationOptions, UsePaginationReturn } from './usePagination'

// Debounce & Throttle
export {
  useDebounce,
  useThrottle,
  useDebouncedRef,
  useDebouncedWatch,
  useThrottledWatch,
  useDebouncedAsync
} from './useDebounce'

// Formatting
export { useFormat } from './useFormat'

// Validation
export { useValidation } from './useValidation'

// UI State
export { useSidebar } from './useSidebar'
export { useDarkMode } from './useDarkMode'

// i18n
export { useLocalizedRoute } from './useLocalizedRoute'

/**
 * Guia de uso dos composables:
 *
 * 1. **useApi** - Gerencia estado de chamadas à API
 *    - Loading, error e data states
 *    - Callbacks onSuccess e onError
 *    - Variante useApiParallel para múltiplas requisições
 *
 * 2. **useDevice** - Detecta informações do dispositivo
 *    - Tipo (mobile, tablet, desktop)
 *    - OS (Windows, Mac, Linux, Android, iOS)
 *    - Browser (Chrome, Firefox, Safari, etc.)
 *    - Tamanho de tela e orientação
 *
 * 3. **usePagination** - Gerencia estado de paginação
 *    - Navegação entre páginas
 *    - Cálculo de ranges e totais
 *    - Geração de números de página para UI
 *
 * 4. **useDebounce/useThrottle** - Otimização de performance
 *    - useDebounce: Aguarda inatividade
 *    - useThrottle: Limita frequência
 *    - Variantes: useDebouncedRef, useDebouncedWatch, useDebouncedAsync
 *
 * 5. **useFormat** - Formatação i18n
 *    - Moedas, números, datas
 *    - Porcentagens, datetime
 *    - Tempo relativo
 *
 * 6. **useValidation** - Validações com i18n
 *    - Email, senha, nome, telefone
 *    - Mensagens traduzidas
 *
 * 7. **useSidebar** - Estado da sidebar
 *    - Abrir/fechar
 *    - Persistência
 *
 * 8. **useDarkMode** - Tema dark/light
 *    - Toggle automático
 *    - Persistência
 *
 * 9. **useLocalizedRoute** - Rotas traduzidas
 *    - Navegação com locale
 */
