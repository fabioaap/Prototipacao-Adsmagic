---
title: Prototipação
---

# Workflow de prototipação

Este workspace cobre as **fases 1 e 2** de um pipeline de 5 estágios que vai da hipótese à produção. As fases 3–5 acontecem no repo de produção, com @devops e @architect como responsáveis.

## Pipeline completo

| Fase | Onde | Branch | APIs reais? |
|---|---|---|---|
| **1. Exploração** | Este workspace | `prototypes/feature/<nome>` | ❌ Mock |
| **2. Validação Growth** | Este workspace | `prototypes/growth/<nome>` | ✅ `.env.local` |
| **3. Canary** | Repo de produção | `canary/YYYYMM/<kebab-slug>` — projeto `adsmagic-canary` no Cloudflare Pages | ✅ |
| **4. Produção** | Repo de produção | `main` | ✅ |
| **5. Growth Analysis** | Ferramentas externas | — | — |

> O Cloudflare Pages gera uma URL de preview por branch automaticamente — o canary é nativo, sem infra adicional.
> Secrets de produção ficam no projeto dedicado `adsmagic-canary` (scope Preview, tracking `canary/*`), isolados das branches de feature.

## Fase 1 — Estrutura de branches de exploração

- `main` → base estável do workspace
- `prototypes/as-is` → baseline do estado atual do produto
- `prototypes/feature/<nome>` → exploração de UX e hipóteses (dados mockados)

## Fase 2 — Branches de growth

- `prototypes/growth/<nome>` → validação com APIs reais antes de portar para produção
- Credenciais exclusivamente em `.env.local` (nunca commitado)
- Objetivo do experimento documentado em `product/to-be.md` antes de iniciar

## Ciclo recomendado (fases 1–2)

1. Partir de `prototypes/as-is`
2. Criar branch `prototypes/feature/<nome>`
3. Implementar com dados mockados em `Plataforma/src/`
4. Validar localmente — `npm run dev`
5. Documentar o objetivo no commit ou PR
6. Se aprovado por produto → validar com dados reais em `prototypes/growth/<nome>`
7. Pronto para handoff ao repo de produção (fases 3–5)

## Handoff para o repo de produção

Por serem a mesma stack (Vue 3 + Vite + Tailwind), o código é portado diretamente:

1. PR no repo de produção referenciando a branch deste workspace
2. @architect revisa aderência à arquitetura real (APIs, auth, RLS Supabase)
3. @devops configura canary no Cloudflare Pages
4. Testes A/B com tráfego real
5. Merge para `main` após validação das métricas
6. Atualizar `product/as-is.md` neste workspace

## Convenção de commits

| Prefixo | Uso |
|---------|-----|
| `proto:` | Interface, UX, novos fluxos (fase 1) |
| `growth:` | Experimentos com APIs reais (fase 2) |
| `data:` | Ajustes nos dados mockados |
| `fix:` | Correções no ambiente |
| `chore:` | Manutenção (deps, configs) |

## Regras importantes

- Branches `feature/*` nunca conectam APIs reais
- Branches `growth/*` usam `.env.local` — nunca commitado
- Nenhum merge direto em `main` sem discussão
- Cada protótipo deve ser independente
- Atualizar `product/as-is.md` quando uma feature sobe para produção

## Onde documentar

Use este portal Docusaurus para mudanças estruturais: setup, arquitetura, jornadas, convenções.

Use o pipeline de canary (fases 3–5) para validar hipóteses com usuários reais.