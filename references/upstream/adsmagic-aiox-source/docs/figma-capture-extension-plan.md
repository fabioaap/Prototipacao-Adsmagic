# Figma Capture Workflow Note

## Status

A barra de captura usada no fluxo de tela para o Figma deve ser tratada como uma capacidade nativa do MCP do Figma no VS Code.

## Decisao Atual

O projeto possui um helper local de captura carregado em [front-end/index.html](front-end/index.html) via [front-end/public/figma-capture-helper.js](front-end/public/figma-capture-helper.js).

Esse helper expõe atalhos globais no browser:

1. `window.adsmagicFigmaCapture.start({ selector, delay })`
2. `window.adsmagicFigmaCapture.stop()`
3. `window.adsmagicFigmaCapture.copyCurrentPage()`
4. `window.adsmagicFigmaCapture.copyHeaderAndFilters()`
5. `window.adsmagicFigmaCapture.copyEventsTable()`

Isso resolve a captura na aplicação web. O acionamento visual no VS Code deve privilegiar a barra nativa do MCP do Figma, nao uma extensao local adicional.

## Implicacao pratica

Quando o pedido for `Capitura do figma` ou `Captura do figma`, o fluxo correto e:

1. usar a skill `figma-prototype-export`
2. usar a barra nativa de captura do MCP do Figma, quando disponivel
3. usar os scripts do repo apenas como apoio para preparar URL, rota e fallback guardado

## Extensao local

Uma extensao local experimental chegou a ser considerada, mas nao deve ser a base oficial deste fluxo.

Se houver artefatos dessa extensao no workspace, trate-os como experimentais ou descontinuados.

## UX Proposta

### Entry point principal

1. Status bar item: `Figma Capture`
2. Clique abre Quick Pick com ações

### Ações do MVP

1. `Capturar tela atual`
2. `Capturar header + filtros`
3. `Capturar tabela visível`
4. `Capturar seletor customizado`
5. `Remover modo de captura`

### Comportamento esperado

1. A extensão encontra a aba ativa do browser integrado do projeto.
2. Injeta ou executa o helper global já existente.
3. Dispara a ação correspondente.
4. O usuário cola no Figma com `Ctrl+V`.

## Arquitetura Recomendada

### Responsabilidade da extensão

1. Descobrir ou focar a aba certa.
2. Disparar comandos de captura.
3. Expor UX dentro do VS Code.

### Responsabilidade da aplicação web

1. Manter o helper de captura.
2. Conhecer os seletores úteis da interface.
3. Carregar o script de captura do Figma.

### Regra importante

A extensão não deve duplicar a lógica dos seletores nem a lógica de boot da captura. Ela deve chamar o helper já mantido no front-end.

## Opções Técnicas

### Opção A: Status bar + comando

Prós:

1. Mais rápida de implementar.
2. Mais estável.
3. Menor superfície de manutenção.

Contras:

1. Menos espaço para configurações avançadas.

### Opção B: Activity Bar/View própria

Prós:

1. Melhor para múltiplos presets.
2. Pode listar páginas e seletores.

Contras:

1. Mais código.
2. Não é necessária para o primeiro valor.

### Decisão recomendada

Começar por `Opção A`.

## Dependências e Limitações

1. A captura depende de uma aba local autenticada do AdsMagic.
2. A extensão não deve tentar autenticar usuário automaticamente.
3. O gatilho do VS Code não deve depender de internals do Copilot Chat.
4. O botão não será inserido na UI nativa do cabeçalho do Copilot Chat.
5. O navegador integrado ou a página alvo precisa aceitar execução do helper global.

## Fases de Implementação

### Fase 1: MVP funcional

1. Criar extensão local no workspace.
2. Adicionar status bar item.
3. Adicionar comandos de Quick Pick.
4. Disparar comandos básicos de captura.

### Fase 2: Melhorias operacionais

1. Detectar automaticamente a página ativa do localhost.
2. Exibir feedback de sucesso ou erro.
3. Salvar último tipo de captura usado.

### Fase 3: Recursos avançados

1. Presets por rota.
2. Seletor customizado salvo por tela.
3. Integração com múltiplos projetos/ports locais.

## Critérios de Pronto

O MVP estará pronto quando:

1. Houver um botão `Figma Capture` na status bar.
2. O clique abrir um Quick Pick com ações úteis.
3. Uma ação conseguir ativar a captura numa aba autenticada do AdsMagic.
4. O usuário conseguir colar no Figma sem montar URL manualmente.

## Próxima Retomada

Quando retomarmos essa frente, a ordem recomendada é:

1. Scaffold da extensão VS Code.
2. Botão de status bar.
3. Quick Pick com comandos.
4. Chamada ao helper global da página.

## Estado Atual

O fluxo suportado neste repo e:

1. helper local em [front-end/public/figma-capture-helper.js](front-end/public/figma-capture-helper.js)
2. scripts em [scripts/figma_capture_localhost.cjs](scripts/figma_capture_localhost.cjs), [scripts/figma_capture_guarded.cjs](scripts/figma_capture_guarded.cjs) e [scripts/figma_mcp_call.py](scripts/figma_mcp_call.py)
3. skill em [.agents/skills/figma-prototype-export/SKILL.md](.agents/skills/figma-prototype-export/SKILL.md)
4. MCP do workspace em [.vscode/mcp.json](.vscode/mcp.json)