import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { mockSales, mockStages, type Sale, type SaleStage } from '@/data/sales'

export const useSalesStore = defineStore('sales', () => {
  const sales = ref<Sale[]>(mockSales)
  const stages = ref<SaleStage[]>(mockStages)

  function getSalesByStage(stageId: string) {
    return sales.value.filter(s => s.stageId === stageId)
  }

  const totalPipelineValue = computed(() =>
    sales.value
      .filter(s => !['closed_won', 'closed_lost'].includes(s.stageId))
      .reduce((sum, s) => sum + s.value, 0)
  )

  return { sales, stages, getSalesByStage, totalPipelineValue }
})
