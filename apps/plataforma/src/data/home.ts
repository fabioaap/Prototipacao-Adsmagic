export type HomeTone = 'primary' | 'cyan' | 'emerald' | 'amber' | 'rose' | 'violet'
export type HomeJourneyStatus = 'active' | 'planned'
export type HomeIconKey =
  | 'bookMarked'
  | 'briefcaseBusiness'
  | 'calendarDays'
  | 'compass'
  | 'network'
  | 'shieldCheck'
  | 'userCog'

export interface HomeJourneyContext {
  jtbd: string
  owner: string
  lastUpdate: string
  nextStep: string
  checklist: string[]
  completionPercent?: number
}

export interface HomeJourneyExperience {
  target: string
  targetType: 'internal' | 'external'
  embedMode?: 'iframe' | 'external-only'
  openInNewTabLabel: string
  intro: string
  perspective: string
  screens: Array<{
    id: string
    title: string
    route: string
    surface: string
    summary: string
    highlights: string[]
  }>
  metrics: Array<{
    label: string
    value: string
    helper: string
  }>
}

export interface HomeJourney {
  id: string
  name: string
  version?: string
  status: HomeJourneyStatus
  statusLabel: string
  summary: string
  focus: string
  stage: string
  completed: number
  total: number
  iconKey: HomeIconKey
  tone: HomeTone
  outcomes: string[]
  context: HomeJourneyContext
  experience?: HomeJourneyExperience
  destinations: Array<{
    label: string
    to: string
  }>
}

export interface HomeQuickAccess {
  to: string
  title: string
  description: string
  area: string
  iconKey: HomeIconKey
  tone: HomeTone
  cta: string
}

export interface HomeStat {
  value: string
  total: string
  label: string
  helper: string
}

const AIOX_EMBED_BASE_URL = 'http://127.0.0.1:5181'
const GITHUB_ISSUES_URL = 'https://github.com/fabioaap/Prototipacao-Adsmagic/issues'

function createAioxJourneyTarget(path: string) {
  const separator = path.includes('?') ? '&' : '?'
  return `${AIOX_EMBED_BASE_URL}${path}${separator}workspaceEmbed=1`
}

export const mockHomeJourneys: HomeJourney[] = [
  {
    id: 'descoberta-mapeamento',
    name: 'Descoberta e mapeamento',
    version: 'v1.4',
    status: 'active',
    statusLabel: 'Ativo',
    summary: 'Organiza a arquitetura atual do produto, identifica entradas criticas e consolida onde cada fluxo realmente acontece.',
    focus: 'Usa Rotas como mapa principal para leitura do produto antes de detalhar operacao ou governanca.',
    stage: 'Mapa base consolidado',
    completed: 4,
    total: 5,
    iconKey: 'network',
    tone: 'primary',
    outcomes: ['Rotas prioritarias visiveis', 'Sitemap navegavel', 'Escopo atual reconhecido'],
    context: {
      jtbd: 'Entender a arquitetura real do produto e onde cada fluxo acontece antes de propor mudancas.',
      owner: 'Produto e operacao',
      lastUpdate: '2026-03-25',
      nextStep: 'Detalhar as rotas criticas e mapear dependencias entre fluxos.',
      checklist: ['Rotas auditadas', 'Sitemap consolidado', 'Escopo AS-IS documentado'],
      completionPercent: 80,
    },
    experience: {
      target: createAioxJourneyTarget('/pt/projects/2/tracking'),
      targetType: 'external',
      openInNewTabLabel: 'Abrir jornada completa',
      intro: 'A jornada de descoberta mapeia a estrutura real do produto para fundamentar decisoes de prototipacao.',
      perspective: 'O iframe mostra o mapa de rotas do AIOX para leitura estrutural do produto.',
      screens: [
        {
          id: 'mapa-rotas',
          title: 'Mapa de rotas',
          route: '/rotas',
          surface: 'Rotas',
          summary: 'Estrutura real do produto com entradas, grupos e caminhos criticos.',
          highlights: ['Entradas criticas', 'Grupos de fluxo', 'Caminhos priorizados'],
        },
        {
          id: 'integracoes-base',
          title: 'Integracoes base',
          route: '/integrations',
          surface: 'Integracoes',
          summary: 'Canais e conexoes que sustentam a leitura do mapa.',
          highlights: ['Canais conectados', 'Tag verificada', 'Status por plataforma'],
        },
      ],
      metrics: [
        { label: 'Rotas', value: '4', helper: 'rotas prioritarias mapeadas' },
        { label: 'Prontidao', value: '80%', helper: 'mapa consolidado' },
        { label: 'Foco', value: 'AS-IS', helper: 'leitura antes de prototipar' },
      ],
    },
    destinations: [
      { label: 'Abrir Rotas', to: '/rotas' },
      { label: 'Ler estrutura', to: '/rotas' },
    ],
  },
  {
    id: 'entrada-qualificacao',
    name: 'Entrada e qualificacao',
    version: 'v1.2',
    status: 'active',
    statusLabel: 'Ativo',
    summary: 'Conecta a leitura das entradas do produto com a triagem inicial do que pode virar oportunidade operacional.',
    focus: 'Cruza pontos de entrada mapeados em Rotas com a necessidade de priorizacao e abertura de issues quando algo vira trabalho real.',
    stage: 'Critérios de triagem definidos',
    completed: 3,
    total: 4,
    iconKey: 'compass',
    tone: 'cyan',
    outcomes: ['Entradas priorizadas', 'Fluxos de passagem definidos', 'Responsaveis por leitura inicial'],
    context: {
      jtbd: 'Qualificar entradas e transformar sinais relevantes em trabalho rastreavel.',
      owner: 'CRM e operacao',
      lastUpdate: '2026-03-25',
      nextStep: 'Conectar filtros avancados com criterios de abertura e priorizacao em issues.',
      checklist: ['Entradas priorizadas', 'Fluxos de passagem definidos', 'Filtros aplicados'],
      completionPercent: 75,
    },
    experience: {
      target: createAioxJourneyTarget('/pt/projects/2/contacts'),
      targetType: 'external',
      openInNewTabLabel: 'Abrir jornada completa',
      intro: 'A jornada de entrada e qualificacao mostra como leads sao triados e direcionados no workspace.',
      perspective: 'O iframe exibe o CRM do AIOX com a visao de contatos e qualificacao.',
      screens: [
        {
          id: 'crm-contatos',
          title: 'CRM de contatos',
          route: '/contacts',
          surface: 'Contatos',
          summary: 'Base de leads com filtros, origem e status.',
          highlights: ['Filtros ativos', 'Origem rastreada', 'Status por etapa'],
        },
        {
          id: 'issues-passagem',
          title: 'Abertura de issue',
          route: '/kanban',
          surface: 'Issues',
          summary: 'Ponto em que sinais qualificados viram itens rastreaveis no backlog do GitHub.',
          highlights: ['Template de issue', 'Prioridade definida', 'Responsavel atribuido'],
        },
      ],
      metrics: [
        { label: 'Etapas', value: '2', helper: 'entrada e passagem' },
        { label: 'Estado', value: '75%', helper: 'qualificacao mapeada' },
        { label: 'Foco', value: 'CRM', helper: 'triagem e direcionamento' },
      ],
    },
    destinations: [
      { label: 'Mapear entradas', to: '/rotas' },
      { label: 'Abrir Issues', to: '/kanban' },
    ],
  },
  {
    id: 'conducao-oportunidades',
    name: 'Backlog e priorizacao',
    version: 'v2.1',
    status: 'active',
    statusLabel: 'Ativo',
    summary: 'Transforma sinais e demandas em acompanhamento continuo no backlog central, sem duplicar a camada operacional dentro do workspace.',
    focus: 'GitHub Issues concentra triagem, priorizacao e acompanhamento do que realmente entra em execucao.',
    stage: 'Backlog central definido',
    completed: 5,
    total: 6,
    iconKey: 'briefcaseBusiness',
    tone: 'emerald',
    outcomes: ['Prioridades visiveis', 'Issues rastreaveis', 'Proximos movimentos alinhados'],
    context: {
      jtbd: 'Centralizar demandas operacionais em issues rastreaveis e reduzir superficies paralelas.',
      owner: 'Produto e operacao',
      lastUpdate: '2026-03-25',
      nextStep: 'Conectar templates de issue e criterios de prioridade com a wiki e o BrandOS.',
      checklist: ['Backlog central definido', 'Criterios de prioridade claros', 'Owners visiveis'],
      completionPercent: 83,
    },
    experience: {
      target: GITHUB_ISSUES_URL,
      targetType: 'external',
      embedMode: 'external-only',
      openInNewTabLabel: 'Abrir backlog no GitHub',
      intro: 'A jornada de backlog mostra como o repositório concentra priorizacao e andamento do trabalho sem espelhar isso em um quadro paralelo.',
      perspective: 'O drawer abre a fila de issues do repositório como backlog central de acompanhamento.',
      screens: [
        {
          id: 'backlog-issues',
          title: 'Backlog no GitHub',
          route: '/kanban',
          surface: 'Issues',
          summary: 'Fila central de trabalho com rastreabilidade, prioridade e historico de decisao.',
          highlights: ['Backlog unico', 'Historico rastreavel', 'Sem duplicacao de quadro'],
        },
        {
          id: 'brandos-operacional',
          title: 'BrandOS operacional',
          route: '/styleguide',
          surface: 'BrandOS',
          summary: 'Assets, componentes e referencias que sustentam a execucao das entregas priorizadas.',
          highlights: ['Templates ativos', 'Assets centralizados', 'Biblioteca operacional'],
        },
      ],
      metrics: [
        { label: 'Blocos', value: '2', helper: 'issues e BrandOS' },
        { label: 'Estado', value: '83%', helper: 'backlog central adotado' },
        { label: 'Recorte', value: 'Execucao', helper: 'prioridade e ativos' },
      ],
    },
    destinations: [
      { label: 'Abrir Issues', to: '/kanban' },
      { label: 'Abrir BrandOS', to: '/styleguide' },
    ],
  },
  {
    id: 'governanca-alinhamento',
    name: 'Governanca e alinhamento',
    version: 'v1.0',
    status: 'active',
    statusLabel: 'Ativo',
    summary: 'Documenta acordos, hipoteses e pontos abertos para que o prototipo evolua sem perder contexto entre iteracoes.',
    focus: 'Wiki funciona como camada de alinhamento entre produto, operacao e refinamento das proximas jornadas.',
    stage: 'Base de referencia preparada',
    completed: 3,
    total: 5,
    iconKey: 'bookMarked',
    tone: 'violet',
    outcomes: ['Decisoes registradas', 'Checklist de revisao', 'Pontos abertos destacados'],
    context: {
      jtbd: 'Manter alinhamento e governanca para que o prototipo evolua com contexto.',
      owner: 'Produto e estrategia',
      lastUpdate: '2026-03-25',
      nextStep: 'Definir metricas de governanca e conectar com dashboard analitico.',
      checklist: ['KPIs levantados', 'Acordos registrados', 'Plano do proximo prototipo'],
      completionPercent: 60,
    },
    experience: {
      target: createAioxJourneyTarget('/pt/projects/2/dashboard-v2'),
      targetType: 'external',
      openInNewTabLabel: 'Abrir jornada completa',
      intro: 'A jornada de governanca conecta dashboard e documentacao viva para sustentar decisoes do time.',
      perspective: 'O iframe abre a visao executiva do AIOX com indicadores e proximos passos.',
      screens: [
        {
          id: 'visao-executiva',
          title: 'Visao geral executiva',
          route: '/rotas',
          surface: 'Dashboard',
          summary: 'Leitura executiva do projeto com filtros e proximos passos.',
          highlights: ['Resumo do projeto', 'Filtros de periodo', 'Proximos passos'],
        },
        {
          id: 'wiki-governanca',
          title: 'Wiki de governanca',
          route: '/wiki',
          surface: 'Wiki',
          summary: 'Acordos, hipoteses e referencias para as proximas iteracoes.',
          highlights: ['Acordos operacionais', 'Pontos abertos', 'Direcao TO-BE'],
        },
      ],
      metrics: [
        { label: 'Superficies', value: '2', helper: 'dashboard e wiki' },
        { label: 'Estado', value: '60%', helper: 'governanca em construcao' },
        { label: 'Recorte', value: 'Executivo', helper: 'performance e decisao' },
      ],
    },
    destinations: [
      { label: 'Abrir Wiki', to: '/wiki' },
      { label: 'Revisar jornadas', to: '/#journeys' },
    ],
  },
]

export const mockHomeQuickAccess: HomeQuickAccess[] = [
  {
    to: '/rotas',
    title: 'Mapa de Rotas',
    description: 'Use a estrutura importada da producao para localizar entradas, grupos e caminhos criticos do produto.',
    area: 'Leitura estrutural',
    iconKey: 'compass',
    tone: 'primary',
    cta: 'Abrir Rotas',
  },
  {
    to: '/styleguide',
    title: 'BrandOS',
    description: 'Acesse o hub de assets, templates, componentes e referencias operacionais da marca em uma unica navegacao.',
    area: 'Sistema de marca',
    iconKey: 'network',
    tone: 'primary',
    cta: 'Abrir BrandOS',
  },
  {
    to: '/wiki',
    title: 'Wiki do prototipo',
    description: 'Consulte acordos, checklist de revisao e referencias que sustentam as proximas iteracoes.',
    area: 'Governanca',
    iconKey: 'bookMarked',
    tone: 'violet',
    cta: 'Abrir Wiki',
  },
  {
    to: '/#journeys',
    title: 'Mapa das jornadas',
    description: 'Volte para a leitura consolidada das frentes ponta a ponta e revise o estagio de cada uma.',
    area: 'Orientacao da Home',
    iconKey: 'network',
    tone: 'cyan',
    cta: 'Ver jornadas',
  },
]

export const mockHomeStats: HomeStat[] = [
  { value: '4', total: '', label: 'Jornadas Ativas', helper: 'Fluxos ponta a ponta priorizados' },
  { value: '17', total: '', label: 'Entregaveis Mapeados', helper: 'Sinais, etapas e referencias por jornada' },
  { value: '3', total: '', label: 'Superficies Ativas', helper: 'Rotas, Wiki e BrandOS como apoio operacional' },
  { value: '4', total: '', label: 'Atalhos Prontos', helper: 'Entradas diretas para leitura e execucao' },
]