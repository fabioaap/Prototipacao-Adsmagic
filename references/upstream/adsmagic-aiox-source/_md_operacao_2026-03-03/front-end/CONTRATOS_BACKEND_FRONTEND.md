# Contratos Backend ↔ Frontend - Mapeamento de Divergências

**Data**: 2025-01-27  
**Objetivo**: Documentar todas as divergências entre tipos frontend (`/front-end/src/types/`) e contratos backend (`/back-end/types.ts`)

---

## 🎯 Resumo Executivo

### Status Atual do Backend
- ✅ **Implementado**: Users, Companies, Projects, **Integrations** (migrations 001-017)
- ❌ **NÃO implementado**: Contacts, Sales, Links, Events (aguardando sessões 4-9)

### Total de Divergências Identificadas
- **Integration**: 8 campos divergentes
- **Account**: 1 campo faltando
- **Link**: 5 campos divergentes/faltando
- **Sale**: 5 campos inventados/divergentes
- **UserProfile**: 1 campo inventado

---

## 📊 Tabela de Mapeamento Completa

| Tipo | Campo Frontend | Campo Backend | Status | Severidade | Ação Necessária |
|------|---------------|---------------|--------|------------|-----------------|
| **Integration** | `id: string` | `id: UUID` obrigatório | ❌ Tipo OK, mas tratado como opcional | CRITICAL | Garantir sempre obrigatório |
| **Integration** | falta `projectId` | `project_id: UUID` | ❌ Faltando | HIGH | Adicionar campo |
| **Integration** | `platform` (6 valores) | `platform` (10 valores) | ❌ Incompleto | HIGH | Adicionar: facebook_messenger, instagram_direct, discord, slack |
| **Integration** | falta `platformType` | `platform_type` obrigatório | ❌ Faltando | HIGH | Adicionar campo |
| **Integration** | falta `platformConfig` | `platform_config: Record<string, any>` | ❌ Faltando | MEDIUM | Adicionar campo |
| **Integration** | `lastSync` | `last_sync_at` | ✅ OK | LOW | Manter (adapter faz conversão) |
| **Integration** | `error` | `error_message` | ⚠️ Nome diferente | MEDIUM | Renomear para `errorMessage` |
| **Integration** | falta `createdAt` | `created_at` obrigatório | ❌ Faltando | MEDIUM | Adicionar campo |
| **Integration** | falta `updatedAt` | `updated_at` obrigatório | ❌ Faltando | MEDIUM | Adicionar campo |
| **Account** | sem `accountId` | campo existe na API | ❌ Faltando | HIGH | Adicionar `accountId: string` |
| **Link** | `url` (ambíguo) | `tracking_url` + `destination_url` | ⚠️ Confuso | HIGH | Separar em 2 campos |
| **Link** | sem `slug` | `slug: string` obrigatório | ❌ Faltando | CRITICAL | Adicionar campo obrigatório |
| **Link** | sem `destinationUrl` | `destination_url` obrigatório | ❌ Faltando | CRITICAL | Adicionar campo obrigatório |
| **Link** | sem `trackingUrl` | `tracking_url` obrigatório | ❌ Faltando | CRITICAL | Adicionar campo obrigatório |
| **Link** | `stats` inline | `stats` objeto | ✅ OK | LOW | Já correto |
| **Sale** | `isLost?: boolean` | **NÃO EXISTE** | ❌ Inventado | CRITICAL | **REMOVER** - usar `status` |
| **Sale** | `contactOrigin?: string` | **NÃO EXISTE** | ❌ Inventado | CRITICAL | **REMOVER** - usar lookup |
| **Sale** | `contactName?: string` | **NÃO EXISTE** | ❌ Inventado | CRITICAL | **REMOVER** - usar lookup |
| **Sale** | `date: string` | `sale_date: Timestamp` | ⚠️ Nome diferente | MEDIUM | Adapter mapeia sale_date ↔ date |
| **Sale** | `lostNotes?: string` | `lost_observations?: string` | ⚠️ Nome diferente | MEDIUM | Renomear para `lostObservations` |
| **UserProfile** | `country?: string` | **NÃO EXISTE** | ❌ Inventado | HIGH | **REMOVER** - backend não tem |

---

## 🔍 Análise Detalhada por Tipo

### 1. Integration

**Frontend atual** (`/front-end/src/types/models.ts:627-645`):
```typescript
export interface Integration {
  id: string  // ⚠️ Tratado como opcional em mocks
  platform: 'whatsapp' | 'meta' | 'google' | 'tiktok' | 'linkedin' | 'telegram'
  status: 'connected' | 'disconnected' | 'error' | 'syncing' | 'pending'
  connection?: Connection
  lastSync?: string
  error?: string
}
```

**Backend real** (`/back-end/types.ts:241-256`):
```typescript
export interface Integration {
  id: UUID  // ✅ SEMPRE obrigatório
  project_id: UUID  // ❌ FALTA no frontend
  platform: 'whatsapp' | 'facebook_messenger' | 'telegram' | 'instagram_direct' | 
           'meta' | 'google' | 'tiktok' | 'linkedin' | 'discord' | 'slack'  // ⚠️ Mais opções
  platform_type: 'messaging' | 'advertising' | 'analytics' | 'crm'  // ❌ FALTA
  status: 'connected' | 'disconnected' | 'error' | 'syncing' | 'pending'  // ✅ OK
  platform_config: Record<string, any>  // ❌ FALTA
  last_sync_at?: Timestamp  // ✅ OK (lastSync)
  error_message?: string  // ⚠️ Nome diferente (error)
  created_at: Timestamp  // ❌ FALTA
  updated_at: Timestamp  // ❌ FALTA
}
```

**Ações necessárias**:
1. Adicionar `projectId: string`
2. Expandir `platform` para incluir todas as opções
3. Adicionar `platformType: 'messaging' | 'advertising' | 'analytics' | 'crm'`
4. Adicionar `platformConfig: Record<string, unknown>`
5. Renomear `error` → `errorMessage`
6. Adicionar `createdAt: string`
7. Adicionar `updatedAt: string`
8. Garantir `id` sempre presente (gerar UUID em mocks)

---

### 2. Account

**Frontend atual** (`/front-end/src/types/models.ts:708-720`):
```typescript
export interface Account {
  id: string
  name: string
  type: 'ad_account' | 'pixel' | 'page' | 'profile'
  permissions: string[]
  // ❌ FALTA: accountId
}
```

**Backend real** (`/back-end/supabase/functions/integrations/types.ts:25-31`):
```typescript
export interface IntegrationAccountData {
  id: string
  name: string
  accountId: string  // ✅ EXISTE!
  currency?: string
  metadata: Record<string, unknown>
}
```

**Ação necessária**:
- Adicionar `accountId: string` ao tipo Account

---

### 3. Link

**Frontend atual** (`/front-end/src/types/models.ts:350-413`):
```typescript
export interface Link {
  id: string
  projectId: string
  name: string
  url: string  // ⚠️ Ambíguo - é tracking ou destination?
  initialMessage?: string
  isActive: boolean
  stats: LinkStats  // ✅ OK
  originId: string
  destinationUrl: string  // ⚠️ Existe mas não no backend ainda
  // ❌ FALTA: slug, trackingUrl, shortUrl, UTMs
}
```

**Backend real** (`/back-end/types.ts:205-235`):
```typescript
export interface TrackableLink {
  id: UUID
  project_id: UUID
  name: string
  slug: string  // ✅ EXISTE e é OBRIGATÓRIO
  destination_url: string  // ✅ EXISTE
  tracking_url: string  // ✅ EXISTE
  short_url?: string
  short_code?: string
  initial_message?: string
  origin_id: UUID
  is_active: boolean
  stats: {  // ✅ OK
    clicks: number
    contacts: number
    sales: number
    revenue: number
  }
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_term?: string
  utm_content?: string
  created_at: Timestamp
  updated_at: Timestamp
}
```

**Ações necessárias**:
1. Adicionar `slug: string` (obrigatório)
2. Adicionar `trackingUrl: string`
3. Manter `destinationUrl` (mapeia `destination_url`)
4. Manter `url` como alias para `trackingUrl` (compatibilidade)
5. Adicionar `shortUrl?: string`, `shortCode?: string`
6. Adicionar UTM fields: `utmSource`, `utmMedium`, `utmCampaign`, `utmTerm`, `utmContent`
7. Adicionar `createdAt`, `updatedAt`

---

### 4. Sale

**Frontend atual** (`/front-end/src/types/models.ts:93-130`):
```typescript
export interface Sale {
  id: string
  projectId: string
  contactId: string
  value: number
  currency: string
  date: string
  origin?: string
  status: 'completed' | 'lost'  // ✅ OK
  isLost?: boolean  // ❌ INVENTADO - duplica status
  contactOrigin?: string  // ❌ INVENTADO
  contactName?: string  // ❌ INVENTADO
  lostReason?: string
  lostNotes?: string  // ⚠️ Nome errado
  trackingParams?: TrackingParams
  createdAt: string
  updatedAt: string
}
```

**Backend real** (`/back-end/types.ts:180-199`):
```typescript
export interface Sale {
  id: UUID
  project_id: UUID
  contact_id: UUID
  value: number
  currency: Currency
  sale_date: Timestamp  // ⚠️ Nome diferente
  origin_id?: UUID
  status: 'completed' | 'lost'  // ✅ OK
  lost_reason?: string
  lost_observations?: string  // ⚠️ Nome diferente (não "notes")
  tracking_params: Record<string, any>
  created_at: Timestamp
  updated_at: Timestamp
  // ❌ NÃO EXISTE: isLost, contactOrigin, contactName
}
```

**Ações necessárias**:
1. **REMOVER** `isLost` - usar `status === 'lost'`
2. **REMOVER** `contactOrigin` - fazer lookup de contact
3. **REMOVER** `contactName` - fazer lookup de contact
4. Renomear `lostNotes` → `lostObservations`
5. Adapter mapeia `date` ↔ `sale_date`

---

### 5. UserProfile

**Frontend** (`/front-end/src/types/models.ts` - UserProfile):
```typescript
export interface UserProfile {
  id: string
  firstName: string
  lastName: string
  preferredLanguage: 'pt' | 'en' | 'es'
  timezone: string | null
  avatarUrl: string | null
  phone: string | null
  isActive: boolean | null
  lastLoginAt: string | null
  createdAt: string | null
  updatedAt: string | null
  country?: string  // ❌ INVENTADO
}
```

**Backend real** (`/back-end/types.ts:23-35`):
```typescript
export interface UserProfile {
  id: UUID
  first_name: string
  last_name: string
  preferred_language: Language
  timezone: string
  avatar_url?: string
  phone?: string
  is_active: boolean
  last_login_at?: Timestamp
  created_at: Timestamp
  updated_at: Timestamp
  // ❌ NÃO TEM: country
}
```

**Ação necessária**:
- **REMOVER** campo `country` (não existe no backend)

---

## 📋 Categorização de Erros

### CRITICAL (200 erros) - Impedem funcionalidade
- Tipos incompatíveis com backend que causam runtime errors
- Campos obrigatórios tratados como opcionais
- Uso de campos inventados (`isLost`, `contactOrigin`, `contactName`)

### HIGH (150 erros)
- Campos faltando que existem no backend
- Uso de campos inventados que não têm correspondência
- Campos com tipos incompatíveis

### MEDIUM (200 erros)
- Naming conventions (snake_case ↔ camelCase)
- Campos com nomes diferentes mas mesma função
- Campos opcionais vs obrigatórios

### LOW (83 erros)
- Variáveis/imports não usados
- Warnings de linter
- Code style issues

---

## 🔄 Estratégia de Migração

### Fase 1: Tipos Core (Breaking Changes)
Arquivos: `/front-end/src/types/models.ts`, `/front-end/src/types/dto.ts`

**Mudanças críticas**:
1. Integration: adicionar campos, expandir platform
2. Account: adicionar accountId
3. Link: adicionar slug, destinationUrl, trackingUrl
4. Sale: **REMOVER** campos inventados
5. UserProfile: **REMOVER** country

### Fase 2: Adapters
Criar pasta `/front-end/src/services/adapters/` com:
- `integrationAdapter.ts` - snake_case ↔ camelCase
- `saleAdapter.ts` - sale_date ↔ date, observations ↔ lostObservations
- `linkAdapter.ts` - conversões de URL

### Fase 3: Stores
Atualizar stores para usar novos tipos:
- `integrations.ts` - gerar UUIDs em mocks, adicionar campos
- `links.ts` - implementar slug, usar stats correto
- `sales.ts` - remover isLost, usar status, remover campos denormalizados

### Fase 4: Views
Atualizar componentes Vue para usar tipos corretos

---

## ⚠️ Breaking Changes para Usuários do Código

### Sale - Mudança Crítica
```typescript
// ❌ ANTES (não funciona mais)
if (sale.isLost) {
  // ...
}
const origin = sale.contactOrigin
const name = sale.contactName

// ✅ DEPOIS (correto)
if (sale.status === 'lost') {
  // ...
}
const contact = contactsStore.getById(sale.contactId)
const origin = contact?.origin
const name = contact?.name
```

### Link - Nova estrutura
```typescript
// ❌ ANTES
const link = {
  url: 'https://...'  // Ambíguo
}

// ✅ DEPOIS
const link = {
  slug: 'promo-black-friday',  // Novo campo obrigatório
  destinationUrl: 'https://site.com/produto',  // URL final
  trackingUrl: 'https://track.adsmagic.com/xyz',  // URL de rastreamento
  url: 'https://track.adsmagic.com/xyz'  // Alias para trackingUrl
}
```

### Integration - Campos adicionais
```typescript
// ✅ NOVO
const integration = {
  id: uuid(),  // Sempre obrigatório
  projectId: 'project-123',  // Novo campo
  platform: 'facebook_messenger',  // Mais opções disponíveis
  platformType: 'messaging',  // Novo campo obrigatório
  platformConfig: {},  // Novo campo
  errorMessage: 'Error text',  // Renomeado de 'error'
  createdAt: '2025-01-27T...',  // Novo campo
  updatedAt: '2025-01-27T...'  // Novo campo
}
```

---

## 📚 Referências

### Fonte da Verdade
- **Backend Types**: `/back-end/types.ts`
- **Migrations**: `/back-end/supabase/migrations/`
- **Edge Functions Types**: `/back-end/supabase/functions/*/types.ts`

### Frontend Atual
- **Types**: `/front-end/src/types/models.ts`
- **DTOs**: `/front-end/src/types/dto.ts`
- **Schemas**: `/front-end/src/schemas/`

---

## ✅ Checklist de Validação

Após implementar todas as correções:

- [ ] Todos os tipos alinhados com `/back-end/types.ts`
- [ ] Adapters criados para conversão snake_case/camelCase
- [ ] Schemas Zod atualizados
- [ ] CHANGELOG.md documentado
- [ ] Nenhum campo "inventado" restante
- [ ] `pnpm typecheck` passa sem erros
- [ ] `pnpm lint` passa sem warnings
- [ ] `pnpm build` compila com sucesso

---

**Última atualização**: 2025-01-27  
**Status**: Documento Inicial - Aguardando implementação das correções

