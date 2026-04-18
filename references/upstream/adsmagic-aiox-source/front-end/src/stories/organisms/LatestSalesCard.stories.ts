import type { Meta, StoryObj } from '@storybook/vue3'
import LatestSalesCard from '@/components/features/dashboard/LatestSalesCard.vue'

/**
 * LatestSalesCard - Card de vendas recentes.
 * 
 * Exibe lista das últimas vendas realizadas com
 * informações do cliente, valor e data.
 */
const meta: Meta<typeof LatestSalesCard> = {
  title: 'Organisms/Dashboard/LatestSalesCard',
  component: LatestSalesCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Card com lista das vendas mais recentes.',
      },
    },
  },
  argTypes: {
    limit: {
      control: { type: 'number', min: 1, max: 20 },
      description: 'Número máximo de vendas a exibir',
    },
    loading: {
      control: 'boolean',
      description: 'Estado de carregamento',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

/**
 * Card de vendas padrão
 */
export const Default: Story = {
  args: {
    limit: 8,
    loading: false,
  },
  render: (args) => ({
    components: { LatestSalesCard },
    setup() {
      return { args }
    },
    template: `
      <div class="w-[400px]">
        <LatestSalesCard :limit="args.limit" :loading="args.loading" />
      </div>
    `,
  }),
}

/**
 * Estado de carregamento
 */
export const Loading: Story = {
  args: {
    limit: 6,
    loading: true,
  },
  render: (args) => ({
    components: { LatestSalesCard },
    setup() {
      return { args }
    },
    template: `
      <div class="w-[400px]">
        <LatestSalesCard :limit="args.limit" :loading="args.loading" />
      </div>
    `,
  }),
}

/**
 * Com limite menor
 */
export const LimiteMenor: Story = {
  args: {
    limit: 4,
    loading: false,
  },
  render: (args) => ({
    components: { LatestSalesCard },
    setup() {
      return { args }
    },
    template: `
      <div class="w-[400px]">
        <LatestSalesCard :limit="args.limit" :loading="args.loading" />
      </div>
    `,
  }),
}

/**
 * No contexto do dashboard
 */
export const NoDashboard: Story = {
  args: {
    limit: 6,
  },
  render: (args) => ({
    components: { LatestSalesCard },
    setup() {
      return { args }
    },
    template: `
      <div class="w-full max-w-4xl grid grid-cols-3 gap-6">
        <div class="col-span-2 space-y-4">
          <div class="h-[200px] bg-card rounded-lg border flex items-center justify-center">
            <span class="text-muted-foreground">Gráfico de vendas</span>
          </div>
          <div class="h-[200px] bg-card rounded-lg border flex items-center justify-center">
            <span class="text-muted-foreground">Gráfico de conversão</span>
          </div>
        </div>
        
        <div class="col-span-1">
          <LatestSalesCard :limit="args.limit" />
        </div>
      </div>
    `,
  }),
}

/**
 * Em layout de sidebar
 */
export const EmSidebar: Story = {
  args: {
    limit: 5,
  },
  render: (args) => ({
    components: { LatestSalesCard },
    setup() {
      return { args }
    },
    template: `
      <div class="flex gap-6 w-full max-w-5xl">
        <div class="flex-1 space-y-6">
          <div class="grid grid-cols-4 gap-4">
            <div class="p-4 bg-card rounded-lg border">
              <p class="text-xs text-muted-foreground">Receita</p>
              <p class="text-lg font-bold">R$ 47.500</p>
            </div>
            <div class="p-4 bg-card rounded-lg border">
              <p class="text-xs text-muted-foreground">Vendas</p>
              <p class="text-lg font-bold">89</p>
            </div>
            <div class="p-4 bg-card rounded-lg border">
              <p class="text-xs text-muted-foreground">Leads</p>
              <p class="text-lg font-bold">1.234</p>
            </div>
            <div class="p-4 bg-card rounded-lg border">
              <p class="text-xs text-muted-foreground">ROAS</p>
              <p class="text-lg font-bold">3.2x</p>
            </div>
          </div>
          
          <div class="h-[300px] bg-card rounded-lg border flex items-center justify-center">
            <span class="text-muted-foreground">Área de gráficos</span>
          </div>
        </div>
        
        <div class="w-[320px]">
          <LatestSalesCard :limit="args.limit" />
        </div>
      </div>
    `,
  }),
}
