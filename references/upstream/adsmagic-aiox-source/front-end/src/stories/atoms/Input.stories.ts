import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import { Search as SearchIcon, Mail, Lock, Eye, EyeOff } from 'lucide-vue-next'
import Input from '@/components/ui/Input.vue'

/**
 * O componente Input é usado para entrada de dados do usuário.
 * Suporta diferentes tipos (text, email, password, number) e estados.
 * 
 * ## Uso
 * ```vue
 * <Input v-model="value" placeholder="Digite algo..." />
 * ```
 */
const meta: Meta<typeof Input> = {
    title: 'Atoms/Input',
    component: Input,
    tags: ['autodocs'],
    argTypes: {
        type: {
            control: 'select',
            options: ['text', 'email', 'password', 'number', 'tel', 'url', 'search'],
            description: 'Tipo do input HTML',
            table: {
                type: { summary: 'string' },
                defaultValue: { summary: 'text' },
            },
        },
        placeholder: {
            control: 'text',
            description: 'Texto de placeholder',
            table: {
                type: { summary: 'string' },
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
        required: {
            control: 'boolean',
            description: 'Campo obrigatório',
            table: {
                type: { summary: 'boolean' },
                defaultValue: { summary: 'false' },
            },
        },
        modelValue: {
            control: 'text',
            description: 'Valor do input (v-model)',
            table: {
                type: { summary: 'string | number' },
            },
        },
    },
}

export default meta
type Story = StoryObj<typeof meta>

// ============================================================================
// Básico
// ============================================================================

/**
 * Input padrão com placeholder
 */
export const Default: Story = {
    args: {
        placeholder: 'Digite seu texto...',
    },
    render: (args) => ({
        components: { Input },
        setup() {
            const value = ref('')
            return { args, value }
        },
        template: '<Input v-bind="args" v-model="value" />',
    }),
}

/**
 * Input com valor preenchido
 */
export const WithValue: Story = {
    render: () => ({
        components: { Input },
        setup() {
            const value = ref('Texto preenchido')
            return { value }
        },
        template: '<Input v-model="value" />',
    }),
}

// ============================================================================
// Tipos de Input
// ============================================================================

/**
 * Input para email
 */
export const Email: Story = {
    args: {
        type: 'email',
        placeholder: 'seu@email.com',
    },
    render: (args) => ({
        components: { Input },
        setup() {
            const value = ref('')
            return { args, value }
        },
        template: '<Input v-bind="args" v-model="value" />',
    }),
}

/**
 * Input para senha
 */
export const Password: Story = {
    args: {
        type: 'password',
        placeholder: 'Digite sua senha',
    },
    render: (args) => ({
        components: { Input },
        setup() {
            const value = ref('')
            return { args, value }
        },
        template: '<Input v-bind="args" v-model="value" />',
    }),
}

/**
 * Input para números
 */
export const Number: Story = {
    args: {
        type: 'number',
        placeholder: '0',
    },
    render: (args) => ({
        components: { Input },
        setup() {
            const value = ref('')
            return { args, value }
        },
        template: '<Input v-bind="args" v-model="value" />',
    }),
}

/**
 * Input para busca
 */
export const SearchInput: Story = {
    args: {
        type: 'search',
        placeholder: 'Buscar...',
    },
    render: (args) => ({
        components: { Input },
        setup() {
            const value = ref('')
            return { args, value }
        },
        template: '<Input v-bind="args" v-model="value" />',
    }),
}

// ============================================================================
// Estados
// ============================================================================

/**
 * Input desabilitado
 */
export const Disabled: Story = {
    args: {
        disabled: true,
        placeholder: 'Campo desabilitado',
    },
    render: (args) => ({
        components: { Input },
        setup() {
            const value = ref('')
            return { args, value }
        },
        template: '<Input v-bind="args" v-model="value" />',
    }),
}

/**
 * Input desabilitado com valor
 */
export const DisabledWithValue: Story = {
    render: () => ({
        components: { Input },
        setup() {
            const value = ref('Valor não editável')
            return { value }
        },
        template: '<Input v-model="value" disabled />',
    }),
}

/**
 * Input obrigatório
 */
export const Required: Story = {
    args: {
        required: true,
        placeholder: 'Campo obrigatório *',
    },
    render: (args) => ({
        components: { Input },
        setup() {
            const value = ref('')
            return { args, value }
        },
        template: '<Input v-bind="args" v-model="value" />',
    }),
}

// ============================================================================
// Composições
// ============================================================================

/**
 * Input com ícone à esquerda (via wrapper)
 */
export const WithIcon: Story = {
    render: () => ({
        components: { Input, SearchIcon },
        setup() {
            const value = ref('')
            return { value }
        },
        template: `
      <div class="relative">
        <SearchIcon class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input v-model="value" placeholder="Buscar contatos..." class="pl-9" />
      </div>
    `,
    }),
}

/**
 * Input de email com ícone
 */
export const EmailWithIcon: Story = {
    render: () => ({
        components: { Input, Mail },
        setup() {
            const value = ref('')
            return { value }
        },
        template: `
      <div class="relative">
        <Mail class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input v-model="value" type="email" placeholder="seu@email.com" class="pl-9" />
      </div>
    `,
    }),
}

/**
 * Input de senha com toggle de visibilidade
 */
export const PasswordWithToggle: Story = {
    render: () => ({
        components: { Input, Lock, Eye, EyeOff },
        setup() {
            const value = ref('')
            const showPassword = ref(false)
            const togglePassword = () => { showPassword.value = !showPassword.value }
            return { value, showPassword, togglePassword }
        },
        template: `
      <div class="relative">
        <Lock class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          v-model="value" 
          :type="showPassword ? 'text' : 'password'" 
          placeholder="Sua senha" 
          class="pl-9 pr-9" 
        />
        <button 
          type="button"
          @click="togglePassword" 
          class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          <Eye v-if="!showPassword" class="h-4 w-4" />
          <EyeOff v-else class="h-4 w-4" />
        </button>
      </div>
    `,
    }),
}

// ============================================================================
// Todos os Tipos
// ============================================================================

/**
 * Visão geral de todos os tipos de input
 */
export const AllTypes: Story = {
    render: () => ({
        components: { Input },
        setup() {
            const text = ref('')
            const email = ref('')
            const password = ref('')
            const number = ref('')
            const tel = ref('')
            const search = ref('')
            return { text, email, password, number, tel, search }
        },
        template: `
      <div class="space-y-4 w-80">
        <div>
          <label class="block text-sm font-medium mb-1">Texto</label>
          <Input v-model="text" type="text" placeholder="Texto comum" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Email</label>
          <Input v-model="email" type="email" placeholder="seu@email.com" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Senha</label>
          <Input v-model="password" type="password" placeholder="••••••••" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Número</label>
          <Input v-model="number" type="number" placeholder="0" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Telefone</label>
          <Input v-model="tel" type="tel" placeholder="(11) 99999-9999" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Busca</label>
          <Input v-model="search" type="search" placeholder="Buscar..." />
        </div>
      </div>
    `,
    }),
}
