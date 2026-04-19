# UI QA Checklist - 2026-02-14

## Escopo auditado
- Rotas principais de produto (`views`)
- Callbacks de integrações
- Sweep tipográfico em componentes fora de `views`

## Criterios
- `C1`: container padronizado (`page-shell` ou excecao equivalente)
- `C2`: titulo de pagina via `PageHeader`
- `C3`: sem `h1` inline com classes ad-hoc
- `C4`: escala tipografica de seções (`section-title-*` / `section-kicker` / `section-description`)

## Matriz por tela (produto)

| Tela | C1 | C2 | C3 | C4 | Status |
|---|---|---|---|---|---|
| `dashboard/DashboardV2ViewNew.vue` | Excecao (`app-main dashboard-wide`) | OK | OK | Parcial | OK com ressalva |
| `contacts/ContactsView.vue` | OK | OK | OK | OK | OK |
| `sales/SalesView.vue` | OK | OK | OK | Parcial | OK |
| `messages/IndexView.vue` | OK | OK | OK | OK | OK |
| `tracking/TrackingView.vue` | OK | OK | OK | Parcial | OK |
| `events/EventsView.vue` | OK | OK | OK | Parcial | OK |
| `integrations/IntegrationsView.vue` | OK | OK | OK | OK | OK |
| `settings/FunnelView.vue` | OK | OK | OK | OK | OK |
| `settings/OriginsView.vue` | OK | OK | OK | Parcial | OK |
| `settings/SettingsView.vue` | OK | OK | OK | OK | OK |
| `projects/ProjectsView.vue` | OK | OK | OK | Parcial | OK |
| `pricing/PricingView.vue` | OK | OK | OK | OK | OK |
| `integrations/callbacks/MetaCallbackView.vue` | Excecao (blank layout) | N/A | OK | OK | OK |
| `integrations/callbacks/GoogleCallbackView.vue` | Excecao (blank layout) | N/A | OK | OK | OK |
| `integrations/callbacks/TikTokCallbackView.vue` | Excecao (blank layout) | N/A | OK | OK | OK |

## Sweep final em componentes (fora de `views`)

Status: **Concluido**, com excecoes intencionais.

Pendencias remanescentes intencionais:
1. `components/features/onboarding/OnboardingLayout.vue` (hero `h1` visual de onboarding).
2. `components/settings/SettingsGeneralTab.vue` (titulos com cor semantica de risco/acao).
3. `components/dashboard/DashboardStagesFunnel.vue` (titulo contextual de alerta em laranja).

## Evidencias de atencao
- `dashboard/DashboardV2ViewNew.vue` usa excecao controlada de container: `front-end/src/views/dashboard/DashboardV2ViewNew.vue:745`

## Validacao executada
- `npm run test:ds-gate` ✅
