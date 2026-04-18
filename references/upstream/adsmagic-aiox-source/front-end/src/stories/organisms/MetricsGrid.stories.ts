import type { Meta, StoryObj } from '@storybook/vue3'
import MetricsGrid from '@/components/features/dashboard/MetricsGrid.vue'

/**
 * MetricsGrid - Grid de métricas do dashboard.
 * 
 * Organismo que exibe todas as métricas principais do dashboard
 * em formato de grid responsivo com cards informativos.
 */
const meta: Meta<typeof MetricsGrid> = {
  title: 'Organisms/Dashboard/MetricsGrid',
  component: MetricsGrid,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Grid completo de métricas do dashboard com receita, vendas, ROI, etc.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

/**
 * Grid de métricas padrão
 */
export const Default: Story = {
  render: () => ({
    components: { MetricsGrid },
    template: `
      <div class="w-full max-w-7xl">
        <MetricsGrid />
      </div>
    `,
  }),
}

/**
 * No contexto do dashboard completo
 */
export const NoDashboard: Story = {
  render: () => ({
    components: { MetricsGrid },
    template: `
      <div class="w-full max-w-7xl bg-muted/30 rounded-lg p-6">
        <div class="mb-6">
          <h1 class="text-2xl font-bold">Dashboard</h1>
          <p class="text-muted-foreground">Visão geral das suas métricas</p>
        </div>
        
        <MetricsGrid />
        
        <div class="mt-6 grid grid-cols-2 gap-6">
          <div class="h-[200px] bg-card rounded-lg border flex items-center justify-center">
            <span class="text-muted-foreground">Gráfico de vendas</span>
          </div>
          <div class="h-[200px] bg-card rounded-lg border flex items-center justify-center">
            <span class="text-muted-foreground">Gráfico de conversão</span>
          </div>
        </div>
      </div>
    `,
  }),
}

/**
 * Com header de período
 */
export const ComHeaderPeriodo: Story = {
  render: () => ({
    components: { MetricsGrid },
    template: `
      <div class="w-full max-w-7xl space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-xl font-semibold">Métricas de Performance</h2>
            <p class="text-sm text-muted-foreground">Últimos 30 dias</p>
          </div>
          <button class="px-3 py-1.5 text-sm border rounded-md bg-card hover:bg-accent">
            Alterar período
          </button>
        </div>
        
        <MetricsGrid />
      </div>
    `,
  }),
}

/**
 * Em card container
 */
export const EmCardContainer: Story = {
  render: () => ({
    components: { MetricsGrid },
    template: `
      <div class="w-full max-w-7xl bg-card rounded-xl border shadow-sm p-6">
        <div class="flex items-center justify-between mb-6">
          <h3 class="font-semibold">Resumo de Métricas</h3>
          <button class="text-sm text-primary hover:underline">
            Ver relatório completo →
          </button>
        </div>
        
        <MetricsGrid />
      </div>
    `,
  }),
}
