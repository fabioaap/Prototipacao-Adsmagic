/**
 * useModal.ts
 * 
 * Composable para gerenciar estado de modais de forma padronizada
 * Oferece API consistente para todos os modais da aplicação
 * 
 * Features:
 * - Estado reativo do modal
 * - Métodos open/close padronizados
 * - Suporte a callbacks
 * - Loading state integrado
 * - Dados de contexto (ex: item sendo editado)
 */
import { ref, computed, type Ref } from 'vue'

export interface UseModalOptions<T = any> {
    /**
     * Callback executado ao abrir o modal
     */
    onOpen?: (data?: T) => void | Promise<void>

    /**
     * Callback executado ao fechar o modal
     */
    onClose?: (data?: T) => void | Promise<void>

    /**
     * Estado inicial (aberto/fechado)
     */
    defaultOpen?: boolean

    /**
     * Se true, previne fechamento durante loading
     */
    preventCloseWhileLoading?: boolean
}

export interface UseModalReturn<T = any> {
    /**
     * Estado reativo do modal (true = aberto)
     */
    isOpen: Ref<boolean>

    /**
     * Estado de loading (para botões, etc)
     */
    isLoading: Ref<boolean>

    /**
     * Dados de contexto do modal
     */
    data: Ref<T | null>

    /**
     * Abre o modal
     */
    open: (contextData?: T) => Promise<void>

    /**
     * Fecha o modal
     */
    close: () => Promise<void>

    /**
     * Toggle do estado
     */
    toggle: () => Promise<void>

    /**
     * Inicia loading state
     */
    startLoading: () => void

    /**
     * Para loading state
     */
    stopLoading: () => void

    /**
     * Computed que indica se pode fechar
     */
    canClose: Ref<boolean>
}

/**
 * Hook para gerenciar estado de modais
 */
export function useModal<T = any>(
    options: UseModalOptions<T> = {}
): UseModalReturn<T> {
    const {
        onOpen,
        onClose,
        defaultOpen = false,
        preventCloseWhileLoading = true
    } = options

    // Estado reativo
    const isOpen = ref(defaultOpen)
    const isLoading = ref(false)
    const data = ref<T | null>(null)

    // Computed
    const canClose = computed(() => {
        if (preventCloseWhileLoading && isLoading.value) {
            return false
        }
        return true
    })

    // Métodos
    const startLoading = () => {
        isLoading.value = true
    }

    const stopLoading = () => {
        isLoading.value = false
    }

    const open = async (contextData?: T) => {
        if (isOpen.value) return

        // Definir dados de contexto
        data.value = contextData || null

        // Executar callback onOpen
        try {
            if (onOpen) {
                await onOpen(data.value)
            }
        } catch (error) {
            console.error('Erro no callback onOpen do modal:', error)
            // Não abrir o modal se o callback falhar
            return
        }

        // Abrir modal
        isOpen.value = true
    }

    const close = async () => {
        if (!isOpen.value || !canClose.value) return

        // Executar callback onClose
        try {
            if (onClose) {
                await onClose(data.value)
            }
        } catch (error) {
            console.error('Erro no callback onClose do modal:', error)
            // Continuar fechando mesmo com erro no callback
        }

        // Fechar modal e limpar estado
        isOpen.value = false
        data.value = null
        isLoading.value = false
    }

    const toggle = async () => {
        if (isOpen.value) {
            await close()
        } else {
            await open()
        }
    }

    return {
        isOpen,
        isLoading,
        data: data as Ref<T | null>,
        open,
        close,
        toggle,
        startLoading,
        stopLoading,
        canClose,
    }
}

// Hook especializado para modais de formulário
export interface UseFormModalOptions<T = any> extends UseModalOptions<T> {
    /**
     * Callback executado ao salvar com sucesso
     */
    onSaveSuccess?: (result: any) => void | Promise<void>

    /**
     * Callback executado em erro de salvamento
     */
    onSaveError?: (error: any) => void | Promise<void>

    /**
     * Reseta formulário ao fechar?
     */
    resetOnClose?: boolean
}

export function useFormModal<T = any>(
    options: UseFormModalOptions<T> = {}
): UseModalReturn<T> & {
    /**
     * Estado de salvamento
     */
    isSaving: Ref<boolean>

    /**
     * Inicia salvamento
     */
    startSaving: () => void

    /**
     * Para salvamento com sucesso
     */
    stopSaving: () => void

    /**
     * Salva e fecha modal
     */
    saveAndClose: (result?: any) => Promise<void>
} {
    const {
        onSaveSuccess,
        onSaveError,
        resetOnClose = true,
        ...modalOptions
    } = options

    const baseModal = useModal<T>(modalOptions)
    const isSaving = ref(false)

    const startSaving = () => {
        isSaving.value = true
        baseModal.startLoading()
    }

    const stopSaving = () => {
        isSaving.value = false
        baseModal.stopLoading()
    }

    const saveAndClose = async (result?: any) => {
        try {
            if (onSaveSuccess) {
                await onSaveSuccess(result)
            }
            await baseModal.close()
        } catch (error) {
            if (onSaveError) {
                await onSaveError(error)
            }
            throw error
        } finally {
            stopSaving()
        }
    }

    // Override close para resetar estado de saving
    const originalClose = baseModal.close
    const close = async () => {
        isSaving.value = false
        await originalClose()
    }

    return {
        isOpen: baseModal.isOpen,
        isLoading: baseModal.isLoading,
        data: baseModal.data,
        open: baseModal.open,
        toggle: baseModal.toggle,
        startLoading: baseModal.startLoading,
        stopLoading: baseModal.stopLoading,
        canClose: baseModal.canClose,
        close,
        isSaving,
        startSaving,
        stopSaving,
        saveAndClose,
    }
}

// Tipos para facilitar uso
export type ModalState<T = any> = UseModalReturn<T>
export type FormModalState<T = any> = ReturnType<typeof useFormModal<T>>