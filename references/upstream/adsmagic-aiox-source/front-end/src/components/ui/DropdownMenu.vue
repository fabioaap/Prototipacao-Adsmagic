<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick, provide } from 'vue'

interface Props {
  align?: 'left' | 'right'
}

const props = withDefaults(defineProps<Props>(), {
  align: 'right',
})

const open = ref(false)
const rootEl = ref<HTMLElement | null>(null)
const triggerEl = ref<HTMLElement | null>(null)
const menuEl = ref<HTMLElement | null>(null)
const menuStyle = ref<{ top: string; left: string; right?: string; bottom?: string }>({ top: '0px', left: '0px' })
const VIEWPORT_MARGIN = 8

function toggle() {
  open.value = !open.value
  if (open.value) {
    nextTick(() => updatePosition())
  }
}

function close() {
  open.value = false
}

// Providir a função close para componentes filhos
provide('dropdownClose', close)

// Expor a função close para que possa ser usada externamente
defineExpose({ close })

function updatePosition() {
  if (!triggerEl.value || !menuEl.value) return
  const rect = triggerEl.value.getBoundingClientRect()
  const menuWidth = menuEl.value.offsetWidth || 160
  const menuHeight = menuEl.value.offsetHeight || 250
  
  const spaceBelow = window.innerHeight - rect.bottom
  const spaceAbove = rect.top
  
  const openUpwards = spaceBelow < menuHeight && spaceAbove > spaceBelow
  const desiredLeft = props.align === 'right'
    ? rect.right - menuWidth
    : rect.left
  const clampedLeft = Math.min(
    Math.max(VIEWPORT_MARGIN, desiredLeft),
    Math.max(VIEWPORT_MARGIN, window.innerWidth - menuWidth - VIEWPORT_MARGIN)
  )
  const desiredTop = openUpwards
    ? rect.top - menuHeight - VIEWPORT_MARGIN
    : rect.bottom + VIEWPORT_MARGIN
  const clampedTop = Math.min(
    Math.max(VIEWPORT_MARGIN, desiredTop),
    Math.max(VIEWPORT_MARGIN, window.innerHeight - menuHeight - VIEWPORT_MARGIN)
  )
  
  menuStyle.value = {
    top: `${clampedTop}px`,
    left: `${clampedLeft}px`,
    right: 'auto',
    bottom: 'auto',
  }
}

function onClickOutside(e: MouseEvent) {
  if (!rootEl.value) return
  if (!rootEl.value.contains(e.target as Node)) open.value = false
}

onMounted(() => {
  document.addEventListener('mousedown', onClickOutside)
  window.addEventListener('scroll', updatePosition, true)
  window.addEventListener('resize', updatePosition)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', onClickOutside)
  window.removeEventListener('scroll', updatePosition, true)
  window.removeEventListener('resize', updatePosition)
})
</script>

<template>
  <div ref="rootEl" class="relative inline-block text-left">
    <div ref="triggerEl" @click="toggle">
      <slot name="trigger">Abrir</slot>
    </div>
    <!-- Removido Teleport para manter cadeia de eventos Vue funcionando -->
    <div
      v-if="open"
      ref="menuEl"
      class="fixed z-[60] min-w-[10rem] max-h-[80vh] overflow-y-auto rounded-control border bg-popover text-popover-foreground shadow-md"
      :style="menuStyle"
      role="menu"
    >
      <div class="py-1">
        <slot :close="close" />
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>


