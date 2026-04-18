---
title: Sincronização do As-Is
---

# Sincronização do As-Is

Este playbook existe para evitar duas falhas recorrentes:

1. atualizar a documentação do produto sem referência rastreável
2. confundir o que o workspace prototipa com o que o repo fonte realmente contém

## Objetivo

Toda rodada de alinhamento do AS-IS deve produzir três saídas mínimas:

- branch ou SHA do upstream registrados em `product/as-is-baseline.md`
- `product/as-is.md` revisado contra a referência adotada
- divergências novas ou mantidas registradas em `product/as-is-gap-register.md`

## Insumos obrigatórios

- repo fonte: `https://github.com/kennedyselect/Adsmagic-First-AI`
- espelho local de leitura: `_reference/adsmagic-aiox-source/`
- branch base do workspace: `prototypes/as-is`

## Passo a passo

### 1. Escolher a referência da rodada

Defina a branch ou o SHA do upstream que será usado como fonte de verdade do ciclo atual. Não trabalhe contra um HEAD implícito.

### 2. Atualizar o espelho local

No clone em `_reference/adsmagic-aiox-source/`, atualize a branch de referência e confirme o SHA materializado.

Exemplo de verificação:

```bash
Set-Location _reference/adsmagic-aiox-source
git branch --show-current
git rev-parse HEAD
```

### 3. Registrar o baseline adotado

Atualize `docs/docs/product/as-is-baseline.md` com:

- repo fonte
- branch de referência
- SHA materializado
- data da rodada
- observações relevantes

### 4. Revisar o AS-IS do workspace

Compare jornadas, rotas, módulos, integrações, conteúdo e componentes com a referência adotada. Se a documentação atual não refletir o upstream, atualize `docs/docs/product/as-is.md`.

### 5. Atualizar o registro de gaps

Registre em `docs/docs/product/as-is-gap-register.md` qualquer divergência relevante entre o workspace e o repo fonte. Cada item deve dizer se é:

- diferença de representação do AS-IS
- hipótese de To-Be
- backlog ainda não pronto para virar proposta
- ativo exclusivo do workspace que não deve convergir

### 6. Decidir a próxima ação

Cada gap identificado deve terminar em uma decisão clara:

- documentar melhor
- abrir protótipo em `prototypes/feature/<nome>`
- preparar proposta de PR para o repo fonte
- manter como ativo local do workspace

## O que não fazer

- não editar o repo upstream a partir deste workflow
- não assumir que o AS-IS “é produção” sem registrar branch/SHA
- não tratar `_reference/adsmagic-aiox-source/` como pasta normal do workspace
- não abrir protótipo novo sem revisar o baseline e o gap register

## Artefatos tocados por rodada

- `docs/docs/product/as-is-baseline.md`
- `docs/docs/product/as-is.md`
- `docs/docs/product/as-is-gap-register.md`
- `docs/docs/product/to-be.md`, quando uma hipótese nova surgir