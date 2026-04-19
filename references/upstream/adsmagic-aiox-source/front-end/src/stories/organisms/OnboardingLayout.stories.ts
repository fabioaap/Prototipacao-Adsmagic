import type { Meta, StoryObj } from '@storybook/vue3'
import OnboardingLayout from '@/components/features/onboarding/OnboardingLayout.vue'

/**
 * OnboardingLayout - Layout wrapper para fluxo de onboarding.
 * 
 * Centraliza conteúdo, exibe barra de progresso e
 * suporta layout split com painel lateral.
 */
const meta: Meta<typeof OnboardingLayout> = {
  title: 'Organisms/Onboarding/OnboardingLayout',
  component: OnboardingLayout,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Layout principal para o fluxo de onboarding.',
      },
    },
  },
  argTypes: {
    title: {
      control: 'text',
      description: 'Título da etapa',
    },
    subtitle: {
      control: 'text',
      description: 'Subtítulo da etapa',
    },
    showProgress: {
      control: 'boolean',
      description: 'Exibir barra de progresso',
    },
    progress: {
      control: { type: 'number', min: 0, max: 100 },
      description: 'Valor do progresso (0-100)',
    },
    split: {
      control: 'boolean',
      description: 'Layout split com painel lateral',
    },
    centered: {
      control: 'boolean',
      description: 'Centralizar conteúdo verticalmente',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

/**
 * Layout de onboarding padrão
 */
export const Default: Story = {
  args: {
    title: 'Bem-vindo ao AdsMagic',
    subtitle: 'Vamos configurar seu primeiro projeto',
    showProgress: true,
    progress: 25,
  },
  render: (args) => ({
    components: { OnboardingLayout },
    setup() {
      return { args }
    },
    template: `
      <OnboardingLayout 
        :title="args.title"
        :subtitle="args.subtitle"
        :showProgress="args.showProgress"
        :progress="args.progress"
      >
        <div class="w-full max-w-md p-6 bg-card rounded-lg border">
          <div class="space-y-4">
            <div class="space-y-2">
              <label class="text-sm font-medium">Nome do Projeto</label>
              <input type="text" class="w-full h-10 rounded-md border px-3" placeholder="Ex: Minha Loja" />
            </div>
            <button class="w-full bg-primary text-primary-foreground rounded-md py-2.5 font-medium">
              Continuar
            </button>
          </div>
        </div>
      </OnboardingLayout>
    `,
  }),
}

/**
 * Etapa 1 - Dados da empresa
 */
export const Etapa1: Story = {
  args: {
    title: 'Dados da Empresa',
    subtitle: 'Informe os dados básicos da sua empresa',
    showProgress: true,
    progress: 20,
  },
  render: (args) => ({
    components: { OnboardingLayout },
    setup() {
      return { args }
    },
    template: `
      <OnboardingLayout 
        :title="args.title"
        :subtitle="args.subtitle"
        :showProgress="args.showProgress"
        :progress="args.progress"
      >
        <div class="w-full max-w-lg p-6 bg-card rounded-lg border">
          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <label class="text-sm font-medium">Nome da Empresa</label>
                <input type="text" class="w-full h-10 rounded-md border px-3" />
              </div>
              <div class="space-y-2">
                <label class="text-sm font-medium">CNPJ</label>
                <input type="text" class="w-full h-10 rounded-md border px-3" />
              </div>
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium">Segmento</label>
              <select class="w-full h-10 rounded-md border px-3">
                <option>Selecione...</option>
                <option>E-commerce</option>
                <option>Serviços</option>
                <option>Infoprodutos</option>
              </select>
            </div>
            <div class="flex gap-2 pt-4">
              <button class="flex-1 border rounded-md py-2.5">Voltar</button>
              <button class="flex-1 bg-primary text-primary-foreground rounded-md py-2.5">Continuar</button>
            </div>
          </div>
        </div>
      </OnboardingLayout>
    `,
  }),
}

/**
 * Etapa 2 - Configuração de projeto
 */
export const Etapa2: Story = {
  args: {
    title: 'Configure seu Projeto',
    subtitle: 'Personalize as configurações do seu projeto',
    showProgress: true,
    progress: 40,
  },
  render: (args) => ({
    components: { OnboardingLayout },
    setup() {
      return { args }
    },
    template: `
      <OnboardingLayout 
        :title="args.title"
        :subtitle="args.subtitle"
        :showProgress="args.showProgress"
        :progress="args.progress"
      >
        <div class="w-full max-w-lg p-6 bg-card rounded-lg border">
          <div class="space-y-4">
            <div class="space-y-2">
              <label class="text-sm font-medium">Nome do Projeto</label>
              <input type="text" class="w-full h-10 rounded-md border px-3" />
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium">Moeda</label>
              <select class="w-full h-10 rounded-md border px-3">
                <option>BRL - Real Brasileiro</option>
                <option>USD - Dólar Americano</option>
                <option>EUR - Euro</option>
              </select>
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium">Fuso Horário</label>
              <select class="w-full h-10 rounded-md border px-3">
                <option>America/Sao_Paulo (GMT-3)</option>
              </select>
            </div>
            <div class="flex gap-2 pt-4">
              <button class="flex-1 border rounded-md py-2.5">Voltar</button>
              <button class="flex-1 bg-primary text-primary-foreground rounded-md py-2.5">Continuar</button>
            </div>
          </div>
        </div>
      </OnboardingLayout>
    `,
  }),
}

/**
 * Etapa 3 - Integrações
 */
export const Etapa3: Story = {
  args: {
    title: 'Conecte suas Integrações',
    subtitle: 'Conecte suas plataformas de anúncios',
    showProgress: true,
    progress: 60,
  },
  render: (args) => ({
    components: { OnboardingLayout },
    setup() {
      return { args }
    },
    template: `
      <OnboardingLayout 
        :title="args.title"
        :subtitle="args.subtitle"
        :showProgress="args.showProgress"
        :progress="args.progress"
      >
        <div class="w-full max-w-lg space-y-4">
          <div class="p-4 bg-card rounded-lg border flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span class="text-white font-bold">f</span>
              </div>
              <div>
                <p class="font-medium">Meta Ads</p>
                <p class="text-sm text-muted-foreground">Facebook e Instagram</p>
              </div>
            </div>
            <button class="px-4 py-2 text-sm border rounded-md hover:bg-accent">
              Conectar
            </button>
          </div>
          
          <div class="p-4 bg-card rounded-lg border flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                <span class="text-white font-bold">G</span>
              </div>
              <div>
                <p class="font-medium">Google Ads</p>
                <p class="text-sm text-muted-foreground">Pesquisa e Display</p>
              </div>
            </div>
            <button class="px-4 py-2 text-sm border rounded-md hover:bg-accent">
              Conectar
            </button>
          </div>
          
          <div class="flex gap-2 pt-4">
            <button class="flex-1 border rounded-md py-2.5">Voltar</button>
            <button class="flex-1 bg-primary text-primary-foreground rounded-md py-2.5">Continuar</button>
          </div>
        </div>
      </OnboardingLayout>
    `,
  }),
}

/**
 * Etapa final - Conclusão
 */
export const EtapaFinal: Story = {
  args: {
    title: 'Tudo pronto!',
    subtitle: 'Seu projeto foi configurado com sucesso',
    showProgress: true,
    progress: 100,
    centered: true,
  },
  render: (args) => ({
    components: { OnboardingLayout },
    setup() {
      return { args }
    },
    template: `
      <OnboardingLayout 
        :title="args.title"
        :subtitle="args.subtitle"
        :showProgress="args.showProgress"
        :progress="args.progress"
        :centered="args.centered"
      >
        <div class="text-center space-y-6">
          <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <svg class="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <div>
            <p class="text-lg text-muted-foreground mb-6">
              Agora você pode começar a rastrear suas campanhas e monitorar resultados em tempo real.
            </p>
            
            <button class="bg-primary text-primary-foreground rounded-md px-8 py-3 font-medium">
              Ir para o Dashboard
            </button>
          </div>
        </div>
      </OnboardingLayout>
    `,
  }),
}

/**
 * Sem barra de progresso
 */
export const SemProgresso: Story = {
  args: {
    title: 'Configuração Rápida',
    subtitle: 'Complete esta configuração inicial',
    showProgress: false,
  },
  render: (args) => ({
    components: { OnboardingLayout },
    setup() {
      return { args }
    },
    template: `
      <OnboardingLayout 
        :title="args.title"
        :subtitle="args.subtitle"
        :showProgress="args.showProgress"
      >
        <div class="w-full max-w-md p-6 bg-card rounded-lg border">
          <p class="text-muted-foreground mb-4">
            Conteúdo sem barra de progresso visível
          </p>
          <button class="w-full bg-primary text-primary-foreground rounded-md py-2.5">
            Continuar
          </button>
        </div>
      </OnboardingLayout>
    `,
  }),
}
