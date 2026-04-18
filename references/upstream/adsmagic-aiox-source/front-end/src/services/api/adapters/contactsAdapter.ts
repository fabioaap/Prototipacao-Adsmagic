/**
 * Contacts Adapter
 *
 * Pure functions for converting between frontend and backend data formats.
 * Handles snake_case ↔ camelCase conversion and data transformation.
 *
 * @module services/api/adapters/contactsAdapter
 */

import type { Contact, CreateContactDTO, UpdateContactDTO, ContactFilters, PaginatedResponse } from '@/types'
import type {
  BackendContact,
  BackendCreateContactDTO,
  BackendUpdateContactDTO,
  BackendContactsListParams,
  BackendContactsListResponse
} from '@/types/api/contacts.api'

// ============================================================================
// BACKEND → FRONTEND CONVERSIONS
// ============================================================================

/**
 * Converts a backend contact to frontend format
 *
 * Handles:
 * - snake_case → camelCase field renaming
 * - main_origin_id → origin
 * - current_stage_id → stage
 * - avatar_url → avatar
 *
 * @param backend - Contact from backend API
 * @returns Contact in frontend format
 */
export function mapBackendContactToFrontend(backend: BackendContact): Contact {
  return {
    id: backend.id,
    projectId: backend.project_id,
    name: backend.name,
    phone: backend.phone ?? '',
    countryCode: backend.country_code ?? '',
    origin: backend.main_origin_id,
    stage: backend.current_stage_id,
    email: backend.email ?? undefined,
    company: backend.company ?? undefined,
    location: backend.location ?? undefined,
    notes: backend.notes ?? undefined,
    avatar: backend.avatar_url ?? undefined,
    isFavorite: backend.is_favorite,
    // New WhatsApp identifier fields
    jid: backend.jid ?? null,
    lid: backend.lid ?? null,
    canonicalIdentifier: backend.canonical_identifier ?? null,
    createdAt: backend.created_at,
    updatedAt: backend.updated_at,
    metadata: backend.metadata as Contact['metadata']
  }
}

/**
 * Converts backend list response to frontend paginated format
 *
 * Transforms:
 * - { limit, offset, total } → { page, pageSize, total, totalPages }
 *
 * @param response - Backend list response
 * @param requestedPage - Page number that was requested (for calculating from offset)
 * @param requestedPageSize - Page size that was requested
 * @returns Paginated response in frontend format
 */
export function mapBackendListResponseToFrontend(
  response: BackendContactsListResponse,
  requestedPage: number = 1,
  requestedPageSize: number = 10
): PaginatedResponse<Contact> {
  const { data, meta } = response

  // Calculate page from offset if needed
  const page = requestedPage || Math.floor(meta.offset / meta.limit) + 1
  const pageSize = requestedPageSize || meta.limit
  const totalPages = Math.ceil(meta.total / pageSize)

  return {
    data: data.map(mapBackendContactToFrontend),
    pagination: {
      page,
      pageSize,
      total: meta.total,
      totalPages
    }
  }
}

// ============================================================================
// FRONTEND → BACKEND CONVERSIONS
// ============================================================================

/**
 * Converts frontend create DTO to backend format
 *
 * Handles:
 * - camelCase → snake_case field renaming
 * - origin → main_origin_id
 * - stage → current_stage_id
 * - Adding project_id from parameter
 *
 * @param dto - Frontend create DTO
 * @param projectId - Project ID to associate the contact with
 * @returns Backend create DTO
 */
export function mapFrontendToBackendCreate(
  dto: CreateContactDTO,
  projectId: string
): BackendCreateContactDTO {
  return {
    project_id: projectId,
    name: dto.name,
    phone: dto.phone || null,
    country_code: dto.countryCode || null,
    email: dto.email || null,
    company: dto.company || null,
    location: dto.location || null,
    notes: dto.notes || null,
    main_origin_id: dto.origin || '',
    current_stage_id: dto.stage || '',
    is_favorite: false,
    metadata: {}
  }
}

/**
 * Converts frontend update DTO to backend format
 *
 * Only includes fields that are defined (not undefined).
 *
 * @param dto - Frontend update DTO
 * @returns Backend update DTO (only defined fields)
 */
export function mapFrontendToBackendUpdate(
  dto: UpdateContactDTO
): BackendUpdateContactDTO {
  const result: BackendUpdateContactDTO = {}

  if (dto.name !== undefined) {
    result.name = dto.name
  }

  if (dto.phone !== undefined) {
    result.phone = dto.phone || null
  }

  if (dto.countryCode !== undefined) {
    result.country_code = dto.countryCode || null
  }

  if (dto.email !== undefined) {
    result.email = dto.email || null
  }

  if (dto.company !== undefined) {
    result.company = dto.company || null
  }

  if (dto.location !== undefined) {
    result.location = dto.location || null
  }

  if (dto.notes !== undefined) {
    result.notes = dto.notes || null
  }

  if (dto.origin !== undefined) {
    result.main_origin_id = dto.origin
  }

  if (dto.stage !== undefined) {
    result.current_stage_id = dto.stage
  }

  return result
}

/**
 * Converts frontend filters to backend query params
 *
 * Transforms:
 * - page/pageSize → limit/offset
 * - origins[] → origin_id (first item only - backend doesn't support array)
 * - stages[] → stage_id (first item only - backend doesn't support array)
 * - Adds project_id from localStorage for multi-tenancy
 *
 * Note: dateFrom, dateTo, hasSales are NOT supported by backend
 *
 * @param filters - Frontend filters
 * @returns Backend query params
 */
export function mapFiltersToBackendParams(
  filters?: ContactFilters
): BackendContactsListParams {
  const params: BackendContactsListParams = {}

  // CRITICAL: Always include project_id for multi-tenancy filtering
  const projectId = getCurrentProjectId()
  if (projectId) {
    params.project_id = projectId
  } else {
    console.warn('[ContactsAdapter] No project_id found - contacts may not be filtered correctly')
  }

  if (!filters) {
    return params
  }

  // Search term
  if (filters.search) {
    params.search = filters.search
  }

  // Origin filter - backend only supports single origin
  // Take first item from array if provided
  if (filters.origins && filters.origins.length > 0) {
    params.origin_id = filters.origins[0]
  }

  // Stage filter - backend only supports single stage
  // Take first item from array if provided
  if (filters.stages && filters.stages.length > 0) {
    params.stage_id = filters.stages[0]
  }

  // Tag filter - backend accepts comma-separated UUIDs
  if (filters.tags && filters.tags.length > 0) {
    params.tag_ids = filters.tags.join(',')
  }

  // Pagination: convert page/pageSize to limit/offset
  const page = filters.page ?? 1
  const pageSize = filters.pageSize ?? 10

  params.limit = pageSize
  params.offset = (page - 1) * pageSize

  // Sort (default is created_at desc)
  params.sort = 'created_at'

  return params
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Gets the current project ID from localStorage
 *
 * @returns Project ID or null if not set
 */
export function getCurrentProjectId(): string | null {
  return localStorage.getItem('current_project_id')
}

/**
 * Checks if filters contain unsupported backend options
 *
 * Logs a warning if dateFrom, dateTo, or hasSales are used.
 *
 * @param filters - Filters to check
 * @returns True if contains unsupported options
 */
export function hasUnsupportedFilters(filters?: ContactFilters): boolean {
  if (!filters) return false

  const unsupported: string[] = []

  if (filters.dateFrom) {
    unsupported.push('dateFrom')
  }

  if (filters.dateTo) {
    unsupported.push('dateTo')
  }

  if (filters.hasSales !== undefined) {
    unsupported.push('hasSales')
  }

  if (unsupported.length > 0) {
    console.warn(
      `[ContactsAdapter] The following filters are not supported by backend and will be ignored: ${unsupported.join(', ')}`
    )
    return true
  }

  return false
}

/**
 * Transforms empty strings to null for backend compatibility
 *
 * @param value - Value to transform
 * @returns Null if empty string, otherwise the original value
 */
export function emptyToNull<T>(value: T | '' | null | undefined): T | null {
  if (value === '' || value === undefined) {
    return null
  }
  return value
}
