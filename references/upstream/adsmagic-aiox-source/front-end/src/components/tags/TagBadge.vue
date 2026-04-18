<script setup lang="ts">
/**
 * TagBadge Component
 *
 * Exibe uma tag como badge colorido.
 * Usado para mostrar tags associadas a contatos.
 *
 * @component
 */

import { computed } from 'vue'
import { X } from 'lucide-vue-next'
import { cn } from '@/lib/utils'
import type { Tag } from '@/types'

interface Props {
  /** Tag data */
  tag: Tag
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
  /** Whether to show remove button */
  removable?: boolean
  /** Whether the badge is clickable */
  clickable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  removable: false,
  clickable: false,
})

const emit = defineEmits<{
  remove: [tag: Tag]
  click: [tag: Tag]
}>()

/**
 * Calculate text color based on background for contrast
 */
function getContrastColor(hexColor: string): string {
  // Remove # if present
  const hex = hexColor.replace('#', '')
  
  // Parse RGB values
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  
  // Return white for dark colors, dark for light colors
  return luminance > 0.5 ? '#1f2937' : '#ffffff'
}

const textColor = computed(() => getContrastColor(props.tag.color))

const sizeClasses = computed(() => {
  const sizes = {
    sm: 'px-1.5 py-0.5 text-xs gap-1',
    md: 'px-2 py-1 text-sm gap-1.5',
    lg: 'px-3 py-1.5 text-base gap-2',
  }
  return sizes[props.size]
})

const iconSizeClasses = computed(() => {
  const sizes = {
    sm: 'h-3 w-3',
    md: 'h-3.5 w-3.5',
    lg: 'h-4 w-4',
  }
  return sizes[props.size]
})

function handleClick() {
  if (props.clickable) {
    emit('click', props.tag)
  }
}

function handleRemove(event: Event) {
  event.stopPropagation()
  emit('remove', props.tag)
}
</script>

<template>
  <span
    :class="cn(
      'inline-flex items-center rounded-full font-medium whitespace-nowrap',
      sizeClasses,
      clickable && 'cursor-pointer hover:opacity-80 transition-opacity',
    )"
    :style="{
      backgroundColor: tag.color,
      color: textColor,
    }"
    :role="clickable ? 'button' : undefined"
    :tabindex="clickable ? 0 : undefined"
    @click="handleClick"
    @keydown.enter="handleClick"
    @keydown.space.prevent="handleClick"
  >
    <span class="truncate max-w-[150px]">{{ tag.name }}</span>
    
    <button
      v-if="removable"
      type="button"
      :class="cn(
        'rounded-full p-0.5 hover:bg-black/20 transition-colors',
        iconSizeClasses,
      )"
      :aria-label="`Remover tag ${tag.name}`"
      @click="handleRemove"
    >
      <X class="h-full w-full" />
    </button>
  </span>
</template>
