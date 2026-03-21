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
```

### Desenvolvimento

```bash
# Servidor raiz (porta 5173) — recomendado
npm run dev

# Plataforma standalone (porta 5174)
npm run dev:fo
```

Acesse: **http://localhost:5173**

---

## Estrutura do Projeto

```
Prototipacao-Adsmagic/
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

## Módulos Disponíveis

| Módulo | Rota | Descrição |
|--------|------|-----------|
| 🏠 Início | `/` | Hub de navegação entre módulos |
| 📊 Dashboard | `/dashboard` | Métricas, ROI, leads por origem, receita por mês |
| 👥 Contatos | `/contacts` | Base de leads com busca e filtro por status |
| 💰 Vendas | `/sales` | Funil Kanban com oportunidades por etapa |
| 📣 Campanhas | `/campaigns` | Tabela de campanhas Meta/Google com CPL |
| 🔗 Links Rastreáveis | `/tracking` | UTMs e links curtos com métricas de cliques |
| 🔌 Integrações | `/integrations` | Status de conexão Meta, Google, WhatsApp, TikTok |
| 💬 Mensagens | `/messages` | Chat mockado com lista de conversas |
| ⚙️ Configurações | `/settings` | Tabs: Geral, Origens, Etapas do funil |

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
