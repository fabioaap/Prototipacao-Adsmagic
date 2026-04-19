---
title: Vendas
---

# Vendas

**Rota:** `/pt/projects/:projectId/sales`

O módulo de Vendas centraliza o pipeline de conversões do projeto. Exibe métricas agregadas, lista de vendas com filtros avançados e permite acessar o detalhe de cada venda ou criá-las manualmente.

---

## Componentes visuais

### Cards de métricas

Barra de KPIs no topo mostrando os totais do período filtrado.

![Métricas de Vendas](/img/screens/adsmagic/vendas-metricas.png)

| Métrica | Descrição |
|---------|-----------|
| Receita Total | Soma das vendas no período (com variação vs. anterior) |
| Total de Vendas | Quantidade de negócios fechados (com variação %) |
| Ticket Médio | Receita ÷ vendas (com variação %) |
| Taxa de Conversão | Vendas confirmadas / total de contatos |

---

### Barra de filtros da tabela

Controles de busca, filtro e exportação acima da tabela de vendas.

![Filtros Vendas](/img/screens/adsmagic/vendas-toolbar.png)

- Campo de busca por contato ou ID
- Seletor de status: **Todas / Concluídas / Perdidas**
- Botão **"Filtros"** com opções avançadas (origem, valor, datas, localização, dispositivo)
- Botão **"Exportar"** CSV
- Contador de resultados + botão de refresh

---

### Tabela de vendas

Lista paginada com todas as vendas do projeto.

![Tabela de Vendas anotada](/img/screens/adsmagic/vendas-tabela-annotated.png)

| Coluna | Descrição |
|--------|-----------|
| ID | Identificador da venda |
| Contato | Nome e telefone vinculado |
| Valor | Valor da venda em BRL |
| Data | Data de registro |
| Origem | Canal de aquisição (Google Ads, Meta Ads, etc.) |
| Status | Badge verde **Realizada** ou vermelho **Perdida** |

- Clicar em uma venda abre `SaleDetailsDrawer`
- Ícone de edição na coluna direita abre `SaleFormModal`

---

## Funcionalidades

### Filtros disponíveis

| Filtro | Descrição |
|--------|-----------|
| Status | Todas / Concluídas / Perdidas |
| Origem | Filtra por canal de aquisição |
| Valor mínimo / máximo | Faixa de valor da venda |
| Data de início / fim | Intervalo de datas |
| Cidade | Localização do lead |
| País | País do lead |
| Dispositivo | Desktop, mobile, tablet |

### Detalhe da venda

`SaleDetailsDrawer` (gaveta lateral) exibe todos os dados de uma venda:

- Dados do contato associado
- Valor e data
- Origem/canal
- Histórico de alterações

### Criar / Editar venda

`SaleFormModal` permite criar uma nova venda ou editar uma existente diretamente neste módulo.

## Stores utilizadas

```
useSalesStore
useOriginsStore
useContactsStore
```

## Estado atual (As-Is)

- Filtros são combinados e aplicados simultaneamente.
- O status "Perdida" diferencia leads descartados de conversões concluídas.
- Sem integração direta com gateways de pagamento — as vendas são registradas manualmente ou via rastreamento de eventos.
