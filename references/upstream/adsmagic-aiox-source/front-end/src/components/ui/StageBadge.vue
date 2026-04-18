<script setup lang="ts">
import { computed } from 'vue'
import type { CSSProperties } from 'vue'
import { cn } from '@/lib/utils'
import type { Stage } from '@/types/models'

interface Props {
  stage?: Pick<Stage, 'name' | 'type' | 'color' | 'order'> | null
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  stage: null,
  size: 'md',
})

const sizeClasses: Record<NonNullable<Props['size']>, string> = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-xs px-3 py-1',
  lg: 'text-sm px-3 py-1',
}

const normalStagePalette = [
  'bg-sky-50 text-sky-700 border-sky-200',
  'bg-violet-50 text-violet-700 border-violet-200',
  'bg-amber-50 text-amber-700 border-amber-200',
  'bg-teal-50 text-teal-700 border-teal-200',
]

function isHexColor(value?: string | null): value is string {
  return Boolean(value && /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value.trim()))
}

function hexToRgb(hex: string): [number, number, number] {
  const normalized = hex.replace('#', '')
  const fullHex = normalized.length === 3
    ? normalized.split('').map((char) => char + char).join('')
    : normalized

  return [
    Number.parseInt(fullHex.slice(0, 2), 16),
    Number.parseInt(fullHex.slice(2, 4), 16),
    Number.parseInt(fullHex.slice(4, 6), 16),
  ]
}

function getReadableTextColor(hex: string): string {
  const [red, green, blue] = hexToRgb(hex)
  const luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255
  return luminance > 0.72 ? '#1f2937' : hex
}

const toneClasses = computed(() => {
  if (!props.stage) return 'bg-muted text-muted-foreground border-border/60'

  if (props.stage.type === 'sale') {
    return 'bg-success/10 text-success border-success/20'
  }

  if (props.stage.type === 'lost') {
    return 'bg-destructive/10 text-destructive border-destructive/20'
  }

  const order = props.stage.order ?? 0
  return normalStagePalette[order % normalStagePalette.length] ?? normalStagePalette[0]
})

const legacyColorClasses = computed(() => {
  const colorValue = props.stage?.color?.trim() ?? ''

  if (!colorValue || isHexColor(colorValue)) {
    return ''
  }

  if (/(^|\s)(bg-|text-|border-)/.test(colorValue)) {
    return colorValue
  }

  return ''
})

const customColorStyle = computed<CSSProperties | undefined>(() => {
  const colorValue = props.stage?.color?.trim()

  if (!isHexColor(colorValue)) {
    return undefined
  }

  const [red, green, blue] = hexToRgb(colorValue)

  return {
    backgroundColor: `rgba(${red}, ${green}, ${blue}, 0.12)`,
    borderColor: `rgba(${red}, ${green}, ${blue}, 0.24)`,
    color: getReadableTextColor(colorValue),
  }
})

const badgeClass = computed(() => cn(
  'inline-flex max-w-full items-center rounded-full border font-medium whitespace-nowrap transition-colors overflow-hidden',
  sizeClasses[props.size],
  legacyColorClasses.value || (!customColorStyle.value && toneClasses.value),
))
</script>

<template>
  <span
    v-if="stage"
    :class="badgeClass"
    :style="customColorStyle"
    :title="stage.name"
  >
    <span class="truncate">
      {{ stage.name }}
    </span>
  </span>
</template>