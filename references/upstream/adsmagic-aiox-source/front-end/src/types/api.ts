/**
 * API response types and utilities
 *
 * This file defines the shape of API responses, error handling types,
 * and filter objects used for querying data.
 *
 * @module types/api
 */

/**
 * Generic API response wrapper
 *
 * All successful API responses are wrapped in this structure.
 */
export interface ApiResponse<T> {
  /** Response data */
  data: T

  /** Optional metadata */
  meta?: ApiMeta
}

/**
 * API response metadata
 */
export interface ApiMeta {
  /** Response timestamp (ISO 8601) */
  timestamp: string

  /** Unique request ID for debugging */
  requestId: string
}

/**
 * Paginated API response
 *
 * Used for endpoints that return lists of items with pagination.
 */
export interface PaginatedResponse<T> {
  /** Array of items for current page */
  data: T[]

  /** Pagination information */
  pagination: PaginationInfo
}

/**
 * Pagination information
 */
export interface PaginationInfo {
  /** Current page number (1-indexed) */
  page: number

  /** Number of items per page */
  pageSize: number

  /** Total number of items across all pages */
  total: number

  /** Total number of pages */
  totalPages: number
}

/**
 * Result type for operations that can fail
 *
 * This is a discriminated union that forces explicit error handling.
 * Use this for functions that perform operations with potential failures.
 *
 * @example
 * ```typescript
 * const result = await createContact(data)
 * if (result.ok) {
 *   console.log('Success:', result.value)
 * } else {
 *   console.error('Error:', result.error)
 * }
 * ```
 */
export type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E }

/**
 * API error response
 */
export interface ApiError {
  /** Error message (user-friendly, translated) */
  message: string

  /** Error code for programmatic handling */
  code: string

  /** HTTP status code */
  statusCode: number

  /** Additional error details (optional) */
  details?: Record<string, unknown>
}

/**
 * Filter options for contacts list
 */
export interface ContactFilters {
  /** Search by name or phone */
  search?: string

  /** Filter by origin IDs (multiple) */
  origins?: string[]

  /** Filter by stage IDs (multiple) */
  stages?: string[]

  /** Filter contacts with/without sales */
  hasSales?: boolean

  /** Filter by creation date range - start (ISO 8601) */
  dateFrom?: string

  /** Filter by creation date range - end (ISO 8601) */
  dateTo?: string

  /** Page number (1-indexed) */
  page?: number

  /** Items per page */
  pageSize?: number
}

/**
 * Filter options for sales list
 */
export interface SaleFilters {
  /** Search by contact name or phone */
  search?: string

  /** Filter by sale status */
  status?: 'completed' | 'lost'

  /** Filter by origin IDs (multiple) */
  origins?: string[]

  /** Filter by project ID */
  projectId?: string

  /** Filter by contact ID */
  contactId?: string

  /** Filter by sale date range - start (ISO 8601) */
  dateFrom?: string

  /** Filter by sale date range - end (ISO 8601) */
  dateTo?: string

  /** Filter by sale date range - start (alias for dateFrom) */
  startDate?: string

  /** Filter by sale date range - end (alias for dateTo) */
  endDate?: string

  /** Filter by lost reason (only for lost sales) */
  lostReason?: string

  /** Minimum sale value */
  minValue?: number

  /** Maximum sale value */
  maxValue?: number

  /** Page number (1-indexed) */
  page?: number

  /** Items per page */
  pageSize?: number
}

/**
 * Filter options for events list
 */
export interface EventFilters {
  /** Search by contact name or phone */
  search?: string

  /** Filter by platform */
  platform?: 'meta' | 'google' | 'tiktok'

  /** Filter by multiple platforms (plural) */
  platforms?: Array<'meta' | 'google' | 'tiktok'>

  /** Filter by event status */
  status?: 'pending' | 'sent' | 'failed'

  /** Filter by multiple statuses (plural) */
  statuses?: Array<'pending' | 'sent' | 'failed'>

  /** Filter by event type */
  eventType?: string

  /** Filter by event type (alias for eventType) */
  type?: string

  /** Filter by multiple types (plural) */
  types?: string[]

  /** Filter by event name (alias for eventType) */
  eventName?: string

  /** Filter by contact ID */
  contactId?: string

  /** Filter by project ID */
  projectId?: string

  /** Filter by entity types */
  entityTypes?: string[]

  /** Filter by creation date range - start (ISO 8601) */
  dateFrom?: string

  /** Filter by creation date range - end (ISO 8601) */
  dateTo?: string

  /** Filter by creation date range - start (alias for dateFrom) */
  startDate?: string

  /** Filter by creation date range - end (alias for dateTo) */
  endDate?: string

  /** Page number (1-indexed) */
  page?: number

  /** Items per page */
  pageSize?: number

  /** Limit number of results (alias for pageSize) */
  limit?: number
}

/**
 * Filter options for links list
 */
export interface LinkFilters {
  /** Search by link name */
  search?: string

  /** Filter by active status */
  isActive?: boolean

  /** Sort by field */
  sortBy?: 'name' | 'clicks' | 'contacts' | 'sales' | 'revenue' | 'createdAt'

  /** Sort direction */
  sortDirection?: 'asc' | 'desc'

  /** Page number (1-indexed) */
  page?: number

  /** Items per page */
  pageSize?: number
}

/**
 * Filter options for dashboard metrics
 */
export interface DashboardFilters {
  /** Date range start (ISO 8601) */
  dateFrom: string

  /** Date range end (ISO 8601) */
  dateTo: string

  /** Optional comparison period start (ISO 8601) */
  comparisonDateFrom?: string

  /** Optional comparison period end (ISO 8601) */
  comparisonDateTo?: string

  /** Filter by specific origin IDs */
  origins?: string[]
}

/**
 * Sort options for lists
 */
export interface SortOptions {
  /** Field to sort by */
  field: string

  /** Sort direction */
  direction: 'asc' | 'desc'
}

/**
 * Validation error details
 *
 * Returned when API request fails validation.
 */
export interface ValidationError {
  /** Field name that failed validation */
  field: string

  /** Error message (translated) */
  message: string

  /** Validation rule that failed */
  rule: string
}

/**
 * Batch operation result
 *
 * Used for operations that affect multiple items.
 */
export interface BatchOperationResult {
  /** Number of items successfully processed */
  successful: number

  /** Number of items that failed */
  failed: number

  /** Total number of items attempted */
  total: number

  /** Errors for failed items */
  errors?: Array<{
    /** Item identifier */
    id: string

    /** Error message */
    message: string
  }>
}
