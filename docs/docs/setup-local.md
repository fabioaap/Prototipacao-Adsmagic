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

Servidor recomendado:

- `http://localhost:5173`

Opção standalone da aplicação:

```bash
npm run dev:fo
```

- `http://localhost:5174`

## Rodando a documentação

```bash
npm run docs:dev
```

Portal Docusaurus:

- `http://localhost:3000`

## Rodando tudo lado a lado

```bash
npm run dev:with-docs
```

Esse comando sobe:

- o protótipo Vue na porta `5173`
- a documentação Docusaurus na porta `3000`

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