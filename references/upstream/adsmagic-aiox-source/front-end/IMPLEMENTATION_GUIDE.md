# 🚀 Guia Prático de Implementação - Frontend ↔ Backend

**Versão**: 1.0  
**Data**: 2025-01-27  
**Status**: Guia Prático  
**Objetivo**: Implementar integração passo a passo  

---

## 🎯 Começando Agora

### **Passo 1: Configuração Inicial (15 minutos)**

#### 1.1 Instalar Dependências
```bash
cd front-end
npm install @supabase/supabase-js @supabase/auth-helpers-vue
```

#### 1.2 Configurar Variáveis de Ambiente
Criar arquivo `.env.local`:
```bash
# .env.local
VITE_SUPABASE_URL=https://nitefyufrzytdtxhaocf.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_aqui
VITE_USE_MOCK=true  # Começar com mocks, depois mudar para false
```

#### 1.3 Obter Chave Anônima
```bash
# Execute no terminal para obter a chave
npx supabase status
# ou use o MCP Supabase para obter a chave
```

---

## 🔧 Implementação Passo a Passo

### **ETAPA 1: Cliente Supabase (30 minutos)**

#### 1.1 Criar Cliente Supabase
```typescript
// src/services/api/supabaseClient.ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey)
```

#### 1.2 Criar Tipos do Banco
```typescript
// src/types/database.ts
// Copiar os tipos gerados pelo MCP Supabase
export type Database = {
  // ... tipos gerados
}
```

#### 1.3 Testar Conexão
```typescript
// src/services/api/testConnection.ts
import { supabase } from './supabaseClient'

export async function testConnection() {
  try {
    const { data, error } = await supabase.from('companies').select('*').limit(1)
    if (error) throw error
    console.log('✅ Conexão com Supabase funcionando!', data)
    return true
  } catch (error) {
    console.error('❌ Erro na conexão:', error)
    return false
  }
}
```

---

### **ETAPA 2: Autenticação Real (45 minutos)**

#### 2.1 Atualizar Store de Auth
```typescript
// src/stores/auth.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/services/api/supabaseClient'
import type { User } from '@supabase/supabase-js'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const profile = ref<any>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const isAuthenticated = computed(() => !!user.value)
  const userRole = computed(() => profile.value?.role || 'viewer')

  // Actions
  async function signIn(email: string, password: string) {
    isLoading.value = true
    error.value = null
    
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (authError) throw authError
      
      user.value = data.user
      await loadUserProfile()
      
      return { success: true }
    } catch (err: any) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      isLoading.value = false
    }
  }

  async function signUp(email: string, password: string, userData: any) {
    isLoading.value = true
    error.value = null
    
    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      })
      
      if (authError) throw authError
      
      user.value = data.user
      await createUserProfile(userData)
      
      return { success: true }
    } catch (err: any) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      isLoading.value = false
    }
  }

  async function signOut() {
    await supabase.auth.signOut()
    user.value = null
    profile.value = null
  }

  async function loadUserProfile() {
    if (!user.value) return
    
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.value.id)
        .single()
      
      if (error) throw error
      profile.value = data
    } catch (err) {
      console.error('Erro ao carregar perfil:', err)
    }
  }

  async function createUserProfile(userData: any) {
    if (!user.value) return
    
    try {
      const { error } = await supabase
        .from('user_profiles')
        .insert({
          id: user.value.id,
          first_name: userData.firstName,
          last_name: userData.lastName,
          preferred_language: userData.language || 'pt',
          timezone: userData.timezone || 'America/Sao_Paulo'
        })
      
      if (error) throw error
      await loadUserProfile()
    } catch (err) {
      console.error('Erro ao criar perfil:', err)
    }
  }

  // Inicializar sessão
  supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN' && session) {
      user.value = session.user
      await loadUserProfile()
    } else if (event === 'SIGNED_OUT') {
      user.value = null
      profile.value = null
    }
  })

  return {
    user,
    profile,
    isLoading,
    error,
    isAuthenticated,
    userRole,
    signIn,
    signUp,
    signOut,
    loadUserProfile
  }
})
```

#### 2.2 Atualizar Componente de Login
```vue
<!-- src/views/auth/LoginView.vue -->
<template>
  <div class="login-container">
    <form @submit.prevent="handleLogin" class="login-form">
      <h1>Entrar</h1>
      
      <div class="form-group">
        <label for="email">Email</label>
        <input
          id="email"
          v-model="form.email"
          type="email"
          required
          :disabled="authStore.isLoading"
        />
      </div>
      
      <div class="form-group">
        <label for="password">Senha</label>
        <input
          id="password"
          v-model="form.password"
          type="password"
          required
          :disabled="authStore.isLoading"
        />
      </div>
      
      <button 
        type="submit" 
        :disabled="authStore.isLoading"
        class="btn-primary"
      >
        {{ authStore.isLoading ? 'Entrando...' : 'Entrar' }}
      </button>
      
      <div v-if="authStore.error" class="error-message">
        {{ authStore.error }}
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  email: '',
  password: ''
})

async function handleLogin() {
  const result = await authStore.signIn(form.value.email, form.value.password)
  
  if (result.success) {
    router.push('/dashboard')
  }
}
</script>
```

---

### **ETAPA 3: Sistema de Empresas (60 minutos)**

#### 3.1 Criar Store de Empresas
```typescript
// src/stores/companies.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/services/api/supabaseClient'
import { useAuthStore } from './auth'

export const useCompaniesStore = defineStore('companies', () => {
  // State
  const companies = ref<any[]>([])
  const currentCompany = ref<any>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const userCompanies = computed(() => companies.value)
  const hasCompanies = computed(() => companies.value.length > 0)

  // Actions
  async function fetchCompanies() {
    const authStore = useAuthStore()
    if (!authStore.user) return

    isLoading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await supabase
        .from('company_users')
        .select(`
          *,
          companies (*)
        `)
        .eq('user_id', authStore.user.id)
        .eq('is_active', true)

      if (fetchError) throw fetchError

      companies.value = data.map(item => ({
        ...item.companies,
        userRole: item.role,
        permissions: item.permissions
      }))

      // Se não há empresa atual, definir a primeira
      if (!currentCompany.value && companies.value.length > 0) {
        currentCompany.value = companies.value[0]
      }

    } catch (err: any) {
      error.value = err.message
      console.error('Erro ao carregar empresas:', err)
    } finally {
      isLoading.value = false
    }
  }

  async function createCompany(companyData: any) {
    const authStore = useAuthStore()
    if (!authStore.user) return

    isLoading.value = true
    error.value = null

    try {
      // Criar empresa
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .insert({
          name: companyData.name,
          description: companyData.description,
          country: companyData.country,
          industry: companyData.industry,
          size: companyData.size,
          website: companyData.website
        })
        .select()
        .single()

      if (companyError) throw companyError

      // Adicionar usuário como owner
      const { error: userError } = await supabase
        .from('company_users')
        .insert({
          company_id: company.id,
          user_id: authStore.user.id,
          role: 'owner',
          is_active: true
        })

      if (userError) throw userError

      // Recarregar empresas
      await fetchCompanies()

      return { success: true, company }
    } catch (err: any) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      isLoading.value = false
    }
  }

  async function updateCompany(companyId: string, updates: any) {
    isLoading.value = true
    error.value = null

    try {
      const { error: updateError } = await supabase
        .from('companies')
        .update(updates)
        .eq('id', companyId)

      if (updateError) throw updateError

      // Atualizar cache local
      const index = companies.value.findIndex(c => c.id === companyId)
      if (index !== -1) {
        companies.value[index] = { ...companies.value[index], ...updates }
      }

      if (currentCompany.value?.id === companyId) {
        currentCompany.value = { ...currentCompany.value, ...updates }
      }

      return { success: true }
    } catch (err: any) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      isLoading.value = false
    }
  }

  function setCurrentCompany(company: any) {
    currentCompany.value = company
    localStorage.setItem('current_company_id', company.id)
  }

  return {
    companies,
    currentCompany,
    isLoading,
    error,
    userCompanies,
    hasCompanies,
    fetchCompanies,
    createCompany,
    updateCompany,
    setCurrentCompany
  }
})
```

#### 3.2 Criar Componente de Empresas
```vue
<!-- src/components/companies/CompanyList.vue -->
<template>
  <div class="company-list">
    <div class="header">
      <h2>Minhas Empresas</h2>
      <button @click="showCreateModal = true" class="btn-primary">
        Nova Empresa
      </button>
    </div>

    <div v-if="companiesStore.isLoading" class="loading">
      Carregando empresas...
    </div>

    <div v-else-if="companiesStore.error" class="error">
      {{ companiesStore.error }}
    </div>

    <div v-else-if="!companiesStore.hasCompanies" class="empty">
      <p>Você ainda não tem empresas cadastradas.</p>
      <button @click="showCreateModal = true" class="btn-primary">
        Criar Primeira Empresa
      </button>
    </div>

    <div v-else class="companies-grid">
      <div
        v-for="company in companiesStore.userCompanies"
        :key="company.id"
        class="company-card"
        :class="{ active: company.id === companiesStore.currentCompany?.id }"
        @click="selectCompany(company)"
      >
        <h3>{{ company.name }}</h3>
        <p>{{ company.description }}</p>
        <div class="company-meta">
          <span class="role">{{ company.userRole }}</span>
          <span class="country">{{ company.country }}</span>
        </div>
      </div>
    </div>

    <!-- Modal de Criação -->
    <CompanyCreateModal
      v-if="showCreateModal"
      @close="showCreateModal = false"
      @created="handleCompanyCreated"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useCompaniesStore } from '@/stores/companies'
import CompanyCreateModal from './CompanyCreateModal.vue'

const companiesStore = useCompaniesStore()
const showCreateModal = ref(false)

onMounted(() => {
  companiesStore.fetchCompanies()
})

function selectCompany(company: any) {
  companiesStore.setCurrentCompany(company)
}

function handleCompanyCreated() {
  showCreateModal.value = false
  companiesStore.fetchCompanies()
}
</script>
```

---

### **ETAPA 4: Sistema de Projetos (60 minutos)**

#### 4.1 Atualizar Store de Projetos
```typescript
// src/stores/projects.ts - Atualizar para usar Supabase
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/services/api/supabaseClient'
import { useCompaniesStore } from './companies'

export const useProjectsStore = defineStore('projects', () => {
  // State existente...
  const projects = ref<any[]>([])
  const currentProject = ref<any>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Actions atualizadas para usar Supabase
  async function fetchProjects() {
    const companiesStore = useCompaniesStore()
    if (!companiesStore.currentCompany) return

    isLoading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await supabase
        .from('projects')
        .select('*')
        .eq('company_id', companiesStore.currentCompany.id)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      projects.value = data || []

      // Se não há projeto atual, definir o primeiro
      if (!currentProject.value && projects.value.length > 0) {
        currentProject.value = projects.value[0]
        localStorage.setItem('current_project_id', projects.value[0].id)
      }

    } catch (err: any) {
      error.value = err.message
      console.error('Erro ao carregar projetos:', err)
    } finally {
      isLoading.value = false
    }
  }

  async function createProject(projectData: any) {
    const companiesStore = useCompaniesStore()
    if (!companiesStore.currentCompany) return

    isLoading.value = true
    error.value = null

    try {
      const { data, error: createError } = await supabase
        .from('projects')
        .insert({
          company_id: companiesStore.currentCompany.id,
          name: projectData.name,
          description: projectData.description,
          company_type: projectData.companyType,
          country: projectData.country,
          language: projectData.language,
          currency: projectData.currency,
          timezone: projectData.timezone,
          attribution_model: projectData.attributionModel,
          franchise_count: projectData.franchiseCount
        })
        .select()
        .single()

      if (createError) throw createError

      // Adicionar usuário como owner do projeto
      const { error: userError } = await supabase
        .from('project_users')
        .insert({
          project_id: data.id,
          user_id: data.created_by,
          role: 'owner',
          is_active: true
        })

      if (userError) throw userError

      // Recarregar projetos
      await fetchProjects()

      return { success: true, project: data }
    } catch (err: any) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      isLoading.value = false
    }
  }

  // ... outras funções existentes atualizadas

  return {
    projects,
    currentProject,
    isLoading,
    error,
    fetchProjects,
    createProject,
    // ... outras funções
  }
})
```

---

### **ETAPA 5: Testes e Validação (30 minutos)**

#### 5.1 Criar Página de Teste
```vue
<!-- src/views/TestIntegrationView.vue -->
<template>
  <div class="test-integration">
    <h1>Teste de Integração Frontend-Backend</h1>
    
    <div class="test-section">
      <h2>1. Conexão com Supabase</h2>
      <button @click="testConnection" :disabled="testing">
        {{ testing ? 'Testando...' : 'Testar Conexão' }}
      </button>
      <div v-if="connectionResult" class="result">
        {{ connectionResult }}
      </div>
    </div>

    <div class="test-section">
      <h2>2. Autenticação</h2>
      <div v-if="!authStore.isAuthenticated">
        <p>Usuário não autenticado</p>
        <button @click="testLogin">Testar Login</button>
      </div>
      <div v-else>
        <p>✅ Usuário autenticado: {{ authStore.user?.email }}</p>
        <p>Perfil: {{ authStore.profile?.first_name }} {{ authStore.profile?.last_name }}</p>
      </div>
    </div>

    <div class="test-section">
      <h2>3. Empresas</h2>
      <button @click="testCompanies" :disabled="testing">
        {{ testing ? 'Testando...' : 'Testar Empresas' }}
      </button>
      <div v-if="companiesResult" class="result">
        {{ companiesResult }}
      </div>
    </div>

    <div class="test-section">
      <h2>4. Projetos</h2>
      <button @click="testProjects" :disabled="testing">
        {{ testing ? 'Testando...' : 'Testar Projetos' }}
      </button>
      <div v-if="projectsResult" class="result">
        {{ projectsResult }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useCompaniesStore } from '@/stores/companies'
import { useProjectsStore } from '@/stores/projects'
import { testConnection } from '@/services/api/testConnection'

const authStore = useAuthStore()
const companiesStore = useCompaniesStore()
const projectsStore = useProjectsStore()

const testing = ref(false)
const connectionResult = ref('')
const companiesResult = ref('')
const projectsResult = ref('')

async function testConnection() {
  testing.value = true
  const result = await testConnection()
  connectionResult.value = result ? '✅ Conexão OK' : '❌ Conexão falhou'
  testing.value = false
}

async function testLogin() {
  // Implementar teste de login
}

async function testCompanies() {
  testing.value = true
  try {
    await companiesStore.fetchCompanies()
    companiesResult.value = `✅ ${companiesStore.companies.length} empresas carregadas`
  } catch (error) {
    companiesResult.value = '❌ Erro ao carregar empresas'
  }
  testing.value = false
}

async function testProjects() {
  testing.value = true
  try {
    await projectsStore.fetchProjects()
    projectsResult.value = `✅ ${projectsStore.projects.length} projetos carregados`
  } catch (error) {
    projectsResult.value = '❌ Erro ao carregar projetos'
  }
  testing.value = false
}
</script>
```

---

## 🎯 Próximos Passos

### **Imediato (Próximas 2 horas)**
1. **Implementar ETAPA 1** - Cliente Supabase
2. **Implementar ETAPA 2** - Autenticação
3. **Testar conexão** - Página de teste

### **Curto Prazo (Próxima semana)**
1. **Implementar ETAPA 3** - Sistema de Empresas
2. **Implementar ETAPA 4** - Sistema de Projetos
3. **Implementar ETAPA 5** - Testes e Validação

### **Médio Prazo (Próximas 2 semanas)**
1. **Otimizar performance**
2. **Implementar cache**
3. **Preparar para próximas funcionalidades**

---

## 🚨 Troubleshooting

### **Problemas Comuns**

#### 1. Erro de CORS
```bash
# Verificar se o Supabase está configurado corretamente
# Adicionar domínio local ao Supabase
```

#### 2. Erro de Autenticação
```typescript
// Verificar se as variáveis de ambiente estão corretas
console.log('URL:', import.meta.env.VITE_SUPABASE_URL)
console.log('Key:', import.meta.env.VITE_SUPABASE_ANON_KEY)
```

#### 3. Erro de RLS
```sql
-- Verificar se as políticas RLS estão ativas
SELECT * FROM pg_policies WHERE tablename = 'companies';
```

### **Logs Úteis**
```typescript
// Adicionar logs para debug
console.log('Auth state:', authStore.user)
console.log('Companies:', companiesStore.companies)
console.log('Projects:', projectsStore.projects)
```

---

**📝 Notas:**
- Começar sempre com `VITE_USE_MOCK=true`
- Testar cada etapa antes de prosseguir
- Manter fallback para mocks
- Documentar problemas encontrados
- Atualizar este guia conforme necessário
