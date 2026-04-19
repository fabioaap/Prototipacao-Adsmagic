export type DsNodeTone = 'platform' | 'brand' | 'marketing'
export type DsNodeStatus = 'live' | 'beta' | 'planned'

type DsNavSeed = {
  id: string
  title: string
  slug: string
  description: string
  tone: DsNodeTone
  status: DsNodeStatus
  pageId?: string
  children?: DsNavSeed[]
}

export type DsNavNode = DsNavSeed & {
  segments: string[]
  children?: DsNavNode[]
}

const seeds: DsNavSeed[] = [
  {
    id: 'design-system',
    title: 'Design System',
    slug: 'design-system',
    description: 'Código de produto digital, foundations e padrões reutilizáveis.',
    tone: 'platform',
    status: 'beta',
    children: [
      {
        id: 'design-foundations',
        title: 'Foundations',
        slug: 'foundations',
        description: 'Tokens visuais e contratos base do produto.',
        tone: 'platform',
        status: 'live',
        children: [
          {
            id: 'design-foundations-colors',
            title: 'Colors',
            slug: 'colors',
            description: 'Tokens de cor e semântica do produto.',
            tone: 'platform',
            status: 'live',
            pageId: 'platform-tokens-colors',
          },
          {
            id: 'design-foundations-typography',
            title: 'Typography',
            slug: 'typography',
            description: 'Escala tipográfica e papéis de texto.',
            tone: 'platform',
            status: 'beta',
            pageId: 'design-foundations-typography',
          },
          {
            id: 'design-foundations-spacing',
            title: 'Spacing',
            slug: 'spacing',
            description: 'Escala de espaço, control heights e containers.',
            tone: 'platform',
            status: 'live',
            pageId: 'platform-tokens-spacing',
          },
          {
            id: 'design-foundations-radius-shadows',
            title: 'Radius & Shadows',
            slug: 'radius-shadows',
            description: 'Tokens de forma, elevação e profundidade.',
            tone: 'platform',
            status: 'beta',
            pageId: 'design-foundations-radius-shadows',
          },
          {
            id: 'design-foundations-iconography',
            title: 'Iconography',
            slug: 'iconography',
            description: 'Biblioteca de ícones e regras de uso.',
            tone: 'platform',
            status: 'beta',
            pageId: 'design-foundations-iconography',
          },
        ],
      },
      {
        id: 'design-components',
        title: 'Components',
        slug: 'components',
        description: 'Biblioteca funcional do produto, do base UI ao domínio.',
        tone: 'platform',
        status: 'beta',
        children: [
          {
            id: 'design-components-base-ui',
            title: 'Base UI',
            slug: 'base-ui',
            description: 'Button, Badge, Card, Input e primitives básicos.',
            tone: 'platform',
            status: 'beta',
            pageId: 'platform-components-base-ui',
          },
          {
            id: 'design-components-composed-ui',
            title: 'Composed UI',
            slug: 'composed-ui',
            description: 'PageHeader, StatCard, DataTable e blocos compostos.',
            tone: 'platform',
            status: 'beta',
            pageId: 'design-components-composed-ui',
          },
          {
            id: 'design-components-domain',
            title: 'Domain',
            slug: 'domain',
            description: 'Componentes específicos do produto e dos fluxos internos.',
            tone: 'platform',
            status: 'planned',
            pageId: 'design-components-domain',
          },
        ],
      },
      {
        id: 'design-platform-patterns',
        title: 'Platform Patterns',
        slug: 'platform-patterns',
        description: 'Layouts e padrões recorrentes do app.',
        tone: 'platform',
        status: 'beta',
        pageId: 'design-platform-patterns',
      },
      {
        id: 'design-lp-components',
        title: 'LP Components',
        slug: 'lp-components',
        description: 'Seções e blocos das landing pages do ecossistema.',
        tone: 'platform',
        status: 'beta',
        pageId: 'design-lp-components',
      },
    ],
  },
  {
    id: 'brand-system',
    title: 'Brand System',
    slug: 'brand',
    description: 'Ativos de marca, templates e governança criativa.',
    tone: 'brand',
    status: 'live',
    pageId: 'brand-cover',
    children: [
      {
        id: 'brand-strategy',
        title: 'Strategy',
        slug: 'strategy',
        description: 'Propósito, visão, valores e personalidade institucional.',
        tone: 'brand',
        status: 'planned',
        children: [
          {
            id: 'brand-strategy-purpose',
            title: 'Purpose',
            slug: 'purpose',
            description: 'Por que existimos e qual impacto queremos gerar.',
            tone: 'brand',
            status: 'planned',
            pageId: 'brand-strategy-purpose',
          },
          {
            id: 'brand-strategy-vision',
            title: 'Vision',
            slug: 'vision',
            description: 'Onde queremos chegar e como queremos ser percebidos.',
            tone: 'brand',
            status: 'planned',
            pageId: 'brand-strategy-vision',
          },
          {
            id: 'brand-strategy-values',
            title: 'Values',
            slug: 'values',
            description: 'Os princípios que guiam nossas decisões e ações.',
            tone: 'brand',
            status: 'planned',
            pageId: 'brand-strategy-values',
          },
          {
            id: 'brand-strategy-personality',
            title: 'Personality',
            slug: 'personality',
            description: 'Traços de personalidade e comportamento como marca.',
            tone: 'brand',
            status: 'planned',
            pageId: 'brand-strategy-personality',
          },
        ],
      },
      {
        id: 'brand-identity',
        title: 'Identity',
        slug: 'identity',
        description: 'Logo, cor, tipografia e grafismos institucionais.',
        tone: 'brand',
        status: 'live',
        children: [
          {
            id: 'brand-identity-logo',
            title: 'Logo',
            slug: 'logo',
            description: 'Wordmark, variações e zona de proteção.',
            tone: 'brand',
            status: 'live',
            pageId: 'brand-logo',
          },
          {
            id: 'brand-identity-symbol',
            title: 'Symbol',
            slug: 'symbol',
            description: 'Star-mark, tamanhos mínimos e anatomia.',
            tone: 'brand',
            status: 'live',
            pageId: 'brand-symbol',
          },
          {
            id: 'brand-identity-colors',
            title: 'Colors',
            slug: 'colors',
            description: 'Paleta de marca: Navy, Green, Indigo e suportes.',
            tone: 'brand',
            status: 'live',
            pageId: 'brand-foundations-colors',
          },
          {
            id: 'brand-identity-typography',
            title: 'Typography',
            slug: 'typography',
            description: 'Fontes de marca e hierarquia editorial.',
            tone: 'brand',
            status: 'live',
            pageId: 'brand-foundations-typography',
          },
          {
            id: 'brand-identity-grafismos',
            title: 'Grafismos',
            slug: 'grafismos',
            description: 'Barras diagonais, gradientes, glows e acentos.',
            tone: 'brand',
            status: 'live',
            pageId: 'brand-foundations-grafismos',
          },
          {
            id: 'brand-identity-verbal',
            title: 'Verbal Identity',
            slug: 'verbal-identity',
            description: 'Tom de voz, vocabulário e microcopy institucional.',
            tone: 'brand',
            status: 'planned',
            children: [
              {
                id: 'brand-identity-verbal-tone',
                title: 'Tone of Voice',
                slug: 'tone-of-voice',
                description: 'Como falamos com nosso público em diferentes contextos.',
                tone: 'brand',
                status: 'planned',
                pageId: 'brand-identity-verbal-tone',
              },
              {
                id: 'brand-identity-verbal-lexicon',
                title: 'Lexicon',
                slug: 'lexicon',
                description: 'Vocabulário, termos e expressões que definem nossa voz.',
                tone: 'brand',
                status: 'planned',
                pageId: 'brand-identity-verbal-lexicon',
              },
              {
                id: 'brand-identity-verbal-microcopy',
                title: 'Microcopy',
                slug: 'microcopy',
                description: 'Padrões de labels, botões, placeholders e mensagens.',
                tone: 'brand',
                status: 'planned',
                pageId: 'brand-identity-verbal-microcopy',
              },
            ],
          },
          {
            id: 'brand-identity-motion',
            title: 'Motion & Sonic',
            slug: 'motion-sonic',
            description: 'Princípios de movimento, animação e identidade sonora.',
            tone: 'brand',
            status: 'planned',
            children: [
              {
                id: 'brand-identity-motion-principles',
                title: 'Motion Principles',
                slug: 'motion-principles',
                description: 'Easing, duração, direção e transições da marca.',
                tone: 'brand',
                status: 'planned',
                pageId: 'brand-identity-motion-principles',
              },
            ],
          },
        ],
      },
      {
        id: 'brand-visual-language',
        title: 'Visual Language',
        slug: 'visual-language',
        description: 'Fotografia, ilustração e iconografia como linguagem visual.',
        tone: 'brand',
        status: 'beta',
        children: [
          {
            id: 'brand-visual-language-illustrations',
            title: 'Illustrations',
            slug: 'illustrations',
            description: 'Ilustrações proprietárias, cenas e apoio visual.',
            tone: 'brand',
            status: 'planned',
            pageId: 'brand-visual-language-illustrations',
          },
          {
            id: 'brand-visual-language-photography',
            title: 'Photography',
            slug: 'photography',
            description: 'Diretrizes de uso e curadoria fotográfica.',
            tone: 'brand',
            status: 'planned',
            pageId: 'brand-visual-language-photography',
          },
          {
            id: 'brand-visual-language-icons-symbols',
            title: 'Icons & Symbols',
            slug: 'icons-symbols',
            description: 'Brand icons, star-mark e pictogramas.',
            tone: 'brand',
            status: 'beta',
            pageId: 'brand-visual-language-icons-symbols',
          },
        ],
      },
      {
        id: 'brand-templates',
        title: 'Templates',
        slug: 'templates',
        description: 'Famílias de peças para social, mídia paga e apresentação.',
        tone: 'brand',
        status: 'live',
        children: [
          {
            id: 'brand-templates-social-posts',
            title: 'Social Posts',
            slug: 'social-posts',
            description: 'Formatos, grades e variações para conteúdo social.',
            tone: 'brand',
            status: 'live',
            pageId: 'brand-templates-social-posts',
          },
          {
            id: 'brand-templates-display-ads',
            title: 'Display Ads',
            slug: 'display-ads',
            description: 'Banners e formatos de mídia paga.',
            tone: 'brand',
            status: 'beta',
            pageId: 'brand-templates-display-ads',
          },
          {
            id: 'brand-templates-presentation',
            title: 'Presentation',
            slug: 'presentation',
            description: 'Deck comercial, one-pager e materiais executivos.',
            tone: 'brand',
            status: 'beta',
            pageId: 'brand-templates-decks',
          },
          {
            id: 'brand-templates-cards',
            title: 'Cards',
            slug: 'cards',
            description: 'Cards de impacto, métricas e bento grids.',
            tone: 'brand',
            status: 'live',
            pageId: 'brand-cards',
          },
          {
            id: 'brand-templates-patterns',
            title: 'Patterns',
            slug: 'patterns',
            description: 'Padrões de uso para Ads, Email, Website e Print.',
            tone: 'brand',
            status: 'live',
            pageId: 'brand-patterns',
          },
          {
            id: 'brand-templates-primitives',
            title: 'Primitives',
            slug: 'primitives',
            description: 'Blocos construtivos do sistema criativo.',
            tone: 'brand',
            status: 'live',
            pageId: 'brand-creative-primitives',
          },
          {
            id: 'brand-templates-creatives',
            title: 'Campaign Creatives',
            slug: 'campaign-creatives',
            description: 'Peças de campanha e famílias editoriais.',
            tone: 'brand',
            status: 'live',
            pageId: 'brand-creative-campaign',
          },
          {
            id: 'brand-templates-instagram-carousels',
            title: 'Instagram Carousels',
            slug: 'instagram-carousels',
            description: 'Série StoryBrand SB7 — 7 carrosséis de atribuição real.',
            tone: 'brand',
            status: 'live',
            pageId: 'brand-instagram-carousels',
          },
          {
            id: 'brand-templates-carousel-post1',
            title: 'Carrossel · Post 1',
            slug: 'carousel-post-1',
            description: 'Post 1 — Quem é o Adsmagic? 10 slides editoriais com assets reais.',
            tone: 'brand',
            status: 'live',
            pageId: 'brand-carousel-post1',
          },
        ],
      },
      {
        id: 'brand-governance',
        title: 'Governance',
        slug: 'governance',
        description: 'Regras de uso da marca, disciplina visual e voz.',
        tone: 'brand',
        status: 'live',
        children: [
          {
            id: 'brand-governance-do-dont',
            title: 'Do & Don\'t',
            slug: 'do-dont',
            description: 'Regras de uso da marca e controles de qualidade.',
            tone: 'brand',
            status: 'live',
            pageId: 'brand-governance-do-dont',
          },
          {
            id: 'brand-governance-voice',
            title: 'Brand Voice',
            slug: 'brand-voice',
            description: 'Tom, linguagem e personalidade verbal.',
            tone: 'brand',
            status: 'beta',
            pageId: 'brand-governance-voice',
          },
          {
            id: 'brand-governance-ecosystem',
            title: 'Ecosystem',
            slug: 'ecosystem',
            description: 'Regras de co-branding, parcerias e uso por terceiros.',
            tone: 'brand',
            status: 'planned',
            children: [
              {
                id: 'brand-governance-ecosystem-cobranding',
                title: 'Co-branding',
                slug: 'co-branding',
                description: 'Regras de convivência de marca, lockups e parcerias.',
                tone: 'brand',
                status: 'planned',
                pageId: 'brand-governance-ecosystem-cobranding',
              },
            ],
          },
        ],
      },
    ],
  },
]

function attachSegments(nodes: DsNavSeed[], parent: string[] = []): DsNavNode[] {
  return nodes.map((node) => {
    const segments = [...parent, node.slug]

    return {
      ...node,
      segments,
      children: node.children ? attachSegments(node.children, segments) : undefined,
    }
  })
}

export const dsNavTree = attachSegments(seeds)

export function normalizeDsSegments(value: string | string[] | undefined) {
  if (!value) return []

  const raw = Array.isArray(value) ? value : [value]
  return raw.flatMap((segment) => segment.split('/')).filter(Boolean)
}

export function getNodeHref(node: DsNavNode) {
  return `/styleguide/${node.segments.join('/')}`
}

export function findNodeBySegments(segments: string[], nodes: DsNavNode[] = dsNavTree): DsNavNode | null {
  for (const node of nodes) {
    const isExactMatch = node.segments.length === segments.length
      && node.segments.every((segment, index) => segment === segments[index])

    if (isExactMatch) return node
    if (!node.children?.length) continue

    const nestedMatch = findNodeBySegments(segments, node.children)
    if (nestedMatch) return nestedMatch
  }

  return null
}

export function findTrailBySegments(
  segments: string[],
  nodes: DsNavNode[] = dsNavTree,
  trail: DsNavNode[] = [],
): DsNavNode[] {
  for (const node of nodes) {
    const isPrefixMatch = node.segments.every((segment, index) => segment === segments[index])
    if (!isPrefixMatch) continue

    const nextTrail = [...trail, node]
    if (node.segments.length === segments.length) return nextTrail
    if (!node.children?.length) continue

    const nestedTrail = findTrailBySegments(segments, node.children, nextTrail)
    if (nestedTrail.length) return nestedTrail
  }

  return []
}

export function findFirstLeaf(node: DsNavNode): DsNavNode {
  if (node.pageId || !node.children?.length) return node
  return findFirstLeaf(node.children[0])
}

export function countLeafPages(node: DsNavNode): number {
  if (node.pageId) return 1
  return (node.children ?? []).reduce((total, child) => total + countLeafPages(child), 0)
}