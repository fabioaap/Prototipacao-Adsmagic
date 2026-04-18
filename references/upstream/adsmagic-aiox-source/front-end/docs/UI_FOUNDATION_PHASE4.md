# UI Foundation Phase 4

## Objetivo
Remover hardcodes visuais (cores/radius) de componentes e telas prioritárias e alinhar para tokens semânticos do design system.

## Escopo aplicado

### Componentes base
- `src/components/ui/MetricCard.vue`
  - `gray/white` -> `foreground/muted/card/border`
  - tendência: `green/red` -> `success/destructive`
- `src/components/ui/ChartCard.vue`
  - `gray/white` -> `card/foreground/muted/border`
- `src/components/ui/FunnelBar.vue`
  - textos e fundo de barra -> tokens semânticos
  - cores default em hex removidas e substituídas por `hsl(var(--primary|info|success))`

### Telas prioritárias
- `src/views/companies/CompanySettingsView.vue`
  - hardcodes `gray/blue/white` removidos
  - formulários e botões alinhados para `primary`, `foreground`, `muted-foreground`, `border/input`
- `src/views/dashboard/DashboardViewRefactored.vue`
  - hardcodes `gray/white` removidos
  - cards/containers padronizados com `bg-card`, `border-border`, `rounded-surface`
  - array de cores de funil em hex substituído por tokens semânticos
- `src/views/contacts/ContactsView.vue`
  - `rounded-[12px]` -> `rounded-control`

## Verificação executada
- Busca por hardcodes no escopo:
  - `text-gray-*`, `bg-white`, `border-gray-*`, `text-blue-*`, `bg-blue-*`, `rounded-[...]`, hex colors
  - Resultado: sem ocorrências nos arquivos-alvo.
- `npm run test:ds-gate` -> OK
- `npx vitest run src/__tests__/Button.cva.spec.ts src/__tests__/Input.cva.spec.ts src/__tests__/Card.cva.spec.ts` -> 11/11 pass
