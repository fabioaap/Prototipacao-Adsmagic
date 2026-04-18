import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import Switch from '@/components/ui/Switch.vue'
import Label from '@/components/ui/Label.vue'

const meta: Meta<typeof Switch> = {
    title: 'Atoms/Switch',
    component: Switch,
    tags: ['autodocs'],
    argTypes: {
        checked: {
            control: 'boolean',
            description: 'Estado ligado/desligado'
        },
        disabled: {
            control: 'boolean',
            description: 'Desabilita o switch'
        },
        id: {
            control: 'text',
            description: 'ID para associar com label'
        }
    },
    parameters: {
        docs: {
            description: {
                component: 'Switch para alternar entre dois estados (on/off). Ideal para configurações.'
            }
        }
    }
}

export default meta
type Story = StoryObj<typeof Switch>

// Default (off)
export const Default: Story = {
    args: {
        id: 'switch-default'
    }
}

// Checked (on)
export const Checked: Story = {
    args: {
        checked: true,
        id: 'switch-checked'
    }
}

// Disabled
export const Disabled: Story = {
    args: {
        disabled: true,
        id: 'switch-disabled'
    }
}

// Disabled Checked
export const DisabledChecked: Story = {
    args: {
        checked: true,
        disabled: true,
        id: 'switch-disabled-checked'
    }
}

// Com Label
export const WithLabel: Story = {
    render: () => ({
        components: { Switch, Label },
        template: `
      <div class="flex items-center space-x-2">
        <Switch id="airplane" />
        <Label for="airplane">Modo Avião</Label>
      </div>
    `
    })
}

// Configurações
export const SettingsExample: Story = {
    render: () => ({
        components: { Switch, Label },
        setup() {
            const notifications = ref(true)
            const darkMode = ref(false)
            const marketing = ref(false)
            return { notifications, darkMode, marketing }
        },
        template: `
      <div class="space-y-4 w-80">
        <div class="flex items-center justify-between p-4 bg-muted rounded-lg">
          <div>
            <p class="font-medium">Notificações</p>
            <p class="text-sm text-muted-foreground">Receba alertas de atividade</p>
          </div>
          <Switch id="notif" v-model:checked="notifications" />
        </div>
        
        <div class="flex items-center justify-between p-4 bg-muted rounded-lg">
          <div>
            <p class="font-medium">Modo Escuro</p>
            <p class="text-sm text-muted-foreground">Tema escuro para a interface</p>
          </div>
          <Switch id="dark" v-model:checked="darkMode" />
        </div>
        
        <div class="flex items-center justify-between p-4 bg-muted rounded-lg">
          <div>
            <p class="font-medium">E-mails Marketing</p>
            <p class="text-sm text-muted-foreground">Receba novidades e promoções</p>
          </div>
          <Switch id="marketing" v-model:checked="marketing" />
        </div>
      </div>
    `
    })
}

// Interativo
export const Interactive: Story = {
    render: () => ({
        components: { Switch, Label },
        setup() {
            const isOn = ref(false)
            return { isOn }
        },
        template: `
      <div class="space-y-4">
        <div class="flex items-center space-x-2">
          <Switch id="interactive" v-model:checked="isOn" />
          <Label for="interactive">Ativar recurso</Label>
        </div>
        <p class="text-sm">Estado: <strong>{{ isOn ? 'Ligado' : 'Desligado' }}</strong></p>
      </div>
    `
    })
}

// Todos os estados
export const AllStates: Story = {
    render: () => ({
        components: { Switch, Label },
        template: `
      <div class="space-y-4">
        <div class="flex items-center space-x-2">
          <Switch id="off" />
          <Label for="off">Desligado (default)</Label>
        </div>
        <div class="flex items-center space-x-2">
          <Switch id="on" :checked="true" />
          <Label for="on">Ligado</Label>
        </div>
        <div class="flex items-center space-x-2">
          <Switch id="off-disabled" :disabled="true" />
          <Label for="off-disabled" class="text-muted-foreground">Desligado (disabled)</Label>
        </div>
        <div class="flex items-center space-x-2">
          <Switch id="on-disabled" :checked="true" :disabled="true" />
          <Label for="on-disabled" class="text-muted-foreground">Ligado (disabled)</Label>
        </div>
      </div>
    `
    })
}
