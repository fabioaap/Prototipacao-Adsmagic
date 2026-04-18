# Figma Screen Skill Pack

Pacote portavel com as nossas skills e convencoes para criacao, preparacao e envio de telas para o Figma em outro projeto.

## O que este pacote cobre

Este material junta dois blocos:

1. `figma-prototype-export`
   Skill operacional para levar uma tela local para o Figma usando o MCP oficial como fluxo padrao e uma captura guardada como fallback.
2. `design-system-rules`
   Regras para garantir consistencia visual antes da exportacao: reaproveitamento de componente, tokens, icones e validacao visual.

Se voce quiser importar o minimo necessario para outro projeto, o bloco realmente obrigatorio e o `figma-prototype-export`.

## Adaptacao aplicada no AdsMagic

Neste repositório, a implementacao pratica ficou assim:

- skill canonica em `.agents/skills/figma-prototype-export/`
- wrapper Copilot em `.github/skills/figma-prototype-export/`
- skill complementar em `.agents/skills/design-system-rules/` e `.github/skills/design-system-rules/`
- scripts operacionais em `scripts/`
- configuracao MCP em `.vscode/mcp.json`
- scripts npm em `front-end/package.json`

Essa adaptacao evita criar `package.json` ou `mcp.json` na raiz apenas para encaixar o pacote portavel.

## Estrutura recomendada no projeto de destino

```text
.agents/
  skills/
    figma-prototype-export/
      SKILL.md
      PLAYBOOK.md
      templates/
        export-request.json
scripts/
  figma_capture_localhost.cjs
  figma_capture_guarded.cjs
  figma_mcp_call.py
mcp.json
package.json
```

## Arquivos para copiar deste repo

- `.agents/skills/figma-prototype-export/SKILL.md`
- `.agents/skills/figma-prototype-export/PLAYBOOK.md`
- `.agents/skills/figma-prototype-export/templates/export-request.json`
- `scripts/figma_capture_localhost.cjs`
- `scripts/figma_capture_guarded.cjs`
- `scripts/figma_mcp_call.py`
- `.vscode/mcp.json` no AdsMagic, ou `mcp.json` na raiz no projeto de destino
- `front-end/package.json` no AdsMagic, ou `package.json` na raiz no projeto de destino

## Skill principal pronta para portar

Use este conteudo como base para o arquivo `.agents/skills/figma-prototype-export/SKILL.md` no outro projeto.

```md
---
name: figma-prototype-export
description: "Pipeline operacional para exportar prototipos locais para o Figma via MCP oficial, com fallback guardado para capturas sensiveis."
compatibility: ">=1.0.0"
user-invocable: true
metadata:
  when_to_use: "Quando precisar publicar uma tela local no Figma, em arquivo novo ou existente."
  argument-hint: "<rota-local-ou-url> [figma-url]"
---

# Figma Prototype Export

Skill operacional para exportar prototipos locais para o Figma usando o MCP oficial como caminho padrao e um script guardado como fallback robusto.

## Objetivo

- Padronizar o fluxo Code -> Figma para telas locais
- Reduzir erro manual em `fileKey`, `nodeId`, `captureId` e polling
- Escolher automaticamente entre captura oficial simples e captura guardada

## Quando usar

Use esta skill quando o pedido envolver qualquer um destes cenarios:

- exportar uma rota local para um arquivo novo no Figma
- atualizar um arquivo existente no Figma com uma tela local
- capturar um frame especifico usando URL com `node-id`
- garantir que fontes, icones e drawers sejam preservados na exportacao
- quando o usuario disser `enviar para o figma`, `mandar para o figma` ou `abrir selecao do figma`

## Pre-condicoes

1. A aplicacao precisa estar rodando localmente
2. O servidor MCP `figma` precisa estar conectado no workspace
3. O destino precisa estar definido antes da captura:
   - `newFile`
   - `existingFile` com `fileKey` e, se necessario, `nodeId`

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

1. Descobrir a rota local final
2. Se houver URL do Figma, extrair `fileKey` e `nodeId`
3. Chamar `generate_figma_design` com o destino escolhido para gerar um `captureId`
4. Abrir a pagina local com o hash `figmacapture`
5. Deixar a pagina local submeter a captura usando esse mesmo `captureId`
6. Fazer polling com o mesmo `captureId` ate `status = completed`

## Fluxo robusto com captura guardada

Use quando houver maior sensibilidade visual.

Entradas mais importantes:

- `--url`: rota local final
- `--file-key`: arquivo de destino no Figma
- `--node-id`: ponto de insercao no arquivo existente
- `--verify-node-id`: ancora para validar o resultado no Figma
- `--frame-name`: nome esperado do frame exportado

## Contrato de saida

Ao concluir a exportacao, sempre retorne um resumo curto contendo:

- URL local usada
- modo escolhido: `official-mcp` ou `guarded-script`
- destino: arquivo novo ou arquivo existente
- `fileKey` e `nodeId` usados
- `captureId` final
- qualquer risco residual para nova rodada de captura
```

## Playbook pronto para portar

Use este conteudo como base para `.agents/skills/figma-prototype-export/PLAYBOOK.md`.

```md
# Playbook - Exportacao de Prototipos para o Figma

## Inputs minimos

- `routeUrl`: URL final da tela local
- `frameName`: nome do frame esperado no Figma
- `mode`: `newFile` ou `existingFile`
- `figmaUrl`: obrigatoria quando o destino for um arquivo existente

## Preparacao

1. Confirmar que a aplicacao esta rodando localmente
2. Validar se a tela desejada ja esta acessivel no browser
3. Confirmar se a exportacao vai para arquivo novo ou para arquivo existente

## Como extrair dados de uma URL do Figma

Exemplo:

```text
https://www.figma.com/design/AbCdEf1234567890/Tela?node-id=10727-3995
```

- `fileKey`: `AbCdEf1234567890`
- `nodeId`: `10727:3995`

## Fluxo recomendado

### 1. Modo oficial

1. Chamar `generate_figma_design` com o destino final para gerar um `captureId`
2. Abrir a rota local com o hash `figmacapture` montado para esse `captureId`
3. Deixar a propria pagina local concluir a submissao da captura
4. Fazer polling com o mesmo `captureId`
5. Encerrar somente com `status = completed`

### 2. Modo guardado

1. Preparar a rota local final
2. Extrair `fileKey` e `nodeId`
3. Rodar o script guardado
4. Ler o resultado e confirmar que o frame validado bate com o esperado

## Quando promover para o modo guardado

- icones renderizados como texto
- fontes incorretas ou desalinhadas
- drawer, modal ou tooltip nao ficaram no estado certo
- insercao em arquivo existente aconteceu no lugar errado

## Checklist final

- a rota local esta correta
- o destino no Figma esta correto
- o nome do frame foi definido
- a URL com `figmacapture` foi aberta
- o mesmo `captureId` foi acompanhado ate `completed`
- o resumo final da exportacao foi registrado
```

## Template de requisicao pronto para portar

Use este arquivo como `.agents/skills/figma-prototype-export/templates/export-request.json`.

```json
{
  "routeUrl": "http://localhost:5174/teacher",
  "frameName": "Professor - Dashboard",
  "target": {
    "mode": "existingFile",
    "figmaUrl": "https://www.figma.com/design/FILE_KEY/Projeto?node-id=123-456",
    "fileKey": "FILE_KEY",
    "nodeId": "123:456"
  },
  "options": {
    "preferOfficialMcp": true,
    "useGuardedCapture": false,
    "verifyNodeId": "123:456",
    "captureDelayMs": 1800,
    "topBlockOffsetPx": 0
  }
}
```

## Scripts npm para o projeto de destino

Adicione estes scripts no `package.json`:

```json
{
  "scripts": {
    "figma:capture:localhost": "node scripts/figma_capture_localhost.cjs",
    "figma:select": "node scripts/figma_capture_localhost.cjs --open auto",
    "figma:capture:guarded": "node scripts/figma_capture_guarded.cjs"
  }
}
```

## Configuracao MCP minima

Adicione ou mantenha este bloco em `mcp.json`:

```json
{
  "inputs": [],
  "servers": {
    "figma": {
      "url": "https://mcp.figma.com/mcp",
      "type": "http"
    }
  }
}
```

## Skill complementar de criacao de telas

Se o outro projeto tambem precisar carregar as mesmas regras de preparacao visual antes da exportacao, crie uma skill secundaria com este foco:

```md
---
name: design-system-rules
description: "Regras para criacao e revisao de telas antes da exportacao para o Figma."
compatibility: ">=1.0.0"
user-invocable: false
---

# Design System Rules

## Objetivo

- garantir consistencia visual antes da exportacao
- reaproveitar componentes em vez de recriar blocos de UI
- centralizar tokens, icones e validacao visual

## Regras minimas

- nunca criar tela nova sem verificar componentes existentes
- padronizar tokens de cor e espacos
- definir uma biblioteca oficial de icones
- validar responsividade antes de exportar
- registrar estados relevantes: vazio, loading, sucesso, erro e drawer/modal aberto
```

## Checklist de importacao para outro projeto

1. Copiar a pasta `.agents/skills/figma-prototype-export/`
2. Copiar os scripts `figma_capture_localhost.cjs`, `figma_capture_guarded.cjs` e `figma_mcp_call.py`
3. Adicionar os scripts `figma:*` no `package.json`
4. Garantir que `mcp.json` tenha o servidor `figma`
5. Ajustar a porta local e a URL base do projeto de destino
6. Testar primeiro no modo `newFile`
7. So depois usar `existingFile` com `fileKey` e `nodeId`

## Adaptacoes que normalmente precisam mudar

- URL local padrao, por exemplo `http://localhost:3000` ou `http://localhost:5173`
- nome da aplicacao nas descricoes da skill
- biblioteca de icones usada pelo projeto
- criterios do modo guardado, se houver drawers, modais ou fontes especiais

## Observacao pratica

Se o objetivo for apenas reutilizar a capacidade de enviar telas para o Figma, leve primeiro o bloco `figma-prototype-export`. A skill de design system e complementar e deve ser adaptada ao sistema visual do projeto de destino.