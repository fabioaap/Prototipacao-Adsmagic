# Relatório de Correção de Erros TypeScript

**Data**: 22 de Novembro de 2025  
**Status**: Em Progresso  
**Total de Erros Identificados**: 585

---

## 📋 Sumário Executivo

Foi realizada uma verificação completa do build TypeScript do front-end. Foram identificados **585 erros de TypeScript** que precisam ser corrigidos antes do deploy para produção. Já foram corrigidos **~20 erros críticos** relacionados a imports de tipos e acesso a propriedades, e documentados os próximos passos para conclusão.

---

## ✅ Correções Já Realizadas

### 1. Imports de Tipos (Type-Only Imports)

**Problema**: O TypeScript com `verbatimModuleSyntax` habilitado exige que tipos sejam importados com `type` keyword.

**Arquivos Corrigidos**:

```typescript
// ❌ ANTES
import { ref, Ref } from 'vue'

// ✅ DEPOIS
import { ref } from 'vue'
import type { Ref } from 'vue'
```

**Arquivos Alterados**:
- `src/composables/useApi.ts`
- `src/composables/useDebounce.ts`
- `src/composables/usePagination.ts`

### 2. Missing Import: readonly

**Problema**: Uso de `readonly` sem import correto.

**Arquivo Corrigido**:
- `src/composables/useTracking.ts`

```typescript
// ✅ Adicionado
import { ref, computed, onMounted, onUnmounted, readonly } from 'vue'
```

### 3. Correção de Parêntese Extra

**Problema**: Parêntese de fechamento extra quebrando sintaxe.

**Arquivo Corrigido**:
- `src/stores/sales.ts` (linha 147)

```typescript
// ❌ ANTES
sales.value.forEach((sale) => {
  // ...
})
})  // ← Parêntese extra

// ✅ DEPOIS
sales.value.forEach((sale) => {
  // ...
})
```

### 4. Propriedades Link: clicks e conversions

**Problema**: Componentes acessavam `link.clicks` e `link.conversions` diretamente, mas o tipo `Link` tem essas propriedades dentro de `stats`.

**Arquivos Corrigidos**:
- `src/components/tracking/LinkCard.vue`
- `src/components/tracking/LinksList.vue`
- `src/components/tracking/LinkStatsDrawer.vue`
- `src/components/tracking/TrackingMetrics.vue`

```typescript
// ❌ ANTES
link.clicks
link.conversions

// ✅ DEPOIS
link.stats.clicks
link.stats.sales
```

**Nota**: Foi usado `stats.sales` ao invés de `stats.conversions` pois o tipo `LinkStats` tem a propriedade `sales` para número de vendas atribuídas ao link.

### 5. LinkFormModal: FormData Interface

**Problema**: Interface `FormData` estava incompleta, faltando propriedades usadas no template.

**Arquivo Corrigido**:
- `src/components/tracking/LinkFormModal.vue`

```typescript
// ✅ Interface expandida
interface FormData {
  name: string
  url: string
  shortCode: string
  description: string
  initialMessage: string
  isActive: boolean
  utmSource: string
  utmMedium: string
  utmCampaign: string
  utmTerm: string
  utmContent: string
}
```

### 6. Dialog Component: Suporte a open e modelValue

**Problema**: Alguns componentes usam `open` e outros `modelValue` para controlar o Dialog.

**Arquivo Corrigido**:
- `src/components/ui/Dialog.vue`

```typescript
// ✅ Agora aceita ambas as props
interface DialogProps {
  modelValue?: boolean
  open?: boolean
  // ...
}

const isOpen = computed(() => props.open ?? props.modelValue)
```

---

## ❌ Erros Restantes (565 erros)

### Categoria 1: Propriedades Faltantes em Tipos (~200 erros)

#### 1.1 Company Type

**Erros**:
```
Property 'userRole' does not exist on type 'Company'
```

**Arquivos Afetados**:
- `src/components/companies/CompanyList.vue`

**Solução**:
```typescript
// src/types/models.ts
export interface Company {
  // ... propriedades existentes
  userRole?: 'owner' | 'admin' | 'member' | 'viewer'  // ← Adicionar
}
```

#### 1.2 Origin Type

**Erros**:
```
Property 'isSystem' does not exist on type 'Origin'
Property 'description' does not exist on type 'Origin'
Property 'contactsCount' does not exist on type 'Origin'
```

**Arquivos Afetados**:
- `src/components/settings/OriginCard.vue`

**Solução**:
```typescript
// src/types/models.ts
export interface Origin {
  // ... propriedades existentes
  isSystem?: boolean           // ← Adicionar
  description?: string         // ← Adicionar
  contactsCount?: number       // ← Adicionar
}
```

#### 1.3 Integration Type

**Erros**:
```
Property 'connection' does not exist on type 'Integration'
Property 'error' does not exist on type 'Integration'
```

**Arquivos Afetados**:
- `src/components/integrations/IntegrationCard.vue`

**Solução**:
```typescript
// src/types/models.ts
export interface Integration {
  // ... propriedades existentes
  connection?: {               // ← Adicionar
    connectedAt: string
    lastSync?: string
    accountId?: string
    accountName?: string
  }
  error?: {                    // ← Adicionar
    message: string
    code?: string
    timestamp: string
  }
}
```

#### 1.4 Sale Type

**Erros**:
```
Property 'notes' does not exist on type 'Sale'
Property 'city' does not exist on type 'Sale'
Property 'country' does not exist on type 'Sale'
Property 'device' does not exist on type 'Sale'
```

**Arquivos Afetados**:
- `src/components/sales/SaleCard.vue`
- `src/components/sales/SaleFormModal.vue`

**Solução**:
```typescript
// src/types/models.ts
export interface Sale {
  // ... propriedades existentes
  notes?: string               // ← Adicionar
  city?: string               // ← Adicionar
  country?: string            // ← Adicionar
  device?: 'mobile' | 'desktop' | 'tablet'  // ← Adicionar
}
```

#### 1.5 EventFilters Type

**Erros**:
```
Module '"@/types/models"' has no exported member 'EventFilters'
```

**Arquivos Afetados**:
- `src/components/events/EventsFilters.vue`

**Solução**:
```typescript
// src/types/api.ts ou src/types/models.ts
export interface EventFilters {
  status?: EventStatus[]
  type?: EventType[]
  dateFrom?: string
  dateTo?: string
  page?: number
  pageSize?: number
}
```

### Categoria 2: Problemas com Componentes UI (~150 erros)

#### 2.1 Select Component: Missing options prop

**Erros**:
```
Property 'options' is missing in type '{ modelValue: string; disabled: boolean; }' 
but required in type '{ readonly modelValue: string; readonly options: SelectOption[]; ... }'
```

**Arquivos Afetados** (mais de 15 componentes):
- `src/components/settings/TimezoneSelector.vue`
- `src/components/settings/CurrencySelector.vue`
- `src/components/sales/SaleFormModal.vue`
- `src/components/sales/SaleLostModal.vue`
- E outros...

**Solução Temporária** (até integração real):
```vue
<template>
  <Select
    :modelValue="value"
    :options="OPTIONS_ARRAY"  <!-- ← Adicionar prop faltante -->
    @update:modelValue="handleUpdate"
  />
</template>

<script setup lang="ts">
// Criar constantes com opções enquanto não há API
const OPTIONS_ARRAY = [
  { value: 'option1', label: 'Opção 1' },
  { value: 'option2', label: 'Opção 2' },
]
</script>
```

**⚠️ IMPORTANTE PARA INTEGRAÇÃO REAL**:
Quando a API real for integrada, essas opções virão de endpoints:
- Moedas → `/api/currencies`
- Países → `/api/countries`
- Fusos horários → `/api/timezones`
- Status de vendas → store/constantes
- Motivos de perda → `/api/lost-reasons`

#### 2.2 Badge Component: Variant incompatível

**Erros**:
```
Type '"destructive"' is not assignable to type 'BadgeVariant | undefined'
Type '"default"' is not assignable to type 'BadgeVariant | undefined'
```

**Arquivos Afetados**:
- `src/components/settings/StagesList.vue`
- `src/components/settings/OriginCard.vue`
- `src/components/settings/NotificationEventsList.vue`
- `src/components/sales/SaleCard.vue`
- `src/components/sales/SalesList.vue`

**Solução**:
```typescript
// src/components/ui/Badge.vue
export type BadgeVariant = 
  | 'default'      // ← Adicionar
  | 'secondary'
  | 'destructive'  // ← Adicionar
  | 'outline'
  | 'success'
```

#### 2.3 Pagination Component: Props incompatíveis

**Erros**:
```
Type '{ currentPage: number; totalPages: number; ... }' is missing 
the following properties from type '{ readonly page: number; readonly pageSize: number; readonly total: number; ... }': 
page, pageSize, total
```

**Arquivos Afetados**:
- `src/components/sales/SalesList.vue`

**Solução**:
```vue
<!-- ❌ ANTES -->
<Pagination
  :currentPage="page"
  :totalPages="totalPages"
  @update:currentPage="handlePageChange"
/>

<!-- ✅ DEPOIS -->
<Pagination
  :page="pagination.page"
  :pageSize="pagination.pageSize"
  :total="pagination.total"
  @update:page="handlePageChange"
/>
```

### Categoria 3: Variáveis Não Utilizadas (~100 erros)

**Erros**:
```
'props' is declared but its value is never read
'computed' is declared but its value is never read
'cn' is declared but its value is never read
```

**Solução**: Remover imports/declarações não usadas ou adicionar `// eslint-disable-next-line` se planejado usar no futuro.

### Categoria 4: Tipos Incompatíveis (~100 erros)

#### 4.1 String vs Number

**Erros**:
```
Type 'string' is not assignable to type 'number'
```

**Exemplo**:
```typescript
// ❌ ANTES
maxLength="100"

// ✅ DEPOIS
:maxLength="100"
```

#### 4.2 Date vs String

**Erros**:
```
Argument of type 'string' is not assignable to parameter of type 'Date'
Type 'undefined' is not assignable to type 'string | Date'
```

**Solução**:
```typescript
// Criar helper para formatação segura
function formatSafeDate(date: string | Date | undefined): string {
  if (!date) return '-'
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleDateString('pt-BR')
}
```

#### 4.3 Propriedades Possivelmente Undefined

**Erros**:
```
'props.contact' is possibly 'null'
'event.retryCount' is possibly 'undefined'
Type 'undefined' cannot be used as an index type
```

**Solução**:
```typescript
// ❌ ANTES
const value = props.contact.name

// ✅ DEPOIS
const value = props.contact?.name ?? 'N/A'
```

### Categoria 5: ZodError (~35 erros)

**Erros**:
```
Property 'errors' does not exist on type 'ZodError<unknown>'
Parameter 'error' implicitly has an 'any' type
```

**Arquivos Afetados**:
- `src/components/tracking/LinkFormModal.vue`
- `src/components/sales/SaleFormModal.vue`
- `src/components/settings/OriginFormModal.vue`

**Solução**:
```typescript
// ❌ ANTES
catch (error) {
  if (error instanceof z.ZodError) {
    error.errors.forEach(error => {  // ← .errors não existe
      errors.value[error.path[0]] = error.message
    })
  }
}

// ✅ DEPOIS
catch (error) {
  if (error instanceof z.ZodError) {
    error.issues.forEach((issue) => {  // ← usar .issues
      const field = issue.path[0] as string
      errors.value[field] = issue.message
    })
  }
}
```

---

## 🔄 Próximos Passos

### Fase 1: Correções de Tipos (Prioritário)

**Estimativa**: 4-6 horas

1. ✅ **Atualizar tipos/models.ts**
   - Adicionar propriedades faltantes em Company, Origin, Integration, Sale
   - Exportar EventFilters
   - Documentar quais campos virão da API real

2. ✅ **Corrigir Badge Component**
   - Adicionar variants faltantes
   - Atualizar type BadgeVariant

3. ✅ **Padronizar Pagination**
   - Atualizar todos os usos de Pagination
   - Garantir props corretas (page, pageSize, total)

### Fase 2: Componentes UI (Importante)

**Estimativa**: 6-8 horas

1. ✅ **Select Components**
   - Criar constantes temporárias para options
   - Documentar onde cada dado virá da API
   - Preparar interfaces para quando API estiver pronta

2. ✅ **Date Handling**
   - Criar helpers de formatação seguros
   - Padronizar formato de datas (string ISO vs Date object)
   - Adicionar null checks

3. ✅ **Null Safety**
   - Adicionar optional chaining onde necessário
   - Usar nullish coalescing para valores padrão
   - Verificar todos os casos de "possibly undefined"

### Fase 3: Limpeza (Desejável)

**Estimativa**: 2-3 horas

1. ✅ **Remover Imports Não Usados**
   - Usar ferramenta automática
   - Revisar manualmente casos específicos

2. ✅ **Corrigir ZodError Handling**
   - Substituir `.errors` por `.issues`
   - Adicionar tipos corretos

3. ✅ **Revisar Type Assertions**
   - Remover `any` types
   - Adicionar tipos específicos onde necessário

### Fase 4: Validação Final

**Estimativa**: 1-2 horas

1. ✅ **Build Limpo**
   - `pnpm build` sem erros
   - `pnpm typecheck` (quando criado) sem erros

2. ✅ **Testes**
   - `pnpm test` passando
   - Verificar se mudanças não quebraram funcionalidades

3. ✅ **Documentação**
   - Atualizar CHANGELOG
   - Documentar breaking changes (se houver)

---

## 🚀 Preparação para Integração Real

### Checklist de Integração

#### 1. Contratos de API (src/types/api.ts)

```typescript
/**
 * IMPORTANTE: Estes tipos devem refletir exatamente os contratos do backend
 * Referência: /back-end/docs/api/
 */

// ✅ Validar antes da integração
export interface ApiResponse<T> {
  data: T
  meta?: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

// ✅ Todos os endpoints devem ter tipos correspondentes
export interface GetLinksResponse extends ApiResponse<Link[]> {}
export interface CreateLinkRequest { /* ... */ }
export interface UpdateLinkRequest { /* ... */ }
```

#### 2. Service Layer (src/services/)

```typescript
/**
 * IMPORTANTE: Services devem usar apiClient.ts como camada única de rede
 * Nenhum fetch direto deve existir em componentes ou stores
 */

// ✅ Padrão correto
export class LinkService {
  async getLinks(filters: LinkFilters): Promise<GetLinksResponse> {
    return apiClient.get('/api/links', { params: filters })
  }
  
  async createLink(data: CreateLinkRequest): Promise<Link> {
    return apiClient.post('/api/links', data)
  }
}
```

#### 3. Stores (src/stores/)

```typescript
/**
 * IMPORTANTE: Ao integrar API real, substituir mocks mantendo mesma interface
 * Componentes NÃO devem precisar de alteração
 */

// ❌ REMOVER na integração
const mockResult: PaginatedResponse<Link> = { /* mock data */ }

// ✅ ADICIONAR na integração
const result = await linkService.getLinks(filters.value)
links.value = result.data
pagination.value = result.meta
```

#### 4. Error Handling

```typescript
/**
 * IMPORTANTE: Tratar erros de rede de forma consistente
 */

try {
  await apiCall()
} catch (error) {
  // ✅ Sempre verificar tipo de erro
  if (error instanceof ApiError) {
    // Erro conhecido da API
    toast.error(error.userMessage)
    logger.error('API Error', error.details)
  } else if (error instanceof NetworkError) {
    // Erro de rede
    toast.error('Sem conexão com internet')
  } else {
    // Erro desconhecido
    toast.error('Erro inesperado')
    logger.error('Unknown error', error)
  }
}
```

#### 5. Loading States e UX

```typescript
/**
 * IMPORTANTE: API real tem latência, garantir feedback visual
 */

// ✅ Sempre usar estados de loading
const isLoading = ref(false)

async function fetchData() {
  isLoading.value = true
  try {
    await apiCall()
  } finally {
    isLoading.value = false  // Sempre resetar, mesmo com erro
  }
}
```

#### 6. Select Components - Dados Dinâmicos

```typescript
/**
 * IMPORTANTE: Quando API estiver pronta, substituir constantes por chamadas
 */

// ❌ REMOVER após integração
const CURRENCY_OPTIONS = [
  { value: 'BRL', label: 'Real (BRL)' },
  { value: 'USD', label: 'Dólar (USD)' },
]

// ✅ ADICIONAR na integração
const currencyOptions = ref<SelectOption[]>([])

onMounted(async () => {
  const currencies = await configService.getCurrencies()
  currencyOptions.value = currencies.map(c => ({
    value: c.code,
    label: `${c.name} (${c.code})`
  }))
})
```

### Endpoints Esperados

Documentar todos os endpoints que o front espera:

```typescript
/**
 * API Endpoints - Contratos Esperados
 * 
 * Base URL: process.env.VITE_API_URL
 */

// Links/Tracking
GET    /api/links
POST   /api/links
GET    /api/links/:id
PUT    /api/links/:id
DELETE /api/links/:id
GET    /api/links/:id/stats

// Sales
GET    /api/sales
POST   /api/sales
GET    /api/sales/:id
PUT    /api/sales/:id
POST   /api/sales/:id/mark-lost
POST   /api/sales/:id/recover

// Contacts
GET    /api/contacts
POST   /api/contacts
GET    /api/contacts/:id
PUT    /api/contacts/:id
DELETE /api/contacts/:id

// Config/Metadata
GET    /api/currencies       // ← Necessário para selects
GET    /api/countries        // ← Necessário para selects
GET    /api/timezones        // ← Necessário para selects
GET    /api/lost-reasons     // ← Necessário para selects

// Integrations
GET    /api/integrations
POST   /api/integrations/:provider/connect
DELETE /api/integrations/:id/disconnect
GET    /api/integrations/:id/status
```

---

## 📊 Métricas Atuais

```
Total de Erros:        585
├─ Tipos Faltantes:    200 (34%)
├─ Componentes UI:     150 (26%)
├─ Vars Não Usadas:    100 (17%)
├─ Tipos Incompatíveis: 100 (17%)
└─ ZodError:            35 (6%)

Erros Corrigidos:      ~20
Progresso:             3.4%
```

---

## 🎯 Priorização

### 🔴 CRÍTICO (Bloqueia Deploy)
- Corrigir tipos faltantes em models
- Adicionar props obrigatórias em componentes UI
- Corrigir ZodError handling

### 🟡 IMPORTANTE (Antes da Integração)
- Criar constantes temporárias para selects
- Padronizar date handling
- Adicionar null safety

### 🟢 DESEJÁVEL (Pode ser depois)
- Remover variáveis não usadas
- Limpar imports desnecessários
- Otimizar type assertions

---

## 📝 Notas para Integração

### Dados Mock vs API Real

**Arquivos com Mocks que serão Substituídos**:
```
src/mocks/
├── contacts.ts          → Substituir por API call
├── sales.ts             → Substituir por API call
├── links.ts             → Substituir por API call
├── origins.ts           → Substituir por API call
└── integrations.ts      → Substituir por API call
```

**Stores com Lógica Mock**:
```
src/stores/
├── contacts.ts          → Linha ~240: fetchContacts()
├── sales.ts             → Linha ~236: fetchSales()
├── tracking.ts          → Linha ~150: fetchLinks()
├── settings.ts          → Linha ~180: fetchOrigins()
└── integrations.ts      → Linha ~120: fetchIntegrations()
```

### Pontos de Atenção

1. **Multi-tenancy**: Todos os requests devem incluir `projectId`
2. **Authentication**: Headers com token JWT
3. **Rate Limiting**: Implementar retry com backoff
4. **Caching**: Considerar cache local para reduzir requests
5. **Optimistic Updates**: Atualizar UI antes da resposta da API
6. **Error Recovery**: Permitir retry em caso de falha

---

## 🔗 Referências

- **Tipos/Contratos**: `/src/types/models.ts`, `/src/types/api.ts`
- **Schemas Zod**: `/src/schemas/`
- **Services**: `/src/services/`
- **Stores**: `/src/stores/`
- **Docs Backend**: `/back-end/docs/api/`
- **Regras de Dev**: `/.cursorrules`

---

## ✍️ Autor

Relatório gerado durante revisão de TypeScript em 22/11/2025.

**Próxima Revisão**: Após correção da Fase 1 (tipos)

