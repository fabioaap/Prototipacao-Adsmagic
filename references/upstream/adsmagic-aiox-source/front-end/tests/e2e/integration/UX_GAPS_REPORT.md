# Relatório de UX Gaps — Testes de Integração Playwright

**Projeto âncora:** Dra. Letícia Lopes  
**Data:** 2025-07  
**Suite:** 79 testes (73 passou + 5 pulados + 1 flaky)

---

## Resumo dos Gaps por Categoria

### 🔴 Críticos (bloqueiam ou confundem o usuário)

| ID | Descrição | Arquivo |
|---|---|---|
| **UX-SET-002** | Botão "Salvar" permanece **desabilitado mesmo após modificar o campo de nome** do projeto. O form usa "strict dirty check" — qualquer alteração deveria habilitar o botão. Gap de feedback crítico. | `settings.integration.spec.ts` |
| **UX-SET-003** | Campo obrigatório enviado vazio **não exibe erro inline antes do submit** — validação client-side ausente. O usuário não recebe feedback imediato. | `settings.integration.spec.ts` |
| **UX-SET-002** | O botão Salvar fica desabilitado antes de qualquer interação, **sem mensagem explicando o motivo** (ex: "Faça uma alteração para salvar"). | `settings.integration.spec.ts` |

---

### 🟠 Importantes (impactam UX notavelmente)

| ID | Descrição | Arquivo |
|---|---|---|
| **UX-CONT-007** | Página de Contatos tem **overflow horizontal no mobile** (scrollWidth=502 vs windowWidth=390). Elementos ou tabela saindo da tela. | `contacts.integration.spec.ts` |
| **UX-DASH-006** | Dashboard v2 tem **overflow horizontal no mobile** (scrollWidth=666 vs windowWidth=390). Cards ou gráficos extrapolam a tela. | `dashboard.integration.spec.ts` |
| **UX-SALE-006** | Tabela de Vendas tem **overflow horizontal no mobile** (scrollWidth=502 vs windowWidth=390). | `sales.integration.spec.ts` |
| **UX-SET-007** | Página de Settings tem **overflow horizontal no mobile** (scrollWidth=526 vs windowWidth=390). | `settings.integration.spec.ts` |
| **UX-PROJ-005** | Um botão na listagem de projetos **não tem `aria-label` nem texto acessível** — invisível para leitores de tela. Gap de acessibilidade. | `projects.integration.spec.ts` |

---

### 🟡 Moderados (degradam a experiência)

| ID | Descrição | Arquivo |
|---|---|---|
| **UX-CONT-003** | Botão de toggle para **visão Lista** (Kanban ↔ Lista) não foi encontrado com os seletores testados — pode ter been renomeado ou removido. | `contacts.integration.spec.ts` |
| **UX-CONT-004** | Campo de busca de contatos **não filtrou resultados nem exibiu empty state** com mensagem amigável ao buscar termo inexistente. | `contacts.integration.spec.ts` |
| **UX-CONT-005** | View Kanban **não renderizou colunas de etapa** detectáveis — a página pode estar abrindo em visão Lista por padrão, sem indicar ao usuário. | `contacts.integration.spec.ts` |
| **UX-CONT-006** | Botão "Novo contato" **não recebeu foco via TAB** nas primeiras iterações — navegação por teclado comprometida. | `contacts.integration.spec.ts` |
| **UX-DASH-005** | Ao **trocar o período no seletor do dashboard**, nenhuma nova requisição de rede foi detectada — possível que os dados não sejam recarregados. | `dashboard.integration.spec.ts` |
| **UX-SALE-004** | **Filtro de data** na página de Vendas não foi encontrado com seletores por placeholder/label — pode ter sido renomeado ou estar fora do viewport. | `sales.integration.spec.ts` |

---

### 🟢 Baixos / A investigar (podem ser seletores ou dados ausentes)

| ID | Descrição | Arquivo |
|---|---|---|
| **UX-SET-004** | Página de Funil (Settings → Funil) **não exibiu nenhuma etapa** e também não tem empty state com instrução para criar a primeira etapa. | `settings.integration.spec.ts` |
| **UX-SET-006** | Página de Origens (Settings → Origens) **não exibiu nenhuma origem** e também não tem empty state visível. | `settings.integration.spec.ts` |
| **UX-TRACK-004** | No formulário de criação de link rastreável, o **campo de URL não foi encontrado** — possivelmente o form usa outro label ou o elemento tem estrutura diferente. | `tracking.integration.spec.ts` |

---

## Resultado dos Testes

```
Running 79 tests using 1 worker

  ✓  5/5   auth-tests     (auth flows)
  ✓ 32/37  desktop-chrome (5 mobile-only skipped)
  ✓ 36/37  mobile-iphone  (1 flaky — UX-PROJ-002 passou no retry)
  -  5     skipped        (mobile-tagged tests no projeto desktop)

Total: 73 passou | 5 pulados | 1 flaky | 0 falhou definitivamente
```

### Teste Flaky

**`UX-PROJ-002` no mobile-iphone** — Falhou na 1ª tentativa (24.4s, timeout de 20s esgotado aguardando a lista carregar após loading), passou no retry (6.7s). É um problema de timing na renderização inicial no WebKit mobile. Pode ser corrigido aumentando o timeout de espera pós-loading ou adicionando um `waitForLoadState('networkidle')` extra.

---

## Ações Recomendadas

### Alta Prioridade
1. **[UX-SET-002]** Revisar lógica de "dirty check" no form de configurações do projeto — o botão Salvar deve habilitar ao detectar qualquer mudança no valor do campo.
2. **[Overflow mobile]** Auditar CSS em Contatos, Dashboard, Vendas e Settings para garantir que containers usam `overflow-x: hidden` ou que tabelas têm scroll horizontal (`overflow-x: auto`).
3. **[UX-PROJ-005]** Adicionar `aria-label` ao botão sem texto acessível na listagem de projetos.

### Média Prioridade
4. **[UX-CONT-004]** Verificar comportamento do filtro de busca — o empty state deve aparecer quando nenhum resultado é encontrado.
5. **[UX-DASH-005]** Depurar se a troca de período no dashboard está disparando novo fetch ou apenas reutilizando cache (confirmar com Network tab no DevTools).
6. **[UX-SET-003]** Adicionar validação inline (HTML5 `required` + mensagem de erro customizada) nos campos obrigatórios do form de settings.

### Baixa Prioridade
7. **[UX-CONT-003, UX-CONT-005]** Atualizar seletores dos testes para refletir a UI atual dos toggles de visão de contatos.
8. **[UX-SET-004, UX-SET-006]** Adicionar empty states com CTAs em Funil e Origens quando não há dados cadastrados.
9. **[UX-TRACK-004]** Atualizar seletor do campo URL no form de links rastreáveis.

---

*Gerado pelos testes Playwright em `front-end/tests/e2e/integration/`*
