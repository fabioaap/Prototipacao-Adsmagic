/**
 * Central export point for all application types
 *
 * This file re-exports types from specialized modules for convenient imports.
 * Import types from this file rather than from individual modules.
 *
 * @module types
 */

// ============================================================================
// DOMAIN MODELS
// ============================================================================
export type {
  Contact,
  ContactMetadata,
  Sale,
  TrackingParams,
  Event,
  Tag,
  ContactTag,
  Stage,
  EventConfig,
  StageEventRoute,
  StageEventRouteChannel,
  PlatformEventConfig,
  Origin,
  Link,
  LinkStats,
  DashboardMetrics,
  MetricWithComparison,
  FunnelMetrics,
  StageFunnelMetrics,
  FinancialMetrics,
  Project,
  TimeSeriesData,
  OriginPerformance,
  // Dashboard V2 types
  DashboardV2Filters,
  NorthStarKPI,
  NorthStarMetricId,
  NorthStarCustomMetricType,
  NorthStarCustomMetricDefinition,
  NorthStarCustomMetricValue,
  NorthStarConfig,
  DashboardV2Summary,
  DashboardInsight,
  FunnelStageStats,
  FunnelCountMode,
  FunnelStatsView,
  PipelineStageStats,
  OriginBreakdown,
  TimeSeriesPoint,
  DrillDownEntity,
  DashboardTelemetryEvent,
  // Contact Activity types (G6.6)
  ContactActivityType,
  ContactActivity,
  ContactActivityMetadata,
  // Message types
  Message,
  MessageMetrics,
  // Conversation message types (Chat History)
  ConversationMessage,
  ConversationMessageDirection,
  ConversationMessageContentType,
  ConversationMessageStatus
} from './models'

// ============================================================================
// DATA TRANSFER OBJECTS (DTOs)
// ============================================================================
export type {
  CreateContactDTO,
  UpdateContactDTO,
  CreateSaleDTO,
  UpdateSaleDTO,
  MarkSaleLostDTO,
  CreateEventDTO,
  UpdateEventDTO,
  CreateStageDTO,
  UpdateStageDTO,
  CreateOriginDTO,
  UpdateOriginDTO,
  CreateTagDTO,
  UpdateTagDTO,
  UpdateContactTagsDTO,
  CreateLinkDTO,
  UpdateLinkDTO,
  CreateProjectDTO,
  UpdateProjectDTO,
  AddContactOriginDTO,
  CreateMessageDTO,
  UpdateMessageDTO,
  MessageFilters
} from './dto'

// ============================================================================
// API TYPES
// ============================================================================
export type {
  ApiResponse,
  ApiMeta,
  PaginatedResponse,
  PaginationInfo,
  Result,
  ApiError,
  ContactFilters,
  SaleFilters,
  EventFilters,
  LinkFilters,
  DashboardFilters,
  SortOptions,
  ValidationError,
  BatchOperationResult
} from './api'

// ============================================================================
// AUTHENTICATION TYPES
// ============================================================================
export interface UserProfile {
  id: string
  first_name: string
  last_name: string
  preferred_language: 'pt' | 'en' | 'es'
  timezone: string | null
  avatar_url: string | null
  phone: string | null
  country?: string | null
  is_active: boolean | null
  last_login_at: string | null
  created_at: string | null
  updated_at: string | null
}

export interface User {
  id: string
  email: string
  name: string
  profile?: UserProfile
  createdAt: Date
  updatedAt: Date
}

// ============================================================================
// COMPANY TYPES
// ============================================================================
export interface Company {
  id: string
  name: string
  description: string | null
  country: string
  currency: string
  timezone: string
  industry: string | null
  size: string | null
  website: string | null
  logo_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string

  /** Current user's role in this company (populated from CompanyUser) */
  userRole?: 'owner' | 'admin' | 'manager' | 'member' | 'viewer'
}

export interface CompanyUser {
  id: string
  company_id: string
  user_id: string
  role: 'owner' | 'admin' | 'manager' | 'member' | 'viewer'
  permissions: Record<string, boolean> | null
  is_active: boolean
  invited_by: string | null
  invited_at: string | null
  accepted_at: string | null
  created_at: string
  updated_at: string
}

export interface CompanySettings {
  id: string
  company_id: string
  theme: string | null
  language: string | null
  timezone: string | null
  date_format: string | null
  time_format: string | null
  decimal_separator: string | null
  thousands_separator: string | null
  notifications_enabled: boolean
  notification_email: string | null
  digest_frequency: string | null
  digest_time: string | null
  default_attribution_model: string | null
  auto_track_events: boolean
  include_company_info: boolean
  include_contact_info: boolean
  report_timezone: string | null
  created_at: string
  updated_at: string
}

// DTOs
export interface CreateCompanyDTO {
  name: string
  description?: string
  country: string
  currency: string
  timezone: string
  industry?: string
  size?: string
  website?: string
}

export interface UpdateCompanyDTO {
  name?: string
  description?: string
  country?: string
  currency?: string
  timezone?: string
  industry?: string
  size?: string
  website?: string
  logo_url?: string
}

export interface InviteUserDTO {
  email: string
  role: CompanyUser['role']
  permissions?: Record<string, boolean>
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthResponse {
  user: User
  token: string
}

// ============================================================================
// FORGOT PASSWORD & OTP TYPES
// ============================================================================

export interface ForgotPasswordRequest {
  email: string
}

export interface ForgotPasswordResponse {
  message: string
  email: string
  expiresIn?: number // tempo em segundos até expiração do OTP
}

export interface VerifyOtpRequest {
  email: string
  otp: string
}

export interface VerifyOtpResponse {
  message: string
  token: string // token temporário para reset de senha
}

export interface ResetPasswordRequest {
  token: string
  newPassword: string
}

export interface ResetPasswordResponse {
  message: string
  success: boolean
}

// ============================================================================
// BACKEND API TYPES (snake_case contracts)
// ============================================================================
export type {
  BackendContact,
  BackendCreateContactDTO,
  BackendUpdateContactDTO,
  BackendContactsListParams,
  BackendContactsListResponse,
  BackendContactResponse,
  BackendDeleteContactResponse,
  BackendValidationError,
  BackendErrorResponse
} from './api/contacts.api'

export type {
  BackendConversationMessage,
  BackendConversationResponse
} from './api/conversations.api'
