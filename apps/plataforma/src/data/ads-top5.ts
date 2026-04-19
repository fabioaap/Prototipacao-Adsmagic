/**
 * Top 5 anúncios Meta — modelagem Tintim.
 *
 * Fonte editorial: workspace/docs/docs/marketing/anuncios-meta-top5-tintim.md
 *
 * Este arquivo é o contrato de dados consumido por
 * apps/plataforma/src/views/styleguide/pages/BrandAdsTop5Page.vue
 * para renderizar a preview visual dos 5 anúncios no Brand OS.
 *
 * Cada `AdSlide` carrega três camadas:
 *   1. Copy de anúncio (primaryTextShort/Long, headlineAd, description, ctaButton)
 *   2. Criativo 1:1 (overlayKicker/Line1/Line2, emphasisWord, composition, assets)
 *   3. Grafismos de marca (bars, glows, showStar, starColor) — mesmo sistema
 *      usado em src/data/post1-carousel.ts
 */

export type AdAwareness =
  | 'inconsciente'
  | 'consciente-problema'
  | 'consciente-solucao'
  | 'consciente-produto'
  | 'consciente-oferta'

export type AdComposition =
  | 'speech-bubble' // balão gigante "E AS VENDAS?"
  | 'split-inequality' // CONVERSA ≠ VENDA
  | 'black-box' // caixa-preta engolindo a verba
  | 'triangular-convergence' // 3 números convergindo no ícone
  | 'split-screen' // lead defende vs venda renova

export interface AdBar {
  tone: 'blue' | 'green'
  /** Percentual horizontal da origem (0–100). */
  x: number
  /** Percentual vertical da origem (0–100). */
  y: number
  /** Comprimento relativo (0–100). */
  length: number
  /** Espessura em px. */
  thickness: number
  /** Ângulo em graus. Default 135. */
  angle?: number
  /** 0–1. Default 0.28. */
  opacity?: number
}

export interface AdGlow {
  position:
    | 'tl'
    | 'tr'
    | 'bl'
    | 'br'
    | 'center-left'
    | 'center-right'
    | 'center'
  color: 'green' | 'blue' | 'navy'
  opacity: number
  radius: number
}

export type SvgTextTone = 'primary' | 'accent' | 'muted' | 'dim'

export interface AdSlideSvgLayoutOverride {
  logoY?: number
  logoScale?: number
  headlineY?: number
  bodyY?: number
  descY?: number
  ctaY?: number
  ctaWidth?: number
  bodyMaxWidth?: number
}

export interface AdSlideSvgTypographyOverride {
  headlineSizeSquare?: number
  headlineSizeStory?: number
  headlineLineHeight?: number
  bodySizeSquare?: number
  bodySizeStory?: number
  descSizeSquare?: number
  descSizeStory?: number
}

export interface AdSlideSvgOverrides {
  layout?: Partial<Record<'square' | 'story', AdSlideSvgLayoutOverride>>
  typography?: AdSlideSvgTypographyOverride
  colors?: {
    body?: SvgTextTone
    desc?: SvgTextTone
  }
  bodyEmphasisOnly?: boolean
  ctaSuffix?: string
}

export interface AdSlide {
  /** 1..5 */
  number: number
  /** Nome interno curto para debug e UI. */
  internalName: string
  /** ID do anúncio de referência (Biblioteca de Anúncios do Tintim, page 105626472372076). */
  referenceAdId: string
  /** Ângulo modelado do Tintim (legenda editorial curta). */
  angle: string
  awareness: AdAwareness

  // ─── Copy Meta Ads ───
  primaryTextShort: string
  primaryTextLong: string
  headlineAd: string
  description: string
  ctaButton: 'Saiba mais' | 'Fale conosco'

  // ─── Copy overlay no criativo ───
  overlayKicker: string
  overlayLine1: string
  overlayLine2: string
  /** Palavra que recebe o acento verde #3BB56D dentro do headline overlay. */
  emphasisWord: string
  /** Microcopy exibida no rodapé do criativo (opcional). */
  footerMicrocopy?: string

  // ─── Criativo visual ───
  composition: AdComposition
  /** Notas sobre atores/personagens/assets, consumidas pela página para render descritivo. */
  creativeElements: {
    actors: string
    graphics: string
    characters: string
    brandAssets: string
    contrast: string
  }
  bars: AdBar[]
  glows: AdGlow[]
  showStar: boolean
  starColor: 'white' | 'green'
  svgOverrides?: AdSlideSvgOverrides

  // ─── Prompt para geração ───
  nanoBananaPrompt: string

  /**
   * Caminho (relativo a /public) para a imagem gerada pelo Nano Banana.
   * Quando presente, o canvas 1:1 do mockup usa essa foto como hero
   * e subordina bars/glows/overlay como camada de acento.
   * Preencher após rodar `npm run gen:ads`.
   */
  heroImage?: string
}

export const adsTop5 = {
  title: 'Top 5 anúncios Meta — modelagem Tintim',
  awareness: 'Consciente do problema → consciente da solução',
  description:
    'Cinco anúncios de feed (1:1) que aplicam a mensagem-mãe "Pare de reportar lead. Comece a provar venda." aos ângulos de maior veiculação do Tintim, respeitando o posicionamento editorial do Adsmagic.',
  destination: 'https://adsmagic.com.br/para-agencias',
  slides: [
    // ─── Anúncio 1 — Reunião mensal de resultado ───
    {
      number: 1,
      internalName: 'Reunião mensal de resultado',
      referenceAdId: '2298289447325682',
      angle: 'Reunião de métricas erradas',
      awareness: 'consciente-problema',
      primaryTextShort:
        'Tem reunião que vira cobrança em 1 pergunta: cadê a venda?',
      primaryTextLong:
        'Todo dono de agência conhece essa cena: o cliente abre o relatório e a pergunta não é sobre CPL. É sobre venda. Se a resposta ainda depende de planilha, memória do comercial ou sensação de qualidade, sua autoridade já entrou curta na reunião. O Adsmagic conecta Ads, WhatsApp e fechamento comercial para transformar campanha em prova de venda. Agende uma demo diagnóstica e veja como entrar na próxima reunião com a resposta certa na tela.',
      headlineAd: 'Quando o cliente cobra venda, lead não basta.',
      description: 'Venda provada. Não lead defendido.',
      ctaButton: 'Saiba mais',
      overlayKicker: 'Na reunião mensal',
      overlayLine1: 'Cliente cobra venda.',
      overlayLine2: 'Lead não sustenta conta.',
      emphasisWord: 'venda',
      footerMicrocopy: 'Ads + WhatsApp + fechamento para provar venda.',
      composition: 'speech-bubble',
      creativeElements: {
        actors:
          'Dono(a) de agência brasileiro(a), 35–45 anos, smart casual (camisa de linho sem gravata ou blazer navy sobre camiseta), sentado em sala de reunião moderna de agência (parede com pôsteres de campanha desfocados). Expressão séria e contida, não sorriso stock; enquadramento meio-busto, olhar reto para a câmera como founder-to-camera.',
        graphics:
          'Fotografia com grading navy frio + leve vinheta; 3 barras diagonais 135° (2 azuis longas + 1 verde curta) sobrepostas a 20% de opacidade como camada de marca; sparkle verde #3BB56D no rodapé direito.',
        characters:
          'Acima da pessoa, balão tipográfico editorial gigante "E AS VENDAS?" em branco, como se fosse a pergunta do cliente pairando na sala. Ao fundo desfocado, notebook aberto exibindo o dashboard Adsmagic North Star (cartões "Gastos anúncios R$ 50.000" e "Receita R$ ?" em destaque).',
        brandAssets: 'logo-wordmark-white.svg no topo esquerdo em h≈24px.',
        contrast:
          'Pessoa iluminada com key light lateral; palavra "venda" no overlay inferior em #3BB56D, "lead" com strike-through editorial branco.',
      },
      bars: [
        {tone: 'blue', x: -5, y: 18, length: 90, thickness: 6, opacity: 0.3},
        {tone: 'blue', x: 10, y: 72, length: 85, thickness: 4, opacity: 0.22},
        {tone: 'green', x: 68, y: 88, length: 30, thickness: 5, opacity: 0.55},
      ],
      glows: [
        {position: 'tl', color: 'blue', opacity: 0.45, radius: 380},
        {position: 'br', color: 'green', opacity: 0.32, radius: 320},
      ],
      showStar: true,
      starColor: 'green',
      nanoBananaPrompt:
        'Anuncio Meta 1:1, fotografia editorial cinematografica estilo A24 corporativo, plano meio-busto de dono(a) de agencia brasileiro(a) de 38 anos, smart casual (camisa de linho off-white sem gravata ou blazer navy sobre camiseta cinza), sentado(a) em sala de reuniao de agencia moderna com paineis acusticos e posters de campanha desfocados ao fundo; olhar reto e sereno para a camera, sem sorriso stock; iluminacao chiaroscuro lateral com key light quente de janela e fill frio azul, grading geral navy #000E50; camera iPhone 15 Pro 35mm, f/2.8, shallow depth of field; atras da pessoa, notebook MacBook aberto em desfoque bokeh exibindo tela real do dashboard Adsmagic North Star (cartoes visiveis "Gastos anuncios R$ 50.000" e "Receita R$ 6.060"), header branco com chips "Projeto: Projeto Demo" e "WhatsApp Desconectado"; SOBRE a fotografia, balao tipografico editorial gigante "E AS VENDAS?" em branco estourado inclinado 2 graus emergindo do lado direito como pergunta do cliente pairando na sala; overlay inferior com headline em duas linhas "Cliente cobra venda. / Lead nao sustenta conta." (palavra venda em verde #3BB56D, palavra lead com strike-through branco); kicker superior "NA REUNIAO MENSAL" em tracking largo branco 70% opacidade; logo-wordmark-white.svg topo esquerdo altura pequena; 2 barras diagonais 135 graus azuis #00185D a 20% opacidade cruzando as laterais + 1 barra verde #3BB56D curta no canto inferior direito; sparkle verde 4 pontas no rodape; microcopy inferior "Ads + WhatsApp + fechamento para provar venda."; negativos: stock photo sorridente corporativo, dashboard SaaS generico fake, neon roxo, grafico 3D flutuante, balao de chat estilo app, emoji, pose de braco cruzado classica, iluminacao chapada frontal.',
      heroImage: '/img/ads-top5/slide-1.png',
    },

    // ─── Anúncio 2 — Conversa ≠ venda ───
    {
      number: 2,
      internalName: 'Conversa ≠ venda',
      referenceAdId: '1711655889820686',
      angle: 'Dado enganoso (conversa iniciada ≠ venda)',
      awareness: 'consciente-problema',
      primaryTextShort:
        'Abrir conversa não é resultado. Resultado é venda.',
      primaryTextLong:
        'O mercado se acostumou a chamar conversa iniciada de resultado. Seu cliente, não. Conversa abre atendimento. Venda é o que sustenta verba, fee e renovação. O Adsmagic conecta Ads, WhatsApp e fechamento comercial para mostrar o que virou proposta, aprovação e venda, em vez de parar no volume de conversa. Agende uma demo diagnóstica e veja a diferença entre abrir chat e provar resultado.',
      headlineAd: 'Conversa não fecha contrato.',
      description: 'Venda é resultado. Conversa é entrada.',
      ctaButton: 'Saiba mais',
      overlayKicker: 'O dado que engana',
      overlayLine1: 'Conversa abre funil.',
      overlayLine2: 'Venda fecha argumento.',
      emphasisWord: 'venda',
      footerMicrocopy:
        'O mercado chama conversa. O cliente chama venda.',
      composition: 'split-inequality',
      creativeElements: {
        actors:
          'Mão brasileira (pele clara ou média, sem joias chamativas, manga de camisa social arregaçada) segurando um iPhone preto na diagonal no lado esquerdo da composição, como se estivesse em reunião mostrando evidência; enquadramento flat-lay levemente inclinado.',
        graphics:
          'Tela do iPhone exibindo uma conversa realista de WhatsApp Business com 3 balões verdes de "conversa iniciada" (horário visível, status visto); sobre a tela, selo editorial "CONVERSA". No lado direito, MacBook aberto com o dashboard Adsmagic de funil mostrando cartão destacado "Vendas: 8" e "Receita R$ 6.060,00"; sobre ele, selo editorial "VENDA". Glow verde central baixo marcando o fechamento.',
        characters:
          'Entre o iPhone e o MacBook, sinal ≠ enorme em branco como cesura visual. Mesa escura de agência (madeira escura ou laminado navy) como plano de apoio.',
        brandAssets:
          'logo-wordmark-white.svg no topo direito; logo-icon.svg como watermark no rodapé esquerdo a 35% opacidade; 1 barra diagonal azul curta + 1 barra verde curta como acento de marca, a 22% opacidade.',
        contrast:
          'Lado do iPhone com grading frio azul; lado do MacBook com iluminação mais quente e highlight verde #3BB56D na UI; palavra-chave "não é" em #3BB56D com underline editorial no primary text.',
      },
      bars: [
        {tone: 'blue', x: -10, y: 25, length: 55, thickness: 5, opacity: 0.28},
        {tone: 'blue', x: 55, y: 70, length: 55, thickness: 5, opacity: 0.28},
        {tone: 'green', x: 42, y: 50, length: 20, thickness: 6, opacity: 0.6},
      ],
      glows: [
        {position: 'center-left', color: 'blue', opacity: 0.4, radius: 300},
        {position: 'center-right', color: 'green', opacity: 0.35, radius: 300},
      ],
      showStar: false,
      starColor: 'white',
      nanoBananaPrompt:
        'Anuncio Meta 1:1, fotografia editorial flat-lay cinematografica; mesa de agencia com laminado navy escuro visto de cima levemente inclinado; no lado esquerdo, mao brasileira com manga de camisa social arregacada segurando um iPhone 15 preto na diagonal, tela acesa com conversa real de WhatsApp Business (3 baloes verdes de mensagem de "conversa iniciada" com horario 10:42, status duplo check verde); no lado direito, MacBook Pro aberto exibindo tela real do dashboard Adsmagic com cartao destacado "Vendas: 8 negocios fechados" e logo abaixo "Taxa de vendas 11,76%" + "Receita R$ 6.060,00", header com chip "WhatsApp Desconectado" em vermelho sutil; sobre a tela do iPhone, selo tipografico branco "CONVERSA"; sobre a tela do MacBook, selo tipografico verde #3BB56D "VENDA"; entre os dois dispositivos, sinal "≠" enorme em branco flutuando como cesura visual; fundo geral gradiente navy #000E50 ao #00185D esfumado; lado esquerdo com grading frio azul, lado direito com key light quente e highlight verde sutil vindo do MacBook; camera 45mm f/2.8 overhead inclinada 15 graus; logo-wordmark-white.svg topo direito pequeno; logo-icon.svg watermark rodape esquerdo a 35% opacidade; 1 barra diagonal 135 graus azul curta e 1 barra verde curta a 22% opacidade como acento; kicker superior "O DADO QUE ENGANA" em tracking largo branco 70%; headline inferior "Conversa abre funil. / Venda fecha argumento."; microcopy "O mercado chama conversa. O cliente chama venda."; negativos: ilustracao vetorial de chat, mascote do WhatsApp, emoji flutuante, stock photo sorridente, neon roxo, UI de SaaS generico fake, personagem 3D, grafico pizza, composicao simetrica centralizada batida.',
      heroImage: '/img/ads-top5/slide-2.png',
    },

    // ─── Anúncio 3 — Onde foi parar a verba ───
    {
      number: 3,
      internalName: 'Onde foi parar a verba',
      referenceAdId: '4196883800572734',
      angle: 'Gasta em tráfego e não sabe quantas vendas vieram',
      awareness: 'consciente-problema',
      primaryTextShort:
        'Mostrar gasto é fácil. Difícil é provar a venda que voltou.',
      primaryTextLong:
        'Todo dashboard mostra gasto. Poucos mostram o que voltou em venda. Quando a verba sobe, a tolerância para suposição some. Mostrar investimento, CPL e volume não resolve a pergunta central: o que isso virou em venda? Se essa resposta continua escondida entre WhatsApp, proposta e fechamento, a agência defende mídia no escuro. O Adsmagic conecta Ads, WhatsApp e fechamento comercial para mostrar onde a verba virou venda e onde o funil travou. Agende uma demo diagnóstica.',
      headlineAd: 'Sem prova de venda, verba vira cobrança.',
      description: 'Do clique ao fechamento, sem caixa-preta.',
      ctaButton: 'Saiba mais',
      overlayKicker: 'Sem caixa-preta',
      overlayLine1: 'Todo mundo mostra gasto.',
      overlayLine2: 'Poucos provam venda.',
      emphasisWord: 'venda',
      footerMicrocopy:
        'Pare de estimar. Comece a provar venda.',
      composition: 'black-box',
      creativeElements: {
        actors:
          'Media buyer mulher brasileira, 28–34 anos, estética de agência moderna (camiseta básica, tatuagem discreta no braço opcional, cabelo preso, óculos), sentada à mesa em home office ou sala de mídia com luzes neon navy/verde suaves ao fundo desfocadas; expressão apreensiva e concentrada, não pânico stock; plano meio-busto em 3/4 virada para o laptop.',
        graphics:
          'Laptop aberto na frente da pessoa exibindo o dashboard Adsmagic com cartão "Gastos anúncios R$ 50.000,00" em destaque; metade direita da tela se dissolve em pixels/glitch preto formando uma "caixa-preta" onde a cifra entra e some. Luz do monitor refletida no rosto.',
        characters:
          'Sobre a tela (camada overlay), seta afilada descendente branca sai de "R$ 50.000" e entra no glitch preto; headline sobreposta abaixo "TODO MUNDO MOSTRA GASTO. / POUCOS PROVAM VENDA.".',
        brandAssets:
          'logo-wordmark-white.svg no rodapé; selo textual "DEMO DIAGNÓSTICA GRATUITA" em pequeno badge acima do rodapé.',
        contrast:
          'Pessoa e mesa em navy frio; tela do laptop com highlight UI Adsmagic real (branco + navy + acento verde). Palavra "venda" no overlay em #3BB56D; caixa-preta com gradiente radial #00082A.',
      },
      bars: [
        {tone: 'blue', x: -8, y: 15, length: 85, thickness: 5, opacity: 0.28},
        {tone: 'blue', x: 10, y: 82, length: 85, thickness: 4, opacity: 0.22},
        {tone: 'green', x: 50, y: 50, length: 15, thickness: 4, opacity: 0.7},
      ],
      glows: [
        {position: 'center', color: 'navy', opacity: 0.55, radius: 360},
        {position: 'bl', color: 'blue', opacity: 0.32, radius: 280},
      ],
      showStar: true,
      starColor: 'green',
      nanoBananaPrompt:
        'Anuncio Meta 1:1, fotografia editorial cinematografica, plano meio-busto 3/4 de media buyer mulher brasileira de 30 anos sentada em home office de agencia, camiseta basica cinza, cabelo preso em coque baixo, oculos de grau, sem sorriso forcado — expressao concentrada e levemente apreensiva olhando para o laptop; laptop MacBook aberto a frente dela exibindo tela real do dashboard Adsmagic com cartao grande "Gastos anuncios R$ 50.000,00" e "Receita R$ ?" em destaque, header com chips "Projeto: Projeto Demo" e "WhatsApp Desconectado"; metade direita da tela do laptop se dissolvendo em glitch/pixel preto formando uma "caixa-preta" retangular #00082A com gradiente radial por dentro, efeito de dados sumindo; luz do monitor refletida azul-navy no rosto, key light lateral quente de janela discreta; fundo de escritorio desfocado com painel de corticera e posters de campanha em bokeh, grading geral navy #000E50/#00185D; camera 50mm f/2.2 shallow depth; SOBRE a imagem, seta afilada descendente branca saindo da cifra "R$ 50.000" e entrando no glitch preto, headline sobreposta abaixo do laptop "TODO MUNDO MOSTRA GASTO. / POUCOS PROVAM VENDA." em branco com a palavra "venda" em verde #3BB56D, kicker superior "SEM CAIXA-PRETA" em tracking largo branco 70%; logo-wordmark-white.svg rodape centralizado discreto, pequeno badge "DEMO DIAGNOSTICA GRATUITA" acima; 2 barras diagonais 135 graus azuis longas a 22% opacidade nas quinas + 1 barra verde curta entrando na caixa-preta; microcopy inferior "Pare de estimar. Comece a provar venda."; negativos: cofre literal, maleta de dinheiro, icone de moeda 3D, estetica fintech neon, hacker com capuz, foto stock de executivo com mao na cabeca, neon roxo, gradient flou pastel, mascote.',
      heroImage: '/img/ads-top5/slide-3.png',
    },

    // ─── Anúncio 4 — Meta vendeu, Google também ───
    {
      number: 4,
      internalName: 'Meta vendeu, Google também',
      referenceAdId: '953694203842936',
      angle: 'Conflito de atribuição entre canais',
      awareness: 'consciente-solucao',
      primaryTextShort:
        'Quando cada tela jura uma venda diferente, ninguém lidera a conta.',
      primaryTextLong:
        'Toda operação multi-canal conhece esse impasse: Meta mostra uma venda, Google mostra outra, o fechamento traz uma terceira leitura. Sem uma visão unificada, a agência vira mediadora de relatório em vez de liderar decisão. O Adsmagic conecta Ads, WhatsApp e fechamento comercial para devolver uma leitura única da venda e enviar conversões com contexto para cada canal. Agende uma demo diagnóstica e veja como parar de arbitrar plataforma e voltar a provar venda.',
      headlineAd: 'Três telas. Uma venda defensável.',
      description: 'Uma venda. Não três versões.',
      ctaButton: 'Saiba mais',
      overlayKicker: 'Na mesma conta',
      overlayLine1: 'Cada tela reivindica venda.',
      overlayLine2: 'Quem prova a venda real?',
      emphasisWord: 'venda',
      footerMicrocopy: 'Ads + WhatsApp + fechamento em uma leitura só.',
      composition: 'triangular-convergence',
      creativeElements: {
        actors:
          'Três profissionais de agência brasileira (diretor comercial ~40a terno sem gravata; head de mídia mulher ~32a blazer caramelo sobre camiseta; estrategista jovem ~28a hoodie ou camisa xadrez) vistos de costas/3-quarters, em pé numa sala de reunião moderna, olhando juntos para uma TV 65” montada na parede.',
        graphics:
          'Na TV, dashboard Adsmagic em tela cheia mostrando três colunas de atribuição lado a lado: "META · 120 vendas", "GOOGLE · 90 vendas", "FECHAMENTO · 70 vendas" com a última coluna destacada em verde #3BB56D. Linhas finas brancas animadas convergindo das duas primeiras para a terceira.',
        characters:
          'Luz azul da TV ilumina os rostos em contraluz; sala com iluminação noturna de agência (paineis acústicos escuros, cadeiras Eames). Overlay tipográfico superior "CADA TELA REIVINDICA VENDA. / QUEM PROVA A VENDA REAL?".',
        brandAssets:
          'logo-wordmark-white.svg no topo esquerdo; logo-icon.svg aparece discreto no header do dashboard da TV.',
        contrast:
          'Pessoas em silhueta contraluz azul-navy; TV com branco UI + destaque verde #3BB56D no número 70 puxando o olho.',
      },
      bars: [
        {tone: 'blue', x: -5, y: 20, length: 60, thickness: 5, opacity: 0.28},
        {tone: 'blue', x: 55, y: 20, length: 55, thickness: 5, opacity: 0.28},
        {tone: 'green', x: 20, y: 65, length: 65, thickness: 5, opacity: 0.5},
      ],
      glows: [
        {position: 'center', color: 'green', opacity: 0.28, radius: 300},
        {position: 'tr', color: 'blue', opacity: 0.35, radius: 280},
      ],
      showStar: false,
      starColor: 'white',
      nanoBananaPrompt:
        'Anuncio Meta 1:1, fotografia editorial cinematografica estilo A24 corporativo, plano wide 24mm levemente plongee mostrando sala de reuniao de agencia brasileira moderna vista de tras, tres profissionais em pe de costas/tres-quartos para a camera olhando para uma TV 65 polegadas montada na parede principal: diretor comercial homem 40 anos terno navy sem gravata, head de midia mulher 32 anos blazer caramelo sobre camiseta branca cabelo solto, estrategista jovem 28 anos hoodie cinza; iluminacao noturna de agencia com paineis acusticos escuros, mesa de reuniao de madeira com notebooks abertos, cadeiras Eames; a luz principal vem da propria TV em contraluz azul navy iluminando os rostos parcialmente; na TV, tela cheia real do dashboard Adsmagic de atribuicao mostrando tres cartoes grandes lado a lado "META · 120 vendas", "GOOGLE · 90 vendas", "FECHAMENTO · 70 vendas" com o terceiro em destaque verde #3BB56D e levemente maior, linhas finas brancas animadas convergindo dos dois primeiros para o terceiro; camera Sony FX3 24mm f/4, composicao simetrica, grading navy #000E50/#00185D; SOBRE a imagem, overlay tipografico superior "CADA TELA REIVINDICA VENDA. / QUEM PROVA A VENDA REAL?" em branco com "VENDA" em verde; kicker discreto "NA MESMA CONTA"; microcopy inferior "Ads + WhatsApp + fechamento em uma leitura so."; logo-wordmark-white.svg topo esquerdo pequeno; 2 barras diagonais 135 graus azuis convergindo a 18% opacidade + 1 barra verde curta cortando o centro; negativos: logos oficiais Meta/Google visiveis, mascote, personagem cartoon, pose de luta versus, ring de boxe, neon roxo, grafico pizza, stock photo de reuniao sorrindo, palestrante apontando, estetica conferencia TED, figurinos paletizados demais.',
      heroImage: '/img/ads-top5/slide-4.png',
    },

    // ─── Anúncio 5 — Concorrente mostra venda ───
    {
      number: 5,
      internalName: 'Concorrente mostra receita',
      referenceAdId: '3798841463744998',
      angle: 'Diferencial competitivo — a agência ao lado mostra receita',
      awareness: 'consciente-solucao',
      primaryTextShort:
        'Seu concorrente\nmostra receita. Você\nvai mostrar o quê?',
      primaryTextLong:
        'Na renovação, prova pesa mais que promessa. Quando seu concorrente entra na reunião mostrando receita atribuída e você ainda precisa defender lead, a conversa muda de nível. O cliente tende a renovar com quem prova impacto no caixa, não com quem pede mais um ciclo de confiança. O Adsmagic conecta Ads, WhatsApp e fechamento comercial para transformar campanha em prova de receita. Agende uma demo diagnóstica e veja o que sua operação mostraria hoje em uma mesa de renovação.',
      headlineAd: 'Seu concorrente mostra receita. Você vai mostrar o quê?',
      description: 'Na renovação, prova pesa mais que promessa.',
      ctaButton: 'Saiba mais',
      overlayKicker: 'Na renovação',
      overlayLine1: 'Uma defende lead.',
      overlayLine2: 'A outra prova receita.',
      emphasisWord: 'receita',
      footerMicrocopy: 'O cliente renova com quem prova receita',
      composition: 'split-screen',
      creativeElements: {
        actors:
          'Split-screen vertical 50/50 com DUAS mesmas cenas de reunião de renovação de contrato. Esquerda: CEO de agência A (homem brasileiro ~42a camisa social azul clara, sem gravata) mostrando iPad ao cliente (mulher ~45a executiva, blazer cinza) que está com braços cruzados, cético, olhando para tela; grading frio azul/dessaturado. Direita: mesma cena com CEO de agência B (mulher brasileira ~38a blazer preto) mostrando outro iPad ao MESMO cliente, que agora se inclina para frente interessada, anotando; grading mais quente com highlights verdes.',
        graphics:
          'Tela do iPad esquerdo: dashboard genérico cinza-azul com "Leads: 3.240" e gráfico plano vazio. Tela do iPad direito: dashboard Adsmagic real mostrando "Receita atribuída: R$ 187.420" + "Vendas: 12 fechadas" com acentos verdes #3BB56D. Linha vertical fina verde separando os lados.',
        characters:
          'A mesma cliente executiva aparece nos dois lados para tornar explícita a comparação emocional. Expressão da cliente: esquerda = fechada, direita = engajada.',
        brandAssets:
          'logo-wordmark-white.svg centralizado no rodapé sobre a linha divisória verde.',
        contrast:
          'Lado esquerdo dessaturado, paleta navy fria; lado direito com key light quente + highlight verde #3BB56D na UI e no rosto da cliente. Linha divisória como acento de marca.',
      },
      bars: [
        {tone: 'blue', x: -10, y: 25, length: 55, thickness: 5, opacity: 0.26},
        {tone: 'blue', x: -5, y: 65, length: 50, thickness: 4, opacity: 0.22},
        {tone: 'green', x: 50, y: 40, length: 55, thickness: 5, opacity: 0.5},
      ],
      glows: [
        {position: 'center-left', color: 'blue', opacity: 0.3, radius: 320},
        {position: 'center-right', color: 'green', opacity: 0.42, radius: 340},
      ],
      showStar: true,
      starColor: 'white',
      svgOverrides: {
        layout: {
          square: {
            headlineY: 0.215,
            bodyY: 0.54,
            descY: 0.66,
            ctaY: 0.86,
            bodyMaxWidth: 940,
          },
          story: {
            headlineY: 0.16,
            bodyY: 0.43,
            descY: 0.515,
            ctaY: 0.69,
            bodyMaxWidth: 920,
          },
        },
        typography: {
          headlineSizeSquare: 88,
          headlineSizeStory: 102,
          headlineLineHeight: 1.04,
          bodySizeSquare: 34,
          bodySizeStory: 38,
          descSizeSquare: 24,
          descSizeStory: 26,
        },
        colors: {
          body: 'accent',
          desc: 'muted',
        },
        bodyEmphasisOnly: false,
        ctaSuffix: '⌄',
      },
      nanoBananaPrompt:
        'Anuncio Meta 1:1 split-screen vertical 50/50, fotografia editorial cinematografica estilo documentario corporativo; AMBOS os lados mostram a mesma cena de reuniao de renovacao de contrato numa sala de agencia brasileira moderna com paineis de madeira clara e vidro, mesa redonda; LADO ESQUERDO: CEO de agencia A (homem brasileiro 42 anos, camisa social azul claro sem gravata, relogio classico) mostrando um iPad a uma cliente (mulher executiva brasileira 45 anos blazer cinza, cabelo meio-longo) sentada a frente; a cliente de bracos cruzados, expressao cetica e distante, recostada na cadeira; tela do iPad visivel com dashboard generico cinza-azul "LEADS: 3.240" e grafico plano; grading frio azul dessaturado, iluminacao fluorescente baixa, janela cinza ao fundo; LADO DIREITO: mesma sala, MESMA cliente (continuidade visual proposital), agora com CEO de agencia B (mulher brasileira 38 anos, blazer preto sobre camiseta branca, cabelo curto) mostrando outro iPad; cliente inclinada para frente, mao no queixo, expressao engajada, anotando no caderno; tela do iPad visivel com dashboard Adsmagic real mostrando "Receita atribuida R$ 187.420" e "Vendas: 12 negocios fechados" com destaque verde #3BB56D; grading mais quente, key light lateral de janela dourada, highlight verde sutil da tela reflete no rosto da cliente; camera 35mm f/2.8 em ambos os lados, altura de olho; SOBRE a imagem, linha vertical fina verde #3BB56D dividindo os dois quadros no centro; kicker superior centralizado "NA RENOVACAO" em tracking largo branco 70%; headline inferior centralizada em duas linhas "UMA DEFENDE LEAD. / A OUTRA PROVA VENDA." em branco com "VENDA" em verde; microcopy inferior "O cliente compara com quem prova venda."; logo-wordmark-white.svg rodape centralizado sobre a linha divisoria; 2 barras diagonais 135 graus azuis a 20% opacidade no lado esquerdo + 1 barra verde atravessando o lado direito a 40%; negativos: confronto cartoon versus, estetica game of thrones, emoji, retrato stock sorridente de dentes, neon roxo, grafico pizza, overlay de dashboard ilustrado fake, mascote, personagem 3D, pose cruzada repetida em ambos os lados identicos (a diferenca de linguagem corporal e o ponto).',
      heroImage: '/img/ads-top5/slide-5.png',
    },
  ] satisfies AdSlide[],
} as const
