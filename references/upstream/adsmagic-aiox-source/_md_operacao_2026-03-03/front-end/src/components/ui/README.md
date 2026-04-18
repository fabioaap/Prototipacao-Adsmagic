# UI Component Matrix

Este documento define a fonte da verdade para componentes do design system.

## Status legend

- `active`: componente oficial para novos usos.
- `compat`: wrapper de compatibilidade; evitar novos usos.
- `deprecated`: legado; manter apenas até migração total.

## Core components

| Concern | Official | Allowed Compat | Deprecated |
| --- | --- | --- | --- |
| Buttons | `@/components/ui/Button.vue` | `@/components/ui/button/Button.vue` (infra) | - |
| Cards | `@/components/ui/Card.vue` + subcomponentes `Card*` | `MetricCard.vue`, `ChartCard.vue` (quando houver comportamento pronto) | `@/components/ui/aesthetic/*` |
| Modal/Dialog | `@/components/ui/Modal.vue`, `@/components/ui/Dialog.vue` | `DialogContent/DialogHeader/...` | `ModalV2.vue` |
| Search | `@/components/ui/SearchInput.vue` (listas/tabelas) | `SearchBar.vue` (apenas header/global) | uso de input custom para busca em telas core |
| Section wrapper | `@/components/ui/DashboardSection.vue` | - | `@/components/ui/aesthetic/DashboardSection.vue` |
| Grid KPI | `@/components/ui/StatGrid.vue` | - | `@/components/ui/aesthetic/StatGrid.vue` |
| Overlay primitives | `@/components/ui/*` | wrappers internos em `ui/radix/*` | import direto de `ui/radix/*` em código de produto |

## Regras de uso

1. Não importar `@/components/ui/aesthetic/*` em código novo de produto.
2. Não importar `@/components/ui/radix/*` direto em views/features; usar façade em `ui/*`.
3. Não usar `ModalV2` em código novo.
4. Em modais, escolher um único mecanismo de fechar (`showCloseButton` do `Modal` ou botão custom no header).
