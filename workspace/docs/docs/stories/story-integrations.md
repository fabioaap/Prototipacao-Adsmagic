---
id: PROTO-003
title: "Tela de Integrações — Status dos Conectores"
epic: "Módulos de Gestão Operacional"
status: done
priority: medium
agent: dev
---

> ✅ **View já implementada** — `Plataforma/src/views/integrations/IntegrationsView.vue` existe e está completa. As rotas foram ativadas no Commit 1 (fix: ativar rotas e corrigir bugs críticos da antítese).

# PROTO-003 — Tela de Integrações

## Contexto

O módulo de Integrações exibe o status de conexão entre o Adsmagic e plataformas externas. A rota `/integrations` redireciona para a Home. Os dados mockados já existem em `integrations.ts` com 4 conectores (Meta, Google, WhatsApp, TikTok).

## Objetivo

Criar `Plataforma/src/views/integrations/IntegrationsView.vue` com cards por integração, status visual e ação de reconectar.

---

## Critérios de Aceitação

- [ ] Rota `/integrations` renderiza `IntegrationsView.vue` (remover redirect no router)
- [ ] Header com título "Integrações" e contagem de conectores ativos
- [ ] Grid de cards (4 colunas desktop, 2 tablet, 1 mobile) com:
  - Ícone/emoji do conector
  - Nome da integração
  - Status: `connected` (emerald), `disconnected` (zinc), `error` (rose)
  - Descrição curta do conector
  - Botão "Reconectar" (disabled se connected)
- [ ] Stat bar no topo: X ativas / Y com erro / Z desconectadas
- [ ] Estado de erro destacado visualmente

## Fora de Escopo

- Fluxo real de OAuth/conexão
- Configurações avançadas por conector
- Logs de sincronização

---

## Arquivos Envolvidos

| Ação | Arquivo |
|------|---------|
| CRIAR | `Plataforma/src/views/integrations/IntegrationsView.vue` |
| EDITAR | `Plataforma/src/router/index.ts` — remover redirect, apontar para `IntegrationsView.vue` |
| REFERÊNCIA | `Plataforma/src/data/integrations.ts` — 4 integrações mockadas |

---

## Notas Técnicas

- Os dados mockados têm: `id`, `name`, `status`, `icon` (provavelmente)
- Verificar interface em `integrations.ts` antes de criar a view
- Botão "Reconectar" pode emitir um mock de loading (setTimeout 1s → feedback visual)
- `meta.title: 'Integrações'` no router
