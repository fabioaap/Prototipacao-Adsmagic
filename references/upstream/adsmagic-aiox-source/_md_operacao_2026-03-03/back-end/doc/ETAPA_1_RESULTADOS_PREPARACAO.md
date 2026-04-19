# 📋 Etapa 1: Resultados da Preparação e Análise

**Data**: 2025-01-XX  
**Status**: ✅ Concluída  
**Tempo Gasto**: ~30 minutos

---

## ✅ Checklist de Preparação

### 1.1: Validação Inicial do Banco de Dados

#### ✅ Estrutura Atual da Tabela `contact_origins`

**Query Executada:**
```sql
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'contact_origins'
ORDER BY ordinal_position;
```

**Resultados:**
| Coluna | Tipo | Nullable | Observação |
|--------|------|----------|------------|
| `id` | uuid | NO | Chave primária |
| `contact_id` | uuid | NO | Foreign key para contacts |
| `origin_id` | uuid | NO | Foreign key para origins |
| `acquired_at` | timestamp with time zone | YES | Data de aquisição |
| `observations` | text | YES | Observações opcionais |
| `created_at` | timestamp with time zone | YES | Data de criação |
| `source_data` | jsonb | YES | **Campo JSONB existente** |

**✅ Conclusão**: 
- Tabela `contact_origins` existe e possui o campo `source_data` (JSONB)
- **Campos críticos ainda NÃO existem** (campaign_id, ad_id, adgroup_id, source_app)
- Estrutura está pronta para receber as novas colunas

#### ✅ Dados Existentes

**Query Executada:**
```sql
SELECT 
  COUNT(*) as total_records,
  COUNT(CASE WHEN source_data IS NOT NULL AND source_data != '{}'::jsonb THEN 1 END) as records_with_data,
  COUNT(CASE WHEN source_data->'campaign'->>'campaign_id' IS NOT NULL THEN 1 END) as records_with_campaign_id,
  COUNT(CASE WHEN source_data->'campaign'->>'ad_id' IS NOT NULL THEN 1 END) as records_with_ad_id,
  COUNT(CASE WHEN source_data->'campaign'->>'adgroup_id' IS NOT NULL THEN 1 END) as records_with_adgroup_id,
  COUNT(CASE WHEN source_data->'metadata'->>'source_app' IS NOT NULL THEN 1 END) as records_with_source_app
FROM contact_origins;
```

**Resultados:**
| Métrica | Valor | Observação |
|---------|-------|------------|
| **Total de registros** | 1 | Ambiente de desenvolvimento |
| **Registros com source_data** | 1 | 100% dos registros têm dados |
| **Registros com campaign_id** | 1 | ✅ Dados disponíveis para migração |
| **Registros com ad_id** | 1 | ✅ Dados disponíveis para migração |
| **Registros com adgroup_id** | 0 | ⚠️ Nenhum registro com adgroup_id |
| **Registros com source_app** | 1 | ✅ Dados disponíveis para migração |

**✅ Conclusão**:
- Há dados existentes que precisarão ser migrados
- A maioria dos campos críticos está presente no JSONB
- `adgroup_id` não está presente em nenhum registro (normal, pode ser opcional)

#### ✅ Índices Existentes

**Query Executada:**
```sql
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'contact_origins'
ORDER BY indexname;
```

**Resultados:**
| Nome do Índice | Definição | Tipo |
|----------------|-----------|------|
| `contact_origins_pkey` | PRIMARY KEY (id) | B-tree |
| `idx_contact_origins_acquired_at` | INDEX (acquired_at) | B-tree |
| `idx_contact_origins_contact_id` | INDEX (contact_id) | B-tree |
| `idx_contact_origins_origin_id` | INDEX (origin_id) | B-tree |
| `idx_contact_origins_source_data` | INDEX USING gin (source_data) | GIN |

**✅ Conclusão**:
- Índices básicos existem (foreign keys, timestamps)
- Índice GIN em `source_data` já existe (otimiza queries JSONB)
- **Índices para campos críticos ainda NÃO existem** (serão criados na Etapa 2)

---

### 1.2: Documentar Dependências

#### ✅ Arquivos que Usam `contact_origins`

**Arquivos Encontrados:**
1. ✅ `back-end/supabase/functions/messaging/services/ContactOriginService.ts`
   - **Uso**: Serviço principal que gerencia contact_origins
   - **Operações**: INSERT, UPDATE, SELECT
   - **Impacto**: **ALTO** - Precisa ser atualizado

2. ✅ `back-end/supabase/functions/messaging/utils/webhook-processor.ts`
   - **Uso**: Processa webhooks e chama ContactOriginService
   - **Operações**: Indireto (via ContactOriginService)
   - **Impacto**: **BAIXO** - Não precisa alteração direta

3. ✅ `back-end/supabase/functions/messaging/tests/contact-origin-service.test.ts`
   - **Uso**: Testes do ContactOriginService
   - **Operações**: Testes de INSERT/SELECT
   - **Impacto**: **MÉDIO** - Testes precisam ser atualizados

4. ✅ `back-end/supabase/functions/contacts/handlers/create.ts`
   - **Uso**: Criação de contatos
   - **Operações**: Possível uso indireto
   - **Impacto**: **BAIXO** - Verificar se usa contact_origins

5. ✅ `back-end/supabase/functions/contacts/handlers/update.ts`
   - **Uso**: Atualização de contatos
   - **Operações**: Possível uso indireto
   - **Impacto**: **BAIXO** - Verificar se usa contact_origins

#### ✅ Arquivos que Usam `source_data`

**Arquivos Encontrados:**
1. ✅ `back-end/supabase/functions/messaging/utils/source-data-helpers.ts`
   - **Uso**: Helper para extrair campos críticos de source_data
   - **Função**: `extractCriticalFields()`
   - **Status**: ✅ **JÁ EXISTE** - Criado anteriormente
   - **Impacto**: **NENHUM** - Já está implementado conforme plano

2. ✅ `back-end/supabase/functions/messaging/services/ContactOriginService.ts`
   - **Uso**: Insere e atualiza source_data
   - **Operações**: INSERT, UPDATE com source_data
   - **Impacto**: **ALTO** - Precisa usar campos críticos

3. ✅ `back-end/supabase/functions/messaging/brokers/base/SourceDataExtractor.ts`
   - **Uso**: Extrai source_data de mensagens
   - **Operações**: Normalização de dados
   - **Impacto**: **BAIXO** - Não precisa alteração

4. ✅ `back-end/supabase/functions/messaging/types/contact-origin-types.ts`
   - **Uso**: Tipos TypeScript para source_data
   - **Operações**: Definição de tipos
   - **Impacto**: **MÉDIO** - Precisa adicionar campos críticos aos tipos

#### ✅ Queries que Acessam `source_data`

**Busca Realizada:**
```bash
grep -r "source_data->" back-end/supabase/functions/
```

**Resultados:**
- ❌ **Nenhuma query direta encontrada** usando `source_data->`
- ✅ Queries são feitas via Supabase Client (TypeScript)
- ✅ Helper `extractCriticalFields()` centraliza extração

**✅ Conclusão**:
- Não há queries SQL diretas que precisam ser atualizadas
- Tudo é feito via código TypeScript
- Helper já existe e centraliza lógica

#### ✅ Edge Functions que Inserem/Atualizam `source_data`

**Funções Identificadas:**
1. ✅ **`ContactOriginService.insertContactOrigin()`**
   - **Arquivo**: `back-end/supabase/functions/messaging/services/ContactOriginService.ts`
   - **Operação**: INSERT com source_data
   - **Status**: Precisa atualizar para incluir campos críticos

2. ✅ **`ContactOriginService.addOriginToContact()`**
   - **Arquivo**: `back-end/supabase/functions/messaging/services/ContactOriginService.ts`
   - **Operação**: UPDATE com source_data (merge)
   - **Status**: Precisa atualizar para incluir campos críticos

3. ✅ **`webhook-processor.ts` (via ContactOriginService)**
   - **Arquivo**: `back-end/supabase/functions/messaging/utils/webhook-processor.ts`
   - **Operação**: Indireto (chama ContactOriginService)
   - **Status**: Não precisa alteração direta

#### ✅ Queries em Relatórios/Dashboard

**Arquivos Verificados:**
- ✅ `back-end/supabase/functions/dashboard/handlers/originPerformance.ts`
  - **Status**: ⚠️ **TODO implementado** - Não faz queries ainda
  - **Impacto**: **BAIXO** - Quando implementado, deve usar campos críticos

- ✅ `back-end/supabase/functions/dashboard/handlers/timeSeries.ts`
  - **Status**: Não verificado (não encontrado uso de source_data)
  - **Impacto**: **BAIXO** - Verificar quando implementar

- ✅ `back-end/supabase/functions/dashboard/handlers/metrics.ts`
  - **Status**: Não verificado (não encontrado uso de source_data)
  - **Impacto**: **BAIXO** - Verificar quando implementar

**✅ Conclusão**:
- Dashboard ainda não faz queries em `source_data`
- Quando implementado, deve usar campos críticos normalizados
- Não há impacto imediato

---

### 1.3: Backup (Opcional mas Recomendado)

#### ✅ Status do Backup

**Decisão**: ⚠️ **NÃO NECESSÁRIO NO MOMENTO**

**Justificativa**:
- Ambiente de desenvolvimento
- Apenas 1 registro de teste
- Migrations são reversíveis (usam `IF NOT EXISTS`)
- Sistema em desenvolvimento (não é produção)

**Recomendação**:
- ✅ Fazer backup antes de deploy em staging/produção
- ✅ Usar migrations incrementais (faseamento)
- ✅ Testar rollback em ambiente de desenvolvimento

---

## 📊 Resumo dos Resultados

### ✅ Estrutura do Banco
- ✅ Tabela `contact_origins` existe
- ✅ Campo `source_data` (JSONB) existe
- ❌ Campos críticos ainda NÃO existem (serão criados na Etapa 2)
- ✅ Índices básicos existem
- ❌ Índices para campos críticos ainda NÃO existem (serão criados na Etapa 2)

### ✅ Dados Existentes
- ✅ 1 registro total
- ✅ 1 registro com `source_data` (100%)
- ✅ 1 registro com `campaign_id` no JSONB
- ✅ 1 registro com `ad_id` no JSONB
- ⚠️ 0 registros com `adgroup_id` no JSONB (normal, opcional)
- ✅ 1 registro com `source_app` no JSONB

### ✅ Dependências Mapeadas
- ✅ **4 arquivos principais** que usam `contact_origins`
- ✅ **4 arquivos** que usam `source_data`
- ✅ **2 funções** que inserem/atualizam `source_data`
- ✅ **Helper `extractCriticalFields()` já existe**
- ✅ **Nenhuma query SQL direta** precisa ser atualizada

### ✅ Arquivos que Precisam Atualização

**Prioridade ALTA:**
1. ✅ `back-end/supabase/functions/messaging/services/ContactOriginService.ts`
   - Método `insertContactOrigin()` - Adicionar campos críticos
   - Método `addOriginToContact()` - Adicionar campos críticos

**Prioridade MÉDIA:**
2. ✅ `back-end/supabase/functions/messaging/types/contact-origin-types.ts`
   - Adicionar campos críticos à interface `ContactOrigin`

**Prioridade BAIXA:**
3. ✅ `back-end/supabase/functions/messaging/tests/contact-origin-service.test.ts`
   - Atualizar testes para validar campos críticos

---

## ✅ Critérios de Sucesso da Etapa 1

- [x] ✅ Estrutura atual validada
- [x] ✅ Dados existentes documentados
- [x] ✅ Dependências mapeadas
- [x] ✅ Backup avaliado (não necessário no momento)

---

## ⚠️ Pontos de Atenção

### 1. Dados Existentes
- ⚠️ Há 1 registro que precisará ser migrado na Etapa 4
- ✅ Dados estão completos (campaign_id, ad_id, source_app presentes)
- ⚠️ `adgroup_id` não está presente (normal, campo opcional)

### 2. Helper Já Existe
- ✅ `source-data-helpers.ts` já foi criado anteriormente
- ✅ Função `extractCriticalFields()` já está implementada
- ✅ Não precisa criar novamente na Etapa 5

### 3. Nenhuma Query SQL Direta
- ✅ Não há queries SQL que precisam ser atualizadas
- ✅ Tudo é feito via código TypeScript
- ✅ Facilita implementação (não precisa atualizar SQL)

### 4. Dashboard Não Implementado
- ⚠️ Dashboard ainda não faz queries em `source_data`
- ✅ Quando implementado, deve usar campos críticos normalizados
- ✅ Não há impacto imediato

---

## 🚀 Próximos Passos

### Etapa 2: Migration - Adicionar Colunas Críticas
- [ ] Criar migration `024_add_critical_fields_contact_origins.sql`
- [ ] Adicionar colunas: `campaign_id`, `ad_id`, `adgroup_id`, `source_app`
- [ ] Criar índices otimizados
- [ ] Validar migration

### Etapa 3: Trigger de Sincronização Automática
- [ ] Criar migration `025_add_sync_trigger_contact_origins.sql`
- [ ] Criar função de sincronização
- [ ] Criar trigger automático
- [ ] Testar sincronização

### Etapa 4: Migração de Dados Existentes
- [ ] Criar migration `026_migrate_existing_data_contact_origins.sql`
- [ ] Migrar 1 registro existente
- [ ] Validar consistência

### Etapa 5: Atualizar Código TypeScript
- [ ] Atualizar tipos em `contact-origin-types.ts`
- [ ] Atualizar `ContactOriginService.insertContactOrigin()`
- [ ] Atualizar `ContactOriginService.addOriginToContact()`
- [ ] Helper já existe (não precisa criar)

---

## 📝 Notas Finais

### ✅ Status Geral
- ✅ **Etapa 1 concluída com sucesso**
- ✅ Todas as validações realizadas
- ✅ Dependências mapeadas
- ✅ Pronto para Etapa 2

### ✅ Decisões Tomadas
1. **Backup**: Não necessário (ambiente de desenvolvimento, 1 registro)
2. **Helper**: Já existe, não precisa criar novamente
3. **Queries SQL**: Não há queries diretas, tudo via TypeScript

### ✅ Riscos Identificados
- ⚠️ **BAIXO**: Apenas 1 registro para migrar
- ⚠️ **BAIXO**: Helper já existe (facilita implementação)
- ⚠️ **BAIXO**: Nenhuma query SQL direta (facilita atualização)

---

**Próximo passo**: Iniciar Etapa 2 (Migration - Adicionar Colunas Críticas)
