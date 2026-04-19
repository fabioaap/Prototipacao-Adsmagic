import type { Meta, StoryObj } from '@storybook/vue3'
import Card from '@/components/ui/Card.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import CardTitle from '@/components/ui/CardTitle.vue'
import CardDescription from '@/components/ui/CardDescription.vue'
import CardContent from '@/components/ui/CardContent.vue'
import CardFooter from '@/components/ui/CardFooter.vue'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'
import Avatar from '@/components/ui/Avatar.vue'

const meta: Meta<typeof Card> = {
  title: 'Atoms/Card',
  component: Card,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Componente de cartão para agrupar conteúdos relacionados com bordas e sombras.'
      }
    }
  }
}

export default meta
type Story = StoryObj<typeof Card>

// Default
export const Default: Story = {
  render: () => ({
    components: { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Button },
    template: `
      <Card class="w-full max-w-[350px]">
        <CardHeader>
          <CardTitle>Título do Card</CardTitle>
          <CardDescription>Descrição breve do conteúdo do card.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Este é o conteúdo principal do card. Pode conter textos, formulários ou qualquer outro elemento.</p>
        </CardContent>
        <CardFooter class="flex justify-end gap-2">
          <Button variant="outline">Cancelar</Button>
          <Button>Confirmar</Button>
        </CardFooter>
      </Card>
    `
  })
}

// Simples
export const Simple: Story = {
  render: () => ({
    components: { Card, CardContent },
    template: `
      <Card class="w-full max-w-[300px]">
        <CardContent class="pt-6">
          <p>Card simples apenas com conteúdo.</p>
        </CardContent>
      </Card>
    `
  })
}

// KPI Card
export const KPICard: Story = {
  render: () => ({
    components: { Card, CardHeader, CardTitle, CardContent },
    template: `
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader class="pb-2">
            <CardTitle class="text-sm font-medium text-muted-foreground">Total de Contatos</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold">1,234</div>
            <p class="text-xs text-green-600 flex items-center gap-1">
              <span>↑</span> +12% este mês
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader class="pb-2">
            <CardTitle class="text-sm font-medium text-muted-foreground">Vendas</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold">R$ 45.231</div>
            <p class="text-xs text-green-600 flex items-center gap-1">
              <span>↑</span> +8% este mês
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader class="pb-2">
            <CardTitle class="text-sm font-medium text-muted-foreground">Taxa de Conversão</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold">3.2%</div>
            <p class="text-xs text-red-600 flex items-center gap-1">
              <span>↓</span> -0.5% este mês
            </p>
          </CardContent>
        </Card>
      </div>
    `
  })
}

// Projeto
export const ProjectCard: Story = {
  render: () => ({
    components: { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Button, Badge },
    template: `
      <Card class="w-full max-w-[350px]">
        <CardHeader>
          <div class="flex items-center justify-between">
            <CardTitle>Loja Online</CardTitle>
            <Badge variant="secondary">Ativo</Badge>
          </div>
          <CardDescription>E-commerce de produtos eletrônicos</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p class="text-muted-foreground">Contatos</p>
              <p class="font-medium">1,234</p>
            </div>
            <div>
              <p class="text-muted-foreground">Vendas</p>
              <p class="font-medium">R$ 45.231</p>
            </div>
            <div>
              <p class="text-muted-foreground">Conversão</p>
              <p class="font-medium">3.2%</p>
            </div>
            <div>
              <p class="text-muted-foreground">Ticket Médio</p>
              <p class="font-medium">R$ 189</p>
            </div>
          </div>
        </CardContent>
        <CardFooter class="flex justify-between">
          <Button variant="ghost" size="sm">Ver detalhes</Button>
          <Button size="sm">Acessar</Button>
        </CardFooter>
      </Card>
    `
  })
}

// Contato
export const ContactCard: Story = {
  render: () => ({
    components: { Card, CardContent, Avatar, AvatarImage, AvatarFallback, Badge, Button },
    template: `
      <Card class="w-[350px]">
        <CardContent class="pt-6">
          <div class="flex items-start gap-4">
            <Avatar class="h-12 w-12">
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div class="flex-1">
              <div class="flex items-center justify-between">
                <h3 class="font-semibold">João da Silva</h3>
                <Badge>Qualificado</Badge>
              </div>
              <p class="text-sm text-muted-foreground">joao@email.com</p>
              <p class="text-sm text-muted-foreground">(11) 99999-9999</p>
              <div class="mt-3 flex gap-2">
                <Button size="sm" variant="outline">WhatsApp</Button>
                <Button size="sm">Ver perfil</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    `
  })
}

// Integração
export const IntegrationCard: Story = {
  render: () => ({
    components: { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Button, Badge },
    template: `
      <div class="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">f</div>
              <div>
                <CardTitle class="text-base">Meta Ads</CardTitle>
                <CardDescription>Facebook & Instagram</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Badge class="bg-green-100 text-green-700">Conectado</Badge>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" class="w-full">Gerenciar</Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold">W</div>
              <div>
                <CardTitle class="text-base">WhatsApp</CardTitle>
                <CardDescription>Business API</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Badge variant="outline">Não conectado</Badge>
          </CardContent>
          <CardFooter>
            <Button size="sm" class="w-full">Conectar</Button>
          </CardFooter>
        </Card>
      </div>
    `
  })
}

// Preços
export const PricingCard: Story = {
  render: () => ({
    components: { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Button, Badge },
    template: `
      <div class="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Básico</CardTitle>
            <CardDescription>Para começar</CardDescription>
          </CardHeader>
          <CardContent>
            <div class="text-3xl font-bold">R$ 49<span class="text-sm font-normal text-muted-foreground">/mês</span></div>
            <ul class="mt-4 space-y-2 text-sm">
              <li class="flex items-center gap-2">✓ Até 500 contatos</li>
              <li class="flex items-center gap-2">✓ 1 projeto</li>
              <li class="flex items-center gap-2">✓ Relatórios básicos</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button variant="outline" class="w-full">Selecionar</Button>
          </CardFooter>
        </Card>
        
        <Card class="border-primary">
          <CardHeader>
            <div class="flex justify-between items-center">
              <CardTitle>Pro</CardTitle>
              <Badge>Popular</Badge>
            </div>
            <CardDescription>Para equipes em crescimento</CardDescription>
          </CardHeader>
          <CardContent>
            <div class="text-3xl font-bold">R$ 99<span class="text-sm font-normal text-muted-foreground">/mês</span></div>
            <ul class="mt-4 space-y-2 text-sm">
              <li class="flex items-center gap-2">✓ Contatos ilimitados</li>
              <li class="flex items-center gap-2">✓ 5 projetos</li>
              <li class="flex items-center gap-2">✓ Integrações avançadas</li>
              <li class="flex items-center gap-2">✓ Suporte prioritário</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button class="w-full">Selecionar</Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Enterprise</CardTitle>
            <CardDescription>Para grandes empresas</CardDescription>
          </CardHeader>
          <CardContent>
            <div class="text-3xl font-bold">Custom</div>
            <ul class="mt-4 space-y-2 text-sm">
              <li class="flex items-center gap-2">✓ Tudo do Pro</li>
              <li class="flex items-center gap-2">✓ Projetos ilimitados</li>
              <li class="flex items-center gap-2">✓ API dedicada</li>
              <li class="flex items-center gap-2">✓ SLA garantido</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button variant="outline" class="w-full">Contato</Button>
          </CardFooter>
        </Card>
      </div>
    `
  })
}

// Notificação
export const NotificationCard: Story = {
  render: () => ({
    components: { Card, CardContent, Button },
    template: `
      <Card class="w-[380px]">
        <CardContent class="pt-4">
          <div class="space-y-3">
            <div class="flex gap-3 p-2 hover:bg-muted rounded cursor-pointer">
              <div class="w-2 h-2 mt-2 rounded-full bg-blue-500" />
              <div class="flex-1">
                <p class="text-sm font-medium">Novo contato recebido</p>
                <p class="text-xs text-muted-foreground">João Silva entrou pelo Meta Ads</p>
                <p class="text-xs text-muted-foreground">Há 5 minutos</p>
              </div>
            </div>
            <div class="flex gap-3 p-2 hover:bg-muted rounded cursor-pointer">
              <div class="w-2 h-2 mt-2 rounded-full bg-green-500" />
              <div class="flex-1">
                <p class="text-sm font-medium">Venda realizada!</p>
                <p class="text-xs text-muted-foreground">R$ 450,00 - Maria Santos</p>
                <p class="text-xs text-muted-foreground">Há 1 hora</p>
              </div>
            </div>
            <div class="flex gap-3 p-2 hover:bg-muted rounded cursor-pointer opacity-60">
              <div class="w-2 h-2 mt-2 rounded-full bg-transparent border" />
              <div class="flex-1">
                <p class="text-sm font-medium">Sincronização concluída</p>
                <p class="text-xs text-muted-foreground">45 novos contatos importados</p>
                <p class="text-xs text-muted-foreground">Ontem</p>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm" class="w-full mt-2">
            Ver todas as notificações
          </Button>
        </CardContent>
      </Card>
    `
  })
}

// Hover effects
export const HoverEffects: Story = {
  render: () => ({
    components: { Card, CardHeader, CardTitle, CardContent },
    template: `
      <div class="grid grid-cols-3 gap-4">
        <Card class="cursor-pointer transition-shadow hover:shadow-lg">
          <CardHeader>
            <CardTitle class="text-base">Hover Shadow</CardTitle>
          </CardHeader>
          <CardContent>
            <p class="text-sm text-muted-foreground">Passa o mouse para ver o efeito</p>
          </CardContent>
        </Card>
        
        <Card class="cursor-pointer transition-all hover:scale-105">
          <CardHeader>
            <CardTitle class="text-base">Hover Scale</CardTitle>
          </CardHeader>
          <CardContent>
            <p class="text-sm text-muted-foreground">Passa o mouse para ver o efeito</p>
          </CardContent>
        </Card>
        
        <Card class="cursor-pointer transition-colors hover:border-primary">
          <CardHeader>
            <CardTitle class="text-base">Hover Border</CardTitle>
          </CardHeader>
          <CardContent>
            <p class="text-sm text-muted-foreground">Passa o mouse para ver o efeito</p>
          </CardContent>
        </Card>
      </div>
    `
  })
}
