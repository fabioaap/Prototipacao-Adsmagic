<script setup lang="ts">
import { computed } from 'vue'
import Badge from '@/components/ui/Badge.vue'
import { useSalesStore } from '@/stores/sales'
import { useFormat } from '@/composables/useFormat'
import { formatSafeCurrency } from '@/utils/formatters'

interface Props {
  /**
   * Se true, mostra loading skeleton
   */
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

const salesStore = useSalesStore()
const { formatNumber, formatPercentage } = useFormat()

// Métricas calculadas
const totalSales = computed(() => {
  return salesStore.sales.filter(s => s.status === 'completed').length
})

const totalRevenue = computed(() => {
  return salesStore.sales
    .filter(s => s.status === 'completed')
    .reduce((acc, sale) => acc + sale.value, 0)
})

const averageTicket = computed(() => {
  if (totalSales.value === 0) return 0
  return totalRevenue.value / totalSales.value
})

const conversionRate = computed(() => {
  const total = salesStore.sales.length
  if (total === 0) return 0
  return (totalSales.value / total) * 100
})

// Comparação com período anterior (mockado)
const previousRevenue = 85000
const previousSales = 8
const previousTicket = 10625
const previousConversion = 88.89

const revenueChange = computed(() => {
  if (previousRevenue <= 0) return 0
  return ((totalRevenue.value - previousRevenue) / previousRevenue) * 100
})

const salesChange = computed(() => {
  if (previousSales <= 0) return 0
  return ((totalSales.value - previousSales) / previousSales) * 100
})

const ticketChange = computed(() => {
  if (previousTicket <= 0) return 0
  return ((averageTicket.value - previousTicket) / previousTicket) * 100
})

const conversionChange = computed(() => {
  if (previousConversion <= 0) return 0
  return ((conversionRate.value - previousConversion) / previousConversion) * 100
})

// Formatação de mudanças com sinal
const formatChange = (value: number): string => {
  if (value > 0) return `+${formatPercentage(value)}`
  return formatPercentage(value)
}

// Cards de métricas (similar à dashboard)
interface MetricCard {
  label: string
  value: string
  caption: string
  badgeValue?: string
  badgeType?: 'positive' | 'negative'
}

const kpiCards = computed<MetricCard[]>(() => [
  {
    label: 'Receita total',
    value: formatSafeCurrency(totalRevenue.value, 'BRL'),
    caption: 'Vendas confirmadas no período',
    badgeValue: formatChange(revenueChange.value),
    badgeType: revenueChange.value >= 0 ? 'positive' : 'negative'
  },
  {
    label: 'Total de vendas',
    value: formatNumber(totalSales.value),
    caption: 'Vendas realizadas',
    badgeValue: formatChange(salesChange.value),
    badgeType: salesChange.value >= 0 ? 'positive' : 'negative'
  },
  {
    label: 'Ticket médio',
    value: formatSafeCurrency(averageTicket.value, 'BRL'),
    caption: 'Valor médio por venda',
    badgeValue: formatChange(ticketChange.value),
    badgeType: ticketChange.value >= 0 ? 'positive' : 'negative'
  },
  {
    label: 'Taxa de conversão',
    value: formatPercentage(conversionRate.value),
    caption: 'Vendas confirmadas / total',
    badgeValue: formatChange(conversionChange.value),
    badgeType: conversionChange.value >= 0 ? 'positive' : 'negative'
  }
])

const getBadgeColor = (badgeType?: MetricCard['badgeType']) => {
  return badgeType === 'negative' ? 'destructive' : 'success'
}
</script>

<template>
  <section class="summary-grid">
    <article
      v-for="card in kpiCards"
      :key="card.label"
      class="summary-card card-shadow"
      :class="{ 'animate-pulse': props.loading }"
    >
      <header class="summary-card-header">
        <p class="summary-card-label">{{ card.label }}</p>
        <Badge
          v-if="card.badgeValue"
          variant="soft"
          :color="getBadgeColor(card.badgeType)"
          class="summary-card-badge"
        >
          {{ card.badgeValue }}
        </Badge>
      </header>
      <p class="summary-card-value">{{ card.value }}</p>
      <p class="summary-card-caption">{{ card.caption }}</p>
    </article>
  </section>
</template>

<style scoped>
/* ─── Metrics Grid (identical to Dashboard) ─────────────────────────────── */

.card-shadow {
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.summary-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1.25rem;
}

/* Regra base: Mobile – 1 card por linha (280px mínimo, cresce até 100%) */
.summary-card {
  flex: 1 1 min(100%, 280px);
  box-sizing: border-box;
  padding: 1.75rem 1.75rem;
  border-radius: 1rem;
  border: 1px solid #e2e8f0;
  background-color: white;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  min-height: 160px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 0.75rem;
  cursor: default;
}

/* ─── Breakpoints Flexbox Responsivo ─────────────────────────────────────── */

/* 640px+: tablets – 2-3 cards por linha (280px base → ~2 em 768px) */
@media (min-width: 640px) {
  .summary-card {
    flex: 1 1 280px;
  }
}

/* 768px+: tablets grandes – 3-4 cards por linha (240px base → ~3 em 1024px) */
@media (min-width: 768px) {
  .summary-card {
    flex: 1 1 240px;
  }
}

/* 1024px+: desktop pequeno – ~4 cards por linha (230px base → ~4 em 1280px) */
@media (min-width: 1024px) {
  .summary-card {
    flex: 1 1 230px;
    padding: 2rem 2rem;
    min-height: 170px;
  }
}

/* 1280px+: desktop médio/grande – 4-5 cards por linha (240px base → 4-5 em 1440px, ~5 em 1920px) */
@media (min-width: 1280px) {
  .summary-card {
    flex: 1 1 240px;
  }
}

.summary-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
  min-height: 2rem;
}

.summary-card-label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  line-height: 1.4;
}

@media (min-width: 768px) {
  .summary-card-label {
    font-size: 0.75rem;
  }
}

.summary-card-badge {
  font-size: 0.6875rem;
  line-height: 1.25rem;
  white-space: nowrap;
  flex-shrink: 0;
}

.summary-card-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.2;
  letter-spacing: -0.02em;
  word-break: break-all;
}

@media (min-width: 1024px) {
  .summary-card-value {
    font-size: 2rem;
  }
}

.summary-card-caption {
  font-size: 0.8125rem;
  color: #94a3b8;
  line-height: 1.4;
  margin-top: auto;
}
</style>

