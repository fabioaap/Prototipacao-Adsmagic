<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import VueApexCharts from 'vue3-apexcharts'
import type { ApexOptions } from 'apexcharts'
import type { FunnelStageStats } from '@/types'

interface Props {
  stages: FunnelStageStats[]
  totalContacts?: number
}

const props = withDefaults(defineProps<Props>(), {
  totalContacts: 0
})

const { t, locale } = useI18n()

const FUNNEL_PALETTE = [
  {
    solid: '#4677df',
    soft: '#dfe9ff',
    tint: 'rgba(70, 119, 223, 0.14)',
    border: 'rgba(70, 119, 223, 0.24)',
    shadow: 'rgba(70, 119, 223, 0.18)'
  },
  {
    solid: '#2dd4a6',
    soft: '#dbfbf1',
    tint: 'rgba(45, 212, 166, 0.14)',
    border: 'rgba(45, 212, 166, 0.24)',
    shadow: 'rgba(45, 212, 166, 0.18)'
  },
  {
    solid: '#f5b83a',
    soft: '#fff1cf',
    tint: 'rgba(245, 184, 58, 0.16)',
    border: 'rgba(245, 184, 58, 0.28)',
    shadow: 'rgba(245, 184, 58, 0.18)'
  },
  {
    solid: '#f45b80',
    soft: '#ffe0e8',
    tint: 'rgba(244, 91, 128, 0.14)',
    border: 'rgba(244, 91, 128, 0.24)',
    shadow: 'rgba(244, 91, 128, 0.18)'
  },
  {
    solid: '#8a73d6',
    soft: '#ebe5ff',
    tint: 'rgba(138, 115, 214, 0.14)',
    border: 'rgba(138, 115, 214, 0.24)',
    shadow: 'rgba(138, 115, 214, 0.18)'
  },
  {
    solid: '#64748b',
    soft: '#e8edf3',
    tint: 'rgba(100, 116, 139, 0.14)',
    border: 'rgba(100, 116, 139, 0.22)',
    shadow: 'rgba(100, 116, 139, 0.16)'
  }
] as const

const totalBase = computed(() => {
  if (props.totalContacts && props.totalContacts > 0) {
    return props.totalContacts
  }

  return props.stages[0]?.count ?? 0
})

const chartHeight = computed(() => {
  const rows = Math.max(props.stages.length, 3)
  return Math.max(380, rows * 78)
})

function formatNumber(value: number): string {
  return new Intl.NumberFormat(locale.value).format(value)
}

function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals).replace('.', ',')}%`
}

function formatAvgDays(days?: number): string {
  if (typeof days !== 'number' || Number.isNaN(days) || days <= 0) {
    return t('dashboard.v2.contactsInStage')
  }

  return t('dashboard.v2.avgTime', {
    time: `${days.toFixed(1).replace('.', ',')} dias`
  })
}

const chartSeries = computed(() => [{
  name: t('dashboard.v2.funnelTitle'),
  data: props.stages.map((stage, index) => ({
    x: stage.stageName,
    y: stage.count,
    fillColor: FUNNEL_PALETTE[index % FUNNEL_PALETTE.length]?.solid
  }))
}])

const chartOptions = computed<ApexOptions>(() => ({
  chart: {
    type: 'bar',
    height: chartHeight.value,
    toolbar: {
      show: false
    },
    animations: {
      enabled: true,
      easing: 'easeinout',
      speed: 500
    },
    background: 'transparent',
    fontFamily: 'inherit'
  },
  plotOptions: {
    bar: {
      horizontal: true,
      distributed: true,
      borderRadius: 6,
      borderRadiusApplication: 'around',
      barHeight: '84%',
      isFunnel: true,
      isFunnel3d: true,
      dataLabels: {
        position: 'center'
      }
    }
  },
  legend: {
    show: false
  },
  grid: {
    show: false,
    padding: {
      top: 2,
      right: 8,
      bottom: 2,
      left: 8
    }
  },
  xaxis: {
    labels: {
      show: false
    },
    axisTicks: {
      show: false
    },
    axisBorder: {
      show: false
    }
  },
  yaxis: {
    labels: {
      style: {
        colors: '#0f172a',
        fontSize: '12px',
        fontWeight: 600
      },
      maxWidth: 220
    }
  },
  dataLabels: {
    enabled: true,
    offsetX: 0,
    style: {
      fontSize: '13px',
      fontWeight: 700,
      colors: ['#ffffff']
    },
    formatter: (value: number) => formatNumber(value)
  },
  tooltip: {
    theme: 'light',
    custom: ({ dataPointIndex }: { dataPointIndex: number }) => {
      const stage = props.stages[dataPointIndex]
      if (!stage) {
        return ''
      }

      const share = totalBase.value > 0 ? (stage.count / totalBase.value) * 100 : 0
      const conversion = stage.conversionRate > 0 ? formatPercent(stage.conversionRate) : '—'

      return `
        <div style="padding:12px 14px; min-width: 180px; font-family: inherit;">
          <div style="font-size:12px; color:#475569; margin-bottom:4px;">${stage.stageName}</div>
          <div style="font-size:18px; font-weight:700; color:#0f172a;">${formatNumber(stage.count)}</div>
          <div style="font-size:12px; color:#64748b; margin-top:6px;">${formatPercent(share, 0)} ${t('dashboard.v2.ofTotal')}</div>
          <div style="font-size:12px; color:#64748b; margin-top:2px;">${conversion} ${t('dashboard.v2.advanced')}</div>
          <div style="font-size:12px; color:#64748b; margin-top:2px;">${formatAvgDays(stage.avgTimeInStage)}</div>
        </div>
      `
    }
  },
  states: {
    hover: {
      filter: {
        type: 'lighten',
        value: 0.08
      }
    },
    active: {
      filter: {
        type: 'none'
      }
    }
  }
}))

const stageDetails = computed(() => props.stages.map((stage, index) => {
  const share = totalBase.value > 0 ? (stage.count / totalBase.value) * 100 : 0
  const palette = FUNNEL_PALETTE[index % FUNNEL_PALETTE.length]

  return {
    ...stage,
    share,
    index: index + 1,
    palette
  }
}))
</script>

<template>
  <div class="funnel-chart-shell">
    <div
      class="funnel-chart-frame"
      :style="{ minHeight: `${chartHeight + 34}px` }"
      aria-label="Gráfico de funil de conversão"
    >
      <div class="funnel-chart-stage">
        <VueApexCharts
          type="bar"
          :height="chartHeight"
          :options="chartOptions"
          :series="chartSeries"
        />
      </div>
    </div>

    <div class="funnel-detail-grid" role="list">
      <article
        v-for="stage in stageDetails"
        :key="stage.stageId"
        class="funnel-detail-card"
        role="listitem"
        :style="{
          '--stage-accent': stage.palette.solid,
          '--stage-soft': stage.palette.soft,
          '--stage-tint': stage.palette.tint,
          '--stage-border': stage.palette.border,
          '--stage-shadow': stage.palette.shadow
        }"
      >
        <div class="funnel-detail-main">
          <div class="funnel-detail-heading">
            <span class="funnel-detail-step">Etapa {{ String(stage.index).padStart(2, '0') }}</span>
            <p class="funnel-detail-name">{{ stage.stageName }}</p>
          </div>
          <p class="funnel-detail-caption">{{ formatAvgDays(stage.avgTimeInStage) }}</p>
          <div class="funnel-detail-progress" aria-hidden="true">
            <span class="funnel-detail-progress-fill" :style="{ width: `${Math.max(stage.share, 6)}%` }" />
          </div>
        </div>

        <div class="funnel-detail-metrics">
          <p class="funnel-detail-count">{{ formatNumber(stage.count) }}</p>
          <p class="funnel-detail-share">{{ formatPercent(stage.share, 0) }} {{ t('dashboard.v2.ofTotal') }}</p>
          <span v-if="stage.conversionRate > 0" class="funnel-detail-conversion">
            {{ formatPercent(stage.conversionRate) }} {{ t('dashboard.v2.advanced') }}
          </span>
        </div>
      </article>
    </div>
  </div>
</template>

<style scoped>
.funnel-chart-shell {
  margin-top: 1.5rem;
  display: grid;
  gap: 1rem;
}

.funnel-chart-frame {
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 1.5rem;
  background:
    radial-gradient(circle at 20% 15%, rgba(70, 119, 223, 0.12), transparent 28%),
    radial-gradient(circle at 78% 82%, rgba(138, 115, 214, 0.12), transparent 24%),
    linear-gradient(180deg, #f8fbff 0%, #ffffff 100%);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7);
  padding: 0.9rem;
}

.funnel-chart-stage {
  width: 100%;
  padding: 0.15rem 0.2rem;
}

.funnel-chart-frame :deep(.vue-apexcharts),
.funnel-chart-frame :deep(.apexcharts-canvas) {
  width: 100% !important;
}

.funnel-chart-frame :deep(.apexcharts-svg) {
  overflow: visible;
}

.funnel-chart-frame :deep(.apexcharts-bar-shadows .apexcharts-bar-shadow) {
  stroke: rgba(248, 251, 255, 0.96);
  stroke-width: 5px;
  stroke-linejoin: round;
  stroke-linecap: round;
  paint-order: stroke fill;
}

.funnel-detail-grid {
  display: grid;
  gap: 0.85rem;
}

.funnel-detail-card {
  position: relative;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1rem 0.95rem;
  border-radius: 1rem;
  border: 1px solid var(--stage-border);
  background:
    linear-gradient(135deg, var(--stage-tint), rgba(255, 255, 255, 0.96) 48%),
    #ffffff;
  box-shadow: 0 10px 24px -18px var(--stage-shadow);
  overflow: hidden;
}

.funnel-detail-card::before {
  content: '';
  position: absolute;
  inset: 0 auto 0 0;
  width: 4px;
  background: linear-gradient(180deg, var(--stage-accent), color-mix(in srgb, var(--stage-accent) 65%, white));
}

.funnel-detail-main {
  min-width: 0;
  flex: 1 1 auto;
}

.funnel-detail-heading {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.funnel-detail-step {
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  padding: 0.2rem 0.5rem;
  border-radius: 9999px;
  background: var(--stage-soft);
  color: var(--stage-accent);
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.funnel-detail-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #0f172a;
  line-height: 1.3;
}

.funnel-detail-caption {
  margin-top: 0.45rem;
  font-size: 0.75rem;
  color: #64748b;
}

.funnel-detail-progress {
  margin-top: 0.7rem;
  height: 0.45rem;
  width: 100%;
  border-radius: 9999px;
  background: rgba(148, 163, 184, 0.14);
  overflow: hidden;
}

.funnel-detail-progress-fill {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--stage-accent), color-mix(in srgb, var(--stage-accent) 70%, white));
}

.funnel-detail-metrics {
  text-align: right;
  flex-shrink: 0;
  min-width: 92px;
}

.funnel-detail-count {
  font-size: 1.5rem;
  line-height: 1;
  font-weight: 700;
  color: #0f172a;
}

.funnel-detail-share {
  margin-top: 0.2rem;
  font-size: 0.75rem;
  color: #64748b;
}

.funnel-detail-conversion {
  display: inline-block;
  margin-top: 0.35rem;
  padding: 0.22rem 0.55rem;
  border-radius: 9999px;
  background: var(--stage-soft);
  color: color-mix(in srgb, var(--stage-accent) 88%, #0f172a);
  font-size: 0.6875rem;
  font-weight: 700;
}

.funnel-detail-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 16px 28px -20px var(--stage-shadow);
}

@media (max-width: 767px) {
  .funnel-detail-card {
    flex-direction: column;
    align-items: stretch;
  }

  .funnel-detail-metrics {
    min-width: 0;
    text-align: left;
  }
}

@media (min-width: 1024px) {
  .funnel-chart-shell {
    grid-template-columns: minmax(0, 1.4fr) minmax(280px, 0.9fr);
    align-items: stretch;
  }

  .funnel-chart-frame,
  .funnel-detail-grid {
    height: 100%;
  }

  .funnel-chart-stage {
    max-width: 94%;
  }

  .funnel-detail-grid {
    align-content: start;
  }
}
</style>