import type { Meta, StoryObj } from '@storybook/vue3'
import DateRangePicker from '@/components/ui/date-range-picker/DateRangePicker.vue'
import { ref } from 'vue'

/**
 * DateRangePicker - Seletor de intervalo de datas.
 * 
 * Componente completo com calendário duplo, presets rápidos
 * e suporte a período personalizado.
 * 
 * **Design System:**
 * - Border-radius: 14px (consistente com Button e SearchInput)
 * - Altura mínima: 48px
 * - Estilo "pill" com sombra suave
 * - Estados: default, hover, active (popover aberto)
 * 
 * **Presets disponíveis:**
 * - Hoje
 * - Últimos 7 dias
 * - Últimos 30 dias
 * - Últimos 90 dias
 */
const meta: Meta<typeof DateRangePicker> = {
  title: 'Molecules/DateRangePicker',
  component: DateRangePicker,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Seletor de intervalo de datas para filtros e relatórios.',
      },
    },
  },
  argTypes: {
    showPresets: {
      control: 'boolean',
      description: 'Mostrar presets de período',
    },
    modelValue: {
      description: 'Intervalo de datas selecionado',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

/**
 * Seletor de período padrão com presets
 */
export const Default: Story = {
  render: () => ({
    components: { DateRangePicker },
    setup() {
      const dateRange = ref<{ start: Date; end: Date } | undefined>()
      return { dateRange }
    },
    template: `
      <div class="min-h-[500px] flex items-start justify-center pt-8">
        <DateRangePicker v-model="dateRange" />
      </div>
    `,
  }),
}

/**
 * No header de filtros do dashboard
 */
export const NoHeaderDashboard: Story = {
  render: () => ({
    components: { DateRangePicker },
    setup() {
      const dateRange = ref<{ start: Date; end: Date } | undefined>()
      return { dateRange }
    },
    template: `
      <div class="min-h-[500px]">
        <div class="w-full max-w-4xl bg-card rounded-lg border p-4">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold">Resumo de Vendas</h2>
            <div class="flex items-center gap-2">
              <DateRangePicker v-model="dateRange" />
              <button class="px-3 py-1.5 text-sm border rounded-md hover:bg-accent">
                Exportar
              </button>
            </div>
          </div>
          
          <div class="mt-6 grid grid-cols-3 gap-4">
            <div class="p-4 bg-muted/50 rounded-lg">
              <p class="text-sm text-muted-foreground">Total de Vendas</p>
              <p class="text-2xl font-bold">R$ 47.500,00</p>
            </div>
            <div class="p-4 bg-muted/50 rounded-lg">
              <p class="text-sm text-muted-foreground">Novos Contatos</p>
              <p class="text-2xl font-bold">1.234</p>
            </div>
            <div class="p-4 bg-muted/50 rounded-lg">
              <p class="text-sm text-muted-foreground">Conversões</p>
              <p class="text-2xl font-bold">89</p>
            </div>
          </div>
        </div>
      </div>
    `,
  }),
}

/**
 * Sem presets - apenas calendário
 */
export const SemPresets: Story = {
  args: {
    showPresets: false,
  },
  render: (args) => ({
    components: { DateRangePicker },
    setup() {
      const dateRange = ref<{ start: Date; end: Date } | undefined>()
      return { dateRange, args }
    },
    template: `
      <div class="min-h-[500px] flex items-start justify-center pt-8">
        <DateRangePicker v-model="dateRange" :showPresets="args.showPresets" />
      </div>
    `,
  }),
}

/**
 * Em filtro de relatório de campanhas
 */
export const FiltroRelatorio: Story = {
  render: () => ({
    components: { DateRangePicker },
    setup() {
      const dateRange = ref<{ start: Date; end: Date } | undefined>()
      return { dateRange }
    },
    template: `
      <div class="min-h-[500px]">
        <div class="w-full max-w-lg bg-card rounded-lg border">
          <div class="p-4 border-b">
            <h3 class="font-semibold">Relatório de Campanhas</h3>
            <p class="text-sm text-muted-foreground">
              Configure os filtros para gerar o relatório
            </p>
          </div>
          
          <div class="p-4 space-y-4">
            <div class="space-y-2">
              <label class="text-sm font-medium">Período</label>
              <DateRangePicker v-model="dateRange" />
            </div>
            
            <div class="space-y-2">
              <label class="text-sm font-medium">Campanha</label>
              <select class="w-full h-9 rounded-md border px-3 text-sm">
                <option>Todas as campanhas</option>
                <option>Black Friday 2024</option>
                <option>Natal 2024</option>
              </select>
            </div>
            
            <div class="space-y-2">
              <label class="text-sm font-medium">Origem</label>
              <select class="w-full h-9 rounded-md border px-3 text-sm">
                <option>Todas as origens</option>
                <option>Meta Ads</option>
                <option>Google Ads</option>
              </select>
            </div>
          </div>
          
          <div class="p-4 border-t bg-muted/50">
            <button class="w-full bg-primary text-primary-foreground rounded-md py-2 text-sm font-medium">
              Gerar Relatório
            </button>
          </div>
        </div>
      </div>
    `,
  }),
}

/**
 * Múltiplos seletores de período
 */
export const ComparacaoPeriodos: Story = {
  render: () => ({
    components: { DateRangePicker },
    setup() {
      const currentPeriod = ref<{ start: Date; end: Date } | undefined>()
      const previousPeriod = ref<{ start: Date; end: Date } | undefined>()
      return { currentPeriod, previousPeriod }
    },
    template: `
      <div class="min-h-[500px]">
        <div class="w-full max-w-md bg-card rounded-lg border p-4 space-y-4">
          <h3 class="font-semibold">Comparar Períodos</h3>
          
          <div class="space-y-3">
            <div class="flex items-center gap-3">
              <div class="w-3 h-3 rounded-full bg-primary"></div>
              <span class="text-sm flex-1">Período Atual</span>
              <DateRangePicker v-model="currentPeriod" />
            </div>
            
            <div class="flex items-center gap-3">
              <div class="w-3 h-3 rounded-full bg-muted-foreground"></div>
              <span class="text-sm flex-1">Período Anterior</span>
              <DateRangePicker v-model="previousPeriod" />
            </div>
          </div>
          
          <button class="w-full bg-primary text-primary-foreground rounded-md py-2 text-sm font-medium">
            Comparar
          </button>
        </div>
      </div>
    `,
  }),
}

/**
 * Em toolbar de exportação
 */
export const ToolbarExportacao: Story = {
  render: () => ({
    components: { DateRangePicker },
    setup() {
      const dateRange = ref<{ start: Date; end: Date } | undefined>()
      return { dateRange }
    },
    template: `
      <div class="min-h-[500px]">
        <div class="w-full max-w-2xl bg-card rounded-lg border">
          <div class="flex items-center justify-between p-4 border-b">
            <div>
              <h3 class="font-semibold">Exportar Dados</h3>
              <p class="text-xs text-muted-foreground">
                Exporte os dados para análise externa
              </p>
            </div>
            <button class="text-sm text-muted-foreground">✕</button>
          </div>
          
          <div class="p-4 space-y-4">
            <div class="flex items-center gap-4">
              <label class="text-sm font-medium w-24">Período:</label>
              <DateRangePicker v-model="dateRange" />
            </div>
            
            <div class="flex items-center gap-4">
              <label class="text-sm font-medium w-24">Formato:</label>
              <div class="flex gap-2">
                <button class="px-3 py-1.5 text-sm border rounded-md bg-accent">CSV</button>
                <button class="px-3 py-1.5 text-sm border rounded-md">Excel</button>
                <button class="px-3 py-1.5 text-sm border rounded-md">PDF</button>
              </div>
            </div>
          </div>
          
          <div class="p-4 border-t flex justify-end gap-2">
            <button class="px-4 py-2 text-sm border rounded-md">Cancelar</button>
            <button class="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md">
              Exportar
            </button>
          </div>
        </div>
      </div>
    `,
  }),
}
