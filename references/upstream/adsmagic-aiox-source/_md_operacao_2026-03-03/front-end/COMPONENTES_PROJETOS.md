# Guia de Uso dos Componentes de Projetos

## 1. TrialBanner

Banner de aviso de trial expirando com botão de ação.

### Props
- `daysRemaining: number` - Dias restantes (required)
- `onChoosePlan?: () => void` - Callback do botão de plano
- `onDismiss?: () => void` - Callback do botão fechar
- `dismissible?: boolean` - Se pode ser fechado (default: false)

### Exemplo
```vue
<template>
  <TrialBanner
    :days-remaining="3"
    @choose-plan="handleChoosePlan"
    dismissible
  />
</template>

<script setup lang="ts">
import TrialBanner from '@/components/ui/TrialBanner.vue'

function handleChoosePlan() {
  // Navegar para página de planos
  router.push('/planos')
}
</script>
```

### Níveis de Urgência
- **critical** (0-1 dias): Vermelho
- **high** (2-3 dias): Amarelo
- **medium** (4-7 dias): Azul
- **low** (8+ dias): Cinza

---

## 2. SearchBar

Campo de busca com ícone e botão de limpar.

### Props
- `modelValue: string` - Valor do input (required)
- `placeholder?: string` - Texto placeholder (default: "Pesquisar...")
- `disabled?: boolean` - Se está desabilitado (default: false)

### Eventos
- `@update:modelValue` - Atualiza o valor
- `@clear` - Disparado ao limpar
- `@search` - Disparado ao pressionar Enter

### Exemplo
```vue
<template>
  <SearchBar
    v-model="searchTerm"
    placeholder="Pesquisar projeto..."
    @search="handleSearch"
    @clear="handleClear"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import SearchBar from '@/components/ui/SearchBar.vue'

const searchTerm = ref('')

function handleSearch(value: string) {
  console.log('Pesquisando:', value)
}

function handleClear() {
  console.log('Busca limpa')
}
</script>
```

---

## 3. Select

Dropdown customizado com opções.

### Props
- `modelValue: string` - Valor selecionado (required)
- `options: SelectOption[]` - Lista de opções (required)
- `placeholder?: string` - Texto placeholder (default: "Selecione...")
- `disabled?: boolean` - Se está desabilitado (default: false)
- `size?: 'default' | 'sm' | 'lg'` - Tamanho (default: 'default')

### Interface SelectOption
```typescript
interface SelectOption {
  value: string
  label: string
}
```

### Exemplo
```vue
<template>
  <Select
    v-model="sortBy"
    :options="sortOptions"
    placeholder="Ordenar por..."
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Select from '@/components/ui/Select.vue'

const sortBy = ref('created_at')

const sortOptions = [
  { value: 'created_at', label: 'Data de criação' },
  { value: 'name_asc', label: 'Nome (A-Z)' },
  { value: 'name_desc', label: 'Nome (Z-A)' },
]
</script>
```

---

## 4. ProjectsTable

Tabela completa de projetos com métricas e comparativos.

### Props
- `projects: Project[]` - Lista de projetos (required)
- `isLoading?: boolean` - Estado de carregamento (default: false)

### Eventos
- `@project-click` - Disparado ao clicar em um projeto
- `@edit` - Disparado ao clicar em editar (não implementado ainda)
- `@delete` - Disparado ao clicar em deletar (não implementado ainda)

### Interface Project
```typescript
interface Project {
  id: string
  name: string
  whatsappStatus: 'connected' | 'disconnected'
  metrics: ProjectMetrics
  comparison: MetricsComparison
  createdAt: Date
  updatedAt: Date
}
```

### Exemplo
```vue
<template>
  <ProjectsTable
    :projects="projects"
    :is-loading="isLoading"
    @project-click="handleProjectClick"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ProjectsTable from '@/components/projects/ProjectsTable.vue'
import type { Project } from '@/types/project'

const projects = ref<Project[]>([])
const isLoading = ref(false)

function handleProjectClick(project: Project) {
  console.log('Projeto clicado:', project)
  // Navegar para detalhes
  router.push(`/projetos/${project.id}`)
}
</script>
```

### Estados da Tabela
1. **Loading**: Exibe skeleton loading
2. **Empty**: Mensagem quando não há projetos
3. **Filled**: Exibe todos os projetos com métricas

---

## 5. CreateProjectModal

Modal para criar novo projeto.

### Props
- `open: boolean` - Se o modal está aberto (required)
- `isLoading?: boolean` - Estado de criação (default: false)

### Eventos
- `@update:open` - Atualiza o estado de aberto/fechado
- `@submit` - Disparado ao submeter o formulário (recebe o nome)

### Exemplo
```vue
<template>
  <div>
    <Button @click="showModal = true">
      Criar Projeto
    </Button>

    <CreateProjectModal
      v-model:open="showModal"
      :is-loading="isCreating"
      @submit="handleCreate"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import CreateProjectModal from '@/components/projects/CreateProjectModal.vue'
import Button from '@/components/ui/Button.vue'

const showModal = ref(false)
const isCreating = ref(false)

async function handleCreate(name: string) {
  isCreating.value = true
  try {
    // Criar projeto
    await createProject({ name })
    showModal.value = false
  } catch (error) {
    console.error(error)
  } finally {
    isCreating.value = false
  }
}
</script>
```

### Validações
- Nome obrigatório
- Mínimo 2 caracteres
- Máximo 100 caracteres

---

## 6. Store de Projetos

### Importar
```typescript
import { useProjectsStore } from '@/stores/projects'

const projectsStore = useProjectsStore()
```

### State
```typescript
projectsStore.projects         // Lista de projetos
projectsStore.currentProject   // Projeto atual
projectsStore.isLoading        // Estado de loading
projectsStore.error            // Mensagem de erro
projectsStore.searchTerm       // Termo de busca
projectsStore.sortBy           // Tipo de ordenação
```

### Getters
```typescript
projectsStore.projectsCount              // Total de projetos
projectsStore.connectedProjectsCount     // Projetos conectados
projectsStore.disconnectedProjectsCount  // Projetos desconectados
projectsStore.totalMetrics               // Métricas agregadas
projectsStore.averageConversionRate      // Taxa de conversão média
```

### Actions
```typescript
// Buscar projetos
await projectsStore.fetchProjects()

// Buscar por ID
const project = await projectsStore.fetchProjectById('id')

// Criar projeto
const newProject = await projectsStore.createProject({ name: 'Novo Projeto' })

// Atualizar projeto
await projectsStore.updateProject('id', { name: 'Nome Atualizado' })

// Deletar projeto
await projectsStore.deleteProject('id')

// Testar conexão WhatsApp
const isConnected = await projectsStore.testWhatsAppConnection('id')

// Filtros
projectsStore.setSearchTerm('termo')
projectsStore.setSortBy('name_asc')
projectsStore.clearFilters()
```

### Exemplo Completo
```vue
<template>
  <div>
    <SearchBar
      v-model="projectsStore.searchTerm"
      @search="handleSearch"
    />

    <ProjectsTable
      :projects="projectsStore.projects"
      :is-loading="projectsStore.isLoading"
      @project-click="handleProjectClick"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useProjectsStore } from '@/stores/projects'
import SearchBar from '@/components/ui/SearchBar.vue'
import ProjectsTable from '@/components/projects/ProjectsTable.vue'

const projectsStore = useProjectsStore()

onMounted(async () => {
  await projectsStore.initialize()
})

function handleSearch() {
  // A store já faz o fetch automaticamente via watcher
}

function handleProjectClick(project: Project) {
  projectsStore.setCurrentProject(project)
  // Navegar para detalhes
}
</script>
```

---

## 7. Serviço de Projetos

### Importar
```typescript
import { projectsService } from '@/services/projects'
```

### Métodos
```typescript
// Listar projetos
const projects = await projectsService.getProjects({
  search: 'termo',
  sortBy: 'name_asc',
  whatsappStatus: 'connected'
})

// Buscar por ID
const project = await projectsService.getProjectById('id')

// Criar
const newProject = await projectsService.createProject({
  name: 'Novo Projeto'
})

// Atualizar
const updated = await projectsService.updateProject('id', {
  name: 'Nome Atualizado',
  whatsappStatus: 'connected'
})

// Deletar
await projectsService.deleteProject('id')

// Testar conexão
const isConnected = await projectsService.testWhatsAppConnection('id')
```

### Nota sobre Mock
O serviço atual é um mock que usa localStorage. Para integrar com backend:

1. Edite `/front-end/src/services/projects.ts`
2. Crie uma classe `RealProjectsService` implementando a interface
3. Atualize a factory function:

```typescript
export function createProjectsService(): ProjectsService {
  // Trocar de MockProjectsService para RealProjectsService
  return new RealProjectsService()
}
```

---

## 8. Types e Validação

### Importar Types
```typescript
import type {
  Project,
  CreateProjectData,
  UpdateProjectData,
  ProjectFilters,
  ProjectSortType,
  WhatsAppStatus,
  ProjectMetrics,
  MetricsComparison,
} from '@/types/project'
```

### Schemas Zod
```typescript
import {
  projectSchema,
  createProjectSchema,
  updateProjectSchema,
} from '@/types/project'

// Validar projeto completo
const result = projectSchema.safeParse(data)

// Validar criação
const createResult = createProjectSchema.safeParse({ name: 'Projeto' })

// Validar atualização
const updateResult = updateProjectSchema.safeParse({ name: 'Novo Nome' })
```

---

## Exemplos de Uso Avançado

### 1. Busca com Debounce
```vue
<script setup lang="ts">
import { watchDebounced } from '@vueuse/core'
import { useProjectsStore } from '@/stores/projects'

const projectsStore = useProjectsStore()

watchDebounced(
  () => projectsStore.searchTerm,
  async () => {
    await projectsStore.fetchProjects()
  },
  { debounce: 300 }
)
</script>
```

### 2. Filtros Múltiplos
```vue
<script setup lang="ts">
import { computed } from 'vue'
import { useProjectsStore } from '@/stores/projects'

const projectsStore = useProjectsStore()

const filteredProjects = computed(() => {
  let projects = projectsStore.projects

  // Filtrar por status
  if (statusFilter.value) {
    projects = projects.filter(p => p.whatsappStatus === statusFilter.value)
  }

  // Filtrar por vendas
  if (onlyWithSales.value) {
    projects = projects.filter(p => p.metrics.sales > 0)
  }

  return projects
})
</script>
```

### 3. Métricas Agregadas
```vue
<script setup lang="ts">
import { computed } from 'vue'
import { useProjectsStore } from '@/stores/projects'

const projectsStore = useProjectsStore()

const totalRevenue = computed(() => {
  return projectsStore.projects.reduce(
    (sum, project) => sum + project.metrics.revenue,
    0
  )
})

const averageTicket = computed(() => {
  const projectsWithSales = projectsStore.projects.filter(
    p => p.metrics.sales > 0
  )

  if (projectsWithSales.length === 0) return 0

  const sum = projectsWithSales.reduce(
    (acc, p) => acc + p.metrics.averageTicket,
    0
  )

  return sum / projectsWithSales.length
})
</script>
```

---

## Dicas de Performance

1. **Use computed para derivar dados**
```typescript
const filteredProjects = computed(() => {
  // Cálculos aqui
})
```

2. **Debounce em buscas**
```typescript
watchDebounced(searchTerm, handleSearch, { debounce: 300 })
```

3. **Lazy loading de rotas**
```typescript
{
  path: '/projetos',
  component: () => import('@/views/projects/ProjectsView.vue')
}
```

4. **Skeleton loading states**
```vue
<ProjectsTable :is-loading="true" :projects="[]" />
```

---

## Troubleshooting

### Projetos não aparecem
- Verifique se `projectsStore.initialize()` foi chamado
- Verifique localStorage (chave: `adsmagic_projects`)
- Verifique console para erros

### Busca não funciona
- Verifique se `watchDebounced` está importado de `@vueuse/core`
- Verifique se o termo está sendo atualizado corretamente

### Tabela não renderiza
- Verifique se `projects` é um array válido
- Verifique se as datas são objetos Date válidos
- Verifique console para erros de tipos

---

**Última atualização**: 17/10/2025
