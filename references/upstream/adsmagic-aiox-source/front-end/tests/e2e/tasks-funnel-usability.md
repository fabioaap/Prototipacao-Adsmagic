# Tasks: Settings Funnel Usability Testing

**Input**: Página de configuração do funil em `/pt/projects/mock-project-001/settings/funnel`
**Prerequisites**: Playwright configurado, aplicação rodando em localhost:5173/5174, mocks ativos

**Tests**: Teste de usabilidade completo contemplando todas as funcionalidades da página de configuração do funil

**Organization**: Tasks organizadas por user story para implementação e teste independente de cada funcionalidade.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode executar em paralelo (arquivos diferentes, sem dependências)
- **[Story]**: User story ao qual a task pertence (US1, US2, US3, US4)
- Caminhos exatos incluídos nas descrições

## Path Conventions

- **Frontend**: `front-end/tests/e2e/`
- **Helpers**: `front-end/tests/e2e/helpers/`
- **Configuração**: `front-end/playwright.config.ts`

---

## Phase 1: Setup (Infraestrutura Compartilhada)

**Purpose**: Inicialização do projeto de teste e estrutura básica

- [x] T001 ✅ Criar estrutura de teste em `front-end/tests/e2e/settings-funnel-usability.spec.ts`
- [x] T002 ✅ Configurar imports e helpers necessários (navigation.ts)
- [x] T003 [P] ✅ Definir constantes e configuração base do teste

---

## Phase 2: Foundational (Pré-requisitos Bloqueantes)

**Purpose**: Infraestrutura core que DEVE estar completa antes de qualquer user story

**⚠️ CRITICAL**: Nenhum trabalho de user story pode começar até esta fase estar completa

- [ ] T004 Validar que aplicação está rodando em localhost:5173 ou 5174
- [ ] T005 [P] Verificar que mocks estão ativos (VITE_USE_MOCK=true)
- [ ] T006 [P] Confirmar que projeto mock-project-001 existe e é acessível
- [ ] T007 Configurar interceptação de console errors para todos os testes
- [ ] T008 Setup de beforeEach para navegação e estado inicial
- [ ] T009 Verificar que página de funnel carrega sem erros críticos

**Checkpoint**: Foundation pronta - implementação de user stories pode começar em paralelo

---

## Phase 3: User Story 1 - Visualizar Etapas do Funil (Priority: P1) 🎯 MVP

**Goal**: Usuário pode ver as etapas do funil em duas visões diferentes (principal e Kanban)

**Independent Test**: Carregar página e verificar se todas as etapas são exibidas corretamente

### Tests for User Story 1 ⚠️

> **NOTE: Estes testes devem FALHAR antes da implementação estar completa**

- [x] T010 [P] [US1] ✅ Teste de exibição da visão principal em `settings-funnel-usability.spec.ts`
- [x] T011 [P] [US1] ✅ Teste de alternância para visão Kanban em `settings-funnel-usability.spec.ts`

### Implementation for User Story 1

- [ ] T012 [P] [US1] Validar elementos principais da interface (título, seções, etapas)
- [ ] T013 [P] [US1] Verificar etapas padrão obrigatórias (Contato Iniciado, Venda, Perdida)
- [ ] T014 [US1] Implementar verificação de tipos de etapa (Normal, Venda, Perdida)
- [ ] T015 [US1] Testar botão "Ver Kanban" e possível mudança de visão
- [ ] T016 [US1] Verificar informações detalhadas de cada etapa (descrição, rastreamento)
- [ ] T017 [US1] Validar contador de etapas configuradas

**Checkpoint**: User Story 1 deve estar funcionalmente completa e testável independentemente

---

## Phase 4: User Story 2 - Criar Etapas (Priority: P2)

**Goal**: Usuário pode criar novas etapas no funil através de diferentes métodos

**Independent Test**: Criar uma nova etapa e verificar se ela aparece na lista

### Tests for User Story 2 ⚠️

- [x] T018 [P] [US2] ✅ Teste de criação via botão "Nova etapa" em `settings-funnel-usability.spec.ts`
- [x] T019 [P] [US2] ✅ Teste de criação via botão "Adicionar Etapa" em `settings-funnel-usability.spec.ts`

### Implementation for User Story 2

- [ ] T020 [P] [US2] Implementar teste de abertura de modal/formulário de criação
- [ ] T021 [US2] Testar preenchimento de campos (nome, descrição, tipo)
- [ ] T022 [US2] Implementar submissão de formulário e validação
- [ ] T023 [US2] Verificar que nova etapa aparece na lista após criação
- [ ] T024 [US2] Testar validação de campos obrigatórios
- [ ] T025 [US2] Validar regras de negócio (apenas 1 venda, 1 perdida)

**Checkpoint**: User Stories 1 E 2 devem funcionar independentemente

---

## Phase 5: User Story 3 - Deletar Etapas (Priority: P2)

**Goal**: Usuário pode deletar etapas não críticas, com proteções adequadas

**Independent Test**: Tentar deletar etapa removível e verificar confirmação

### Tests for User Story 3 ⚠️

- [x] T026 [P] [US3] ✅ Teste de identificação de botões de delete em `settings-funnel-usability.spec.ts`
- [x] T027 [P] [US3] ✅ Teste de proteção de etapas críticas em `settings-funnel-usability.spec.ts`
- [x] T028 [P] [US3] ✅ Teste de deleção de etapas permitidas em `settings-funnel-usability.spec.ts`

### Implementation for User Story 3

- [ ] T029 [P] [US3] Implementar verificação de botões de delete habilitados/desabilitados
- [ ] T030 [US3] Testar proteção de "Contato Iniciado" (não pode ser deletada)
- [ ] T031 [US3] Testar proteção de etapas de "Venda" e "Perdida"
- [ ] T032 [US3] Implementar teste de confirmação de deleção (modal/dialog)
- [ ] T033 [US3] Testar cancelamento de deleção
- [ ] T034 [US3] Verificar que etapas com contatos não podem ser deletadas

**Checkpoint**: User Stories 1, 2 E 3 devem funcionar independentemente

---

## Phase 6: User Story 4 - Mover/Reordenar Etapas (Priority: P3)

**Goal**: Usuário pode reordenar etapas através de drag and drop

**Independent Test**: Arrastar uma etapa e verificar nova posição

### Tests for User Story 4 ⚠️

- [x] T035 [P] [US4] ✅ Teste de drag and drop para reordenação em `settings-funnel-usability.spec.ts`
- [x] T036 [P] [US4] ✅ Teste de indicadores visuais de reordenação em `settings-funnel-usability.spec.ts`

### Implementation for User Story 4

- [ ] T037 [P] [US4] Implementar identificação de elementos arrastáveis
- [ ] T038 [US4] Testar funcionalidade de drag and drop entre etapas
- [ ] T039 [US4] Verificar atualização da ordem após movimentação
- [ ] T040 [US4] Testar indicadores visuais (ícones de grip, cursor)
- [ ] T041 [US4] Validar que texto explicativo está presente
- [ ] T042 [US4] Verificar persistência da nova ordem

**Checkpoint**: Todas as user stories devem estar independentemente funcionais

---

## Phase 7: Funcionalidades Auxiliares (Priority: P3)

**Goal**: Testar funcionalidades de suporte (exportar, importar, templates)

### Tests for Auxiliary Features ⚠️

- [x] T043 [P] [AUX] ✅ Teste de funcionalidade de exportar em `settings-funnel-usability.spec.ts`
- [x] T044 [P] [AUX] ✅ Teste de funcionalidade de importar em `settings-funnel-usability.spec.ts`
- [x] T045 [P] [AUX] ✅ Teste de templates de funil em `settings-funnel-usability.spec.ts`
- [x] T046 [P] [AUX] ✅ Teste de regras e validações em `settings-funnel-usability.spec.ts`

### Implementation for Auxiliary Features

- [ ] T047 [P] [AUX] Implementar teste completo de exportação (download, formato)
- [ ] T048 [P] [AUX] Implementar teste de importação (upload, parsing, aplicação)
- [ ] T049 [P] [AUX] Testar abertura e seleção de templates
- [ ] T050 [P] [AUX] Verificar todas as regras de negócio exibidas
- [ ] T051 [P] [AUX] Testar funcionalidade "Ver Kanban" completamente

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Melhorias que afetam múltiplas user stories

- [x] T052 [P] ✅ Teste de performance de carregamento em `settings-funnel-usability.spec.ts`
- [x] T053 [P] ✅ Teste de acessibilidade em `settings-funnel-usability.spec.ts`
- [x] T054 [P] ✅ Validação de integridade geral em `settings-funnel-usability.spec.ts`
- [ ] T055 Code cleanup e refatoração de testes
- [ ] T056 Documentação adicional de casos de teste
- [ ] T057 [P] Testes de edge cases e cenários de erro
- [ ] T058 Otimização de performance dos testes
- [ ] T059 Validação de segurança (XSS, injection prevention)
- [ ] T060 Executar validação completa do quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: ✅ COMPLETO - Sem dependências
- **Foundational (Phase 2)**: Depende de Setup - BLOQUEIA todas user stories
- **User Stories (Phase 3+)**: Todas dependem da conclusão da Phase 2
  - User stories podem proceder em paralelo (se houver pessoal)
  - Ou sequencialmente por ordem de prioridade (P1 → P2 → P3)
- **Polish (Fase Final)**: Depende de todas as user stories desejadas estarem completas

### User Story Dependencies

- **User Story 1 (P1)**: Pode começar após Foundational - Sem dependências de outras stories
- **User Story 2 (P2)**: Pode começar após Foundational - Pode integrar com US1
- **User Story 3 (P2)**: Pode começar após Foundational - Pode integrar com US1/US2
- **User Story 4 (P3)**: Pode começar após Foundational - Pode integrar com US1/US2/US3

### Dentro de Cada User Story

- Tests DEVEM falhar antes da implementação estar completa
- Implementação antes de integração
- Validação independente antes de mover para próxima prioridade

### Oportunidades Paralelas

- Todos os tasks Setup marcados [P] podem executar em paralelo ✅
- Todos os tasks Foundational marcados [P] podem executar em paralelo (dentro da Phase 2)
- Uma vez que Phase Foundational complete, todas as user stories podem começar em paralelo
- Todos os tests para uma user story marcados [P] podem executar em paralelo
- User stories diferentes podem ser trabalhadas em paralelo por membros diferentes da equipe

---

## Parallel Example: User Story 1

```bash
# Lançar todos os tests para User Story 1 juntos:
Task: "Teste de exibição da visão principal"
Task: "Teste de alternância para visão Kanban"

# Lançar todas as implementações para User Story 1 juntos:
Task: "Validar elementos principais da interface"
Task: "Verificar etapas padrão obrigatórias"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. ✅ Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - bloqueia todas as stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Testar User Story 1 independentemente
5. Deploy/demo se pronto

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Adicionar User Story 1 → Testar independentemente → Deploy/Demo (MVP!)
3. Adicionar User Story 2 → Testar independentemente → Deploy/Demo
4. Adicionar User Story 3 → Testar independentemente → Deploy/Demo
5. Adicionar User Story 4 → Testar independentemente → Deploy/Demo
6. Cada story adiciona valor sem quebrar stories anteriores

### Parallel Team Strategy

Com múltiplos desenvolvedores:

1. Team completa Setup + Foundational juntos
2. Uma vez que Foundational está pronto:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
   - QA Engineer: User Story 4 + Polish
3. Stories completam e integram independentemente

---

## Execution Commands

### Executar todos os testes:
```bash
cd front-end
npx playwright test tests/e2e/settings-funnel-usability.spec.ts
```

### Executar testes específicos por user story:
```bash
# User Story 1 - Visualização
npx playwright test -g "US1"

# User Story 2 - Criação  
npx playwright test -g "US2"

# User Story 3 - Deleção
npx playwright test -g "US3"

# User Story 4 - Reordenação
npx playwright test -g "US4"

# Funcionalidades Auxiliares
npx playwright test -g "Deve permitir exportar|Deve permitir importar|Deve exibir templates"

# Performance e Acessibilidade
npx playwright test -g "Performance e Acessibilidade"
```

### Executar com debug:
```bash
npx playwright test --debug tests/e2e/settings-funnel-usability.spec.ts
```

### Executar com UI (headed):
```bash
npx playwright test --headed tests/e2e/settings-funnel-usability.spec.ts
```

---

## Notes

- ✅ **COMPLETED**: Tasks marcadas foram implementadas no arquivo de teste
- [P] tasks = arquivos diferentes, sem dependências
- [Story] label mapeia task para user story específica para rastreabilidade  
- Cada user story deve ser independentemente completável e testável
- Verificar que tests falham antes de implementar
- Commit após cada task ou grupo lógico
- Parar em qualquer checkpoint para validar story independentemente
- Evitar: tasks vagas, conflitos no mesmo arquivo, dependências cross-story que quebram independência

---

## Status Report

### ✅ Completed (Phase 1 + Tests Structure)
- Estrutura completa de teste criada
- Todos os casos de teste mapeados e implementados
- Organização por user stories definida  
- Performance e acessibilidade incluídos

### 🔄 In Progress (Phase 2)
- Validação de pré-requisitos da aplicação
- Setup de interceptação de console errors
- Configuração de estado inicial

### ⏳ Pending (Phases 3-8)
- Execução e validação dos testes implementados
- Refinamento baseado em resultados dos testes
- Implementação de melhorias identificadas
- Documentação de casos de edge encontrados

### 🎯 Next Action
Executar `npx playwright test tests/e2e/settings-funnel-usability.spec.ts` para validar implementação atual e identificar ajustes necessários.