import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import SearchBar from '@/components/ui/SearchBar.vue'

const meta: Meta<typeof SearchBar> = {
    title: 'Atoms/SearchBar',
    component: SearchBar,
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: 'Barra de busca com ícone e opção de limpar. Utilizada para filtrar listas e tabelas.'
            }
        }
    }
}

export default meta
type Story = StoryObj<typeof SearchBar>

// Default
export const Default: Story = {
    render: () => ({
        components: { SearchBar },
        setup() {
            const query = ref('')
            return { query }
        },
        template: `
      <div class="w-[300px]">
        <SearchBar v-model="query" placeholder="Buscar..." />
        <p class="mt-2 text-sm text-muted-foreground">Valor: "{{ query }}"</p>
      </div>
    `
    })
}

// Buscar contatos
export const SearchContacts: Story = {
    render: () => ({
        components: { SearchBar },
        setup() {
            const query = ref('')
            return { query }
        },
        template: `
      <div class="w-[400px]">
        <SearchBar v-model="query" placeholder="Buscar contatos por nome, email ou telefone..." />
      </div>
    `
    })
}

// Com valor preenchido
export const WithValue: Story = {
    render: () => ({
        components: { SearchBar },
        setup() {
            const query = ref('João Silva')
            return { query }
        },
        template: `
      <div class="w-[300px]">
        <SearchBar v-model="query" placeholder="Buscar..." />
      </div>
    `
    })
}

// Em header
export const InHeader: Story = {
    render: () => ({
        components: { SearchBar },
        setup() {
            const query = ref('')
            return { query }
        },
        template: `
      <div class="flex items-center justify-between p-4 bg-background border-b">
        <h1 class="text-lg font-semibold">Contatos</h1>
        <div class="flex items-center gap-4">
          <SearchBar v-model="query" placeholder="Buscar contato..." class="w-[250px]" />
          <button class="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm">
            + Novo contato
          </button>
        </div>
      </div>
    `
    })
}

// Busca global
export const GlobalSearch: Story = {
    render: () => ({
        components: { SearchBar },
        setup() {
            const query = ref('')
            return { query }
        },
        template: `
      <div class="w-[500px] p-4">
        <div class="relative">
          <SearchBar 
            v-model="query" 
            placeholder="Buscar em tudo... (Ctrl+K)"
            class="pr-16"
          />
          <kbd class="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 bg-muted text-muted-foreground text-xs rounded">
            Ctrl+K
          </kbd>
        </div>
        <p class="mt-2 text-xs text-muted-foreground">
          Busque por contatos, vendas, projetos e configurações
        </p>
      </div>
    `
    })
}

// Com resultados
export const WithResults: Story = {
    render: () => ({
        components: { SearchBar },
        setup() {
            const query = ref('João')
            const results = [
                { name: 'João Silva', email: 'joao@email.com', type: 'contato' },
                { name: 'João Santos', email: 'joaosantos@email.com', type: 'contato' },
                { name: 'João Oliveira', email: 'joliveira@email.com', type: 'contato' }
            ]
            return { query, results }
        },
        template: `
      <div class="w-[400px]">
        <SearchBar v-model="query" placeholder="Buscar..." />
        <div v-if="query" class="mt-2 p-2 border rounded-md shadow-lg bg-background">
          <p class="text-xs text-muted-foreground mb-2">{{ results.length }} resultados encontrados</p>
          <div class="space-y-1">
            <button 
              v-for="result in results" 
              :key="result.email"
              class="w-full flex items-center gap-3 p-2 hover:bg-muted rounded text-left"
            >
              <div class="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium">
                {{ result.name.split(' ').map(n => n[0]).join('') }}
              </div>
              <div>
                <p class="font-medium text-sm">{{ result.name }}</p>
                <p class="text-xs text-muted-foreground">{{ result.email }}</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    `
    })
}

// Sem resultados
export const NoResults: Story = {
    render: () => ({
        components: { SearchBar },
        setup() {
            const query = ref('xyzabc123')
            return { query }
        },
        template: `
      <div class="w-[400px]">
        <SearchBar v-model="query" placeholder="Buscar..." />
        <div v-if="query" class="mt-2 p-6 border rounded-md text-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="mx-auto text-muted-foreground mb-2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
          <p class="font-medium">Nenhum resultado encontrado</p>
          <p class="text-sm text-muted-foreground">Tente buscar por outro termo</p>
        </div>
      </div>
    `
    })
}

// Diferentes tamanhos
export const Sizes: Story = {
    render: () => ({
        components: { SearchBar },
        setup() {
            const q1 = ref('')
            const q2 = ref('')
            const q3 = ref('')
            return { q1, q2, q3 }
        },
        template: `
      <div class="space-y-4">
        <div>
          <p class="text-sm mb-2">Small (w-48)</p>
          <SearchBar v-model="q1" placeholder="Buscar..." class="w-48" />
        </div>
        <div>
          <p class="text-sm mb-2">Medium (w-64)</p>
          <SearchBar v-model="q2" placeholder="Buscar..." class="w-64" />
        </div>
        <div>
          <p class="text-sm mb-2">Large (w-96)</p>
          <SearchBar v-model="q3" placeholder="Buscar..." class="w-96" />
        </div>
      </div>
    `
    })
}
