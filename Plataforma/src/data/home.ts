export type HomeTone = 'primary' | 'cyan' | 'emerald' | 'amber' | 'rose' | 'violet'
export type HomeIconKey =
  | 'bookMarked'
  | 'briefcaseBusiness'
  | 'calendarDays'
  | 'compass'
  | 'network'
  | 'shieldCheck'
  | 'userCog'

export interface HomeJourney {
  name: string
  summary: string
  focus: string
  stage: string
  completed: number
  total: number
  iconKey: HomeIconKey
  tone: HomeTone
  outcomes: string[]
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
  cta: string
}

export interface HomeStat {
  value: string
  total: string
  label: string
  helper: string
}

export const mockHomeJourneys: HomeJourney[] = [
  {
    name: 'Descoberta e mapeamento',
    summary: 'Organiza a arquitetura atual do produto, identifica entradas criticas e consolida onde cada fluxo realmente acontece.',
    focus: 'Usa Rotas como mapa principal para leitura do produto antes de detalhar operacao ou governanca.',
    stage: 'Mapa base consolidado',
    completed: 4,
    total: 5,
    iconKey: 'network',
    tone: 'primary',
    outcomes: ['Rotas prioritarias visiveis', 'Sitemap navegavel', 'Escopo atual reconhecido'],
    destinations: [
      { label: 'Abrir Rotas', to: '/rotas' },
      { label: 'Ler estrutura', to: '/rotas' },
    ],
  },
  {
    name: 'Entrada e qualificacao',
    summary: 'Conecta a leitura das entradas do produto com a triagem inicial do que pode virar oportunidade operacional.',
    focus: 'Cruza pontos de entrada mapeados em Rotas com a necessidade de priorizacao e passagem para o quadro comercial.',
    stage: 'Passagem para operacao definida',
    completed: 3,
    total: 4,
    iconKey: 'compass',
    tone: 'cyan',
    outcomes: ['Entradas priorizadas', 'Fluxos de passagem definidos', 'Responsaveis por leitura inicial'],
    destinations: [
      { label: 'Mapear entradas', to: '/rotas' },
      { label: 'Abrir Kanban', to: '/kanban' },
    ],
  },
  {
    name: 'Conducao de oportunidades',
    summary: 'Transforma sinais e oportunidades em acompanhamento continuo, com leitura por etapa e valor em aberto.',
    focus: 'Kanban concentra a conducao operacional para revisar densidade por etapa, contextos e proximos movimentos.',
    stage: 'Quadro operacional em uso',
    completed: 5,
    total: 6,
    iconKey: 'briefcaseBusiness',
    tone: 'emerald',
    outcomes: ['Etapas visiveis', 'Valor aberto destacado', 'Leitura por origem preservada'],
    destinations: [
      { label: 'Ir para Kanban', to: '/kanban' },
      { label: 'Consultar Rotas', to: '/rotas' },
    ],
  },
  {
    name: 'Governanca e alinhamento',
    summary: 'Documenta acordos, hipoteses e pontos abertos para que o prototipo evolua sem perder contexto entre iteracoes.',
    focus: 'Wiki funciona como camada de alinhamento entre produto, operacao e refinamento das proximas jornadas.',
    stage: 'Base de referencia preparada',
    completed: 3,
    total: 5,
    iconKey: 'bookMarked',
    tone: 'violet',
    outcomes: ['Decisoes registradas', 'Checklist de revisao', 'Pontos abertos destacados'],
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
    cta: 'Abrir Rotas',
  },
  {
    to: '/kanban',
    title: 'Kanban operacional',
    description: 'Entre direto no quadro para acompanhar etapas, valor em aberto e distribuicao das oportunidades.',
    area: 'Operacao comercial',
    iconKey: 'briefcaseBusiness',
    cta: 'Abrir Kanban',
  },
  {
    to: '/wiki',
    title: 'Wiki do prototipo',
    description: 'Consulte acordos, checklist de revisao e referencias que sustentam as proximas iteracoes.',
    area: 'Governanca',
    iconKey: 'bookMarked',
    cta: 'Abrir Wiki',
  },
  {
    to: '/#journeys',
    title: 'Mapa das jornadas',
    description: 'Volte para a leitura consolidada das frentes ponta a ponta e revise o estagio de cada uma.',
    area: 'Orientacao da Home',
    iconKey: 'network',
    cta: 'Ver jornadas',
  },
]

export const mockHomeStats: HomeStat[] = [
  { value: '4', total: '', label: 'Jornadas Ativas', helper: 'Fluxos ponta a ponta priorizados' },
  { value: '17', total: '', label: 'Entregaveis Mapeados', helper: 'Sinais, etapas e referencias por jornada' },
  { value: '3', total: '', label: 'Superficies Ativas', helper: 'Rotas, Kanban e Wiki como apoio operacional' },
  { value: '4', total: '', label: 'Atalhos Prontos', helper: 'Entradas diretas para leitura e execucao' },
]