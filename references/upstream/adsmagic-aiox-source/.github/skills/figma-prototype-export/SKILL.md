---
name: figma-prototype-export
description: Exporta telas locais do AdsMagic para o Figma via MCP oficial, com fallback guardado para capturas sensiveis e insercao em arquivo existente.
---

# Figma Prototype Export

Use esta skill quando precisar mandar uma rota local do AdsMagic para um arquivo novo ou existente no Figma.

Frases de ativacao comuns neste repo:

- Capitura do figma
- Captura do figma
- Enviar para o figma
- Mandar para o figma

## Regras deste repo

- A skill canonica vive em [.agents/skills/figma-prototype-export/SKILL.md](../../../.agents/skills/figma-prototype-export/SKILL.md).
- O helper de captura do browser ja existe em [front-end/public/figma-capture-helper.js](../../../front-end/public/figma-capture-helper.js).
- Os scripts operacionais ficam em [scripts/figma_capture_localhost.cjs](../../../scripts/figma_capture_localhost.cjs), [scripts/figma_capture_guarded.cjs](../../../scripts/figma_capture_guarded.cjs) e [scripts/figma_mcp_call.py](../../../scripts/figma_mcp_call.py).
- A configuracao MCP deste repo fica em [.vscode/mcp.json](../../../.vscode/mcp.json), nao em mcp.json na raiz.
- Os scripts npm desta capacidade ficam em [front-end/package.json](../../../front-end/package.json).
- A barra de captura, quando disponivel no VS Code, vem do MCP nativo do Figma.

## Procedimento rapido

1. Confirme que o frontend esta rodando localmente.
2. Escolha rota local e destino do Figma.
3. Use o modo oficial quando a tela estiver estavel.
4. Use o modo guardado quando houver modais, drawers, icones ou sensibilidade visual maior.
5. Registre o resumo final da exportacao.

## Referencias

- Fonte canonica: [.agents/skills/figma-prototype-export/SKILL.md](../../../.agents/skills/figma-prototype-export/SKILL.md)
- Playbook: [.agents/skills/figma-prototype-export/PLAYBOOK.md](../../../.agents/skills/figma-prototype-export/PLAYBOOK.md)
- Template: [.agents/skills/figma-prototype-export/templates/export-request.json](../../../.agents/skills/figma-prototype-export/templates/export-request.json)
