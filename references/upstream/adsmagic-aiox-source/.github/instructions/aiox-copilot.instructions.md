---
name: AIOX Copilot Runtime
description: Copilot-native runtime rules for this AIOX workspace.
applyTo: "**/*"
---

# AIOX Copilot Runtime

- In VS Code Copilot, prefer `.github/agents` for agent personas, `.github/skills` for skills, and `.github/copilot-instructions.md` for always-on repository guidance.
- Treat `.claude/rules` as compatibility instructions that may still apply, but prefer `.github/instructions` for Copilot-native behavior when there is overlap.
- Do not assume Claude-specific hooks or Codex-specific shortcuts are available in Copilot unless the current agent file explicitly supports an equivalent behavior.
- Prefer native VS Code tools and built-in chat capabilities over MCP infrastructure unless the task explicitly requires MCP-backed behavior.
- For this repository, keep changes compatible with the existing Vue 3, TypeScript, Tailwind v3, Supabase, and Playwright stack.
- Do not create a root `package.json` or root `node_modules` only to satisfy framework diagnostics.
- Treat [docs/governance/project-constitution.md](../../docs/governance/project-constitution.md) as the product-level constitution of AdsMagic.
- If an AIOX workflow preference conflicts with product safety, tenant isolation, contract integrity, OAuth hardening, or delivery quality, follow the AdsMagic constitution.
