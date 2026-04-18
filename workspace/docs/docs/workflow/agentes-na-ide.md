---
title: Agentes na IDE
---

# Agentes na IDE

Esta página explica o que um dev precisa fazer no **primeiro acesso ao repositório** para conseguir usar os agentes do workspace na IDE dele.

## O que já vem no repo

Os agentes já estão versionados neste projeto em três camadas:

- `.aiox-core/development/agents/` — fonte canônica dos agentes
- `.codex/agents/` — artefatos sincronizados para Codex
- `.github/agents/` — artefatos sincronizados para GitHub Copilot

Isso resolve a **distribuição** dos agentes no repositório.

Isso **não** garante que a IDE do dev já está pronta para ativá-los no primeiro acesso.

## Diferença entre distribuir e ativar

Ter os arquivos no repo significa que:

- o time compartilha a mesma definição de agentes
- o projeto pode sincronizar essas definições para múltiplas IDEs
- os atalhos documentados em `AGENTS.md` continuam versionados

Mas a ativação real depende de o ambiente do dev estar preparado para:

- sincronizar os arquivos corretos para a IDE dele
- validar se não existe drift entre a fonte canônica e os artefatos da IDE
- reconhecer os atalhos de agente no runtime local

## Checklist de primeiro acesso

Na raiz do projeto:

```bash
npm install
npm install --prefix Plataforma
npm run docs:install
node .aiox-core/infrastructure/scripts/ide-sync/index.js sync
node .aiox-core/infrastructure/scripts/ide-sync/index.js validate
```

Depois disso:

1. abra a IDE escolhida
2. teste a ativação de um agente simples, como `@dev`
3. confirme que a IDE reconhece os artefatos do projeto antes de usar fluxos baseados em agentes

## Sync por IDE

Se o dev quiser sincronizar apenas uma IDE específica:

```bash
node .aiox-core/infrastructure/scripts/ide-sync/index.js sync --ide codex
node .aiox-core/infrastructure/scripts/ide-sync/index.js validate --ide codex
```

Outros exemplos de target suportado pelo sync do projeto:

- `codex`
- `github-copilot`
- `cursor`
- `gemini`
- `claude`

## Como isso afeta o Kanban

Se o time for usar os cards do Kanban como origem de prompts, handoffs ou despacho para agentes, o ambiente do dev precisa estar pronto **antes**.

Sem esse setup inicial:

- o card pode listar `@dev`, `@architect` ou `@ux`, mas isso será apenas metadado
- copiar e colar um prompt com menções não garante ativação real dos agentes
- o fluxo pode degradar para texto puro sem governança de agente

## Regra prática para uso do Kanban

Antes de usar cards como entrada para execução guiada por agentes:

1. rode o sync da IDE
2. valide que não há drift
3. teste a ativação de pelo menos um agente
4. só então use os cards como origem de prompt ou handoff

## Quando o dispatch deve ficar bloqueado

O fluxo do Kanban deve considerar o ambiente como **não pronto** quando:

- a IDE do usuário ainda não foi sincronizada
- a validação falhou
- o runtime local não reconhece os agentes do projeto
- a IDE está operando apenas como chat genérico sem suporte aos agentes versionados

Nesses casos, o comportamento correto é:

- exibir orientação clara
- apontar para esta documentação
- impedir automação implícita

## Referências do projeto

- `AGENTS.md`
- `.aiox-core/infrastructure/scripts/ide-sync/README.md`
- `docs/docs/modulos/kanban-experimentos.md`