/**
 * useAnalytics Composable
 * @module composables/useAnalytics
 * @description Simplified access to analytics store with auto-loading
 */

import { computed } from 'vue';
import { useAnalyticsStore } from '@/stores/analyticsStore';
import type { Period } from '@/types/analytics';

/**
 * Composable for analytics features
 * Provides simplified access to store with automatic loading
 */
export function useAnalytics() {
    const store = useAnalyticsStore();

    // Expose core metrics as readonly computed
    const metrics = computed(() => store.metrics);
    const metricsByPeriod = computed(() => store.metricsByPeriod);
    const topOrigins = computed(() => store.topOrigins);
    const funnel = computed(() => store.funnel);
    const timeline = computed(() => store.timeline);
    const contactsByStage = computed(() => store.contactsByStage);
    const salesByOrigin = computed(() => store.salesByOrigin);

    // Loading and error states
    const isLoading = computed(() => store.isLoading);
    const error = computed(() => store.error);
    const isEmpty = computed(() => store.isEmpty);

    // Key metrics
    const totalContacts = computed(() => store.totalContacts);
    const totalSales = computed(() => store.totalSales);
    const totalRevenue = computed(() => store.totalRevenue);
    const conversionRate = computed(() => store.conversionRate);

    // Growth metrics
    const growth = computed(() => ({
        contacts: store.contactsGrowth,
        sales: store.salesGrowth,
        revenue: store.revenueGrowth,
        conversion: store.conversionGrowth,
    }));

    // Top performers
    const topOrigin = computed(() => store.topOrigin);
    const bestStage = computed(() => store.bestStage);

    // Chart data for visualization
    const chartData = computed(() => store.chartData);

    // Methods
    const fetchDashboard = (projectId: string) => store.fetchDashboardData(projectId);
    const refreshData = (projectId: string) => store.refreshMetrics(projectId);
    const setPeriod = (projectId: string, period: Period) => store.setPeriodFilter(projectId, period);
    const setOrigin = (originId: string | null) => store.setOriginFilter(originId);
    const setStage = (stageId: string | null) => store.setStageFilter(stageId);
    const clearAll = () => store.reset();

    return {
        // State
        metrics,
        metricsByPeriod,
        topOrigins,
        funnel,
        timeline,
        contactsByStage,
        salesByOrigin,

        // Loading and errors
        isLoading,
        error,
        isEmpty,

        // Key metrics
        totalContacts,
        totalSales,
        totalRevenue,
        conversionRate,
        growth,
        topOrigin,
        bestStage,

        // Chart data
        chartData,

        // Methods
        fetchDashboard,
        refreshData,
        setPeriod,
        setOrigin,
        setStage,
        clearAll,
    };
}
