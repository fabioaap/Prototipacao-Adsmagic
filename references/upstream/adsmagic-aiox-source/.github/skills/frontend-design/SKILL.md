---
name: frontend-design
description: Create distinctive, production-grade frontend interfaces with high design quality. Use this skill when the user asks to build web components, pages, artifacts, posters, or applications. Generates creative, polished code and UI design that avoids generic AI aesthetics.
---

# Frontend Design

Use this skill when building or refining UI in this repository.

## When to use

- New pages, dashboards, forms, flows, or feature UIs
- Visual refinement of existing screens
- Component styling and UX polishing
- Landing pages or internal app interfaces

## Rules for this repo

- Preserve the existing AdsMagic product language unless the user explicitly asks for a redesign.
- Prefer the established Vue 3, TypeScript, Tailwind v3, shadcn-vue, Pinia, and Vue Router stack.
- Reuse existing components and tokens before creating new patterns.
- Keep desktop and mobile behavior intentional.
- Avoid generic AI-looking UI choices.

## Design expectations

- Choose a clear aesthetic direction before coding.
- Use typography, spacing, contrast, and composition deliberately.
- Prefer a few meaningful visual moves over many average ones.
- Use motion sparingly and purposefully.
- Maintain accessibility and readable hierarchy.

## Implementation guidance

- Follow project conventions from [.github/copilot-instructions.md](../../copilot-instructions.md).
- When working in frontend code, also respect [CLAUDE.md](../../../CLAUDE.md) and existing workspace instructions.
- Reuse icons from `@/composables/useIcons`.
- Add translations when user-facing text changes.

## Reference

Canonical source: [.agents/skills/frontend-design/SKILL.md](../../../.agents/skills/frontend-design/SKILL.md)
