import type { Meta, StoryObj } from '@storybook/vue3'
import PeriodFilter from '@/components/ui/PeriodFilter.vue'
import { ref } from 'vue'

/**
 * PeriodFilter - Filtro de período com presets e customização.
 * 
 * Componente completo para seleção de período com opções
 * rápidas e suporte a comparação de períodos.
 */
const meta: Meta<typeof PeriodFilter> = {
  title: 'Molecules/PeriodFilter',
  component: PeriodFilter,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Filtro de período para dashboards e relatórios.',
      },
    },
  },
  argTypes: {
    modelValue: {
      description: 'Período selecionado',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

/**
 * Filtro de período padrão
 */
export const Default: Story = {
  render: () => ({
    components: { PeriodFilter },
    template: `
      <div class="min-h-[400px] flex items-start justify-center pt-8">
        <PeriodFilter />
      </div>
    `,
  }),
}

/**
 * No header do dashboard
 */
export const NoHeaderDashboard: Story = {
  render: () => ({
    components: { PeriodFilter },
    template: `
      <div class="min-h-[400px]">
        <div class="w-full max-w-4xl">
          <!-- Header simulado -->
          <div class="flex items-center justify-between p-4 border-b bg-card rounded-t-lg">
            <div>
              <h1 class="text-xl font-semibold">Dashboard</h1>
              <p class="text-sm text-muted-foreground">
                Visão geral do seu projeto
              </p>
            </div>
            <div class="flex items-center gap-3">
              <PeriodFilter />
              <button class="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md">
                Atualizar
              </button>
            </div>
          </div>
          
          <!-- Conteúdo simulado -->
          <div class="p-4 bg-muted/30 rounded-b-lg">
            <div class="grid grid-cols-4 gap-4">
              <div class="p-4 bg-card rounded-lg border">
                <p class="text-sm text-muted-foreground">Total de Leads</p>
                <p class="text-2xl font-bold">1.234</p>
              </div>
              <div class="p-4 bg-card rounded-lg border">
                <p class="text-sm text-muted-foreground">Vendas</p>
                <p class="text-2xl font-bold">89</p>
              </div>
              <div class="p-4 bg-card rounded-lg border">
                <p class="text-sm text-muted-foreground">Receita</p>
                <p class="text-2xl font-bold">R$ 47.500</p>
              </div>
              <div class="p-4 bg-card rounded-lg border">
                <p class="text-sm text-muted-foreground">ROAS</p>
                <p class="text-2xl font-bold">3.2x</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `,
  }),
}

/**
 * Em página de relatórios
 */
export const EmRelatorios: Story = {
  render: () => ({
    components: { PeriodFilter },
    template: `
      <div class="min-h-[400px]">
        <div class="w-full max-w-3xl bg-card rounded-lg border">
          <div class="p-4 border-b">
            <h2 class="font-semibold">Relatório de Vendas</h2>
          </div>
          
          <div class="p-4 space-y-4">
            <div class="flex items-center gap-4 flex-wrap">
              <div class="flex items-center gap-2">
                <span class="text-sm font-medium">Período:</span>
                <PeriodFilter />
              </div>
              
              <div class="flex items-center gap-2">
                <span class="text-sm font-medium">Origem:</span>
                <select class="h-8 rounded-md border px-2 text-sm">
                  <option>Todas</option>
                  <option>Meta Ads</option>
                  <option>Google Ads</option>
                </select>
              </div>
              
              <div class="flex items-center gap-2">
                <span class="text-sm font-medium">Estágio:</span>
                <select class="h-8 rounded-md border px-2 text-sm">
                  <option>Todos</option>
                  <option>Lead</option>
                  <option>Negociação</option>
                  <option>Fechado</option>
                </select>
              </div>
            </div>
            
            <div class="h-[200px] bg-muted/50 rounded-lg flex items-center justify-center">
              <span class="text-muted-foreground">Gráfico de vendas</span>
            </div>
          </div>
        </div>
      </div>
    `,
  }),
}

/**
 * Filtros múltiplos de período
 */
export const FiltrosMultiplos: Story = {
  render: () => ({
    components: { PeriodFilter },
    template: `
      <div class="min-h-[400px]">
        <div class="w-full max-w-md bg-card rounded-lg border p-4 space-y-4">
          <h3 class="font-semibold">Análise Comparativa</h3>
          
          <div class="space-y-3">
            <div class="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 rounded-full bg-blue-500"></div>
                <span class="text-sm">Período A</span>
              </div>
              <PeriodFilter />
            </div>
            
            <div class="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 rounded-full bg-green-500"></div>
                <span class="text-sm">Período B</span>
              </div>
              <PeriodFilter />
            </div>
          </div>
          
          <button class="w-full bg-primary text-primary-foreground rounded-md py-2 text-sm font-medium">
            Comparar Períodos
          </button>
        </div>
      </div>
    `,
  }),
}

/**
 * Em barra de ferramentas compacta
 */
export const ToolbarCompacta: Story = {
  render: () => ({
    components: { PeriodFilter },
    template: `
      <div class="min-h-[400px]">
        <div class="w-full max-w-2xl">
          <div class="flex items-center gap-2 p-2 bg-muted rounded-lg">
            <PeriodFilter />
            
            <div class="h-6 w-px bg-border"></div>
            
            <button class="px-2 py-1 text-xs rounded hover:bg-accent">
              Meta Ads
            </button>
            <button class="px-2 py-1 text-xs rounded hover:bg-accent">
              Google Ads
            </button>
            <button class="px-2 py-1 text-xs rounded hover:bg-accent">
              Orgânico
            </button>
            
            <div class="flex-1"></div>
            
            <button class="px-2 py-1 text-xs rounded hover:bg-accent">
              Exportar
            </button>
          </div>
          
          <div class="mt-4 p-4 bg-card rounded-lg border">
            <p class="text-sm text-muted-foreground">Conteúdo filtrado...</p>
          </div>
        </div>
      </div>
    `,
  }),
}

/**
 * Em card de análise
 */
export const EmCardAnalise: Story = {
  render: () => ({
    components: { PeriodFilter },
    template: `
      <div class="min-h-[400px]">
        <div class="w-80 bg-card rounded-lg border overflow-hidden">
          <div class="flex items-center justify-between p-3 border-b">
            <span class="font-medium text-sm">Análise de Conversão</span>
            <PeriodFilter />
          </div>
          
          <div class="p-4 space-y-4">
            <div class="text-center">
              <p class="text-3xl font-bold text-primary">12.5%</p>
              <p class="text-sm text-muted-foreground">Taxa de Conversão</p>
            </div>
            
            <div class="h-[100px] bg-muted/50 rounded flex items-center justify-center">
              <span class="text-xs text-muted-foreground">Gráfico de linha</span>
            </div>
            
            <div class="flex items-center justify-between text-sm">
              <span class="text-muted-foreground">vs período anterior</span>
              <span class="text-green-600 font-medium">+2.3%</span>
            </div>
          </div>
        </div>
      </div>
    `,
  }),
}
