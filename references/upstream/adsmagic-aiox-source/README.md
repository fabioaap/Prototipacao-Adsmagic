# AdsMagic First AI

Plataforma SaaS multi-tenant para atribuição de marketing, tracking, CRM comercial, mensageria, analytics e billing.

> Atualizado em 19 de março de 2026.
> Este README descreve o estado atual do repositório. Planos, auditorias e rollouts antigos continuam versionados em `doc/`, `docs/` e `back-end/`, mas não substituem a leitura da árvore atual do código.

## Visão Geral

O monorepo já reúne partes em produção e módulos em evolução contínua. Hoje ele cobre:

- autenticação, onboarding, empresas e projetos
- dashboard V2 com KPIs, funil, pipeline, breakdown por origem e drill-down
- contatos, atividades, tags, origens, etapas e vendas
- links rastreáveis, redirect público e captura de UTMs/click IDs
- eventos de conversão e processamento assíncrono de jobs
- integrações OAuth e contas de anúncios
- mensageria/WhatsApp, webhooks e página pública de compartilhamento de QR code
- billing com Stripe, uso e limites por plano
- ad insights com campanhas, adsets, ads e configuração de tabela

## Arquitetura Atual

```text
AdsMagic First AI/
├── front-end/                    # App Vue 3 + Vite -> Cloudflare Pages
├── back-end/
│   ├── supabase/                 # Postgres, RLS, migrations, templates e Edge Functions
│   ├── redirect-worker/          # Worker de borda para redirects rastreáveis
│   ├── cron-worker/              # Trigger do job-worker a cada minuto
│   ├── messaging-webhook-worker/ # Queue/consumer de webhooks externos
│   └── stripe-webhook-worker/    # Queue/consumer para Stripe
├── tag-worker/                   # Tag JS pública + fila de eventos web
├── doc/                          # Documentação técnica e de negócio
└── docs/                         # Benchmarks, estudos e material complementar
```

### Componentes versionados no repo

- `front-end/`: aplicação principal em Vue 3 com rotas de auth, onboarding, projetos, dashboard, contatos, vendas, mensagens, tracking, eventos, integrações, campanhas, pricing e configurações.
- `back-end/supabase/`: 20 Edge Functions versionadas (sem contar `_shared`) e 81 migrations SQL.
- `back-end/*worker/`: 4 Workers Cloudflare dedicados para edge/runtime assíncrono.
- `tag-worker/`: Worker separado para servir `adsmagic-tag.js` por URL estável e enfileirar eventos antes de encaminhá-los ao Supabase.
- A raiz não possui um orquestrador único; cada módulo tem seus próprios scripts e dependências.

## Stack

| Camada | Tecnologias principais |
| --- | --- |
| Frontend | Vue 3, TypeScript, Vite, Tailwind CSS v3, Pinia, Vue Router, Zod, ApexCharts |
| Design System | shadcn-vue, Radix Vue, reka-ui, Storybook |
| Backend | Supabase Postgres, Supabase Auth, Row Level Security, Edge Functions Deno |
| Edge e filas | Cloudflare Workers, Cloudflare Queues, Cloudflare KV, Wrangler |
| Integrações | Meta Ads, Google Ads, TikTok Ads, WhatsApp brokers, Stripe |
| Testes | Vitest, Playwright, testes de worker, smoke/integration journeys |

## Back-end em Alto Nível

### Edge Functions principais

- Core: `projects`, `companies`, `contacts`, `sales`, `origins`, `stages`, `settings`, `tags`
- Analytics e atribuição: `dashboard`, `ad-insights`, `events`, `trackable-links`, `redirect`, `analytics-worker`, `job-worker`
- Integrações e mensageria: `integrations`, `messaging`, `messaging-webhooks`, `whatsapp-share`, `billing`

### Workers Cloudflare

- `back-end/redirect-worker/`: proxy/edge para `r.adsmagic.com.br/*`
- `back-end/cron-worker/`: dispara o `job-worker` do Supabase a cada minuto
- `back-end/messaging-webhook-worker/`: consome fila de webhooks de mensageria
- `back-end/stripe-webhook-worker/`: consome fila de eventos Stripe
- `tag-worker/`: expõe a tag pública (`/v1/adsmagic-tag.js`) e envia eventos para fila

## Produção e Runtime

O repositório já contém configuração e código para runtime de produção em múltiplas frentes:

- frontend com build Vite e deploy para Cloudflare Pages
- geração automática de `version.json` no build do frontend
- redirect rastreável em domínio dedicado via Cloudflare Worker
- Edge Functions no Supabase para APIs privadas e endpoints públicos controlados
- processamento assíncrono por cron, filas e workers dedicados
- tracking web com tag pública e encaminhamento de eventos para a API `events/track`

## Status das Etapas

> Percentuais estimados com base no estado atual do código versionado em 19 de março de 2026.
> Eles representam maturidade funcional do repositório, não garantia de rollout final, observabilidade ou cobertura total em produção.

### Visão Geral

| Etapa | Conclusão | Situação atual |
| --- | --- | --- |
| Fundação, auth, multi-tenancy e onboarding | 100% | Estrutura base estabilizada e operacional |
| CRM operacional: projetos, contatos, origens, etapas, tags e vendas | 90% | CRUDs e fluxos principais implementados |
| Tracking e atribuição: links, redirect, tag e eventos | 88% | Base funcional pronta, com hardening pontual ainda aberto |
| Integrações, WhatsApp e mensageria | 85% | Fluxos principais existem, faltam coberturas e acabamento operacional |
| Dashboard, analytics e ad insights | 78% | Endpoints, cache e workers existem; falta consolidar consistência de dados em todos os cenários |
| Billing, limites e Stripe | 80% | Estrutura principal implementada, ainda exige validação operacional completa |
| Workers, automações, observabilidade e CI/CD | 58% | Há runtime assíncrono ativo, mas ainda com gaps de monitoramento e pipeline |
| Projeto geral | 82% | Produto já operável, com foco restante em hardening, cobertura e fechamento de lacunas |

### Detalhe por frente

| Frente | Conclusão | Observação |
| --- | --- | --- |
| Frontend | 90% | Rotas e módulos principais estão presentes; faltam principalmente i18n completo, refinamentos e hardening |
| Backend Supabase | 84% | Migrations, funções e domínio principal já existem; faltam consolidação operacional e fechamento de bordas |
| Edge/Workers | 78% | Redirect, cron, filas e tag worker existem; CI/CD e observabilidade ainda não estão no mesmo nível |

## Módulos de Produto Já Presentes no Código

- Auth e onboarding
- Gestão de empresas e projetos
- CRM de contatos com histórico/atividades
- Funil comercial e vendas
- Dashboard V2 e analytics
- Tracking, links rastreáveis e redirect
- Eventos de conversão
- Integrações de mídia paga
- Mensageria e WhatsApp
- Billing e limites
- Design system e Storybook

## O Que Ainda Falta

- Consolidar observabilidade e operação: alertas, dashboards, logs centralizados, runbooks e revisão contínua de advisors.
- Fechar CI/CD além do fluxo já existente do `redirect-worker`, incluindo validações automatizadas para frontend, Edge Functions e workers.
- Expandir cobertura de testes automatizados nos fluxos mais críticos de billing, tracking, mensageria, integrações e processamento assíncrono.
- Completar hardening de produção para filas, retries, deduplicação, timeouts e cenários de falha entre Workers e Supabase.
- Finalizar a consistência de dados reais em todas as telas analíticas e nos módulos de campanhas/ad insights.
- Fechar lacunas de UX e i18n, especialmente traduções EN/ES e estados vazios/erro/sucesso em alguns fluxos.
- Revisar e sincronizar documentação histórica por módulo para reduzir divergência entre planos antigos e o estado atual do código.

## Como Rodar Localmente

### Pré-requisitos

- Node.js 20+
- pnpm 9+
- Supabase CLI
- Docker Desktop para stack local do Supabase
- Wrangler para os workers Cloudflare

### 1. Frontend

```bash
cd front-end
cp .env.example .env.local
pnpm install
pnpm dev
```

Build, preview e deploy:

```bash
cd front-end
pnpm build
pnpm preview
pnpm deploy:preview
pnpm deploy:production
```

### 2. Backend Supabase

```bash
cd back-end
supabase start
supabase db reset
supabase functions serve
```

### 3. Workers opcionais

```bash
cd back-end/redirect-worker
npm install
npm run dev
```

```bash
cd back-end/cron-worker
npm install
npm run dev
```

```bash
cd back-end/messaging-webhook-worker
npm install
npm run dev
```

```bash
cd back-end/stripe-webhook-worker
npm install
npm run dev
```

```bash
cd tag-worker
pnpm install
pnpm dev
```

## Variáveis de Ambiente

### Frontend

Use `front-end/.env.example` como base. Variáveis mais importantes:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- client IDs OAuth (`VITE_META_CLIENT_ID`, `VITE_GOOGLE_CLIENT_ID`, `VITE_TIKTOK_CLIENT_ID`, etc.)
- feature flags de polling/mock quando necessário

### Backend

Consulte `back-end/ENV_VARIABLES.md`. Variáveis centrais:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- secrets de OAuth, mensageria, Stripe e workers internos

### Workers

Cada worker usa `wrangler.toml` e secrets configurados com `wrangler secret put`.

## Testes

### Frontend

```bash
cd front-end
pnpm test
pnpm test:coverage
pnpm test:e2e
pnpm test:integration
pnpm test:visual:ci
pnpm storybook
```

### Redirect Worker

```bash
cd back-end/redirect-worker
npm install
npm test
```

## Documentação Relacionada

- [README do frontend](./front-end/README.md)
- [README do backend](./back-end/README.md)
- [Documentação técnica e de negócio](./doc/README.md)
- [Schema do banco](./doc/database-schema.md)
- [Changelog funcional](./doc/CHANGELOG.md)

## Observações

- Há bastante documentação histórica no repositório registrando etapas de rollout, deploys específicos e planos de implementação.
- Para entender o estado atual do produto, priorize este README, a árvore de diretórios e os módulos ativos em `front-end/`, `back-end/supabase/functions/` e `back-end/*worker/`.
