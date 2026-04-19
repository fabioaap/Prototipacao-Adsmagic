# Playbook - Exportacao de Prototipos para o Figma

## Inputs minimos

- routeUrl: URL final da tela local
- frameName: nome do frame esperado no Figma
- mode: newFile ou existingFile
- figmaUrl: obrigatoria quando o destino for um arquivo existente

## Preparacao

1. Confirmar que a aplicacao esta rodando localmente.
2. Validar se a tela desejada ja esta acessivel no browser.
3. Confirmar se a exportacao vai para arquivo novo ou para arquivo existente.

## Como extrair dados de uma URL do Figma

Exemplo:

https://www.figma.com/design/AbCdEf1234567890/Tela?node-id=10727-3995

- fileKey: AbCdEf1234567890
- nodeId: 10727:3995

## Fluxo recomendado

### 1. Modo oficial

1. Preparar o request de exportacao.
2. Chamar o MCP oficial do Figma no ambiente conectado.
3. Abrir a rota local com hash figmacapture usando o mesmo contexto de captura.
4. Fazer polling ate status completed.

### 2. Modo guardado

1. Preparar a rota local final.
2. Extrair fileKey e nodeId.
3. Rodar o script guardado.
4. Ler o resultado e confirmar que o frame validado bate com o esperado.

## Quando promover para o modo guardado

- icones renderizados como texto
- fontes incorretas ou desalinhadas
- drawer, modal ou tooltip nao ficaram no estado certo
- insercao em arquivo existente aconteceu no lugar errado

## Checklist final

- a rota local esta correta
- o destino no Figma esta correto
- o nome do frame foi definido
- a URL com figmacapture foi aberta
- o mesmo captureId foi acompanhado ate completed, quando houver MCP oficial em uso
- o resumo final da exportacao foi registrado
