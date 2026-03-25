---
title: Estrutura do protótipo
---

# Estrutura do protótipo

## Layout e navegação

O protótipo atual usa um shell unificado com sidebar e header persistentes. As views entram como conteúdo roteado dentro do layout.

Arquivos centrais:

- `Plataforma/src/components/layout/AppLayout.vue`
- `Plataforma/src/components/layout/AppHeader.vue`
- `Plataforma/src/components/layout/SidebarNav.vue`

## Rotas

As rotas registradas em `Plataforma/src/router/index.ts` priorizam quatro destinos:

- `/`
- `/rotas`
- `/kanban`
- `/wiki`

Esse desenho reduz o menu a um escopo coerente com o ciclo atual do protótipo.

## Dados mockados

O projeto continua mock-first. Isso significa que:

- dados vivem em `Plataforma/src/data/`
- stores em `Plataforma/src/stores/` funcionam como adaptadores leves
- não existem chamadas reais de API por padrão

## Rotas e sitemap

`Rotas` se tornou a superfície estrutural do produto. Hoje ela combina:

- visão tabular das rotas mapeadas
- grupos funcionais
- aba de sitemap com Vue Flow

## Wiki da aplicação

A rota `/wiki` não foi substituída por este portal. Ela continua sendo uma base leve de alinhamento dentro da própria interface do protótipo.