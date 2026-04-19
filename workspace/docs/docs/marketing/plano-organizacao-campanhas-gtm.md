---
title: Plano de Organização — Campanhas de GTM
slug: /wiki/marketing/plano-organizacao-campanhas-gtm
---

# Plano de Organização — Campanhas de GTM

Este plano organiza a frente de Campanhas de GTM dentro de Marketing e define como transformar a série StoryBrand em um pacote completo de campanha, copy e direção de arte operacional.

Ele existe para alinhar três frentes que até aqui estavam separadas:

- navegação e arquitetura da camada GTM dentro da Wiki
- sistema visual e direção de arte da série StoryBrand
- produção slide a slide com prompt pronto para Nano Banana

## Objetivo

Criar um bloco de Campanhas de GTM mais fechado, mais navegável e mais útil para produção, sem duplicar papel entre estratégia, copy e direção de arte.

## Escopo

Este plano cobre:

- organização da área Campanhas de GTM dentro de Marketing
- criação de uma camada visual específica para a série StoryBrand
- enriquecimento da página de copies com prompt de direção de arte por slide

Este plano não cobre:

- design final das peças
- renderização no BrandOS
- publicação final dos criativos

## Resultado esperado

Ao final da execução, a Wiki deve ter:

- uma entrada clara para Campanhas de GTM
- uma sequência de leitura e produção para a série StoryBrand
- uma separação limpa entre arquitetura narrativa, brief visual e copy final
- uma coluna por slide com prompt Nano Banana usando assets, grafismos, composição e restrições reais da marca

## Plano em 3 fases

| Fase | Objetivo | Entregável principal | Dependência |
| --- | --- | --- | --- |
| 1 | Fechar a arquitetura e a navegação do bloco GTM | navegação mais clara e contrato do bloco | nenhuma |
| 2 | Fechar a camada visual da série StoryBrand | brief visual e linguagem de composição | fase 1 |
| 3 | Fechar a produção slide a slide | copy com coluna Prompt Nano Banana | fases 1 e 2 |

### Fase 1 — Arquitetura e navegação GTM

**Objetivo**

Fazer Campanhas de GTM deixar de ser apenas uma lista e virar uma frente organizada dentro de Marketing.

**Arquivos principais**

- [Marketing](/wiki/marketing)
- `workspace/docs/src/data/wikiTaxonomy.ts`
- nova página índice de Campanhas de GTM

**Saída desejada**

- página índice própria para a frente GTM
- ordem de leitura clara
- separação entre Marketing geral e outputs de campanha

### Fase 2 — Camada visual StoryBrand

**Objetivo**

Criar a ponte entre narrativa e arte, para que a copy não precise carregar sozinha a direção visual.

**Arquivos principais**

- [Arquitetura Editorial — Série Instagram StoryBrand](/wiki/marketing/arquitetura-editorial-instagram-storybrand)
- novo brief visual da série StoryBrand
- [Assets e Campanhas](/wiki/marketing/assets-e-campanhas)

**Saída desejada**

- taxonomia visual da série
- regras de composição e uso de assets
- negative prompts e restrições visuais da marca

### Fase 3 — Produção slide a slide

**Objetivo**

Transformar a página de copies em material de produção, sem misturar copy final com regra-base de identidade.

**Arquivos principais**

- [Copies — Série de 9 Carrosséis Instagram StoryBrand](/wiki/marketing/copies-carrosseis-instagram-storybrand)
- [Governança](/wiki/marketing/governanca)
- [Assets e Campanhas](/wiki/marketing/assets-e-campanhas)

**Saída desejada**

- coluna Prompt Nano Banana por slide
- schema visual consistente entre os 9 posts
- governança clara do ativo produzido

## Orquestração de agentes e skills

| Fase | Agente líder | Agentes de apoio | Skills principais | Papel |
| --- | --- | --- | --- | --- |
| 1 | Architect | PO, Dev, QA | architect-first, checklist-runner | fechar arquitetura da informação, naming e ordem de navegação |
| 2 | UX Design Expert | Architect, Dev, QA | design-clone, emil-design-eng, checklist-runner | traduzir a identidade real da marca em brief visual operacional |
| 3 | Copy | UX Design Expert, GTM, Dev, QA | copywriting, storybrand-copy, copywriting-awareness, hook-writing, persuasion-cialdini, checklist-runner | escrever e revisar a camada final de copy e prompt por slide |

## Papéis por agente

### Architect

Responsável por:

- garantir a separação entre índice, brief visual e copy final
- evitar sobreposição de conteúdo entre páginas
- manter a navegação coerente com a taxonomia global

### GTM

Responsável por:

- garantir coerência com a operação real de campanha
- manter o foco em ICP, funil e motion de aquisição
- validar ordem de leitura e utilidade prática do pacote

### Copy

Responsável por:

- manter o herói como agência/gestor e a marca como guia
- sustentar a progressão de awareness e StoryBrand
- transformar a série em material persuasivo e publicável

### UX Design Expert

Responsável por:

- converter a marca em sistema visual reproduzível
- garantir composição real de campanha, não estética genérica de IA
- definir assets, grafismos, glow, branding e negative prompts

### Dev

Responsável por:

- materializar o plano nos documentos e taxonomia
- garantir legibilidade no portal de docs
- manter links, slugs e renderização estáveis

### QA

Responsável por:

- validar navegação, breadcrumbs e sidebar
- checar duplicação de conteúdo
- validar legibilidade das tabelas e consistência do pacote final

## Contrato da coluna Prompt Nano Banana

A coluna deve usar sempre a mesma ordem lógica:

1. formato
2. objetivo visual
3. assets obrigatórios
4. grafismos
5. composição
6. iluminação e glow
7. branding
8. restrições
9. negative prompts

### Regra de escrita

A coluna deve ser:

- curta o suficiente para caber na tabela
- específica o suficiente para não gerar arte genérica
- derivada das referências reais da marca
- útil para produção imediata

### Fontes visuais obrigatórias

- logo: `logo-wordmark.svg`, `logo-wordmark-white.svg`, `logo-icon.svg`
- assets de apoio: `illus-data-flow.svg`, `illus-decision.svg`, `illus-systems.svg`, `photo-mood-authority.svg`, `photo-mood-collaboration.svg`, `photo-mood-operational.svg`
- grafismos: barras diagonais arredondadas a 135 graus, azuis de profundidade e verdes de acento, fundo campaign navy #000E50, glow radial azul e verde

## Riscos principais

| Risco | Efeito | Mitigação |
| --- | --- | --- |
| Índice novo duplicar Assets e Campanhas | navegação confusa | índice roteia; catálogo continua em Assets e Campanhas |
| Brief visual repetir a página de copies | sobreposição editorial | copy final e direção visual ficam em páginas separadas |
| Coluna Nano Banana ficar longa demais | tabela ilegível na Wiki | prompt compacto, com gramática fixa e vocabulário controlado |
| Direção de arte derivar para estética genérica | perda de identidade | usar references da marca, negative prompts e assets reais |
| Misturar Branding e produto em excesso | marca virar protagonista | manter Adsmagic como guia e branding disciplinado |

## Ordem recomendada de execução

1. consolidar o plano e a navegação
2. criar a página índice de Campanhas de GTM
3. criar o brief visual da série StoryBrand
4. adicionar a coluna Prompt Nano Banana nas copies
5. validar renderização e governança

## Definição de pronto

A frente estará pronta quando:

- Campanhas de GTM tiver entrada clara na Wiki
- a série StoryBrand tiver arquitetura, brief visual e copy separados por função
- os 9 posts tiverem prompt visual por slide
- os prompts mencionarem assets, grafismos, composição e restrições da marca
- o portal de docs buildar e renderizar sem ruído de navegação
