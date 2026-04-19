# UI Foundation Phase 3

## Objetivo
Finalizar a migração para componentes canônicos e bloquear regressão para caminhos legados.

## Entregas

### 1) Migração de imports legados
- Testes CVA migrados:
  - `src/__tests__/Button.cva.spec.ts`
  - `src/__tests__/Input.cva.spec.ts`
  - `src/__tests__/Card.cva.spec.ts`
- Stories migradas:
  - `src/stories/atoms/Toast.stories.ts`
  - `src/stories/atoms/Modal.stories.ts`

### 2) Remoção dos wrappers deprecated
- Removidos:
  - `src/components/ui/visual/Button.vue`
  - `src/components/ui/visual/Input.vue`
  - `src/components/ui/visual/Card.vue`

### 3) Guardrail de design system
- Criado script: `scripts/check-ds-gate.sh`
- Script bloqueia imports legados:
  - `@/components/ui/visual/*`
  - `@/components/ui/button/Button.vue`
- `front-end/package.json` já contém `test:ds-gate` apontando para esse script.

## Verificação
- DS Gate:
  - `bash scripts/check-ds-gate.sh` -> OK
- Testes de regressão das variantes:
  - `npx vitest run src/__tests__/Button.cva.spec.ts src/__tests__/Input.cva.spec.ts src/__tests__/Card.cva.spec.ts` -> 11/11 pass
