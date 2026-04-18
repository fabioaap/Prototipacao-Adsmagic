import type { Meta, StoryObj } from '@storybook/vue3'

/**
 * AuthTemplate - Template das páginas de autenticação.
 * 
 * Páginas de login, registro e recuperação de senha.
 */
const meta: Meta = {
  title: 'Templates/AuthPages',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Templates das páginas de autenticação (Login, Registro, etc).',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

/**
 * Página de Login
 */
export const Login: Story = {
  render: () => ({
    template: `
      <div class="min-h-screen flex">
        <!-- Left side - Form -->
        <div class="flex-1 flex items-center justify-center p-8">
          <div class="w-full max-w-md">
            <div class="flex items-center gap-3 mb-8">
              <div class="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <span class="text-primary-foreground font-bold">A</span>
              </div>
              <span class="text-xl font-bold">AdsMagic</span>
            </div>
            
            <h1 class="text-2xl font-bold mb-2">Bem-vindo de volta!</h1>
            <p class="text-muted-foreground mb-8">Entre na sua conta para continuar</p>
            
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium mb-2">E-mail</label>
                <input 
                  type="email" 
                  placeholder="seu@email.com"
                  class="w-full h-11 rounded-lg border px-4 text-sm"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium mb-2">Senha</label>
                <input 
                  type="password" 
                  placeholder="••••••••"
                  class="w-full h-11 rounded-lg border px-4 text-sm"
                />
              </div>
              
              <div class="flex items-center justify-between">
                <label class="flex items-center gap-2 text-sm">
                  <input type="checkbox" class="rounded" />
                  Lembrar de mim
                </label>
                <a href="#" class="text-sm text-primary hover:underline">
                  Esqueceu a senha?
                </a>
              </div>
              
              <button class="w-full h-11 bg-primary text-primary-foreground rounded-lg font-medium">
                Entrar
              </button>
              
              <div class="relative my-6">
                <div class="absolute inset-0 flex items-center">
                  <div class="w-full border-t"></div>
                </div>
                <div class="relative flex justify-center text-xs uppercase">
                  <span class="bg-background px-2 text-muted-foreground">ou continue com</span>
                </div>
              </div>
              
              <button class="w-full h-11 border rounded-lg font-medium flex items-center justify-center gap-2">
                <span>G</span>
                Continuar com Google
              </button>
            </div>
            
            <p class="text-center text-sm text-muted-foreground mt-8">
              Não tem uma conta? 
              <a href="#" class="text-primary hover:underline">Criar conta</a>
            </p>
          </div>
        </div>
        
        <!-- Right side - Image/Branding -->
        <div class="hidden lg:flex flex-1 bg-gradient-to-br from-primary to-primary/80 items-center justify-center p-8">
          <div class="text-center text-white max-w-md">
            <h2 class="text-3xl font-bold mb-4">Rastreie suas campanhas com precisão</h2>
            <p class="text-primary-foreground/80 text-lg">
              Tenha visibilidade completa do ROI das suas campanhas de marketing digital.
            </p>
          </div>
        </div>
      </div>
    `,
  }),
}

/**
 * Página de Registro
 */
export const Register: Story = {
  render: () => ({
    template: `
      <div class="min-h-screen flex">
        <!-- Left side - Form -->
        <div class="flex-1 flex items-center justify-center p-8">
          <div class="w-full max-w-md">
            <div class="flex items-center gap-3 mb-8">
              <div class="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <span class="text-primary-foreground font-bold">A</span>
              </div>
              <span class="text-xl font-bold">AdsMagic</span>
            </div>
            
            <h1 class="text-2xl font-bold mb-2">Crie sua conta</h1>
            <p class="text-muted-foreground mb-8">Comece seu trial gratuito de 14 dias</p>
            
            <div class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium mb-2">Nome</label>
                  <input 
                    type="text" 
                    placeholder="João"
                    class="w-full h-11 rounded-lg border px-4 text-sm"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium mb-2">Sobrenome</label>
                  <input 
                    type="text" 
                    placeholder="Silva"
                    class="w-full h-11 rounded-lg border px-4 text-sm"
                  />
                </div>
              </div>
              
              <div>
                <label class="block text-sm font-medium mb-2">E-mail</label>
                <input 
                  type="email" 
                  placeholder="seu@email.com"
                  class="w-full h-11 rounded-lg border px-4 text-sm"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium mb-2">Senha</label>
                <input 
                  type="password" 
                  placeholder="Mínimo 8 caracteres"
                  class="w-full h-11 rounded-lg border px-4 text-sm"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium mb-2">Confirmar senha</label>
                <input 
                  type="password" 
                  placeholder="Repita a senha"
                  class="w-full h-11 rounded-lg border px-4 text-sm"
                />
              </div>
              
              <label class="flex items-start gap-2 text-sm">
                <input type="checkbox" class="rounded mt-0.5" />
                <span class="text-muted-foreground">
                  Li e concordo com os 
                  <a href="#" class="text-primary hover:underline">Termos de Uso</a> e 
                  <a href="#" class="text-primary hover:underline">Política de Privacidade</a>
                </span>
              </label>
              
              <button class="w-full h-11 bg-primary text-primary-foreground rounded-lg font-medium">
                Criar conta
              </button>
            </div>
            
            <p class="text-center text-sm text-muted-foreground mt-8">
              Já tem uma conta? 
              <a href="#" class="text-primary hover:underline">Fazer login</a>
            </p>
          </div>
        </div>
        
        <!-- Right side - Image/Branding -->
        <div class="hidden lg:flex flex-1 bg-gradient-to-br from-primary to-primary/80 items-center justify-center p-8">
          <div class="text-center text-white max-w-md">
            <div class="mb-6">
              <span class="text-6xl">🚀</span>
            </div>
            <h2 class="text-3xl font-bold mb-4">14 dias grátis</h2>
            <p class="text-primary-foreground/80 text-lg">
              Sem cartão de crédito necessário. Cancele quando quiser.
            </p>
          </div>
        </div>
      </div>
    `,
  }),
}

/**
 * Recuperação de senha
 */
export const ForgotPassword: Story = {
  render: () => ({
    template: `
      <div class="min-h-screen flex items-center justify-center p-8 bg-muted/30">
        <div class="w-full max-w-md">
          <div class="bg-card rounded-2xl shadow-lg border p-8">
            <div class="flex items-center gap-3 mb-8 justify-center">
              <div class="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <span class="text-primary-foreground font-bold">A</span>
              </div>
              <span class="text-xl font-bold">AdsMagic</span>
            </div>
            
            <div class="text-center mb-6">
              <div class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span class="text-3xl">🔑</span>
              </div>
              <h1 class="text-2xl font-bold mb-2">Esqueceu a senha?</h1>
              <p class="text-muted-foreground">
                Informe seu e-mail e enviaremos um link para redefinir sua senha.
              </p>
            </div>
            
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium mb-2">E-mail</label>
                <input 
                  type="email" 
                  placeholder="seu@email.com"
                  class="w-full h-11 rounded-lg border px-4 text-sm"
                />
              </div>
              
              <button class="w-full h-11 bg-primary text-primary-foreground rounded-lg font-medium">
                Enviar link
              </button>
            </div>
            
            <p class="text-center text-sm text-muted-foreground mt-6">
              <a href="#" class="text-primary hover:underline">← Voltar para login</a>
            </p>
          </div>
        </div>
      </div>
    `,
  }),
}

/**
 * E-mail enviado
 */
export const EmailSent: Story = {
  render: () => ({
    template: `
      <div class="min-h-screen flex items-center justify-center p-8 bg-muted/30">
        <div class="w-full max-w-md">
          <div class="bg-card rounded-2xl shadow-lg border p-8 text-center">
            <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span class="text-4xl">✉️</span>
            </div>
            
            <h1 class="text-2xl font-bold mb-2">E-mail enviado!</h1>
            <p class="text-muted-foreground mb-6">
              Enviamos um link de recuperação para <strong>usuario@email.com</strong>. 
              Verifique sua caixa de entrada.
            </p>
            
            <button class="w-full h-11 bg-primary text-primary-foreground rounded-lg font-medium mb-4">
              Abrir app de e-mail
            </button>
            
            <p class="text-sm text-muted-foreground">
              Não recebeu? <a href="#" class="text-primary hover:underline">Reenviar e-mail</a>
            </p>
          </div>
        </div>
      </div>
    `,
  }),
}
