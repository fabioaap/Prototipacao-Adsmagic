---
title: Contatos
---

# Contatos

**Rota:** `/pt/projects/:projectId/contacts`

O módulo de Contatos é o CRM central do Adsmagic. Reúne todos os leads e clientes do projeto, com visões em lista ou kanban, filtros avançados, importação / exportação e gerenciamento de estágios do funil.

---

## Componentes visuais

### Barra de ações

![Barra de ações — Contatos](/img/screens/adsmagic/contatos-toolbar.png)

- Campo de busca por nome/telefone
- Toggle entre **modo lista** (linhas) e **modo kanban** (colunas por etapa)
- Botão **"Editar etapas do funil"** — abre `StagesManagementDrawer`
- Botão **"Filtros"** — painel lateral de filtros avançados
- Botão **"Exportar"** — gera CSV com os contatos filtrados
- Botão **"+ Adicionar Contato"**

---

### Modo Lista

Tabela paginada com todos os contatos do projeto.

![Lista de contatos anotada](/img/screens/adsmagic/contatos-lista-annotated.png)

| Coluna | Descrição |
|--------|-----------|
| Nome | Avatar com iniciais + nome completo |
| Email | E-mail do contato |
| Telefone | Número de telefone |
| Localização | Cidade/país |
| Etapa | Badge colorido com a etapa do funil |

- Paginação: 10 por página, com total exibido no rodapé
- Clicar em uma linha abre o detalhe do contato

---

### Modo Kanban

Colunas por etapa do funil com cards de contato arrastáveis.

![Kanban de contatos anotado](/img/screens/adsmagic/contatos-kanban-annotated.png)

- Cada coluna representa um estágio do funil (ex.: Contato Iniciado, Qualificação, Proposta…)
- Cards exibem: nome, telefone, etapa, origem e data
- Botão **"+ Adicionar contato"** em cada coluna
- Scroll horizontal para navegar por todos os estágios
- A preferência de modo (lista/kanban) é persistida em `localStorage`

---

## Funcionalidades

### Filtros disponíveis

| Filtro | Tipo |
|--------|------|
| Estágio do funil | Seleção múltipla |
| Origem do contato | Seleção múltipla |
| Tag | Seleção múltipla |
| Localização (cidade / país) | Texto livre |
| Intervalo de datas | Date picker |

### Importação e exportação

- **Importar CSV**: modal de importação com preview e mapeamento de colunas.
- **Exportar CSV**: exporta a lista filtrada atual para arquivo `.csv`.

### Gerenciamento de estágios

- Gaveta lateral `StagesManagementDrawer` permite criar, renomear, reordenar e excluir etapas do funil diretamente do módulo de Contatos.
- A exclusão de um estágio com contatos vinculados exige confirmação ou realocação.

### Criação de venda a partir de um contato

- A partir de qualquer contato na lista ou kanban, é possível abrir o `SaleFormModal` para registrar uma venda associada.

## Stores utilizadas

```
useContactsStore
useStagesStore
useOriginsStore
```

## Estado atual (As-Is)

- Visão kanban reflete em tempo real as movimentações de contatos entre estágios.
- Filtros combinados são suportados simultaneamente.
- Não há deduplicação automática de contatos importados.
