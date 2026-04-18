import type { Meta, StoryObj } from '@storybook/vue3'
import StatGrid from '@/components/ui/StatGrid.vue'
import MetricCard from '@/components/ui/MetricCard.vue'

const meta: Meta<typeof StatGrid> = {
    title: 'Molecules/StatGrid',
    component: StatGrid,
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: 'Grid responsivo para exibição de cards de estatísticas/métricas com layout flexível.'
            }
        }
    },
    argTypes: {
        columns: {
            control: 'select',
            options: ['auto', 2, 4],
            description: 'Número de colunas'
        },
        gap: {
            control: 'select',
            options: ['sm', 'md', 'lg'],
            description: 'Espaçamento entre cards'
        }
    }
}

export default meta
type Story = StoryObj<typeof StatGrid>

// Default (auto columns)
export const Default: Story = {
    render: () => ({
        components: { StatGrid, MetricCard },
        template: `
      <StatGrid>
        <MetricCard label="Contatos" value="1.234" :change="12" change-label="vs mês anterior" trend="up" />
        <MetricCard label="Vendas" value="89" :change="18" change-label="vs mês anterior" trend="up" />
        <MetricCard label="Receita" value="R$ 125.430" :change="23" change-label="vs mês anterior" trend="up" />
        <MetricCard label="CPA" value="R$ 45,00" :change="-8" change-label="vs mês anterior" trend="down" />
      </StatGrid>
    `
    })
}

// 2 colunas
export const TwoColumns: Story = {
    render: () => ({
        components: { StatGrid, MetricCard },
        template: `
      <StatGrid :columns="2">
        <MetricCard label="Contatos Total" value="2.847" :change="15" change-label="últimos 30 dias" trend="up" />
        <MetricCard label="Vendas Fechadas" value="156" :change="8.7" change-label="últimos 30 dias" trend="up" />
      </StatGrid>
    `
    })
}

// 4 colunas fixas
export const FourColumns: Story = {
    render: () => ({
        components: { StatGrid, MetricCard },
        template: `
      <StatGrid :columns="4">
        <MetricCard label="Leads" value="2.847" :change="15" change-label="30d" trend="up" />
        <MetricCard label="Vendas" value="156" :change="8" change-label="30d" trend="up" />
        <MetricCard label="Receita" value="R$ 234K" :change="22" change-label="30d" trend="up" />
        <MetricCard label="ROAS" value="4.8x" :change="12" change-label="30d" trend="up" />
      </StatGrid>
    `
    })
}

// Gap pequeno
export const SmallGap: Story = {
    render: () => ({
        components: { StatGrid, MetricCard },
        template: `
      <StatGrid gap="sm">
        <MetricCard label="Métrica 1" value="100" />
        <MetricCard label="Métrica 2" value="200" />
        <MetricCard label="Métrica 3" value="300" />
        <MetricCard label="Métrica 4" value="400" />
      </StatGrid>
    `
    })
}

// Gap grande
export const LargeGap: Story = {
    render: () => ({
        components: { StatGrid, MetricCard },
        template: `
      <StatGrid gap="lg">
        <MetricCard label="Métrica 1" value="100" />
        <MetricCard label="Métrica 2" value="200" />
        <MetricCard label="Métrica 3" value="300" />
        <MetricCard label="Métrica 4" value="400" />
      </StatGrid>
    `
    })
}

// Dashboard completo
export const DashboardLayout: Story = {
    render: () => ({
        components: { StatGrid, MetricCard },
        template: `
      <div class="space-y-6">
        <h2 class="text-xl font-bold">Visão Geral</h2>
        
        <!-- KPIs principais -->
        <StatGrid>
          <MetricCard 
            label="Total de Leads" 
            value="2.847" 
            :change="15.3" 
            change-label="últimos 30 dias"
            trend="up" 
          />
          <MetricCard 
            label="Vendas Fechadas" 
            value="156" 
            :change="8.7" 
            change-label="últimos 30 dias"
            trend="up" 
          />
          <MetricCard 
            label="Receita Atribuída" 
            value="R$ 234.500" 
            :change="22.1" 
            change-label="últimos 30 dias"
            trend="up" 
          />
          <MetricCard 
            label="ROAS Médio" 
            value="4.8x" 
            :change="12.5" 
            change-label="vs período anterior"
            trend="up" 
          />
        </StatGrid>
        
        <h3 class="text-lg font-medium mt-8">Por Canal</h3>
        
        <!-- Métricas por canal -->
        <StatGrid :columns="2" gap="lg">
          <div class="space-y-3">
            <h4 class="text-sm font-medium text-muted-foreground">Meta Ads</h4>
            <StatGrid :columns="2" gap="sm">
              <MetricCard label="Leads" value="1.456" :change="18" trend="up" />
              <MetricCard label="Vendas" value="89" :change="12" trend="up" />
            </StatGrid>
          </div>
          <div class="space-y-3">
            <h4 class="text-sm font-medium text-muted-foreground">Google Ads</h4>
            <StatGrid :columns="2" gap="sm">
              <MetricCard label="Leads" value="891" :change="8" trend="up" />
              <MetricCard label="Vendas" value="52" :change="5" trend="up" />
            </StatGrid>
          </div>
        </StatGrid>
      </div>
    `
    })
}

// Com cards customizados
export const CustomCards: Story = {
    render: () => ({
        components: { StatGrid },
        template: `
      <StatGrid>
        <div class="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-5">
          <p class="text-xs font-medium uppercase opacity-80">Meta Ads</p>
          <p class="text-2xl font-bold mt-2">R$ 125.430</p>
          <p class="text-xs mt-1 opacity-80">Receita atribuída</p>
        </div>
        
        <div class="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-5">
          <p class="text-xs font-medium uppercase opacity-80">Google Ads</p>
          <p class="text-2xl font-bold mt-2">R$ 89.230</p>
          <p class="text-xs mt-1 opacity-80">Receita atribuída</p>
        </div>
        
        <div class="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg p-5">
          <p class="text-xs font-medium uppercase opacity-80">Indicação</p>
          <p class="text-2xl font-bold mt-2">R$ 45.670</p>
          <p class="text-xs mt-1 opacity-80">Receita atribuída</p>
        </div>
        
        <div class="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-5">
          <p class="text-xs font-medium uppercase opacity-80">Orgânico</p>
          <p class="text-2xl font-bold mt-2">R$ 23.890</p>
          <p class="text-xs mt-1 opacity-80">Receita atribuída</p>
        </div>
      </StatGrid>
    `
    })
}

// Carregando
export const Loading: Story = {
    render: () => ({
        components: { StatGrid, MetricCard },
        template: `
      <StatGrid>
        <MetricCard label="Carregando..." value="" loading />
        <MetricCard label="Carregando..." value="" loading />
        <MetricCard label="Carregando..." value="" loading />
        <MetricCard label="Carregando..." value="" loading />
      </StatGrid>
    `
    })
}

// Responsivo (demonstração)
export const ResponsiveDemo: Story = {
    render: () => ({
        template: `
      <div class="space-y-8">
        <div>
          <h3 class="text-sm font-medium mb-2">Desktop (4 colunas):</h3>
          <div class="grid grid-cols-4 gap-4">
            <div class="bg-muted p-4 rounded-lg text-center text-sm">Card 1</div>
            <div class="bg-muted p-4 rounded-lg text-center text-sm">Card 2</div>
            <div class="bg-muted p-4 rounded-lg text-center text-sm">Card 3</div>
            <div class="bg-muted p-4 rounded-lg text-center text-sm">Card 4</div>
          </div>
        </div>
        
        <div>
          <h3 class="text-sm font-medium mb-2">Tablet (2 colunas):</h3>
          <div class="grid grid-cols-2 gap-4 max-w-md">
            <div class="bg-muted p-4 rounded-lg text-center text-sm">Card 1</div>
            <div class="bg-muted p-4 rounded-lg text-center text-sm">Card 2</div>
            <div class="bg-muted p-4 rounded-lg text-center text-sm">Card 3</div>
            <div class="bg-muted p-4 rounded-lg text-center text-sm">Card 4</div>
          </div>
        </div>
        
        <div>
          <h3 class="text-sm font-medium mb-2">Mobile (1 coluna):</h3>
          <div class="grid grid-cols-1 gap-4 max-w-xs">
            <div class="bg-muted p-4 rounded-lg text-center text-sm">Card 1</div>
            <div class="bg-muted p-4 rounded-lg text-center text-sm">Card 2</div>
            <div class="bg-muted p-4 rounded-lg text-center text-sm">Card 3</div>
            <div class="bg-muted p-4 rounded-lg text-center text-sm">Card 4</div>
          </div>
        </div>
      </div>
    `
    })
}
