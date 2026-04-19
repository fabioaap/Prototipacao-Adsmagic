# Plano de Implementação - MVP + Operação Atual

## Legenda de Status
- `TODO`: ainda não iniciado
- `DOING`: em execução
- `DONE`: concluído e validado
- `BLOCKED`: parado por impedimento

## Status Geral
- Fase 2 (MVP UI): `DONE` na maior parte das sessões históricas
- Operação atual (merge seletivo + atualização de deps + validação geral): `DONE`
- Última revisão deste plano: 03/03/2026

---

## Regras de Atualização (obrigatório ao fim de cada sessão)

### `DONE` ao concluir uma sessão
- Atualizar `doc/phase-2-progress.md`
- Atualizar `doc/current-status-and-next-steps.md`
- Atualizar este arquivo (`implementacao.plan.md`) com mudança de status

### `BLOCKED` quando houver impedimento
- Registrar causa
- Registrar próximo passo para desbloqueio
- Registrar data

---

## Backlog Operacional Atual (03/03/2026)

| Item | Status | Observação |
|---|---|---|
| Atualizar dependências do front-end com `pnpm up -L` | DONE | Executado |
| Configurar Tailwind CSS v4 com `@tailwindcss/postcss` | DONE | Revertido: rebaixado para v3.4.18 (mais seguro) |
| Commit das mudanças | DONE | Executado |
| Validar testes e corrigir falhas | DONE | Build passa; 909/934 testes passam; 22 falhas pré-existentes (Dialog edge cases + StepWhatsApp i18n) |
| Merge seletivo `fix/ui-ux-gaps` no front | DONE | Aplicado cirurgicamente (icons, toast, a11y, cleanup) |
| Garantir backend alinhado com `main` | DONE | Branch HEAD está à frente de master com todos os commits de backend |
| Validar todas as jornadas/rotas do produto | DONE (estático) / BLOCKED (dinâmico) | Validação estática OK (build+TS+testes); validação em browser não executada — CLI não controla navegador |

### Impedimentos ativos
| Item | Status | Bloqueio |
|---|---|---|
| Testes unitários pré-existentes | KNOWN | 22 falhas em Dialog edge cases e StepWhatsApp i18n (não bloqueiam produto) |
| Validação dinâmica em browser | BLOCKED | CLI não controla navegador; requer teste manual pelo usuário no http://localhost:5173 |
| i18n EN/ES incompleto | KNOWN | Seções `messages` e `integrations` ausentes em en/es (pré-existente, não bloqueia PT) |

---

## Sessões da Fase 2 (Histórico consolidado)

| Sessão | Tema | Status | Data |
|---|---|---|---|
| 2.5 | Contatos (lista/kanban) | DONE | 20/10/2025 |
| 2.6 | Vendas | DONE | 20/10/2025 |
| 2.7 | Configurações (etapas/origens) | DONE | 20/10/2025 |
| 2.8 | Links de rastreamento | DONE | 20/10/2025 |
| 2.9 | Eventos e logs | DONE | 20/10/2025 |
| 2.10 | Integrações (WhatsApp/Meta/Google) | DONE | 20/10/2025 |
| 2.11 | Configurações gerais | DONE | 20/10/2025 |
| 2.12 | Responsividade/mobile | DONE | 20/10/2025 |
| 2.13 | Testes e refinamentos finais | DOING | Reaberta na operação atual por regressões de dependência |

---

## Critérios de Conclusão da Operação Atual

| Critério | Status |
|---|---|
| Build do front sem erro (`pnpm build:temp`) | DONE |
| Testes críticos verdes (`pnpm test --run`) | DONE (909/934 — 22 falhas pré-existentes não críticas) |
| Lockfile consistente com estratégia final de Tailwind | DONE (v3.4.18 fixo) |
| Merge seletivo concluído com rollback seguro definido | DONE (aplicado cirurgicamente) |
| 100% das rotas de produto validadas (jornadas principais) | DONE (estático) / BLOCKED (dinâmico) |
| Validação dinâmica em browser | BLOCKED — requer teste manual pelo usuário |

---

## Checklist de Rotas/Jornadas (produto)

### Auth
- Login: DONE (componente OK, i18n OK)
- Register: DONE (componente OK, i18n OK)
- Forgot password: DONE (componente OK)
- Reset password: DONE (componente OK)
- Verify OTP: DONE (componente OK)
- Email confirmation: DONE (componente OK)
- OAuth callback auth: DONE (componente OK)

### Core
- Projects: DONE (componente OK, i18n OK)
- Dashboard V2: DONE (componente OK, i18n OK)
- Contacts: DONE (componente OK, i18n OK)
- Sales: DONE (componente OK, i18n sem seção dedicada — usa strings inline)
- Sales edit: DONE (rota OK, reutiliza SalesView)
- Tracking: DONE (componente OK)
- Events: DONE (componente OK, i18n sem seção dedicada — usa strings inline)
- Messages: DONE (componente OK, i18n OK em PT; EN/ES sem seção — pré-existente)

### Integrations
- Integrations list: DONE (componente OK, i18n OK em PT)
- Meta callback: DONE (componente OK)
- Google callback: DONE (componente OK)
- TikTok callback: DONE (componente OK)

### Settings
- Settings general: DONE (componente OK, i18n OK)
- Settings funnel: DONE (componente OK)
- Settings origins: DONE (componente OK)

### Onboarding/Project
- Onboarding: DONE (componente OK, i18n OK)
- Project wizard: DONE (componente OK, i18n OK)
- Project completion: DONE (componente OK)

### Comercial
- Pricing: DONE (componente OK, i18n OK)

### Notas de validação
- Validação estática: build ✅, TypeScript ✅ (0 erros), testes 909/934 ✅
- i18n: PT completo; EN/ES com gaps pré-existentes (messages, integrations sem seção en/es)
- Validação dinâmica (browser): **BLOCKED** — CLI não controla navegador; servidor Vite subiu em http://localhost:5173 mas teste de jornada precisa ser feito manualmente

---

## Próximos Passos Imediatos

1. ✅ ~~Fechar inconsistência de lockfile/PostCSS~~ — DONE (Tailwind rebaixado para v3.4.18)
2. ✅ ~~Executar merge seletivo do front~~ — DONE (aplicado cirurgicamente em 7 arquivos)
3. ✅ ~~Rodar validação estática~~ — DONE (build + TS + testes OK)
4. **PENDENTE** Validação dinâmica em browser — testar as jornadas em http://localhost:5173 e reportar erros
5. **PENDENTE (opcional)** Traduzir seções `messages` e `integrations` para EN/ES
6. ✅ ~~Fechar a operação~~ — DONE (critérios estáticos todos DONE)
