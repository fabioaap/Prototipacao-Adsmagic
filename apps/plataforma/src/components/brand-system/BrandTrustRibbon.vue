<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/utils'

type TrustRibbonTone = 'dark' | 'light'
type TrustRibbonSize = 'default' | 'compact'
type TrustRibbonLogoVariant = 'wide' | 'google'

export interface BrandTrustRibbonLogo {
  src: string
  alt: string
  variant?: TrustRibbonLogoVariant
}

interface Props {
  label?: string
  tone?: TrustRibbonTone
  size?: TrustRibbonSize
  logos?: BrandTrustRibbonLogo[]
  showDividers?: boolean
}

const base = import.meta.env.BASE_URL

const defaultLogos: BrandTrustRibbonLogo[] = [
  {
    src: `${base}img/landing/hero/logo-abstartups.png`,
    alt: 'Abstartups',
    variant: 'wide',
  },
  {
    src: `${base}img/landing/hero/logo-sebrae.png`,
    alt: 'Sebrae for Startups',
    variant: 'wide',
  },
  {
    src: `${base}img/landing/hero/logo-google.png`,
    alt: 'Google for Startups',
    variant: 'google',
  },
]

const props = withDefaults(defineProps<Props>(), {
  label: 'Apoiado por',
  tone: 'dark',
  size: 'default',
  showDividers: true,
})

const isDark = computed(() => props.tone === 'dark')
const isCompact = computed(() => props.size === 'compact')
const logos = computed(() => (props.logos?.length ? props.logos : defaultLogos))

function logoWrapClass(variant: TrustRibbonLogoVariant | undefined) {
  if (variant === 'google') {
    return isCompact.value
      ? 'w-[min(10rem,34vw)] min-h-[3.5rem] p-2'
      : 'w-[min(19.5625rem,28vw)] min-h-[6.5625rem] p-2.5'
  }

  return isCompact.value
    ? 'w-[min(9.75rem,34vw)]'
    : 'w-[min(19.5rem,28vw)]'
}
</script>

<template>
  <div class="flex flex-col items-center" :class="isCompact ? 'gap-4' : 'gap-7'">
    <p
      class="text-center font-medium tracking-[0.01em]"
      :class="[
        isCompact ? 'text-sm' : 'text-base',
        isDark ? 'text-white' : 'text-slate-900'
      ]"
    >
      {{ props.label }}
    </p>

    <div class="flex flex-wrap items-center justify-center" :class="isCompact ? 'gap-3' : 'gap-2.5'">
      <template v-for="(logo, index) in logos" :key="logo.alt">
        <div class="flex shrink-0 items-center justify-center" :class="logoWrapClass(logo.variant)">
          <img
            :src="logo.src"
            :alt="logo.alt"
            class="block h-auto w-full object-contain transition duration-200"
            :class="[
              isDark
                ? 'opacity-90 brightness-0 invert hover:opacity-100 hover:drop-shadow-[0_0_16px_rgba(255,255,255,0.18)]'
                : 'opacity-80 grayscale hover:opacity-100 hover:grayscale-0',
              logo.variant === 'google' ? (isCompact ? 'max-w-[8rem]' : 'max-w-[15.6875rem]') : '',
            ]"
          />
        </div>

        <span
          v-if="props.showDividers && index < logos.length - 1"
          aria-hidden="true"
          class="self-center"
          :class="cn(
            isCompact ? 'h-9' : 'h-[4.5rem]',
            'w-px',
            isDark ? 'bg-white/25' : 'bg-slate-900/15'
          )"
        />
      </template>
    </div>
  </div>
</template>