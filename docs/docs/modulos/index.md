---
title: Módulos do Produto
sidebar_position: 1
---

# Módulos do Produto

Esta seção documenta cada módulo do Adsmagic **como ele existe hoje** — screenshots capturados diretamente da plataforma rodando em modo mock (sem dados reais de produção)

![Lista de projetos Adsmagic](/img/screens/adsmagic/projects.png)

> Para entender a estrutura de rotas e integrações ativas, consulte também o [Produto As-Is](../product/as-is.md).

## Visão geral dos módulos

Todos os módulos abaixo estão disponíveis dentro de um projeto (`/pt/projects/:projectId/`):

| Módulo | Rota | Função principal |
|--------|------|-----------------|
| [Dashboard](./dashboard.md) | `dashboard-v2` | Painel de métricas e KPIs |
| [Contatos](./contatos.md) | `contacts` | CRM de leads e contatos |
| [Vendas](./vendas.md) | `sales` | Pipeline e histórico de conversões |
| [Mensagens](./mensagens.md) | `messages` | Central de mensagens |
| [Rastreamento](./rastreamento.md) | `tracking` | Links rastreáveis |
| [Eventos](./eventos.md) | `events` | Log de eventos da plataforma |
| [Analytics](./analytics.md) | `analytics` | Relatórios e gráficos |
| [Campanhas Google Ads](./campanhas-google.md) | `campaigns/google-ads` | Gestão de campanhas Google |
| [Campanhas Meta Ads](./campanhas-meta.md) | `campaigns/meta-ads` | Gestão de campanhas Meta |
| [Integrações](./integracoes.md) | `integrations` | Conexão com canais externos |
| [Configurações](./configuracoes.md) | `settings/*` | Ajustes do projeto |

## Convenções desta documentação

- Cada página descreve o **estado atual** do módulo (As-Is).
- Funcionalidades observadas no código fonte são declaradas como fatos; limitações ou gaps são sinalizados para o To-Be.
- Screenshots disponíveis são do repositório de desenvolvimento.
