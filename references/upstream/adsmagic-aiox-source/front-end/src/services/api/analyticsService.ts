/**
 * Analytics Service
 * @module services/api/analyticsService
 * @description Service for analytics API endpoints
 */

import { apiClient } from './client';
import type {
    DashboardMetrics,
    MetricByPeriod,
    TopOrigin,
    FunnelStage,
    ChartDataPoint,
} from '@/types/analytics';
import {
    DashboardMetricsSchema,
    MetricByPeriodSchema,
    TopOriginsSchema,
    FunnelSchema,
    TimelineSchema,
    ContactsByStageSchema,
    SalesByOriginsSchema,
} from '@/schemas/analytics';

/**
 * Analytics Service - All analytics endpoints
 */
export const analyticsService = {
    /**
     * Get consolidated dashboard metrics
     */
    async getMetrics(projectId: string): Promise<DashboardMetrics> {
        const response = await apiClient.get('/analytics/metrics', {
            params: { projectId },
        });

        return DashboardMetricsSchema.parse(response.data);
    },

    /**
     * Get metrics for specific period with comparison
     */
    async getMetricsByPeriod(
        projectId: string,
        period: 'today' | 'week' | 'month'
    ): Promise<MetricByPeriod> {
        const response = await apiClient.get('/analytics/metrics/by-period', {
            params: { projectId, period },
        });

        return MetricByPeriodSchema.parse(response.data);
    },

    /**
     * Get top performing origins
     */
    async getTopOrigins(projectId: string, limit: number = 10): Promise<TopOrigin[]> {
        const response = await apiClient.get('/analytics/top-origins', {
            params: { projectId, limit },
        });

        return TopOriginsSchema.parse(response.data);
    },

    /**
     * Get funnel conversion metrics by stage
     */
    async getFunnel(projectId: string): Promise<FunnelStage[]> {
        const response = await apiClient.get('/analytics/funnel', {
            params: { projectId },
        });

        return FunnelSchema.parse(response.data);
    },

    /**
     * Get historical timeline data
     */
    async getTimeline(projectId: string, days: number = 30): Promise<ChartDataPoint[]> {
        const response = await apiClient.get('/analytics/timeline', {
            params: { projectId, days },
        });

        return TimelineSchema.parse(response.data);
    },

    /**
     * Get contact distribution by stage
     */
    async getContactsByStage(projectId: string): Promise<Array<{
        stageId: string;
        stageName: string;
        contactCount: number;
        percentage: number;
    }>> {
        const response = await apiClient.get('/analytics/contacts-by-stage', {
            params: { projectId },
        });

        return ContactsByStageSchema.parse(response.data);
    },

    /**
     * Get sales metrics by origin
     */
    async getSalesByOrigin(projectId: string): Promise<Array<{
        originId: string;
        originName: string;
        icon: string;
        color: string;
        salesCount: number;
        revenue: number;
        averageValue: number;
    }>> {
        const response = await apiClient.get('/analytics/sales-by-origin', {
            params: { projectId },
        });

        return SalesByOriginsSchema.parse(response.data);
    },

    /**
     * Fetch all analytics data at once (for dashboard initialization)
     */
    async fetchDashboardData(projectId: string) {
        try {
            const [
                metrics,
                metricsByPeriod,
                topOrigins,
                funnel,
                timeline,
                contactsByStage,
                salesByOrigin,
            ] = await Promise.all([
                this.getMetrics(projectId),
                this.getMetricsByPeriod(projectId, 'month'),
                this.getTopOrigins(projectId, 10),
                this.getFunnel(projectId),
                this.getTimeline(projectId, 30),
                this.getContactsByStage(projectId),
                this.getSalesByOrigin(projectId),
            ]);

            return {
                metrics,
                metricsByPeriod,
                topOrigins,
                funnel,
                timeline,
                contactsByStage,
                salesByOrigin,
            };
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            throw error;
        }
    },
};
