---
description: "Scaffold a new prototype module screen in the Adsmagic workspace, including view, optional mock data/store wiring, and lazy-loaded route registration."
name: "New Prototype Module"
argument-hint: "Module name, route path, page title, and optional data needs"
agent: "agent"
---

Create a new module for this workspace following the project conventions.

Inputs to infer or ask for if missing:
- Module name
- Route path
- `meta.title`
- Whether the screen needs new mock data, a new store, or can reuse existing data

Required behavior:
- Create the routed Vue screen under `Plataforma/src/views/<module>/` using `script setup`.
- If the module needs dedicated state, add or extend files under `Plataforma/src/data/` and `Plataforma/src/stores/` using the existing mock-first pattern.
- Register the page as a lazy-loaded child route in `Plataforma/src/router/index.ts`.
- Use Tailwind utilities and the existing `primary-*` color tokens instead of hardcoded brand colors.
- Use the `@/` alias for imports under `Plataforma/src`.
- Keep layout responsibilities in `Plataforma/src/components/layout/`; the new view must render as routed content inside the existing layout.

Before finishing:
- Run the minimum validation needed for the change.
- Summarize which files were added or updated.
- Call out any assumptions made about the module behavior.