---
title: Organização do repositório
---

# Organização do repositório

Esta página define a separação estrutural recomendada para preservar o framework AIOX, isolar o workspace AdsMagic e reduzir o risco de sobrescrita entre artefatos de framework, produto, protótipos e referências externas.

## Objetivo

O repositório precisa deixar explícitas cinco zonas com donos e regras diferentes:

1. **Core do framework AIOX**
2. **Workspace AdsMagic**
3. **Apps e protótipos executáveis**
4. **Design system compartilhado**
5. **Referências e outputs gerados**

O princípio central é este: **não criar dois frameworks AIOX paralelos**. O que existe é:

- um core do AIOX que precisa permanecer protegido
- uma aplicação do AIOX ao contexto do AdsMagic
- artefatos de prototipação e referência que não podem contaminar o core

## Estrutura alvo

```text
Prototipacao-Adsmagic/
├── .aiox-core/                 # Core do framework AIOX
├── .claude/                    # Regras e infraestrutura de agentes
├── .github/                    # Automação e integração da plataforma
├── AGENTS.md                   # Convenções de agentes na raiz
├── package.json                # Orquestração do workspace
├── vite.config.js              # Shell raiz que aponta para os apps
│
├── workspace/                  # Contexto AdsMagic que usa o framework
│   ├── docs/                   # Portal Docusaurus e documentação do projeto
│   ├── marketing/              # Manifestos, insumos e ativos editoriais
│   ├── squads/                 # Estruturas operacionais dos squads
│   ├── templates/              # Templates de operação e handoff
│   └── wiki/                   # Conteúdo auxiliar e material de apoio
│
├── apps/                       # Superfícies executáveis do projeto
│   ├── plataforma/             # App Vue principal do workspace AdsMagic
│   └── landing-pages/          # App dedicado às LPs exportáveis
│
├── design-system/              # Tokens, brand assets e componentes compartilhados
│   ├── brand/
│   ├── tokens/
│   ├── components/
│   └── docs/
│
├── references/                 # Materiais externos ou somente leitura
│   ├── upstream/               # Clones e snapshots do repo fonte e correlatos
│   ├── critique/               # Críticas, inspeções e comparativos externos
│   └── captures/               # Screenshots e insumos visuais de referência
│
└── outputs/                    # Artefatos gerados e pacotes de entrega
    ├── deliverables/
    └── exports/
```

## Mapeamento current → future

| Estrutura atual | Destino recomendado | Zona |
|---|---|---|
| `.aiox-core/` | manter na raiz | Core do framework |
| `.claude/` | manter na raiz | Core do framework |
| `.github/` | manter na raiz | Core do framework |
| `AGENTS.md` | manter na raiz | Core do framework |
| `package.json` | manter na raiz | Orquestração |
| `vite.config.js` | manter na raiz | Orquestração |
| `docs/` | `workspace/docs/` | Workspace AdsMagic |
| `marketing/` | `workspace/marketing/` | Workspace AdsMagic |
| `squads/` | `workspace/squads/` | Workspace AdsMagic |
| `templates/` | `workspace/templates/` | Workspace AdsMagic |
| `wiki/` | `workspace/wiki/` | Workspace AdsMagic |
| `Plataforma/` | `apps/plataforma/` | Apps |
| `landing-pages/` | `apps/landing-pages/` | Apps |
| `_reference/` | `references/upstream/` | Referências |
| `_critique/` | `references/critique/` | Referências |
| `deliverables/` | `outputs/deliverables/` | Outputs |
| brand assets dispersos | `design-system/brand/` | Design system |
| tokens/componentes compartilháveis | `design-system/tokens/` e `design-system/components/` | Design system |

## O que não mover agora

Os caminhos abaixo já fazem parte do runtime e da governança do framework. Mover isso cedo demais aumenta o risco de quebra sem ganho imediato:

- `.aiox-core/`
- `.claude/`
- `.github/`
- `AGENTS.md`
- `package.json`
- `vite.config.js`

Motivos concretos no estado atual:

- `.aiox-core/core-config.yaml` ainda assume `docs/`, `docs/stories`, `docs/architecture`, `workspace/squads/` e outros caminhos na estrutura atual
- `vite.config.js` aponta diretamente para `apps/plataforma/` e lê `workspace/marketing/lps.manifest.json`
- os scripts da raiz em `package.json` também dependem da estrutura atual de `apps/plataforma/`, `apps/landing-pages/` e `docs/`

## Guardrails obrigatórios

### 1. Proteção do core do framework

Manter `boundary.frameworkProtection: true` em `.aiox-core/core-config.yaml` e ampliar o entendimento do time de que o core não é área de edição casual quando a tarefa é produto AdsMagic.

### 2. Referências como somente leitura

Tudo em `references/upstream/` deve ser tratado como material externo. A regra operacional é simples:

- não editar
- não usar como pasta normal do app
- não misturar com código fonte do workspace

### 3. Outputs fora do source path

Arquivos em `outputs/` nunca devem entrar como dependência do runtime do workspace.

### 4. Design system com ownership explícito

O design system só deve receber o que for realmente compartilhado entre `apps/plataforma` e `apps/landing-pages`. Não usar a pasta como depósito genérico de assets.

### 5. Dependência unidirecional

O core do framework não deve importar nada do projeto AdsMagic. Apps podem consumir design system e manifestos do workspace, mas o caminho inverso deve ser evitado.

## Estratégia de migração segura

### Fase 0 — Nomear as zonas

Antes de mover qualquer arquivo:

- aprovar esta taxonomia
- documentar a regra de ownership
- alinhar que o AIOX core permanece na raiz por enquanto

Saída esperada:

- árvore alvo aprovada
- lista de paths sensíveis identificada

### Fase 1 — Mover referências e outputs ✅

- ✅ `_reference/` → `references/upstream/`
- ✅ `_critique/` → `references/critique/`
- ✅ `deliverables/` → `outputs/deliverables/`

### Fase 2 — Mover materiais do workspace ✅

- ✅ `marketing/` → `workspace/marketing/`
- ✅ `templates/` → `workspace/templates/`
- ✅ `wiki/` → `workspace/wiki/`
- ✅ `squads/` → `workspace/squads/`
- ✅ 20 referências atualizadas (runtime configs, AIOX configs, documentação)

### Fase 3 — Introduzir a zona de design system ✅

Executada incrementalmente:

- ✅ `design-system/` criado com `brand/`, `tokens/`, `components/`, `docs/`
- ✅ Tokens de cor compartilhados extraídos para `design-system/tokens/colors.ts`
- ✅ Ambos `tailwind.config.js` (Plataforma e landing-pages) importam da fonte única
- ✅ Brand assets canônicos (logos, ícones, ilustrações) copiados para `design-system/brand/`
- ⏳ Componentes Vue (`brand-system/`) serão consolidados após Fase 4 (apps em `apps/`)

Esta fase foi incremental e guiada por uso real.

### Fase 4 — Mover os apps ✅

- ✅ `Plataforma/` → `apps/plataforma/`
- ✅ `landing-pages/` → `apps/landing-pages/`
- ✅ `vite.config.js` raiz atualizado (root, pkg, tailwind, alias, createRequire)
- ✅ `package.json` scripts atualizados (7 prefixos de path)
- ✅ Ambos `tailwind.config.js` com import de tokens ajustado (`../../design-system/`)
- ✅ `apps/plataforma/vite.config.ts` — import de `vite.port-range.js` ajustado
- ✅ `apps/landing-pages/vite.config.ts` — manifest path e `fs.allow` ajustados
- ✅ `.github/copilot-instructions.md` — 10+ referências atualizadas
- ✅ `.github/instructions/` — ambos instruction files atualizados
- ✅ `README.md` — árvore de diretórios e instruções atualizados

### Fase 5 — Mover docs por último ✅

`docs/` movido para `workspace/docs/`. Referências atualizadas em:
- ✅ `package.json` — 5 scripts `--prefix docs` → `--prefix workspace/docs`
- ✅ `.aiox-core/core-config.yaml` — ~15 paths `docs/` → `workspace/docs/`
- ✅ `README.md` — links, árvore de diretórios, seção de documentação
- ✅ `PROTOTYPES-WORKFLOW.md` — 6 referências `docs/docs/product/` → `workspace/docs/docs/product/`
- ✅ `.github/copilot-instructions.md` — path da documentação
- ✅ `.claude/rules/story-lifecycle.md` — frontmatter paths
- ✅ `apps/plataforma/src/data/experiments.ts` — 6 specPath mock data
- ⚠️ Arquivos L1/L2 do framework (`.aiox-core/development/`, `.codex/agents/`, `.claude/commands/`) mantém paths legados — resolvem via `core-config.yaml` em runtime

## Ordem recomendada dos PRs

| PR | Escopo | Risco |
|---|---|---|
| PR-1 | documentação da taxonomia + guardrails | baixo |
| PR-2 | mover `_reference`, `_critique`, `deliverables` | baixo |
| PR-3 | mover `marketing`, `templates`, `wiki`, `squads` | médio |
| PR-4 | criar `design-system/` e iniciar consolidação | médio |
| PR-5 | mover `Plataforma` e `landing-pages` para `apps/` | alto |
| PR-6 | mover `docs/` e ajustar `core-config.yaml` | alto |

## Critério de sucesso

A reorganização é considerada bem-sucedida quando:

- o core do AIOX continua íntegro e protegido
- o workspace AdsMagic fica claramente separado do framework
- apps, design system, referências e outputs deixam de competir pelo mesmo espaço conceitual
- o risco de sobrescrita entre framework e produto é reduzido de forma explícita

## Decisão recomendada

**Sim, faz sentido separar.**

Mas a separação correta é:

- **core do framework AIOX**
- **workspace AdsMagic**
- **apps**
- **design system**
- **referências e outputs**

O ponto mais importante é não tentar criar dois AIOX paralelos. O AIOX continua sendo um só. O que muda é a clareza estrutural entre o framework e o projeto que o utiliza.