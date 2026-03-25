---
title: Campanhas Meta Ads
---

# Campanhas Meta Ads

**Rota:** `/pt/projects/:projectId/campaigns/meta-ads`

O módulo de Campanhas Meta Ads espelha a estrutura do [módulo Google Ads](./campanhas-google.md), mas para as contas Facebook/Instagram conectadas via Meta Business.

---

## Componentes visuais

### Tela principal — lista de campanhas

![Meta Ads — lista de campanhas](/img/screens/adsmagic/campanhas-meta-topo.png)

A tela exibe:

| Componente | Função |
|-----------|--------|
| **Breadcrumb de navegação** | Campanhas → Ad Sets → Ads |
| **Barra de filtros** | Período e modo de comparação |
| **Tabela de dados** | Métricas: impressões, alcance, cliques, CTR, CPC, conversões, ROAS |
| **CustomIndicatorsDrawer** | Gaveta para configurar colunas de KPI |

---

## Hierarquia de navegação

```
Campanhas
  └── Conjuntos de anúncios (Ad Sets)
        └── Anúncios (Ads)
```

Navegação idêntica ao Google Ads: breadcrumb + drill-down por nível.

## Funcionalidades

### Tabela de dados

Métricas por nível da hierarquia:

- Impressões
- Alcance
- Cliques no link
- CTR
- Custo por clique (CPC)
- Conversões
- Custo por resultado
- ROAS
- Indicadores customizados

### Filtros

| Filtro | Descrição |
|--------|-----------|
| Intervalo de datas | Período de análise |
| Modo comparação | Período atual vs. anterior |

### Indicadores customizados

Mesma gaveta `CustomIndicatorsDrawer` do módulo Google Ads — o usuário configura as colunas de métricas relevantes para Meta.

## Dependência de integração

Exige a conexão Meta Ads via OAuth em [Integrações > Canais](./integracoes.md). A autenticação usa o fluxo OAuth do Meta Business, que redireciona para o callback `/pt/integrations/meta/oauth/callback`.

## Estado atual (As-Is)

- Somente leitura — não é possível criar, pausar ou editar anúncios pelo Adsmagic.
- Dados sincronizados via API Meta Marketing.
- Compartilha o mesmo padrão de UX e componentes do módulo Google Ads para consistência.
