<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/utils'

type LegacyColumns = 'auto' | 2 | 4
type GridCols = 'responsive' | 'responsive2' | 'responsive3' | 'fixed2' | 'fixed3' | 'fixed4'

interface Props {
  columns?: LegacyColumns
  cols?: GridCols
  gap?: 'sm' | 'md' | 'lg'
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  columns: 'auto',
  cols: undefined,
  gap: 'md',
  class: undefined
})

const gapClass = computed(() => {
  const gaps = {
    sm: 'gap-3',
    md: 'gap-5',
    lg: 'gap-6'
  }
  return gaps[props.gap]
})

const columnClass = computed(() => {
  const colsMap: Record<GridCols, string> = {
    responsive: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    responsive2: 'grid-cols-1 md:grid-cols-2',
    responsive3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    fixed2: 'grid-cols-2',
    fixed3: 'grid-cols-3',
    fixed4: 'grid-cols-4',
  }

  if (props.cols) {
    return colsMap[props.cols]
  }

  const legacyColumnsMap: Record<LegacyColumns, string> = {
    auto: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    2: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  }

  return legacyColumnsMap[props.columns]
})

const containerClass = computed(() =>
  cn(
    'grid w-full',
    columnClass.value,
    gapClass.value,
    props.class
  )
)
</script>

<template>
  <div :class="containerClass">
    <slot />
  </div>
</template>
