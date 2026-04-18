# Adsmagic Workspace

> **Laboratório do produto Adsmagic.** Este repositório não é o produto em produção — é o espaço onde produto, engenharia e marketing exploram hipóteses, documentam o estado atual e materializam o estado futuro antes de qualquer commit em produção.

Leia a 📋 **[Constituição do repositório](./CONSTITUTION.md)** para entender o propósito, os princípios e as regras deste espaço.

---

## Fonte de verdade do AS-IS

- **Repo upstream:** `https://github.com/kennedyselect/Adsmagic-First-AI`
- **Papel deste workspace:** documentar o AS-IS, explorar o TO-BE com dados mockados e preparar contribuições que depois viram PRs no repo original
- **Regra operacional:** este repositório não substitui o produto real e não deve ser usado para modificar diretamente o repo upstream
- **Rastreabilidade:** toda rodada de alinhamento do AS-IS deve apontar para uma referência explícita em `workspace/docs/docs/product/as-is-baseline.md`

---

## Para qual time você é?

### 🎯 Time de Produto
1. [Setup local](http://localhost:3001/setup-local) — como rodar o workspace
2. [Produto As-Is](http://localhost:3001/product/as-is) — como o Adsmagic está hoje em produção
3. [Produto To-Be](http://localhost:3001/product/to-be) — o que estamos explorando
4. [Jornadas](http://localhost:3001/jornadas) — fluxos completos do usuário

### ⚙️ Time de Engenharia
1. [Setup local](http://localhost:3001/setup-local) — instalar e rodar
2. [Visão geral da arquitetura](http://localhost:3001/architecture/visao-geral) — como está organizado
3. [Estrutura do protótipo](http://localhost:3001/architecture/estrutura-do-prototipo) — layout, rotas, mock data
4. [Workflow de prototipação](http://localhost:3001/workflow/prototipacao) — branches, commits, ciclo de vida

### 📣 Time de Marketing / GTM
1. [Squad de GTM](http://localhost:3001/marketing/squad-de-gtm) — modelo operacional do squad
2. [Wiki de marketing](http://localhost:3001/wiki) — posicionamento, ICP, conteúdo
3. [Landing Pages — assets e campanhas](http://localhost:3001/wiki/marketing/assets-e-campanhas) — status de SEO, canônicos, copies
4. [Handoff Cloudflare Pages](http://localhost:3001/workflow/cloudflare-pages-lps) — deploy, checklist pós-deploy, domínios

> **Wiki de produto completa:** `npm run docs:dev` → http://localhost:3001

---

## Stack

| Tecnologia | Versão |
|------------|--------|
| Vue 3 + TypeScript | 3.5.x |
| Vite | 7.x |
| Tailwind CSS | 3.4.18 |
| Pinia | 3.x |
| Vue Router | 4.x |

> Sem Supabase, sem axios, sem i18n. Todos os dados são **mockados localmente**.

---

## Stack

| Tecnologia | Versão |
|------------|--------|
| Vue 3 + TypeScript | 3.5.x |
| Vite | 7.x |
| Tailwind CSS | 3.4.18 |
| Pinia | 3.x |
| Vue Router | 4.x |

> Sem Supabase, sem axios, sem i18n. Todos os dados são **mockados localmente**.

---

## Como Rodar

### Pré-requisitos
- Node.js 20+
- npm 10+

### Instalação

```bash
# Na raiz do projeto
npm install

# No Plataforma
npm install --prefix apps/plataforma

# No app dedicado de LPs
npm run lps:install

# No portal de documentacao
npm run docs:install
```

### Desenvolvimento

```bash
# Workspace + wiki de produto juntos — recomendado
npm run dev

# Plataforma standalone (primeira porta livre entre 3000 e 3006)
npm run dev:fo

# Landing pages standalone (porta 4173 por padrao)
npm run lps:dev

# Apenas o workspace raiz
npm run dev:workspace

# Wiki de produto (porta 3001)
npm run docs:dev

# App e documentacao lado a lado
npm run dev:with-docs
```

Acesse o workspace em **http://localhost:3000** ou na próxima porta livre até **http://localhost:3006**

Documentacao: **http://localhost:3001**

Landing pages standalone: **http://localhost:4173**

Para gerar handoffs estaticos por LP:

```bash
npm run lps:build
npm run lps:package
```

Os pacotes ficam em `outputs/deliverables/lps/<slug>/`.

### Documentação das Landing Pages

| Doc | Descrição |
|-----|-----------|
| [Assets e Campanhas](./workspace/docs/docs/marketing/assets-e-campanhas.md) | Índice de LPs, status de SEO, canônicos, copies vinculadas |
| [Handoff Cloudflare Pages](./workspace/docs/docs/workflow/cloudflare-pages-lps.md) | Deploy, domínios, checklist pós-deploy com verificação SEO |
| [Copies Google Ads](./workspace/docs/docs/marketing/copies-google-ads.md) | Copies de anúncios Google vinculadas às LPs |
| [Copies Meta Ads](./workspace/docs/docs/marketing/copies-meta-ads.md) | Copies de anúncios Meta vinculadas às LPs |
| [Oferta para Agências](./workspace/docs/docs/marketing/oferta-para-agencias.md) | Proposta de valor e oferta da LP para agências |

---

## Estrutura do Projeto

```
Prototipacao-Adsmagic/
├── workspace/              # Materiais editoriais, squads, templates, wiki
│   ├── docs/               # Wiki de produto (Docusaurus)
│   ├── marketing/          # Assets e campanhas de marketing
│   ├── squads/             # Squads de trabalho
│   ├── templates/          # Templates reutilizáveis
│   └── wiki/               # Wiki técnica
├── design-system/          # Tokens, brand assets e componentes compartilhados
│   ├── brand/              # Logos, ícones e ilustrações canônicas
│   ├── tokens/             # Paleta de cores e tokens (source of truth)
│   ├── components/         # Componentes Vue compartilhados (pós-Fase 4)
│   └── docs/               # Documentação do design system
├── apps/                   # Aplicações
│   ├── plataforma/         # App Vue 3
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   └── layout/      # AppLayout, AppHeader, SidebarNav
│   │   │   ├── views/           # Uma pasta por módulo
│   │   │   ├── stores/          # Pinia stores (dados mockados)
│   │   │   ├── data/            # Mock data (contacts, sales, etc.)
│   │   │   └── router/          # Vue Router
│   │   ├── tailwind.config.js
│   │   └── package.json
│   └── landing-pages/      # App dedicado para LPs exportaveis
├── vite.config.js           # Config raiz (root: ./apps/plataforma)
├── package.json             # Scripts raiz
├── PROTOTYPES-WORKFLOW.md   # Guia de branches e commits
└── README.md
```

---

## Documentacao

O projeto agora possui uma wiki de produto isolada em `workspace/docs/` para organizar setup, arquitetura, jornadas e fluxo de prototipacao.

```bash
# build do portal
npm run docs:build

# servir build estatico do portal
npm run docs:serve
```

Use a wiki de produto para registrar mudancas estruturais do Adsmagic. Em desenvolvimento, `apps/plataforma/.env.development` fixa `VITE_DOCS_PORTAL_URL` em `http://localhost:3001` e `VITE_LANDING_PAGES_PREVIEW_URL` em `http://localhost:4173`. Se o portal nao responder, a rota `/wiki` mostra um estado local estavel em vez de recarregar infinitamente; o catalogo de LPs usa a URL de preview para abrir as superficies standalone. Os atalhos legados `/lp/home` e `/lp/agencias` agora funcionam como redirects de compatibilidade para essas superficies, preservando query string e hash.

---

## Módulos Disponíveis

| Módulo | Rota | Descrição |
|--------|------|-----------|
| 🏠 Início | `/` | Home orientada por jornadas ponta a ponta |
| 🗺️ Rotas | `/rotas` | Mapa de rotas e sitemap com leitura estrutural do produto |
| 🧩 Kanban | `/kanban` | Quadro operacional de oportunidades por etapa |
| 📚 Wiki | `/wiki` | Redireciona para a wiki de produto |

---

## Workflow de Protótipos

Ver **[PROTOTYPES-WORKFLOW.md](./PROTOTYPES-WORKFLOW.md)** para o guia completo.

### Branches principais

- `main` — base estável do workspace
- `prototypes/as-is` — branch de alinhamento do workspace com o baseline AS-IS adotado do repo upstream
- `prototypes/feature/<nome>` — protótipos de melhoria e propostas de contribuição

### Criar um novo protótipo

```bash
git checkout prototypes/as-is
git checkout -b prototypes/feature/minha-feature
# ... desenvolver ...
git commit -m "proto: descrição da mudança"
git push origin prototypes/feature/minha-feature
```

Fluxo recomendado:

1. atualizar a referência do AS-IS no clone local do upstream
2. registrar branch/SHA em `docs/docs/product/as-is-baseline.md`
3. atualizar `docs/docs/product/as-is.md` e `docs/docs/product/as-is-gap-register.md` se houver divergências novas
4. prototipar a melhoria com mocks neste workspace
5. empacotar a proposta em `workspace/templates/upstream-pr-proposal.md`
6. portar a melhoria para o repo original em um PR aberto lá

---

## Cores da Marca

| Token | Hex | Uso |
|-------|-----|-----|
| `primary-600` | `#7C3AED` | Cor principal (violeta) |
| `primary-500` | `#8B5CF6` | Hover states |
| `primary-50` | `#F5F3FF` | Backgrounds suaves |
