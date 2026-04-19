<script setup lang="ts">
import { ArrowRight, Check } from 'lucide-vue-next'
import { computed } from 'vue'
import { cn } from '@/lib/utils'

interface Props {
  variant?: 'full' | 'compact'
  label?: string
  name?: string
  audience?: string
  price: string
  period?: string
  billingInfo?: string
  ctaLabel: string
  ctaHref?: string
  featured?: boolean
  badgeLabel?: string
  footnote?: string
  features?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'full',
  label: undefined,
  name: undefined,
  audience: undefined,
  period: '/mês',
  billingInfo: undefined,
  ctaHref: '#',
  featured: false,
  badgeLabel: 'Recomendado',
  footnote: undefined,
  features: () => [],
})

const isCompact = computed(() => props.variant === 'compact')
const ctaTag = computed(() => (props.ctaHref ? 'a' : 'button'))
</script>

<template>
  <article
    :class="cn(
      'relative overflow-hidden rounded-[24px] border text-foreground shadow-[0_22px_60px_rgba(1,5,67,0.18)]',
      'bg-[linear-gradient(180deg,rgba(8,12,40,0.95),rgba(6,10,32,0.92))] backdrop-blur-sm',
      isCompact ? 'w-full max-w-[320px] p-5' : 'min-h-[420px] p-6',
      props.featured ? 'border-primary/35 ring-1 ring-primary/20' : 'border-white/10',
    )"
  >
    <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.25),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(59,181,109,0.16),transparent_28%)]"></div>
    <div class="pointer-events-none absolute inset-x-8 top-0 h-px bg-white/12"></div>

    <div v-if="props.featured && !isCompact" class="absolute right-4 top-4 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-200">
      {{ props.badgeLabel }}
    </div>

    <div class="relative flex h-full flex-col" :class="isCompact ? 'gap-4' : 'gap-6'">
      <div class="space-y-3">
        <p v-if="props.label" class="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/55">
          {{ props.label }}
        </p>

        <div v-if="props.name || props.audience" class="space-y-2">
          <h3 v-if="props.name" :class="isCompact ? 'text-lg font-semibold text-white' : 'text-2xl font-semibold text-white'">
            {{ props.name }}
          </h3>
          <p v-if="props.audience" class="max-w-[28ch] text-sm leading-6 text-white/65">
            {{ props.audience }}
          </p>
        </div>

        <div class="flex items-end gap-1.5 text-white">
          <span class="text-base font-medium text-white/65">R$</span>
          <span :class="isCompact ? 'text-4xl font-semibold tracking-tight' : 'text-5xl font-semibold tracking-tight'">
            {{ props.price }}
          </span>
          <span class="pb-1 text-sm font-medium text-white/60">
            {{ props.period }}
          </span>
        </div>

        <p v-if="props.billingInfo" class="text-sm leading-6 text-white/62">
          {{ props.billingInfo }}
        </p>
      </div>

      <ul v-if="!isCompact && props.features.length" class="grid gap-2.5 text-sm text-white/78">
        <li v-for="feature in props.features" :key="feature" class="flex items-start gap-2.5 rounded-2xl border border-white/8 bg-white/5 px-3 py-2.5">
          <span class="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-300/12 text-emerald-200">
            <Check class="h-3.5 w-3.5" />
          </span>
          <span>{{ feature }}</span>
        </li>
      </ul>

      <div class="mt-auto space-y-3">
        <component
          :is="ctaTag"
          :href="ctaTag === 'a' ? props.ctaHref : undefined"
          :class="cn(
            'inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition',
            props.featured
              ? 'bg-[linear-gradient(135deg,#6366f1_0%,#4338ca_100%)] text-white shadow-[0_18px_36px_rgba(99,102,241,0.28)] hover:translate-y-[-1px]'
              : 'border border-white/12 bg-white/6 text-white hover:bg-white/10'
          )"
        >
          <span>{{ props.ctaLabel }}</span>
          <ArrowRight class="h-4 w-4" />
        </component>

        <p v-if="props.footnote" class="text-sm leading-6 text-white/55">
          {{ props.footnote }}
        </p>
      </div>
    </div>
  </article>
</template>