# Convenções de Código do Frontend

Este documento define os padrões e convenções de código para o frontend do projeto Adsmagic First AI.

## 🎯 Princípios Fundamentais
- **Clean Code**: Código legível, manutenível e autoexplicativo
- **SOLID**: Aplicar os 5 princípios de design orientado a objetos
- **TypeScript estrito**: Tipagem forte sem `any`
- **DRY**: Don't Repeat Yourself - evitar duplicação de código
- **KISS**: Keep It Simple, Stupid - soluções simples e diretas

## 📝 Nomenclatura

### Variáveis e Funções
```typescript
// ✅ BOM
const userEmail = 'user@example.com'
const isAuthenticated = true
function calculateTotalPrice() { }
function validateUserInput() { }

// ❌ EVITAR
const email = 'user@example.com'
const auth = true
function calc() { }
function validate() { }
```

### Componentes Vue
```vue
<!-- ✅ BOM -->
<UserProfileCard />
<ProjectListTable />
<OnboardingStepHeader />

<!-- ❌ EVITAR -->
<UserCard />
<Table />
<Header />
```

### Arquivos e Pastas
```
components/
├── ui/           # Componentes base reutilizáveis
├── features/     # Componentes específicos de funcionalidades
└── layout/       # Componentes de layout

// ✅ BOM
UserProfileCard.vue
ProjectListTable.vue
OnboardingStepHeader.vue

// ❌ EVITAR
UserCard.vue
Table.vue
Header.vue
```

## 🏗️ Estrutura de Componentes

### Template
```vue
<template>
  <!-- 1. Estrutura principal -->
  <div class="component-container">
    <!-- 2. Header/Title -->
    <header class="component-header">
      <h2>{{ $t('component.title') }}</h2>
    </header>
    
    <!-- 3. Content -->
    <main class="component-content">
      <!-- Conteúdo principal -->
    </main>
    
    <!-- 4. Footer/Actions -->
    <footer class="component-footer">
      <!-- Ações e botões -->
    </footer>
  </div>
</template>
```

### Script (Composition API)
```vue
<script setup lang="ts">
// 1. Imports
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import type { User } from '@/types'

// 2. Props e Emits
interface Props {
  userId: string
  showActions?: boolean
}
const props = withDefaults(defineProps<Props>(), {
  showActions: true
})

const emit = defineEmits<{
  userUpdated: [user: User]
  userDeleted: [userId: string]
}>()

// 3. Composables
const { t } = useI18n()

// 4. Reactive state
const isLoading = ref(false)
const user = ref<User | null>(null)

// 5. Computed properties
const displayName = computed(() => {
  return user.value?.name || t('common.unknown')
})

// 6. Methods
const loadUser = async () => {
  isLoading.value = true
  try {
    // Lógica de carregamento
  } finally {
    isLoading.value = false
  }
}

// 7. Lifecycle
onMounted(() => {
  loadUser()
})
</script>
```

## 🎨 Estilos

### CSS Classes
```vue
<style scoped>
/* 1. Container principal */
.component-container {
  @apply flex flex-col gap-4 p-4;
}

/* 2. Elementos específicos */
.component-header {
  @apply flex items-center justify-between;
}

.component-content {
  @apply flex-1;
}

/* 3. Estados e variações */
.component-container--loading {
  @apply opacity-50 pointer-events-none;
}

.component-container--error {
  @apply border-red-500 bg-red-50;
}

/* 4. Responsividade */
@media (max-width: 768px) {
  .component-container {
    @apply p-2 gap-2;
  }
}
</style>
```

## 🔧 TypeScript

### Tipos e Interfaces
```typescript
// ✅ BOM - Interface para contratos
interface User {
  id: string
  name: string
  email: string
  createdAt: Date
}

// ✅ BOM - Type para unions
type UserRole = 'admin' | 'user' | 'guest'
type ApiResponse<T> = {
  data: T
  meta: ResponseMeta
}

// ✅ BOM - Generic para reutilização
function createApiClient<T>(baseUrl: string): ApiClient<T> {
  // Implementação
}

// ❌ EVITAR - any
function processData(data: any): any {
  return data
}

// ✅ BOM - unknown + type guard
function processData(data: unknown): string {
  if (typeof data === 'string') {
    return data.toUpperCase()
  }
  throw new Error('Invalid data type')
}
```

### Composables
```typescript
// ✅ BOM - Composable bem estruturado
export function useUserManagement() {
  const users = ref<User[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const loadUsers = async () => {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await apiClient.get<User[]>('/users')
      users.value = response.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error'
    } finally {
      isLoading.value = false
    }
  }

  const addUser = async (userData: CreateUserData) => {
    // Lógica de adição
  }

  return {
    // State
    users: readonly(users),
    isLoading: readonly(isLoading),
    error: readonly(error),
    
    // Actions
    loadUsers,
    addUser
  }
}
```

## 🧪 Testes

### Estrutura de Testes
```typescript
// ✅ BOM - Teste bem estruturado
describe('UserProfileCard', () => {
  describe('when user is loaded', () => {
    it('should display user name and email', () => {
      // Arrange
      const user = createMockUser({ name: 'John Doe', email: 'john@example.com' })
      
      // Act
      render(UserProfileCard, { props: { user } })
      
      // Assert
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('john@example.com')).toBeInTheDocument()
    })
  })

  describe('when user is loading', () => {
    it('should show loading spinner', () => {
      // Arrange & Act
      render(UserProfileCard, { props: { isLoading: true } })
      
      // Assert
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
    })
  })
})
```

## 📁 Organização de Arquivos

### Estrutura de Pastas
```
src/
├── components/
│   ├── ui/              # Componentes base
│   ├── features/        # Componentes de funcionalidades
│   └── layout/          # Componentes de layout
├── views/               # Páginas da aplicação
├── stores/              # Pinia stores
├── composables/         # Lógica reutilizável
├── services/            # Integração com APIs
├── types/               # Definições TypeScript
├── utils/               # Funções utilitárias
├── locales/             # Arquivos de tradução
└── assets/              # Recursos estáticos
```

### Imports
```typescript
// ✅ BOM - Imports organizados
// 1. Vue e frameworks
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

// 2. Bibliotecas externas
import { format } from 'date-fns'
import { z } from 'zod'

// 3. Imports internos (absolutos)
import { useUserStore } from '@/stores/user'
import type { User } from '@/types'
import { validateEmail } from '@/utils/validation'

// 4. Imports relativos
import UserCard from './UserCard.vue'
import './UserProfile.styles.css'
```

## 🚨 Tratamento de Erros

### Estrutura de Erro
```typescript
// ✅ BOM - Result type para operações que podem falhar
type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E }

async function fetchUser(id: string): Promise<Result<User>> {
  try {
    const user = await apiClient.get<User>(`/users/${id}`)
    return { success: true, data: user.data }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error : new Error('Unknown error')
    }
  }
}

// Uso
const result = await fetchUser('123')
if (result.success) {
  console.log(result.data.name)
} else {
  console.error(result.error.message)
}
```

## ✅ Validação de Formulários

### Validação em Tempo Real
```vue
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// Estado do formulário
const form = ref({
  name: '',
  email: '',
  phone: ''
})

// Estados de validação
const errors = ref<Record<string, string>>({})
const isValid = computed(() => Object.keys(errors.value).length === 0)

// Validações
const validateName = (name: string) => {
  if (!name.trim()) return t('validation.name.required')
  if (name.length < 2) return t('validation.name.minLength')
  if (name.length > 50) return t('validation.name.maxLength')
  return null
}

const validateEmail = (email: string) => {
  if (!email.trim()) return t('validation.email.required')
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) return t('validation.email.invalid')
  return null
}

// Watchers para validação em tempo real
watch(() => form.value.name, (newName) => {
  const error = validateName(newName)
  if (error) {
    errors.value.name = error
  } else {
    delete errors.value.name
  }
})

watch(() => form.value.email, (newEmail) => {
  const error = validateEmail(newEmail)
  if (error) {
    errors.value.email = error
  } else {
    delete errors.value.email
  }
})
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <!-- Campo com validação -->
    <div class="form-group">
      <label for="name">{{ $t('form.name') }}</label>
      <input
        id="name"
        v-model="form.name"
        type="text"
        :class="{ 'error': errors.name }"
        :aria-invalid="!!errors.name"
        :aria-describedby="errors.name ? 'name-error' : undefined"
      />
      <div v-if="errors.name" id="name-error" class="error-message">
        {{ errors.name }}
      </div>
    </div>

    <!-- Botão com estado de validação -->
    <button type="submit" :disabled="!isValid || isLoading">
      {{ isLoading ? $t('common.saving') : $t('form.submit') }}
    </button>
  </form>
</template>
```

### Validação com Zod
```typescript
import { z } from 'zod'

// Schema de validação
const userSchema = z.object({
  name: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(50, 'Nome deve ter no máximo 50 caracteres'),
  email: z.string()
    .email('Email inválido'),
  phone: z.string()
    .regex(/^\+?[\d\s-()]+$/, 'Telefone inválido')
    .optional()
})

type UserForm = z.infer<typeof userSchema>

// Composable para validação
export function useFormValidation<T>(schema: z.ZodSchema<T>) {
  const errors = ref<Record<string, string>>({})
  const isValid = computed(() => Object.keys(errors.value).length === 0)

  const validate = (data: unknown) => {
    try {
      schema.parse(data)
      errors.value = {}
      return { success: true, data: data as T }
    } catch (error) {
      if (error instanceof z.ZodError) {
        errors.value = error.flatten().fieldErrors
      }
      return { success: false, error }
    }
  }

  const validateField = (field: string, value: unknown) => {
    try {
      schema.pick({ [field]: true }).parse({ [field]: value })
      delete errors.value[field]
    } catch (error) {
      if (error instanceof z.ZodError) {
        errors.value[field] = error.errors[0]?.message || 'Campo inválido'
      }
    }
  }

  return {
    errors: readonly(errors),
    isValid,
    validate,
    validateField
  }
}
```

## 📊 Performance

### Otimizações
```vue
<script setup lang="ts">
// ✅ BOM - Lazy loading de componentes
const HeavyComponent = defineAsyncComponent(() => import('./HeavyComponent.vue'))

// ✅ BOM - Memoização de computeds caros
const expensiveCalculation = computed(() => {
  return heavyCalculation(props.data)
})

// ✅ BOM - Debounce em inputs
const debouncedSearch = useDebounceFn(search, 300)
</script>
```

## 🔄 Git e Commits

### Conventional Commits
```bash
# ✅ BOM
feat: adiciona sistema de autenticação
fix: corrige bug na validação de email
docs: atualiza documentação da API
style: formata código com prettier
refactor: extrai lógica de validação
test: adiciona testes para UserService
chore: atualiza dependências

# ❌ EVITAR
fix bug
update
changes
WIP
```

## 📋 Checklist de Code Review

- [ ] Código segue os princípios SOLID?
- [ ] Nomenclatura é clara e descritiva?
- [ ] Funções são pequenas e focadas?
- [ ] TypeScript está tipado corretamente?
- [ ] Componentes têm responsabilidade única?
- [ ] Tratamento de erros está adequado?
- [ ] Testes cobrem casos importantes?
- [ ] Performance foi considerada?
- [ ] Acessibilidade foi implementada?
- [ ] Responsividade funciona em todos os dispositivos?
- [ ] Validação de formulários implementada?
- [ ] Feedback visual para estados de loading/erro?
- [ ] Mensagens de erro traduzidas?
- [ ] Validação em tempo real funcionando?
- [ ] UX consistente entre componentes?
