/**
 * Analytics Store
 * @module stores/analyticsStore
 * @description Pinia store for managing analytics state and data
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { analyticsService } from '@/services/api/analyticsService';
import type {
    DashboardMetrics,
    MetricByPeriod,
    TopOrigin,
    FunnelStage,
    ChartDataPoint,
    Period,
} from '@/types/analytics';

export const useAnalyticsStore = defineStore('analytics', () => {
    // =========================================================================
    // STATE
    // =========================================================================

    const metrics = ref<DashboardMetrics | null>(null);
    const metricsByPeriod = ref<MetricByPeriod | null>(null);
    const topOrigins = ref<TopOrigin[]>([]);
    const funnel = ref<FunnelStage[]>([]);
    const timeline = ref<ChartDataPoint[]>([]);
    const contactsByStage = ref<Array<{
        stageId: string;
        stageName: string;
        contactCount: number;
        percentage: number;
    }>>([]);
    const salesByOrigin = ref<Array<{
        originId: string;
        originName: string;
        icon: string;
        color: string;
        salesCount: number;
        revenue: number;
        averageValue: number;
    }>>([]);

    const loading = ref(false);
    const error = ref<string | null>(null);
    const lastUpdated = ref<Date | null>(null);

    // Filter state
    const period = ref<Period>('month');
    const startDate = ref<Date | null>(null);
    const endDate = ref<Date | null>(null);
    const selectedOriginId = ref<string | null>(null);
    const selectedStageId = ref<string | null>(null);

    // =========================================================================
    // COMPUTED
    // =========================================================================

    const totalContacts = computed(() => metrics.value?.totalContacts ?? 0);
    const totalSales = computed(() => metrics.value?.totalSales ?? 0);
    const totalRevenue = computed(() => metrics.value?.totalRevenue ?? 0);
    const conversionRate = computed(() => metrics.value?.conversionRate ?? 0);
    const averageValuePerContact = computed(
        () => metrics.value?.averageValuePerContact ?? 0
    );

    // Growth metrics
    const contactsGrowth = computed(() => metricsByPeriod.value?.growth.contacts ?? 0);
    const salesGrowth = computed(() => metricsByPeriod.value?.growth.sales ?? 0);
    const revenueGrowth = computed(() => metricsByPeriod.value?.growth.revenue ?? 0);
    const conversionGrowth = computed(() => metricsByPeriod.value?.growth.conversion ?? 0);

    // Top origin
    const topOrigin = computed(() => topOrigins.value[0] || null);

    // Best and worst stages
    const bestStage = computed(() => {
        if (funnel.value.length === 0) return null;
        return funnel.value.reduce((best, stage) =>
            stage.conversionFromPrevious > (best?.conversionFromPrevious ?? 0) ? stage : best
        );
    });

    const worstStage = computed(() => {
        if (funnel.value.length === 0) return null;
        return funnel.value.reduce((worst, stage) =>
            stage.conversionFromPrevious < (worst?.conversionFromPrevious ?? Infinity) ? stage : worst
        );
    });

    // Timeline data
    const chartData = computed(() => ({
        dates: timeline.value.map(d => d.date),
        contacts: timeline.value.map(d => d.contacts),
        sales: timeline.value.map(d => d.sales),
        revenue: timeline.value.map(d => d.revenue),
    }));

    // Is data loading or empty
    const isLoading = computed(() => loading.value);
    const isEmpty = computed(() => totalContacts.value === 0 && totalSales.value === 0);
    const hasError = computed(() => error.value !== null);

    // =========================================================================
    // ACTIONS
    // =========================================================================

    /**
     * Fetch all dashboard analytics data
     * @param projectId - Project UUID
     */
    async function fetchDashboardData(projectId: string) {
        loading.value = true;
        error.value = null;

        try {
            const data = await analyticsService.fetchDashboardData(projectId);

            metrics.value = data.metrics;
            metricsByPeriod.value = data.metricsByPeriod;
            topOrigins.value = data.topOrigins;
            funnel.value = data.funnel;
            timeline.value = data.timeline;
            contactsByStage.value = data.contactsByStage;
            salesByOrigin.value = data.salesByOrigin;

            lastUpdated.value = new Date();
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Failed to fetch analytics data';
            console.error('Error fetching dashboard data:', err);
        } finally {
            loading.value = false;
        }
    }

    /**
     * Fetch metrics for a specific period
     * @param projectId - Project UUID
     * @param selectedPeriod - Period (today, week, month)
     */
    async function fetchMetricsByPeriod(projectId: string, selectedPeriod: Period) {
        loading.value = true;
        error.value = null;

        try {
            const data = await analyticsService.getMetricsByPeriod(projectId, selectedPeriod);
            metricsByPeriod.value = data;
            period.value = selectedPeriod;
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Failed to fetch metrics';
            console.error('Error fetching metrics by period:', err);
        } finally {
            loading.value = false;
        }
    }

    /**
     * Fetch only consolidated metrics
     * @param projectId - Project UUID
     */
    async function fetchMetrics(projectId: string) {
        error.value = null;

        try {
            metrics.value = await analyticsService.getMetrics(projectId);
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Failed to fetch metrics';
            console.error('Error fetching metrics:', err);
        }
    }

    /**
     * Fetch top performing origins
     * @param projectId - Project UUID
     * @param limit - Number of origins to fetch
     */
    async function fetchTopOrigins(projectId: string, limit: number = 10) {
        error.value = null;

        try {
            topOrigins.value = await analyticsService.getTopOrigins(projectId, limit);
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Failed to fetch origins';
            console.error('Error fetching top origins:', err);
        }
    }

    /**
     * Fetch conversion funnel
     * @param projectId - Project UUID
     */
    async function fetchFunnel(projectId: string) {
        error.value = null;

        try {
            funnel.value = await analyticsService.getFunnel(projectId);
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Failed to fetch funnel';
            console.error('Error fetching funnel:', err);
        }
    }

    /**
     * Fetch historical timeline data
     * @param projectId - Project UUID
     * @param days - Number of days to fetch
     */
    async function fetchTimeline(projectId: string, days: number = 30) {
        error.value = null;

        try {
            timeline.value = await analyticsService.getTimeline(projectId, days);
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Failed to fetch timeline';
            console.error('Error fetching timeline:', err);
        }
    }

    /**
     * Fetch contact distribution by stage
     * @param projectId - Project UUID
     */
    async function fetchContactsByStage(projectId: string) {
        error.value = null;

        try {
            contactsByStage.value = await analyticsService.getContactsByStage(projectId);
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Failed to fetch contacts by stage';
            console.error('Error fetching contacts by stage:', err);
        }
    }

    /**
     * Fetch sales metrics by origin
     * @param projectId - Project UUID
     */
    async function fetchSalesByOrigin(projectId: string) {
        error.value = null;

        try {
            salesByOrigin.value = await analyticsService.getSalesByOrigin(projectId);
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Failed to fetch sales by origin';
            console.error('Error fetching sales by origin:', err);
        }
    }

    /**
     * Set period filter and fetch updated metrics
     * @param projectId - Project UUID
     * @param newPeriod - Period (today, week, month)
     */
    async function setPeriodFilter(projectId: string, newPeriod: Period) {
        period.value = newPeriod;
        await fetchMetricsByPeriod(projectId, newPeriod);
    }

    /**
     * Set origin filter
     * @param originId - Origin UUID or null to clear
     */
    function setOriginFilter(originId: string | null) {
        selectedOriginId.value = originId;
    }

    /**
     * Set stage filter
     * @param stageId - Stage UUID or null to clear
     */
    function setStageFilter(stageId: string | null) {
        selectedStageId.value = stageId;
    }

    /**
     * Clear all filters
     */
    function clearFilters() {
        selectedOriginId.value = null;
        selectedStageId.value = null;
    }

    /**
     * Refresh all analytics data
     * @param projectId - Project UUID
     */
    async function refreshMetrics(projectId: string) {
        loading.value = true;
        error.value = null;

        try {
            await Promise.all([
                analyticsService.getMetrics(projectId).then(m => metrics.value = m),
                analyticsService.getMetricsByPeriod(projectId, period.value).then(m => metricsByPeriod.value = m),
                analyticsService.getTopOrigins(projectId).then(o => topOrigins.value = o),
                analyticsService.getFunnel(projectId).then(f => funnel.value = f),
            ]);

            lastUpdated.value = new Date();
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Failed to refresh metrics';
            console.error('Error refreshing metrics:', err);
        } finally {
            loading.value = false;
        }
    }

    /**
     * Clear all analytics state
     */
    function reset() {
        metrics.value = null;
        metricsByPeriod.value = null;
        topOrigins.value = [];
        funnel.value = [];
        timeline.value = [];
        contactsByStage.value = [];
        salesByOrigin.value = [];
        loading.value = false;
        error.value = null;
        lastUpdated.value = null;
        period.value = 'month';
        selectedOriginId.value = null;
        selectedStageId.value = null;
    }

    return {
        // State
        metrics,
        metricsByPeriod,
        topOrigins,
        funnel,
        timeline,
        contactsByStage,
        salesByOrigin,
        loading,
        error,
        lastUpdated,
        period,
        startDate,
        endDate,
        selectedOriginId,
        selectedStageId,

        // Computed
        totalContacts,
        totalSales,
        totalRevenue,
        conversionRate,
        averageValuePerContact,
        contactsGrowth,
        salesGrowth,
        revenueGrowth,
        conversionGrowth,
        topOrigin,
        bestStage,
        worstStage,
        chartData,
        isLoading,
        isEmpty,
        hasError,

        // Actions
        fetchDashboardData,
        fetchMetricsByPeriod,
        fetchMetrics,
        fetchTopOrigins,
        fetchFunnel,
        fetchTimeline,
        fetchContactsByStage,
        fetchSalesByOrigin,
        setPeriodFilter,
        setOriginFilter,
        setStageFilter,
        clearFilters,
        refreshMetrics,
        reset,
    };
});
