/**
 * Post 1 — "Quem é o Adsmagic?"
 * Série de 9 Carrosséis StoryBrand — prólogo e entrada do guia.
 *
 * Função narrativa: prólogo e entrada do guia.
 * Awareness dominante: Consciente do problema.
 * CTA do post: Salve este post para seguir a travessia com a régua certa.
 *
 * Fonte editorial (copy + prompts Nano Banana):
 *   workspace/docs/docs/marketing/copies-carrosseis-instagram-storybrand.md
 *
 * Gramática visual (confirmada em design-system/brand/Assts criativos instagram/Frame 2608178.svg):
 *   - Base: navy profundo (#000E50 / #00185D).
 *   - Corner glows: elipses borradas (dark navy #00082A) + leves halos azul/verde.
 *   - Barras: 3 × 135° gradient (2 azul + 1 verde) opacidade ~0.24, assinatura de marca.
 *   - Estrela 4-pontas côncava (brand sparkle): #3BB56D como acento hero quando a composição pede presença forte.
 *   - Tipografia: wordmark branco (logo-wordmark-white.svg); títulos bold, tracking apertado.
 *   - Assets reais em /logo-*.svg e /img/brand/*.svg.
 */

export type SlideComposition =
  | 'manifesto'
  | 'identity'
  | 'split-tension'
  | 'broken-diagram'
  | 'category-stack'
  | 'mechanism-asym'
  | 'bento-signals'
  | 'guide-editorial'
  | 'comparative-strikes'
  | 'cta-bookmark'

export type GrafismoBar = {
  /** tom da barra */
  tone: 'blue' | 'green'
  /** porcentagem horizontal de posição da linha (left = 0, right = 100) */
  x: number
  /** porcentagem vertical */
  y: number
  /** comprimento em % do container */
  length: number
  /** espessura em px */
  thickness: number
  /** ângulo em graus (135 padrão, mas variamos 125–145 sutilmente) */
  angle?: number
  /** opacidade (default 0.24) */
  opacity?: number
}

export type CornerGlow = {
  position: 'tl' | 'tr' | 'bl' | 'br' | 'center-left' | 'center-right'
  color: 'blue' | 'green' | 'navy'
  /** 0 a 1 */
  opacity: number
  /** raio em px (com blur grande) */
  radius: number
}

export type Post1Slide = {
  number: number
  composition: SlideComposition
  /** objetivo narrativo (para o painel lateral) */
  objective: string
  /** headline principal — usa \n para quebras */
  headline: string
  /** porção destacada (bold branco) — substring de headline se aplicável */
  emphasis?: string
  /** texto de apoio ou nota de intenção */
  supporting?: string
  /** assets reais em public/ */
  assets: string[]
  /** grafismos diagonais */
  bars: GrafismoBar[]
  /** glows */
  glows: CornerGlow[]
  /** nota de direção visual (painel lateral) */
  visualNote: string
  /** prompt Nano Banana original — fonte da verdade */
  nanoBananaPrompt: string
  /** mostra a estrela 4-pontas (sparkle brand) */
  showStar?: boolean
  /** cor da estrela quando visível */
  starColor?: 'green' | 'white'
}

export const post1: {
  id: string
  title: string
  description: string
  sb7Element: string
  awareness: string
  cta: string
  slides: Post1Slide[]
} = {
  id: 'post-1',
  title: 'Quem é o Adsmagic?',
  description:
    'Prólogo e entrada do guia. Abre a série posicionando a agência como herói e o Adsmagic como guia — categoria, mecanismo e promessa de visibilidade.',
  sb7Element: 'Guia (entrada)',
  awareness: 'Consciente do problema',
  cta: 'Salve este post para seguir a travessia com a régua certa.',
  slides: [
    {
      number: 1,
      composition: 'manifesto',
      objective: 'Abrir com identificação imediata',
      headline:
        'Se você ainda entrega lead quando o cliente quer receita, sua agência já entra na reunião perdendo.',
      emphasis: 'perdendo',
      supporting:
        'Antes de falar de ferramenta, precisa saber quem entra para fechar esse buraco.',
      assets: ['/logo-wordmark-white.svg'],
      bars: [
        { tone: 'blue', x: -10, y: 15, length: 55, thickness: 18, angle: 135 },
        { tone: 'blue', x: 55, y: 85, length: 70, thickness: 14, angle: 135 },
        { tone: 'green', x: 70, y: 10, length: 35, thickness: 12, angle: 135, opacity: 0.32 },
      ],
      glows: [
        { position: 'tr', color: 'blue', opacity: 0.45, radius: 380 },
        { position: 'bl', color: 'navy', opacity: 0.55, radius: 420 },
      ],
      visualNote:
        'Manifesto editorial 1:1. Headline gigante à esquerda, muito espaço negativo. Glow azul no canto superior direito. Sparkle verde grande como assinatura de marca no canto inferior direito (sem descer a pressão tipográfica).',
      nanoBananaPrompt:
        '1:1 manifesto editorial; asset logo-wordmark-white.svg; fundo #000E50 com gradiente navy profundo; 2 barras azuis 135 graus nas bordas e 1 barra verde; headline gigante a esquerda; glow azul canto superior direito; sem mockup; evitar stock, neon roxo, dashboard SaaS generico.',
      showStar: true,
      starColor: 'green',
    },
    {
      number: 2,
      composition: 'identity',
      objective: 'Definir quem é o herói',
      headline: 'O Adsmagic não fala com qualquer operação.',
      supporting:
        'Ele fala com agência e gestor que vendem pelo WhatsApp e se recusam a continuar sem prova do que virou proposta, aprovação e receita.',
      assets: ['/logo-wordmark-white.svg', '/img/brand/photo-mood-operational.svg'],
      bars: [
        { tone: 'blue', x: 40, y: 5, length: 65, thickness: 16, angle: 135 },
        { tone: 'blue', x: -5, y: 70, length: 50, thickness: 14, angle: 135 },
        { tone: 'green', x: 62, y: 92, length: 28, thickness: 10, angle: 135, opacity: 0.38 },
      ],
      glows: [
        { position: 'br', color: 'navy', opacity: 0.55, radius: 380 },
        { position: 'tl', color: 'blue', opacity: 0.32, radius: 300 },
      ],
      visualNote:
        'Identidade editorial 1:1. Crop da mood "operational" à direita em moldura navy; headline forte à esquerda sobre área limpa; wordmark no topo esquerdo. Tom escuro, sem sorriso stock.',
      nanoBananaPrompt:
        '1:1 editorial de identidade; assets logo-wordmark-white.svg e photo-mood-operational.svg; crop de rotina de agencia em tom escuro; barras azuis profundas e 1 verde de acento; texto forte sobre area limpa; glow baixo; evitar retrato corporativo stock, sorriso generico, fundo claro.',
    },
    {
      number: 3,
      composition: 'split-tension',
      objective: 'Mostrar o cenário atual do herói',
      headline: 'Você entrega clique, lead, CPL e volume.',
      supporting:
        'O cliente devolve a pergunta que realmente decide retenção: "o que disso virou dinheiro?"',
      assets: ['/img/brand/photo-mood-authority.svg', '/logo-wordmark-white.svg'],
      bars: [
        { tone: 'blue', x: 45, y: 12, length: 45, thickness: 12, angle: 135 },
        { tone: 'blue', x: -5, y: 88, length: 55, thickness: 12, angle: 135 },
        { tone: 'green', x: 82, y: 50, length: 20, thickness: 8, angle: 135, opacity: 0.28 },
      ],
      glows: [
        { position: 'tl', color: 'navy', opacity: 0.5, radius: 340 },
        { position: 'br', color: 'blue', opacity: 0.25, radius: 320 },
      ],
      visualNote:
        'Reunião tensa em split 1:1. Lado esquerdo: relatório/autoridade (photo-mood-authority.svg) em crop editorial. Lado direito: pergunta sublinhada em destaque maior. Grafismos discretos. Sem ícone de gráfico 3D.',
      nanoBananaPrompt:
        '1:1 cena de reuniao tensa; assets photo-mood-authority.svg e logo-wordmark-white.svg; composicao split com relatorio de um lado e pergunta em destaque do outro; grafismos discretos; glow minimo; evitar office generico, grafico 3D, cara de publicidade stock.',
    },
    {
      number: 4,
      composition: 'broken-diagram',
      objective: 'Nomear a quebra central',
      headline: 'O anúncio termina no lead.\nO problema do cliente não.',
      supporting:
        'A venda acontece na conversa, no comercial e no fechamento que a mídia quase sempre deixa invisíveis.',
      assets: ['/img/brand/illus-systems.svg'],
      bars: [
        { tone: 'blue', x: -5, y: 20, length: 55, thickness: 14, angle: 135 },
        { tone: 'blue', x: 55, y: 10, length: 48, thickness: 12, angle: 135 },
        { tone: 'blue', x: -10, y: 78, length: 60, thickness: 12, angle: 135 },
        { tone: 'green', x: 72, y: 90, length: 22, thickness: 10, angle: 135, opacity: 0.35 },
      ],
      glows: [
        { position: 'center-right', color: 'blue', opacity: 0.28, radius: 320 },
        { position: 'bl', color: 'navy', opacity: 0.55, radius: 360 },
      ],
      visualNote:
        'Headline no topo, diagrama quebrado ao centro (Ads → WhatsApp → Fechamento) com lacuna visível entre os estágios. 3 barras azuis direcionando o olhar pro gap; barra verde curta como sinal. Sem fluxograma futurista.',
      nanoBananaPrompt:
        '1:1 problema estrutural; asset illus-systems.svg; diagrama quebrado Ads para WhatsApp para Fechamento com lacuna central; 3 barras azuis 135 graus e 1 verde curta; headline no topo; glow azul lateral; evitar fluxograma futurista, UI fake complexa, neon.',
    },
    {
      number: 5,
      composition: 'category-stack',
      objective: 'Definir a categoria do produto',
      headline:
        'O Adsmagic existe para ligar o que o mercado insiste em separar.',
      supporting:
        'É atribuição, inteligência e envio de conversões para conectar Ads, WhatsApp e operação comercial em uma leitura só.',
      assets: ['/logo-icon.svg', '/img/brand/illus-systems.svg'],
      bars: [
        { tone: 'blue', x: -5, y: 25, length: 50, thickness: 16, angle: 135 },
        { tone: 'blue', x: 55, y: 82, length: 55, thickness: 14, angle: 135 },
        { tone: 'green', x: 70, y: 18, length: 30, thickness: 11, angle: 135, opacity: 0.4 },
      ],
      glows: [
        { position: 'tr', color: 'green', opacity: 0.22, radius: 320 },
        { position: 'bl', color: 'navy', opacity: 0.5, radius: 380 },
      ],
      visualNote:
        'Quadro de categoria 1:1. Três camadas empilhadas (Ads / WhatsApp / Comercial) conectadas por setas limpas à direita. Logo-icon em destaque superior direito como assinatura. Branding mais explícito.',
      nanoBananaPrompt:
        '1:1 quadro de categoria; assets logo-icon.svg e illus-systems.svg; composicao com tres camadas conectadas por setas limpas; fundo campaign navy; barras azuis em profundidade e 1 verde acento; branding mais explicito; evitar cartaz tech generico, excesso de icones, roxo.',
      showStar: true,
      starColor: 'green',
    },
    {
      number: 6,
      composition: 'mechanism-asym',
      objective: 'Mostrar as três camadas conectadas',
      headline:
        'Quando aquisição, conversa e fechamento contam histórias diferentes, a agência vira refém de suposição.',
      supporting: 'Quando contam a mesma história, decisão volta a ter direção.',
      assets: ['/img/brand/illus-data-flow.svg'],
      bars: [
        { tone: 'blue', x: -8, y: 18, length: 45, thickness: 14, angle: 135 },
        { tone: 'blue', x: 60, y: 88, length: 50, thickness: 12, angle: 135 },
        { tone: 'green', x: 78, y: 30, length: 24, thickness: 10, angle: 135, opacity: 0.36 },
      ],
      glows: [
        { position: 'tl', color: 'blue', opacity: 0.32, radius: 340 },
        { position: 'br', color: 'green', opacity: 0.2, radius: 300 },
      ],
      visualNote:
        'Mecanismo editorial assimétrico. Texto à esquerda (dois blocos), data-flow à direita como diagrama em três nós conectados. Glows em quinas opostas, um azul e um verde sutil.',
      nanoBananaPrompt:
        '1:1 mecanismo editorial; asset illus-data-flow.svg; flow em tres blocos com narrativa unica; composicao assimetrica com texto a esquerda e diagrama a direita; glow azul e verde suave nas quinas; evitar dashboard, wireframe cru, simetria perfeita.',
    },
    {
      number: 7,
      composition: 'bento-signals',
      objective: 'Explicar o tipo de visibilidade prometida',
      headline: 'Você passa a ver o que pesa de verdade na conta.',
      supporting:
        'Não só quem clicou, mas quem engajou, recebeu proposta, aprovou e comprou.',
      assets: [
        '/img/brand/icon-pictogram-growth.svg',
        '/logo-wordmark-white.svg',
      ],
      bars: [
        { tone: 'blue', x: -5, y: 8, length: 42, thickness: 10, angle: 135 },
        { tone: 'blue', x: 65, y: 92, length: 40, thickness: 10, angle: 135 },
        { tone: 'green', x: 85, y: 50, length: 18, thickness: 9, angle: 135, opacity: 0.38 },
      ],
      glows: [
        { position: 'br', color: 'green', opacity: 0.22, radius: 300 },
        { position: 'tl', color: 'navy', opacity: 0.4, radius: 320 },
      ],
      visualNote:
        'Bento 2x2 com 4 estágios: Clique · Proposta · Aprovado · Compra. Cada card com borda rounded-2xl, um pequeno ícone circular azul, texto branco. Card "Compra" destacado em gradient verde.',
      nanoBananaPrompt:
        '1:1 bento de visibilidade; assets icon-pictogram-growth.svg e logo-wordmark-white.svg; pequenos cards de estagios clique, proposta, aprovado, compra; barras azuis discretas e 1 verde; glow verde controlado; evitar KPI inventado, charts 3D, interface fake pesada.',
    },
    {
      number: 8,
      composition: 'guide-editorial',
      objective: 'Posicionar o Adsmagic como guia',
      headline:
        'Esse é o papel do Adsmagic: devolver sinal certo e contexto comercial.',
      supporting:
        'O protagonismo continua seu; o guia entra para tirar a agência do escuro.',
      assets: ['/logo-wordmark-white.svg', '/img/brand/icon-callout-marker.svg'],
      bars: [
        { tone: 'blue', x: 0, y: 22, length: 40, thickness: 12, angle: 135 },
        { tone: 'blue', x: 60, y: 78, length: 45, thickness: 12, angle: 135 },
        { tone: 'green', x: 72, y: 20, length: 22, thickness: 9, angle: 135, opacity: 0.3 },
      ],
      glows: [
        { position: 'tr', color: 'navy', opacity: 0.45, radius: 340 },
        { position: 'bl', color: 'blue', opacity: 0.18, radius: 280 },
      ],
      visualNote:
        'Guia editorial 1:1. Headline dominante com marcador visual (icon-callout-marker) à esquerda da frase principal, muito respiro. Wordmark discreto no topo. Sem badges aleatórios.',
      nanoBananaPrompt:
        '1:1 guia editorial; assets logo-wordmark-white.svg e icon-callout-marker.svg; headline dominante com marcador visual de orientacao; composicao limpa com muito respiro; 2 barras azuis e 1 verde; glow muito sutil; evitar hero brand excessivo, badge aleatorio, posters de startup.',
    },
    {
      number: 9,
      composition: 'comparative-strikes',
      objective: 'Delimitar o que o produto não é',
      headline:
        'Não é CRM para tocar operação inteira.\nNão é chatbot para mascarar atendimento.\nNão é rastreador de conversa para gerar volume vazio.',
      supporting:
        'A camada é outra: prova de receita aplicada à mídia.',
      assets: ['/logo-icon.svg'],
      bars: [
        { tone: 'blue', x: 48, y: 10, length: 40, thickness: 10, angle: 135 },
        { tone: 'blue', x: -5, y: 85, length: 45, thickness: 10, angle: 135 },
        { tone: 'green', x: 75, y: 90, length: 22, thickness: 9, angle: 135, opacity: 0.36 },
      ],
      glows: [
        { position: 'br', color: 'navy', opacity: 0.45, radius: 320 },
        { position: 'tl', color: 'navy', opacity: 0.35, radius: 300 },
      ],
      visualNote:
        'Comparativo editorial 1:1. Três blocos à esquerda com texto riscado (CRM / chatbot / rastreador). Bloco definitivo à direita em destaque navy-green. Logo-icon discreto no canto.',
      nanoBananaPrompt:
        '1:1 comparativo editorial; asset logo-icon.svg discreto; tres blocos riscados a esquerda e uma definicao forte a direita; grafismos mais secos; fundo navy; pouco glow; evitar icones cartoon, excesso de selos, visual de tabela burocratica.',
    },
    {
      number: 10,
      composition: 'cta-bookmark',
      objective: 'Fechar e abrir a próxima etapa',
      headline: 'Se isso já descreve a sua conta, salva este post.',
      supporting:
        'No próximo, a frase que muda o jogo fica explícita: pare de reportar lead e comece a provar venda.',
      assets: ['/logo-wordmark-white.svg', '/logo-icon.svg'],
      bars: [
        { tone: 'blue', x: -5, y: 20, length: 45, thickness: 12, angle: 135 },
        { tone: 'blue', x: 60, y: 15, length: 45, thickness: 12, angle: 135 },
        { tone: 'green', x: 30, y: 88, length: 55, thickness: 14, angle: 135, opacity: 0.5 },
      ],
      glows: [
        { position: 'br', color: 'green', opacity: 0.32, radius: 380 },
        { position: 'tl', color: 'navy', opacity: 0.45, radius: 340 },
      ],
      visualNote:
        'Slide de ponte e salvamento. Headline centralizado, CTA-rail inferior com ícone bookmark + "SALVA ESTE POST" em pill verde. Assinatura Adsmagic (wordmark + icon) no topo. Glow verde quente no canto inferior.',
      nanoBananaPrompt:
        '1:1 slide de ponte e salvamento; assets logo-wordmark-white.svg e logo-icon.svg; CTA rail com bookmark visual; 2 barras azuis e 1 verde mais viva; glow verde no canto inferior; composicao limpa; evitar call to action gritante, emojis, explosao grafica.',
      showStar: true,
      starColor: 'green',
    },
  ],
}
