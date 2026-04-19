import type { Meta, StoryObj } from '@storybook/vue3'
import PasswordInput from '@/components/ui/PasswordInput.vue'
import { ref } from 'vue'

const meta: Meta<typeof PasswordInput> = {
    title: 'Atoms/PasswordInput',
    component: PasswordInput,
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: 'Campo de entrada de senha com toggle de visibilidade e indicador de força.'
            }
        }
    },
    argTypes: {
        placeholder: {
            control: 'text',
            description: 'Placeholder do campo'
        },
        disabled: {
            control: 'boolean',
            description: 'Campo desabilitado'
        },
        required: {
            control: 'boolean',
            description: 'Campo obrigatório'
        },
        showStrength: {
            control: 'boolean',
            description: 'Mostrar indicador de força'
        }
    }
}

export default meta
type Story = StoryObj<typeof PasswordInput>

// Default
export const Default: Story = {
    render: () => ({
        components: { PasswordInput },
        setup() {
            const password = ref('')
            return { password }
        },
        template: `
      <div class="w-[400px]">
        <PasswordInput v-model="password" />
      </div>
    `
    })
}

// Com senha fraca
export const WeakPassword: Story = {
    render: () => ({
        components: { PasswordInput },
        setup() {
            const password = ref('abc')
            return { password }
        },
        template: `
      <div class="w-[400px]">
        <label class="block text-sm font-medium mb-2">Senha</label>
        <PasswordInput v-model="password" />
        <p class="text-xs text-muted-foreground mt-1">
          Valor atual: {{ password }}
        </p>
      </div>
    `
    })
}

// Com senha média
export const MediumPassword: Story = {
    render: () => ({
        components: { PasswordInput },
        setup() {
            const password = ref('Abc123')
            return { password }
        },
        template: `
      <div class="w-[400px]">
        <label class="block text-sm font-medium mb-2">Senha</label>
        <PasswordInput v-model="password" />
      </div>
    `
    })
}

// Com senha forte
export const StrongPassword: Story = {
    render: () => ({
        components: { PasswordInput },
        setup() {
            const password = ref('Abc123!@#')
            return { password }
        },
        template: `
      <div class="w-[400px]">
        <label class="block text-sm font-medium mb-2">Senha</label>
        <PasswordInput v-model="password" />
      </div>
    `
    })
}

// Com senha excelente
export const ExcellentPassword: Story = {
    render: () => ({
        components: { PasswordInput },
        setup() {
            const password = ref('Abc123!@#xyz')
            return { password }
        },
        template: `
      <div class="w-[400px]">
        <label class="block text-sm font-medium mb-2">Senha</label>
        <PasswordInput v-model="password" />
      </div>
    `
    })
}

// Sem indicador de força
export const WithoutStrengthIndicator: Story = {
    render: () => ({
        components: { PasswordInput },
        setup() {
            const password = ref('')
            return { password }
        },
        template: `
      <div class="w-[400px]">
        <label class="block text-sm font-medium mb-2">Senha</label>
        <PasswordInput v-model="password" :show-strength="false" />
      </div>
    `
    })
}

// Desabilitado
export const Disabled: Story = {
    render: () => ({
        components: { PasswordInput },
        setup() {
            const password = ref('senhaantiga123')
            return { password }
        },
        template: `
      <div class="w-[400px]">
        <label class="block text-sm font-medium mb-2">Senha atual</label>
        <PasswordInput v-model="password" disabled />
      </div>
    `
    })
}

// Em formulário de login
export const InLoginForm: Story = {
    render: () => ({
        components: { PasswordInput },
        setup() {
            const email = ref('')
            const password = ref('')
            return { email, password }
        },
        template: `
      <div class="w-[400px] p-6 border rounded-lg space-y-4">
        <h2 class="text-xl font-bold text-center mb-6">Entrar no AdsMagic</h2>
        
        <div>
          <label class="block text-sm font-medium mb-2">E-mail</label>
          <input 
            v-model="email"
            type="email" 
            placeholder="seu@email.com"
            class="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium mb-2">Senha</label>
          <PasswordInput v-model="password" :show-strength="false" />
        </div>
        
        <div class="flex items-center justify-between text-sm">
          <label class="flex items-center gap-2">
            <input type="checkbox" class="rounded" />
            <span>Lembrar de mim</span>
          </label>
          <a href="#" class="text-primary hover:underline">Esqueceu a senha?</a>
        </div>
        
        <button class="w-full py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90">
          Entrar
        </button>
      </div>
    `
    })
}

// Em formulário de registro
export const InRegisterForm: Story = {
    render: () => ({
        components: { PasswordInput },
        setup() {
            const password = ref('')
            const confirmPassword = ref('')
            return { password, confirmPassword }
        },
        template: `
      <div class="w-[400px] p-6 border rounded-lg space-y-4">
        <h2 class="text-xl font-bold">Criar conta</h2>
        
        <div>
          <label class="block text-sm font-medium mb-2">Senha</label>
          <PasswordInput v-model="password" />
        </div>
        
        <div>
          <label class="block text-sm font-medium mb-2">Confirmar senha</label>
          <PasswordInput v-model="confirmPassword" :show-strength="false" placeholder="Confirme sua senha" />
          <p v-if="password && confirmPassword && password !== confirmPassword" class="text-xs text-destructive mt-1">
            As senhas não coincidem
          </p>
          <p v-else-if="password && confirmPassword && password === confirmPassword" class="text-xs text-green-500 mt-1">
            ✓ Senhas coincidem
          </p>
        </div>
        
        <button 
          class="w-full py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50"
          :disabled="!password || !confirmPassword || password !== confirmPassword"
        >
          Criar conta
        </button>
      </div>
    `
    })
}

// Alteração de senha
export const ChangePassword: Story = {
    render: () => ({
        components: { PasswordInput },
        setup() {
            const currentPassword = ref('')
            const newPassword = ref('')
            const confirmPassword = ref('')
            return { currentPassword, newPassword, confirmPassword }
        },
        template: `
      <div class="w-[400px] p-6 border rounded-lg space-y-4">
        <h2 class="text-xl font-bold">Alterar senha</h2>
        
        <div>
          <label class="block text-sm font-medium mb-2">Senha atual</label>
          <PasswordInput v-model="currentPassword" :show-strength="false" />
        </div>
        
        <hr class="my-4" />
        
        <div>
          <label class="block text-sm font-medium mb-2">Nova senha</label>
          <PasswordInput v-model="newPassword" />
        </div>
        
        <div>
          <label class="block text-sm font-medium mb-2">Confirmar nova senha</label>
          <PasswordInput v-model="confirmPassword" :show-strength="false" />
        </div>
        
        <div class="flex gap-3 pt-2">
          <button class="flex-1 py-2 border rounded-lg font-medium hover:bg-muted">
            Cancelar
          </button>
          <button class="flex-1 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90">
            Salvar
          </button>
        </div>
      </div>
    `
    })
}
