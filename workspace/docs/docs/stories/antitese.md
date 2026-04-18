# ANTÍTESE — Ciclo de Prototipação Adsmagic

> **Origem:** Debate entre QA Crítico, PO de Produto e Dev Defensor  
> **Sintetizado por:** Orion — AIOX Master Orchestrator  
> **Status:** ⚠️ Contém achados originais não presentes no debate

---

## 0. Achado Crítico — Os Três Agentes Erraram Juntos

O debate inteiro partiu de uma premissa falsa compartilhada pelos 3 agentes:

> *"ContactsView, CampaignsView e IntegrationsView não existem."*

**Elas existem. Todas as três. Completamente implementadas.**

| Arquivo | Status real |
|---------|-------------|
| `views/contacts/ContactsView.vue` | ✅ Implementado |
| `views/campaigns/CampaignsView.vue` | ✅ Implementado |
| `views/integrations/IntegrationsView.vue` | ✅ Implementado |

O que não existe são as **rotas ativas**. O `router/index.ts` redireciona as três para `home`. São **3 linhas** para 3 telas funcionais aparecerem.

> As stories PROTO-001, PROTO-002 e PROTO-003 foram escritas descrevendo trabalho já realizado.

---

## 1. Premissas Contestadas

| # | Premissa Original | Realidade | Impacto |
|---|---|---|---|
| P1 | "ContactsView precisa ser criada" | Já existe e está completa | Stories PROTO-001/003 são redundantes |
| P2 | "O módulo CRM core está morto" (PO) | Está vivo, apenas desroteado | Falso alarme crítico |
| P3 | "TrackingView é entrega de valor zero" (PO) | É valor zero **por causa do bug de porta**, não por design | Verdade, mas causa técnica — não arquitetural |
| P4 | "Stories têm valor como backlog" (Dev) | Têm valor se descrevem trabalho futuro; descrevem trabalho passado | Backlog inútil é ruído |
| P5 | "Wiki documenta o processo, não o produto" (PO) | Wiki cumpre o contrato declarado do protótipo | Crítica inválida |

---

## 2. Bugs Críticos Imediatos

### 🔴 SEV-1 — Bloqueadores de Demo

**BUG-01 · Porta hardcoded errada em todos os nós clicáveis**
```
Arquivo: SitemapRouteNode.vue, linha 14
Código:  window.open(`http://localhost:5200${props.data.path}`, ...)
Porta:   5200 ← ERRADA (app roda em 5174)
Fix:     window.open(`${window.location.origin}${props.data.path}`, ...)
```

**BUG-02 · Três telas implementadas completamente inacessíveis**
```
Arquivo: router/index.ts, linhas 39/42/51
Impacto: /contacts, /campaigns, /integrations → redirect para home
Fix:     Substituir redirects por lazy imports das views que já existem
```

**BUG-03 · height: 580px conflita com flex-1**
```
Arquivo: TrackingView.vue, linha 116
Fix:     Remover style="height: 580px;" — flex-1 + min-h-0 já resolvem
```

### 🟡 SEV-2 — Degradação de Qualidade

| Bug | Arquivo | Fix |
|-----|---------|-----|
| BUG-04: `bg-zinc-900/72` fora do padrão Tailwind JIT | WikiView.vue | → `/70` |
| BUG-05: Accordion sem `<Transition>` — conteúdo teleporta | WikiView.vue | Adicionar `<Transition>` |
| BUG-06: Grid `xl:grid-cols-3` com 5 itens — 2 cards orfãos | WikiView.vue | → `md:grid-cols-2 xl:grid-cols-3` |
| BUG-07: `tracking.ts` documenta arquitetura que não existe | tracking.ts | Declarar explicitamente como "visão futura" |
| BUG-08: `docs/stories/` fora do diretório Docusaurus | docs/stories/ | → `docs/docs/stories/` + sidebars.ts |

---

## 3. Plano Antítese — 3 Commits

### Commit 1 — "Ligar as luzes" (estimativa: 30 min)
```
fix: corrigir porta e ativar rotas das três telas de produto
  SitemapRouteNode.vue → window.location.origin
  router/index.ts      → ativar contacts, campaigns, integrations
  SidebarNav.vue       → adicionar itens de navegação
  TrackingView.vue     → remover height: 580px
```
**Resultado:** 4 → 7 telas navegáveis. Nós do mapa funcionam.

### Commit 2 — "Polir o que existe" (estimativa: 1.5h)
```
fix: qualidade visual e consistência de dados
  WikiView.vue         → <Transition> + bg-zinc-900/70 + grid fix
  CampaignsView.vue    → extrair dados para data/campaigns.ts
  WikiItem interface   → adicionar campo id
```

### Commit 3 — "Documentação correta" (estimativa: 30 min)
```
docs: corrigir localização das stories e atualizar status
  docs/stories/        → mover para docs/docs/stories/
  sidebars.ts          → adicionar entrada
  story-contacts.md    → marcar como done (view já existe)
  story-integrations.md → revisar status real
```

---

## 4. Matriz: Plano Original vs. Antítese

| Dimensão | Plano Original | Antítese | Veredito |
|---|---|---|---|
| Telas de produto | Criar ContactsView, IntegrationsView | Ativar rotas (já existem) | 🟢 Antítese: 3 linhas vs 3 componentes |
| TrackingView | Entrega principal | 2 bugs críticos + 1 semântico | 🟡 Valor real, não demonstrável sem fix |
| Wiki dinâmica | Entrega de suporte | Funciona, 2 bugs menores | 🟢 Salvar com ajustes |
| Stories AIOX | Backlog de qualidade | 2 de 5 descrevem trabalho já feito | 🔴 Rever antes da próxima iteração |
| Prioridade Contacts vs Campaigns | Debate de prioridade | Questão obsoleta — ambas existem | ⚪ Ativar juntas |
| Sidebar | 4 itens | Expandir para 7 módulos ativos | 🟢 Antítese ganha |
| Stories no Docusaurus | Não questionado | Fora do diretório indexado | 🔴 Corrigir caminho |

---

## 5. O Que Salvar

| Componente | Status |
|---|---|
| `buildGraph()` em TrackingView | ✅ Puro, correto, manter |
| `useContactsStore` (Pinia) | ✅ Padrão de referência para os demais módulos |
| `ContactsView.vue` completa | ✅ Supera o que PROTO-001 descrevia |
| `Set<string>` para accordion | ✅ Melhor que `Record<string, boolean>` |
| Conteúdo da Wiki | ✅ Valor real para equipe e stakeholders |
| `mockContacts` com 10 entradas | ✅ Dados bem estruturados, superam as stories |

---

## 6. Metaobservação

> Qualquer debate sobre "o que falta implementar" deve começar com `find src/views -name "*.vue"`. O gap entre o que foi dito no debate e o que existe no código custaria horas de desenvolvimento desnecessário.

**O protótipo está ~85% pronto para demo. O bloqueador real não é código ausente — é roteamento desconectado e uma porta errada.**

---

*Antítese gerada via debate multi-agente: QA Crítico + PO de Produto + Dev Defensor → Orion (síntese)*
