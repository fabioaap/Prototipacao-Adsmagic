# UI Foundation - Phase 5 (Homogeneizacao Tipografica Final)

## Objetivo
Padronizar a escala tipografica final de titulos por pagina e por secao interna, eliminando variacoes manuais entre views.

## Mudancas aplicadas

1. `PageHeader` mantido como fonte canonica para titulo de pagina (`h1`) com escala padrao `page`.
2. Criadas classes globais de titulos de secao em `app-layout.css`:
   - `.section-title-lg`
   - `.section-title-md`
   - `.section-title-sm`
   - `.section-kicker`
   - `.section-description`
3. Migracao de `h2/h3` com classes ad-hoc para escala padronizada em views principais:
   - `companies/CompanySettingsView.vue`
   - `settings/SettingsView.vue`
   - `settings/FunnelView.vue`
   - `contacts/ContactsView.vue`
   - `messages/IndexView.vue`
   - `integrations/IntegrationsView.vue`
   - `pricing/PricingView.vue`
   - callbacks de integracoes (`Google`, `Meta`, `TikTok`)
4. Ajuste de componente transversal:
   - `components/dashboard/DashboardSection.vue` atualizado para usar classes tipograficas padrao e tokens de cor.

## Resultado esperado
- Hierarquia visual consistente entre paginas:
  - `h1` de pagina via `PageHeader`
  - `h2/h3` de secao via `section-title-*`
- Reducao de divergencia de peso/tamanho/cor entre telas.
- Menor risco de regressao visual em novas paginas.
