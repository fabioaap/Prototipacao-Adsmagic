---
title: Constituição do Repositório
sidebar_label: Constituição
---

# Constituição do Adsmagic Workspace

> Este documento define o propósito, os princípios e as regras de convivência deste repositório. Ele é a referência canônica para qualquer dúvida sobre o que fazer — ou não fazer — aqui dentro.

---

## O que é este repositório

O **Adsmagic Workspace** é o ambiente de prototipação assistida por IA do produto Adsmagic. Ele serve como espaço intermediário onde produto, engenharia e marketing exploram hipóteses, documentam o estado atual e materializam o estado futuro antes de qualquer commit em produção.

Ele não é o produto. É o **laboratório do produto**.

---

## O que este repositório NÃO é

| O que parece ser | O que realmente é |
|---|---|
| Uma cópia do app em produção | Um espelho exploratório com dados mockados |
| Fonte de verdade do produto | Um espaço de hipóteses e validação |
| Um ambiente de testes automatizados | Um ambiente de prototipação visual e funcional |
| Um monorepo de produção | Um workspace de exploração de UX e arquitetura |

---

## Princípios não-negociáveis

### 1. Mock-first na exploração
Durante a fase de exploração e UX, todos os dados são mockados em `Plataforma/src/data/`. O objetivo é explorar rápido sem depender de disponibilidade de serviços ou credenciais.

Isso **não impede** ambientes de growth ou testes A/B com APIs reais — esses operam em branches separadas com regras próprias (ver seção abaixo).

### 2. Documentação como código
Mudanças estruturais relevantes são registradas na wiki de produto (`docs/`). Código sem contexto documentado não conta como pronto.

### 3. Prototipação isolada
Cada protótipo vive em sua própria branch (`prototypes/feature/<nome>`). Nada vai direto para `main` sem discussão.

### 4. As-Is antes do To-Be
A documentação do estado atual do produto (`product/as-is.md`) deve sempre estar atualizada antes de explorar melhorias. Não se muda o que não se entende.

### 5. Times colaboram via documentos
Produto documenta as jornadas. Engenharia documenta a arquitetura. Marketing documenta o posicionamento. A wiki de produto é o ponto de encontro entre esses três mundos.

---

## Dois modos de operação

Este workspace não é só exploração. Ele opera em dois modos distintos com regras diferentes:

### Modo Exploração
- Branch: `prototypes/feature/<nome>`
- Dados: **mockados** (`Plataforma/src/data/`)
- APIs reais: **não**
- Objetivo: testar UX, fluxos e hipóteses de produto com velocidade máxima

### Modo Growth / Validação
- Branch: `prototypes/growth/<nome>`
- Dados: **reais** via APIs (Meta Ads, Google Ads, Supabase, webhooks, etc.)
- APIs reais: **sim**, com as seguintes regras:
  1. Credenciais ficam exclusivamente em `.env.local` (arquivo no `.gitignore`, nunca commitado)
  2. O objetivo do experimento deve estar registrado em `product/to-be.md` antes de iniciar
  3. O experimento é tratado como hipótese — não como código de produção
  4. Ao concluir, documentar o resultado em `docs/` antes de qualquer merge

> **Resumo:** mock-first é a regra para exploração de UX e arquitetura. APIs reais são permitidas em contextos de growth e testes A/B, desde que em branches dedicadas e com objetivo documentado.

---

## Times e papéis

### Time de Produto
Responsável por:
- Manter `docs/docs/product/as-is.md` e `to-be.md` atualizados
- Registrar jornadas de usuário em `docs/docs/jornadas.md`
- Avaliar protótipos hospedados e aprovar promoção de hipóteses para produção

Ponto de entrada: [Produto As-Is](./product/as-is.md) → [Produto To-Be](./product/to-be.md) → [Jornadas](./jornadas.md)

### Time de Engenharia
Responsável por:
- Manter `docs/docs/architecture/` atualizado com decisões técnicas
- Implementar protótipos seguindo a estrutura de `Plataforma/src/`
- Seguir o workflow de branches descrito em `PROTOTYPES-WORKFLOW.md`
- Revisar mock data em `Plataforma/src/data/` conforme módulos evoluem

Ponto de entrada: [Setup local](./setup-local.md) → [Visão geral da arquitetura](./architecture/visao-geral.md) → [Estrutura do protótipo](./architecture/estrutura-do-prototipo.md)

### Time de Marketing / GTM
Responsável por:
- Manter a documentação comercial e de posicionamento em `docs/docs/marketing/`
- Usar os agentes do squad de GTM para criar e revisar artefatos de marketing
- Alinhar as jornadas de usuário com os argumentos de venda

Ponto de entrada: [Squad de GTM](./marketing/squad-de-gtm.md) → [Wiki de Marketing](./wiki/index.md)

---

## Hierarquia de documentos

| Prioridade | Documento | O que define |
|---|---|---|
| 🔴 Canônico | Este arquivo + `product/as-is.md` | Propósito e estado real do produto |
| 🟡 Estrutural | `architecture/visao-geral.md` | Como o workspace está construído |
| 🟢 Operacional | `setup-local.md`, `workflow/prototipacao.md` | Como trabalhar aqui |
| ⚪ Exploratório | `product/to-be.md`, stories, protótipos | Hipóteses e experimentos |

---

## Ciclo de vida de um protótipo — Pipeline completo

Este workspace cobre as fases 1 e 2. As fases 3–5 acontecem no repo de produção, com @devops e @architect como responsáveis.

| Fase | Ambiente | Branch | APIs reais? | Responsável |
|---|---|---|---|---|
| **1. Exploração** | Este workspace | `prototypes/feature/<nome>` | ❌ | Produto + Engenharia |
| **2. Validação com dados reais** | Este workspace | `prototypes/growth/<nome>` | ✅ `.env.local` | Engenharia |
| **3. Canary** | Repo de produção (Cloudflare Pages) | `canary/<nome>` | ✅ | @devops + @architect |
| **4. Produção** | Cloudflare Pages `main` | `main` | ✅ | @devops |
| **5. Growth Analysis** | Ferramentas externas | — | — | GTM + Produto |

### Por que o canary é nativo nesta stack

O frontend de produção roda em **Cloudflare Pages**. Cada branch gera automaticamente uma URL de preview (`branch.adsmagic-frontend.pages.dev`). Não é necessária infraestrutura adicional para canary — basta abrir a PR no repo de produção.

O que ainda precisa ser decidido por @architect e @devops:

| Decisão | Responsável | Status |
|---|---|---|
| Ferramenta de feature flags | @architect | ✅ PostHog (já instalado) |
| Split de tráfego por segmento / % | @architect | ✅ PostHog cohorts + user properties |
| Growth analysis pós-canary | GTM + Produto | ✅ PostHog funnels + session replay |
| Secrets de produção para branches de canary no Cloudflare | @devops | ✅ Projeto separado `adsmagic-canary` no Cloudflare Pages, trackando `canary/*`, com secrets de produção no scope Preview — impede que branches de feature recebam chaves reais |
| Naming convention para branches de canary no repo de produção | @devops | ✅ `canary/YYYYMM/<kebab-slug>` (ex: `canary/202604/novo-titulo-hero`) — prefixo de data facilita cleanup; URL gerada: `202604-nome.adsmagic-canary.pages.dev` |

> **PostHog já resolve 3 das 5 decisões.** Split A/B via `useFeatureEnabled('nome-do-experimento')` no Vue — controle pelo painel, sem redeployar.

### Handoff: como o código sai do workspace

Por serem a mesma stack (Vue 3 + Vite + Tailwind), o código de um protótipo aprovado é portado diretamente — não reescrito:

```
1. PR no repo de produção referenciando prototypes/feature/<nome>
2. @architect revisa aderência à arquitetura real (APIs, auth, RLS Supabase)
3. @devops configura deploy canary no Cloudflare Pages
4. Testes A/B com tráfego real na URL de preview
5. Merge para main após validação das métricas
6. Atualizar product/as-is.md neste workspace
```

### Diagrama do pipeline

```
Hipótese (produto)
        ↓
[WORKSPACE] Exploração — branch feature/<nome>, dados mockados
        ↓ protótipo aprovado
[WORKSPACE] Validação Growth — branch growth/<nome>, APIs reais (.env.local)
        ↓ validação OK
[REPO PRODUÇÃO] Canary — Cloudflare Pages preview, split de tráfego
        ↓ métricas OK (@devops + @architect)
[REPO PRODUÇÃO] Produção — merge main, Cloudflare Pages
        ↓
[FERRAMENTAS] Growth Analysis — Meta Ads, Google Analytics, Supabase
        ↓ novos aprendizados
Próxima hipótese → reinicia o ciclo
```
```

---

## O que acontece quando um protótipo vai a produção

1. A feature é implementada no repositório real do produto
2. `product/as-is.md` neste workspace é atualizado para refletir o novo estado
3. O protótipo pode ser mantido na branch como referência histórica ou arquivado
4. A documentação em `docs/` deve refletir o novo AS-IS antes de iniciar o próximo ciclo

---

## Regras de contribuição

- **Crie uma branch por protótipo** — nunca misture múltiplos experimentos em uma branch
- **Documente antes de implementar** — abra um issue ou atualize `to-be.md` antes de codar
- **Não conecte APIs reais** — se precisar simular dados externos, use mocks em `data/`
- **Atualize a wiki de produto** — mudanças estruturais sem documentação são ignoradas nas revisões
- **Respeite o As-Is** — mudanças que contradizem o estado documentado precisam de discussão

---

## Perguntas frequentes

**Por que não usamos o repositório de produção diretamente?**
Porque prototipação precisa de liberdade para errar rápido sem risco de quebrar o produto. Este workspace tem zero dependência de infraestrutura real.

**Onde fica o código de produção do Adsmagic?**
Em um repositório separado. Este workspace é exclusivo para exploração e documentação.

**Posso criar novos módulos aqui?**
Sim, usando o mesmo padrão: view em `Plataforma/src/views/<modulo>/`, store em `stores/`, dados em `data/`, rota registrada em `router/index.ts`.

**Como sei se meu protótipo está pronto para discussão com produto?**
Quando você consegue navegar pelo fluxo completo localmente sem erros, e o objetivo está documentado em um commit, PR, ou nota em `docs/`.

**Quem aprova mudanças no README ou na Constituição?**
Qualquer membro do time pode propor via PR. A aprovação depende de alinhamento entre produto e engenharia.
