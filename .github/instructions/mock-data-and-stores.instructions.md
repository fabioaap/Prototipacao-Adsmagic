---
description: "Use when creating or editing Pinia stores or mock data files in apps/plataforma/src/stores and apps/plataforma/src/data. Covers the mock-first architecture, co-located types, and lightweight store patterns."
name: "Mock Data And Stores"
applyTo: "apps/plataforma/src/stores/**/*.ts,apps/plataforma/src/data/**/*.ts"
---

# Mock Data And Stores

- Keep the project mock-first. Stores in `apps/plataforma/src/stores/` should remain thin adapters over local data from `apps/plataforma/src/data/` unless the task explicitly asks for real persistence or APIs.
- Prefer keeping types close to the data they describe in `apps/plataforma/src/data/*.ts`, following the existing `export interface` plus `mock*` constant pattern.
- Keep store implementations minimal and aligned with the current Pinia composition style: import mock data, expose the state, and add only small derived helpers when the view already depends on them.
- Avoid introducing service layers, async fetching, or backend assumptions as a side effect of simple UI work.
- When changing mock data shapes, update every dependent store and affected view together because TypeScript runs with `strict: false` and will not reliably catch all mismatches.
- Use the `@/` alias for store-to-data imports instead of relative traversal.
