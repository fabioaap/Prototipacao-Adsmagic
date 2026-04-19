<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/utils'

interface Props {
  title?: string
  subtitle?: string
  action?: string
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: undefined,
  subtitle: undefined,
  action: undefined,
  class: undefined
})

const containerClass = computed(() =>
  cn('space-y-4', props.class)
)
</script>

<template>
  <section :class="containerClass">
    <!-- Header -->
    <div v-if="title || subtitle || action" class="flex items-center justify-between">
      <div>
        <h2 v-if="title" class="section-title-sm">
          {{ title }}
        </h2>
        <p v-if="subtitle" class="section-description mt-1">
          {{ subtitle }}
        </p>
      </div>
      <div v-if="action" class="text-sm text-primary hover:text-primary/80 cursor-pointer font-medium">
        {{ action }}
      </div>
    </div>

    <!-- Content -->
    <slot />
  </section>
</template>

<style scoped>
/* Sem estilos adicionais */
</style>
