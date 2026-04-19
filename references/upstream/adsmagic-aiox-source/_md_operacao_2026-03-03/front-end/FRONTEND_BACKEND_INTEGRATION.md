# 🔗 Integração Frontend-Backend - Adsmagic First AI

**Versão**: 1.0  
**Data**: 2025-01-27  
**Status**: Plano de Integração  
**Progresso**: Análise Completa - Pronto para Implementação  

---

## 🎯 Visão Geral

Este documento define o plano de integração entre o frontend Vue 3 + TypeScript e o backend Supabase já implementado. O objetivo é conectar gradualmente as funcionalidades do frontend com as tabelas e APIs do backend, mantendo o desenvolvimento **mock-first** até que todas as integrações estejam funcionando.

### Estado Atual
- ✅ **Backend**: 2 sessões completas (Sistema de Usuários e Empresas)
- ✅ **Frontend**: Estrutura completa com stores, componentes e mocks
- ✅ **Banco de Dados**: 7 tabelas implementadas com RLS ativo
- ✅ **Tipos TypeScript**: Gerados e atualizados

---

## 📊 Mapeamento Backend → Frontend

### **Tabelas Implementadas no Backend**

| Tabela | Status | Frontend Store | Componentes | Próxima Ação |
|--------|--------|----------------|-------------|--------------|
| `user_profiles` | ✅ Implementada | `useAuthStore` | `AuthView`, `ProfileView` | Conectar autenticação |
| `companies` | ✅ Implementada | `useCompaniesStore` | `CompanySettings`, `Onboarding` | Criar store de empresas |
| `company_users` | ✅ Implementada | `useAuthStore` | `UserManagement` | Integrar roles |
| `projects` | ✅ Implementada | `useProjectsStore` | `ProjectWizard`, `ProjectsView` | Conectar API real |
| `project_users` | ✅ Implementada | `useProjectsStore` | `ProjectSettings` | Integrar permissões |
| `company_settings` | ✅ Implementada | `useSettingsStore` | `SettingsView` | Conectar configurações |
| `onboarding_progress` | ✅ Implementada | `useOnboardingStore` | `OnboardingView` | Conectar progresso |

---

## 🚀 Plano de Implementação por Etapas

### **ETAPA 1: Configuração Base e Autenticação** 
**Duração Estimada**: 2-3 horas  
**Prioridade**: ✅ CONCLUÍDA  

#### Objetivos
- Configurar cliente Supabase no frontend
- Implementar autenticação real
- Conectar perfil de usuário
- Manter compatibilidade com mocks

#### Tarefas Detalhadas
1. **Configuração do Cliente Supabase**
   - [x] Instalar `@supabase/supabase-js`
   - [x] Configurar variáveis de ambiente
   - [x] Criar cliente Supabase centralizado
   - [x] Configurar tipos TypeScript

2. **Sistema de Autenticação**
   - [x] Implementar login/registro real
   - [x] Conectar `user_profiles` com `auth.users`
   - [x] Manter fallback para mocks
   - [x] Implementar logout e refresh

3. **Store de Autenticação**
   - [x] Atualizar `useAuthStore` para usar Supabase
   - [x] Implementar persistência de sessão
   - [x] Adicionar tratamento de erros
   - [x] Manter compatibilidade com mocks

#### Critérios de Sucesso
- ✅ Login/registro funcionando com Supabase
- ✅ Perfil de usuário carregado do backend
- ✅ Fallback para mocks quando necessário
- ✅ Sessão persistente entre reloads

#### Conquistas
- ✅ Cliente Supabase configurado e testado
- ✅ Autenticação real funcionando
- ✅ Perfil de usuário carregado do backend
- ✅ Sistema de onboarding conectado
- ✅ Password reset via email implementado
- ✅ Sessão persistente entre reloads
- ✅ Todos os mocks removidos
- ✅ **LoginView.vue** conectado com Supabase Auth
- ✅ **RegisterView.vue** implementado com registro real
- ✅ **VerifyOtpView.vue** adaptado para fluxo Supabase
- ✅ Fluxo completo de autenticação funcionando

#### Arquivos a Modificar
```
front-end/src/
├── services/
│   ├── api/
│   │   ├── supabaseClient.ts          # ✅ Novo
│   │   └── authService.ts             # ✅ Novo
│   └── auth.ts                        # 🔄 Atualizar
├── stores/
│   └── auth.ts                        # 🔄 Atualizar
├── types/
│   └── auth.ts                        # 🔄 Atualizar
└── .env.local                        # ✅ Novo
```

---

### **ETAPA 2: Sistema de Empresas e Multi-tenancy** 
**Duração Estimada**: 3-4 horas  
**Prioridade**: ✅ CONCLUÍDA  

#### Objetivos
- Implementar CRUD de empresas
- Conectar sistema de usuários por empresa
- Implementar configurações de empresa
- Manter isolamento de dados

#### Tarefas Detalhadas
1. **Store de Empresas**
   - [x] Criar `useCompaniesStore`
   - [x] Implementar CRUD completo
   - [x] Conectar com `companies` table
   - [x] Implementar cache local

2. **Sistema de Roles e Permissões**
   - [x] Conectar `company_users` com frontend
   - [x] Implementar verificação de permissões
   - [x] Atualizar componentes baseado em role
   - [x] Implementar convites de usuários

3. **Configurações de Empresa**
   - [x] Conectar `company_settings` com frontend
   - [x] Implementar configurações de tema/idioma
   - [x] Conectar com `useSettingsStore`
   - [x] Implementar persistência

#### Critérios de Sucesso
- ✅ Empresas podem ser criadas e gerenciadas
- ✅ Sistema de roles funcionando
- ✅ Configurações persistidas no backend
- ✅ Isolamento de dados por empresa

#### Conquistas
- ✅ **useCompaniesStore** implementado com CRUD completo
- ✅ **companiesService** e **settingsService** criados
- ✅ **CompanySelector**, **CompanyList**, **CompanyFormModal** implementados
- ✅ **CompanySettingsView** para gerenciar configurações
- ✅ Sistema de multi-tenancy funcionando
- ✅ Integração com **useSettingsStore** para configurações
- ✅ Tipos TypeScript completos para empresas
- ✅ Sistema de roles e permissões implementado

#### Arquivos a Modificar
```
front-end/src/
├── stores/
│   ├── companies.ts                   # ✅ Novo
│   └── settings.ts                    # 🔄 Atualizar
├── services/
│   └── api/
│       ├── companiesService.ts        # ✅ Novo
│       └── settingsService.ts         # ✅ Novo
├── components/
│   └── companies/                     # ✅ Novo
└── views/
    └── companies/                      # ✅ Novo
```

---

### **ETAPA 3: Sistema de Projetos e Configurações** 
**Duração Estimada**: 3-4 horas  
**Prioridade**: ✅ CONCLUÍDA  

#### Objetivos
- Conectar `projects` table com frontend
- Implementar multi-tenancy por projeto
- Conectar configurações específicas
- Manter compatibilidade com ProjectWizard

#### Tarefas Detalhadas
1. **Store de Projetos Atualizada**
   - [x] Conectar `useProjectsStore` com Supabase
   - [x] Implementar CRUD real
   - [x] Manter compatibilidade com mocks
   - [x] Implementar cache inteligente

2. **Sistema de Multi-tenancy**
   - [x] Conectar `project_users` com frontend
   - [x] Implementar troca de projeto
   - [x] Implementar isolamento de dados
   - [x] Atualizar navegação

3. **ProjectWizard Integrado**
   - [x] Conectar wizard com API real
   - [x] Implementar validações do backend
   - [x] Manter fluxo de criação
   - [x] Implementar rollback

#### Critérios de Sucesso
- ✅ Projetos criados no backend
- ✅ Multi-tenancy funcionando
- ✅ ProjectWizard conectado
- ✅ Isolamento de dados por projeto

#### Conquistas
- ✅ **projectsApiService** criado com CRUD completo
- ✅ **RealProjectsService** implementado com integração Supabase
- ✅ **useProjectsStore** atualizado com multi-tenancy
- ✅ **Tipos TypeScript** expandidos para campos do backend
- ✅ **Integração com empresas** funcionando
- ✅ **Isolamento de dados** por empresa garantido
- ✅ **Compatibilidade com mock** mantida via feature flag
- ✅ **Watch de mudança de empresa** implementado

#### Arquivos a Modificar
```
front-end/src/
├── stores/
│   └── projects.ts                    # 🔄 Atualizar
├── services/
│   └── api/
│       └── projectsService.ts         # 🔄 Atualizar
├── views/
│   └── project-wizard/                # 🔄 Atualizar
└── components/
    └── projects/                      # 🔄 Atualizar
```

---

### **ETAPA 4: Sistema de Onboarding e Progresso** 
**Duração Estimada**: 2-3 horas  
**Prioridade**: ✅ CONCLUÍDA  

#### Objetivos
- Conectar `onboarding_progress` com frontend
- Implementar tracking de progresso
- Conectar com configurações de empresa
- Manter fluxo de onboarding

#### Tarefas Detalhadas
1. **Store de Onboarding**
   - [x] Conectar `useOnboardingStore` com Supabase
   - [x] Implementar tracking de progresso
   - [x] Conectar com `onboarding_progress`
   - [x] Implementar validações

2. **Sistema de Progresso**
   - [x] Implementar etapas do onboarding
   - [x] Conectar com configurações
   - [x] Implementar conclusão automática
   - [x] Manter estado persistente

#### Critérios de Sucesso
- ✅ Progresso salvo no backend
- ✅ Onboarding funcionando
- ✅ Configurações conectadas
- ✅ Conclusão automática

#### Conquistas
- ✅ **onboardingApiService** criado com CRUD completo
- ✅ **useOnboardingStore** conectado com Supabase
- ✅ **Progresso persistente** no backend
- ✅ **Criação automática de empresa** ao concluir
- ✅ **Integração com authStore** e companiesStore
- ✅ **Tracking de etapas** funcionando
- ✅ **Estado persistente** entre reloads

---

### **ETAPA 5: Otimização e Testes** 
**Duração Estimada**: 2-3 horas  
**Prioridade**: ✅ CONCLUÍDA  

#### Objetivos
- Implementar cache inteligente
- Otimizar performance
- Implementar testes de integração
- Validar todas as funcionalidades

#### Tarefas Detalhadas
1. **Cache e Performance**
   - [x] Implementar cache de dados
   - [x] Otimizar queries
   - [x] Implementar lazy loading
   - [x] Configurar debounce

2. **Testes de Integração**
   - [x] Testar fluxo completo
   - [x] Validar permissões
   - [x] Testar multi-tenancy
   - [x] Implementar testes E2E

#### Critérios de Sucesso
- ✅ Performance otimizada
- ✅ Cache funcionando
- ✅ Testes passando
- ✅ Funcionalidades validadas

#### Conquistas
- ✅ **cacheService** implementado com expiração automática
- ✅ **Cache integrado** em useCompaniesStore, useProjectsStore
- ✅ **Queries otimizadas** com seleção específica de campos
- ✅ **Paginação implementada** para listas grandes
- ✅ **useLazyLoad** composable para scroll infinito
- ✅ **Vitest configurado** com cobertura de código
- ✅ **Testes de stores** implementados
- ✅ **Checklist de validação** criado
- ✅ **Guia de performance** documentado

---

## 🔧 Configuração Técnica

### **Variáveis de Ambiente**
```bash
# .env.local
VITE_SUPABASE_URL=https://nitefyufrzytdtxhaocf.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_USE_MOCK=false  # true para desenvolvimento, false para produção
```

### **Dependências Necessárias**
```json
{
  "@supabase/supabase-js": "^2.39.0",
  "@supabase/auth-helpers-vue": "^0.4.0"
}
```

### **Estrutura de Serviços**
```
front-end/src/services/
├── api/
│   ├── supabaseClient.ts              # Cliente Supabase
│   ├── authService.ts                 # Autenticação
│   ├── companiesService.ts            # Empresas
│   ├── projectsService.ts             # Projetos
│   ├── settingsService.ts             # Configurações
│   └── onboardingService.ts           # Onboarding
├── types/
│   └── database.ts                    # Tipos do banco
└── utils/
    └── permissions.ts                 # Utilitários de permissão
```

---

## 📋 Checklist de Implementação

### **Fase 1: Configuração Base**
- [ ] Instalar dependências Supabase
- [ ] Configurar variáveis de ambiente
- [ ] Criar cliente Supabase
- [ ] Implementar autenticação real
- [ ] Conectar perfil de usuário

### **Fase 2: Sistema de Empresas**
- [ ] Criar store de empresas
- [ ] Implementar CRUD de empresas
- [ ] Conectar sistema de roles
- [ ] Implementar configurações
- [ ] Testar multi-tenancy

### **Fase 3: Sistema de Projetos**
- [ ] Conectar store de projetos
- [ ] Implementar CRUD real
- [ ] Conectar ProjectWizard
- [ ] Implementar multi-tenancy
- [ ] Testar isolamento

### **Fase 4: Sistema de Onboarding**
- [ ] Conectar progresso de onboarding
- [ ] Implementar tracking
- [ ] Conectar configurações
- [ ] Testar fluxo completo

### **Fase 5: Otimização**
- [ ] Implementar cache
- [ ] Otimizar performance
- [ ] Implementar testes
- [ ] Validar funcionalidades

---

## 🚨 Políticas de Segurança

### **ALLOWED_PATHS**
- `/front-end/src/**` - Todo o código frontend
- `/front-end/.env.local` - Variáveis de ambiente locais

### **FORBIDDEN_PATHS**
- `/back-end/**` - Backend (apenas leitura)
- `/infra/**` - Infraestrutura
- `.env` - Variáveis de ambiente de produção

### **Contratos e Mocks**
- ✅ Manter compatibilidade com mocks durante desenvolvimento
- ✅ Usar feature flags para alternar entre mock e real
- ✅ Validar dados com schemas Zod
- ✅ Implementar fallbacks para erros de rede

---

## 📊 Métricas de Sucesso

### **Performance**
- Carregamento inicial < 2s
- Navegação entre páginas < 500ms
- Cache hit ratio > 80%
- Queries otimizadas < 200ms

### **Funcionalidade**
- Todas as operações CRUD funcionando
- Multi-tenancy funcionando
- Permissões respeitadas
- Onboarding completo

### **Qualidade**
- Zero breaking changes
- Testes passando
- Código limpo e documentado
- Performance otimizada

---

## 🔄 Estratégia de Rollback

### **Por Etapa**
- Cada etapa tem rollback específico
- Manter compatibilidade com mocks
- Feature flags para alternar
- Validação pós-implementação

### **Global**
- Backup do estado atual
- Manter mocks funcionando
- Testes de regressão
- Monitoramento contínuo

---

## 📚 Próximos Passos

### **Imediato (Próximas 2-4 horas)**
1. **Configurar Supabase no frontend**
   - Instalar dependências
   - Configurar cliente
   - Implementar autenticação

2. **Conectar sistema de usuários**
   - Atualizar store de auth
   - Conectar perfil de usuário
   - Testar login/registro

### **Curto Prazo (Próxima semana)**
1. **Implementar sistema de empresas**
   - Criar store de empresas
   - Implementar CRUD
   - Conectar configurações

2. **Conectar sistema de projetos**
   - Atualizar store de projetos
   - Conectar ProjectWizard
   - Implementar multi-tenancy

### **Médio Prazo (Próximas 2 semanas)**
1. **Completar integração**
   - Sistema de onboarding
   - Otimizações
   - Testes completos

2. **Preparar para próximas sessões**
   - Sistema de contatos
   - Sistema de vendas
   - Sistema de integrações

---

## 🎉 Conquistas Esperadas

### **Após Etapa 1**
- ✅ Autenticação real funcionando
- ✅ Perfil de usuário conectado
- ✅ Fallback para mocks mantido

### **Após Etapa 2**
- ✅ Sistema de empresas funcionando
- ✅ Multi-tenancy implementado
- ✅ Configurações conectadas

### **Após Etapa 3**
- ✅ Sistema de projetos conectado
- ✅ ProjectWizard funcionando
- ✅ Multi-tenancy por projeto

### **Após Etapa 4**
- ✅ Onboarding conectado
- ✅ Progresso persistido
- ✅ Fluxo completo funcionando

### **Após Etapa 5**
- ✅ Performance otimizada
- ✅ Cache funcionando
- ✅ Testes implementados
- ✅ Sistema completo e funcional

---

**📝 Notas Finais:**
- Este plano mantém compatibilidade com mocks durante desenvolvimento
- Cada etapa é independente e pode ser testada isoladamente
- Rollback é sempre possível via feature flags
- Performance e segurança são prioridades em todas as etapas
- Documentação será atualizada a cada etapa concluída

