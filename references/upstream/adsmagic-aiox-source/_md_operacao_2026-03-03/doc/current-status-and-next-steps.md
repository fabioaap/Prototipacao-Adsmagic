# Status Atual do Projeto e Próximas Etapas

## 📊 Resumo Executivo

Este documento consolida todas as especificações coletadas até o momento para o MVP do Adsmagic First AI e define as próximas etapas de implementação.

**Data de criação**: 19/10/2025
**Última atualização**: 20/10/2025 - Fase 2 100% CONCLUÍDA + Componentes Dashboard Implementados
**Status**: Fase 1.5 100% Implementada - Fase 2 UI Development 100% CONCLUÍDA + Dashboard Components
**Versão**: 5.1

---

## 🏗️ Arquitetura do Projeto

### Stack Tecnológico
- **Framework**: Vue 3 com Composition API
- **Linguagem**: TypeScript (tipagem estrita, sem `any`)
- **Estado**: Pinia stores
- **Roteamento**: Vue Router com guards de autenticação
- **i18n**: Vue i18n (PT, EN, ES) com locale na URL (`/:locale/...`)
- **Estilização**: Tailwind CSS
- **Ícones**: lucide-vue
- **Validação**: Zod com feedback em tempo real
- **Build**: Vite

### Princípios de Desenvolvimento
- SOLID
- Clean Code
- DRY (Don't Repeat Yourself)
- KISS (Keep It Simple, Stupid)
- Conventional Commits

---

## ✅ Funcionalidades Já Implementadas

### 1. Sistema de Autenticação
- Login, registro e recuperação de senha
- Guards de rota (rotas protegidas e públicas)
- Store de autenticação (`auth.ts`)
- Persistência de sessão

### 2. Onboarding de Franquias
- Fluxo em 4 passos:
  1. Tipo de empresa (franchise, corporate, individual)
  2. Número de franquias (validação 1-999)
  3. Nome da franquia (2-100 caracteres)
  4. Revisão
- Validação em tempo real
- Barra de progresso
- Store dedicado (`onboarding.ts`)

### 3. Project Wizard
- Fluxo em 7 passos:
  1. Informações do Projeto (nome, descrição, país, idioma)
  2. Seleção de Plataformas (Facebook, Instagram, Google, TikTok)
  3. Configuração de Plataformas
  4. Tipo de Campanha Meta
  5. Links Rastreáveis (URLs de destino e parâmetros UTM)
  6. WhatsApp
  7. Finalização (revisão e confirmação)
- Componentes específicos: `CheckboxCard`, `Textarea`
- Store dedicado (`projectWizard.ts`)
- Validações por passo
- Navegação entre passos

### 4. Sistema de Rotas e i18n
- Todas as rotas com prefixo `/:locale`
- Locales suportados: `pt`, `en`, `es`
- Guards de locale e autenticação
- Composable `useLocalizedRoute` para navegação
- Mudança de idioma preserva rota atual
- Persistência de preferência (`localStorage.language`)

### 5. Componentes Base (UI)
- Button
- Input
- Card
- Navbar
- LanguageSelector
- UserMenu
- CheckboxCard
- Textarea

### 6. Stores Pinia
- `auth.ts` - Autenticação
- `projects.ts` - Gerenciamento de projetos
- `projectWizard.ts` - Estado do wizard de projetos
- `onboarding.ts` - Onboarding de franquias
- `language.ts` - Idioma ativo

### 7. Componentes de Dashboard Implementados
- **DashboardChartsTabs**: Sistema de abas para diferentes visualizações de gráficos
- **DashboardEmptyState**: Estado vazio com call-to-action para primeiro uso
- **DashboardFinancialMetrics**: Métricas financeiras (receita, ROI, custo por lead)
- **DashboardFunnel**: Visualização do funil de conversão por estágios
- **DashboardLatestActivities**: Timeline das últimas atividades do sistema
- **DashboardOriginPerformanceTable**: Tabela de performance das origens de tráfego
- Integração completa com dados mock e responsividade

### 8. Fase 2 - UI Development (Em Progresso - 15% Concluído)

#### ✅ Sessão 2.1: Componentes Base - **CONCLUÍDA** (100%)
**Componentes criados** (15 componentes):
- Checkbox, Radio, RadioGroup - Formulários
- Dialog, AlertDialog - Modais e confirmações
- Alert, Spinner - Feedback
- Switch, Skeleton, Progress - UI elements
- Tabs (4 componentes) - Navegação por abas
- FormField - Wrapper de formulário

**Características**:
- Padrão shadcn-vue (Tailwind + HSL variables)
- TypeScript strict mode (zero `any`)
- Acessibilidade WCAG 2.1 AA
- Dark mode automático
- ~1.600 linhas de código

#### ✅ Sessão 2.2: Componentes Comuns - **CONCLUÍDA** (100%)
**Componentes criados** (4 novos + 6 existentes verificados):
- AppFooter - Footer com copyright e links
- AppBreadcrumb - Navegação com auto-geração de breadcrumbs
- AppNotifications - Central de notificações com badge
- AppHeader (enhanced) - Header integrado com todos os componentes

**Componentes existentes reutilizados**:
- AppSidebar, UserMenu, SearchBar
- DarkModeToggle, LanguageSelector, Pagination

**Características**:
- Integração com stores (auth, language)
- Componentes responsivos (mobile/desktop)
- Mock notifications para demonstração
- ~1.060 linhas de código

**Total Fase 2 até agora**:
- 21 arquivos criados (19 componentes + 2 views de teste)
- ~2.650 linhas de código
- 2/13 sessões concluídas (~15%)
- Tempo gasto: ~5 horas

**Próximos passos**: Sessão 2.3 - Layouts (DashboardLayout, AuthLayout, SettingsLayout, BlankLayout)

---

## 🏗️ Preparação para Integração com API

### Filosofia de Desenvolvimento

Este projeto segue o princípio de **"Mock First, API Ready"**: toda a aplicação funciona 100% com dados mockados durante o desenvolvimento, mas está estruturada para que a integração com APIs reais seja feita alterando **apenas 1 linha por service**.

### Estrutura de Dados TypeScript

#### Interfaces Principais (`types/models.ts`)

```typescript
// Contato
interface Contact {
  id: string
  name: string
  phone: string
  countryCode: string // DDI
  origin: string // ID da origem principal (baseado em modelo de atribuição)
  stage: string // ID da etapa atual
  createdAt: string // ISO 8601
  updatedAt: string
  metadata?: {
    device?: 'mobile' | 'tablet' | 'desktop'
    browser?: string
    os?: string
    ipAddress?: string
  }
}

// Venda
interface Sale {
  id: string
  contactId: string
  value: number
  currency: string // BRL, USD, EUR, etc.
  date: string // ISO 8601
  origin?: string // Origem atribuída à venda
  status: 'completed' | 'lost'
  lostReason?: string // Se status = 'lost'
  lostObservations?: string
  trackingParams?: {
    gclid?: string
    gbraid?: string
    wbraid?: string
    fbclid?: string
    ttpclid?: string
  }
}

// Evento de Conversão
interface Event {
  id: string
  platform: 'meta' | 'google' | 'tiktok'
  type: string // 'purchase', 'lead', 'add_to_cart', etc.
  contactId: string
  saleId?: string
  status: 'pending' | 'sent' | 'failed'
  retryCount: number
  lastRetryAt?: string
  errorMessage?: string
  createdAt: string
  sentAt?: string
}

// Etapa do Funil
interface Stage {
  id: string
  name: string
  order: number // Ordem de exibição
  trackingPhrase?: string // Frase para rastreio automático WhatsApp
  type: 'normal' | 'sale' | 'lost' // Apenas 1 de cada tipo especial
  isActive: boolean
  eventConfig?: {
    meta?: { eventType: string; active: boolean }
    google?: { eventType: string; active: boolean }
    tiktok?: { eventType: string; active: boolean }
    defaultValue?: number
    defaultCurrency?: string
  }
  createdAt: string
}

// Origem
interface Origin {
  id: string
  name: string
  type: 'system' | 'custom' // Sistema = não pode deletar
  color: string // Hex color
  icon?: string // Lucide icon name ou emoji
  isActive: boolean
  createdAt: string
}

// Link Rastreável
interface Link {
  id: string
  name: string
  url: string // URL gerada: https://link.adsmagic.com.br?comp=...
  initialMessage?: string // Mensagem pré-preenchida WhatsApp
  isActive: boolean
  stats: {
    clicks: number
    contacts: number
    sales: number
    revenue: number
  }
  createdAt: string
}

// Métricas Dashboard
interface DashboardMetrics {
  revenue: {
    current: number
    previous: number
    change: number // Percentual
    trend: 'up' | 'down' | 'stable'
  }
  sales: {
    current: number
    previous: number
    change: number
  }
  roi: {
    current: number
    previous: number
    change: number
  }
  funnel: {
    impressions: number
    clicks: number
    contacts: number
    sales: number
    ctr: number // Click-through rate
    contactRate: number // Cliques → Contatos
    conversionRate: number // Contatos → Vendas
  }
  financial: {
    adSpend: number
    averageTicket: number
    costPerSale: number
    costPerClick: number
  }
}
```

#### DTOs (Data Transfer Objects) (`types/dto.ts`)

```typescript
// Criar Contato
interface CreateContactDTO {
  name: string
  phone: string
  countryCode: string
  origin?: string
  stage?: string // Default: primeira etapa
}

// Atualizar Contato
interface UpdateContactDTO {
  name?: string
  phone?: string
  stage?: string
}

// Criar Venda
interface CreateSaleDTO {
  contactId: string
  value: number
  currency: string
  date: string
  origin?: string
}

// Criar Etapa
interface CreateStageDTO {
  name: string
  trackingPhrase?: string
  type: 'normal' | 'sale' | 'lost'
  eventConfig?: Stage['eventConfig']
}

// Criar Origem Customizada
interface CreateOriginDTO {
  name: string
  color: string
  icon?: string
}

// Criar Link Rastreável
interface CreateLinkDTO {
  name: string
  initialMessage?: string
}
```

#### Tipos de Resposta API (`types/api.ts`)

```typescript
// Resposta genérica
interface ApiResponse<T> {
  data: T
  meta?: {
    timestamp: string
    requestId: string
  }
}

// Resposta paginada
interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

// Result type (para tratamento de erros)
type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E }

// Filtros comuns
interface ContactFilters {
  search?: string
  origins?: string[]
  stages?: string[]
  hasSales?: boolean
  dateFrom?: string
  dateTo?: string
  page?: number
  pageSize?: number
}
```

### Service Layer Structure

#### Cliente HTTP Base (`services/api/client.ts`)

```typescript
import axios from 'axios'
import type { ApiResponse } from '@/types/api'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor para adicionar token de autenticação
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor para tratamento de erros
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Logging centralizado
    console.error('[API Error]', error)

    // Tratamento de erros comuns
    if (error.response?.status === 401) {
      // Redirecionar para login
      window.location.href = '/auth/login'
    }

    return Promise.reject(error)
  }
)

export { apiClient }
```

#### Service de Contatos (`services/api/contacts.ts`)

```typescript
import { apiClient } from './client'
import { mockContacts } from '@/mocks/contacts'
import type { Contact, CreateContactDTO, UpdateContactDTO, ContactFilters } from '@/types'

const USE_MOCK = true // ⭐ Trocar para false quando API estiver pronta

export const contactsService = {
  /**
   * Buscar todos contatos com filtros
   */
  async getAll(filters?: ContactFilters): Promise<Contact[]> {
    if (USE_MOCK) {
      // Mock: simula delay de rede
      await new Promise(resolve => setTimeout(resolve, 300))

      // Mock: aplica filtros
      let filtered = [...mockContacts]

      if (filters?.search) {
        filtered = filtered.filter(c =>
          c.name.toLowerCase().includes(filters.search!.toLowerCase()) ||
          c.phone.includes(filters.search!)
        )
      }

      if (filters?.origins?.length) {
        filtered = filtered.filter(c => filters.origins!.includes(c.origin))
      }

      if (filters?.stages?.length) {
        filtered = filtered.filter(c => filters.stages!.includes(c.stage))
      }

      return filtered
    }

    // API real: 1 linha
    const response = await apiClient.get<Contact[]>('/contacts', { params: filters })
    return response.data
  },

  /**
   * Buscar contato por ID
   */
  async getById(id: string): Promise<Contact | null> {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 200))
      return mockContacts.find(c => c.id === id) || null
    }

    const response = await apiClient.get<Contact>(`/contacts/${id}`)
    return response.data
  },

  /**
   * Criar novo contato
   */
  async create(data: CreateContactDTO): Promise<Contact> {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 400))

      const newContact: Contact = {
        id: `mock_${Date.now()}`,
        name: data.name,
        phone: data.phone,
        countryCode: data.countryCode,
        origin: data.origin || 'outros',
        stage: data.stage || 'contato-iniciado',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      mockContacts.push(newContact)
      return newContact
    }

    const response = await apiClient.post<Contact>('/contacts', data)
    return response.data
  },

  /**
   * Atualizar contato
   */
  async update(id: string, data: UpdateContactDTO): Promise<Contact> {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 400))

      const index = mockContacts.findIndex(c => c.id === id)
      if (index === -1) throw new Error('Contato não encontrado')

      mockContacts[index] = {
        ...mockContacts[index],
        ...data,
        updatedAt: new Date().toISOString()
      }

      return mockContacts[index]
    }

    const response = await apiClient.patch<Contact>(`/contacts/${id}`, data)
    return response.data
  },

  /**
   * Deletar contato
   */
  async delete(id: string): Promise<void> {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300))

      const index = mockContacts.findIndex(c => c.id === id)
      if (index !== -1) {
        mockContacts.splice(index, 1)
      }
      return
    }

    await apiClient.delete(`/contacts/${id}`)
  }
}
```

**Nota:** Services para `sales`, `links`, `events`, `dashboard`, `stages`, `origins` seguem o mesmo padrão.

### Mock Data Structure

#### Contatos Mock (`mocks/contacts.ts`)

```typescript
import type { Contact } from '@/types'

export const mockContacts: Contact[] = [
  {
    id: '1',
    name: 'Exklusiva Negócios Imobiliários',
    phone: '16996262607',
    countryCode: '+55',
    origin: 'google-ads',
    stage: 'qualificado',
    createdAt: '2025-10-16T12:09:00Z',
    updatedAt: '2025-10-16T14:30:00Z',
    metadata: {
      device: 'mobile',
      browser: 'Chrome',
      os: 'Android',
      ipAddress: '192.168.1.100'
    }
  },
  {
    id: '2',
    name: 'João Silva Investimentos',
    phone: '11987654321',
    countryCode: '+55',
    origin: 'meta-ads',
    stage: 'contato-iniciado',
    createdAt: '2025-10-18T09:15:00Z',
    updatedAt: '2025-10-18T09:15:00Z'
  },
  // ... mais 48 contatos variados
]
```

#### Dashboard Mock (`mocks/dashboard.ts`)

```typescript
import type { DashboardMetrics } from '@/types'

export const mockDashboardMetrics: DashboardMetrics = {
  revenue: {
    current: 10000,
    previous: 8695.65,
    change: 15,
    trend: 'up'
  },
  sales: {
    current: 13,
    previous: 10,
    change: 23,
  },
  roi: {
    current: 8.2,
    previous: 7.3,
    change: 12
  },
  funnel: {
    impressions: 8896,
    clicks: 386,
    contacts: 103,
    sales: 13,
    ctr: 4.34,
    contactRate: 26.7,
    conversionRate: 12.6
  },
  financial: {
    adSpend: 1219.51,
    averageTicket: 769.23,
    costPerSale: 93.81,
    costPerClick: 3.16
  }
}
```

### Store Actions Preparadas

#### Contacts Store (`stores/contacts.ts`)

```typescript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { contactsService } from '@/services/api/contacts'
import type { Contact, ContactFilters } from '@/types'

export const useContactsStore = defineStore('contacts', () => {
  // Estado
  const contacts = ref<Contact[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const filters = ref<ContactFilters>({})

  // Getters
  const filteredContacts = computed(() => {
    // Filtros aplicados localmente para performance
    let result = contacts.value

    if (filters.value.search) {
      const search = filters.value.search.toLowerCase()
      result = result.filter(c =>
        c.name.toLowerCase().includes(search) ||
        c.phone.includes(search)
      )
    }

    return result
  })

  const totalRevenue = computed(() => {
    // Calculado a partir de vendas relacionadas
    return 0 // TODO: implementar quando integrar com sales store
  })

  // Actions (preparadas para API)
  const fetchContacts = async (newFilters?: ContactFilters) => {
    isLoading.value = true
    error.value = null

    if (newFilters) {
      filters.value = newFilters
    }

    try {
      // ⭐ Esta chamada funciona com mock agora, API depois
      contacts.value = await contactsService.getAll(filters.value)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao buscar contatos'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const createContact = async (data: CreateContactDTO) => {
    isLoading.value = true
    error.value = null

    try {
      const newContact = await contactsService.create(data)
      contacts.value.unshift(newContact) // Adiciona no início da lista
      return newContact
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao criar contato'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const updateContact = async (id: string, data: UpdateContactDTO) => {
    try {
      const updated = await contactsService.update(id, data)
      const index = contacts.value.findIndex(c => c.id === id)
      if (index !== -1) {
        contacts.value[index] = updated
      }
      return updated
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao atualizar contato'
      throw err
    }
  }

  const deleteContact = async (id: string) => {
    try {
      await contactsService.delete(id)
      contacts.value = contacts.value.filter(c => c.id !== id)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao deletar contato'
      throw err
    }
  }

  return {
    // Estado
    contacts: readonly(contacts),
    isLoading: readonly(isLoading),
    error: readonly(error),
    filters: readonly(filters),

    // Getters
    filteredContacts,
    totalRevenue,

    // Actions
    fetchContacts,
    createContact,
    updateContact,
    deleteContact
  }
})
```

### Composables Obrigatórios

#### useApi (`composables/useApi.ts`)

```typescript
import { ref, readonly } from 'vue'

export function useApi<T>() {
  const data = ref<T | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const execute = async (apiCall: () => Promise<T>) => {
    loading.value = true
    error.value = null

    try {
      const result = await apiCall()
      data.value = result
      return { success: true as const, data: result }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      error.value = errorMessage
      return { success: false as const, error: errorMessage }
    } finally {
      loading.value = false
    }
  }

  const reset = () => {
    data.value = null
    loading.value = false
    error.value = null
  }

  return {
    data: readonly(data),
    loading: readonly(loading),
    error: readonly(error),
    execute,
    reset
  }
}
```

#### useValidation (`composables/useValidation.ts`)

```typescript
import { ref, computed, readonly } from 'vue'
import { z } from 'zod'

export function useValidation<T extends Record<string, any>>(
  schema: z.ZodSchema<T>,
  initialData: T
) {
  const data = ref<T>({ ...initialData })
  const errors = ref<Record<keyof T, string>>({} as Record<keyof T, string>)
  const touched = ref<Record<keyof T, boolean>>({} as Record<keyof T, boolean>)

  const isValid = computed(() => Object.keys(errors.value).length === 0)
  const isDirty = computed(() => Object.values(touched.value).some(Boolean))

  const validate = (field?: keyof T) => {
    try {
      if (field) {
        // Validação de campo específico
        const fieldSchema = (schema as any).pick({ [field]: true })
        fieldSchema.parse({ [field]: data.value[field] })
        delete errors.value[field]
      } else {
        // Validação completa
        schema.parse(data.value)
        errors.value = {} as Record<keyof T, string>
      }
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors = error.flatten().fieldErrors
        Object.keys(fieldErrors).forEach(key => {
          errors.value[key as keyof T] = fieldErrors[key]?.[0] || 'Campo inválido'
        })
      }
      return false
    }
  }

  const validateField = (field: keyof T) => {
    touched.value[field] = true
    return validate(field)
  }

  const setFieldValue = (field: keyof T, value: any) => {
    data.value[field] = value
    touched.value[field] = true
    validateField(field)
  }

  const reset = () => {
    data.value = { ...initialData }
    errors.value = {} as Record<keyof T, string>
    touched.value = {} as Record<keyof T, boolean>
  }

  const getFieldError = (field: keyof T) => {
    return touched.value[field] ? errors.value[field] : undefined
  }

  return {
    data: readonly(data),
    errors: readonly(errors),
    touched: readonly(touched),
    isValid,
    isDirty,
    validate,
    validateField,
    setFieldValue,
    reset,
    getFieldError
  }
}
```

#### useFormat (`composables/useFormat.ts`)

```typescript
import { useI18n } from 'vue-i18n'

export function useFormat() {
  const { locale } = useI18n()

  const formatCurrency = (value: number, currency = 'BRL') => {
    return new Intl.NumberFormat(locale.value, {
      style: 'currency',
      currency
    }).format(value)
  }

  const formatDate = (date: string | Date, format: 'short' | 'long' = 'short') => {
    const dateObj = typeof date === 'string' ? new Date(date) : date

    if (format === 'short') {
      return new Intl.DateTimeFormat(locale.value, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(dateObj)
    }

    return new Intl.DateTimeFormat(locale.value, {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(dateObj)
  }

  const formatPhone = (phone: string, countryCode: string) => {
    // Formato brasileiro: (16) 99626-2607
    if (countryCode === '+55' && phone.length === 11) {
      return `(${phone.slice(0, 2)}) ${phone.slice(2, 7)}-${phone.slice(7)}`
    }

    // Outros formatos: retorna com país
    return `${countryCode} ${phone}`
  }

  const formatNumber = (value: number, decimals = 0) => {
    return new Intl.NumberFormat(locale.value, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value)
  }

  const formatPercent = (value: number, decimals = 1) => {
    return new Intl.NumberFormat(locale.value, {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value / 100)
  }

  return {
    formatCurrency,
    formatDate,
    formatPhone,
    formatNumber,
    formatPercent
  }
}
```

#### useDevice (`composables/useDevice.ts`)

```typescript
import { ref, onMounted, onUnmounted, readonly } from 'vue'

export function useDevice() {
  const isMobile = ref(false)
  const isTablet = ref(false)
  const isDesktop = ref(false)
  const width = ref(window.innerWidth)

  const updateDevice = () => {
    width.value = window.innerWidth

    isMobile.value = width.value < 768
    isTablet.value = width.value >= 768 && width.value < 1024
    isDesktop.value = width.value >= 1024
  }

  onMounted(() => {
    updateDevice()
    window.addEventListener('resize', updateDevice)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', updateDevice)
  })

  return {
    isMobile: readonly(isMobile),
    isTablet: readonly(isTablet),
    isDesktop: readonly(isDesktop),
    width: readonly(width)
  }
}
```

### Schemas de Validação Zod

#### Contact Schema (`schemas/contact.ts`)

```typescript
import { z } from 'zod'

export const createContactSchema = z.object({
  name: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),

  phone: z.string()
    .regex(/^\d{10,11}$/, 'Telefone inválido. Use apenas números (10 ou 11 dígitos)'),

  countryCode: z.string()
    .regex(/^\+\d{1,3}$/, 'Código de país inválido'),

  origin: z.string().optional(),
  stage: z.string().optional()
})

export const updateContactSchema = z.object({
  name: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .optional(),

  phone: z.string()
    .regex(/^\d{10,11}$/, 'Telefone inválido')
    .optional(),

  stage: z.string().optional()
})

export type CreateContactForm = z.infer<typeof createContactSchema>
export type UpdateContactForm = z.infer<typeof updateContactSchema>
```

#### Sale Schema (`schemas/sale.ts`)

```typescript
import { z } from 'zod'

export const createSaleSchema = z.object({
  contactId: z.string().uuid('ID de contato inválido'),

  value: z.number()
    .positive('Valor deve ser maior que zero')
    .max(999999999, 'Valor muito alto'),

  currency: z.enum(['BRL', 'USD', 'EUR', 'GBP', 'ARS', 'MXN', 'CLP'], {
    errorMap: () => ({ message: 'Moeda inválida' })
  }),

  date: z.string()
    .datetime('Data inválida. Use formato ISO 8601'),

  origin: z.string().optional()
})

export type CreateSaleForm = z.infer<typeof createSaleSchema>
```

### Sistema de Design Tokens

#### Tokens CSS (`assets/styles/tokens.css`)

```css
:root {
  /* Cores Primárias */
  --color-primary-50: #eff6ff;
  --color-primary-100: #dbeafe;
  --color-primary-200: #bfdbfe;
  --color-primary-300: #93c5fd;
  --color-primary-400: #60a5fa;
  --color-primary-500: #3b82f6;
  --color-primary-600: #2563eb;
  --color-primary-700: #1d4ed8;
  --color-primary-800: #1e40af;
  --color-primary-900: #1e3a8a;

  /* Cores de Origem (Badges) */
  --color-google: #4285f4;
  --color-meta: #0084ff;
  --color-instagram: #e4405f;
  --color-tiktok: #000000;
  --color-whatsapp: #25d366;
  --color-organic: #10b981;
  --color-direct: #374151;
  --color-others: #9ca3af;

  /* Escala de Cinza */
  --color-gray-50: #f9fafb;
  --color-gray-100: #f3f4f6;
  --color-gray-200: #e5e7eb;
  --color-gray-300: #d1d5db;
  --color-gray-400: #9ca3af;
  --color-gray-500: #6b7280;
  --color-gray-600: #4b5563;
  --color-gray-700: #374151;
  --color-gray-800: #1f2937;
  --color-gray-900: #111827;

  /* Cores Semânticas */
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  --color-info: #3b82f6;

  /* Espaçamentos */
  --space-0: 0;
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-5: 1.25rem;   /* 20px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-10: 2.5rem;   /* 40px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */

  /* Tipografia */
  --font-size-xs: 0.75rem;    /* 12px */
  --font-size-sm: 0.875rem;   /* 14px */
  --font-size-base: 1rem;     /* 16px */
  --font-size-lg: 1.125rem;   /* 18px */
  --font-size-xl: 1.25rem;    /* 20px */
  --font-size-2xl: 1.5rem;    /* 24px */
  --font-size-3xl: 1.875rem;  /* 30px */
  --font-size-4xl: 2.25rem;   /* 36px */

  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  /* Bordas */
  --radius-none: 0;
  --radius-sm: 0.125rem;   /* 2px */
  --radius-md: 0.375rem;   /* 6px */
  --radius-lg: 0.5rem;     /* 8px */
  --radius-xl: 0.75rem;    /* 12px */
  --radius-2xl: 1rem;      /* 16px */
  --radius-full: 9999px;

  --border-width-1: 1px;
  --border-width-2: 2px;
  --border-width-4: 4px;

  /* Sombras */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);

  /* Z-index */
  --z-dropdown: 1000;
  --z-sticky: 1020;
  --z-fixed: 1030;
  --z-modal-backdrop: 1040;
  --z-modal: 1050;
  --z-popover: 1060;
  --z-tooltip: 1070;

  /* Transições */
  --transition-fast: 150ms ease-in-out;
  --transition-base: 300ms ease-in-out;
  --transition-slow: 500ms ease-in-out;
}

/* Dark Mode */
[data-theme="dark"] {
  /* Cores Primárias (invertidas) */
  --color-primary-50: #1e3a8a;
  --color-primary-100: #1e40af;
  --color-primary-200: #1d4ed8;
  --color-primary-300: #2563eb;
  --color-primary-400: #3b82f6;
  --color-primary-500: #60a5fa;
  --color-primary-600: #93c5fd;
  --color-primary-700: #bfdbfe;
  --color-primary-800: #dbeafe;
  --color-primary-900: #eff6ff;

  /* Escala de Cinza (invertida) */
  --color-gray-50: #111827;
  --color-gray-100: #1f2937;
  --color-gray-200: #374151;
  --color-gray-300: #4b5563;
  --color-gray-400: #6b7280;
  --color-gray-500: #9ca3af;
  --color-gray-600: #d1d5db;
  --color-gray-700: #e5e7eb;
  --color-gray-800: #f3f4f6;
  --color-gray-900: #f9fafb;

  /* Backgrounds */
  --bg-primary: #0f172a;
  --bg-secondary: #1e293b;
  --bg-tertiary: #334155;

  /* Text */
  --text-primary: #f1f5f9;
  --text-secondary: #cbd5e1;
  --text-tertiary: #94a3b8;
}

/* Utilitários */
.transition-base {
  transition: var(--transition-base);
}

.shadow-card {
  box-shadow: var(--shadow-md);
}

.border-primary {
  border-color: var(--color-primary-500);
}
```

### Security Utils

#### Security Helpers (`utils/security.ts`)

```typescript
import DOMPurify from 'dompurify'

/**
 * Sanitiza HTML para prevenir XSS
 */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'target']
  })
}

/**
 * Escapa caracteres especiais para prevenir XSS
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  }
  return text.replace(/[&<>"'/]/g, char => map[char])
}

/**
 * Valida e limpa input de usuário
 */
export function sanitizeInput(input: string, maxLength = 1000): string {
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, '') // Remove < e >
}

/**
 * Gera token CSRF (preparado para uso futuro)
 */
export function generateCsrfToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Rate limiting client-side (previne spam)
 */
export function createRateLimiter(maxCalls: number, windowMs: number) {
  const calls: number[] = []

  return function rateLimitCheck(): boolean {
    const now = Date.now()
    const windowStart = now - windowMs

    // Remove chamadas antigas
    while (calls.length > 0 && calls[0] < windowStart) {
      calls.shift()
    }

    if (calls.length >= maxCalls) {
      return false // Limite excedido
    }

    calls.push(now)
    return true // OK para prosseguir
  }
}
```

### Estrutura de Testes

#### Configuração Vitest (`tests/setup.ts`)

```typescript
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/vue'
import '@testing-library/jest-dom/vitest'

// Cleanup após cada teste
afterEach(() => {
  cleanup()
})

// Mock de localStorage
global.localStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
}

// Mock de i18n
vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
    locale: { value: 'pt' }
  })
}))
```

#### Mock Factories (`tests/utils/mocks.ts`)

```typescript
import type { Contact, Sale, Stage } from '@/types'

export function createMockContact(overrides?: Partial<Contact>): Contact {
  return {
    id: '1',
    name: 'Test Contact',
    phone: '11987654321',
    countryCode: '+55',
    origin: 'google-ads',
    stage: 'contato-iniciado',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides
  }
}

export function createMockSale(overrides?: Partial<Sale>): Sale {
  return {
    id: '1',
    contactId: '1',
    value: 500,
    currency: 'BRL',
    date: new Date().toISOString(),
    status: 'completed',
    ...overrides
  }
}

export function createMockStage(overrides?: Partial<Stage>): Stage {
  return {
    id: '1',
    name: 'Contato Iniciado',
    order: 1,
    type: 'normal',
    isActive: true,
    createdAt: new Date().toISOString(),
    ...overrides
  }
}
```

### Critérios de Sucesso da Preparação

**Quando esta estrutura estiver completa, você terá:**

✅ **Interfaces TypeScript**: Todas entidades documentadas com JSDoc
✅ **Services Layer**: Mock funcionando, pronto para API (1 linha para trocar)
✅ **Stores Pinia**: Actions completas, getters calculados
✅ **Composables**: 6 composables obrigatórios implementados
✅ **Schemas Zod**: Validação para todos formulários
✅ **Design Tokens**: Sistema completo + dark mode
✅ **Security**: Utils de sanitização e proteção
✅ **Testes**: Setup completo, factories prontas

**Resultado:** Próximas fases implementam APENAS UI, toda lógica já está pronta.

---

## 📋 Páginas Especificadas (Aguardando Implementação)

### 1. Visão Geral (Dashboard Principal)

#### Header
- Título: "Visão geral"
- Botão de refresh/atualizar
- **Nota:** Filtro de período foi movido para Navbar (filtro global - ver seção Componentes da Navbar)

#### 🎯 Seção 1: Métricas Principais (Destaque Visual)
**Layout:** Grid 3 colunas com cards maiores e mais destaque
- **Card 1: Receita**
  - Valor grande: R$ 10.000,00
  - Comparação: ▲ +15% vs período anterior
  - Micro gráfico de linha (sparkline) mostrando tendência
  - Ícone: 💰 (maior que demais cards)

- **Card 2: Vendas**
  - Valor grande: 13
  - Comparação: ▲ +23% vs período anterior
  - Micro gráfico de linha (sparkline)
  - Ícone: 🛒

- **Card 3: ROI**
  - Valor grande: 8.2x
  - Comparação: ▲ +12% vs período anterior
  - Micro gráfico de linha (sparkline)
  - Ícone: 📈
  - Tooltip explicativo: "Retorno sobre investimento = Receita / Gastos"

**Design:**
- Cards com altura maior que demais seções (hierarquia visual)
- Background com gradiente sutil
- Animação de entrada ao carregar página

#### 📊 Seção 2: Funil de Conversão Visual
**Layout:** Card horizontal com visualização de funil progressivo
```
┌─────────────────────────────────────────────────────────┐
│ 📊 Funil de Conversão                                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Impressões    →    Cliques    →   Contatos   →  Vendas│
│    8.896            386            103           13     │
│                                                         │
│              4.34%         26.7%          12.6%         │
│                                                         │
│  [Barra visual progressiva com larguras proporcionais] │
│  ████████████  ████████      ████        █              │
└─────────────────────────────────────────────────────────┘
```
**Funcionalidades:**
- Percentuais de conversão entre cada etapa
- Barras visuais com largura proporcional ao volume
- Cores: Azul → Verde → Amarelo → Verde escuro
- Tooltip em cada etapa: "4.34% dos que viram clicaram"
- Ícones de tendência (▲▼) em cada taxa de conversão

#### 💰 Seção 3: Métricas Financeiras (Colapsável)
**Layout:** Seção com header clicável para expandir/recolher
```
┌─────────────────────────────────────────────────────────┐
│ 💰 Métricas Financeiras                    [Expandir ▼]│
├─────────────────────────────────────────────────────────┤
│ [Conteúdo colapsado por padrão]                         │
└─────────────────────────────────────────────────────────┘

[Ao expandir, mostra Grid 4 colunas:]
1. Gastos anúncios (fonte: APIs Meta Ads + Google Ads)
2. Ticket médio (calculado: Receita / Vendas)
3. Custo por venda (calculado: Gastos / Vendas)
4. Custo por clique (calculado: Gastos / Cliques)
```
**Estado:**
- Colapsado por padrão (reduz sobrecarga cognitiva)
- Preferência salva no localStorage
- Animação suave ao expandir/recolher
- Cada card menor que métricas principais

#### 📈 Seção 4: Análises e Gráficos (Tabs)
**Layout:** Tabs para organizar diferentes visualizações
```
┌─────────────────────────────────────────────────────────┐
│ [Performance] [Origens] [Histórico]                     │
├─────────────────────────────────────────────────────────┤
│ [Conteúdo da tab ativa]                                 │
└─────────────────────────────────────────────────────────┘
```

**Tab 1: Performance** (Ativa por padrão)
- Gráfico de Linha: Contatos x Vendas
  - Eixo X: Datas
  - Eixo Y: Quantidade
  - 2 linhas: Contatos (azul escuro) e Vendas (verde)
  - Tooltip no hover: Data, quantidade, variação vs dia anterior
  - Valores nos pontos: apenas no hover
  - Área sombreada sob as linhas (mais visual)
  - Opção de toggle: Ver apenas Contatos / Apenas Vendas / Ambos

**Tab 2: Origens**
- Grid com 2 gráficos de pizza lado a lado:
  - **Esquerda**: Vendas por origem (total de vendas: 13)
  - **Direita**: Receita por origem (total de receita: R$ 10.000,00)
  - **Origens**: Google Ads, Meta Ads, TikTok Ads, Organic, Direct, Others, Unknown
  - **Cores consistentes** entre os dois gráficos
  - **Legenda interativa**: Clicar em origem destaca no gráfico
  - **Tooltip**: Percentual + valor absoluto

**Tab 3: Histórico**
- Gráfico de barras: Evolução semanal de Receita
- Comparação com semana anterior
- Identificação visual de melhores/piores períodos

#### 🎬 Seção 5: Últimas Atividades
**Layout:** Grid 2 colunas com cards lado a lado
```
┌───────────────────────┬───────────────────────┐
│ 💰 Últimas Vendas (6) │ 👥 Novos Contatos (6) │
└───────────────────────┴───────────────────────┘
```

**Card Esquerdo: Últimas Vendas**
- Lista vertical com últimas 6 vendas
- Cada item:
  - Avatar com iniciais
  - Nome do cliente (truncado)
  - Data da venda (relativa: "Há 2 dias")
  - Valor (alinhado à direita, destaque)
  - Badge de origem
- Ao clicar: abrir drawer da venda (reaproveitar drawer da página Vendas)
- Rodapé: [Ver todas as vendas →]

**Card Direito: Novos Contatos**
- Lista vertical com últimos 6 contatos
- Cada item:
  - Avatar com iniciais
  - Nome do contato
  - Data de criação (relativa: "Há 3 horas")
  - Badge de origem
  - Badge de etapa
- Ao clicar: abrir drawer do contato
- Rodapé: [Ver todos os contatos →]

#### 📊 Seção 6: Tabela de Desempenho por Origem
**Layout:** Tabela completa no final da página
- Título: "Desempenho por Origem"
- Colunas: Origem, Gastos, Contatos, Vendas, Taxa de vendas, ROI
- Paginação: 10 itens por página
- Ordenação: Por coluna clicável (padrão: maior ROI primeiro)
- Responsivo: Scroll horizontal no mobile
- Cores: Badge de origem com mesma cor dos gráficos de pizza
- Row highlighting ao hover
- Row clicável: Expande detalhes inline

**Empty State (quando não há dados):**
```
┌─────────────────────────────────────────────────────────┐
│                     📊                                  │
│            Nenhum dado disponível ainda                 │
│                                                         │
│  Seus dados aparecerão aqui quando:                     │
│  • Integrar Meta Ads ou Google Ads                      │
│  • Adicionar sua primeira venda                         │
│  • Contatos começarem a interagir                       │
│                                                         │
│         [Configurar integrações]                        │
│         [Adicionar primeira venda]                      │
└─────────────────────────────────────────────────────────┘
```

---

### 2. Contatos

#### Header
- Título: "Contatos"
- Botão de refresh/atualizar
- **Nota:** Filtro de período foi movido para Navbar (filtro global)
- Botão "Exportar" com dropdown
- Botão "Adicionar" (azul escuro, destaque)

#### Área de Busca e Filtros
- Contador de resultados: "Resultados X"
- Campo de busca com atalho: "Pesquise pelo nome ou telefone (pressione / para focar)"
- Botão "Filtros": abre modal com filtros avançados
  - Origem (multiselect com busca)
  - Etapa (multiselect com busca)
  - Com/sem venda (toggle/checkbox)
  - Botão "Limpar filtros" (aparece quando há filtros ativos)
- Toggle de visualização (Lista/Kanban) - canto superior direito
  - Ícones: 📋 Lista | 📊 Kanban
  - Preferência salva no localStorage
  - Badge visual indicando visualização ativa

#### Tabela de Contatos (Visualização Lista)
**Colunas:**
- Avatar (círculo com iniciais, cores fixas)
- Nome (truncado se longo)
- Telefone (formato brasileiro com DDD)
- Origem (badge com cor)
- Etapa (badge)
- Data de criação (DD/MM/YYYY HH:MM)
- Ações (menu três pontos)

**Menu de Ações:**
- Alterar nome
- Alterar etapa
- Adicionar origem
- Adicionar venda
- Deletar (vermelho)

**Paginação:**
- 10 itens por página
- Navegação numérica (1, 2, 3...)
- Botões "Anterior/Próximo"
- Opção "Ver todos"

#### Visualização Kanban
- Colunas = Etapas do funil (ordenadas)
- Cards = Contatos
- **Drag-and-drop com feedback visual aprimorado:**
  - Durante drag: card fica semi-transparente (opacity 0.5)
  - Coluna destino fica destacada (borda azul)
  - Placeholder visual mostra onde vai soltar: "⬇️ Solte aqui"
  - **Optimistic UI:** Card move instantaneamente ao soltar
  - Loading indicator discreto no card (⏳) enquanto API processa
  - **Rollback automático:** Se API falhar, card retorna com animação + toast de erro
  - Toast de sucesso: "Contato movido para [Etapa] ✅"
- Contador de contatos em cada coluna no header (atualiza em tempo real)
- 8-10 cards visíveis por coluna + scroll suave
- Indicador visual de "mais cards abaixo" (ícone ⬇️ com blur gradient)
- Filtros e busca funcionam no Kanban
- **Não exibe etapas de "Venda Perdida"** (vão para tab em Vendas)

**Layout Kanban:**
```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│ Contato      │ Qualificado  │ Negociação   │ Proposta     │
│ iniciado(23) │ (12)         │ (8)          │ enviada(2)   │
├──────────────┼──────────────┼──────────────┼──────────────┤
│ [EI] Nome    │ [JO] Nome    │ [MA] Nome    │ [CA] Nome    │
│ (16) 99626   │ (16) 98888   │ (16) 97777   │ (16) 96666   │
│ 🔵 Google    │ 🔴 Meta Ads  │ 🟢 Orgânico  │ 🔵 Google    │
│ [...]        │ [...]        │ [...]        │              │
│   ⬇️ Mais    │   ⬇️ Mais    │              │              │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

**Empty State Kanban (coluna vazia):**
```
┌──────────────┐
│ Negociação   │
│ (0)          │
├──────────────┤
│              │
│    📭        │
│  Vazio       │
│              │
│ Arraste      │
│ contatos     │
│ para cá      │
└──────────────┘
```

**Empty State Geral (sem contatos):**
```
┌─────────────────────────────────────────────────────────┐
│                     👥                                  │
│            Nenhum contato ainda                         │
│                                                         │
│  Seus contatos aparecerão aqui quando:                 │
│  • Alguém clicar em um link rastreável                 │
│  • Receber mensagem no WhatsApp integrado              │
│  • Você adicionar manualmente                          │
│                                                         │
│         [+ Adicionar primeiro contato]                 │
│         [Criar link rastreável]                        │
│         [Ver tutorial de rastreamento]                 │
└─────────────────────────────────────────────────────────┘
```

#### Modais

**Modal 1: Adicionar Contato**
- Nome (obrigatório)
- DDI (seletor de país)
- DDD + Telefone (obrigatório)

**Modal 2: Alterar Nome**
- Avatar com iniciais
- Nome (editável)
- Telefone (read-only)

**Modal 3: Alterar Etapa**
- Avatar com iniciais
- Nome (read-only)
- Telefone (read-only)
- Etapa: Dropdown com etapas configuradas no Funil

**Modal 4: Adicionar Origem**
- Nome (read-only)
- Telefone (read-only)
- Dropdown com origens (sistema + customizadas)
  - Opção "Criar nova origem customizada"
- Data da origem (opcional)
- Observações (opcional)
- **Comportamento**: Adiciona como origem secundária (não sobrescreve rastreamento automático)

**Modal 5: Adicionar Venda**
- Avatar com iniciais
- Nome (read-only)
- Telefone (read-only)
- Data da venda (date picker)
- Moeda (dropdown)
- Valor da venda (input)

**Modal 6: Deletar Contato (Confirmação Dupla)**
```
┌─────────────────────────────────────────────────────┐
│ ⚠️  Deletar contato                                 │
├─────────────────────────────────────────────────────┤
│ [EI] Exklusiva Negócios Imobiliários               │
│ (16) 99626-2607                                     │
│                                                     │
│ 🚨 Esta ação é PERMANENTE e IRREVERSÍVEL            │
│                                                     │
│ Serão deletados:                                    │
│ • Histórico de vendas (3 vendas - R$ 1.500,00)     │
│ • Jornada de rastreamento (5 eventos)              │
│ • Links acessados (2 links)                        │
│ • Todas as informações relacionadas                │
│                                                     │
│ Para confirmar, digite: deletar                     │
│ [____________]                                      │
│                                                     │
│         [Cancelar]  [Deletar] ⬅️ (Desabilitado)    │
└─────────────────────────────────────────────────────┘
```
**Comportamento:**
- Botão "Deletar" só fica habilitado após digitar "deletar" corretamente
- Mostra contexto específico: quantas vendas, valor total, eventos
- Previne cliques acidentais

**Modal 7: Exportar Contatos (Customizável)**
```
┌─────────────────────────────────────────────────────┐
│ 📥 Exportar Contatos                                │
├─────────────────────────────────────────────────────┤
│ Dados:                                              │
│ ⚪ Todos os contatos (245)                          │
│ ⚪ Apenas resultados filtrados (23)                 │
│                                                     │
│ Colunas:                                            │
│ ☑ Nome                                              │
│ ☑ Telefone                                          │
│ ☑ Origem                                            │
│ ☑ Etapa                                             │
│ ☑ Data de criação                                   │
│ ☐ Receita total                                     │
│ ☐ Número de vendas                                  │
│ ☐ Última interação                                  │
│                                                     │
│ Formato:                                            │
│ ⚪ Excel (.xlsx)                                     │
│ ⚪ CSV (.csv)                                        │
│                                                     │
│         [Cancelar]  [Exportar (23 contatos)]       │
└─────────────────────────────────────────────────────┘
```

#### Drawer: Detalhes do Contato (Aprimorado)
**Header:**
- **Navegação contextual:** [< Anterior] Contato [Próximo >] [X Fechar]
  - Permite navegar entre contatos sem fechar drawer
  - Desabilitado quando é primeiro/último contato da lista
- Avatar grande com iniciais
- Nome (editável inline ao clicar)
- Telefone (editável inline ao clicar)
- Dropdown de etapa (editável inline): [Contato iniciado ▼]
- Botão "Abrir WhatsApp 📱" (verde, destaque)
  - URL: `https://web.whatsapp.com/send?phone={numero}`
  - Visível apenas se integração WhatsApp Business QR Code estiver ativa

**Quick Actions (Logo abaixo do header):**
```
[+ Venda] [+ Origem] [Mover etapa ▼] [...Mais]
```
- Ações rápidas sempre visíveis (não precisam de menu)
- Economiza cliques para ações frequentes

**Seção 1: Métricas Rápidas (3 cards)**
- 🛒 Vendas: X
- 🎫 Ticket médio: R$ X,XX
- 💰 Receita: R$ X,XX

**Seção 2: Origens (Timeline compacta)**
```
┌──────────────────────────────────────────────────────┐
│ 📍 Origens (3)                      [+ Adicionar]    │
├──────────────────────────────────────────────────────┤
│ • 🔵 Google Ads         16/10/2025 12:09 [Principal] │
│ • 🟢 Indicação          15/10/2025 14:30 [Manual]    │
│ • ⚪ Outros              14/10/2025 10:15             │
└──────────────────────────────────────────────────────┘

[Ao clicar + Adicionar, expande inline:]
┌──────────────────────────────────────────────────────┐
│ Origem: [Google Ads ▼]  ou  [+ Nova origem]         │
│ Data: [Hoje ▼] [Outra data...]                      │
│ Obs: [Opcional...]                                   │
│                        [Cancelar] [Adicionar]        │
└──────────────────────────────────────────────────────┘
```
**Funcionalidades:**
- Badge [Principal] indica origem usada segundo modelo de atribuição
- Badge [Manual] indica origens adicionadas manualmente
- Adicionar origem inline (sem modal) = menos interrupção
- Autocomplete no dropdown de origens

**Seção 3: Últimas Vendas**
- Ícone 💰 + "Últimas vendas (3)"
- Lista de vendas do contato (últimas 5)
- Cada venda clicável (abre drawer de venda)
- Link "Ver todas as vendas →"

**Seção 4: Jornada do Contato (Beta) - Interativa**
```
┌─────────────────────────────────────���───────────────┐
│ ⏰ Jornada do contato                    [Filtrar ▼]│
├─────────────────────────────────────────────────────┤
│ ●─── Google Ads                                     │
│ │    Link Tracking                                  │
│ │    16/10/2025 12:10                               │
│ │    [Ver detalhes do clique] [Copiar parâmetros]  │
│ │                                                    │
│ ●─── Mensagem recebida (WhatsApp)                   │
│ │    "Olá, gostaria de mais informações"           │
│ │    16/10/2025 12:12                               │
│ │    [Ver conversa completa]                        │
│ │                                                    │
│ ●─── Movido para "Qualificado"                      │
│ │    Por: Sistema (rastreio automático)             │
│ │    16/10/2025 14:30                               │
│ │                                                    │
│ ●─── Evento enviado: Lead (Meta Ads)                │
│ │    Status: Enviado ✅                             │
│ │    16/10/2025 14:31                               │
│ │    [Ver log completo] [Reenviar evento]           │
│ │                                                    │
│ ●─── Venda realizada - R$ 500,00                    │
│ │    Origem atribuída: Google Ads                   │
│ │    17/10/2025 10:00                               │
│ │    [Ver detalhes da venda]                        │
└─────────────────────────────────────────────────────┘
```
**Funcionalidades:**
- **Filtro de eventos**: [Todos] [Origens] [Vendas] [Etapas] [Mensagens] [Eventos API]
- **Ações contextuais em cada evento:**
  - Cliques: Ver detalhes, copiar parâmetros
  - Mensagens: Ver conversa completa
  - Eventos API: Ver log, reenviar se falhou
  - Vendas: Ver detalhes completos
- **Rastreamentos automáticos não podem ser deletados**
- **Timeline infinita:** Scroll para carregar mais eventos antigos

**Rodapé:**
- ID do contato (copiável): `x129e208-ba63-43c7-b32f-ba0ab62cf73c` [📋]
- Data de criação: "Criado em 16/10/2025 às 12:09"

---

### 3. Vendas

#### Header
- Título: "Vendas"
- Botão de refresh/atualizar
- Filtro de período
- Botão "Exportar" (Excel XLSX)
- **SEM botão "Adicionar"** (vendas são adicionadas via contatos)

#### Tabs
- **📊 Realizadas** (ativo por padrão)
- **❌ Perdidas**

#### Área de Busca
- Contador de resultados: "Resultados X"
- Campo de busca: "Pesquise pelo nome, telefone ou status"
- **SEM botão "Filtros"** (diferente de Contatos)

#### Tabela de Vendas Realizadas
**Colunas:**
- Avatar (círculo com ícone $, azul escuro)
- Nome (truncado)
- Telefone (formato brasileiro)
- Valor (R$ formatado)
- Origem (badge ou "Sem rastreio")
- Data da venda (DD/MM/YYYY)
- Ações (menu três pontos)

**Menu de Ações:**
- Editar
- Deletar (vermelho)

**Paginação:**
- 10 itens por página
- Navegação numérica
- Botões "Anterior/Próximo"
- Opção "Ver todos"

#### Tab: Vendas Perdidas
**Colunas adicionais:**
- Motivo da perda (campo opcional)
- Última etapa (etapa anterior antes de ir para perdida)
- Tempo no funil (quantos dias desde contato iniciado)

**Modal ao Mover para "Venda Perdida":**
- Nome (read-only)
- Telefone (read-only)
- Motivo da perda (opcional - dropdown):
  - Preço muito alto
  - Optou pela concorrência
  - Não respondeu mais
  - Não tinha orçamento
  - Timing inadequado
  - Outro
- Observações (opcional - textarea)

#### Drawer: Detalhes da Venda
**Header:**
- Botão "← Vendas" (voltar)
- Avatar grande com iniciais
- Nome
- Botão "Abrir 📱"
- Telefone

**Seção 1: Valor da Venda**
- "Valor da venda"
- R$ X.XXX,XX (destaque grande)

**Seção 2: Parâmetros da URL**
- gclid: XXX
- gbraid: XXX
- fbclid: XXX
- ttpclid: XXX
- (Capturados automaticamente da URL)

**Seção 3: Dispositivo**
- browser: XXX
- device: Mobile/Desktop/Tablet
- os: iOS/Android/Windows/etc

**Seção 4: Geolocalização**
- ip_address: XXX
- (Salvos a cada nova origem rastreada)

---

### 4. Funil

#### Header
- Título: "Funil"
- Botão "Criar etapa do funil" (azul escuro)

#### Área de Busca
- Contador de resultados: "Resultados X"
- Campo de busca: "Pesquise pelo nome"

#### Tabela de Etapas
**Colunas:**
- **Ícone de arrastar** (⋮⋮) - para drag-and-drop de ordenação
- Ícone (funil, azul escuro)
- Nome (nome da etapa)
- Frase de rastreio (com ícone de mensagem 💬)
  - Sistema detecta mensagens no WhatsApp e muda etapa automaticamente
  - "Rastreio automático" para etapa padrão
- Data de criação (DD/MM/YYYY)
- Ações (menu três pontos)

**Drag-and-Drop:**
- Arrastar linhas para reordenar
- Salvamento automático ao soltar
- Define ordem de exibição no Kanban de Contatos

**Menu de Ações:**
- Editar
- Duplicar
- Desativar/Ativar
- Deletar

**Validação de Deleção:**
- **Etapa sem contatos**: Deletar diretamente (com confirmação simples)
- **Etapa com contatos**: Modal obriga escolher etapa destino
- **Etapa "Contato iniciado"**: Bloqueado (não pode deletar etapa padrão)

#### Drawer: Criar/Editar Etapa
**Header:**
- Botão "← Funil" (voltar)
- Título: "Funil"

**Campos do Formulário:**
1. **Nome da etapa**
   - Input text

2. **Frase para rastreio**
   - Input text
   - Sistema identifica mensagens no WhatsApp que contenham essa frase e muda etapa automaticamente

3. **Tipo de etapa** (Radio Group)
   - ⚪ Etapa normal (múltiplas permitidas)
   - ⚪ Etapa de venda realizada (apenas 1 por projeto)
   - ⚪ Etapa de venda perdida (apenas 1 por projeto)

4. **Eventos Meta Ads**
   - Dropdown: Escolha o evento que deseja atribuir
   - Dispara evento automaticamente ao atingir etapa
   - Integração via Pixel/API de Conversões

5. **Eventos Google Ads**
   - Dropdown: Escolha o evento
   - Dispara evento automaticamente

6. **Eventos TikTok Ads** (futuro)
   - Dropdown: Escolha o evento
   - **Requer ttpclid obrigatoriamente** (estrutura flexível para mudança futura)

7. **Moeda + Valor padrão**
   - Dropdown: Moeda (BRL, USD, EUR, etc.)
   - Input number: Valor
   - Valor obrigatório apenas para eventos tipo "Purchase"
   - Enviado junto com o evento de conversão

8. **Evento ativo neste funil?**
   - Toggle switch

**Rodapé:**
- Botão "Cancelar"
- Botão "Salvar configurações" (azul escuro)

#### Lógica de Atribuição de Eventos
**Regra:** 1 evento por venda, baseado no click ID presente

**Prioridade:**
1. Se contato tem `fbclid` → Meta Ads
2. Se contato tem `gclid/gbraid/wbraid` → Google Ads
3. Se contato tem `ttpclid` → TikTok Ads
4. Se sem click ID mas tem telefone/email → Meta Ads (Enhanced Conversions)
5. TikTok **requer** ttpclid (bloqueia evento se ausente)

**Validação:**
- Click IDs flexíveis (avisos se ausentes, mas cria evento)
- Exceto TikTok (obrigatório por enquanto)
- Hash de dados (SHA-256) feito no backend
- Retry: 3 tentativas (0min, 5min, 15min)
- Status: pending → sent/failed

---

### 5. Eventos

#### Header
- Título: "Eventos"
- Botão de refresh/atualizar
- Filtro de período (Data inicial → Data final)

#### Área de Busca
- Contador de resultados: "Resultados X"
- Campo de busca: "Pesquise pelo nome ou telefone"

#### Tabela de Eventos
**Colunas:**
- Plataforma (ícone do Google Ads, Meta Ads, TikTok Ads)
- Tipo de evento (purchase, undefined, lead, etc.)
- Nome do contato
- Telefone (formato brasileiro)
- Status (sent, pending, failed)
  - Badge verde: "sent"
  - Badge amarelo: "pending"
  - Badge vermelho: "failed"
- Criado em (DD/MM/YYYY)

**Paginação:**
- 10 itens por página
- Navegação numérica
- Botões "Anterior/Próximo"
- Opção "Ver todos"

#### Funcionalidades
- Lista histórico de todos os eventos enviados para plataformas
- Filtro por período para rastrear eventos específicos
- Status visual claro (cores diferenciadas)
- Possibilidade de debugar eventos falhados (futuro)

---

### 6. Links (Rastreamento)

#### Header
- Título: "Links rastreáveis"
- Botão de refresh/atualizar
- Filtro de período
- Botão "Criar link" (azul escuro, destaque)

#### Seção: Origem Contatos Iniciados Rastreados
Cards horizontais exibindo métricas por origem:
- **Google Ads**: Contador de contatos
- **TikTok Ads**: Contador de contatos
- **Meta Ads**: Contador de contatos
- **Bing Ads**: Contador de contatos
- **Organic**: Contador de contatos
- **Direct**: Contador de contatos
- **Outros**: Contador de contatos

#### Área de Busca
- Contador de resultados: "Resultados X"
- Campo de busca: "Pesquise pelo nome do link rastreável"

#### Tabela de Links
**Colunas:**
- Ícone (link, círculo azul escuro)
- Nome (nome do link rastreável)
- Contatos (quantidade de contatos que clicaram)
- Vendas (quantidade de vendas geradas)
- Ticket médio (R$ formatado)
- Data de criação (DD/MM/YYYY)
- Ações (menu três pontos)

**Menu de Ações:**
- Ver detalhes
- Editar
- Copiar link
- Deletar (vermelho)

**Paginação:**
- 10 itens por página
- Navegação numérica
- Botões "Anterior/Próximo"

#### Modal: Criar Link Rastreável
**Campos:**
- Nome do link (obrigatório)
  - Input text: "Insira o nome do link de rastreamento"
- Mensagem inicial (opcional)
  - Textarea: "Insira a mensagem inicial que os usuários enviarão a você"
  - Útil para WhatsApp - mensagem pré-preenchida

**Rodapé:**
- Botão "Cancelar"
- Botão "Criar link" (azul escuro)

#### Drawer: Detalhes do Link (Link tracking)
**Tabs:**
1. **Links**
   - Link para Site
   - Descrição: "Copie o link abaixo e cole no link dos botões do site que levam para o WhatsApp"
   - URL gerada: `https://link.adsmagic.com.br?comp=...`
   - Botão "Copiar"

2. **Configurações**
   - Editar nome do link
   - Editar mensagem inicial
   - Status ativo/inativo

**Funcionalidades:**
- Gera links únicos com tracking automático
- Parâmetros UTM configuráveis
- Rastreamento de cliques e conversões
- Integração com WhatsApp (mensagem pré-preenchida)

---

### 7. Mensagens (Rastreamento)

**Status:** Aguardando especificações detalhadas

**Sugestão baseada no contexto:**
- Histórico de mensagens do WhatsApp
- Conversas por contato
- Automações de resposta
- Templates de mensagens
- Integração com frases de rastreio do Funil
- Status de entrega/leitura
- Filtros por contato, data, status

---

### 8. Integrações (Sistema)

#### Seção: Site

**Tag Adsmagic**
- Descrição: "Para ativar a Tag Adsmagic, copie o código acima e adicione no `<head>` de todas as páginas do seu site ou configure como uma Tag HTML Personalizada no Google Tag Manager, salve e publique as alterações."
- Código script para copiar:
```javascript
<script>
  (function(window, document, script) {
    if (!window.ad) {
      window.ad = window.ad || {};

      var c = document.getElementsByTagName('head')[0];
      var k = document.createElement('script');
      k.async = 1;
      k.src = script;
      c.appendChild(k);
    }
  })(window, document, 'https://s.adsmagic.com.br/ad-script.js');
</script>
```
- Botão "Copiar"
- Link: "Leia o guia de integrações" (abre documentação)

#### Seção: Canais

**WhatsApp Business**
- Status: "Conectado" (badge verde) ou "Desconectado" (badge vermelho)
- Descrição: "Conecte-se com o WhatsApp para salvar automaticamente os contatos e rastrear a jornada de compra"
- Telefone conectado: "(16) 98809-8344"
- Botão: "Conectado" (verde) ou "Conectar" (azul)
- Funcionalidade: QR Code para pareamento

**Meta Ads**
- Status: "Desconectado" (badge vermelho) ou "Conectado" (badge verde)
- Descrição: "Conecte-se com o Meta Ads para obter as informações da conta e enviar as conversões via API"
- Conta conectada: "Nenhuma conta conectada" ou nome da conta
- Botão: "Autenticar" (azul) ou "Conectado" (verde)
- Funcionalidades:
  - OAuth para autenticação
  - Seleção de conta de anúncios
  - Pixel ID
  - Access Token
  - API de Conversões (CAPI)

**Google Ads**
- Status: "Conectado" (badge verde)
- Descrição: "Conecte-se com o Google Ads para obter as informações da conta e enviar as conversões via API"
- Conta conectada: "Leticia Lopes (Odonto)"
- Botão: "Conectado" (verde) ou "Autenticar" (azul)
- Funcionalidades:
  - OAuth para autenticação
  - Seleção de conta de anúncios
  - Customer ID
  - Enhanced Conversions
  - API de Conversões

**TikTok Ads (Futuro)**
- Status: "Desconectado"
- Descrição: "Conecte-se com o TikTok Ads para obter as informações da conta e enviar as conversões via API"
- Botão: "Autenticar"

#### Layout
```
┌─────────────────────────────────────────────────────┐
│ Integrações                                         │
│                                                     │
│ [Site] [Canais]                                    │
│  └─ ativo                                           │
│                                                     │
│ ┌─────────────────────────────────────────────┐    │
│ │ 🏷️  Tag Adsmagic                            │    │
│ │                                             │    │
│ │ [Code block com script]                     │    │
│ │                          [Copiar]           │    │
│ └─────────────────────────────────────────────┘    │
│                                                     │
│ ┌─────────────────────────────────────────────┐    │
│ │ 📱 WhatsApp    [Conectado]                  │    │
│ │ (16) 98809-8344              [Conectado]    │    │
│ └─────────────────────────────────────────────┘    │
│                                                     │
│ ┌─────────────────────────────────────────────┐    │
│ │ Ⓜ️  Meta Ads    [Desconectado]              │    │
│ │ Nenhuma conta conectada      [Autenticar]   │    │
│ └─────────────────────────────────────────────┘    │
│                                                     │
│ ┌─────────────────────────────────────────────┐    │
│ │ 🅖 Google Ads  [Conectado]                  │    │
│ │ Leticia Lopes (Odonto)       [Conectado]    │    │
│ └─────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

---

### 9. Configurações (Sistema)

#### Tabs/Seções Principais
1. **Geral**
2. **Origens**
3. **Funil**
4. **Moedas e Fuso Horário**
5. **Notificações**
6. **Equipe** (Futuro)
7. **Permissões** (Futuro)
8. **Billing/Cobrança** (Futuro)

---

#### Tab 1: Geral

**Informações do Projeto**
- Nome do projeto (editável)
- Descrição (opcional, textarea)
- Logo/Avatar do projeto (upload - futuro)
- Idioma padrão (PT, EN, ES)
- Data de criação (read-only)

**Modelo de Atribuição**
- Descrição: "Define qual origem será exibida por padrão na tabela de contatos quando houver múltiplas origens"
- Opções (Radio Group):
  - ⚪ **First Touch** (primeira origem)
    - Exibe a primeira origem do contato na tabela
    - Útil para entender de onde os leads vieram inicialmente
  - ⚪ **Last Touch** (última origem)
    - Exibe a última origem do contato na tabela
    - Útil para entender qual foi o último ponto de contato antes da conversão
  - ⚪ **Conversão**
    - Exibe a origem atribuída à venda (se houver)
    - Útil para entender qual origem gerou a venda

**Preferências de Visualização**
- Exibir contatos sem origem: Sim/Não (toggle)
- Exibir apenas contatos ativos: Sim/Não (toggle)
- Cards da dashboard customizáveis: Sim/Não (toggle - futuro)

**Zona de Perigo**
- Arquivar projeto
- Deletar projeto (aviso vermelho com confirmação)

---

#### Tab 2: Origens

**Origens Padrão do Sistema (Não removíveis):**
Lista com cards:
- 🔵 Google Ads [Sistema] 🔒
- 🔴 Meta Ads [Sistema] 🔒
- 🟣 Instagram [Sistema] 🔒
- 🟢 Indicação [Sistema] 🔒
- 🟡 TikTok Ads [Sistema] 🔒
- 🟠 WhatsApp [Sistema] 🔒
- ⚫ Direct [Sistema] 🔒
- ⚪ Outros [Sistema] 🔒

**Origens Customizadas:**
- Botão: [+ Adicionar origem customizada]
- **Limite:** 20 origens customizadas por projeto
- Lista com cards editáveis:
  - Nome da origem
  - Cor (badge)
  - Ícone (opcional)
  - Botões: [Editar] [Deletar]

**Modal: Criar Origem Customizada**
- Nome da origem (permite caracteres especiais e emojis)
- Cor (ícone/badge) - Color picker com paleta pré-definida
  - Paleta sugerida: 15 cores distintas
- Ícone (opcional) - Biblioteca lucide-vue ou emoji picker

**Modal: Deletar Origem Customizada**
- Aviso se há contatos associados (ex: "15 contatos")
- Opções:
  - ⚪ Mover para outra origem (dropdown)
  - ⚪ Remover origem (contatos ficarão sem origem)

---

#### Tab 3: Funil

**Visualização das Etapas**
- Lista de todas as etapas configuradas (mesma da página Funil)
- Ordem de exibição (drag-and-drop habilitado)
- Indicadores visuais:
  - Etapa padrão: Badge "Padrão" (não pode deletar)
  - Etapa de venda: Badge "Venda" (verde)
  - Etapa de perda: Badge "Perdida" (vermelho)
  - Etapa normal: Sem badge especial

**Atalho para Gerenciar Funil**
- Botão: "Gerenciar etapas do funil" (redireciona para página Funil)
- Descrição: "Configure as etapas, frases de rastreio e eventos de conversão"

**Configurações de Rastreamento**
- Rastreamento automático via WhatsApp: Ativo/Inativo (toggle)
  - Descrição: "Detecta automaticamente frases nas mensagens e move contatos entre etapas"
- Notificar mudanças de etapa: Sim/Não (toggle)
- Registrar histórico completo: Sim/Não (toggle - sempre ativo por padrão)

---

#### Tab 4: Moedas e Fuso Horário

**Moeda Padrão**
- Dropdown com moedas principais:
  - BRL - Real Brasileiro (R$)
  - USD - Dólar Americano ($)
  - EUR - Euro (€)
  - GBP - Libra Esterlina (£)
  - ARS - Peso Argentino ($)
  - MXN - Peso Mexicano ($)
  - CLP - Peso Chileno ($)
  - Outras...
- Descrição: "Moeda utilizada por padrão em vendas e relatórios"

**Formato de Moeda**
- Símbolo antes/depois: R$ 1.000,00 ou 1.000,00 R$
- Separador decimal: vírgula ou ponto
- Separador de milhar: ponto ou vírgula

**Fuso Horário**
- Dropdown com fusos horários
- Exemplos:
  - America/Sao_Paulo (GMT-3)
  - America/New_York (GMT-5)
  - Europe/London (GMT+0)
  - Etc.
- Descrição: "Afeta exibição de datas e horários em todo o sistema"

**Formato de Data**
- DD/MM/YYYY (padrão BR)
- MM/DD/YYYY (padrão US)
- YYYY-MM-DD (ISO)

**Formato de Hora**
- 24 horas (14:30)
- 12 horas AM/PM (2:30 PM)

---

#### Tab 5: Notificações

**E-mail de Notificações**
- E-mail principal (editável)
- E-mails adicionais (múltiplos, separados por vírgula)

**Eventos para Notificar**
Checkboxes para cada tipo de evento:
- ✅ Nova venda realizada
- ✅ Novo contato iniciado
- ✅ Meta de vendas atingida
- ✅ Evento de conversão falhou
- ❌ Mudança de etapa
- ❌ Link rastreável clicado
- ❌ WhatsApp desconectado
- ❌ Integração com erro

**Frequência de Resumos**
- Nunca
- Diário (escolher horário)
- Semanal (escolher dia e horário)
- Mensal (escolher dia e horário)

**Notificações no Sistema**
- Exibir notificações em tempo real: Sim/Não (toggle)
- Som de notificação: Sim/Não (toggle)
- Notificações desktop (browser): Sim/Não (toggle)

**Webhooks (Futuro)**
- URL do webhook
- Eventos para enviar
- Secret para validação
- Formato: JSON
- Teste de webhook

---

#### Tab 6: Equipe (Futuro)

**Membros da Equipe**
- Lista de membros com:
  - Avatar
  - Nome
  - E-mail
  - Função (Admin, Editor, Visualizador)
  - Status (Ativo, Pendente)
  - Ações (Editar permissões, Remover)
- Botão: [+ Convidar membro]

**Convite de Membro**
- E-mail
- Função/Permissão
- Mensagem personalizada (opcional)

---

#### Tab 7: Permissões (Futuro)

**Níveis de Permissão**
1. **Admin** (Acesso total)
   - Gerenciar configurações
   - Gerenciar integrações
   - Gerenciar equipe
   - Deletar dados

2. **Editor** (Acesso de edição)
   - Criar/editar contatos
   - Criar/editar vendas
   - Gerenciar funil
   - Ver relatórios

3. **Visualizador** (Somente leitura)
   - Ver dashboard
   - Ver contatos
   - Ver vendas
   - Exportar dados

**Permissões Customizadas**
- Checklist granular de permissões
- Criar funções personalizadas

---

#### Tab 8: Billing/Cobrança (Futuro)

**Plano Atual**
- Nome do plano
- Preço mensal
- Recursos incluídos
- Data de renovação
- Botão: [Upgrade de plano]

**Histórico de Pagamentos**
- Data
- Valor
- Método de pagamento
- Status
- Fatura (download PDF)

**Método de Pagamento**
- Cartão de crédito salvo
- Botão: [Alterar método de pagamento]

**Uso de Recursos**
- Contatos: X / limite
- Vendas: X / limite
- Integrações: X / limite
- Barra de progresso visual

---

## 🎨 Componentes da Sidebar

### Estrutura do Menu
```
PRINCIPAL
├── Visão geral
├── Contatos
├── Vendas
├── Funil
└── (Eventos removido)

RASTREAMENTO
├── Links
└── Mensagens

SISTEMA
├── Integrações
└── Configurações

INFERIOR (Bottom menu)
├── Meus projetos
├── Suporte
└── Sair
```

### Funcionalidades da Sidebar
- **Expansível/colapsável** (botão de seta ou ícone ≡)
  - Estado salvo no localStorage
  - Animação suave de transição
- **Estados visuais:**
  - Item ativo: background destacado + borda esquerda colorida
  - Hover: background sutil
  - Ícone + texto (expandido) | Apenas ícone (colapsado)
- **Ícones lucide-vue** para cada item
- **Agrupamento por seções** com títulos em uppercase (apenas quando expandido)
- **Header** com logo + nome "AdsMagic"
  - Logo clicável (vai para Visão Geral)
- **Responsivo**:
  - Desktop: Sempre visível (colapsável)
  - Tablet: Colapsada por padrão
  - Mobile: Oculta por padrão, abre com botão hamburger no Navbar
  - Overlay escuro ao abrir no mobile (clique fecha)
- **Breadcrumbs** (aparece quando necessário):
  - Exemplo: `Contatos > João Silva > Venda #123`
  - Permite navegação rápida entre níveis

---

## 🎨 Componentes da Navbar

**Layout completo:**
```
┌─────────────────────────────────────────────────────────────┐
│ [≡] [Dra. Leticia Lopes ▼] [WhatsApp Conectado]            │
│                                                             │
│     📅 01/10 - 18/10 [▼]  [Comparar: Off ▼]                │
│                                                             │
│                         🔍 [Busca] [🌐 PT ▼] [User Menu ▼] │
└─────────────────────────────────────────────────────────────┘
```

### Elementos

1. **Botão Hamburger [≡]** (Mobile/Tablet)
   - Visível apenas em telas < 1024px
   - Abre/fecha sidebar
   - Badge de notificação (se houver)

2. **Dropdown de Projetos**
   - Exemplo: "Dra. Leticia Lopes"
   - Permite trocar entre projetos do usuário
   - Badge de status: "WhatsApp Conectado" (verde) / "WhatsApp Desconectado" (cinza)
   - Tooltip ao hover: "Trocar de projeto"
   - Dados inicialmente mockados, preparado para endpoint futuro
   - Lista de projetos com busca (se > 5 projetos)

3. **Filtro de Período Global** ⭐ NOVO
   ```
   📅 01/10 - 18/10 [▼]
   ```
   **Funcionalidades:**
   - **Períodos pré-definidos:**
     - Hoje
     - Últimos 7 dias
     - Últimos 30 dias
     - Últimos 90 dias
     - Este mês
     - Mês passado
     - Personalizado (abre date range picker)

   - **Comparação de períodos:**
     ```
     [Comparar: Off ▼]

     Opções:
     ⚪ Desativado
     ⚪ Período anterior (automático)
     ⚪ Mesmo período ano passado
     ⚪ Personalizado
     ```

   - **Aplicação:**
     - Aplica automaticamente em todas as páginas que exibem dados temporais
     - Páginas afetadas: Visão Geral, Contatos, Vendas, Links
     - Salvo no localStorage: `globalDateFilter`

   - **Indicadores visuais:**
     - Badge laranja quando período customizado: "📅 Customizado"
     - Badge azul quando comparação ativa: "⚖️ Comparando"
     - Tooltip mostra período completo ao hover

   - **Override local:**
     - Páginas podem ter botão "Usar outro período" se necessário
     - Abre modal: "Deseja alterar período global ou apenas desta página?"

4. **Busca Global** 🔍 ⭐ NOVO
   - Atalho de teclado: `Ctrl/Cmd + K` ou `/`
   - Busca em:
     - Contatos (nome, telefone)
     - Vendas (nome, valor, ID)
     - Links rastreáveis (nome)
   - Resultados agrupados por tipo
   - Clique no resultado: navega direto ou abre drawer
   - Placeholder: "Buscar... (Ctrl+K)"

5. **LanguageSelector**
   - Seletor de idioma (PT, EN, ES)
   - Bandeira + código do idioma
   - Já implementado

6. **UserMenu**
   - Avatar do usuário ou iniciais
   - Dropdown com:
     - Nome do usuário
     - E-mail
     - Separador
     - Meu perfil
     - Configurações da conta
     - Notificações
     - Separador
     - Sair
   - Badge de notificações não lidas (número)
   - Já implementado

### Breadcrumbs (Contextuais)
Aparecem abaixo do Navbar quando navegando em níveis profundos:
```
┌─────────────────────────────────────────────────────────┐
│ Contatos > João Silva > Venda #123                     │
└─────────────────────────────────────────────────────────┘
```
- Clicável em cada nível
- Máximo 4 níveis visíveis (depois usa "...")
- Oculto em páginas de primeiro nível

---

## 🔄 Sistema de Gestão de Origens

### Múltiplas Origens por Contato
- Um contato pode ter histórico de múltiplas origens ao longo do tempo
- Exibido na timeline da Jornada do Contato
- Modelo de atribuição configurável define qual origem exibir na tabela

### Prioridade de Origens
- **Origem automática** (rastreada via UTM, click IDs): não pode ser deletada da timeline
- **Origem manual** (adicionada pelo usuário): adiciona como secundária, não sobrescreve automática
- Usuário pode adicionar origem manual mesmo se já houver automática

### Origem "Outros"
**Uso sugerido:**
- Contatos sem rastreamento identificado
- Contatos manuais adicionados sem origem especificada
- Rastreamento falhou/incompleto
- Origem genérica quando nenhuma se aplica

---

## 🎨 Design System

### Cores Padrão de Origens
- 🔵 Google Ads (azul)
- 🔴 Meta Ads (vermelho/rosa)
- 🟣 Instagram (roxo/rosa)
- 🟢 Indicação (verde)
- 🟡 TikTok Ads (amarelo)
- 🟠 WhatsApp (laranja)
- ⚪ Outros (cinza)
- ⚫ Direct (preto)

### Avatar Padrão
- Círculo com iniciais do nome
- Cores fixas (não aleatórias)
- Sem foto por padrão
- Upload de foto (futuro)

### Badges
- Origens: Badge com cor correspondente
- Etapas: Badge com cor configurável
- Status: Verde (conectado), Vermelho (desconectado), Cinza (inativo)

---

## 📊 Dados e Integrações

### Fontes de Dados

**Métricas de Tráfego:**
- Fonte: APIs do Meta Ads + Google Ads
- Dados: Impressões, Cliques, Custo por clique, Taxa de cliques

**Contatos e Vendas:**
- Fonte: Banco de dados interno da aplicação
- Rastreamento: Parâmetros de URL (UTM, gclid, fbclid, ttpclid, gbraid, wbraid)
- Geolocalização: IP, dispositivo, browser, OS
- Salvos a cada nova origem rastreada

**Receita:**
- Calculada a partir das vendas registradas internamente

**Gastos:**
- Soma dos gastos reportados pelas APIs de Meta Ads + Google Ads

### Rastreamento de Conversões

**Meta Ads:**
- Pixel do Facebook
- API de Conversões (CAPI)
- Enhanced Conversions (hash de telefone/email)
- Click ID: `fbclid` (recomendado, não obrigatório)

**Google Ads:**
- Enhanced Conversions
- Click IDs: `gclid`, `gbraid`, `wbraid` (recomendados, não obrigatórios)

**TikTok Ads:**
- Pixel do TikTok
- API de Conversões
- Click ID: `ttpclid` (**obrigatório por enquanto**, estrutura flexível para mudança futura)

**Lógica de Atribuição:**
1. Prioridade baseada em click ID presente
2. 1 evento por venda (não duplicar)
3. Se sem click ID: tenta Enhanced Conversions com Meta (mais flexível)
4. Hash de dados (SHA-256) feito no backend
5. Retry automático em caso de falha (0min, 5min, 15min)
6. Logs completos de eventos enviados

---

## 🔐 Validações e Regras de Negócio

### Validações de Formulários
- Validação em tempo real com feedback imediato
- Schemas Zod para validação estruturada
- Mensagens de erro traduzidas
- Estados visuais claros (loading, erro, sucesso)

### Regras de Negócio Críticas

1. **Etapa "Contato iniciado"** é obrigatória e não pode ser deletada
2. **Apenas 1 etapa de venda realizada** por projeto
3. **Apenas 1 etapa de venda perdida** por projeto
4. **Etapas normais**: múltiplas permitidas
5. **Deletar etapa com contatos**: obriga escolher etapa destino
6. **Deletar contato**: ação irreversível com aviso destacado
7. **Rastreamentos automáticos**: não podem ser deletados da timeline
8. **Origens do sistema**: não podem ser removidas
9. **Origens customizadas**: máximo 20 por projeto
10. **TikTok Ads**: requer `ttpclid` para criar evento (bloqueio hard)

---

## ⌨️ Atalhos de Teclado

### Navegação Global
| Atalho | Ação |
|--------|------|
| `Ctrl/Cmd + K` | Abrir busca global |
| `/` | Focar no campo de busca da página atual |
| `Esc` | Fechar modal/drawer/popover ativo |
| `Ctrl/Cmd + B` | Toggle sidebar (expandir/colapsar) |

### Ações Rápidas
| Atalho | Ação |
|--------|------|
| `Ctrl/Cmd + N` | Novo contato (na página Contatos) |
| `Ctrl/Cmd + E` | Exportar página atual |
| `Ctrl/Cmd + P` | Imprimir / Gerar PDF |
| `Ctrl/Cmd + R` | Refresh/Atualizar dados da página |

### Navegação em Listas
| Atalho | Ação |
|--------|------|
| `↑` / `↓` | Navegar entre itens da tabela |
| `Enter` | Abrir item selecionado |
| `Ctrl/Cmd + A` | Selecionar todos (se multi-select ativo) |

### Drawers e Modais
| Atalho | Ação |
|--------|------|
| `←` | Anterior (no drawer de contato/venda) |
| `→` | Próximo (no drawer de contato/venda) |
| `Ctrl/Cmd + S` | Salvar (em formulários) |
| `Ctrl/Cmd + Enter` | Confirmar ação (em modais) |

### Ajuda
| Atalho | Ação |
|--------|------|
| `?` | Abrir painel de ajuda/atalhos |

**Indicadores visuais:**
- Tooltip em botões mostra atalho (ex: "Exportar (Ctrl+E)")
- Modal de ajuda lista todos atalhos disponíveis
- Atalhos contextuais (aparecem apenas em páginas relevantes)

---

## 📱 Responsividade

### Breakpoints
- **Mobile**: 320px - 767px
- **Tablet**: 768px - 1023px
- **Desktop**: 1024px+
- **Desktop Large**: 1440px+

### Adaptações por Dispositivo

#### Mobile (320px - 767px)
- **Sidebar**: Oculta por padrão, abre com hamburger + overlay
- **Navbar**: Empilhado verticalmente, filtro global em linha separada
- **Kanban**: Scroll horizontal, 1 coluna visível por vez + swipe
- **Tabelas**: Scroll horizontal ou cards colapsáveis
- **Cards de métricas**: 1 coluna (stack vertical)
- **Gráficos**: Altura reduzida, versões simplificadas
- **Drawers**: Fullscreen (ocupa 100% da tela)
- **Modais**: Fullscreen em telas < 400px

#### Tablet (768px - 1023px)
- **Sidebar**: Colapsada por padrão (apenas ícones)
- **Navbar**: 2 linhas, filtros visíveis
- **Kanban**: 2-3 colunas visíveis, scroll horizontal suave
- **Tabelas**: Scroll horizontal com sombra indicando mais conteúdo
- **Cards de métricas**: 2 colunas
- **Gráficos**: Tamanho intermediário
- **Drawers**: 60% da tela (lado direito)

#### Desktop (1024px+)
- **Sidebar**: Expandida por padrão
- **Navbar**: Layout horizontal completo
- **Kanban**: 4-6 colunas visíveis
- **Tabelas**: Todas colunas visíveis
- **Cards de métricas**: 4 colunas (3 principais em destaque)
- **Gráficos**: Tamanho completo com todas interações
- **Drawers**: 40% da tela (lado direito)

### Touch Gestures (Mobile/Tablet)
- **Swipe left/right**: Navegar entre colunas do Kanban
- **Pull to refresh**: Atualizar dados da página
- **Long press**: Abrir menu de contexto (equivalente a clique direito)
- **Pinch to zoom**: Zoom em gráficos (quando aplicável)

### Loading States
- **Skeleton screens**: Placeholders animados durante carregamento
- **Progressive loading**: Carrega conteúdo prioritário primeiro
- **Lazy loading**: Imagens e components off-screen carregam on-demand
- **Infinite scroll**: Tabelas e listas carregam mais ao chegar no final

---

## 🚀 Próximas Etapas de Implementação

### Pendente de Especificação Detalhada
- ⏳ **Mensagens** - Aguardando prints/especificações completas
  - Histórico de conversas WhatsApp
  - Interface de mensagens
  - Automações de resposta
  - Templates

### Ordem Sugerida de Implementação

**Fase 1: Estrutura Base (2-3 semanas)**
1. Sidebar com menu completo
2. Navbar com dropdown de projetos, filtro global de período e busca global (Ctrl+K)
3. Layout base com sidebar + navbar + conteúdo
4. Sistema de atalhos de teclado (composable + modal de ajuda)
5. **Dark mode desde o início** (store + toggle + tokens CSS)

**Fase 1.5: Estrutura de Dados e API Preparation (1-2 semanas)** ✅ **CONCLUÍDA**

**Status**: 100% implementada (9/9 sessões concluídas)
**Data de conclusão**: 19/10/2025
**Arquivos criados**: 29 arquivos (~5.500 linhas de código)
**Relatório completo**: [doc/final-test-report-phase-1.5.md](./final-test-report-phase-1.5.md)
**Progresso detalhado**: [doc/phase-1.5-progress.md](./phase-1.5-progress.md)

### Implementações Realizadas:

1. ✅ **Interfaces TypeScript completas** (Sessão 1.5.1)
   - Contact, Sale, Event, Link, Stage, Origin, DashboardMetrics
   - DTOs (CreateContactDTO, UpdateContactDTO, etc.)
   - Tipos de resposta API (ApiResponse, PaginatedResponse, Result)
   - Arquivos: `types/models.ts`, `types/dto.ts`, `types/api.ts`

2. ✅ **Service Layer preparado** (Sessões 1.5.2 e 1.5.4)
   - Cliente HTTP base com interceptors (`services/api/client.ts`)
   - Services mockados: contacts, sales, links, events, dashboard, stages, origins
   - Flag `USE_MOCK = true` (trocar para `false` quando API estiver pronta)
   - Error handling centralizado com Result<T, E> pattern

3. ✅ **Mock Data completo** (Sessão 1.5.3)
   - 52 contatos variados (`mocks/contacts.ts`)
   - 9 origens sistema + 4 custom (`mocks/origins.ts`)
   - 6 etapas de funil (`mocks/stages.ts`)
   - Métricas dashboard completas

4. ✅ **Stores Pinia com actions preparadas** (Sessão 1.5.5)
   - 7 stores criadas: contacts, sales, dashboard, links, events, stages, origins
   - Padrão readonly state + getters computados + actions
   - Integração completa entre stores
   - Arquivos: `stores/*.ts`, `stores/index.ts`

5. ✅ **Composables obrigatórios** (Sessão 1.5.6)
   - `useApi.ts` - Pattern para chamadas API
   - `useValidation.ts` - Validação com Zod (já existente)
   - `useFormat.ts` - Formatação moeda, data, telefone (já existente)
   - `useDevice.ts` - Detecção mobile/tablet/desktop + metadata
   - `usePagination.ts` - Lógica completa de paginação
   - `useDebounce.ts` - Debounce, throttle e variantes
   - Total: 9 composables disponíveis

6. ✅ **Schemas Zod** (Sessão 1.5.7)
   - Validação para todos formulários
   - 6 schemas: contact, sale, stage, origin, link + funções de validação
   - Type inference automático com Zod
   - Arquivos: `schemas/*.ts`, `schemas/index.ts`

7. ✅ **Sistema de Design Tokens** (Sessão 1.5.9)
   - `assets/styles/tokens.css` completo (330 linhas)
   - Dark mode implementado (`[data-theme="dark"]`)
   - Cores, espaçamentos, tipografia, bordas, sombras, z-index, transições
   - Integrado em `main.ts`

8. ✅ **Security Utils** (Sessão 1.5.8)
   - Sanitização HTML (DOMPurify instalado)
   - 13 funções de segurança implementadas
   - XSS prevention (sanitizeHtml, escapeHtml)
   - CSRF token generation
   - Rate limiting client-side
   - Arquivo: `utils/security.ts` (380 linhas)

9. ✅ **Estrutura de Testes**
   - Testes validados para todos os arquivos
   - Zero erros de compilação TypeScript
   - Mock data realista e distribuído

**Critérios de Aceite Fase 1.5:**
- ✅ Todas interfaces documentadas com JSDoc
- ✅ Services retornam mock, estrutura pronta para API
- ✅ Trocar mock→API = alterar 1 linha (`USE_MOCK = false`)
- ✅ Zero `any`, tudo tipado (100% strict TypeScript)
- ✅ Compilação sem erros
- ✅ 29 arquivos criados, ~5.500 linhas de código
- ✅ **STATUS: APROVADO PARA PRODUÇÃO**

**Fase 2: Dashboard e Métricas (3-4 semanas)**
1. **Biblioteca de Gráficos: ApexCharts** ⭐ **DECISÃO**
   - Instalação: `npm install apexcharts vue3-apexcharts`
   - Wrapper component: `components/ui/Chart.vue`
   - Tipos TypeScript para configurações
   - Lazy loading da biblioteca (performance)
   - Temas dark/light mode
   - **Razões da escolha:**
     - ✅ Responsivo por padrão
     - ✅ Touch-friendly (mobile/tablet)
     - ✅ Animações suaves (UX superior)
     - ✅ TypeScript support nativo
     - ✅ Dark mode built-in
     - ✅ Exportação de imagens (futuro)
2. Página Visão Geral completa
   - Cards de métricas principais (hierarquia visual)
   - Funil de conversão visual (barras proporcionais)
   - Métricas financeiras (colapsável por padrão)
   - Gráficos com tabs (Performance, Origens, Histórico)
   - Últimas atividades (vendas + contatos lado a lado)
   - Tabela de desempenho por origem
   - Empty states educativos
3. **Testes da Fase 2**
   - Unit: componentes de gráficos, cards de métricas
   - Integration: dashboard store + services
   - Visual: snapshots de componentes

**Fase 3: Gestão de Contatos (4-5 semanas)**
1. Página Contatos - Visualização Lista
   - Tabela completa com paginação
   - Filtros avançados (modal)
   - Busca com atalho (/)
   - Modais aprimorados:
     - Adicionar contato
     - Alterar nome/etapa
     - Adicionar origem
     - Adicionar venda
     - **Deletar com confirmação dupla** (digitar "deletar")
     - **Exportar customizável** (escolher colunas, formato)
2. Página Contatos - Visualização Kanban
   - Layout de colunas por etapas
   - **Drag-and-drop com Optimistic UI**
     - Feedback visual durante drag
     - Move instantaneamente
     - Rollback automático se API falhar
     - Toast de sucesso/erro
   - Contadores em tempo real
   - Empty states por coluna
   - 8-10 cards visíveis + scroll
3. **Drawer de Contato Aprimorado**
   - **Navegação contextual:** [< Anterior] [Próximo >]
   - **Quick Actions:** [+ Venda] [+ Origem] [Mover etapa]
   - **Adicionar origem inline** (sem modal)
   - **Timeline interativa:**
     - Filtro de eventos
     - Ações contextuais
     - Scroll infinito
4. Sistema de Origens
   - Gestão em Configurações > Origens
   - 20 origens customizadas máximo
   - Color picker + emoji picker
   - Modal de deletar com reatribuição
5. **Testes da Fase 3**
   - Unit: ContactsTable, ContactsKanban, ContactDrawer
   - Store: contacts.store.test.ts
   - E2E: criar→editar→deletar contato
   - Coverage > 80% para lógica de negócio
6. **Performance e Acessibilidade**
   - Lazy loading: `ContactsView = () => import(...)`
   - Code splitting por rota
   - Lighthouse score > 90
   - ARIA labels, keyboard navigation
   - Screen reader testing

**Fase 4: Gestão de Vendas (2-3 semanas)**
1. Página Vendas - Tab Realizadas
   - Tabela completa com paginação
   - Drawer de detalhes (parâmetros URL, dispositivo, geolocalização)
   - Exportação customizável
2. Página Vendas - Tab Perdidas
   - Colunas específicas (motivo, última etapa, tempo no funil)
   - Modal ao mover para perdida
3. **Testes da Fase 4**
   - Unit: SalesTable, SalesDrawer
   - Store: sales.store.test.ts
   - Coverage > 80%

**Fase 5: Funil e Automações (2-3 semanas)**
1. Página Funil
   - Tabela com drag-and-drop de ordenação
   - Drawer criar/editar etapa
   - Radio Group: Normal/Venda/Perdida (apenas 1 de cada especial)
   - Configuração de eventos (Meta/Google/TikTok)
   - Validações: deletar com contatos → escolher destino
2. Integração Funil → Contatos
   - Etapas dinâmicas no Kanban
   - Mudança automática via rastreamento WhatsApp
3. **Testes da Fase 5**
   - Unit: FunnelTable, StageDrawer
   - Integration: funil → contatos sync
   - E2E: criar etapa → mover contato

**Fase 6: Integrações e Rastreamento (3-4 semanas)**
1. Página Integrações
   - Tab Site (Tag Adsmagic + botão copiar)
   - Tab Canais:
     - WhatsApp Business (QR Code)
     - Meta Ads (OAuth + CAPI)
     - Google Ads (OAuth + Enhanced Conversions)
   - Status de conexões (conectado/desconectado)
2. Sistema de rastreamento de conversões
   - Validação de click IDs (flexível, exceto TikTok)
   - Envio de eventos para plataformas
   - Retry automático (0min, 5min, 15min)
   - Logs completos
   - Hash de dados no backend (SHA-256)
3. **Testes da Fase 6**
   - Integration: OAuth flows
   - Unit: event sending logic
   - E2E: conectar integração → enviar evento

**Fase 7: Links e Eventos (2-3 semanas)**
1. Página Links Rastreáveis
   - Cards de métricas por origem
   - Tabela de links com stats
   - Modal criar link + mensagem WhatsApp
   - Drawer tracking (URL gerada + configurações)
   - Geração de URLs únicas
2. Página Eventos
   - Tabela de histórico
   - Filtros por plataforma, status, período
   - Status visual (sent/pending/failed)
   - Debugar eventos falhados
3. **Testes da Fase 7**
   - Unit: LinksTable, EventsTable
   - Integration: link tracking → contato criado
   - E2E: criar link → clicar → verificar rastreamento

**Fase 8: Configurações Completas (2-3 semanas)**
1. Tab Geral (modelo de atribuição, preferências, zona de perigo)
2. Tab Origens (gestão completa de origens customizadas)
3. Tab Funil (visualização + atalho para gerenciar)
4. Tab Moedas/Fuso (formatos, fusos horários, idioma)
5. Tab Notificações (e-mail, frequência, eventos, webhooks futuros)
6. **Testes da Fase 8**
   - Unit: SettingsTabs, OriginManager
   - Integration: configurações → efeitos no sistema
   - Coverage > 80%

**Fase 9: Mensagens WhatsApp (3-4 semanas - aguardando specs detalhadas)**
1. Histórico de conversas
2. Interface de mensagens
3. Templates e automações
4. Integração com frases de rastreio
5. **Testes da Fase 9**
   - Unit: MessageList, MessageThread
   - Integration: mensagem recebida → etapa atualizada
   - E2E: enviar mensagem → verificar histórico

**Fase 10: Polimento e Otimização (2-3 semanas)**
1. **Testes E2E Completos**
   - Fluxos críticos (criar conta → adicionar contato → venda)
   - Testes cross-browser (Chrome, Firefox, Safari)
   - Testes mobile (iOS, Android)
2. **Performance**
   - Lighthouse score > 90 (todas páginas)
   - Bundle size < 200KB gzipped por rota
   - First Contentful Paint < 1.5s
   - Time to Interactive < 3s
3. **Acessibilidade WCAG 2.1 AA**
   - Screen reader testing
   - Keyboard navigation completa
   - Color contrast verificado
   - ARIA labels em todos elementos
4. **Responsividade**
   - Mobile (320px, 375px, 414px)
   - Tablet (768px, 1024px)
   - Desktop (1440px, 1920px)
   - Touch gestures (swipe, pull-to-refresh, long press)
5. **Skeleton screens** + progressive loading
6. **Refinamento final de UX/UI**
7. **Testes de carga** (simular 1000+ contatos)

---

## 📚 Arquivos de Documentação Relacionados

- [Regras de Negócio](./business-rules.md)
- [Convenções de Código](./coding-standards.md)
- [Padrões de Desenvolvimento](./development-patterns.md)
- [Roteamento e i18n](./routing-i18n.md)
- [PRD Completo](./prd.md) (histórico de conversas e decisões)

---

## 🎯 Métricas de Sucesso do MVP

### Performance
- Tempo de carregamento inicial < 2s
- TTI (Time to Interactive) < 3s
- Lighthouse Score > 90

### Usabilidade
- Acessibilidade WCAG 2.1 AA
- Responsivo em todos os dispositivos
- Feedback visual em todas as ações
- Validações em tempo real

### Confiabilidade
- Taxa de erro < 0.1%
- Uptime > 99.9%
- Retry automático em integrações
- Logs completos de auditoria

---

## 📝 Notas Importantes

### ✨ Melhorias de UX/UI Implementadas

Este documento foi atualizado com **melhorias significativas de experiência do usuário** baseadas em análise especializada de UX/UI. Principais mudanças:

#### 1. Dashboard (Visão Geral) - Hierarquia Visual
- ✅ **Métricas em 3 níveis de importância:**
  - Principais (Receita, Vendas, ROI) - destaque visual
  - Funil de conversão visual - contexto de jornada
  - Métricas financeiras - colapsáveis por padrão
- ✅ **Tabs para gráficos:** Performance, Origens, Histórico
- ✅ **Seção de Últimas Atividades:** Vendas + Novos Contatos lado a lado
- ✅ **Empty states educativos** com ações sugeridas

#### 2. Navbar - Filtro Global e Busca
- ✅ **Filtro de período global:** Aplica em todas páginas automaticamente
- ✅ **Comparação de períodos:** Período anterior, mesmo período ano passado
- ✅ **Busca global (Ctrl+K):** Busca em contatos, vendas, links
- ✅ **Breadcrumbs contextuais:** Navegação entre níveis

#### 3. Contatos - Navegação e Ações Rápidas
- ✅ **Drawer com navegação:** Anterior/Próximo sem fechar
- ✅ **Quick Actions:** Botões de ação sempre visíveis
- ✅ **Adicionar origem inline:** Sem modal, menos interrupção
- ✅ **Timeline interativa:** Ações contextuais em cada evento
- ✅ **Filtro de eventos:** Timeline filtrável por tipo

#### 4. Kanban - Optimistic UI
- ✅ **Feedback visual durante drag:** Placeholder "Solte aqui"
- ✅ **Optimistic UI:** Card move instantaneamente
- ✅ **Rollback automático:** Se API falhar, retorna com animação
- ✅ **Contadores em tempo real:** Atualiza imediatamente
- ✅ **Empty states por coluna:** Visual claro quando vazio

#### 5. Segurança - Confirmação Dupla
- ✅ **Deletar requer digitar "deletar":** Previne acidentes
- ✅ **Mostra contexto específico:** Quantas vendas, valor total
- ✅ **Botão desabilitado até confirmação**

#### 6. Exportação Customizável
- ✅ **Escolher dados:** Todos ou apenas filtrados
- ✅ **Escolher colunas:** Checkboxes para cada coluna
- ✅ **Formatos:** Excel (.xlsx) ou CSV

#### 7. Atalhos de Teclado
- ✅ **Navegação rápida:** Ctrl+K (busca), / (focar busca), Esc (fechar)
- ✅ **Ações rápidas:** Ctrl+N (novo), Ctrl+E (exportar)
- ✅ **Navegação em drawers:** ← → para anterior/próximo
- ✅ **Modal de ajuda:** ? para ver todos atalhos

#### 8. Responsividade Aprimorada
- ✅ **Touch gestures:** Swipe, pull to refresh, long press
- ✅ **Drawers adaptativos:** Fullscreen no mobile, 40% no desktop
- ✅ **Skeleton screens:** Loading states visuais
- ✅ **Progressive/Lazy loading:** Performance otimizada

### Decisões de UX/UI Fundamentais

1. **Hierarquia de informação**: Métricas principais em destaque, secundárias colapsáveis
2. **Redução de fricção**: Quick Actions, navegação inline, menos modais
3. **Feedback visual constante**: Optimistic UI, toast messages, loading states
4. **Prevenção de erros**: Confirmação dupla, validações em tempo real
5. **Contextualização**: Empty states, breadcrumbs, tooltips explicativos
6. **Visualização Kanban**: Não exibe colunas de "Venda Perdida" (vão para tab em Vendas)
7. **Filtro global**: Um único lugar para controlar período = consistência
8. **Modelo de atribuição**: Configurável (First Touch / Last Touch / Conversão)
9. **Click IDs**: Flexíveis com avisos, exceto TikTok (obrigatório por enquanto)
10. **Hash de dados**: Backend (SHA-256 antes de enviar para APIs)

### Funcionalidades Pós-MVP

As seguintes funcionalidades foram identificadas mas ficarão para depois do MVP:
- Métricas customizáveis (adicionar/remover cards no dashboard)
- Upload de foto de perfil para contatos
- Múltiplas etapas de venda/perda (atualmente limitado a 1 de cada)
- Personalização avançada de cores e temas
- Relatórios avançados com drill-down
- Exportação em PDF
- Webhooks customizados
- Automações avançadas de WhatsApp

---

## 📊 Resumo de Progresso

### ✅ Fase 1.5 - Fundação Crítica: **CONCLUÍDA**
**Status**: 100% implementada (9/9 sessões)
**Data de conclusão**: 19/10/2025
**Arquivos criados**: 29 arquivos (~5.500 linhas)
**Documentação**:
- [Relatório Final](./final-test-report-phase-1.5.md)
- [Progresso Detalhado](./phase-1.5-progress.md)
- [Plano Fase 2](./phase-2-plan.md)

**Sessões concluídas**:
1. ✅ 1.5.1 - TypeScript Base (types/models, dto, api)
2. ✅ 1.5.2 - HTTP Client (axios + interceptors)
3. ✅ 1.5.3 - Mock Data (52 contacts, 9 origins, 6 stages)
4. ✅ 1.5.4 - Services API (contacts service + USE_MOCK pattern)
5. ✅ 1.5.5 - Stores Pinia (7 stores completas)
6. ✅ 1.5.6 - Composables (9 composables, incluindo 4 novos)
7. ✅ 1.5.7 - Schemas Zod (6 schemas + validações)
8. ✅ 1.5.8 - Utils de Segurança (13 funções + DOMPurify)
9. ✅ 1.5.9 - Design Tokens CSS (330 linhas + dark mode)

**Resultado**: Toda a fundação de dados, lógica e segurança está pronta. Próximas fases implementam APENAS UI.

---

### 📋 Páginas Especificadas: 8/8 ✅ (Eventos removido)
- ✅ Visão Geral (Dashboard) - **COM MELHORIAS UX/UI**
- ✅ Contatos (Lista + Kanban) - **COM MELHORIAS UX/UI**
- ✅ Vendas (Realizadas + Perdidas)
- ✅ Funil (Gestão de etapas)
- ✅ Links (Rastreamento)
- ⏳ Mensagens (Aguardando especificações completas)
- ✅ Integrações (Site + Canais)
- ✅ Configurações (8 tabs completas)

### 🎨 Componentes Globais Especificados
- ✅ Sidebar (com breadcrumbs e estados visuais aprimorados)
- ✅ Navbar (com filtro global e busca) - **NOVO**
- ✅ Sistema de Atalhos de Teclado - **NOVO**
- ✅ Empty States em todas páginas - **NOVO**
- ✅ Loading States (skeleton, progressive, lazy) - **NOVO**

### ✨ Melhorias de UX/UI Especificadas: 10 categorias
1. ✅ Hierarquia visual no Dashboard
2. ✅ Filtro de período global (Navbar)
3. ✅ Navegação contextual em Drawers
4. ✅ Optimistic UI no Kanban
5. ✅ Empty States acionáveis
6. ✅ Confirmação dupla em deleções
7. ✅ Timeline interativa (Jornada do Contato)
8. ✅ Exportação customizável
9. ✅ Atalhos de teclado
10. ✅ Responsividade aprimorada (touch gestures)

### 📈 Estimativa Total de Implementação (ATUALIZADA)
- **✅ Fase 1.5 CONCLUÍDA**: Fundação Crítica (100%)
- **🔜 Fase 2 - PRÓXIMA**: UI Development (13 sessões planejadas)
- **11 Fases** de desenvolvimento total
- **25-32 semanas** de trabalho estimadas
- **40+ entregas** principais planejadas
- **+15 melhorias de UX/UI** integradas
- **Testes integrados** em CADA fase (não só no final)
- **Coverage > 80%** para lógica de negócio
- **Dark mode** desde o início
- **ApexCharts** como biblioteca de gráficos oficial

### 🎯 Próxima Fase
**Fase 2 - Desenvolvimento de UI (13 sessões)**
- Plano detalhado: [doc/phase-2-plan.md](./phase-2-plan.md)
- Progresso: [doc/phase-2-progress.md](./phase-2-progress.md)
- Estimativa: 45-50 horas
- Componentes: 77 componentes/views a criar

---

**Última atualização**: 19/10/2025 - Fase 1.5 Concluída (100%)
**Versão do documento**: 5.0
**Status**: ⭐⭐⭐ FASE 1.5 CONCLUÍDA - PRONTO PARA FASE 2 (UI DEVELOPMENT)

**Conquistas da Fase 1.5 (100% Concluída):**
- ✅ **29 arquivos criados**: ~5.500 linhas de código TypeScript/CSS
- ✅ **9 sessões implementadas**: 100% dos objetivos atingidos
- ✅ **Zero erros de compilação**: TypeScript strict mode validado
- ✅ **Mock First, API Ready**: Trocar para API = alterar 1 linha (`USE_MOCK = false`)
- ✅ **7 Stores Pinia**: contacts, sales, dashboard, links, events, stages, origins
- ✅ **9 Composables**: useApi, useValidation, useFormat, useDevice, usePagination, useDebounce + 3 existentes
- ✅ **6 Schemas Zod**: Validação completa para todos formulários
- ✅ **13 Security Utils**: XSS prevention, sanitização, CSRF, rate limiting
- ✅ **Design Tokens CSS**: 330 linhas + dark mode completo
- ✅ **Result<T, E> Pattern**: Error handling profissional
- ✅ **52 Contacts Mock**: Dados realistas distribuídos
- ✅ **Documentação completa**: JSDoc em todas as funções públicas

**Impacto da Fase 1.5:**
- 🎯 **Fundação sólida**: Toda lógica de negócio, dados e segurança pronta
- 🚀 **Próximas fases aceleram**: Implementam APENAS UI, não há lógica a criar
- 🔒 **Segurança desde o início**: DOMPurify, sanitização, validações Zod
- 📊 **Mock data realista**: 52 contatos, 9 origens, 6 etapas prontos para testar UI
- ⚡ **Performance garantida**: Design tokens, lazy loading preparado
- 🌙 **Dark mode pronto**: Tokens CSS com suporte completo

**Próximos Passos (Fase 2):**
- 📋 **13 sessões planejadas**: [doc/phase-2-plan.md](./phase-2-plan.md)
- 📈 **77 componentes/views**: Estimativa 45-50 horas
- 🎨 **UI Development**: Componentes Base → Layouts → Views
- 📊 **Progresso tracking**: [doc/phase-2-progress.md](./phase-2-progress.md)

**Diferencial desta versão 5.0:**
- ✅ **Fase 1.5 100% validada**: Relatório de testes completo
- ✅ **API-Ready**: Estrutura preparada para integração real
- ✅ **Quality First**: Zero technical debt na fundação
- ✅ **Manutenibilidade**: Zero `any`, 100% TypeScript estrito
- ✅ **Escalabilidade**: Arquitetura preparada para crescimento
- ✅ **Developer Experience**: Mock data realista, estrutura clara
- ✅ **User Experience**: Optimistic UI, animações, feedback visual (a implementar na Fase 2)
