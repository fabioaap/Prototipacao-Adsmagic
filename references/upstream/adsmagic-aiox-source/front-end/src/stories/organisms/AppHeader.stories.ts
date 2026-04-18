import type { Meta, StoryObj } from '@storybook/vue3'
import AppHeader from '@/components/layout/AppHeader.vue'
import { fn } from '@storybook/test'

/**
 * AppHeader - Header principal da aplicação.
 * 
 * Inclui busca, filtro de período, notificações,
 * seletor de idioma e menu do usuário.
 */
const meta: Meta<typeof AppHeader> = {
  title: 'Organisms/Layout/AppHeader',
  component: AppHeader,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Header com busca, filtros e ações do usuário.',
      },
    },
  },
  argTypes: {
    title: {
      control: 'text',
      description: 'Título opcional a exibir',
    },
    showSearch: {
      control: 'boolean',
      description: 'Exibir campo de busca',
    },
    showNotifications: {
      control: 'boolean',
      description: 'Exibir centro de notificações',
    },
  },
  args: {
    onSearch: fn(),
    onPeriodChange: fn(),
  },
}

export default meta
type Story = StoryObj<typeof meta>

/**
 * Header padrão
 */
export const Default: Story = {
  args: {
    showSearch: true,
    showNotifications: true,
  },
  render: (args) => ({
    components: { AppHeader },
    setup() {
      return { args }
    },
    template: `
      <AppHeader 
        :showSearch="args.showSearch" 
        :showNotifications="args.showNotifications"
      />
    `,
  }),
}

/**
 * Com título
 */
export const ComTitulo: Story = {
  args: {
    title: 'Dashboard',
    showSearch: true,
    showNotifications: true,
  },
  render: (args) => ({
    components: { AppHeader },
    setup() {
      return { args }
    },
    template: `
      <AppHeader 
        :title="args.title"
        :showSearch="args.showSearch" 
        :showNotifications="args.showNotifications"
      />
    `,
  }),
}

/**
 * Sem busca
 */
export const SemBusca: Story = {
  args: {
    showSearch: false,
    showNotifications: true,
  },
  render: (args) => ({
    components: { AppHeader },
    setup() {
      return { args }
    },
    template: `
      <AppHeader 
        :showSearch="args.showSearch" 
        :showNotifications="args.showNotifications"
      />
    `,
  }),
}

/**
 * Sem notificações
 */
export const SemNotificacoes: Story = {
  args: {
    showSearch: true,
    showNotifications: false,
  },
  render: (args) => ({
    components: { AppHeader },
    setup() {
      return { args }
    },
    template: `
      <AppHeader 
        :showSearch="args.showSearch" 
        :showNotifications="args.showNotifications"
      />
    `,
  }),
}

/**
 * No contexto de página
 */
export const NoContextoPagina: Story = {
  args: {
    showSearch: true,
    showNotifications: true,
  },
  render: (args) => ({
    components: { AppHeader },
    setup() {
      return { args }
    },
    template: `
      <div class="min-h-screen bg-muted/30">
        <AppHeader 
          :showSearch="args.showSearch" 
          :showNotifications="args.showNotifications"
        />
        
        <div class="p-6">
          <h1 class="text-2xl font-bold mb-4">Conteúdo da Página</h1>
          <div class="bg-card rounded-lg border p-4">
            <p class="text-muted-foreground">
              O header fica fixo no topo enquanto o conteúdo rola.
            </p>
          </div>
        </div>
      </div>
    `,
  }),
}

/**
 * Minimalista
 */
export const Minimalista: Story = {
  args: {
    showSearch: false,
    showNotifications: false,
  },
  render: (args) => ({
    components: { AppHeader },
    setup() {
      return { args }
    },
    template: `
      <AppHeader 
        :showSearch="args.showSearch" 
        :showNotifications="args.showNotifications"
      />
    `,
  }),
}
