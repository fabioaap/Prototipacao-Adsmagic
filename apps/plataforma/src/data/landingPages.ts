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
  kind: 'app' | 'docs' | 'external'
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
  manifestId?: string
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
  kind: 'app' | 'docs' | 'external'
}

export interface LandingCatalogStat {
  value: string
  label: string
  helper: string
}

type LandingManifestLinkKey = keyof LandingPagesManifestLinks

const landingPagesManifest = __LANDING_PAGES_MANIFEST__
const landingPagesPreviewBaseUrl = (
  import.meta.env.VITE_LANDING_PAGES_PREVIEW_URL || (import.meta.env.DEV ? 'http://localhost:4173' : '')
).replace(/\/$/, '')

const vendasManifestId = 'lp-vendas-whatsapp'
const agenciasManifestId = 'lp-para-agencias'

function getManifestPage(manifestId: string) {
  return landingPagesManifest.pages.find((page) => page.id === manifestId) ?? null
}

function normalizePath(path: string) {
  return path.startsWith('/') ? path : `/${path}`
}

function resolvePreviewUrl(manifestId: string, fallbackPath: string) {
  const previewPath = getManifestPage(manifestId)?.previewPath || fallbackPath
  const normalizedPath = normalizePath(previewPath)
  return landingPagesPreviewBaseUrl ? `${landingPagesPreviewBaseUrl}${normalizedPath}` : normalizedPath
}

function resolveCanonicalUrl(manifestId: string, fallbackUrl: string) {
  return getManifestPage(manifestId)?.canonicalUrl || fallbackUrl
}

function resolveManifestLink(manifestId: string, key: LandingManifestLinkKey, fallbackUrl: string) {
  return getManifestPage(manifestId)?.links[key] || fallbackUrl
}

function buildPreviewLink(manifestId: string, fallbackPath: string, helper: string): LandingPageLink {
  return {
    label: 'Abrir preview standalone',
    to: resolvePreviewUrl(manifestId, fallbackPath),
    kind: 'external',
    helper,
  }
}

function buildCanonicalLink(manifestId: string, fallbackUrl: string, helper: string): LandingPageLink {
  return {
    label: 'Abrir URL canonica',
    to: resolveCanonicalUrl(manifestId, fallbackUrl),
    kind: 'external',
    helper,
  }
}

const vendasPreviewLink = buildPreviewLink(
  vendasManifestId,
  '/lp/home',
  'App landing-pages em porta dedicada',
)

const vendasCanonicalLink = buildCanonicalLink(
  vendasManifestId,
  '/lp/home',
  'Destino de publicacao registrado no manifesto',
)

const agenciasPreviewLink = buildPreviewLink(
  agenciasManifestId,
  '/lp/agencias',
  'App landing-pages em porta dedicada',
)

const agenciasCanonicalLink = buildCanonicalLink(
  agenciasManifestId,
  '/lp/agencias',
  'Destino de publicacao registrado no manifesto',
)

const vendasLegacyLink: LandingPageLink = {
  label: 'Testar atalho legado da Plataforma',
  to: '/lp/home',
  kind: 'app',
  helper: 'Redireciona para a superficie standalone preservando query e hash',
}

const agenciasLegacyLink: LandingPageLink = {
  label: 'Testar atalho legado da Plataforma',
  to: '/lp/agencias',
  kind: 'app',
  helper: 'Redireciona para a superficie standalone preservando query e hash',
}

export const mockLandingPages: LandingPage[] = [
  {
    id: 'lp-vendas-whatsapp',
    manifestId: vendasManifestId,
    name: 'LP Vendas no WhatsApp',
    version: 'v0.1',
    status: 'active',
    statusLabel: 'Preview ativo',
    summary: getManifestPage(vendasManifestId)?.description || 'Landing page principal focada em rastreamento de leads e vendas via WhatsApp com atribuicao para midia paga.',
    focus: 'Mensagem de categoria mais ampla para operacoes que precisam ligar clique, conversa e venda e devolver sinais reais para Google e Meta Ads.',
    stage: 'Preview standalone e pacote estatico prontos para publicacao separada da Plataforma.',
    completed: 4,
    total: 5,
    icon: 'chat',
    tone: 'emerald',
    audiences: ['Times de performance in-house', 'Operacoes de vendas', 'Negocios que fecham no WhatsApp'],
    channels: ['Google Ads', 'Meta Ads', 'WhatsApp', 'Site institucional'],
    outcomes: ['Preview multipage desacoplado da Plataforma', 'CTA externo centralizado no manifesto', 'Entrega estatica pronta para handoff'],
    context: {
      icp: 'Operacoes que vendem pelo WhatsApp e precisam ligar clique, conversa e venda numa unica leitura.',
      owner: getManifestPage(vendasManifestId)?.owner || 'Marketing + produto',
      lastUpdate: landingPagesManifest.lastUpdated,
      nextStep: 'Sincronizar a URL canonica quando houver deploy externo e remover a view legada quando o workspace nao depender mais do atalho /lp/home.',
      primaryCta: 'Testar gratis agora',
      checklist: [
        'Manifesto central registrado em workspace/marketing/lps.manifest.json',
        'Preview standalone publicado em /vendas-whatsapp/',
        'Deliverable estatico gerado para handoff',
        'Atalho legado /lp/home redirecionando para a superficie standalone',
      ],
      completionPercent: 80,
    },
    versions: [
      {
        id: 'lp-vendas-whatsapp-v0-1',
        label: 'v0.1',
        status: 'canary',
        statusLabel: 'Preview',
        summary: 'Primeiro corte standalone da LP principal de categoria, com assets copiados e links externos centralizados no manifesto.',
        branch: __GIT_BRANCH__,
        lastUpdate: landingPagesManifest.lastUpdated,
        focus: 'Validar navegacao independente, pacote de handoff e substituicao do acoplamento com rotas internas da Plataforma.',
        notes: [
          'A marca no topo agora volta para #top dentro da propria LP.',
          'Cadastro, login e links legais passaram a ser lidos do manifesto central.',
          'O atalho /lp/home agora redireciona para a superficie standalone.',
        ],
        metrics: [
          { label: 'Manifesto', value: '1', helper: 'entrada centralizada no catalogo de marketing' },
          { label: 'Handoff', value: 'OK', helper: 'preview e pacote estatico gerados' },
          { label: 'Atalho legado', value: '/lp/home', helper: 'redireciona para a superficie standalone' },
        ],
        links: [
          vendasPreviewLink,
          vendasCanonicalLink,
          vendasLegacyLink,
        ],
      },
    ],
    destinations: [
      { ...vendasPreviewLink, helper: 'Destino final para validacao e handoff' },
      vendasCanonicalLink,
      vendasLegacyLink,
      { label: 'Abrir CTA principal', to: resolveManifestLink(vendasManifestId, 'primaryCta', '/cadastro'), kind: 'external', helper: 'Fluxo externo de trial usado pela LP' },
    ],
  },
  {
    id: 'lp-agencias',
    manifestId: agenciasManifestId,
    name: 'LP Agencias de Performance',
    version: 'v0.1',
    status: 'active',
    statusLabel: 'Preview ativo',
    summary: getManifestPage(agenciasManifestId)?.description || 'Landing page de aquisicao para agencias e gestores de trafego que precisam provar receita e atribuicao em vendas por WhatsApp.',
    focus: 'Une narrativa de atribuicao, prova de receita, deck comercial e blueprint editorial numa superficie pronta para campanha e handoff.',
    stage: 'Manifesto central, preview standalone e deliverable estatico ativos.',
    completed: 4,
    total: 5,
    icon: 'ads_click',
    tone: 'primary',
    audiences: ['Donos de agencia', 'Gestores de trafego', 'Operacoes que vendem via WhatsApp'],
    channels: ['Google Ads', 'Meta Ads', 'Outbound consultivo', 'Instagram organico'],
    outcomes: ['Preview multipage desacoplado da Plataforma', 'URL canonica registrada no manifesto central', 'Deck comercial e docs ligados para apoio operacional'],
    context: {
      icp: 'Agencias de performance, growth e trafego pago com vendas via WhatsApp.',
      owner: getManifestPage(agenciasManifestId)?.owner || 'Marketing + produto',
      lastUpdate: landingPagesManifest.lastUpdated,
      nextStep: 'Validar o deploy externo da URL canonica e remover a view legada quando o workspace nao depender mais do atalho /lp/agencias.',
      primaryCta: 'Agende uma demo diagnostica',
      checklist: [
        'Manifesto central registrado em workspace/marketing/lps.manifest.json',
        'Preview standalone publicado em /para-agencias/',
        'Deliverable estatico gerado para handoff',
        'Atalho legado /lp/agencias redirecionando para a superficie standalone',
      ],
      completionPercent: 80,
    },
    versions: [
      {
        id: 'lp-agencias-v0-1',
        label: 'v0.1',
        status: 'canary',
        statusLabel: 'Preview',
        summary: 'Primeira versao desacoplada da Plataforma, publicada em app standalone com build multipage e deliverable estatico.',
        branch: __GIT_BRANCH__,
        lastUpdate: landingPagesManifest.lastUpdated,
        focus: 'Navegacao de campanha, CTA externo e handoff de publicacao alinhados ao manifesto central.',
        experimentId: 'PROTO-003',
        notes: [
          'A superficie agora vive em app standalone separado da Plataforma.',
          'Deck comercial e blueprint editorial continuam ligados como apoio operacional.',
          'A URL canonica e o preview agora saem do manifesto central.',
          'O atalho /lp/agencias da Plataforma agora redireciona para a superficie standalone.',
        ],
        metrics: [
          { label: 'Manifesto', value: '1', helper: 'entrada centralizada no catalogo de marketing' },
          { label: 'Docs', value: '2', helper: 'deck comercial + blueprint ligados' },
          { label: 'Handoff', value: 'OK', helper: 'preview e pacote estatico gerados' },
          { label: 'Atalho legado', value: '/lp/agencias', helper: 'redireciona para a superficie standalone' },
        ],
        links: [
          agenciasPreviewLink,
          agenciasCanonicalLink,
          agenciasLegacyLink,
          { label: 'Abrir deck comercial', to: '/deck/agencias', kind: 'app', helper: 'One-pager de apoio' },
          { label: 'Ler blueprint da oferta', to: 'wiki/marketing/oferta-para-agencias', kind: 'docs', helper: 'Fonte editorial da LP' },
        ],
      },
    ],
    destinations: [
      { ...agenciasPreviewLink, helper: 'Destino final para validacao e handoff' },
      agenciasCanonicalLink,
      agenciasLegacyLink,
      { label: 'Abrir deck comercial', to: '/deck/agencias', kind: 'app', helper: 'Apoio de vendas consultivas' },
      { label: 'Ler blueprint', to: 'wiki/marketing/oferta-para-agencias', kind: 'docs', helper: 'Oferta e copy-base' },
    ],
  },
]

export const mockLandingCatalogQuickAccess: LandingCatalogQuickAccess[] = [
  {
    to: vendasPreviewLink.to,
    title: 'LP Vendas no WhatsApp',
    description: 'Abra o preview standalone da LP principal de categoria ja separada da Plataforma.',
    area: 'Preview standalone',
    icon: 'open_in_new',
    tone: 'emerald',
    cta: 'Abrir preview',
    kind: 'external',
  },
  {
    to: agenciasPreviewLink.to,
    title: 'LP Agencias',
    description: 'Abra o preview standalone da LP de aquisicao para agencias de performance.',
    area: 'Preview standalone',
    icon: 'open_in_new',
    tone: 'primary',
    cta: 'Abrir preview',
    kind: 'external',
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
  { value: '2', label: 'LPs Catalogadas', helper: 'Superficies ligadas ao manifesto central' },
  { value: '2', label: 'Superficies Ativas', helper: 'Entradas prontas para preview e handoff' },
  { value: '9', label: 'Destinos Ligados', helper: 'Previews, URLs externas e docs validos' },
  { value: '7', label: 'Canais Mapeados', helper: 'Aquisicao e operacao por superficie' },
]