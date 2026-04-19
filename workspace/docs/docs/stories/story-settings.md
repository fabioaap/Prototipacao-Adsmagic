---
id: PROTO-005
title: "Tela de Configurações — Perfil e Preferências"
epic: "Módulos de Gestão Operacional"
status: backlog
priority: low
agent: dev
---

# PROTO-005 — Tela de Configurações

## Contexto

O módulo de Configurações concentra preferências de conta, notificações e segurança. A rota `/settings` redireciona para a Home. Não há dados mockados — precisam ser criados como um objeto de configuração estático.

## Objetivo

Criar `Plataforma/src/views/settings/SettingsView.vue` com seções de perfil, notificações e segurança usando um layout de tabs ou accordion lateral.

---

## Critérios de Aceitação

- [ ] Rota `/settings` renderiza `SettingsView.vue` (remover redirect no router)
- [ ] Header com título "Configurações"
- [ ] Navegação lateral (ou tabs) com 3 seções: Perfil, Notificações, Segurança
- [ ] Seção **Perfil**: campos de nome, email, empresa (read-only no protótipo, com botão "Editar" visual)
- [ ] Seção **Notificações**: toggles visuais para: email, push, relatório semanal
- [ ] Seção **Segurança**: info de sessão, botão "Sair" visual (sem funcionalidade real)
- [ ] Seção ativa destacada na navegação lateral

## Fora de Escopo

- Persistência de configurações (sem localStorage neste protótipo)
- Upload de avatar
- Troca de senha real
- Planos e faturamento

---

## Arquivos a Criar

| Ação | Arquivo |
|------|---------|
| CRIAR | `Plataforma/src/views/settings/SettingsView.vue` |
| CRIAR | `Plataforma/src/data/settings.ts` — objeto mock com perfil e preferências padrão |
| EDITAR | `Plataforma/src/router/index.ts` — remover redirect, apontar para `SettingsView.vue` |

---

## Estrutura Sugerida para `settings.ts`

```typescript
export interface UserProfile {
  name: string
  email: string
  company: string
  role: string
  avatarInitials: string
}

export interface NotificationPrefs {
  email: boolean
  push: boolean
  weeklyReport: boolean
}

export interface MockSettings {
  profile: UserProfile
  notifications: NotificationPrefs
}
```

---

## Notas Técnicas

- Usar `ref()` local para estado do tab ativo (sem store necessário)
- Toggles podem usar `v-model` com `ref<boolean>` local (sem persistência)
- `meta.title: 'Configurações'` no router
- Layout: sidebar de navegação interna com `min-w-[160px]` + área de conteúdo
