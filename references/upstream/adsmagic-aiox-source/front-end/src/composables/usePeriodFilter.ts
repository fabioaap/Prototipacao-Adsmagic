/**
 * usePeriodFilter Composable
 * @module composables/usePeriodFilter
 * @description Period filter management with sync to route params
 */

import { computed, ref, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAnalyticsStore } from '@/stores/analyticsStore';
import type { Period } from '@/types/analytics';

interface UsePeriodFilterOptions {
    projectId?: string;
    autoFetch?: boolean;
    syncRouteParams?: boolean;
}

/**
 * Composable for period filter management
 * Handles period selection with optional route param sync
 */
export function usePeriodFilter(options: UsePeriodFilterOptions = {}) {
    const {
        projectId = '',
        autoFetch = true,
        syncRouteParams = true,
    } = options;

    const route = useRoute();
    const store = useAnalyticsStore();

    // Available periods
    const periods = ref<Period[]>(['today', 'week', 'month']);

    // Current period (synced with store)
    const currentPeriod = computed({
        get: () => store.period,
        set: (period: Period) => {
            if (projectId) {
                store.setPeriodFilter(projectId, period);
            }
        },
    });

    // Get period from route params or default to 'month'
    const getPeriodFromRoute = (): Period => {
        const periodParam = route.query.period as string;
        if (periodParam && periods.value.includes(periodParam as Period)) {
            return periodParam as Period;
        }
        return 'month';
    };

    // Initialize from route params
    onMounted(() => {
        if (syncRouteParams && projectId) {
            const routePeriod = getPeriodFromRoute();
            if (routePeriod !== store.period) {
                currentPeriod.value = routePeriod;
            }
        }
    });

    // Watch for period changes and auto-fetch if enabled
    watch(
        () => store.period,
        (newPeriod) => {
            if (autoFetch && projectId) {
                store.setPeriodFilter(projectId, newPeriod);
            }
        },
    );

    // Period labels for UI
    const periodLabels: Record<Period, string> = {
        today: 'Hoje',
        week: 'Esta Semana',
        month: 'Este Mês',
    };

    // Helper method to change period
    const changePeriod = (period: Period) => {
        if (projectId) {
            store.setPeriodFilter(projectId, period);
        }
    };

    // Helper method to get label for period
    const getPeriodLabel = (period: Period = currentPeriod.value): string => {
        return periodLabels[period] || period;
    };

    // Period comparison info
    const periodInfo = computed(() => {
        const info: Record<Period, { days: number; label: string }> = {
            today: { days: 1, label: 'último dia' },
            week: { days: 7, label: 'última semana' },
            month: { days: 30, label: 'último mês' },
        };
        return info[currentPeriod.value];
    });

    return {
        // State
        periods: computed(() => periods.value),
        currentPeriod: computed(() => currentPeriod.value),
        periodLabels,
        periodInfo,

        // Methods
        changePeriod,
        getPeriodLabel,
        getPeriodFromRoute,
    };
}
