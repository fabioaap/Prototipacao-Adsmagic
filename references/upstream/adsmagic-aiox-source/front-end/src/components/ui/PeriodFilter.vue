<template>
  <div class="relative">
    <!-- Trigger Button -->
    <Button
      variant="outline"
      size="sm"
      @click="toggleDropdown"
      class="h-8 px-3 text-sm"
    >
      <Calendar class="h-4 w-4 mr-2" />
      {{ selectedPeriodLabel }}
      <ChevronDown class="h-4 w-4 ml-2" />
    </Button>

    <!-- Dropdown -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0"
    >
      <div
        v-if="isOpen"
        class="absolute top-full right-0 mt-1 w-80 bg-popover border rounded-control shadow-lg z-50"
      >
        <div class="p-4">
          <!-- Quick Periods -->
          <div class="mb-4">
            <h4 class="text-sm font-medium mb-3">Períodos Rápidos</h4>
            <div class="grid grid-cols-2 gap-2">
              <Button
                v-for="period in quickPeriods"
                :key="period.value"
                variant="ghost"
                size="sm"
                @click="selectPeriod(period.value)"
                :class="{
                  'bg-accent': selectedPeriod === period.value
                }"
                class="justify-start text-xs"
              >
                {{ period.label }}
              </Button>
            </div>
          </div>

          <!-- Custom Period -->
          <div class="mb-4">
            <h4 class="text-sm font-medium mb-3">Período Personalizado</h4>
            <div class="space-y-3">
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <Label class="text-xs">Data Inicial</Label>
                  <Input
                    v-model="customStartDate"
                    type="date"
                    class="text-xs"
                    @change="handleCustomDateChange"
                  />
                </div>
                <div>
                  <Label class="text-xs">Data Final</Label>
                  <Input
                    v-model="customEndDate"
                    type="date"
                    class="text-xs"
                    @change="handleCustomDateChange"
                  />
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                @click="applyCustomPeriod"
                :disabled="!customStartDate || !customEndDate"
                class="w-full text-xs"
              >
                Aplicar Período
              </Button>
            </div>
          </div>

          <!-- Comparison -->
          <div class="mb-4">
            <div class="flex items-center space-x-2">
              <Checkbox
                v-model="enableComparison"
                @change="handleComparisonChange"
              />
              <Label class="text-sm">Comparar com período anterior</Label>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex justify-between items-center pt-3 border-t">
            <Button
              variant="ghost"
              size="sm"
              @click="resetToDefault"
              class="text-xs"
            >
              Resetar
            </Button>
            <div class="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                @click="closeDropdown"
                class="text-xs"
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                @click="applyFilter"
                class="text-xs"
              >
                Aplicar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { Calendar, ChevronDown } from 'lucide-vue-next'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Label from '@/components/ui/Label.vue'
import Checkbox from '@/components/ui/Checkbox.vue'
import { formatSafeDate } from '@/utils/formatters'

interface Period {
  value: string
  label: string
  startDate: Date
  endDate: Date
}

interface Props {
  modelValue?: string
  enableComparison?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '30d',
  enableComparison: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'update:enableComparison': [value: boolean]
  'change': [period: Period, comparison: boolean]
}>()

// Estado
const isOpen = ref(false)
const selectedPeriod = ref(props.modelValue)
const enableComparison = ref(props.enableComparison)
const customStartDate = ref('')
const customEndDate = ref('')

// Períodos rápidos
const quickPeriods = [
  { value: 'today', label: 'Hoje' },
  { value: '7d', label: '7 dias' },
  { value: '30d', label: '30 dias' },
  { value: '90d', label: '90 dias' },
  { value: '1y', label: '1 ano' },
  { value: 'ytd', label: 'Ano atual' },
  { value: 'mtd', label: 'Mês atual' },
  { value: 'custom', label: 'Personalizado' }
]

// Computed
const selectedPeriodLabel = computed(() => {
  const period = quickPeriods.find(p => p.value === selectedPeriod.value)
  if (period) {
    return period.label
  }
  
  if (selectedPeriod.value === 'custom' && customStartDate.value && customEndDate.value) {
    return `${formatDate(customStartDate.value)} - ${formatDate(customEndDate.value)}`
  }
  
  return 'Selecionar período'
})

// Métodos
const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

const closeDropdown = () => {
  isOpen.value = false
}

const selectPeriod = (value: string) => {
  selectedPeriod.value = value
}

const handleCustomDateChange = () => {
  if (customStartDate.value && customEndDate.value) {
    selectedPeriod.value = 'custom'
  }
}

const applyCustomPeriod = () => {
  if (customStartDate.value && customEndDate.value) {
    selectedPeriod.value = 'custom'
    applyFilter()
  }
}

const handleComparisonChange = (value: boolean) => {
  enableComparison.value = value
}

const resetToDefault = () => {
  selectedPeriod.value = '30d'
  enableComparison.value = false
  customStartDate.value = ''
  customEndDate.value = ''
  applyFilter()
}

const applyFilter = () => {
  const period = getPeriodData(selectedPeriod.value)
  if (period) {
    emit('update:modelValue', selectedPeriod.value)
    emit('update:enableComparison', enableComparison.value)
    emit('change', period, enableComparison.value)
    
    // Persistir no localStorage
    localStorage.setItem('adsmagic_period_filter', selectedPeriod.value)
    localStorage.setItem('adsmagic_period_comparison', enableComparison.value.toString())
  }
  
  closeDropdown()
}

const getPeriodData = (value: string): Period | null => {
  const now = new Date()
  
  switch (value) {
    case 'today':
      return {
        value: 'today',
        label: 'Hoje',
        startDate: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
        endDate: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
      }
    
    case '7d':
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      return {
        value: '7d',
        label: '7 dias',
        startDate: sevenDaysAgo,
        endDate: now
      }
    
    case '30d':
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      return {
        value: '30d',
        label: '30 dias',
        startDate: thirtyDaysAgo,
        endDate: now
      }
    
    case '90d':
      const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
      return {
        value: '90d',
        label: '90 dias',
        startDate: ninetyDaysAgo,
        endDate: now
      }
    
    case '1y':
      const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
      return {
        value: '1y',
        label: '1 ano',
        startDate: oneYearAgo,
        endDate: now
      }
    
    case 'ytd':
      const yearStart = new Date(now.getFullYear(), 0, 1)
      return {
        value: 'ytd',
        label: 'Ano atual',
        startDate: yearStart,
        endDate: now
      }
    
    case 'mtd':
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      return {
        value: 'mtd',
        label: 'Mês atual',
        startDate: monthStart,
        endDate: now
      }
    
    case 'custom':
      if (customStartDate.value && customEndDate.value) {
        return {
          value: 'custom',
          label: `${formatDate(customStartDate.value)} - ${formatDate(customEndDate.value)}`,
          startDate: new Date(customStartDate.value),
          endDate: new Date(customEndDate.value)
        }
      }
      break
  }
  
  return null
}

const formatDate = (dateString: string) => {
  return formatSafeDate(dateString, { day: '2-digit', month: '2-digit', year: 'numeric' })
}

// Click outside para fechar
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.relative')) {
    closeDropdown()
  }
}

// Lifecycle
onMounted(() => {
  // Restaurar do localStorage
  const savedPeriod = localStorage.getItem('adsmagic_period_filter')
  const savedComparison = localStorage.getItem('adsmagic_period_comparison')
  
  if (savedPeriod) {
    selectedPeriod.value = savedPeriod
  }
  
  if (savedComparison) {
    enableComparison.value = savedComparison === 'true'
  }
  
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// Watch para sincronizar com props
watch(() => props.modelValue, (newValue) => {
  selectedPeriod.value = newValue
})

watch(() => props.enableComparison, (newValue) => {
  enableComparison.value = newValue
})
</script>
