# Workflow de Protótipos — Adsmagic

## Relação entre os repositórios

| Repositório | Papel |
|--------|----------|
| `Adsmagic-First-AI` | Fonte de verdade do AS-IS, implementação real e destino dos PRs de melhoria |
| `Prototipacao-Adsmagic` | Workspace de descoberta, documentação, prototipação mockada e preparação de propostas |
| `references/upstream/adsmagic-aiox-source/` | Espelho local de leitura do repo upstream, usado para inspeção e comparação |

Regras fixas:

- este workspace **não deve ser usado para modificar diretamente** o repo upstream
- toda rodada de alinhamento do AS-IS deve registrar **branch e SHA** do upstream
- o clone em `references/upstream/adsmagic-aiox-source/` deve ser tratado como **somente leitura**

---

## Estrutura de Branches do workspace

| Branch | Propósito |
|--------|----------|
| `main` | Base estável do workspace |
| `prototypes/as-is` | Alinhamento do workspace com o baseline AS-IS adotado do upstream |
| `prototypes/feature/<nome>` | Protótipos de melhoria e propostas de contribuição |

---

## Ciclo recomendado

### 1. Fixe a referência upstream

Escolha a branch ou o SHA que será usado como baseline da rodada. Atualize o espelho local em `references/upstream/adsmagic-aiox-source/` e registre a referência em `workspace/docs/docs/product/as-is-baseline.md`.

### 2. Atualize o AS-IS do workspace

Revise `workspace/docs/docs/product/as-is.md` e registre divergências em `workspace/docs/docs/product/as-is-gap-register.md`.

### 3. Crie a branch do protótipo

```bash
git checkout prototypes/as-is
git pull origin prototypes/as-is
git checkout -b prototypes/feature/nome-da-feature
```

Exemplos de nomes:

- `prototypes/feature/novo-dashboard-atribuicao`
- `prototypes/feature/onboarding-integracoes`
- `prototypes/feature/campanhas-unificadas`

### 4. Desenvolva com dados mockados

Edite os arquivos em `Plataforma/src/` ou `landing-pages/` sem conectar APIs reais.

```bash
npm run dev
```

Para landing pages exportáveis:

```bash
npm run lps:dev
```

### 5. Valide localmente

Garanta que o fluxo navegável esteja claro, que a hipótese esteja documentada em `workspace/docs/docs/product/to-be.md` quando necessário e que o protótipo consiga demonstrar o ganho proposto.

### 6. Empacote a proposta de PR

Use `templates/upstream-pr-proposal.md` para preparar o handoff. A proposta deve incluir:

- problema observado no upstream
- referência branch/SHA usada no AS-IS
- hipótese validada neste workspace
- áreas e arquivos prováveis do repo fonte
- mapeamento entre mock e implementação real
- critérios de aceite, riscos e testes sugeridos

### 7. Porte a melhoria no repo fonte

A implementação final e o PR acontecem no `Adsmagic-First-AI`, não neste workspace.

### 8. Atualize a documentação após merge

Quando a melhoria for aceita no repo fonte, atualize o baseline, o `product/as-is.md` e o registro de gaps.

---

## Convenções de Commit

| Prefixo | Uso |
|---------|-----|
| `docs:` | Atualizações de baseline, gaps, briefs e governança |
| `proto:` | Mudanças de prototipação (UI, UX, novos fluxos) |
| `data:` | Ajustes nos dados mockados |
| `fix:` | Correção de bugs no ambiente |
| `chore:` | Manutenção do ambiente (deps, configs) |

---

## URLs de Desenvolvimento

| Servidor | URL | Comando |
|----------|-----|---------|
| Root (via vite.config.js raiz) | primeira porta livre entre http://localhost:3000 e http://localhost:3006 | `npm run dev` |
| Plataforma standalone | primeira porta livre entre http://localhost:3000 e http://localhost:3006 | `npm run dev:fo` |
| Landing pages standalone | http://localhost:4173 | `npm run lps:dev` |

---

## Comparando um protótipo com o baseline local

```bash
git diff prototypes/as-is...prototypes/feature/nome-da-feature -- Plataforma/src/
git diff --name-only prototypes/as-is...prototypes/feature/nome-da-feature
```

---

## Artefatos obrigatórios por proposta

- `workspace/docs/docs/product/as-is-baseline.md`
- `workspace/docs/docs/product/as-is-gap-register.md`
- `workspace/docs/docs/product/to-be.md` quando houver hipótese nova
- `templates/upstream-pr-proposal.md`

---

## Regras Gerais

- ❌ **Não conecte APIs reais** neste workspace
- ❌ **Não use este repo para abrir PR ou modificar diretamente** o upstream
- ❌ **Não edite `references/upstream/adsmagic-aiox-source/`** como se fosse código do workspace
- ✅ Cada protótipo deve ser **independente** e partir de `prototypes/as-is`
- ✅ Toda proposta deve citar a **referência do upstream** usada no alinhamento
- ✅ Atualize o AS-IS e o registro de gaps sempre que o repo fonte incorporar uma melhoria nascida aqui

---

## Handoff específico para LPs exportáveis

Quando a entrega for uma landing page publicada fora do workspace principal, gere um pacote estático por superfície antes do handoff:

```bash
npm run lps:build
npm run lps:package
```

Resultado esperado:

- manifesto central atualizado em `workspace/marketing/lps.manifest.json`
- preview validado no app `landing-pages/`
- pacote final em `outputs/deliverables/lps/<slug>/` com `index.html`, `assets/`, `img/`, `manifest.json` e `README-handoff.md`
