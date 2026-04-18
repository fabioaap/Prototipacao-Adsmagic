# UI Foundation Phase 1

## Objetivo
Definir um contrato único de foundation para espaçamento, raio, altura de controles e largura de conteúdo, sem quebra funcional nas telas existentes.

## Fonte de Verdade
- Tokens: `src/assets/styles/main.css`
- Exposição Tailwind: `tailwind.config.js`

## Escalas Canônicas

### Spacing
- `--space-1`: 4px
- `--space-2`: 8px
- `--space-3`: 12px
- `--space-4`: 16px
- `--space-6`: 24px
- `--space-8`: 32px
- `--space-10`: 40px
- `--space-12`: 48px

Compatibilidade legada:
- `--spacing-*` agora é alias de `--space-*`.

### Radius
- `--radius-xs`: 4px
- `--radius-sm`: 6px
- `--radius-md`: 8px
- `--radius-lg`: 12px
- `--radius-xl`: 16px
- `--radius-surface`: 12px
- `--radius-control`: 14px
- `--radius-pill`: 9999px

### Control Heights
- `--control-height-sm`: 32px
- `--control-height-md`: 40px
- `--control-height-lg`: 48px

### Containers / Gutters
- `--container-sm`: 640px
- `--container-md`: 768px
- `--container-lg`: 1024px
- `--container-xl`: 1280px
- `--container-2xl`: 1400px
- `--gutter-mobile`: 16px
- `--gutter-tablet`: 24px
- `--gutter-desktop`: 32px

## Utilitários Base
- `.page-container`: centralização + max-width + gutter responsivo.
- `.section-stack-sm|md|lg`: ritmo vertical padrão (16/24/32).

## Classes Tailwind Expostas
- Radius: `rounded-surface`, `rounded-control`, `rounded-pill`
- Height: `h-control-sm`, `h-control-md`, `h-control-lg`
- Min height: `min-h-control-sm|md|lg`
- Max width: `max-w-content-sm|md|lg|xl|2xl`
- Spacing: `px-gutter-mobile|tablet|desktop` (quando necessário)

## Regras de Uso (próximas fases)
- Não usar valores arbitrários de raio (`rounded-[14px]`) fora de exceções documentadas.
- Evitar cores hardcoded (`text-gray-*`, `bg-white`, `border-gray-*`) em componentes de produto.
- Para páginas, preferir `.page-container` e stacks canônicos.
- Para inputs/select/buttons, usar alturas de controle canônicas.
