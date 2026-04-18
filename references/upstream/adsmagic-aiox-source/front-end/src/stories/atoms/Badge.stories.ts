import type { Meta, StoryObj } from '@storybook/vue3'
import Badge from '@/components/ui/Badge.vue'

/**
 * O componente Badge é usado para mostrar status, categorias ou labels.
 * Suporta múltiplas variantes visuais e cores semânticas.
 * 
 * ## Uso
 * ```vue
 * <Badge variant="soft" color="success">Ativo</Badge>
 * ```
 */
const meta: Meta<typeof Badge> = {
    title: 'Atoms/Badge',
    component: Badge,
    tags: ['autodocs'],
    argTypes: {
        variant: {
            control: 'select',
            options: ['default', 'soft', 'solid', 'outline', 'secondary', 'success', 'warning', 'destructive'],
            description: 'Estilo visual do badge',
            table: {
                type: { summary: 'string' },
                defaultValue: { summary: 'soft' },
            },
        },
        color: {
            control: 'select',
            options: ['default', 'success', 'warning', 'info', 'destructive'],
            description: 'Cor semântica do badge',
            table: {
                type: { summary: 'string' },
                defaultValue: { summary: 'default' },
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
 * Badge padrão com estilo soft
 */
export const Default: Story = {
    args: {
        variant: 'soft',
        color: 'default',
    },
    render: (args) => ({
        components: { Badge },
        setup() {
            return { args }
        },
        template: '<Badge v-bind="args">Badge</Badge>',
    }),
}

/**
 * Badge com fundo sólido
 */
export const Solid: Story = {
    args: {
        variant: 'solid',
        color: 'success',
    },
    render: (args) => ({
        components: { Badge },
        setup() {
            return { args }
        },
        template: '<Badge v-bind="args">Ativo</Badge>',
    }),
}

/**
 * Badge com borda (outline)
 */
export const Outline: Story = {
    args: {
        variant: 'outline',
        color: 'info',
    },
    render: (args) => ({
        components: { Badge },
        setup() {
            return { args }
        },
        template: '<Badge v-bind="args">Info</Badge>',
    }),
}

/**
 * Badge secundário
 */
export const Secondary: Story = {
    args: {
        variant: 'secondary',
    },
    render: (args) => ({
        components: { Badge },
        setup() {
            return { args }
        },
        template: '<Badge v-bind="args">Secundário</Badge>',
    }),
}

// ============================================================================
// Cores Semânticas
// ============================================================================

/**
 * Badge de sucesso - usado para status positivos
 */
export const Success: Story = {
    args: {
        variant: 'success',
    },
    render: (args) => ({
        components: { Badge },
        setup() {
            return { args }
        },
        template: '<Badge v-bind="args">Sucesso</Badge>',
    }),
}

/**
 * Badge de aviso - usado para alertas
 */
export const Warning: Story = {
    args: {
        variant: 'warning',
    },
    render: (args) => ({
        components: { Badge },
        setup() {
            return { args }
        },
        template: '<Badge v-bind="args">Aviso</Badge>',
    }),
}

/**
 * Badge destrutivo - usado para erros ou ações perigosas
 */
export const Destructive: Story = {
    args: {
        variant: 'destructive',
    },
    render: (args) => ({
        components: { Badge },
        setup() {
            return { args }
        },
        template: '<Badge v-bind="args">Erro</Badge>',
    }),
}

// ============================================================================
// Casos de Uso
// ============================================================================

/**
 * Badge para status de contato
 */
export const ContactStatus: Story = {
    render: () => ({
        components: { Badge },
        template: `
      <div class="flex items-center gap-2">
        <Badge variant="success">Convertido</Badge>
        <Badge variant="warning">Em análise</Badge>
        <Badge variant="soft" color="info">Novo</Badge>
        <Badge variant="destructive">Perdido</Badge>
      </div>
    `,
    }),
}

/**
 * Badge para etapas do funil
 */
export const FunnelStages: Story = {
    render: () => ({
        components: { Badge },
        template: `
      <div class="flex flex-wrap items-center gap-2">
        <Badge variant="solid" color="info">Lead</Badge>
        <Badge variant="solid" color="warning">Qualificação</Badge>
        <Badge variant="solid" color="success">Proposta</Badge>
        <Badge variant="outline" color="success">Fechado</Badge>
      </div>
    `,
    }),
}

/**
 * Badge para origens de tráfego
 */
export const TrafficOrigins: Story = {
    render: () => ({
        components: { Badge },
        template: `
      <div class="flex flex-wrap items-center gap-2">
        <Badge variant="soft" color="info">Google Ads</Badge>
        <Badge variant="soft" color="info">Meta Ads</Badge>
        <Badge variant="soft" color="default">Orgânico</Badge>
        <Badge variant="soft" color="warning">Indicação</Badge>
      </div>
    `,
    }),
}

// ============================================================================
// Todas as Variantes
// ============================================================================

/**
 * Visão geral de todas as variantes e cores
 */
export const AllVariants: Story = {
    render: () => ({
        components: { Badge },
        template: `
      <div class="space-y-6">
        <div>
          <h3 class="text-sm font-semibold mb-2">Variantes</h3>
          <div class="flex flex-wrap items-center gap-2">
            <Badge variant="default">Default</Badge>
            <Badge variant="soft">Soft</Badge>
            <Badge variant="solid" color="info">Solid</Badge>
            <Badge variant="outline" color="info">Outline</Badge>
            <Badge variant="secondary">Secondary</Badge>
          </div>
        </div>
        
        <div>
          <h3 class="text-sm font-semibold mb-2">Cores Semânticas</h3>
          <div class="flex flex-wrap items-center gap-2">
            <Badge variant="soft" color="default">Default</Badge>
            <Badge variant="soft" color="success">Success</Badge>
            <Badge variant="soft" color="warning">Warning</Badge>
            <Badge variant="soft" color="info">Info</Badge>
            <Badge variant="soft" color="destructive">Destructive</Badge>
          </div>
        </div>
        
        <div>
          <h3 class="text-sm font-semibold mb-2">Cores Sólidas</h3>
          <div class="flex flex-wrap items-center gap-2">
            <Badge variant="solid" color="default">Default</Badge>
            <Badge variant="solid" color="success">Success</Badge>
            <Badge variant="solid" color="warning">Warning</Badge>
            <Badge variant="solid" color="info">Info</Badge>
            <Badge variant="solid" color="destructive">Destructive</Badge>
          </div>
        </div>
        
        <div>
          <h3 class="text-sm font-semibold mb-2">Outline</h3>
          <div class="flex flex-wrap items-center gap-2">
            <Badge variant="outline" color="default">Default</Badge>
            <Badge variant="outline" color="success">Success</Badge>
            <Badge variant="outline" color="warning">Warning</Badge>
            <Badge variant="outline" color="info">Info</Badge>
            <Badge variant="outline" color="destructive">Destructive</Badge>
          </div>
        </div>
      </div>
    `,
    }),
}
