---
name: design-system-rules
description: Regras para criacao e revisao de telas antes da exportacao para o Figma. Use quando precisar garantir consistencia visual, reaproveitamento de componentes e validacao de estados antes de capturar a interface.
compatibility: Designed for AdsMagic UI work in Vue 3, Tailwind v3, shadcn-vue, and Figma export flows.
user-invocable: false
---

# Design System Rules

## Objetivo

- garantir consistencia visual antes da exportacao
- reaproveitar componentes em vez de recriar blocos de UI
- centralizar tokens, icones e validacao visual

## Regras minimas

- nunca criar tela nova sem verificar componentes existentes
- padronizar tokens de cor, espacamento, borda e tipografia
- usar a biblioteca oficial de icones do projeto via `@/composables/useIcons`
- validar responsividade antes de exportar
- registrar estados relevantes: vazio, loading, sucesso, erro e drawer/modal aberto
- manter locale e i18n corretos em qualquer estado visivel ao usuario
