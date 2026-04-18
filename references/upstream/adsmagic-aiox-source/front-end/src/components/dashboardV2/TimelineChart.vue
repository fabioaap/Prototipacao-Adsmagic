<script setup lang="ts">
import { computed, ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { getLocalTimeZone, fromDate, type DateValue } from '@internationalized/date'
import { Download, Flag } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import Modal from '@/components/ui/Modal.vue'
import { resolveTimezone } from '@/utils/dateTimezone'

interface TimeSeriesData {
  week: string
  contacts: number
  sales: number
}

interface Annotation {
  id: string
  date: string
  title: string
  description?: string
  color: string
}

interface Props {
  data: TimeSeriesData[]
  currentWeekContacts?: number
  currentWeekSales?: number
  startDate?: Date
  endDate?: Date
  timezone?: string
}

const props = defineProps<Props>()
const calendarTimezone = computed(() => resolveTimezone(props.timezone || getLocalTimeZone()))
const isMobile = ref(typeof window !== 'undefined' ? window.innerWidth <= 640 : false)

function updateViewportState() {
  isMobile.value = window.innerWidth <= 640
}

const emit = defineEmits<{
  'update:startDate': [date: Date | undefined]
  'update:endDate': [date: Date | undefined]
  'date-range-change': [startDate: Date | undefined, endDate: Date | undefined]
  'drilldown': [date: string, metric: 'contacts' | 'sales', value: number]
}>()

// Datas locais (como DateValue para o Calendar)
const localStartDate = ref<DateValue | undefined>()
const localEndDate = ref<DateValue | undefined>()

// Converter Date props (vindos do pai) para DateValue (usado pelo Calendar)
watch(
  [() => props.startDate, () => calendarTimezone.value],
  ([newVal]) => {
    if (newVal && newVal instanceof Date) {
      localStartDate.value = fromDate(newVal, calendarTimezone.value)
    } else {
      localStartDate.value = undefined
    }
  },
  { immediate: true }
)

watch(
  [() => props.endDate, () => calendarTimezone.value],
  ([newVal]) => {
    if (newVal && newVal instanceof Date) {
      localEndDate.value = fromDate(newVal, calendarTimezone.value)
    } else {
      localEndDate.value = undefined
    }
  },
  { immediate: true }
)

// Computed properties para converter DateValue (do Calendar) em Date (para emitir ao pai)
const startDateAsDate = computed(() => {
  if (!localStartDate.value) return undefined
  return localStartDate.value.toDate(calendarTimezone.value)
})

const endDateAsDate = computed(() => {
  if (!localEndDate.value) return undefined
  return localEndDate.value.toDate(calendarTimezone.value)
})

// DateRange para o componente unificado
interface DateRange {
  start: Date
  end: Date
}

const dateRange = computed<DateRange | undefined>(() => {
  if (startDateAsDate.value && endDateAsDate.value) {
    return {
      start: startDateAsDate.value,
      end: endDateAsDate.value
    }
  }
  return undefined
})

// Handler para mudança de range
function handleDateRangeChange(range: DateRange) {
  console.log('[TimelineChart] Date range changed:', range)
  emit('update:startDate', range.start)
  emit('update:endDate', range.end)
  emit('date-range-change', range.start, range.end)
}

// Toggle de visibilidade das linhas
const showContacts = ref(true)
const showSales = ref(true)

// ============================================================================
// ANOTAÇÕES (G5.6)
// ============================================================================

// Anotações armazenadas (persistidas em localStorage por projectId)
const annotations = ref<Annotation[]>([])
const showAnnotationModal = ref(false)
const annotationForm = ref({
  date: '',
  title: '',
  description: '',
  color: '#f97316' // Orange default
})
const editingAnnotationId = ref<string | null>(null)

// Cores disponíveis para anotações
const annotationColors = [
  '#f97316', // Orange
  '#ef4444', // Red
  '#10b981', // Green
  '#3b82f6', // Blue
  '#8b5cf6', // Purple
  '#ec4899', // Pink
]

// Carregar anotações do localStorage
const loadAnnotations = () => {
  try {
    const stored = localStorage.getItem('dashboard_annotations')
    if (stored) {
      annotations.value = JSON.parse(stored)
    }
  } catch (e) {
    console.warn('[TimelineChart] Failed to load annotations:', e)
  }
}

// Salvar anotações no localStorage
const saveAnnotations = () => {
  try {
    localStorage.setItem('dashboard_annotations', JSON.stringify(annotations.value))
  } catch (e) {
    console.warn('[TimelineChart] Failed to save annotations:', e)
  }
}

// Abrir modal para adicionar anotação em uma data específica
const openAnnotationModal = (date: string) => {
  annotationForm.value = {
    date,
    title: '',
    description: '',
    color: '#f97316'
  }
  editingAnnotationId.value = null
  showAnnotationModal.value = true
}

// Editar anotação existente
const editAnnotation = (annotation: Annotation) => {
  annotationForm.value = {
    date: annotation.date,
    title: annotation.title,
    description: annotation.description || '',
    color: annotation.color
  }
  editingAnnotationId.value = annotation.id
  showAnnotationModal.value = true
}

// Salvar anotação (criar ou editar)
const saveAnnotation = () => {
  if (!annotationForm.value.title.trim()) return
  
  if (editingAnnotationId.value) {
    // Editar existente
    const index = annotations.value.findIndex(a => a.id === editingAnnotationId.value)
    const existingAnnotation = annotations.value[index]
    if (index !== -1 && existingAnnotation) {
      annotations.value[index] = {
        id: existingAnnotation.id,
        date: annotationForm.value.date,
        title: annotationForm.value.title,
        description: annotationForm.value.description || undefined,
        color: annotationForm.value.color
      }
    }
  } else {
    // Criar nova
    annotations.value.push({
      id: `ann_${Date.now()}`,
      date: annotationForm.value.date,
      title: annotationForm.value.title,
      description: annotationForm.value.description || undefined,
      color: annotationForm.value.color
    })
  }
  
  saveAnnotations()
  showAnnotationModal.value = false
}

// Deletar anotação
const deleteAnnotation = (id: string) => {
  annotations.value = annotations.value.filter(a => a.id !== id)
  saveAnnotations()
  showAnnotationModal.value = false
}

// Anotações visíveis no período atual
const visibleAnnotations = computed(() => {
  return annotations.value.filter(ann => {
    return props.data.some(d => d.week === ann.date)
  })
})

// Anotação do ponto em hover (se existir)
const hoveredPointAnnotation = computed(() => {
  if (!hoveredPoint.value) return null
  return visibleAnnotations.value.find(a => a.date === hoveredPoint.value?.date) || null
})

// Obter coordenada X de uma anotação
const getAnnotationX = (date: string) => {
  const index = props.data.findIndex(d => d.week === date)
  if (index === -1) return 0
  const stepX = (chartWidth - paddingLeft - paddingRight) / (props.data.length - 1 || 1)
  return paddingLeft + (index * stepX)
}

// Carregar ao montar
loadAnnotations()

// ============================================================================
// ESTADO DE HOVER
// ============================================================================

// Estado do hover
const hoveredIndex = ref<number | null>(null)
const tooltipVisible = ref(false)
const tooltipX = ref(0)
const tooltipY = ref(0)

// Configuração do gráfico
const chartWidth = 1000
const chartHeight = 300
const paddingTop = 20
const paddingBottom = 40
const paddingLeft = 40
const paddingRight = 20

// Calcular escala Y
const allValues = computed(() => {
  const values: number[] = []
  if (showContacts.value) values.push(...props.data.map(d => d.contacts))
  if (showSales.value) values.push(...props.data.map(d => d.sales))
  return values
})

const yMax = computed(() => {
  const max = Math.max(...allValues.value, 1)
  // Arredondar para cima para múltiplo de 5
  return Math.ceil(max / 5) * 5
})

const yScale = computed(() => {
  return (value: number) => {
    const ratio = value / yMax.value
    return chartHeight - paddingBottom - (ratio * (chartHeight - paddingTop - paddingBottom))
  }
})

// Gerar grid horizontal
const yGridLines = computed(() => {
  const lines = []
  const steps = 5
  for (let i = 0; i <= steps; i++) {
    const value = (yMax.value / steps) * i
    const y = yScale.value(value)
    lines.push({ value: Math.round(value), y })
  }
  return lines
})

// Função para gerar path SVG suavizado
function generateSmoothPath(dataPoints: number[]): string {
  if (dataPoints.length === 0) return ''
  
  const stepX = (chartWidth - paddingLeft - paddingRight) / (dataPoints.length - 1 || 1)
  const points = dataPoints.map((value, index) => ({
    x: paddingLeft + (index * stepX),
    y: yScale.value(value)
  }))
  
  if (points.length === 1) {
    const p = points[0]
    return p ? `M${p.x} ${p.y}` : ''
  }
  
  const first = points[0]
  if (!first) return ''
  let path = `M${first.x} ${first.y}`
  
  for (let i = 0; i < points.length - 1; i++) {
    const current = points[i]
    const next = points[i + 1]
    if (!current || !next) continue
    const controlX = (current.x + next.x) / 2
    
    path += ` Q${controlX} ${current.y} ${next.x} ${next.y}`
  }
  
  return path
}

const contactsPath = computed(() => {
  if (!showContacts.value) return ''
  const contacts = props.data.map(d => d.contacts)
  return generateSmoothPath(contacts)
})

const salesPath = computed(() => {
  if (!showSales.value) return ''
  const sales = props.data.map(d => d.sales)
  return generateSmoothPath(sales)
})

// Labels do eixo X - mostrar a cada N pontos
const xAxisLabels = computed(() => {
  const totalPoints = props.data.length
  const maxLabels = isMobile.value ? 4 : 10
  const step = Math.ceil(totalPoints / maxLabels)

  const formatAxisLabel = (label: string) => {
    if (!isMobile.value) return label
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(label)) return label.slice(0, 5)
    return label
  }

  return props.data
    .map((d, index) => ({
      label: formatAxisLabel(d.week),
      x: paddingLeft + (index * (chartWidth - paddingLeft - paddingRight) / (totalPoints - 1 || 1)),
      show: index % step === 0 || index === totalPoints - 1
    }))
    .filter(item => item.show)
})

/** Total de contatos no período (soma de todos os dias) – usado na legenda */
const totalContactsPeriod = computed(() =>
  props.data.reduce((acc, d) => acc + d.contacts, 0)
)

/** Total de vendas no período (soma de todos os dias) – usado na legenda */
const totalSalesPeriod = computed(() =>
  props.data.reduce((acc, d) => acc + d.sales, 0)
)

// Pontos de dados com coordenadas para hover
const dataPoints = computed(() => {
  const totalPoints = props.data.length
  const stepX = (chartWidth - paddingLeft - paddingRight) / (totalPoints - 1 || 1)
  
  return props.data.map((d, index) => ({
    index,
    date: d.week,
    contacts: d.contacts,
    sales: d.sales,
    x: paddingLeft + (index * stepX),
    contactsY: yScale.value(d.contacts),
    salesY: yScale.value(d.sales)
  }))
})

// Dados do ponto hover
const hoveredPoint = computed(() => {
  if (hoveredIndex.value === null) return null
  return dataPoints.value[hoveredIndex.value]
})

// Linha vertical do hover
const hoverLineX = computed(() => {
  if (!hoveredPoint.value) return 0
  return hoveredPoint.value.x
})

// Handlers de mouse
function handleMouseMove(event: MouseEvent) {
  const svg = event.currentTarget as SVGElement
  const rect = svg.getBoundingClientRect()
  const mouseX = event.clientX - rect.left
  const mouseY = event.clientY - rect.top
  
  // Converter coordenada do mouse para escala do viewBox
  const scaleX = chartWidth / rect.width
  const svgX = mouseX * scaleX
  
  // Encontrar ponto mais próximo
  let closestIndex = 0
  let closestDistance = Infinity
  
  dataPoints.value.forEach((point, index) => {
    const distance = Math.abs(point.x - svgX)
    if (distance < closestDistance) {
      closestDistance = distance
      closestIndex = index
    }
  })
  
  // Atualizar hover apenas se estiver dentro da área do gráfico
  if (svgX >= paddingLeft && svgX <= chartWidth - paddingRight) {
    hoveredIndex.value = closestIndex
    tooltipVisible.value = true
    tooltipX.value = mouseX
    tooltipY.value = mouseY - 80
  }
}

function handleMouseLeave() {
  hoveredIndex.value = null
  tooltipVisible.value = false
}

// Handler de clique para drill-down (G5.5)
function handleChartClick() {
  if (hoveredIndex.value === null) return
  
  const point = dataPoints.value[hoveredIndex.value]
  if (!point) return
  
  const dataItem = props.data[hoveredIndex.value]
  if (!dataItem) return
  
  // Emitir drilldown para contatos ou vendas (preferir contatos se ambos visíveis)
  if (showContacts.value && dataItem.contacts > 0) {
    emit('drilldown', dataItem.week, 'contacts', dataItem.contacts)
  } else if (showSales.value && dataItem.sales > 0) {
    emit('drilldown', dataItem.week, 'sales', dataItem.sales)
  }
}

onMounted(() => {
  updateViewportState()
  window.addEventListener('resize', updateViewportState)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateViewportState)
})
</script>

<template>
  <div class="card-shadow rounded-3xl border border-slate-200/60 bg-white p-4 sm:p-6">
    <!-- Header com título e botão de exportar -->
    <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-4 sm:mb-6">
      <div>
        <h2 class="section-title-md mb-0.5">Contatos e Vendas</h2>
        <p class="text-xs sm:text-sm text-slate-500">Volume por semana</p>
      </div>
      <Button
        variant="outline"
        class="self-start w-full justify-center text-xs text-slate-600 hover:text-slate-700 sm:w-auto"
      >
        <Download :size="14" />
        Exportar CSV
      </Button>
    </div>

    <!-- Controles: Período e Filtros -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6 mb-4 sm:mb-6 pb-4 border-b border-slate-100">
      <!-- Date Range Picker -->
      <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-2.5">
        <span class="text-sm text-slate-600 font-medium">Período:</span>
        <DateRangePicker
          :model-value="dateRange"
          :show-presets="true"
          :timezone="timezone"
          class="text-xs w-full sm:w-auto"
          @change="handleDateRangeChange"
        />
      </div>

      <!-- Checkboxes para mostrar/ocultar linhas -->
      <div class="flex flex-wrap items-center gap-3 text-sm sm:gap-4">
        <span class="text-slate-600 font-medium hidden sm:inline">Mostrar:</span>
        <label class="flex items-center gap-2 cursor-pointer group">
          <input 
            v-model="showContacts" 
            type="checkbox" 
            class="w-4 h-4 rounded border-border text-info focus:ring-2 focus:ring-info/20 focus:ring-offset-0 transition-colors"
          />
          <span class="text-slate-700 group-hover:text-slate-900 transition-colors">Contatos</span>
        </label>
        <label class="flex items-center gap-2 cursor-pointer group">
          <input 
            v-model="showSales" 
            type="checkbox" 
            class="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-2 focus:ring-emerald-500/20 focus:ring-offset-0 transition-colors"
          />
          <span class="text-slate-700 group-hover:text-slate-900 transition-colors">Vendas</span>
        </label>
      </div>
    </div>
    
    <!-- Área do gráfico -->
    <div class="mt-4 overflow-x-hidden sm:overflow-x-auto">
      <div class="relative min-w-0 sm:min-w-[600px]">
        <!-- SVG Chart -->
        <svg 
          :viewBox="`0 0 ${chartWidth} ${chartHeight}`" 
          class="w-full cursor-crosshair" 
          :style="{ height: isMobile ? '180px' : '200px' }"
          @mousemove="handleMouseMove"
          @mouseleave="handleMouseLeave"
          @click="handleChartClick"
        >
          <!-- Grid horizontal -->
          <g>
            <line
              v-for="line in yGridLines"
              :key="line.value"
              :x1="paddingLeft"
              :y1="line.y"
              :x2="chartWidth - paddingRight"
              :y2="line.y"
              stroke="#e2e8f0"
              stroke-width="1"
            />
          </g>

          <!-- Eixo Y - Labels -->
          <g>
            <text
              v-for="line in yGridLines"
              :key="`label-${line.value}`"
              :x="paddingLeft - 10"
              :y="line.y + 4"
              text-anchor="end"
              class="text-xs fill-slate-400 font-medium"
            >
              {{ line.value }}
            </text>
          </g>

          <!-- Linha de contatos (azul) -->
          <path
            v-if="contactsPath"
            :d="contactsPath"
            fill="none"
            stroke="#3b82f6"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="drop-shadow-sm"
          />

          <!-- Linha de vendas (verde) -->
          <path
            v-if="salesPath"
            :d="salesPath"
            fill="none"
            stroke="#10b981"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="drop-shadow-sm"
          />

          <!-- Eixo X - Labels -->
          <g>
            <text
              v-for="(item, idx) in xAxisLabels"
              :key="idx"
              :x="item.x"
              :y="chartHeight - 10"
              text-anchor="middle"
              class="text-xs fill-slate-400 font-medium"
              transform-origin="center"
            >
              {{ item.label }}
            </text>
          </g>

          <!-- Hover: Linha vertical tracejada -->
          <line
            v-if="hoveredPoint"
            :x1="hoverLineX"
            :y1="paddingTop"
            :x2="hoverLineX"
            :y2="chartHeight - paddingBottom"
            stroke="#cbd5e1"
            stroke-width="1.5"
            stroke-dasharray="5 5"
            opacity="0.8"
          />

          <!-- Hover: Círculos nos pontos -->
          <g v-if="hoveredPoint">
            <circle
              v-if="showContacts"
              :cx="hoveredPoint.x"
              :cy="hoveredPoint.contactsY"
              r="6"
              fill="#3b82f6"
              stroke="white"
              stroke-width="3"
              class="drop-shadow-md"
            />
            <circle
              v-if="showSales"
              :cx="hoveredPoint.x"
              :cy="hoveredPoint.salesY"
              r="6"
              fill="#10b981"
              stroke="white"
              stroke-width="3"
              class="drop-shadow-md"
            />
          </g>

          <!-- Marcadores de Anotações (G5.6) -->
          <g v-for="ann in visibleAnnotations" :key="ann.id">
            <line
              :x1="getAnnotationX(ann.date)"
              :y1="paddingTop"
              :x2="getAnnotationX(ann.date)"
              :y2="chartHeight - paddingBottom"
              :stroke="ann.color"
              stroke-width="2"
              stroke-dasharray="4 2"
              opacity="0.7"
            />
            <g 
              :transform="`translate(${getAnnotationX(ann.date) - 8}, ${paddingTop - 5})`"
              class="cursor-pointer"
              @click.stop="editAnnotation(ann)"
            >
              <rect
                x="0"
                y="0"
                width="16"
                height="16"
                rx="3"
                :fill="ann.color"
                class="hover:opacity-80 transition-opacity"
              />
              <text
                x="8"
                y="12"
                text-anchor="middle"
                fill="white"
                font-size="10"
                font-weight="bold"
              >!</text>
            </g>
          </g>

          <!-- Botão para adicionar anotação no hover -->
          <g v-if="hoveredPoint && !hoveredPointAnnotation">
            <g 
              :transform="`translate(${hoveredPoint.x - 10}, ${paddingTop - 8})`"
              class="cursor-pointer opacity-50 hover:opacity-100 transition-opacity"
              @click.stop="openAnnotationModal(hoveredPoint.date)"
            >
              <circle
                cx="10"
                cy="10"
                r="10"
                fill="#f1f5f9"
                stroke="#cbd5e1"
                stroke-width="1"
              />
              <text
                x="10"
                y="14"
                text-anchor="middle"
                fill="#64748b"
                font-size="14"
                font-weight="bold"
              >+</text>
            </g>
          </g>
        </svg>

        <!-- Tooltip -->
        <div
          v-if="tooltipVisible && hoveredPoint"
          class="absolute pointer-events-none bg-white border border-slate-200/80 rounded-xl shadow-xl p-3.5 z-10 backdrop-blur-sm"
          :style="{ 
            left: `${tooltipX}px`, 
            top: `${tooltipY}px`,
            transform: 'translateX(-50%)'
          }"
        >
          <div class="text-sm section-title-sm mb-2.5 pb-2 border-b border-slate-100">
            {{ hoveredPoint.date }}
          </div>
          <!-- Mostrar anotação se existir -->
          <div 
            v-if="hoveredPointAnnotation"
            class="mb-2.5 pb-2 border-b border-slate-100"
          >
            <div class="flex items-center gap-1.5 mb-1">
              <Flag :size="12" :style="{ color: hoveredPointAnnotation.color }" />
              <span class="text-xs font-semibold text-slate-800">
                {{ hoveredPointAnnotation.title }}
              </span>
            </div>
            <p 
              v-if="hoveredPointAnnotation.description"
              class="text-xs text-slate-500"
            >
              {{ hoveredPointAnnotation.description }}
            </p>
          </div>
          <div v-if="showContacts" class="flex items-center justify-between gap-4 text-sm mb-1.5">
            <div class="flex items-center gap-2">
              <div class="w-2.5 h-2.5 rounded-full bg-info"></div>
              <span class="text-slate-600">Contatos</span>
            </div>
            <span class="section-title-sm">{{ hoveredPoint.contacts }}</span>
          </div>
          <div v-if="showSales" class="flex items-center justify-between gap-4 text-sm">
            <div class="flex items-center gap-2">
              <div class="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
              <span class="text-slate-600">Vendas</span>
            </div>
            <span class="section-title-sm">{{ hoveredPoint.sales }}</span>
          </div>
        </div>
      </div>

      <!-- Modal de Anotação (G5.6) -->
      <Modal
        :open="showAnnotationModal"
        :title="editingAnnotationId ? 'Editar Anotação' : 'Adicionar Anotação'"
        size="md"
        @update:open="showAnnotationModal = $event"
      >
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Data</label>
            <input
              :value="annotationForm.date"
              disabled
              class="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-600"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Título *</label>
            <input
              v-model="annotationForm.title"
              placeholder="Ex: Campanha Black Friday"
              class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Descrição (opcional)</label>
            <textarea
              v-model="annotationForm.description"
              rows="2"
              placeholder="Adicione detalhes sobre o evento..."
              class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Cor</label>
            <div class="flex gap-2">
              <button
                v-for="color in annotationColors"
                :key="color"
                type="button"
                class="w-8 h-8 rounded-full border-2 transition-all"
                :class="annotationForm.color === color ? 'ring-2 ring-offset-2 ring-slate-400' : 'border-transparent'"
                :style="{ backgroundColor: color }"
                @click="annotationForm.color = color"
              />
            </div>
          </div>
        </div>

        <template #footer>
          <Button
            v-if="editingAnnotationId"
            type="button"
            variant="ghost"
            class="mr-auto text-destructive hover:bg-destructive/10 hover:text-destructive"
            @click="deleteAnnotation(editingAnnotationId)"
          >
            Excluir
          </Button>
          <Button
            type="button"
            variant="ghost"
            class="text-slate-600 hover:text-slate-700"
            @click="showAnnotationModal = false"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            :disabled="!annotationForm.title.trim()"
            @click="saveAnnotation"
          >
            Salvar
          </Button>
        </template>
      </Modal>

      <!-- Legenda compacta com totais do período -->
      <div class="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 sm:mt-8 sm:gap-8">
        <div v-if="showContacts" class="flex items-center gap-3">
          <div class="flex items-center gap-2">
            <div class="w-10 h-0.5 bg-info rounded-full"></div>
            <span class="text-sm text-slate-600">Contatos</span>
          </div>
          <span class="text-base section-title-sm">{{ totalContactsPeriod }}</span>
        </div>
        <div v-if="showSales" class="flex items-center gap-3">
          <div class="flex items-center gap-2">
            <div class="w-10 h-0.5 bg-emerald-500 rounded-full"></div>
            <span class="text-sm text-slate-600">Vendas</span>
          </div>
          <span class="text-base section-title-sm">{{ totalSalesPeriod }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
