---
title: Analytics
---

# Analytics

**Rota:** `/pt/projects/:projectId/analytics`

O módulo de Analytics oferece uma visão consolidada e visual da performance do projeto — vendas, funil de conversão, origens de tráfego e comparativos temporais.

---

## Componentes visuais

### Abas de navegação + seção principal

![Analytics — topo](/img/screens/adsmagic/analytics-topo.png)

A tela de Analytics é dividida em abas temáticas. Cada aba exibe um conjunto diferente de gráficos e tabelas.

---

### Seção inferior — gráficos complementares

![Analytics — gráficos complementares](/img/screens/adsmagic/analytics-charts2.png)

---

## Funcionalidades

### Filtro de período

Seletor de intervalo de datas que aplica-se a todos os gráficos da tela simultaneamente.

### Gráficos disponíveis

| Componente | O que mostra |
|-----------|--------------|
| **SalesChart** | Evolução das vendas ao longo do tempo (linha ou barras) |
| **FunnelChart** | Visualização do funil: leads → qualificados → vendas |
| **OriginChart** | Distribuição de contatos e vendas por origem/canal |
| **PerformanceTable** | Tabela comparativa de métricas por origem (cliques, leads, vendas, CAC, ROI) |
| **RecentActivity** | Feed das atividades mais recentes no projeto |

### Interatividade

- Clicar em um ponto ou segmento de gráfico aciona drill-down nos dados correspondentes.
- Os gráficos reagem em tempo real ao mudar o período selecionado.

## Stores utilizadas

```
useSalesStore
useContactsStore
useOriginsStore
useDashboardV2Store (parcial)
```

## Estado atual (As-Is)

- Não há exportação direta de gráficos em PDF/PNG — somente os dados tabulares via CSV nos módulos individuais.
- Todos os dados são calculados no frontend a partir das stores; sem endpoints analíticos dedicados.
- O módulo complementa o Dashboard: Dashboard foca em KPIs do dia a dia; Analytics foca em análises comparativas de médio prazo.
