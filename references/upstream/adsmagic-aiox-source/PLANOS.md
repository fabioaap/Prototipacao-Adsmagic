# Planos AdsMagic First AI

## Custo Unitário por Cliente (sem mão de obra)

| Item | Valor (R$) |
|---|---|
| Infraestrutura (Xano, WeWeb, etc.) | 8,00 |
| Uazapi (até 300 clientes) | 0,66 |
| Stripe (3,99% + R$ 0,39) | variável |
| Impostos (15,5% sobre faturamento) | variável |

**Custo fixo operacional por cliente: ~R$ 8,66/mês**

### Simulação de margem por faixa de preço

| Preço cobrado | Stripe (~4,4%) | Impostos (15,5%) | Custo fixo | Custo total | Margem líquida | % |
|---|---|---|---|---|---|---|
| R$ 97 | R$ 4,66 | R$ 15,04 | R$ 8,66 | R$ 28,36 | **R$ 68,64** | 71% |
| R$ 127 | R$ 5,98 | R$ 19,69 | R$ 8,66 | R$ 34,33 | **R$ 92,67** | 73% |
| R$ 147 | R$ 6,86 | R$ 22,79 | R$ 8,66 | R$ 38,31 | **R$ 108,69** | 74% |
| R$ 197 | R$ 7,06 | R$ 30,54 | R$ 8,66 | R$ 46,26 | **R$ 150,74** | 77% |

### Custo incremental por contato rastreado

| Volume de contatos | Custo extra infra/mês | O que escala |
|---|---|---|
| até 500 | ~R$ 2,50 | DB storage, queries |
| até 3.000 | ~R$ 15 | + edge function calls, bandwidth |
| até 10.000 | ~R$ 50 | + compute, backups, Uazapi |
| até 30.000 | ~R$ 150+ | precisa upgrade de plano Supabase |

**Custo incremental estimado: ~R$ 5 por 1.000 contatos/mês**

---

## Estrutura de Planos

| | **Starter** | **Growth** | **Pro** |
|---|---|---|---|
| **Preço** | **R$ 97/mês** | **R$ 247/mês** | **R$ 397/mês** |
| Projetos inclusos | 1 | 3 | 5 |
| Usuários | 2 | 5 | 15 |
| **Contatos rastreados** | **500 novos/mês por projeto** | **1.000 novos/mês por projeto** | **2.000 novos/mês por projeto** |
| **Funcionalidades** | | | |
| Dashboard + Funil de Vendas | x | x | x |
| Gestão de contatos | x | x | x |
| Links rastreáveis | x | x | x |
| Origens automáticas e manuais | x | x | x |
| Acompanhamento de Campanhas | x | x | x |
| Kanban + Estágios | x | x | x |
| Rastreio de WhatsApp | 1 número/projeto | 1 número/projeto | 1 número/projeto |
| Analytics (ROAS, CAC) | x | x | x |
| Integração com Meta Ads | x | x | x |
| Integração com Google Ads | — | x | x |
| Envio de dados para Meta/Google Ads | — | x | x |
| Dashboard Comparativo | — | — | x |
| Exportação CSV | — | — | x |
| IA Analyzer (em breve) | — | — | x |
| **Adicionais** | | | |
| Projeto adicional | R$ 79/mês | R$ 79/mês | R$ 79/mês |
| Contatos adicionais (por projeto) | R$ 29/500 contatos | R$ 19/500 contatos | R$ 9/500 contatos |
| Suporte | Central de ajuda | Chat | Prioritário |

> **Regra de contatos:** O limite refere-se a **novos contatos rastreados no mês por projeto**. Contatos existentes de meses anteriores permanecem acessíveis sem custo adicional. O contador reseta na data de renovação da assinatura. Se um projeto exceder o limite, o pacote adicional é cobrado automaticamente apenas naquele mês para aquele projeto.

---

## Margem por Plano (com contatos inclusos)

| Plano | Receita | Custo base | Custo contatos | Custo total | Margem | % |
|---|---|---|---|---|---|---|
| Starter (1 proj, 500/proj) | R$ 97 | R$ 28 | R$ 2,50 | R$ 31 | **R$ 66** | 68% |
| Growth (3 proj, 1K/proj) | R$ 247 | R$ 72 | R$ 15 | R$ 87 | **R$ 160** | 65% |
| Pro (5 proj, 2K/proj) | R$ 397 | R$ 115 | R$ 50 | R$ 165 | **R$ 232** | 58% |

### Margem nos adicionais

| Adicional | Receita | Custo real | Margem | % |
|---|---|---|---|---|
| Projeto extra (qualquer plano) | R$ 79 | R$ 24 | **R$ 55** | 70% |
| 500 contatos/proj (Starter) | R$ 29 | R$ 2,50 | **R$ 26,50** | 91% |
| 500 contatos/proj (Growth) | R$ 19 | R$ 2,50 | **R$ 16,50** | 87% |
| 500 contatos/proj (Pro) | R$ 9 | R$ 2,50 | **R$ 6,50** | 72% |

---

## Cenários de Uso Real

### Freelancer / Negócio próprio
- **Starter** (1 projeto, 500 contatos/mês): R$ 97/mês
- Margem: 68%

### Agência pequena (5 clientes)
- **Growth** (3 proj) + 2 adicionais: R$ 247 + R$ 158 = **R$ 405/mês**
- Ou **Pro** (5 proj): **R$ 397/mês** ← melhor custo-benefício
- Margem: 58–65%

### Agência média (10 clientes, alto volume)
- **Pro** (5 proj) + 5 adicionais + 10K contatos extra: R$ 397 + R$ 395 + R$ 90 = **R$ 882/mês**
- Custo total: ~R$ 365
- Margem: **R$ 517 (59%)**

### Cliente enterprise (5 projetos, ~5K contatos/proj/mês)
- **Pro** (2K/proj incluso) + 3K extra/proj × 5 proj = 5 × 6 pacotes de 500 = 30 pacotes
- R$ 397 + 30 × R$ 9 = **R$ 667/mês**
- Custo total: ~R$ 290
- Margem: **R$ 377 (57%)**
- Protege contra uso excessivo de infra sem punir o cliente

---

## Desconto Anual (2 meses grátis — 17% off)

| Plano | Mensal | Anual | Equivale a |
|---|---|---|---|
| Starter | R$ 97/mês | R$ 970/ano | R$ 81/mês |
| Growth | R$ 247/mês | R$ 2.470/ano | R$ 206/mês |
| Pro | R$ 397/mês | R$ 3.970/ano | R$ 331/mês |

---

## Alocação Sugerida da Margem (~60–70%)

Cenário com 100 clientes na base (ticket médio R$ 150):

| Destino | % da receita | Valor estimado |
|---|---|---|
| Marketing / aquisição | 20–25% | R$ 3.000–3.750/mês |
| Tecnologia / infra futura | 10–15% | R$ 1.500–2.250/mês |
| Reserva operacional | 10% | R$ 1.500/mês |
| Lucro líquido | 20–30% | R$ 3.000–4.500/mês |

---

## Análise Competitiva

### Reportei (reportei.com)

| | Starter | Pro | Premium |
|---|---|---|---|
| A partir de | R$ 74,90/mês | ~R$ 100+/mês | ~R$ 150+/mês |
| Projetos | 5+ (escalável) | 5+ (escalável) | 5+ (escalável) |
| Usuários | 3 | 8 | 20 |
| Integrações | 12 canais | 25 canais | 27 canais |
| Foco | Relatórios e dashboards | Relatórios + automação | Relatórios completos |

### Tintim (tintim.app)

| | Inicial | Escala | Profissional |
|---|---|---|---|
| Preço | R$ 197/mês | R$ 297/mês | R$ 997/mês |
| Números WhatsApp | 1 | 1+ (escalável) | Múltiplos |
| Conversas | Ilimitadas | Ilimitadas | Ilimitadas |
| Usuários | Ilimitados | Ilimitados | Ilimitados |
| Foco | Rastreio WhatsApp | + Webhook, Ads | Tudo |

### Posicionamento AdsMagic

| vs Reportei | vs Tintim |
|---|---|
| Reportei é **relatórios** — AdsMagic é **atribuição + CRM leve** | Tintim é só **WhatsApp** — AdsMagic cobre **multi-canal** |
| Reportei não tem gestão de contatos | Tintim não tem dashboard de ads multi-plataforma |
| AdsMagic compete no "e depois do lead?" | AdsMagic compete no "de onde veio o lead?" |

---

## Proposta de Valor por Plano

| Plano | Proposta |
|---|---|
| **Starter** | "Saiba de onde vêm seus leads sem custo alto" — validação rápida, preço de entrada acessível |
| **Growth** | "Conecte seus anúncios e veja o ROI real de cada campanha" — agências e e-commerces pequenos |
| **Pro** | "Atribuição completa + WhatsApp: do clique à venda em um só lugar" — operações de marketing |

---

## Arquitetura Técnica

### Tabelas no Supabase (a criar)

Nenhuma estrutura de planos/billing existe no banco atual. Todas as tabelas abaixo precisam ser criadas.

#### `plans` — Catálogo de planos

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | uuid PK | |
| `slug` | varchar UNIQUE | `starter`, `growth`, `pro` |
| `name` | varchar | Nome de exibição |
| `description` | text | Descrição do plano |
| `projects_included` | integer | Projetos inclusos (1, 3, 5) |
| `max_users` | integer | Limite de usuários (2, 5, 15) |
| `contacts_per_project` | integer | Novos contatos/mês por projeto (500, 1000, 2000) |
| `price_monthly` | integer | Preço mensal em centavos (9700, 24700, 39700) |
| `price_yearly` | integer | Preço anual em centavos |
| `stripe_product_id` | varchar | ID do product no Stripe |
| `stripe_price_monthly_id` | varchar | ID do price mensal no Stripe |
| `stripe_price_yearly_id` | varchar | ID do price anual no Stripe |
| `is_active` | boolean | Plano disponível para venda |
| `sort_order` | integer | Ordem de exibição |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

#### `plan_features` — Features por plano

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | uuid PK | |
| `plan_id` | uuid FK→plans | |
| `feature_slug` | varchar | Ex: `google_ads`, `csv_export`, `dashboard_compare`, `ia_analyzer` |
| `enabled` | boolean | Habilitado neste plano |
| `metadata` | jsonb | Config extra (ex: `{"limit": 50}` para links) |
| `created_at` | timestamptz | |

#### `plan_addons` — Add-ons disponíveis por plano

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | uuid PK | |
| `plan_id` | uuid FK→plans | |
| `addon_type` | varchar | `extra_project`, `extra_contacts` |
| `unit_amount` | integer | Quantidade do pacote (1 projeto, 500 contatos) |
| `price` | integer | Preço em centavos (7900, 2900, 1900, 900) |
| `stripe_price_id` | varchar | ID do price no Stripe |
| `description` | varchar | Texto de exibição |
| `created_at` | timestamptz | |

#### `subscriptions` — Assinatura ativa da company

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | uuid PK | |
| `company_id` | uuid FK→companies UNIQUE | 1 assinatura por company |
| `plan_id` | uuid FK→plans | Plano atual |
| `stripe_customer_id` | varchar | ID do customer no Stripe |
| `stripe_subscription_id` | varchar | ID da subscription no Stripe |
| `status` | varchar | `active`, `past_due`, `canceled`, `trialing` |
| `billing_cycle` | varchar | `monthly`, `yearly` |
| `current_period_start` | timestamptz | Início do período atual |
| `current_period_end` | timestamptz | Fim do período (data de renovação) |
| `canceled_at` | timestamptz | Quando cancelou |
| `trial_ends_at` | timestamptz | Fim do trial |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

#### `subscription_addons` — Add-ons ativos na assinatura

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | uuid PK | |
| `subscription_id` | uuid FK→subscriptions | |
| `addon_type` | varchar | `extra_project`, `extra_contacts` |
| `project_id` | uuid FK→projects NULL | Para `extra_contacts`, qual projeto |
| `quantity` | integer | Qtd de pacotes comprados |
| `stripe_item_id` | varchar | ID do item no Stripe |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

#### `usage_tracking` — Contagem mensal de contatos por projeto

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | uuid PK | |
| `project_id` | uuid FK→projects | |
| `period_start` | date | Início do período (alinhado com billing) |
| `period_end` | date | Fim do período |
| `contacts_created` | integer DEFAULT 0 | Contatos novos no período |
| `contacts_limit` | integer | Limite do período (plano + addons) |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

#### `stripe_webhook_events` — Idempotência de webhooks

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | varchar PK | Stripe event ID (`evt_...`) |
| `type` | varchar | Tipo do evento |
| `processed_at` | timestamptz | Quando foi processado |
| `status` | varchar | `processed`, `failed`, `skipped` |
| `payload` | jsonb | Payload completo (para debug) |

### Relacionamento entre tabelas

```
plans
  ├── plan_features (1:N)
  ├── plan_addons (1:N)
  └── subscriptions (1:N)
        ├── subscription_addons (1:N)
        └── companies (1:1)
              ├── projects (1:N)
              │     └── usage_tracking (1:N por período)
              └── company_users (1:N)
```

### Verificação de limites (lógica nos Edge Functions)

| Limite | Query |
|---|---|
| Projetos | `COUNT(projects WHERE company_id) <= plans.projects_included + SUM(subscription_addons.quantity WHERE addon_type = 'extra_project')` |
| Usuários | `COUNT(company_users WHERE company_id) <= plans.max_users` |
| Contatos/mês | `usage_tracking.contacts_created <= usage_tracking.contacts_limit` |
| Features | `plan_features WHERE plan_id AND feature_slug AND enabled = true` |

---

### Arquitetura de Webhooks — Cloudflare Workers + Queue

O frontend já roda no Cloudflare Pages. Stripe webhooks usam Cloudflare Workers + Queue para garantir confiabilidade e desacoplamento.

#### Por que não Supabase Edge Functions para webhooks

| Aspecto | Supabase Edge Function | Cloudflare Workers + Queue |
|---|---|---|
| Latência | ~50-200ms (Deno cold start) | ~1-5ms (V8 isolates, sem cold start) |
| Retries | Manual | Nativo no Queue (retry automático com backoff) |
| Garantia de entrega | Nenhuma — se falhar, perde o evento | At-least-once — Queue re-enfileira se falhar |
| Timeout | 60s | 30s Workers / 15min Queue consumers |
| Ecossistema | Separado | Mesmo do frontend (Cloudflare Pages) |

#### Fluxo

```
Stripe Webhook
      │
      ▼
Cloudflare Worker (stripe-webhook)
  ├── Valida assinatura (Stripe signature)
  ├── Checa idempotência (stripe_webhook_events)
  ├── Enfileira no Queue
  └── Responde 200 ao Stripe (< 5ms)
      │
      ▼
Cloudflare Queue (stripe-events)
      │
      ▼
Queue Consumer (stripe-processor)
  ├── invoice.paid → atualiza subscription status para 'active'
  ├── customer.subscription.updated → atualiza plano/addons/período
  ├── customer.subscription.deleted → marca subscription como 'canceled'
  ├── invoice.payment_failed → marca subscription como 'past_due'
  └── Grava tudo no Supabase via client HTTP (service_role key)
```

#### Componentes Cloudflare

| Componente | Função |
|---|---|
| `stripe-webhook` (Worker) | Recebe POST do Stripe, valida signature, enfileira |
| `stripe-events` (Queue) | Fila com retry automático e dead-letter |
| `stripe-processor` (Consumer) | Processa eventos e atualiza Supabase |

#### Eventos Stripe tratados

| Evento | Ação |
|---|---|
| `checkout.session.completed` | Cria subscription + vincula company |
| `invoice.paid` | Atualiza status para `active`, renova período |
| `invoice.payment_failed` | Marca status como `past_due` |
| `customer.subscription.updated` | Atualiza plano, addons, billing cycle |
| `customer.subscription.deleted` | Marca como `canceled`, registra `canceled_at` |

---

### Integrações necessárias (resumo)

| Componente | Tecnologia | O que fazer |
|---|---|---|
| Tabelas de planos | Supabase (PostgreSQL) | Criar 7 tabelas + RLS + indexes + triggers |
| Stripe Products/Prices | Stripe API | Criar products e prices para cada plano + addons |
| Stripe Checkout | Stripe Checkout Session | Redirecionar cliente para checkout do Stripe |
| Stripe Webhooks | Cloudflare Workers + Queue | Receber e processar eventos de billing |
| Middleware de limites | Supabase Edge Functions | Checar quotas antes de criar projetos/contatos |
| Frontend — Planos | Vue 3 (Cloudflare Pages) | Tela de seleção de planos e checkout |
| Frontend — Billing | Vue 3 (Cloudflare Pages) | Tela de uso, faturas, upgrade/downgrade |
