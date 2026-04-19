# UI Foundation Phase 2

## Objetivo
Consolidar primitives base e reduzir duplicidade entre camadas `ui/*`, `ui/visual/*` e `ui/button/*` sem quebrar imports existentes.

## Componentes Canônicos
- `@/components/ui/Button.vue`
- `@/components/ui/Input.vue`
- `@/components/ui/Card.vue`
- `@/components/ui/Select.vue`

## O que foi consolidado

### Button
- Fonte única de variantes: `src/components/ui/button/index.ts`
- `src/components/ui/Button.vue` agora usa `buttonVariants` compartilhado.
- `src/components/ui/visual/Button.vue` virou wrapper de compatibilidade (deprecated).

### Input
- Fonte única de variantes: `src/components/ui/input.variants.ts`
- `src/components/ui/Input.vue` agora suporta `variant` e `size` de forma canônica.
- `src/components/ui/visual/Input.vue` virou wrapper de compatibilidade (deprecated).

### Card
- Fonte única de variantes: `src/components/ui/card.variants.ts`
- `src/components/ui/Card.vue` agora suporta `variant`, `padded`, `as` e `class`.
- `src/components/ui/visual/Card.vue` virou wrapper de compatibilidade (deprecated), aplicando `padded=true`.

### Select
- `src/components/ui/Select.vue` atualizado para tokens canônicos:
  - `rounded-control`
  - `h-control-sm|md|lg`

## Compatibilidade
- Wrappers em `ui/visual/*` mantidos para evitar quebra imediata de testes e stories.
- Classes legadas (`h-9`, `h-10`, `h-11`, `w-10`) mantidas junto com tokens canônicos durante transição.

## Próxima etapa (Fase 3)
- Migrar imports de `ui/visual/*` para `ui/*`.
- Remover wrappers deprecated.
- Endurecer lint para impedir novos componentes paralelos.
