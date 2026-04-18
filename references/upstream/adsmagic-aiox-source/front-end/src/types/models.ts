/**
 * Core domain models for Adsmagic First AI
 *
 * This file contains all the main interfaces representing the domain entities
 * of the application. All interfaces are strictly typed with JSDoc documentation.
 *
 * @module types/models
 */

/**
 * Represents a contact in the system
 *
 * Contacts are the core entity tracking potential and existing customers
 * throughout their journey. They can have multiple origins over time and
 * move through different funnel stages.
 */
export interface Contact {
  /** Unique identifier (UUID) */
  id: string

  /** Project ID for multi-tenancy */
  projectId: string

  /** Full name of the contact (2-100 characters) */
  name: string

  /** Phone number without country code (10-11 digits for Brazil) */
  phone: string

  /** Country calling code (e.g., "+55" for Brazil) */
  countryCode: string

  /**
   * Main origin ID based on attribution model
   * Can be system origin or custom origin ID
   */
  origin: string

  /** Current funnel stage ID */
  stage: string

  /** Email address (optional) */
  email?: string

  /** Company name (optional) */
  company?: string

  /** Location (optional) */
  location?: string

  /** Notes about the contact (optional) */
  notes?: string

  /** Avatar URL (optional) */
  avatar?: string

  /** Whether this contact is marked as favorite */
  isFavorite?: boolean

  /**
   * WhatsApp JID (Jabber ID) - unique WhatsApp identifier
   * Format: "554791662434@s.whatsapp.net" or "554791662434@c.us"
   */
  jid?: string | null

  /**
   * WhatsApp LID (Local ID) - local WhatsApp identifier
   * Format: "213709100187796@lid"
   */
  lid?: string | null

  /**
   * Canonical identifier - normalized identifier for unified search
   * Used for deduplication and cross-platform matching
   */
  canonicalIdentifier?: string | null

  /** Creation timestamp (ISO 8601) */
  createdAt: string

  /** Last update timestamp (ISO 8601) */
  updatedAt: string

  /** Optional metadata about the contact's device and location */
  metadata?: ContactMetadata
}

/**
 * Metadata captured when a contact is created or origin is tracked
 */
export interface ContactMetadata {
  /** Device type: mobile, tablet, or desktop */
  device?: 'mobile' | 'tablet' | 'desktop'

  /** Browser name (e.g., "Chrome", "Safari") */
  browser?: string

  /** Operating system (e.g., "iOS", "Android", "Windows") */
  os?: string

  /** IP address for geolocation */
  ipAddress?: string
}

/**
 * Represents a sale in the system
 *
 * Sales are linked to contacts and track revenue. They can be either
 * completed or lost, with tracking parameters for attribution.
 */
export interface Sale {
  /** Unique identifier (UUID) */
  id: string

  /** Project ID for multi-tenancy */
  projectId: string

  /** Reference to the contact who made the purchase */
  contactId: string

  /** Sale value (must be positive) */
  value: number

  /** Currency code (ISO 4217: BRL, USD, EUR, etc.) */
  currency: string

  /** Sale date (ISO 8601) */
  date: string

  /** Origin attributed to this sale (optional, based on attribution model) */
  origin?: string

  /** Sale status */
  status: 'completed' | 'lost'

  /** Reason why the sale was lost (required if status = 'lost') */
  lostReason?: string

  /** Additional observations about lost sale */
  lostObservations?: string

  /** Tracking parameters captured from URL */
  trackingParams?: TrackingParams

  /** Creation timestamp (ISO 8601) */
  createdAt: string

  /** Last update timestamp (ISO 8601) */
  updatedAt: string

  /** Optional notes about the sale */
  notes?: string

  /** City where the sale was made (captured from IP or user input) */
  city?: string

  /** Country where the sale was made (captured from IP or user input) */
  country?: string

  /** Device type used for the purchase */
  device?: 'mobile' | 'desktop' | 'tablet'

  /** Origin ID for attribution (legacy, prefer origin) */
  originId?: string

  /** UTM Source parameter (convenience accessor from trackingParams) */
  utmSource?: string

  /** UTM Medium parameter (convenience accessor from trackingParams) */
  utmMedium?: string

  /** UTM Campaign parameter (convenience accessor from trackingParams) */
  utmCampaign?: string

  /** UTM Content parameter (convenience accessor from trackingParams) */
  utmContent?: string

  /** UTM Term parameter (convenience accessor from trackingParams) */
  utmTerm?: string

  /** Contact name (populated via backend join) */
  contactName?: string

  /** Contact phone (populated via backend join) */
  contactPhone?: string
}
/**
 * URL tracking parameters for attribution
 *
 * These are automatically captured when a contact clicks on a tracked link.
 * Different platforms use different click IDs.
 */
export interface TrackingParams {
  /** Google Ads click ID */
  gclid?: string

  /** Google Ads enhanced conversions (iOS 14.5+) */
  gbraid?: string

  /** Google Ads enhanced conversions (web) */
  wbraid?: string

  /** Meta (Facebook/Instagram) click ID */
  fbclid?: string

  /** TikTok click ID (currently required for TikTok events) */
  ttpclid?: string

  /** UTM Source parameter */
  utm_source?: string

  /** UTM Medium parameter */
  utm_medium?: string

  /** UTM Campaign parameter */
  utm_campaign?: string

  /** UTM Content parameter */
  utm_content?: string

  /** UTM Term parameter */
  utm_term?: string

  /** TikTok click ID (legacy, maps to ttpclid) */
  ttclid?: string
}

/**
 * Represents a conversion event sent to advertising platforms
 *
 * Events are created when a contact reaches certain funnel stages and are
 * sent to Meta Ads, Google Ads, or TikTok Ads via their APIs.
 */
export interface Event {
  /** Unique identifier (UUID) */
  id: string

  /** Project ID for multi-tenancy */
  projectId: string

  /** Platform to send the event to */
  platform: 'meta' | 'google' | 'tiktok'

  /** Event type (e.g., 'purchase', 'lead', 'add_to_cart') */
  type: string

  /** Event name (alias for type) */
  eventName?: string

  /** Reference to the contact */
  contactId: string

  /** Reference to the sale (if event is related to a purchase) */
  saleId?: string

  /** Stage ID (optional) */
  stage?: string

  /** Event description (optional) */
  description?: string

  /** Entity ID that triggered this event */
  entityId?: string

  /** Type of entity that triggered this event */
  entityType?: 'contact' | 'sale' | 'campaign'

  /** Additional metadata for the event */
  metadata?: Record<string, any>

  /** Event payload data */
  payload?: any

  /** Platform response data */
  response?: any

  /** Error details if event failed */
  error?: string

  /** Number of retry attempts made */
  retryCount?: number

  /** Timestamp when event was processed */
  processedAt?: string

  /** Event sending status */
  status: 'pending' | 'sent' | 'failed'

  /** Last retry timestamp (ISO 8601) */
  lastRetryAt?: string

  /** Error message if event failed */
  errorMessage?: string

  /** Event creation timestamp (ISO 8601) */
  createdAt: string

  /** Last update timestamp (ISO 8601) */
  updatedAt: string

  /** Successfully sent timestamp (ISO 8601) */
  sentAt?: string
}

/**
 * Represents a tag/label for categorizing contacts
 *
 * Tags allow users to add custom labels to contacts for better organization
 * and filtering. Each project can have up to 50 custom tags.
 */
export interface Tag {
  /** Unique identifier (UUID) */
  id: string

  /** Project ID for multi-tenancy */
  projectId: string

  /** Tag name (displayed in UI) */
  name: string

  /** Tag color (hex format: #RRGGBB) */
  color: string

  /** Tag description (optional) */
  description?: string

  /** Number of contacts with this tag */
  contactsCount?: number

  /** Creation timestamp (ISO 8601) */
  createdAt: string

  /** Last update timestamp (ISO 8601) */
  updatedAt?: string
}

/**
 * Represents the association between a contact and a tag
 */
export interface ContactTag {
  /** Contact ID */
  contactId: string

  /** Tag ID */
  tagId: string

  /** When the tag was added to the contact */
  createdAt: string
}

/**
 * Represents a funnel stage
 *
 * Stages define the steps in the customer journey. There must be at least
 * one default stage, and optionally one sale stage and one lost stage.
 */
export interface Stage {
  /** Unique identifier (UUID) */
  id: string

  /** Project ID for multi-tenancy (optional for system stages) */
  projectId?: string

  /** Stage name (displayed in UI) */
  name: string

  /** Stage description (optional) */
  description?: string

  /** Number of contacts in this stage */
  contactsCount?: number

  /** Display order (for Kanban columns) */
  order: number

  /** Stage color (hex format: #RRGGBB) */
  color?: string

  /**
   * Tracking phrase for WhatsApp automation
   * System detects messages containing this phrase and moves contact to this stage
   */
  trackingPhrase?: string

  /**
   * Stage type
   * - normal: Regular funnel stage (multiple allowed)
   * - sale: Represents a completed sale (only 1 per project)
   * - lost: Represents a lost sale (only 1 per project)
   */
  type: 'normal' | 'sale' | 'lost'

  /** Whether this stage is active (inactive stages are hidden) */
  isActive: boolean

  /** Configuration for conversion events */
  eventConfig?: EventConfig

  /** Creation timestamp (ISO 8601) */
  createdAt: string
}

/**
 * Configuration for conversion events triggered by a stage
 */
export interface EventConfig {
  /** Regras de disparo por etapa/origem/canal */
  routes?: StageEventRoute[]

  /** Meta Ads event configuration */
  meta?: PlatformEventConfig

  /** Google Ads event configuration */
  google?: PlatformEventConfig

  /** TikTok Ads event configuration */
  tiktok?: PlatformEventConfig

  /** Default value to send with the event (required for 'purchase' events) */
  defaultValue?: number

  /** Default currency for the event value */
  defaultCurrency?: string
}

export type StageEventRouteChannel = 'meta' | 'google' | 'tiktok'

/**
 * Regra de disparo de evento quando o contato entra na etapa
 */
export interface StageEventRoute {
  /** ID estável da regra (uuid/string) */
  id: string

  /** Canal de destino */
  channel: StageEventRouteChannel

  /** Tipo/nome do evento interno */
  eventType: string

  /** Origem específica (opcional). Quando ausente, aplica para qualquer origem */
  sourceOriginId?: string

  /** Integração selecionada (opcional) */
  integrationId?: string

  /** Conta da integração selecionada (opcional) */
  integrationAccountId?: string

  /** Conversion Action ID (Google Ads) */
  conversionActionId?: string

  /** Nome legível da conversão selecionada */
  conversionActionName?: string

  /** Valor padrão para o evento (opcional) */
  value?: number

  /** Moeda padrão do evento (opcional) */
  currency?: string

  /** Prioridade de execução (maior primeiro) */
  priority?: number

  /** Regra ativa/inativa */
  isActive: boolean
}

/**
 * Platform-specific event configuration
 */
export interface PlatformEventConfig {
  /** Event type recognized by the platform */
  eventType: string

  /** Whether this event is active for this stage */
  active: boolean
}

/**
 * Represents a traffic origin
 *
 * Origins track where contacts come from. System origins cannot be deleted,
 * but users can create up to 20 custom origins.
 */
export interface Origin {
  /** Unique identifier (UUID) */
  id: string

  /** Project ID for multi-tenancy (optional for system origins) */
  projectId?: string

  /** Origin name (displayed in UI and badges) */
  name: string

  /**
   * Origin type
   * - system: Predefined origin (cannot be deleted)
   * - custom: User-created origin (max 20 per project)
   */
  type: 'system' | 'custom'

  /** Badge color (hex format: #RRGGBB) */
  color: string

  /** Icon (Lucide icon name or emoji) */
  icon?: string

  /** Whether this origin is active (inactive origins are hidden) */
  isActive: boolean

  /** Creation timestamp (ISO 8601) */
  createdAt: string

  /** Whether this is a system origin (cannot be deleted/edited) - deprecated, use type === 'system' */
  isSystem?: boolean

  /** Optional description of the origin */
  description?: string

  /** Optional matching mode for utm_source custom attribution */
  utmSourceMatchMode?: 'exact' | 'contains' | null

  /** Optional matching value for utm_source custom attribution */
  utmSourceMatchValue?: string | null

  /** Number of contacts associated with this origin (populated on list views) */
  contactsCount?: number
}

/**
 * Represents a trackable link
 *
 * Links are generated URLs with tracking parameters that automatically
 * create contacts when clicked and can pre-fill WhatsApp messages.
 */
/**
 * Represents a trackable link
 * Aligned with backend: /back-end/types.ts:205-235
 */
export interface Link {
  /** Unique identifier (UUID) */
  id: string

  /** Project ID for multi-tenancy */
  projectId: string

  /** Descriptive name for the link */
  name: string

  /** Description or notes about the link */
  description?: string

  /** Final destination URL where users will be redirected */
  destinationUrl: string

  /** Generated tracking URL (full URL with tracking parameters) */
  trackingUrl: string

  /**
   * Tracking URL (alias for compatibility)
   * Same as trackingUrl
   */
  url: string

  /**
   * Pre-filled message for WhatsApp
   * Automatically filled when user clicks the link
   */
  initialMessage?: string

  /** WhatsApp destination number (digits only) */
  whatsappNumber?: string

  /** Whether this link is active (inactive links don't track) */
  isActive: boolean

  /** Performance statistics for this link */
  stats: {
    /** Total clicks on this link */
    clicks: number
    /** Number of contacts created from this link */
    contacts: number
    /** Number of sales attributed to this link */
    sales: number
    /** Total revenue from sales attributed to this link */
    revenue: number
  }

  /** Origin ID for tracking attribution */
  originId: string

  /** UTM Source parameter */
  utmSource?: string

  /** UTM Medium parameter */
  utmMedium?: string

  /** UTM Campaign parameter */
  utmCampaign?: string

  /** UTM Term parameter */
  utmTerm?: string

  /** UTM Content parameter */
  utmContent?: string

  /** Short URL for sharing */
  shortUrl?: string

  /** Creation timestamp (ISO 8601) */
  createdAt: string

  /** Last update timestamp (ISO 8601) */
  updatedAt: string
}

/**
 * Performance statistics for a trackable link
 */
export interface LinkStats {
  /** Total clicks on this link */
  clicks: number

  /** Number of contacts created from this link */
  contacts: number

  /** Number of sales attributed to this link */
  sales: number

  /** Total revenue from sales attributed to this link */
  revenue: number
}

/**
 * Dashboard metrics for the overview page
 *
 * These metrics are calculated from various data sources and provide
 * a comprehensive view of campaign performance.
 */
export interface DashboardMetrics {
  /** Total investment amount */
  totalInvestment: number

  /** Total revenue amount */
  totalRevenue: number

  /** Total contacts count */
  totalContacts: number

  /** Total sales count */
  totalSales: number

  /** Average ticket value */
  averageTicket: number

  /** Cost per sale */
  costPerSale: number

  /** Conversion rate percentage */
  conversionRate: number

  /** Total impressions */
  impressions: number

  /** Total clicks */
  clicks: number

  /** Cost per click */
  cpc: number

  /** Click-through rate */
  ctr: number

  /** Revenue metrics */
  revenue: MetricWithComparison

  /** Sales metrics */
  sales: MetricWithComparison

  /** ROI (Return on Investment) metrics */
  roi: MetricWithComparison

  /** Contacts growth percentage */
  contactsGrowth?: number

  /** Sales growth percentage */
  salesGrowth?: number

  /** Revenue growth percentage */
  revenueGrowth?: number

  /** Funnel conversion metrics */
  funnel: FunnelMetrics

  /** Financial performance metrics */
  financial: FinancialMetrics
}

/**
 * Metric with period-over-period comparison
 */
export interface MetricWithComparison {
  /** Current period value */
  current: number

  /** Previous period value (for comparison) */
  previous: number

  /** Percentage change (positive or negative) */
  change: number

  /** Trend direction */
  trend?: 'up' | 'down' | 'stable'
}

/**
 * Funnel conversion metrics
 */
export interface FunnelMetrics {
  /** Total ad impressions */
  impressions: number

  /** Total clicks on ads */
  clicks: number

  /** Total contacts created */
  contacts: number

  /** Total sales */
  sales: number

  /** Click-through rate (clicks / impressions * 100) */
  ctr: number

  /** Contact rate (contacts / clicks * 100) */
  contactRate: number

  /** Conversion rate (sales / contacts * 100) */
  conversionRate: number
}

/**
 * Financial performance metrics
 */
export interface FinancialMetrics {
  /** Total ad spend from Meta Ads + Google Ads APIs */
  adSpend: number

  /** Average sale value (revenue / sales) */
  averageTicket: number

  /** Cost per sale (adSpend / sales) */
  costPerSale: number

  /** Cost per click (adSpend / clicks) */
  costPerClick: number
}

/**
 * Métricas de conversão por etapa do funil de vendas
 */
export interface StageFunnelMetrics {
  /** ID da etapa */
  stageId: string

  /** Nome da etapa */
  stageName: string

  /** Número de contatos nesta etapa */
  count: number

  /** Percentual relativo ao total de contatos */
  percentage: number

  /** Taxa de conversão da etapa anterior para esta */
  conversionRate: number

  /** Taxa de abandono (1 - conversionRate) */
  dropOffRate: number
}

/**
 * Represents a project (franchise, corporate, or individual business)
 *
 * Projects are the top-level containers for all data in the system.
 * Each user can have multiple projects.
 */
export interface Project {
  /** Unique identifier (UUID) */
  id: string

  /** Project name */
  name: string

  /** Project description (optional) */
  description?: string

  /** Company type */
  companyType: 'franchise' | 'corporate' | 'individual'

  /** Number of franchises (if applicable) */
  franchiseCount?: number

  /** Country code (ISO 3166-1 alpha-2) */
  country: string

  /** Default language (ISO 639-1) */
  language: string

  /** Default currency (ISO 4217) */
  currency: string

  /** Timezone (IANA timezone) */
  timezone: string

  /** Attribution model for displaying main origin */
  attributionModel: 'first_touch' | 'last_touch' | 'conversion'

  /** WhatsApp integration status */
  whatsappConnected: boolean

  /** Meta Ads integration status */
  metaAdsConnected: boolean

  /** Google Ads integration status */
  googleAdsConnected: boolean

  /** TikTok Ads integration status */
  tiktokAdsConnected: boolean

  /** Creation timestamp (ISO 8601) */
  createdAt: string

  /** Last update timestamp (ISO 8601) */
  updatedAt: string
}

/**
 * Represents an integration with external platforms
 * Aligned with backend: /back-end/types.ts:241-256
 */
export interface Integration {
  /** Unique identifier (UUID) - ALWAYS required */
  id: string

  /** Project ID for multi-tenancy */
  projectId: string

  /** Platform identifier - expanded to match backend */
  platform: 'whatsapp' | 'facebook_messenger' | 'telegram' | 'instagram_direct' |
  'meta' | 'google' | 'tiktok' | 'linkedin' | 'discord' | 'slack'

  /** Platform type category */
  platformType: 'messaging' | 'advertising' | 'analytics' | 'crm'

  /** Connection status */
  status: 'connected' | 'disconnected' | 'error' | 'syncing' | 'pending'

  /** Platform-specific configuration */
  platformConfig: Record<string, unknown>

  /** Platform settings (optional) */
  settings?: Record<string, unknown>

  /** Whether this integration is active */
  isActive?: boolean

  /** Last synchronization timestamp (ISO 8601) */
  lastSync?: string

  /** Error message (if status is error) */
  errorMessage?: string

  /** Creation timestamp (ISO 8601) */
  createdAt: string

  /** Last update timestamp (ISO 8601) */
  updatedAt: string

  /** Connection details (populated when status is 'connected') */
  connection?: {
    connectedAt: string
    lastSync?: string
    accountId?: string
    accountName?: string
    email?: string
    expiresAt?: string
  }

  /** Error details (populated when status is 'error') */
  error?: {
    message: string
    code?: string
    timestamp: string
  }

  /** Sync logs history (most recent first) */
  syncLogs?: SyncLog[]
}

/**
 * Represents a synchronization log entry
 */
export interface SyncLog {
  /** Unique log ID */
  id: string

  /** Sync start timestamp (ISO 8601) */
  startedAt: string

  /** Sync completion timestamp (ISO 8601) */
  completedAt?: string

  /** Sync status */
  status: 'running' | 'success' | 'error' | 'warning'

  /** Error message if failed */
  error?: string

  /** Number of items synced */
  itemsSynced?: number

  /** Duration in milliseconds */
  durationMs?: number

  /** Additional details */
  details?: string
}

/**
 * Represents a connection to an external platform
 */
export interface Connection {
  /** Unique connection ID */
  id: string

  /** Platform name */
  platform: string

  /** External account ID */
  accountId: string

  /** External account name */
  accountName: string

  /** Account email (optional) */
  email?: string

  /** Connection timestamp */
  connectedAt: string

  /** Token expiration (optional) */
  expiresAt?: string

  /** Granted permissions */
  permissions: string[]

  /** Additional metadata */
  metadata?: Record<string, any>
}

/**
 * OAuth authentication result
 */
export interface OAuthResult {
  /** Whether the OAuth flow was successful */
  success: boolean

  /** Integration ID created during OAuth */
  integrationId?: string

  /** Access token (legacy - may not be present) */
  accessToken?: string

  /** Refresh token (optional) */
  refreshToken?: string

  /** Token expiration in seconds */
  expiresIn?: number

  /** Available accounts */
  accounts: Account[]

  /** Error message if OAuth failed */
  error?: string
}

/**
 * External platform account
 * Aligned with backend: /back-end/supabase/functions/integrations/types.ts:25-31
 */
export interface Account {
  /** Account ID */
  id: string

  /** Account name */
  name: string

  /** External account ID from platform (e.g., Meta Ad Account ID) */
  accountId: string

  /** Account type */
  type: 'ad_account' | 'pixel' | 'page' | 'profile'

  /** Granted permissions */
  permissions: string[]

  /** Whether this is a manager/MCC account (Google Ads only) */
  isManager?: boolean

  /** Parent MCC account ID if this is a child account (Google Ads only) */
  parentMccId?: string
}

/**
 * Google Ads conversion action
 */
export interface GoogleConversionAction {
  /** Conversion Action ID */
  id: string

  /** Display name */
  name: string

  /** Google Ads type */
  type?: string

  /** Current status */
  status?: string

  /** Category */
  category?: string

  /** Whether primary for goal */
  primaryForGoal?: boolean

  /** Full Google resource name */
  resourceName?: string
}

/**
 * Tag installation status
 */
export interface TagInstallation {
  /** Project ID */
  projectId: string

  /** Script code */
  scriptCode: string

  /** Installation status */
  isInstalled: boolean

  /** Tag status */
  status?: 'active' | 'inactive' | 'error'

  /** Last ping timestamp */
  lastPing?: string

  /** Number of events received */
  eventsReceived: number

  /** Last verified URL (optional) */
  lastVerifiedUrl?: string
}

/**
 * Tag verification start response
 */
export interface TagVerificationStartResponse {
  /** Verification ID */
  verificationId: string

  /** URL opened in customer website with one-shot token */
  verificationUrl: string

  /** Expiration timestamp for this verification attempt */
  expiresAt: string

  /** Initial verification status */
  status: 'pending'
}

/**
 * Tag verification status response
 */
export interface TagVerificationStatusResponse {
  /** Verification ID */
  verificationId: string

  /** Current status */
  status: 'pending' | 'verified' | 'expired' | 'failed'

  /** Expiration timestamp */
  expiresAt: string

  /** When verification succeeded */
  verifiedAt?: string

  /** URL informed by user */
  siteUrl: string

  /** Page URL sent by tag ping */
  verifiedPageUrl?: string

  /** Last error message */
  errorMessage?: string

  /** Last update timestamp */
  lastUpdatedAt?: string
}

/**
 * General project settings
 */
export interface GeneralSettings {
  /** Project ID */
  projectId: string

  /** Project name */
  projectName: string

  /** Project description */
  projectDescription: string

  /** Attribution model for conversions */
  attributionModel: 'first_touch' | 'last_touch' | 'conversion'

  /** Monthly revenue goal in currency units (optional) */
  revenueGoal?: number

  /** Creation timestamp */
  createdAt: string
}

/**
 * Currency and regional settings
 */
export interface CurrencySettings {
  /** Currency code (BRL, USD, EUR) */
  currency: string

  /** Timezone identifier */
  timezone: string

  /** Date format */
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD'

  /** Time format */
  timeFormat: '12h' | '24h'

  /** Thousands separator */
  thousandsSeparator: ',' | '.' | ' '

  /** Decimal separator */
  decimalSeparator: ',' | '.'
}

/**
 * Notification settings
 */
export interface NotificationSettings {
  /** Whether notifications are enabled */
  enabled: boolean

  /** Email address for notifications */
  email: string

  /** Events to notify about */
  events: string[]

  /** Digest frequency */
  digestFrequency: 'daily' | 'weekly' | 'monthly' | 'never'

  /** Time to send digest (HH:MM) */
  digestTime: string

  /** Timezone for notifications */
  timezone: string
}

/**
 * Complete project settings
 */
export interface ProjectSettings {
  /** General settings */
  general: GeneralSettings

  /** Currency settings */
  currency: CurrencySettings

  /** Notification settings */
  notifications: NotificationSettings
}

/**
 * Time series data for dashboard charts
 */
export interface TimeSeriesData {
  /** Date in YYYY-MM-DD format */
  date: string

  /** Number of contacts on this date */
  contacts: number

  /** Number of sales on this date */
  sales: number

  /** Revenue generated on this date */
  revenue: number
}

/**
 * Origin performance metrics for dashboard
 */
export interface OriginPerformance {
  /** Unique identifier */
  id?: string

  /** Origin name (display name) */
  name?: string

  /** Origin slug/key (for backwards compatibility) */
  origin: string

  /** Color for display */
  color?: string

  /** Total spent/investment in this origin */
  spent?: number

  /** Total investment in this origin (alias for spent) */
  investment: number

  /** Total contacts generated */
  contacts: number

  /** Total sales generated */
  sales: number

  /** Total revenue generated */
  revenue: number

  /** Conversion rate percentage */
  conversionRate: number

  /** Return on investment (null when no spending) */
  roi: number | null

  /** Cost per sale */
  costPerSale: number

  /** Cost per contact */
  costPerContact: number
}

// ============================================================================
// DASHBOARD V2 TYPES
// ============================================================================

/**
 * Dashboard V2 filter options
 * Global filters that apply to all dashboard sections
 */
export interface DashboardV2Filters {
  /** Selected time period */
  period: 'today' | '7d' | '30d' | '90d' | 'custom'

  /** Start date for custom period (ISO 8601) - Required when period is 'custom' */
  startDate?: string

  /** End date for custom period (ISO 8601) - Required when period is 'custom' */
  endDate?: string

  /** Whether to compare with previous period */
  compare: boolean

  /** Selected origin filter (null = all origins) */
  origin: string | null

  /** Selected team/seller filter (optional) */
  teamId?: string | null

  /** Selected view mode */
  viewMode: 'executivo' | 'marketing' | 'comercial' | 'completo'
}

/**
 * North Star KPI with comparison
 */
export interface NorthStarKPI {
  /** Current value */
  value: number

  /** Change compared to previous period (percentage) */
  delta: number | null

  /** Formatted display value */
  displayValue?: string

  /** Tooltip with formula explanation */
  tooltip?: string
}

export type NorthStarMetricId = string

export type NorthStarCustomMetricType =
  | 'stage_count'
  | 'sum_stages'
  | 'divide_stages'
  | 'cost_per_stage'

export interface NorthStarCustomMetricDefinition {
  id: string
  name: string
  type: NorthStarCustomMetricType
  stageId?: string
  stageIds?: string[]
  numeratorStageIds?: string[]
  denominatorStageIds?: string[]
}

export interface NorthStarCustomMetricValue {
  id: string
  name: string
  type: NorthStarCustomMetricType
  value: number
  delta: number | null
  format: 'number' | 'percent' | 'currency'
}

export interface NorthStarConfig {
  primaryMetricIds: NorthStarMetricId[]
  detailedMetricOrder: NorthStarMetricId[]
  customMetrics: NorthStarCustomMetricDefinition[]
}

/**
 * Dashboard V2 Summary Response (from RPC)
 * Aggregated metrics for the selected period
 */
export interface DashboardV2Summary {
  /** North Star KPIs (expanded to 14) */
  northStar: {
    revenue: NorthStarKPI
    sales: NorthStarKPI
    contacts: NorthStarKPI
    spend: NorthStarKPI
    roi: NorthStarKPI
    cac: NorthStarKPI
    avgTicket: NorthStarKPI
    impressions: NorthStarKPI
    clicks: NorthStarKPI
    ctr: NorthStarKPI
    cpc: NorthStarKPI
    salesRate: NorthStarKPI
    avgCycleDays: NorthStarKPI
    activeCustomers: NorthStarKPI
    goalPercentage: NorthStarKPI
  }

  /** Actionable insights (2-3 items) */
  insights: DashboardInsight[]

  /** Customizable North Star configuration for this project */
  northStarConfig?: NorthStarConfig

  /** Calculated values for custom metrics */
  customMetrics?: NorthStarCustomMetricValue[]
}

/**
 * Actionable insight with CTA
 */
export interface DashboardInsight {
  /** Unique insight ID */
  id: string

  /** Severity level affects visual styling */
  severity: 'info' | 'warn' | 'crit'

  /** Insight title/message */
  title: string

  /** Call to action */
  cta: {
    /** Action type */
    type: 'open_tab' | 'focus_block' | 'open_drawer'

    /** Action payload (depends on type) */
    payload: any
  }
}

/**
 * Funnel stage statistics
 */
export interface FunnelStageStats {
  /** Stage ID */
  stageId: string

  /** Stage name */
  stageName: string

  /** Number of contacts/deals in this stage */
  count: number

  /** Conversion rate from previous stage (%) */
  conversionRate: number

  /** Average time in this stage (days) */
  avgTimeInStage?: number
}

/**
 * Pipeline stage statistics (for sales funnel)
 */
export interface PipelineStageStats {
  /** Stage ID */
  stageId: string

  /** Stage name */
  stageName: string

  /** Number of deals in this stage */
  count: number

  /** Total value of deals in this stage */
  value: number

  /** Average time in this stage (days) */
  avgTime: number

  /** Conversion rate to next stage (%) */
  conversionRate?: number
}

/**
 * Origin breakdown for performance table
 */
export interface OriginBreakdown {
  /** Origin ID */
  originId: string

  /** Origin name */
  originName: string

  /** Total spend/investment */
  spend: number

  /** Total contacts generated */
  contacts: number

  /** Total sales */
  sales: number

  /** Conversion rate (%) */
  conversionRate: number

  /** CAC (Cost per Acquisition/Sale) */
  cac: number

  /** ROI multiplier */
  roi: number

  /** Revenue generated */
  revenue?: number
}

/**
 * Time series data point for charts
 */
export interface TimeSeriesPoint {
  /** Date string (YYYY-MM-DD) */
  date: string

  /** Metric value */
  value: number

  /** Optional comparison value */
  compareValue?: number
}

/**
 * Entity list for drill-down drawer
 */
export interface DrillDownEntity {
  /** Entity ID */
  id: string

  /** Entity type */
  type: 'contact' | 'deal' | 'sale'

  /** Display name */
  name: string

  /** Current stage */
  stage: string

  /** Origin/source */
  origin: string

  /** Value (for deals/sales) */
  value?: number

  /** Created date */
  createdAt: string

  /** Additional metadata */
  metadata?: Record<string, any>
}

/**
 * Telemetry event for dashboard interactions
 */
export interface DashboardTelemetryEvent {
  /** Event name */
  eventName: 'dashboard_viewed' | 'filter_changed' | 'compare_toggled' |
  'view_mode_changed' | 'insight_clicked' | 'funnel_stage_clicked' |
  'pipeline_stage_clicked' | 'origin_row_clicked' | 'export_clicked'

  /** User ID */
  userId: string

  /** Team/Project ID */
  teamId: string

  /** Event payload */
  payload: Record<string, any>

  /** Timestamp */
  timestamp: string
}

// ============================================================
// CONTACT ACTIVITY (G6.6) - Histórico de atividades do contato
// ============================================================

/**
 * Tipos de atividade do contato
 */
export type ContactActivityType =
  | 'contact_created'
  | 'stage_changed'
  | 'tag_added'
  | 'tag_removed'
  | 'note_added'
  | 'note_updated'
  | 'sale_created'
  | 'sale_updated'
  | 'email_sent'
  | 'call_logged'
  | 'meeting_scheduled'
  | 'origin_changed'
  | 'field_updated'
  | 'event_tracked'

/**
 * Representa uma atividade/evento no histórico do contato
 *
 * Atividades são registradas automaticamente quando ocorrem mudanças
 * no contato ou ações são realizadas (vendas, emails, etc.)
 */
export interface ContactActivity {
  /** Identificador único (UUID) */
  id: string

  /** ID do contato relacionado */
  contactId: string

  /** ID do projeto (multi-tenancy) */
  projectId: string

  /** Tipo da atividade */
  type: ContactActivityType

  /** Título curto da atividade */
  title: string

  /** Descrição detalhada (opcional) */
  description?: string

  /** Metadados específicos do tipo de atividade */
  metadata: ContactActivityMetadata

  /** ID do usuário que realizou a ação (null para automáticas) */
  performedBy?: string

  /** Nome do usuário que realizou a ação */
  performedByName?: string

  /** Data/hora da atividade (ISO 8601) */
  createdAt: string
}

/**
 * Metadados específicos por tipo de atividade
 */
export interface ContactActivityMetadata {
  // Para stage_changed
  fromStage?: string
  fromStageName?: string
  toStage?: string
  toStageName?: string

  // Para tag_added / tag_removed
  tagId?: string
  tagName?: string
  tagColor?: string

  // Para note_added / note_updated
  notePreview?: string

  // Para sale_created / sale_updated
  saleId?: string
  saleValue?: number
  saleStatus?: 'completed' | 'lost' | 'pending'

  // Para field_updated
  fieldName?: string
  oldValue?: string
  newValue?: string

  // Para origin_changed
  fromOrigin?: string
  fromOriginName?: string
  toOrigin?: string
  toOriginName?: string

  // Para event_tracked
  eventType?: string
  platform?: string

  // Campo genérico para dados adicionais
  [key: string]: any
}

/**
 * Represents a WhatsApp message/conversation tracked by origin
 *
 * Messages are conversation threads initiated through tracking links
 * and associated with a specific origin (Google Ads, Meta, etc.)
 */
export interface Message {
  /** Unique identifier (UUID) */
  id: string

  /** Project ID for multi-tenancy */
  projectId: string

  /** Message name/title (e.g., "Extensão do Google", "Ficha Google") */
  name: string

  /** Origin ID (system or custom origin) */
  originId: string

  /** Number of contacts created through this message */
  contactsCount: number

  /** Number of sales attributed to this message */
  salesCount: number

  /** Average ticket value from sales */
  averageTicket: number

  /** Tracking link ID associated with this message */
  linkId?: string

  /** Whether this message is active */
  isActive: boolean

  /** Creation timestamp (ISO 8601) */
  createdAt: string

  /** Last update timestamp (ISO 8601) */
  updatedAt: string
}

/**
 * Metrics for messages grouped by origin
 */
export interface MessageMetrics {
  /** Origin ID */
  originId: string

  /** Origin name */
  originName: string

  /** Number of messages from this origin */
  messagesCount: number

  /** Total contacts from this origin's messages */
  contactsCount: number

  /** Total sales from this origin's messages */
  salesCount: number

  /** Average ticket across all sales */
  averageTicket: number
}
