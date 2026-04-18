<template>
  <div class="space-y-2">
    <Label for="timezone">Fuso Horário</Label>
    <Select
      :model-value="modelValue"
      @update:model-value="handleUpdate"
      :disabled="disabled"
      :options="timezoneOptions"
    >
      <SelectTrigger id="timezone">
        <SelectValue placeholder="Selecione um fuso horário" />
      </SelectTrigger>
      <SelectContent>
        <!-- Auto Detect -->
        <div class="px-2 py-1.5 text-xs font-medium text-muted-foreground">
          Detecção Automática
        </div>
        <SelectItem
          :value="detectedTimezone"
          class="bg-blue-50 dark:bg-blue-900/20"
        >
          <div class="flex items-center space-x-2">
            <Globe class="h-4 w-4 text-blue-600" />
            <div>
              <div class="font-medium">{{ detectedTimezoneLabel }}</div>
              <div class="text-xs text-muted-foreground">Detectado automaticamente</div>
            </div>
          </div>
        </SelectItem>

        <SelectSeparator />

        <!-- Brazil Timezones -->
        <div class="px-2 py-1.5 text-xs font-medium text-muted-foreground">
          Brasil
        </div>
        <SelectItem
          v-for="timezone in brazilTimezones"
          :key="timezone.value"
          :value="timezone.value"
        >
          <div class="flex items-center space-x-2">
            <Clock class="h-4 w-4 text-green-600" />
            <div>
              <div class="font-medium">{{ timezone.label }}</div>
              <div class="text-xs text-muted-foreground">{{ timezone.offset > 0 ? '+' : '' }}{{ timezone.offset }}h</div>
            </div>
          </div>
        </SelectItem>

        <SelectSeparator />

        <!-- Other Common Timezones -->
        <div class="px-2 py-1.5 text-xs font-medium text-muted-foreground">
          Outros Fusos
        </div>
        <SelectItem
          v-for="timezone in commonTimezones"
          :key="timezone.value"
          :value="timezone.value"
        >
          <div class="flex items-center space-x-2">
            <Globe class="h-4 w-4 text-muted-foreground" />
            <div>
              <div class="font-medium">{{ timezone.label }}</div>
              <div class="text-xs text-muted-foreground">{{ timezone.offset > 0 ? '+' : '' }}{{ timezone.offset }}h</div>
            </div>
          </div>
        </SelectItem>
      </SelectContent>
    </Select>

    <!-- Preview -->
    <div v-if="selectedTimezone" class="p-3 bg-muted/50 rounded-lg">
      <div class="flex items-center space-x-2">
        <Clock class="h-4 w-4 text-muted-foreground" />
        <div>
          <div class="text-sm font-medium">{{ selectedTimezone.label }}</div>
          <div class="text-xs text-muted-foreground">
            Hora atual: {{ currentTime }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Clock, Globe } from 'lucide-vue-next'
import Select from '@/components/ui/Select.vue'
import SelectContent from '@/components/ui/SelectContent.vue'
import SelectItem from '@/components/ui/SelectItem.vue'
import SelectSeparator from '@/components/ui/SelectSeparator.vue'
import SelectTrigger from '@/components/ui/SelectTrigger.vue'
import SelectValue from '@/components/ui/SelectValue.vue'
import Label from '@/components/ui/Label.vue'

interface Props {
  /**
   * Valor selecionado (timezone identifier)
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
// STATE
// ============================================================================

const currentTime = ref('')
const timeInterval = ref<NodeJS.Timeout | null>(null)

// ============================================================================
// DATA
// ============================================================================

const brazilTimezones = [
  { value: 'America/Sao_Paulo', label: 'Brasília (GMT-3)', offset: -3 },
  { value: 'America/Manaus', label: 'Manaus (GMT-4)', offset: -4 },
  { value: 'America/Rio_Branco', label: 'Acre (GMT-5)', offset: -5 },
  { value: 'America/Noronha', label: 'Fernando de Noronha (GMT-2)', offset: -2 }
]

const commonTimezones = [
  { value: 'America/New_York', label: 'Nova York (GMT-5)', offset: -5 },
  { value: 'America/Los_Angeles', label: 'Los Angeles (GMT-8)', offset: -8 },
  { value: 'Europe/London', label: 'Londres (GMT+0)', offset: 0 },
  { value: 'Europe/Paris', label: 'Paris (GMT+1)', offset: 1 },
  { value: 'Asia/Tokyo', label: 'Tóquio (GMT+9)', offset: 9 },
  { value: 'Asia/Shanghai', label: 'Xangai (GMT+8)', offset: 8 },
  { value: 'Australia/Sydney', label: 'Sydney (GMT+10)', offset: 10 },
  { value: 'UTC', label: 'UTC (GMT+0)', offset: 0 }
]

// ============================================================================
// COMPUTED
// ============================================================================

/**
 * Timezone detectado automaticamente
 */
const detectedTimezone = computed(() => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch (error) {
    return 'America/Sao_Paulo' // Fallback para Brasil
  }
})

/**
 * Label do timezone detectado
 */
const detectedTimezoneLabel = computed(() => {
  const timezone = detectedTimezone.value
  const brazilTz = brazilTimezones.find(tz => tz.value === timezone)
  const commonTz = commonTimezones.find(tz => tz.value === timezone)
  
  if (brazilTz) return brazilTz.label
  if (commonTz) return commonTz.label
  
  // Fallback: tentar extrair informações do timezone
  try {
    const now = new Date()
    const offset = -now.getTimezoneOffset() / 60
    const offsetStr = offset > 0 ? `GMT+${offset}` : `GMT${offset}`
    return `${timezone} (${offsetStr})`
  } catch (error) {
    return timezone
  }
})

/**
 * Timezone selecionado
 */
const selectedTimezone = computed(() => {
  const brazilTz = brazilTimezones.find(tz => tz.value === props.modelValue)
  const commonTz = commonTimezones.find(tz => tz.value === props.modelValue)
  
  if (brazilTz) return brazilTz
  if (commonTz) return commonTz
  
  // Fallback para timezone customizado
  return {
    value: props.modelValue,
    label: props.modelValue,
    offset: 0
  }
})

/**
 * Options para o Select (para satisfazer TypeScript)
 */
const timezoneOptions = computed(() => {
  const all = [
    { value: detectedTimezone.value, label: detectedTimezoneLabel.value },
    ...brazilTimezones,
    ...commonTimezones
  ]
  return all.map(tz => ({
    value: tz.value,
    label: tz.label
  }))
})

// ============================================================================
// METHODS
// ============================================================================

/**
 * Atualiza a hora atual no timezone selecionado
 */
const updateCurrentTime = () => {
  if (!props.modelValue) return
  
  try {
    const now = new Date()
    const timeString = now.toLocaleTimeString('pt-BR', {
      timeZone: props.modelValue,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
    currentTime.value = timeString
  } catch (error) {
    currentTime.value = 'Erro ao obter hora'
  }
}

// ============================================================================
// HANDLERS
// ============================================================================

const handleUpdate = (value: string) => {
  emit('update:modelValue', value)
}

// ============================================================================
// LIFECYCLE
// ============================================================================

onMounted(() => {
  updateCurrentTime()
  timeInterval.value = setInterval(updateCurrentTime, 1000)
})

onUnmounted(() => {
  if (timeInterval.value) {
    clearInterval(timeInterval.value)
  }
})
</script>
