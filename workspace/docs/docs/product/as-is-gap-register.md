---
title: Registro de gaps As-Is
---

# Registro inicial de gaps As-Is

Este registro faz a triagem das divergências mais relevantes entre o workspace e o repo fonte. Ele não tenta listar tudo; serve para orientar as próximas rodadas de descoberta e proposta.

## Legenda de status

| Campo | Significado |
|---|---|
| Diagnóstico = `AS-IS` | divergência observada entre o workspace e o repo fonte |
| Diagnóstico = `Local` | ativo intencionalmente exclusivo do workspace |
| Execução = `Backlog` | ainda precisa de descoberta, escopo ou priorização |
| Execução = `Monitorado` | não exige convergência imediata |

## Inventário inicial

| ID | Eixo | Resumo | Situação no workspace | Referência no repo fonte | Diagnóstico | Execução | Prioridade | Próxima ação |
|---|---|---|---|---|---|---|---|---|
| GAP-001 | Jornadas e rotas | Shell autenticado do produto não está representado integralmente | o workspace hoje prioriza `/`, `/rotas`, `/kanban` e `/wiki` | o upstream contém rotas de auth, onboarding, projetos e módulos operacionais | AS-IS | Backlog | P0 | abrir auditoria por jornada começando em auth, onboarding e shell de projeto |
| GAP-002 | Auth e tenancy | autenticação, guards e contexto multi-tenant estão ausentes | não há login real, sessão ou seleção de projeto | o upstream possui auth pública, guards e escopo por projeto | AS-IS | Backlog | P0 | mapear estados de auth e projeto para representação documental e prototipada |
| GAP-003 | Dados e contratos | modelos de dados locais são simplificados | stores e dados mockados representam apenas o necessário para os protótipos atuais | o upstream usa contratos reais, schemas e serviços por domínio | AS-IS | Backlog | P0 | levantar entidades mínimas para dashboard, contatos, vendas e campanhas |
| GAP-004 | Integrações | integrações externas estão só parcialmente representadas | UI e documentação não cobrem callbacks, brokers e fluxos reais completos | o upstream trata Meta Ads, Google Ads, TikTok e WhatsApp com integrações reais | AS-IS | Backlog | P0 | priorizar inventário de integrações e estados de erro/sucesso |
| GAP-005 | Módulos operacionais | dashboard, CRM, vendas e campanhas aparecem em recortes isolados | existem protótipos e superfícies parciais, sem equivalência completa por módulo | o upstream possui módulos estruturados por rota, contexto e domínio | AS-IS | Backlog | P1 | criar briefs por módulo para dashboard, campanhas e CRM |
| GAP-006 | i18n e conteúdo | o workspace é essencialmente PT-BR | não há camada de locale equivalente à do produto real | o upstream mantém estrutura com PT, EN e ES | AS-IS | Backlog | P1 | decidir até onde a camada de i18n precisa ser representada no laboratório |
| GAP-007 | Componentes e design system | o catálogo local ainda não cobre toda a superfície do upstream | há styleguide e importações locais em evolução | o upstream possui catálogo amplo de componentes de UI e domínio | AS-IS | Backlog | P1 | auditar componentes por jornada e registrar candidatos a reaproveitamento |
| GAP-008 | Qualidade e validação | o workspace não replica a disciplina de testes do produto real | não há pipeline automatizado equivalente para unitários e E2E | o upstream já possui suite de testes e validações estruturadas | AS-IS | Backlog | P1 | definir checklist mínimo de verificação para protótipos e handoffs |
| GAP-009 | Operação e runtime | deploy, observabilidade e infraestrutura real não estão representados aqui | o workspace abstrai a camada operacional do produto | o upstream convive com auth, backend, deploy e integrações reais | AS-IS | Backlog | P2 | manter a camada operacional documentada, sem tentar simular infra real no laboratório |
| GAP-010 | Ativos exclusivos do workspace | portal de docs, LPs e superfícies de GTM são próprios deste repositório | docs, landing pages e materiais de workspace fazem parte da proposta local | esses ativos não são o foco do repo fonte de produto | Local | Monitorado | P2 | manter localmente e só convergir quando houver necessidade explícita |

## Observações de uso

- este registro é um artefato vivo e deve ser revisado sempre que o baseline do AS-IS mudar
- nem toda diferença é um problema; alguns ativos são intencionalmente locais
- um gap só deve virar proposta de PR quando já houver contexto suficiente para definir escopo, riscos e critérios de aceite