import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import Checkbox from '@/components/ui/Checkbox.vue'
import Label from '@/components/ui/Label.vue'

const meta: Meta<typeof Checkbox> = {
    title: 'Atoms/Checkbox',
    component: Checkbox,
    tags: ['autodocs'],
    argTypes: {
        checked: {
            control: 'boolean',
            description: 'Estado marcado/desmarcado'
        },
        disabled: {
            control: 'boolean',
            description: 'Desabilita o checkbox'
        },
        id: {
            control: 'text',
            description: 'ID para associar com label'
        }
    },
    parameters: {
        docs: {
            description: {
                component: 'Checkbox para seleção de opções. Suporta estados checked, unchecked e indeterminate.'
            }
        }
    }
}

export default meta
type Story = StoryObj<typeof Checkbox>

// Default
export const Default: Story = {
    args: {
        id: 'checkbox-default'
    }
}

// Checked
export const Checked: Story = {
    args: {
        checked: true,
        id: 'checkbox-checked'
    }
}

// Disabled
export const Disabled: Story = {
    args: {
        disabled: true,
        id: 'checkbox-disabled'
    }
}

// Disabled Checked
export const DisabledChecked: Story = {
    args: {
        checked: true,
        disabled: true,
        id: 'checkbox-disabled-checked'
    }
}

// Com Label
export const WithLabel: Story = {
    render: () => ({
        components: { Checkbox, Label },
        template: `
      <div class="flex items-center space-x-2">
        <Checkbox id="terms" />
        <Label for="terms">Aceito os termos e condições</Label>
      </div>
    `
    })
}

// Grupo de Checkboxes
export const CheckboxGroup: Story = {
    render: () => ({
        components: { Checkbox, Label },
        setup() {
            const selected = ref(['email'])
            return { selected }
        },
        template: `
      <div class="space-y-3">
        <p class="text-sm font-medium mb-2">Notificações:</p>
        <div class="flex items-center space-x-2">
          <Checkbox id="email" :checked="selected.includes('email')" @update:checked="val => val ? selected.push('email') : selected = selected.filter(s => s !== 'email')" />
          <Label for="email">E-mail</Label>
        </div>
        <div class="flex items-center space-x-2">
          <Checkbox id="sms" :checked="selected.includes('sms')" @update:checked="val => val ? selected.push('sms') : selected = selected.filter(s => s !== 'sms')" />
          <Label for="sms">SMS</Label>
        </div>
        <div class="flex items-center space-x-2">
          <Checkbox id="push" :checked="selected.includes('push')" @update:checked="val => val ? selected.push('push') : selected = selected.filter(s => s !== 'push')" />
          <Label for="push">Push Notifications</Label>
        </div>
      </div>
    `
    })
}

// Com descrição
export const WithDescription: Story = {
    render: () => ({
        components: { Checkbox, Label },
        template: `
      <div class="flex items-start space-x-2">
        <Checkbox id="newsletter" class="mt-1" />
        <div>
          <Label for="newsletter" class="font-medium">Newsletter</Label>
          <p class="text-sm text-muted-foreground">Receba atualizações semanais sobre novidades.</p>
        </div>
      </div>
    `
    })
}

// Estados interativos
export const Interactive: Story = {
    render: () => ({
        components: { Checkbox, Label },
        setup() {
            const isChecked = ref(false)
            return { isChecked }
        },
        template: `
      <div class="space-y-4">
        <div class="flex items-center space-x-2">
          <Checkbox id="interactive" v-model:checked="isChecked" />
          <Label for="interactive">Clique para alternar</Label>
        </div>
        <p class="text-sm">Estado: <strong>{{ isChecked ? 'Marcado' : 'Desmarcado' }}</strong></p>
      </div>
    `
    })
}
