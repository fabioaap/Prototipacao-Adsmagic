---
id: PROTO-006
title: "Kanban de Experimentos — Board Linear + Roadmap"
epic: "Workspace de Produto"
status: backlog
priority: high
agent: ux + dev
---

# PROTO-006 — Kanban de Experimentos

## Contexto

O módulo `/kanban` hoje aponta para `SalesView.vue`, exibindo um pipeline de oportunidades de vendas. A proposta é **reorientar completamente o módulo** para ser o centro de comando de protótipos e experimentos, inspirado no Linear.

O Kanban passa a ser onde a equipe:
- cria e gerencia specs de cada protótipo
- acompanha o ciclo de vida (Backlog → Planejado → Em prototipação → Revisão → Canary → Concluído)
- anexa referências, issues e decisões a cada experimento
- visualiza o roadmap de experimentos por horizonte (Now / Next / Later)

> Spec completo do módulo: [Kanban de Experimentos](../modulos/kanban-experimentos)

---

## Hipótese

> "Um quadro linear de specs de protótipos aumenta a clareza sobre o que está sendo prototipado, o que está parado e o que foi aprendido — reduzindo o ruído nas discussões de produto."

---

## Critérios de Aceitação

### Board de experimentos

- [ ] Rota `/kanban` renderiza `ExperimentsKanbanView.vue`
- [ ] 7 colunas fixas representando o ciclo de vida (ver spec do módulo)
- [ ] Cards arrastáveis entre colunas (drag-and-drop básico)
- [ ] Card exibe: ID `PROTO-NNN`, título, hipótese resumida, branch, responsável, prioridade
- [ ] Card abre painel lateral com spec completa, campo de resultado, issues e anexos
- [ ] Barra de filtros: por responsável, prioridade, horizonte de roadmap
- [ ] Contagem de experimentos por coluna no header de cada coluna
- [ ] Estado vazio com CTA para criar primeiro experimento

### Roadmap

- [ ] Sub-rota `/kanban/roadmap` ou aba dentro da mesma view
- [ ] Vista em lista agrupada por horizonte: **Now** (Sprint atual) / **Next** (Próximo mês) / **Later** (Backlog longo)
- [ ] Cada item do roadmap é linkado ao card do board
- [ ] Mover um card para "Planejado" no board reflete no roadmap como "Now" ou "Next"

### Dados mockados

- [ ] Criar `Plataforma/src/data/experiments.ts` com 6–8 cards de exemplo
- [ ] Incluir experimentos em diferentes estágios para validar todas as colunas
- [ ] Pinia store em `Plataforma/src/stores/experiments.ts` com `useExperimentsStore`

---

## Fora de Escopo

- Persistência real (Supabase) — dados são mockados
- Notificações ou integrações com GitHub Issues
- Campos de sprint ou velocity

---

## Referências visuais

Inspiração de interface: Linear (https://linear.app), GitHub Projects

Colunas esperadas no board:

```
│ 📥 Backlog │ 🎯 Planejado │ 🔬 Em prototipação │ 🔍 Em revisão │ 🚀 Canary │ ✅ Concluído │ 🗄️ Arquivado │
```

---

## Arquivos a criar/editar

| Ação | Arquivo |
|------|---------|
| CRIAR | `Plataforma/src/views/experiments/ExperimentsKanbanView.vue` |
| CRIAR | `Plataforma/src/data/experiments.ts` |
| CRIAR | `Plataforma/src/stores/experiments.ts` |
| EDITAR | `Plataforma/src/router/index.ts` — apontar `/kanban` para `ExperimentsKanbanView` |
| EDITAR | `docs/docs/product/to-be.md` — adicionar experimento na seção de protótipos |

---

## Status

| Campo | Valor |
|-------|-------|
| Status | ⬜ Backlog |
| Prioridade | 🔴 Alta |
| Branch prevista | `prototypes/feature/kanban-experimentos` |
| Bloqueia | Nenhum |
| Bloqueado por | Nenhum |
