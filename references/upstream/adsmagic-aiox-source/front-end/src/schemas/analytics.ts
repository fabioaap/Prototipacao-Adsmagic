/**
 * Analytics Zod Schemas
 * @module schemas/analytics
 * @description Runtime validation for analytics data
 */

import { z } from 'zod';

// ============================================================================
// Base Metrics Schema
// ============================================================================

export const DashboardMetricsSchema = z.object({
    totalContacts: z.number().int().min(0),
    totalSales: z.number().int().min(0),
    totalRevenue: z.number().min(0),
    conversionRate: z.number().min(0).max(100),
    averageValuePerContact: z.number().min(0),
    lastUpdated: z.string().datetime(),
});

export type DashboardMetrics = z.infer<typeof DashboardMetricsSchema>;

// ============================================================================
// Metrics by Period Schema
// ============================================================================

export const MetricByPeriodSchema = DashboardMetricsSchema.extend({
    period: z.enum(['today', 'week', 'month']),
    previousPeriod: DashboardMetricsSchema,
    growth: z.object({
        contacts: z.number(),
        sales: z.number(),
        revenue: z.number(),
        conversion: z.number(),
    }),
});

export type MetricByPeriod = z.infer<typeof MetricByPeriodSchema>;

// ============================================================================
// Top Origin Schema
// ============================================================================

export const TopOriginSchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(1).max(100),
    icon: z.string(),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    contacts: z.number().int().min(0),
    sales: z.number().int().min(0),
    revenue: z.number().min(0),
    conversionRate: z.number().min(0).max(100),
    rank: z.number().int().min(1),
});

export const TopOriginsSchema = z.array(TopOriginSchema);

export type TopOrigin = z.infer<typeof TopOriginSchema>;

// ============================================================================
// Funnel Stage Schema
// ============================================================================

export const FunnelStageSchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(1).max(50),
    type: z.enum(['normal', 'sale', 'lost']),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    contactCount: z.number().int().min(0),
    percentage: z.number().min(0).max(100),
    conversionFromPrevious: z.number().min(0).max(100),
});

export const FunnelSchema = z.array(FunnelStageSchema);

export type FunnelStage = z.infer<typeof FunnelStageSchema>;

// ============================================================================
// Chart Data Point Schema
// ============================================================================

export const ChartDataPointSchema = z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD
    contacts: z.number().int().min(0),
    sales: z.number().int().min(0),
    revenue: z.number().min(0),
});

export const TimelineSchema = z.array(ChartDataPointSchema);

export type ChartDataPoint = z.infer<typeof ChartDataPointSchema>;

// ============================================================================
// Contacts by Stage Schema
// ============================================================================

export const ContactByStageSchema = z.object({
    stageId: z.string().uuid(),
    stageName: z.string().min(1),
    contactCount: z.number().int().min(0),
    percentage: z.number().min(0).max(100),
});

export const ContactsByStageSchema = z.array(ContactByStageSchema);

export type ContactByStage = z.infer<typeof ContactByStageSchema>;

// ============================================================================
// Sales by Origin Schema
// ============================================================================

export const SalesByOriginSchema = z.object({
    originId: z.string().uuid(),
    originName: z.string().min(1),
    icon: z.string(),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    salesCount: z.number().int().min(0),
    revenue: z.number().min(0),
    averageValue: z.number().min(0),
});

export const SalesByOriginsSchema = z.array(SalesByOriginSchema);

export type SalesByOrigin = z.infer<typeof SalesByOriginSchema>;

// ============================================================================
// Request Schemas
// ============================================================================

export const MetricsRequestSchema = z.object({
    projectId: z.string().uuid(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    timezone: z.string().default('America/Sao_Paulo'),
});

export const MetricsByPeriodRequestSchema = z.object({
    projectId: z.string().uuid(),
    period: z.enum(['today', 'week', 'month']),
});

export const TopOriginsRequestSchema = z.object({
    projectId: z.string().uuid(),
    limit: z.number().int().min(1).max(50).default(10),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
});

export const FunnelRequestSchema = z.object({
    projectId: z.string().uuid(),
});

export const TimelineRequestSchema = z.object({
    projectId: z.string().uuid(),
    days: z.number().int().min(1).max(365).default(30),
});

export const ContactsByStageRequestSchema = z.object({
    projectId: z.string().uuid(),
});

export const SalesByOriginRequestSchema = z.object({
    projectId: z.string().uuid(),
});

// ============================================================================
// Filter Schema
// ============================================================================

export const AnalyticsFiltersSchema = z.object({
    period: z.enum(['today', 'week', 'month']).default('month'),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
    originId: z.string().uuid().optional(),
    stageId: z.string().uuid().optional(),
});

export type AnalyticsFilters = z.infer<typeof AnalyticsFiltersSchema>;
