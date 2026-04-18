<script setup lang="ts">
import { watch, onMounted, onUnmounted, ref, nextTick } from 'vue'
import { HelpCircle } from 'lucide-vue-next'
import { cn } from '@/lib/utils'
import Button from './Button.vue'

interface PromptDialogProps {
  modelValue: boolean
  title?: string
  description?: string
  placeholder?: string
  confirmText?: string
  cancelText?: string
  inputType?: 'text' | 'email' | 'password'
  required?: boolean
}

const props = withDefaults(defineProps<PromptDialogProps>(), {
  modelValue: false,
  confirmText: 'OK',
  cancelText: 'Cancelar',
  inputType: 'text',
  required: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: [value: string]
  cancel: []
}>()

const inputValue = ref('')
const inputRef = ref<HTMLInputElement>()

const handleCancel = () => {
  emit('update:modelValue', false)
  emit('cancel')
  inputValue.value = ''
}

const handleConfirm = () => {
  if (props.required && !inputValue.value.trim()) {
    inputRef.value?.focus()
    return
  }
  
  emit('confirm', inputValue.value)
  emit('update:modelValue', false)
  inputValue.value = ''
}

const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.modelValue) {
    handleCancel()
  }
}

const handleEnter = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    handleConfirm()
  }
}

// Lock body scroll when dialog is open and focus input
watch(() => props.modelValue, async (isOpen) => {
  if (isOpen) {
    document.body.style.overflow = 'hidden'
    await nextTick()
    inputRef.value?.focus()
  } else {
    document.body.style.overflow = ''
  }
})

onMounted(() => {
  document.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape)
  document.body.style.overflow = ''
})

const dialogClass = cn(
  'relative bg-card text-card-foreground rounded-lg shadow-lg',
  'border',
  'w-full max-w-md'
)
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
        @click="handleCancel"
      >
        <div class="fixed inset-0 flex items-center justify-center p-4">
          <Transition
            enter-active-class="transition-all duration-200"
            enter-from-class="opacity-0 scale-95"
            enter-to-class="opacity-100 scale-100"
            leave-active-class="transition-all duration-200"
            leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-95"
          >
            <div
              v-if="modelValue"
              :class="dialogClass"
              role="dialog"
              aria-modal="true"
              :aria-labelledby="title ? 'prompt-dialog-title' : undefined"
              :aria-describedby="description ? 'prompt-dialog-description' : undefined"
              @click.stop
            >
              <!-- Content -->
              <div class="p-6">
                <div class="flex items-start gap-4">
                  <!-- Icon -->
                  <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-info/10">
                    <HelpCircle class="h-5 w-5 text-info" />
                  </div>

                  <!-- Text Content -->
                  <div class="flex-1 space-y-4">
                    <div class="space-y-2">
                      <h2
                        v-if="title"
                        id="prompt-dialog-title"
                        class="text-lg font-semibold leading-none tracking-tight"
                      >
                        {{ title }}
                      </h2>
                      <p
                        v-if="description"
                        id="prompt-dialog-description"
                        class="text-sm text-muted-foreground"
                      >
                        {{ description }}
                      </p>
                    </div>
                    
                    <!-- Input -->
                    <div class="space-y-2">
                      <input
                        ref="inputRef"
                        v-model="inputValue"
                        :type="inputType"
                        :placeholder="placeholder"
                        :required="required"
                        class="w-full px-3 py-2 text-sm border border-border rounded-control bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        @keydown="handleEnter"
                      />
                      <p v-if="required" class="text-xs text-muted-foreground">
                        * Campo obrigatório
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Footer -->
              <div class="flex items-center justify-end gap-2 p-6 border-t">
                <Button
                  variant="outline"
                  @click="handleCancel"
                >
                  {{ cancelText }}
                </Button>
                <Button
                  variant="default"
                  @click="handleConfirm"
                >
                  {{ confirmText }}
                </Button>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>