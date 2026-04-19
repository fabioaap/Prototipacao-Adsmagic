# Fase 2 - Desenvolvimento de UI - Plano de Implementação

**Data de criação**: 19/10/2025
**Versão**: 1.0
**Status**: 📋 PLANEJADA

---

## 📋 Visão Geral

A Fase 2 focará no desenvolvimento da interface do usuário (UI) do sistema Adsmagic First AI. Com a fundação técnica completa (Fase 1.5), agora implementaremos:

- Componentes reutilizáveis
- Layouts e estrutura de páginas
- Views/Páginas funcionais
- Integração com stores
- Aplicação do design system
- Testes de UI

---

## 🎯 Objetivos da Fase 2

1. ✅ Criar biblioteca de componentes reutilizáveis
2. ✅ Implementar layouts principais (Dashboard, Auth, Settings)
3. ✅ Desenvolver todas as páginas do MVP
4. ✅ Integrar stores com componentes
5. ✅ Aplicar design tokens em toda UI
6. ✅ Garantir responsividade (mobile, tablet, desktop)
7. ✅ Implementar dark mode toggle
8. ✅ Validar UX e acessibilidade

---

## 📦 Estrutura de Diretórios

```
src/
├── components/          # Componentes reutilizáveis
│   ├── base/           # Componentes base (Button, Input, Card, etc)
│   ├── common/         # Componentes comuns (Header, Sidebar, etc)
│   ├── dashboard/      # Componentes específicos do dashboard
│   ├── contacts/       # Componentes de contatos
│   ├── sales/          # Componentes de vendas
│   ├── settings/       # Componentes de configurações
│   └── index.ts        # Export centralizado
├── layouts/            # Layouts da aplicação
│   ├── DashboardLayout.vue
│   ├── AuthLayout.vue
│   └── SettingsLayout.vue
├── views/              # Páginas/Views principais
│   ├── dashboard/
│   ├── contacts/
│   ├── sales/
│   ├── settings/
│   └── auth/
└── assets/
    └── styles/
        ├── tokens.css  # ✅ Já criado
        ├── main.css    # ✅ Já existe
        └── components.css  # Estilos compartilhados
```

---

## 🗓️ Sessões da Fase 2

### Sessão 2.1: Componentes Base (Fundação)

**Objetivo**: Criar componentes base reutilizáveis

**Duração estimada**: 3-4 horas

**Componentes a criar**:
1. `BaseButton.vue` - Botão com variantes (primary, secondary, danger, ghost)
2. `BaseInput.vue` - Input com validação visual
3. `BaseTextarea.vue` - Textarea
4. `BaseSelect.vue` - Select customizado
5. `BaseCheckbox.vue` - Checkbox
6. `BaseRadio.vue` - Radio button
7. `BaseCard.vue` - Card container
8. `BaseModal.vue` - Modal/Dialog
9. `BaseBadge.vue` - Badge para status
10. `BaseSpinner.vue` - Loading spinner
11. `BaseAlert.vue` - Alert/Toast messages
12. `BaseTable.vue` - Tabela responsiva

**Características**:
- Props tipados com TypeScript
- Emits definidos
- Slots para customização
- Design tokens aplicados
- Acessibilidade (ARIA)
- Documentação com exemplos

---

### Sessão 2.2: Componentes Comuns

**Objetivo**: Criar componentes comuns da aplicação

**Duração estimada**: 2-3 horas

**Componentes a criar**:
1. `AppHeader.vue` - Header com navegação
2. `AppSidebar.vue` - Sidebar com menu
3. `AppFooter.vue` - Footer
4. `AppBreadcrumb.vue` - Breadcrumb navigation
5. `AppUserMenu.vue` - Menu do usuário (avatar + dropdown)
6. `AppNotifications.vue` - Central de notificações
7. `AppSearch.vue` - Busca global
8. `AppThemeToggle.vue` - Toggle dark/light mode
9. `AppLanguageSelector.vue` - Seletor de idioma
10. `AppPagination.vue` - Paginação

**Integração**:
- Usa stores (auth, language, darkMode)
- Composables (useLocalizedRoute, useDarkMode)
- Design tokens

---

### Sessão 2.3: Layouts

**Objetivo**: Criar layouts principais da aplicação

**Duração estimada**: 2 horas

**Layouts a criar**:
1. `DashboardLayout.vue` - Layout com sidebar + header
2. `AuthLayout.vue` - Layout para login/registro
3. `SettingsLayout.vue` - Layout com sidebar de configurações
4. `BlankLayout.vue` - Layout vazio (para modais, etc)

**Características**:
- Responsive (mobile-first)
- Slots para conteúdo
- Breadcrumb integrado
- Footer integrado

---

### Sessão 2.4: Dashboard - Métricas e Gráficos

**Objetivo**: Implementar dashboard principal com métricas

**Duração estimada**: 4-5 horas

**Componentes a criar**:
1. `DashboardMetricCard.vue` - Card de métrica (total contatos, vendas, receita)
2. `DashboardChart.vue` - Wrapper para ApexCharts
3. `DashboardFunnelChart.vue` - Gráfico de funil
4. `DashboardOriginChart.vue` - Gráfico por origem
5. `DashboardTimeSeriesChart.vue` - Série temporal
6. `DashboardQuickActions.vue` - Ações rápidas
7. `DashboardRecentContacts.vue` - Contatos recentes
8. `DashboardTopOrigins.vue` - Top origens

**View a criar**:
- `views/dashboard/DashboardView.vue`

**Integração**:
- Usa `useDashboardStore`
- Usa `useFormat` para formatação
- ApexCharts para gráficos
- Design tokens

**Dependência**:
- Instalar ApexCharts: `npm install apexcharts vue3-apexcharts`

---

### Sessão 2.5: Contatos - Lista e Kanban

**Objetivo**: Implementar tela de contatos (lista + kanban)

**Duração estimada**: 5-6 horas

**Componentes a criar**:
1. `ContactsList.vue` - Lista de contatos (tabela)
2. `ContactsKanban.vue` - Kanban por etapas
3. `ContactsFilters.vue` - Filtros avançados
4. `ContactCard.vue` - Card de contato (para kanban)
5. `ContactRow.vue` - Linha de contato (para lista)
6. `ContactDetailsModal.vue` - Modal de detalhes
7. `ContactFormModal.vue` - Modal criar/editar
8. `ContactQuickActions.vue` - Ações rápidas

**Views a criar**:
- `views/contacts/ContactsListView.vue`
- `views/contacts/ContactsKanbanView.vue`

**Integração**:
- Usa `useContactsStore`
- Usa `useStagesStore`
- Usa `useOriginsStore`
- Schemas Zod para validação
- Drag & drop para kanban

---

### Sessão 2.6: Vendas

**Objetivo**: Implementar tela de vendas

**Duração estimada**: 3-4 horas

**Componentes a criar**:
1. `SalesList.vue` - Lista de vendas
2. `SalesFilters.vue` - Filtros de vendas
3. `SaleCard.vue` - Card de venda
4. `SaleFormModal.vue` - Modal criar venda
5. `SaleLostModal.vue` - Modal marcar como perdida
6. `SalesMetrics.vue` - Métricas de vendas

**View a criar**:
- `views/sales/SalesView.vue`

**Integração**:
- Usa `useSalesStore`
- Schemas Zod para validação
- useFormat para valores monetários

---

### Sessão 2.7: Configurações - Etapas e Origens

**Objetivo**: Implementar configurações de etapas e origens

**Duração estimada**: 4-5 horas

**Componentes a criar**:
1. `StagesList.vue` - Lista de etapas
2. `StageCard.vue` - Card de etapa (drag & drop)
3. `StageFormModal.vue` - Modal criar/editar etapa
4. `OriginsList.vue` - Lista de origens
5. `OriginCard.vue` - Card de origem
6. `OriginFormModal.vue` - Modal criar/editar origem
7. `ColorPicker.vue` - Seletor de cor
8. `IconPicker.vue` - Seletor de ícone

**Views a criar**:
- `views/settings/StagesView.vue`
- `views/settings/OriginsView.vue`

**Integração**:
- Usa `useStagesStore`
- Usa `useOriginsStore`
- Schemas Zod para validação
- Drag & drop para reordenar

---

### Sessão 2.8: Configurações - Links de Rastreamento

**Objetivo**: Implementar configurações de links

**Duração estimada**: 3-4 horas

**Componentes a criar**:
1. `LinksList.vue` - Lista de links
2. `LinkCard.vue` - Card de link
3. `LinkFormModal.vue` - Modal criar/editar link
4. `LinkStatsModal.vue` - Modal de estatísticas
5. `LinkCopyButton.vue` - Botão copiar link

**View a criar**:
- `views/settings/LinksView.vue`

**Integração**:
- Usa `useLinksStore`
- Schemas Zod para validação
- Clipboard API

---

### Sessão 2.9: Eventos e Logs

**Objetivo**: Implementar tela de eventos/logs

**Duração estimada**: 2-3 horas

**Componentes a criar**:
1. `EventsList.vue` - Lista de eventos
2. `EventsFilters.vue` - Filtros de eventos
3. `EventCard.vue` - Card de evento
4. `EventDetailsModal.vue` - Modal detalhes
5. `EventRetryButton.vue` - Botão reenviar

**View a criar**:
- `views/events/EventsView.vue`

**Integração**:
- Usa `useEventsStore`
- Status badges

---

### Sessão 2.10: Autenticação

**Objetivo**: Implementar telas de autenticação

**Duração estimada**: 2-3 horas

**Views a criar**:
- `views/auth/LoginView.vue`
- `views/auth/RegisterView.vue`
- `views/auth/ForgotPasswordView.vue`

**Componentes**:
- Reutiliza BaseInput, BaseButton, etc
- Validação com Zod
- Usa `useAuthStore`

---

### Sessão 2.11: Onboarding e Project Wizard (OPCIONAL - já existe)

**Objetivo**: Revisar e melhorar onboarding existente

**Duração estimada**: 2 horas

**Ações**:
- Revisar `OnboardingView.vue` existente
- Revisar `ProjectWizardView.vue` existente
- Integrar com stores criadas
- Aplicar design tokens
- Melhorar validações

---

### Sessão 2.12: Responsividade e Mobile

**Objetivo**: Garantir responsividade em todas as telas

**Duração estimada**: 3-4 horas

**Ações**:
- Testar todas as views em mobile/tablet/desktop
- Ajustar breakpoints
- Implementar menu mobile (hamburger)
- Otimizar tabelas para mobile
- Testar touch interactions

---

### Sessão 2.13: Testes de UI e Refinamentos

**Objetivo**: Testar e refinar toda a UI

**Duração estimada**: 3-4 horas

**Ações**:
- Testar fluxos completos
- Corrigir bugs de UI
- Melhorar UX
- Validar acessibilidade
- Performance check
- Criar screenshot/demo

---

## 📊 Estimativa de Tempo Total

| Sessão | Duração | Acumulado |
|--------|---------|-----------|
| 2.1 - Componentes Base | 3-4h | 4h |
| 2.2 - Componentes Comuns | 2-3h | 7h |
| 2.3 - Layouts | 2h | 9h |
| 2.4 - Dashboard | 4-5h | 14h |
| 2.5 - Contatos | 5-6h | 20h |
| 2.6 - Vendas | 3-4h | 24h |
| 2.7 - Config Etapas/Origens | 4-5h | 29h |
| 2.8 - Config Links | 3-4h | 33h |
| 2.9 - Eventos | 2-3h | 36h |
| 2.10 - Autenticação | 2-3h | 39h |
| 2.11 - Onboarding (opcional) | 2h | 41h |
| 2.12 - Responsividade | 3-4h | 45h |
| 2.13 - Testes | 3-4h | 49h |

**Total estimado**: ~45-50 horas de implementação

**Dividido em sessões de 3h**: ~15-17 sessões

---

## 🎯 Dependências e Preparação

### Dependências a Instalar

```bash
# ApexCharts para gráficos
npm install apexcharts vue3-apexcharts

# Vue Draggable para drag & drop
npm install vuedraggable@next

# (Opcional) HeadlessUI para componentes acessíveis
npm install @headlessui/vue
```

### Arquivos Existentes para Reaproveitar

- ✅ Design tokens (`src/assets/styles/tokens.css`)
- ✅ Composables (`src/composables/*`)
- ✅ Stores (`src/stores/*`)
- ✅ Schemas (`src/schemas/*`)
- ✅ Utils (`src/utils/*`)
- ✅ Alguns componentes já existem (revisar e melhorar)

---

## 📝 Padrões e Boas Práticas

### Componentes Vue

```vue
<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  title: string
  variant?: 'primary' | 'secondary'
}

interface Emits {
  (e: 'click', value: string): void
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary'
})

const emit = defineEmits<Emits>()
</script>

<template>
  <div :class="`component-${variant}`">
    {{ title }}
  </div>
</template>

<style scoped>
.component-primary {
  background-color: var(--color-primary);
}
</style>
```

### Usar Design Tokens

```css
/* BOM ✅ */
.button {
  padding: var(--space-4);
  border-radius: var(--radius-base);
  color: var(--text-primary);
}

/* EVITAR ❌ */
.button {
  padding: 16px;
  border-radius: 6px;
  color: #111827;
}
```

### Integração com Stores

```typescript
import { useContactsStore } from '@/stores'
import { onMounted } from 'vue'

const contactsStore = useContactsStore()

onMounted(async () => {
  await contactsStore.fetchContacts()
})
```

---

## ✅ Checklist de Qualidade

Cada componente/view deve ter:

- [ ] TypeScript strict (zero `any`)
- [ ] Props e emits tipados
- [ ] Design tokens aplicados
- [ ] Responsivo (mobile/tablet/desktop)
- [ ] Acessibilidade (ARIA labels, keyboard nav)
- [ ] Dark mode suportado
- [ ] Validação com Zod (onde aplicável)
- [ ] Loading states
- [ ] Error states
- [ ] Empty states
- [ ] Documentação (comentários, JSDoc)

---

## 🚀 Como Começar

1. Instalar dependências adicionais
2. Começar pela Sessão 2.1 (Componentes Base)
3. Implementar incrementalmente
4. Testar cada componente isoladamente
5. Integrar com stores
6. Aplicar design tokens
7. Garantir responsividade
8. Testar fluxo completo

---

**Próximo passo**: Iniciar Sessão 2.1 - Componentes Base
