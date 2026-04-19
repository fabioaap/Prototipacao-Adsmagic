<script setup lang="ts">
import { inject, computed, watch, onMounted, onUnmounted } from 'vue'
import { cn } from '@/lib/utils'

interface Props {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const props = withDefaults(defineProps<Props>(), {
  open: false
})

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const commandContext = inject<any>('command-context', {})

// Detect test environment to avoid Teleport issues
const isTestEnv = computed(() => {
  return typeof global !== 'undefined' && global.process?.env?.NODE_ENV === 'test' ||
         typeof process !== 'undefined' && process.env?.NODE_ENV === 'test' ||
         typeof window !== 'undefined' && (window as any).__VUE_TEST__ ||
         import.meta.env?.MODE === 'test'
})

const isOpen = computed({
  get: () => props.open,
  set: (value) => {
    emit('update:open', value)
    if (commandContext.setDialogMode) {
      commandContext.setDialogMode(value)
    }
  }
})

// Set dialog mode when mounted
onMounted(() => {
  if (commandContext.setDialogMode) {
    commandContext.setDialogMode(true)
  }
})

// Handle ESC key
const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isOpen.value) {
    isOpen.value = false
  }
}

watch(() => props.open, (open) => {
  if (open) {
    document.addEventListener('keydown', handleEscape)
  } else {
    document.removeEventListener('keydown', handleEscape)
  }
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape)
})
</script>

<template>
  <!-- Use Teleport only in non-test environment to avoid test DOM issues -->
  <Teleport v-if="!isTestEnv" to="body">
    <div 
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      @click.self="isOpen = false"
    >
      <div
        :class="cn('mx-auto max-w-lg overflow-hidden rounded-lg bg-background p-0 shadow-lg animate-in fade-in-90 slide-in-from-bottom-10 duration-200')"
        role="dialog"
        aria-modal="true"
      >
        <slot />
      </div>
    </div>
  </Teleport>
  <!-- In test env, render directly without Teleport -->
  <div v-else-if="isOpen" 
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    @click.self="isOpen = false"
  >
    <div
      :class="cn('mx-auto max-w-lg overflow-hidden rounded-lg bg-background p-0 shadow-lg animate-in fade-in-90 slide-in-from-bottom-10 duration-200')"
      role="dialog"
      aria-modal="true"
    >
      <slot />
    </div>
  </div>
</template>