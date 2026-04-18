import type { Meta, StoryObj } from '@storybook/vue3'
import Accordion from '@/components/ui/Accordion.vue'

const meta: Meta<typeof Accordion> = {
    title: 'Atoms/Accordion',
    component: Accordion,
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: 'Componente de acordeão para exibir conteúdo expansível em seções.'
            }
        }
    }
}

export default meta
type Story = StoryObj<typeof Accordion>

// Default - usando props do componente
export const Default: Story = {
    render: () => ({
        components: { Accordion },
        setup() {
            const items = [
                { id: '1', title: 'O que é o AdsMagic?', content: 'AdsMagic é uma plataforma de rastreamento de marketing que permite monitorar conversões e atribuir vendas às origens de tráfego.' },
                { id: '2', title: 'Como funciona o rastreamento?', content: 'Utilizamos pixels de rastreamento e integrações com plataformas de anúncios para capturar eventos de conversão.' },
                { id: '3', title: 'Quanto custa?', content: 'Oferecemos planos a partir de R$ 49/mês para até 500 contatos. Consulte nossa página de preços para mais detalhes.' }
            ]
            return { items }
        },
        template: `
      <div class="w-[500px]">
        <Accordion :items="items" />
      </div>
    `
    })
}

// FAQ
export const FAQ: Story = {
    render: () => ({
        components: { Accordion },
        setup() {
            const items = [
                {
                    id: 'faq-1',
                    title: 'Como conectar minha conta do Meta Ads?',
                    content: 'Acesse Configurações > Integrações e clique em "Conectar Meta Ads". Você será redirecionado para autorizar o acesso. Após autorizar, suas campanhas serão sincronizadas automaticamente.'
                },
                {
                    id: 'faq-2',
                    title: 'O que é o pixel de rastreamento?',
                    content: 'O pixel é um código JavaScript que você instala em seu site para rastrear ações dos visitantes, como compras, cadastros e visualizações de página. Isso permite atribuir conversões às campanhas corretas.'
                },
                {
                    id: 'faq-3',
                    title: 'Como funciona a atribuição de vendas?',
                    content: 'Quando um visitante chega ao seu site através de um anúncio e realiza uma compra, o AdsMagic identifica a origem (Meta Ads, Google Ads, etc.) e atribui a venda à campanha correspondente.'
                },
                {
                    id: 'faq-4',
                    title: 'Posso cancelar minha assinatura a qualquer momento?',
                    content: 'Sim! Você pode cancelar sua assinatura a qualquer momento sem taxas adicionais. Seu acesso permanece ativo até o final do período pago.'
                },
                {
                    id: 'faq-5',
                    title: 'Vocês oferecem suporte?',
                    content: 'Sim, oferecemos suporte via chat e email para todos os planos. Clientes Enterprise têm acesso a suporte prioritário com SLA garantido.'
                }
            ]
            return { items }
        },
        template: `
      <div class="w-[600px]">
        <h2 class="text-xl font-bold mb-4">Perguntas Frequentes</h2>
        <Accordion :items="items" />
      </div>
    `
    })
}

// Configurações
export const Settings: Story = {
    render: () => ({
        components: { Accordion },
        setup() {
            const items = [
                {
                    id: 'general',
                    title: '⚙️ Configurações Gerais',
                    content: 'Configure nome do projeto, fuso horário, moeda e idioma padrão. Essas configurações afetam como os dados são exibidos em relatórios.'
                },
                {
                    id: 'integrations',
                    title: '🔗 Integrações',
                    content: 'Conecte suas contas de anúncios (Meta Ads, Google Ads), CRMs e ferramentas de comunicação como WhatsApp Business.'
                },
                {
                    id: 'notifications',
                    title: '🔔 Notificações',
                    content: 'Configure quando e como receber alertas sobre novos contatos, vendas e eventos importantes do sistema.'
                },
                {
                    id: 'team',
                    title: '👥 Equipe',
                    content: 'Gerencie membros da equipe, defina permissões e controle quem pode acessar cada projeto.'
                },
                {
                    id: 'billing',
                    title: '💳 Faturamento',
                    content: 'Visualize seu plano atual, histórico de faturas e atualize método de pagamento.'
                }
            ]
            return { items }
        },
        template: `
      <div class="w-[500px]">
        <Accordion :items="items" />
      </div>
    `
    })
}

// Recursos do produto
export const Features: Story = {
    render: () => ({
        components: { Accordion },
        setup() {
            const items = [
                {
                    id: 'tracking',
                    title: 'Rastreamento de Conversões',
                    content: 'Acompanhe cada conversão do seu funil, desde o primeiro clique até a venda. Saiba exatamente de onde vêm seus melhores clientes.'
                },
                {
                    id: 'attribution',
                    title: 'Atribuição Multi-Touch',
                    content: 'Entenda a jornada completa do cliente com modelos de atribuição personalizáveis. Descubra quais canais contribuem para suas vendas.'
                },
                {
                    id: 'dashboard',
                    title: 'Dashboard em Tempo Real',
                    content: 'Visualize métricas importantes em um painel intuitivo. Gráficos, KPIs e relatórios atualizados automaticamente.'
                },
                {
                    id: 'integrations',
                    title: 'Integrações Nativas',
                    content: 'Conecte-se com Meta Ads, Google Ads, WhatsApp Business, CRMs e dezenas de outras ferramentas sem código.'
                }
            ]
            return { items }
        },
        template: `
      <div class="w-[600px] p-6 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg">
        <h2 class="text-xl font-bold mb-4">Por que escolher o AdsMagic?</h2>
        <Accordion :items="items" />
      </div>
    `
    })
}

// Documentação
export const Documentation: Story = {
    render: () => ({
        components: { Accordion },
        setup() {
            const items = [
                {
                    id: 'install',
                    title: '📦 Instalação',
                    content: 'Para instalar o pixel, copie o código fornecido e cole antes da tag </head> do seu site. Se estiver usando GTM, crie uma tag HTML personalizada.'
                },
                {
                    id: 'events',
                    title: '📊 Eventos',
                    content: 'Você pode rastrear eventos personalizados chamando adsmagic.track("nome_do_evento", { dados }). Eventos padrão incluem: pageview, lead, purchase.'
                },
                {
                    id: 'api',
                    title: '🔌 API',
                    content: 'Nossa API REST permite integrar o AdsMagic com qualquer sistema. Documentação completa disponível em docs.adsmagic.io/api.'
                },
                {
                    id: 'webhooks',
                    title: '🎣 Webhooks',
                    content: 'Configure webhooks para receber notificações em tempo real quando eventos importantes acontecerem, como novas vendas ou contatos.'
                }
            ]
            return { items }
        },
        template: `
      <div class="w-[600px]">
        <h2 class="text-xl font-bold mb-4">📚 Documentação</h2>
        <Accordion :items="items" />
      </div>
    `
    })
}
