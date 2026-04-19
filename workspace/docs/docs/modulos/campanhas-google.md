---
title: Campanhas Google Ads
---

# Campanhas Google Ads

**Rota:** `/pt/projects/:projectId/campaigns/google-ads`

O módulo de Campanhas Google Ads exibe a hierarquia completa de anúncios vinculados à conta Google conectada, permitindo navegar e analisar performance em cada nível da hierarquia.

---

## Componentes visuais

### Tela principal — lista de campanhas

![Google Ads — lista de campanhas](/img/screens/adsmagic/campanhas-google-topo.png)

A tela exibe:

| Componente | Função |
|-----------|--------|
| **Breadcrumb de navegação** | Indica o nível atual: Campanhas → Ad Sets → Ads |
| **Barra de filtros** | Período, modo de comparação e indicadores customizados |
| **Tabela de dados** | Métricas por nível: impressões, cliques, CTR, custo, conversões, ROAS |
| **CustomIndicatorsDrawer** | Gaveta para selecionar quais colunas de KPI exibir |

---

## Hierarquia de navegação

```
Campanhas
  └── Conjuntos de anúncios (Ad Sets)
        └── Anúncios (Ads)
```

A navegação é feita por **breadcrumb**: o usuário clica em uma campanha para ver seus conjuntos de anúncios, e nos conjuntos para ver os anúncios individuais.

## Funcionalidades

### Tabela de dados

Cada nível da hierarquia apresenta uma tabela com métricas:

- Impressões
- Cliques
- CTR
- Custo
- Conversões
- CPA
- ROAS (onde aplicável)
- Indicadores customizados (configuráveis)

### Filtros

| Filtro | Descrição |
|--------|-----------|
| Intervalo de datas | `DateRangePicker` para o período de análise |
| Modo comparação | Toggle para exibir duas colunas (período atual vs. anterior) |

### Indicadores customizados

Gaveta `CustomIndicatorsDrawer` permite selecionar quais métricas adicionais aparecem nas colunas da tabela — o usuário configura o conjunto de KPIs relevantes para seu negócio.

## Dependência de integração

Este módulo **exige** que a conta Google Ads esteja conectada em [Integrações > Canais](./integracoes.md). Sem a conexão, a tabela exibe um estado vazio com call-to-action para integrar.

## Estado atual (As-Is)

- Os dados são lidos da API Google Ads via backend e armazenados/exibidos via store.
- Não é possível criar ou editar anúncios diretamente pelo Adsmagic — o módulo é somente leitura.
- A atualização de dados depende de re-sincronização manual ou automática configurada no backend.
