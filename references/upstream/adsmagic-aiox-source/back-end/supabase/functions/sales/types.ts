/**
 * Tipos TypeScript para Edge Function de Sales
 * 
 * Define interfaces para entidades, DTOs e respostas da API.
 * Segue convenção snake_case para compatibilidade com PostgreSQL.
 */

/**
 * Entidade Sale (representa uma linha da tabela sales)
 */
export interface Sale {
  id: string
  project_id: string
  contact_id: string
  value: number
  currency: string
  date: string
  status: 'completed' | 'lost'
  origin_id: string | null
  lost_reason: string | null
  lost_observations: string | null
  notes: string | null
  tracking_params: TrackingParams
  metadata: SaleMetadata
  created_at: string
  updated_at: string
}

/**
 * Parâmetros de tracking capturados de URLs
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
  /** TikTok click ID */
  ttclid?: string
  /** WhatsApp Click to Ads click ID */
  ctwaClid?: string
  /** UTM Source */
  utm_source?: string
  /** UTM Medium */
  utm_medium?: string
  /** UTM Campaign */
  utm_campaign?: string
  /** UTM Content */
  utm_content?: string
  /** UTM Term */
  utm_term?: string
  /** Campos adicionais */
  [key: string]: unknown
}

/**
 * Metadados da venda (device, location, etc)
 */
export interface SaleMetadata {
  /** Tipo de dispositivo */
  device?: 'mobile' | 'tablet' | 'desktop'
  /** Navegador */
  browser?: string
  /** Sistema operacional */
  os?: string
  /** Cidade */
  city?: string
  /** País */
  country?: string
  /** IP address */
  ip?: string
  /** Campos adicionais */
  [key: string]: unknown
}

/**
 * DTO para criação de venda (POST /sales)
 */
export interface CreateSaleDTO {
  project_id: string
  contact_id: string
  value: number
  currency?: string
  date: string
  origin_id?: string | null
  notes?: string | null
  tracking_params?: TrackingParams
  metadata?: SaleMetadata
}

/**
 * DTO para atualização de venda (PATCH /sales/:id)
 */
export interface UpdateSaleDTO {
  value?: number
  currency?: string
  date?: string
  origin_id?: string | null
  notes?: string | null
  tracking_params?: TrackingParams
  metadata?: SaleMetadata
}

/**
 * DTO para marcar venda como perdida (PATCH /sales/:id/lost)
 */
export interface MarkSaleLostDTO {
  lost_reason: string
  lost_observations?: string | null
}

/**
 * Resposta de listagem de vendas
 */
export interface SalesListResponse {
  data: Sale[]
  meta: {
    total: number
    limit: number
    offset: number
  }
}

/**
 * Parâmetros de query para listagem
 */
export interface SalesListParams {
  project_id?: string
  contact_id?: string
  origin_id?: string
  status?: 'completed' | 'lost'
  date_from?: string
  date_to?: string
  min_value?: number
  max_value?: number
  search?: string
  sort?: 'date_asc' | 'date_desc' | 'value_asc' | 'value_desc' | 'created_at'
  limit?: number
  offset?: number
}
