import type { Meta, StoryObj } from '@storybook/vue3'

/**
 * EmptyState - Organismo de estado vazio.
 * 
 * Tela exibida quando não há dados para mostrar.
 */
const meta: Meta = {
  title: 'Organisms/EmptyState',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Componente para estados vazios com CTA.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

/**
 * Estado vazio padrão
 */
export const Default: Story = {
  render: () => ({
    template: `
      <div class="flex flex-col items-center justify-center p-12 text-center">
        <div class="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
          <span class="text-4xl">📋</span>
        </div>
        <h3 class="text-lg font-semibold mb-2">Nenhum item encontrado</h3>
        <p class="text-muted-foreground mb-6 max-w-md">
          Não há itens para exibir no momento. Comece adicionando o primeiro.
        </p>
        <button class="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm">
          Adicionar Item
        </button>
      </div>
    `,
  }),
}

/**
 * Sem contatos
 */
export const NoContacts: Story = {
  render: () => ({
    template: `
      <div class="flex flex-col items-center justify-center p-12 text-center">
        <div class="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <span class="text-4xl">👥</span>
        </div>
        <h3 class="text-lg font-semibold mb-2">Nenhum contato ainda</h3>
        <p class="text-muted-foreground mb-6 max-w-md">
          Adicione seu primeiro contato manualmente ou conecte uma integração para importar automaticamente.
        </p>
        <div class="flex gap-3">
          <button class="px-4 py-2 border rounded-md text-sm">
            Importar CSV
          </button>
          <button class="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm">
            + Novo Contato
          </button>
        </div>
      </div>
    `,
  }),
}

/**
 * Sem vendas
 */
export const NoSales: Story = {
  render: () => ({
    template: `
      <div class="flex flex-col items-center justify-center p-12 text-center">
        <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <span class="text-4xl">💰</span>
        </div>
        <h3 class="text-lg font-semibold mb-2">Nenhuma venda registrada</h3>
        <p class="text-muted-foreground mb-6 max-w-md">
          Registre sua primeira venda para começar a acompanhar seus resultados.
        </p>
        <button class="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm">
          + Registrar Venda
        </button>
      </div>
    `,
  }),
}

/**
 * Busca sem resultados
 */
export const NoSearchResults: Story = {
  render: () => ({
    template: `
      <div class="flex flex-col items-center justify-center p-12 text-center">
        <div class="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
          <span class="text-4xl">🔍</span>
        </div>
        <h3 class="text-lg font-semibold mb-2">Nenhum resultado</h3>
        <p class="text-muted-foreground mb-6 max-w-md">
          Não encontramos resultados para "<strong>termo buscado</strong>". Tente usar termos diferentes.
        </p>
        <button class="px-4 py-2 border rounded-md text-sm">
          Limpar busca
        </button>
      </div>
    `,
  }),
}

/**
 * Sem integrações
 */
export const NoIntegrations: Story = {
  render: () => ({
    template: `
      <div class="flex flex-col items-center justify-center p-12 text-center bg-amber-50 border border-amber-200 rounded-lg">
        <div class="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-4">
          <span class="text-4xl">⚡</span>
        </div>
        <h3 class="text-lg font-semibold mb-2 text-amber-800">Conecte suas plataformas</h3>
        <p class="text-amber-700 mb-6 max-w-md">
          Para começar a rastrear suas campanhas, conecte pelo menos uma plataforma de anúncios.
        </p>
        <button class="px-4 py-2 bg-amber-600 text-white rounded-md text-sm hover:bg-amber-700">
          Configurar Integrações
        </button>
      </div>
    `,
  }),
}

/**
 * Erro ao carregar
 */
export const LoadError: Story = {
  render: () => ({
    template: `
      <div class="flex flex-col items-center justify-center p-12 text-center">
        <div class="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <span class="text-4xl">⚠️</span>
        </div>
        <h3 class="text-lg font-semibold mb-2 text-red-600">Erro ao carregar dados</h3>
        <p class="text-muted-foreground mb-6 max-w-md">
          Ocorreu um erro ao carregar os dados. Por favor, tente novamente.
        </p>
        <button class="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm">
          Tentar novamente
        </button>
      </div>
    `,
  }),
}
