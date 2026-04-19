import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import Textarea from '@/components/ui/Textarea.vue'
import Label from '@/components/ui/Label.vue'

const meta: Meta<typeof Textarea> = {
    title: 'Atoms/Textarea',
    component: Textarea,
    tags: ['autodocs'],
    argTypes: {
        modelValue: {
            control: 'text',
            description: 'Valor do textarea'
        },
        placeholder: {
            control: 'text',
            description: 'Placeholder'
        },
        disabled: {
            control: 'boolean',
            description: 'Desabilita o textarea'
        },
        rows: {
            control: 'number',
            description: 'Número de linhas'
        }
    },
    parameters: {
        docs: {
            description: {
                component: 'Textarea para entrada de texto multilinhas. Usado em formulários para mensagens, descrições e comentários.'
            }
        }
    }
}

export default meta
type Story = StoryObj<typeof Textarea>

// Default
export const Default: Story = {
    args: {
        placeholder: 'Digite sua mensagem...'
    }
}

// Com valor
export const WithValue: Story = {
    args: {
        modelValue: 'Este é um texto de exemplo que mostra como o textarea aparece quando há conteúdo.'
    }
}

// Disabled
export const Disabled: Story = {
    args: {
        modelValue: 'Texto não editável',
        disabled: true
    }
}

// Com label
export const WithLabel: Story = {
    render: () => ({
        components: { Textarea, Label },
        template: `
      <div class="space-y-2">
        <Label for="message">Mensagem</Label>
        <Textarea id="message" placeholder="Escreva sua mensagem..." />
      </div>
    `
    })
}

// Diferentes tamanhos
export const SmallRows: Story = {
    args: {
        placeholder: 'Textarea pequeno',
        rows: 2
    }
}

export const LargeRows: Story = {
    args: {
        placeholder: 'Textarea grande',
        rows: 8
    }
}

// Com contador de caracteres
export const WithCharacterCount: Story = {
    render: () => ({
        components: { Textarea, Label },
        setup() {
            const text = ref('')
            const maxLength = 500
            return { text, maxLength }
        },
        template: `
      <div class="space-y-2">
        <Label for="bio">Biografia</Label>
        <Textarea 
          id="bio" 
          v-model="text" 
          placeholder="Conte um pouco sobre você..." 
          :maxlength="maxLength"
        />
        <p class="text-sm text-muted-foreground text-right">
          {{ text.length }}/{{ maxLength }} caracteres
        </p>
      </div>
    `
    })
}

// Com erro
export const WithError: Story = {
    render: () => ({
        components: { Textarea, Label },
        template: `
      <div class="space-y-2">
        <Label for="error" class="text-destructive">Descrição</Label>
        <Textarea 
          id="error" 
          class="border-destructive focus-visible:ring-destructive" 
          placeholder="Descrição obrigatória..."
        />
        <p class="text-sm text-destructive">Este campo é obrigatório.</p>
      </div>
    `
    })
}

// Formulário de contato
export const ContactForm: Story = {
    render: () => ({
        components: { Textarea, Label },
        template: `
      <div class="space-y-4 max-w-md">
        <div class="space-y-2">
          <Label for="subject">Assunto</Label>
          <input 
            id="subject" 
            class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" 
            placeholder="Assunto da mensagem"
          />
        </div>
        <div class="space-y-2">
          <Label for="message">Mensagem</Label>
          <Textarea 
            id="message" 
            placeholder="Escreva sua mensagem detalhada aqui..." 
            :rows="5"
          />
          <p class="text-xs text-muted-foreground">
            Responderemos em até 24 horas úteis.
          </p>
        </div>
      </div>
    `
    })
}

// Readonly
export const ReadOnly: Story = {
    render: () => ({
        components: { Textarea, Label },
        template: `
      <div class="space-y-2">
        <Label for="readonly">Termos de Uso</Label>
        <Textarea 
          id="readonly" 
          readonly 
          :rows="4"
          class="bg-muted"
          modelValue="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
        />
      </div>
    `
    })
}
