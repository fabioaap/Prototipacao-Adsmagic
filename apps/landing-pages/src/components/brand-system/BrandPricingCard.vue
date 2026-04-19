<script setup lang="ts">
import { ArrowRight, Check } from 'lucide-vue-next'

interface Props {
  icon?: string
  name: string
  description: string
  price: number | string
  period?: string
  billingInfo?: string
  features: string[]
  ctaLabel: string
  ctaHref: string
  ctaStyle?: 'outline' | 'filled'
  recommended?: boolean
  recommendedLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  icon: undefined,
  period: '/mês',
  billingInfo: undefined,
  ctaStyle: 'outline',
  recommended: false,
  recommendedLabel: 'Recomendado',
})
</script>

<template>
  <article class="brand-pricing-card" :class="{ 'is-recommended': props.recommended }">
    <span v-if="props.recommended" class="brand-pricing-card__badge">{{ props.recommendedLabel }}</span>
    <span v-if="props.icon" class="brand-pricing-card__icon">{{ props.icon }}</span>
    <h3 class="brand-pricing-card__name">{{ props.name }}</h3>
    <p class="brand-pricing-card__description">{{ props.description }}</p>

    <p class="brand-pricing-card__price">
      <span class="brand-pricing-card__currency">R$</span>
      <span class="brand-pricing-card__amount">{{ props.price }}</span>
      <span class="brand-pricing-card__period">{{ props.period }}</span>
    </p>

    <p v-if="props.billingInfo" class="brand-pricing-card__billing">{{ props.billingInfo }}</p>

    <ul class="brand-pricing-card__features">
      <li v-for="feature in props.features" :key="feature">
        <span class="brand-pricing-card__check">
          <Check :size="12" />
        </span>
        <span>{{ feature }}</span>
      </li>
    </ul>

    <a
      class="brand-pricing-card__cta"
      :class="[`is-${props.ctaStyle}`]"
      :href="props.ctaHref"
      target="_blank"
      rel="noreferrer"
    >
      <span>{{ props.ctaLabel }}</span>
      <ArrowRight :size="18" />
    </a>
  </article>
</template>

<style scoped>
.brand-pricing-card {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 32px;
  border-radius: 20px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  transition: box-shadow 200ms ease, border-color 200ms ease, transform 200ms ease;
}

.brand-pricing-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 20px 50px rgba(15, 23, 42, 0.08);
}

.brand-pricing-card.is-recommended {
  border: 2px solid #010542;
  box-shadow: 0 30px 80px rgba(1, 5, 66, 0.12);
}

.brand-pricing-card__badge {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  padding: 4px 16px;
  border-radius: 20px;
  background: #010542;
  color: #ffffff;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}

.brand-pricing-card__icon {
  font-size: 32px;
  margin-bottom: 12px;
}

.brand-pricing-card__name {
  margin: 0 0 6px;
  font-size: 22px;
  font-weight: 800;
  color: #010542;
}

.brand-pricing-card__description {
  margin: 0 0 24px;
  font-size: 14px;
  color: #64748b;
  line-height: 1.5;
}

.brand-pricing-card__price {
  margin: 0 0 4px;
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.brand-pricing-card__currency {
  font-size: 20px;
  font-weight: 700;
  color: #010542;
}

.brand-pricing-card__amount {
  font-size: 48px;
  font-weight: 800;
  line-height: 1;
  color: #010542;
}

.brand-pricing-card__period {
  font-size: 16px;
  font-weight: 500;
  color: #64748b;
}

.brand-pricing-card__billing {
  margin: 0 0 24px;
  font-size: 13px;
  color: #64748b;
}

.brand-pricing-card__features {
  list-style: none;
  margin: 0 0 32px;
  padding: 0;
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 12px;
}

.brand-pricing-card__features li {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  font-weight: 500;
  color: #3a3f5f;
}

.brand-pricing-card__check {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  border-radius: 999px;
  background: rgba(59, 181, 109, 0.15);
  color: #3bb56d;
}

.brand-pricing-card__cta {
  display: inline-flex;
  min-height: 54px;
  margin-top: auto;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 0 20px;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: -0.01em;
  text-decoration: none;
  transition: transform 200ms ease, box-shadow 200ms ease, border-color 200ms ease, background-color 200ms ease;
}

.brand-pricing-card__cta:hover {
  transform: translateY(-1px);
}

.brand-pricing-card__cta.is-filled {
  background: #3bb56d;
  color: #ffffff;
  box-shadow: 0 18px 38px rgba(59, 181, 109, 0.24);
}

.brand-pricing-card__cta.is-outline {
  border: 1px solid #010542;
  color: #010542;
  background: #ffffff;
}

@media (max-width: 767px) {
  .brand-pricing-card {
    padding: 24px;
  }

  .brand-pricing-card__amount {
    font-size: 42px;
  }
}
</style>