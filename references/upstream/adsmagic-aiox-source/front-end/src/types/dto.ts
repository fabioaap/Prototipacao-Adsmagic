/**
 * Data Transfer Objects (DTOs) for API communication
 *
 * DTOs define the shape of data sent to and received from the API.
 * They are typically subsets of the full domain models, containing
 * only the fields needed for specific operations.
 *
 * @module types/dto
 */

import type { EventConfig, TrackingParams } from './models'

/**
 * DTO for creating a new contact
 */
export interface CreateContactDTO {
  /** Full name of the contact (2-100 characters) */
  name: string

  /** Phone number without country code (10-11 digits) */
  phone: string

  /** Country calling code (e.g., "+55") */
  countryCode: string

  /** Optional origin ID (defaults to system detection) */
  origin?: string

  /** Optional initial stage (defaults to first stage) */
  stage?: string

  /** Email address (optional) */
  email?: string

  /** Company name (optional) */
  company?: string

  /** Location (optional) */
  location?: string

  /** Notes about the contact (optional) */
  notes?: string
}

/**
 * DTO for updating an existing contact
 */
export interface UpdateContactDTO {
  /** Updated name (optional) */
  name?: string

  /** Updated phone (optional) */
  phone?: string

  /** Updated country code (optional) */
  countryCode?: string

  /** Updated origin (optional) */
  origin?: string

  /** Updated stage (optional) */
  stage?: string

  /** Updated email (optional) */
  email?: string

  /** Updated company (optional) */
  company?: string

  /** Updated location (optional) */
  location?: string

  /** Updated notes (optional) */
  notes?: string
}

/**
 * DTO for creating a new sale
 */
export interface CreateSaleDTO {
  /** Project ID (optional, server can infer from auth) */
  projectId?: string

  /** Contact ID who made the purchase */
  contactId: string

  /** Sale value (must be positive) */
  value: number

  /** Currency code (ISO 4217) */
  currency: string

  /** Sale date (ISO 8601) */
  date: string

  /** Origin to attribute to this sale (optional) */
  origin?: string

  /** Tracking parameters captured from URL */
  trackingParams?: TrackingParams
}

/**
 * DTO for updating an existing sale
 */
export interface UpdateSaleDTO {
  /** Updated value (optional) */
  value?: number

  /** Updated currency (optional) */
  currency?: string

  /** Updated date (optional) */
  date?: string

  /** Updated origin (optional) */
  origin?: string
}

/**
 * DTO for marking a sale as lost
 */
export interface MarkSaleLostDTO {
  /** Reason why the sale was lost */
  lostReason: string

  /** Reason (alias for lostReason) */
  reason?: string

  /** Additional observations (optional) */
  lostObservations?: string
}

/**
 * DTO for creating a new funnel stage
 */
export interface CreateStageDTO {
  /** Stage name */
  name: string

  /** Stage description (optional) */
  description?: string

  /** Stage color (hex format) (optional) */
  color?: string

  /** Icon (Lucide icon name or emoji) - optional */
  icon?: string

  /** Tracking phrase for WhatsApp automation (optional) */
  trackingPhrase?: string

  /** Stage type */
  type: 'normal' | 'sale' | 'lost'

  /** Event configuration (optional) */
  eventConfig?: EventConfig
}

/**
 * DTO for updating an existing stage
 */
export interface UpdateStageDTO {
  /** Updated name (optional) */
  name?: string

  /** Updated tracking phrase (optional) */
  trackingPhrase?: string

  /** Updated event configuration (optional) */
  eventConfig?: EventConfig

  /** Updated active status (optional) */
  isActive?: boolean

  /** Updated display order (optional) */
  order?: number
}

/**
 * DTO for creating a custom origin
 */
export interface CreateOriginDTO {
  /** Origin name */
  name: string

  /** Origin description (optional) */
  description?: string

  /** Badge color (hex format) */
  color: string

  /** Icon (Lucide icon name or emoji) - optional */
  icon?: string

  /** Match mode for utm_source custom attribution (optional) */
  utmSourceMatchMode?: 'exact' | 'contains' | null

  /** Match value for utm_source custom attribution (optional) */
  utmSourceMatchValue?: string | null
}

/**
 * DTO for updating a custom origin
 */
export interface UpdateOriginDTO {
  /** Updated name (optional) */
  name?: string

  /** Updated color (optional) */
  color?: string

  /** Updated icon (optional) */
  icon?: string

  /** Updated active status (optional) */
  isActive?: boolean

  /** Updated match mode for utm_source custom attribution (optional) */
  utmSourceMatchMode?: 'exact' | 'contains' | null

  /** Updated match value for utm_source custom attribution (optional) */
  utmSourceMatchValue?: string | null
}

/**
 * DTO for creating a new tag
 */
export interface CreateTagDTO {
  /** Tag name (2-50 characters) */
  name: string

  /** Tag color (hex format) */
  color: string

  /** Tag description (optional) */
  description?: string
}

/**
 * DTO for updating an existing tag
 */
export interface UpdateTagDTO {
  /** Updated name (optional) */
  name?: string

  /** Updated color (optional) */
  color?: string

  /** Updated description (optional) */
  description?: string
}

/**
 * DTO for adding/removing tags from a contact
 */
export interface UpdateContactTagsDTO {
  /** Tag IDs to add to the contact */
  addTagIds?: string[]

  /** Tag IDs to remove from the contact */
  removeTagIds?: string[]
}

/**
 * DTO for creating a trackable link
 */
/**
 * DTO for creating a trackable link
 * Aligned with backend: /back-end/types.ts:205-235
 */
export interface CreateLinkDTO {
  /** Project ID (optional, server can infer from auth) */
  projectId?: string

  /** Descriptive name for the link */
  name: string

  /** Final destination URL */
  destinationUrl: string

  /** Origin ID for tracking attribution */
  originId: string

  /** Pre-filled WhatsApp message (optional) */
  initialMessage?: string

  /** Destination URL (alias for destinationUrl) */
  url?: string

  /** Whether this link is active */
  isActive?: boolean

  /** UTM Source parameter (optional) */
  utmSource?: string

  /** UTM Medium parameter (optional) */
  utmMedium?: string

  /** UTM Campaign parameter (optional) */
  utmCampaign?: string
}

/**
 * DTO for updating a trackable link
 * Aligned with backend: /back-end/types.ts:205-235
 */
export interface UpdateLinkDTO {
  /** Updated name (optional) */
  name?: string

  /** Updated destination URL (optional) */
  destinationUrl?: string

  /** Updated initial message (optional) */
  initialMessage?: string

  /** Updated active status (optional) */
  isActive?: boolean
}

/**
 * DTO for creating a new project
 */
export interface CreateProjectDTO {
  /** Project name */
  name: string

  /** Project description (optional) */
  description?: string

  /** Company type */
  companyType: 'franchise' | 'corporate' | 'individual'

  /** Number of franchises (required if companyType = 'franchise') */
  franchiseCount?: number

  /** Country code (ISO 3166-1 alpha-2) */
  country: string

  /** Default language (ISO 639-1) */
  language: string

  /** Default currency (ISO 4217) */
  currency: string

  /** Timezone (IANA timezone) */
  timezone: string
}

/**
 * DTO for updating project settings
 */
export interface UpdateProjectDTO {
  /** Updated name (optional) */
  name?: string

  /** Updated description (optional) */
  description?: string

  /** Updated country (optional) */
  country?: string

  /** Updated language (optional) */
  language?: string

  /** Updated currency (optional) */
  currency?: string

  /** Updated timezone (optional) */
  timezone?: string

  /** Updated attribution model (optional) */
  attributionModel?: 'first_touch' | 'last_touch' | 'conversion'
}

/**
 * DTO for creating a new event
 */
export interface CreateEventDTO {
  /** Contact ID */
  contactId: string

  /** Platform to send the event to */
  platform: 'meta' | 'google' | 'tiktok'

  /** Event type */
  type: string

  /** Sale ID (if event is related to a purchase) */
  saleId?: string

  /** Stage ID (optional) */
  stage?: string

  /** Event status (optional, defaults to 'sent') */
  status?: 'pending' | 'sent' | 'failed'

  /** Event description (optional) */
  description?: string

  /** Event metadata (optional) */
  metadata?: Record<string, any>
}

/**
 * DTO for updating an existing event
 */
export interface UpdateEventDTO {
  /** Updated status (optional) */
  status?: 'pending' | 'sent' | 'failed'

  /** Updated error message (optional) */
  errorMessage?: string
}

/**
 * DTO for adding a secondary origin to a contact
 */
export interface AddContactOriginDTO {
  /** Origin ID */
  originId: string

  /** Date when this origin was acquired (ISO 8601) */
  date: string

  /** Optional observations */
  observations?: string
}

/**
 * Base interface for pagination parameters
 */
export interface PaginationParams {
  /** Page number (1-based) */
  page?: number

  /** Number of items per page */
  pageSize?: number
}

/**
 * Filters for events
 */
export interface EventFilters extends PaginationParams {
  /** Search term */
  search?: string

  /** Platform filter */
  platform?: 'meta' | 'google' | 'tiktok'

  /** Status filter */
  status?: 'pending' | 'sent' | 'failed'

  /** Event type filter */
  eventType?: string

  /** Contact ID filter */
  contactId?: string

  /** Project ID filter */
  projectId?: string

  /** Date range start */
  dateFrom?: string

  /** Date range end */
  dateTo?: string
}

/**
 * Filters for sales
 */
export interface SaleFilters extends PaginationParams {
  /** Search term */
  search?: string

  /** Sale status filter */
  status?: 'completed' | 'lost'

  /** Origins filter */
  origins?: string[]

  /** Contact ID filter */
  contactId?: string

  /** Project ID filter */
  projectId?: string

  /** Date range start */
  dateFrom?: string

  /** Date range end */
  dateTo?: string

  /** Lost reason filter */
  lostReason?: string

  /** Minimum value filter */
  minValue?: number

  /** Maximum value filter */
  maxValue?: number
}

/**
 * DTO for creating a new message/conversation
 */
export interface CreateMessageDTO {
  /** Message name/title */
  name: string

  /** Origin ID */
  originId: string

  /** Tracking link ID (optional) */
  linkId?: string
}

/**
 * DTO for updating an existing message
 */
export interface UpdateMessageDTO {
  /** Updated name (optional) */
  name?: string

  /** Updated origin ID (optional) */
  originId?: string

  /** Updated link ID (optional) */
  linkId?: string

  /** Updated active status (optional) */
  isActive?: boolean
}

/**
 * Filters for message list queries
 */
export interface MessageFilters extends PaginationParams {
  /** Search term (searches in name) */
  search?: string

  /** Filter by origin ID */
  originId?: string

  /** Filter by active status */
  isActive?: boolean

  /** Filter by date range start */
  startDate?: string

  /** Filter by date range end */
  endDate?: string

  /** Number of items per page (alias for pageSize) */
  perPage?: number
}
