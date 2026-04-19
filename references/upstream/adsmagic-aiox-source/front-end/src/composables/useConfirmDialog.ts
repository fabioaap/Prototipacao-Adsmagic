import { ref, type Ref } from 'vue'

interface ConfirmOptions {
    title?: string
    description?: string
    confirmText?: string
    cancelText?: string
    variant?: 'warning' | 'destructive'
}

interface ConfirmDialog {
    isOpen: Ref<boolean>
    title: Ref<string>
    description: Ref<string>
    confirmText: Ref<string>
    cancelText: Ref<string>
    variant: Ref<'warning' | 'destructive'>
    resolve: Ref<((value: boolean) => void) | null>
    confirm: (options?: ConfirmOptions) => Promise<boolean>
    handleConfirm: () => void
    handleCancel: () => void
}

/**
 * Composable para exibir dialogs de confirmação customizados
 * Substitui window.confirm() com componente estilizado do design system
 */
export const useConfirmDialog = (): ConfirmDialog => {
    const isOpen = ref(false)
    const title = ref('')
    const description = ref('')
    const confirmText = ref('Confirmar')
    const cancelText = ref('Cancelar')
    const variant = ref<'warning' | 'destructive'>('warning')
    const resolve = ref<((value: boolean) => void) | null>(null)

    const confirm = (options: ConfirmOptions = {}): Promise<boolean> => {
        return new Promise<boolean>((resolvePromise) => {
            // Configure dialog
            title.value = options.title || 'Confirmação'
            description.value = options.description || 'Tem certeza que deseja continuar?'
            confirmText.value = options.confirmText || 'Confirmar'
            cancelText.value = options.cancelText || 'Cancelar'
            variant.value = options.variant || 'warning'

            // Store resolver
            resolve.value = resolvePromise

            // Show dialog
            isOpen.value = true
        })
    }

    const handleConfirm = () => {
        isOpen.value = false
        resolve.value?.(true)
        resolve.value = null
    }

    const handleCancel = () => {
        isOpen.value = false
        resolve.value?.(false)
        resolve.value = null
    }

    return {
        isOpen,
        title,
        description,
        confirmText,
        cancelText,
        variant,
        resolve,
        confirm,
        handleConfirm,
        handleCancel,
    }
}