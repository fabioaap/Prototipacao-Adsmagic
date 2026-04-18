import type { Meta, StoryObj } from '@storybook/vue3'
import { Search, Plus, Trash2, Download, Loader2 } from 'lucide-vue-next'
import Button from '@/components/ui/Button.vue'

/**
 * O componente Button é o elemento de ação principal da interface.
 * Suporta 6 variantes visuais e 4 tamanhos diferentes.
 * 
 * **Design System:**
 * - Border-radius: 14px (consistente com DateRangePicker e SearchInput)
 * - Transições suaves em hover
 * - Estados: default, hover, active, disabled
 * 
 * ## Uso
 * ```vue
 * <Button variant="primary" size="default">Salvar</Button>
 * ```
 */
const meta: Meta<typeof Button> = {
    title: 'Atoms/Button',
    component: Button,
    tags: ['autodocs'],
    argTypes: {
        variant: {
            control: 'select',
            options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
            description: 'Estilo visual do botão',
            table: {
                type: { summary: 'string' },
                defaultValue: { summary: 'default' },
            },
        },
        size: {
            control: 'select',
            options: ['default', 'sm', 'lg', 'icon'],
            description: 'Tamanho do botão',
            table: {
                type: { summary: 'string' },
                defaultValue: { summary: 'default' },
            },
        },
        disabled: {
            control: 'boolean',
            description: 'Estado desabilitado',
            table: {
                type: { summary: 'boolean' },
                defaultValue: { summary: 'false' },
            },
        },
        type: {
            control: 'select',
            options: ['button', 'submit', 'reset'],
            description: 'Tipo do botão HTML',
            table: {
                type: { summary: 'string' },
                defaultValue: { summary: 'button' },
            },
        },
    },
}

export default meta
type Story = StoryObj<typeof meta>

// ============================================================================
// Variantes
// ============================================================================

/**
 * Botão padrão (primary) - usado para ações principais
 */
export const Default: Story = {
    args: {
        variant: 'default',
    },
    render: (args) => ({
        components: { Button },
        setup() {
            return { args }
        },
        template: '<Button v-bind="args">Salvar</Button>',
    }),
}

/**
 * Botão secundário - usado para ações secundárias
 */
export const Secondary: Story = {
    args: {
        variant: 'secondary',
    },
    render: (args) => ({
        components: { Button },
        setup() {
            return { args }
        },
        template: '<Button v-bind="args">Cancelar</Button>',
    }),
}

/**
 * Botão outline - usado para ações terciárias ou filtros
 */
export const Outline: Story = {
    args: {
        variant: 'outline',
    },
    render: (args) => ({
        components: { Button },
        setup() {
            return { args }
        },
        template: '<Button v-bind="args">Filtros</Button>',
    }),
}

/**
 * Botão ghost - usado em toolbars ou ações sutis
 */
export const Ghost: Story = {
    args: {
        variant: 'ghost',
    },
    render: (args) => ({
        components: { Button },
        setup() {
            return { args }
        },
        template: '<Button v-bind="args">Mais opções</Button>',
    }),
}

/**
 * Botão link - aparência de link, comportamento de botão
 */
export const Link: Story = {
    args: {
        variant: 'link',
    },
    render: (args) => ({
        components: { Button },
        setup() {
            return { args }
        },
        template: '<Button v-bind="args">Ver mais</Button>',
    }),
}

/**
 * Botão destructive - usado para ações perigosas (excluir, remover)
 */
export const Destructive: Story = {
    args: {
        variant: 'destructive',
    },
    render: (args) => ({
        components: { Button, Trash2 },
        setup() {
            return { args }
        },
        template: `
      <Button v-bind="args">
        <Trash2 class="mr-2 h-4 w-4" />
        Excluir
      </Button>
    `,
    }),
}

// ============================================================================
// Tamanhos
// ============================================================================

/**
 * Comparação de todos os tamanhos disponíveis
 */
export const Sizes: Story = {
    render: () => ({
        components: { Button },
        template: `
      <div class="flex items-center gap-4">
        <Button size="sm">Pequeno</Button>
        <Button size="default">Padrão</Button>
        <Button size="lg">Grande</Button>
      </div>
    `,
    }),
}

/**
 * Botão de ícone - usado para ações compactas
 */
export const IconButton: Story = {
    args: {
        size: 'icon',
        variant: 'outline',
    },
    render: (args) => ({
        components: { Button, Search, Plus, Trash2 },
        setup() {
            return { args }
        },
        template: `
      <div class="flex items-center gap-2">
        <Button v-bind="args"><Search class="h-4 w-4" /></Button>
        <Button v-bind="args" variant="default"><Plus class="h-4 w-4" /></Button>
        <Button v-bind="args" variant="destructive"><Trash2 class="h-4 w-4" /></Button>
      </div>
    `,
    }),
}

// ============================================================================
// Estados
// ============================================================================

/**
 * Botão desabilitado
 */
export const Disabled: Story = {
    args: {
        disabled: true,
    },
    render: (args) => ({
        components: { Button },
        setup() {
            return { args }
        },
        template: `
      <div class="flex items-center gap-4">
        <Button v-bind="args">Desabilitado</Button>
        <Button v-bind="args" variant="outline">Outline Desabilitado</Button>
        <Button v-bind="args" variant="destructive">Destructive Desabilitado</Button>
      </div>
    `,
    }),
}

/**
 * Botão com estado de loading
 */
export const Loading: Story = {
    render: () => ({
        components: { Button, Loader2 },
        template: `
      <div class="flex items-center gap-4">
        <Button disabled>
          <Loader2 class="mr-2 h-4 w-4 animate-spin" />
          Salvando...
        </Button>
        <Button variant="outline" disabled>
          <Loader2 class="mr-2 h-4 w-4 animate-spin" />
          Carregando...
        </Button>
      </div>
    `,
    }),
}

// ============================================================================
// Com Ícones
// ============================================================================

/**
 * Botões com ícones à esquerda
 */
export const WithLeftIcon: Story = {
    render: () => ({
        components: { Button, Search, Plus, Download },
        template: `
      <div class="flex items-center gap-4">
        <Button>
          <Plus class="mr-2 h-4 w-4" />
          Novo Contato
        </Button>
        <Button variant="outline">
          <Search class="mr-2 h-4 w-4" />
          Buscar
        </Button>
        <Button variant="secondary">
          <Download class="mr-2 h-4 w-4" />
          Exportar
        </Button>
      </div>
    `,
    }),
}

// ============================================================================
// Todas as Variantes
// ============================================================================

/**
 * Visão geral de todas as variantes
 */
export const AllVariants: Story = {
    render: () => ({
        components: { Button },
        template: `
      <div class="space-y-4">
        <div class="flex items-center gap-4">
          <Button variant="default">Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
          <Button variant="destructive">Destructive</Button>
        </div>
        <div class="flex items-center gap-4">
          <Button variant="default" disabled>Default</Button>
          <Button variant="secondary" disabled>Secondary</Button>
          <Button variant="outline" disabled>Outline</Button>
          <Button variant="ghost" disabled>Ghost</Button>
          <Button variant="link" disabled>Link</Button>
          <Button variant="destructive" disabled>Destructive</Button>
        </div>
      </div>
    `,
    }),
}
