<template>
  <div class="space-y-2">
    <Label for="currency">Moeda</Label>
    <Select
      :model-value="modelValue"
      @update:model-value="handleUpdate"
      :disabled="disabled"
      :options="currencyOptions"
    >
      <SelectTrigger id="currency">
        <SelectValue placeholder="Selecione uma moeda" />
      </SelectTrigger>
      <SelectContent>
        <!-- Quick Selection -->
        <div class="px-2 py-1.5 text-xs font-medium text-muted-foreground">
          Seleção Rápida
        </div>
        <SelectItem
          v-for="currency in quickCurrencies"
          :key="currency.code"
          :value="currency.code"
        >
          <div class="flex items-center space-x-2">
            <span class="text-lg">{{ currency.symbol }}</span>
            <div>
              <div class="font-medium">{{ currency.code }}</div>
              <div class="text-xs text-muted-foreground">{{ currency.name }}</div>
            </div>
          </div>
        </SelectItem>

        <SelectSeparator />

        <!-- All Currencies -->
        <div class="px-2 py-1.5 text-xs font-medium text-muted-foreground">
          Todas as Moedas
        </div>
        <SelectItem
          v-for="currency in allCurrencies"
          :key="currency.code"
          :value="currency.code"
        >
          <div class="flex items-center space-x-2">
            <span class="text-lg">{{ currency.symbol }}</span>
            <div>
              <div class="font-medium">{{ currency.code }}</div>
              <div class="text-xs text-muted-foreground">{{ currency.name }}</div>
            </div>
          </div>
        </SelectItem>
      </SelectContent>
    </Select>

    <!-- Preview -->
    <div v-if="selectedCurrency" class="p-3 bg-muted/50 rounded-lg">
      <div class="flex items-center space-x-2">
        <span class="text-lg">{{ selectedCurrency.symbol }}</span>
        <div>
          <div class="text-sm font-medium">{{ selectedCurrency.code }} - {{ selectedCurrency.name }}</div>
          <div class="text-xs text-muted-foreground">
            Exemplo: {{ formatCurrency(1234.56) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Select from '@/components/ui/Select.vue'
import SelectContent from '@/components/ui/SelectContent.vue'
import SelectItem from '@/components/ui/SelectItem.vue'
import SelectSeparator from '@/components/ui/SelectSeparator.vue'
import SelectTrigger from '@/components/ui/SelectTrigger.vue'
import SelectValue from '@/components/ui/SelectValue.vue'
import Label from '@/components/ui/Label.vue'

interface Props {
  /**
   * Valor selecionado (código da moeda)
   */
  modelValue: string
  /**
   * Se true, componente está desabilitado
   */
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

// ============================================================================
// DATA
// ============================================================================

const quickCurrencies = [
  { code: 'BRL', symbol: 'R$', name: 'Real Brasileiro' },
  { code: 'USD', symbol: '$', name: 'Dólar Americano' },
  { code: 'EUR', symbol: '€', name: 'Euro' }
]

const allCurrencies = [
  { code: 'BRL', symbol: 'R$', name: 'Real Brasileiro' },
  { code: 'USD', symbol: '$', name: 'Dólar Americano' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'Libra Esterlina' },
  { code: 'JPY', symbol: '¥', name: 'Iene Japonês' },
  { code: 'CAD', symbol: 'C$', name: 'Dólar Canadense' },
  { code: 'AUD', symbol: 'A$', name: 'Dólar Australiano' },
  { code: 'CHF', symbol: 'Fr', name: 'Franco Suíço' },
  { code: 'CNY', symbol: '¥', name: 'Yuan Chinês' },
  { code: 'ARS', symbol: '$', name: 'Peso Argentino' },
  { code: 'MXN', symbol: '$', name: 'Peso Mexicano' },
  { code: 'INR', symbol: '₹', name: 'Rupia Indiana' },
  { code: 'RUB', symbol: '₽', name: 'Rublo Russo' },
  { code: 'KRW', symbol: '₩', name: 'Won Sul-Coreano' },
  { code: 'SGD', symbol: 'S$', name: 'Dólar de Singapura' },
  { code: 'HKD', symbol: 'HK$', name: 'Dólar de Hong Kong' },
  { code: 'NZD', symbol: 'NZ$', name: 'Dólar Neozelandês' },
  { code: 'SEK', symbol: 'kr', name: 'Coroa Sueca' },
  { code: 'NOK', symbol: 'kr', name: 'Coroa Norueguesa' },
  { code: 'DKK', symbol: 'kr', name: 'Coroa Dinamarquesa' }
]

// ============================================================================
// COMPUTED
// ============================================================================

/**
 * Moeda selecionada
 */
const selectedCurrency = computed(() => {
  return allCurrencies.find(currency => currency.code === props.modelValue)
})

/**
 * Options para o Select (para satisfazer TypeScript)
 */
const currencyOptions = computed(() => {
  return allCurrencies.map(currency => ({
    value: currency.code,
    label: `${currency.code} - ${currency.name}`
  }))
})

// ============================================================================
// METHODS
// ============================================================================

/**
 * Formata um valor monetário usando a moeda selecionada
 */
const formatCurrency = (value: number): string => {
  if (!selectedCurrency.value) return value.toString()
  
  try {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: selectedCurrency.value.code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)
  } catch (error) {
    // Fallback se a moeda não for suportada pelo Intl
    return `${selectedCurrency.value.symbol} ${value.toFixed(2)}`
  }
}

// ============================================================================
// HANDLERS
// ============================================================================

const handleUpdate = (value: string) => {
  emit('update:modelValue', value)
}
</script>
