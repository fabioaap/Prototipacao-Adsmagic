import type { Meta, StoryObj } from '@storybook/vue3'
import Popover from '@/components/ui/Popover.vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Label from '@/components/ui/Label.vue'

const meta: Meta<typeof Popover> = {
  title: 'Atoms/Popover',
  component: Popover,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Popover para exibir conteúdo flutuante interativo ao clicar em um elemento.'
      }
    }
  }
}

export default meta
type Story = StoryObj<typeof Popover>

// Default
export const Default: Story = {
  render: () => ({
    components: { Popover, Button },
    data() {
      return { open: false }
    },
    template: `
      <Popover v-model:open="open">
        <template #trigger>
          <Button variant="outline">Abrir Popover</Button>
        </template>
        <div class="space-y-2">
          <h4 class="font-medium">Título do Popover</h4>
          <p class="text-sm text-muted-foreground">
            Este é um popover com conteúdo interativo. Clique fora para fechar.
          </p>
        </div>
      </Popover>
    `
  })
}

// Com formulário
export const WithForm: Story = {
  render: () => ({
    components: { Popover, Button, Input, Label },
    data() {
      return { open: false }
    },
    template: `
      <Popover v-model:open="open">
        <template #trigger>
          <Button variant="outline">Configurar dimensões</Button>
        </template>
        <div class="space-y-4">
          <h4 class="font-medium text-sm">Dimensões</h4>
          <div class="grid gap-2">
            <div class="grid grid-cols-3 items-center gap-4">
              <Label for="width">Largura</Label>
              <Input id="width" value="100%" class="col-span-2 h-8" />
            </div>
            <div class="grid grid-cols-3 items-center gap-4">
              <Label for="height">Altura</Label>
              <Input id="height" value="auto" class="col-span-2 h-8" />
            </div>
            <div class="grid grid-cols-3 items-center gap-4">
              <Label for="maxWidth">Max Width</Label>
              <Input id="maxWidth" value="300px" class="col-span-2 h-8" />
            </div>
          </div>
        </div>
      </Popover>
    `
  })
}

// Posições diferentes
export const Positions: Story = {
  render: () => ({
    components: { Popover, Button },
    data() {
      return {
        open1: false,
        open2: false,
        open3: false,
        open4: false
      }
    },
    template: `
      <div class="flex flex-wrap gap-4 p-12">
        <Popover side="top" v-model:open="open1">
          <template #trigger>
            <Button variant="outline">Top</Button>
          </template>
          <p class="text-sm">Popover no topo</p>
        </Popover>
        
        <Popover side="bottom" v-model:open="open2">
          <template #trigger>
            <Button variant="outline">Bottom</Button>
          </template>
          <p class="text-sm">Popover embaixo</p>
        </Popover>
        
        <Popover side="left" v-model:open="open3">
          <template #trigger>
            <Button variant="outline">Left</Button>
          </template>
          <p class="text-sm">Popover à esquerda</p>
        </Popover>
        
        <Popover side="right" v-model:open="open4">
          <template #trigger>
            <Button variant="outline">Right</Button>
          </template>
          <p class="text-sm">Popover à direita</p>
        </Popover>
      </div>
    `
  })
}

// Seletor de cor
export const ColorPicker: Story = {
  render: () => ({
    components: { Popover, Button, Input },
    data() {
      return {
        open: false,
        selectedColor: '#3b82f6',
        colors: [
          '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6',
          '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280', '#000000'
        ]
      }
    },
    template: `
      <Popover v-model:open="open">
        <template #trigger>
          <Button variant="outline" class="w-[200px] justify-start">
            <div class="w-4 h-4 rounded mr-2" :style="{ backgroundColor: selectedColor }" />
            Escolher cor
          </Button>
        </template>
        <div class="space-y-3">
          <h4 class="font-medium text-sm">Selecione uma cor</h4>
          <div class="grid grid-cols-5 gap-2">
            <button
              v-for="color in colors"
              :key="color"
              @click="selectedColor = color; open = false"
              class="w-8 h-8 rounded-md border-2 border-transparent hover:border-foreground transition-colors"
              :style="{ backgroundColor: color }"
            />
          </div>
          <div class="pt-2 border-t">
            <Label class="text-xs">Código HEX</Label>
            <Input v-model="selectedColor" placeholder="#000000" class="h-8 mt-1" />
          </div>
          <Button size="sm" class="w-full" @click="open = false">OK</Button>
        </div>
      </Popover>
    `
  })
}

// Perfil de usuário
export const UserProfile: Story = {
  render: () => ({
    components: { Popover, Button },
    data() {
      return { open: false }
    },
    template: `
      <Popover align="end" v-model:open="open">
        <template #trigger>
          <Button variant="ghost" class="h-10 w-10 rounded-full p-0">
            <div class="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center font-medium">
              JS
            </div>
          </Button>
        </template>
        <div class="space-y-4">
          <div class="flex items-center gap-3">
            <div class="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center font-medium">
              JS
            </div>
            <div>
              <p class="font-medium">João Silva</p>
              <p class="text-sm text-muted-foreground">joao@empresa.com</p>
            </div>
          </div>
          <div class="border-t pt-3 space-y-1">
            <button class="w-full text-left px-2 py-1.5 text-sm hover:bg-muted rounded">
              👤 Meu perfil
            </button>
            <button class="w-full text-left px-2 py-1.5 text-sm hover:bg-muted rounded">
              ⚙️ Configurações
            </button>
            <button class="w-full text-left px-2 py-1.5 text-sm hover:bg-muted rounded">
              🏢 Trocar empresa
            </button>
            <button class="w-full text-left px-2 py-1.5 text-sm hover:bg-muted rounded text-destructive">
              🚪 Sair
            </button>
          </div>
        </div>
      </Popover>
    `
  })
}

// Notificações
export const Notifications: Story = {
  render: () => ({
    components: { Popover, Button },
    data() {
      return { open: false }
    },
    template: `
      <Popover align="end" v-model:open="open">
        <template #trigger>
          <Button variant="ghost" size="icon" class="relative">
            🔔
            <span class="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-xs text-white flex items-center justify-center">
              3
            </span>
          </Button>
        </template>
        <div class="space-y-3 min-w-[320px]">
          <div class="flex items-center justify-between">
            <h4 class="font-medium text-sm">Notificações</h4>
            <span class="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">3 novas</span>
          </div>
          <div class="space-y-2">
            <div class="p-3 bg-primary/5 rounded-lg border border-primary/20">
              <p class="text-sm font-medium">Novo contato criado</p>
              <p class="text-xs text-muted-foreground mt-1">Maria Silva foi adicionada ao projeto</p>
              <p class="text-xs text-muted-foreground mt-1">Há 5 minutos</p>
            </div>
            <div class="p-3 hover:bg-muted rounded-lg cursor-pointer">
              <p class="text-sm font-medium">Venda realizada</p>
              <p class="text-xs text-muted-foreground mt-1">João Souza fechou uma compra de R$ 1.500</p>
              <p class="text-xs text-muted-foreground mt-1">Há 1 hora</p>
            </div>
            <div class="p-3 hover:bg-muted rounded-lg cursor-pointer">
              <p class="text-sm font-medium">Sincronização concluída</p>
              <p class="text-xs text-muted-foreground mt-1">Meta Ads foi sincronizado com sucesso</p>
              <p class="text-xs text-muted-foreground mt-1">Há 2 horas</p>
            </div>
          </div>
          <Button variant="outline" size="sm" class="w-full">Ver todas</Button>
        </div>
      </Popover>
    `
  })
}

// Filtros
export const Filters: Story = {
  render: () => ({
    components: { Popover, Button, Label, Input },
    data() {
      return { open: false }
    },
    template: `
      <Popover v-model:open="open">
        <template #trigger>
          <Button variant="outline">
            🔍 Filtros
          </Button>
        </template>
        <div class="space-y-4">
          <h4 class="font-medium text-sm">Filtrar contatos</h4>
          <div class="space-y-2">
            <div class="space-y-1">
              <Label for="status" class="text-xs">Status</Label>
              <Input id="status" placeholder="Todos" class="h-8" />
            </div>
            <div class="space-y-1">
              <Label for="origem" class="text-xs">Origem</Label>
              <Input id="origem" placeholder="Todas" class="h-8" />
            </div>
            <div class="space-y-1">
              <Label for="periodo" class="text-xs">Período</Label>
              <Input id="periodo" type="date" class="h-8" />
            </div>
          </div>
          <div class="flex gap-2">
            <Button size="sm" variant="outline" class="flex-1" @click="open = false">Limpar</Button>
            <Button size="sm" class="flex-1" @click="open = false">Aplicar</Button>
          </div>
        </div>
      </Popover>
    `
  })
}

// Confirmação
export const Confirmation: Story = {
  render: () => ({
    components: { Popover, Button },
    data() {
      return { open: false }
    },
    template: `
      <Popover v-model:open="open">
        <template #trigger>
          <Button variant="destructive">Excluir projeto</Button>
        </template>
        <div class="space-y-3">
          <div class="flex gap-2">
            <span class="text-2xl">⚠️</span>
            <div>
              <h4 class="font-medium text-sm">Confirmar exclusão</h4>
              <p class="text-xs text-muted-foreground mt-1">
                Esta ação não pode ser desfeita. O projeto será permanentemente removido.
              </p>
            </div>
          </div>
          <div class="flex gap-2">
            <Button size="sm" variant="outline" class="flex-1" @click="open = false">Cancelar</Button>
            <Button size="sm" variant="destructive" class="flex-1" @click="open = false">Confirmar</Button>
          </div>
        </div>
      </Popover>
    `
  })
}

// Compartilhar
export const Share: Story = {
  render: () => ({
    components: { Popover, Button, Input },
    data() {
      return {
        open: false,
        url: 'https://adsmagic.io/projeto/abc123'
      }
    },
    template: `
      <Popover v-model:open="open">
        <template #trigger>
          <Button variant="outline">
            📤 Compartilhar
          </Button>
        </template>
        <div class="space-y-4">
          <h4 class="font-medium text-sm">Compartilhar projeto</h4>
          <div class="space-y-2">
            <Label class="text-xs">Link do projeto</Label>
            <div class="flex gap-2">
              <Input :value="url" readonly class="h-8 flex-1" />
              <Button size="sm" variant="outline" @click="/* copiar */">Copiar</Button>
            </div>
          </div>
          <div class="border-t pt-3">
            <p class="text-xs text-muted-foreground mb-2">Compartilhar via</p>
            <div class="flex gap-2">
              <Button variant="ghost" size="sm" class="flex-1">📘 Facebook</Button>
              <Button variant="ghost" size="sm" class="flex-1">🐦 Twitter</Button>
            </div>
            <div class="flex gap-2 mt-2">
              <Button variant="ghost" size="sm" class="flex-1">💬 WhatsApp</Button>
              <Button variant="ghost" size="sm" class="flex-1">✉️ Email</Button>
            </div>
          </div>
        </div>
      </Popover>
    `
  })
}
