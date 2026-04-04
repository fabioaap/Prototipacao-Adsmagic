// ── Experiments Data — PROTO-006 ─────────────────────────────────────────────

export type ExperimentStage =
  | 'backlog'
  | 'planned'
  | 'prototyping'
  | 'review'
  | 'canary'
  | 'done'
  | 'archived'

export type ExperimentPriority = 'critical' | 'high' | 'medium' | 'low'
export type ExperimentHorizon = 'now' | 'next' | 'later'

export interface ExperimentStageConfig {
  id: ExperimentStage
  label: string
  emoji: string
  color: string
  order: number
}

export interface Experiment {
  id: string
  title: string
  hypothesis: string
  branch: string
  owner: string
  priority: ExperimentPriority
  stage: ExperimentStage
  horizon: ExperimentHorizon
  createdAt: string
  updatedAt: string
  result?: string
  attachments?: string[]
  issues?: string[]
  specPath?: string
}

// ── Stage configuration ───────────────────────────────────────────────────────

export const experimentStages: ExperimentStageConfig[] = [
  { id: 'backlog',     label: 'Backlog',           emoji: '📥', color: '#6b7280', order: 1 },
  { id: 'planned',     label: 'Planejado',          emoji: '🎯', color: '#8b5cf6', order: 2 },
  { id: 'prototyping', label: 'Em prototipação',    emoji: '🔬', color: '#f59e0b', order: 3 },
  { id: 'review',      label: 'Em revisão',         emoji: '🔍', color: '#3b82f6', order: 4 },
  { id: 'canary',      label: 'Canary',             emoji: '🚀', color: '#22c55e', order: 5 },
  { id: 'done',        label: 'Concluído',          emoji: '✅', color: '#10b981', order: 6 },
  { id: 'archived',    label: 'Arquivado',          emoji: '🗄️', color: '#374151', order: 7 },
]

export const priorityConfig: Record<ExperimentPriority, { label: string; color: string; dot: string }> = {
  critical: { label: 'Crítico',  color: '#ef4444', dot: 'bg-red-500' },
  high:     { label: 'Alta',     color: '#f97316', dot: 'bg-orange-500' },
  medium:   { label: 'Média',    color: '#eab308', dot: 'bg-yellow-500' },
  low:      { label: 'Baixa',    color: '#6b7280', dot: 'bg-slate-500' },
}

// ── Mock data — 8 experiments across all stages ───────────────────────────────

export const mockExperiments: Experiment[] = [
  {
    id: 'PROTO-001',
    title: 'Home — Dashboard de Jornadas',
    hypothesis: 'Um hub central com progresso por jornada aumenta o tempo de sessão e reduz o tempo para acessar a feature mais relevante para cada perfil.',
    branch: 'prototypes/feature/home-journeys',
    owner: '@ux + @dev',
    priority: 'high',
    stage: 'done',
    horizon: 'now',
    createdAt: '2026-01-10',
    updatedAt: '2026-03-20',
    result: 'Validado. Home adotada como padrão. Drawer de jornada aumentou abertura de módulos em 2.4×.',
    specPath: 'docs/stories/story-contacts.md',
    attachments: ['Figma — Home v3', 'Loom — demo final'],
    issues: [],
  },
  {
    id: 'PROTO-003',
    title: 'Landing Page — Agências',
    hypothesis: 'Uma LP de conversão focada em agências com prova social e CTA de cadastro aumenta a taxa de ativação em 20% comparado à página genérica.',
    branch: 'prototypes/feature/lp-agencias',
    owner: '@ux + @dev',
    priority: 'critical',
    stage: 'done',
    horizon: 'now',
    createdAt: '2026-02-01',
    updatedAt: '2026-03-28',
    result: 'Validado. CTR para cadastro: +34%. Tempo na página: +1m12s vs. anterior.',
    attachments: ['Hotjar recording', 'A/B test results'],
    issues: [],
  },
  {
    id: 'PROTO-006',
    title: 'Kanban de Experimentos',
    hypothesis: 'Um quadro linear de specs de protótipos aumenta a clareza sobre o que está sendo prototipado, o que está parado e o que foi aprendido.',
    branch: 'prototypes/feature/kanban-experimentos',
    owner: '@ux + @dev',
    priority: 'high',
    stage: 'prototyping',
    horizon: 'now',
    createdAt: '2026-03-15',
    updatedAt: '2026-03-31',
    specPath: 'docs/stories/PROTO-006.md',
    attachments: ['Linear — referência visual'],
    issues: ['Drag-and-drop: definir biblioteca (vue-draggable vs. nativa HTML5)'],
  },
  {
    id: 'PROTO-004',
    title: 'Onboarding Interativo — Primeiro acesso',
    hypothesis: 'Um fluxo de onboarding guiado com checkpoints reduz o time-to-first-value de 4 dias para menos de 10 minutos.',
    branch: 'prototypes/feature/onboarding',
    owner: '@ux',
    priority: 'critical',
    stage: 'review',
    horizon: 'now',
    createdAt: '2026-02-18',
    updatedAt: '2026-03-29',
    specPath: 'docs/stories/story-settings.md',
    attachments: ['Figma — fluxo onboarding v2'],
    issues: ['PR aberto — aguardando revisão @product'],
  },
  {
    id: 'PROTO-005',
    title: 'Contacts — Busca e Segmentação Avançada',
    hypothesis: 'Filtros dinâmicos e busca full-text na lista de contatos reduzem o tempo de localização de um lead de 45s para menos de 5s.',
    branch: 'prototypes/feature/contacts-search',
    owner: '@dev',
    priority: 'medium',
    stage: 'planned',
    horizon: 'next',
    createdAt: '2026-03-01',
    updatedAt: '2026-03-25',
    specPath: 'docs/stories/story-contacts.md',
    attachments: [],
    issues: ['Definir modelo de dados para tags de segmento'],
  },
  {
    id: 'PROTO-007',
    title: 'Wiki Assistant — IA contextual',
    hypothesis: 'Um assistente embutido na wiki transforma leitores passivos em revisores ativos sem exigir conhecimento de Markdown.',
    branch: 'prototypes/feature/wiki-assistant',
    owner: '@architect + @ux + @dev',
    priority: 'medium',
    stage: 'backlog',
    horizon: 'next',
    createdAt: '2026-03-10',
    updatedAt: '2026-03-10',
    specPath: 'docs/stories/PROTO-007.md',
    attachments: ['Referência: Gemini no Google Docs'],
    issues: ['Bloqueia PROTO-008 (LLM Settings)'],
  },
  {
    id: 'PROTO-008',
    title: 'Settings — Configuração de LLM',
    hypothesis: 'Centralizar a configuração de LLM no Settings reduz a fricção para ativar features de IA e dá controle claro ao usuário.',
    branch: 'prototypes/feature/llm-settings',
    owner: '@dev + @architect',
    priority: 'medium',
    stage: 'backlog',
    horizon: 'next',
    createdAt: '2026-03-12',
    updatedAt: '2026-03-12',
    specPath: 'docs/stories/PROTO-008.md',
    attachments: ['Referência: GitHub Copilot Settings'],
    issues: ['Bloqueado por PROTO-007'],
  },
  {
    id: 'GROWTH-001',
    title: 'MCP Meta Ads — @growth-engineer operando em campanhas',
    hypothesis: 'Conectar o agente @growth-engineer à Graph API do Meta via MCP permite analisar performance de campanhas, gerar variações de copy e fechar ciclos de experimento sem abrir o Ads Manager.',
    branch: 'prototypes/feature/mcp-meta-ads',
    owner: '@devops + @growth-engineer',
    priority: 'high',
    stage: 'backlog',
    horizon: 'next',
    createdAt: '2026-04-01',
    updatedAt: '2026-04-01',
    issues: [
      'Obter META_APP_ID e META_APP_SECRET (Kennedy)',
      'Gerar long-lived token no Graph API Explorer',
      'Instalar facebook-ads-mcp-server no Claude Desktop',
      'Validar: "Liste minhas contas de anúncios"',
    ],
    attachments: ['npm: facebook-ads-mcp-server v2.1.3'],
  },
  {
    id: 'GROWTH-002',
    title: 'Log de experimentos persistente — @growth-engineer com memória',
    hypothesis: 'Um arquivo YAML de log no squad marketing-gtm permite que o @growth-engineer acumule histórico de hipóteses e resultados entre sessões, evitando repetir experimentos já executados.',
    branch: 'prototypes/feature/experiment-log',
    owner: '@growth-engineer + @dev',
    priority: 'medium',
    stage: 'backlog',
    horizon: 'now',
    createdAt: '2026-04-01',
    updatedAt: '2026-04-01',
    issues: ['Criar squads/marketing-gtm/experiments/log.yaml', 'Criar squads/marketing-gtm/experiments/hypotheses.yaml'],
    attachments: [],
  },
  {
    id: 'PROTO-002',
    title: 'Funil de Conversão — Etapas visuais',
    hypothesis: 'Tornar as etapas do funil visualmente explícitas no kanban de oportunidades aumenta a taxa de avanço entre estágios.',
    branch: 'prototypes/feature/sales-funnel-visual',
    owner: '@ux',
    priority: 'low',
    stage: 'archived',
    horizon: 'later',
    createdAt: '2026-01-20',
    updatedAt: '2026-02-28',
    result: 'Arquivado. Aprendizado: a melhoria de UX no funil de vendas está bloqueada pela ausência de dados reais — não é um problema de interface.',
    attachments: [],
    issues: [],
  },
]
