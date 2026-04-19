<script setup lang="ts">
import { computed, onMounted, onUnmounted, watch } from 'vue'
import { X } from 'lucide-vue-next'
import { cn } from '@/lib/utils'

interface Props {
  modelValue?: boolean
  open?: boolean
  title?: string
  description?: string
  showClose?: boolean
  showCloseButton?: boolean
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  persistent?: boolean
  closeOnClickOutside?: boolean
  closeOnOverlayClick?: boolean
  closeOnEscape?: boolean
  noPadding?: boolean
  disablePortal?: boolean
  portalTarget?: string
  zIndex?: number
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  open: undefined,
  title: '',
  description: '',
  showClose: true,
  showCloseButton: undefined,
  size: 'md',
  persistent: false,
  closeOnClickOutside: true,
  closeOnOverlayClick: undefined,
  closeOnEscape: true,
  noPadding: false,
  disablePortal: false,
  portalTarget: 'body',
  zIndex: 50,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'update:open': [value: boolean]
  close: []
}>()

const isOpen = computed(() => Boolean(props.open !== undefined ? props.open : props.modelValue))

const shouldShowCloseButton = computed(() => {
  return props.showCloseButton !== undefined ? props.showCloseButton : props.showClose
})

const shouldCloseOnBackdrop = computed(() => {
  if (props.closeOnOverlayClick !== undefined) {
    return props.closeOnOverlayClick
  }
  return props.closeOnClickOutside
})

const sizeClasses = computed(() => {
  const sizes = {
    xs: 'max-w-xs',
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-[calc(100vw-2rem)]',
  }

  return sizes[props.size]
})

const contentClasses = computed(() => {
  return cn(
    'relative bg-background text-foreground shadow-2xl w-full border border-border',
    'sm:rounded-lg',
    sizeClasses.value
  )
})

const close = () => {
  if (props.persistent) return

  emit('update:modelValue', false)
  emit('update:open', false)
  emit('close')
}

const handleBackdropClick = (event: MouseEvent) => {
  if (!shouldCloseOnBackdrop.value) return
  if (event.target !== event.currentTarget) return
  close()
}

const handleEscape = (event: KeyboardEvent) => {
  if (event.key !== 'Escape') return
  if (!props.closeOnEscape || !isOpen.value || props.persistent) return
  close()
}

watch(isOpen, (open) => {
  if (typeof document === 'undefined') return
  document.body.style.overflow = open ? 'hidden' : ''
})

onMounted(() => {
  if (typeof document !== 'undefined') {
    document.addEventListener('keydown', handleEscape)
  }
})

onUnmounted(() => {
  if (typeof document !== 'undefined') {
    document.removeEventListener('keydown', handleEscape)
    document.body.style.overflow = ''
  }
})
</script>

<template>
  <div v-if="disablePortal">
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-0 sm:p-4"
        :style="{ zIndex }"
        @click="handleBackdropClick"
      >
        <Transition
          enter-active-class="transition-all duration-200"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition-all duration-200"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-if="isOpen"
            :class="contentClasses"
            role="dialog"
            aria-modal="true"
            :aria-labelledby="title ? 'modal-title' : undefined"
            :aria-describedby="description ? 'modal-description' : undefined"
            @click.stop
          >
            <div
              v-if="title || description || $slots.header || shouldShowCloseButton"
              class="flex items-start justify-between p-4 sm:p-6 border-b border-border"
            >
              <div class="flex-1 min-w-0">
                <slot name="header">
                  <h2 v-if="title" id="modal-title" class="text-lg font-semibold leading-none tracking-tight">
                    {{ title }}
                  </h2>
                  <p v-if="description" id="modal-description" class="text-sm text-muted-foreground mt-2">
                    {{ description }}
                  </p>
                </slot>
              </div>

              <button
                v-if="shouldShowCloseButton"
                type="button"
                class="ml-4 rounded-control opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                @click="close"
              >
                <X class="h-4 w-4" />
                <span class="sr-only">Close</span>
              </button>
            </div>

            <div :class="props.noPadding ? '' : 'p-4 sm:p-6'">
              <slot name="content">
                <slot />
              </slot>
            </div>

            <div v-if="$slots.footer" class="flex items-center justify-end gap-2 p-4 sm:p-6 border-t border-border">
              <slot name="footer" />
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </div>

  <Teleport v-else :to="portalTarget">
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-0 sm:p-4"
        :style="{ zIndex }"
        @click="handleBackdropClick"
      >
        <Transition
          enter-active-class="transition-all duration-200"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition-all duration-200"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-if="isOpen"
            :class="contentClasses"
            role="dialog"
            aria-modal="true"
            :aria-labelledby="title ? 'modal-title' : undefined"
            :aria-describedby="description ? 'modal-description' : undefined"
            @click.stop
          >
            <div
              v-if="title || description || $slots.header || shouldShowCloseButton"
              class="flex items-start justify-between p-4 sm:p-6 border-b border-border"
            >
              <div class="flex-1 min-w-0">
                <slot name="header">
                  <h2 v-if="title" id="modal-title" class="text-lg font-semibold leading-none tracking-tight">
                    {{ title }}
                  </h2>
                  <p v-if="description" id="modal-description" class="text-sm text-muted-foreground mt-2">
                    {{ description }}
                  </p>
                </slot>
              </div>

              <button
                v-if="shouldShowCloseButton"
                type="button"
                class="ml-4 rounded-control opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                @click="close"
              >
                <X class="h-4 w-4" />
                <span class="sr-only">Close</span>
              </button>
            </div>

            <div :class="props.noPadding ? '' : 'p-4 sm:p-6'">
              <slot name="content">
                <slot />
              </slot>
            </div>

            <div v-if="$slots.footer" class="flex items-center justify-end gap-2 p-4 sm:p-6 border-t border-border">
              <slot name="footer" />
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
