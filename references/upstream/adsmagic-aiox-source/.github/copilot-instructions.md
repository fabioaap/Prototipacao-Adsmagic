# Synkra AIOX Agent for GitHub Copilot

You are working with Synkra AIOX, an AI-Orchestrated System for Full Stack Development.

## Core Framework Understanding

Synkra AIOX is a meta-framework that orchestrates AI agents to handle complex development workflows. Always recognize and work within this architecture.

## Agent System

### Agent Activation
- Select an agent from the chat agent picker in VS Code.
- Workspace agents are defined in `.github/agents/`.
- Available agents include `dev`, `qa`, `architect`, `pm`, `po`, `sm`, `analyst`, `data-engineer`, `devops`, and `aiox-master`.
- Agent commands use the `*` prefix.
- Visual routing in chat depends on agent frontmatter using `agents`, `handoffs`, and `agent/runSubagent` where appropriate.

### Agent Context
When an agent is active:
- Follow that agent's specific persona and expertise.
- Use the agent's designated workflow patterns.
- Maintain the agent's perspective throughout the interaction.

### Multi-Agent Orchestration
- For any non-trivial task, decompose the work and invoke specialized agents for domain-specific subtasks whenever possible.
- When subtasks are independent, run specialized agents in parallel to reduce turnaround time and then consolidate the outputs in the active agent.
- Use the most appropriate agent for each responsibility, such as `architect` for solution design, `dev` for implementation, `qa` for validation, `analyst` for discovery, and `devops` for delivery or environment work.
- Keep the active agent responsible for coordination, decision logging, conflict resolution, and final synthesis of results.
- Escalate to additional agents when a task spans multiple domains instead of handling everything in a single agent pass.

### Skills Usage
- For every task, identify and use the relevant repository skills in addition to agent orchestration whenever a skill can accelerate, standardize, or verify the work.
- Prefer combining specialized agents with the applicable skills for execution, validation, documentation, and workflow automation.
- If a user request maps to a known skill, invoke that skill-first workflow instead of improvising a custom process.
- Treat skills as mandatory execution primitives for repeatable tasks and use agents to coordinate, specialize, and review.

## Development Methodology

Project constitution:
- Follow [docs/governance/project-constitution.md](../docs/governance/project-constitution.md) as the product-level source of truth for security, multi-tenant boundaries, adapters, OAuth, i18n, and delivery gates.
- The AIOX framework supports the workflow, but it does not override AdsMagic product rules.

### Story-Driven Development
1. Work from stories in `docs/stories/`.
2. Update progress by marking completed checklist items.
3. Keep the File List current.
4. Implement only what the acceptance criteria specify.

### Testing Requirements
- Run lint before concluding work.
- Run typecheck before concluding work.
- Add tests for new functionality.
- Cover edge cases and error scenarios.

## GitHub Copilot-Specific Configuration

### Requirements
- VS Code with custom agents enabled.
- Workspace agents defined in `.github/agents/`.

### Usage
1. Open Chat.
2. Ensure Agent mode/custom agents are enabled.
3. Pick an AIOX agent from the agent selector.

### Notes
- Use `@workspace` for project-wide context.
- Use file references for story-driven workflows.
- Use the specialized agent before issuing `*` commands.
- Default to multi-agent execution for implementation work: split the task, dispatch independent work to specialized agents in parallel, and apply relevant skills alongside agent execution.
- Do not rely on a single agent when the task naturally separates into analysis, implementation, validation, or deployment streams.
- Always look for relevant skills before starting execution and combine them with agent delegation whenever possible.
- Treat `Capitura do figma` and `Captura do figma` as requests for the Figma capture workflow in this repo, prioritizing the `figma-prototype-export` skill and the native Figma MCP capture bar when available.
