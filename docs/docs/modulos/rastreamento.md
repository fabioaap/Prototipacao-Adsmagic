---
title: Rastreamento
---

# Rastreamento

**Rota:** `/pt/projects/:projectId/tracking`

O módulo de Rastreamento gerencia **links rastreáveis** do projeto. Cada link pode ser monitorado individualmente, com estatísticas de cliques, origens e conversões.

---

## Componentes visuais

### Barra de ações

![Barra de ações — Rastreamento](/img/screens/adsmagic/rastreamento-toolbar.png)

- Botão **"+ Novo Link"** para criar um link rastreável via `LinkFormModal`
- Botão de busca/filtro

---

### Lista de links rastreáveis

Tabela com todos os links cadastrados para o projeto.

![Lista de links rastreáveis](/img/screens/adsmagic/rastreamento-lista.png)

| Coluna | Descrição |
|--------|-----------|
| Nome | Identificador do link |
| URL de destino | URL final para onde o link redireciona |
| Total de cliques | Cliques registrados até o momento |
| Data de criação | Data em que o link foi criado |

- Clicar em um link abre `LinkStatsDrawer` com estatísticas detalhadas
- Ícone de edição abre `LinkFormModal` para editar o link
- Ícone de lixeira abre `DeleteLinkConfirmDialog`

---

## Funcionalidades

### Criar / Editar link

`LinkFormModal` permite:

- Definir nome, URL de destino e parâmetros UTM
- Editar um link existente

### Estatísticas por link

`LinkStatsDrawer` (gaveta lateral) ao selecionar um link:

- Histórico de cliques ao longo do tempo
- Distribuição por dispositivo, país e canal
- Correlação com conversões (quando rastreadas)

### Excluir link

`DeleteLinkConfirmDialog` solicita confirmação antes de remover um link permanentemente.

### Download de estatísticas

Cada link permite exportar suas estatísticas em CSV.

## Stores utilizadas

```
useTrackingStore
```

## Estado atual (As-Is)

- Links são criados manualmente; não há integração direta com editores de landing page.
- As estatísticas dependem de cliques via o pixel/tag instalado no site (configurado em Integrações > Site).
- Sem expiração automática de links na versão atual.
