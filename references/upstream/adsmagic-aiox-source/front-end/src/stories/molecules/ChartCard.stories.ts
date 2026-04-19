import type { Meta, StoryObj } from '@storybook/vue3'
import ChartCard from '@/components/ui/ChartCard.vue'

const meta: Meta<typeof ChartCard> = {
    title: 'Molecules/ChartCard',
    component: ChartCard,
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: 'Card container para gráficos e visualizações de dados com título, subtítulo e estado de carregamento.'
            }
        }
    },
    argTypes: {
        title: {
            control: 'text',
            description: 'Título do card'
        },
        subtitle: {
            control: 'text',
            description: 'Subtítulo/descrição'
        },
        loading: {
            control: 'boolean',
            description: 'Estado de carregamento'
        }
    }
}

export default meta
type Story = StoryObj<typeof ChartCard>

// Default
export const Default: Story = {
    args: {
        title: 'Vendas por Origem',
        subtitle: 'Distribuição de vendas por canal de marketing'
    },
    render: (args) => ({
        components: { ChartCard },
        setup() {
            return { args }
        },
        template: `
      <div class="w-[500px]">
        <ChartCard v-bind="args">
          <div class="flex items-center justify-center h-48 bg-muted/20 rounded-lg">
            <span class="text-muted-foreground text-sm">Área do gráfico</span>
          </div>
        </ChartCard>
      </div>
    `
    })
}

// Com gráfico de barras simulado
export const BarChartExample: Story = {
    render: () => ({
        components: { ChartCard },
        template: `
      <div class="w-[600px]">
        <ChartCard title="Contatos por Origem" subtitle="Últimos 30 dias">
          <div class="space-y-4">
            <div class="flex items-center gap-3">
              <span class="w-24 text-sm">Meta Ads</span>
              <div class="flex-1 bg-muted rounded-full h-4">
                <div class="bg-blue-500 rounded-full h-4" style="width: 75%"></div>
              </div>
              <span class="text-sm font-medium w-16 text-right">1.234</span>
            </div>
            <div class="flex items-center gap-3">
              <span class="w-24 text-sm">Google Ads</span>
              <div class="flex-1 bg-muted rounded-full h-4">
                <div class="bg-green-500 rounded-full h-4" style="width: 55%"></div>
              </div>
              <span class="text-sm font-medium w-16 text-right">856</span>
            </div>
            <div class="flex items-center gap-3">
              <span class="w-24 text-sm">Indicação</span>
              <div class="flex-1 bg-muted rounded-full h-4">
                <div class="bg-orange-500 rounded-full h-4" style="width: 25%"></div>
              </div>
              <span class="text-sm font-medium w-16 text-right">234</span>
            </div>
            <div class="flex items-center gap-3">
              <span class="w-24 text-sm">Orgânico</span>
              <div class="flex-1 bg-muted rounded-full h-4">
                <div class="bg-purple-500 rounded-full h-4" style="width: 15%"></div>
              </div>
              <span class="text-sm font-medium w-16 text-right">145</span>
            </div>
          </div>
        </ChartCard>
      </div>
    `
    })
}

// Com gráfico de pizza simulado
export const PieChartExample: Story = {
    render: () => ({
        components: { ChartCard },
        template: `
      <div class="w-[400px]">
        <ChartCard title="Distribuição de Vendas" subtitle="Por canal de atribuição">
          <div class="flex items-center gap-8">
            <!-- Pie chart simulado -->
            <div class="relative w-32 h-32">
              <svg viewBox="0 0 36 36" class="w-32 h-32 transform -rotate-90">
                <circle cx="18" cy="18" r="16" fill="none" stroke="#e5e7eb" stroke-width="4"/>
                <circle cx="18" cy="18" r="16" fill="none" stroke="#3b82f6" stroke-width="4" 
                  stroke-dasharray="45 100" stroke-linecap="round"/>
                <circle cx="18" cy="18" r="16" fill="none" stroke="#22c55e" stroke-width="4" 
                  stroke-dasharray="30 100" stroke-dashoffset="-45" stroke-linecap="round"/>
                <circle cx="18" cy="18" r="16" fill="none" stroke="#f97316" stroke-width="4" 
                  stroke-dasharray="15 100" stroke-dashoffset="-75" stroke-linecap="round"/>
                <circle cx="18" cy="18" r="16" fill="none" stroke="#a855f7" stroke-width="4" 
                  stroke-dasharray="10 100" stroke-dashoffset="-90" stroke-linecap="round"/>
              </svg>
              <div class="absolute inset-0 flex items-center justify-center flex-col">
                <span class="text-2xl font-bold">89</span>
                <span class="text-xs text-muted-foreground">vendas</span>
              </div>
            </div>
            
            <!-- Legenda -->
            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full bg-blue-500"></span>
                <span class="text-sm">Meta Ads (45%)</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full bg-green-500"></span>
                <span class="text-sm">Google Ads (30%)</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full bg-orange-500"></span>
                <span class="text-sm">Indicação (15%)</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full bg-purple-500"></span>
                <span class="text-sm">Orgânico (10%)</span>
              </div>
            </div>
          </div>
        </ChartCard>
      </div>
    `
    })
}

// Com linha do tempo simulada
export const TimelineChartExample: Story = {
    render: () => ({
        components: { ChartCard },
        template: `
      <div class="w-[700px]">
        <ChartCard title="Evolução de Vendas" subtitle="Últimos 7 dias">
          <div class="relative h-48">
            <!-- Eixo Y -->
            <div class="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-xs text-muted-foreground w-10">
              <span>50</span>
              <span>40</span>
              <span>30</span>
              <span>20</span>
              <span>10</span>
              <span>0</span>
            </div>
            
            <!-- Área do gráfico -->
            <div class="ml-12 h-40 flex items-end gap-4">
              <div class="flex-1 flex flex-col items-center gap-1">
                <div class="w-full bg-primary/80 rounded-t" style="height: 60%"></div>
                <span class="text-xs text-muted-foreground">Seg</span>
              </div>
              <div class="flex-1 flex flex-col items-center gap-1">
                <div class="w-full bg-primary/80 rounded-t" style="height: 45%"></div>
                <span class="text-xs text-muted-foreground">Ter</span>
              </div>
              <div class="flex-1 flex flex-col items-center gap-1">
                <div class="w-full bg-primary/80 rounded-t" style="height: 80%"></div>
                <span class="text-xs text-muted-foreground">Qua</span>
              </div>
              <div class="flex-1 flex flex-col items-center gap-1">
                <div class="w-full bg-primary/80 rounded-t" style="height: 55%"></div>
                <span class="text-xs text-muted-foreground">Qui</span>
              </div>
              <div class="flex-1 flex flex-col items-center gap-1">
                <div class="w-full bg-primary/80 rounded-t" style="height: 90%"></div>
                <span class="text-xs text-muted-foreground">Sex</span>
              </div>
              <div class="flex-1 flex flex-col items-center gap-1">
                <div class="w-full bg-primary/80 rounded-t" style="height: 70%"></div>
                <span class="text-xs text-muted-foreground">Sáb</span>
              </div>
              <div class="flex-1 flex flex-col items-center gap-1">
                <div class="w-full bg-primary rounded-t" style="height: 100%"></div>
                <span class="text-xs font-medium">Dom</span>
              </div>
            </div>
          </div>
        </ChartCard>
      </div>
    `
    })
}

// Carregando
export const Loading: Story = {
    args: {
        title: 'Carregando dados...',
        subtitle: 'Aguarde enquanto buscamos as informações',
        loading: true
    },
    render: (args) => ({
        components: { ChartCard },
        setup() {
            return { args }
        },
        template: `
      <div class="w-[500px]">
        <ChartCard v-bind="args" />
      </div>
    `
    })
}

// Sem subtítulo
export const WithoutSubtitle: Story = {
    render: () => ({
        components: { ChartCard },
        template: `
      <div class="w-[500px]">
        <ChartCard title="Performance Mensal">
          <div class="flex items-center justify-center h-48 bg-muted/20 rounded-lg">
            <span class="text-muted-foreground text-sm">Conteúdo do gráfico</span>
          </div>
        </ChartCard>
      </div>
    `
    })
}

// Grid de charts
export const ChartsGrid: Story = {
    render: () => ({
        components: { ChartCard },
        template: `
      <div class="grid grid-cols-2 gap-6">
        <ChartCard title="Leads por Dia" subtitle="Últimos 7 dias">
          <div class="h-40 flex items-end gap-2">
            <div class="flex-1 bg-blue-500/70 rounded-t" style="height: 60%"></div>
            <div class="flex-1 bg-blue-500/70 rounded-t" style="height: 80%"></div>
            <div class="flex-1 bg-blue-500/70 rounded-t" style="height: 45%"></div>
            <div class="flex-1 bg-blue-500/70 rounded-t" style="height: 90%"></div>
            <div class="flex-1 bg-blue-500/70 rounded-t" style="height: 70%"></div>
            <div class="flex-1 bg-blue-500/70 rounded-t" style="height: 55%"></div>
            <div class="flex-1 bg-blue-500 rounded-t" style="height: 100%"></div>
          </div>
        </ChartCard>
        
        <ChartCard title="Taxa de Conversão" subtitle="Por etapa do funil">
          <div class="space-y-3">
            <div class="flex items-center gap-2">
              <span class="w-20 text-xs">Leads</span>
              <div class="flex-1 bg-muted rounded h-6">
                <div class="bg-green-500 rounded h-6 flex items-center justify-end pr-2" style="width: 100%">
                  <span class="text-xs text-white font-medium">2.847</span>
                </div>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <span class="w-20 text-xs">Qualificados</span>
              <div class="flex-1 bg-muted rounded h-6">
                <div class="bg-blue-500 rounded h-6 flex items-center justify-end pr-2" style="width: 45%">
                  <span class="text-xs text-white font-medium">1.281</span>
                </div>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <span class="w-20 text-xs">Propostas</span>
              <div class="flex-1 bg-muted rounded h-6">
                <div class="bg-orange-500 rounded h-6 flex items-center justify-end pr-2" style="width: 20%">
                  <span class="text-xs text-white font-medium">569</span>
                </div>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <span class="w-20 text-xs">Vendas</span>
              <div class="flex-1 bg-muted rounded h-6">
                <div class="bg-purple-500 rounded h-6 flex items-center justify-end pr-2" style="width: 6%">
                  <span class="text-xs text-white font-medium">156</span>
                </div>
              </div>
            </div>
          </div>
        </ChartCard>
        
        <ChartCard title="Origem dos Leads" subtitle="Distribuição percentual" loading />
        
        <ChartCard title="ROAS por Canal" subtitle="Retorno sobre investimento" loading />
      </div>
    `
    })
}

// Funil de vendas
export const SalesFunnel: Story = {
    render: () => ({
        components: { ChartCard },
        template: `
      <div class="w-[500px]">
        <ChartCard title="Funil de Vendas" subtitle="Conversão por etapa">
          <div class="space-y-2">
            <div class="relative">
              <div class="bg-blue-500 text-white rounded-lg p-3 text-center">
                <span class="font-medium">Leads</span>
                <span class="ml-2 text-lg font-bold">2.847</span>
              </div>
            </div>
            <div class="relative mx-8">
              <div class="bg-blue-400 text-white rounded-lg p-3 text-center">
                <span class="font-medium">Qualificados</span>
                <span class="ml-2 text-lg font-bold">1.281</span>
                <span class="ml-2 text-xs opacity-75">(45%)</span>
              </div>
            </div>
            <div class="relative mx-16">
              <div class="bg-blue-300 text-blue-900 rounded-lg p-3 text-center">
                <span class="font-medium">Propostas</span>
                <span class="ml-2 text-lg font-bold">569</span>
                <span class="ml-2 text-xs opacity-75">(20%)</span>
              </div>
            </div>
            <div class="relative mx-24">
              <div class="bg-green-500 text-white rounded-lg p-3 text-center">
                <span class="font-medium">Vendas</span>
                <span class="ml-2 text-lg font-bold">156</span>
                <span class="ml-2 text-xs opacity-75">(5.5%)</span>
              </div>
            </div>
          </div>
        </ChartCard>
      </div>
    `
    })
}
