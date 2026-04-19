---
title: Baseline As-Is
---

# Baseline As-Is adotado

Este documento registra qual referência do repo fonte foi adotada na rodada atual de documentação do AS-IS.

## Referência vigente

| Campo | Valor |
|---|---|
| Repo fonte | `https://github.com/kennedyselect/Adsmagic-First-AI` |
| Remote de referência no workspace | `aiox` |
| Espelho local de leitura | `_reference/adsmagic-aiox-source/` |
| Branch materializada no espelho local | `AIOX` |
| SHA materializado no espelho local | `a84f3de0658733b562324634f52ad7acf0a4208e` |
| Data do registro | `18/04/2026` |
| Status | baseline inicial após o reposicionamento do workspace |

## Observações

- Esta é a primeira referência controlada registrada depois da decisão de tratar o `Adsmagic-First-AI` como fonte de verdade do AS-IS.
- O espelho local em `_reference/adsmagic-aiox-source/` serve apenas para inspeção, comparação e leitura de arquivos.
- Sempre que o upstream avançar e o workspace precisar se realinhar, este documento deve ser atualizado antes de qualquer novo protótipo relevante.

## Checklist da próxima sincronização

- confirmar branch e SHA do upstream antes da rodada
- revisar `product/as-is.md`
- revisar `product/as-is-gap-register.md`
- decidir o que é documentação, protótipo local ou proposta de PR