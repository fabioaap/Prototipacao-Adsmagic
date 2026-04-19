# Dashboard V2 Components

Componentes implementados seguindo o PRD (linhas 189-400) para o Dashboard "Visão Geral".

## Estrutura de Componentes

### Componentes Atômicos (Base)

#### `MetricCard.vue`
Card reutilizável para exibir uma métrica individual.

**Props:**
- `label`: string - Label da métrica
- `value`: string | number - Valor a ser exibido
- `icon`: LucideIcon (opcional) - Ícone da métrica
- `comparison`: number (opcional) - Percentual de comparação (▲▼)
- `loading`: boolean (padrão: false) - Estado de carregamento
- `variant`: 'default' | 'success' | 'warning' | 'danger' (padrão: 'default')

**Exemplo:**
```vue
<MetricCard
  label="Receita"
  :value="formatCurrency(10000)"
  :icon="DollarSign"
  :comparison="28.5"
  variant="success"
/>
```

---

#### `DateRangeFilter.vue`
Filtro de período com presets e persistência em localStorage.

**Props:**
- `modelValue`: DateRange (opcional)

**Eventos:**
- `update:modelValue`: DateRange - Emitido quando o período muda
- `change`: DateRange - Emitido quando o período muda

**Presets disponíveis:**
- Hoje
- Últimos 7 dias
- Últimos 30 dias
- Últimos 90 dias
- Este mês
- Mês passado
- Personalizado (date range picker)

**Features:**
- Checkbox "Comparar com período anterior"
- Persistência em localStorage (`dashboard_date_range`, `dashboard_compare_previous`)

---

### Componentes Compostos

#### `MetricsGrid.vue`
Grid responsivo 4x3 com 12 cards de métricas.

**Métricas exibidas:**

**Linha 1 - Financeiras:**
1. Gastos com anúncios
2. Receita (com comparação)
3. Ticket médio
4. ROI (com comparação)

**Linha 2 - Conversão:**
5. Custo por venda
6. Novos contatos (com comparação)
7. Vendas (com comparação)
8. Taxa de vendas

**Linha 3 - Tráfego:**
9. Impressões
10. Cliques
11. Custo por clique
12. Taxa de cliques

**Dependências:**
- `useDashboardStore()` - dados das métricas
- `useFormat()` - formatação de valores
- `useI18n()` - tradução

---

#### `SalesByOriginChart.vue`
Gráfico de pizza (donut) mostrando distribuição de vendas por origem.

**Features:**
- Gráfico donut com ApexCharts
- Label central com total de vendas
- Cores consistentes por origem
- Responsivo (mobile-first)
- Estado de loading e empty state

---

#### `RevenueByOriginChart.vue`
Gráfico de pizza (donut) mostrando distribuição de receita por origem.

**Features:**
- Gráfico donut com ApexCharts
- Label central com total de receita formatado
- Cores consistentes com SalesByOriginChart
- Responsivo (mobile-first)
- Estado de loading e empty state

---

#### `ContactsSalesLineChart.vue`
Gráfico de linha mostrando evolução de contatos vs vendas ao longo do tempo.

**Features:**
- Gráfico de linha com ApexCharts
- 2 séries: Contatos (azul) e Vendas (verde)
- Tooltip compartilhado no hover
- Eixo X: datas (formato DD/MM)
- Eixo Y: quantidade
- Responsivo (mobile-first)

---

#### `LatestSalesCard.vue`
Card com lista das últimas vendas.

**Props:**
- `limit`: number (padrão: 8) - Quantidade de vendas a exibir
- `loading`: boolean (padrão: false) - Estado de carregamento

**Features:**
- Lista scrollable de vendas
- Avatar com ícone WhatsApp
- Nome do cliente (truncado se longo)
- Data da venda
- Valor formatado
- Estado de loading e empty state
- Hover effect

---

#### `OriginPerformanceTable.vue`
Tabela com desempenho detalhado por origem.

**Colunas:**
- Origem (badge com nome)
- Gastos (formatado como moeda)
- Contatos (quantidade)
- Vendas (quantidade, negrito)
- Taxa de vendas (percentual)
- ROI (multiplicador, ex: 4.5x)

**Features:**
- Ordenação por coluna (clique no header)
- Paginação (10 itens por página)
- Indicador de direção de ordenação (↑↓)
- Responsivo (scroll horizontal no mobile)
- Hover effect nas linhas

---

#### `ChartsSection.vue`
Seção agregada com os 3 gráficos.

**Estrutura:**
- Grid 2 colunas (desktop): SalesByOriginChart + RevenueByOriginChart
- Full width: ContactsSalesLineChart
- Responsivo (1 coluna no mobile)

---

## Integração

### View Principal: `DashboardView.vue`

```vue
<template>
  <div class="container mx-auto py-6 space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <h1>{{ t('dashboard.overview') }}</h1>
      
      <div class="flex items-center space-x-4">
        <DateRangeFilter v-model="dateRange" @change="handleDateRangeChange" />
        <Button variant="outline" size="icon" @click="handleRefresh">
          <RefreshCcw :class="{ 'animate-spin': isLoading }" />
        </Button>
      </div>
    </div>

    <!-- Métricas (12 cards) -->
    <MetricsGrid />

    <!-- Gráficos (2 pizza + 1 linha) -->
    <ChartsSection />

    <!-- Últimas Vendas + Tabela de Origens -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2">
        <OriginPerformanceTable />
      </div>
      <div>
        <LatestSalesCard :limit="8" />
      </div>
    </div>
  </div>
</template>
```

---

## Dependências

- **ApexCharts**: `vue3-apexcharts` - gráficos
- **Lucide Icons**: `lucide-vue-next` - ícones
- **i18n**: `vue-i18n` - traduções
- **Pinia**: `useDashboardStore()` - state management
- **Composables**: `useFormat()`, `useI18n()`
- **UI Components**: Card, Button, Select, Checkbox, Label, Skeleton, etc.

---

## Mock Data

Dados mockados em `/src/mocks/dashboard.ts`:
- `getDashboardMetrics(projectId)` - métricas agregadas
- `getTimeSeriesData(projectId, period)` - série temporal
- `getOriginPerformance(projectId)` - performance por origem
- `getRecentSales(projectId, limit)` - últimas vendas

---

## Traduções

Chaves adicionadas em `/src/locales/{pt,en,es}.json`:

```json
{
  "dashboard": {
    "overview": "Visão Geral",
    "refresh": "Atualizar",
    "metrics": {
      "adSpend": "Gastos com anúncios",
      "revenue": "Receita",
      "averageTicket": "Ticket médio",
      "roi": "ROI",
      // ... 8 mais
    },
    "charts": {
      "salesByOrigin": "Vendas",
      "revenueByOrigin": "Receita",
      "contactsVsSales": "Contatos x Vendas",
      // ...
    },
    "period": {
      "today": "Hoje",
      "last7Days": "Últimos 7 dias",
      // ...
    },
    "latestSales": {
      "title": "Últimas Vendas",
      // ...
    },
    "originTable": {
      "title": "Desempenho por Origem",
      // ...
    }
  }
}
```

---

## Responsividade

Todos os componentes seguem a abordagem mobile-first com breakpoints Tailwind:

- **Mobile** (default): 1 coluna, scroll horizontal em tabelas
- **Tablet** (md: 768px): 2 colunas para métricas, gráficos lado a lado
- **Desktop** (lg: 1024px): 4 colunas para métricas, layout completo

---

## Dark Mode

Todos os componentes usam CSS variables do projeto para suporte a dark mode:
- `bg-background`, `text-foreground`
- `text-muted-foreground`
- `border-input`
- `hover:bg-accent`

---

## Próximos Passos

- [ ] Integrar com API real (trocar mocks)
- [ ] Adicionar testes unitários (Vitest)
- [ ] Adicionar testes de componente (Testing Library)
- [ ] Implementar exportação de dados (CSV, PDF)
- [ ] Implementar customização de métricas (drag-and-drop)
- [ ] Adicionar mais períodos de comparação
- [ ] Implementar filtros avançados (por origem, por campanha)
- [ ] Otimizar performance (lazy loading, virtual scroll)

---

## Referências

- **PRD**: `/doc/prd.md` (linhas 189-400)
- **Padrões**: `/doc/coding-standards.md`
- **Guardrails**: `/.cursor/rules/guardrails.mdc`
- **Types**: `/front-end/src/types/models.ts` (DashboardMetrics, TimeSeriesData, OriginPerformance)
