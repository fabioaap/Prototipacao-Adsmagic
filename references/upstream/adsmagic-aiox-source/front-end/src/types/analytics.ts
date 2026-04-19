/**
 * Analytics Types - Frontend
 * @module types/analytics
 * @description TypeScript types for analytics features
 */

export interface DashboardMetrics {
    totalContacts: number;
    totalSales: number;
    totalRevenue: number;
    conversionRate: number;
    averageValuePerContact: number;
    lastUpdated: string;
}

export interface MetricByPeriod extends DashboardMetrics {
    period: 'today' | 'week' | 'month';
    previousPeriod: DashboardMetrics;
    growth: {
        contacts: number;
        sales: number;
        revenue: number;
        conversion: number;
    };
}

export interface TopOrigin {
    id: string;
    name: string;
    icon: string;
    color: string;
    contacts: number;
    sales: number;
    revenue: number;
    conversionRate: number;
    rank: number;
}

export interface FunnelStage {
    id: string;
    name: string;
    type: 'normal' | 'sale' | 'lost';
    color: string;
    contactCount: number;
    percentage: number;
    conversionFromPrevious: number;
}

export interface ChartDataPoint {
    date: string;
    contacts: number;
    sales: number;
    revenue: number;
}

export interface RecentContact {
    id: string;
    name: string;
    origin: string;
    stage: string;
    createdAt: string;
    lastUpdated: string;
}

export interface RecentSale {
    id: string;
    contactName: string;
    value: number;
    origin: string;
    saleDate: string;
}

export interface PerformanceByOrigin {
    originId: string;
    originName: string;
    icon: string;
    color: string;
    totalContacts: number;
    totalSales: number;
    totalRevenue: number;
    conversionRate: number;
    averageValue: number;
    trend: 'up' | 'down' | 'stable';
    trendPercentage: number;
}

export type Period = 'today' | 'week' | 'month';

export interface AnalyticsFilters {
    period: Period;
    startDate?: Date;
    endDate?: Date;
    originId?: string;
    stageId?: string;
}

/**
 * Origins Performance Table - Dashboard V2
 * Representa dados agregados de performance por origem de tráfego
 */
export interface OriginPerformance {
    id?: string;
    name?: string;
    origin: string;
    color?: string;
    spent?: number;
    investment: number;
    contacts: number;
    sales: number;
    revenue: number;
    conversionRate: number;
    costPerSale: number;
    costPerContact: number;
    roi: number | null; // null quando spent = 0 (ex: orgânico)
}

export interface AnalyticsState {
    metrics: DashboardMetrics | null;
    metricsByPeriod: MetricByPeriod | null;
    topOrigins: TopOrigin[];
    funnel: FunnelStage[];
    timeline: ChartDataPoint[];
    contactsByStage: Array<{
        stageId: string;
        stageName: string;
        contactCount: number;
        percentage: number;
    }>;
    salesByOrigin: Array<{
        originId: string;
        originName: string;
        icon: string;
        color: string;
        salesCount: number;
        revenue: number;
        averageValue: number;
    }>;
    loading: boolean;
    error: string | null;
    filters: AnalyticsFilters;
    lastUpdated: Date | null;
}
