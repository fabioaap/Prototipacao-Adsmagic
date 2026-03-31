---
title: Estrutura do workspace
---

# Estrutura do workspace

## Layout e navegação

O Adsmagic Workspace usa um shell unificado com sidebar e header persistentes. As views entram como conteudo roteado dentro do layout.

Arquivos centrais:

- `Plataforma/src/components/layout/AppLayout.vue`
- `Plataforma/src/components/layout/AppHeader.vue`
- `Plataforma/src/components/layout/SidebarNav.vue`

## Rotas

As rotas registradas em `Plataforma/src/router/index.ts` priorizam quatro destinos:

- `/`
- `/rotas`
- `/kanban`
- `/wiki` (redirecionamento para o portal Docusaurus)

Esse desenho reduz o menu a um escopo coerente com o papel do workspace: documentar o AS-IS, explorar o TO-BE e hospedar recortes navegaveis.

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

A rota `/wiki` do workspace deixou de manter uma view própria. Ela agora redireciona para a wiki do Docusaurus, consolidando a documentação em uma única superfície.