import type { Meta, StoryObj } from '@storybook/vue3'
import FunnelBar from '@/components/ui/FunnelBar.vue'

/**
 * FunnelBar - Visualização de funil de vendas.
 * 
 * Exibe etapas do funil com barras proporcionais aos valores,
 * mostrando a conversão entre cada etapa.
 */
const meta: Meta<typeof FunnelBar> = {
  title: 'Molecules/FunnelBar',
  component: FunnelBar,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Visualização de funil de vendas com barras horizontais.',
      },
    },
  },
  argTypes: {
    steps: {
      description: 'Etapas do funil com label, valor e porcentagem opcional',
    },
    colors: {
      control: 'object',
      description: 'Cores para cada etapa',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

const defaultSteps = [
  { label: 'Leads', value: 1000, percentage: 100 },
  { label: 'Qualificados', value: 650, percentage: 65 },
  { label: 'Proposta', value: 320, percentage: 32 },
  { label: 'Negociação', value: 180, percentage: 18 },
  { label: 'Fechados', value: 89, percentage: 8.9 },
]

/**
 * Funil de vendas padrão
 */
export const Default: Story = {
  args: {
    steps: defaultSteps,
  },
  render: (args) => ({
    components: { FunnelBar },
    setup() {
      return { args }
    },
    template: `
      <div class="w-[400px]">
        <FunnelBar :steps="args.steps" />
      </div>
    `,
  }),
}

/**
 * Funil de marketing digital
 */
export const FunilMarketing: Story = {
  args: {
    steps: [
      { label: 'Impressões', value: 50000 },
      { label: 'Cliques', value: 2500 },
      { label: 'Cadastros', value: 450 },
      { label: 'Vendas', value: 89 },
    ],
    colors: ['#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE'],
  },
  render: (args) => ({
    components: { FunnelBar },
    setup() {
      return { args }
    },
    template: `
      <div class="w-[400px] p-4 bg-card rounded-lg border">
        <h3 class="font-semibold mb-4">Funil de Marketing</h3>
        <FunnelBar :steps="args.steps" :colors="args.colors" />
      </div>
    `,
  }),
}

/**
 * Funil de atendimento
 */
export const FunilAtendimento: Story = {
  args: {
    steps: [
      { label: 'Contatos recebidos', value: 1200 },
      { label: 'Primeiro contato', value: 980 },
      { label: 'Em negociação', value: 340 },
      { label: 'Proposta enviada', value: 156 },
      { label: 'Contrato assinado', value: 67 },
    ],
    colors: ['#10B981', '#34D399', '#6EE7B7', '#A7F3D0', '#D1FAE5'],
  },
  render: (args) => ({
    components: { FunnelBar },
    setup() {
      return { args }
    },
    template: `
      <div class="w-[450px] p-4 bg-card rounded-lg border">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold">Funil de Atendimento</h3>
          <span class="text-xs text-muted-foreground">Últimos 30 dias</span>
        </div>
        <FunnelBar :steps="args.steps" :colors="args.colors" />
      </div>
    `,
  }),
}

/**
 * No dashboard principal
 */
export const NoDashboard: Story = {
  args: {
    steps: defaultSteps,
  },
  render: (args) => ({
    components: { FunnelBar },
    setup() {
      return { args }
    },
    template: `
      <div class="w-[500px] p-6 bg-card rounded-xl border shadow-sm">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h3 class="text-lg font-semibold">Funil de Vendas</h3>
            <p class="text-sm text-muted-foreground">Performance do período atual</p>
          </div>
          <button class="text-xs text-primary hover:underline">
            Ver detalhes →
          </button>
        </div>
        
        <FunnelBar :steps="args.steps" />
        
        <div class="mt-6 pt-4 border-t flex items-center justify-between">
          <div class="text-center">
            <p class="text-xs text-muted-foreground">Taxa de Conversão</p>
            <p class="text-lg font-semibold text-primary">8.9%</p>
          </div>
          <div class="text-center">
            <p class="text-xs text-muted-foreground">Ticket Médio</p>
            <p class="text-lg font-semibold">R$ 534,00</p>
          </div>
          <div class="text-center">
            <p class="text-xs text-muted-foreground">Ciclo Médio</p>
            <p class="text-lg font-semibold">12 dias</p>
          </div>
        </div>
      </div>
    `,
  }),
}

/**
 * Cores customizadas
 */
export const CoresCustomizadas: Story = {
  args: {
    steps: [
      { label: 'Visitantes', value: 8500 },
      { label: 'Cadastros', value: 1200 },
      { label: 'Ativações', value: 450 },
      { label: 'Pagantes', value: 120 },
    ],
    colors: ['#F59E0B', '#FB923C', '#FDBA74', '#FED7AA'],
  },
  render: (args) => ({
    components: { FunnelBar },
    setup() {
      return { args }
    },
    template: `
      <div class="w-[400px]">
        <FunnelBar :steps="args.steps" :colors="args.colors" />
      </div>
    `,
  }),
}

/**
 * Funil simples com 3 etapas
 */
export const FunilSimples: Story = {
  args: {
    steps: [
      { label: 'Total de Contatos', value: 500 },
      { label: 'Em Andamento', value: 180 },
      { label: 'Convertidos', value: 45 },
    ],
  },
  render: (args) => ({
    components: { FunnelBar },
    setup() {
      return { args }
    },
    template: `
      <div class="w-[350px]">
        <FunnelBar :steps="args.steps" />
      </div>
    `,
  }),
}

/**
 * Comparação de funis
 */
export const ComparacaoFunis: Story = {
  render: () => ({
    components: { FunnelBar },
    setup() {
      const funilAtual = [
        { label: 'Leads', value: 1000 },
        { label: 'Qualificados', value: 650 },
        { label: 'Vendas', value: 89 },
      ]
      const funilAnterior = [
        { label: 'Leads', value: 850 },
        { label: 'Qualificados', value: 510 },
        { label: 'Vendas', value: 68 },
      ]
      return { funilAtual, funilAnterior }
    },
    template: `
      <div class="w-[500px] space-y-6">
        <div class="p-4 bg-card rounded-lg border">
          <div class="flex items-center gap-2 mb-4">
            <div class="w-3 h-3 rounded-full bg-primary"></div>
            <span class="font-medium text-sm">Este Mês</span>
          </div>
          <FunnelBar :steps="funilAtual" />
        </div>
        
        <div class="p-4 bg-card rounded-lg border">
          <div class="flex items-center gap-2 mb-4">
            <div class="w-3 h-3 rounded-full bg-muted-foreground"></div>
            <span class="font-medium text-sm">Mês Anterior</span>
          </div>
          <FunnelBar 
            :steps="funilAnterior" 
            :colors="['#94A3B8', '#A1A1AA', '#D4D4D8']" 
          />
        </div>
      </div>
    `,
  }),
}

/**
 * Em modal de detalhes
 */
export const EmModalDetalhes: Story = {
  args: {
    steps: defaultSteps,
  },
  render: (args) => ({
    components: { FunnelBar },
    setup() {
      return { args }
    },
    template: `
      <div class="w-[480px] bg-background rounded-lg shadow-lg border">
        <div class="flex items-center justify-between p-4 border-b">
          <h3 class="font-semibold">Detalhes do Funil</h3>
          <button class="text-muted-foreground hover:text-foreground">✕</button>
        </div>
        
        <div class="p-4">
          <FunnelBar :steps="args.steps" />
        </div>
        
        <div class="p-4 border-t bg-muted/50">
          <div class="flex items-center justify-between text-sm">
            <span class="text-muted-foreground">Período: Últimos 30 dias</span>
            <button class="text-primary hover:underline">Exportar dados</button>
          </div>
        </div>
      </div>
    `,
  }),
}
