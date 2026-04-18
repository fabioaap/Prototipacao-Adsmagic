<script setup lang="ts">
/**
 * @deprecated Use Modal.vue instead. This component will be removed in Phase 3.
 * 
 * Migration guide:
 * ```diff
 * - <ModalV2 :open="isOpen" @close="isOpen = false" className="custom">
 * + <Modal v-model="isOpen" title="Title" :class="custom">
 * ```
 * 
 * See specs/005-design-system-consolidation/quickstart.md for details.
 * 
 * ModalV2.vue
 * 
 * Componente de modal padronizado seguindo design system
 * Combina melhor do Modal.vue e Dialog.vue existentes
 * 
 * Features:
 * - Suporte completo a v-model
 * - Acessibilidade (ARIA, focus trap, ESC)
 * - Lock de scroll
 * - Animações suaves
 * - Responsivo (fullscreen em mobile)
 * - Tamanhos padronizados
 * - Slots para header, body e footer customizados
 */
import { computed, watch, onMounted, onUnmounted, nextTick, ref } from 'vue'
import { X } from 'lucide-vue-next'
import { cn } from '@/lib/utils'
import Button from './Button.vue'

interface ModalProps {
  /**
   * Controla abertura do modal (v-model)
   */
  modelValue?: boolean
  /**
   * Título do modal
   */
  title?: string
  /**
   * Descrição/subtítulo do modal
   */
  description?: string
  /**
   * Tamanho do modal
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  /**
   * Se true, não permite fechar clicando fora ou ESC
   */
  persistent?: boolean
  /**
   * Se true, mostra botão X de fechar
   */
  showCloseButton?: boolean
  /**
   * Se true, permite fechar clicando no overlay
   */
  closeOnOverlayClick?: boolean
  /**
   * Se true, remove padding do body (para conteúdo customizado)
   */
  noPadding?: boolean
  /**
   * Classe CSS adicional para o container
   */
  containerClass?: string
  /**
   * Z-index do modal
   */
  zIndex?: number
}

const props = withDefaults(defineProps<ModalProps>(), {
  modelValue: false,
  size: 'md',
  persistent: false,
  showCloseButton: true,
  closeOnOverlayClick: true,
  noPadding: false,
  zIndex: 50,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'open': []
  'close': []
  'opened': []
  'closed': []
}>()

// Refs para focus management
const modalRef = ref<HTMLElement>()
const previousActiveElement = ref<Element | null>(null)

// Size classes seguindo design system
const sizeClasses = {
  xs: 'max-w-xs',
  sm: 'max-w-sm', 
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  full: 'max-w-[calc(100vw-2rem)]',
}

// Computed classes
const overlayClasses = computed(() => cn(
  'fixed inset-0 bg-black/50 backdrop-blur-sm',
  'flex items-center justify-center p-4',
  'transition-opacity duration-300 ease-out'
))

const containerClasses = computed(() => cn(
  // Base styles
  'relative bg-background shadow-2xl w-full',
  'border border-border',
  'transition-all duration-300 ease-out',
  // Mobile: fullscreen, Desktop: rounded
  'sm:rounded-lg',
  // Size
  sizeClasses[props.size],
  // Custom class
  props.containerClass
))

const headerClasses = computed(() => cn(
  'flex items-start justify-between',
  'p-6 pb-4',
  'border-b border-border'
))

const bodyClasses = computed(() => cn(
  props.noPadding ? '' : 'p-6'
))

const closeButtonClasses = computed(() => cn(
  'rounded-control p-2',
  'text-muted-foreground hover:text-foreground',
  'hover:bg-muted transition-colors',
  'focus:outline-none focus:ring-2 focus:ring-ring'
))

// Methods
const close = () => {
  if (!props.persistent) {
    emit('update:modelValue', false)
    emit('close')
  }
}

const handleOverlayClick = () => {
  if (props.closeOnOverlayClick) {
    close()
  }
}

const handleEscapeKey = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.modelValue && !props.persistent) {
    close()
  }
}

// Focus management
const trapFocus = (event: KeyboardEvent) => {
  if (!modalRef.value || event.key !== 'Tab') return

  const focusableElements = modalRef.value.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )
  const firstElement = focusableElements[0] as HTMLElement
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

  if (!firstElement) return

  if (event.shiftKey && document.activeElement === firstElement) {
    event.preventDefault()
    lastElement?.focus()
  } else if (!event.shiftKey && document.activeElement === lastElement) {
    event.preventDefault()
    firstElement?.focus()
  }
}

// Lifecycle
watch(() => props.modelValue, async (isOpen, wasOpen) => {
  if (isOpen && !wasOpen) {
    // Opening
    emit('open')
    previousActiveElement.value = document.activeElement
    document.body.style.overflow = 'hidden'
    
    await nextTick()
    
    // Focus no primeiro elemento focável ou no container
    const firstFocusable = modalRef.value?.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as HTMLElement
    
    if (firstFocusable) {
      firstFocusable.focus()
    } else {
      modalRef.value?.focus()
    }
    
    emit('opened')
  } else if (!isOpen && wasOpen) {
    // Closing
    emit('close')
    document.body.style.overflow = ''
    
    // Restaurar foco anterior
    if (previousActiveElement.value instanceof HTMLElement) {
      previousActiveElement.value.focus()
    }
    
    emit('closed')
  }
})

onMounted(() => {
  document.addEventListener('keydown', handleEscapeKey)
  document.addEventListener('keydown', trapFocus)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscapeKey)
  document.removeEventListener('keydown', trapFocus)
  document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <Transition
      name="modal-overlay"
      @enter="emit('open')"
      @leave="emit('close')"
      @after-leave="emit('closed')"
    >
      <div
        v-if="modelValue"
        :class="overlayClasses"
        :style="{ zIndex }"
        @click="handleOverlayClick"
      >
        <Transition name="modal-content">
          <div
            v-if="modelValue"
            ref="modalRef"
            :class="containerClasses"
            tabindex="-1"
            role="dialog"
            :aria-modal="true"
            :aria-labelledby="title ? 'modal-title' : undefined"
            :aria-describedby="description ? 'modal-description' : undefined"
            @click.stop
          >
            <!-- Header -->
            <header
              v-if="title || description || showCloseButton || $slots.header"
              :class="headerClasses"
            >
              <div class="flex-1 min-w-0">
                <!-- Custom header slot ou título padrão -->
                <slot name="header">
                  <h2
                    v-if="title"
                    id="modal-title"
                    class="text-lg font-semibold leading-6 text-foreground"
                  >
                    {{ title }}
                  </h2>
                  <p
                    v-if="description"
                    id="modal-description"
                    class="mt-1 text-sm text-muted-foreground"
                  >
                    {{ description }}
                  </p>
                </slot>
              </div>

              <!-- Close button -->
              <Button
                v-if="showCloseButton"
                variant="ghost"
                size="sm"
                :class="closeButtonClasses"
                @click="close"
                aria-label="Fechar modal"
              >
                <X class="h-4 w-4" />
              </Button>
            </header>

            <!-- Body -->
            <main :class="bodyClasses">
              <slot />
            </main>

            <!-- Footer -->
            <footer
              v-if="$slots.footer"
              class="flex items-center justify-end gap-3 p-6 pt-4 border-t border-border"
            >
              <slot name="footer" />
            </footer>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* Overlay animations */
.modal-overlay-enter-active {
  transition: opacity 300ms ease-out;
}

.modal-overlay-leave-active {
  transition: opacity 200ms ease-in;
}

.modal-overlay-enter-from,
.modal-overlay-leave-to {
  opacity: 0;
}

/* Content animations */
.modal-content-enter-active {
  transition: all 300ms ease-out;
}

.modal-content-leave-active {
  transition: all 200ms ease-in;
}

.modal-content-enter-from {
  opacity: 0;
  transform: scale(0.95) translateY(-20px);
}

.modal-content-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(10px);
}
</style>