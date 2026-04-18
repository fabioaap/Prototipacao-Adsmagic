---
description: "Use when creating or editing Vue feature screens, module pages, or routed views under apps/plataforma/src/views. Covers page structure, routing expectations, and Tailwind usage for this prototype app."
name: "Vue Views Guidelines"
applyTo: "apps/plataforma/src/views/**/*.vue"
---

# Vue Views Guidelines

- Treat files in `apps/plataforma/src/views/` as routed screen content only. Layout chrome belongs to `apps/plataforma/src/components/layout/`, so do not import or recreate `AppLayout` inside a view.
- Match the existing Vue 3 `script setup` style and keep page-local helpers lightweight. Inline formatting helpers such as `formatCurrency` are acceptable when the logic is used only by that screen.
- Build screens with Tailwind utility classes and preserve the existing visual tokens, especially the `primary-*` palette instead of introducing new hardcoded brand colors.
- Keep modules self-contained: a new screen should usually read from a Pinia store or local mock data rather than embedding large static datasets directly in the view.
- When a task adds a new screen, also register it as a lazy-loaded child route in `apps/plataforma/src/router/index.ts` and set `meta.title` so the document title stays correct.
- Follow the current page composition patterns from `DashboardView.vue` and `SalesView.vue`: simple computed state, direct store reads, and template-first layout structure.
