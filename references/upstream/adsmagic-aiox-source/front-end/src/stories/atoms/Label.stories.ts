import type { Meta, StoryObj } from '@storybook/vue3'
import Label from '@/components/ui/Label.vue'
import Input from '@/components/ui/Input.vue'

const meta: Meta<typeof Label> = {
    title: 'Atoms/Label',
    component: Label,
    tags: ['autodocs'],
    argTypes: {
        for: {
            control: 'text',
            description: 'ID do input associado'
        }
    },
    parameters: {
        docs: {
            description: {
                component: 'Label para associar texto descritivo a inputs de formulário. Melhora a acessibilidade.'
            }
        }
    }
}

export default meta
type Story = StoryObj<typeof Label>

// Default
export const Default: Story = {
    render: () => ({
        components: { Label },
        template: `<Label>Nome Completo</Label>`
    })
}

// Com input
export const WithInput: Story = {
    render: () => ({
        components: { Label, Input },
        template: `
      <div class="space-y-2">
        <Label for="email">E-mail</Label>
        <Input id="email" type="email" placeholder="seu@email.com" />
      </div>
    `
    })
}

// Required
export const Required: Story = {
    render: () => ({
        components: { Label, Input },
        template: `
      <div class="space-y-2">
        <Label for="name">
          Nome <span class="text-destructive">*</span>
        </Label>
        <Input id="name" placeholder="Seu nome" required />
      </div>
    `
    })
}

// Com descrição
export const WithDescription: Story = {
    render: () => ({
        components: { Label, Input },
        template: `
      <div class="space-y-2">
        <Label for="password">Senha</Label>
        <Input id="password" type="password" />
        <p class="text-sm text-muted-foreground">Mínimo de 8 caracteres</p>
      </div>
    `
    })
}

// Form completo
export const FormExample: Story = {
    render: () => ({
        components: { Label, Input },
        template: `
      <form class="space-y-4 max-w-sm">
        <div class="space-y-2">
          <Label for="fullname">Nome Completo <span class="text-destructive">*</span></Label>
          <Input id="fullname" placeholder="João da Silva" />
        </div>
        
        <div class="space-y-2">
          <Label for="email">E-mail <span class="text-destructive">*</span></Label>
          <Input id="email" type="email" placeholder="joao@empresa.com" />
        </div>
        
        <div class="space-y-2">
          <Label for="phone">Telefone</Label>
          <Input id="phone" type="tel" placeholder="(11) 99999-9999" />
          <p class="text-sm text-muted-foreground">Opcional</p>
        </div>
      </form>
    `
    })
}

// Disabled
export const Disabled: Story = {
    render: () => ({
        components: { Label, Input },
        template: `
      <div class="space-y-2">
        <Label for="disabled" class="text-muted-foreground">Campo desabilitado</Label>
        <Input id="disabled" disabled value="Valor não editável" />
      </div>
    `
    })
}

// Erro
export const WithError: Story = {
    render: () => ({
        components: { Label, Input },
        template: `
      <div class="space-y-2">
        <Label for="error" class="text-destructive">E-mail inválido</Label>
        <Input id="error" type="email" value="email-invalido" class="border-destructive" />
        <p class="text-sm text-destructive">Por favor, insira um e-mail válido.</p>
      </div>
    `
    })
}
