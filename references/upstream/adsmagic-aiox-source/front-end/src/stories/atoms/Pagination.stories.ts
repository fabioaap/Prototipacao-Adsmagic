import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import Pagination from '@/components/ui/Pagination.vue'

const meta: Meta<typeof Pagination> = {
    title: 'Atoms/Pagination',
    component: Pagination,
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: 'Componente de paginação para navegação entre páginas de resultados.'
            }
        }
    }
}

export default meta
type Story = StoryObj<typeof Pagination>

// Default
export const Default: Story = {
    render: () => ({
        components: { Pagination },
        setup() {
            const page = ref(1)
            return { page }
        },
        template: `
      <Pagination v-model:page="page" :total-pages="10" />
    `
    })
}

// Página do meio
export const MiddlePage: Story = {
    render: () => ({
        components: { Pagination },
        setup() {
            const page = ref(5)
            return { page }
        },
        template: `
      <Pagination v-model:page="page" :total-pages="10" />
    `
    })
}

// Última página
export const LastPage: Story = {
    render: () => ({
        components: { Pagination },
        setup() {
            const page = ref(10)
            return { page }
        },
        template: `
      <Pagination v-model:page="page" :total-pages="10" />
    `
    })
}

// Poucas páginas
export const FewPages: Story = {
    render: () => ({
        components: { Pagination },
        setup() {
            const page = ref(1)
            return { page }
        },
        template: `
      <Pagination v-model:page="page" :total-pages="3" />
    `
    })
}

// Muitas páginas
export const ManyPages: Story = {
    render: () => ({
        components: { Pagination },
        setup() {
            const page = ref(25)
            return { page }
        },
        template: `
      <Pagination v-model:page="page" :total-pages="100" />
    `
    })
}

// Com informação de itens
export const WithItemsInfo: Story = {
    render: () => ({
        components: { Pagination },
        setup() {
            const page = ref(2)
            const perPage = 10
            const totalItems = 97
            const totalPages = Math.ceil(totalItems / perPage)
            const startItem = (page.value - 1) * perPage + 1
            const endItem = Math.min(page.value * perPage, totalItems)
            return { page, totalPages, startItem, endItem, totalItems }
        },
        template: `
      <div class="flex items-center justify-between">
        <p class="text-sm text-muted-foreground">
          Mostrando {{ startItem }} a {{ endItem }} de {{ totalItems }} resultados
        </p>
        <Pagination v-model:page="page" :total-pages="totalPages" />
      </div>
    `
    })
}

// Em tabela
export const InTable: Story = {
    render: () => ({
        components: { Pagination },
        setup() {
            const page = ref(1)
            return { page }
        },
        template: `
      <div class="border rounded-lg">
        <table class="w-full">
          <thead class="bg-muted">
            <tr>
              <th class="text-left p-3 text-sm font-medium">Nome</th>
              <th class="text-left p-3 text-sm font-medium">Email</th>
              <th class="text-left p-3 text-sm font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="i in 5" :key="i" class="border-t">
              <td class="p-3 text-sm">Contato {{ (page - 1) * 5 + i }}</td>
              <td class="p-3 text-sm text-muted-foreground">contato{{ (page - 1) * 5 + i }}@email.com</td>
              <td class="p-3 text-sm">
                <span class="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">Ativo</span>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="p-3 border-t flex items-center justify-between">
          <p class="text-sm text-muted-foreground">5 de 50 contatos</p>
          <Pagination v-model:page="page" :total-pages="10" />
        </div>
      </div>
    `
    })
}

// Compact
export const Compact: Story = {
    render: () => ({
        components: { Pagination },
        setup() {
            const page = ref(3)
            return { page }
        },
        template: `
      <div class="flex items-center gap-2">
        <span class="text-sm text-muted-foreground">Página</span>
        <Pagination v-model:page="page" :total-pages="10" />
        <span class="text-sm text-muted-foreground">de 10</span>
      </div>
    `
    })
}

// Página única
export const SinglePage: Story = {
    render: () => ({
        components: { Pagination },
        setup() {
            const page = ref(1)
            return { page }
        },
        template: `
      <div class="space-y-2">
        <Pagination v-model:page="page" :total-pages="1" />
        <p class="text-sm text-muted-foreground">Quando há apenas uma página, a paginação pode ser ocultada ou mostrada desabilitada.</p>
      </div>
    `
    })
}
