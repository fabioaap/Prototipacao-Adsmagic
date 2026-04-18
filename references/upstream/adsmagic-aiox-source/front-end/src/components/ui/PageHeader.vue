<!-- 
PageHeader.vue
Componente de cabeçalho padronizado para páginas seguindo o design system
-->
<script setup lang="ts">
import { computed, useSlots } from 'vue'

interface Props {
  title: string
  description?: string
  level?: 'h1' | 'h2' | 'h3'
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'page'
  withDivider?: boolean
  className?: string
}

const props = withDefaults(defineProps<Props>(), {
  level: 'h1',
  size: 'page',
  withDivider: false
})

const slots = useSlots()

// Classes do design system para títulos padronizados
const titleClasses = {
  page: {
    h1: 'text-2xl sm:text-3xl font-semibold tracking-tight text-foreground',
    h2: 'text-xl sm:text-2xl font-semibold tracking-tight text-foreground',
    h3: 'text-lg sm:text-xl font-medium text-foreground'
  },
  sm: {
    h1: 'text-lg font-semibold tracking-tight text-foreground',
    h2: 'text-base font-semibold text-foreground',
    h3: 'text-sm font-medium text-foreground'
  },
  md: {
    h1: 'text-xl font-semibold tracking-tight text-foreground',
    h2: 'text-lg font-semibold text-foreground',
    h3: 'text-base font-medium text-foreground'
  },
  lg: {
    h1: 'text-2xl font-semibold tracking-tight text-foreground',
    h2: 'text-xl font-semibold text-foreground',
    h3: 'text-lg font-medium text-foreground'
  },
  xl: {
    h1: 'text-3xl font-semibold tracking-tight text-foreground',
    h2: 'text-2xl font-semibold text-foreground',
    h3: 'text-xl font-medium text-foreground'
  }
}

// Classe unificada para descrição
const descriptionClasses = 'text-sm text-muted-foreground leading-relaxed'
const hasActions = computed(() => Boolean(slots.actions))
const hasTitleSlot = computed(() => Boolean(slots.title))

// Classe dinâmica baseada nos props
const titleClass = computed(() => {
  const base = titleClasses[props.size][props.level]
  return props.className ? `${base} ${props.className}` : base
})
</script>

<template>
  <div class="space-y-2">
    <div :class="hasActions ? 'page-header-section !mb-0' : 'space-y-2'">
      <div class="page-header-content">
        <component :is="level" :class="titleClass">
          <span v-if="hasTitleSlot" class="inline-flex items-center gap-3">
            <slot name="title" />
          </span>
          <template v-else>
            {{ title }}
          </template>
        </component>
        <p
          v-if="description"
          :class="descriptionClasses"
        >
          {{ description }}
        </p>
      </div>
      <div v-if="hasActions" class="page-actions">
        <slot name="actions" />
      </div>
    </div>
    <slot />
    <hr 
      v-if="withDivider" 
      class="border-border mt-4"
    />
  </div>
</template>
