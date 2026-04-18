# TODO Backend - Suporte ao Frontend

> **Status**: Análise baseada na integração atual via Supabase MCP  
> **Objetivo**: Identificar o que está faltando no backend para suportar completamente o frontend  
> **Data**: 2026-01-16

---

## 📊 Estado Atual da Integração

### Tabelas Existentes no Supabase (18 tabelas)
| Tabela | RLS | Status |
|--------|-----|--------|
| user_profiles | ✅ | Completa |
| companies | ✅ | Completa |
| company_users | ✅ | Completa |
| company_settings | ✅ | Completa |
| onboarding_progress | ✅ | Completa |
| projects | ✅ | Completa |
| project_users | ✅ | Completa |
| integrations | ✅ | Completa |
| integration_accounts | ✅ | Completa |
| origins | ✅ | Completa |
| stages | ✅ | Completa |
| contacts | ✅ | Completa |
| contact_origins | ✅ | Completa |
| contact_stage_history | ✅ | Completa |
| messaging_brokers | ✅ | Completa |
| messaging_accounts | ✅ | Completa |
| messaging_webhooks | ✅ | Completa |
| sales | ✅ | Completa |

### Edge Functions Ativas (8 funções)
| Function | Status | Endpoints |
|----------|--------|-----------|
| projects | ✅ Ativa | CRUD completo |
| companies | ✅ Ativa | CRUD completo |
| contacts | ✅ Ativa | CRUD completo |
| sales | ✅ Ativa | CRUD completo |
| integrations | ✅ Ativa | OAuth, accounts, pixels, sync |
| dashboard | ✅ Ativa | Métricas básicas (parcial) |
| messaging | ✅ Ativa | Webhook, send, status, sync |
| messaging-webhooks | ✅ Ativa | Webhooks externos |

---

## 🔴 Gaps Críticos (Bloqueadores de Build)

### 1. Tipos do Supabase Desatualizados
**Problema**: O arquivo `database.types.ts` não inclui tabelas `origins` e `stages`, causando erros de TypeScript no frontend.

**Arquivos afetados no frontend**:
- `src/services/api/origins.ts` (linhas 78, 98, 119, 131, 162, 178, 208, 218, 233)
- `src/services/api/stages.ts` (linhas 82, 101, 122, 134, 167, 173, 176, 177, 193, 225, 235, 250)

**Solução**:
- [ ] Regenerar tipos do Supabase com `generate_typescript_types` via MCP
- [ ] Ou criar tipos manuais alinhados com o schema real

---

### 2. Edge Functions Faltantes

#### 2.1 Events (Conversão)
**Frontend espera**: Tipo `Event` com campos para rastreamento de conversões (Meta, Google, TikTok)
**Backend atual**: ❌ Não existe tabela `events` ou `conversion_events`
**Backend atual**: ❌ Não existe Edge Function `events`

**TODOs**:
- [ ] Criar tabela `conversion_events` (migration)
- [ ] Implementar Edge Function `events`
- [ ] CRUD para eventos de conversão
- [ ] Integração com Meta Conversions API
- [ ] Integração com Google Ads Conversions
- [ ] Integração com TikTok Events API

#### 2.2 Trackable Links ✅ (Implementado em 2026-01-17 - Aguardando Deploy)
**Frontend espera**: Tipo `Link` com campos para links rastreáveis, UTMs, shortcodes
**Backend atual**: ✅ Migrations e Edge Functions criadas

**Implementado**:
- [x] Criar tabela `trackable_links` (migration 030)
  - Campos: `whatsapp_number`, `whatsapp_message_template`, `link_type`
  - Suporte a links WhatsApp, landing pages e diretos
- [x] Criar tabela `link_accesses` (migration 031)
  - Registra cada acesso individual com tracking completo
  - Campos: `access_uuid`, `whatsapp_protocol`, `user_info`, `user_parameters`
  - Click IDs (fbclid, gclid, msclkid, gbraid, wbraid, yclid, ttclid)
  - Geo data (IP, cidade, país, estado)
- [x] RLS Policies (migrations 032, 033)
  - trackable_links: SELECT/INSERT/UPDATE/DELETE por projeto
  - link_accesses: SELECT por projeto, INSERT público para tracking
- [x] Triggers para contadores automáticos (migration 034)
  - `clicks_count`: incrementa ao inserir em `link_accesses`
  - `contacts_count`: incrementa ao criar contato com `origin_id` do link
  - `sales_count` e `revenue`: incrementa ao criar sale com status 'completed'
  - Atribuição de `contact_id` em `link_accesses` quando contato é criado
- [x] Edge Function `trackable-links`
  - CRUD completo para links rastreáveis
  - Sistema de slugs únicos
  - Sistema de short codes únicos
  - Endpoints públicos: `by-slug/:slug`, `by-short/:code`
  - `POST /:id/generate-whatsapp` - Gera protocolo único para tracking
  - `POST /:id/register-access` - Registra acesso
  - `GET /:id/stats` - Estatísticas detalhadas
  - `POST /:id/generate-short` - Gerar short code
- [x] Edge Function `redirect` (pública)
  - Captura UTMs, click IDs, geo data
  - Geração de link WhatsApp quando necessário
  - Registro de acesso automático
  - Cookie de tracking (access_uuid)

**Aguardando**:
- [ ] Aplicar migrations via MCP
- [ ] Deploy Edge Functions via MCP

#### 2.3 Tags
**Frontend espera**: Tipo `Tag` para categorização de contatos
**Backend atual**: ❌ Não existe tabela `tags` ou `contact_tags`
**Backend atual**: ❌ Não existe Edge Function `tags`

**TODOs**:
- [ ] Criar tabela `tags` (migration)
- [ ] Criar tabela `contact_tags` (migration)
- [ ] Implementar Edge Function `tags`
- [ ] CRUD para tags
- [ ] Associação de tags a contatos

---

### 3. Endpoints Faltantes em Edge Functions Existentes

#### 3.1 Origins (Settings)
**Backend atual**: Tabela `origins` existe, mas sem Edge Function dedicada
**Frontend espera**: CRUD completo para origens

**TODOs**:
- [ ] Criar Edge Function `origins` ou adicionar handlers em `settings`
- [ ] GET `/origins` - Listar origens por projeto
- [ ] GET `/origins/:id` - Obter origem específica
- [ ] POST `/origins` - Criar origem customizada
- [ ] PATCH `/origins/:id` - Atualizar origem
- [ ] DELETE `/origins/:id` - Deletar origem customizada

#### 3.2 Stages (Settings)
**Backend atual**: Tabela `stages` existe, mas sem Edge Function dedicada
**Frontend espera**: CRUD completo para estágios

**TODOs**:
- [ ] Criar Edge Function `stages` ou adicionar handlers em `settings`
- [ ] GET `/stages` - Listar estágios por projeto (ordenados)
- [ ] GET `/stages/:id` - Obter estágio específico
- [ ] POST `/stages` - Criar estágio
- [ ] PATCH `/stages/:id` - Atualizar estágio
- [ ] DELETE `/stages/:id` - Deletar estágio
- [ ] POST `/stages/reorder` - Reordenar estágios (display_order)

#### 3.3 Dashboard Analytics Completo
**Backend atual**: Edge Function `dashboard` com 3 endpoints básicos (20%)
**Frontend espera**: Dashboard V2 completo com North Star KPIs

**TODOs**:
- [ ] GET `/dashboard/summary` - North Star KPIs (14 métricas)
- [ ] GET `/dashboard/funnel-stats` - Estatísticas de funil
- [ ] GET `/dashboard/pipeline-stats` - Estatísticas de pipeline
- [ ] GET `/dashboard/origin-breakdown` - Breakdown por origem
- [ ] GET `/dashboard/time-series` - Séries temporais (melhorar)
- [ ] GET `/dashboard/drill-down` - Entidades para drill-down
- [ ] Implementar cache para métricas
- [ ] Criar materialized views para performance

---

## 🟡 Melhorias Necessárias

### 4. Campos Faltantes em Tabelas

#### 4.1 Projects - Métricas
**Frontend usa** (em `ProjectsTable.vue`):
- `investment`
- `revenue`
- `contacts_count`
- `sales_count`
- `conversion_rate`
- `average_ticket`

**Backend atual**: Estes campos não existem na tabela `projects`

**Opções**:
- [ ] **Opção A**: Adicionar campos calculados à tabela (menos recomendado)
- [ ] **Opção B**: Criar view/RPC que retorna projetos com métricas calculadas (recomendado)
- [ ] **Opção C**: Calcular no frontend a partir de agregações (atual, mas gera erros de tipo)

#### 4.2 Stages - Campos Adicionais
**Frontend usa** (em `Stage` type):
- `description` - não existe na tabela
- `contactsCount` - precisa ser calculado
- `order` (frontend) vs `display_order` (backend) - normalizar

**TODOs**:
- [ ] Verificar se `description` é necessário ou remover do tipo frontend
- [ ] Criar RPC ou view que retorna stages com `contacts_count`

---

### 5. Sistema de Activities/Events Log
**Frontend espera**: `ContactActivity` para timeline de contatos
**Backend atual**: Parcialmente implementado via `contact_stage_history`

**TODOs**:
- [ ] Criar tabela `contact_activities` ou expandir `contact_stage_history`
- [ ] Trigger para registrar atividades automaticamente
- [ ] Endpoint para listar atividades de um contato

---

## 🟢 Já Implementado e Funcionando

### Módulos Completos
- ✅ **Auth**: Via Supabase Auth nativo
- ✅ **Onboarding**: Tabela + lógica no frontend
- ✅ **Companies**: Edge Function completa
- ✅ **Projects**: Edge Function completa
- ✅ **Contacts**: Edge Function completa
- ✅ **Sales**: Edge Function completa
- ✅ **Integrations (OAuth Meta)**: Edge Function com 12+ endpoints
- ✅ **Messaging/WhatsApp**: 3 brokers implementados, webhooks funcionando

---

## 📋 Priorização de Implementação

### Fase 1: Desbloqueio de Build (CRÍTICO) ✅
1. ✅ **Regenerar tipos do Supabase** - Incluir `origins` e `stages`
2. ✅ **Edge Function origins** - CRUD básico
3. ✅ **Edge Function stages** - CRUD básico

### Fase 2: Funcionalidades Core 🟡
4. 🟡 **Tabelas trackable_links + link_accesses** + Edge Function `trackable-links`
   - ✅ Migrations 030-034 criadas
   - ✅ Edge Functions `trackable-links` e `redirect` criadas
   - ⏳ Aguardando deploy via MCP
5. **Tabela conversion_events** + Edge Function
6. **Dashboard V2 endpoints** - Completar métricas

### Fase 3: Melhorias
7. **Tabela tags** + Edge Function
8. **Contact activities** - Timeline completa
9. **Métricas de projetos** - View ou RPC

### Fase 4: Analytics
10. **Materialized views** - Performance
11. **Cache de métricas** - Redis ou Supabase cache
12. **Workers de processamento** - Completar

---

## 🔄 Sincronização Frontend ↔ Backend

### Contratos a Verificar
| Entidade | Frontend Type | Backend Table | Status |
|----------|---------------|---------------|--------|
| Contact | ✅ Alinhado | contacts | ✅ |
| Sale | ✅ Alinhado | sales | ✅ |
| Origin | ⚠️ Divergente | origins | Tipos desatualizados |
| Stage | ⚠️ Divergente | stages | Tipos desatualizados |
| Project | ⚠️ Divergente | projects | Campos de métricas |
| Event | ❌ Sem backend | - | Tabela não existe |
| Link | 🟡 Aguardando deploy | trackable_links, link_accesses | Migrations criadas |
| Tag | ❌ Sem backend | - | Tabela não existe |

---

## 📚 Referências

- **Frontend Types**: `front-end/src/types/models.ts`
- **Backend Schema**: `back-end/supabase/types/database.types.ts`
- **Migrations**: `back-end/supabase/migrations/`
- **Edge Functions**: `back-end/supabase/functions/`
- **Backend Progress**: `back-end/BACKEND_PROGRESS.md`
