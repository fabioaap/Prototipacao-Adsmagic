---
name: tailwind-design-system
description: Build scalable design systems with Tailwind CSS, design tokens, component libraries, and responsive patterns. Use when creating component libraries, implementing design systems, or standardizing UI patterns.
---

# Tailwind Design System

Use this skill when standardizing UI patterns or building reusable components in AdsMagic.

## When to use

- Reusable UI components
- Variant systems and design tokens
- Responsive layout conventions
- Theme consistency and accessibility

## Rules for this repo

- This repository currently uses Tailwind CSS v3, not v4.
- Do not introduce Tailwind v4-specific patterns unless the user explicitly requests a migration.
- Prefer current utility patterns, shadcn-vue conventions, and existing class composition helpers.
- Keep additions compatible with the current frontend build.

## Implementation guidance

- Reuse existing UI primitives in `front-end/src/components/ui` before creating new ones.
- Keep semantic naming and variant boundaries clear.
- Prefer incremental standardization over broad visual rewrites.
- Ensure responsive behavior and keyboard/focus states are preserved.

## Reference

Canonical source: [.agents/skills/tailwind-design-system/SKILL.md](../../../.agents/skills/tailwind-design-system/SKILL.md)
