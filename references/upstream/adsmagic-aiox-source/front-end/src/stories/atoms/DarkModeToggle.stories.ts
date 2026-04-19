import type { Meta, StoryObj } from '@storybook/vue3'
import DarkModeToggle from '@/components/ui/DarkModeToggle.vue'

const meta: Meta<typeof DarkModeToggle> = {
    title: 'Atoms/DarkModeToggle',
    component: DarkModeToggle,
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: 'Botão de alternância entre tema claro e escuro.'
            }
        }
    }
}

export default meta
type Story = StoryObj<typeof DarkModeToggle>

// Default
export const Default: Story = {
    render: () => ({
        components: { DarkModeToggle },
        template: `
      <DarkModeToggle />
    `
    })
}

// Em header
export const InHeader: Story = {
    render: () => ({
        components: { DarkModeToggle },
        template: `
      <div class="flex items-center justify-between p-4 bg-background border-b w-full">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-sm">A</div>
          <span class="font-semibold">AdsMagic</span>
        </div>
        <div class="flex items-center gap-4">
          <DarkModeToggle />
          <div class="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center font-medium text-sm">JS</div>
        </div>
      </div>
    `
    })
}

// Com label
export const WithLabel: Story = {
    render: () => ({
        components: { DarkModeToggle },
        template: `
      <div class="flex items-center gap-3">
        <span class="text-sm">Modo escuro</span>
        <DarkModeToggle />
      </div>
    `
    })
}

// Em configurações
export const InSettings: Story = {
    render: () => ({
        components: { DarkModeToggle },
        template: `
      <div class="w-[400px] p-4 border rounded-lg space-y-4">
        <h3 class="font-semibold">Aparência</h3>
        <div class="space-y-3">
          <div class="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div>
              <p class="font-medium text-sm">Tema escuro</p>
              <p class="text-xs text-muted-foreground">Alterne entre modo claro e escuro</p>
            </div>
            <DarkModeToggle />
          </div>
          <div class="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div>
              <p class="font-medium text-sm">Contraste alto</p>
              <p class="text-xs text-muted-foreground">Aumenta contraste para melhor visibilidade</p>
            </div>
            <button class="w-10 h-5 bg-gray-200 rounded-full relative">
              <span class="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow" />
            </button>
          </div>
        </div>
      </div>
    `
    })
}

// Com dropdown de opções
export const WithOptions: Story = {
    render: () => ({
        components: { DarkModeToggle },
        template: `
      <div class="space-y-4">
        <p class="text-sm font-medium">Escolha o tema:</p>
        <div class="flex gap-3">
          <button class="flex flex-col items-center gap-2 p-4 border rounded-lg hover:border-primary">
            <div class="w-12 h-12 rounded-lg bg-white border flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            </div>
            <span class="text-sm">Claro</span>
          </button>
          <button class="flex flex-col items-center gap-2 p-4 border rounded-lg hover:border-primary">
            <div class="w-12 h-12 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            </div>
            <span class="text-sm">Escuro</span>
          </button>
          <button class="flex flex-col items-center gap-2 p-4 border-2 border-primary rounded-lg">
            <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-white to-gray-800 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
            </div>
            <span class="text-sm font-medium">Sistema</span>
          </button>
        </div>
        <p class="text-xs text-muted-foreground">
          Ou use o toggle rápido: <DarkModeToggle />
        </p>
      </div>
    `
    })
}

// Comparação visual
export const VisualComparison: Story = {
    render: () => ({
        components: { DarkModeToggle },
        template: `
      <div class="grid grid-cols-2 gap-4">
        <!-- Light mode preview -->
        <div class="p-4 bg-white border rounded-lg">
          <div class="flex justify-between items-center mb-3">
            <span class="font-medium text-gray-900">Modo Claro</span>
            <span class="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">Light</span>
          </div>
          <div class="p-3 bg-gray-50 rounded">
            <p class="text-sm text-gray-600">Exemplo de conteúdo em tema claro.</p>
          </div>
        </div>
        
        <!-- Dark mode preview -->
        <div class="p-4 bg-gray-900 border border-gray-700 rounded-lg">
          <div class="flex justify-between items-center mb-3">
            <span class="font-medium text-white">Modo Escuro</span>
            <span class="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded">Dark</span>
          </div>
          <div class="p-3 bg-gray-800 rounded">
            <p class="text-sm text-gray-400">Exemplo de conteúdo em tema escuro.</p>
          </div>
        </div>
      </div>
      
      <div class="mt-4 flex justify-center">
        <DarkModeToggle />
      </div>
    `
    })
}
