# AdsMagic First AI

> Plataforma SaaS de atribuição de marketing e gestão de leads com inteligência artificial.

[![Branch](https://img.shields.io/badge/branch-v3-blue)](https://github.com/kennedyselect/Adsmagic-First-AI/tree/v3)
[![Frontend Build](https://img.shields.io/badge/frontend_build-passing-brightgreen)](#)
[![E2E Tests](https://img.shields.io/badge/E2E_Playwright-37%2F37-brightgreen)](#testes)
[![Unit Tests](https://img.shields.io/badge/unit_tests-969%2F969-brightgreen)](#testes)

---

## Governança

As regras centrais do produto AdsMagic estão em [docs/governance/project-constitution.md](docs/governance/project-constitution.md).

Esse documento governa segurança, multi-tenant, adapters, OAuth, i18n, boundaries entre frontend e backend e gates mínimos de qualidade.

---

## 📋 Visão Geral

O AdsMagic First AI é uma plataforma multi-tenant de SaaS que permite às empresas:

- **Atribuir leads** às origens de tráfego corretas (Meta Ads, Google Ads, WhatsApp, etc.)
- **Gerenciar o funil de vendas** via Kanban ou lista, com histórico de movimentações
- **Rastrear conversões** com links UTM e pixels de eventos
- **Integrar WhatsApp**, Meta Ads e Google Ads em uma única plataforma
- **Analisar performance** com dashboard de métricas e ROI em tempo real

---

## 🏗️ Arquitetura

```
Adsmagic-First-AI/
├── front-end/          # Vue 3 + TypeScript → deploy Cloudflare Pages
├── back-end/           # Supabase (PostgreSQL + Edge Functions Deno)
└── doc/                # Documentação de banco e arquitetura
```

### Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Vue 3, TypeScript, Vite, Tailwind CSS v3, Pinia, Vue Router, Zod |
| Backend | Supabase (PostgreSQL), Edge Functions (Deno), Row Level Security |
| Auth | Supabase Auth (email/password + OAuth) |
| Deploy FE | Cloudflare Pages |
| Deploy BE | Supabase Cloud |
| Testes FE | Vitest (unitários), Playwright (E2E) |

---

## 🚦 Status da Branch `v3`

<!-- STATUS:START -->
> **Atualizado em:** 04 de março de 2026 | Branch `v3 (desenvolvimento ativo)` | Frontend ~92% · Backend ~37%
>
> _Branch de desenvolvimento. Inclui todas as features do master + E2E Playwright, refatorações e backend em andamento._

### Frontend

| Área | Barra | % | Detalhe |
|------|-------|---|---------|
| Rotas & Componentes | `██████████████████░░` | 90% | Build OK, guards OK, todas as rotas principais |
| Auth (login/register/OAuth) | `████████████████████` | 100% | Fluxo completo com OAuth popup |
| Contatos (lista + kanban) | `████████████████████` | 100% | CRUD, filtros, exportação CSV |
| Vendas UI | `████████████████████` | 100% | UI completa, conectada ao backend |
| Dashboard V2 | `████████████████████` | 100% | UI completa (dados mock até backend analytics) |
| Links Rastreáveis | `████████████████████` | 100% | UI completa |
| Integrações | `████████████████████` | 100% | UI OAuth Meta/Google/TikTok completa |
| WhatsApp (Mensagens) | `████████████████████` | 100% | UI completa |
| Configurações | `████████████████████` | 100% | Etapas, origens, settings gerais |
| Campaigns Meta/Google | `████████░░░░░░░░░░░░` | 40% | UI existe, sem dados reais — [#16] |
| i18n EN/ES | `█████████████░░░░░░░` | 65% | PT completo; EN/ES com gaps em messages/integrations — [#11] |
| Testes unitários | `███████████████████░` | 97% | 969/969 passando |
| Testes E2E Playwright | `████████████████████` | 100% | 37/37 passando |

### Backend

| Sessão | Área | Barra | % | Issue |
|--------|------|-------|---|-------|
| 1–3 | Infraestrutura, Usuários, Projetos | `████████████████████` | 100% | — |
| 4 | Contatos, Origens, Etapas | `████████████████████` | 100% | — |
| 5 | Vendas e Conversões | `░░░░░░░░░░░░░░░░░░░░` | 0% | [#6] 🔴 |
| 6 | Links Rastreáveis | `░░░░░░░░░░░░░░░░░░░░` | 0% | [#8] 🔴 |
| 7/8 | Integrações OAuth | `███████████░░░░░░░░░` | 53% | [#9] 🟡 |
| 8.5 | WhatsApp Brokers | `███████████████░░░░░` | 76% | [#10] 🟡 |
| 9 | Analytics e Dashboard real | `████░░░░░░░░░░░░░░░░` | 20% | [#7] 🔴 |
| 10 | Workers Assíncronos | `███░░░░░░░░░░░░░░░░░` | 17% | [#13] 📦 |
| 11 | Auditoria e Monitoramento | `░░░░░░░░░░░░░░░░░░░░` | 0% | [#14] 📦 |
| 12 | Otimização e CI/CD | `░░░░░░░░░░░░░░░░░░░░` | 0% | [#15] 📦 |

### Progresso Geral

```
Frontend  ██████████████████░░  ~92%
Backend   ███████░░░░░░░░░░░░░  ~37%
Projeto   █████████████░░░░░░░  ~65%
```
<!-- STATUS:END -->

---

## 🚀 Como Rodar Localmente

### Pré-requisitos

- Node.js 20+
- pnpm 9+
- Conta Supabase (ou Supabase CLI + Docker para local)

### Frontend

```bash
cd front-end

# Instalar dependências
pnpm install

# Desenvolvimento (conecta ao Supabase real via .env.local)
pnpm dev             # http://localhost:5173

# Build de produção
pnpm build

# Build para testes E2E (modo mock, sem Supabase)
pnpm build:visual    # usa .env.test com VITE_USE_MOCK=true

# Preview do build
pnpm preview         # http://localhost:4173
```

#### Variáveis de ambiente (`.env.local`)

```bash
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key
```

### Backend (Supabase local)

```bash
cd back-end

# Iniciar stack local (requer Docker)
supabase start       # Studio em http://localhost:54323

# Aplicar migrações
supabase db reset

# Servir Edge Functions localmente
supabase functions serve
```

---

## 🧪 Testes

### Unitários (Vitest)

```bash
cd front-end
pnpm test            # modo watch
pnpm test --run      # modo CI (969 testes)
pnpm test:coverage   # com cobertura
```

### E2E (Playwright) — 37 testes

Os testes E2E usam o build com mock (`build:visual`) para não depender do Supabase.

```bash
cd front-end

# 1. Build com mock
pnpm build:visual

# 2. Em um terminal: subir o preview
pnpm preview -- --port 4173 --strictPort

# 3. Em outro terminal: rodar os testes
pnpm exec playwright test --config=playwright.ci.config.ts --reporter=list

# Ou tudo em um comando só (CI):
pnpm test:visual:ci
```

**Cobertura dos testes E2E:**
- Formulários de auth (login, register, forgot-password, reset-password)
- Guards de autenticação (7 rotas protegidas → redirect para login)
- Novas rotas de campanhas (meta-ads, google-ads)
- Rota raiz `/` → redirect para login
- `GET /version.json` — valida buildVersionPlugin
- Página de contatos (lista, kanban, toggles de view)
- Navegação por sidebar

---

## 🗂️ Estrutura do Frontend

```
front-end/src/
├── views/           # Componentes de página (alvos de rotas)
├── components/
│   ├── ui/         # Componentes base (shadcn-vue)
│   ├── common/     # Componentes compartilhados (AppHeader, AppSidebar...)
│   └── [feature]/  # Componentes de feature (contacts, sales, dashboard...)
├── stores/          # Pinia stores
├── router/          # Vue Router + guards (locale, auth, onboarding, project)
├── services/
│   ├── api/        # Clientes HTTP e serviços de API
│   ├── adapters/   # snake_case ↔ camelCase
│   └── [feature]/  # Repositórios de domínio
├── composables/     # Composables Vue reutilizáveis
├── locales/         # i18n (pt.json, en.json, es.json)
├── types/           # Definições TypeScript
├── schemas/         # Schemas Zod
└── mocks/           # Dados mock para testes
```

---

## 🗂️ Estrutura do Backend

```
back-end/supabase/
├── migrations/      # 50+ arquivos SQL de migração
└── functions/       # Edge Functions (runtime Deno)
    ├── projects/
    ├── companies/
    ├── contacts/
    ├── sales/
    ├── dashboard/
    ├── integrations/
    ├── trackable-links/
    ├── redirect/
    ├── messaging/
    ├── messaging-webhooks/
    ├── events/
    ├── origins/
    ├── stages/
    ├── tags/
    └── settings/
```

---

## 📌 Convenções

- **Commits:** Conventional Commits (`feat:`, `fix:`, `chore:`, `test:`, `docs:`)
- **Branches:** `main` (produção), `v3` (desenvolvimento atual), `fix/*` (hotfixes)
- **Adapters:** sempre converter snake_case → camelCase na borda da API
- **Ícones:** importar apenas via `src/composables/useIcons.ts`
- **Tipos:** TypeScript strict, sem `any`
- **i18n:** todas as strings via `t('chave')`, nunca hardcoded

---

## 🎯 Próximas Issues (Backlog)

| # | Prioridade | Issue |
|---|-----------|-------|
| [#6] | 🔴 Crítico | Backend: Sistema de Vendas e Conversões |
| [#7] | 🔴 Crítico | Backend: Analytics com dados reais |
| [#8] | 🟡 Alto | Backend: Links Rastreáveis |
| [#9] | 🟡 Alto | Backend: Completar Integrações (Meta/Google/TikTok) |
| [#10] | 🟢 Médio | Backend: WhatsApp testes + assinatura webhook |
| [#11] | 🟢 Médio | Frontend: i18n EN/ES completo |
| [#12] | 🟢 Médio | Frontend: Corrigir 22 falhas de testes unitários |
| [#13] | 📦 Baixo | Backend: Workers e Processamento Assíncrono |
| [#14] | 📦 Baixo | Backend: Auditoria e Monitoramento |
| [#15] | 📦 Baixo | DevOps: CI/CD e Deploy Automático |
| [#16] | 🟡 Alto | Frontend: Campaigns com dados reais |

Ver todas as issues: https://github.com/kennedyselect/Adsmagic-First-AI/issues

---

## 📄 Licença

Proprietário — todos os direitos reservados.
