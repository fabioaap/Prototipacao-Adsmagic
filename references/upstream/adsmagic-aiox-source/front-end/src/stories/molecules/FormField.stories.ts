import type { Meta, StoryObj } from '@storybook/vue3'
import FormField from '@/components/ui/FormField.vue'
import Input from '@/components/ui/Input.vue'
import Textarea from '@/components/ui/Textarea.vue'

const meta: Meta<typeof FormField> = {
    title: 'Molecules/FormField',
    component: FormField,
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: 'Componente de campo de formulário que combina label, input, texto auxiliar e mensagem de erro.'
            }
        }
    },
    argTypes: {
        label: {
            control: 'text',
            description: 'Label do campo'
        },
        error: {
            control: 'text',
            description: 'Mensagem de erro'
        },
        helperText: {
            control: 'text',
            description: 'Texto de ajuda'
        },
        required: {
            control: 'boolean',
            description: 'Campo obrigatório'
        }
    }
}

export default meta
type Story = StoryObj<typeof FormField>

// Default
export const Default: Story = {
    render: () => ({
        components: { FormField, Input },
        template: `
      <div class="w-[400px]">
        <FormField label="Nome completo">
          <template #default="{ id }">
            <Input :id="id" placeholder="Digite seu nome" />
          </template>
        </FormField>
      </div>
    `
    })
}

// Com texto auxiliar
export const WithHelperText: Story = {
    render: () => ({
        components: { FormField, Input },
        template: `
      <div class="w-[400px]">
        <FormField 
          label="E-mail" 
          helper-text="Usaremos este e-mail para enviar notificações importantes."
        >
          <template #default="{ id }">
            <Input :id="id" type="email" placeholder="seu@email.com" />
          </template>
        </FormField>
      </div>
    `
    })
}

// Campo obrigatório
export const Required: Story = {
    render: () => ({
        components: { FormField, Input },
        template: `
      <div class="w-[400px]">
        <FormField label="Nome do projeto" required>
          <template #default="{ id }">
            <Input :id="id" placeholder="Ex: Loja Virtual Fashion" />
          </template>
        </FormField>
      </div>
    `
    })
}

// Com erro
export const WithError: Story = {
    render: () => ({
        components: { FormField, Input },
        template: `
      <div class="w-[400px]">
        <FormField 
          label="E-mail" 
          error="Este e-mail já está em uso."
          required
        >
          <template #default="{ id }">
            <Input :id="id" type="email" value="usuario@existente.com" class="border-destructive" />
          </template>
        </FormField>
      </div>
    `
    })
}

// Formulário completo
export const CompleteForm: Story = {
    render: () => ({
        components: { FormField, Input, Textarea },
        template: `
      <div class="w-[500px] p-6 border rounded-lg space-y-6">
        <h2 class="text-xl font-bold">Novo Contato</h2>
        
        <FormField label="Nome completo" required>
          <template #default="{ id }">
            <Input :id="id" placeholder="João Silva" />
          </template>
        </FormField>
        
        <FormField label="E-mail" helper-text="E-mail principal para contato." required>
          <template #default="{ id }">
            <Input :id="id" type="email" placeholder="joao@empresa.com" />
          </template>
        </FormField>
        
        <FormField label="Telefone" helper-text="WhatsApp preferencial.">
          <template #default="{ id }">
            <Input :id="id" type="tel" placeholder="(11) 99999-9999" />
          </template>
        </FormField>
        
        <FormField label="Empresa">
          <template #default="{ id }">
            <Input :id="id" placeholder="Nome da empresa (opcional)" />
          </template>
        </FormField>
        
        <FormField label="Observações" helper-text="Informações adicionais sobre o contato.">
          <template #default="{ id }">
            <Textarea :id="id" placeholder="Adicione notas relevantes..." />
          </template>
        </FormField>
        
        <div class="flex gap-3 pt-4">
          <button class="flex-1 py-2 border rounded-lg font-medium hover:bg-muted">
            Cancelar
          </button>
          <button class="flex-1 py-2 bg-primary text-primary-foreground rounded-lg font-medium">
            Salvar contato
          </button>
        </div>
      </div>
    `
    })
}

// Formulário com validação
export const FormWithValidation: Story = {
    render: () => ({
        components: { FormField, Input },
        template: `
      <div class="w-[400px] p-6 border rounded-lg space-y-6">
        <h2 class="text-xl font-bold">Configurar integração</h2>
        
        <FormField label="Pixel ID" required error="Pixel ID inválido. Deve conter 15 dígitos.">
          <template #default="{ id }">
            <Input :id="id" placeholder="123456789012345" value="12345" class="border-destructive" />
          </template>
        </FormField>
        
        <FormField label="Token de acesso" required helper-text="Encontre em Configurações > Tokens do Meta Business Suite.">
          <template #default="{ id }">
            <Input :id="id" type="password" placeholder="••••••••••••••••" />
          </template>
        </FormField>
        
        <FormField label="Nome da conta" required>
          <template #default="{ id }">
            <Input :id="id" placeholder="Minha conta Meta Ads" value="Conta Principal" />
          </template>
        </FormField>
        
        <button class="w-full py-2 bg-primary text-primary-foreground rounded-lg font-medium opacity-50 cursor-not-allowed">
          Salvar integração
        </button>
      </div>
    `
    })
}

// Campos horizontais
export const HorizontalLayout: Story = {
    render: () => ({
        components: { FormField, Input },
        template: `
      <div class="w-[600px] p-6 border rounded-lg space-y-6">
        <h2 class="text-xl font-bold">Configurações da conta</h2>
        
        <div class="flex items-start gap-6">
          <div class="w-1/3">
            <label class="text-sm font-medium">Nome</label>
            <p class="text-xs text-muted-foreground">Seu nome completo.</p>
          </div>
          <div class="flex-1">
            <Input placeholder="João Silva" />
          </div>
        </div>
        
        <div class="flex items-start gap-6">
          <div class="w-1/3">
            <label class="text-sm font-medium">E-mail</label>
            <p class="text-xs text-muted-foreground">E-mail de acesso à conta.</p>
          </div>
          <div class="flex-1">
            <Input type="email" placeholder="joao@empresa.com" />
          </div>
        </div>
        
        <div class="flex items-start gap-6">
          <div class="w-1/3">
            <label class="text-sm font-medium">Cargo</label>
            <p class="text-xs text-muted-foreground">Sua função na empresa.</p>
          </div>
          <div class="flex-1">
            <Input placeholder="Gerente de Marketing" />
          </div>
        </div>
      </div>
    `
    })
}

// Campos inline
export const InlineFields: Story = {
    render: () => ({
        components: { FormField, Input },
        template: `
      <div class="w-[600px] p-6 border rounded-lg space-y-6">
        <h2 class="text-xl font-bold">Dados de faturamento</h2>
        
        <div class="grid grid-cols-2 gap-4">
          <FormField label="Nome" required>
            <template #default="{ id }">
              <Input :id="id" placeholder="João" />
            </template>
          </FormField>
          
          <FormField label="Sobrenome" required>
            <template #default="{ id }">
              <Input :id="id" placeholder="Silva" />
            </template>
          </FormField>
        </div>
        
        <FormField label="CPF/CNPJ" required>
          <template #default="{ id }">
            <Input :id="id" placeholder="000.000.000-00" />
          </template>
        </FormField>
        
        <div class="grid grid-cols-3 gap-4">
          <div class="col-span-2">
            <FormField label="Cidade" required>
              <template #default="{ id }">
                <Input :id="id" placeholder="São Paulo" />
              </template>
            </FormField>
          </div>
          <FormField label="Estado" required>
            <template #default="{ id }">
              <Input :id="id" placeholder="SP" />
            </template>
          </FormField>
        </div>
      </div>
    `
    })
}
