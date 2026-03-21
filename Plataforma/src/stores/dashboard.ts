import { defineStore } from 'pinia'
import { mockMetrics, mockLeadsByOrigin, mockRevenueByMonth } from '@/data/dashboard'

export const useDashboardStore = defineStore('dashboard', () => {
  const metrics = mockMetrics
  const leadsByOrigin = mockLeadsByOrigin
  const revenueByMonth = mockRevenueByMonth

  return { metrics, leadsByOrigin, revenueByMonth }
})
