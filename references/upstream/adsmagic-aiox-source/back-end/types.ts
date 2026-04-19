/**
 * Tipos TypeScript para o Backend - Adsmagic First AI
 * 
 * Este arquivo contém todos os tipos TypeScript utilizados
 * no backend, incluindo tipos de banco de dados, APIs e workers.
 * 
 * IMPORTANTE: Estes tipos devem ser sincronizados com o schema do banco.
 */

// ============================================================================
// TIPOS BASE
// ============================================================================

export type UUID = string;
export type Timestamp = string; // ISO 8601 format
export type Currency = 'BRL' | 'USD' | 'EUR';
export type Language = 'pt' | 'en' | 'es';

// ============================================================================
// TIPOS DE USUÁRIO E AUTENTICAÇÃO
// ============================================================================

export interface UserProfile {
  id: UUID;
  first_name: string;
  last_name: string;
  preferred_language: Language;
  timezone: string;
  avatar_url?: string;
  phone?: string;
  is_active: boolean;
  last_login_at?: Timestamp;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface Company {
  id: UUID;
  name: string;
  description?: string;
  logo_url?: string;
  website?: string;
  industry?: string;
  size: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  country: string; // ISO 3166-1 alpha-2
  timezone: string;
  currency: Currency;
  is_active: boolean;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface CompanyUser {
  id: UUID;
  company_id: UUID;
  user_id: UUID;
  role: 'owner' | 'admin' | 'manager' | 'member' | 'viewer';
  permissions: Record<string, any>;
  is_active: boolean;
  invited_by?: UUID;
  invited_at?: Timestamp;
  accepted_at?: Timestamp;
  created_at: Timestamp;
  updated_at: Timestamp;
}

// ============================================================================
// TIPOS DE PROJETO
// ============================================================================

export interface Project {
  id: UUID;
  company_id: UUID;
  created_by: UUID;
  name: string;
  description?: string;
  company_type: 'franchise' | 'corporate' | 'individual';
  franchise_count?: number;
  country: string;
  language: Language;
  currency: Currency;
  timezone: string;
  attribution_model: 'first_touch' | 'last_touch' | 'conversion';
  
  // Integrações
  whatsapp_connected: boolean;
  meta_ads_connected: boolean;
  google_ads_connected: boolean;
  tiktok_ads_connected: boolean;
  
  // Status
  status: 'draft' | 'active' | 'paused' | 'archived';
  
  // Wizard Progress (novos campos)
  wizard_progress?: {
    current_step: number;
    data: Record<string, unknown>; // ProjectData serializado
    last_saved_at: string;
  } | null;
  wizard_current_step?: number;
  wizard_completed_at?: string | null;
  
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface ProjectUser {
  id: UUID;
  project_id: UUID;
  user_id: UUID;
  role: 'owner' | 'admin' | 'manager' | 'member' | 'viewer';
  permissions: Record<string, any>;
  is_active: boolean;
  invited_by?: UUID;
  invited_at?: Timestamp;
  accepted_at?: Timestamp;
  created_at: Timestamp;
  updated_at: Timestamp;
}

// ============================================================================
// TIPOS DE CONTATOS
// ============================================================================

export interface Contact {
  id: UUID;
  project_id: UUID;
  name: string;
  phone: string;
  country_code: string;
  email?: string;
  company?: string;
  location?: string;
  notes?: string;
  avatar_url?: string;
  is_favorite: boolean;
  
  // Atribuição
  main_origin_id: UUID;
  current_stage_id: UUID;
  
  // Metadados
  metadata: Record<string, any>;
  
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface Origin {
  id: UUID;
  project_id?: UUID; // NULL para origens do sistema
  name: string;
  type: 'system' | 'custom';
  color: string; // Hex color
  icon?: string;
  is_active: boolean;
  created_at: Timestamp;
}

export interface Stage {
  id: UUID;
  project_id?: UUID; // NULL para estágios do sistema
  name: string;
  display_order: number;
  color?: string; // Hex color
  tracking_phrase?: string;
  type: 'normal' | 'sale' | 'lost';
  is_active: boolean;
  
  // Configuração de eventos
  event_config: Record<string, any>;
  
  created_at: Timestamp;
}

// ============================================================================
// TIPOS DE VENDAS
// ============================================================================

export interface Sale {
  id: UUID;
  project_id: UUID;
  contact_id: UUID;
  value: number;
  currency: Currency;
  sale_date: Timestamp;
  origin_id?: UUID;
  status: 'completed' | 'lost';
  
  // Campos para vendas perdidas
  lost_reason?: string;
  lost_observations?: string;
  
  // Parâmetros de rastreamento
  tracking_params: Record<string, any>;
  
  created_at: Timestamp;
  updated_at: Timestamp;
}

// ============================================================================
// TIPOS DE LINKS RASTREÁVEIS
// ============================================================================

export interface TrackableLink {
  id: UUID;
  project_id: UUID;
  name: string;
  destination_url: string;
  tracking_url: string;
  initial_message?: string;
  origin_id: UUID;
  is_active: boolean;
  
  // Parâmetros UTM
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  
  // Estatísticas
  stats: {
    clicks: number;
    contacts: number;
    sales: number;
    revenue: number;
  };
  
  created_at: Timestamp;
  updated_at: Timestamp;
}

// ============================================================================
// TIPOS DE INTEGRAÇÕES
// ============================================================================

export interface Integration {
  id: UUID;
  project_id: UUID;
  platform: 'whatsapp' | 'facebook_messenger' | 'telegram' | 'instagram_direct' | 
           'meta' | 'google' | 'tiktok' | 'linkedin' | 'discord' | 'slack';
  platform_type: 'messaging' | 'advertising' | 'analytics' | 'crm';
  status: 'connected' | 'disconnected' | 'error' | 'syncing' | 'pending';
  
  // Configurações da plataforma
  platform_config: Record<string, any>;
  last_sync_at?: Timestamp;
  error_message?: string;
  
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface IntegrationAccount {
  id: UUID;
  integration_id: UUID;
  project_id: UUID;
  
  // Identificação da conta
  account_name: string;
  external_account_id: string;
  external_account_name: string;
  external_email?: string;
  
  // Status da conta
  status: 'active' | 'inactive' | 'error' | 'expired';
  is_primary: boolean;
  
  // Dados de autenticação
  access_token?: string; // Criptografado
  refresh_token?: string; // Criptografado
  token_expires_at?: Timestamp;
  permissions: string[];
  
  // Metadados específicos da conta
  account_metadata: Record<string, any>;
  
  // Pixel ID (Meta Ads) - ID do pixel associado a esta conta específica
  pixel_id?: string;
  
  // Estatísticas da conta
  last_sync_at?: Timestamp;
  sync_status: 'pending' | 'syncing' | 'success' | 'error';
  error_message?: string;
  
  created_at: Timestamp;
  updated_at: Timestamp;
}

// ============================================================================
// TIPOS DE MENSAGERIA
// ============================================================================

export interface MessagingAccount {
  id: UUID;
  integration_account_id: UUID;
  project_id: UUID;
  
  // Plataforma de mensageria
  platform: 'whatsapp' | 'facebook_messenger' | 'telegram' | 'instagram_direct' | 'discord' | 'slack';
  
  // Broker/Integração específica
  broker_type: string; // 'uazapi', 'evolution', 'telegram_bot', etc.
  broker_config: Record<string, any>;
  
  // Identificação da conta
  account_identifier: string; // phone_number, page_id, bot_token, etc.
  account_name: string;
  account_display_name?: string;
  
  // Status e configurações
  status: 'active' | 'inactive' | 'suspended' | 'connecting' | 'disconnected';
  is_primary: boolean;
  
  // Configurações específicas da plataforma
  platform_config: Record<string, any>;
  
  // Autenticação
  access_token?: string; // Criptografado
  refresh_token?: string; // Criptografado
  token_expires_at?: Timestamp;
  
  // Webhook/API
  webhook_url?: string;
  webhook_secret?: string;
  api_key?: string;
  
  // Estatísticas
  total_messages: number;
  total_contacts: number;
  last_message_at?: Timestamp;
  last_webhook_at?: Timestamp;
  
  created_at: Timestamp;
  updated_at: Timestamp;
}

// ============================================================================
// TIPOS DE EVENTOS E PROCESSAMENTO
// ============================================================================

export interface ConversionEvent {
  id: UUID;
  project_id: UUID;
  contact_id: UUID;
  sale_id?: UUID;
  stage_id?: UUID;
  
  // Plataforma e tipo
  platform: 'meta' | 'google' | 'tiktok';
  event_type: string;
  
  // Status e processamento
  status: 'pending' | 'sent' | 'failed';
  retry_count: number;
  last_retry_at?: Timestamp;
  processed_at?: Timestamp;
  sent_at?: Timestamp;
  
  // Dados do evento
  event_data: Record<string, any>;
  response_data?: Record<string, any>;
  error_message?: string;
  
  // Tracking parameters
  tracking_params: Record<string, any>;
  
  // Hash para deduplicação
  event_hash?: string;
  
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface ProcessingQueue {
  id: UUID;
  project_id: UUID;
  job_type: 'conversion_event' | 'analytics_update' | 'integration_sync' | 'message_processing';
  payload: Record<string, any>;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  retry_count: number;
  max_retries: number;
  scheduled_at: Timestamp;
  processed_at?: Timestamp;
  error_message?: string;
  created_at: Timestamp;
}

// ============================================================================
// TIPOS DE CONFIGURAÇÕES
// ============================================================================

export interface ProjectSettings {
  id: UUID;
  project_id: UUID;
  
  // Configurações gerais
  project_name?: string;
  project_description?: string;
  attribution_model: 'first_touch' | 'last_touch' | 'conversion';
  
  // Configurações de moeda
  currency: Currency;
  timezone: string;
  date_format: string;
  time_format: '12h' | '24h';
  thousands_separator: string;
  decimal_separator: string;
  
  // Configurações de notificação
  notifications_enabled: boolean;
  notification_email?: string;
  notification_events: string[];
  digest_frequency: 'daily' | 'weekly' | 'monthly';
  digest_time: string; // HH:MM format
  notification_timezone: string;
  
  created_at: Timestamp;
  updated_at: Timestamp;
}

// ============================================================================
// TIPOS DE MÉTRICAS E ANALYTICS
// ============================================================================

export interface DashboardMetrics {
  id: UUID;
  project_id: UUID;
  metric_date: string; // YYYY-MM-DD format
  
  // Métricas de tráfego
  impressions: number;
  clicks: number;
  cost_per_click: number;
  click_through_rate: number;
  
  // Métricas de contatos
  total_contacts: number;
  new_contacts: number;
  
  // Métricas de vendas
  total_sales: number;
  total_revenue: number;
  average_ticket: number;
  conversion_rate: number;
  
  // Métricas financeiras
  total_investment: number;
  cost_per_sale: number;
  roi: number;
  
  created_at: Timestamp;
  updated_at: Timestamp;
}

// ============================================================================
// TIPOS DE API RESPONSES
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: Timestamp;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ============================================================================
// TIPOS DE WORKERS
// ============================================================================

export interface WorkerRequest {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  headers: Record<string, string>;
  body?: any;
  query?: Record<string, string>;
}

export interface WorkerResponse {
  status: number;
  headers: Record<string, string>;
  body?: any;
}

// ============================================================================
// TIPOS DE VALIDAÇÃO
// ============================================================================

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// ============================================================================
// TIPOS DE AUDITORIA
// ============================================================================

export interface AuditLog {
  id: UUID;
  table_name: string;
  record_id: UUID;
  operation: 'INSERT' | 'UPDATE' | 'DELETE';
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  user_id?: UUID;
  ip_address?: string;
  user_agent?: string;
  created_at: Timestamp;
}

// ============================================================================
// TIPOS DE EXPORT
// ============================================================================

// Exportar todos os tipos para uso em outros arquivos
export type {
  UUID,
  Timestamp,
  Currency,
  Language,
  UserProfile,
  Company,
  CompanyUser,
  Project,
  ProjectUser,
  Contact,
  Origin,
  Stage,
  Sale,
  TrackableLink,
  Integration,
  IntegrationAccount,
  MessagingAccount,
  ConversionEvent,
  ProcessingQueue,
  ProjectSettings,
  DashboardMetrics,
  ApiResponse,
  PaginatedResponse,
  WorkerRequest,
  WorkerResponse,
  ValidationError,
  ValidationResult,
  AuditLog,
};
