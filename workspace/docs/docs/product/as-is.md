---
title: Produto As-Is
---

# Produto As-Is

Esta seção documenta o Adsmagic como ele existe hoje, usando como referência rastreável o repo fonte `Adsmagic-First-AI`.

> **O As-Is deste workspace não é uma memória informal.** A referência adotada em cada rodada fica em [Baseline As-Is](./as-is-baseline.md). Divergências conhecidas entre o laboratório e o repo fonte ficam em [Registro de gaps As-Is](./as-is-gap-register.md).

## Fonte de verdade adotada nesta documentação

- **Repo fonte:** `https://github.com/kennedyselect/Adsmagic-First-AI`
- **Espelho local de leitura:** `_reference/adsmagic-aiox-source/`
- **Regra editorial:** esta página só deve mudar quando houver uma rodada controlada de sincronização do AS-IS
- **Regra operacional:** melhorias nascidas neste workspace viram PRs no repo fonte e só depois atualizam o AS-IS documentado aqui

## O que é o Adsmagic

O Adsmagic é uma plataforma de gestão de marketing digital orientada a projetos. Cada conta cria um ou mais projetos e, dentro de cada projeto, opera módulos conectados de campanhas, contatos, vendas, rastreamento e integrações.

## Estrutura de navegação atual

A plataforma hoje está organizada em grupos de rotas:

### Autenticação (7 rotas — públicas)

| Rota | Descrição |
|---|---|
| `/pt/login` | Login com e-mail e senha |
| `/pt/register` | Cadastro de nova conta |
| `/pt/email-confirmation` | Confirmação de e-mail |
| `/pt/forgot-password` | Recuperação de senha |
| `/pt/reset-password` | Redefinição de senha |
| `/pt/verify-otp` | Verificação por OTP |
| `/pt/auth/oauth/callback` | Callback OAuth |

### Onboarding (3 rotas — requer autenticação)

| Rota | Descrição |
|---|---|
| `/pt/onboarding` | Fluxo inicial de boas-vindas |
| `/pt/project/new` | Assistente de criação de projeto |
| `/pt/project/completion` | Conclusão do setup do projeto |

### Nível raiz (3 rotas — requer autenticação)

| Rota | Descrição |
|---|---|
| `/pt/projects` | Lista de projetos da conta |
| `/pt/pricing` | Planos e precificação |
| `/pt/company/settings` | Configurações da empresa |

### Módulos do projeto (11 rotas — requer autenticação)

Todas as rotas abaixo têm o prefixo `/pt/projects/:projectId/`.

| Módulo | Path relativo | Descrição |
|---|---|---|
| Dashboard | `dashboard-v2` | Painel central de métricas |
| Contatos | `contacts` | CRM de contatos e leads |
| Vendas | `sales` | Pipeline e histórico de vendas |
| Mensagens | `messages` | Central de mensagens |
| Rastreamento | `tracking` | Configuração de pixels e eventos |
| Eventos | `events` | Log de eventos rastreados |
| Integrações | `integrations` | Conexão com plataformas externas |
| Analytics | `analytics` | Analíticos e relatórios |
| Campanhas Google | `campaigns/google-ads` | Gestão de campanhas Google Ads |
| Campanhas Meta | `campaigns/meta-ads` | Gestão de campanhas Meta Ads |

### Configurações do projeto (3 rotas)

| Rota | Descrição |
|---|---|
| `settings/general` | Configurações gerais do projeto |
| `settings/funnel` | Configuração de funil de vendas |
| `settings/origins` | Origens de tráfego |

### Integrações com callbacks (3 rotas)

- Meta Ads callback
- Google Ads callback
- TikTok callback

## Integrações ativas

O Adsmagic atual se conecta com:

- **Meta Ads** (Facebook / Instagram)
- **Google Ads**
- **TikTok Ads**

## Limitações conhecidas do estado atual

Esta seção descreve o produto como está hoje na referência adotada. Problemas identificados, lacunas de experiência e oportunidades de evolução são registrados em dois lugares:

- [Produto To-Be](./to-be.md) para hipóteses e direções de melhoria
- [Registro de gaps As-Is](./as-is-gap-register.md) para divergências observadas entre o workspace e o repo fonte