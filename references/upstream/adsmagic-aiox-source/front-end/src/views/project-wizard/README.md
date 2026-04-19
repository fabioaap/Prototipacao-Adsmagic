# Project Wizard - Sistema de Progresso

## Visão Geral

O Project Wizard é um assistente guiado para criação de projetos que agora suporta salvamento de progresso no banco de dados, permitindo que usuários:

- Salvem progresso e continuem depois
- Abandonem wizard e configurem manualmente nas settings
- Retomem wizard de qualquer dispositivo
- Tenham múltiplos caminhos para ativar projetos

## Arquitetura

### Fluxo de Dados

```
Frontend (Store) ↔ Service Layer ↔ Adapter ↔ Backend (Supabase)
```

### Estados do Projeto

- **`draft`**: Projeto criado mas wizard incompleto
- **`active`**: Projeto ativo e configurado
- **`paused`**: Projeto pausado
- **`archived`**: Projeto arquivado

### Campos do Banco

- **`wizard_progress`** (JSONB): Dados do wizard serializados
- **`wizard_current_step`** (INTEGER): Etapa atual do wizard
- **`wizard_completed_at`** (TIMESTAMP): Quando wizard foi completado

## Componentes

### 1. ProjectWizardView.vue

**Responsabilidades:**
- Interface principal do wizard
- Navegação entre steps
- Salvamento de progresso
- Carregamento de rascunhos

**Métodos principais:**
- `handleSaveAndExit()`: Salva progresso e redireciona
- `handleComplete()`: Finaliza wizard
- `onMounted()`: Carrega dados iniciais

### 2. Store (projectWizard.ts)

**Estado:**
- `currentStep`: Etapa atual
- `projectData`: Dados do projeto
- `currentProjectId`: ID do projeto no banco
- `isSyncing`: Status de sincronização

**Métodos principais:**
- `saveToBackend()`: Salva no banco de dados
- `loadFromBackend()`: Carrega do banco de dados
- `reset()`: Reseta wizard para estado inicial

### 3. Service (projectWizardService.ts)

**Responsabilidades:**
- Comunicação com Supabase
- Operações CRUD de progresso
- Validações de negócio

**Métodos:**
- `saveProgress()`: Salva/atualiza progresso
- `loadProgress()`: Carrega progresso
- `completeWizard()`: Finaliza wizard
- `getDraftProjects()`: Lista projetos draft

### 4. Adapter (projectWizardAdapter.ts)

**Responsabilidades:**
- Conversão entre formatos
- Serialização/deserialização
- Validações de dados

**Métodos:**
- `toDatabase()`: Converte para formato do banco
- `fromDatabase()`: Converte do banco para store
- `validateWizardData()`: Valida dados
- `sanitizeProjectData()`: Limpa dados

## Fluxos de Uso

### 1. Criação Normal

```
Usuário inicia wizard → Preenche dados → Completa → Projeto ativo
```

### 2. Salvamento e Continuação

```
Usuário inicia wizard → Preenche parcialmente → "Salvar e sair" → 
Volta depois → Continua de onde parou → Completa → Projeto ativo
```

### 3. Configuração Manual

```
Usuário inicia wizard → "Salvar e sair" → Vai para settings → 
Configura manualmente → Projeto ativo (se critérios atendidos)
```

### 4. Modal de Continuação

```
Usuário clica em projeto draft → Modal aparece → 
Escolhe: Continuar wizard OU Ir para settings OU Ver dashboard
```

## Critérios de Ativação

Um projeto se torna `active` quando:

1. **Via Wizard Completo:**
   - Nome preenchido
   - Segmento selecionado
   - Pelo menos uma plataforma selecionada
   - Configurações básicas feitas

2. **Via Configuração Manual:**
   - Nome preenchido
   - Pelo menos uma integração conectada
   - Configurações mínimas feitas

## Persistência

### Banco de Dados (Primário)
- Dados sempre salvos no Supabase
- Sincronização em tempo real
- Backup automático

### Estado em Memória
- Dados mantidos apenas na store enquanto wizard está aberto
- Reset automático ao criar novo projeto
- Limpeza ao completar wizard

## Segurança

### RLS Policies
- Usuários veem apenas seus drafts
- Isolamento por empresa
- Validação de permissões

### Validações
- Dados sanitizados antes de salvar
- Validação de tipos TypeScript
- Constraints no banco de dados

## Performance

### Otimizações
- Índices para queries de drafts
- Lazy loading de dados
- Debounce em salvamentos
- Cleanup automático de drafts antigos

### Limpeza Automática
- Drafts abandonados (>30 dias) são removidos
- Função `cleanup_abandoned_draft_projects()`
- Execução via cron job

## Testes

### Cobertura
- **Unitários**: Adapter, Store, Service
- **Integração**: Fluxos completos
- **E2E**: Cenários de usuário

### Estrutura
```
__tests__/
├── adapters/
│   └── projectWizardAdapter.spec.ts
├── stores/
│   └── projectWizard.spec.ts
└── components/
    └── ProjectContinueModal.spec.ts
```

## Troubleshooting

### Problemas Comuns

1. **Erro ao salvar progresso**
   - Verificar conexão com Supabase
   - Validar dados do projeto
   - Verificar permissões RLS

2. **Modal não aparece**
   - Verificar se projeto tem `wizard_progress`
   - Validar status `draft`
   - Verificar computed `draftProjects`

3. **Dados não carregam**
   - Verificar `projectId` na URL
   - Validar estrutura do `wizard_progress`
   - Verificar conexão com backend

### Debug

```typescript
// Verificar estado da store
console.log('Store state:', wizardStore.$state)

// Verificar dados do projeto
console.log('Project data:', wizardStore.projectData)

// Verificar sincronização
console.log('Is syncing:', wizardStore.isSyncing)
```

## Roadmap

### Próximas Funcionalidades
- [ ] Notificações de progresso
- [ ] Colaboração em drafts
- [ ] Templates de projeto
- [ ] Analytics de conversão do wizard

### Melhorias
- [ ] Cache inteligente
- [ ] Sincronização offline
- [ ] Compressão de dados
- [ ] Métricas de performance