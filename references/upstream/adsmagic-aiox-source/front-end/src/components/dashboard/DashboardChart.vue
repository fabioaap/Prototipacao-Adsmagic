<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
import type { ApexOptions } from 'apexcharts'

interface Props {
  /**
   * Tipo do gráfico
   */
  type: 'line' | 'area' | 'bar' | 'pie' | 'donut' | 'radialBar' | 'scatter' | 'bubble' | 'heatmap' | 'candlestick' | 'radar'
  /**
   * Séries de dados
   */
  series: any[]
  /**
   * Opções do ApexCharts
   */
  options?: ApexOptions
  /**
   * Altura do gráfico
   */
  height?: string | number
  /**
   * Largura do gráfico
   */
  width?: string | number
  /**
   * Se true, mostra loading
   */
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  options: () => ({}),
  height: 350,
  width: '100%',
  loading: false,
})

// Ref para o componente do gráfico
const chartRef = ref<InstanceType<typeof VueApexCharts> | null>(null)

// Opções padrão do gráfico (dark mode ready)
const defaultOptions = computed<ApexOptions>(() => ({
  chart: {
    fontFamily: 'inherit',
    foreColor: 'hsl(var(--muted-foreground))',
    toolbar: {
      show: true,
      tools: {
        download: true,
        selection: true,
        zoom: true,
        zoomin: true,
        zoomout: true,
        pan: true,
        reset: true,
      },
    },
    background: 'transparent',
  },
  theme: {
    mode: 'light', // Will be updated based on theme
  },
  colors: [
    'hsl(var(--primary))',
    'hsl(var(--success))',
    'hsl(var(--warning))',
    'hsl(var(--destructive))',
    'hsl(var(--info))',
  ],
  grid: {
    borderColor: 'hsl(var(--border))',
    strokeDashArray: 3,
  },
  dataLabels: {
    enabled: false,
  },
  stroke: {
    curve: 'smooth',
    width: 2,
  },
  xaxis: {
    labels: {
      style: {
        colors: 'hsl(var(--muted-foreground))',
      },
    },
    axisBorder: {
      color: 'hsl(var(--border))',
    },
    axisTicks: {
      color: 'hsl(var(--border))',
    },
  },
  yaxis: {
    labels: {
      style: {
        colors: 'hsl(var(--muted-foreground))',
      },
    },
  },
  legend: {
    labels: {
      colors: 'hsl(var(--foreground))',
    },
  },
  tooltip: {
    theme: 'light', // Will be updated based on theme
    style: {
      fontSize: '12px',
      fontFamily: 'inherit',
    },
  },
}))

// Mescla opções padrão com opções customizadas
const mergedOptions = computed<ApexOptions>(() => {
  return {
    ...defaultOptions.value,
    ...props.options,
    chart: {
      ...defaultOptions.value.chart,
      ...props.options?.chart,
    },
  }
})

// Watch para atualizar o gráfico quando dados mudarem
watch(
  () => [props.series, props.options],
  () => {
    if (chartRef.value && chartRef.value.chart) {
      try {
        chartRef.value.updateOptions(mergedOptions.value, false, true)
        chartRef.value.updateSeries(props.series, true)
      } catch (error) {
        console.warn('Erro ao atualizar gráfico:', error)
      }
    }
  },
  { deep: true }
)

// Detecta dark mode e atualiza tema
onMounted(() => {
  const updateTheme = () => {
    const isDark = document.documentElement.classList.contains('dark')
    // Aguarda o componente estar pronto antes de tentar atualizar
    if (chartRef.value && chartRef.value.chart) {
      chartRef.value.updateOptions({
        theme: {
          mode: isDark ? 'dark' : 'light',
        },
        tooltip: {
          theme: isDark ? 'dark' : 'light',
        },
      })
    }
  }

  // Aguarda um tick para garantir que o componente esteja montado
  setTimeout(() => {
    updateTheme()
  }, 100)

  // Observa mudanças no tema
  const observer = new MutationObserver(() => {
    // Aguarda um tick para evitar atualizações muito frequentes
    setTimeout(updateTheme, 50)
  })
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  })

  return () => observer.disconnect()
})
</script>

<template>
  <div class="relative">
    <!-- Loading Overlay -->
    <div
      v-if="props.loading"
      class="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg z-10"
    >
      <div class="flex flex-col items-center gap-2">
        <div class="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <p class="text-sm text-muted-foreground">Carregando dados...</p>
      </div>
    </div>

    <!-- Chart -->
    <VueApexCharts
      ref="chartRef"
      :type="props.type"
      :options="mergedOptions"
      :series="props.series"
      :height="props.height"
      :width="props.width"
    />
  </div>
</template>
