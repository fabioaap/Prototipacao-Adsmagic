---
title: Constituição do Repositório
sidebar_label: Constituição
---

# Constituição do Adsmagic Workspace

> Este documento define o propósito, os princípios e as regras de convivência deste repositório. Ele é a referência canônica para qualquer dúvida sobre o que fazer — ou não fazer — aqui dentro.

---

## O que é este repositório

O **Adsmagic Workspace** é um workspace de descoberta e preparação de propostas para o produto Adsmagic. Ele serve como espaço onde produto, engenharia e marketing:

- documentam o estado atual do produto com base no repo fonte
- exploram hipóteses e fluxos do estado futuro com dados mockados
- empacotam contribuições que depois viram PRs no repo original

Ele não é o produto. É o **laboratório do produto e a fábrica de propostas**.

## Relação com o repo fonte

O repo `https://github.com/kennedyselect/Adsmagic-First-AI` é a fonte de verdade do AS-IS. Neste workspace ele deve ser tratado como **upstream de leitura e referência**, nunca como o lugar onde a implementação final acontece.

Isso implica quatro regras:

1. o AS-IS documentado aqui sempre aponta para uma branch ou um SHA rastreável do upstream
2. o clone em `references/upstream/adsmagic-aiox-source/` é apenas um espelho local para análise
3. protótipos e documentação vivem aqui; implementação real e PR vivem no repo fonte
4. quando o repo fonte incorpora uma melhoria nascida aqui, o AS-IS deste workspace é atualizado

---

## O que este repositório NÃO é

| O que parece ser | O que realmente é |
|---|---|
| Uma cópia operacional do app em produção | Um espelho exploratório com baseline controlado do upstream |
| Fonte de verdade do produto | Um espaço de entendimento, hipótese e handoff |
| Um ambiente de validação com APIs reais | Um ambiente mock-first de prototipação |
| Um caminho direto para deploy | Um workspace que prepara contribuições para o repo fonte |

---

## Princípios não-negociáveis

### 1. Upstream-first no AS-IS
Toda afirmação sobre o estado atual do produto deve apontar para o repo fonte `Adsmagic-First-AI` e para uma referência explícita de branch ou SHA registrada em `docs/docs/product/as-is-baseline.md`.

### 2. Mock-first na exploração
Durante a fase de exploração e UX, todos os dados permanecem mockados em `Plataforma/src/data/`. Este workspace não é o lugar para validar integrações reais.

### 3. Documentação como código
Mudanças estruturais relevantes são registradas na wiki de produto (`docs/`). Código sem contexto documentado não conta como pronto.

### 4. Prototipação isolada
Cada protótipo vive em sua própria branch (`prototypes/feature/<nome>`). Nada vai direto para `main` sem discussão.

### 5. As-Is antes do To-Be
A documentação do estado atual do produto (`product/as-is.md`) e o registro de gaps devem ser revisados antes de explorar melhorias. Não se muda o que não se entende.

### 6. Proposta antes da implementação upstream
Melhorias nascidas aqui só são consideradas prontas quando conseguem ser descritas como uma proposta de PR clara para o repo fonte, com contexto, escopo, riscos e critérios de aceite.

### 7. Times colaboram via documentos
Produto documenta as jornadas. Engenharia documenta a arquitetura. Marketing documenta o posicionamento. A wiki de produto é o ponto de encontro entre esses três mundos.

---

## Três modos de operação

### Modo Mapeamento AS-IS
- Branch base: `prototypes/as-is`
- Fonte: repo upstream + espelho local em `references/upstream/adsmagic-aiox-source/`
- Objetivo: documentar o estado atual do produto e registrar divergências conhecidas do workspace

### Modo Exploração TO-BE
- Branch: `prototypes/feature/<nome>`
- Dados: **mockados**
- Objetivo: testar UX, fluxos e hipóteses de produto com velocidade máxima

### Modo Proposal Pack
- Saída: `templates/upstream-pr-proposal.md` preenchido ou equivalente
- Objetivo: transformar o protótipo validado em uma proposta clara para implementação no repo fonte

---

## Times e papéis

### Time de Produto
Responsável por:
- Manter `docs/docs/product/as-is.md` e `to-be.md` atualizados
- Manter `docs/docs/product/as-is-baseline.md` e `as-is-gap-register.md` coerentes com o repo fonte
- Registrar jornadas de usuário em `docs/docs/jornadas.md`
- Avaliar protótipos hospedados e aprovar a promoção de hipóteses para proposta de PR

Ponto de entrada: [Produto As-Is](./product/as-is.md) → [Produto To-Be](./product/to-be.md) → [Jornadas](./jornadas.md)

### Time de Engenharia
Responsável por:
- Manter `docs/docs/architecture/` atualizado com decisões técnicas
- Implementar protótipos seguindo a estrutura de `Plataforma/src/`
- Seguir o workflow de branches descrito em `PROTOTYPES-WORKFLOW.md`
- Revisar mock data em `Plataforma/src/data/` conforme módulos evoluem
- Preparar o handoff técnico para o repo fonte

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
| 🔴 Canônico | Este arquivo + `product/as-is.md` + `product/as-is-baseline.md` | Propósito do workspace e referência adotada do upstream |
| 🟡 Estrutural | `architecture/visao-geral.md`, `product/as-is-gap-register.md` | Como o workspace está construído e onde ele diverge do repo fonte |
| 🟢 Operacional | `setup-local.md`, `workflow/prototipacao.md`, `workflow/as-is-sync.md` | Como trabalhar aqui |
| ⚪ Exploratório | `product/to-be.md`, stories, protótipos | Hipóteses e experimentos |

---

## Ciclo de vida de uma melhoria

| Etapa | Onde | Saída |
|---|---|---|
| **1. Descoberta do gap** | Este workspace | evidência do problema e hipótese inicial |
| **2. Fixação do baseline AS-IS** | Este workspace | branch/SHA registrados em `product/as-is-baseline.md` |
| **3. Prototipação mockada** | Este workspace | fluxo navegável ou prova visual |
| **4. Proposal Pack** | Este workspace | proposta pronta para virar PR no repo fonte |
| **5. Implementação real** | Repo fonte | branch e PR abertos no `Adsmagic-First-AI` |

### Handoff: o que sai deste workspace

O entregável formal deste repositório é uma **proposta de contribuição**, não um deploy. Toda proposta deve conter:

- problema observado no repo fonte
- referência exata do AS-IS adotado
- hipótese validada no protótipo
- áreas e arquivos prováveis do repo fonte
- critérios de aceite, riscos e testes sugeridos

---

## O que acontece quando um protótipo vai a produção

1. A melhoria é implementada no repo fonte em um PR criado lá
2. `product/as-is-baseline.md` é atualizado com a nova referência adotada
3. `product/as-is.md` e `product/as-is-gap-register.md` são revisados
4. O protótipo pode ser mantido como referência histórica ou arquivado

---

## Regras de contribuição

- **Crie uma branch por protótipo** — nunca misture múltiplos experimentos em uma branch
- **Documente antes de implementar** — abra um issue ou atualize `to-be.md` antes de codar
- **Não conecte APIs reais** — se precisar simular dados externos, use mocks em `data/`
- **Não modifique o repo fonte a partir daqui** — o upstream é referência; o PR é aberto no repo original
- **Atualize a wiki de produto** — mudanças estruturais sem documentação são ignoradas nas revisões
- **Respeite o As-Is** — mudanças que contradizem o estado documentado precisam de discussão

---

## Perguntas frequentes

**Por que não usamos o repositório de produção diretamente?**
Porque prototipação e documentação precisam de liberdade para errar rápido sem risco de quebrar o produto. Este workspace existe para entender, explorar e preparar contribuições.

**Onde fica o código de produção do Adsmagic?**
No repo `Adsmagic-First-AI`. Este workspace é exclusivo para exploração, documentação e proposal packs.

**Posso conectar APIs reais aqui?**
Não. Este workspace permanece mock-first.

**Posso criar novos módulos aqui?**
Sim, usando o mesmo padrão: view em `Plataforma/src/views/<modulo>/`, store em `stores/`, dados em `data/`, rota registrada em `router/index.ts`.

**Como sei se meu protótipo está pronto para discussão com produto?**
Quando você consegue navegar pelo fluxo completo localmente sem erros, o objetivo está documentado em `docs/` e a proposta já consegue apontar para a referência do upstream e para o impacto esperado.

**Quem aprova mudanças no README ou na Constituição?**
Qualquer membro do time pode propor via PR. A aprovação depende de alinhamento entre produto e engenharia.
