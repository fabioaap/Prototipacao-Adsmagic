<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { Filter } from 'lucide-vue-next'
import Modal from '@/components/ui/Modal.vue'
import Button from '@/components/ui/Button.vue'
import Label from '@/components/ui/Label.vue'
import Select from '@/components/ui/Select.vue'
import { useOriginsStore } from '@/stores/origins'

export interface SaleFilters {
  originIds: string[]
  minValue?: number
  maxValue?: number
  dateFrom?: string
  dateTo?: string
  city?: string
  country?: string
  device?: string
}

interface Props {
  /**
   * Controla a abertura do modal
   */
  open: boolean
  /**
   * Filtros atuais
   */
  filters: SaleFilters
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  apply: [filters: SaleFilters]
  clear: []
}>()

const originsStore = useOriginsStore()

// Estado local dos filtros
const localFilters = ref<SaleFilters>({ ...props.filters })

// Computed para options de origens
const originOptions = computed(() => {
  return [
    { value: '', label: 'Todas as origens' },
    ...originsStore.origins.map(origin => ({
      value: origin.id,
      label: origin.name
    }))
  ]
})

// Sync filtros externos com internos
watch(() => props.filters, (newFilters) => {
  localFilters.value = { ...newFilters }
}, { deep: true })

// Handlers
const handleClose = () => {
  emit('update:open', false)
}

const handleApply = () => {
  emit('apply', localFilters.value)
  handleClose()
}

const handleClear = () => {
  localFilters.value = {
    originIds: [],
    minValue: undefined,
    maxValue: undefined,
    dateFrom: '',
    dateTo: '',
    city: '',
    country: '',
    device: '',
  }
  selectedOrigin.value = ''
  selectedValueRange.value = ''
  selectedPeriod.value = ''
  emit('clear')
  handleClose()
}

// Faixa de valor options
const valueRangeOptions = [
  { value: '', label: 'Todos os valores' },
  { value: '0-1000', label: 'Até R$ 1.000' },
  { value: '1000-5000', label: 'R$ 1.000 - R$ 5.000' },
  { value: '5000-10000', label: 'R$ 5.000 - R$ 10.000' },
  { value: '10000-50000', label: 'R$ 10.000 - R$ 50.000' },
  { value: '50000-', label: 'Acima de R$ 50.000' },
]

// Período options
const periodOptions = [
  { value: '', label: 'Todo o período' },
  { value: 'today', label: 'Hoje' },
  { value: 'yesterday', label: 'Ontem' },
  { value: 'last7days', label: 'Últimos 7 dias' },
  { value: 'last30days', label: 'Últimos 30 dias' },
  { value: 'thisMonth', label: 'Este mês' },
  { value: 'lastMonth', label: 'Mês passado' },
  { value: 'last3months', label: 'Últimos 3 meses' },
  { value: 'thisYear', label: 'Este ano' },
]

// Localização options (cidades brasileiras principais)
const cityOptions = [
  { value: '', label: 'Todas as cidades' },
  { value: 'São Paulo', label: 'São Paulo' },
  { value: 'Rio de Janeiro', label: 'Rio de Janeiro' },
  { value: 'Brasília', label: 'Brasília' },
  { value: 'Salvador', label: 'Salvador' },
  { value: 'Fortaleza', label: 'Fortaleza' },
  { value: 'Belo Horizonte', label: 'Belo Horizonte' },
  { value: 'Manaus', label: 'Manaus' },
  { value: 'Curitiba', label: 'Curitiba' },
  { value: 'Recife', label: 'Recife' },
  { value: 'Porto Alegre', label: 'Porto Alegre' },
]

const countryOptions = [
  { value: '', label: 'Todos os países' },
  { value: 'BR', label: 'Brasil' },
  { value: 'US', label: 'Estados Unidos' },
  { value: 'AR', label: 'Argentina' },
  { value: 'PT', label: 'Portugal' },
  { value: 'ES', label: 'Espanha' },
]

// Device options
const deviceOptions = [
  { value: '', label: 'Todos' },
  { value: 'desktop', label: 'Desktop' },
  { value: 'mobile', label: 'Mobile' },
  { value: 'tablet', label: 'Tablet' },
]

// Helper para converter valor selecionado em min/max
function handleValueRangeChange(value: string) {
  if (!value) {
    localFilters.value.minValue = undefined
    localFilters.value.maxValue = undefined
    return
  }
  const [min, max] = value.split('-').map(v => v ? parseFloat(v) : undefined)
  localFilters.value.minValue = min
  localFilters.value.maxValue = max
}

// Helper para converter período selecionado em datas
function handlePeriodChange(value: string) {
  if (!value) {
    localFilters.value.dateFrom = ''
    localFilters.value.dateTo = ''
    return
  }

  const today = new Date()
  const getDateString = (date: Date) => date.toISOString().split('T')[0]
  
  switch(value) {
    case 'today':
      localFilters.value.dateFrom = getDateString(today)
      localFilters.value.dateTo = getDateString(today)
      break
    case 'yesterday':
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      localFilters.value.dateFrom = getDateString(yesterday)
      localFilters.value.dateTo = getDateString(yesterday)
      break
    case 'last7days':
      const last7 = new Date(today)
      last7.setDate(last7.getDate() - 7)
      localFilters.value.dateFrom = getDateString(last7)
      localFilters.value.dateTo = getDateString(today)
      break
    case 'last30days':
      const last30 = new Date(today)
      last30.setDate(last30.getDate() - 30)
      localFilters.value.dateFrom = getDateString(last30)
      localFilters.value.dateTo = getDateString(today)
      break
    case 'thisMonth':
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
      localFilters.value.dateFrom = getDateString(firstDay)
      localFilters.value.dateTo = getDateString(today)
      break
    case 'lastMonth':
      const lastMonthFirst = new Date(today.getFullYear(), today.getMonth() - 1, 1)
      const lastMonthLast = new Date(today.getFullYear(), today.getMonth(), 0)
      localFilters.value.dateFrom = getDateString(lastMonthFirst)
      localFilters.value.dateTo = getDateString(lastMonthLast)
      break
    case 'last3months':
      const last3months = new Date(today)
      last3months.setMonth(last3months.getMonth() - 3)
      localFilters.value.dateFrom = getDateString(last3months)
      localFilters.value.dateTo = getDateString(today)
      break
    case 'thisYear':
      const yearStart = new Date(today.getFullYear(), 0, 1)
      localFilters.value.dateFrom = getDateString(yearStart)
      localFilters.value.dateTo = getDateString(today)
      break
  }
}

// Estado local para controlar os selects
const selectedOrigin = ref('')
const selectedValueRange = ref('')
const selectedPeriod = ref('')

// Helper para converter origem selecionada
function handleOriginChange(value: string) {
  if (!value) {
    localFilters.value.originIds = []
  } else {
    localFilters.value.originIds = [value]
  }
}
</script>

<template>
  <Modal
    :open="props.open" 
    size="lg"
    title="Filtros Avançados"
    :no-padding="true"
    @update:open="emit('update:open', $event)"
  >
    <template #header>
      <div class="flex items-center gap-2">
        <Filter class="h-5 w-5 text-primary" />
        <h2 class="section-title-sm">Filtros Avançados</h2>
      </div>
    </template>

    <template #content>
      <div class="px-6 py-4">
        <!-- Filters Form -->
        <div class="space-y-6">
          <!-- Origens -->
          <div class="space-y-2">
            <Label>Origem</Label>
            <Select
              :model-value="selectedOrigin"
              @update:model-value="(value: string) => { selectedOrigin = value; handleOriginChange(value) }"
              :options="originOptions"
              placeholder="Todas as origens"
            />
          </div>

          <!-- Valor -->
          <div class="space-y-2">
            <Label>Faixa de Valor</Label>
          <Select
            :model-value="selectedValueRange"
            @update:model-value="(value: string) => { selectedValueRange = value; handleValueRangeChange(value) }"
            :options="valueRangeOptions"
            placeholder="Selecione a faixa de valor"
          />
        </div>

        <!-- Período -->
        <div class="space-y-2">
          <Label>Período</Label>
          <Select
            :model-value="selectedPeriod"
            @update:model-value="(value: string) => { selectedPeriod = value; handlePeriodChange(value) }"
            :options="periodOptions"
            placeholder="Selecione o período"
          />
        </div>

        <!-- Localização -->
        <div class="space-y-2">
          <Label>Localização</Label>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <Select
                :model-value="localFilters.city || ''"
                @update:model-value="(value: string) => { localFilters.city = value || undefined }"
                :options="cityOptions"
                placeholder="Cidade"
              />
            </div>
            <div>
              <Select
                :model-value="localFilters.country || ''"
                @update:model-value="(value: string) => { localFilters.country = value || undefined }"
                :options="countryOptions"
                placeholder="País"
              />
            </div>
          </div>
        </div>

        <!-- Dispositivo -->
          <div class="space-y-2">
            <Label>Dispositivo</Label>
            <Select
              :model-value="localFilters.device || ''"
              @update:model-value="(value: string) => { localFilters.device = value || undefined }"
              :options="deviceOptions"
              placeholder="Todos os dispositivos"
            />
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
        <Button
          variant="outline"
          @click="handleClear"
        >
          Limpar Filtros
        </Button>
        <Button @click="handleApply">
          Aplicar Filtros
        </Button>
      </div>
    </template>
  </Modal>
</template>
