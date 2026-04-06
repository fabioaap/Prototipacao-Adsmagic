# Project Guidelines

## Build And Validate
- Install dependencies in both package roots before running or building: `npm install` and `npm install --prefix Plataforma`.
- Prefer root scripts from the repository root: `npm run dev`, `npm run build`, and `npm run preview`.
- Use `npm run dev:fo` only when you need the standalone Plataforma dev server. The workspace uses the first free port in the local range `3000-3006`, skipping `3001` because it is reserved for the docs portal.
- There is no automated test, lint, or format pipeline in this repo. After changes, run `npm run build` and manually verify the affected flows in the browser.

## Architecture
- The root `vite.config.js` points Vite at `Plataforma/`, so treat `Plataforma/src` as the main application source.
- `Plataforma/src/App.vue` only renders `RouterView`. `Plataforma/src/router/index.ts` mounts `AppLayout` at `/`, and feature screens render through the nested `RouterView` inside `Plataforma/src/components/layout/AppLayout.vue`.
- Keep structural layout concerns inside `Plataforma/src/components/layout/`. Feature pages belong in `Plataforma/src/views/<module>/` and should not import `AppLayout` directly.
- Pinia stores in `Plataforma/src/stores/` are thin adapters over local mock data from `Plataforma/src/data/`. Do not introduce API clients, backend calls, or persistence assumptions unless the task explicitly requires it.

## Conventions
- Use the `@/` alias for imports under `Plataforma/src` instead of deep relative paths.
- Follow the existing Vue 3 Composition API style with `script setup` and minimal store logic.
- Keep types close to the mocked data they describe when extending files in `Plataforma/src/data/`.
- Preserve the current Tailwind token usage, especially the `primary-*` palette from `Plataforma/tailwind.config.js`, instead of hardcoding new brand colors.
- When adding a new screen, register it as a lazy-loaded child route in `Plataforma/src/router/index.ts` and set `meta.title` so the document title logic continues to work.
- TypeScript runs with `strict: false`, so do not rely on the compiler alone to catch regressions.

## Documentation
- See `README.md` for setup, module overview, and the preferred local development entrypoints.
- See `PROTOTYPES-WORKFLOW.md` for branching and commit conventions related to prototype work.
- The organized project documentation now lives in `docs/` using Docusaurus. Prefer updating those pages when the task changes setup, architecture, journeys, or workflow guidance.