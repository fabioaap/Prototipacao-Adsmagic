/**
 * Toast Store
 *
 * Gerencia o estado das notificações toast (temporárias).
 * Toasts são exibidos no canto superior direito e removidos automaticamente.
 *
 * @module stores/toast
 */

import { defineStore } from 'pinia'
import { ref, readonly } from 'vue'

export interface Toast {
  id: string
  title: string
  description?: string
  variant: 'default' | 'success' | 'destructive' | 'warning'
  duration?: number
  createdAt: number
}

export const useToastStore = defineStore('toast', () => {
  // ========================================================================
  // STATE
  // ========================================================================

  /**
   * Lista de toasts ativos
   */
  const toasts = ref<Toast[]>([])

  // ========================================================================
  // ACTIONS
  // ========================================================================

  /**
   * Adiciona um novo toast
   *
   * @param toast - Dados do toast (sem id, será gerado automaticamente)
   * @returns ID do toast criado
   */
  const addToast = (toast: Omit<Toast, 'id' | 'createdAt'>): string => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const duration = toast.duration ?? 3000

    const newToast: Toast = {
      id,
      title: toast.title,
      description: toast.description,
      variant: toast.variant,
      duration,
      createdAt: Date.now()
    }

    toasts.value.push(newToast)

    // Auto-remove após duração especificada
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }

    console.log('[Toast Store] Added toast:', newToast.title)
    return id
  }

  /**
   * Remove um toast específico
   *
   * @param id - ID do toast a remover
   */
  const removeToast = (id: string): void => {
    const index = toasts.value.findIndex(toast => toast.id === id)
    if (index !== -1) {
      toasts.value.splice(index, 1)
      console.log('[Toast Store] Removed toast:', id)
    }
  }

  /**
   * Remove todos os toasts
   */
  const clearAll = (): void => {
    toasts.value = []
    console.log('[Toast Store] Cleared all toasts')
  }

  /**
   * Remove toasts por variant
   *
   * @param variant - Variant dos toasts a remover
   */
  const clearByVariant = (variant: Toast['variant']): void => {
    toasts.value = toasts.value.filter(toast => toast.variant !== variant)
    console.log('[Toast Store] Cleared toasts with variant:', variant)
  }

  // ========================================================================
  // RETURN (API pública da store)
  // ========================================================================

  return {
    // State (readonly para prevenir mutações diretas)
    toasts: readonly(toasts),

    // Actions
    addToast,
    removeToast,
    clearAll,
    clearByVariant
  }
})
