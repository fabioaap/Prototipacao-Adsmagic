<script setup lang="ts">
import { ArrowRight } from 'lucide-vue-next'
import type { Component } from 'vue'
import { cn } from '@/lib/utils'

export interface BrandFlowStep {
  label: string
  description: string
  icon?: Component
  badge?: string
}

interface Props {
  steps: BrandFlowStep[]
  variant?: 'compact' | 'full'
  tone?: 'dark' | 'light'
  columns?: 2 | 3 | 4
  showArrows?: boolean
  iconSize?: number
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'compact',
  tone: 'dark',
  columns: 3,
  showArrows: true,
  iconSize: 18,
})

function columnsClass(columns: 2 | 3 | 4) {
  return {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-4',
  }[columns]
}
</script>

<template>
  <div class="grid gap-3" :class="columnsClass(props.columns)">
    <article
      v-for="(step, index) in props.steps"
      :key="`${step.label}-${index}`"
      :class="cn(
        'relative rounded-2xl border',
        props.variant === 'compact' ? 'p-3.5' : 'p-5',
        props.tone === 'dark'
          ? 'border-primary/15 bg-primary/5 text-white'
          : 'border-slate-900/10 bg-white/80 text-slate-950'
      )"
    >
      <div
        class="mb-3 flex items-center gap-2"
        :class="props.tone === 'dark' ? 'text-primary-300' : 'text-primary'"
      >
        <span
          v-if="step.badge"
          :class="cn(
            'inline-flex min-w-[2rem] items-center justify-center rounded-full border px-2 py-1 text-[11px] font-semibold tracking-[0.16em]',
            props.tone === 'dark'
              ? 'border-white/10 bg-white/6 text-white/70'
              : 'border-slate-900/10 bg-slate-900/5 text-slate-600'
          )"
        >
          {{ step.badge }}
        </span>
        <component :is="step.icon" v-if="step.icon" :size="props.iconSize" />
        <span
          :class="cn(
            props.variant === 'compact' ? 'text-[0.82rem]' : 'text-sm',
            'font-semibold',
            props.tone === 'dark' ? 'text-white' : 'text-slate-950'
          )"
        >
          {{ step.label }}
        </span>
      </div>

      <p
        :class="cn(
          props.variant === 'compact' ? 'text-[0.72rem] leading-5' : 'text-sm leading-6',
          'm-0',
          props.tone === 'dark' ? 'text-white/65' : 'text-slate-600'
        )"
      >
        {{ step.description }}
      </p>

      <ArrowRight
        v-if="props.showArrows && index < props.steps.length - 1"
        class="absolute -right-3 top-1/2 hidden h-4 w-4 -translate-y-1/2 md:block"
        :class="props.tone === 'dark' ? 'text-primary/40' : 'text-primary/30'"
      />
    </article>
  </div>
</template>