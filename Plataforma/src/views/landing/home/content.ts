export type HomeLandingFeature = {
  id: string
  title: string
  description: string
  image: string
  imageAlt: string
}

export type HomeLandingFaq = {
  id: string
  question: string
  answer: string
}

export type HomeLandingTestimonial = {
  quote: string
  name: string
  role: string
  avatar: string
}

export const homeLandingLinks = {
  signup: 'https://app.adsmagic.com.br/singup/?access_uuid=556feeb5-8f7d-445d-84a7-59876d25d2fc&utm_source=direct&utm_medium=none',
  signupNav: 'https://app.adsmagic.com.br/singup/?access_uuid=fd18531d-89d0-4b89-a174-81722b562e8d&utm_source=direct&utm_medium=none',
  login: 'https://app.adsmagic.com.br/login/?access_uuid=fd18531d-89d0-4b89-a174-81722b562e8d&utm_source=direct&utm_medium=none',
  contact: 'https://r.adsmagic.com.br/fd3344b2-dc4a-4334-b309-311c9d938c3d?utm_source=direct&utm_medium=none&landing_url=https%3A%2F%2Fadsmagic.com.br%2F',
  privacy: 'https://adsmagic.com.br/legal/privacy-policy',
  cookies: 'https://adsmagic.com.br/legal/cookie-policy',
  terms: 'https://adsmagic.com.br/legal/terms-of-service',
}

export const homeLandingSupportPartners = [
  { name: 'ABStartups', logo: 'logo-abstartups.png' },
  { name: 'Sebrae for Startups', logo: 'logo-sebrae.png' },
]

export const homeLandingTestimonial: HomeLandingTestimonial = {
  quote:
    'Antes do Adsmagic eu perdia cerca de 2h por semana cruzando planilhas e ainda ficava no escuro sobre a origem das vendas. Hoje deixo o dashboard aberto o dia inteiro: em segundos sei qual canal trouxe cada pedido e realoco o orçamento na hora certa. Ganhei confiança nos números, parei de desperdiçar verba e consigo crescer novos canais com segurança.',
  name: 'Gabriel Queiroz',
  role: 'Fundador da Melhor Limpeza',
  avatar: 'testimonial-gabriel.png',
}

export const homeLandingFeatures: HomeLandingFeature[] = [
  {
    id: 'feature-dashboard',
    title: 'Rastreia cada clique',
    description: 'Conecta Meta e Google ao WhatsApp em tempo real, da primeira mensagem até a venda.',
    image: 'feature-dashboard.png',
    imageAlt: 'Dashboard do Adsmagic mostrando origem de leads e vendas por canal',
  },
  {
    id: 'feature-conversations',
    title: 'Acompanha as conversas',
    description: 'Centraliza mensagens, origem e histórico de cada atendimento para o time agir sem perder contexto.',
    image: 'feature-conversations.png',
    imageAlt: 'Tela de mensagens do Adsmagic com origem dos contatos e resultados por conversa',
  },
  {
    id: 'feature-journey',
    title: 'Acompanha a jornada completa',
    description: 'Timeline única mostra cada interação, do anúncio ao pós-venda, para decisões baseadas em contexto.',
    image: 'feature-journey.png',
    imageAlt: 'Timeline de jornada do cliente no Adsmagic',
  },
  {
    id: 'feature-optimization',
    title: 'Otimiza anúncios em tempo real',
    description: 'Envia compras via Meta CAPI e Google Enhanced Conversions; o algoritmo aprende 3x mais rápido.',
    image: 'feature-optimization.png',
    imageAlt: 'Tela de vendas e otimização do Adsmagic',
  },
  {
    id: 'feature-funnel',
    title: 'Atualiza o funil sozinho',
    description: 'Frases-gatilho movem o lead de etapa e reduzem atualização manual do time comercial.',
    image: 'feature-funnel.png',
    imageAlt: 'Funil automatizado do Adsmagic com evolução das etapas',
  },
  {
    id: 'feature-campaigns',
    title: 'Painel de campanhas Google Ads e Meta Ads',
    description: 'Acompanhe campanhas, grupos e anúncios com dados de mídia e atribuição de contatos e vendas.',
    image: 'feature-campaigns.png',
    imageAlt: 'Painel de campanhas do Adsmagic com métricas de mídia, contatos e vendas',
  },
]

export type PricingPlan = {
  id: string
  name: string
  icon: string
  description: string
  monthlyPrice: number
  annualPrice: number
  features: string[]
  cta: string
  ctaStyle: 'outline' | 'filled'
  recommended?: boolean
}

export const homeLandingPricingPlans: PricingPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    icon: '⚡',
    description: 'Para quem está começando a rastrear resultados',
    monthlyPrice: 97,
    annualPrice: 77,
    features: [
      'Até 3 projetos',
      '500 contatos/mês',
      'Dashboard básico',
      '1 integração WhatsApp',
      'Suporte por email',
    ],
    cta: 'Assinar',
    ctaStyle: 'outline',
  },
  {
    id: 'pro',
    name: 'Pro',
    icon: '👑',
    description: 'Para equipes que precisam de mais controle e automação',
    monthlyPrice: 197,
    annualPrice: 157,
    features: [
      'Até 10 projetos',
      '5.000 contatos/mês',
      'Dashboard completo + Funil',
      '3 integrações WhatsApp',
      'Todas as origens (Meta, Google, TikTok)',
      'Exportação CSV/Excel',
      'Suporte prioritário',
    ],
    cta: 'Assinar',
    ctaStyle: 'filled',
    recommended: true,
  },
  {
    id: 'premium',
    name: 'Premium',
    icon: '🚀',
    description: 'Para agências e operações de grande escala',
    monthlyPrice: 497,
    annualPrice: 397,
    features: [
      'Projetos ilimitados',
      'Contatos ilimitados',
      'Dashboard completo + Pipeline + Insights IA',
      'Integrações ilimitadas',
      'Todas as origens + API Customizada',
      'Exportação avançada + Webhooks',
      'White-label disponível',
      'Suporte dedicado + Onboarding',
    ],
    cta: 'Falar com Vendas',
    ctaStyle: 'outline',
  },
]

export const homeLandingFaqs: HomeLandingFaq[] = [
  {
    id: 'faq-what-is',
    question: 'O que é o Adsmagic e como ele pode me ajudar?',
    answer: 'O Adsmagic é uma plataforma de rastreamento inteligente que unifica os indicadores das suas campanhas, identifica a origem real das conversas no WhatsApp e ajuda você a otimizar mídia com base em vendas concretas.',
  },
  {
    id: 'faq-tracking',
    question: 'Como o Adsmagic rastreia leads e vendas do WhatsApp?',
    answer: 'A plataforma cria links rastreáveis, conecta Google e Meta ao WhatsApp e acompanha o caminho completo entre clique, conversa, lead e venda, registrando cada etapa com contexto.',
  },
  {
    id: 'faq-stages',
    question: 'O Adsmagic permite alterar etapas de contatos automaticamente?',
    answer: 'Sim. O funil pode ser atualizado a partir de frases-gatilho e eventos capturados ao longo da conversa, reduzindo trabalho manual e melhorando a previsibilidade comercial.',
  },
  {
    id: 'faq-cpa',
    question: 'Como o Adsmagic ajuda a reduzir o Custo por Aquisição (CPA)?',
    answer: 'Ao enviar conversões reais de volta para Google Ads e Meta Ads, o algoritmo aprende com vendas confirmadas e ajusta a entrega para públicos e campanhas com maior retorno.',
  },
  {
    id: 'faq-integrations',
    question: 'Como o Adsmagic se conecta ao Meta Ads e Google Ads?',
    answer: 'A integração usa eventos e dados de conversão para conectar mídia, CRM e WhatsApp na mesma operação, com envio estruturado de informações para as plataformas de anúncio.',
  },
  {
    id: 'faq-setup',
    question: 'Quanto tempo leva para configurar o Adsmagic?',
    answer: 'A proposta da página atual é configuração em menos de 5 minutos, com fluxo enxuto para criar links, conectar canais e começar a rastrear rapidamente.',
  },
  {
    id: 'faq-export',
    question: 'Posso exportar os dados de contatos e vendas?',
    answer: 'Sim. O plano divulgado inclui exportação CSV para que você leve os dados de contatos, vendas e histórico para sua operação sempre que precisar.',
  },
  {
    id: 'faq-security',
    question: 'O Adsmagic é seguro?',
    answer: 'A comunicação da página posiciona o produto como uma camada operacional para capturar, organizar e devolver dados com contexto, preservando rastreabilidade, histórico e controle da operação.',
  },
]
