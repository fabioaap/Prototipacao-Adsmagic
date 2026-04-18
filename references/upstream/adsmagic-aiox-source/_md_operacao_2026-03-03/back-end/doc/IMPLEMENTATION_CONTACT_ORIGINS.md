# 📋 Implementação: Sistema de Rastreamento de Origem de Contatos

## 🎯 Objetivo

Implementar sistema padronizado e **reutilizável** para rastrear origem de contatos via webhooks de mensageria, armazenando todos os parâmetros de tracking (UTMs, Click IDs, IDs de campanha) de forma estruturada para suportar:
- Timeline de origens por contato
- Conversões offline (Meta Ads, Google Ads, TikTok Ads)
- Atribuição de conversões
- Análise de performance de campanhas

### 🔄 Reutilização entre Brokers

**A arquitetura proposta é projetada para ser reutilizada por TODOS os brokers de mensageria:**
- ✅ UAZAPI (já implementado)
- ✅ Gupshup (futuro - apenas extender classe base)
- ✅ Official WhatsApp Business API (futuro - apenas extender classe base)
- ✅ Qualquer novo broker (adicionar extensão da classe base)

**Princípio fundamental**: Lógica comum (extração de click IDs, UTMs, validações) é escrita UMA vez na classe base e reutilizada automaticamente por todos os brokers.

---

## 📐 Arquitetura e Princípios

### Princípios Aplicados

✅ **SOLID**
- **SRP**: Cada serviço/classe tem responsabilidade única
- **OCP**: Estrutura extensível para novas plataformas
- **DIP**: Dependências via interfaces/abstrações

✅ **Clean Code**
- Nomenclatura clara e descritiva
- Funções pequenas e focadas
- Separação de responsabilidades

✅ **Estrutura Padronizada**
- Nomenclatura consistente para todas as plataformas
- Schema JSONB padronizado e documentado
- Mapeamento universal de parâmetros

---

## 🔄 Evolução: Suporte a JID e LID

**Status**: ✅ FASE 0 CONCLUÍDA (2025-01-27) - Tipos e Validadores atualizados

**⚠️ ATENÇÃO**: Veja `CRITICA_PLANO_IMPLEMENTACAO_JID_LID.md` para análise crítica e correções aplicadas.

O sistema está sendo preparado para aceitar **JID (Jabber ID)** e **LID (Local ID)** além de números de telefone como identificadores de contatos no WhatsApp.

**Decisão Arquitetural**: **REFATORAÇÃO** seguindo DRY, OCP e SRP

**Por que refatorar em vez de criar novo arquivo?**
- ✅ **DRY**: Evita duplicar lógica de normalização de telefone
- ✅ **OCP**: Estende componente existente sem criar novo
- ✅ **SRP**: Mantém responsabilidade única (normalizar identificadores)
- ✅ **Manutenibilidade**: Um único ponto de verdade

**Mudanças Planejadas**:
- ✅ **Refatoração**: `phone-normalizer.ts` → `identifier-normalizer.ts`
- ✅ **Extensão**: Adiciona suporte a JID e LID mantendo telefone
- ✅ **Refatoração direta**: `extractPhoneNumber()` refatorada para usar lógica interna (sem wrapper deprecated)
- ✅ **Interface mantida**: `extractPhoneNumber()` mantém mesma assinatura, implementação refatorada
- ✅ Repository atualizado: Busca por múltiplos identificadores
- ✅ Banco de dados: Campos opcionais `jid`, `lid`, `canonical_identifier`

**Impacto na Implementação Atual**:
- `phone-normalizer.ts` será **refatorado** (não substituído por novo arquivo)
- Renomeado para `identifier-normalizer.ts` para refletir novo escopo
- `extractPhoneNumber()` será refatorada diretamente (reutiliza `normalizeIdentifier()` internamente)
- `ContactRepository` terá novo método `findByAnyIdentifier()`
- Brokers usarão normalizador refatorado
- Sem código deprecated (código limpo e direto)

**Documentação Completa**: Ver `ANALISE_JID_LID_WHATSAPP.md`

---

## 🗄️ Estrutura do Banco de Dados

### 1. Migração: Adicionar `source_data` JSONB

```sql
-- Migration: add_source_data_to_contact_origins.sql

-- Adicionar coluna source_data JSONB
ALTER TABLE contact_origins
ADD COLUMN IF NOT EXISTS source_data JSONB DEFAULT '{}'::jsonb;

-- Criar índice GIN para queries eficientes
CREATE INDEX IF NOT EXISTS idx_contact_origins_source_data 
ON contact_origins USING gin (source_data);

-- Comentário explicativo
COMMENT ON COLUMN contact_origins.source_data IS 
'Dados estruturados padronizados da origem: click IDs, UTMs, IDs de campanha, etc. 
Estrutura: ver documentação em IMPLEMENTATION_CONTACT_ORIGINS.md';
```

### 2. Schema JSONB Padronizado

```typescript
/**
 * Estrutura padronizada de source_data para contact_origins
 * Suporta todas as plataformas (Google Ads, Meta Ads, TikTok Ads, etc.)
 */
interface StandardizedSourceData {
  // ==========================================
  // CLICK IDs (Identificadores de Clique)
  // ==========================================
  clickIds?: {
    // Google Ads
    gclid?: string      // Google Click ID (Search/Display)
    wbraid?: string     // Web Browser Click ID (Enhanced Conversions - Web)
    gbraid?: string     // Google Browser Click ID (Enhanced Conversions - iOS)
    
    // Meta Ads (Facebook/Instagram)
    fbclid?: string     // Facebook Click ID
    ctwaClid?: string   // Click-to-WhatsApp Click ID
    
    // TikTok Ads
    ttclid?: string     // TikTok Click ID
    
    // Outras plataformas (extensível)
    [platform: string]: string | undefined
  }
  
  // ==========================================
  // PARÂMETROS UTM (Universais - não específicos de plataforma)
  // ==========================================
  utm?: {
    utm_source?: string    // Fonte (google, facebook, instagram, etc.)
    utm_medium?: string    // Meio (cpc, paid_social, email, etc.)
    utm_campaign?: string  // Campanha (ID ou nome)
    utm_content?: string   // Conteúdo (ID do anúncio/criativo)
    utm_term?: string      // Termo (palavra-chave para Search)
  }
  
  // ==========================================
  // IDs DE CAMPANHA (Padronizados)
  // ==========================================
  campaign?: {
    // IDs padronizados (todos opcionais)
    campaign_id?: string      // ID da campanha principal
    campaign_name?: string    // Nome da campanha
    
    // IDs específicos por plataforma (mapeados para nomenclatura padrão)
    // Google Ads
    adgroup_id?: string       // ID do grupo de anúncios
    creative_id?: string      // ID do criativo/anúncio
    keyword?: string          // Palavra-chave (Search)
    matchtype?: string        // Tipo de correspondência (b=p/broad, p=phrase, e=exact)
    placement?: string        // Placement (Display/YouTube)
    
    // Meta Ads
    adset_id?: string         // ID do conjunto de anúncios
    ad_id?: string            // ID do anúncio
    
    // TikTok Ads
    adgroup_id?: string       // ID do grupo de anúncios (TikTok)
    creative_id?: string      // ID do criativo (TikTok)
    
    // Outros
    target_id?: string        // ID genérico de targeting (keyword, audience, placement, etc.)
  }
  
  // ==========================================
  // METADADOS DE ORIGEM
  // ==========================================
  metadata?: {
    // Tipo de origem
    source_type?: string      // 'ad', 'organic', 'referral', 'direct', etc.
    source_app?: string       // 'google', 'facebook', 'instagram', 'tiktok', etc.
    source_id?: string        // ID da origem (legado - manter para compatibilidade)
    source_url?: string       // URL de origem completa
    
    // Dispositivo e contexto
    device?: string           // 'mobile', 'desktop', 'tablet'
    network?: string          // 'google_search', 'search_partners', 'display', etc.
    
    // Timestamps
    first_interaction_at?: string  // ISO timestamp da primeira interação
    last_interaction_at?: string   // ISO timestamp da última interação
  }
}
```

### 3. Exemplos de Dados por Plataforma

#### Google Ads (Search)
```json
{
  "clickIds": {
    "gclid": "CjwKCAiA...",
    "wbraid": "CM..."
  },
  "utm": {
    "utm_source": "google",
    "utm_medium": "cpc",
    "utm_campaign": "123456789",
    "utm_content": "987654321",
    "utm_term": "empréstimo com garantia"
  },
  "campaign": {
    "campaign_id": "123456789",
    "campaign_name": "Campanha_Pesquisa_Brasil",
    "adgroup_id": "111222333",
    "adgroup_name": "Grupo_1_Chaves",
    "creative_id": "987654321",
    "keyword": "empréstimo com garantia",
    "matchtype": "e",
    "placement": null,
    "target_id": "123456"
  },
  "metadata": {
    "source_type": "ad",
    "source_app": "google",
    "device": "mobile",
    "network": "google_search",
    "first_interaction_at": "2024-01-15T10:30:00Z"
  }
}
```

#### Meta Ads (Facebook/Instagram)
```json
{
  "clickIds": {
    "fbclid": "IwAR...",
    "ctwaClid": "Afeuo72uo9mEzDVOmiY4mhswyu01ZTvR0y7KInhHbw3hk0QRylpNYvrbl4uwe8WvWr3OjG87rB3SOVvV0oRTKhJQ9UQWR583PuZPvawJ1-nP4vRhBapMa6kzd2R6H7EkuPV4YsSetg"
  },
  "utm": {
    "utm_source": "facebook",
    "utm_medium": "paid_social",
    "utm_campaign": "1234567890",
    "utm_content": "987654321",
    "utm_term": "1122334455"
  },
  "campaign": {
    "campaign_id": "1234567890",
    "campaign_name": "Conversões_Aprovação",
    "adset_id": "1122334455",
    "adset_name": "Motoristas_SP",
    "ad_id": "987654321",
    "ad_name": "Criativo_1_Carro"
  },
  "metadata": {
    "source_type": "ad",
    "source_app": "facebook",
    "source_id": "120236558438640778",
    "source_url": "https://fb.me/7f0MzrhFz",
    "device": "mobile",
    "first_interaction_at": "2024-01-15T10:30:00Z"
  }
}
```

#### TikTok Ads
```json
{
  "clickIds": {
    "ttclid": "CjwKCAiA..."
  },
  "utm": {
    "utm_source": "tiktok",
    "utm_medium": "paid_social",
    "utm_campaign": "campaign_123"
  },
  "campaign": {
    "campaign_id": "campaign_123",
    "adgroup_id": "adgroup_456",
    "creative_id": "creative_789"
  },
  "metadata": {
    "source_type": "ad",
    "source_app": "tiktok",
    "device": "mobile",
    "first_interaction_at": "2024-01-15T10:30:00Z"
  }
}
```

---

## 🏗️ Estrutura de Arquivos

```
/messaging/
├── brokers/
│   ├── base/
│   │   ├── WhatsAppBroker.ts              (EXISTENTE - Classe base)
│   │   └── SourceDataExtractor.ts         (NOVO - Extração base de dados de origem)
│   ├── uazapi/
│   │   ├── UazapiBroker.ts                (MODIFICAR - Adicionar extração)
│   │   └── UazapiSourceExtractor.ts       (NOVO - Extensão específica)
│   ├── gupshup/
│   │   ├── GupshupBroker.ts               (FUTURO - Adicionar extração)
│   │   └── GupshupSourceExtractor.ts      (NOVO - Extensão específica)
│   └── official/
│       ├── OfficialWhatsAppBroker.ts      (FUTURO - Adicionar extração)
│       └── OfficialSourceExtractor.ts     (NOVO - Extensão específica)
├── services/
│   ├── ContactOriginService.ts            (✅ CRIADO - Serviço principal - FASE 5)
│   └── OriginDataNormalizer.ts            (✅ CRIADO - Normalização genérica - FASE 4)
├── repositories/
│   └── ContactRepository.ts               (✅ CRIADO - Abstração para contatos - FASE 3)
├── utils/
│   └── identifier-normalizer.ts           (✅ REFATORADO - FASE 1)
│       └── (Evolução de phone-normalizer.ts - suporta telefone, JID, LID)
├── mappers/
│   └── source-data-mapper.ts              (✅ CRIADO - Factory Pattern - FASE 4)
└── types/
    └── contact-origin-types.ts            (✅ CRIADO - Tipos TypeScript - FASE 4)
```

**Princípio Arquitetural**: 
- **Classe Base Abstrata** (`BaseSourceDataExtractor`) contém lógica comum reutilizável
- **Extensões Específicas** por broker implementam apenas diferenças
- **Service Layer** usa abstração, não implementações concretas
- **Template Method Pattern**: Define esqueleto do algoritmo, delega passos específicos

### 🎯 Reutilização para Todos os Brokers

A arquitetura proposta permite que **qualquer broker** reutilize a lógica comum de extração:

#### ✅ Lógica Comum Reutilizável (BaseSourceDataExtractor)

**Todos os brokers compartilham automaticamente:**
1. **Extração de Click IDs**: `extractClickIds()` extrai gclid, wbraid, gbraid, fbclid, ctwaClid, ttclid de forma padronizada
2. **Extração de UTMs**: `extractUtmParams()` extrai parâmetros UTM universais de qualquer fonte
3. **Validação de Dados**: `hasValidData()` valida se há dados suficientes
4. **Utilitários**: `detectSourceAppFromUtmSource()`, `detectSourceTypeFromUtmMedium()`

#### ✅ Lógica Específica por Broker (Extensões)

**Cada broker implementa apenas suas diferenças:**
1. **UAZAPI**: Extrai dados de `externalAdReply` (Meta Ads CTWA)
2. **Gupshup**: Extrai dados do formato específico do Gupshup
3. **Official WhatsApp**: Extrai dados do formato da API oficial

#### 📊 Exemplo de Reutilização

```typescript
// UAZAPI - Apenas 4 métodos para implementar
class UazapiSourceExtractor extends BaseSourceDataExtractor {
  // ✅ Herda automaticamente: extractClickIds(), extractUtmParams(), etc.
  protected extractCampaignIds() { /* específico UAZAPI */ }
  protected extractMetadata() { /* específico UAZAPI */ }
  protected extractAdditionalClickIds() { /* ctwaClid do externalAdReply */ }
  protected extractAdditionalUtmParams() { /* UTMs do externalAdReply */ }
}

// Gupshup - Mesma estrutura, lógica específica diferente
class GupshupSourceExtractor extends BaseSourceDataExtractor {
  // ✅ Reutiliza TODA a lógica comum automaticamente
  protected extractCampaignIds() { /* específico Gupshup */ }
  protected extractMetadata() { /* específico Gupshup */ }
  // ✅ Não precisa reimplementar extractClickIds() ou extractUtmParams()
}

// Official WhatsApp - Mesma estrutura
class OfficialSourceExtractor extends BaseSourceDataExtractor {
  protected extractCampaignIds() { /* específico Official API */ }
  protected extractMetadata() { /* específico Official API */ }
}
```

**Benefícios:**
- ✅ Lógica comum escrita UMA vez, reutilizada por todos
- ✅ Novos brokers precisam implementar apenas 2-4 métodos
- ✅ Mudanças na lógica comum beneficiam todos automaticamente
- ✅ Testes da lógica comum validam todos os brokers

---

## 📝 Etapas de Implementação

### Etapa 1: Criar Migração do Banco de Dados

**Arquivo**: `back-end/supabase/migrations/XXX_add_source_data_to_contact_origins.sql`

```sql
-- Migration: Adicionar source_data JSONB a contact_origins
-- Data: 2024-01-XX
-- Descrição: Adiciona campo JSONB para armazenar dados estruturados de origem

BEGIN;

-- Adicionar coluna
ALTER TABLE contact_origins
ADD COLUMN IF NOT EXISTS source_data JSONB DEFAULT '{}'::jsonb;

-- Criar índice GIN para queries eficientes
CREATE INDEX IF NOT EXISTS idx_contact_origins_source_data 
ON contact_origins USING gin (source_data);

-- Comentário
COMMENT ON COLUMN contact_origins.source_data IS 
'Dados estruturados padronizados da origem de tráfego: click IDs, UTMs, IDs de campanha, etc.';

COMMIT;
```

**Checklist**:
- [ ] Arquivo de migração criado
- [ ] Testado em ambiente local
- [ ] Validado que não quebra dados existentes
- [ ] Índice GIN criado corretamente

---

### Etapa 2: Criar Tipos TypeScript

**Arquivo**: `back-end/supabase/functions/messaging/types/contact-origin-types.ts`

```typescript
/**
 * Tipos TypeScript para sistema de rastreamento de origem
 */

/**
 * Click IDs suportados por plataforma
 */
export interface ClickIds {
  // Google Ads
  gclid?: string
  wbraid?: string
  gbraid?: string
  
  // Meta Ads
  fbclid?: string
  ctwaClid?: string
  
  // TikTok Ads
  ttclid?: string
  
  // Extensível para outras plataformas
  [key: string]: string | undefined
}

/**
 * Parâmetros UTM (universais, não específicos de plataforma)
 */
export interface UtmParams {
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  utm_term?: string
}

/**
 * IDs de campanha padronizados
 */
export interface CampaignIds {
  campaign_id?: string
  campaign_name?: string
  
  // Google Ads
  adgroup_id?: string
  adgroup_name?: string
  creative_id?: string
  keyword?: string
  matchtype?: string
  placement?: string
  target_id?: string
  
  // Meta Ads
  adset_id?: string
  adset_name?: string
  ad_id?: string
  ad_name?: string
  
  // Extensível
  [key: string]: string | undefined
}

/**
 * Metadados de origem
 */
export interface OriginMetadata {
  source_type?: 'ad' | 'organic' | 'referral' | 'direct' | 'other'
  source_app?: 'google' | 'facebook' | 'instagram' | 'tiktok' | 'other'
  source_id?: string
  source_url?: string
  device?: 'mobile' | 'desktop' | 'tablet'
  network?: string
  first_interaction_at?: string
  last_interaction_at?: string
}

/**
 * Estrutura completa padronizada de source_data
 */
export interface StandardizedSourceData {
  clickIds?: ClickIds
  utm?: UtmParams
  campaign?: CampaignIds
  metadata?: OriginMetadata
}

/**
 * Parâmetros para processamento de contato com origem
 */
export interface ProcessContactOriginParams {
  normalizedMessage: import('../types.ts').NormalizedMessage
  projectId: string
  supabaseClient: ReturnType<typeof import('https://esm.sh/@supabase/supabase-js@2').createClient>
}

/**
 * Resultado do processamento
 */
export interface ProcessContactOriginResult {
  contactId: string
  created: boolean
  originId?: string
  sourceData?: StandardizedSourceData
}
```

**Checklist**:
- [ ] Arquivo de tipos criado
- [ ] Todos os tipos documentados com JSDoc
- [ ] Tipos exportados corretamente
- [ ] Sem uso de `any`

---

### Etapa 3: Refatorar Utilitário de Normalização (DRY + OCP)

**Decisão Arquitetural**: **REFATORAR** `phone-normalizer.ts` em vez de criar novo arquivo.

**Por que refatorar?**
- ✅ **DRY**: Evita duplicar lógica de normalização de telefone
- ✅ **OCP**: Estende componente existente sem criar novo
- ✅ **SRP**: Mantém responsabilidade única (normalizar identificadores)
- ✅ **Manutenibilidade**: Um único ponto de verdade

**⚠️ CORREÇÕES CRÍTICAS APLICADAS**:
- ✅ Migração remove `NOT NULL` de phone/country_code
- ✅ Constraints existentes ajustadas para permitir NULL
- ✅ Unique constraints adicionadas (APÓS migração de dados)
- ✅ Validação de consistência implementada
- ✅ Fallback problemático corrigido (lança erro em vez de criar identificador inválido)
- ✅ Validação de formato de JID/LID melhorada
- ✅ Tratamento de erros de unique constraint melhorado
- ✅ **FASE 0 CONCLUÍDA**: Tipos TypeScript e validadores Zod atualizados (backend + frontend) - **2025-01-27**

**⚠️ ORDEM DE IMPLEMENTAÇÃO CORRIGIDA**:
1. ✅ **Fase 0**: Tipos e Validadores (BLOQUEADOR - **CONCLUÍDA em 2025-01-27**)
2. ✅ **Fase 1.5**: Migração de dados existentes (BLOQUEADOR - **SCRIPTS CRIADOS em 2025-01-27**, não necessário - sistema em desenvolvimento)
3. ✅ **Fase 2**: Banco de dados (inclui ajuste de constraints existentes) - **CONCLUÍDA em 2025-01-27**
4. ✅ **Fase 1**: Refatoração de normalização - **PARCIALMENTE CONCLUÍDA em 2025-01-27**
5. **Fases seguintes**: Repository, Processor, Brokers

**Arquivo**: `back-end/supabase/functions/messaging/utils/identifier-normalizer.ts` (REFATORADO de `phone-normalizer.ts`)

**⚠️ Veja `CRITICA_PLANO_IMPLEMENTACAO_JID_LID.md` e `ANALISE_CRITICA_COMPLETA_JID_LID.md` para problemas identificados e correções aplicadas**

```typescript
/**
 * Utilitário para normalização de números de telefone
 * 
 * Extrai número e código do país de formatos diversos:
 * - "5516997202704@s.whatsapp.net" → { phone: "16997202704", countryCode: "55" }
 * - "+5516997202704" → { phone: "16997202704", countryCode: "55" }
 * - "5516997202704" → { phone: "16997202704", countryCode: "55" }
 */

export interface NormalizedPhone {
  phone: string
  countryCode: string
}

/**
 * Extrai número de telefone e código do país de uma string
 * 
 * @param phoneInput - Número em qualquer formato (com ou sem sufixo @s.whatsapp.net)
 * @returns Número normalizado e código do país
 */
export function extractPhoneNumber(phoneInput: string): NormalizedPhone {
  if (!phoneInput || typeof phoneInput !== 'string') {
    throw new Error('Phone input must be a non-empty string')
  }
  
  // Remove sufixos comuns do WhatsApp
  let cleaned = phoneInput
    .replace(/@s\.whatsapp\.net$/i, '')
    .replace(/@c\.us$/i, '')
    .replace(/^\+/, '') // Remove prefixo +
  
  // Padrão: código do país (1-3 dígitos) + número (8-15 dígitos)
  // Exemplos:
  // - "5516997202704" → countryCode: "55", phone: "16997202704"
  // - "12125551234" → countryCode: "1", phone: "2125551234"
  const match = cleaned.match(/^(\d{1,3})(\d{8,15})$/)
  
  if (!match) {
    // Fallback: assume Brasil (55) se não conseguir extrair
    console.warn(`[PhoneNormalizer] Could not extract country code from: ${phoneInput}, defaulting to 55`)
    return {
      countryCode: '55',
      phone: cleaned.replace(/^55/, '').slice(-15), // Remove 55 se presente e pega últimos 15 dígitos
    }
  }
  
  return {
    countryCode: match[1],
    phone: match[2],
  }
}
```

**Checklist de Refatoração**:
- [ ] Renomear `phone-normalizer.ts` → `identifier-normalizer.ts`
- [ ] Adicionar funções de normalização para JID e LID
- [ ] Criar função principal `normalizeIdentifier()` que aceita telefone, JID ou LID
- [ ] Refatorar `extractPhoneNumber()` diretamente para usar `normalizeIdentifier()` internamente
- [ ] Manter interface pública de `extractPhoneNumber()` (mesma assinatura)
- [ ] Função criada e testada
- [ ] Suporta múltiplos formatos (telefone, JID, LID)
- [ ] Tratamento de erros implementado
- [ ] Testes unitários criados
- [ ] Reutilizável por todos os brokers

**Estratégia de Refatoração**:
- ⏳ Refatorar `extractPhoneNumber()` para usar `normalizeIdentifier()` internamente
- ⏳ Manter mesma interface pública (sem quebrar código existente)
- ⏳ Código limpo: sem wrappers deprecated desnecessários
- ⏳ Ver `ANALISE_JID_LID_WHATSAPP.md` para detalhes completos da refatoração

---

### Etapa 4: Criar Classe Base para Extração de Dados de Origem

**Arquivo**: `back-end/supabase/functions/messaging/brokers/base/SourceDataExtractor.ts`

```typescript
/**
 * Classe base abstrata para extração de dados de origem
 * 
 * Todos os brokers devem estender esta classe para extrair dados de origem
 * de forma padronizada e reutilizável.
 * 
 * Template Method Pattern: Define o esqueleto do algoritmo de extração,
 * delegando passos específicos para subclasses.
 */

import type {
  StandardizedSourceData,
  ClickIds,
  UtmParams,
  CampaignIds,
  OriginMetadata,
} from '../../types/contact-origin-types.ts'
import type { NormalizedMessage } from '../../types.ts'

/**
 * Interface para extração de dados de origem
 * Cada broker implementa métodos específicos
 */
export interface ISourceDataExtractor {
  /**
   * Extrai dados de origem padronizados da mensagem normalizada
   */
  extract(message: NormalizedMessage): StandardizedSourceData | null
}

/**
 * Classe base abstrata com lógica comum reutilizável
 */
export abstract class BaseSourceDataExtractor implements ISourceDataExtractor {
  /**
   * Template Method: Define o fluxo de extração
   */
  extract(message: NormalizedMessage): StandardizedSourceData | null {
    // 1. Extrair click IDs (comum a todos)
    const clickIds = this.extractClickIds(message)
    
    // 2. Extrair parâmetros UTM (comum a todos)
    const utm = this.extractUtmParams(message)
    
    // 3. Extrair IDs de campanha (específico por broker)
    const campaign = this.extractCampaignIds(message)
    
    // 4. Extrair metadados (específico por broker)
    const metadata = this.extractMetadata(message)
    
    // 5. Validar se há dados válidos
    if (!this.hasValidData({ clickIds, utm, campaign, metadata })) {
      return null
    }
    
    return {
      clickIds: Object.keys(clickIds || {}).length > 0 ? clickIds : undefined,
      utm: Object.keys(utm || {}).length > 0 ? utm : undefined,
      campaign: Object.keys(campaign || {}).length > 0 ? campaign : undefined,
      metadata: Object.keys(metadata || {}).length > 0 ? metadata : undefined,
    }
  }
  
  /**
   * Extrai click IDs da mensagem (método comum)
   * Pode ser sobrescrito por brokers específicos para lógica customizada
   */
  protected extractClickIds(message: NormalizedMessage): ClickIds | null {
    const metadata = message.context?.metadata || {}
    const clickIds: ClickIds = {}
    
    // Extrair click IDs do metadata (comum a todos)
    if (metadata.gclid) clickIds.gclid = String(metadata.gclid)
    if (metadata.wbraid) clickIds.wbraid = String(metadata.wbraid)
    if (metadata.gbraid) clickIds.gbraid = String(metadata.gbraid)
    if (metadata.fbclid) clickIds.fbclid = String(metadata.fbclid)
    if (metadata.ctwaClid) clickIds.ctwaClid = String(metadata.ctwaClid)
    if (metadata.ttclid) clickIds.ttclid = String(metadata.ttclid)
    
    // Permitir que subclasses adicionem mais click IDs
    const additionalClickIds = this.extractAdditionalClickIds(message)
    if (additionalClickIds) {
      Object.assign(clickIds, additionalClickIds)
    }
    
    return Object.keys(clickIds).length > 0 ? clickIds : null
  }
  
  /**
   * Extrai parâmetros UTM da mensagem (método comum)
   * UTMs podem vir de qualquer fonte (URL, metadata, etc.)
   */
  protected extractUtmParams(message: NormalizedMessage): UtmParams | null {
    const metadata = message.context?.metadata || {}
    const utm: UtmParams = {}
    
    // Extrair UTMs do metadata (comum a todos)
    if (metadata.utm_source) utm.utm_source = String(metadata.utm_source)
    if (metadata.utm_medium) utm.utm_medium = String(metadata.utm_medium)
    if (metadata.utm_campaign) utm.utm_campaign = String(metadata.utm_campaign)
    if (metadata.utm_content) utm.utm_content = String(metadata.utm_content)
    if (metadata.utm_term) utm.utm_term = String(metadata.utm_term)
    
    // Permitir que subclasses extraiam UTMs de outras fontes (URL, headers, etc.)
    const additionalUtm = this.extractAdditionalUtmParams(message)
    if (additionalUtm) {
      Object.assign(utm, additionalUtm)
    }
    
    return Object.keys(utm).length > 0 ? utm : null
  }
  
  /**
   * Extrai IDs de campanha da mensagem (abstrato - deve ser implementado)
   */
  protected abstract extractCampaignIds(message: NormalizedMessage): CampaignIds | null
  
  /**
   * Extrai metadados da mensagem (abstrato - deve ser implementado)
   */
  protected abstract extractMetadata(message: NormalizedMessage): OriginMetadata | null
  
  /**
   * Hook para brokers específicos extraírem click IDs adicionais
   */
  protected extractAdditionalClickIds(message: NormalizedMessage): ClickIds | null {
    return null
  }
  
  /**
   * Hook para brokers específicos extraírem UTMs adicionais
   */
  protected extractAdditionalUtmParams(message: NormalizedMessage): UtmParams | null {
    return null
  }
  
  /**
   * Valida se há dados válidos para criar source_data
   */
  protected hasValidData(data: {
    clickIds: ClickIds | null
    utm: UtmParams | null
    campaign: CampaignIds | null
    metadata: OriginMetadata | null
  }): boolean {
    return !!(
      data.clickIds ||
      data.utm ||
      data.campaign ||
      data.metadata
    )
  }
  
  /**
   * Utilitário: Detecta source_app baseado em utm_source
   * Reutilizável por todos os brokers
   */
  protected detectSourceAppFromUtmSource(
    utmSource?: string
  ): OriginMetadata['source_app'] {
    if (!utmSource) return undefined
    
    const lower = utmSource.toLowerCase()
    
    if (lower.includes('google')) return 'google'
    if (lower.includes('facebook') || lower.includes('fb')) return 'facebook'
    if (lower.includes('instagram') || lower.includes('ig')) return 'instagram'
    if (lower.includes('tiktok')) return 'tiktok'
    
    return 'other'
  }
  
  /**
   * Utilitário: Detecta source_type baseado em utm_medium
   * Reutilizável por todos os brokers
   */
  protected detectSourceTypeFromUtmMedium(
    utmMedium?: string
  ): OriginMetadata['source_type'] {
    if (!utmMedium) return undefined
    
    const lower = utmMedium.toLowerCase()
    
    if (lower === 'cpc' || lower === 'paid_social' || lower.includes('paid')) {
      return 'ad'
    }
    if (lower === 'organic' || lower === 'search') {
      return 'organic'
    }
    if (lower === 'referral') {
      return 'referral'
    }
    
    return 'other'
  }
}
```

**Checklist**:
- [ ] Classe base abstrata criada
- [ ] Métodos comuns implementados (clickIds, UTMs)
- [ ] Métodos abstratos definidos (campaignIds, metadata)
- [ ] Hooks para extensão implementados
- [ ] Utilitários comuns adicionados

**Checklist**:
- [ ] Classe base abstrata criada
- [ ] Métodos comuns implementados (clickIds, UTMs)
- [ ] Métodos abstratos definidos (campaignIds, metadata)
- [ ] Hooks para extensão implementados
- [ ] Utilitários comuns adicionados

---

### Etapa 4.1: Criar Extensão Específica para UAZAPI

**Arquivo**: `back-end/supabase/functions/messaging/brokers/uazapi/UazapiSourceExtractor.ts`

```typescript
/**
 * Extrator de dados de origem específico para UAZAPI
 * 
 * Implementa lógica específica para extrair dados de Meta Ads CTWA
 */

import { BaseSourceDataExtractor } from '../base/SourceDataExtractor.ts'
import type {
  CampaignIds,
  OriginMetadata,
  ClickIds,
} from '../../types/contact-origin-types.ts'
import type { NormalizedMessage } from '../../types.ts'

export class UazapiSourceExtractor extends BaseSourceDataExtractor {
  /**
   * Extrai click IDs específicos do UAZAPI (Meta Ads CTWA)
   */
  protected extractAdditionalClickIds(message: NormalizedMessage): ClickIds | null {
    const metadata = message.context?.metadata || {}
    const externalAdReply = metadata.externalAdReply as any
    
    if (!externalAdReply) {
      return null
    }
    
    const clickIds: ClickIds = {}
    
    // UAZAPI específico: ctwaClid vem em externalAdReply
    if (externalAdReply.ctwaClid) {
      clickIds.ctwaClid = String(externalAdReply.ctwaClid)
    }
    
    return Object.keys(clickIds).length > 0 ? clickIds : null
  }
  
  /**
   * Extrai UTMs do externalAdReply (UAZAPI específico)
   */
  protected extractAdditionalUtmParams(message: NormalizedMessage): UtmParams | null {
    const metadata = message.context?.metadata || {}
    const externalAdReply = metadata.externalAdReply as any
    
    if (!externalAdReply) {
      return null
    }
    
    const utm: UtmParams = {}
    
    // UAZAPI fornece sourceApp e sourceID que podem ser mapeados para UTMs
    if (externalAdReply.sourceApp) {
      utm.utm_source = String(externalAdReply.sourceApp)
    }
    if (externalAdReply.sourceType === 'ad') {
      utm.utm_medium = 'paid_social'
    }
    if (externalAdReply.sourceID) {
      utm.utm_campaign = String(externalAdReply.sourceID)
      utm.utm_content = String(externalAdReply.sourceID) // Fallback
    }
    
    return Object.keys(utm).length > 0 ? utm : null
  }
  
  /**
   * Extrai IDs de campanha do externalAdReply (UAZAPI)
   */
  protected extractCampaignIds(message: NormalizedMessage): CampaignIds | null {
    const metadata = message.context?.metadata || {}
    const externalAdReply = metadata.externalAdReply as any
    
    if (!externalAdReply) {
      return null
    }
    
    const campaign: CampaignIds = {
      campaign_id: externalAdReply.sourceID,
      ad_id: externalAdReply.sourceID, // UAZAPI não diferencia
    }
    
    return campaign
  }
  
  /**
   * Extrai metadados do externalAdReply (UAZAPI)
   */
  protected extractMetadata(message: NormalizedMessage): OriginMetadata | null {
    const metadata = message.context?.metadata || {}
    const externalAdReply = metadata.externalAdReply as any
    
    if (!externalAdReply) {
      return null
    }
    
    const originMetadata: OriginMetadata = {
      source_type: externalAdReply.sourceType === 'ad' ? 'ad' : 'other',
      source_app: externalAdReply.sourceApp || 'facebook',
      source_id: externalAdReply.sourceID,
      source_url: externalAdReply.sourceURL,
      first_interaction_at: message.timestamp.toISOString(),
    }
    
    return originMetadata
  }
}
```

**Checklist**:
- [ ] Extensão criada para UAZAPI
- [ ] Herda de BaseSourceDataExtractor
- [ ] Implementa métodos abstratos
- [ ] Usa hooks para dados adicionais
- [ ] Testes unitários específicos

---

### Etapa 4.2: Criar Factory para Source Data Extractors

**Arquivo**: `back-end/supabase/functions/messaging/mappers/source-data-mapper.ts`

```typescript
/**
 * Factory para criar extrator de dados de origem baseado no broker
 * 
 * Strategy Pattern: Cada broker tem sua estratégia de extração
 */

import type { ISourceDataExtractor } from '../brokers/base/SourceDataExtractor.ts'
import { UazapiSourceExtractor } from '../brokers/uazapi/UazapiSourceExtractor.ts'
// import { GupshupSourceExtractor } from '../brokers/gupshup/GupshupSourceExtractor.ts'
// import { OfficialSourceExtractor } from '../brokers/official/OfficialSourceExtractor.ts'
import type { NormalizedMessage } from '../types.ts'
import type { StandardizedSourceData } from '../types/contact-origin-types.ts'

/**
 * Factory para criar extrator apropriado
 */
export class SourceDataExtractorFactory {
  /**
   * Cria extrator baseado no brokerId
   */
  static create(brokerId: string): ISourceDataExtractor {
    switch (brokerId) {
      case 'uazapi':
        return new UazapiSourceExtractor()
      
      // Futuro: outros brokers
      // case 'gupshup':
      //   return new GupshupSourceExtractor()
      // case 'official_whatsapp':
      //   return new OfficialSourceExtractor()
      
      default:
        // Fallback: retorna extrator genérico (só extrai UTMs e click IDs básicos)
        return new BaseSourceDataExtractor() {
          protected extractCampaignIds() { return null }
          protected extractMetadata() { return null }
        }
    }
  }
  
  /**
   * Extrai dados de origem da mensagem usando extrator apropriado
   */
  static extract(message: NormalizedMessage): StandardizedSourceData | null {
    const extractor = this.create(message.brokerId)
    return extractor.extract(message)
  }
}
```

**Checklist**:
- [ ] Factory criada
- [ ] Suporta UAZAPI
- [ ] Preparado para outros brokers
- [ ] Fallback genérico implementado
- [ ] Testes unitários

---

### Etapa 5: Criar Repository de Contatos

**Arquivo**: `back-end/supabase/functions/messaging/repositories/ContactRepository.ts`

```typescript
/**
 * Repository para operações com contatos
 * 
 * Segue Repository Pattern (DIP) para abstrair acesso ao banco
 */

import type { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import type { NormalizedPhone } from '../utils/identifier-normalizer.ts'
// REFATORADO: phone-normalizer.ts → identifier-normalizer.ts (suporta telefone, JID, LID)

export interface Contact {
  id: string
  project_id: string
  name: string
  phone: string
  country_code: string
  main_origin_id: string
  current_stage_id: string
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface ContactRepository {
  findByPhone(params: {
    projectId: string
    phone: string
    countryCode: string
  }): Promise<Contact | null>
  
  create(params: {
    projectId: string
    name: string
    phone: string
    countryCode: string
    mainOriginId: string
    currentStageId: string
    metadata?: Record<string, unknown>
  }): Promise<Contact>
}

/**
 * Implementação do repository usando Supabase
 */
export class SupabaseContactRepository implements ContactRepository {
  constructor(
    private supabaseClient: ReturnType<typeof createClient>
  ) {}
  
  async findByPhone(params: {
    projectId: string
    phone: string
    countryCode: string
  }): Promise<Contact | null> {
    const { data, error } = await this.supabaseClient
      .from('contacts')
      .select('*')
      .eq('project_id', params.projectId)
      .eq('phone', params.phone)
      .eq('country_code', params.countryCode)
      .single()
    
    if (error) {
      // 404 (PGRST116) significa que não encontrou - retornar null
      if (error.code === 'PGRST116') {
        return null
      }
      throw new Error(`Erro ao buscar contato: ${error.message}`)
    }
    
    return data as Contact
  }
  
  async create(params: {
    projectId: string
    name: string
    phone: string
    countryCode: string
    mainOriginId: string
    currentStageId: string
    metadata?: Record<string, unknown>
  }): Promise<Contact> {
    const { data, error } = await this.supabaseClient
      .from('contacts')
      .insert({
        project_id: params.projectId,
        name: params.name,
        phone: params.phone,
        country_code: params.countryCode,
        main_origin_id: params.mainOriginId,
        current_stage_id: params.currentStageId,
        metadata: params.metadata || {},
      })
      .select()
      .single()
    
    if (error) {
      throw new Error(`Erro ao criar contato: ${error.message}`)
    }
    
    return data as Contact
  }
}
```

**Checklist**:
- [ ] Interface do repository definida
- [ ] Implementação Supabase criada
- [ ] Métodos testados
- [ ] Tratamento de erros adequado

---

### Etapa 6: Criar Normalizador de Dados de Origem (Wrapper)

**Arquivo**: `back-end/supabase/functions/messaging/services/OriginDataNormalizer.ts`

```typescript
/**
 * Normalizador de dados de origem (wrapper/facade)
 * 
 * Responsabilidade única: Interface simplificada para extração de dados de origem
 * Delega para SourceDataExtractorFactory que gerencia a lógica específica por broker
 */

import type { StandardizedSourceData } from '../types/contact-origin-types.ts'
import type { NormalizedMessage } from '../types.ts'
import { SourceDataExtractorFactory } from '../mappers/source-data-mapper.ts'

export class OriginDataNormalizer {
  /**
   * Normaliza dados de origem da mensagem
   * 
   * Usa factory para criar extrator apropriado baseado no brokerId
   */
  static normalize(
    message: NormalizedMessage
  ): StandardizedSourceData | null {
    try {
      return SourceDataExtractorFactory.extract(message)
    } catch (error) {
      console.error('[OriginDataNormalizer] Error extracting source data:', error)
      return null
    }
  }
  
  /**
   * Verifica se há dados de origem válidos
   */
  static hasOriginData(sourceData: StandardizedSourceData | null): boolean {
    if (!sourceData) return false
    
    return !!(
      sourceData.clickIds ||
      sourceData.utm ||
      sourceData.campaign ||
      sourceData.metadata
    )
  }
}
```

**Checklist**:
- [ ] Classe criada com métodos estáticos
- [ ] Integração com mappers
- [ ] Validação de dados
- [ ] Testes unitários

---

### Etapa 7: Criar Serviço Principal

**Arquivo**: `back-end/supabase/functions/messaging/services/ContactOriginService.ts`

```typescript
/**
 * Serviço para gerenciamento de contatos com rastreamento de origem
 * 
 * Responsabilidades:
 * - Validar condições (isGroup, fromMe)
 * - Extrair telefone
 * - Buscar/criar contato
 * - Gerenciar origens (buscar/criar)
 * - Salvar dados de origem estruturados
 */

import type { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import type {
  ProcessContactOriginParams,
  ProcessContactOriginResult,
  StandardizedSourceData,
} from '../types/contact-origin-types.ts'
import type { NormalizedMessage } from '../types.ts'
import { extractPhoneNumber } from '../utils/identifier-normalizer.ts'
// REFATORADO: phone-normalizer.ts → identifier-normalizer.ts
// extractPhoneNumber() foi refatorada para usar normalizeIdentifier() internamente
// Mantém mesma interface pública, suporta telefone, JID e LID
import { OriginDataNormalizer } from './OriginDataNormalizer.ts'
import {
  ContactRepository,
  SupabaseContactRepository,
} from '../repositories/ContactRepository.ts'

export class ContactOriginService {
  private contactRepo: ContactRepository
  private supabaseClient: ReturnType<typeof createClient>
  
  constructor(supabaseClient: ReturnType<typeof createClient>) {
    this.supabaseClient = supabaseClient
    this.contactRepo = new SupabaseContactRepository(supabaseClient)
  }
  
  /**
   * Processa contato que ENVIA mensagem (entrada)
   * 
   * Condições:
   * - isGroup === false
   * - fromMe === false
   */
  async processIncomingContact(
    params: ProcessContactOriginParams
  ): Promise<ProcessContactOriginResult> {
    const { normalizedMessage, projectId } = params
    
    // 1. Validar condições
    if (normalizedMessage.isGroup || normalizedMessage.fromMe) {
      throw new Error(
        'processIncomingContact só deve ser chamado para mensagens de contato individual recebidas'
      )
    }
    
    // 2. Extrair telefone (suporta telefone, JID ou LID)
    // extractPhoneNumber() foi refatorada para usar normalizeIdentifier() internamente
    // Pode receber telefone ou JID (extrai telefone do JID)
    // LID não suportado (não contém telefone)
    let phone: string | undefined
    let countryCode: string | undefined
    
    if (normalizedMessage.from.phoneNumber) {
      const phoneData = extractPhoneNumber(normalizedMessage.from.phoneNumber)
      phone = phoneData.phone
      countryCode = phoneData.countryCode
    } else if (normalizedMessage.from.jid) {
      // Extrai telefone do JID usando extractPhoneNumber() refatorada
      const phoneData = extractPhoneNumber(normalizedMessage.from.jid)
      phone = phoneData.phone
      countryCode = phoneData.countryCode
    }
    
    // 3. Normalizar dados de origem
    const sourceData = OriginDataNormalizer.normalize(normalizedMessage)
    
    // 4. Buscar contato existente
    const existingContact = await this.contactRepo.findByPhone({
      projectId,
      phone,
      countryCode,
    })
    
    // 5. Se contato não existe: criar com origem
    if (!existingContact) {
      return await this.createContactWithOrigin({
        projectId,
        phone,
        countryCode,
        name: normalizedMessage.from.name || phone,
        sourceData,
      })
    }
    
    // 6. Se contato existe: adicionar nova origem se necessário
    if (sourceData && OriginDataNormalizer.hasOriginData(sourceData)) {
      await this.addOriginToContact({
        contactId: existingContact.id,
        projectId,
        sourceData,
      })
    }
    
    return {
      contactId: existingContact.id,
      created: false,
      sourceData,
    }
  }
  
  /**
   * Cria contato novo com origem
   */
  private async createContactWithOrigin(params: {
    projectId: string
    phone: string
    countryCode: string
    name: string
    sourceData: StandardizedSourceData | null
  }): Promise<ProcessContactOriginResult> {
    // 1. Buscar/criar origem
    const originId = await this.findOrCreateOrigin({
      projectId: params.projectId,
      sourceData: params.sourceData,
    })
    
    // 2. Buscar primeiro estágio ativo
    const firstStage = await this.getFirstActiveStage(params.projectId)
    if (!firstStage) {
      throw new Error('Nenhum estágio ativo encontrado para o projeto')
    }
    
    // 3. Criar contato
    const contact = await this.contactRepo.create({
      projectId: params.projectId,
      name: params.name,
      phone: params.phone,
      countryCode: params.countryCode,
      mainOriginId: originId,
      currentStageId: firstStage.id,
      metadata: {
        platform: 'whatsapp',
      },
    })
    
    // 4. Registrar origem com source_data
    if (params.sourceData && OriginDataNormalizer.hasOriginData(params.sourceData)) {
      await this.insertContactOrigin({
        contactId: contact.id,
        originId,
        sourceData: params.sourceData,
      })
      
      // 5. Registrar histórico de estágio
      await this.insertStageHistory({
        contactId: contact.id,
        stageId: firstStage.id,
      })
    }
    
    return {
      contactId: contact.id,
      created: true,
      originId,
      sourceData: params.sourceData || undefined,
    }
  }
  
  /**
   * Adiciona origem ao contato existente
   */
  private async addOriginToContact(params: {
    contactId: string
    projectId: string
    sourceData: StandardizedSourceData
  }): Promise<void> {
    // 1. Buscar/criar origem
    const originId = await this.findOrCreateOrigin({
      projectId: params.projectId,
      sourceData: params.sourceData,
    })
    
    // 2. Verificar se contato já tem esta origem
    const existing = await this.supabaseClient
      .from('contact_origins')
      .select('id, source_data')
      .eq('contact_id', params.contactId)
      .eq('origin_id', originId)
      .single()
    
    if (existing.data) {
      // Atualizar source_data (merge)
      const current = (existing.data.source_data as StandardizedSourceData) || {}
      const merged = this.mergeSourceData(current, params.sourceData)
      
      await this.supabaseClient
        .from('contact_origins')
        .update({
          source_data: merged,
          acquired_at: new Date().toISOString(),
        })
        .eq('id', existing.data.id)
      
      return
    }
    
    // 3. Criar novo registro de origem
    await this.insertContactOrigin({
      contactId: params.contactId,
      originId,
      sourceData: params.sourceData,
    })
  }
  
  /**
   * Busca ou cria origem baseada em source_data
   */
  private async findOrCreateOrigin(params: {
    projectId: string
    sourceData: StandardizedSourceData | null
  }): Promise<string> {
    // Se não tem source_data, usar origem padrão "WhatsApp"
    if (!params.sourceData || !OriginDataNormalizer.hasOriginData(params.sourceData)) {
      return await this.findOrCreateDefaultOrigin(params.projectId, 'WhatsApp')
    }
    
    // Determinar nome da origem baseado em source_app e source_type
    const sourceApp = params.sourceData.metadata?.source_app
    const sourceType = params.sourceData.metadata?.source_type
    
    let originName: string
    
    if (sourceApp === 'facebook' || sourceApp === 'instagram') {
      originName = 'Meta Ads'
    } else if (sourceApp === 'google') {
      originName = 'Google Ads'
    } else if (sourceApp === 'tiktok') {
      originName = 'TikTok Ads'
    } else {
      // Fallback: usar origem padrão "WhatsApp"
      return await this.findOrCreateDefaultOrigin(params.projectId, 'WhatsApp')
    }
    
    // Buscar origem do sistema primeiro
    const systemOrigin = await this.supabaseClient
      .from('origins')
      .select('id')
      .eq('project_id', null) // Origens do sistema
      .eq('name', originName)
      .eq('is_active', true)
      .single()
    
    if (systemOrigin.data) {
      return systemOrigin.data.id
    }
    
    // Se não encontrou origem do sistema, criar customizada para o projeto
    return await this.findOrCreateDefaultOrigin(params.projectId, originName)
  }
  
  /**
   * Busca ou cria origem padrão
   */
  private async findOrCreateDefaultOrigin(
    projectId: string,
    originName: string
  ): Promise<string> {
    // Buscar origem existente
    const existing = await this.supabaseClient
      .from('origins')
      .select('id')
      .eq('project_id', projectId)
      .eq('name', originName)
      .eq('is_active', true)
      .single()
    
    if (existing.data) {
      return existing.data.id
    }
    
    // Criar nova origem customizada
    const { data, error } = await this.supabaseClient
      .from('origins')
      .insert({
        project_id: projectId,
        name: originName,
        type: 'custom',
        color: this.getDefaultColorForOrigin(originName),
        icon: this.getDefaultIconForOrigin(originName),
        is_active: true,
      })
      .select('id')
      .single()
    
    if (error) {
      throw new Error(`Erro ao criar origem: ${error.message}`)
    }
    
    return data.id
  }
  
  /**
   * Insere registro de origem do contato
   */
  private async insertContactOrigin(params: {
    contactId: string
    originId: string
    sourceData: StandardizedSourceData
  }): Promise<void> {
    const { error } = await this.supabaseClient
      .from('contact_origins')
      .insert({
        contact_id: params.contactId,
        origin_id: params.originId,
        source_data: params.sourceData,
        acquired_at: new Date().toISOString(),
      })
    
    if (error) {
      throw new Error(`Erro ao registrar origem: ${error.message}`)
    }
  }
  
  /**
   * Insere histórico de estágio
   */
  private async insertStageHistory(params: {
    contactId: string
    stageId: string
  }): Promise<void> {
    const { error } = await this.supabaseClient
      .from('contact_stage_history')
      .insert({
        contact_id: params.contactId,
        stage_id: params.stageId,
        moved_by: 'system',
      })
    
    if (error) {
      // Não é crítico se falhar, apenas logar
      console.warn(`[ContactOriginService] Erro ao registrar histórico de estágio: ${error.message}`)
    }
  }
  
  /**
   * Busca primeiro estágio ativo do projeto
   */
  private async getFirstActiveStage(projectId: string): Promise<{ id: string } | null> {
    const { data } = await this.supabaseClient
      .from('stages')
      .select('id')
      .eq('project_id', projectId)
      .eq('is_active', true)
      .order('display_order', { ascending: true })
      .limit(1)
      .single()
    
    return data as { id: string } | null
  }
  
  /**
   * Faz merge de source_data (preserva dados existentes)
   */
  private mergeSourceData(
    current: StandardizedSourceData,
    newData: StandardizedSourceData
  ): StandardizedSourceData {
    return {
      clickIds: {
        ...current.clickIds,
        ...newData.clickIds,
      },
      utm: {
        ...current.utm,
        ...newData.utm,
      },
      campaign: {
        ...current.campaign,
        ...newData.campaign,
      },
      metadata: {
        ...current.metadata,
        ...newData.metadata,
        last_interaction_at: new Date().toISOString(),
      },
    }
  }
  
  /**
   * Retorna cor padrão para origem
   */
  private getDefaultColorForOrigin(originName: string): string {
    const colors: Record<string, string> = {
      'Meta Ads': '#0866FF',
      'Google Ads': '#4285F4',
      'TikTok Ads': '#000000',
      'WhatsApp': '#25D366',
    }
    
    return colors[originName] || '#6B7280'
  }
  
  /**
   * Retorna ícone padrão para origem
   */
  private getDefaultIconForOrigin(originName: string): string {
    const icons: Record<string, string> = {
      'Meta Ads': 'facebook',
      'Google Ads': 'chrome',
      'TikTok Ads': 'music',
      'WhatsApp': 'message-circle',
    }
    
    return icons[originName] || 'help-circle'
  }
}
```

**Checklist**:
- [ ] Serviço criado seguindo SRP
- [ ] Métodos privados para lógica interna
- [ ] Tratamento de erros adequado
- [ ] Testes unitários para cada método
- [ ] Validação de condições

---

### Etapa 8: Integrar no Fluxo de Webhook

**Arquivo**: `back-end/supabase/functions/messaging/utils/webhook-processor.ts`

**Modificar a função `processWebhookCommon`**:

```typescript
// Adicionar import
import { ContactOriginService } from '../services/ContactOriginService.ts'

// Dentro de processWebhookCommon, após normalização:

if (normalized.eventType === 'message' && normalized.message) {
  const message = normalized.message
  
  // CASO 1: Mensagem recebida (isGroup=false, fromMe=false)
  if (message.isGroup === false && message.fromMe === false) {
    try {
      const contactOriginService = new ContactOriginService(supabaseClient)
      
      await contactOriginService.processIncomingContact({
        normalizedMessage: message,
        projectId: account.project_id,
        supabaseClient,
      })
      
      logger.info('Contact origin processed', {
        phone: message.from.phoneNumber,
        projectId: account.project_id,
      })
    } catch (error) {
      // Log erro mas não falha o processamento da mensagem
      logger.error('Error processing contact origin', error, {
        phone: message.from.phoneNumber,
      })
    }
  }
  
  // CASO 2: Mensagem enviada por nós (isGroup=false, fromMe=true)
  // TODO: Futuro - função separada para tracking de mensagens enviadas
  // if (message.isGroup === false && message.fromMe === true) {
  //   await contactOriginService.processOutgoingMessage({...})
  // }
  
  // Processar mensagem normalmente
  const { timeMs: processingTime } = await measureTime(
    () => processor.processMessage(message, account.project_id),
    logger.withContext({ step: 'message_processing' })
  )
  
  // ... resto do código
}
```

**Checklist**:
- [ ] Import adicionado
- [ ] Lógica integrada antes de processMessage
- [ ] Erros não quebram fluxo principal
- [ ] Logs adequados
- [ ] Comentário TODO para futuro

---

### Etapa 9: Atualizar UazapiBroker para Incluir Dados no Metadata

**Arquivo**: `back-end/supabase/functions/messaging/brokers/uazapi/UazapiBroker.ts`

**Modificar método `buildNormalizedMessage`** para incluir todos os dados de origem no metadata:

```typescript
// Dentro do método buildNormalizedMessage, no objeto context.metadata:

context: {
  metadata: {
    conversionSource: conversionData.conversionSource,
    isProtocol: protocolInfo.isProtocol,
    protocolNumber: protocolInfo.protocolNumber,
    messageDevice: message.source,
    owner: data.owner,
    instanceToken: data.token,
    externalAdReply: conversionData.externalAdReply,
    
    // ✅ ADICIONAR: Dados de origem para extração posterior
    ctwaClid: conversionData.externalAdReply?.ctwaClid,
    fbclid: conversionData.externalAdReply?.fbclid, // Se disponível
    sourceType: conversionData.externalAdReply?.sourceType,
    sourceID: conversionData.externalAdReply?.sourceID,
    sourceApp: conversionData.externalAdReply?.sourceApp,
    sourceURL: conversionData.externalAdReply?.sourceURL,
    
    // UTMs (se disponíveis via URL ou outros meios)
    utm_source: conversionData.externalAdReply?.sourceApp || 'facebook',
    utm_medium: conversionData.externalAdReply?.sourceType === 'ad' ? 'paid_social' : undefined,
    utm_campaign: conversionData.externalAdReply?.sourceID,
  },
}
```

**Nota**: O `UazapiSourceExtractor` já extrairá esses dados do metadata automaticamente.

**Checklist**:
- [ ] Todos os campos de origem adicionados ao metadata
- [ ] ctwaClid incluído
- [ ] UTMs incluídos (se disponíveis)
- [ ] Testado com webhook real

---

### Etapa 9.1: Padronizar Extração em Outros Brokers (Futuro)

**Para Gupshup**:
```typescript
// back-end/supabase/functions/messaging/brokers/gupshup/GupshupSourceExtractor.ts

export class GupshupSourceExtractor extends BaseSourceDataExtractor {
  protected extractCampaignIds(message: NormalizedMessage): CampaignIds | null {
    // Lógica específica do Gupshup
  }
  
  protected extractMetadata(message: NormalizedMessage): OriginMetadata | null {
    // Lógica específica do Gupshup
  }
}
```

**Para Official WhatsApp**:
```typescript
// back-end/supabase/functions/messaging/brokers/official/OfficialSourceExtractor.ts

export class OfficialSourceExtractor extends BaseSourceDataExtractor {
  protected extractCampaignIds(message: NormalizedMessage): CampaignIds | null {
    // Lógica específica do Official WhatsApp Business API
  }
  
  protected extractMetadata(message: NormalizedMessage): OriginMetadata | null {
    // Lógica específica do Official WhatsApp Business API
  }
}
```

**Princípio**: Cada novo broker apenas implementa os métodos abstratos, reutilizando toda a lógica comum.

---

### Etapa 10: Criar Testes

**Arquivo**: `back-end/supabase/functions/messaging/tests/contact-origin-service.test.ts`

```typescript
/**
 * Testes unitários para ContactOriginService
 */

import { describe, it, expect, beforeEach } from 'https://deno.land/std@0.168.0/testing/bdd.ts'
import { ContactOriginService } from '../services/ContactOriginService.ts'
// ... imports necessários

describe('ContactOriginService', () => {
  // ... testes
})
```

**Checklist**:
- [ ] Testes para processIncomingContact
- [ ] Testes para criação de contato
- [ ] Testes para adição de origem
- [ ] Testes para normalização de telefone
- [ ] Testes de edge cases

---

## ✅ Checklist Final de Implementação

### Banco de Dados
- [ ] Migração criada e testada
- [ ] Índice GIN criado
- [ ] Comentário adicionado à coluna

### Código
- [ ] Tipos TypeScript criados
- [ ] Utilitário de telefone criado
- [ ] Mapper de plataforma criado
- [ ] Repository criado
- [ ] Normalizador criado
- [ ] Serviço principal criado
- [ ] Integração no webhook-processor
- [ ] UazapiBroker atualizado

### Testes
- [ ] Testes unitários criados
- [ ] Testes de integração criados
- [ ] Testes com dados reais

### Documentação
- [ ] JSDoc em todas as funções públicas
- [ ] README atualizado
- [ ] Exemplos de uso documentados

---

## 🚀 Próximos Passos (Futuro)

1. **Conversões Offline**: Usar `source_data.clickIds` para enviar eventos
2. **Timeline Frontend**: Query para buscar `contact_origins` ordenado por `acquired_at`
3. **Suporte a JID e LID**: 
   - ✅ **FASE 0**: Atualizar tipos TypeScript (4 arquivos) - **CONCLUÍDO em 2025-01-27**
   - ✅ **FASE 0**: Atualizar validadores Zod (backend + frontend) - **CONCLUÍDO em 2025-01-27**
   - ⏳ **FASE 1.5**: Criar e executar script de migração de dados existentes - **BLOQUEADOR**
   - ⏳ **FASE 2**: Atualizar migração (remover NOT NULL, ajustar constraints existentes, adicionar unique constraints)
   - ⏳ **FASE 1**: Refatorar `phone-normalizer.ts` → `identifier-normalizer.ts` (DRY + OCP + KISS)
   - ⏳ **FASE 1**: Adicionar suporte a JID e LID mantendo telefone
   - ⏳ **FASE 1**: Refatorar `extractPhoneNumber()` diretamente (sem wrapper deprecated)
   - ⏳ **FASE 1**: Corrigir fallback problemático (lançar erro em vez de criar identificador inválido)
   - ⏳ **FASE 3**: Atualizar `ContactRepository` para busca por múltiplos identificadores (otimizada)
   - ⏳ **FASE 4**: Migrar brokers para usar normalizador refatorado
   - ⏳ **FASE 8**: Atualizar API REST Edge Function `contacts`
   - ⏳ Ver `ANALISE_JID_LID_WHATSAPP.md` para detalhes
   - ⚠️ Ver `CRITICA_PLANO_IMPLEMENTACAO_JID_LID.md` e `ANALISE_CRITICA_COMPLETA_JID_LID.md` para problemas e correções
4. **Suporte a mais plataformas**: 
   - ✅ Criar `GupshupSourceExtractor extends BaseSourceDataExtractor`
   - ✅ Criar `OfficialSourceExtractor extends BaseSourceDataExtractor`
   - ✅ Registrar na Factory
5. **Tracking de mensagens enviadas**: Implementar `processOutgoingMessage`
6. **Extração de UTMs de URLs**: Adicionar parser de URL para extrair UTMs de links rastreados

## 📚 Padrões de Design Aplicados

### 1. Template Method Pattern
- **Classe**: `BaseSourceDataExtractor`
- **Uso**: Define esqueleto do algoritmo de extração (`extract()`)
- **Benefício**: Lógica comum centralizada, diferenças delegadas

### 2. Strategy Pattern
- **Interface**: `ISourceDataExtractor`
- **Uso**: Cada broker tem sua estratégia de extração
- **Benefício**: Troca de estratégia em runtime via Factory

### 3. Factory Pattern
- **Classe**: `SourceDataExtractorFactory`
- **Uso**: Cria extrator apropriado baseado em `brokerId`
- **Benefício**: Desacopla criação de uso

### 4. Repository Pattern
- **Interface**: `ContactRepository`
- **Uso**: Abstrai acesso ao banco de dados
- **Benefício**: Testável, trocável de implementação

### 5. Dependency Injection
- **Uso**: Serviços recebem dependências via construtor
- **Benefício**: Testável, desacoplado

---

## 📚 Referências

- Schema JSONB: Ver `IMPLEMENTATION_CONTACT_ORIGINS.md`
- Tipos TypeScript: Ver `types/contact-origin-types.ts`
- Exemplos de dados: Ver seção "Exemplos de Dados por Plataforma" acima
- Suporte JID/LID: Ver `ANALISE_JID_LID_WHATSAPP.md` ✅ NOVO
