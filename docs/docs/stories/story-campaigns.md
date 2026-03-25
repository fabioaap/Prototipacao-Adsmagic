---
id: PROTO-002
title: "Tela de Campanhas — Overview por Canal"
epic: "Módulos de Gestão Operacional"
status: backlog
priority: medium
agent: dev
---

# PROTO-002 — Tela de Campanhas

## Contexto

O módulo de Campanhas deve consolidar a visão de performance de mídia paga do cliente. A rota `/campaigns` atualmente redireciona para a Home. Não há dados mockados ainda para campanhas — precisam ser criados junto com a vista.

## Objetivo

Criar `Plataforma/src/views/campaigns/CampaignsView.vue` com cards por canal (Meta, Google), métricas básicas e status de veiculação.

---

## Critérios de Aceitação

- [ ] Rota `/campaigns` renderiza `CampaignsView.vue` (remover redirect no router)
- [ ] Header com título "Campanhas" e subtítulo contextual
- [ ] Cards por canal (Meta Ads, Google Ads) com:
  - Nome da campanha
  - Status: Ativa / Pausada / Encerrada
  - Métricas: Impressões, Cliques, CTR, Spend
- [ ] Badge de status colorido (emerald=ativa, amber=pausada, zinc=encerrada)
- [ ] Total de campanhas por canal no header do card
- [ ] Estado vazio quando não há campanhas

## Fora de Escopo

- Edição de campanhas
- Filtros avançados por período
- Gráficos de performance temporal

---

## Arquivos a Criar

| Ação | Arquivo |
|------|---------|
| CRIAR | `Plataforma/src/views/campaigns/CampaignsView.vue` |
| CRIAR | `Plataforma/src/data/campaigns.ts` — mock com 6–8 campanhas (Meta + Google) |
| CRIAR | `Plataforma/src/stores/campaigns.ts` — `useCampaignsStore` |
| EDITAR | `Plataforma/src/router/index.ts` — remover redirect, apontar para `CampaignsView.vue` |

---

## Estrutura Sugerida para `campaigns.ts`

```typescript
export interface Campaign {
  id: string
  channel: 'meta' | 'google'
  name: string
  status: 'active' | 'paused' | 'ended'
  impressions: number
  clicks: number
  ctr: number
  spend: number
}
```

---

## Notas Técnicas

- Agrupar campanhas por `channel` na view (computed)
- Usar `integrations.ts` como referência para ícones de canal
- `meta.title: 'Campanhas'` no router
- Seguir tokens Tailwind existentes (não hardcode cores de marca de canal)
