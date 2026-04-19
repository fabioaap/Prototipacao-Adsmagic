import type { Meta, StoryObj } from '@storybook/vue3'
import Alert from '@/components/ui/Alert.vue'
import Button from '@/components/ui/Button.vue'

const meta: Meta<typeof Alert> = {
  title: 'Atoms/Alert',
  component: Alert,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive'],
      description: 'Variante visual do alerta'
    }
  },
  parameters: {
    docs: {
      description: {
        component: 'Componente de alerta para exibir mensagens importantes ao usuário.'
      }
    }
  }
}

export default meta
type Story = StoryObj<typeof Alert>

// Default
export const Default: Story = {
  args: {
    variant: 'info',
    title: 'Atenção',
    description: 'Esta é uma mensagem de alerta padrão para informar o usuário.',
    icon: true
  }
}

// Destructive
export const Destructive: Story = {
  args: {
    variant: 'destructive',
    title: 'Erro',
    description: 'Algo deu errado. Por favor, tente novamente mais tarde.',
    icon: true
  }
}

// Sucesso
export const Success: Story = {
  args: {
    variant: 'success',
    title: 'Sucesso!',
    description: 'Sua operação foi concluída com sucesso.',
    icon: true
  }
}

// Aviso
export const Warning: Story = {
  args: {
    variant: 'warning',
    title: 'Atenção',
    description: 'Esta ação pode ter consequências. Revise antes de continuar.',
    icon: true
  }
}

// Info
export const Info: Story = {
  render: () => ({
    components: { Alert, AlertTitle, AlertDescription },
    template: `
      <Alert class="border-blue-500 text-blue-700 bg-blue-50 [&>svg]:text-blue-500">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
        <AlertTitle>Informação</AlertTitle>
        <AlertDescription>
          Aqui está uma dica útil para você aproveitar melhor a plataforma.
        </AlertDescription>
      </Alert>
    `
  })
}

// Com ação
export const WithAction: Story = {
  render: () => ({
    components: { Alert, AlertTitle, AlertDescription, Button },
    template: `
      <Alert class="flex items-start justify-between">
        <div>
          <AlertTitle>Atualização disponível</AlertTitle>
          <AlertDescription>
            Uma nova versão está disponível. Atualize para obter as últimas funcionalidades.
          </AlertDescription>
        </div>
        <Button size="sm" class="shrink-0 ml-4">
          Atualizar agora
        </Button>
      </Alert>
    `
  })
}

// Dismissible
export const Dismissible: Story = {
  render: () => ({
    components: { Alert, AlertTitle, AlertDescription },
    setup() {
      const visible = { value: true }
      return { visible }
    },
    template: `
      <Alert v-if="visible.value" class="relative">
        <AlertTitle>Novidade!</AlertTitle>
        <AlertDescription>
          Confira os novos recursos que adicionamos esta semana.
        </AlertDescription>
        <button 
          @click="visible.value = false"
          class="absolute top-2 right-2 p-1 rounded hover:bg-muted"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </Alert>
      <Button v-else @click="visible.value = true" variant="outline">
        Mostrar alerta
      </Button>
    `
  })
}

// Lista de alertas
export const AlertList: Story = {
  render: () => ({
    components: { Alert, AlertTitle, AlertDescription },
    template: `
      <div class="space-y-4 max-w-lg">
        <Alert variant="destructive">
          <AlertTitle>2 erros encontrados</AlertTitle>
          <AlertDescription>
            <ul class="list-disc list-inside mt-2">
              <li>Email inválido no contato #123</li>
              <li>Telefone duplicado no contato #456</li>
            </ul>
          </AlertDescription>
        </Alert>
        
        <Alert class="border-yellow-500 text-yellow-700 bg-yellow-50">
          <AlertTitle>1 aviso</AlertTitle>
          <AlertDescription>
            <ul class="list-disc list-inside mt-2">
              <li>Contato #789 está sem origem definida</li>
            </ul>
          </AlertDescription>
        </Alert>
        
        <Alert class="border-green-500 text-green-700 bg-green-50">
          <AlertTitle>Importação parcialmente concluída</AlertTitle>
          <AlertDescription>
            97 de 100 contatos foram importados com sucesso.
          </AlertDescription>
        </Alert>
      </div>
    `
  })
}

// Integração
export const IntegrationAlert: Story = {
  render: () => ({
    components: { Alert, AlertTitle, AlertDescription, Button },
    template: `
      <Alert class="border-blue-500 bg-blue-50">
        <div class="flex items-start gap-4">
          <div class="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
            f
          </div>
          <div class="flex-1">
            <AlertTitle class="text-blue-900">Conectar ao Meta Ads</AlertTitle>
            <AlertDescription class="text-blue-700">
              Conecte sua conta do Meta Ads para importar campanhas e rastrear conversões automaticamente.
            </AlertDescription>
            <div class="mt-3 flex gap-2">
              <Button size="sm">Conectar agora</Button>
              <Button size="sm" variant="ghost">Depois</Button>
            </div>
          </div>
        </div>
      </Alert>
    `
  })
}

// Compacto
export const Compact: Story = {
  render: () => ({
    components: { Alert, AlertDescription },
    template: `
      <div class="space-y-2 max-w-md">
        <Alert class="py-2">
          <AlertDescription class="text-sm">
            ℹ️ Dica: Use Ctrl+K para abrir a busca rápida.
          </AlertDescription>
        </Alert>
        <Alert class="py-2 border-green-500 text-green-700">
          <AlertDescription class="text-sm">
            ✓ Alterações salvas automaticamente.
          </AlertDescription>
        </Alert>
        <Alert class="py-2 border-yellow-500 text-yellow-700">
          <AlertDescription class="text-sm">
            ⚠️ Você tem 3 contatos pendentes de revisão.
          </AlertDescription>
        </Alert>
      </div>
    `
  })
}
