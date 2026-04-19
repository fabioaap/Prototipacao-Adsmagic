import type { Meta, StoryObj } from '@storybook/vue3'

/**
 * OnboardingTemplate - Template do fluxo de Onboarding.
 * 
 * Wizard de 7 passos para configuração inicial do projeto.
 */
const meta: Meta = {
  title: 'Templates/OnboardingFlow',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Template completo do fluxo de Onboarding em 7 passos.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

/**
 * Passo 1 - Boas-vindas
 */
export const Step1Welcome: Story = {
  render: () => ({
    template: `
      <div class="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex items-center justify-center p-6">
        <div class="w-full max-w-2xl">
          <!-- Progress -->
          <div class="flex items-center justify-center gap-2 mb-8">
            <div class="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">1</div>
            <div class="w-12 h-1 bg-muted rounded"></div>
            <div class="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm">2</div>
            <div class="w-12 h-1 bg-muted rounded"></div>
            <div class="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm">3</div>
            <div class="w-12 h-1 bg-muted rounded"></div>
            <div class="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm">4</div>
          </div>
          
          <!-- Card -->
          <div class="bg-card rounded-2xl shadow-lg border p-8 text-center">
            <div class="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <span class="text-4xl">🚀</span>
            </div>
            
            <h1 class="text-3xl font-bold mb-3">Bem-vindo ao AdsMagic!</h1>
            <p class="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
              Vamos configurar seu primeiro projeto em poucos minutos. É rápido e fácil!
            </p>
            
            <div class="space-y-4 text-left max-w-sm mx-auto mb-8">
              <div class="flex items-center gap-3">
                <div class="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs">✓</div>
                <span class="text-sm">Configure seu projeto</span>
              </div>
              <div class="flex items-center gap-3">
                <div class="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs">2</div>
                <span class="text-sm text-muted-foreground">Conecte suas integrações</span>
              </div>
              <div class="flex items-center gap-3">
                <div class="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs">3</div>
                <span class="text-sm text-muted-foreground">Configure o funil de vendas</span>
              </div>
              <div class="flex items-center gap-3">
                <div class="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs">4</div>
                <span class="text-sm text-muted-foreground">Comece a rastrear!</span>
              </div>
            </div>
            
            <button class="w-full max-w-sm px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium">
              Começar Configuração →
            </button>
          </div>
        </div>
      </div>
    `,
  }),
}

/**
 * Passo 2 - Dados da empresa
 */
export const Step2Company: Story = {
  render: () => ({
    template: `
      <div class="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex items-center justify-center p-6">
        <div class="w-full max-w-2xl">
          <!-- Progress -->
          <div class="flex items-center justify-center gap-2 mb-8">
            <div class="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm">✓</div>
            <div class="w-12 h-1 bg-primary rounded"></div>
            <div class="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">2</div>
            <div class="w-12 h-1 bg-muted rounded"></div>
            <div class="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm">3</div>
            <div class="w-12 h-1 bg-muted rounded"></div>
            <div class="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm">4</div>
          </div>
          
          <!-- Card -->
          <div class="bg-card rounded-2xl shadow-lg border p-8">
            <h2 class="text-2xl font-bold mb-2">Dados da Empresa</h2>
            <p class="text-muted-foreground mb-6">Informe os dados básicos da sua empresa</p>
            
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium mb-2">Nome da empresa *</label>
                <input 
                  type="text" 
                  placeholder="Ex: Minha Loja Online"
                  class="w-full h-11 rounded-lg border px-4 text-sm"
                  value="E-commerce Fashion"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium mb-2">Segmento *</label>
                <select class="w-full h-11 rounded-lg border px-4 text-sm">
                  <option>Selecione o segmento</option>
                  <option selected>E-commerce</option>
                  <option>Serviços</option>
                  <option>Infoprodutos</option>
                  <option>Outros</option>
                </select>
              </div>
              
              <div>
                <label class="block text-sm font-medium mb-2">Website (opcional)</label>
                <input 
                  type="url" 
                  placeholder="https://seusite.com.br"
                  class="w-full h-11 rounded-lg border px-4 text-sm"
                />
              </div>
            </div>
            
            <div class="flex gap-3 mt-8">
              <button class="px-6 py-3 border rounded-lg text-sm">
                ← Voltar
              </button>
              <button class="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium">
                Próximo Passo →
              </button>
            </div>
          </div>
        </div>
      </div>
    `,
  }),
}

/**
 * Passo 3 - Dados do projeto
 */
export const Step3Project: Story = {
  render: () => ({
    template: `
      <div class="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex items-center justify-center p-6">
        <div class="w-full max-w-2xl">
          <!-- Progress -->
          <div class="flex items-center justify-center gap-2 mb-8">
            <div class="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm">✓</div>
            <div class="w-12 h-1 bg-green-500 rounded"></div>
            <div class="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm">✓</div>
            <div class="w-12 h-1 bg-primary rounded"></div>
            <div class="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">3</div>
            <div class="w-12 h-1 bg-muted rounded"></div>
            <div class="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm">4</div>
          </div>
          
          <!-- Card -->
          <div class="bg-card rounded-2xl shadow-lg border p-8">
            <h2 class="text-2xl font-bold mb-2">Configure seu Projeto</h2>
            <p class="text-muted-foreground mb-6">Defina as configurações do seu primeiro projeto</p>
            
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium mb-2">Nome do projeto *</label>
                <input 
                  type="text" 
                  placeholder="Ex: Campanha Black Friday 2024"
                  class="w-full h-11 rounded-lg border px-4 text-sm"
                  value="Loja de Roupas - Meta Ads"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium mb-2">Descrição (opcional)</label>
                <textarea 
                  placeholder="Descreva o objetivo do projeto..."
                  class="w-full h-24 rounded-lg border px-4 py-3 text-sm resize-none"
                ></textarea>
              </div>
              
              <div>
                <label class="block text-sm font-medium mb-2">Moeda *</label>
                <select class="w-full h-11 rounded-lg border px-4 text-sm">
                  <option selected>BRL - Real Brasileiro (R$)</option>
                  <option>USD - Dólar Americano ($)</option>
                  <option>EUR - Euro (€)</option>
                </select>
              </div>
            </div>
            
            <div class="flex gap-3 mt-8">
              <button class="px-6 py-3 border rounded-lg text-sm">
                ← Voltar
              </button>
              <button class="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium">
                Próximo Passo →
              </button>
            </div>
          </div>
        </div>
      </div>
    `,
  }),
}

/**
 * Passo 4 - Conectar integrações
 */
export const Step4Integrations: Story = {
  render: () => ({
    template: `
      <div class="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex items-center justify-center p-6">
        <div class="w-full max-w-2xl">
          <!-- Progress -->
          <div class="flex items-center justify-center gap-2 mb-8">
            <div class="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm">✓</div>
            <div class="w-12 h-1 bg-green-500 rounded"></div>
            <div class="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm">✓</div>
            <div class="w-12 h-1 bg-green-500 rounded"></div>
            <div class="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm">✓</div>
            <div class="w-12 h-1 bg-primary rounded"></div>
            <div class="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">4</div>
          </div>
          
          <!-- Card -->
          <div class="bg-card rounded-2xl shadow-lg border p-8">
            <h2 class="text-2xl font-bold mb-2">Conecte suas Plataformas</h2>
            <p class="text-muted-foreground mb-6">Escolha pelo menos uma plataforma para começar</p>
            
            <div class="space-y-3">
              <!-- Meta Ads -->
              <div class="border rounded-lg p-4 hover:border-primary transition cursor-pointer">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                      <span class="text-white font-bold">f</span>
                    </div>
                    <div>
                      <h3 class="font-semibold">Meta Ads</h3>
                      <p class="text-xs text-muted-foreground">Facebook & Instagram Ads</p>
                    </div>
                  </div>
                  <button class="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm">
                    Conectar
                  </button>
                </div>
              </div>
              
              <!-- Google Ads -->
              <div class="border rounded-lg p-4 hover:border-primary transition cursor-pointer border-green-500 bg-green-50">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-[#4285F4] rounded-lg flex items-center justify-center">
                      <span class="text-white font-bold">G</span>
                    </div>
                    <div>
                      <h3 class="font-semibold">Google Ads</h3>
                      <p class="text-xs text-muted-foreground">Search, Display & YouTube</p>
                    </div>
                  </div>
                  <span class="px-3 py-1.5 bg-green-100 text-green-700 rounded-md text-sm font-medium">
                    ✓ Conectado
                  </span>
                </div>
              </div>
              
              <!-- WhatsApp -->
              <div class="border rounded-lg p-4 hover:border-primary transition cursor-pointer">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                      <span class="text-white">📱</span>
                    </div>
                    <div>
                      <h3 class="font-semibold">WhatsApp Business</h3>
                      <p class="text-xs text-muted-foreground">Importar contatos e conversas</p>
                    </div>
                  </div>
                  <button class="px-4 py-2 border rounded-md text-sm">
                    Conectar
                  </button>
                </div>
              </div>
            </div>
            
            <div class="flex gap-3 mt-8">
              <button class="px-6 py-3 border rounded-lg text-sm">
                ← Voltar
              </button>
              <button class="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium">
                Concluir Setup →
              </button>
            </div>
            
            <p class="text-center text-xs text-muted-foreground mt-4">
              Você pode conectar mais plataformas depois nas configurações
            </p>
          </div>
        </div>
      </div>
    `,
  }),
}

/**
 * Conclusão do onboarding
 */
export const Complete: Story = {
  render: () => ({
    template: `
      <div class="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex items-center justify-center p-6">
        <div class="w-full max-w-2xl">
          <!-- Card -->
          <div class="bg-card rounded-2xl shadow-lg border p-8 text-center">
            <div class="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span class="text-5xl">🎉</span>
            </div>
            
            <h1 class="text-3xl font-bold mb-3">Tudo pronto!</h1>
            <p class="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
              Seu projeto foi configurado com sucesso. Agora você pode começar a rastrear suas campanhas!
            </p>
            
            <div class="bg-muted/50 rounded-lg p-6 mb-8 text-left">
              <h3 class="font-semibold mb-3">Resumo da configuração:</h3>
              <div class="space-y-2 text-sm">
                <div class="flex items-center justify-between">
                  <span class="text-muted-foreground">Empresa:</span>
                  <span class="font-medium">E-commerce Fashion</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-muted-foreground">Projeto:</span>
                  <span class="font-medium">Loja de Roupas - Meta Ads</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-muted-foreground">Integrações:</span>
                  <span class="font-medium text-green-600">1 conectada</span>
                </div>
              </div>
            </div>
            
            <button class="w-full max-w-sm px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium">
              Ir para o Dashboard →
            </button>
          </div>
        </div>
      </div>
    `,
  }),
}
