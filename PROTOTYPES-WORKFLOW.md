# Workflow de Protótipos — Adsmagic

## Estrutura de Branches

| Branch | Propósito | APIs reais? |
|--------|----------|------------|
| `main` | Ambiente base — código estável, sem protótipos | ❌ |
| `prototypes/as-is` | Baseline AS-IS do Adsmagic — como o produto está hoje | ❌ |
| `prototypes/feature/<nome>` | Protótipos de exploração e UX — dados mockados | ❌ |
| `prototypes/growth/<nome>` | Experimentos de growth e testes A/B com dados reais | ✅ |

> A promoção de um protótipo aprovado para canary acontece no **repo de produção**, não neste workspace. Ver seção [Pipeline Completo](#pipeline-completo-workspace--canary--produção) abaixo.

---

## Como Criar um Novo Protótipo

### 1. Sempre parta do AS-IS

```bash
git checkout prototypes/as-is
git pull origin prototypes/as-is
```

### 2. Crie a branch do protótipo

```bash
git checkout -b prototypes/feature/nome-da-feature
```

Exemplos de nomes:
- `prototypes/feature/novo-dashboard-atribuicao`
- `prototypes/feature/kanban-melhorado`
- `prototypes/feature/onboarding-integracoes`

### 3. Desenvolva o protótipo

Edite os arquivos em `Plataforma/src/`. Rode localmente com:

```bash
npm run dev
```

Acesse em: **http://localhost:3000** ou na próxima porta livre até **http://localhost:3006**

Se o prototipo for uma landing page exportavel, trabalhe no app dedicado em `landing-pages/` e valide com:

```bash
npm run lps:dev
```

O preview dedicado roda em **http://localhost:4173** e o manifesto central fica em `marketing/lps.manifest.json`. Na Plataforma, os atalhos legados `/lp/home` e `/lp/agencias` devem ser tratados apenas como redirects de compatibilidade para esse app dedicado.

### 4. Faça commits com a convenção correta

```bash
git add .
git commit -m "proto: descrição do que foi mudado"
```

Exemplos:
```
proto: adiciona gráfico de funil interativo no dashboard
proto: refatora kanban com drag and drop visual
proto: novo layout de cards de integração
```

### 5. Publique o protótipo

```bash
git push origin prototypes/feature/nome-da-feature
```

---

## Convenções de Commit

| Prefixo | Uso |
|---------|-----|
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

## Comparando Protótipos

Para comparar o AS-IS com uma feature branch:

```bash
# Ver diferenças entre as-is e seu protótipo
git diff prototypes/as-is...prototypes/feature/nome-da-feature -- Plataforma/src/

# Ver lista de arquivos alterados
git diff --name-only prototypes/as-is...prototypes/feature/nome-da-feature
```

---

## Regras Gerais

- ❌ **Nunca faça merge** de protótipos para `main` sem discussão
- ✅ Cada protótipo deve ser **independente** — parta sempre do `as-is`
- ✅ Branches `feature/*` usam **dados sempre mockados** — sem conexões a APIs reais
- ✅ Branches `growth/*` podem usar APIs reais com `.env.local` (nunca commitado)
- ✅ Documente o objetivo do protótipo no PR/commit inicial

---

## Pipeline Completo: Workspace → Canary → Produção

Este workspace cobre as fases 1 e 2. As fases 3-5 acontecem no repo de produção.

```
FASE 1 — Exploração (este workspace)
  branch: prototypes/feature/<nome>
  dados: mockados
  objetivo: testar UX, fluxos e hipóteses sem dependência de infra
        ↓ protótipo aprovado por produto

FASE 2 — Validação com dados reais (este workspace)
  branch: prototypes/growth/<nome>
  dados: APIs reais (.env.local)
  objetivo: confirmar que o fluxo funciona com dados reais antes de portar
        ↓ validação OK

FASE 3 — Canary (repo de produção — @devops)
  infra: Cloudflare Pages (preview por branch, URL automática)
  split de tráfego: feature flag ou Cloudflare Workers routing
  responsaveis: @devops (infra) + @architect (estratégia de rollout)
        ↓ métricas OK no canary

FASE 4 — Produção (repo de produção — @devops)
  merge para main, deploy Cloudflare Pages
  atualizar product/as-is.md neste workspace
        ↓

FASE 5 — Growth Analysis
  ferramentas: Meta Ads API, Google Analytics, Supabase
  responsavel: squad de GTM + produto
  resultado: alimenta nova rodada de hipóteses → Fase 1
```

### Handoff: como o código sai do workspace e entra em produção

Por serem a mesma stack (Vue 3 + Vite + Tailwind), o código de um protótipo aprovado pode ser portado diretamente — não reescrito. O processo recomendado:

1. Abrir PR no repo de produção referenciando a branch `prototypes/feature/<nome>` deste workspace
2. O @architect revisa a aderência à arquitetura de produção (APIs reais, auth, RLS)
3. O @devops configura o deploy de canary via Cloudflare Pages
4. Testes A/B com tráfego real na URL de preview
5. Merge para `main` após validação das métricas

### Handoff especifico para LPs exportaveis

Quando a entrega for uma landing page publicada fora do workspace principal, gere um pacote estatico por superficie antes do handoff:

```bash
npm run lps:build
npm run lps:package
```

Resultado esperado:
- manifesto central atualizado em `marketing/lps.manifest.json`
- preview validado no app `landing-pages/`
- pacote final em `deliverables/lps/<slug>/` com `index.html`, `assets/`, `img/`, `manifest.json` e `README-handoff.md`

### O que @devops e @architect precisam decidir

| Decisão | Responsável | Status |
|---|---|---|
| Ferramenta de feature flags | @architect | ✅ PostHog (já instalado) |
| Split de tráfego por segmento / % | @architect | ✅ PostHog cohorts + user properties |
| Growth analysis pós-canary | GTM + Produto | ✅ PostHog funnels + session replay |
| Secrets de produção para branches de canary no Cloudflare | @devops | ⬜ Em aberto |
| Naming convention para branches de canary no repo de produção | @devops | ⬜ Em aberto |

> **PostHog já resolve 3 das 5 decisões.** O split A/B é feito com `useFeatureEnabled('nome-do-experimento')` no componente Vue — controle de rollout pelo painel, sem redeployar.
