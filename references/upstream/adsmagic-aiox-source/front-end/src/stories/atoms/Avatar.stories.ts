import type { Meta, StoryObj } from '@storybook/vue3'
import Avatar from '@/components/ui/Avatar.vue'

const meta: Meta<typeof Avatar> = {
    title: 'Atoms/Avatar',
    component: Avatar,
    tags: ['autodocs'],
    argTypes: {
        src: {
            control: 'text',
            description: 'URL da imagem do avatar'
        },
        alt: {
            control: 'text',
            description: 'Texto alternativo da imagem'
        },
        fallback: {
            control: 'text',
            description: 'Texto ou iniciais para fallback'
        },
        size: {
            control: 'select',
            options: ['xs', 'sm', 'md', 'lg', 'xl'],
            description: 'Tamanho do avatar'
        }
    },
    parameters: {
        docs: {
            description: {
                component: 'Avatar para exibição de foto de perfil de usuários, com suporte a fallback com iniciais.'
            }
        }
    }
}

export default meta
type Story = StoryObj<typeof Avatar>

// Com imagem
export const WithImage: Story = {
    args: {
        src: 'https://github.com/shadcn.png',
        alt: 'Usuário',
        size: 'md'
    }
}

// Com fallback (iniciais)
export const WithFallback: Story = {
    args: {
        fallback: 'JD',
        size: 'md'
    }
}

// Tamanhos
export const ExtraSmall: Story = {
    args: {
        fallback: 'XS',
        size: 'xs'
    }
}

export const Small: Story = {
    args: {
        fallback: 'SM',
        size: 'sm'
    }
}

export const Medium: Story = {
    args: {
        fallback: 'MD',
        size: 'md'
    }
}

export const Large: Story = {
    args: {
        fallback: 'LG',
        size: 'lg'
    }
}

export const ExtraLarge: Story = {
    args: {
        fallback: 'XL',
        size: 'xl'
    }
}

// Grupo de avatares
export const AvatarGroup: Story = {
    render: () => ({
        components: { Avatar },
        template: `
      <div class="flex -space-x-2">
        <Avatar src="https://github.com/shadcn.png" size="md" class="border-2 border-background" />
        <Avatar fallback="AB" size="md" class="border-2 border-background" />
        <Avatar fallback="CD" size="md" class="border-2 border-background" />
        <Avatar fallback="+3" size="md" class="border-2 border-background bg-muted" />
      </div>
    `
    })
}

// Todos os tamanhos
export const AllSizes: Story = {
    render: () => ({
        components: { Avatar },
        template: `
      <div class="flex items-center gap-4">
        <div class="text-center">
          <Avatar fallback="XS" size="xs" />
          <p class="text-xs mt-1">XS</p>
        </div>
        <div class="text-center">
          <Avatar fallback="SM" size="sm" />
          <p class="text-xs mt-1">SM</p>
        </div>
        <div class="text-center">
          <Avatar fallback="MD" size="md" />
          <p class="text-xs mt-1">MD</p>
        </div>
        <div class="text-center">
          <Avatar fallback="LG" size="lg" />
          <p class="text-xs mt-1">LG</p>
        </div>
        <div class="text-center">
          <Avatar fallback="XL" size="xl" />
          <p class="text-xs mt-1">XL</p>
        </div>
      </div>
    `
    })
}
