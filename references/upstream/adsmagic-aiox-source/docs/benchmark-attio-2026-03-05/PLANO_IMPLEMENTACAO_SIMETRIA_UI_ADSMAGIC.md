# Plano de Implementacao - Simetria de UI no AdsMagic

Data: 2026-03-05
Base de benchmark: engenharia reversa da Attio
Objetivo: elevar consistencia visual do AdsMagic com um sistema de layout/tokens executavel em sprints.

## Resultado esperado

Ao final deste plano, o front-end deve entregar:

1. Alinhamento consistente entre sidebar, header e area de conteudo.
2. Escala unica de spacing, tipografia e radius, sem valores arbitrarios.
3. Componentes base com variacoes previsiveis e reutilizaveis.
4. Reducao de retrabalho visual em features novas.
5. Melhor percepcao de qualidade e "simetria" da interface.

## Escopo

- Front-end Vue 3 + TypeScript (`front-end/`)
- Sistema visual (tokens, layout shell, componentes base)
- Qualidade e governanca (lint/checklist/testes visuais)

Fora de escopo:

- Rebranding completo
- Mudanca de arquitetura de dados
- Refatoracao de todas as telas em um unico ciclo

## Fase 0 - Baseline (1-2 dias)

Objetivo: medir o estado atual antes de alterar componentes.

Tarefas:

1. Selecionar 8 telas prioritarias para baseline:
   - Dashboard
   - Contatos (lista)
   - Contatos (kanban)
   - Funil/Vendas
   - Integracoes
   - Mensagens
   - Configuracoes
   - Login
2. Capturar screenshots desktop (1280x800) e mobile (390x844).
3. Registrar inconsistencias visuais em matriz simples:
   - spacing fora da escala
   - tipografia inconsistente
   - alinhamento entre cards/headers
   - botoes com alturas divergentes

Entregavel:

- `docs/ui-consistency/baseline-2026-03.md`

## Fase 1 - Design Tokens (2-3 dias)

Objetivo: criar fonte unica de verdade para espacamento, tipografia, radius e cores neutras.

### 1.1 Definir tokens base

Espacamento:

- `4, 6, 8, 10, 12, 16, 24, 40, 56`

Radius:

- `6, 8, 10`

Tipografia:

- tamanhos: `10, 12, 14, 16, 20`
- line-height: `15, 16, 20, 24`
- pesos: `400, 500, 600`

### 1.2 Implementar tokens no projeto

Criar arquivo sugerido:

- `front-end/src/styles/tokens.css`

Exemplo:

```css
:root {
  --space-1: 4px;
  --space-2: 6px;
  --space-3: 8px;
  --space-4: 10px;
  --space-5: 12px;
  --space-6: 16px;
  --space-7: 24px;
  --space-8: 40px;
  --space-9: 56px;

  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 10px;

  --font-size-1: 10px;
  --font-size-2: 12px;
  --font-size-3: 14px;
  --font-size-4: 16px;
  --font-size-5: 20px;

  --line-1: 15px;
  --line-2: 16px;
  --line-3: 20px;
  --line-4: 24px;
}
```

### 1.3 Expor tokens para TS (opcional, recomendado)

Criar:

- `front-end/src/styles/tokens.ts`

Com objeto tipado para uso em composables/componentes.

Entregavel:

- Tokens versionados e importados globalmente.

## Fase 2 - Layout Shell (3-4 dias)

Objetivo: padronizar geometria macro da aplicacao.

### 2.1 Criar layout principal unico

Padrao alvo:

1. Sidebar com largura definida por breakpoint.
2. Conteudo principal com `padding-inline` fixo (ex.: `24px` desktop).
3. Header interno com altura e espacamento padronizados.
4. Area de conteudo com stacks verticais previsiveis.

Implementacao sugerida:

- `front-end/src/layouts/AppShell.vue`
- `front-end/src/components/layout/PageContainer.vue`
- `front-end/src/components/layout/PageHeader.vue`

### 2.2 Definir contratos de layout

Regras:

1. Nao usar `margin-top` arbitrario entre secoes; usar `Stack` com `gap` tokenizado.
2. Nao aplicar `padding` direto em cada view; usar `PageContainer`.
3. Toda view autenticada deve herdar AppShell.

Entregavel:

- Shell aplicado nas telas-chave (Dashboard, Contatos, Vendas).

## Fase 3 - Componentes Base (4-6 dias)

Objetivo: eliminar divergencia visual entre elementos equivalentes.

Componentes prioritarios:

1. `Button`
2. `Input`
3. `Card`
4. `Table` wrappers
5. `SectionHeader`
6. `Stack`/`Inline` helpers

### 3.1 Padroes minimos por componente

Button:

- alturas fechadas por tamanho (`sm/md/lg`)
- padding via tokens
- radius unico por variante

Input:

- altura fixa por tamanho
- espacamento interno padronizado
- estados (`default/focus/error/disabled`) consistentes

Card:

- padding interno padrao
- radius tokenizado
- separacao entre header/body/footer por tokens

Entregavel:

- Biblioteca interna coerente sem overrides locais frequentes.

## Fase 4 - Governanca (2-3 dias)

Objetivo: impedir regressao de consistencia.

### 4.1 Lint de estilos

Adicionar regras para bloquear valores hardcoded fora da escala, por exemplo:

- `margin: 13px`
- `border-radius: 7px`
- `font-size: 15px`

Abordagens:

1. `stylelint` com plugin de valores permitidos.
2. ESLint custom em inline styles/JS objects.

### 4.2 Checklist de PR obrigatorio

Criar arquivo:

- `.github/pull_request_template.md` (ou atualizar)

Itens:

1. Usei somente tokens de spacing/radius/typography.
2. Tela respeita `AppShell` e `PageContainer`.
3. Nao adicionei valores visuais hardcoded fora da escala.
4. Revisei desktop e mobile.
5. Anexei screenshot antes/depois.

### 4.3 Testes visuais

- Adotar screenshot diff para telas-chave (Playwright).
- Bloquear merge quando delta visual nao aprovado.

Entregavel:

- Processo de qualidade visual repetivel.

## Fase 5 - Rollout progressivo (1-2 sprints)

Objetivo: migrar as telas sem travar entrega de features.

Ordem sugerida:

1. Dashboard
2. Contatos (lista/kanban)
3. Vendas/Funil
4. Mensagens
5. Integracoes
6. Configuracoes

Estrategia:

1. Migrar por rota, nao por arquivo isolado.
2. Evitar refatoracao massiva de uma vez.
3. Garantir captura de antes/depois por rota.

## Definition of Done (DoD)

Uma tela migrada so e considerada concluida quando:

1. Usa `AppShell` + `PageContainer`.
2. 100% de spacing/radius/tipografia vem de tokens.
3. Nao possui hardcoded fora da escala.
4. Passa no checklist de PR.
5. Screenshot diff aprovado.

## Metricas de sucesso

1. Reducao de valores hardcoded de estilo nas views (meta: -70%).
2. Reducao de bugs visuais em QA (meta: -50%).
3. Tempo de implementacao de nova tela menor (meta: -25%).
4. Aumento da nota interna de consistencia visual (escala 1-5, meta: >=4).

## Riscos e mitigacoes

Risco 1: time continuar usando estilo ad-hoc em features urgentes.

- Mitigacao: lint + template de PR + code review com gate.

Risco 2: regressao visual em telas antigas.

- Mitigacao: rollout por rota + screenshot diff.

Risco 3: quebra de produtividade no inicio.

- Mitigacao: comecar por componentes base e telas de maior trafego.

## Backlog executavel (tickets sugeridos)

1. `UI-001` Criar tokens globais (`tokens.css` + import global)
2. `UI-002` Criar `AppShell` e `PageContainer`
3. `UI-003` Refatorar `Button` para tokens
4. `UI-004` Refatorar `Input` para tokens
5. `UI-005` Refatorar `Card` e `SectionHeader`
6. `UI-006` Migrar Dashboard para novo shell
7. `UI-007` Migrar Contatos (lista/kanban)
8. `UI-008` Adicionar lint para valores visuais permitidos
9. `UI-009` Adicionar checklist de PR e screenshot diff
10. `UI-010` Relatorio de metricas de consistencia apos sprint

## Ordem de execucao recomendada

Semana 1:

1. Fase 0 e Fase 1
2. Inicio da Fase 2

Semana 2:

1. Concluir Fase 2
2. Fase 3 (Button/Input/Card)

Semana 3:

1. Fase 4 (governanca)
2. Inicio Fase 5 (Dashboard + Contatos)

Semana 4:

1. Fase 5 restante
2. Medicao de metricas e ajustes

## Conclusao

O caminho para atingir o nivel de simetria percebido na Attio e: sistema + disciplina.

Este plano transforma isso em execucao concreta para o AdsMagic, com entregas incrementais, baixo risco e governanca para manter consistencia no longo prazo.
