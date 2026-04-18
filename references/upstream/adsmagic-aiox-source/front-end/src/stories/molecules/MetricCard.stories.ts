import type { Meta, StoryObj } from '@storybook/vue3'
import MetricCard from '@/components/ui/MetricCard.vue'

const meta: Meta<typeof MetricCard> = {
    title: 'Molecules/MetricCard',
    component: MetricCard,
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: 'Card de métrica KPI com valor principal, variação percentual e indicador de tendência.'
            }
        }
    },
    argTypes: {
        label: {
            control: 'text',
            description: 'Label da métrica'
        },
        value: {
            control: 'text',
            description: 'Valor principal'
        },
        change: {
            control: 'number',
            description: 'Variação percentual'
        },
        changeLabel: {
            control: 'text',
            description: 'Label da variação'
        },
        trend: {
            control: 'select',
            options: ['up', 'down', 'neutral'],
            description: 'Direção da tendência'
        },
        loading: {
            control: 'boolean',
            description: 'Estado de carregamento'
        }
    }
}

export default meta
type Story = StoryObj<typeof MetricCard>

// Default
export const Default: Story = {
    args: {
        label: 'Total de Contatos',
        value: '1.234',
        change: 12,
        changeLabel: 'vs mês anterior',
        trend: 'up'
    }
}

// Receita total
export const TotalRevenue: Story = {
    args: {
        label: 'Receita Total',
        value: 'R$ 125.430,00',
        change: 23.5,
        changeLabel: 'vs mês anterior',
        trend: 'up'
    }
}

// CPA (Custo por Aquisição)
export const CPA: Story = {
    args: {
        label: 'CPA',
        value: 'R$ 45,00',
        change: -8,
        changeLabel: 'vs mês anterior',
        trend: 'down'
    },
    parameters: {
        docs: {
            description: {
                story: 'Para CPA, uma queda no valor é positiva (tendência down com variação negativa = verde).'
            }
        }
    }
}

// ROAS
export const ROAS: Story = {
    args: {
        label: 'ROAS',
        value: '4.5x',
        change: 15,
        changeLabel: 'vs mês anterior',
        trend: 'up'
    }
}

// Taxa de conversão
export const ConversionRate: Story = {
    args: {
        label: 'Taxa de Conversão',
        value: '3.2%',
        change: -2,
        changeLabel: 'vs mês anterior',
        trend: 'up'
    }
}

// Vendas
export const Sales: Story = {
    args: {
        label: 'Vendas',
        value: '89',
        change: 18,
        changeLabel: 'vs período anterior',
        trend: 'up'
    }
}

// Carregando
export const Loading: Story = {
    args: {
        label: 'Total de Contatos',
        value: '',
        loading: true
    }
}

// Sem variação
export const NoChange: Story = {
    args: {
        label: 'Investimento',
        value: 'R$ 28.500,00'
    },
    parameters: {
        docs: {
            description: {
                story: 'Card sem indicador de variação percentual.'
            }
        }
    }
}

// Grid de métricas
export const MetricsGrid: Story = {
    render: () => ({
        components: { MetricCard },
        template: `
      <div class="grid grid-cols-4 gap-4">
        <MetricCard 
          label="Contatos" 
          value="1.234" 
          :change="12" 
          change-label="vs mês anterior"
          trend="up" 
        />
        <MetricCard 
          label="Vendas" 
          value="89" 
          :change="18" 
          change-label="vs mês anterior"
          trend="up" 
        />
        <MetricCard 
          label="Receita" 
          value="R$ 125.430" 
          :change="23" 
          change-label="vs mês anterior"
          trend="up" 
        />
        <MetricCard 
          label="CPA" 
          value="R$ 45,00" 
          :change="-8" 
          change-label="vs mês anterior"
          trend="down" 
        />
      </div>
    `
    })
}

// Dashboard completo
export const DashboardMetrics: Story = {
    render: () => ({
        components: { MetricCard },
        template: `
      <div class="space-y-6">
        <h2 class="text-xl font-bold">Métricas de Performance</h2>
        
        <div class="grid grid-cols-4 gap-4">
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
        </div>
        
        <div class="grid grid-cols-3 gap-4">
          <MetricCard 
            label="CPA Meta Ads" 
            value="R$ 32,50" 
            :change="-12.3" 
            change-label="vs mês anterior"
            trend="down" 
          />
          <MetricCard 
            label="CPA Google Ads" 
            value="R$ 41,20" 
            :change="5.2" 
            change-label="vs mês anterior"
            trend="down" 
          />
          <MetricCard 
            label="CPA Indicação" 
            value="R$ 0,00" 
            change-label="sem custo"
          />
        </div>
      </div>
    `
    })
}

// Estados de tendência
export const TrendStates: Story = {
    render: () => ({
        components: { MetricCard },
        template: `
      <div class="space-y-6">
        <h3 class="font-medium">Tendência UP (maior é melhor)</h3>
        <div class="grid grid-cols-3 gap-4">
          <MetricCard 
            label="Receita Crescendo" 
            value="R$ 50.000" 
            :change="25" 
            change-label="positivo = verde"
            trend="up" 
          />
          <MetricCard 
            label="Receita Caindo" 
            value="R$ 30.000" 
            :change="-15" 
            change-label="negativo = vermelho"
            trend="up" 
          />
          <MetricCard 
            label="Neutro" 
            value="R$ 40.000" 
            :change="0" 
            change-label="sem variação"
            trend="neutral" 
          />
        </div>
        
        <h3 class="font-medium">Tendência DOWN (menor é melhor)</h3>
        <div class="grid grid-cols-3 gap-4">
          <MetricCard 
            label="CPA Reduzindo" 
            value="R$ 30,00" 
            :change="-20" 
            change-label="negativo = verde"
            trend="down" 
          />
          <MetricCard 
            label="CPA Aumentando" 
            value="R$ 55,00" 
            :change="18" 
            change-label="positivo = vermelho"
            trend="down" 
          />
          <MetricCard 
            label="CPA Estável" 
            value="R$ 40,00" 
            :change="0" 
            change-label="sem variação"
            trend="neutral" 
          />
        </div>
      </div>
    `
    })
}

// Comparação de carregamento
export const LoadingComparison: Story = {
    render: () => ({
        components: { MetricCard },
        template: `
      <div class="grid grid-cols-2 gap-4">
        <MetricCard 
          label="Dados carregados" 
          value="R$ 125.430" 
          :change="23" 
          change-label="vs mês anterior"
          trend="up" 
        />
        <MetricCard 
          label="Carregando..." 
          value="" 
          loading
        />
      </div>
    `
    })
}
