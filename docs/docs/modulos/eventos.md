---
title: Eventos
---

# Eventos

**Rota:** `/pt/projects/:projectId/events`

O módulo de Eventos é o log central de todas as ações rastreadas que chegam ao projeto — cliques, pageviews, conversões, events de formulário, entre outros. Funciona como auditoria e base de dados brutos para os relatórios de Analytics.

---

## Componentes visuais

### Tela de eventos

![Eventos — tela completa](/img/screens/adsmagic/eventos-tela.png)

A tela é composta por:

| Componente | Função |
|-----------|--------|
| **ToolbarMetricPill** | Totais do período (ex.: quantidade de eventos) na barra de ações |
| **EventsList** | Tabela de todos os eventos recebidos: tipo, canal, data/hora, dados contextuais |
| **EventsFilters** | Modal de filtros avançados (tipo de evento, plataforma, datas) |
| **EventDetailsDrawer** | Gaveta com o payload completo do evento selecionado |
| **DateRangePicker** | Filtro de período integrado à barra de ações |

---

## Funcionalidades

### Lista de eventos

Componente `EventsList` com todos os eventos recebidos no período:

- Tipo do evento
- Plataforma/canal de origem
- Data e hora
- Dados contextuais (URL, dispositivo, localização)

### Métricas rápidas

`ToolbarMetricPill` exibe totais do período filtrado diretamente na barra de ferramentas.

### Filtros

| Filtro | Descrição |
|--------|-----------|
| Busca textual | Pesquisa por nome do evento ou URL |
| Intervalo de datas | `DateRangePicker` |
| Plataforma | Filtra por canal (Meta, Google, orgânico, etc.) |
| Tipo de evento | Abertura do `EventsFilters` modal com seleção múltipla |

### Detalhe do evento

`EventDetailsDrawer` abre ao clicar em um evento e exibe:

- Todos os campos do payload do evento
- Contexto técnico (user agent, IP anonimizado, referrer)

### Exportação

Botão de download exporta os eventos filtrados em CSV.

### Atualizar dados

Botão de refresh (`RefreshCw`) recarrega os eventos via `eventsService`.

## Stores utilizadas

```
useEventsStore
```

## Estado atual (As-Is)

- Eventos chegam via o pixel/tag installado no site (veja [Integrações > Site](./integracoes.md)).
- O módulo é **somente leitura** — não é possível criar ou editar eventos manualmente.
- Volume alto de eventos pode requerer paginação; a versão atual carrega por lotes.
