import type { Meta, StoryObj } from '@storybook/vue3'
import Spinner from '@/components/ui/Spinner.vue'

const meta: Meta<typeof Spinner> = {
    title: 'Atoms/Spinner',
    component: Spinner,
    tags: ['autodocs'],
    argTypes: {
        size: {
            control: 'select',
            options: ['xs', 'sm', 'md', 'lg', 'xl'],
            description: 'Tamanho do spinner'
        },
        variant: {
            control: 'select',
            options: ['default', 'primary', 'secondary', 'muted'],
            description: 'Variante de cor'
        }
    },
    parameters: {
        docs: {
            description: {
                component: 'Spinner animado para indicar estados de carregamento.'
            }
        }
    }
}

export default meta
type Story = StoryObj<typeof Spinner>

// Default
export const Default: Story = {
    args: {
        size: 'md'
    }
}

// Tamanhos
export const ExtraSmall: Story = {
    args: {
        size: 'xs'
    }
}

export const Small: Story = {
    args: {
        size: 'sm'
    }
}

export const Medium: Story = {
    args: {
        size: 'md'
    }
}

export const Large: Story = {
    args: {
        size: 'lg'
    }
}

export const ExtraLarge: Story = {
    args: {
        size: 'xl'
    }
}

// Todos os tamanhos
export const AllSizes: Story = {
    render: () => ({
        components: { Spinner },
        template: `
      <div class="flex items-center gap-6">
        <div class="text-center">
          <Spinner size="xs" />
          <p class="text-xs mt-2">XS</p>
        </div>
        <div class="text-center">
          <Spinner size="sm" />
          <p class="text-xs mt-2">SM</p>
        </div>
        <div class="text-center">
          <Spinner size="md" />
          <p class="text-xs mt-2">MD</p>
        </div>
        <div class="text-center">
          <Spinner size="lg" />
          <p class="text-xs mt-2">LG</p>
        </div>
        <div class="text-center">
          <Spinner size="xl" />
          <p class="text-xs mt-2">XL</p>
        </div>
      </div>
    `
    })
}

// Loading State
export const LoadingState: Story = {
    render: () => ({
        components: { Spinner },
        template: `
      <div class="flex flex-col items-center justify-center p-12 border rounded-lg">
        <Spinner size="lg" />
        <p class="mt-4 text-muted-foreground">Carregando...</p>
      </div>
    `
    })
}

// Inline com texto
export const InlineWithText: Story = {
    render: () => ({
        components: { Spinner },
        template: `
      <div class="flex items-center gap-2">
        <Spinner size="sm" />
        <span>Salvando alterações...</span>
      </div>
    `
    })
}

// Botão com loading
export const ButtonLoading: Story = {
    render: () => ({
        components: { Spinner },
        template: `
      <button class="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md">
        <Spinner size="sm" class="text-primary-foreground" />
        Processando...
      </button>
    `
    })
}

// Card loading
export const CardLoading: Story = {
    render: () => ({
        components: { Spinner },
        template: `
      <div class="p-6 border rounded-lg">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold">Dados do Dashboard</h3>
        </div>
        <div class="flex items-center justify-center h-32">
          <Spinner size="lg" />
        </div>
      </div>
    `
    })
}

// Full page overlay
export const FullPageOverlay: Story = {
    render: () => ({
        components: { Spinner },
        template: `
      <div class="relative h-64 border rounded-lg overflow-hidden">
        <div class="p-4">
          <p>Conteúdo da página...</p>
        </div>
        <div class="absolute inset-0 bg-background/80 flex items-center justify-center">
          <div class="text-center">
            <Spinner size="xl" />
            <p class="mt-4 font-medium">Carregando página...</p>
          </div>
        </div>
      </div>
    `
    })
}
