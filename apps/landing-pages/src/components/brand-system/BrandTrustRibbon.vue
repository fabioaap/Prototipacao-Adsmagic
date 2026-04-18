<script setup lang="ts">
import { computed } from 'vue'
import { publicAsset } from '@/lib/publicAsset'

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

const defaultLogos: BrandTrustRibbonLogo[] = [
  {
    src: publicAsset('img/landing/hero/logo-abstartups.png'),
    alt: 'Abstartups',
    variant: 'wide',
  },
  {
    src: publicAsset('img/landing/hero/logo-sebrae.png'),
    alt: 'Sebrae for Startups',
    variant: 'wide',
  },
  {
    src: publicAsset('img/landing/hero/logo-google.png'),
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

const logos = computed(() => (props.logos?.length ? props.logos : defaultLogos))
</script>

<template>
  <div class="brand-trust-ribbon" :class="[`is-${props.tone}`, `is-${props.size}`]">
    <p class="brand-trust-ribbon__label">{{ props.label }}</p>

    <div class="brand-trust-ribbon__logos">
      <template v-for="(logo, index) in logos" :key="logo.alt">
        <div class="brand-trust-ribbon__logo-wrap" :class="[`is-${logo.variant ?? 'wide'}`]">
          <img :src="logo.src" :alt="logo.alt" class="brand-trust-ribbon__logo" :class="[`is-${logo.variant ?? 'wide'}`]" />
        </div>

        <span
          v-if="props.showDividers && index < logos.length - 1"
          aria-hidden="true"
          class="brand-trust-ribbon__divider"
        ></span>
      </template>
    </div>
  </div>
</template>

<style scoped>
.brand-trust-ribbon {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.75rem;
}

.brand-trust-ribbon.is-compact {
  gap: 1rem;
}

.brand-trust-ribbon__label {
  margin: 0;
  text-align: center;
  font-weight: 500;
  letter-spacing: 0.01em;
}

.brand-trust-ribbon.is-default .brand-trust-ribbon__label {
  font-size: 1rem;
}

.brand-trust-ribbon.is-compact .brand-trust-ribbon__label {
  font-size: 0.875rem;
}

.brand-trust-ribbon.is-dark .brand-trust-ribbon__label {
  color: #ffffff;
}

.brand-trust-ribbon.is-light .brand-trust-ribbon__label {
  color: #637083;
}

.brand-trust-ribbon__logos {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0.625rem;
}

.brand-trust-ribbon.is-compact .brand-trust-ribbon__logos {
  gap: 0.75rem;
}

.brand-trust-ribbon__logo-wrap {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
}

.brand-trust-ribbon__logo-wrap.is-wide {
  width: min(19.5rem, 28vw);
}

.brand-trust-ribbon__logo-wrap.is-google {
  width: min(19.5625rem, 28vw);
  min-height: 6.5625rem;
  padding: 0.625rem;
}

.brand-trust-ribbon.is-compact .brand-trust-ribbon__logo-wrap.is-wide {
  width: min(12rem, 34vw);
}

.brand-trust-ribbon.is-compact .brand-trust-ribbon__logo-wrap.is-google {
  width: min(12rem, 34vw);
  min-height: 4rem;
  padding: 0.4rem;
}

.brand-trust-ribbon__logo {
  display: block;
  width: 100%;
  height: auto;
  object-fit: contain;
  transition: opacity 0.2s ease, filter 0.2s ease;
}

.brand-trust-ribbon.is-dark .brand-trust-ribbon__logo {
  opacity: 0.88;
  filter: brightness(0) invert(1);
}

.brand-trust-ribbon.is-dark .brand-trust-ribbon__logo:hover {
  opacity: 1;
  filter: brightness(0) invert(1) drop-shadow(0 0 16px rgba(255, 255, 255, 0.18));
}

.brand-trust-ribbon.is-light .brand-trust-ribbon__logo {
  opacity: 0.85;
}

.brand-trust-ribbon.is-light .brand-trust-ribbon__logo:hover {
  opacity: 1;
}

.brand-trust-ribbon__logo.is-google {
  max-width: 15.6875rem;
}

.brand-trust-ribbon.is-compact .brand-trust-ribbon__logo.is-google {
  max-width: 9rem;
}

.brand-trust-ribbon__divider {
  align-self: center;
  width: 1px;
  height: 4.5rem;
}

.brand-trust-ribbon.is-compact .brand-trust-ribbon__divider {
  height: 2.75rem;
}

.brand-trust-ribbon.is-dark .brand-trust-ribbon__divider {
  background: rgba(255, 255, 255, 0.25);
}

.brand-trust-ribbon.is-light .brand-trust-ribbon__divider {
  background: #c8cdd5;
}

@media (max-width: 1023px) {
  .brand-trust-ribbon__logos {
    gap: 1rem;
  }

  .brand-trust-ribbon__logo-wrap.is-wide,
  .brand-trust-ribbon__logo-wrap.is-google {
    width: min(15rem, 42vw);
  }
}

@media (max-width: 767px) {
  .brand-trust-ribbon__logos {
    flex-direction: column;
  }

  .brand-trust-ribbon__divider {
    width: 4rem;
    height: 1px;
  }
}
</style>