---
title: Prototipação
---

# Workflow de prototipação

Este workspace existe para **mapear o AS-IS, explorar o TO-BE com mocks e preparar propostas de contribuição**. A implementação final e os PRs de melhoria acontecem no repo fonte `Adsmagic-First-AI`.

## Pipeline recomendado

| Etapa | Onde | Saída |
|---|---|---|
| **1. Mapear gap** | Este workspace | hipótese, evidência e escopo do problema |
| **2. Fixar baseline AS-IS** | Este workspace | branch/SHA registrados em `product/as-is-baseline` |
| **3. Prototipar com mocks** | Este workspace | fluxo navegável ou proposta visual |
| **4. Empacotar proposta de PR** | Este workspace | handoff baseado em `templates/upstream-pr-proposal.md` |
| **5. Implementar e abrir PR** | Repo fonte | branch e PR no `Adsmagic-First-AI` |

## Branches do workspace

- `main` → base estável do workspace
- `prototypes/as-is` → baseline local alinhado ao upstream
- `prototypes/feature/<nome>` → exploração e proposta de melhoria

## Ciclo recomendado

1. escolher a referência do upstream e atualizar o espelho local em `_reference/adsmagic-aiox-source/`
2. registrar a referência em `product/as-is-baseline.md`
3. atualizar `product/as-is.md` e `product/as-is-gap-register.md` se houver divergências novas
4. criar `prototypes/feature/<nome>` a partir de `prototypes/as-is`
5. prototipar com dados mockados em `Plataforma/src/` ou `landing-pages/`
6. validar localmente com `npm run dev` ou `npm run lps:dev`
7. preparar a proposta em `templates/upstream-pr-proposal.md`
8. portar a melhoria para o repo fonte e abrir o PR lá

## Documentos de apoio

- [Sincronização do AS-Is](./as-is-sync.md)
- [Produto As-Is](../product/as-is.md)
- [Baseline As-Is](../product/as-is-baseline.md)
- [Registro de gaps AS-Is](../product/as-is-gap-register.md)

## Convenção de commits

| Prefixo | Uso |
|---------|-----|
| `docs:` | baseline, gap register, briefs e governança |
| `proto:` | UI, UX e fluxos prototipados |
| `data:` | dados mockados |
| `fix:` | correções do workspace |
| `chore:` | manutenção técnica |

## Regras importantes

- este workspace continua **mock-first**
- o repo upstream é a **fonte de verdade do AS-IS**
- o clone em `_reference/adsmagic-aiox-source/` é apenas **espelho de leitura**
- nenhuma proposta fica pronta sem **branch/SHA do upstream** e **higiene documental**
- quando algo nascer aqui e for aceito no repo fonte, o `product/as-is.md` deve ser atualizado

## Resultado esperado

O artefato final deste workflow não é deploy. É uma **proposta de contribuição pronta para virar PR** no repo fonte, com contexto, escopo, riscos e critérios de aceite bem definidos.