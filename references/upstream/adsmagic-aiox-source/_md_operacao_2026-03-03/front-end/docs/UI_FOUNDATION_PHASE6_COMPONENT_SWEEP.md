# UI Foundation - Phase 6 (Component Sweep Final)

## Objetivo
Aplicar a homogenizacao tipografica final em componentes fora de `views`, removendo classes de titulo ad-hoc (`text-lg font-semibold`, `text-xl font-semibold`, etc.) e migrando para classes semanticas do design system.

## Escala aplicada
- `section-title-lg`
- `section-title-md`
- `section-title-sm`
- `section-kicker`
- `section-description`

## Escopo
Sweep aplicado em componentes de:
- `companies`
- `contacts`
- `dashboard` e `dashboardV2`
- `events`
- `features` (legados relevantes)
- `integrations`
- `layout`
- `projects`
- `sales`
- `settings`
- `tags`
- `tracking`

## Observacoes
- Titulo de onboarding hero (`OnboardingLayout`) foi mantido como excecao proposital por contexto visual.
- Titulos com cor semantica de alerta/perigo foram mantidos quando carregavam significado de estado.
