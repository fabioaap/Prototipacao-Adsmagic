---
title: Visão geral
---

# Visão geral da arquitetura

## Estrutura do workspace

O repositorio foi organizado para manter a aplicacao do workspace separada da documentacao:

- `Plataforma/` contém a aplicação Vue 3
- `docs/` contém o portal Docusaurus
- `vite.config.js` na raiz continua apontando para `Plataforma/`

## Aplicação principal

A aplicacao do workspace usa:

- Vue 3 com TypeScript
- Vite
- Vue Router
- Pinia
- Tailwind CSS

O ponto central de renderização é a combinação entre layout e rotas aninhadas:

- `Plataforma/src/App.vue`
- `Plataforma/src/components/layout/AppLayout.vue`
- `Plataforma/src/router/index.ts`

## Documentação

O Docusaurus foi adicionado como app independente para evitar acoplamento com o shell do workspace. Isso permite:

- documentar arquitetura e fluxo sem criar novas telas na app Vue
- versionar documentação junto do código
- manter build e dev separados

## Superficies ativas do workspace

O escopo funcional principal atual gira em torno de:

- `Início`
- `Rotas`
- `Kanban`
- `Wiki`

As demais rotas antigas foram retiradas do menu principal ou redirecionadas.