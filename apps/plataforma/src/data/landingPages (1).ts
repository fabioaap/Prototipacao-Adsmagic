export type LandingPageTone = 'primary' | 'cyan' | 'emerald' | 'amber' | 'rose' | 'violet'
export type LandingPageSurfaceStatus = 'active' | 'planned'
export type LandingPageVersionStatus = 'building' | 'review' | 'canary' | 'published' | 'archived'

export interface LandingPageContext {
  icp: string
  owner: string
  lastUpdate: string
  nextStep: string
  primaryCta: string
  checklist: string[]
  completionPercent?: number
}

export interface LandingPageMetric {
  label: string
  value: string
  helper: string
}

export interface LandingPageLink {
  label: string
  to: string
  kind: 'app' | 'docs'
  helper?: string
}

export interface LandingPageVersion {
  id: string
  label: string
  status: LandingPageVersionStatus
  statusLabel: string
  summary: string
  branch: string
  lastUpdate: string
  focus: string
  experimentId?: string
  notes: string[]
  metrics: LandingPageMetric[]
  links: LandingPageLink[]
}

export interface LandingPage {
  id: string
  name: string
  version?: string
  status: LandingPageSurfaceStatus
  statusLabel: string
  summary: string
  focus: string
  stage: string
  completed: number
  total: number
  icon: string
  tone: LandingPageTone
  audiences: string[]
  channels: string[]
  outcomes: string[]
  context: LandingPageContext
  versions: LandingPageVersion[]
  destinations: LandingPageLink[]
}

export interface LandingCatalogQuickAccess {
  to: string
  title: string
  description: string
  area: string
  icon: string
  tone: LandingPageTone
  cta: string
  kind: 'app' | 'docs'
}

export interface LandingCatalogStat {
  value: string
  label: string
  helper: string
}

export const mockLandingPages: LandingPage[] = [
  {
    id: 'lp-agencias',
    name: 'LP Agencias',
    version: 'v0.1',
    status: 'active',
    statusLabel: 'Publicada em v0.1',
    summary: 'LP de campanha para agencias de performance e gestores de trafego que precisam provar atribuicao, receita e qualidade de conversao via WhatsApp.',
    focus: 'Conecta mensagem de captura de intencao, demo diagnostica, deck comercial e blueprint da oferta numa mesma superficie.',
    stage: 'Blueprint consolidado, superficie catalogada e landing standalone publicada em v0.1.',
    completed: 3,
    total: 6,
    icon: 'ads_click',
    tone: 'primary',
    audiences: ['Donos de agencia', 'Gestores de trafego', 'Operacoes que vendem via WhatsApp'],
    channels: ['Google Ads', 'Meta Ads', 'Outbound consultivo', 'Instagram organico'],
    outcomes: ['Oferta alinhada ao ICP vigente', 'CTA principal congelado em demo diagnostica', 'Entrada pronta para futuras variacoes de copy e layout'],
    context: {
      icp: 'Agencias de performance, growth e trafego pago com vendas via WhatsApp.',
      owner: 'Marketing + produto',
      lastUpdate: '2026-04-02',
      nextStep: 'Adicionar prova social real, captacao de demo e proximas variacoes de copy por canal.',
      primaryCta: 'Agende uma demo diagnostica',
      checklist: [
        'Blueprint editorial fechado',
        'Catalogo da superficie criado no workspace',
        'Ligacao com deck e wiki registrada',
        'LP standalone alinhada a Search e Meta Ads',
      ],
      completionPercent: 75,
    },
    versions: [
      {
        id: 'lp-agencias-v0-1',
        label: 'v0.1',
        status: 'building',
        statusLabel: 'Building',
        summary: 'Primeira versao catalogada da LP Agencias. Consolida a narrativa, os blocos da oferta e os links operacionais numa landing standalone funcional.',
        branch: 'prototypes/feature/lp-agencias',
        lastUpdate: '2026-04-02',
        focus: 'Narrativa de captura de intencao com atribuicao, inteligencia e envio de conversoes como categoria do produto.',
        experimentId: 'PROTO-003',
        notes: [
          'A rota /lp/agencias agora segue a estrutura operacional usada em Search, Meta Ads e materiais de vendas.',
          'As ancoras #atribuicao, #como-funciona e #demo estao disponiveis para campanha e sitelinks.',
          'Deck comercial e copies da motion continuam ligados como apoio operacional.',
        ],
        metrics: [
          { label: 'Blocos', value: '8', helper: 'estrutura principal da LP de campanha' },
          { label: 'CTA', value: '1', helper: 'demo diagnostica congelada' },
          { label: 'Status', value: '75%', helper: 'landing funcional; prova social e CTA comercial ainda pendentes' },
        ],
        links: [
          { label: 'Abrir LP standalone', to: '/lp/agencias', kind: 'app', helper: 'Rota final da landing' },
          { label: 'Abrir deck comercial', to: '/deck/agencias', kind: 'app', helper: 'One-pager de apoio' },
          { label: 'Ler blueprint da oferta', to: 'wiki/marketing/oferta-para-agencias', kind: 'docs', helper: 'Fonte editorial da LP' },
        ],
      },
    ],
    destinations: [
      { label: 'Abrir LP standalone', to: '/lp/agencias', kind: 'app', helper: 'Destino final da superficie' },
      { label: 'Abrir deck comercial', to: '/deck/agencias', kind: 'app', helper: 'Apoio de vendas consultivas' },
      { label: 'Ler blueprint', to: 'wiki/marketing/oferta-para-agencias', kind: 'docs', helper: 'Oferta e copy-base' },
      { label: 'Ver assets e campanhas', to: 'wiki/marketing/assets-e-campanhas', kind: 'docs', helper: 'Contexto operacional do GTM' },
    ],
  },
]

export const mockLandingCatalogQuickAccess: LandingCatalogQuickAccess[] = [
  {
    to: '/lp/agencias',
    title: 'LP Agencias',
    description: 'Abra a landing standalone ja publicada para revisar a narrativa principal da oferta.',
    area: 'Superficie final',
    icon: 'open_in_new',
    tone: 'primary',
    cta: 'Abrir LP',
    kind: 'app',
  },
  {
    to: '/deck/agencias',
    title: 'Deck comercial',
    description: 'Use o one-pager como apoio a demos, outbound e handoff comercial.',
    area: 'Sales enablement',
    icon: 'description',
    tone: 'emerald',
    cta: 'Abrir deck',
    kind: 'app',
  },
  {
    to: 'wiki/marketing/oferta-para-agencias',
    title: 'Blueprint da oferta',
    description: 'Consulte headline, blocos de valor, FAQ e regras editoriais da LP.',
    area: 'Fonte editorial',
    icon: 'menu_book',
    tone: 'violet',
    cta: 'Abrir blueprint',
    kind: 'docs',
  },
]

export const mockLandingCatalogStats: LandingCatalogStat[] = [
  { value: '1', label: 'LP Catalogada', helper: 'Superficie registrada no workspace' },
  { value: '1', label: 'Versao Ativa', helper: 'Entrada inicial pronta para evoluir' },
  { value: '3', label: 'Destinos Ligados', helper: 'LP, deck e blueprint conectados' },
  { value: '4', label: 'Canais Mapeados', helper: 'Capitacao priorizada para esta oferta' },
]