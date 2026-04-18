# Adsmagic Docs

Portal de documentação do Adsmagic Workspace. Construído com [Docusaurus](https://docusaurus.io/).

## Instalação

```bash
# A partir da raiz do repositório (recomendado)
npm run docs:install

# Ou diretamente nesta pasta
npm install
```

## Desenvolvimento

```bash
# A partir da raiz do repositório (recomendado)
npm run docs:dev

# Ou diretamente nesta pasta
npx docusaurus start --port 3001
```

Acesse em **http://localhost:3001**

## Build

```bash
# A partir da raiz do repositório
npm run docs:build

# Ou diretamente nesta pasta
npx docusaurus build
```

## Servir build estático

```bash
# A partir da raiz do repositório
npm run docs:serve

# Ou diretamente nesta pasta
npx docusaurus serve
```

## Estrutura

```
docs/
├── docs/           # Páginas de documentação (.md / .mdx)
│   ├── intro.md
│   ├── setup-local.md
│   ├── constituicao.md
│   ├── jornadas.md
│   ├── architecture/
│   ├── marketing/
│   ├── modulos/
│   ├── product/
│   ├── stories/
│   ├── telas/
│   ├── wiki/
│   └── workflow/
├── src/
│   ├── data/
│   │   └── wikiTaxonomy.ts   # Fonte de verdade do sidebar
│   ├── components/
│   └── pages/
│       └── index.tsx         # Home do portal (sem sidebar)
├── sidebars.ts               # Gerado a partir de wikiTaxonomy.ts
└── docusaurus.config.ts
```

## Adicionar um novo documento

1. Crie o arquivo `.md` em `docs/docs/<secao>/`
2. Adicione a entrada correspondente em `src/data/wikiTaxonomy.ts`
3. O sidebar é gerado automaticamente a partir da taxonomia

## Referência

- [Constituição do repositório](./docs/constituicao.md) — propósito e princípios do workspace
- [README raiz](../README.md) — setup completo da aplicação e do workspace
