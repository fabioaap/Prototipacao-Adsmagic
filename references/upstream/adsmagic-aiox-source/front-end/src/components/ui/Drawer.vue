<script setup lang="ts">
import { computed, watch, onMounted, onUnmounted } from 'vue'
import { X } from 'lucide-vue-next'
import { cn } from '@/lib/utils'
import Button from './Button.vue'

interface DrawerProps {
  /**
   * Controla a abertura do drawer
   */
  open: boolean
  /**
   * Título do drawer
   */
  title?: string
  /**
   * Descrição do drawer
   */
  description?: string
  /**
   * Se true, não permite fechar clicando no overlay
   */
  persistent?: boolean
  /**
   * Se true, não permite fechar com ESC
   */
  preventEscape?: boolean
  /**
   * Tamanho do drawer
   */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

const props = withDefaults(defineProps<DrawerProps>(), {
  persistent: false,
  preventEscape: false,
  size: 'md',
})

const emit = defineEmits<{
  'update:open': [value: boolean]
  close: []
}>()

const handleClose = () => {
  emit('update:open', false)
  emit('close')
}

const handleOverlayClick = (event: MouseEvent) => {
  if (!props.persistent && event.target === event.currentTarget) {
    handleClose()
  }
}

const handleEscape = (event: KeyboardEvent) => {
  if (!props.preventEscape && event.key === 'Escape' && props.open) {
    handleClose()
  }
}

// Lock body scroll when drawer is open
watch(() => props.open, (isOpen) => {
  if (isOpen) {
    document.body.style.overflow = 'hidden'
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

const sizeClasses = computed(() => {
  const sizes = {
    sm: 'sm:w-[24rem]',
    md: 'sm:w-[28rem]',
    lg: 'sm:w-[32rem]',
    xl: 'sm:w-[36rem]',
    full: 'sm:w-full',
  }
  return sizes[props.size]
})

const drawerClass = cn(
  'fixed right-0 top-0 h-full bg-card text-card-foreground shadow-lg',
  'transform transition-transform duration-200 ease-in-out',
  'flex flex-col',
  // Fullscreen em mobile, largura fixa em desktop
  'w-full sm:border-l',
  sizeClasses.value
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
        v-if="open"
        class="fixed inset-0 z-50 bg-black/50"
        @click="handleOverlayClick"
      >
        <Transition
          appear
          enter-active-class="transition-transform duration-200 ease-in-out"
          enter-from-class="translate-x-full"
          enter-to-class="translate-x-0"
          leave-active-class="transition-transform duration-200 ease-in-out"
          leave-from-class="translate-x-0"
          leave-to-class="translate-x-full"
        >
          <div
            :class="drawerClass"
            role="dialog"
            aria-modal="true"
            :aria-labelledby="title ? 'drawer-title' : undefined"
            :aria-describedby="description ? 'drawer-description' : undefined"
          >
            <!-- Header -->
            <div v-if="title || description || $slots.header" class="border-b p-4 sm:p-6">
              <slot v-if="$slots.header" name="header" :close="handleClose" />
              <div v-else class="flex items-start justify-between gap-4">
                <div class="min-w-0">
                  <h2
                    v-if="title"
                    id="drawer-title"
                    class="section-title-sm"
                  >
                    {{ title }}
                  </h2>
                  <p
                    v-if="description"
                    id="drawer-description"
                    class="mt-1 text-sm text-muted-foreground"
                  >
                    {{ description }}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label="Fechar"
                  @click="handleClose"
                >
                  <X class="h-4 w-4" />
                </Button>
              </div>
            </div>

            <!-- Content -->
            <div class="flex-1 overflow-y-auto">
              <slot name="content" />
            </div>

            <!-- Footer -->
            <div v-if="$slots.footer" class="border-t p-4 sm:p-6">
              <slot name="footer" />
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
