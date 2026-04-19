import type { Meta, StoryObj } from '@storybook/vue3'
import Skeleton from '@/components/ui/Skeleton.vue'

const meta: Meta<typeof Skeleton> = {
    title: 'Atoms/Skeleton',
    component: Skeleton,
    tags: ['autodocs'],
    argTypes: {
        class: {
            control: 'text',
            description: 'Classes CSS para dimensões'
        }
    },
    parameters: {
        docs: {
            description: {
                component: 'Skeleton para estados de loading. Mostra placeholders animados enquanto o conteúdo carrega.'
            }
        }
    }
}

export default meta
type Story = StoryObj<typeof Skeleton>

// Default (linha de texto)
export const Default: Story = {
    render: () => ({
        components: { Skeleton },
        template: `<Skeleton class="h-4 w-48" />`
    })
}

// Avatar
export const Avatar: Story = {
    render: () => ({
        components: { Skeleton },
        template: `<Skeleton class="h-12 w-12 rounded-full" />`
    })
}

// Card
export const Card: Story = {
    render: () => ({
        components: { Skeleton },
        template: `
      <div class="flex flex-col space-y-3">
        <Skeleton class="h-[125px] w-[250px] rounded-xl" />
        <div class="space-y-2">
          <Skeleton class="h-4 w-[250px]" />
          <Skeleton class="h-4 w-[200px]" />
        </div>
      </div>
    `
    })
}

// Linha de perfil
export const ProfileRow: Story = {
    render: () => ({
        components: { Skeleton },
        template: `
      <div class="flex items-center space-x-4">
        <Skeleton class="h-12 w-12 rounded-full" />
        <div class="space-y-2">
          <Skeleton class="h-4 w-[200px]" />
          <Skeleton class="h-4 w-[150px]" />
        </div>
      </div>
    `
    })
}

// Tabela
export const Table: Story = {
    render: () => ({
        components: { Skeleton },
        template: `
      <div class="space-y-3">
        <div class="flex items-center space-x-4">
          <Skeleton class="h-4 w-[100px]" />
          <Skeleton class="h-4 w-[150px]" />
          <Skeleton class="h-4 w-[120px]" />
          <Skeleton class="h-4 w-[80px]" />
        </div>
        <div class="flex items-center space-x-4">
          <Skeleton class="h-4 w-[100px]" />
          <Skeleton class="h-4 w-[150px]" />
          <Skeleton class="h-4 w-[120px]" />
          <Skeleton class="h-4 w-[80px]" />
        </div>
        <div class="flex items-center space-x-4">
          <Skeleton class="h-4 w-[100px]" />
          <Skeleton class="h-4 w-[150px]" />
          <Skeleton class="h-4 w-[120px]" />
          <Skeleton class="h-4 w-[80px]" />
        </div>
      </div>
    `
    })
}

// Lista
export const List: Story = {
    render: () => ({
        components: { Skeleton },
        template: `
      <div class="space-y-4">
        <div class="flex items-center space-x-4">
          <Skeleton class="h-10 w-10 rounded-lg" />
          <div class="space-y-2 flex-1">
            <Skeleton class="h-4 w-3/4" />
            <Skeleton class="h-3 w-1/2" />
          </div>
        </div>
        <div class="flex items-center space-x-4">
          <Skeleton class="h-10 w-10 rounded-lg" />
          <div class="space-y-2 flex-1">
            <Skeleton class="h-4 w-2/3" />
            <Skeleton class="h-3 w-1/3" />
          </div>
        </div>
        <div class="flex items-center space-x-4">
          <Skeleton class="h-10 w-10 rounded-lg" />
          <div class="space-y-2 flex-1">
            <Skeleton class="h-4 w-4/5" />
            <Skeleton class="h-3 w-2/5" />
          </div>
        </div>
      </div>
    `
    })
}

// Dashboard Cards
export const DashboardCards: Story = {
    render: () => ({
        components: { Skeleton },
        template: `
      <div class="grid grid-cols-4 gap-4">
        <div class="p-4 border rounded-lg space-y-3">
          <Skeleton class="h-4 w-20" />
          <Skeleton class="h-8 w-24" />
          <Skeleton class="h-3 w-16" />
        </div>
        <div class="p-4 border rounded-lg space-y-3">
          <Skeleton class="h-4 w-20" />
          <Skeleton class="h-8 w-24" />
          <Skeleton class="h-3 w-16" />
        </div>
        <div class="p-4 border rounded-lg space-y-3">
          <Skeleton class="h-4 w-20" />
          <Skeleton class="h-8 w-24" />
          <Skeleton class="h-3 w-16" />
        </div>
        <div class="p-4 border rounded-lg space-y-3">
          <Skeleton class="h-4 w-20" />
          <Skeleton class="h-8 w-24" />
          <Skeleton class="h-3 w-16" />
        </div>
      </div>
    `
    })
}

// Chart placeholder
export const Chart: Story = {
    render: () => ({
        components: { Skeleton },
        template: `
      <div class="p-4 border rounded-lg space-y-4">
        <div class="flex items-center justify-between">
          <Skeleton class="h-5 w-32" />
          <Skeleton class="h-8 w-24" />
        </div>
        <Skeleton class="h-[200px] w-full rounded-lg" />
      </div>
    `
    })
}

// Form loading
export const FormLoading: Story = {
    render: () => ({
        components: { Skeleton },
        template: `
      <div class="space-y-6 max-w-md">
        <div class="space-y-2">
          <Skeleton class="h-4 w-20" />
          <Skeleton class="h-10 w-full" />
        </div>
        <div class="space-y-2">
          <Skeleton class="h-4 w-24" />
          <Skeleton class="h-10 w-full" />
        </div>
        <div class="space-y-2">
          <Skeleton class="h-4 w-16" />
          <Skeleton class="h-24 w-full" />
        </div>
        <Skeleton class="h-10 w-32" />
      </div>
    `
    })
}
