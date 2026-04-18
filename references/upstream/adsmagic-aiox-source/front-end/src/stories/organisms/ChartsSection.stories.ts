import type { Meta, StoryObj } from '@storybook/vue3'
import ChartsSection from '@/components/features/dashboard/ChartsSection.vue'

/**
 * ChartsSection - Seção de gráficos do dashboard.
 * 
 * Organismo que agrupa os gráficos principais:
 * vendas por origem, receita por origem e evolução temporal.
 */
const meta: Meta<typeof ChartsSection> = {
  title: 'Organisms/Dashboard/ChartsSection',
  component: ChartsSection,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Seção completa de gráficos do dashboard.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

/**
 * Seção de gráficos padrão
 */
export const Default: Story = {
  render: () => ({
    components: { ChartsSection },
    template: `
      <div class="w-full max-w-7xl">
        <ChartsSection />
      </div>
    `,
  }),
}

/**
 * No contexto do dashboard
 */
export const NoDashboard: Story = {
  render: () => ({
    components: { ChartsSection },
    template: `
      <div class="w-full max-w-7xl space-y-6">
        <!-- Simulação de métricas acima -->
        <div class="grid grid-cols-5 gap-4">
          <div class="p-4 bg-card rounded-lg border">
            <p class="text-xs text-muted-foreground">Receita</p>
            <p class="text-xl font-bold">R$ 47.500</p>
          </div>
          <div class="p-4 bg-card rounded-lg border">
            <p class="text-xs text-muted-foreground">Vendas</p>
            <p class="text-xl font-bold">89</p>
          </div>
          <div class="p-4 bg-card rounded-lg border">
            <p class="text-xs text-muted-foreground">Leads</p>
            <p class="text-xl font-bold">1.234</p>
          </div>
          <div class="p-4 bg-card rounded-lg border">
            <p class="text-xs text-muted-foreground">ROAS</p>
            <p class="text-xl font-bold">3.2x</p>
          </div>
          <div class="p-4 bg-card rounded-lg border">
            <p class="text-xs text-muted-foreground">CPA</p>
            <p class="text-xl font-bold">R$ 156</p>
          </div>
        </div>
        
        <!-- Gráficos -->
        <div>
          <h3 class="text-lg font-semibold mb-4">Análise Visual</h3>
          <ChartsSection />
        </div>
      </div>
    `,
  }),
}

/**
 * Com filtros de período
 */
export const ComFiltros: Story = {
  render: () => ({
    components: { ChartsSection },
    template: `
      <div class="w-full max-w-7xl space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-semibold">Gráficos de Performance</h2>
          <div class="flex items-center gap-2">
            <button class="px-3 py-1.5 text-sm border rounded-md bg-card">7 dias</button>
            <button class="px-3 py-1.5 text-sm border rounded-md bg-accent">30 dias</button>
            <button class="px-3 py-1.5 text-sm border rounded-md bg-card">90 dias</button>
          </div>
        </div>
        
        <ChartsSection />
      </div>
    `,
  }),
}
