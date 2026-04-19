---
title: Mensagens
---

# Mensagens

**Rota:** `/pt/projects/:projectId/messages`

O módulo de Mensagens centraliza as comunicações enviadas e recebidas no contexto do projeto — especialmente mensagens vindas de canais conectados (como WhatsApp via integração Meta).

---

## Componentes visuais

### Tela de mensagens

![Mensagens — tela completa](/img/screens/adsmagic/mensagens-tela.png)

A tela é composta por:

| Componente | Função |
|-----------|--------|
| **MessagesMetrics** | Bloco de KPIs no topo: total de mensagens, volume por canal, variação vs. período anterior |
| **MessagesList** | Lista de mensagens com remetente, canal, data e prévia do conteúdo |
| **DateRangePicker** | Filtro de intervalo de datas |
| **MessageFormModal** | Modal para criar/compor uma nova mensagem |

---

## Funcionalidades

### Métricas de mensagens

Componente `MessagesMetrics` exibe no topo:

- Total de mensagens no período
- Volume por canal/plataforma
- Indicadores de variação (ex.: vs. período anterior)

### Lista de mensagens

Componente `MessagesList` com:

- Linha por mensagem (remetente, canal, data, prévia)
- Abertura de detalhe ao clicar

### Filtros

- **Intervalo de datas**: `DateRangePicker` para selecionar o período exibido.
- Refresh manual (botão de atualizar dados).

### Criação de mensagem

`MessageFormModal` permite criar ou compor uma nova mensagem diretamente no módulo.

## Stores utilizadas

```
useMessagesStore (inferido)
```

## Estado atual (As-Is)

- O módulo hoje exibe mensagens recebidas via canais integrados.
- A criação manual de mensagens está disponível, mas o volume principal vem das integrações de canal.
- Não há agendamento nativo de envios na versão atual.
