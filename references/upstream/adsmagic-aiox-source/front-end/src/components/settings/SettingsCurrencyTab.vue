<template>
  <div class="space-y-6">
    <!-- Currency Settings -->
    <div class="space-y-4">
      <div>
        <h3 class="section-title-sm mb-2">Moeda e Fuso Horário</h3>
        <p class="text-sm text-muted-foreground">
          Configure a moeda padrão e fuso horário do projeto
        </p>
      </div>

      <div class="grid gap-4 md:grid-cols-2">
        <!-- Currency -->
        <div class="space-y-2">
          <Label for="currency">Moeda Padrão</Label>
          <CurrencySelector
            v-model="formData.currency"
            :disabled="loading"
          />
        </div>

        <!-- Timezone -->
        <div class="space-y-2">
          <Label for="timezone">Fuso Horário</Label>
          <TimezoneSelector
            v-model="formData.timezone"
            :disabled="loading"
          />
        </div>
      </div>
    </div>

    <!-- Date and Time Format -->
    <div class="space-y-4">
      <div>
        <h3 class="section-title-sm mb-2">Formatos de Data e Hora</h3>
        <p class="text-sm text-muted-foreground">
          Personalize como datas e horas são exibidas
        </p>
      </div>

      <div class="grid gap-4 md:grid-cols-2">
        <!-- Date Format -->
        <div class="space-y-2">
          <Label for="dateFormat">Formato de Data</Label>
          <Select
            v-model="formData.dateFormat"
            :disabled="loading"
            :options="dateFormatOptions"
          >
            <SelectTrigger id="dateFormat">
              <SelectValue placeholder="Selecione o formato" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DD/MM/YYYY">
                <div class="flex items-center space-x-2">
                  <span>DD/MM/YYYY</span>
                  <span class="text-sm text-muted-foreground">(Brasil)</span>
                </div>
              </SelectItem>
              <SelectItem value="MM/DD/YYYY">
                <div class="flex items-center space-x-2">
                  <span>MM/DD/YYYY</span>
                  <span class="text-sm text-muted-foreground">(EUA)</span>
                </div>
              </SelectItem>
              <SelectItem value="YYYY-MM-DD">
                <div class="flex items-center space-x-2">
                  <span>YYYY-MM-DD</span>
                  <span class="text-sm text-muted-foreground">(ISO)</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- Time Format -->
        <div class="space-y-2">
          <Label for="timeFormat">Formato de Hora</Label>
          <Select
            v-model="formData.timeFormat"
            :disabled="loading"
            :options="timeFormatOptions"
          >
            <SelectTrigger id="timeFormat">
              <SelectValue placeholder="Selecione o formato" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">
                <div class="flex items-center space-x-2">
                  <span>24 horas</span>
                  <span class="text-sm text-muted-foreground">(14:30)</span>
                </div>
              </SelectItem>
              <SelectItem value="12h">
                <div class="flex items-center space-x-2">
                  <span>12 horas</span>
                  <span class="text-sm text-muted-foreground">(2:30 PM)</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>

    <!-- Number Format -->
    <div class="space-y-4">
      <div>
        <h3 class="section-title-sm mb-2">Formato de Números</h3>
        <p class="text-sm text-muted-foreground">
          Configure como números são formatados
        </p>
      </div>

      <div class="grid gap-4 md:grid-cols-2">
        <!-- Thousands Separator -->
        <div class="space-y-2">
          <Label for="thousandsSeparator">Separador de Milhares</Label>
          <Select
            v-model="formData.thousandsSeparator"
            :disabled="loading"
            :options="numberSeparatorOptions"
          >
            <SelectTrigger id="thousandsSeparator">
              <SelectValue placeholder="Selecione o separador" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value=".">
                <div class="flex items-center space-x-2">
                  <span>Ponto (.)</span>
                  <span class="text-sm text-muted-foreground">1.000.000</span>
                </div>
              </SelectItem>
              <SelectItem value=",">
                <div class="flex items-center space-x-2">
                  <span>Vírgula (,)</span>
                  <span class="text-sm text-muted-foreground">1,000,000</span>
                </div>
              </SelectItem>
              <SelectItem value=" ">
                <div class="flex items-center space-x-2">
                  <span>Espaço ( )</span>
                  <span class="text-sm text-muted-foreground">1 000 000</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- Decimal Separator -->
        <div class="space-y-2">
          <Label for="decimalSeparator">Separador Decimal</Label>
          <Select
            v-model="formData.decimalSeparator"
            :disabled="loading"
            :options="decimalSeparatorOptions"
          >
            <SelectTrigger id="decimalSeparator">
              <SelectValue placeholder="Selecione o separador" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value=".">
                <div class="flex items-center space-x-2">
                  <span>Ponto (.)</span>
                  <span class="text-sm text-muted-foreground">1.234,56</span>
                </div>
              </SelectItem>
              <SelectItem value=",">
                <div class="flex items-center space-x-2">
                  <span>Vírgula (,)</span>
                  <span class="text-sm text-muted-foreground">1,234.56</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>

    <!-- Preview -->
    <div class="space-y-4">
      <div>
        <h3 class="section-title-sm mb-2">Preview dos Formatos</h3>
        <p class="text-sm text-muted-foreground">
          Veja como os formatos selecionados serão exibidos
        </p>
      </div>

      <div class="grid gap-4 md:grid-cols-2">
        <!-- Currency Preview -->
        <div class="p-4 border rounded-lg">
          <h4 class="section-title-sm mb-2">Moeda</h4>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span>Valor pequeno:</span>
              <span class="font-mono">{{ formatCurrency(123.45) }}</span>
            </div>
            <div class="flex justify-between">
              <span>Valor médio:</span>
              <span class="font-mono">{{ formatCurrency(1234.56) }}</span>
            </div>
            <div class="flex justify-between">
              <span>Valor grande:</span>
              <span class="font-mono">{{ formatCurrency(1234567.89) }}</span>
            </div>
          </div>
        </div>

        <!-- Date/Time Preview -->
        <div class="p-4 border rounded-lg">
          <h4 class="section-title-sm mb-2">Data e Hora</h4>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span>Data:</span>
              <span class="font-mono">{{ formatDate(new Date()) }}</span>
            </div>
            <div class="flex justify-between">
              <span>Hora:</span>
              <span class="font-mono">{{ formatTime(new Date()) }}</span>
            </div>
            <div class="flex justify-between">
              <span>Completo:</span>
              <span class="font-mono">{{ formatDateTime(new Date()) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Save Button -->
    <div class="flex items-center justify-end pt-4 border-t">
      <Button
        @click="handleSave"
        :disabled="loading || !hasChanges"
        :loading="loading"
      >
        <Save class="h-4 w-4" />
        Salvar Alterações
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Save } from 'lucide-vue-next'
import Button from '@/components/ui/Button.vue'
import Label from '@/components/ui/Label.vue'
import Select from '@/components/ui/Select.vue'
import SelectContent from '@/components/ui/SelectContent.vue'
import SelectItem from '@/components/ui/SelectItem.vue'
import SelectTrigger from '@/components/ui/SelectTrigger.vue'
import SelectValue from '@/components/ui/SelectValue.vue'
import CurrencySelector from '@/components/settings/CurrencySelector.vue'
import TimezoneSelector from '@/components/settings/TimezoneSelector.vue'
import type { CurrencySettings } from '@/types/models'
import { useFormat } from '@/composables/useFormat'

interface Props {
  /**
   * Configurações atuais (opcional)
   */
  settings?: CurrencySettings
  /**
   * Se true, indica loading state
   */
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const emit = defineEmits<{
  save: [data: CurrencySettings]
}>()

// ============================================================================
// STATE
// ============================================================================

const formData = ref<CurrencySettings>({
  currency: props.settings?.currency || 'BRL',
  timezone: props.settings?.timezone || 'America/Sao_Paulo',
  dateFormat: props.settings?.dateFormat || 'DD/MM/YYYY',
  timeFormat: props.settings?.timeFormat || '24h',
  thousandsSeparator: props.settings?.thousandsSeparator || '.',
  decimalSeparator: props.settings?.decimalSeparator || ','
})

// ============================================================================
// COMPOSABLES
// ============================================================================

const { formatDate, formatTime, formatCurrency, formatDateTime } = useFormat()

// ============================================================================
// COMPUTED
// ============================================================================

/**
 * Verifica se há mudanças não salvas
 */
const hasChanges = computed(() => {
  if (!props.settings) return true
  
  return (
    formData.value.currency !== props.settings.currency ||
    formData.value.timezone !== props.settings.timezone ||
    formData.value.dateFormat !== props.settings.dateFormat ||
    formData.value.timeFormat !== props.settings.timeFormat ||
    formData.value.thousandsSeparator !== props.settings.thousandsSeparator ||
    formData.value.decimalSeparator !== props.settings.decimalSeparator
  )
})

/**
 * Options para os Selects (para satisfazer TypeScript)
 */
const dateFormatOptions = [
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (Brasil)' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (EUA)' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (ISO)' }
]

const timeFormatOptions = [
  { value: '24h', label: '24 horas' },
  { value: '12h', label: '12 horas (AM/PM)' }
]

const numberSeparatorOptions = [
  { value: ',', label: 'Vírgula (,)' },
  { value: '.', label: 'Ponto (.)' },
  { value: ' ', label: 'Espaço ( )' }
]

const decimalSeparatorOptions = [
  { value: ',', label: 'Vírgula (,)' },
  { value: '.', label: 'Ponto (.)' }
]

// ============================================================================
// WATCHERS
// ============================================================================

/**
 * Sincroniza formData com props quando settings mudam
 */
watch(
  () => props.settings,
  (newSettings) => {
    if (newSettings) {
      formData.value = { ...newSettings }
    }
  },
  { immediate: true }
)

// ============================================================================
// HANDLERS
// ============================================================================

const handleSave = () => {
  emit('save', { ...formData.value })
}
</script>
