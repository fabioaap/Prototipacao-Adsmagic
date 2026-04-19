---
name: web-accessibility
description: Implement web accessibility standards following WCAG 2.1 guidelines. Use when building accessible UIs, fixing accessibility issues, or ensuring compliance with disability standards.
---

# Web Accessibility

Use this skill when creating or fixing UI that must remain accessible in AdsMagic.

## When to use

- Forms, modals, menus, dialogs, tabs, and dropdowns
- Keyboard interaction fixes
- Screen reader labeling fixes
- Focus management and ARIA validation

## Rules for this repo

- Target WCAG 2.1 AA by default.
- Prefer semantic HTML before adding ARIA.
- Keep localized labels compatible with the i18n structure.
- Preserve existing role and aria-label conventions used by Playwright tests.

## Implementation guidance

- Test keyboard navigation mentally while coding.
- Ensure visible focus and proper label association.
- Avoid introducing accessibility regressions in existing flows.
- When relevant, align selectors with accessible names used in tests.

## Reference

Canonical source: [.agents/skills/web-accessibility/SKILL.md](../../../.agents/skills/web-accessibility/SKILL.md)
