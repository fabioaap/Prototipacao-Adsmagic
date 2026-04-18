/**
 * Tipos TypeScript para sistema de rastreamento de origem de contatos
 * 
 * Este módulo define todas as interfaces e tipos necessários para
 * extração, normalização e armazenamento de dados de origem de tráfego
 * (click IDs, UTMs, IDs de campanha, metadados).
 */

/**
 * Click IDs suportados por plataforma de anúncios
 */
export interface ClickIds {
  // Google Ads
  gclid?: string      // Google Click ID (Search/Display)
  wbraid?: string     // Web Browser Click ID (Enhanced Conversions - Web)
  gbraid?: string     // Google Browser Click ID (Enhanced Conversions - iOS)
  
  // Meta Ads (Facebook/Instagram)
  fbclid?: string     // Facebook Click ID
  ctwaClid?: string   // Click-to-WhatsApp Click ID
  
  // TikTok Ads
  ttclid?: string     // TikTok Click ID
  
  // Extensível para outras plataformas
  [key: string]: string | undefined
}

/**
 * Parâmetros UTM (universais, não específicos de plataforma)
 */
export interface UtmParams {
  utm_source?: string    // Fonte (google, facebook, instagram, etc.)
  utm_medium?: string    // Meio (cpc, paid_social, email, etc.)
  utm_campaign?: string  // Campanha (ID ou nome)
  utm_content?: string   // Conteúdo (ID do anúncio/criativo)
  utm_term?: string      // Termo (palavra-chave para Search)
}

/**
 * IDs de campanha padronizados
 */
export interface CampaignIds {
  // IDs padronizados (todos opcionais)
  campaign_id?: string      // ID da campanha principal
  campaign_name?: string    // Nome da campanha
  
  // IDs específicos por plataforma (mapeados para nomenclatura padrão)
  // Google Ads
  adgroup_id?: string       // ID do grupo de anúncios
  adgroup_name?: string     // Nome do grupo de anúncios
  creative_id?: string      // ID do criativo/anúncio
  keyword?: string          // Palavra-chave (Search)
  matchtype?: string        // Tipo de correspondência (b=broad, p=phrase, e=exact)
  placement?: string        // Placement (Display/YouTube)
  
  // Meta Ads
  adset_id?: string         // ID do conjunto de anúncios
  adset_name?: string       // Nome do conjunto de anúncios
  ad_id?: string            // ID do anúncio
  ad_name?: string          // Nome do anúncio
  
  // Outros
  target_id?: string        // ID genérico de targeting (keyword, audience, placement, etc.)
  
  // Extensível
  [key: string]: string | undefined
}

/**
 * Metadados de origem
 */
export interface OriginMetadata {
  // Tipo de origem
  source_type?: 'ad' | 'organic' | 'referral' | 'direct' | 'other'
  source_app?: 'google' | 'facebook' | 'instagram' | 'tiktok' | 'other'
  source_id?: string        // ID da origem (legado - manter para compatibilidade)
  source_url?: string       // URL de origem completa
  
  // Dispositivo e contexto
  device?: 'mobile' | 'desktop' | 'tablet'
  network?: string          // 'google_search', 'search_partners', 'display', etc.
  
  // Timestamps
  first_interaction_at?: string  // ISO timestamp da primeira interação
  last_interaction_at?: string   // ISO timestamp da última interação
}

/**
 * Estrutura completa padronizada de source_data
 * Armazenada no campo JSONB source_data da tabela contact_origins
 */
export interface StandardizedSourceData {
  clickIds?: ClickIds
  utm?: UtmParams
  campaign?: CampaignIds
  metadata?: OriginMetadata
}

/**
 * Interface para contact_origins com campos críticos normalizados
 * 
 * Abordagem híbrida: campos críticos em colunas + campos flexíveis em JSONB
 * Campos críticos são sincronizados automaticamente via trigger
 */
export interface ContactOrigin {
  id: string
  contact_id: string
  origin_id: string
  link_access_id?: string | null
  acquired_at: string
  created_at: string
  observations?: string | null
  attribution_source?: string | null
  attribution_priority?: number | null
  
  // Campos críticos (normalizados) - sincronizados automaticamente via trigger
  campaign_id?: string | null
  ad_id?: string | null
  adgroup_id?: string | null
  source_app?: string | null
  
  // Campos flexíveis (JSONB)
  source_data?: StandardizedSourceData | null
}

/**
 * Parâmetros para processamento de contato com origem
 */
export interface ProcessContactOriginParams {
  normalizedMessage: import('../types.ts').NormalizedMessage
  projectId: string
  supabaseClient: SupabaseDbClient
  skipOriginPersistence?: boolean
}

/**
 * Resultado do processamento de contato com origem
 */
export interface ProcessContactOriginResult {
  contactId: string
  created: boolean
  originId?: string
  sourceData?: StandardizedSourceData
}
import type { SupabaseDbClient } from '../types-db.ts'
