---
name: figma-prototype-export
description: Exporta telas locais do AdsMagic para o Figma via MCP oficial, com fallback guardado para capturas sensiveis e insercao em arquivo existente. Use quando precisar mandar uma rota local para um arquivo novo ou existente no Figma.
compatibility: Requires local app running, Figma MCP configured in the workspace, Node.js, and optional Python for request normalization helpers.
user-invocable: true
metadata:
  when_to_use: Quando precisar publicar uma tela local no Figma, em arquivo novo ou existente.
  argument-hint: <rota-local-ou-url> [figma-url]
---

# Figma Prototype Export

Skill operacional para exportar prototipos locais do AdsMagic para o Figma usando o MCP oficial como caminho padrao e um script guardado como fallback robusto.

Veja o playbook completo em [PLAYBOOK.md](PLAYBOOK.md).

## Objetivo

- Padronizar o fluxo Code -> Figma para telas locais
- Reduzir erro manual em fileKey, nodeId, captureId e polling
- Escolher entre captura oficial simples e captura guardada

## Quando usar

Use esta skill quando o pedido envolver qualquer um destes cenarios:

- o usuario disser Capitura do figma ou Captura do figma
- exportar uma rota local para um arquivo novo no Figma
- atualizar um arquivo existente no Figma com uma tela local
- capturar um frame especifico usando URL com node-id
- preservar fontes, icones, drawers, modais ou estados transientes
- quando o usuario disser enviar para o Figma, mandar para o Figma ou abrir selecao do Figma

## Pre-condicoes

1. A aplicacao precisa estar rodando localmente.
2. O servidor MCP figma precisa estar configurado no workspace.
3. O destino precisa estar definido antes da captura:
   - newFile
   - existingFile com fileKey e, se necessario, nodeId

## Decisao de fluxo

Use o MCP oficial por padrao quando:

- a tela ja estiver estavel no navegador
- nao houver dependencia critica de drawers abertos, icones convertidos ou verificacao fina
- o objetivo for rapidez para arquivo novo ou existente

Use a captura guardada quando:

- a tela usa icones que podem virar texto
- ha drawers, modais ou estados transientes que precisam abrir antes da captura
- fontes ou alinhamentos ja falharam antes
- voce precisa validar o frame inserido apos a captura

## Fluxo padrao com MCP oficial

1. Descobrir a rota local final.
2. Se houver URL do Figma, extrair fileKey e nodeId.
3. Preparar o request de exportacao usando [templates/export-request.json](templates/export-request.json) como base.
4. Abrir a rota local com hash figmacapture usando o script `scripts/../../../../scripts/figma_capture_localhost.cjs`.
5. Deixar a propria pagina local concluir a submissao da captura.
6. Fazer polling com o mesmo captureId usando o MCP oficial, quando disponivel.

## Fluxo robusto com captura guardada

Use quando houver maior sensibilidade visual.

Entradas mais importantes:

- routeUrl
- fileKey
- nodeId
- verifyNodeId
- frameName

Use o script `scripts/../../../../scripts/figma_capture_guarded.cjs`.

## Arquivos e comandos

- Template base: [templates/export-request.json](templates/export-request.json)
- Playbook operacional: [PLAYBOOK.md](PLAYBOOK.md)
- Script oficial/local: `scripts/../../../../scripts/figma_capture_localhost.cjs`
- Script guardado: `scripts/../../../../scripts/figma_capture_guarded.cjs`
- Helper de normalizacao: `scripts/../../../../scripts/figma_mcp_call.py`

## Barra de captura no VS Code

Quando a intencao for `Capitura do figma`, priorize a barra nativa de captura do MCP do Figma quando ela estiver disponivel no VS Code.

Nao dependa de extensao local para essa barra.


## Contrato de saida

Ao concluir a exportacao, sempre retorne:

- URL local usada
- modo escolhido: official-mcp ou guarded-script
- destino: arquivo novo ou arquivo existente
- fileKey e nodeId usados
- captureId final, quando existir
- qualquer risco residual para nova rodada de captura
