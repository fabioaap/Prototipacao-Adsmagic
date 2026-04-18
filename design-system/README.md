# Design System — AdsMagic

Zona compartilhada de assets de marca, tokens de design e componentes reutilizáveis entre os apps.

## Estrutura

```
design-system/
├── brand/          # Logos, ícones e ilustrações canônicas da marca
├── tokens/         # Tokens de cor, tipografia e espaçamento (source of truth)
├── components/     # Componentes Vue compartilhados entre apps (pós-Fase 4)
└── docs/           # Documentação do design system
```

## Ownership

O design system só deve receber o que for **realmente compartilhado** entre `apps/plataforma` e `apps/landing-pages`. Não usar como depósito genérico de assets.

## Status atual

### `brand/`
Contém os assets canônicos da marca AdsMagic: logos, favicon, ícones de marca, ilustrações e mood photos. Os apps mantêm cópias em seus diretórios `public/` para servir via Vite, mas a fonte oficial vive aqui.

### `tokens/`
Exporta a paleta primária indigo e cores semânticas que ambos os apps compartilham. Os `tailwind.config.js` de cada app importam de `design-system/tokens/colors.ts`.

### `components/`
**Ainda não populado.** Após a Fase 4 (mover apps para `apps/`), os componentes `brand-system/` duplicados entre os apps serão consolidados aqui com um alias `@ds/` no Vite.

Componentes candidatos à consolidação:
- `BrandPricingCard.vue` (duplicado em Plataforma e landing-pages)
- `BrandTrustRibbon.vue` (duplicado em Plataforma e landing-pages)
- `BrandFaqAccordion.vue` (landing-pages only, mas candidato a compartilhamento)
- `BrandTestimonialCard.vue` (landing-pages only, mas candidato a compartilhamento)
- `BrandFlowSection.vue` (Plataforma only, mas candidato a compartilhamento)

### `docs/`
Documentação complementar ao catálogo visual em `/styleguide` (dev-only no Plataforma).

## Dependência unidirecional

```
design-system/tokens/ ← apps (importam)
design-system/brand/  ← apps (copiam para public/)
design-system/        ← NÃO importa nada dos apps
```
