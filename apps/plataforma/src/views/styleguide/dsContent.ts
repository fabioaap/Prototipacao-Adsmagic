import type { DsNodeTone } from './dsNavTree'
import {
  brandDisplayAdDimensions,
  brandLpResponsiveSpecs,
  brandSocialPostDimensions,
  type CreativeTheme,
} from '@/data/brand-dimensions'

type DsCardItem = {
  eyebrow?: string
  title: string
  body: string
  meta?: string
}

type DsPaletteItem = {
  name: string
  hex: string
  note: string
  dark?: boolean
}

type DsAssetItem = {
  label: string
  src: string
  note: string
  dark?: boolean
}

type DsRatioItem = {
  label: string
  aspect: string
  pixels?: string
  use: string
  theme: CreativeTheme
}

type DsStepItem = {
  title: string
  body: string
}

type DsLinkItem = {
  label: string
  to: string
  note: string
}

export type DsShowcaseItem = {
  label: string
  variant:
    | 'headline-band'
    | 'proof-strip'
    | 'offer-stack'
    | 'quote-block'
    | 'metric-card'
    | 'testimonial-card'
    | 'offer-card'
    | 'split-pattern'
    | 'overlay-pattern'
    | 'stacked-pattern'
    | 'rail-pattern'
    | 'centered-pattern'
    | 'series-pattern'
    | 'ads-revenue'
    | 'ads-anti-cpl'
    | 'ads-funnel'
    | 'lp-hero'
    | 'lp-flow'
    | 'lp-benefits'
    | 'lp-offer'
  headline: string
  supporting: string
  chips?: string[]
}

type DsSection =
  | { type: 'copy'; title: string; body: string[] }
  | { type: 'cards'; title: string; columns?: 1 | 2 | 3; items: DsCardItem[] }
  | { type: 'palette'; title: string; items: DsPaletteItem[] }
  | { type: 'assets'; title: string; items: DsAssetItem[] }
  | { type: 'ratios'; title: string; items: DsRatioItem[] }
  | { type: 'checklist'; title: string; items: string[] }
  | { type: 'steps'; title: string; items: DsStepItem[] }
  | { type: 'links'; title: string; items: DsLinkItem[] }
  | { type: 'showcases'; title: string; columns?: 1 | 2 | 3; items: DsShowcaseItem[] }

export type DsPageContent = {
  pageId: string
  tone: DsNodeTone
  status: 'Live' | 'Beta' | 'Planned'
  eyebrow: string
  title: string
  lead: string
  highlight?: string
  sections: DsSection[]
}

const asset = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`

export const dsPageContent: Record<string, DsPageContent> = {
  'platform-overview': {
    pageId: 'platform-overview',
    tone: 'platform',
    status: 'Beta',
    eyebrow: 'Platform DS',
    title: 'Base do produto e contrato visual da Plataforma',
    lead: 'Esta trilha documenta o sistema funcional da aplicação: tokens globais, ritmos de interface e os componentes base que sustentam o workspace.',
    highlight: 'O Brand System nasce em cima desta fundação, mas tem uma lógica própria voltada para marketing, branding e templates.',
    sections: [
      {
        type: 'cards',
        title: 'O que já existe hoje',
        items: [
          {
            eyebrow: 'Foundation',
            title: 'Tokens globais em style.css',
            body: 'Escalas de spacing, containers, alturas de controles, sombras, radius e cores semânticas já estão publicadas como variáveis globais.',
          },
          {
            eyebrow: 'UI',
            title: 'Badge pronto e infra de CVA ativa',
            body: 'A base para componentes variantes já existe com class-variance-authority, clsx e tailwind-merge.',
          },
          {
            eyebrow: 'Shell',
            title: 'Rota dev-only de styleguide',
            body: 'O styleguide vive em /styleguide e agora passa a concentrar produto, marca e kits de marketing em uma navegação única.',
          },
        ],
      },
      {
        type: 'checklist',
        title: 'Foco desta camada',
        items: [
          'Manter consistência entre tokens do app e templates de marketing.',
          'Servir de fundação para componentes funcionais e patterns do workspace.',
          'Evitar duplicação de decisões visuais entre produto e marketing.',
        ],
      },
    ],
  },
  'platform-tokens-colors': {
    pageId: 'platform-tokens-colors',
    tone: 'platform',
    status: 'Live',
    eyebrow: 'Design Foundations',
    title: 'Colors',
    lead: 'O produto digital trabalha com uma escala primary indigo como eixo principal e uma camada semântica para estados, alertas, superfícies e leitura funcional.',
    sections: [
      {
        type: 'palette',
        title: 'Primary scale',
        items: [
          { name: 'Primary 50', hex: '#eef2ff', note: 'Fundos muito leves, halos e painéis suaves.' },
          { name: 'Primary 100', hex: '#e0e7ff', note: 'Superfícies suaves e faixas de apoio.' },
          { name: 'Primary 300', hex: '#a5b4fc', note: 'Bordas e elementos decorativos leves.' },
          { name: 'Primary 500', hex: '#6366f1', note: 'Cor principal do produto.' },
          { name: 'Primary 700', hex: '#4338ca', note: 'Hover, CTA forte e highlights de ação.', dark: true },
          { name: 'Primary 900', hex: '#312e81', note: 'Camadas profundas, contraste e densidade.', dark: true },
        ],
      },
      {
        type: 'palette',
        title: 'Semantic layer',
        items: [
          { name: 'Success', hex: '#10b981', note: 'Confirmação, crescimento e estados positivos.' },
          { name: 'Warning', hex: '#f59e0b', note: 'Atenção, pendência e risco moderado.' },
          { name: 'Error', hex: '#ef4444', note: 'Falha, bloqueio ou problema crítico.' },
          { name: 'Info', hex: '#3b82f6', note: 'Contexto, ajuda e elementos informativos.' },
        ],
      },
    ],
  },
  'platform-tokens-spacing': {
    pageId: 'platform-tokens-spacing',
    tone: 'platform',
    status: 'Live',
    eyebrow: 'Design Foundations',
    title: 'Spacing',
    lead: 'A escala de espaço do produto resolve ritmo de tela, densidade entre blocos e consistência entre app shell, formulários, tabelas e landing pages codificadas.',
    sections: [
      {
        type: 'cards',
        title: 'Escalas disponíveis',
        items: [
          {
            eyebrow: 'Spacing',
            title: '0 a 24',
            body: 'Tokens de space vão de 0 até 24, cobrindo gaps micro até seções densas de página.',
            meta: 'Exemplos: 4 = 1rem, 8 = 2rem, 16 = 4rem',
          },
          {
            eyebrow: 'Controls',
            title: 'SM, MD e LG',
            body: 'Alturas de controle já padronizadas em 2rem, 2.5rem e 3rem para inputs, filtros e CTAs.',
          },
          {
            eyebrow: 'Containers',
            title: '40rem a 87.5rem',
            body: 'Faixas de largura ajudam a separar módulos mais editoriais, painéis e layouts full-bleed.',
          },
        ],
      },
      {
        type: 'checklist',
        title: 'Regras de uso',
        items: [
          'Reusar tokens existentes antes de inventar escalas paralelas para marketing.',
          'Usar gutter mobile, tablet e desktop como base de composição para LPs.',
          'Manter control heights quando templates precisarem virar componentes reais.',
        ],
      },
    ],
  },
  'platform-components-base-ui': {
    pageId: 'platform-components-base-ui',
    tone: 'platform',
    status: 'Beta',
    eyebrow: 'Design Components',
    title: 'Base UI',
    lead: 'A biblioteca funcional do produto ainda está amadurecendo, mas já existe uma base suficiente para sustentar o shell do app, documentação interna e blocos compartilháveis com as LPs.',
    sections: [
      {
        type: 'cards',
        title: 'Status da biblioteca',
        items: [
          {
            eyebrow: 'Live',
            title: 'Badge',
            body: 'Componente já funcional e variado para estados default, success, warning e info.',
          },
          {
            eyebrow: 'Foundation',
            title: 'Liquid glass primitives',
            body: 'Assets de glass e displacement existem para experimentos visuais de maior impacto.',
          },
          {
            eyebrow: 'Live',
            title: 'Button, Card, Input e Separator',
            body: 'Já compõem o kit local e agora sustentam o shell do DS, os cards de documentação e os showcases do Brand System.',
          },
        ],
      },
    ],
  },
  'design-foundations-typography': {
    pageId: 'design-foundations-typography',
    tone: 'platform',
    status: 'Beta',
    eyebrow: 'Design Foundations',
    title: 'Typography',
    lead: 'A escala tipográfica do produto precisa resolver dashboard, tabelas, formulários e documentação sem criar uma segunda linguagem visual paralela. O foco aqui é função, ritmo e contraste.',
    sections: [
      {
        type: 'cards',
        title: 'Papéis tipográficos do produto',
        items: [
          {
            eyebrow: 'Display',
            title: 'Títulos de página e módulos principais',
            body: 'Entram em headers, telas de overview e estados com forte hierarquia. A leitura precisa ser firme, sem parecer editorial demais.',
          },
          {
            eyebrow: 'Section',
            title: 'Subtítulos e divisões internas',
            body: 'Usados para separar cards, tabelas, listas e blocos configuráveis dentro do app.',
          },
          {
            eyebrow: 'Body',
            title: 'Leitura contínua e interface',
            body: 'Labels, descrições, células de tabela e helper text precisam preservar legibilidade em áreas densas.',
          },
        ],
      },
      {
        type: 'checklist',
        title: 'Regras de escala',
        items: [
          'Usar contraste de peso e tamanho antes de inventar novas famílias para cada módulo.',
          'Controlar o comprimento de linha em descrições e documentação embutida no app.',
          'Manter captions e metadata em uma camada discreta, sem competir com o fluxo principal da tela.',
        ],
      },
    ],
  },
  'design-foundations-radius-shadows': {
    pageId: 'design-foundations-radius-shadows',
    tone: 'platform',
    status: 'Beta',
    eyebrow: 'Design Foundations',
    title: 'Radius & Shadows',
    lead: 'Forma e profundidade definem a sensação de produto: cards, drawers, inputs e overlays precisam compartilhar a mesma lógica de contorno e elevação.',
    sections: [
      {
        type: 'cards',
        title: 'Tokens de forma',
        items: [
          {
            eyebrow: 'Radius',
            title: 'Bordas pequenas para UI densa',
            body: 'Inputs, badges e controles compactos pedem raio mais contido para sustentar densidade e leitura rápida.',
          },
          {
            eyebrow: 'Surface',
            title: 'Cards e painéis com suavidade controlada',
            body: 'Superfícies maiores usam raio intermediário para parecer contemporâneas sem perder disciplina.',
          },
          {
            eyebrow: 'Elevation',
            title: 'Sombras por hierarquia, não por decoração',
            body: 'Painéis flutuantes, overlays e drawers usam profundidade como guia de foco e prioridade.',
          },
        ],
      },
      {
        type: 'checklist',
        title: 'Critérios de uso',
        items: [
          'Evitar misturar muitos raios diferentes na mesma tela.',
          'Usar sombra forte apenas quando um elemento realmente precisa subir de camada.',
          'Preservar contraste entre borda, superfície e elevação para o sistema continuar claro em telas densas.',
        ],
      },
    ],
  },
  'design-foundations-iconography': {
    pageId: 'design-foundations-iconography',
    tone: 'platform',
    status: 'Beta',
    eyebrow: 'Design Foundations',
    title: 'Iconography',
    lead: 'A biblioteca de ícones do produto precisa ser coerente entre navegação, ações rápidas, estados e tabelas. O objetivo não é ilustrar tudo, e sim acelerar entendimento operacional.',
    sections: [
      {
        type: 'cards',
        title: 'Papel da iconografia',
        items: [
          {
            eyebrow: 'Navigation',
            title: 'Mapear áreas e módulos',
            body: 'Ícones entram para diferenciar contextos e ajudar reconhecimento em barras laterais, tabs e ações persistentes.',
          },
          {
            eyebrow: 'Action',
            title: 'Reduzir ruído em botões e controles',
            body: 'Ações recorrentes podem usar ícones quando o significado já é suficientemente estável para o time.',
          },
          {
            eyebrow: 'Status',
            title: 'Sinalizar feedback e sistema',
            body: 'Alertas, confirmações, avisos e estados precisam continuar legíveis mesmo quando o texto é curto.',
          },
        ],
      },
      {
        type: 'checklist',
        title: 'Regras mínimas',
        items: [
          'Manter uma família principal de ícones por tela, sem misturar estilos incompatíveis.',
          'Usar ícone sempre junto de contexto suficiente quando a ação não for universal.',
          'Evitar tratar ícone como ilustração; no produto ele é linguagem utilitária.',
        ],
      },
    ],
  },
  'design-components-composed-ui': {
    pageId: 'design-components-composed-ui',
    tone: 'platform',
    status: 'Beta',
    eyebrow: 'Design Components',
    title: 'Composed UI',
    lead: 'Composed UI cobre blocos que já resolvem mais de uma intenção ao mesmo tempo: estrutura, dados, contexto e ação. Eles reduzem duplicação e aceleram novas telas.',
    sections: [
      {
        type: 'cards',
        title: 'Blocos compostos prioritários',
        items: [
          {
            eyebrow: 'Header',
            title: 'PageHeader',
            body: 'Combina breadcrumb, título, descrição curta, status e CTA principal em um único bloco consistente.',
          },
          {
            eyebrow: 'Insight',
            title: 'StatCard',
            body: 'Entrega métrica, comparação, período e interpretação em um padrão replicável.',
          },
          {
            eyebrow: 'Data',
            title: 'DataTable',
            body: 'Padroniza cabeçalho, filtros, paginação, empty state e leitura de densidade alta.',
          },
        ],
      },
    ],
  },
  'design-components-domain': {
    pageId: 'design-components-domain',
    tone: 'platform',
    status: 'Planned',
    eyebrow: 'Design Components',
    title: 'Domain',
    lead: 'Esta camada concentra componentes específicos do produto: blocos que não fazem sentido fora do contexto AdsMagic, mas precisam manter coerência visual com a base do sistema.',
    sections: [
      {
        type: 'cards',
        title: 'Candidatos naturais desta camada',
        items: [
          {
            eyebrow: 'Attribution',
            title: 'Painéis de jornada e rastreio',
            body: 'Componentes que combinam origem, conversa, venda e indicadores de operação em uma leitura única.',
          },
          {
            eyebrow: 'Pipeline',
            title: 'Blocos de funil e etapa comercial',
            body: 'Views que representam movimentação entre etapas, responsáveis, SLA e sinais de receita.',
          },
          {
            eyebrow: 'Creative Ops',
            title: 'Módulos de revisão e handoff',
            body: 'Cards e listas voltados para governança de criativos, publicação e sincronização operacional.',
          },
        ],
      },
    ],
  },
  'design-platform-patterns': {
    pageId: 'design-platform-patterns',
    tone: 'platform',
    status: 'Beta',
    eyebrow: 'Design System',
    title: 'Platform Patterns',
    lead: 'Patterns de plataforma documentam como as peças se combinam em fluxos maiores: shell, busca, tabelas, formulários longos e estados vazios precisam parecer parte do mesmo produto.',
    sections: [
      {
        type: 'cards',
        title: 'Padrões recorrentes do app',
        items: [
          {
            eyebrow: 'Shell',
            title: 'Sidebar + breadcrumb + content rail',
            body: 'Estrutura principal para navegação persistente, contexto e área útil de trabalho.',
          },
          {
            eyebrow: 'Data Flow',
            title: 'Filtros + tabela + detalhes',
            body: 'Padrão para listar, refinar e abrir contexto sem perder o ponto da jornada.',
          },
          {
            eyebrow: 'Configuration',
            title: 'Forms em etapas e painéis contextuais',
            body: 'Fluxos extensos pedem agrupamento progressivo, feedback e confirmação clara por etapa.',
          },
          {
            eyebrow: 'Recovery',
            title: 'Estados vazios, loading e erro',
            body: 'A experiência continua consistente quando não há dado, quando algo carrega ou quando uma ação falha.',
          },
        ],
      },
    ],
  },
  'design-lp-components': {
    pageId: 'design-lp-components',
    tone: 'platform',
    status: 'Beta',
    eyebrow: 'Design System',
    title: 'LP Components',
    lead: 'As landing pages do ecossistema também precisam de uma biblioteca codificada. Aqui entram as seções e blocos reutilizáveis que saem do Brand System e viram componentes de página.',
    sections: [
      {
        type: 'cards',
        title: 'Blocos principais',
        items: [
          {
            eyebrow: 'Hero',
            title: 'Promessa + CTA + prova visual',
            body: 'Cabeça da landing com headline, subheadline, CTA e suporte visual suficiente para sustentar a primeira dobra.',
          },
          {
            eyebrow: 'Trust',
            title: 'Ribbon de logos, métricas ou prova',
            body: 'Faixa curta para reduzir objeção cedo e reforçar credibilidade sem alongar demais a tela.',
          },
          {
            eyebrow: 'Narrative',
            title: 'Problem / solution e explicação de mecanismo',
            body: 'Seções que contextualizam a dor e mostram como o produto resolve o fluxo com clareza.',
          },
          {
            eyebrow: 'Offer',
            title: 'Pricing, comparação e fechamento',
            body: 'Blocos que organizam plano, escopo, CTA e objeções finais em estruturas repetíveis.',
          },
        ],
      },
      {
        type: 'links',
        title: 'Referências ativas no repositório',
        items: [
          {
            label: 'Abrir LP Agências',
            to: '/lp/agencias',
            note: 'Piloto comercial para validar hero, prova, narrativa e CTA em código real.',
          },
          {
            label: 'Abrir Deck Agências',
            to: '/deck/agencias',
            note: 'Material comercial que ajuda a calibrar a mesma linguagem em superfícies não-lineares.',
          },
        ],
      },
    ],
  },
  'brand-cover': {
    pageId: 'brand-cover',
    tone: 'brand',
    status: 'Live',
    eyebrow: 'Brand System',
    title: 'Um design system para branding, performance e produção criativa',
    lead: 'O Brand System do AdsMagic não é apenas uma biblioteca de componentes. Ele é um sistema operacional de marca para campanhas, LPs, decks, ads e ativos comerciais.',
    highlight: 'A inspiração do BrandOS no Figma foi traduzida aqui como uma arquitetura de foundations, creative primitives, template families, pilotos e governança.',
    sections: [],
  },
  'brand-logo': {
    pageId: 'brand-logo',
    tone: 'brand',
    status: 'Live',
    eyebrow: 'Brand Identity',
    title: 'Logo',
    lead: 'Wordmark institucional, versões invertidas e regras de aplicação para apresentações, LPs e materiais comerciais.',
    sections: [],
  },
  'brand-symbol': {
    pageId: 'brand-symbol',
    tone: 'brand',
    status: 'Live',
    eyebrow: 'Brand Identity',
    title: 'Symbol',
    lead: 'O star-mark compacto do AdsMagic em variações de cor, tamanhos mínimos e anatomia detalhada.',
    sections: [],
  },
  'brand-cards': {
    pageId: 'brand-cards',
    tone: 'brand',
    status: 'Live',
    eyebrow: 'Brand Templates',
    title: 'Cards',
    lead: 'Cards de impacto, bento grids e patterns visuais para métricas, features e composições de campanha.',
    sections: [],
  },
  'brand-patterns': {
    pageId: 'brand-patterns',
    tone: 'brand',
    status: 'Live',
    eyebrow: 'Brand Templates',
    title: 'Patterns',
    lead: 'Templates de layout por contexto: Ads, Email, Website e Print com regras de composição específicas.',
    sections: [],
  },
  'brand-identity-logo-symbol': {
    pageId: 'brand-identity-logo-symbol',
    tone: 'brand',
    status: 'Live',
    eyebrow: 'Brand Identity',
    title: 'Logo & Symbol',
    lead: 'A assinatura principal do AdsMagic combina wordmark e star-mark em um sistema simples: o wordmark identifica, o símbolo compacta, e ambos precisam coexistir com regras claras de uso, contraste e contexto.',
    sections: [
      {
        type: 'assets',
        title: 'Versões oficiais',
        items: [
          {
            label: 'Wordmark principal',
            src: asset('/logo-wordmark.svg'),
            note: 'Versão institucional para decks, propostas, páginas claras e materiais de apresentação.',
          },
          {
            label: 'Wordmark invertido',
            src: asset('/logo-wordmark-white.svg'),
            note: 'Aplicação em fundos escuros, hero de campanha e peças densas com contraste alto.',
            dark: true,
          },
          {
            label: 'Symbol / star-mark',
            src: asset('/logo-icon.svg'),
            note: 'Assinatura reduzida para avatar, favicon, bullets premium e usos compactos.',
          },
        ],
      },
      {
        type: 'cards',
        title: 'Quando usar cada versão',
        items: [
          {
            eyebrow: 'Institutional',
            title: 'Wordmark completo',
            body: 'Use quando a marca precisa aparecer como identificação principal e leitura imediata.',
          },
          {
            eyebrow: 'Compact',
            title: 'Star-mark isolado',
            body: 'Use quando o espaço é curto ou quando a marca atua como marcador discreto, não como manchete.',
          },
          {
            eyebrow: 'System',
            title: 'Logo como parte da composição',
            body: 'Em LPs, decks e criativos, a assinatura entra para fechar sistema e não para competir com a copy principal.',
          },
        ],
      },
      {
        type: 'checklist',
        title: 'Regras mínimas',
        items: [
          'Não distorcer o star-mark nem alterar o espaçamento interno do wordmark.',
          'Garantir área de respiro suficiente ao redor da assinatura.',
          'Escolher a versão invertida sempre que o contraste do fundo ameaçar a leitura da marca.',
        ],
      },
    ],
  },
  'brand-foundations-logo': {
    pageId: 'brand-foundations-logo',
    tone: 'brand',
    status: 'Live',
    eyebrow: 'Brand Foundations',
    title: 'Logo e wordmark institucional',
    lead: 'O núcleo institucional da marca vive nos lockups completos. Esta página organiza wordmark, versões invertidas e as regras mínimas para apresentações, LPs claras e materiais comerciais.',
    sections: [
      {
        type: 'assets',
        title: 'Assets oficiais atuais',
        items: [
          {
            label: 'Wordmark principal',
            src: asset('/logo-wordmark.svg'),
            note: 'Uso institucional, decks, LPs claras e materiais comerciais.',
          },
          {
            label: 'Wordmark invertido',
            src: asset('/logo-wordmark-white.svg'),
            note: 'Fundos densos, hero dark, ads e áreas com contraste alto.',
            dark: true,
          },
        ],
      },
      {
        type: 'checklist',
        title: 'Regras mínimas',
        items: [
          'Usar wordmark completo em contextos institucionais e de leitura rápida.',
          'Garantir área de respiro consistente e evitar sobrepor o wordmark em áreas de ruído visual.',
          'Usar a página de símbolo para aplicações compactas, favicon e assinaturas reduzidas.',
        ],
      },
    ],
  },
  'brand-foundations-symbol': {
    pageId: 'brand-foundations-symbol',
    tone: 'brand',
    status: 'Live',
    eyebrow: 'Brand Foundations',
    title: 'Símbolo, star mark e usos compactos',
    lead: 'O star mark é a assinatura reduzida do AdsMagic. Ele entra quando a marca precisa aparecer em espaços compactos, favicons, bullets premium, cards e contextos onde o wordmark completo perde eficiência.',
    sections: [
      {
        type: 'assets',
        title: 'Asset principal do símbolo',
        items: [
          {
            label: 'Logo icon / star mark',
            src: asset('/logo-icon.svg'),
            note: 'Versão compacta para favicon, avatar, bullets premium e lockups reduzidos.',
          },
        ],
      },
      {
        type: 'cards',
        title: 'Onde o símbolo funciona melhor',
        items: [
          {
            eyebrow: 'Compact UI',
            title: 'Favicons, avatars e navegação enxuta',
            body: 'Quando o espaço é curto, o símbolo segura reconhecimento sem sacrificar legibilidade.',
          },
          {
            eyebrow: 'Editorial Accent',
            title: 'Bullets premium e selos de energia',
            body: 'O star mark ajuda a ritmar decks, cards e pontos de prova sem competir com a headline.',
          },
          {
            eyebrow: 'Brand Marker',
            title: 'Assinatura reduzida em criativos',
            body: 'Em peças densas, ele atua como marcador de marca quando o wordmark completo seria ruído visual.',
          },
        ],
      },
      {
        type: 'checklist',
        title: 'Regras mínimas do símbolo',
        items: [
          'Não distorcer proporção, rotação ou espessura do star mark.',
          'Usar contraste alto em fundos escuros e evitar fundos multicoloridos muito ruidosos.',
          'Preferir o símbolo quando a marca aparece como acento, não como identificação principal.',
        ],
      },
    ],
  },
  'brand-foundations-colors': {
    pageId: 'brand-foundations-colors',
    tone: 'brand',
    status: 'Live',
    eyebrow: 'Brand Identity',
    title: 'Colors',
    lead: 'A paleta de marca combina navy profundo, verde de assinatura, indigo operacional e superfícies de apoio para campanhas, apresentações e aplicações institucionais.',
    sections: [],
  },
  'brand-foundations-typography': {
    pageId: 'brand-foundations-typography',
    tone: 'brand',
    status: 'Live',
    eyebrow: 'Brand Identity',
    title: 'Typography',
    lead: 'A diretriz do repositório é clara: Inter only. O Brand System respeita isso e trabalha por peso, contraste, escala e composição, não por trocar família tipográfica.',
    sections: [],
  },
  'brand-foundations-grafismos': {
    pageId: 'brand-foundations-grafismos',
    tone: 'brand',
    status: 'Live',
    eyebrow: 'Brand Identity',
    title: 'Grafismos',
    lead: 'O repertório visual do AdsMagic já aponta para uma linguagem própria: barras diagonais arredondadas, brilhos suaves e um star mark compacto que costura campanhas e blocos editoriais.',
    sections: [],
  },
  'brand-visual-language-illustrations': {
    pageId: 'brand-visual-language-illustrations',
    tone: 'brand',
    status: 'Planned',
    eyebrow: 'Visual Language',
    title: 'Illustrations',
    lead: 'A camada de ilustração ainda está em consolidação, mas já precisa de uma direção clara para evitar estilos desconectados entre landing pages, materiais comerciais e peças explicativas.',
    sections: [
      {
        type: 'assets',
        title: 'Moodboard de estilo',
        items: [
          {
            label: 'Sistemas e conexões',
            src: asset('/img/brand/illus-systems.svg'),
            note: 'Nós conectados, fluxos de dados e topologias de rede — a metáfora central da marca.',
            dark: true,
          },
          {
            label: 'Dados em movimento',
            src: asset('/img/brand/illus-data-flow.svg'),
            note: 'Pipelines, estágios de processamento e barras de progresso — operação visível.',
            dark: true,
          },
          {
            label: 'Clareza de decisão',
            src: asset('/img/brand/illus-decision.svg'),
            note: 'Caminhos divergentes, confiança quantificada e escolha baseada em dados.',
            dark: true,
          },
        ],
      },
      {
        type: 'cards',
        title: 'Direção sugerida',
        items: [
          {
            eyebrow: 'Concept',
            title: 'Sistemas, fluxos e conexões',
            body: 'Ilustrações devem reforçar operação conectada, dados em movimento e clareza de decisão, não funcionar como ornamento genérico.',
          },
          {
            eyebrow: 'Style',
            title: 'Geometria simples + brilho controlado',
            body: 'A linguagem visual deve conversar com o navy, os glows e a precisão editorial da marca.',
          },
          {
            eyebrow: 'Use',
            title: 'Explicação, apoio e diferenciação',
            body: 'Entram melhor em capas, seções de mecanismo, decks e materiais que pedem abstração sem perder clareza.',
          },
        ],
      },
      {
        type: 'checklist',
        title: 'Próximos passos',
        items: [
          'Definir um set inicial de cenas ou metáforas recorrentes.',
          'Validar se a linguagem será mais diagramática, geométrica ou semi-editorial.',
          'Publicar uma biblioteca mínima antes de tratar ilustração como padrão oficial.',
        ],
      },
    ],
  },
  'brand-visual-language-photography': {
    pageId: 'brand-visual-language-photography',
    tone: 'brand',
    status: 'Planned',
    eyebrow: 'Visual Language',
    title: 'Photography',
    lead: 'Fotografia precisa apoiar credibilidade, escala humana e contexto operacional sem cair no banco de imagens genérico. A curadoria deve ser tão disciplinada quanto a paleta e a tipografia.',
    sections: [
      {
        type: 'assets',
        title: 'Moodboard fotográfico',
        items: [
          {
            label: 'Autoridade calma',
            src: asset('/img/brand/photo-mood-authority.svg'),
            note: 'Cena de trabalho focado, luz suave lateral, dashboard ao fundo — concentração sem pose.',
            dark: true,
          },
          {
            label: 'Colaboração e decisão',
            src: asset('/img/brand/photo-mood-collaboration.svg'),
            note: 'Time em torno de dados, reunião natural com telas e artefatos reais.',
            dark: true,
          },
          {
            label: 'Contexto operacional',
            src: asset('/img/brand/photo-mood-operational.svg'),
            note: 'Apresentação de resultados, métricas em tela grande, audiência engajada.',
            dark: true,
          },
        ],
      },
      {
        type: 'cards',
        title: 'Diretrizes iniciais',
        items: [
          {
            eyebrow: 'Mood',
            title: 'Autoridade calma e contexto real',
            body: 'Preferir cenas de trabalho, colaboração e tomada de decisão em vez de fotos excessivamente posadas.',
          },
          {
            eyebrow: 'Color',
            title: 'Luz neutra com espaço para overlays',
            body: 'As imagens precisam aceitar camadas escuras, recortes e integração com navy, green e indigo.',
          },
          {
            eyebrow: 'Usage',
            title: 'Hero, depoimentos e bastidores',
            body: 'A fotografia entra melhor quando ancora prova social, contexto ou narrativa de marca com pessoas reais.',
          },
        ],
      },
      {
        type: 'checklist',
        title: 'O que evitar',
        items: [
          'Sorrisos artificiais e poses típicas de stock que esvaziam a credibilidade.',
          'Fundos extremamente saturados ou ruídos que briguem com os grafismos da marca.',
          'Cenas sem contexto operacional claro quando a peça precisa falar de performance e clareza.',
        ],
      },
    ],
  },
  'brand-visual-language-icons-symbols': {
    pageId: 'brand-visual-language-icons-symbols',
    tone: 'brand',
    status: 'Beta',
    eyebrow: 'Visual Language',
    title: 'Icons & Symbols',
    lead: 'Além do wordmark, a marca precisa de uma camada enxuta de símbolos e ícones que funcione em favicons, bullets premium, callouts e pequenos marcadores editoriais.',
    sections: [
      {
        type: 'assets',
        title: 'Símbolos ativos',
        items: [
          {
            label: 'Star-mark oficial',
            src: asset('/logo-icon.svg'),
            note: 'Símbolo principal para usos compactos, avatares, selos e presença reduzida da marca.',
            dark: true,
          },
          {
            label: 'Bullet premium',
            src: asset('/img/brand/icon-bullet-premium.svg'),
            note: 'Bullet geométrico para listas de features de alto valor ou diferenciais de plataforma.',
            dark: true,
          },
          {
            label: 'Callout marker',
            src: asset('/img/brand/icon-callout-marker.svg'),
            note: 'Marcador editorial para blocos de citação, notas de arquitetura ou insights importantes.',
            dark: true,
          },
          {
            label: 'Pictograma: Growth',
            src: asset('/img/brand/icon-pictogram-growth.svg'),
            note: 'Exemplo de pictograma de marca focado em performance, usando verde e indigo.',
            dark: true,
          }
        ],
      },
      {
        type: 'cards',
        title: 'Funções desta camada',
        items: [
          {
            eyebrow: 'Marker',
            title: 'Assinatura reduzida',
            body: 'Marca presença em espaços pequenos sem exigir o wordmark completo.',
          },
          {
            eyebrow: 'Accent',
            title: 'Ritmo editorial',
            body: 'Funciona como bullet premium ou elemento de apoio para títulos, provas e selos rápidos.',
          },
          {
            eyebrow: 'Future Library',
            title: 'Pictogramas de marca',
            body: 'Quando surgirem ícones próprios, eles devem derivar do mesmo rigor geométrico e da mesma lógica de contraste.',
          },
        ],
      },
      {
        type: 'checklist',
        title: 'Regras mínimas',
        items: [
          'Não inventar múltiplas versões do símbolo sem critério de uso.',
          'Manter o símbolo pequeno e estratégico para não transformar assinatura em ilustração.',
          'Se a biblioteca de pictogramas crescer, documentar grid, espessura e raio visual compatíveis com o star-mark.',
        ],
      },
    ],
  },
  'brand-creative-primitives': {
    pageId: 'brand-creative-primitives',
    tone: 'brand',
    status: 'Live',
    eyebrow: 'Creative System',
    title: 'Creative primitives',
    lead: 'São os blocos mínimos que montam ads, LPs, decks e collaterals do AdsMagic. Aqui a leitura deixa de ser genérica e vira uma biblioteca visual com os primitives em seu estado real de uso.',
    sections: [],
  },
  'brand-creative-cards': {
    pageId: 'brand-creative-cards',
    tone: 'brand',
    status: 'Live',
    eyebrow: 'Creative System',
    title: 'Cards de conteúdo, prova e oferta',
    lead: 'Cards aqui não são apenas componentes visuais. Eles são recipientes de narrativa e conversão, com regras claras de densidade, hierarquia e prova.',
    sections: [
      {
        type: 'cards',
        title: 'Famílias principais',
        items: [
          { eyebrow: 'Editorial', title: 'Feature card', body: 'Explica uma capacidade com título, apoio visual e CTA contextual.' },
          { eyebrow: 'Proof', title: 'Metric card', body: 'Entrega número, unidade e contexto em uma leitura muito rápida.' },
          { eyebrow: 'Trust', title: 'Testimonial card', body: 'Usa fala, nome, papel e visual de apoio para reduzir objeção.' },
          { eyebrow: 'Sales', title: 'Offer card', body: 'Bloco direto para proposta, plano, escopo e CTA.' },
          { eyebrow: 'Compare', title: 'Comparison card', body: 'Ajuda a posicionar antes/depois, solução antiga vs nova ou plano A vs B.' },
          { eyebrow: 'Process', title: 'Flow card', body: 'Mostra passos, etapas ou transições de funil com clareza.' },
        ],
      },
      {
        type: 'showcases',
        title: 'Cards renderizados',
        columns: 3,
        items: [
          {
            label: 'Proof',
            variant: 'metric-card',
            headline: '+38%',
            supporting: 'de ganho em clareza operacional quando campanha, tracking e criação falam a mesma língua.',
            chips: ['Metric card'],
          },
          {
            label: 'Trust',
            variant: 'testimonial-card',
            headline: '“Parou de parecer uma agência montando slide. Virou um sistema comercial.”',
            supporting: 'Depoimento curto, cargo e contexto entram para reduzir objeção sem virar mural de texto.',
            chips: ['Testimonial'],
          },
          {
            label: 'Sales',
            variant: 'offer-card',
            headline: 'Plano Growth com setup, template kit e revisão criativa.',
            supporting: 'Offer card concentra escopo, valor e CTA em leitura rápida para LP, deck ou ads de conversão.',
            chips: ['Oferta', 'Preço', 'CTA'],
          },
        ],
      },
    ],
  },
  'brand-creative-patterns': {
    pageId: 'brand-creative-patterns',
    tone: 'brand',
    status: 'Live',
    eyebrow: 'Creative System',
    title: 'Patterns compostos',
    lead: 'Patterns são receitas visuais recorrentes. Eles aparecem em múltiplos formatos, mas preservam a mesma lógica de hierarquia, proof e assinatura.',
    sections: [
      {
        type: 'cards',
        title: 'Receitas que devem se repetir',
        items: [
          { eyebrow: 'Split', title: 'Split media + copy', body: 'Imagem ou dashboard de um lado, narrativa e CTA do outro.' },
          { eyebrow: 'Overlay', title: 'Dark overlay quote', body: 'Fundo fotográfico com camada escura e manifesto em destaque.' },
          { eyebrow: 'Stacked', title: 'Stacked proof wall', body: 'Empilha logos, métricas e depoimentos em seções de credibilidade.' },
          { eyebrow: 'Rail', title: 'Diagonal CTA rail', body: 'Fecha seções e criativos com movimento e direção de leitura.' },
          { eyebrow: 'Centered', title: 'Manifesto center stage', body: 'Uma mensagem central, muito respiro e assinatura controlada.' },
          { eyebrow: 'Editorial', title: 'Series frame', body: 'Estrutura para posts seriados, episódios e conteúdo em capítulos.' },
        ],
      },
      {
        type: 'showcases',
        title: 'Patterns materializados',
        columns: 2,
        items: [
          {
            label: 'Split',
            variant: 'split-pattern',
            headline: 'Dashboard, promessa e CTA em leitura lateral.',
            supporting: 'Pattern ideal para LP section, feature hero e comparação visual com produto em destaque.',
            chips: ['Media + Copy'],
          },
          {
            label: 'Overlay',
            variant: 'overlay-pattern',
            headline: 'Mensagem principal apoiada por atmosfera e contraste.',
            supporting: 'Dark overlay quote funciona em campanhas, capas e manifestos com tom mais premium.',
            chips: ['Dark', 'Manifesto'],
          },
          {
            label: 'Stacked',
            variant: 'stacked-pattern',
            headline: 'Logos, prova e depoimento empilhados sem ruído.',
            supporting: 'A wall de credibilidade serve como bloco de confiança em hero, oferta ou sales enablement.',
            chips: ['Proof wall'],
          },
          {
            label: 'Rail',
            variant: 'rail-pattern',
            headline: 'CTA com direção visual clara e fechamento forte.',
            supporting: 'A rail diagonal é um pattern de saída: encerra seção e empurra a próxima ação.',
            chips: ['CTA rail'],
          },
          {
            label: 'Centered',
            variant: 'centered-pattern',
            headline: 'Manifesto central com muito respiro e assinatura controlada.',
            supporting: 'Center stage entra quando a mensagem precisa ficar sozinha e dominar o frame.',
            chips: ['Manifesto'],
          },
          {
            label: 'Series',
            variant: 'series-pattern',
            headline: 'Formato editorial para capítulos, episódios e carrosséis.',
            supporting: 'Series frame permite sistema de conteúdo recorrente sem parecer um template genérico.',
            chips: ['Editorial'],
          },
        ],
      },
    ],
  },
  'brand-templates-social-posts': {
    pageId: 'brand-templates-social-posts',
    tone: 'brand',
    status: 'Live',
    eyebrow: 'Brand Templates',
    title: 'Social Posts',
    lead: 'Inspirado diretamente pela taxonomia do BrandOS visto no Figma, este módulo organiza social posts por set visual e por ratio operacional.',
    sections: [
      {
        type: 'ratios',
        title: 'Ratios prioritários',
        items: [
          brandSocialPostDimensions.feedHorizontal,
          brandSocialPostDimensions.square,
          brandSocialPostDimensions.vertical,
          brandSocialPostDimensions.stories,
        ],
      },
      {
        type: 'cards',
        title: 'Sets iniciais do MVP',
        items: [
          { eyebrow: 'Set 1', title: 'Quote + logo', body: 'Mensagem em destaque, autoria e assinatura enxuta.' },
          { eyebrow: 'Set 2', title: 'Dark overlay', body: 'Imagem de fundo com camada escura para manifesto e tom premium.' },
          { eyebrow: 'Set 3', title: 'Editorial series', body: 'Título de série, subtítulo e módulo principal de mensagem.' },
          { eyebrow: 'Set 4', title: 'Split media', body: 'Imagem ocupando metade do frame e bloco sólido de copy abaixo ou ao lado.' },
        ],
      },
      {
        type: 'showcases',
        title: 'Sets em preview',
        columns: 2,
        items: [
          {
            label: 'Set 1',
            variant: 'centered-pattern',
            headline: 'Quote + logo para recado curto, contundente e compartilhável.',
            supporting: 'Ideal para feed quadrado, carrossel e recortes de autoridade com assinatura nítida.',
            chips: ['1:1', 'Quote + logo'],
          },
          {
            label: 'Set 2',
            variant: 'overlay-pattern',
            headline: 'Dark overlay com headline de impacto e CTA enxuto.',
            supporting: 'O tom sobe sem perder legibilidade, especialmente em 4:5 e 9:16.',
            chips: ['4:5', 'Overlay'],
          },
          {
            label: 'Set 3',
            variant: 'series-pattern',
            headline: 'Editorial series para capítulos, episódios e educação de mercado.',
            supporting: 'Boa escolha para conteúdo recorrente e ritmo de publicação consistente.',
            chips: ['Carrossel', 'Series'],
          },
          {
            label: 'Set 4',
            variant: 'split-pattern',
            headline: 'Split media quando o visual precisa dividir protagonismo com a promessa.',
            supporting: 'Funciona bem em horizontal, quadrado e versões de awareness com produto ou dashboard.',
            chips: ['1.91:1', 'Split'],
          },
        ],
      },
      {
        type: 'checklist',
        title: 'Regras de exportação',
        items: [
          'Sempre gerar famílias completas: 1.91:1, 1:1, 4:5 e 9:16 quando fizer sentido.',
          'Preservar safe area para logo e CTA nas versões mobile-first.',
          'Manter headline principal em até duas intensidades: manifesto ou resposta direta.',
        ],
      },
    ],
  },
  'brand-templates-display-ads': {
    pageId: 'brand-templates-display-ads',
    tone: 'brand',
    status: 'Beta',
    eyebrow: 'Brand Templates',
    title: 'Display Ads',
    lead: 'Display não deve ser uma peça solta improvisada. O Brand System trata ads como desdobramentos de uma mesma família narrativa com hierarquia muito disciplinada.',
    sections: [
      {
        type: 'cards',
        title: 'Princípios de construção',
        items: [
          { eyebrow: 'Hierarchy', title: 'Uma promessa central', body: 'Headline curta, contraste alto e CTA sem disputa com outras mensagens.' },
          { eyebrow: 'Density', title: 'Poucos elementos, leitura rápida', body: 'Display precisa sobreviver em segundos; cortar excesso é parte do sistema.' },
          { eyebrow: 'Branding', title: 'Marca visível, mas não invasiva', body: 'Logo e grafismo entram para reconhecimento, não para ocupar todo o anúncio.' },
        ],
      },
      {
        type: 'ratios',
        title: 'Famílias sugeridas',
        items: [
          brandDisplayAdDimensions.response,
          brandDisplayAdDimensions.offerCard,
          brandDisplayAdDimensions.proof,
        ],
      },
      {
        type: 'showcases',
        title: 'Families em preview',
        columns: 3,
        items: [
          {
            label: 'Ads/Revenue',
            variant: 'ads-revenue',
            headline: 'Pare de otimizar mídia por lead. Comece a otimizar por venda.',
            supporting: 'Creative family para revenue angle: promessa curta, prova de retorno e CTA de resposta direta.',
            chips: ['1200x628', 'Revenue', 'Response'],
          },
          {
            label: 'Ads/Anti-CPL',
            variant: 'ads-anti-cpl',
            headline: 'Lead barato não paga equipe, operação nem meta de crescimento.',
            supporting: 'Family que confronta a obsessão por CPL e reposiciona a conversa para receita real.',
            chips: ['1:1', 'Anti-CPL', 'Provocação'],
          },
          {
            label: 'Ads/Funnel',
            variant: 'ads-funnel',
            headline: 'Entre o clique e a venda existe um funil invisível que você ainda não mede.',
            supporting: 'Creative family para explicar o mecanismo: clique, WhatsApp, CRM e venda como um fluxo único.',
            chips: ['4:5', 'Mechanism', 'Funnel'],
          },
        ],
      },
    ],
  },
  'brand-templates-lp-sections': {
    pageId: 'brand-templates-lp-sections',
    tone: 'brand',
    status: 'Live',
    eyebrow: 'Template Families',
    title: 'Seções de landing page como blocos reutilizáveis',
    lead: 'A landing não é uma tela única. Ela é uma composição de sections reutilizáveis, cada uma com papel claro na jornada de conversão.',
    sections: [
      {
        type: 'cards',
        title: 'Sections que entram primeiro',
        items: [
          { eyebrow: 'Hero', title: 'Hero de promessa + CTA', body: 'Headline, subheadline, CTA e prova visual principal.' },
          { eyebrow: 'Trust', title: 'Proof ribbon', body: 'Faixa de logos, selos, métricas ou provas de autoridade.' },
          { eyebrow: 'Narrative', title: 'Problem / solution', body: 'Contexto da dor e explicação da proposta com clareza.' },
          { eyebrow: 'Offer', title: 'Pricing / comparison', body: 'Blocos de plano, escopo, comparativo ou incentivo de conversão.' },
          { eyebrow: 'Closure', title: 'FAQ + CTA final', body: 'Objecções principais e chamada final para ação.' },
          { eyebrow: 'Editorial', title: 'Feature gallery', body: 'Cards ou bento de recursos com screenshots e prova contextual.' },
        ],
      },
      {
        type: 'cards',
        title: 'Base responsiva para replicação',
        items: [
          {
            eyebrow: brandLpResponsiveSpecs.containerXl.label,
            title: brandLpResponsiveSpecs.containerXl.value,
            body: brandLpResponsiveSpecs.containerXl.description,
            meta: `Token: ${brandLpResponsiveSpecs.containerXl.token}`,
          },
          {
            eyebrow: brandLpResponsiveSpecs.container2xl.label,
            title: brandLpResponsiveSpecs.container2xl.value,
            body: brandLpResponsiveSpecs.container2xl.description,
            meta: `Token: ${brandLpResponsiveSpecs.container2xl.token}`,
          },
          {
            eyebrow: brandLpResponsiveSpecs.gutters.label,
            title: brandLpResponsiveSpecs.gutters.value,
            body: brandLpResponsiveSpecs.gutters.description,
            meta: `Tokens: ${brandLpResponsiveSpecs.gutters.token}`,
          },
        ],
      },
      {
        type: 'links',
        title: 'Pilotos no repositório',
        items: [
          { label: 'LP Agências', to: '/lp/agencias', note: 'Piloto comercial já existente para validar hero, prova e CTA.' },
          { label: 'Deck Agências', to: '/deck/agencias', note: 'Material comercial que ajuda a calibrar narrativa e densidade editorial.' },
        ],
      },
      {
        type: 'showcases',
        title: 'Sections em preview',
        columns: 2,
        items: [
          {
            label: 'LP/Hero',
            variant: 'lp-hero',
            headline: 'Rastreie clique, conversa e venda no WhatsApp em uma visão só.',
            supporting: 'Hero principal do sistema: promessa, CTA, prova de mecanismo e presença forte de marca.',
            chips: ['Hero', 'Promise', 'CTA'],
          },
          {
            label: 'LP/Flow',
            variant: 'lp-flow',
            headline: 'Do anúncio ao CRM em 3 movimentos claros.',
            supporting: 'Section de mecanismo para explicar o fluxo operacional e reduzir fricção de entendimento.',
            chips: ['Flow', '3 steps', 'Mechanism'],
          },
          {
            label: 'LP/Benefits',
            variant: 'lp-benefits',
            headline: 'Mídia, operação e vendas passam a falar a mesma língua.',
            supporting: 'Section de benefícios com ênfase em ganhos práticos para time comercial e performance.',
            chips: ['Benefits', 'Value props'],
          },
          {
            label: 'LP/Offer',
            variant: 'lp-offer',
            headline: 'Diagnóstico + setup + piloto para validar receita rastreável rápido.',
            supporting: 'Bloco de oferta para fechamento: escopo compacto, CTA e framing comercial mais direto.',
            chips: ['Offer', 'Pricing', 'CTA'],
          },
        ],
      },
    ],
  },
  'brand-templates-decks': {
    pageId: 'brand-templates-decks',
    tone: 'brand',
    status: 'Beta',
    eyebrow: 'Brand Templates',
    title: 'Presentation',
    lead: 'A família de apresentação cobre deck comercial, one-pager e materiais executivos que precisam manter coerência entre narrativa, prova e identidade visual.',
    sections: [
      {
        type: 'cards',
        title: 'Formatos-base',
        items: [
          {
            eyebrow: 'Sales Deck',
            title: 'Apresentação comercial narrativa',
            body: 'Fluxo de problema, mecanismo, prova, oferta e fechamento para calls e apresentações guiadas.',
          },
          {
            eyebrow: 'One-Pager',
            title: 'Resumo executivo imprimível',
            body: 'Peça enxuta para prospect frio, follow-up pós-call e compartilhamento rápido com decisores.',
          },
          {
            eyebrow: 'Internal Pitch',
            title: 'Decks de alinhamento e proposta',
            body: 'Versões derivadas para discovery, proposta comercial e alinhamento entre marketing, vendas e operação.',
          },
        ],
      },
      {
        type: 'links',
        title: 'Pilotos já disponíveis',
        items: [
          {
            label: 'Abrir Deck Agências',
            to: '/deck/agencias',
            note: 'One-pager comercial já funcional, útil como piloto e referência visual desta família.',
          },
        ],
      },
      {
        type: 'checklist',
        title: 'Regras da família',
        items: [
          'Manter uma progressão narrativa clara: contexto, mecanismo, prova e oferta.',
          'Controlar densidade por página para que a leitura sobreviva tanto em tela quanto em PDF.',
          'Reaproveitar os blocos de prova, headline e CTA já validados nas LPs e nos criativos.',
        ],
      },
    ],
  },
  'brand-templates-collaterals': {
    pageId: 'brand-templates-collaterals',
    tone: 'brand',
    status: 'Planned',
    eyebrow: 'Template Families',
    title: 'Collaterals, anexos comerciais e assinaturas',
    lead: 'Esta camada fecha o BrandOS para os materiais auxiliares: assinaturas, folhas de apoio, anexos de proposta e pequenas peças institucionais que hoje ainda vivem dispersas.',
    sections: [
      {
        type: 'cards',
        title: 'Itens previstos nesta família',
        items: [
          {
            eyebrow: 'Signature',
            title: 'Assinaturas compactas',
            body: 'Lockups reduzidos para e-mail, WhatsApp e contextos onde a marca entra como rodapé funcional.',
          },
          {
            eyebrow: 'Collateral',
            title: 'Anexos de proposta e folhas de prova',
            body: 'Materiais curtos para reforçar oferta, casos de uso, métricas e diferenciais em follow-ups comerciais.',
          },
          {
            eyebrow: 'Institutional Support',
            title: 'Peças auxiliares da marca',
            body: 'Versões leves para apresentações, eventos, checklists e documentos operacionais compartilháveis.',
          },
        ],
      },
      {
        type: 'checklist',
        title: 'Critério para sair do estado Planned',
        items: [
          'Definir quais formatos realmente viram padrão recorrente e quais continuam sendo materiais pontuais.',
          'Nomear templates por uso real, não por arquivo isolado ou ocasião temporária.',
          'Validar primeiro em fluxo comercial real antes de promover a família para Beta.',
        ],
      },
    ],
  },
  'brand-creative-campaign': {
    pageId: 'brand-creative-campaign',
    tone: 'brand',
    status: 'Live',
    eyebrow: 'Creative System',
    title: 'Criativos de campanha e performance',
    lead: 'Os 6 criativos de performance do AdsMagic — extraídos do Figma (node 870:1658) em 15/04/2026. Todos seguem o mesmo sistema visual: fundo azul profundo com variações entre #0064E1, #0043FF e #000FFD; barras diagonais arredondadas; verde #3BB56D como acento; e copy de resposta direta. A biblioteca de templates editoriais (node 370:2507) complementa com 9 famílias de prova social, manifesto e bento de métricas.',
    sections: [],
  },
  'brand-governance': {
    pageId: 'brand-governance',
    tone: 'brand',
    status: 'Live',
    eyebrow: 'Brand Governance',
    title: 'Governança para impedir que o sistema vire uma pasta de peças soltas',
    lead: 'Governança fecha o circuito entre Figma, app, templates piloto e produção real. Sem isso, o Brand System perde coerência rapidamente.',
    sections: [
      {
        type: 'steps',
        title: 'Fluxo operacional',
        items: [
          { title: '1. Definir family no Figma', body: 'Toda nova família nasce no Figma com ratio, grid, safe area e intenção descrita.' },
          { title: '2. Publicar regra no styleguide', body: 'A família vira página, ganha checklist e entra no mapa oficial do sistema.' },
          { title: '3. Validar em piloto real', body: 'Aplicar em uma LP, deck ou peça social antes de chamar de padrão.' },
          { title: '4. Versionar e revisar', body: 'Mudanças estruturais precisam registrar rationale, impacto e owners.' },
        ],
      },
      {
        type: 'checklist',
        title: 'Regras de naming e QA',
        items: [
          'Nomear templates por family + ratio + variante, nunca por arquivo solto e ambíguo.',
          'Documentar quando uma peça é experimental, beta ou padrão aprovado.',
          'Revisar contraste, safe area, peso de headline e visibilidade da marca antes de publicar.',
        ],
      },
    ],
  },
  'brand-governance-do-dont': {
    pageId: 'brand-governance-do-dont',
    tone: 'brand',
    status: 'Live',
    eyebrow: 'Brand Governance',
    title: 'Do & Don\'t',
    lead: 'As regras de uso da marca existem para impedir deriva visual. O objetivo aqui não é engessar a produção, e sim manter o sistema reconhecível quando ele se desdobra em formatos diferentes.',
    sections: [
      {
        type: 'cards',
        title: 'Do',
        items: [
          {
            eyebrow: 'Do',
            title: 'Manter contraste alto entre marca e fundo',
            body: 'Navy profundo, wordmark invertido e acentos verdes funcionam quando a leitura continua imediata.',
          },
          {
            eyebrow: 'Do',
            title: 'Usar grafismos para conduzir o olhar',
            body: 'Barras diagonais, glow e star-mark entram como estrutura e não como decoração gratuita.',
          },
          {
            eyebrow: 'Do',
            title: 'Nomear templates por family e uso real',
            body: 'A taxonomia precisa refletir formato, canal e intenção, não arquivo isolado ou ocasião passageira.',
          },
        ],
      },
      {
        type: 'cards',
        title: 'Don\'t',
        items: [
          {
            eyebrow: 'Don\'t',
            title: 'Não saturar a peça com efeitos concorrentes',
            body: 'Quando glow, barras, headline, prova e CTA disputam atenção ao mesmo tempo, a marca perde clareza.',
          },
          {
            eyebrow: 'Don\'t',
            title: 'Não distorcer símbolo, lockup ou safe area',
            body: 'A assinatura precisa preservar proporção, respiro e posição estratégica em qualquer superfície.',
          },
          {
            eyebrow: 'Don\'t',
            title: 'Não publicar peças sem revisar QA visual',
            body: 'Contraste, hierarquia, peso de copy e presença da marca precisam ser verificados antes de chamar algo de padrão.',
          },
        ],
      },
    ],
  },
  'brand-governance-voice': {
    pageId: 'brand-governance-voice',
    tone: 'brand',
    status: 'Beta',
    eyebrow: 'Brand Governance',
    title: 'Brand Voice',
    lead: 'A voz do AdsMagic precisa soar precisa, comercial e segura. A marca fala com clareza operacional, evita jargão ornamental e sempre puxa a conversa para decisão, prova e resultado.',
    sections: [
      {
        type: 'cards',
        title: 'Pilares da voz',
        items: [
          {
            eyebrow: 'Tone',
            title: 'Clara e objetiva',
            body: 'Frases curtas, promessas entendíveis e leitura que não dependa de interpretação excessiva.',
          },
          {
            eyebrow: 'Personality',
            title: 'Confiante sem inflar o discurso',
            body: 'A marca pode ser firme e provocativa, mas precisa sustentar cada afirmação com mecanismo ou prova.',
          },
          {
            eyebrow: 'Commercial',
            title: 'Orientada a ação e decisão',
            body: 'A linguagem deve sempre puxar a próxima etapa: clicar, conversar, diagnosticar, comparar ou avançar.',
          },
        ],
      },
      {
        type: 'checklist',
        title: 'Regras práticas',
        items: [
          'Evitar metáforas vagas quando a marca pode explicar o mecanismo com clareza.',
          'Usar headlines que criem tensão ou contraste real, não slogans genéricos de inovação.',
          'Fechar peças e páginas com CTA claro em vez de acumular várias microchamadas concorrentes.',
        ],
      },
    ],
  },

  /* ─── Strategy ─── */

  'brand-strategy-purpose': {
    pageId: 'brand-strategy-purpose',
    tone: 'brand',
    status: 'Planned',
    eyebrow: 'Brand Strategy',
    title: 'Purpose',
    lead: 'O propósito define por que o AdsMagic existe além de lucro. Ele ancora decisões de produto, marketing e cultura — e precisa ser memorável o suficiente para guiar sem precisar de consulta.',
    sections: [
      {
        type: 'cards',
        title: 'Perguntas-guia',
        items: [
          {
            eyebrow: 'Why',
            title: 'Por que existimos?',
            body: 'Que dor real estamos resolvendo e qual é o impacto que queremos criar no mercado de performance?',
          },
          {
            eyebrow: 'Impact',
            title: 'Qual o mundo que construímos?',
            body: 'O que muda quando nosso propósito se realiza? Como anunciantes e agências operam diferente?',
          },
        ],
      },
    ],
  },
  'brand-strategy-vision': {
    pageId: 'brand-strategy-vision',
    tone: 'brand',
    status: 'Planned',
    eyebrow: 'Brand Strategy',
    title: 'Vision',
    lead: 'A visão projeta para onde a marca caminha. É aspiracional, mas deve ser realizável dentro de um horizonte que a equipe consegue visualizar.',
    sections: [
      {
        type: 'cards',
        title: 'Elementos da visão',
        items: [
          {
            eyebrow: 'Horizon',
            title: 'Cenário de chegada',
            body: 'Como será o mercado quando o AdsMagic alcançar sua visão? Que comportamento teremos mudado?',
          },
          {
            eyebrow: 'Benchmark',
            title: 'Referência de ambição',
            body: 'Onde estamos hoje vs. onde queremos estar em 3-5 anos em termos de percepção e market share.',
          },
        ],
      },
    ],
  },
  'brand-strategy-values': {
    pageId: 'brand-strategy-values',
    tone: 'brand',
    status: 'Planned',
    eyebrow: 'Brand Strategy',
    title: 'Values',
    lead: 'Valores não são slogans decorativos. São critérios de decisão que a marca usa para priorizar, contratar, comunicar e cortar escopo.',
    sections: [
      {
        type: 'cards',
        title: 'Framework de valores',
        items: [
          {
            eyebrow: 'Principle',
            title: 'Valores como filtro',
            body: 'Cada valor deve ser testável: se não elimina nenhuma opção, não é um valor — é só um desejo genérico.',
          },
          {
            eyebrow: 'Expression',
            title: 'De dentro para fora',
            body: 'Valores se revelam em operação, copy, priorização de backlog e cultura antes de aparecer em marketing.',
          },
        ],
      },
    ],
  },
  'brand-strategy-personality': {
    pageId: 'brand-strategy-personality',
    tone: 'brand',
    status: 'Planned',
    eyebrow: 'Brand Strategy',
    title: 'Personality',
    lead: 'Se a marca fosse uma pessoa, como ela se comportaria? Personalidade governa tom de voz, estética e até as decisões de copy que rejeitamos.',
    sections: [
      {
        type: 'cards',
        title: 'Dimensões de personalidade',
        items: [
          {
            eyebrow: 'Archetype',
            title: 'Arquétipo dominante',
            body: 'O modelo psicológico que ancora a narrativa e expectativas de marca (ex.: Sage, Creator, Ruler).',
          },
          {
            eyebrow: 'Traits',
            title: 'Traços comportamentais',
            body: 'Lista curada de adjetivos que descrevem como a marca age, fala e reage — e seus opostos proibidos.',
          },
          {
            eyebrow: 'Spectrum',
            title: 'Onde nos posicionamos',
            body: 'Espectros como formal↔casual, provocativo↔conservador e técnico↔acessível com posição marcada.',
          },
        ],
      },
    ],
  },

  /* ─── Verbal Identity ─── */

  'brand-identity-verbal-tone': {
    pageId: 'brand-identity-verbal-tone',
    tone: 'brand',
    status: 'Planned',
    eyebrow: 'Verbal Identity',
    title: 'Tone of Voice',
    lead: 'O tom não é o que falamos, mas como falamos. Ele varia conforme o canal, o momento e a audiência — mas sempre carrega os mesmos traços de personalidade da marca.',
    sections: [
      {
        type: 'cards',
        title: 'Dimensões do tom',
        items: [
          {
            eyebrow: 'Spectrum',
            title: 'Formal ↔ Casual',
            body: 'Onde o AdsMagic se posiciona em cada canal: site, ads, WhatsApp, docs e suporte.',
          },
          {
            eyebrow: 'Context',
            title: 'Tom por situação',
            body: 'Como o tom se ajusta entre aquisição (provocativo), onboarding (acolhedor) e erro (direto, sem desculpas vagas).',
          },
          {
            eyebrow: 'Guard-rails',
            title: 'O que nunca soamos',
            body: 'Lista de anti-padrões: genérico, condescendente, excessivamente técnico sem contexto ou informal demais.',
          },
        ],
      },
    ],
  },
  'brand-identity-verbal-lexicon': {
    pageId: 'brand-identity-verbal-lexicon',
    tone: 'brand',
    status: 'Planned',
    eyebrow: 'Verbal Identity',
    title: 'Lexicon',
    lead: 'Palavras importam. O léxico da marca define termos que usamos com consistência, expressões que evitamos e a gramática que ancora tom em escala.',
    sections: [
      {
        type: 'cards',
        title: 'Elementos do léxico',
        items: [
          {
            eyebrow: 'Glossary',
            title: 'Termos proprietários',
            body: 'Nomes de features, conceitos internos e vocabulário que só o AdsMagic usa e precisa definir com clareza.',
          },
          {
            eyebrow: 'Avoid',
            title: 'Blacklist de termos',
            body: 'Palavras que competidores abusam ou que já perderam significado: "inovador", "revolucionário", "disruptivo".',
          },
          {
            eyebrow: 'Grammar',
            title: 'Convenções de escrita',
            body: 'Capitalização de features, uso de vírgula serial, abreviações aceitas e estilo de bullet points.',
          },
        ],
      },
    ],
  },
  'brand-identity-verbal-microcopy': {
    pageId: 'brand-identity-verbal-microcopy',
    tone: 'brand',
    status: 'Planned',
    eyebrow: 'Verbal Identity',
    title: 'Microcopy',
    lead: 'Microcopy é a voz da marca nos detalhes: botões, tooltips, placeholders, mensagens de erro e confirmações. É onde consistência importa mais e falhas doem mais.',
    sections: [
      {
        type: 'cards',
        title: 'Diretrizes de microcopy',
        items: [
          {
            eyebrow: 'Patterns',
            title: 'Templates de texto recorrente',
            body: 'Padrões para CTAs, confirmações, estados vazios, loading e mensagens de sucesso.',
          },
          {
            eyebrow: 'Principles',
            title: 'Regras do texto funcional',
            body: 'Clareza > criatividade. Ação > descrição. Brevidade > completude.',
          },
        ],
      },
    ],
  },

  /* ─── Motion & Sonic ─── */

  'brand-identity-motion-principles': {
    pageId: 'brand-identity-motion-principles',
    tone: 'brand',
    status: 'Planned',
    eyebrow: 'Motion & Sonic',
    title: 'Motion Principles',
    lead: 'Movimento não é decoração — é linguagem. Define como elementos entram, saem, se transformam e respondem. A marca precisa de motion guidelines antes que cada dev invente sua própria animação.',
    sections: [
      {
        type: 'cards',
        title: 'Fundamentos de motion',
        items: [
          {
            eyebrow: 'Easing',
            title: 'Curvas de aceleração',
            body: 'Quais funções de easing o AdsMagic usa por padrão e quando sair do padrão é permitido.',
          },
          {
            eyebrow: 'Duration',
            title: 'Escala de tempo',
            body: 'Micro (100-200ms), Standard (250-400ms), Macro (500ms+) — quando usar cada faixa.',
          },
          {
            eyebrow: 'Personality',
            title: 'Caráter do movimento',
            body: 'O motion da marca deve ser rápido, preciso e confiante — nunca bouncy, lento ou decorativo.',
          },
        ],
      },
      {
        type: 'checklist',
        title: 'Regras mínimas',
        items: [
          'Nunca animar sem propósito: cada transição deve comunicar estado ou hierarquia.',
          'Priorizar performance: 60fps sempre, GPU-friendly properties (transform, opacity).',
          'Reduzir motion para prefers-reduced-motion, respeitando acessibilidade.',
        ],
      },
    ],
  },

  /* ─── Ecosystem ─── */

  'brand-governance-ecosystem-cobranding': {
    pageId: 'brand-governance-ecosystem-cobranding',
    tone: 'brand',
    status: 'Planned',
    eyebrow: 'Ecosystem',
    title: 'Co-branding',
    lead: 'Quando a marca convive com outras, precisa de regras claras de hierarquia, espaçamento e lockup. Co-branding sem governança gera inconsistência e diluição.',
    sections: [
      {
        type: 'cards',
        title: 'Diretrizes de co-branding',
        items: [
          {
            eyebrow: 'Hierarchy',
            title: 'Quem lidera o lockup',
            body: 'Quando o AdsMagic aparece como marca principal vs. marca parceira, e como a hierarquia muda.',
          },
          {
            eyebrow: 'Spacing',
            title: 'Regras de convivência',
            body: 'Distância mínima entre logos, separadores visuais e templates pré-aprovados para co-branding.',
          },
          {
            eyebrow: 'Restrictions',
            title: 'O que não permitimos',
            body: 'Alteração de cores, deformação, reposicionamento do star-mark e uso em fundos não aprovados.',
          },
        ],
      },
      {
        type: 'checklist',
        title: 'Checklist para parcerias',
        items: [
          'Solicitar aprovação de lockup antes de publicar qualquer material co-branded.',
          'Não redimensionar logos parceiros desproporcionalmente em relação ao AdsMagic.',
          'Manter zona de proteção mínima de 2x a altura do star-mark entre marcas.',
        ],
      },
    ],
  },
}