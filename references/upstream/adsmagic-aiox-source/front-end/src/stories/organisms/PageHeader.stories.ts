import type { Meta, StoryObj } from '@storybook/vue3'

/**
 * PageHeader - Organismo de cabeçalho de página.
 * 
 * Header reutilizável com título, descrição e ações.
 */
const meta: Meta = {
  title: 'Organisms/PageHeader',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Cabeçalho de página com título, breadcrumb e ações.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

/**
 * Cabeçalho padrão
 */
export const Default: Story = {
  render: () => ({
    template: `
      <div class="border-b pb-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold">Dashboard</h1>
            <p class="text-muted-foreground">Visão geral das suas métricas</p>
          </div>
          <div class="flex items-center gap-2">
            <button class="px-3 py-1.5 text-sm border rounded-md">
              📅 Últimos 30 dias
            </button>
            <button class="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md">
              Exportar
            </button>
          </div>
        </div>
      </div>
    `,
  }),
}

/**
 * Com breadcrumb
 */
export const WithBreadcrumb: Story = {
  render: () => ({
    template: `
      <div class="border-b pb-6">
        <nav class="text-sm text-muted-foreground mb-2">
          <a href="#" class="hover:text-foreground">Home</a>
          <span class="mx-2">/</span>
          <a href="#" class="hover:text-foreground">Contatos</a>
          <span class="mx-2">/</span>
          <span class="text-foreground">João Silva</span>
        </nav>
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold">João Silva</h1>
            <p class="text-muted-foreground">joao@email.com</p>
          </div>
          <div class="flex items-center gap-2">
            <button class="px-3 py-1.5 text-sm border rounded-md">
              Editar
            </button>
            <button class="px-3 py-1.5 text-sm border border-red-300 text-red-600 rounded-md">
              Excluir
            </button>
          </div>
        </div>
      </div>
    `,
  }),
}

/**
 * Com abas
 */
export const WithTabs: Story = {
  render: () => ({
    template: `
      <div>
        <div class="flex items-center justify-between mb-4">
          <div>
            <h1 class="text-2xl font-bold">Configurações</h1>
            <p class="text-muted-foreground">Gerencie as configurações do seu projeto</p>
          </div>
        </div>
        <div class="flex gap-1 border-b">
          <button class="px-4 py-2 text-sm font-medium border-b-2 border-primary text-primary">
            Geral
          </button>
          <button class="px-4 py-2 text-sm text-muted-foreground hover:text-foreground">
            Funil de Vendas
          </button>
          <button class="px-4 py-2 text-sm text-muted-foreground hover:text-foreground">
            Origens
          </button>
          <button class="px-4 py-2 text-sm text-muted-foreground hover:text-foreground">
            Equipe
          </button>
        </div>
      </div>
    `,
  }),
}

/**
 * Com status
 */
export const WithStatus: Story = {
  render: () => ({
    template: `
      <div class="border-b pb-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <span class="text-xl">📁</span>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h1 class="text-2xl font-bold">E-commerce Fashion</h1>
                <span class="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">
                  Ativo
                </span>
              </div>
              <p class="text-muted-foreground">Criado em 10/01/2024</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button class="px-3 py-1.5 text-sm border rounded-md">
              ⚙️ Configurações
            </button>
          </div>
        </div>
      </div>
    `,
  }),
}

/**
 * Simples
 */
export const Simple: Story = {
  render: () => ({
    template: `
      <div class="mb-6">
        <h1 class="text-2xl font-bold">Contatos</h1>
        <p class="text-muted-foreground">1.234 contatos no total</p>
      </div>
    `,
  }),
}
