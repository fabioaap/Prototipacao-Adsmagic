---
id: PROTO-001
title: "Tela de Contatos — Lista e Kanban"
epic: "Módulos de Gestão Operacional"
status: done
priority: high
agent: dev
---

> ✅ **View já implementada** — `Plataforma/src/views/contacts/ContactsView.vue` existe e está completa. As rotas foram ativadas no Commit 1 (fix: ativar rotas e corrigir bugs críticos da antítese).

# PROTO-001 — Tela de Contatos

## Contexto

O módulo de Contatos é o CRM central do protótipo Adsmagic. Atualmente a rota `/contacts` redireciona para a Home. Os dados mockados (`contacts.ts`) e o store Pinia (`useContactsStore`) já estão prontos — falta apenas a vista principal.

## Objetivo

Criar `Plataforma/src/views/contacts/ContactsView.vue` com visualização em lista, busca e filtro por status.

---

## Critérios de Aceitação

- [ ] Rota `/contacts` renderiza `ContactsView.vue` (remover o redirect no router)
- [ ] Header com título "Contatos", contagem total e badge de filtro ativo
- [ ] Campo de busca reativo por nome/email (usa `useContactsStore().search`)
- [ ] Filtro por status: `new`, `in_progress`, `converted`, `lost`
- [ ] Lista de contatos exibe: nome, email, telefone, origem, status, valor
- [ ] Status representado por badge colorido (emerald=converted, amber=in_progress, rose=lost, zinc=new)
- [ ] Estado vazio quando nenhum contato corresponde ao filtro
- [ ] Responsivo: funciona em mobile e desktop

## Fora de Escopo

- Modo kanban (próxima iteração)
- Importação/exportação CSV
- Detalhe do contato (drawer/modal)

---

## Arquivos Envolvidos

| Ação | Arquivo |
|------|---------|
| CRIAR | `Plataforma/src/views/contacts/ContactsView.vue` |
| EDITAR | `Plataforma/src/router/index.ts` — remover redirect `/contacts` → home, apontar para `ContactsView.vue` |
| REFERÊNCIA | `Plataforma/src/stores/contacts.ts` — `useContactsStore` |
| REFERÊNCIA | `Plataforma/src/data/contacts.ts` — 10 contatos mockados |

---

## Notas Técnicas

- Usar `useContactsStore().filtered` para a lista (já tem search + statusFilter)
- Seguir padrão visual de `DashboardView.vue` (tokens Tailwind: zinc-900, zinc-800, rounded-3xl)
- Usar `lucide-vue-next` para ícones (Search, Filter, User)
- `meta.title: 'Contatos'` no router para document title
