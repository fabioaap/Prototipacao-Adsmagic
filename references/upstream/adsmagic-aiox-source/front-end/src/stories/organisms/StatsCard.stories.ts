import type { Meta, StoryObj } from '@storybook/vue3'

/**
 * StatsCard - Organismo de card de estatísticas.
 * 
 * Card com KPI principal, variação e gráfico mini.
 */
const meta: Meta = {
  title: 'Organisms/StatsCard',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Card de estatísticas com KPI, variação e visualização.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

/**
 * Card de estatística padrão
 */
export const Default: Story = {
  render: () => ({
    template: `
      <div class="w-72 p-4 bg-card rounded-lg border">
        <div class="flex items-center justify-between mb-3">
          <p class="text-sm text-muted-foreground">Total de Vendas</p>
          <span class="text-muted-foreground">💰</span>
        </div>
        <div class="flex items-end justify-between">
          <div>
            <p class="text-2xl font-bold">R$ 47.500</p>
            <div class="flex items-center gap-1 mt-1">
              <span class="text-xs text-green-600">↑ +12%</span>
              <span class="text-xs text-muted-foreground">vs anterior</span>
            </div>
          </div>
          <div class="flex items-end gap-0.5 h-10">
            <div class="w-1 bg-primary/40 rounded" style="height: 40%"></div>
            <div class="w-1 bg-primary/40 rounded" style="height: 60%"></div>
            <div class="w-1 bg-primary/40 rounded" style="height: 45%"></div>
            <div class="w-1 bg-primary/40 rounded" style="height: 80%"></div>
            <div class="w-1 bg-primary/40 rounded" style="height: 65%"></div>
            <div class="w-1 bg-primary rounded" style="height: 100%"></div>
          </div>
        </div>
      </div>
    `,
  }),
}

/**
 * Card com variação negativa
 */
export const NegativeChange: Story = {
  render: () => ({
    template: `
      <div class="w-72 p-4 bg-card rounded-lg border">
        <div class="flex items-center justify-between mb-3">
          <p class="text-sm text-muted-foreground">CPA</p>
          <span class="text-muted-foreground">📈</span>
        </div>
        <div class="flex items-end justify-between">
          <div>
            <p class="text-2xl font-bold">R$ 167</p>
            <div class="flex items-center gap-1 mt-1">
              <span class="text-xs text-red-500">↑ +5%</span>
              <span class="text-xs text-muted-foreground">vs anterior</span>
            </div>
          </div>
          <div class="flex items-end gap-0.5 h-10">
            <div class="w-1 bg-red-300 rounded" style="height: 50%"></div>
            <div class="w-1 bg-red-300 rounded" style="height: 55%"></div>
            <div class="w-1 bg-red-300 rounded" style="height: 70%"></div>
            <div class="w-1 bg-red-300 rounded" style="height: 75%"></div>
            <div class="w-1 bg-red-400 rounded" style="height: 90%"></div>
            <div class="w-1 bg-red-500 rounded" style="height: 100%"></div>
          </div>
        </div>
      </div>
    `,
  }),
}

/**
 * Card ROAS destacado
 */
export const ROASHighlight: Story = {
  render: () => ({
    template: `
      <div class="w-72 p-4 bg-primary/5 rounded-lg border border-primary/20">
        <div class="flex items-center justify-between mb-3">
          <p class="text-sm text-primary">ROAS</p>
          <span class="text-primary">🎯</span>
        </div>
        <div class="flex items-end justify-between">
          <div>
            <p class="text-3xl font-bold text-primary">3.2x</p>
            <div class="flex items-center gap-1 mt-1">
              <span class="text-xs text-green-600">↑ +0.4x</span>
              <span class="text-xs text-muted-foreground">vs anterior</span>
            </div>
          </div>
          <div class="text-right">
            <p class="text-xs text-muted-foreground">Meta: 3.0x</p>
            <p class="text-xs text-green-600">✓ Acima da meta</p>
          </div>
        </div>
      </div>
    `,
  }),
}

/**
 * Card com progresso
 */
export const WithProgress: Story = {
  render: () => ({
    template: `
      <div class="w-72 p-4 bg-card rounded-lg border">
        <div class="flex items-center justify-between mb-3">
          <p class="text-sm text-muted-foreground">Meta Mensal</p>
          <span class="text-muted-foreground">🎯</span>
        </div>
        <div>
          <div class="flex items-baseline gap-2 mb-2">
            <p class="text-2xl font-bold">R$ 47.500</p>
            <p class="text-sm text-muted-foreground">/ R$ 60.000</p>
          </div>
          <div class="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div class="h-full bg-primary rounded-full" style="width: 79%"></div>
          </div>
          <p class="text-xs text-muted-foreground mt-1">79% da meta atingida</p>
        </div>
      </div>
    `,
  }),
}

/**
 * Card compacto
 */
export const Compact: Story = {
  render: () => ({
    template: `
      <div class="grid grid-cols-4 gap-4">
        <div class="p-3 bg-card rounded-lg border">
          <p class="text-xs text-muted-foreground mb-1">Investimento</p>
          <p class="text-lg font-bold">R$ 14.850</p>
        </div>
        <div class="p-3 bg-card rounded-lg border">
          <p class="text-xs text-muted-foreground mb-1">Receita</p>
          <p class="text-lg font-bold text-green-600">R$ 47.500</p>
        </div>
        <div class="p-3 bg-card rounded-lg border">
          <p class="text-xs text-muted-foreground mb-1">ROAS</p>
          <p class="text-lg font-bold text-primary">3.2x</p>
        </div>
        <div class="p-3 bg-card rounded-lg border">
          <p class="text-xs text-muted-foreground mb-1">Vendas</p>
          <p class="text-lg font-bold">89</p>
        </div>
      </div>
    `,
  }),
}

/**
 * Card loading
 */
export const Loading: Story = {
  render: () => ({
    template: `
      <div class="w-72 p-4 bg-card rounded-lg border">
        <div class="flex items-center justify-between mb-3">
          <div class="h-4 w-24 bg-muted rounded animate-pulse"></div>
          <div class="h-4 w-4 bg-muted rounded animate-pulse"></div>
        </div>
        <div class="space-y-2">
          <div class="h-7 w-32 bg-muted rounded animate-pulse"></div>
          <div class="h-3 w-20 bg-muted rounded animate-pulse"></div>
        </div>
      </div>
    `,
  }),
}
