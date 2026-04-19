# Figma Capture Extension Plan

## Objetivo

Criar uma extensão leve do VS Code para disparar a captura para o Figma a partir do ambiente local do AdsMagic, sem depender de editar manualmente a URL da página nem reexplicar o fluxo em cada sessão.

## Estado Atual

Hoje o projeto já possui um helper local de captura carregado em [front-end/index.html](front-end/index.html) via [front-end/public/figma-capture-helper.js](front-end/public/figma-capture-helper.js).

Esse helper expõe atalhos globais no browser:

1. `window.adsmagicFigmaCapture.start({ selector, delay })`
2. `window.adsmagicFigmaCapture.stop()`
3. `window.adsmagicFigmaCapture.copyCurrentPage()`
4. `window.adsmagicFigmaCapture.copyHeaderAndFilters()`
5. `window.adsmagicFigmaCapture.copyEventsTable()`

Isso já resolve a captura na aplicação web. A extensão deve ser apenas uma camada de acionamento no VS Code.

## Problema a Resolver

O usuário quer um gatilho persistente no VS Code para ativar a captura sem precisar:

1. montar hashes manualmente
2. abrir comandos MCP manualmente
3. depender do contexto da conversa atual

## Escopo do MVP

O MVP da extensão deve fazer só o necessário:

1. Adicionar um botão na status bar do VS Code com rótulo `Figma Capture`.
2. Registrar comandos simples para tipos comuns de captura.
3. Reaproveitar a aba já autenticada do navegador integrado sempre que possível.
4. Acionar o helper global `window.adsmagicFigmaCapture` na página atual.

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