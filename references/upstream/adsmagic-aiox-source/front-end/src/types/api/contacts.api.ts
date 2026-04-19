/**
 * Backend API Types for Contacts
 *
 * These types mirror the exact contract from the backend Edge Function.
 * They use snake_case to match the database/API naming convention.
 *
 * @see back-end/supabase/functions/contacts/types.ts
 * @module types/api/contacts.api
 */

// ============================================================================
// BACKEND CONTACT MODEL
// ============================================================================

/**
 * Contact model as returned by the backend API
 *
 * Uses snake_case naming convention matching the database schema.
 */
export interface BackendContact {
  /** Unique identifier (UUID) */
  id: string

  /** Project ID for multi-tenancy */
  project_id: string

  /** Full name of the contact (2-100 characters) */
  name: string

  /** Phone number without country code (8-15 digits) */
  phone: string | null

  /** Country calling code (1-3 digits) */
  country_code: string | null

  /**
   * WhatsApp JID (Jabber ID)
   * Format: "554791662434@s.whatsapp.net" or "554791662434@c.us"
   */
  jid?: string | null

  /**
   * WhatsApp LID (Local ID)
   * Format: "213709100187796@lid"
   */
  lid?: string | null

  /**
   * Canonical identifier for unified search
   */
  canonical_identifier?: string | null

  /** Email address */
  email: string | null

  /** Company name */
  company: string | null

  /** Location */
  location: string | null

  /** Notes about the contact */
  notes: string | null

  /** Avatar URL */
  avatar_url: string | null

  /** Whether this contact is marked as favorite */
  is_favorite: boolean

  /** Main origin ID (UUID) based on attribution model */
  main_origin_id: string

  /** Current funnel stage ID (UUID) */
  current_stage_id: string

  /** Additional metadata */
  metadata: Record<string, unknown>

  /** Creation timestamp (ISO 8601) */
  created_at: string

  /** Last update timestamp (ISO 8601) */
  updated_at: string
}

// ============================================================================
// BACKEND DTOs
// ============================================================================

/**
 * DTO for creating a new contact via backend API
 *
 * Required fields: project_id, name, main_origin_id, current_stage_id
 * At least one identifier is required: phone, jid, lid, or canonical_identifier
 */
export interface BackendCreateContactDTO {
  /** Project ID (UUID) - Required */
  project_id: string

  /** Full name (2-100 characters) - Required */
  name: string

  /** Phone number (8-15 digits) */
  phone?: string | null

  /** Country code (1-3 digits) */
  country_code?: string | null

  /** WhatsApp JID */
  jid?: string | null

  /** WhatsApp LID */
  lid?: string | null

  /** Canonical identifier */
  canonical_identifier?: string | null

  /** Email address */
  email?: string | null

  /** Company name (max 100 characters) */
  company?: string | null

  /** Location (max 100 characters) */
  location?: string | null

  /** Notes */
  notes?: string | null

  /** Avatar URL */
  avatar_url?: string | null

  /** Mark as favorite */
  is_favorite?: boolean

  /** Main origin ID (UUID) - Required */
  main_origin_id: string

  /** Current stage ID (UUID) - Required */
  current_stage_id: string

  /** Additional metadata */
  metadata?: Record<string, unknown>
}

/**
 * DTO for updating a contact via backend API (PATCH)
 *
 * All fields are optional - only send what needs to be updated.
 */
export interface BackendUpdateContactDTO {
  /** Updated name */
  name?: string

  /** Updated phone */
  phone?: string | null

  /** Updated country code */
  country_code?: string | null

  /** Updated JID */
  jid?: string | null

  /** Updated LID */
  lid?: string | null

  /** Updated canonical identifier */
  canonical_identifier?: string | null

  /** Updated email */
  email?: string | null

  /** Updated company */
  company?: string | null

  /** Updated location */
  location?: string | null

  /** Updated notes */
  notes?: string | null

  /** Updated avatar URL */
  avatar_url?: string | null

  /** Updated favorite status */
  is_favorite?: boolean

  /** Updated main origin ID */
  main_origin_id?: string

  /** Updated current stage ID */
  current_stage_id?: string

  /** Updated metadata */
  metadata?: Record<string, unknown>
}

// ============================================================================
// BACKEND LIST PARAMS & RESPONSE
// ============================================================================

/**
 * Query parameters for listing contacts via backend API
 *
 * Uses limit/offset pagination (not page/pageSize).
 */
export interface BackendContactsListParams {
  /** Filter by project ID (UUID) */
  project_id?: string

  /** Search term (searches name, email, company, phone) */
  search?: string

  /** Filter by origin ID (UUID) - singular, not array */
  origin_id?: string

  /** Filter by stage ID (UUID) - singular, not array */
  stage_id?: string

  /** Filter by favorite status */
  is_favorite?: boolean

  /**
   * Sort order
   * - 'created_at': Most recent first (default)
   * - 'name_asc': Alphabetical A-Z
   * - 'name_desc': Alphabetical Z-A
   * - 'updated_at': Most recently updated first
   */
  sort?: 'created_at' | 'name_asc' | 'name_desc' | 'updated_at'

  /** Number of items to return (1-100, default 50) */
  limit?: number

  /** Number of items to skip (for pagination) */
  offset?: number
}

/**
 * Response structure for listing contacts from backend API
 */
export interface BackendContactsListResponse {
  /** Array of contacts */
  data: BackendContact[]

  /** Pagination metadata */
  meta: {
    /** Total number of contacts matching the query */
    total: number

    /** Number of items returned (limit) */
    limit: number

    /** Number of items skipped (offset) */
    offset: number
  }
}

/**
 * Response for single contact operations (create, update, get)
 */
export interface BackendContactResponse {
  /** The contact data */
  data: BackendContact
}

/**
 * Response for delete operation
 */
export interface BackendDeleteContactResponse {
  /** Success message */
  message: string

  /** ID of deleted contact */
  id: string
}

// ============================================================================
// BACKEND ERROR RESPONSES
// ============================================================================

/**
 * Validation error response from backend
 */
export interface BackendValidationError {
  /** Error message */
  error: string

  /** Validation errors array */
  validationErrors: string[]
}

/**
 * Generic error response from backend
 */
export interface BackendErrorResponse {
  /** Error message */
  error: string
}
