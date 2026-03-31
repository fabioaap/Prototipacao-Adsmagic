# Adsmagic Workspace

> **Laboratório do produto Adsmagic.** Este repositório não é o produto em produção — é o espaço onde produto, engenharia e marketing exploram hipóteses, documentam o estado atual e materializam o estado futuro antes de qualquer commit em produção.

Leia a 📋 **[Constituição do repositório](./CONSTITUTION.md)** para entender o propósito, os princípios e as regras deste espaço.

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
npm install --prefix Plataforma

# No portal de documentacao
npm run docs:install
```

### Desenvolvimento

```bash
# Workspace + wiki de produto juntos — recomendado
npm run dev

# Plataforma standalone (primeira porta livre entre 3000 e 3006)
npm run dev:fo

# Apenas o workspace raiz
npm run dev:workspace

# Wiki de produto (porta 3001)
npm run docs:dev

# App e documentacao lado a lado
npm run dev:with-docs
```

Acesse o workspace em **http://localhost:3000** ou na próxima porta livre até **http://localhost:3006**

Documentacao: **http://localhost:3001**

---

## Estrutura do Projeto

```
Prototipacao-Adsmagic/
├── docs/                   # Wiki de produto
├── Plataforma/             # App Vue 3
│   ├── src/
│   │   ├── components/
│   │   │   └── layout/      # AppLayout, AppHeader, SidebarNav
│   │   ├── views/           # Uma pasta por módulo
│   │   ├── stores/          # Pinia stores (dados mockados)
│   │   ├── data/            # Mock data (contacts, sales, etc.)
│   │   └── router/          # Vue Router
│   ├── tailwind.config.js
│   └── package.json
├── vite.config.js           # Config raiz (root: ./Plataforma)
├── package.json             # Scripts raiz
├── PROTOTYPES-WORKFLOW.md   # Guia de branches e commits
└── README.md
```

---

## Documentacao

O projeto agora possui uma wiki de produto isolada em `docs/` para organizar setup, arquitetura, jornadas e fluxo de prototipacao.

```bash
# build do portal
npm run docs:build

# servir build estatico do portal
npm run docs:serve
```

Use a wiki de produto para registrar mudancas estruturais do Adsmagic. Em desenvolvimento, `Plataforma/.env.development` fixa `VITE_DOCS_PORTAL_URL` em `http://localhost:3001`, e `npm run dev` ja sobe workspace + wiki juntos. Se o portal nao responder, a rota `/wiki` mostra um estado local estavel em vez de recarregar infinitamente.

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

- `main` — base estável
- `prototypes/as-is` — baseline AS-IS (como está hoje)
- `prototypes/feature/<nome>` — protótipos de melhorias

### Criar um novo protótipo

```bash
git checkout prototypes/as-is
git checkout -b prototypes/feature/minha-feature
# ... desenvolver ...
git commit -m "proto: descrição da mudança"
git push origin prototypes/feature/minha-feature
```

---

## Cores da Marca

| Token | Hex | Uso |
|-------|-----|-----|
| `primary-600` | `#7C3AED` | Cor principal (violeta) |
| `primary-500` | `#8B5CF6` | Hover states |
| `primary-50` | `#F5F3FF` | Backgrounds suaves |
