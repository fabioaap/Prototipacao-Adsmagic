# Engenharia Reversa de Front-end - Attio (simetria visual)

Data: 2026-03-05
URL analisada: `https://app.attio.com/educacroos/home`
Objetivo: entender por que a interface parece tao simetrica e qual tecnica de front-end sustenta isso.

## Resumo executivo

A simetria da Attio nao parece vir de "truques visuais" isolados, mas de uma combinacao de:

1. Shell de layout muito previsivel (sidebar fixa + area principal fluida).
2. Escala de espacamento curta e consistente (4/6/8/10/12/40).
3. Tipografia com base global em `10px` e poucos tamanhos realmente usados.
4. Componentizacao forte via CSS-in-JS (`styled-components`), com estilos encapsulados por componente.
5. Hierarquia de containers com paddings repetidos (ex.: `24px` horizontal no conteudo).

## Evidencias tecnicas coletadas

### 1) Stack de front-end identificada

- `runtime.bundle`, `vendors.bundle`, `main.bundle` em `web-assets`.
- Nao ha sinais de Next/Nuxt na pagina (`__NEXT_DATA__` ausente, `__NUXT__` ausente).
- Presenca de `#root` (aplicacao SPA/hidratada).
- Marcador direto de styled-components:
  - `style[data-styled="active"][data-styled-version="6.1.23"]`
- Classes com padrao `sc-...` em massa (comportamento tipico de styled-components).

Conclusao: app React (ou ecossistema equivalente) com `styled-components` v6.1.23 e bundles empacotados (pipeline tipo webpack/custom).

### 2) Estrutura de layout (simetria macro)

No viewport analisado (1075x775):

- Sidebar: `x=0`, `w=275`, `h=742`
- Main: `x=275`, `w=800`, `h=742`

Isso cria um eixo vertical limpo: tudo no conteudo principal nasce em `x=275` e o conteudo interno util inicia em `x=287` por conta de padding/margens internos.

Padrao observado no conteudo principal:

- Cabecalho interno com `padding: 10px 12px`
- Blocos centrais com `padding horizontal: 24px`
- Area de trabalho com largura util recorrente de `716px` dentro do main

Esse encadeamento de larguras e offsets reduz "quebras" de alinhamento visual.

### 3) Escala de spacing (simetria micro)

Gaps mais frequentes encontrados:

- `4px`, `6px`, `8px`, `10px`, `12px`
- Saltos maiores pontuais: `40px`

Raios mais frequentes:

- `6px`, `8px`, `9px` (predominantes)

Interpretacao: eles usam uma escala curta de tokens, evitando valores arbitrarios por componente.

### 4) Tipografia e ritmo vertical

Estilos globais observados:

- `html/body`: `font-family: Inter, sans-serif`
- Base: `font-size: 10px`
- Suavizacao: `-webkit-font-smoothing: antialiased`
- Renderizacao: `text-rendering: optimizeLegibility`

Frequencia de tamanhos:

- `10px` domina a interface estrutural
- `14px` em titulos/rotulos principais
- Poucos tamanhos extras (`12px`, `16px`, `20px`)

Frequencia de line-height:

- `15px` e `20px` dominantes

Interpretacao: baixo numero de combinacoes tipograficas, o que aumenta consistencia e previsibilidade visual.

## Como eles deixam a plataforma "simetrica"

1. Definem um shell fixo de navegacao lateral.
2. Definem uma coluna principal com padding horizontal estavel.
3. Usam stacks em flex com poucos valores de `gap` repetidos.
4. Encapsulam estilo por componente (evita vazamento e excecoes locais).
5. Mantem poucos tokens de raio, tipografia e espacamento.
6. Distribuem hierarquia com `space-between` apenas em cabecalhos/control bars, nao em toda a tela.

## Tecnicas de front-end usadas (inferidas com alta confianca)

1. CSS-in-JS com `styled-components` (confirmado por atributos de runtime).
2. App bundleado em runtime/vendors/main (arquitetura SPA moderna).
3. Design system orientado a tokens de spacing/typography/radius.
4. Layout majoritariamente em Flexbox com composicao em colunas e linhas.

## Blueprint para reproduzir esse nivel de simetria no AdsMagic

### 1) Tokens obrigatorios

Defina um arquivo de tokens com no maximo:

- Spacing: `4, 6, 8, 10, 12, 16, 24, 40, 56`
- Radius: `6, 8, 10`
- Font sizes: `10, 12, 14, 16, 20`
- Line heights: `15, 20, 24`

### 2) Shell de layout

- Sidebar fixa (largura unica por breakpoint).
- Main com padding lateral estavel (ex.: `24px`).
- Largura util interna padronizada para blocos de conteudo.

### 3) Regras de consistencia

- Proibir valores de spacing fora da escala em PR.
- Proibir radius arbitrario fora dos tokens.
- Usar no maximo 2 tamanhos de texto por secao.
- Usar `gap` de tokens, nunca margens ad-hoc entre siblings.

### 4) Instrumentacao de qualidade visual

- Storybook para componentes base.
- Testes visuais por screenshot em paginas-chave.
- Lint/design checks para tokens (stylelint/eslint custom).

## Limitacoes da analise

1. Analise feita em ambiente de producao minificado (sem source maps do produto).
2. Algumas conclusoes sao inferencias estruturais, nao acesso ao repositorio interno da Attio.
3. A amostra foi da Home e onboarding; outras areas podem ter pequenas variacoes.

## Conclusao

A simetria da Attio vem de disciplina de sistema, nao de um unico framework magico. O diferencial esta na combinacao de:

- layout shell previsivel,
- escala curta de tokens,
- tipografia restrita,
- e componentizacao com styled-components.

Esse padrao e totalmente replicavel no AdsMagic com governanca de design tokens e regras de implementacao.
