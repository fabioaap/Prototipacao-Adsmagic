import type { Meta, StoryObj } from '@storybook/vue3'
import ProjectName from '@/components/ui/ProjectName.vue'

/**
 * ProjectName - Exibição do nome do projeto atual.
 * 
 * Componente simples para mostrar o nome do projeto
 * com label e título em formato compacto.
 */
const meta: Meta<typeof ProjectName> = {
  title: 'Molecules/ProjectName',
  component: ProjectName,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Exibe o nome do projeto atual com label.',
      },
    },
  },
  argTypes: {
    projectName: {
      control: 'text',
      description: 'Nome do projeto a exibir',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

/**
 * Nome de projeto padrão
 */
export const Default: Story = {
  args: {
    projectName: 'Minha Loja Virtual',
  },
  render: (args) => ({
    components: { ProjectName },
    setup() {
      return { args }
    },
    template: `
      <ProjectName :projectName="args.projectName" />
    `,
  }),
}

/**
 * Nome curto
 */
export const NomeCurto: Story = {
  args: {
    projectName: 'Projeto X',
  },
  render: (args) => ({
    components: { ProjectName },
    setup() {
      return { args }
    },
    template: `
      <ProjectName :projectName="args.projectName" />
    `,
  }),
}

/**
 * Nome longo com truncate
 */
export const NomeLongo: Story = {
  args: {
    projectName: 'Empresa de Marketing Digital e Publicidade Online Ltda',
  },
  render: (args) => ({
    components: { ProjectName },
    setup() {
      return { args }
    },
    template: `
      <ProjectName :projectName="args.projectName" />
    `,
  }),
}

/**
 * No header do dashboard
 */
export const NoHeaderDashboard: Story = {
  args: {
    projectName: 'E-commerce Fashion',
  },
  render: (args) => ({
    components: { ProjectName },
    setup() {
      return { args }
    },
    template: `
      <div class="w-full max-w-4xl bg-card rounded-lg border">
        <div class="flex items-center justify-between p-4 border-b">
          <ProjectName :projectName="args.projectName" />
          <div class="flex items-center gap-2">
            <button class="px-3 py-1.5 text-sm border rounded-md hover:bg-accent">
              Últimos 30 dias
            </button>
            <button class="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md">
              Exportar
            </button>
          </div>
        </div>
        <div class="p-4 text-muted-foreground text-sm">
          Conteúdo do dashboard...
        </div>
      </div>
    `,
  }),
}

/**
 * Na sidebar
 */
export const NaSidebar: Story = {
  args: {
    projectName: 'Clínica Odontológica',
  },
  render: (args) => ({
    components: { ProjectName },
    setup() {
      return { args }
    },
    template: `
      <div class="w-64 bg-card rounded-lg border p-4 space-y-4">
        <ProjectName :projectName="args.projectName" />
        
        <div class="h-px bg-border"></div>
        
        <nav class="space-y-1">
          <a href="#" class="flex items-center gap-2 px-3 py-2 text-sm rounded-md bg-accent">
            📊 Dashboard
          </a>
          <a href="#" class="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent">
            👥 Contatos
          </a>
          <a href="#" class="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent">
            💰 Vendas
          </a>
          <a href="#" class="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent">
            ⚙️ Integrações
          </a>
        </nav>
      </div>
    `,
  }),
}

/**
 * Em dropdown de seleção
 */
export const EmDropdownSelecao: Story = {
  render: () => ({
    components: { ProjectName },
    setup() {
      const projetos = [
        'Minha Loja Virtual',
        'E-commerce Fashion',
        'Clínica Odontológica',
      ]
      return { projetos }
    },
    template: `
      <div class="w-72 bg-popover rounded-lg shadow-lg border">
        <div class="p-3 border-b">
          <span class="text-sm font-medium">Selecionar Projeto</span>
        </div>
        
        <div class="p-2 space-y-1">
          <button 
            v-for="(nome, index) in projetos" 
            :key="index"
            class="w-full text-left p-2 rounded-md hover:bg-accent"
            :class="{ 'bg-accent': index === 0 }"
          >
            <ProjectName :projectName="nome" />
          </button>
        </div>
        
        <div class="p-3 border-t">
          <button class="w-full text-sm text-primary hover:underline text-center">
            + Criar novo projeto
          </button>
        </div>
      </div>
    `,
  }),
}

/**
 * Em card de resumo
 */
export const EmCardResumo: Story = {
  args: {
    projectName: 'Academia Fitness',
  },
  render: (args) => ({
    components: { ProjectName },
    setup() {
      return { args }
    },
    template: `
      <div class="w-80 bg-card rounded-lg border overflow-hidden">
        <div class="bg-gradient-to-r from-primary/10 to-primary/5 p-4">
          <ProjectName :projectName="args.projectName" />
        </div>
        
        <div class="p-4 space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-xs text-muted-foreground">Leads este mês</p>
              <p class="text-lg font-semibold">234</p>
            </div>
            <div>
              <p class="text-xs text-muted-foreground">Vendas</p>
              <p class="text-lg font-semibold">18</p>
            </div>
          </div>
          
          <div class="flex items-center justify-between text-sm">
            <span class="text-green-600">+12% vs mês anterior</span>
            <button class="text-primary hover:underline">Ver mais →</button>
          </div>
        </div>
      </div>
    `,
  }),
}

/**
 * Múltiplos projetos
 */
export const MultiplosProjetos: Story = {
  render: () => ({
    components: { ProjectName },
    setup() {
      const projetos = [
        { nome: 'E-commerce Fashion', leads: 456, vendas: 34 },
        { nome: 'Clínica Estética', leads: 234, vendas: 18 },
        { nome: 'Escola de Idiomas', leads: 189, vendas: 12 },
      ]
      return { projetos }
    },
    template: `
      <div class="space-y-4 w-full max-w-md">
        <h3 class="font-semibold">Seus Projetos</h3>
        
        <div class="space-y-3">
          <div 
            v-for="(projeto, index) in projetos" 
            :key="index"
            class="flex items-center justify-between p-4 bg-card rounded-lg border hover:shadow-sm transition-shadow"
          >
            <ProjectName :projectName="projeto.nome" />
            <div class="text-right">
              <p class="text-sm font-medium">{{ projeto.leads }} leads</p>
              <p class="text-xs text-muted-foreground">{{ projeto.vendas }} vendas</p>
            </div>
          </div>
        </div>
      </div>
    `,
  }),
}
