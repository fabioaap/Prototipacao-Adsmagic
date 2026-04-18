import type { Meta, StoryObj } from '@storybook/vue3'
import SidebarNav from '@/components/layout/SidebarNav.vue'
import type { NavSection } from '@/components/layout/SidebarNav.vue'
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  Link,
  Plug,
  Settings,
  BarChart3,
  Calendar,
  FileText
} from 'lucide-vue-next'

/**
 * SidebarNav - Navegação lateral com accordion.
 * 
 * Suporta grupos colapsáveis, badges e indicação
 * de item ativo.
 */
const meta: Meta<typeof SidebarNav> = {
  title: 'Organisms/Layout/SidebarNav',
  component: SidebarNav,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Navegação lateral com accordion para grupos.',
      },
    },
  },
  argTypes: {
    collapsed: {
      control: 'boolean',
      description: 'Modo colapsado (apenas ícones)',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

const mockSections: NavSection[] = [
  {
    id: 'principal',
    title: 'Principal',
    defaultOpen: true,
    links: [
      { label: 'Dashboard', icon: LayoutDashboard, href: '/pt/projects/1/dashboard' },
      { label: 'Contatos', icon: Users, href: '/pt/projects/1/contacts', badge: 12 },
      { label: 'Vendas', icon: ShoppingCart, href: '/pt/projects/1/sales' },
    ],
  },
  {
    id: 'marketing',
    title: 'Marketing',
    links: [
      { label: 'Links de Rastreamento', icon: Link, href: '/pt/projects/1/links' },
      { label: 'Analytics', icon: BarChart3, href: '/pt/projects/1/analytics' },
    ],
  },
  {
    id: 'configuracoes',
    title: 'Configurações',
    links: [
      { label: 'Integrações', icon: Plug, href: '/pt/projects/1/integrations' },
      { label: 'Configurações', icon: Settings, href: '/pt/projects/1/settings' },
    ],
  },
]

/**
 * Sidebar expandida (padrão)
 */
export const Default: Story = {
  args: {
    sections: mockSections,
    collapsed: false,
  },
  render: (args) => ({
    components: { SidebarNav },
    setup() {
      return { args }
    },
    template: `
      <div class="w-64 bg-card border rounded-lg">
        <SidebarNav :sections="args.sections" :collapsed="args.collapsed" />
      </div>
    `,
  }),
}

/**
 * Sidebar colapsada
 */
export const Collapsed: Story = {
  args: {
    sections: mockSections,
    collapsed: true,
  },
  render: (args) => ({
    components: { SidebarNav },
    setup() {
      return { args }
    },
    template: `
      <div class="w-16 bg-card border rounded-lg">
        <SidebarNav :sections="args.sections" :collapsed="args.collapsed" />
      </div>
    `,
  }),
}

/**
 * Com badges de notificação
 */
export const ComBadges: Story = {
  args: {
    sections: [
      {
        id: 'principal',
        title: 'Principal',
        defaultOpen: true,
        links: [
          { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
          { label: 'Contatos', icon: Users, href: '/contacts', badge: 24 },
          { label: 'Vendas', icon: ShoppingCart, href: '/sales', badge: 5 },
          { label: 'Tarefas', icon: Calendar, href: '/tasks', badge: '!' },
        ],
      },
    ],
    collapsed: false,
  },
  render: (args) => ({
    components: { SidebarNav },
    setup() {
      return { args }
    },
    template: `
      <div class="w-64 bg-card border rounded-lg">
        <SidebarNav :sections="args.sections" :collapsed="args.collapsed" />
      </div>
    `,
  }),
}

/**
 * Múltiplas seções expandidas
 */
export const MultiplasSecoes: Story = {
  args: {
    sections: [
      {
        id: 'vendas',
        title: 'Vendas',
        defaultOpen: true,
        links: [
          { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
          { label: 'Contatos', icon: Users, href: '/contacts' },
          { label: 'Vendas', icon: ShoppingCart, href: '/sales' },
        ],
      },
      {
        id: 'marketing',
        title: 'Marketing',
        defaultOpen: true,
        links: [
          { label: 'Campanhas', icon: BarChart3, href: '/campaigns' },
          { label: 'Links', icon: Link, href: '/links' },
        ],
      },
      {
        id: 'relatorios',
        title: 'Relatórios',
        links: [
          { label: 'Analytics', icon: BarChart3, href: '/analytics' },
          { label: 'Exportações', icon: FileText, href: '/exports' },
        ],
      },
      {
        id: 'config',
        title: 'Sistema',
        links: [
          { label: 'Integrações', icon: Plug, href: '/integrations' },
          { label: 'Configurações', icon: Settings, href: '/settings' },
        ],
      },
    ],
    collapsed: false,
  },
  render: (args) => ({
    components: { SidebarNav },
    setup() {
      return { args }
    },
    template: `
      <div class="w-64 bg-card border rounded-lg max-h-[500px] overflow-auto">
        <SidebarNav :sections="args.sections" :collapsed="args.collapsed" />
      </div>
    `,
  }),
}

/**
 * Em contexto de layout
 */
export const EmContextoLayout: Story = {
  args: {
    sections: mockSections,
    collapsed: false,
  },
  render: (args) => ({
    components: { SidebarNav },
    setup() {
      return { args }
    },
    template: `
      <div class="flex h-[500px] bg-muted/30">
        <aside class="w-64 bg-card border-r">
          <div class="p-4 border-b">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span class="text-primary-foreground font-bold text-sm">A</span>
              </div>
              <span class="font-semibold">AdsMagic</span>
            </div>
          </div>
          <SidebarNav :sections="args.sections" :collapsed="args.collapsed" />
        </aside>
        
        <main class="flex-1 p-6">
          <h1 class="text-2xl font-bold">Conteúdo Principal</h1>
          <p class="text-muted-foreground mt-2">
            A sidebar com navegação fica à esquerda
          </p>
        </main>
      </div>
    `,
  }),
}

/**
 * Interativo: Toggle collapse
 */
export const InterativoToggle: Story = {
  args: {
    sections: mockSections,
  },
  render: () => ({
    components: { SidebarNav },
    data() {
      return {
        sections: mockSections,
        collapsed: false,
      }
    },
    template: `
      <div class="space-y-4">
        <button 
          @click="collapsed = !collapsed"
          class="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm"
        >
          {{ collapsed ? 'Expandir' : 'Colapsar' }} Sidebar
        </button>
        
        <div :class="collapsed ? 'w-16' : 'w-64'" class="bg-card border rounded-lg transition-all">
          <SidebarNav :sections="sections" :collapsed="collapsed" />
        </div>
      </div>
    `,
  }),
}
