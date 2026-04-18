# Etapas de Implementação - Frontend

> **Objetivo**: Guia detalhado de implementação seguindo SOLID, Clean Code, TypeScript strict e boas práticas  
> **Filosofia**: Cada etapa deve ser testável, rollbackável e não quebrar funcionalidades existentes  
> **Atualizado**: 2026-01-16 (com dependências do backend identificadas via Supabase MCP)

---

## 🔗 Dependências do Backend

### Edge Functions Disponíveis
- ✅ `projects`, `companies`, `contacts`, `sales`, `integrations`, `dashboard`, `messaging`

### Edge Functions Faltantes (Backend precisa implementar)
- ❌ `origins` - CRUD de origens (Settings)
- ❌ `stages` - CRUD de estágios (Funnel)
- ❌ `trackable-links` - Sistema de links (Tracking)
- ❌ `events` - Conversões (Events)
- ❌ `tags` - Categorização de contatos

### Tipos do Supabase
- ⚠️ `origins` e `stages` não estão nos tipos gerados
- **Solução temporária**: Usar tipos manuais no frontend
- **Solução definitiva**: Backend regenerar tipos via MCP

> **Documentação Backend**: Ver `back-end/TODO_BACKEND.md` e `back-end/ETAPAS_BACKEND.md`

---

## 📋 Índice

1. [Etapa 0: Alinhamento de Contratos](#etapa-0-alinhamento-de-contratos)
2. [Etapa 1: Build Estável e Qualidade Mínima](#etapa-1-build-estável-e-qualidade-mínima)
3. [Etapa 2: Integrações Reais por Módulo](#etapa-2-integrações-reais-por-módulo)
4. [Etapa 3: UX, Estados e Acessibilidade](#etapa-3-ux-estados-e-acessibilidade)
5. [Etapa 4: Testes Mínimos por Módulo](#etapa-4-testes-mínimos-por-módulo)
6. [Etapa 5: Deploy e Rollback Seguro](#etapa-5-deploy-e-rollback-seguro)
7. [Etapa 6: Finalização e Hardening](#etapa-6-finalização-e-hardening)

---

## Etapa 0: Alinhamento de Contratos

### 🎯 Objetivo
Garantir que contratos de dados (schemas, types) estão alinhados com backend e não quebrar funcionalidades existentes.

### 📋 Checklist

#### 0.1 Inventário de Contratos
- [ ] Mapear todos os schemas Zod em `/src/schemas`
- [ ] Mapear todos os tipos TypeScript em `/src/types`
- [ ] Listar todos os adapters em `/src/services/adapters`
- [ ] Documentar contratos atuais (quais campos existem, quais são opcionais)

#### 0.2 Verificação de Consistência
- [ ] Validar que schemas Zod correspondem aos tipos TypeScript
- [ ] Verificar que adapters mapeiam corretamente dados backend → frontend
- [ ] Identificar divergências entre tipos e uso real no código

#### 0.3 Tipos do Supabase
- [ ] Gerar tipos atualizados do Supabase (se possível) ou criar tipos manuais
- [ ] Validar que tabelas `origins` e `stages` estão nos tipos
- [ ] Verificar que campos usados no frontend existem nos tipos do Supabase
- [ ] Documentar campos que precisam ser adicionados ao backend (se necessário)

#### 0.4 Versionamento
- [ ] Decidir estratégia de versionamento de contratos (ex: v1, v2)
- [ ] Criar seção "Contratos" no CHANGELOG
- [ ] Documentar processo de atualização de contratos sem breaking changes

#### 0.5 Adapters
- [ ] Revisar todos os adapters para garantir mapeamento correto
- [ ] Validar que adapters lidam com campos opcionais/null corretamente
- [ ] Testar adapters com dados reais do backend (staging)

### 🔒 Regras de Segurança
- **Não alterar campos existentes sem criar nova versão do contrato**
- **Atualizar adapters, tipos e testes antes de alterar contratos**
- **Documentar mudanças no CHANGELOG**

### ✅ Critérios de Sucesso
- [ ] Todos os tipos estão alinhados com schemas
- [ ] Tipos do Supabase incluem `origins` e `stages`
- [ ] Adapters testados com dados reais
- [ ] CHANGELOG atualizado

---

## Etapa 1: Build Estável e Qualidade Mínima

### 🎯 Objetivo
Eliminar todos os erros de TypeScript e garantir que build passa em produção.

### 📋 Checklist

#### 1.1 Correção de Erros TypeScript
- [ ] **TS6133 (Unused)**: Remover ou usar variáveis/imports não utilizados
  - [ ] EventsList.vue: `Search`, `Eye`, `RefreshCw`, `Input`
  - [ ] ProjectsTable.vue: `cn`
  - [ ] SaleLostModal.vue: `Alert`
  - [ ] SalesFollowUpAlert.vue: `Skeleton`
  - [ ] SalesFunnelChart.vue: `CardDescription`
  - [ ] SalesList.vue: `Eye`, `Button`
  - [ ] LinkFormModal.vue: `t` (se não usado)
  - [ ] LinksList.vue: `BarChart3`
  - [ ] TrackingMetrics.vue: `cn`
  - [ ] SearchInput.vue: `cn`
  - [ ] Stores: `PaginatedResponse` não usado
- [ ] **TS2304 (Not Defined)**: Declarar variáveis faltantes
  - [ ] EventsList.vue: `expandedGroups` (ref reativo ou store)
- [ ] **TS2339 (Property Does Not Exist)**: Adicionar propriedades aos tipos
  - [ ] ProjectsTable.vue: `investment`, `revenue`, `contacts_count`, `sales_count`, `conversion_rate`, `average_ticket` em tipo `Project`
  - [ ] stages.ts: `display_order` no tipo retornado
- [ ] **TS2307 (Cannot Find Module)**: Corrigir imports
  - [ ] SearchInput.stories.ts: `@storybook/vue3` (corrigir ou remover)
- [ ] **TS2769/TS2352 (Type Mismatch)**: Corrigir tipos
  - [ ] origins.ts: Tabela `origins` não existe nos tipos do Supabase
  - [ ] stages.ts: Tabela `stages` não existe nos tipos do Supabase
  - [ ] origins.ts: Conversões de tipo (usar `unknown` primeiro se necessário)

#### 1.2 Implementação ou Remoção de Funções
- [ ] EventsList.vue: Implementar ou remover funções não usadas:
  - [ ] `toggleGroup`, `isGroupExpanded`, `expandAllGroups`, `collapseAllGroups`
  - [ ] `getEventIcon`, `getEntityLabel`, `getStatusIcon`
  - [ ] `handleViewDetails`, `handleRetry`, `handleExport`, `handlePageChange`
- [ ] SalesList.vue: Implementar ou remover `handleViewDetails`
- [ ] SalesFollowUpAlert.vue: Implementar ou remover `getUrgencyColor`

#### 1.3 Validação de Build
- [ ] Executar `pnpm typecheck` localmente
- [ ] Verificar que não há erros TypeScript
- [ ] Executar `pnpm lint` e corrigir warnings
- [ ] Executar `pnpm build` e validar que passa

#### 1.4 Integração Contínua
- [ ] Validar que CI executa `pnpm typecheck && pnpm lint && pnpm test && pnpm build`
- [ ] Garantir que CI bloqueia PRs com erros TypeScript
- [ ] Configurar alertas para falhas de build

### 🔒 Regras de Segurança
- **Não usar `@ts-ignore` sem justificativa documentada**
- **Evitar `any` - usar `unknown` quando tipo é desconhecido**
- **TypeScript strict deve estar habilitado**

### ✅ Critérios de Sucesso
- [ ] `pnpm typecheck` passa sem erros
- [ ] `pnpm lint` passa sem warnings novos
- [ ] `pnpm build` completa com sucesso
- [ ] CI passa em todas as etapas

---

## Etapa 2: Integrações Reais por Módulo

### 🎯 Objetivo
Garantir que todos os módulos usam `apiClient` e removem dependências de mocks.

### 📋 Checklist

#### 2.1 Auditoria de Integrações
- [ ] Buscar por chamadas diretas a `fetch`, `axios`, `supabase-js` em views/stores
- [ ] Listar módulos que ainda usam mocks
- [ ] Identificar módulos que criam instâncias próprias de HTTP client

#### 2.2 Migração para apiClient
- [ ] **Auth**: Validar que usa `apiClient`
- [ ] **Onboarding**: Validar que usa `apiClient`
- [ ] **Projects**: Migrar para `apiClient` se necessário
- [ ] **Contacts**: Migrar para `apiClient` se necessário
- [ ] **Events**: Migrar para `apiClient` se necessário
- [ ] **Sales**: Migrar para `apiClient` se necessário
- [ ] **Integrations**: Migrar para `apiClient` se necessário
- [ ] **Tracking**: Migrar para `apiClient` se necessário
- [ ] **Settings (Origins/Stages)**: Migrar para `apiClient` se necessário
- [ ] **Dashboard**: Migrar para `apiClient` se necessário

#### 2.3 Tratamento de Erros
- [ ] Implementar tratamento consistente de timeout (padrão: 10s)
- [ ] Garantir que erros 4xx são tratados com mensagens amigáveis
- [ ] Garantir que erros 5xx são tratados com mensagens genéricas
- [ ] Implementar retry logic para operações críticas (configurável)

#### 2.4 Remoção de Mocks
- [ ] Identificar uso de mocks em produção
- [ ] Remover mocks ou movê-los apenas para testes
- [ ] Validar que aplicação funciona sem mocks

#### 2.5 Validação de Endpoints
- [ ] Listar todos os endpoints usados
- [ ] Validar que endpoints existem no backend
- [ ] Testar endpoints em staging
- [ ] Documentar endpoints não disponíveis

### 🔒 Regras de Segurança
- **Nenhum `fetch`, `axios`, ou `supabase-js` deve ser chamado diretamente em views/stores**
- **Todos os erros devem ser tratados com UX apropriada**
- **Timeouts devem ser configuráveis por endpoint**

### ✅ Critérios de Sucesso
- [ ] Todos os módulos usam `apiClient`
- [ ] Não há chamadas diretas a `fetch`/`axios`/`supabase-js` em views/stores
- [ ] Erros são tratados consistentemente
- [ ] Mocks removidos de produção

---

## Etapa 3: UX, Estados e Acessibilidade

### 🎯 Objetivo
Garantir que todas as telas cobrem estados necessários e são acessíveis.

### 📋 Checklist

#### 3.1 Estados por Tela
- [ ] **Loading**: Implementar skeleton loaders ou spinners
  - [ ] Auth (login, register, etc.)
  - [ ] Dashboard
  - [ ] Projects
  - [ ] Contacts
  - [ ] Events
  - [ ] Sales
  - [ ] Integrations
  - [ ] Tracking
  - [ ] Settings
- [ ] **Empty**: Implementar empty states com CTAs claros
  - [ ] Dashboard (sem dados)
  - [ ] Projects (sem projetos)
  - [ ] Contacts (sem contatos)
  - [ ] Events (sem eventos)
  - [ ] Sales (sem vendas)
- [ ] **Error**: Implementar tratamento de erro amigável
  - [ ] Mensagens amigáveis (não expor detalhes técnicos)
  - [ ] Ações para recuperação (tentar novamente, voltar)
  - [ ] Logs técnicos apenas no console
- [ ] **Success**: Implementar feedback de sucesso
  - [ ] Toasts para ações bem-sucedidas
  - [ ] Confirmações visuais

#### 3.2 Acessibilidade (A11y)
- [ ] **Labels**: Garantir que todos os inputs têm `label` associado
  - [ ] Usar `for` attribute ou `aria-labelledby`
  - [ ] Validar que labels são descritivos
- [ ] **ARIA**: Adicionar attributes onde necessário
  - [ ] `aria-describedby` para descrições
  - [ ] `aria-invalid` para campos com erro
  - [ ] `aria-required` para campos obrigatórios
  - [ ] `aria-live` para atualizações dinâmicas
- [ ] **Foco**: Gerenciar foco adequadamente
  - [ ] Trap focus em modais/drawers
  - [ ] Restaurar foco ao fechar modais
  - [ ] Foco inicial em primeiro campo de formulários
  - [ ] Foco em mensagens de erro ao submitar
- [ ] **Navegação por Teclado**: Validar navegação
  - [ ] Tab/Shift+Tab funciona em todos os elementos interativos
  - [ ] Enter/Space ativa botões
  - [ ] Escape fecha modais/drawers
  - [ ] Arrow keys navegam em listas (se aplicável)
- [ ] **Indicadores Visuais**: Não depender apenas de cor
  - [ ] Adicionar ícones para estados de sucesso/erro
  - [ ] Adicionar texto para indicadores de status
  - [ ] Validar contraste de cores (WCAG AA mínimo)

#### 3.3 Feedback de Progresso
- [ ] Implementar skeleton loaders para requests longos
- [ ] Adicionar progress bars para operações com duração conhecida
- [ ] Mostrar indicadores de carregamento incremental (paginação)

#### 3.4 Validação de Formulários
- [ ] Implementar validação com Zod schemas
- [ ] Exibir erros inline (próximo ao campo)
- [ ] Mensagens de erro amigáveis e específicas
- [ ] Validar antes de submit (prevenir requests inválidos)

### 🔒 Regras de Segurança
- **Toda tela deve cobrir estados: loading, empty, error, success**
- **Inputs devem ter labels e aria-* attributes**
- **Indicadores não devem depender apenas de cor**

### ✅ Critérios de Sucesso
- [ ] Todas as telas têm estados loading/empty/error/success
- [ ] Todos os inputs têm labels associados
- [ ] Navegação por teclado funciona
- [ ] Contraste de cores atende WCAG AA

---

## Etapa 4: Testes Mínimos por Módulo

### 🎯 Objetivo
Garantir coverage mínimo de testes para código crítico.

### 📋 Checklist

#### 4.1 Testes Unitários - Adapters
- [ ] **ProjectAdapter**: Teste com dados válidos e inválidos
- [ ] **ProjectWizardAdapter**: Teste com dados válidos e inválidos
- [ ] **SaleAdapter**: Teste com dados válidos e inválidos
- [ ] **ContactsAdapter**: Teste com dados válidos e inválidos
- [ ] **SalesAdapter**: Teste com dados válidos e inválidos
- [ ] **IntegrationAdapter**: Teste com dados válidos e inválidos
- [ ] **LinkAdapter**: Teste com dados válidos e inválidos

#### 4.2 Testes Unitários - Composables
- [ ] **useProjectNavigation**: Teste de navegação
- [ ] **useAuth**: Teste de autenticação
- [ ] **useApi**: Teste de chamadas API
- [ ] Composables críticos identificados

#### 4.3 Testes de Componente
- [ ] **LoginView**: Loading → sucesso, loading → erro, empty
- [ ] **DashboardV2View**: Loading → sucesso, loading → erro, empty
- [ ] **ProjectsView**: Loading → sucesso, loading → erro, empty
- [ ] **ContactsView**: Loading → sucesso, loading → erro, empty
- [ ] **SalesView**: Loading → sucesso, loading → erro, empty

#### 4.4 Testes E2E - Fluxos Críticos
- [ ] **Login**: Login com credenciais válidas
- [ ] **Registro**: Registro de novo usuário
- [ ] **Criação de Projeto**: Fluxo completo do wizard
- [ ] **Dashboard**: Carregamento e interação básica

#### 4.5 Mocking
- [ ] Validar que mocks funcionam corretamente
- [ ] Garantir que mocks não interferem uns nos outros
- [ ] Testar edge cases (timeout, erro de rede, dados inválidos)

#### 4.6 Coverage
- [ ] Configurar coverage mínimo de 70% para código crítico
- [ ] Validar que coverage não diminui em PRs
- [ ] Documentar exceções de coverage (se necessário)

### 🔒 Regras de Segurança
- **Não mockar implementações, mockar comportamentos**
- **Testes devem ser isolados (não dependem uns dos outros)**

### ✅ Critérios de Sucesso
- [ ] Adapters críticos têm testes unitários
- [ ] Composables críticos têm testes unitários
- [ ] Views críticas têm testes de componente
- [ ] Fluxos críticos têm testes E2E
- [ ] Coverage mínimo de 70% em código crítico

---

## Etapa 5: Deploy e Rollback Seguro

### 🎯 Objetivo
Garantir que deploy é seguro e rollback é fácil.

### 📋 Checklist

#### 5.1 Configuração de Build
- [ ] Validar comando de build no Cloudflare: `pnpm install && pnpm build`
- [ ] Garantir que `pnpm build` inclui typecheck (`vue-tsc -b`)
- [ ] Validar diretório de output: `dist`
- [ ] Validar diretório raiz: `front-end`

#### 5.2 Wrangler Config
- [ ] Corrigir `wrangler.toml` ou remover se não usado
- [ ] Se usado, adicionar `pages_build_output_dir = "dist"`
- [ ] Validar que configuração está correta

#### 5.3 Variáveis de Ambiente
- [ ] Documentar variáveis de ambiente em `.env.example`
- [ ] Validar que variáveis estão configuradas no Cloudflare
- [ ] Garantir que secrets não são expostos

#### 5.4 Rollback Plan
- [ ] Documentar processo de rollback (como restaurar versão anterior)
- [ ] Testar rollback em staging
- [ ] Criar checklist de rollback para cada release

#### 5.5 Observabilidade
- [ ] Configurar logs para detectar erros em produção
- [ ] Validar que logs não expõem PII
- [ ] Implementar monitoramento de erros (ex: Sentry, se aplicável)

#### 5.6 Validação Pós-Deploy
- [ ] Checklist de validação após deploy
- [ ] Testar funcionalidades críticas em produção
- [ ] Validar que build funciona corretamente

### 🔒 Regras de Segurança
- **Rollback deve ser documentado e testável**
- **Logs não devem expor PII ou secrets**

### ✅ Critérios de Sucesso
- [ ] Build funciona no Cloudflare
- [ ] Rollback plan documentado e testado
- [ ] Variáveis de ambiente configuradas
- [ ] Observabilidade básica implementada

---

## Etapa 6: Finalização e Hardening

### 🎯 Objetivo
Garantir segurança, performance e qualidade final.

### 📋 Checklist

#### 6.1 Segurança
- [ ] Validar que tokens nunca são expostos em logs ou URLs
- [ ] Garantir que senhas não são expostas em nenhum momento
- [ ] Validar sanitização de HTML (DOMPurify) onde necessário
- [ ] Verificar que `eval`, `new Function`, `setTimeout` com string não são usados
- [ ] Validar que rate limiting está implementado (frontend e backend)

#### 6.2 Performance
- [ ] Implementar debounce em buscas (300ms recomendado)
- [ ] Validar que paginação funciona corretamente
- [ ] Implementar virtualização para listas grandes (se necessário)
- [ ] Garantir que imagens são otimizadas (lazy loading, formatos adequados)
- [ ] Validar que código é minificado em produção

#### 6.3 Otimizações
- [ ] Implementar code splitting (lazy loading de rotas)
- [ ] Validar que bundles não são muito grandes
- [ ] Garantir que assets estáticos são cached
- [ ] Implementar service worker para cache offline (se aplicável)

#### 6.4 Documentação
- [ ] Atualizar README com instruções de setup
- [ ] Documentar estrutura de módulos
- [ ] Documentar APIs públicas (JSDoc)
- [ ] Atualizar CHANGELOG com todas as mudanças

#### 6.5 Validação Final
- [ ] Executar `pnpm typecheck && pnpm lint && pnpm test && pnpm build` localmente
- [ ] Testar fluxos críticos em staging
- [ ] Validar que não há warnings/erros em console
- [ ] Testar em diferentes navegadores (Chrome, Firefox, Safari)

### 🔒 Regras de Segurança
- **Secrets nunca devem ser commitados**
- **Inputs devem ser validados e sanitizados**

### ✅ Critérios de Sucesso
- [ ] Segurança validada
- [ ] Performance aceitável
- [ ] Documentação atualizada
- [ ] Validação final passou

---

## 🎯 Princípios Gerais de Implementação

### SOLID
- **SRP**: Cada classe/função/módulo tem UMA responsabilidade
- **OCP**: Entidades abertas para extensão, fechadas para modificação
- **LSP**: Subtipos substituíveis por tipos base
- **ISP**: Interfaces segregadas (não forçar dependências desnecessárias)
- **DIP**: Depender de abstrações, não de implementações concretas

### Clean Code
- **Nomenclatura**: Nomes descritivos e pronunciáveis
- **Funções**: Pequenas (máximo 20-30 linhas), fazem UMA coisa
- **Comentários**: Explicar PORQUÊ, não O QUÊ
- **DRY**: Não repetir código (extrair em funções/componentes)
- **KISS**: Prefira soluções simples
- **YAGNI**: Não implemente funcionalidades "por precaução"

### TypeScript
- **Type Safety**: Evitar `any`, usar `unknown` quando necessário
- **Types vs Interfaces**: Interfaces para contratos extensíveis, types para unions/intersections
- **Generics**: Usar para código reutilizável e type-safe
- **Utility Types**: Aproveitar Partial, Pick, Omit, Record, ReturnType

### Boas Práticas TypeScript
- **Strict Mode**: Sempre habilitado
- **Type Inference**: Deixar TypeScript inferir tipos quando possível
- **Type Assertions**: Usar com cuidado, preferir type guards
- **Enums**: Usar apenas quando necessário (prefira union types)
- **Optional Chaining**: Usar para acessar propriedades opcionais
- **Nullish Coalescing**: Usar `??` em vez de `||` para valores default

### Tratamento de Erros
- **Try-Catch Específico**: Tratar erros específicos, não genéricos
- **Custom Errors**: Criar erros customizados quando necessário
- **Result Type Pattern**: Usar para operações que podem falhar
- **Error Boundaries**: Implementar em componentes críticos

### Performance
- **Operações Paralelas**: Usar `Promise.all` quando possível
- **Memoization**: Cache cálculos caros
- **Lazy Loading**: Carregar apenas quando necessário
- **Virtualização**: Para listas grandes

### Segurança
- **Input Validation**: Sempre validar input do usuário (Zod)
- **Sanitização**: Sanitizar HTML, SQL, URLs
- **Secrets**: Nunca commitar secrets, usar variáveis de ambiente
- **Rate Limiting**: Implementar no frontend e backend

### Testes
- **Pirâmide**: Muitos unitários, alguns de integração, poucos E2E
- **AAA Pattern**: Arrange, Act, Assert
- **Mocking**: Mock comportamentos, não implementações
- **Coverage**: Mínimo 70% para código crítico

---

## 📝 Notas Finais

- **Cada etapa deve ser testável e rollbackável**
- **Não quebrar funcionalidades existentes**
- **TypeScript strict sempre habilitado**
- **Contratos versionados e documentados**
- **SOLID e Clean Code em todas as mudanças**

---

## 🔄 Workflow de Implementação

1. **Escolher módulo/etapa** do TODO_MODULOS.md
2. **Criar branch** com nome descritivo: `fix/projects-types` ou `feat/dashboard-integration`
3. **Implementar** seguindo checklist da etapa
4. **Testar** localmente: `pnpm typecheck && pnpm lint && pnpm test && pnpm build`
5. **Criar PR** com template preenchido (objetivo, escopo, testes, rollback)
6. **Code Review** verificando SOLID, Clean Code, TypeScript
7. **Merge** após aprovação e testes CI
8. **Deploy** para staging primeiro
9. **Validar** em staging
10. **Deploy** para produção se staging OK

---

## 📚 Referências

- [Clean Code](https://github.com/ryanmcdermott/clean-code-javascript)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [SOLID Principles](https://refactoring.guru/design-patterns/solid-principles)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Vue 3 Best Practices](https://vuejs.org/guide/best-practices/production-deployment.html)
