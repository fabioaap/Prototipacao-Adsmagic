import type { Meta, StoryObj } from '@storybook/vue3'
import TrialBanner from '@/components/ui/TrialBanner.vue'
import { fn } from '@storybook/test'

/**
 * TrialBanner - Banner de período de teste.
 * 
 * Exibe mensagem sobre dias restantes do trial com
 * diferentes níveis de urgência baseados no tempo.
 */
const meta: Meta<typeof TrialBanner> = {
  title: 'Molecules/TrialBanner',
  component: TrialBanner,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Banner de alerta sobre período de teste expirando.',
      },
    },
  },
  argTypes: {
    daysRemaining: {
      control: { type: 'number', min: 0, max: 30 },
      description: 'Dias restantes do período de teste',
    },
    dismissible: {
      control: 'boolean',
      description: 'Permite fechar o banner',
    },
  },
  args: {
    onChoosePlan: fn(),
    onDismiss: fn(),
  },
}

export default meta
type Story = StoryObj<typeof meta>

/**
 * Banner com muitos dias restantes (baixa urgência)
 */
export const Default: Story = {
  args: {
    daysRemaining: 14,
  },
  render: (args) => ({
    components: { TrialBanner },
    setup() {
      return { args }
    },
    template: `
      <TrialBanner 
        :daysRemaining="args.daysRemaining"
        :onChoosePlan="args.onChoosePlan"
      />
    `,
  }),
}

/**
 * Urgência crítica - expira hoje
 */
export const ExpiraHoje: Story = {
  args: {
    daysRemaining: 0,
  },
  render: (args) => ({
    components: { TrialBanner },
    setup() {
      return { args }
    },
    template: `
      <TrialBanner 
        :daysRemaining="args.daysRemaining"
        :onChoosePlan="args.onChoosePlan"
      />
    `,
  }),
}

/**
 * Urgência crítica - expira amanhã
 */
export const ExpiraAmanha: Story = {
  args: {
    daysRemaining: 1,
  },
  render: (args) => ({
    components: { TrialBanner },
    setup() {
      return { args }
    },
    template: `
      <TrialBanner 
        :daysRemaining="args.daysRemaining"
        :onChoosePlan="args.onChoosePlan"
      />
    `,
  }),
}

/**
 * Urgência alta - 3 dias ou menos
 */
export const UrgenciaAlta: Story = {
  args: {
    daysRemaining: 3,
  },
  render: (args) => ({
    components: { TrialBanner },
    setup() {
      return { args }
    },
    template: `
      <TrialBanner 
        :daysRemaining="args.daysRemaining"
        :onChoosePlan="args.onChoosePlan"
      />
    `,
  }),
}

/**
 * Urgência média - 7 dias ou menos
 */
export const UrgenciaMedia: Story = {
  args: {
    daysRemaining: 7,
  },
  render: (args) => ({
    components: { TrialBanner },
    setup() {
      return { args }
    },
    template: `
      <TrialBanner 
        :daysRemaining="args.daysRemaining"
        :onChoosePlan="args.onChoosePlan"
      />
    `,
  }),
}

/**
 * Banner dismissível (pode ser fechado)
 */
export const Dismissivel: Story = {
  args: {
    daysRemaining: 10,
    dismissible: true,
  },
  render: (args) => ({
    components: { TrialBanner },
    setup() {
      return { args }
    },
    template: `
      <TrialBanner 
        :daysRemaining="args.daysRemaining"
        :dismissible="args.dismissible"
        :onChoosePlan="args.onChoosePlan"
        :onDismiss="args.onDismiss"
      />
    `,
  }),
}

/**
 * No topo do dashboard
 */
export const NoDashboard: Story = {
  args: {
    daysRemaining: 5,
  },
  render: (args) => ({
    components: { TrialBanner },
    setup() {
      return { args }
    },
    template: `
      <div class="w-full max-w-4xl space-y-4">
        <TrialBanner 
          :daysRemaining="args.daysRemaining"
          :onChoosePlan="args.onChoosePlan"
        />
        
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold">Dashboard</h1>
            <p class="text-muted-foreground">Visão geral do seu projeto</p>
          </div>
        </div>
        
        <div class="grid grid-cols-4 gap-4">
          <div class="p-4 bg-card rounded-lg border">
            <p class="text-sm text-muted-foreground">Leads</p>
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
    `,
  }),
}

/**
 * Todos os níveis de urgência
 */
export const TodosNiveis: Story = {
  render: () => ({
    components: { TrialBanner },
    template: `
      <div class="space-y-4 w-full max-w-3xl">
        <div class="space-y-2">
          <span class="text-xs text-muted-foreground uppercase tracking-wider">
            Crítico (0 dias)
          </span>
          <TrialBanner :daysRemaining="0" />
        </div>
        
        <div class="space-y-2">
          <span class="text-xs text-muted-foreground uppercase tracking-wider">
            Crítico (1 dia)
          </span>
          <TrialBanner :daysRemaining="1" />
        </div>
        
        <div class="space-y-2">
          <span class="text-xs text-muted-foreground uppercase tracking-wider">
            Alto (3 dias)
          </span>
          <TrialBanner :daysRemaining="3" />
        </div>
        
        <div class="space-y-2">
          <span class="text-xs text-muted-foreground uppercase tracking-wider">
            Médio (7 dias)
          </span>
          <TrialBanner :daysRemaining="7" />
        </div>
        
        <div class="space-y-2">
          <span class="text-xs text-muted-foreground uppercase tracking-wider">
            Baixo (14 dias)
          </span>
          <TrialBanner :daysRemaining="14" />
        </div>
      </div>
    `,
  }),
}
