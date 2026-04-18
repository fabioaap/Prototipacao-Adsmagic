---
id: PROTO-004
title: "Tela de Mensagens — Histórico de Conversas"
epic: "Módulos de Gestão Operacional"
status: backlog
priority: low
agent: dev
---

# PROTO-004 — Tela de Mensagens

## Contexto

O módulo de Mensagens centraliza o histórico de conversas com leads/contatos (principalmente WhatsApp). A rota `/messages` redireciona para a Home. Não há dados mockados de mensagens — precisam ser criados.

## Objetivo

Criar `Plataforma/src/views/messages/MessagesView.vue` com lista de conversas e painel lateral de mensagens.

---

## Critérios de Aceitação

- [ ] Rota `/messages` renderiza `MessagesView.vue` (remover redirect no router)
- [ ] Header com título "Mensagens" e campo de busca por contato
- [ ] Lista de conversas (sidebar esquerda) com:
  - Avatar (iniciais do nome)
  - Nome do contato
  - Última mensagem truncada
  - Timestamp da última mensagem
  - Badge de mensagens não lidas (quando > 0)
- [ ] Painel de mensagens (área direita) ao selecionar uma conversa:
  - Bolhas de mensagem (enviado / recebido)
  - Timestamp por mensagem
  - Nome do canal (WhatsApp, etc.)
- [ ] Estado vazio na área de mensagens quando nenhuma conversa selecionada

## Fora de Escopo

- Envio de mensagens (protótipo read-only)
- Filtros por canal ou status
- Integração real com WhatsApp API

---

## Arquivos a Criar

| Ação | Arquivo |
|------|---------|
| CRIAR | `Plataforma/src/views/messages/MessagesView.vue` |
| CRIAR | `Plataforma/src/data/messages.ts` — 5–8 conversas mockadas com 3–10 mensagens cada |
| CRIAR | `Plataforma/src/stores/messages.ts` — `useMessagesStore` |
| EDITAR | `Plataforma/src/router/index.ts` — remover redirect, apontar para `MessagesView.vue` |

---

## Estrutura Sugerida para `messages.ts`

```typescript
export interface Message {
  id: string
  direction: 'inbound' | 'outbound'
  content: string
  timestamp: string
}

export interface Conversation {
  id: string
  contactName: string
  channel: 'whatsapp' | 'email'
  unread: number
  messages: Message[]
}
```

---

## Notas Técnicas

- Layout split: `grid-cols-[280px_1fr]` no desktop, só lista em mobile
- `meta.title: 'Mensagens'` no router
- Timestamps: usar `date-fns` (`formatDistanceToNow`) para exibição relativa
