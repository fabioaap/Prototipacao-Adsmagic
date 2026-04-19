/**
 * API Adapters
 *
 * Re-exports adapter functions for converting between frontend and backend formats.
 *
 * @module services/api/adapters
 */

// ============================================================================
// CONTACTS ADAPTER
// ============================================================================
export {
  // Backend → Frontend
  mapBackendContactToFrontend,
  mapBackendListResponseToFrontend,
  // Frontend → Backend
  mapFrontendToBackendCreate,
  mapFrontendToBackendUpdate,
  mapFiltersToBackendParams,
  // Utilities
  getCurrentProjectId,
  hasUnsupportedFilters,
  emptyToNull
} from './contactsAdapter'

// ============================================================================
// DASHBOARD V2 ADAPTER
// ============================================================================
export {
  mapBackendSummaryToDashboardV2Summary,
  mapBackendTimeSeriesToTimeSeriesPoints,
  mapBackendOriginPerformanceToOriginPerformance,
  mapBackendFunnelStatsToFunnelViews,
  mapBackendPipelineStatsToPipelineStageStats,
  mapBackendDrillDownToEntities,
  type BackendSummaryResponse,
  type BackendTimeSeriesDay,
  type BackendOriginPerformanceRow,
  type BackendFunnelStatsResponse,
  type BackendFunnelView,
  type BackendFunnelStage,
  type BackendPipelineStatsResponse,
  type BackendPipelineStage,
  type BackendDrillDownResponse,
  type BackendDrillDownRow
} from './dashboardV2Adapter'
