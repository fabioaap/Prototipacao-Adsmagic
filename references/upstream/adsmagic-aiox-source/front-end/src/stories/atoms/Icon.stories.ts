import type { Meta, StoryObj } from '@storybook/vue3'
import Icon from '@/components/ui/Icon.vue'

const meta: Meta<typeof Icon> = {
    title: 'Atoms/Icon',
    component: Icon,
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: 'Componente de ícone SVG inline com suporte a diferentes nomes e tamanhos.'
            }
        }
    },
    argTypes: {
        name: {
            control: 'select',
            options: ['home', 'users', 'sales', 'bell', 'menu'],
            description: 'Nome do ícone'
        },
        size: {
            control: { type: 'number', min: 12, max: 48 },
            description: 'Tamanho em pixels'
        }
    }
}

export default meta
type Story = StoryObj<typeof Icon>

// Default
export const Default: Story = {
    args: {
        name: 'home',
        size: 20
    }
}

// Home
export const Home: Story = {
    args: {
        name: 'home',
        size: 24
    },
    render: (args) => ({
        components: { Icon },
        setup() {
            return { args }
        },
        template: `
      <div class="flex items-center gap-2">
        <Icon v-bind="args" />
        <span class="text-sm">Dashboard</span>
      </div>
    `
    })
}

// Users
export const Users: Story = {
    args: {
        name: 'users',
        size: 24
    },
    render: (args) => ({
        components: { Icon },
        setup() {
            return { args }
        },
        template: `
      <div class="flex items-center gap-2">
        <Icon v-bind="args" />
        <span class="text-sm">Contatos</span>
      </div>
    `
    })
}

// Sales
export const Sales: Story = {
    args: {
        name: 'sales',
        size: 24
    },
    render: (args) => ({
        components: { Icon },
        setup() {
            return { args }
        },
        template: `
      <div class="flex items-center gap-2">
        <Icon v-bind="args" />
        <span class="text-sm">Vendas</span>
      </div>
    `
    })
}

// Bell (Notificações)
export const Bell: Story = {
    args: {
        name: 'bell',
        size: 24
    },
    render: (args) => ({
        components: { Icon },
        setup() {
            return { args }
        },
        template: `
      <div class="relative inline-flex">
        <Icon v-bind="args" />
        <span class="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
          3
        </span>
      </div>
    `
    })
}

// Menu
export const Menu: Story = {
    args: {
        name: 'menu',
        size: 24
    },
    render: (args) => ({
        components: { Icon },
        setup() {
            return { args }
        },
        template: `
      <button class="p-2 hover:bg-muted rounded-lg transition-colors">
        <Icon v-bind="args" />
      </button>
    `
    })
}

// Todos os ícones
export const AllIcons: Story = {
    render: () => ({
        components: { Icon },
        setup() {
            const icons = ['home', 'users', 'sales', 'bell', 'menu'] as const
            return { icons }
        },
        template: `
      <div class="grid grid-cols-5 gap-6">
        <div v-for="icon in icons" :key="icon" class="flex flex-col items-center gap-2 p-4 border rounded-lg">
          <Icon :name="icon" :size="24" />
          <span class="text-xs text-muted-foreground capitalize">{{ icon }}</span>
        </div>
      </div>
    `
    })
}

// Diferentes tamanhos
export const Sizes: Story = {
    render: () => ({
        components: { Icon },
        setup() {
            const sizes = [12, 16, 20, 24, 32, 40, 48]
            return { sizes }
        },
        template: `
      <div class="flex items-end gap-6">
        <div v-for="size in sizes" :key="size" class="flex flex-col items-center gap-2">
          <Icon name="home" :size="size" />
          <span class="text-xs text-muted-foreground">{{ size }}px</span>
        </div>
      </div>
    `
    })
}

// Em navegação lateral
export const InSidebar: Story = {
    render: () => ({
        components: { Icon },
        setup() {
            const menuItems = [
                { icon: 'home' as const, label: 'Dashboard', active: true },
                { icon: 'users' as const, label: 'Contatos', active: false },
                { icon: 'sales' as const, label: 'Vendas', active: false },
                { icon: 'bell' as const, label: 'Notificações', active: false, badge: 5 }
            ]
            return { menuItems }
        },
        template: `
      <div class="w-[220px] p-2 bg-muted/30 rounded-lg">
        <div
          v-for="item in menuItems"
          :key="item.icon"
          class="flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors"
          :class="item.active ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'"
        >
          <div class="flex items-center gap-3">
            <Icon :name="item.icon" :size="18" />
            <span class="text-sm font-medium">{{ item.label }}</span>
          </div>
          <span 
            v-if="item.badge" 
            class="px-2 py-0.5 text-xs rounded-full"
            :class="item.active ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-primary text-primary-foreground'"
          >
            {{ item.badge }}
          </span>
        </div>
      </div>
    `
    })
}

// Com cores
export const WithColors: Story = {
    render: () => ({
        components: { Icon },
        template: `
      <div class="flex gap-6">
        <div class="flex flex-col items-center gap-2">
          <div class="text-primary"><Icon name="home" :size="24" /></div>
          <span class="text-xs text-muted-foreground">Primary</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <div class="text-green-500"><Icon name="sales" :size="24" /></div>
          <span class="text-xs text-muted-foreground">Success</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <div class="text-destructive"><Icon name="bell" :size="24" /></div>
          <span class="text-xs text-muted-foreground">Destructive</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <div class="text-muted-foreground"><Icon name="users" :size="24" /></div>
          <span class="text-xs text-muted-foreground">Muted</span>
        </div>
      </div>
    `
    })
}
