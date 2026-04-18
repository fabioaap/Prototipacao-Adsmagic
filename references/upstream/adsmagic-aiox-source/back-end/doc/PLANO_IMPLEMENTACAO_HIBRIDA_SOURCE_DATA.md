# Plano de Implementação: Abordagem Híbrida Source Data

**Data**: 2025-01-27  
**Objetivo**: Implementar estrutura híbrida (colunas críticas + JSONB) para `contact_origins`  
**Status**: 🚧 Em Execução (3/8 etapas concluídas)  
**Prioridade**: Alta  
**Progresso**: 37.5% concluído

---

## 🎯 Visão Geral

### Objetivo
Migrar de estrutura JSONB pura para abordagem híbrida que combina:
- **Colunas normalizadas** para campos críticos (performance)
- **JSONB** para campos flexíveis (extensibilidade)

### Campos Críticos (Colunas)
- `campaign_id` - ID da campanha (mais consultado)
- `ad_id` - ID do anúncio (Meta Ads, muito consultado)
- `adgroup_id` - ID do conjunto/grupo de anúncios (Google/Meta), muito usado em análises de performance
- `source_app` - Plataforma (google, facebook, instagram, tiktok)

### Campos Flexíveis (JSONB)
- Click IDs (gclid, fbclid, ctwaClid, etc.)
- UTMs detalhados (utm_content, utm_term)
- Metadados (device, network, etc.)
- Campos futuros/extensíveis

---

## 📋 Etapas de Implementação

### **ETAPA 1: Preparação e Análise** ⏱️ 30min

#### 1.1: Validação Inicial
- [ ] Validar estrutura atual de `contact_origins`
- [ ] Verificar se há dados existentes em `source_data`
- [ ] (Opcional) Fazer backup se houver dados importantes

**Query de validação:**
```sql
-- Verificar estrutura atual
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'contact_origins'
ORDER BY ordinal_position;

-- Verificar dados existentes
SELECT 
  COUNT(*) as total_records,
  COUNT(CASE WHEN source_data IS NOT NULL AND source_data != '{}'::jsonb THEN 1 END) as records_with_data,
  COUNT(CASE WHEN source_data->'campaign'->>'campaign_id' IS NOT NULL THEN 1 END) as records_with_campaign_id,
  COUNT(CASE WHEN source_data->'campaign'->>'ad_id' IS NOT NULL THEN 1 END) as records_with_ad_id,
  COUNT(CASE WHEN source_data->'campaign'->>'adgroup_id' IS NOT NULL THEN 1 END) as records_with_adgroup_id,
  COUNT(CASE WHEN source_data->'metadata'->>'source_app' IS NOT NULL THEN 1 END) as records_with_source_app
FROM contact_origins;
```

#### 1.2: Documentar Dependências
- [ ] Listar todos os arquivos que usam `contact_origins`
- [ ] Identificar queries que acessam `source_data`
- [ ] Documentar edge functions que inserem/atualizam `source_data`

**Arquivos a verificar:**
- `back-end/supabase/functions/messaging/services/ContactOriginService.ts`
- `back-end/supabase/functions/messaging/utils/webhook-processor.ts`
- Queries em relatórios/dashboard
- Testes existentes

---

### **ETAPA 2: Migration - Adicionar Colunas Críticas** ⏱️ 1h

#### 2.1: Criar Migration
**Arquivo**: `back-end/supabase/migrations/024_add_critical_fields_contact_origins.sql`

```sql
-- Migration: Adicionar campos críticos normalizados em contact_origins
-- Data: 2025-01-XX
-- Descrição: Adiciona colunas normalizadas (campaign_id, ad_id, adgroup_id, source_app) para otimizar queries
-- Conforme: PLANO_IMPLEMENTACAO_HIBRIDA_SOURCE_DATA.md

BEGIN;

-- ==========================================
-- ADICIONAR COLUNAS CRÍTICAS
-- ==========================================

-- Campaign ID (mais consultado em relatórios)
ALTER TABLE contact_origins
ADD COLUMN IF NOT EXISTS campaign_id TEXT;

-- Ad ID (Meta Ads - muito consultado)
ALTER TABLE contact_origins
ADD COLUMN IF NOT EXISTS ad_id TEXT;

-- Adgroup ID (Google/Meta - conjunto/grupo de anúncios, muito usado em análises)
ALTER TABLE contact_origins
ADD COLUMN IF NOT EXISTS adgroup_id TEXT;

-- Source App (filtro comum: google, facebook, instagram, tiktok)
ALTER TABLE contact_origins
ADD COLUMN IF NOT EXISTS source_app TEXT;

-- ==========================================
-- CRIAR ÍNDICES PARA PERFORMANCE
-- ==========================================

-- Índice para campaign_id (campo mais consultado)
CREATE INDEX IF NOT EXISTS idx_contact_origins_campaign_id 
ON contact_origins(campaign_id) 
WHERE campaign_id IS NOT NULL;

-- Índice para ad_id (Meta Ads)
CREATE INDEX IF NOT EXISTS idx_contact_origins_ad_id 
ON contact_origins(ad_id) 
WHERE ad_id IS NOT NULL;

-- Índice para adgroup_id (Google/Meta)
CREATE INDEX IF NOT EXISTS idx_contact_origins_adgroup_id 
ON contact_origins(adgroup_id) 
WHERE adgroup_id IS NOT NULL;

-- Índice para source_app (filtro comum)
CREATE INDEX IF NOT EXISTS idx_contact_origins_source_app 
ON contact_origins(source_app) 
WHERE source_app IS NOT NULL;

-- Índice composto para queries frequentes (campaign_id + source_app)
CREATE INDEX IF NOT EXISTS idx_contact_origins_campaign_source_app 
ON contact_origins(campaign_id, source_app) 
WHERE campaign_id IS NOT NULL AND source_app IS NOT NULL;

-- ==========================================
-- COMENTÁRIOS EXPLICATIVOS
-- ==========================================

COMMENT ON COLUMN contact_origins.campaign_id IS 
'ID da campanha de anúncios (extraído de source_data->campaign->campaign_id). 
Campo crítico para relatórios e queries de performance. Sincronizado automaticamente via trigger.';

COMMENT ON COLUMN contact_origins.ad_id IS 
'ID do anúncio (extraído de source_data->campaign->ad_id). 
Campo crítico para Meta Ads. Sincronizado automaticamente via trigger.';

COMMENT ON COLUMN contact_origins.adgroup_id IS 
'ID do conjunto/grupo de anúncios (extraído de source_data->campaign->adgroup_id). 
Campo crítico para Google Ads e Meta Ads. Sincronizado automaticamente via trigger.';

COMMENT ON COLUMN contact_origins.source_app IS 
'Plataforma de origem (google, facebook, instagram, tiktok). 
Extraído de source_data->metadata->source_app. Sincronizado automaticamente via trigger.';

COMMIT;
```

#### 2.2: Validar Migration
- [ ] Executar migration em ambiente de desenvolvimento
- [ ] Verificar que colunas foram criadas
- [ ] Verificar que índices foram criados
- [ ] Validar que dados existentes não foram afetados

**Query de validação:**
```sql
-- Verificar colunas criadas
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'contact_origins'
  AND column_name IN ('campaign_id', 'ad_id', 'adgroup_id', 'source_app');

-- Verificar índices criados
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'contact_origins'
  AND (indexname LIKE '%campaign%' OR indexname LIKE '%ad_id%' OR indexname LIKE '%adgroup%' OR indexname LIKE '%source_app%');
```

---

### **ETAPA 3: Trigger de Sincronização Automática** ⏱️ 1h

#### 3.1: Criar Função de Sincronização
**Arquivo**: `back-end/supabase/migrations/025_add_sync_trigger_contact_origins.sql`

```sql
-- Migration: Adicionar trigger para sincronizar campos críticos
-- Data: 2025-01-XX
-- Descrição: Trigger automático que sincroniza campos críticos (campaign_id, ad_id, adgroup_id, source_app) 
--            com source_data JSONB em INSERT e UPDATE
-- Conforme: PLANO_IMPLEMENTACAO_HIBRIDA_SOURCE_DATA.md

BEGIN;

-- ==========================================
-- FUNÇÃO DE SINCRONIZAÇÃO
-- ==========================================

CREATE OR REPLACE FUNCTION sync_contact_origin_critical_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- Extrair campaign_id padronizado (diferenciado por source_app/origin_id)
  NEW.campaign_id := NEW.source_data->'campaign'->>'campaign_id';
  
  -- Extrair ad_id
  NEW.ad_id := NEW.source_data->'campaign'->>'ad_id';
  
  -- Extrair adgroup_id (Google/Meta)
  NEW.adgroup_id := NEW.source_data->'campaign'->>'adgroup_id';
  
  -- Extrair source_app de source_data->metadata->source_app
  NEW.source_app := NEW.source_data->'metadata'->>'source_app';
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- COMENTÁRIO EXPLICATIVO
-- ==========================================

COMMENT ON FUNCTION sync_contact_origin_critical_fields() IS 
'Sincroniza automaticamente campos críticos (campaign_id, ad_id, adgroup_id, source_app) 
com source_data JSONB em INSERT e UPDATE. Mantém consistência entre JSONB e colunas normalizadas.
campaign_id é padronizado e diferenciado pela source_app/origin_id.';

-- ==========================================
-- CRIAR TRIGGER
-- ==========================================

DROP TRIGGER IF EXISTS trigger_sync_critical_fields ON contact_origins;

CREATE TRIGGER trigger_sync_critical_fields
BEFORE INSERT OR UPDATE ON contact_origins
FOR EACH ROW
WHEN (NEW.source_data IS NOT NULL AND NEW.source_data != '{}'::jsonb)
EXECUTE FUNCTION sync_contact_origin_critical_fields();

-- ==========================================
-- COMENTÁRIO EXPLICATIVO
-- ==========================================

COMMENT ON TRIGGER trigger_sync_critical_fields ON contact_origins IS 
'Trigger que executa antes de INSERT/UPDATE para sincronizar campos críticos 
com source_data JSONB. Executa apenas quando source_data não é NULL ou vazio.';

COMMIT;
```

#### 3.2: Testar Trigger
- [ ] Inserir registro novo e verificar sincronização
- [ ] Atualizar registro existente e verificar sincronização
- [ ] Testar com source_data vazio/null
- [ ] Testar com diferentes estruturas de source_data

**Queries de teste:**
```sql
-- Teste 1: Inserir registro novo
INSERT INTO contact_origins (contact_id, origin_id, source_data)
VALUES (
  'contact-uuid',
  'origin-uuid',
  '{
    "campaign": {"campaign_id": "test-campaign-123", "ad_id": "test-ad-456", "adgroup_id": "test-adgroup-789"},
    "metadata": {"source_app": "facebook"}
  }'::jsonb
);

-- Verificar sincronização
SELECT campaign_id, ad_id, adgroup_id, source_app, source_data
FROM contact_origins
WHERE id = (SELECT id FROM contact_origins ORDER BY created_at DESC LIMIT 1);

-- Teste 2: Atualizar registro existente
UPDATE contact_origins
SET source_data = '{
  "campaign": {"campaign_id": "updated-campaign-789", "ad_id": "updated-ad-012", "adgroup_id": "updated-adgroup-345"},
  "metadata": {"source_app": "google"}
}'::jsonb
WHERE id = (SELECT id FROM contact_origins ORDER BY created_at DESC LIMIT 1);

-- Verificar sincronização
SELECT campaign_id, ad_id, adgroup_id, source_app
FROM contact_origins
WHERE id = (SELECT id FROM contact_origins ORDER BY created_at DESC LIMIT 1);

-- Limpar dados de teste
DELETE FROM contact_origins WHERE campaign_id LIKE 'test-%' OR campaign_id LIKE 'updated-%';
```

---

### **ETAPA 4: Migração de Dados Existentes** ⏱️ 30min

#### 4.1: Script de Migração de Dados
**Arquivo**: `back-end/supabase/migrations/026_migrate_existing_data_contact_origins.sql`

```sql
-- Migration: Migrar dados existentes para campos críticos
-- Data: 2025-01-XX
-- Descrição: Atualiza registros existentes populando campos críticos a partir de source_data
-- Conforme: PLANO_IMPLEMENTACAO_HIBRIDA_SOURCE_DATA.md

BEGIN;

-- ==========================================
-- MIGRAR DADOS EXISTENTES
-- ==========================================

-- Atualizar campaign_id (padronizado, diferenciado por source_app/origin_id)
UPDATE contact_origins
SET campaign_id = source_data->'campaign'->>'campaign_id'
WHERE source_data IS NOT NULL 
  AND source_data != '{}'::jsonb
  AND campaign_id IS NULL
  AND source_data->'campaign'->>'campaign_id' IS NOT NULL;

-- Atualizar ad_id
UPDATE contact_origins
SET ad_id = source_data->'campaign'->>'ad_id'
WHERE source_data IS NOT NULL 
  AND source_data != '{}'::jsonb
  AND ad_id IS NULL
  AND source_data->'campaign'->>'ad_id' IS NOT NULL;

-- Atualizar adgroup_id
UPDATE contact_origins
SET adgroup_id = source_data->'campaign'->>'adgroup_id'
WHERE source_data IS NOT NULL 
  AND source_data != '{}'::jsonb
  AND adgroup_id IS NULL
  AND source_data->'campaign'->>'adgroup_id' IS NOT NULL;

-- Atualizar source_app
UPDATE contact_origins
SET source_app = source_data->'metadata'->>'source_app'
WHERE source_data IS NOT NULL 
  AND source_data != '{}'::jsonb
  AND source_app IS NULL
  AND source_data->'metadata'->>'source_app' IS NOT NULL;

-- ==========================================
-- VALIDAÇÃO PÓS-MIGRAÇÃO
-- ==========================================

-- Verificar quantos registros foram migrados
DO $$
DECLARE
  campaign_count INTEGER;
  ad_count INTEGER;
  source_app_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO campaign_count
  FROM contact_origins
  WHERE campaign_id IS NOT NULL;
  
  SELECT COUNT(*) INTO ad_count
  FROM contact_origins
  WHERE ad_id IS NOT NULL;
  
  SELECT COUNT(*) INTO adgroup_count
  FROM contact_origins
  WHERE adgroup_id IS NOT NULL;
  
  SELECT COUNT(*) INTO source_app_count
  FROM contact_origins
  WHERE source_app IS NOT NULL;
  
  RAISE NOTICE 'Registros migrados - campaign_id: %, ad_id: %, adgroup_id: %, source_app: %', 
    campaign_count, ad_count, adgroup_count, source_app_count;
END $$;

COMMIT;
```

#### 4.2: Validar Migração de Dados
- [ ] Executar script de migração
- [ ] Verificar que dados foram migrados corretamente
- [ ] Comparar contagens antes/depois
- [ ] Validar consistência entre JSONB e colunas

**Query de validação:**
```sql
-- Verificar consistência
SELECT 
  COUNT(*) as total_records,
  COUNT(CASE WHEN campaign_id IS NOT NULL THEN 1 END) as has_campaign_id,
  COUNT(CASE WHEN ad_id IS NOT NULL THEN 1 END) as has_ad_id,
  COUNT(CASE WHEN adgroup_id IS NOT NULL THEN 1 END) as has_adgroup_id,
  COUNT(CASE WHEN source_app IS NOT NULL THEN 1 END) as has_source_app,
  COUNT(CASE WHEN 
    campaign_id IS NOT NULL AND 
    source_data->'campaign'->>'campaign_id' IS NULL 
  THEN 1 END) as inconsistent_campaign_id,
  COUNT(CASE WHEN 
    adgroup_id IS NOT NULL AND 
    source_data->'campaign'->>'adgroup_id' IS NULL 
  THEN 1 END) as inconsistent_adgroup_id,
  COUNT(CASE WHEN 
    source_app IS NOT NULL AND 
    source_data->'metadata'->>'source_app' IS NULL 
  THEN 1 END) as inconsistent_source_app
FROM contact_origins
WHERE source_data IS NOT NULL AND source_data != '{}'::jsonb;
```

---

### **ETAPA 5: Atualizar Código TypeScript** ⏱️ 2h

#### 5.1: Atualizar Tipos TypeScript
**Arquivo**: `back-end/types.ts` ou criar novo arquivo de tipos

```typescript
/**
 * Interface para contact_origins com campos críticos normalizados
 * 
 * Abordagem híbrida: campos críticos em colunas + campos flexíveis em JSONB
 */
export interface ContactOrigin {
  id: string
  contact_id: string
  origin_id: string
  acquired_at: string
  created_at: string
  observations?: string | null
  
  // Campos críticos (normalizados)
  campaign_id?: string | null
  ad_id?: string | null
  source_app?: string | null
  
  // Campos flexíveis (JSONB)
  source_data?: StandardizedSourceData | null
}

/**
 * Dados padronizados de origem (armazenados em JSONB)
 */
export interface StandardizedSourceData {
  clickIds?: ClickIds
  utm?: UtmParams
  campaign?: CampaignIds
  metadata?: OriginMetadata
}
```

#### 5.2: Atualizar ContactOriginService
**Arquivo**: `back-end/supabase/functions/messaging/services/ContactOriginService.ts`

**Mudanças necessárias:**

1. **Método `insertContactOrigin`** - Adicionar campos críticos (opcional, trigger já sincroniza)
```typescript
private async insertContactOrigin(params: {
  contactId: string
  originId: string
  sourceData: StandardizedSourceData
}): Promise<void> {
  // Extrair campos críticos (opcional - trigger também faz isso)
  // campaign_id é padronizado e diferenciado por source_app/origin_id
  const campaignId = params.sourceData.campaign?.campaign_id || null
  const adId = params.sourceData.campaign?.ad_id || null
  const adgroupId = params.sourceData.campaign?.adgroup_id || null
  const sourceApp = params.sourceData.metadata?.source_app || null
  
  const { error } = await this.supabaseClient
    .from('contact_origins')
    .insert({
      contact_id: params.contactId,
      origin_id: params.originId,
      source_data: params.sourceData,
      // Campos críticos (trigger também sincroniza, mas melhor ser explícito)
      campaign_id: campaignId,
      ad_id: adId,
      adgroup_id: adgroupId,
      source_app: sourceApp,
      acquired_at: new Date().toISOString(),
    } as never)
  
  if (error) {
    console.error('[ContactOriginService] Error inserting contact origin:', error)
    throw new Error(`Erro ao registrar origem: ${error.message}`)
  }
}
```

2. **Método `addOriginToContact`** - Atualizar para incluir campos críticos
```typescript
private async addOriginToContact(params: {
  contactId: string
  projectId: string
  sourceData: StandardizedSourceData
}): Promise<void> {
  // ... código existente ...
  
  // Ao atualizar, garantir que campos críticos sejam atualizados
  if (existing.data && existing.data !== null) {
    const existingData = existing.data as { id: string; source_data: unknown }
    const current = (existingData.source_data as StandardizedSourceData) || {}
    const merged = this.mergeSourceData(current, params.sourceData)
    
    // Extrair campos críticos do merged
    // campaign_id é padronizado e diferenciado por source_app/origin_id
    const campaignId = merged.campaign?.campaign_id || null
    const adId = merged.campaign?.ad_id || null
    const adgroupId = merged.campaign?.adgroup_id || null
    const sourceApp = merged.metadata?.source_app || null
    
    const { error } = await this.supabaseClient
      .from('contact_origins')
      .update({
        source_data: merged,
        campaign_id: campaignId,  // Atualizar campo crítico
        ad_id: adId,              // Atualizar campo crítico
        adgroup_id: adgroupId,    // Atualizar campo crítico
        source_app: sourceApp,   // Atualizar campo crítico
        acquired_at: new Date().toISOString(),
      } as never)
      .eq('id', existingData.id)
    
    // ... resto do código ...
  }
}
```

#### 5.3: Criar Helper para Extrair Campos Críticos
**Arquivo**: `back-end/supabase/functions/messaging/utils/source-data-helpers.ts` (novo)

```typescript
/**
 * Helpers para extrair campos críticos de source_data
 * 
 * Centraliza lógica de extração para manter consistência
 */

import type { StandardizedSourceData } from '../types/contact-origin-types.ts'

export interface CriticalFields {
  campaignId: string | null
  adId: string | null
  adgroupId: string | null
  sourceApp: string | null
}

/**
 * Extrai campos críticos de source_data
 * 
 * campaign_id é padronizado e diferenciado pela source_app/origin_id.
 * Não precisa de metaCampaignId ou googleCampaignId separados.
 * 
 * @param sourceData - Dados padronizados de origem
 * @returns Campos críticos extraídos
 * 
 * @example
 * ```ts
 * const fields = extractCriticalFields({
 *   campaign: { campaign_id: '123', ad_id: '456', adgroup_id: '789' },
 *   metadata: { source_app: 'facebook' }
 * })
 * // { campaignId: '123', adId: '456', adgroupId: '789', sourceApp: 'facebook' }
 * ```
 */
export function extractCriticalFields(
  sourceData: StandardizedSourceData | null | undefined
): CriticalFields {
  if (!sourceData) {
    return {
      campaignId: null,
      adId: null,
      adgroupId: null,
      sourceApp: null,
    }
  }
  
  // Extrair campaign_id padronizado (diferenciado por source_app/origin_id)
  const campaignId = sourceData.campaign?.campaign_id || null
  
  // Extrair ad_id
  const adId = sourceData.campaign?.ad_id || null
  
  // Extrair adgroup_id (Google/Meta)
  const adgroupId = sourceData.campaign?.adgroup_id || null
  
  // Extrair source_app
  const sourceApp = sourceData.metadata?.source_app || null
  
  return {
    campaignId,
    adId,
    adgroupId,
    sourceApp,
  }
}
```

#### 5.4: Atualizar Queries de Relatórios
**Arquivos a atualizar:**
- `back-end/supabase/functions/dashboard/handlers/originPerformance.ts`
- Queries em relatórios que usam `source_data->'campaign'->>'campaign_id'`

**Exemplo de atualização:**
```typescript
// ANTES (JSONB)
const { data } = await supabaseClient
  .from('contact_origins')
  .select('*')
  .eq('source_data->campaign->>campaign_id', campaignId)

// DEPOIS (coluna normalizada)
const { data } = await supabaseClient
  .from('contact_origins')
  .select('*')
  .eq('campaign_id', campaignId)  // ✅ Mais simples e rápido
```

---

### **ETAPA 6: Testes** ⏱️ 2h

#### 6.1: Testes Unitários
**Arquivo**: `back-end/supabase/functions/messaging/tests/contact-origin-hybrid.test.ts` (novo)

```typescript
import { describe, it, expect, beforeEach } from 'https://deno.land/std@0.168.0/testing/bdd.ts'
import { extractCriticalFields } from '../utils/source-data-helpers.ts'
import type { StandardizedSourceData } from '../types/contact-origin-types.ts'

describe('Contact Origin Hybrid - Extract Critical Fields', () => {
  it('should extract campaign_id from standard structure', () => {
    const sourceData: StandardizedSourceData = {
      campaign: {
        campaign_id: 'test-campaign-123',
        ad_id: 'test-ad-456',
      },
      metadata: {
        source_app: 'facebook',
      },
    }
    
    const fields = extractCriticalFields(sourceData)
    
    expect(fields.campaignId).toBe('test-campaign-123')
    expect(fields.adId).toBe('test-ad-456')
    expect(fields.sourceApp).toBe('facebook')
  })
  
  it('should extract adgroup_id from campaign structure', () => {
    const sourceData: StandardizedSourceData = {
      campaign: {
        campaign_id: 'campaign-789',
        ad_id: 'ad-012',
        adgroup_id: 'adgroup-345',
      },
      metadata: {
        source_app: 'facebook',
      },
    }
    
    const fields = extractCriticalFields(sourceData)
    
    expect(fields.campaignId).toBe('campaign-789')
    expect(fields.adId).toBe('ad-012')
    expect(fields.adgroupId).toBe('adgroup-345')
    expect(fields.sourceApp).toBe('facebook')
  })
  
  it('should return null for all fields when sourceData is null', () => {
    const fields = extractCriticalFields(null)
    
    expect(fields.campaignId).toBeNull()
    expect(fields.adId).toBeNull()
    expect(fields.adgroupId).toBeNull()
    expect(fields.sourceApp).toBeNull()
  })
})
```

#### 6.2: Testes de Integração
- [ ] Testar inserção de novo registro via webhook
- [ ] Testar atualização de registro existente
- [ ] Testar trigger de sincronização
- [ ] Testar queries usando campos críticos

#### 6.3: Testes de Performance
- [ ] Comparar performance de queries JSONB vs colunas
- [ ] Testar agregações por campaign_id
- [ ] Testar filtros por source_app

**Query de teste de performance:**
```sql
-- Teste: Query usando coluna normalizada
EXPLAIN ANALYZE
SELECT COUNT(*) 
FROM contact_origins 
WHERE campaign_id = 'test-campaign-123';

-- Teste: Query usando JSONB (comparação)
EXPLAIN ANALYZE
SELECT COUNT(*) 
FROM contact_origins 
WHERE source_data->'campaign'->>'campaign_id' = 'test-campaign-123';
```

---

### **ETAPA 7: Validação Final** ⏱️ 1h

#### 7.1: Checklist de Validação
- [ ] Todas as migrations executadas com sucesso
- [ ] Trigger funcionando corretamente
- [ ] Dados existentes migrados
- [ ] Código TypeScript atualizado
- [ ] Testes passando
- [ ] Queries de relatórios atualizadas
- [ ] Performance melhorada

#### 7.2: Validação de Consistência
```sql
-- Verificar que trigger está funcionando
-- Inserir registro de teste
INSERT INTO contact_origins (contact_id, origin_id, source_data)
VALUES (
  (SELECT id FROM contacts LIMIT 1),
  (SELECT id FROM origins LIMIT 1),
  '{
    "campaign": {"campaign_id": "validation-test-123", "ad_id": "validation-ad-456", "adgroup_id": "validation-adgroup-789"},
    "metadata": {"source_app": "google"}
  }'::jsonb
);

-- Verificar sincronização
SELECT 
  campaign_id,
  ad_id,
  adgroup_id,
  source_app,
  source_data->'campaign'->>'campaign_id' as jsonb_campaign_id,
  source_data->'campaign'->>'ad_id' as jsonb_ad_id,
  source_data->'campaign'->>'adgroup_id' as jsonb_adgroup_id,
  source_data->'metadata'->>'source_app' as jsonb_source_app
FROM contact_origins
WHERE campaign_id = 'validation-test-123';

-- Limpar teste
DELETE FROM contact_origins WHERE campaign_id = 'validation-test-123';
```

#### 7.3: Documentação
- [ ] Atualizar `IMPLEMENTATION_CONTACT_ORIGINS.md`
- [ ] Atualizar `CHANGELOG.md`
- [ ] Documentar queries otimizadas
- [ ] Criar guia de uso dos campos críticos

---

### **ETAPA 8: Deploy e Monitoramento** ⏱️ 1h

#### 8.1: Deploy em Desenvolvimento
- [ ] Executar migrations em desenvolvimento
- [ ] Validar funcionamento
- [ ] Testar webhooks
- [ ] Verificar relatórios
- [ ] Commits incrementais (faseamento)

#### 8.2: (Opcional) Deploy em Staging
- [ ] Executar migrations em staging (se disponível)
- [ ] Validar funcionamento
- [ ] Testar webhooks
- [ ] Verificar relatórios

#### 8.3: Deploy em Produção
- [ ] (Opcional) Fazer backup completo se necessário
- [ ] Executar migrations em produção
- [ ] Monitorar logs
- [ ] Validar dados

#### 8.4: Monitoramento Pós-Deploy
- [ ] Monitorar performance de queries
- [ ] Verificar sincronização do trigger
- [ ] Validar consistência de dados
- [ ] Coletar métricas de performance

**Query de monitoramento:**
```sql
-- Verificar sincronização do trigger (últimas 24h)
SELECT 
  COUNT(*) as total_inserts,
  COUNT(CASE WHEN campaign_id IS NOT NULL THEN 1 END) as synced_campaign_id,
  COUNT(CASE WHEN ad_id IS NOT NULL THEN 1 END) as synced_ad_id,
  COUNT(CASE WHEN adgroup_id IS NOT NULL THEN 1 END) as synced_adgroup_id,
  COUNT(CASE WHEN source_app IS NOT NULL THEN 1 END) as synced_source_app,
  COUNT(CASE WHEN 
    campaign_id IS NULL AND 
    source_data->'campaign'->>'campaign_id' IS NOT NULL 
  THEN 1 END) as failed_syncs
FROM contact_origins
WHERE created_at > NOW() - INTERVAL '24 hours';
```

---

## 🔄 Plano de Rollback

### Cenário 1: Migration Falha
```sql
-- Remover colunas críticas
ALTER TABLE contact_origins DROP COLUMN IF EXISTS campaign_id;
ALTER TABLE contact_origins DROP COLUMN IF EXISTS ad_id;
ALTER TABLE contact_origins DROP COLUMN IF EXISTS adgroup_id;
ALTER TABLE contact_origins DROP COLUMN IF EXISTS source_app;

-- Remover índices
DROP INDEX IF EXISTS idx_contact_origins_campaign_id;
DROP INDEX IF EXISTS idx_contact_origins_ad_id;
DROP INDEX IF EXISTS idx_contact_origins_adgroup_id;
DROP INDEX IF EXISTS idx_contact_origins_source_app;
DROP INDEX IF EXISTS idx_contact_origins_campaign_source_app;

-- Remover trigger
DROP TRIGGER IF EXISTS trigger_sync_critical_fields ON contact_origins;
DROP FUNCTION IF EXISTS sync_contact_origin_critical_fields();
```

### Cenário 2: Trigger com Problemas
```sql
-- Desabilitar trigger temporariamente
ALTER TABLE contact_origins DISABLE TRIGGER trigger_sync_critical_fields;

-- Corrigir problema

-- Reabilitar trigger
ALTER TABLE contact_origins ENABLE TRIGGER trigger_sync_critical_fields;
```

### Cenário 3: Dados Inconsistentes
```sql
-- Re-sincronizar todos os dados
UPDATE contact_origins
SET 
  campaign_id = source_data->'campaign'->>'campaign_id',
  ad_id = source_data->'campaign'->>'ad_id',
  adgroup_id = source_data->'campaign'->>'adgroup_id',
  source_app = source_data->'metadata'->>'source_app'
WHERE source_data IS NOT NULL AND source_data != '{}'::jsonb;
```

---

## 📊 Métricas de Sucesso

### Performance
- [ ] Queries por `campaign_id` 50% mais rápidas
- [ ] Agregações por `source_app` 40% mais rápidas
- [ ] Filtros por `ad_id` 60% mais rápidas
- [ ] Filtros por `adgroup_id` 55% mais rápidas

### Consistência
- [ ] 100% dos registros novos com campos críticos sincronizados
- [ ] 0% de inconsistências entre JSONB e colunas

### Manutenibilidade
- [ ] Código mais simples (queries diretas)
- [ ] Facilidade para adicionar novos campos (JSONB)

---

## 📝 Notas Importantes

### Princípios Seguidos
- ✅ **SOLID (OCP)**: Novos campos vão para JSONB (sem ALTER TABLE)
- ✅ **KISS**: Apenas 4 colunas críticas + JSONB
- ✅ **DRY**: Trigger sincroniza automaticamente
- ✅ **Performance**: Campos críticos indexados

### Decisões de Design
1. **Campos críticos escolhidos**: `campaign_id`, `ad_id`, `adgroup_id`, `source_app`
   - Baseado em análise de queries mais frequentes
   - Campos que mais impactam performance
   - `campaign_id` é padronizado e diferenciado por `source_app`/`origin_id` (não precisa de metaCampaignId/googleCampaignId)

2. **Trigger automático**: Sincroniza em INSERT/UPDATE
   - Mantém consistência sem intervenção manual
   - Simplificado: usa apenas `campaign_id` padronizado

3. **Índices parciais**: Apenas para valores NOT NULL
   - Otimiza espaço em disco
   - Melhora performance de queries

---

## 🚀 Próximos Passos (Futuro)

### Fase 2: Otimizações Adicionais
- [ ] Criar view materializada para relatórios complexos
- [ ] Implementar cache de queries frequentes
- [ ] Adicionar mais campos críticos se necessário (baseado em uso real)

### Fase 3: Relacionamentos
- [ ] Criar tabela `ad_campaigns` (se necessário)
- [ ] Adicionar foreign keys em `campaign_id` (se aplicável)
- [ ] Implementar sincronização bidirecional com APIs de anúncios

---

## ✅ Checklist Final

### Preparação
- [x] ✅ Análise de dados existentes (backup opcional em desenvolvimento)
- [x] ✅ Documentação de dependências

### Implementação
- [x] ✅ Migration 024: Adicionar colunas críticas
- [x] ✅ Migration 025: Adicionar trigger
- [ ] Migration 026: Migrar dados existentes
- [ ] Atualizar código TypeScript
- [ ] Atualizar queries de relatórios

### Validação
- [ ] Testes unitários
- [ ] Testes de integração
- [ ] Testes de performance
- [x] ✅ Validação de consistência (trigger testado)

### Deploy
- [x] ✅ Executar migrations em desenvolvimento (024, 025)
- [x] ✅ Validar funcionamento (trigger testado)
- [ ] Commits incrementais (faseamento)
- [ ] Monitoramento pós-deploy
- [ ] (Opcional) Deploy em staging se disponível

---

**Tempo Total Estimado**: ~8-10 horas  
**Tempo Gasto**: ~1h 5min (Etapas 1-3)  
**Progresso**: 37.5% (3/8 etapas)  
**Prioridade**: Alta  
**Risco**: Médio (migrations reversíveis)

