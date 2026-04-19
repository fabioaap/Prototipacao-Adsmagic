# Plano de integração: Dashboard V2 com dados reais

**Rota em produção:** `/:locale/projects/:projectId/dashboard-v2`  
**Exemplo:** `http://localhost:5173/pt/projects/2beb5e6f-5eb8-4642-bdce-ad275655ef08/dashboard-v2`

---

## Alterações realizadas até o momento

| Data / Etapa | O que foi feito |
|--------------|------------------|
| **Etapa 1 – Concluída** | Summary da dashboard passou a usar a API real (GET `/dashboard/summary` + adapter). |
| **Etapa 2 – Concluída** | Time series: backend agrega contacts/sales por dia em `timeSeries.ts`; store chama `getTimeSeries` em `loadDashboardData`; serviço usa GET `dashboard/time-series` + adapter; gráfico “Contatos e Vendas” usa dados reais. |
| **Etapa 3 – Concluída** | Origens: backend `originPerformance.ts` agrega por origem (origins + contacts + sales); serviço GET `dashboard/origin-performance` + adapter; store chama `fetchOriginsPerformance` em `loadDashboardData`; donuts e tabela com dados reais; empty/loading. |
| **Etapa 4 – Concluída** | Funil de conversão: store chama `getFunnelStats(requestFilters)` em `loadDashboardData`; serviço GET `dashboard/funnel-stats` com query `period` + adapter `mapBackendFunnelStatsToFunnelStageStats`; view usa `funnelStats`, `funnelTotalContacts`, `funnelOverallConversionRate`; loading e empty "Nenhum dado de funil no período". |
| **Adapter** | `dashboardV2Adapter.ts`: (1) `BackendSummaryResponse` e `mapBackendSummaryToDashboardV2Summary` (GET `/dashboard/summary` → `DashboardV2Summary`; northStar com `displayValue`, `tooltip`, `goalPercentage` 0–1; `insights: []`). (2) `BackendTimeSeriesDay` e `mapBackendTimeSeriesToTimeSeriesPoints` (GET `/dashboard/time-series` → `TimeSeriesPoint[]`; `value` = contacts, `compareValue` = sales). (3) `BackendOriginPerformanceRow` e `mapBackendOriginPerformanceToOriginPerformance` (GET `/dashboard/origin-performance` → `OriginPerformance[]`). (4) `BackendFunnelStatsResponse`/`BackendFunnelStage` e `mapBackendFunnelStatsToFunnelStageStats` (GET `/dashboard/funnel-stats` → `FunnelStageStats[]`; `avgDays` → `avgTimeInStage`). |
| **Serviço** | `dashboardV2.ts`: `USE_MOCK` só quando `VITE_USE_MOCK_DASHBOARD === 'true'`. `getSummary()` → GET `/dashboard/summary`; `getTimeSeries()` → GET `/dashboard/time-series`; `getOriginsPerformance()` → GET `/dashboard/origin-performance` com `period`; `getFunnelStats()` → GET `/dashboard/funnel-stats` com `period`, retorna `FunnelStatsResult` (stages, totalContacts, overallConversionRate); respostas passadas pelos adapters. |
| **Barrel** | Export em `adapters/index.ts`: `mapBackendSummaryToDashboardV2Summary`, `BackendSummaryResponse`, `mapBackendTimeSeriesToTimeSeriesPoints`, `BackendTimeSeriesDay`, `mapBackendOriginPerformanceToOriginPerformance`, `BackendOriginPerformanceRow`, `mapBackendFunnelStatsToFunnelStageStats`, `BackendFunnelStatsResponse`, `BackendFunnelStage`. |
| **Backend time-series** | `dashboard/handlers/timeSeries.ts`: agregação diária de `contacts` (created_at) e `sales` (date, status completed); retorno `{ date, contacts, sales, revenue }[]`; query `period` e opcionalmente `start_date`/`end_date`. |
| **Backend origin-performance** | `dashboard/handlers/originPerformance.ts`: agregação por origem (origins + contacts + sales no período); retorno `{ originId, originName, originType, spend, contacts, sales, revenue, conversionRate, cac, roi }[]`; query `period`. |
| **Store** | `loadDashboardData()` chama `getSummary`, `getTimeSeries`, `fetchOriginsPerformance`, `getFunnelStats` e `getPipelineStats` em paralelo (`Promise.allSettled`); popula `summary`, `timeSeries`, `originsPerformance`, `funnelStats`, `funnelTotalContacts`, `funnelOverallConversionRate`, `pipelineStats`; limpa timeSeries, originsPerformance, funnelStats e pipelineStats no início do load; erro em uma requisição não impede as outras. |
| **View** | `timelineData` usa `dashboardStore.timeSeries` quando houver dados; fallback mock local quando vazio; formatação dd/MM/yyyy com ano real. Donuts "Vendas por origem" e "Receita por origem" derivados de `originsPerformance`; totais reais; empty state e loading por bloco. Tabela de origens sem fetch no mount (dados vêm de `loadDashboardData`). **Funil de conversão**: bloco dinâmico a partir de `funnelStats`, `funnelTotalContacts`, `funnelOverallConversionRate`; loading (skeleton) e empty "Nenhum dado de funil no período"; acessibilidade (aria-labelledby, role list/listitem). **Pipeline de vendas**: bloco com `PipelinePanel` usando `pipelineStats`; loading e empty "Nenhuma etapa do pipeline disponível"; drill-down ao clicar em estágio. |
| **Logs Supabase** | GET `/dashboard/summary` → 200; GET `/dashboard/time-series` → 200; GET `/dashboard/origin-performance` → 200 (Etapa 3); GET `/dashboard/funnel-stats` → 200 (Etapa 4); GET `/dashboard/pipeline-stats` → 200 (Etapa 5). |
| **Build** | Corrigidos erros de tipo em `OnboardingView.vue` (fora do escopo) para o build passar. |
| **Etapa 6 – Concluída** | Filtros: `buildDashboardParams(filters)` envia period, start_date, end_date, origin em todas as chamadas. Loading: summary/timeSeries/origins/funnel/pipeline limpos no início do load; skeleton KPIs e timeline. Erros por bloco: error, timeSeriesError, originsError, funnelError, pipelineError; mensagens amigáveis e CTA "Tentar novamente". Empty states definidos por bloco. |

**Como testar Etapa 1:** Sem `VITE_USE_MOCK_DASHBOARD` ou com `false`, os KPIs refletem o backend; com `true`, mock.

**Como testar Etapa 2:** Sem mock, o gráfico “Contatos e Vendas” exibe série temporal real (contacts + sales por dia). Com mock, usa dados fictícios. Fallback mock local se `timeSeries` estiver vazio (ex.: falha na requisição).

**Como testar Etapa 3:** Sem mock, a tabela "Desempenho por Origem" e os donuts "Vendas por origem" e "Receita por origem" exibem dados reais (origins do projeto + contacts + sales no período). Com mock, usa dados fictícios. Sem origens ou sem dados no período, aparece "Nenhuma origem com dados no período" nos donuts e tabela vazia.

**Como testar Etapa 4:** Sem mock, o bloco "Funil de conversão" exibe estágios e contagens vindos do GET `/dashboard/funnel-stats` (estágios do projeto, contagens por estágio, total analisado, conversão final). Com mock, usa dados fictícios. Sem estágios ou sem contatos no período, aparece "Nenhum dado de funil no período". Durante o load, skeleton no bloco do funil.

**Como testar Etapa 5:** Sem mock, o bloco "Pipeline de vendas" (card "Vendas") exibe estágios vindos do GET `/dashboard/pipeline-stats` (estágios do projeto, contagem de negócios por estágio, valor total e tempo médio). Com mock, usa dados fictícios. Sem estágios ou sem contatos no pipeline, aparece "Nenhuma etapa do pipeline disponível". Durante o load, skeleton no bloco. Clicar em um estágio abre o drawer de drill-down com entidades do estágio.

---

## 0. Análise de logs (console + Supabase) e pendências

**Data da análise:** 29/01/2026.

### 0.1 Logs do console (front-end)

| Log / Comportamento | Interpretação |
|---------------------|---------------|
| `Revenue goal loaded: null` | Meta de receita não configurada ou não retornada pelo summary; card de goal exibe 0. |
| `[Dashboard V2 Store] Origins performance loaded: 0 origins` | GET `/dashboard/origin-performance` retorna 200, mas o array mapeado tem tamanho 0 (projeto pode não ter origens ativas no período ou resposta/RLS a investigar). |
| `[Contacts Store] Initialized with 52 mock contacts` | Store de contatos ainda inicializa com mock em algum fluxo; na tela de contatos a API real retorna 7. Evitar mistura mock/real no mesmo contexto. |
| `GET .../dashboard/v2/drill-down?type=pipeline&filterId=... 404` | Front chama **`/dashboard/v2/drill-down`**; o backend expõe **`/dashboard/drill-down`** (sem `v2`). Rota inexistente → 404. |
| `[Dashboard] Pipeline drill-down error: AxiosError` + toast "Erro" | Erro genérico; melhorar mensagem para "Não foi possível carregar os detalhes do estágio" (já existe na view) e garantir que o usuário veja mensagem amigável. |
| `GET http://localhost:5173/favicon.ico 404` | Favicon ausente; melhoria cosmética. |

### 0.2 Logs Supabase (Edge Functions)

- **GET** `/dashboard/summary`, `/dashboard/time-series`, `/dashboard/origin-performance`, `/dashboard/funnel-stats`, `/dashboard/pipeline-stats` → **200** (sucesso).
- **GET** `/dashboard/v2/drill-down?type=pipeline&filterId=...` → **404** (rota não existe no backend; backend só tem `/dashboard/drill-down`).

### 0.3 Contrato do backend – drill-down

- **Rota real:** **GET** `/dashboard/drill-down` (não `/dashboard/v2/drill-down`).
- **Query params:** `entityType` (`contacts` \| `sales`), `stageId`, `originId`, `period`, `dateFrom`, `dateTo`, `limit`, `offset`, `search`.
- **Resposta:** `{ data: unknown[], meta: { total, limit, offset, hasMore } }` (não array direto).

### 0.4 Ações definidas

1. **Correção drill-down (Etapa 5.5):** Front usar GET `/dashboard/drill-down`; mapear `type` + `filterId` → `entityType` + `stageId` (ou `originId`) + `period`; tratar resposta `{ data, meta }` e adapter de linhas do backend → `DrillDownEntity[]`.
2. **Origins performance 0:** **(Corrigido 29/01/2026)** Causa: backend retornava [] quando não havia origens com `is_active = true`; projetos com origens com `is_active` null ficavam vazios. Ajustes: (1) Backend `originPerformance.ts` passou a incluir `is_active.eq.true` ou `is_active.is.null`. (2) Front `getOriginsPerformance()` tolera resposta como array direto ou envelope `{ data }`. (3) Empty state na tabela e donuts com mensagem orientando adicionar/ativar origens em Configurações.
3. **Revenue goal:** Documentar que meta de receita depende de configuração/backend; manter empty state no card quando null.
4. **Favicon:** Adicionar `favicon.ico` no `public/` ou suprimir 404 (baixa prioridade).
5. **Contacts mock 52:** Garantir que na dashboard não se dependa de contatos mock; usar apenas dados da API.

---

## 1. Resumo da análise

### 1.1 O que já está conectado (parcialmente)

| Bloco | Fonte atual | Observação |
|-------|-------------|------------|
| **KPIs (cards)** | `dashboardStore.summary?.northStar` | **Conectado (Etapa 1).** Store chama `getSummary()`; serviço usa **GET** `/dashboard/summary` e adapter; mock só com `VITE_USE_MOCK_DASHBOARD=true`. |
| **Timeline (gráfico)** | `dashboardStore.timeSeries` | **Conectado (Etapa 2).** Store chama `getTimeSeries()` em `loadDashboardData`; serviço usa **GET** `/dashboard/time-series` e adapter; fallback mock local na view quando `timeSeries` vazio. |
| **Tabela Origens** | `dashboardStore.originsPerformance` | **Conectado (Etapa 3).** Dados carregados em `loadDashboardData()`; serviço usa **GET** `dashboard/origin-performance` + adapter; tabela exibe dados reais. |
| **Donuts "Vendas por origem" e "Receita por origem"** | `DashboardV2ViewNew.vue` (computed `salesByChannel`, `revenueByChannel`) | **Conectado (Etapa 3).** Derivados de `dashboardStore.originsPerformance`; totais e percentuais reais; empty state "Nenhuma origem com dados no período"; loading por bloco. |
| **Funil de conversão** | `dashboardStore.funnelStats`, `funnelTotalContacts`, `funnelOverallConversionRate` | **Conectado (Etapa 4).** Store chama `getFunnelStats()` em `loadDashboardData`; serviço GET `/dashboard/funnel-stats` com `period`; adapter mapeia resposta; view exibe estágios, totais e conversão; loading (skeleton) e empty "Nenhum dado de funil no período". |
| **Pipeline de vendas** | `dashboardStore.pipelineStats` | **Conectado (Etapa 5).** Store chama `getPipelineStats()` em `loadDashboardData`; serviço GET `/dashboard/pipeline-stats` com `period`; adapter mapeia resposta; view exibe `PipelinePanel` com estágios, valor e tempo médio; loading e empty "Nenhuma etapa do pipeline disponível". |
| **Drill-down (contatos/vendas por data ou canal)** | `contactsStore` / `salesStore` | Já usa `getContactsByDate`, `getSalesByDate` e filtros por origem; depende de contacts/sales carregados (API real ou mock). |

### 1.2 O que ainda é 100% mock/hardcoded

| Bloco | Onde está | Dado |
|-------|-----------|------|
| **Drill-down (pipeline/funil/origem)** | `dashboardV2Service.getDrillDownEntities()` | Chamava GET `/dashboard/v2/drill-down` (404). Backend real é GET `/dashboard/drill-down` com params `entityType`, `stageId`/`originId`, `period` e resposta `{ data, meta }`. **Etapa 5.5** corrige URL, params e adapter. |

### 1.3 Backend (Edge Function `dashboard`) – contrato atual

- **GET** `/dashboard/summary`  
  - Query: `period` (ex.: `30d`).  
  - Header: `x-project-id`.  
  - Resposta: métricas “flat” (`revenue`, `sales`, `spend`, `roi`, `cac`, `avgTicket`, `impressions`, `clicks`, `ctr`, `cpc`, `salesRate`, `avgCycleDays`, `activeCustomers`, `goalPercentage`) com `value` e `delta`.  
  - **Não** retorna `northStar`, `displayValue`, `tooltip` nem `insights`.

- **GET** `/dashboard/origin-performance`  
  - Query: `period` (ex.: `7d`, `30d`, `90d`).  
  - Header: `x-project-id`.  
  - Resposta: `{ originId, originName, originType, spend, contacts, sales, revenue, conversionRate, cac, roi }[]` (agregação por origem; front adapter mapeia para `OriginPerformance[]`).

- **GET** `/dashboard/time-series`  
  - Query: `period` (ex.: `7d`, `30d`, `90d`); opcionalmente `start_date`, `end_date`.  
  - Header: `x-project-id`.  
  - Resposta: `{ date: string, contacts: number, sales: number, revenue: number }[]` (um objeto por dia no intervalo; dias sem dados com 0). Implementado em `handlers/timeSeries.ts`.

- **GET** `/dashboard/origin-breakdown`  
  - Implementado com dados reais (origins + contacts + sales).

- **GET** `/dashboard/funnel-stats`  
  - Query: `period` (ex.: `7d`, `30d`, `90d`). Header: `x-project-id`.  
  - Resposta: `{ stages: { stageId, stageName, displayOrder, count, conversionRate, avgDays }[], totalContacts, overallConversionRate }`.  
  - **Conectado (Etapa 4):** store chama em `loadDashboardData`; view usa `funnelStats`, `funnelTotalContacts`, `funnelOverallConversionRate`.

- **GET** `/dashboard/pipeline-stats`  
  - Query: `period` (ex.: `7d`, `30d`, `90d`). Header: `x-project-id`.  
  - Resposta: `{ stages: { stageId, stageName, displayOrder, dealsCount, totalValue, avgValue, avgDays }[], totalDeals, totalValue }`.  
  - **Conectado (Etapa 5):** store chama em `loadDashboardData`; view usa `pipelineStats` no `PipelinePanel`; loading e empty.

- **GET** `/dashboard/drill-down` (não `/dashboard/v2/drill-down`)  
  - Query: `entityType` (`contacts` \| `sales`), `stageId`, `originId`, `period`, `dateFrom`, `dateTo`, `limit`, `offset`, `search`. Header: `x-project-id`.  
  - Resposta: `{ data: unknown[], meta: { total, limit, offset, hasMore } }`.  
  - **Etapa 5.5:** front usa esta rota; mapeia `type` + `filterId` para `entityType` + `stageId`/`originId`; adapter mapeia `data` → `DrillDownEntity[]`.

---

## 2. Plano por etapas

### Etapa 1 – Alinhar serviço Dashboard V2 ao backend real ✅ (concluída)

**Objetivo:** Summary e filtros de período usarem a Edge Function real em vez de mock/RPC.

**Realizado:**
- Mock condicionado a `VITE_USE_MOCK_DASHBOARD === 'true'`; produção usa API por padrão.
- `getSummary()` chama **GET** `/dashboard/summary` com `params: { period }`; período `custom` envia `'30d'`.
- Adapter `mapBackendSummaryToDashboardV2Summary` em `adapters/dashboardV2Adapter.ts`; resposta flat → `DashboardV2Summary` com northStar (displayValue, tooltip), `goalPercentage` em 0–1, `insights: []`.
- Logs Supabase: GET `/dashboard/summary` retorna 200.

**Tarefas (referência original):**

1. **Trocar mock por API em `dashboardV2Service.getSummary()`**
   - Remover ou condicionar `USE_MOCK` (ex.: `VITE_USE_MOCK_DASHBOARD !== 'true'` ou env explícito).
   - Substituir `POST /rpc/get_dashboard_summary` por **GET** para a Edge Function.  
     Ex.: `apiClient.get('dashboard/summary', { params: { period: filters.period } })` (ou path que seu `apiClient` use para a função `dashboard`).
   - Garantir que o request use o mesmo base URL que outras funções (ex.: `dashboard/metrics`) e que o header `x-project-id` seja enviado (já feito pelo interceptor do `apiClient` com `current_project_id`).

2. **Criar adapter backend → `DashboardV2Summary`**
   - Criar função (ex.: em `services/api/adapters/dashboardV2Adapter.ts`) que:
     - Recebe a resposta “flat” do GET `/dashboard/summary`.
     - Monta `northStar` com cada métrica contendo `value`, `delta`, `displayValue` e `tooltip`.
     - Define `displayValue` (ex.: moeda para revenue/spend/cac/cpc, percentual para ctr/salesRate/goalPercentage, “X dias” para avgCycleDays, etc.).
     - Define `tooltip` fixo por métrica (igual ao mock atual).
     - Retorna `insights: []` até o backend passar a enviar insights.
   - Em `getSummary()`, após o GET, passar a resposta pelo adapter e retornar `DashboardV2Summary`.

3. **Filtros de período**
   - Backend summary usa apenas `period` (ex.: `7d`, `30d`, `90d`). Se o front usar `startDate`/`endDate` para “custom”, definir convenção (ex.: só enviar `period` quando não for custom; quando for custom, enviar `start_date`/`end_date` se o backend passar a aceitar).
   - Garantir que, ao mudar período na barra de filtros, a store chame `loadDashboardData()` e que o serviço use o período selecionado na query.

**Critério de conclusão:** Com mock desligado e backend respondendo, os cards de KPIs da dashboard devem refletir os dados do GET `/dashboard/summary` (e deltas quando houver).

---

### Etapa 2 – Time series (gráfico de evolução) ✅ (concluída)

**Objetivo:** Gráfico de timeline usar dados reais quando o backend tiver implementação.

**Realizado:**

1. **Backend** (`dashboard/handlers/timeSeries.ts`)
   - Agregação por dia a partir de `contacts` (created_at) e `sales` (date, status completed), filtradas por `project_id` e intervalo (derivado de `period` ou `start_date`/`end_date`).
   - Retorno: `{ date, contacts, sales, revenue }[]` por dia, preenchendo dias sem dados com 0.

2. **Front-end – store**
   - `loadDashboardData()` chama `getSummary` e `getTimeSeries` em paralelo (`Promise.allSettled`); atribui resultados a `summary` e `timeSeries`. Limpa `timeSeries` no início do load. Erro em uma requisição não impede a outra.

3. **Front-end – serviço**
   - `getTimeSeries` usa **GET** `dashboard/time-series` com `period` (e opcionalmente `start_date`, `end_date`). Mock quando `VITE_USE_MOCK_DASHBOARD=true`.
   - Adapter `mapBackendTimeSeriesToTimeSeriesPoints` mapeia resposta → `TimeSeriesPoint[]` (`value` = contacts, `compareValue` = sales).

4. **View**
   - `timelineData` usa `dashboardStore.timeSeries` quando existir; fallback mock local quando vazio. Corrigido ano na formatação (dd/MM/yyyy) para usar o ano real da data.

**Critério de conclusão:** Com backend retornando série temporal, o gráfico de evolução mostra dados reais; sem dados, fallback/mock ou estado vazio.

---

### Etapa 3 – Origens: performance (tabela) e donuts (vendas/receita por canal) ✅ (concluída)

**Objetivo:** Tabela de origens e os dois donuts usarem a mesma fonte real (performance por origem).

**Realizado:**
- Backend `dashboard/handlers/originPerformance.ts`: agregação por origem (origins + contacts + sales no período); retorno `{ originId, originName, originType, spend, contacts, sales, revenue, conversionRate, cac, roi }[]`; query `period`.
- Serviço `getOriginsPerformance()`: GET `dashboard/origin-performance` com `params: { period }`; adapter `mapBackendOriginPerformanceToOriginPerformance` mapeia para `OriginPerformance[]` (id, origin, name, color, costPerSale, costPerContact, etc.).
- Store: `loadDashboardData()` chama `fetchOriginsPerformance()` em paralelo com summary e timeSeries; limpa `originsPerformance` no início do load.
- View: `salesByChannel` e `revenueByChannel` derivados de `dashboardStore.originsPerformance`; totais `totalSalesForDonut` e `totalRevenueForDonut`; empty state "Nenhuma origem com dados no período"; loading por bloco (dois placeholders "Carregando…").
- Tabela: `OriginsPerformanceTable` sem fetch no mount; dados vêm de `loadDashboardData()`; botão "Tentar novamente" chama `fetchOriginsPerformance()`.

**Tarefas (referência original):**

1. **Backend – origin-performance**
   - Em `dashboard/handlers/originPerformance.ts`, implementar agregação por origem usando:
     - `origins` do projeto,
     - `contacts` (contagem e, se aplicável, origem),
     - `sales` (contagem, soma de valor, por origem do contato).
   - Retornar array no formato esperado pelo front (ex.: `OriginPerformance`: `id`, `origin`, `name`, `color`, `spent`, `contacts`, `sales`, `revenue`, `conversionRate`, `costPerSale`, `costPerContact`, `roi`).  
   - Pode reutilizar lógica de `origin-breakdown` se o contrato for compatível ou fazer um adapter no backend.

2. **Front-end – serviço**
   - Em `getOriginsPerformance()`, trocar **POST** `/dashboard/v2/origins-performance` por **GET** `dashboard/origin-performance` com query `period` (e `compare` se o backend suportar).
   - Garantir que o header `x-project-id` seja enviado (já é pelo interceptor).
   - Mapear resposta do backend para o tipo `OriginPerformance[]` do front (adapter se necessário).

3. **Front-end – view: donuts**
   - Remover os arrays fixos de `salesByChannel` e `revenueByChannel`.
   - Derivar dois computeds a partir de `dashboardStore.originsPerformance` (ou `originBreakdown` se a store passar a preencher isso a partir do mesmo endpoint):
     - Um para “vendas por origem”: soma de vendas por origem → `ChannelData[]` (name, value, percentage, color).
     - Um para “receita por origem”: soma de receita por origem → `ChannelData[]`.
   - Usar cores por origem (ex.: do backend ou mapa fixo por `origin.id`/`origin.name`).
   - Tratar lista vazia: mostrar estado vazio (“Nenhuma origem com dados no período”) em vez de donut vazio ou valores zerados.

4. **Tabela**
   - `OriginsPerformanceTable` já usa `originsPerformance` e `fetchOriginsPerformance()`; assim que o backend e o serviço estiverem alinhados, a tabela passará a mostrar dados reais.

**Critério de conclusão:** Tabela de origens e os dois donuts refletem os mesmos dados reais; sem origens/dados, estado vazio claro.

---

### Etapa 4 – Funil de conversão (dados reais) ✅ (concluída)

**Objetivo:** Bloco “Funil de conversão” usar estágios e contagens reais.

**Realizado:**

1. **Store** (`dashboardV2.ts`)
   - Em `loadDashboardData()`, chamada a `dashboardV2Service.getFunnelStats(requestFilters)` em paralelo com summary, timeSeries e fetchOriginsPerformance (`Promise.allSettled`).
   - Resultado atribuído a `funnelStats`, `funnelTotalContacts` e `funnelOverallConversionRate`; limpeza desses refs no início do load e ao trocar de projeto.
   - Erro em funnel-stats não impede as outras requisições; apenas log de aviso.

2. **Serviço** (`dashboardV2.ts`)
   - `getFunnelStats()` passou a usar **GET** `dashboard/funnel-stats` com `params: { period }` (período `custom` envia `'30d'`).
   - Resposta mapeada pelo adapter; retorno tipado como `FunnelStatsResult` (stages, totalContacts, overallConversionRate).
   - Mock ativo apenas quando `VITE_USE_MOCK_DASHBOARD === 'true'`.

3. **Adapter** (`dashboardV2Adapter.ts`)
   - `BackendFunnelStatsResponse`, `BackendFunnelStage` e `mapBackendFunnelStatsToFunnelStageStats`: mapeia `stages` do backend para `FunnelStageStats[]` (avgDays → avgTimeInStage).
   - Export no barrel `adapters/index.ts`.

4. **View** (`DashboardV2ViewNew.vue`)
   - Bloco estático do funil substituído por template dinâmico: iteração sobre `dashboardStore.funnelStats`; resumo com "Total analisado", "Entrada do funil", "Avanço médio", "Conversão final" a partir de `funnelTotalContacts` e `funnelOverallConversionRate`.
   - Por estágio: nome, contagem, % do total, taxa de conversão ("X% avançaram"), tempo médio (quando houver).
   - Loading: skeleton (cards + barras) quando `isLoading` e funil vazio.
   - Empty: "Nenhum dado de funil no período" e texto orientando configurar etapas e ter contatos no período.
   - Acessibilidade: `aria-labelledby`, `role="list"`/`listitem` no funil.

**Critério de conclusão:** Funil exibido com estágios e números vindos do backend; estados loading e vazio tratados. ✅

---

### Etapa 5 – Pipeline de vendas (se existir na UI) ✅ (concluída)

**Objetivo:** Se houver bloco de “Pipeline” ou estágios de vendas na dashboard, alimentá-lo com dados reais.

**Realizado:**

1. **Store**
   - `loadDashboardData()` chama `dashboardV2Service.getPipelineStats(requestFilters)` em paralelo com summary, timeSeries, origins, funnel; limpa `pipelineStats` no início do load; atribui resultado a `pipelineStats`; erro em pipeline não impede as outras requisições.

2. **Serviço**
   - `getPipelineStats()` passou a usar **GET** `dashboard/pipeline-stats` com `params: { period }` (período custom envia `'30d'`). Resposta mapeada por `mapBackendPipelineStatsToPipelineStageStats`; mock ativo apenas quando `VITE_USE_MOCK_DASHBOARD === 'true'`.

3. **Adapter**
   - `BackendPipelineStage`, `BackendPipelineStatsResponse` e `mapBackendPipelineStatsToPipelineStageStats`: mapeia `stages` do backend (dealsCount, totalValue, avgDays) para `PipelineStageStats[]` (count, value, avgTime). Export no barrel `adapters/index.ts`.

4. **View**
   - Seção “Pipeline de vendas” com `PipelinePanel`; dados de `dashboardStore.pipelineStats`; loading quando `isLoading` e lista vazia; empty “Nenhuma etapa do pipeline disponível” (interno ao `PipelinePanel`); drill-down ao clicar em estágio via `handlePipelineStageClick` (abre `EntityListDrawer` com entidades do estágio).

**Critério de conclusão:** Pipeline com dados reais e estados cobertos. ✅

---

### Etapa 6 – Consistência de filtros, loading e erros ✅ (concluída)

**Objetivo:** Período, datas e origem refletidos em todas as chamadas; UX de loading e erro padronizada.

**Tarefas:**

1. **Filtros**
   - Garantir que `period`, `startDate`, `endDate` e `origin` (quando usado) sejam enviados em todas as chamadas de dashboard (summary, time-series, origin-performance, funnel-stats, pipeline-stats).
   - Backend que ainda não aceita `start_date`/`end_date`: documentar e, se necessário, adicionar suporte em uma etapa posterior.

2. **Loading**
   - Manter `isLoading` na store enquanto qualquer uma das requisições (summary, timeSeries, originsPerformance, funnelStats, pipelineStats) estiver em andamento; ou manter estados separados e na view mostrar skeleton/loading por bloco.
   - Evitar “flash” de dados antigos: limpar ou não atualizar summary/timeSeries/origins até a resposta correspondente chegar.

3. **Erros**
   - Tratar 4xx/5xx e timeout em cada chamada do serviço; definir mensagem amigável e, se aplicável, retry ou CTA (“Tentar novamente”).
   - Garantir que um erro em uma requisição (ex.: summary) não impeça as outras (ex.: origins, time series) de serem exibidas, quando fizer sentido.

4. **Empty states**
   - Para cada bloco (KPIs, timeline, donuts, tabela de origens, funil, pipeline), definir mensagem e opcionalmente CTA quando não houver dados (ex.: “Nenhum dado no período selecionado” ou “Adicione contatos e vendas para ver métricas”).

**Critério de conclusão:** Filtros aplicados em todas as chamadas; loading e erro tratados; empty states definidos. ✅

---

### Etapa 5.5 – Drill-down (correção de rota e contrato) 🔧

**Objetivo:** Alinhar o front ao backend real do drill-down para que o clique em estágio do pipeline (e futuramente funil/origem) abra o drawer com entidades reais.

**Problema:** O front chamava **GET** `/dashboard/v2/drill-down` com `type` e `filterId`; o backend expõe **GET** `/dashboard/drill-down` com `entityType`, `stageId`/`originId`, `period` e retorna `{ data, meta }`.

**Tarefas:**

1. **Serviço** (`dashboardV2.ts`)
   - Trocar URL de `/dashboard/v2/drill-down` para `/dashboard/drill-down`.
   - Mapear `type` + `filterId` para params do backend:
     - `type === 'pipeline'` → `entityType: 'sales'`, `stageId: filterId`, `period` (ex.: `30d`).
     - `type === 'funnel'` → `entityType: 'contacts'`, `stageId: filterId`, `period`.
     - `type === 'origin'` → `entityType: 'contacts'` (ou `sales` conforme UX), `originId: filterId`, `period`.
   - Tratar resposta como `{ data, meta }`; extrair `data` e passar por adapter para `DrillDownEntity[]`.

2. **Adapter**
   - Criar (ex.: em `dashboardV2Adapter.ts`) função que mapeia linha bruta do backend (contact ou sale) para `DrillDownEntity` (id, type, name, stage, origin, value?, createdAt).
   - Backend contacts: `id`, `name`, `created_at`, `origins?.name`, `stages?.name`; sales: `id`, `value`, `date`, `contacts` (nome), estágio/origem conforme schema.

3. **View**
   - Manter mensagem amigável no erro: "Não foi possível carregar os detalhes do estágio." (já presente); evitar toast genérico "Erro".

**Critério de conclusão:** Clicar em estágio do pipeline abre o drawer com lista de entidades vindas do GET `/dashboard/drill-down`; empty e erro com mensagem clara.

---

### Etapa 7 – Testes e validação

**Objetivo:** Garantir que a integração não quebre fluxos existentes e que os dados exibidos sejam coerentes.

**Tarefas:**

1. **Testes**
   - Adapter summary: teste unitário (resposta flat → `DashboardV2Summary` com `displayValue` e `tooltip`).
   - Serviço: testes com mock do `apiClient` para GET `dashboard/summary`, `dashboard/time-series`, `dashboard/origin-performance`, etc., e validação de params/headers.
   - Componente/store: pelo menos um teste que cubra loading → sucesso → erro para um bloco (ex.: KPIs ou tabela de origens).

2. **Validação manual**
   - Com projeto com e sem dados: verificar KPIs, timeline, donuts, tabela, funil e pipeline.
   - Trocar período (7d, 30d, 90d, custom) e origem (quando aplicável) e conferir se os números batem com o esperado (ex.: contagens em contacts/sales no backend).
   - Drill-down: clicar em ponto do gráfico e em fatia do donut e verificar lista de contatos/vendas e abertura dos drawers.

3. **Rollback**
   - Manter possibilidade de reativar mock via env (ex.: `VITE_USE_MOCK_DASHBOARD=true`) para rollback rápido se a API falhar em produção.

**Critério de conclusão:** Testes automatizados passando; checklist manual documentado e executado; plano de rollback claro.

---

## 3. Ordem sugerida e dependências

1. ~~**Etapa 1** (summary + adapter)~~ **✅ Concluída** – KPIs usam GET `/dashboard/summary` + adapter.  
2. ~~**Etapa 2** (time series)~~ **✅ Concluída** – Gráfico de evolução usa GET `/dashboard/time-series` + adapter; store chama `getTimeSeries` em `loadDashboardData`.  
3. ~~**Etapa 3** (origins: backend + serviço + donuts + tabela)~~ **✅ Concluída** – GET `dashboard/origin-performance` + adapter; donuts e tabela com dados reais; empty/loading.  
4. ~~**Etapa 4** (funil)~~ **✅ Concluída** – GET `/dashboard/funnel-stats` + adapter; store chama `getFunnelStats` em `loadDashboardData`; view com dados reais, loading e empty.  
5. **Etapa 5** (pipeline) – se a UI tiver pipeline.  
5.5. **Etapa 5.5** (drill-down) – corrigir URL e contrato para GET `/dashboard/drill-down`; adapter resposta → `DrillDownEntity[]`.  
6. **Etapa 6** (filtros, loading, erros, empty) – incremental a partir da Etapa 1.  
7. **Etapa 7** (testes e validação) – contínua; fechamento formal após todas as integrações.

---

## 4. Arquivos principais envolvidos

| Camada | Arquivos |
|--------|----------|
| **View** | `front-end/src/views/dashboard/DashboardV2ViewNew.vue` |
| **Store** | `front-end/src/stores/dashboardV2.ts` |
| **Serviço** | `front-end/src/services/api/dashboardV2.ts` |
| **Adapter** | `front-end/src/services/api/adapters/dashboardV2Adapter.ts` (summary Etapa 1; time-series Etapa 2; origin-performance Etapa 3; funnel-stats Etapa 4; pipeline-stats Etapa 5) |
| **Tipos** | `front-end/src/types/models.ts` (DashboardV2Summary, NorthStarKPI, etc.) |
| **Backend** | `back-end/supabase/functions/dashboard/index.ts`, `handlers/summary.ts`, `originPerformance.ts`, `timeSeries.ts`, `funnel-stats.ts`, `pipeline-stats.ts`, `origin-breakdown.ts` |

---

## 5. Variáveis de ambiente

- **`VITE_USE_MOCK_DASHBOARD`**  
  - Implementado: mock ativo apenas quando `=== 'true'`; sem a variável ou com `false`, produção usa API. Rollback: definir `true` e redeploy.  
- **`VITE_API_BASE_URL`**  
  - Base URL das Edge Functions (ex.: `https://xxx.supabase.co/functions/v1`); já usada pelo `apiClient` para adicionar `x-project-id` e token.

---

## 6. Riscos e rollback

- **Risco:** Backend retornar formato diferente ou falhar (5xx).  
  **Mitigação:** Adapter tolerante a campos opcionais; mensagem de erro amigável; opção de reativar mock via env.  
- **Rollback:** Definir `VITE_USE_MOCK_DASHBOARD=true` e redeploy do front; ou reverter deploy do front para versão que usa apenas mock.

Este plano mantém alinhamento com as regras do projeto (apiClient único, sem alterar FORBIDDEN_PATHS, contratos em `/src/schemas` e `/src/types`, estados loading/empty/error e acessibilidade).
