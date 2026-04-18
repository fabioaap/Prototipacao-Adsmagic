/**
 * useToast Composable
 *
 * Composable para exibir notificações toast temporárias.
 * Fornece API simplificada para adicionar toasts com diferentes variantes.
 *
 * @module components/ui/toast/use-toast
 */

import { useToastStore } from '@/stores/toast'
import type { Toast } from '@/stores/toast'

export interface ToastOptions {
  title: string
  description?: string
  variant?: Toast['variant']
  duration?: number
}

/**
 * Composable para gerenciar toasts
 *
 * @returns Objeto com funções para exibir toasts
 *
 * @example
 * ```typescript
 * const { toast, success, error, warning, info } = useToast()
 *
 * // Toast genérico
 * toast({
 *   title: 'Sucesso',
 *   description: 'Operação realizada com sucesso',
 *   variant: 'success'
 * })
 *
 * // Helpers específicos
 * success('Etapa criada com sucesso!')
 * error('Erro ao salvar dados')
 * warning('Atenção: dados não salvos')
 * info('Informação importante')
 * ```
 */
export function useToast() {
  const toastStore = useToastStore()

  /**
   * Exibe um toast com as opções especificadas
   *
   * @param options - Opções do toast
   * @returns ID do toast criado
   */
  const toast = (options: ToastOptions): string => {
    return toastStore.addToast({
      title: options.title,
      description: options.description,
      variant: options.variant ?? 'default',
      duration: options.duration
    })
  }

  /**
   * Exibe um toast de sucesso
   *
   * @param title - Título do toast
   * @param description - Descrição opcional
   * @returns ID do toast criado
   */
  const success = (title: string, description?: string): string => {
    return toast({
      title,
      description,
      variant: 'success'
    })
  }

  /**
   * Exibe um toast de erro
   *
   * @param title - Título do toast
   * @param description - Descrição opcional
   * @returns ID do toast criado
   */
  const error = (title: string, description?: string): string => {
    return toast({
      title,
      description,
      variant: 'destructive'
    })
  }

  /**
   * Exibe um toast de aviso
   *
   * @param title - Título do toast
   * @param description - Descrição opcional
   * @returns ID do toast criado
   */
  const warning = (title: string, description?: string): string => {
    return toast({
      title,
      description,
      variant: 'warning'
    })
  }

  /**
   * Exibe um toast informativo
   *
   * @param title - Título do toast
   * @param description - Descrição opcional
   * @returns ID do toast criado
   */
  const info = (title: string, description?: string): string => {
    return toast({
      title,
      description,
      variant: 'default'
    })
  }

  /**
   * Remove um toast específico
   *
   * @param id - ID do toast a remover
   */
  const dismiss = (id: string): void => {
    toastStore.removeToast(id)
  }

  /**
   * Remove todos os toasts
   */
  const dismissAll = (): void => {
    toastStore.clearAll()
  }

  return {
    toast,
    success,
    error,
    warning,
    info,
    dismiss,
    dismissAll
  }
}
