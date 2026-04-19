<script setup lang="ts">
import { computed } from 'vue'
import { DateRangePicker } from '@/components/ui/date-range-picker'

export interface DateRange {
  startDate: string
  endDate: string
  preset?: string
}

interface Props {
  startDate?: string
  endDate?: string
}

const props = withDefaults(defineProps<Props>(), {
  startDate: '',
  endDate: ''
})

const emit = defineEmits<{
  'update:startDate': [value: string | undefined]
  'update:endDate': [value: string | undefined]
  'change': [value: DateRange]
}>()

const dateRange = computed(() => {
  if (props.startDate && props.endDate) {
    return {
      start: new Date(props.startDate),
      end: new Date(props.endDate)
    }
  }
  return undefined
})

function handleDateRangeChange(range: { start: Date; end: Date }) {
  const startDateStr = range.start.toISOString().split('T')[0] as string
  const endDateStr = range.end.toISOString().split('T')[0] as string
  
  emit('update:startDate', startDateStr)
  emit('update:endDate', endDateStr)
  emit('change', {
    startDate: startDateStr,
    endDate: endDateStr
  })
}
</script>

<template>
  <div class="flex items-center">
    <DateRangePicker
      :model-value="dateRange"
      :show-presets="true"
      @change="handleDateRangeChange"
    />
  </div>
</template>
        :for="'compare-checkbox'"
        class="text-sm font-normal cursor-pointer"
      >
        {{ t('dashboard.period.compare') }}
      </Label>
    </div>
  </div>
</template>
