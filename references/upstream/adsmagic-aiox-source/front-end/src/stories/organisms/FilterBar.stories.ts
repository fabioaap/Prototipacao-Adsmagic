import type { Meta, StoryObj } from '@storybook/vue3'
import FilterBar from '@/components/features/analytics/FilterBar.vue'
import { ref } from 'vue'

/**
 * FilterBar - Barra de filtros para analytics.
 * 
 * Permite filtrar por período, origens e estágios.
 */
const meta: Meta<typeof FilterBar> = {
  title: 'Organisms/Analytics/FilterBar',
  component: FilterBar,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Barra de filtros para relatórios de analytics.',
      },
    },
  },
  argTypes: {
    currentPeriod: {
      control: 'select',
      options: ['today', 'week', 'month'],
      description: 'Período selecionado',
    },
    isLoading: {
      control: 'boolean',
      description: 'Estado de carregamento',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

const mockOrigins = [
  { id: '1', name: 'Meta Ads' },
  { id: '2', name: 'Google Ads' },
  { id: '3', name: 'Orgânico' },
  { id: '4', name: 'WhatsApp' },
]

const mockStages = [
  { id: '1', name: 'Lead' },
  { id: '2', name: 'Qualificado' },
  { id: '3', name: 'Negociação' },
  { id: '4', name: 'Fechado' },
]

const periods = ['today', 'week', 'month'] as const

/**
 * Barra de filtros padrão
 */
export const Default: Story = {
  render: () => ({
    components: { FilterBar },
    setup() {
      const currentPeriod = ref('week')
      const selectedOrigins = ref<string[]>([])
      const selectedStages = ref<string[]>([])

      return {
        periods,
        currentPeriod,
        selectedOrigins,
        selectedStages,
        origins: mockOrigins,
        stages: mockStages,
      }
    },
    template: `
      <FilterBar
        :periods="periods"
        :currentPeriod="currentPeriod"
        :origins="origins"
        :stages="stages"
        :selectedOrigins="selectedOrigins"
        :selectedStages="selectedStages"
        @update:period="currentPeriod = $event"
        @update:origins="selectedOrigins = $event"
        @update:stages="selectedStages = $event"
      />
    `,
  }),
}

/**
 * Com filtros selecionados
 */
export const ComFiltrosSelecionados: Story = {
  render: () => ({
    components: { FilterBar },
    setup() {
      const currentPeriod = ref('month')
      const selectedOrigins = ref(['1', '2'])
      const selectedStages = ref(['3'])

      return {
        periods,
        currentPeriod,
        selectedOrigins,
        selectedStages,
        origins: mockOrigins,
        stages: mockStages,
      }
    },
    template: `
      <FilterBar
        :periods="periods"
        :currentPeriod="currentPeriod"
        :origins="origins"
        :stages="stages"
        :selectedOrigins="selectedOrigins"
        :selectedStages="selectedStages"
        @update:period="currentPeriod = $event"
        @update:origins="selectedOrigins = $event"
        @update:stages="selectedStages = $event"
      />
    `,
  }),
}

/**
 * Em carregamento
 */
export const Loading: Story = {
  render: () => ({
    components: { FilterBar },
    setup() {
      const currentPeriod = ref('week')

      return {
        periods,
        currentPeriod,
        origins: mockOrigins,
        stages: mockStages,
      }
    },
    template: `
      <FilterBar
        :periods="periods"
        :currentPeriod="currentPeriod"
        :origins="origins"
        :stages="stages"
        :isLoading="true"
      />
    `,
  }),
}

/**
 * No contexto de relatório
 */
export const NoRelatorio: Story = {
  render: () => ({
    components: { FilterBar },
    setup() {
      const currentPeriod = ref('month')
      const selectedOrigins = ref<string[]>([])
      const selectedStages = ref<string[]>([])

      return {
        periods,
        currentPeriod,
        selectedOrigins,
        selectedStages,
        origins: mockOrigins,
        stages: mockStages,
      }
    },
    template: `
      <div class="w-full max-w-5xl space-y-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold">Relatório de Vendas</h1>
            <p class="text-muted-foreground">Análise detalhada por origem e estágio</p>
          </div>
          <button class="px-4 py-2 text-sm border rounded-md hover:bg-accent">
            Exportar PDF
          </button>
        </div>
        
        <FilterBar
          :periods="periods"
          :currentPeriod="currentPeriod"
          :origins="origins"
          :stages="stages"
          :selectedOrigins="selectedOrigins"
          :selectedStages="selectedStages"
          @update:period="currentPeriod = $event"
          @update:origins="selectedOrigins = $event"
          @update:stages="selectedStages = $event"
        />
        
        <div class="grid grid-cols-4 gap-4">
          <div class="p-4 bg-card rounded-lg border">
            <p class="text-sm text-muted-foreground">Total de Vendas</p>
            <p class="text-2xl font-bold">R$ 47.500</p>
          </div>
          <div class="p-4 bg-card rounded-lg border">
            <p class="text-sm text-muted-foreground">Quantidade</p>
            <p class="text-2xl font-bold">89</p>
          </div>
          <div class="p-4 bg-card rounded-lg border">
            <p class="text-sm text-muted-foreground">Ticket Médio</p>
            <p class="text-2xl font-bold">R$ 534</p>
          </div>
          <div class="p-4 bg-card rounded-lg border">
            <p class="text-sm text-muted-foreground">Conversão</p>
            <p class="text-2xl font-bold">7.2%</p>
          </div>
        </div>
        
        <div class="h-[200px] bg-card rounded-lg border flex items-center justify-center">
          <span class="text-muted-foreground">Tabela de dados filtrados</span>
        </div>
      </div>
    `,
  }),
}
