# Adsmagic — Ambiente de Prototipação

Ambiente de prototipação rápida para o **Adsmagic**, plataforma SaaS de atribuição de marketing e gestão de leads.

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
# Servidor raiz (porta 5173) — recomendado
npm run dev

# Plataforma standalone (porta 5174)
npm run dev:fo

# Portal de documentacao Docusaurus (porta 3000)
npm run docs:dev

# App e documentacao lado a lado
npm run dev:with-docs
```

Acesse: **http://localhost:5173**

Documentacao: **http://localhost:3000**

---

## Estrutura do Projeto

```
Prototipacao-Adsmagic/
├── docs/                   # Portal Docusaurus da documentacao
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

O projeto agora possui um portal Docusaurus isolado em `docs/` para organizar setup, arquitetura, jornadas e fluxo de prototipacao.

```bash
# build do portal
npm run docs:build

# servir build estatico do portal
npm run docs:serve
```

Use o Docusaurus para registrar mudancas estruturais do Adsmagic. A tela `/wiki` do prototipo continua separada e nao foi substituida por este portal.

---

## Módulos Disponíveis

| Módulo | Rota | Descrição |
|--------|------|-----------|
| 🏠 Início | `/` | Home orientada por jornadas ponta a ponta |
| 🗺️ Rotas | `/rotas` | Mapa de rotas e sitemap com leitura estrutural do produto |
| 🧩 Kanban | `/kanban` | Quadro operacional de oportunidades por etapa |
| 📚 Wiki | `/wiki` | Base enxuta de alinhamento e referências do protótipo |

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
