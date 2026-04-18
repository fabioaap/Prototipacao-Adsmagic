import { ref, type Ref } from 'vue'

interface AlertOptions {
    title?: string
    description?: string
    confirmText?: string
    variant?: 'warning' | 'destructive' | 'info'
}

interface PromptOptions {
    title?: string
    description?: string
    placeholder?: string
    initialValue?: string
    confirmText?: string
    cancelText?: string
    inputType?: 'text' | 'email' | 'password'
    required?: boolean
}

interface AlertDialog {
    isOpen: Ref<boolean>
    title: Ref<string>
    description: Ref<string>
    confirmText: Ref<string>
    variant: Ref<'warning' | 'destructive' | 'info'>
    resolve: Ref<(() => void) | null>
    alert: (options?: AlertOptions) => Promise<void>
    handleConfirm: () => void
}

interface PromptDialog {
    isOpen: Ref<boolean>
    title: Ref<string>
    description: Ref<string>
    placeholder: Ref<string>
    inputValue: Ref<string>
    confirmText: Ref<string>
    cancelText: Ref<string>
    inputType: Ref<'text' | 'email' | 'password'>
    required: Ref<boolean>
    resolve: Ref<((value: string | null) => void) | null>
    prompt: (options?: PromptOptions) => Promise<string | null>
    handleConfirm: () => void
    handleCancel: () => void
}

/**
 * Composable para exibir dialogs de alerta customizados
 * Substitui window.alert() com componente estilizado do design system
 */
export const useAlertDialog = (): AlertDialog => {
    const isOpen = ref(false)
    const title = ref('')
    const description = ref('')
    const confirmText = ref('OK')
    const variant = ref<'warning' | 'destructive' | 'info'>('info')
    const resolve = ref<(() => void) | null>(null)

    const alert = (options: AlertOptions = {}): Promise<void> => {
        return new Promise<void>((resolvePromise) => {
            // Configure dialog
            title.value = options.title || 'Atenção'
            description.value = options.description || ''
            confirmText.value = options.confirmText || 'OK'
            variant.value = options.variant || 'info'

            // Store resolver
            resolve.value = resolvePromise

            // Show dialog
            isOpen.value = true
        })
    }

    const handleConfirm = () => {
        isOpen.value = false
        resolve.value?.()
        resolve.value = null
    }

    return {
        isOpen,
        title,
        description,
        confirmText,
        variant,
        resolve,
        alert,
        handleConfirm,
    }
}

/**
 * Composable para exibir dialogs de prompt customizados
 * Substitui window.prompt() com componente estilizado do design system
 */
export const usePromptDialog = (): PromptDialog => {
    const isOpen = ref(false)
    const title = ref('')
    const description = ref('')
    const placeholder = ref('')
    const inputValue = ref('')
    const confirmText = ref('OK')
    const cancelText = ref('Cancelar')
    const inputType = ref<'text' | 'email' | 'password'>('text')
    const required = ref(false)
    const resolve = ref<((value: string | null) => void) | null>(null)

    const prompt = (options: PromptOptions = {}): Promise<string | null> => {
        return new Promise<string | null>((resolvePromise) => {
            // Configure dialog
            title.value = options.title || 'Digite o valor'
            description.value = options.description || ''
            placeholder.value = options.placeholder || ''
            inputValue.value = options.initialValue || ''
            confirmText.value = options.confirmText || 'OK'
            cancelText.value = options.cancelText || 'Cancelar'
            inputType.value = options.inputType || 'text'
            required.value = options.required || false

            // Store resolver
            resolve.value = resolvePromise

            // Show dialog
            isOpen.value = true
        })
    }

    const handleConfirm = () => {
        if (required.value && !inputValue.value.trim()) {
            return // Don't close if required field is empty
        }

        isOpen.value = false
        resolve.value?.(inputValue.value || null)
        resolve.value = null
        inputValue.value = ''
    }

    const handleCancel = () => {
        isOpen.value = false
        resolve.value?.(null)
        resolve.value = null
        inputValue.value = ''
    }

    return {
        isOpen,
        title,
        description,
        placeholder,
        inputValue,
        confirmText,
        cancelText,
        inputType,
        required,
        resolve,
        prompt,
        handleConfirm,
        handleCancel,
    }
}