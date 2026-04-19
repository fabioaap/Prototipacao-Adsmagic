import type { Meta, StoryObj } from '@storybook/vue3'
import PerformanceTable from '@/components/features/analytics/PerformanceTable.vue'

/**
 * PerformanceTable - Tabela de performance por origem.
 * 
 * Exibe dados de vendas, receita e ticket médio
 * agrupados por origem de contato.
 */
const meta: Meta<typeof PerformanceTable> = {
  title: 'Organisms/Analytics/PerformanceTable',
  component: PerformanceTable,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Tabela de performance com métricas por origem.',
      },
    },
  },
  argTypes: {
    projectId: {
      control: 'text',
      description: 'ID do projeto',
    },
    autoFetch: {
      control: 'boolean',
      description: 'Buscar dados automaticamente',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

/**
 * Tabela de performance padrão
 */
export const Default: Story = {
  args: {
    projectId: '1',
    autoFetch: true,
  },
  render: (args) => ({
    components: { PerformanceTable },
    setup() {
      return { args }
    },
    template: `
      <div class="w-full max-w-4xl">
        <PerformanceTable :projectId="args.projectId" :autoFetch="args.autoFetch" />
      </div>
    `,
  }),
}

/**
 * No contexto de analytics
 */
export const NoContextoAnalytics: Story = {
  args: {
    projectId: '1',
  },
  render: (args) => ({
    components: { PerformanceTable },
    setup() {
      return { args }
    },
    template: `
      <div class="w-full max-w-5xl space-y-6">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-semibold">Analytics de Vendas</h2>
          <div class="flex items-center gap-2">
            <button class="px-3 py-1.5 text-sm border rounded-md bg-card">7 dias</button>
            <button class="px-3 py-1.5 text-sm border rounded-md bg-accent">30 dias</button>
            <button class="px-3 py-1.5 text-sm border rounded-md bg-card">90 dias</button>
          </div>
        </div>
        
        <div class="grid grid-cols-2 gap-6">
          <div class="h-[200px] bg-card rounded-lg border flex items-center justify-center">
            <span class="text-muted-foreground">Gráfico de pizza</span>
          </div>
          <div class="h-[200px] bg-card rounded-lg border flex items-center justify-center">
            <span class="text-muted-foreground">Gráfico de barras</span>
          </div>
        </div>
        
        <PerformanceTable :projectId="args.projectId" />
      </div>
    `,
  }),
}

/**
 * Em painel de relatório
 */
export const EmPainelRelatorio: Story = {
  args: {
    projectId: '2',
  },
  render: (args) => ({
    components: { PerformanceTable },
    setup() {
      return { args }
    },
    template: `
      <div class="w-full max-w-4xl bg-card rounded-lg border">
        <div class="p-4 border-b flex items-center justify-between">
          <h3 class="font-semibold">Performance por Origem</h3>
          <button class="text-sm text-primary hover:underline">
            Exportar CSV
          </button>
        </div>
        <div class="p-4">
          <PerformanceTable :projectId="args.projectId" />
        </div>
      </div>
    `,
  }),
}
