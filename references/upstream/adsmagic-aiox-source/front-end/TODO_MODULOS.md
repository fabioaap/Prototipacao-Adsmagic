# TODO por Módulo - Frontend

> **Status**: Análise baseada na estrutura atual do projeto  
> **Atualizado**: 2026-01-16 (com verificação de integração Supabase MCP)  
> **Objetivo**: Lista de tarefas organizadas por módulo para completar a implementação seguindo SOLID, Clean Code e TypeScript strict

---

## 📊 Estado da Integração Backend

### ✅ Edge Functions Disponíveis (8)
| Function | Status | Usado pelo Frontend |
|----------|--------|---------------------|
| projects | ✅ Ativa | ✅ Sim |
| companies | ✅ Ativa | ✅ Sim |
| contacts | ✅ Ativa | ✅ Sim |
| sales | ✅ Ativa | ✅ Sim |
| integrations | ✅ Ativa | ✅ Sim |
| dashboard | ✅ Ativa | ⚠️ Parcial (faltam endpoints V2) |
| messaging | ✅ Ativa | ✅ Sim |
| messaging-webhooks | ✅ Ativa | ✅ Sim |

### ❌ Edge Functions Faltantes no Backend
| Function | Frontend Precisa | Backend Status |
|----------|------------------|----------------|
| origins | ✅ CRUD completo | ❌ Não existe (usar `execute_sql` por agora) |
| stages | ✅ CRUD completo | ❌ Não existe (usar `execute_sql` por agora) |
| trackable-links | ✅ CRUD + tracking | ❌ Tabela não existe |
| events | ✅ Conversões | ❌ Tabela não existe |
| tags | ✅ Categorização | ❌ Tabela não existe |

### ⚠️ Tipos Desatualizados
- `origins` e `stages` **não estão** nos tipos gerados do Supabase
- Frontend deve usar tipos manuais até backend atualizar `database.types.ts`

---

## 📋 Índice de Módulos

1. [Núcleo / Infraestrutura](#núcleo--infraestrutura)
2. [Autenticação (Auth)](#autenticação-auth)
3. [Onboarding](#onboarding)
4. [Project Wizard](#project-wizard)
5. [Dashboard / Analytics](#dashboard--analytics)
6. [Companies](#companies)
7. [Projects](#projects)
8. [Contacts](#contacts)
9. [Events](#events)
10. [Integrations](#integrations)
11. [Sales](#sales)
12. [Tracking](#tracking)
13. [Settings (Funnel/Origins/Stages)](#settings-funneloriginsstages)
14. [Messages](#messages)
15. [UI / Design System / Componentes](#ui--design-system--componentes)
16. [Stores / Composables](#stores--composables)
17. [Schemas / Types](#schemas--types)
18. [Testes / QA](#testes--qa)

---

## Núcleo / Infraestrutura

### Prioridade: 🔴 CRÍTICA

**Responsabilidades:**
- Camada única de integração via `apiClient` (`services/api/client.ts`)
- Tratamento centralizado de erros e timeouts
- Gerenciamento de autenticação e tokens
- Configuração de build e deploy

**TODOs:**

#### ✅ Integrações API
- [ ] Garantir que **TODOS** os módulos usam `apiClient` como camada única de rede
- [ ] Remover chamadas diretas a `fetch`, `axios` ou `supabase-js` em views/stores
- [ ] Validar que nenhum módulo cria instâncias próprias de HTTP client
- [ ] Implementar tratamento consistente de timeout (padrão: 10s, configurável por endpoint)
- [ ] Padronizar tratamento de erros 4xx/5xx com mensagens amigáveis para usuário
- [ ] Adicionar retry logic para operações críticas (configurável)

#### ✅ Autenticação e Sessão
- [ ] Validar que `ensureSession` cobre todos os cenários de renovação de token
- [ ] Garantir que OAuth callbacks não perdem sessão (já implementado no `waitForSessionRestore`)
- [ ] Testar fluxo completo de expiração e renovação automática
- [ ] Adicionar fallback para quando refresh token falha (redirecionar para login)

#### ✅ Configuração e Build
- [ ] Validar configuração do build no Cloudflare (comando deve ser `pnpm build` com typecheck)
- [ ] Garantir que variáveis de ambiente estão documentadas em `.env.example`
- [ ] Corrigir `wrangler.toml` ou remover se não for usado para Pages
- [ ] Validar que `apiClient` usa corretamente `VITE_API_BASE_URL`

#### ✅ Tratamento de Erros
- [ ] Criar sistema centralizado de logging sem PII (usar `ErrorHandler.ts`)
- [ ] Padronizar formatos de erro entre frontend e backend
- [ ] Implementar notificações consistentes para usuário (toast/alert)
- [ ] Garantir que detalhes técnicos ficam apenas no console em produção

---

## Autenticação (Auth)

### Prioridade: 🔴 CRÍTICA

**Responsabilidades:**
- Login, registro, recuperação de senha
- OAuth (Google, Meta, TikTok via callbacks)
- Verificação de email e OTP
- Proteção de rotas e guards

**TODOs:**

#### ✅ Fluxos de Autenticação
- [ ] Validar que todos os fluxos (login, register, forgot-password, reset-password) funcionam end-to-end
- [ ] Testar fluxo de verificação de email (EmailConfirmationView)
- [ ] Validar OTP verification (VerifyOtpView)
- [ ] Garantir que OAuth callbacks (OAuthCallback) restauram sessão corretamente
- [ ] Testar logout completo (limpar todos os stores e sessão)

#### ✅ Estados e UX
- [ ] Garantir estados loading/error/success em **todas** as views de auth
- [ ] Adicionar validação de formulários com feedback visual (Zod schemas)
- [ ] Implementar mensagens de erro amigáveis (sem expor detalhes técnicos)
- [ ] Validar que erros de rede/timeout são tratados com UX apropriada
- [ ] Garantir que loading states impedem múltiplos submits

#### ✅ Segurança
- [ ] Validar que tokens nunca são expostos em logs ou URLs
- [ ] Garantir que senhas não são expostas em nenhum momento (incluindo dev tools)
- [ ] Implementar rate limiting no frontend (debounce em submits)
- [ ] Validar CSRF protection se aplicável

#### ✅ Guards e Rotas
- [ ] Testar `localeGuard` e `projectGuard` em todos os cenários
- [ ] Validar redirecionamentos após login (manter URL original se existir)
- [ ] Garantir que rotas protegidas redirecionam corretamente para login
- [ ] Testar fluxo de onboarding obrigatório após primeiro login

---

## Onboarding

### Prioridade: 🟡 MÉDIA

**Responsabilidades:**
- Guia de primeiro uso (tipo de empresa, franquias, nome)
- Validações de negócio
- Persistência de progresso parcial

**TODOs:**

#### ✅ Fluxo de Onboarding
- [ ] Validar sequência de steps (StepCompanyType → StepFranchiseCount → StepFranchiseName)
- [ ] Implementar persistência de progresso parcial (localStorage ou backend)
- [ ] Garantir que usuário pode retornar ao onboarding sem perder dados
- [ ] Validar regras de negócio (ex: tipo de empresa determina opções de franquias)

#### ✅ Estados e Validações
- [ ] Garantir estados loading/error/success em cada step
- [ ] Implementar validações com feedback visual (Zod schemas)
- [ ] Adicionar mensagens de erro contextuais por campo
- [ ] Validar que dados são salvos antes de avançar step

#### ✅ Integração com Backend
- [ ] Validar que `onboardingService` salva dados corretamente
- [ ] Testar criação de company após onboarding completo
- [ ] Garantir que onboarding não pode ser pulado (guards funcionam)

---

## Project Wizard

### Prioridade: 🟡 MÉDIA

**Responsabilidades:**
- Assistente de criação de projeto (6 steps)
- Configuração de plataforma, campanhas, links trackáveis, WhatsApp
- Validações e pré-requisitos entre steps

**TODOs:**

#### ✅ Fluxo de Wizard
- [ ] Validar sequência completa (StepProjectInfo → StepPlatformSelection → StepMetaCampaignType → StepPlatformConfig → StepTrackableLinks → StepWhatsApp)
- [ ] Implementar validação de pré-requisitos entre steps
- [ ] Garantir que usuário pode voltar steps anteriores sem perder dados
- [ ] Validar que dados são persistidos em `projectWizardStore`

#### ✅ Integrações por Step
- [ ] **StepProjectInfo**: Validar criação de projeto no backend
- [ ] **StepPlatformSelection**: Validar seleção de plataformas (Meta, Google, TikTok)
- [ ] **StepMetaCampaignType**: Validar tipos de campanha Meta
- [ ] **StepPlatformConfig**: Validar configuração de credenciais/contas
- [ ] **StepTrackableLinks**: Validar criação de links trackáveis
- [ ] **StepWhatsApp**: Validar integração WhatsApp (QR code, status)

#### ✅ Estados e Validações
- [ ] Garantir estados loading/error/success em cada step
- [ ] Implementar validações com feedback visual
- [ ] Adicionar indicação de progresso (ex: "Step 3 de 6")
- [ ] Validar que dados são salvos antes de finalizar wizard

#### ✅ Completion Flow
- [ ] Validar `CompletionView` exibe dados do projeto criado
- [ ] Testar redirecionamento para dashboard após conclusão
- [ ] Garantir que projeto aparece na lista imediatamente

---

## Dashboard / Analytics

### Prioridade: 🟡 MÉDIA

**Responsabilidades:**
- Dashboard V2 (nova versão com KPIs North Star)
- Métricas, gráficos, funil de conversão
- Filtros globais (período, origem, comparação)
- Drill-down em métricas

**TODOs:**

#### ✅ Integração de Dados
- [ ] Validar que `dashboardV2Service` busca dados reais do backend
- [ ] Remover fallback para mocks em produção
- [ ] Garantir que `getSummary`, `getFunnelStats`, `getPipelineStats` funcionam
- [ ] Validar `getOriginBreakdown` e `getTimeSeries` para gráficos
- [ ] Implementar `getDrillDownEntities` para detalhamento

#### ✅ Componentes Core
- [ ] **KpiCard**: Validar exibição de métricas com delta e tooltip
- [ ] **DashboardFiltersBar**: Validar filtros globais e persistência
- [ ] **InsightsRow**: Validar insights acionáveis (cliques funcionam)
- [ ] **EmptyState**: Validar mensagens contextuais com CTAs

#### ✅ Componentes Diagnósticos
- [ ] **AcquisitionPanel**: Validar métricas de aquisição (impressions, clicks, CTR, CPC)
- [ ] **FunnelPanel**: Validar funil de conversão com cliques em estágios
- [ ] **PipelinePanel**: Validar pipeline de vendas com métricas de tempo/valor

#### ✅ Estados e UX
- [ ] Garantir estados loading/empty/error/success em dashboard completo
- [ ] Implementar skeleton loaders para métricas
- [ ] Validar que filtros atualizam todos os componentes sincronizadamente
- [ ] Adicionar debounce em filtros de período para evitar requests excessivos

#### ✅ Drill-down
- [ ] Validar `EntityListDrawer` abre ao clicar em métrica
- [ ] Testar filtros no drill-down (contatos/deals filtrados)
- [ ] Garantir que navegação do drawer funciona (voltar, fechar)

---

## Companies

### Prioridade: 🟢 BAIXA

**Responsabilidades:**
- Configurações da empresa (CompanySettingsView)
- Formulários de edição
- Validações de dados

**TODOs:**

#### ✅ Integração com Backend
- [ ] Validar que `companiesService` busca e atualiza dados corretamente
- [ ] Testar atualização de configurações com feedback ao usuário
- [ ] Garantir que erros de validação são exibidos adequadamente

#### ✅ Componentes
- [ ] **CompanyFormModal**: Validar formulário completo
- [ ] **CompanyList**: Validar listagem (se aplicável)
- [ ] **CompanySelector**: Validar seleção de empresa

#### ✅ Estados e Validações
- [ ] Garantir estados loading/error/success
- [ ] Implementar validações com feedback visual
- [ ] Adicionar confirmação antes de salvar mudanças críticas

---

## Projects

### Prioridade: 🔴 CRÍTICA (Bloqueador de Build)

**Responsabilidades:**
- Listagem de projetos (ProjectsView)
- Tabela com métricas (investimento, receita, contatos, vendas, taxa de conversão, ticket médio)
- Filtros e ações (criar, editar, excluir)

**TODOs:**

#### ✅ Correção de Tipos (BLOQUEADOR)
- [ ] **CRÍTICO**: Corrigir tipo `Project` para incluir propriedades usadas:
  - [ ] `investment` (número)
  - [ ] `revenue` (número)
  - [ ] `contacts_count` (número)
  - [ ] `sales_count` (número)
  - [ ] `conversion_rate` (número, percentual)
  - [ ] `average_ticket` (número)
- [ ] Atualizar adapters para mapear corretamente dados do backend
- [ ] Validar que tipos estão sincronizados com schemas Zod

#### ✅ Integração com Backend
- [ ] Validar que `projectsService` busca projetos corretamente
- [ ] Testar criação de projeto via `CreateProjectModal`
- [ ] Validar que métricas são calculadas/carregadas corretamente
- [ ] Garantir que filtros funcionam (se aplicável)

#### ✅ Componentes
- [ ] **ProjectsTable**: Corrigir exibição de métricas (dependente de tipos)
- [ ] **ProjectsFilters**: Validar filtros funcionam
- [ ] **ProjectsMetrics**: Validar métricas agregadas
- [ ] **CreateProjectModal**: Validar formulário completo

#### ✅ Estados e UX
- [ ] Garantir estados loading/empty/error/success
- [ ] Implementar skeleton loaders para tabela
- [ ] Adicionar paginação se houver muitos projetos
- [ ] Validar que ações (editar, excluir) têm confirmação

---

## Contacts

### Prioridade: 🟡 MÉDIA

**Responsabilidades:**
- Listagem de contatos (ContactsView)
- Filtros, busca, importação/exportação
- Kanban e timeline de atividades
- Formulários de criação/edição

**TODOs:**

#### ✅ Funcionalidades Core
- [ ] Validar busca com debounce funciona corretamente
- [ ] Implementar importação de contatos (CSV/Excel)
- [ ] Validar exportação de contatos
- [ ] Garantir que filtros são aplicados corretamente

#### ✅ Componentes
- [ ] **ContactsList**: Validar listagem e paginação
- [ ] **ContactsKanban**: Validar kanban por estágio (se aplicável)
- [ ] **ContactsFilters**: Validar filtros avançados
- [ ] **ContactFormModal**: Validar criação/edição
- [ ] **ContactImportModal**: Validar importação
- [ ] **ContactDetailsDrawer**: Validar detalhes completos
- [ ] **ActivityTimeline**: Validar timeline de atividades

#### ✅ Integração com Backend
- [ ] Validar que `contactsService` busca contatos corretamente
- [ ] Testar criação/edição de contatos
- [ ] Validar que atividades são carregadas (se aplicável)

#### ✅ Estados e UX
- [ ] Garantir estados loading/empty/error/success
- [ ] Implementar skeleton loaders
- [ ] Adicionar debounce em busca (300ms recomendado)
- [ ] Validar que mensagens de erro são amigáveis

#### ✅ Performance
- [ ] Implementar virtualização se houver muitos contatos
- [ ] Validar que paginação funciona corretamente
- [ ] Garantir que filtros não fazem requests excessivos

---

## Events

### Prioridade: 🔴 CRÍTICA (Bloqueador de Build)

**Responsabilidades:**
- Listagem de eventos (EventsView, EventsList)
- Agrupamento por entidade/tipo
- Filtros e busca
- Timeline e replay

**TODOs:**

#### ✅ Correção de Tipos e Estado (BLOQUEADOR)
- [ ] **CRÍTICO**: Declarar `expandedGroups` corretamente (ref reativo ou store)
- [ ] **CRÍTICO**: Implementar ou remover funções não usadas:
  - [ ] `toggleGroup` - se não usado, remover
  - [ ] `isGroupExpanded` - se não usado, remover
  - [ ] `expandAllGroups` - se não usado, remover
  - [ ] `collapseAllGroups` - se não usado, remover
  - [ ] `getEventIcon` - se não usado, remover
  - [ ] `getEntityLabel` - se não usado, remover
  - [ ] `getStatusIcon` - se não usado, remover
  - [ ] `handleViewDetails` - se não usado, remover ou implementar
  - [ ] `handleRetry` - se não usado, remover ou implementar
  - [ ] `handleExport` - se não usado, remover ou implementar
  - [ ] `handlePageChange` - se não usado, remover ou implementar
- [ ] Remover imports não usados: `Search`, `Eye`, `RefreshCw`, `Input`

#### ✅ Funcionalidades Core
- [ ] Implementar agrupamento de eventos por entidade/tipo
- [ ] Validar expansão/colapso de grupos funciona
- [ ] Implementar busca e filtros
- [ ] Validar paginação (se aplicável)

#### ✅ Componentes
- [ ] **EventsList**: Corrigir lógica de agrupamento e estado
- [ ] **EventCard**: Validar exibição de evento
- [ ] **EventTimeline**: Validar timeline (se aplicável)
- [ ] **EventDetailsModal**: Validar modal de detalhes
- [ ] **EventReplayPanel**: Validar replay (se aplicável)
- [ ] **EventsFilters**: Validar filtros

#### ✅ Integração com Backend
- [ ] Validar que `eventsService` busca eventos corretamente
- [ ] Testar filtros de período, tipo, entidade
- [ ] Validar que agrupamento funciona com dados reais

#### ✅ Estados e UX
- [ ] Garantir estados loading/empty/error/success
- [ ] Implementar skeleton loaders
- [ ] Adicionar indicadores de carregamento incremental (se paginação)

---

## Integrations

### Prioridade: 🟡 MÉDIA

**Responsabilidades:**
- Gerenciamento de integrações (Google, Meta, TikTok, WhatsApp)
- Callbacks OAuth
- Status de conexão e saúde
- Logs de sincronização

**TODOs:**

#### ✅ OAuth Callbacks
- [ ] Validar `GoogleCallbackView` funciona end-to-end
- [ ] Validar `MetaCallbackView` funciona end-to-end
- [ ] Validar `TikTokCallbackView` funciona end-to-end
- [ ] Garantir que callbacks restauram sessão corretamente
- [ ] Testar tratamento de erros em callbacks (token inválido, cancelado)

#### ✅ Componentes
- [ ] **IntegrationCard**: Validar exibição de integração
- [ ] **IntegrationStatusBadge**: Validar status (conectado, desconectado, erro)
- [ ] **OAuthFlowButton**: Validar fluxo OAuth completo
- [ ] **WhatsAppQRModal**: Validar QR code e status de conexão
- [ ] **IntegrationHealthDashboard**: Validar dashboard de saúde (se aplicável)
- [ ] **IntegrationSyncLogs**: Validar logs de sincronização (se aplicável)
- [ ] **WebhooksManager**: Validar gerenciamento de webhooks (se aplicável)

#### ✅ Integração com Backend
- [ ] Validar que `integrationsService` lista integrações corretamente
- [ ] Testar conexão/desconexão de integrações
- [ ] Validar que status é atualizado em tempo real (se aplicável)

#### ✅ Estados e UX
- [ ] Garantir estados loading/error/success
- [ ] Implementar feedback visual durante OAuth flow
- [ ] Adicionar confirmação antes de desconectar integração
- [ ] Validar que erros são exibidos de forma amigável

#### ✅ Limpeza de Código
- [ ] Remover imports não usados em `IntegrationsView`: `Send`, `Linkedin`, `Clock`, `Badge`, `DashboardSection`, `IntegrationsMetrics`, `IntegrationHealthDashboard`, `IntegrationSyncLogs`, `WebhooksManager`
- [ ] Remover variáveis não usadas: `syncLogs`

---

## Sales

### Prioridade: 🟡 MÉDIA

**Responsabilidades:**
- Listagem de vendas (SalesView, SalesList)
- Funil de vendas (SalesFunnelChart)
- Alertas de follow-up (SalesFollowUpAlert)
- Modal de perda (SaleLostModal)
- Métricas e filtros

**TODOs:**

#### ✅ Funcionalidades Core
- [ ] Implementar ações não usadas ou remover:
  - [ ] `handleViewDetails` em `SalesList` - implementar ou remover
- [ ] Validar funil de vendas exibe dados corretamente
- [ ] Implementar alertas de follow-up com urgência
- [ ] Validar modal de perda salva motivo corretamente

#### ✅ Componentes
- [ ] **SalesList**: Corrigir ações e estados
- [ ] **SalesFunnelChart**: Validar gráfico de funil
- [ ] **SalesFollowUpAlert**: Validar alertas (implementar `getUrgencyColor` se necessário)
- [ ] **SaleLostModal**: Validar modal completo
- [ ] **SaleFormModal**: Validar criação/edição
- [ ] **SaleDetailsDrawer**: Validar detalhes
- [ ] **SalesFilters**: Validar filtros
- [ ] **SalesMetrics**: Validar métricas

#### ✅ Integração com Backend
- [ ] Validar que `salesService` busca vendas corretamente
- [ ] Testar criação/edição de venda
- [ ] Validar que funil é calculado corretamente
- [ ] Testar atualização de estágio (incluindo perda)

#### ✅ Estados e UX
- [ ] Garantir estados loading/empty/error/success
- [ ] Implementar skeleton loaders
- [ ] Adicionar confirmação antes de marcar venda como perdida
- [ ] Validar que alertas são exibidos corretamente

#### ✅ Limpeza de Código
- [ ] Remover imports não usados: `Eye`, `Button` em `SalesList`
- [ ] Remover `Skeleton` não usado em `SalesFollowUpAlert`
- [ ] Remover `CardDescription` não usado em `SalesFunnelChart`
- [ ] Remover `Alert` não usado em `SaleLostModal`

---

## Tracking

### Prioridade: 🟡 MÉDIA

**Responsabilidades:**
- Listagem de links trackáveis (TrackingView, LinksList)
- Criação/edição de links (LinkFormModal)
- Métricas de tracking (TrackingMetrics)
- QR codes e estatísticas

**TODOs:**

#### ✅ Funcionalidades Core
- [ ] Validar criação/edição de links trackáveis
- [ ] Implementar geração de QR code (se aplicável)
- [ ] Validar exibição de métricas (cliques, conversões, etc.)
- [ ] Implementar estatísticas detalhadas (se aplicável)

#### ✅ Componentes
- [ ] **LinksList**: Validar listagem (remover `BarChart3` não usado)
- [ ] **LinkFormModal**: Validar formulário (remover `t` não usado se não necessário)
- [ ] **TrackingMetrics**: Validar métricas (remover `cn` não usado)
- [ ] **LinkCard**: Validar card de link
- [ ] **LinkStatsDrawer**: Validar estatísticas detalhadas
- [ ] **QRCodeModal**: Validar QR code

#### ✅ Integração com Backend
- [ ] Validar que `linksService` ou `trackingService` busca links corretamente
- [ ] Testar criação/edição de link
- [ ] Validar que métricas são atualizadas em tempo real (se aplicável)

#### ✅ Estados e UX
- [ ] Garantir estados loading/empty/error/success
- [ ] Implementar skeleton loaders
- [ ] Adicionar validação de URLs no formulário
- [ ] Validar que métricas são formatadas corretamente

---

## Settings (Funnel/Origins/Stages)

### Prioridade: 🔴 CRÍTICA (Bloqueador de Build)

**Responsabilidades:**
- Gerenciamento de origens (OriginsView)
- Gerenciamento de estágios/funil (FunnelView)
- Configurações gerais (SettingsView)
- Validações e CRUD completo

**TODOs:**

#### ✅ Correção de Tipos (BLOQUEADOR)
- [ ] **CRÍTICO**: Atualizar tipos do Supabase para incluir tabelas `origins` e `stages`
  - [ ] Gerar tipos atualizados do Supabase ou criar tipos manuais alinhados com backend
  - [ ] Validar que tipos `SupabaseOrigin` e `SupabaseStage` correspondem aos dados reais
  - [ ] Corrigir adapters para mapear corretamente dados do backend para tipos frontend
- [ ] **CRÍTICO**: Corrigir conversões de tipo em `origins.ts`:
  - [ ] Linha 98, 131, 178, 218: conversão de dados do Supabase para `SupabaseOrigin[]`
  - [ ] Usar `unknown` primeiro se necessário: `as unknown as SupabaseOrigin[]`
- [ ] **CRÍTICO**: Corrigir conversões de tipo em `stages.ts`:
  - [ ] Linha 101, 134, 193, 235: conversão para `SupabaseStage[]`
  - [ ] Linha 173: propriedade `display_order` não existe no tipo retornado
  - [ ] Validar que campos `project_id`, `display_order`, `color`, `tracking_phrase` existem no backend

#### ✅ Funcionalidades Core
- [ ] Implementar CRUD completo de origens
- [ ] Implementar CRUD completo de estágios
- [ ] Validar ordenação de estágios (`display_order`)
- [ ] Testar criação/edição/exclusão com validações

#### ✅ Componentes
- [ ] **OriginsList**: Validar listagem
- [ ] **OriginFormModal**: Validar formulário completo
- [ ] **OriginCard**: Validar card
- [ ] **StagesList**: Validar listagem ordenada
- [ ] **StageFormDrawer**: Validar formulário completo
- [ ] **StageCard**: Validar card

#### ✅ Integração com Backend
- [ ] Validar que `originsService` busca/origins corretamente
- [ ] Validar que `stagesService` busca estágios corretamente
- [ ] Testar criação/edição/exclusão de origem
- [ ] Testar criação/edição/exclusão de estágio
- [ ] Validar que ordenação de estágios funciona (drag-and-drop ou input numérico)

#### ✅ Estados e UX
- [ ] Garantir estados loading/empty/error/success
- [ ] Implementar validações com feedback visual
- [ ] Adicionar confirmação antes de excluir origem/estágio
- [ ] Validar que erros são exibidos de forma amigável

---

## Messages

### Prioridade: 🟢 BAIXA

**Responsabilidades:**
- Listagem de mensagens (MessagesList)
- Formulário de envio (MessageFormModal)
- Métricas (MessagesMetrics)

**TODOs:**

#### ✅ Funcionalidades Core
- [ ] Validar listagem de mensagens
- [ ] Implementar envio de mensagem (se aplicável)
- [ ] Validar métricas exibidas

#### ✅ Componentes
- [ ] **MessagesList**: Validar listagem
- [ ] **MessageFormModal**: Validar formulário
- [ ] **MessagesMetrics**: Validar métricas

#### ✅ Integração com Backend
- [ ] Validar que `messagesService` busca mensagens corretamente
- [ ] Testar envio de mensagem (se aplicável)

#### ✅ Estados e UX
- [ ] Garantir estados loading/empty/error/success
- [ ] Implementar skeleton loaders
- [ ] Adicionar validação de formulário

---

## UI / Design System / Componentes

### Prioridade: 🟡 MÉDIA

**Responsabilidades:**
- Componentes reutilizáveis (ui/)
- Design system consistente
- Acessibilidade (A11y)
- Consistência visual

**TODOs:**

#### ✅ Limpeza de Imports
- [ ] Remover imports não usados em **todos** os componentes
- [ ] Validar que `cn` (className utility) é usado apenas onde necessário
- [ ] Remover imports de ícones não utilizados

#### ✅ Acessibilidade
- [ ] Garantir que **todos** os inputs têm `label` associado via `for` ou `aria-labelledby`
- [ ] Adicionar `aria-*` attributes onde necessário (aria-describedby, aria-invalid, aria-required)
- [ ] Validar foco gerenciado em modais/drawers (trap focus, restore focus ao fechar)
- [ ] Garantir navegação por teclado (Tab/Shift+Tab, Enter, Escape)
- [ ] Validar que indicadores não dependem apenas de cor (adicionar ícones/texto)

#### ✅ Componentes UI
- [ ] Validar que componentes base (Button, Input, Dialog, etc.) seguem padrão consistente
- [ ] Garantir que componentes têm variantes documentadas (se Storybook)
- [ ] Validar que componentes são reutilizáveis (não acoplados a contexto específico)

#### ✅ Storybook
- [ ] Corrigir import de `@storybook/vue3` em `SearchInput.stories.ts` ou remover se não usado
- [ ] Validar que stories estão atualizadas com componentes

#### ✅ Consistência Visual
- [ ] Validar que espaçamentos seguem design system (Tailwind config)
- [ ] Garantir que cores seguem tema consistente
- [ ] Validar que tipografia está padronizada

---

## Stores / Composables

### Prioridade: 🟡 MÉDIA

**Responsabilidades:**
- Estado global (Pinia stores)
- Composables reutilizáveis
- Lógica de negócio isolada
- Type safety

**TODOs:**

#### ✅ Limpeza de Imports
- [ ] Remover imports não usados:
  - [ ] `PaginatedResponse` não usado em `events.ts` e `sales.ts`
- [ ] Validar que todos os imports são necessários

#### ✅ Type Safety
- [ ] Garantir que stores têm tipos bem definidos (não `any`)
- [ ] Validar que composables retornam tipos corretos
- [ ] Testar que state mutations são type-safe

#### ✅ SRP (Single Responsibility)
- [ ] Validar que cada store tem responsabilidade única
- [ ] Garantir que composables não misturam responsabilidades
- [ ] Refatorar stores que violam SRP (dividir em stores menores)

#### ✅ Testes
- [ ] Adicionar testes unitários para stores críticos
- [ ] Testar composables com casos happy e edge
- [ ] Validar que mocks funcionam corretamente

---

## Schemas / Types

### Prioridade: 🔴 CRÍTICA (Bloqueador de Build)

**Responsabilidades:**
- Contratos de dados (Zod schemas)
- Tipos TypeScript
- Adapters entre backend e frontend
- Versionamento de contratos

**TODOs:**

#### ✅ Alinhamento com Backend
- [ ] Validar que schemas Zod correspondem aos contratos do backend
- [ ] Atualizar tipos TypeScript para refletir schemas
- [ ] Garantir que adapters mapeiam corretamente dados do backend para tipos frontend

#### ✅ Tipos do Supabase
- [ ] **CRÍTICO**: Atualizar tipos gerados do Supabase ou criar tipos manuais
- [ ] Validar que tabelas `origins` e `stages` estão nos tipos
- [ ] Garantir que campos usados no frontend existem nos tipos

#### ✅ Versionamento
- [ ] Documentar mudanças de contrato no CHANGELOG (seção "Contratos")
- [ ] Validar que breaking changes criam nova versão
- [ ] Garantir que adapters lidam com versões antigas (se necessário)

#### ✅ Validações
- [ ] Validar que schemas Zod são usados em formulários
- [ ] Testar que validações funcionam corretamente
- [ ] Garantir que mensagens de erro são amigáveis

---

## Testes / QA

### Prioridade: 🟡 MÉDIA

**Responsabilidades:**
- Testes unitários
- Testes de componente
- Testes E2E
- Coverage mínimo

**TODOs:**

#### ✅ Testes Unitários
- [ ] Adicionar 1 teste unitário para cada adapter crítico (happy + edge cases)
- [ ] Adicionar 1 teste unitário para cada composable crítico (happy + edge cases)
- [ ] Validar que mocks funcionam corretamente
- [ ] Garantir coverage mínimo de 70% em código crítico

#### ✅ Testes de Componente
- [ ] Adicionar 1 teste de componente para cada view crítica cobrindo:
  - [ ] Estado loading → sucesso
  - [ ] Estado loading → erro
  - [ ] Estado empty
- [ ] Testar interações do usuário (cliques, submits, navegação)

#### ✅ Testes E2E
- [ ] Validar que testes E2E existentes passam
- [ ] Adicionar testes E2E para fluxos críticos (login, criação de projeto, dashboard)

#### ✅ Lint e Typecheck
- [ ] Garantir que `pnpm lint` passa sem warnings novos
- [ ] Validar que `pnpm typecheck` passa (dependente de correção de tipos)
- [ ] Configurar CI para bloquear PRs com warnings/erros

---

## 🎯 Priorização Geral

### 🔴 CRÍTICA (Bloqueadores)
1. **Projects**: Correção de tipos `Project` (propriedades faltantes)
2. **Events**: Correção de variáveis não definidas e funções não usadas
3. **Settings (Origins/Stages)**: Correção de tipos do Supabase e conversões

### 🟡 MÉDIA (Importante)
4. **Núcleo**: Garantir uso exclusivo de `apiClient`
5. **Auth**: Validar fluxos end-to-end
6. **Dashboard**: Integração com dados reais
7. **Contacts**: Funcionalidades core
8. **Sales**: Ações e estados
9. **Integrations**: OAuth callbacks
10. **UI/A11y**: Acessibilidade básica

### 🟢 BAIXA (Desejável)
11. **Onboarding**: Melhorias de UX
12. **Project Wizard**: Validações avançadas
13. **Companies**: Features adicionais
14. **Messages**: Funcionalidades completas
15. **Testes**: Coverage completo

---

## 📝 Notas Finais

- **Não quebrar nada**: Todas as mudanças devem ser testáveis em staging e rollbackáveis
- **TypeScript strict**: Eliminar todos os erros de typecheck antes de produção
- **Contratos**: Mudanças em contratos devem ser versionadas e documentadas no CHANGELOG
- **SOLID**: Manter SRP, OCP, LSP, ISP, DIP em todas as mudanças
- **Clean Code**: Nomenclatura clara, funções pequenas, código autodocumentado
