---
id: PROTO-009
title: "Performance da LP para Agências — scroll sem jank nas seções animadas"
epic: "Growth / Landing Pages"
status: done
priority: high
agent: dev
complexity: medium
depends_on: []
---

# PROTO-009 — Performance da LP para Agências

## Contexto

A landing page `landing-pages/para-agencias` carregava rápido, mas perdia fluidez durante o scroll, principalmente nas áreas com combinação de animações, sticky cards, canvas e glassmorphism. O gargalo estava concentrado em custo de composição e renderização durante a rolagem, não em carregamento inicial.

## Objetivo

Reduzir o jank de scroll da LP sem alterar a mensagem comercial da página, mantendo a identidade visual principal e simplificando efeitos caros apenas quando necessário.

---

## Critérios de Aceitação

- [x] A LP mantém scroll mais fluido nas seções com animação e cards sticky
- [x] O hero dashboard só recalcula perspectiva quando está visível e fora do modo reduzido
- [x] O stack de features deixa de aplicar `filter` caro no scroll e fica estático em modo reduzido
- [x] A seção de features mantém o empilhamento visual com CSS sticky, sem lógica JS de scroll
- [x] A CTA band deixa de renderizar ícones flutuantes, glow e grafismos animados
- [x] Os fundos decorativos principais foram restaurados em versão estática, sem animação e sem blur
- [x] A área visual do feature carousel foi normalizada para manter tamanho consistente entre screenshots
- [x] O canvas da seta do hero deixa de usar RAF contínuo e renderiza sob demanda
- [x] O starfield da seção de pricing reduz densidade/complexidade e pausa durante scroll
- [x] Efeitos caros de `backdrop-filter` e bordas animadas são simplificados durante scroll e em modo reduzido

## Implementação

- [x] Adicionados estados `isScrolling` e `isReducedEffects` no componente da LP
- [x] Aplicadas classes de degradação visual no root da página para scroll ativo e reduced effects
- [x] Limitados os handlers de scroll ao período em que hero/features estão em viewport
- [x] Removidos o spotlight dinâmico e os cálculos JS de scroll da seção de features, mantendo sticky só em CSS
- [x] Removidos os decorativos animados da CTA band para reduzir custo de composição
- [x] Restaurados fundos decorativos estáticos em flow, CTA band e pricing, sem efeitos dinâmicos
- [x] Padronizado o viewport das imagens do feature carousel e reduzida a screenshot vertical fora do padrão
- [x] Atualizado `useArrowCanvas` para desenho sob demanda
- [x] Atualizado `useMagneticStarfield` para operação adaptativa com menos partículas e pausa por estado

## Validação

- [x] `cd landing-pages && npm run build`
- [x] `npm run lint` verificado na raiz — script não existe no workspace
- [x] `npm run typecheck` verificado na raiz — script não existe no workspace; a LP cobre tipagem via `vue-tsc -b` no build
- [x] `npm test` verificado na raiz — script não existe no workspace

## File List

| Ação | Arquivo |
|------|---------|
| EDITADO | `landing-pages/src/lps/agencias-performance/AgenciasPerformanceLandingView.vue` |
| EDITADO | `landing-pages/src/composables/useArrowCanvas.ts` |
| EDITADO | `landing-pages/src/composables/useMagneticStarfield.ts` |
| CRIADO | `docs/docs/stories/PROTO-009.md` |
