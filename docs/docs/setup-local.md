---
sidebar_position: 2
title: Setup local
---

# Setup local

## Pré-requisitos

- Node.js 20+
- npm 10+

## Instalação

Na raiz do projeto:

```bash
npm install
npm install --prefix Plataforma
npm run docs:install
```

## Rodando a aplicação Vue

```bash
npm run dev
```

Esse comando sobe:

- o Adsmagic Workspace na primeira porta livre entre `3000` e `3006`
- a documentação Docusaurus na porta `3001`

Servidor recomendado do workspace:

- `http://localhost:3000` ou a próxima porta livre até `http://localhost:3006`

Opção standalone da aplicação:

```bash
npm run dev:fo
```

- `http://localhost:3000` ou a próxima porta livre até `http://localhost:3006`

## Rodando a documentação

```bash
npm run docs:dev
```

Portal Docusaurus:

- `http://localhost:3001`

## Rodando apenas o workspace raiz

```bash
npm run dev:workspace
```

Servidor do workspace:

- `http://localhost:3000` ou a próxima porta livre até `http://localhost:3006`

## Rodando tudo lado a lado

```bash
npm run dev:with-docs
```

Esse comando é um alias de `npm run dev`.

## Builds úteis

Aplicação principal:

```bash
npm run build
```

Portal de documentação:

```bash
npm run docs:build
npm run docs:serve
```

## Primeiro acesso para usar agentes na IDE

Se o dev for usar os agentes do workspace ou cards do Kanban como origem de prompts e handoffs, o setup local precisa incluir sync e validação da IDE.

Guia completo: [Agentes na IDE](./workflow/agentes-na-ide)