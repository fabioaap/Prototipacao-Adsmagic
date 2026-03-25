---
title: Prototipação
---

# Workflow de prototipação

Este fluxo resume as convenções descritas no repositório para criação de protótipos no Adsmagic.

## Estrutura de branches

- `main` para a base estável
- `prototypes/as-is` para o baseline atual
- `prototypes/feature/<nome>` para cada experimento isolado

## Ciclo recomendado

1. partir de `prototypes/as-is`
2. criar uma branch específica do protótipo
3. implementar mudanças em `Plataforma/src/`
4. manter dados mockados
5. validar localmente
6. registrar o objetivo do protótipo em commit ou PR

## Convenção de commits

Prefixos mais usados:

- `proto:` para interface, UX e novos fluxos
- `data:` para dados mockados
- `fix:` para correções
- `chore:` para manutenção

## Regras importantes

- não fazer merge direto em `main` sem discussão
- manter cada protótipo independente
- evitar conexões com APIs reais durante exploração
- atualizar a documentação quando houver mudança estrutural

## Onde documentar

Use este portal Docusaurus para:

- setup
- arquitetura
- jornadas
- convenções do workspace

Use a rota `/wiki` da aplicação para:

- apoio leve dentro do protótipo
- alinhamentos rápidos visíveis para quem está navegando na UI