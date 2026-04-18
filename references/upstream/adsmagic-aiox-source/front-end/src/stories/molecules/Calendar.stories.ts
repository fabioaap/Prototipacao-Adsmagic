import type { Meta, StoryObj } from '@storybook/vue3'
import Calendar from '@/components/ui/calendar/Calendar.vue'
import { ref } from 'vue'

/**
 * Calendar - Componente de calendário para seleção de datas.
 * 
 * Baseado no reka-ui, suporta seleção única, múltipla e
 * navegação entre meses.
 */
const meta: Meta<typeof Calendar> = {
  title: 'Molecules/Calendar',
  component: Calendar,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Calendário para seleção de datas em formulários e filtros.',
      },
    },
  },
  argTypes: {
    modelValue: {
      description: 'Data selecionada',
    },
    disabled: {
      control: 'boolean',
      description: 'Estado desabilitado',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

/**
 * Calendário padrão para seleção de data
 */
export const Default: Story = {
  render: () => ({
    components: { Calendar },
    template: `
      <Calendar class="rounded-md border shadow" />
    `,
  }),
}

/**
 * Calendário em formulário de data de nascimento
 */
export const DataNascimento: Story = {
  render: () => ({
    components: { Calendar },
    setup() {
      const date = ref(null)
      return { date }
    },
    template: `
      <div class="space-y-4 w-[320px]">
        <div>
          <label class="text-sm font-medium">Data de Nascimento</label>
          <p class="text-xs text-muted-foreground">
            Selecione a data no calendário
          </p>
        </div>
        <Calendar 
          v-model="date" 
          class="rounded-md border shadow" 
        />
        <p v-if="date" class="text-sm">
          <span class="text-muted-foreground">Selecionado:</span>
          {{ date }}
        </p>
      </div>
    `,
  }),
}

/**
 * Calendário para seleção de data de evento
 */
export const DataEvento: Story = {
  render: () => ({
    components: { Calendar },
    setup() {
      const date = ref(null)
      return { date }
    },
    template: `
      <div class="p-4 bg-card rounded-lg border space-y-4">
        <h3 class="font-semibold">Agendar Reunião</h3>
        <p class="text-sm text-muted-foreground">
          Escolha a data para a reunião de acompanhamento
        </p>
        <Calendar 
          v-model="date" 
          class="rounded-md border" 
        />
        <button 
          class="w-full bg-primary text-primary-foreground rounded-md py-2 text-sm font-medium"
          :disabled="!date"
        >
          Confirmar Data
        </button>
      </div>
    `,
  }),
}

/**
 * Calendário desabilitado
 */
export const Disabled: Story = {
  render: () => ({
    components: { Calendar },
    template: `
      <div class="space-y-2">
        <span class="text-sm text-muted-foreground">
          Calendário indisponível
        </span>
        <Calendar 
          disabled 
          class="rounded-md border shadow opacity-50" 
        />
      </div>
    `,
  }),
}

/**
 * Múltiplos calendários lado a lado
 */
export const DoisMeses: Story = {
  render: () => ({
    components: { Calendar },
    template: `
      <div class="flex gap-4 p-4 bg-card rounded-lg border">
        <div class="space-y-2">
          <span class="text-sm font-medium">Data Início</span>
          <Calendar class="rounded-md border" />
        </div>
        <div class="space-y-2">
          <span class="text-sm font-medium">Data Fim</span>
          <Calendar class="rounded-md border" />
        </div>
      </div>
    `,
  }),
}

/**
 * Em modal de agendamento
 */
export const EmModalAgendamento: Story = {
  render: () => ({
    components: { Calendar },
    setup() {
      const date = ref(null)
      return { date }
    },
    template: `
      <div class="bg-background rounded-lg shadow-lg border p-6 max-w-sm">
        <div class="space-y-4">
          <div class="text-center">
            <h2 class="text-lg font-semibold">Agendar Contato</h2>
            <p class="text-sm text-muted-foreground">
              Quando deseja entrar em contato?
            </p>
          </div>
          
          <Calendar 
            v-model="date" 
            class="rounded-md border mx-auto" 
          />
          
          <div class="flex gap-2">
            <button class="flex-1 border rounded-md py-2 text-sm">
              Cancelar
            </button>
            <button 
              class="flex-1 bg-primary text-primary-foreground rounded-md py-2 text-sm"
              :disabled="!date"
            >
              Agendar
            </button>
          </div>
        </div>
      </div>
    `,
  }),
}

/**
 * Calendário para filtro de relatório
 */
export const FiltroRelatorio: Story = {
  render: () => ({
    components: { Calendar },
    template: `
      <div class="w-[280px] bg-popover rounded-lg shadow-lg border">
        <div class="p-3 border-b">
          <h4 class="font-medium text-sm">Filtrar por Data</h4>
        </div>
        <div class="p-3">
          <Calendar class="rounded-md border" />
        </div>
        <div class="p-3 border-t flex gap-2">
          <button class="flex-1 text-sm text-muted-foreground hover:text-foreground">
            Limpar
          </button>
          <button class="flex-1 bg-primary text-primary-foreground rounded-md py-1.5 text-sm">
            Aplicar
          </button>
        </div>
      </div>
    `,
  }),
}
