---
name: AIOX Workflow Mapping
description: Maps the AIOX workflow to the Copilot chat environment.
applyTo: "**/*"
---

# AIOX Workflow Mapping

- Use AIOX agents according to their role boundaries.
- Keep the primary story flow as: `@sm` draft, `@po` validate, `@dev` implement, `@qa` review, `@devops` handle push/PR operations.
- Treat `@aiox-master` as the escalation path for framework governance and cross-agent conflicts.
- When working inside Copilot, prefer guided handoffs between agents instead of relying on Claude-only runtime behavior.
- Apply repository conventions from [CLAUDE.md](../../CLAUDE.md), [AGENTS.md](../../AGENTS.md), and [.github/copilot-instructions.md](../copilot-instructions.md).
- Apply product constraints from [docs/governance/project-constitution.md](../../docs/governance/project-constitution.md) before optimizing for workflow speed or framework convenience.
