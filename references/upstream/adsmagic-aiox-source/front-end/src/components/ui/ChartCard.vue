<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/utils'

interface Props {
  title: string
  subtitle?: string
  loading?: boolean
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  subtitle: undefined,
  loading: false,
  class: undefined
})

const containerClass = computed(() =>
  cn(
    'bg-card text-card-foreground rounded-surface border border-border p-6 shadow-card',
    'hover:shadow-md transition-shadow duration-200',
    props.class
  )
)
</script>

<template>
  <div :class="containerClass">
    <!-- Header -->
    <div class="mb-6 pb-4 border-b border-border">
      <h3 class="text-base font-semibold text-foreground">
        {{ title }}
      </h3>
      <p v-if="subtitle" class="mt-1 text-xs text-muted-foreground">
        {{ subtitle }}
      </p>
    </div>

    <!-- Content -->
    <div v-if="!loading" class="min-h-[200px]">
      <slot />
    </div>

    <!-- Loading State -->
    <div v-else class="min-h-[200px] space-y-4">
      <div class="h-4 bg-muted rounded animate-pulse" />
      <div class="h-32 bg-muted rounded animate-pulse" />
      <div class="h-4 w-1/2 bg-muted rounded animate-pulse" />
    </div>
  </div>
</template>

<style scoped>
/* Sem estilos adicionais - Tailwind + CSS variables */
</style>
