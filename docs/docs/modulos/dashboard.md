---
title: Dashboard
---

# Dashboard

**Rota:** `/pt/projects/:projectId/dashboard-v2`

O Dashboard é o painel central do projeto. Exibe KPIs, gráficos de performance e permite configurar a métrica principal (NorthStar).

![Dashboard — visão geral](/img/screens/adsmagic/dashboard-full.png)

---

## Componentes visuais

### Barra de filtros

Localizada acima de todos os componentes. Permite selecionar período, origem e alternar o modo de comparação.

![Filtros do Dashboard anotados](/img/screens/adsmagic/dashboard-filtros-annotated.png)

**Componente:** `DashboardFiltersBarNew`

- Seletor de intervalo de datas (`DateRangePicker`)
- Filtro de origens (todas ou específica)
- Toggle de comparação com período anterior
- Botão **Exportar**

---

### Banner — Próximos passos

Exibido quando faltam configurações no projeto (ex.: integração não realizada).

![Banner próximos passos](/img/screens/adsmagic/dashboard-banner.png)

- Atalho "Ir para integrações"
- Botão "Continuar com assistente" de onboarding

---

### North Star

Bloco de 4 métricas prioritárias configuráveis pelo usuário.

![North Star anotado](/img/screens/adsmagic/dashboard-northstar-annotated.png)

**Componente:** `NorthStarSection`

| Métrica | Descrição |
|---------|-----------|
| Gastos anúncios | Investimento total no período |
| Receita | Receita total atribuída |
| Vendas | Negócios fechados |
| Taxa de vendas | Conversões sobre contatos |

- Botão **"Ver métricas detalhadas"** abre o drilldown
- Ícone de configuração abre `NorthStarConfigDrawer` para personalizar as métricas exibidas

---

### Receita — Comparativo com meta

Mostra o progresso da receita em relação à meta mensal configurada.

![Receita e meta](/img/screens/adsmagic/dashboard-receita-meta.png)

**Componente:** `RevenueGoalCard`

- Exibe meta configurada e progresso atual
- Quando nenhuma meta está definida, exibe botão **"Configurar meta"**
- À esquerda: gráfico de distribuição por canal (`ChannelDonutChart`)

---

### Funil de conversão

Visualização em barras horizontais da proporção de leads em cada etapa.

![Funil de conversão](/img/screens/adsmagic/dashboard-funil.png)

**Componente:** `ConversionFunnelChart`

- Distribuição dos leads por etapa do funil
- Proporcional ao total de contatos

---

### Desempenho por Origem

Tabela comparativa de performance de cada canal de tráfego.

![Desempenho por Origem](/img/screens/adsmagic/dashboard-desempenho.png)

**Componente:** `PerformanceByOriginTable`

| Coluna | Descrição |
|--------|-----------|
| Origem | Canal de aquisição |
| Gastos | Investimento no período |
| Contatos | Leads gerados |
| Vendas | Conversões |
| Taxa de conversão | % vendas/contatos |
| ROI | Retorno sobre investimento |

---

## Stores utilizadas

```
useContactsStore
useSalesStore
useOriginsStore
useSettingsStore
useProjectsStore
useStagesStore
useDashboardV2Store
```

## Estado atual (As-Is)

- Versão ativa: `DashboardV2ViewNew.vue` (substitui `DashboardV2View.vue` e o antigo `DashboardView.vue`).
- Todos os dados são carregados via stores conectadas ao Supabase.
- Não há exportação direta dos dados do painel (os módulos individuais oferecem exportação própria).
