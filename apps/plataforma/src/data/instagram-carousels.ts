/**
 * Instagram Carousels — StoryBrand SB7 Framework
 *
 * 7 carrosséis × 6 slides cada = 42 peças.
 * Jornada completa: Unaware → Most Aware.
 * Copy, visual direction e brand tokens para cada slide.
 */

export type SlideLayout =
  | 'hook'        // Slide 1 — capa com frase de impacto
  | 'narrative'   // Storytelling / dia-a-dia
  | 'contrast'    // Antes × Depois
  | 'steps'       // Passo-a-passo numerado
  | 'data'        // Métricas / números grandes
  | 'quote'       // Depoimento ou manifesto
  | 'cta'         // Call-to-action final
  | 'mockup'      // Tela de produto simulada

export type SlideAccent = 'green' | 'indigo' | 'white' | 'amber'

export interface CarouselSlide {
  /** Número do slide (1-6) */
  number: number
  /** Layout visual predominante */
  layout: SlideLayout
  /** Headline principal — texto grande */
  headline: string
  /** Texto de apoio — menor, abaixo do headline */
  supporting?: string
  /** Bullets ou itens listados */
  bullets?: string[]
  /** Métrica de destaque (números grandes) */
  metric?: { value: string; label: string }
  /** Emoji para contexto visual (usado sutilmente, não como ícone UI) */
  emoji?: string
  /** Cor de acento do slide */
  accent: SlideAccent
  /** Nota de direção visual para o designer */
  visualNote: string
}

export interface InstagramCarousel {
  /** ID do carrossel (c1..c7) */
  id: string
  /** Número sequencial */
  number: number
  /** Título editorial do carrossel */
  title: string
  /** Elemento StoryBrand mapeado */
  sb7Element: string
  /** Estágio de awareness */
  awareness: string
  /** Descrição curta */
  description: string
  /** Tag de série para branding */
  seriesTag: string
  /** 6 slides */
  slides: CarouselSlide[]
}

export const instagramCarousels: InstagramCarousel[] = [
  // ─── C1: O Herói e Sua Dor ───────────────────────────
  {
    id: 'c1',
    number: 1,
    title: 'O Herói e Sua Dor',
    sb7Element: 'Character + External Problem',
    awareness: 'Unaware → Problem Aware',
    description: 'Apresenta o dia-a-dia do gestor de tráfego e o gap de dados entre clique e venda.',
    seriesTag: 'Série: Atribuição Real',
    slides: [
      {
        number: 1,
        layout: 'hook',
        headline: '200 leads,\n0 vendas comprovadas.',
        supporting: 'Mas o CPL tá ótimo, né?',
        accent: 'green',
        emoji: '😅',
        visualNote: 'Fundo azul profundo com glow verde sutil. Tipografia bold gigante. Emoji no canto inferior como sarcasmo visual.',
      },
      {
        number: 2,
        layout: 'narrative',
        headline: 'O dia-a-dia do gestor de tráfego:',
        bullets: [
          'Meta Ads aberto na aba 1',
          'WhatsApp Web na aba 2',
          'Planilha de leads na aba 3',
          'E na aba 4… uma oração',
        ],
        accent: 'white',
        visualNote: 'Ícones minimalistas brancos para cada aba. Layout de lista vertical com spacing generoso. Grafismos diagonais sutis.',
      },
      {
        number: 3,
        layout: 'narrative',
        headline: 'A campanha roda.\nOs leads chegam.\nO WhatsApp lota.',
        supporting: 'Mas ninguém sabe o que vendeu.',
        accent: 'green',
        visualNote: 'Três linhas empilhadas com check verde → última linha com "?" vermelho sutil. Ritmo visual de queda.',
      },
      {
        number: 4,
        layout: 'quote',
        headline: 'O gerenciador mostra cliques.\nO WhatsApp mostra conversas.',
        supporting: 'Mas ninguém mostra a VENDA.',
        accent: 'amber',
        visualNote: '"VENDA" em destaque amarelo/amber. Estilo de quote editorial forte. Fundo deep navy sólido.',
      },
      {
        number: 5,
        layout: 'narrative',
        headline: 'E quando o cliente pergunta\n"quanto vendemos?"',
        supporting: '…sobra a planilha.',
        accent: 'white',
        emoji: '📊',
        visualNote: 'Aspas grandes estilizadas em torno da pergunta. Planilha como emoji sutil. Tipografia reduzida na resposta para contraste dramático.',
      },
      {
        number: 6,
        layout: 'cta',
        headline: 'Se você se identificou,\nesse perfil vai mudar\nsua operação.',
        supporting: 'Siga @adsmagic',
        accent: 'green',
        visualNote: 'Logo AdsMagic + star-mark. Botão "Seguir" estilizado. Grafismos diagonais verdes. Clean e direto.',
      },
    ],
  },

  // ─── C2: O Problema Real ─────────────────────────────
  {
    id: 'c2',
    number: 2,
    title: 'O Problema Real',
    sb7Element: 'Internal + Philosophical Problem',
    awareness: 'Problem Aware',
    description: 'O medo real do gestor: perder conta por não provar resultado.',
    seriesTag: 'Série: Atribuição Real',
    slides: [
      {
        number: 1,
        layout: 'hook',
        headline: 'O cliente:\n"vendeu quanto?"',
        supporting: 'Você: 👀📊 *abre planilha*',
        accent: 'green',
        visualNote: 'Balão de chat estilizado para a pergunta do cliente. Resposta em fonte menor, italic. Humor na capa.',
      },
      {
        number: 2,
        layout: 'quote',
        headline: 'O gestor não perde conta\npor campanha ruim.',
        supporting: 'Perde por não conseguir\nprovar resultado.',
        accent: 'amber',
        visualNote: 'Texto bold editorial. Separação visual entre as duas frases. Segunda frase em destaque amber.',
      },
      {
        number: 3,
        layout: 'narrative',
        headline: 'CPL cai. Leads chegam.',
        supporting: 'Mas o cliente não vê venda\nno relatório.',
        accent: 'white',
        visualNote: 'Gráfico estilizado de CPL descendo (bom) vs. receita invisível (???). Contraste visual entre métricas.',
      },
      {
        number: 4,
        layout: 'narrative',
        headline: 'Insegurança.\nMedo da reunião.\nNoites cruzando planilhas.',
        accent: 'indigo',
        visualNote: 'Três linhas empilhadas, cada uma com peso emocional crescente. Fundo mais escuro que o normal. Sensação de peso.',
      },
      {
        number: 5,
        layout: 'quote',
        headline: 'É injusto:',
        supporting: 'Agências não deveriam ser\navaliadas por volume de lead.',
        accent: 'green',
        visualNote: 'Manifesto. "É injusto:" como eyebrow em verde. Texto principal grande e impactante.',
      },
      {
        number: 6,
        layout: 'cta',
        headline: 'Existe um caminho.',
        supporting: 'Link na bio →',
        accent: 'green',
        visualNote: 'Minimalista. Frase curta centralizada. Arrow animada para baixo/direita. Logo AdsMagic.',
      },
    ],
  },

  // ─── C3: O Guia Se Apresenta ────────────────────────
  {
    id: 'c3',
    number: 3,
    title: 'O Guia Se Apresenta',
    sb7Element: 'Guide — Empathy + Authority',
    awareness: 'Problem → Solution Aware',
    description: 'AdsMagic entra como guia com empatia genuína e credenciais técnicas.',
    seriesTag: 'Série: Atribuição Real',
    slides: [
      {
        number: 1,
        layout: 'hook',
        headline: 'Nós entendemos.',
        supporting: 'Porque já vivemos isso.',
        accent: 'white',
        visualNote: 'Minimalista e poderoso. Texto centralizado com muito espaço negativo. Fundo navy puro sem grafismos.',
      },
      {
        number: 2,
        layout: 'narrative',
        headline: 'Nascemos de uma dor real:',
        supporting: 'Campanhas que geravam leads\nmas ninguém sabia\nquais viravam venda.',
        accent: 'white',
        visualNote: 'Origin story. Texto quase editorial, como opening de livro. Fonte menor na supporting para intimidade.',
      },
      {
        number: 3,
        layout: 'data',
        headline: 'Criamos uma plataforma\nque conecta o anúncio\nà venda.',
        supporting: 'Passando pelo WhatsApp.',
        accent: 'green',
        visualNote: 'Linha visual: Ad → WhatsApp → Venda. Ícones conectados por linha pontilhada verde. Clean e explicativo.',
      },
      {
        number: 4,
        layout: 'steps',
        headline: 'O que fazemos:',
        bullets: [
          'Atribuição de receita',
          'Inteligência de funil',
          'Envio de conversões com contexto',
        ],
        accent: 'green',
        visualNote: 'Três blocos/cards empilhados com ícone + texto. Estilo de feature list premium. Borda verde sutil.',
      },
      {
        number: 5,
        layout: 'data',
        headline: 'Integração nativa com:',
        bullets: [
          'Meta Ads + Google Ads + TikTok Ads',
          'Setup em 5 minutos',
          'Sem precisar de desenvolvedor',
        ],
        accent: 'indigo',
        visualNote: 'Logos das plataformas de ads (estilizados). Badges de "5 min" e "no-code". Premium e confiável.',
      },
      {
        number: 6,
        layout: 'cta',
        headline: 'Teste grátis por 7 dias.',
        supporting: 'Link na bio →',
        accent: 'green',
        visualNote: 'CTA forte com botão estilizado verde. Star-mark + logo. Urgência sutil sem ser apelativo.',
      },
    ],
  },

  // ─── C4: O Plano ─────────────────────────────────────
  {
    id: 'c4',
    number: 4,
    title: 'O Plano',
    sb7Element: 'Plan — Process Plan',
    awareness: 'Solution Aware',
    description: 'Os 4 passos simples para configurar e ver resultados.',
    seriesTag: 'Série: Atribuição Real',
    slides: [
      {
        number: 1,
        layout: 'hook',
        headline: 'Setup mais rápido\nque a Meta reprovar\nseu anúncio.',
        accent: 'green',
        emoji: '⚡',
        visualNote: 'Humor na capa. Raio/ícone de velocidade. Texto bold com ritmo quebrado. Grafismos diagonais dinâmicos.',
      },
      {
        number: 2,
        layout: 'steps',
        headline: 'Passo 1',
        supporting: 'Conecte suas fontes de mídia.',
        bullets: ['Meta Ads', 'Google Ads', 'TikTok Ads'],
        accent: 'indigo',
        visualNote: 'Mockup simplificado de tela de integração. Cards com logos das plataformas. Número "1" grande.',
      },
      {
        number: 3,
        layout: 'steps',
        headline: 'Passo 2',
        supporting: 'Instale o pixel de WhatsApp\nem 5 minutos.',
        metric: { value: '5 min', label: 'tempo de setup' },
        accent: 'green',
        visualNote: 'Ícone do WhatsApp + cronômetro estilizado. "5 min" em destaque grande. Sensação de facilidade.',
      },
      {
        number: 4,
        layout: 'mockup',
        headline: 'Passo 3',
        supporting: 'Veja cada conversa rastreada\ncom origem de campanha.',
        accent: 'white',
        visualNote: 'Mockup de lista de conversas com tags de campanha coloridas. UI real simplificada. Dark mode estilizado.',
      },
      {
        number: 5,
        layout: 'mockup',
        headline: 'Passo 4',
        supporting: 'Otimize campanhas\npor receita real.',
        metric: { value: 'R$47k', label: 'receita atribuída' },
        accent: 'green',
        visualNote: 'Dashboard mockup com gráfico de barras de receita por campanha. Número grande "R$47k" em verde.',
      },
      {
        number: 6,
        layout: 'cta',
        headline: 'Pronto pra provar resultado?',
        supporting: 'Link na bio →',
        accent: 'green',
        visualNote: 'CTA assertivo. Botão verde de teste grátis. Logo + star-mark. Clean.',
      },
    ],
  },

  // ─── C5: Como Funciona na Prática ────────────────────
  {
    id: 'c5',
    number: 5,
    title: 'Como Funciona na Prática',
    sb7Element: 'Plan reforçado + Demo',
    awareness: 'Solution → Product Aware',
    description: 'Antes vs. Depois — o que muda quando você tem atribuição real.',
    seriesTag: 'Série: Atribuição Real',
    slides: [
      {
        number: 1,
        layout: 'hook',
        headline: 'Veja o que muda\nquando você enxerga\no funil inteiro.',
        accent: 'white',
        visualNote: 'Texto editorial limpo. Funil visual simplificado como background sutil. Mistério/curiosidade.',
      },
      {
        number: 2,
        layout: 'contrast',
        headline: 'ANTES:',
        supporting: '"Mandamos 200 leads."\n\nCliente: "Vendeu quanto?"\n\n"…"',
        accent: 'amber',
        visualNote: 'Lado "antes" com fundo vermelho escuro/amber sutil. Chat bubble estilizado. Silêncio dramático.',
      },
      {
        number: 3,
        layout: 'contrast',
        headline: 'DEPOIS:',
        supporting: '"Campanha X gerou 14 vendas\ne R$47k em receita."',
        metric: { value: 'R$47k', label: '14 vendas atribuídas' },
        accent: 'green',
        visualNote: 'Lado "depois" com fundo verde escuro/navy. Dashboard mockup. Número grande em verde.',
      },
      {
        number: 4,
        layout: 'data',
        headline: 'Agora você vê:',
        bullets: [
          'Qual campanha vendeu',
          'Onde o funil travou',
          'Se o problema é mídia, atendimento ou fechamento',
        ],
        accent: 'green',
        visualNote: 'Lista com ícones de check verdes. Cada item em card sutil. Hierarquia clara.',
      },
      {
        number: 5,
        layout: 'data',
        headline: 'Eventos de conversão reais\nvão pro Meta e Google.',
        supporting: 'O algoritmo passa a buscar\nquem COMPRA, não só quem clica.',
        accent: 'indigo',
        visualNote: 'Logos Meta + Google. Seta de dados indo para as plataformas. "COMPRA" em destaque.',
      },
      {
        number: 6,
        layout: 'cta',
        headline: 'Sua agência merece\nprovar receita.',
        supporting: 'Link na bio →',
        accent: 'green',
        visualNote: 'Frase empática. Botão CTA verde. Logo. Clean e respeitoso.',
      },
    ],
  },

  // ─── C6: O Que Acontece Se Não Agir ──────────────────
  {
    id: 'c6',
    number: 6,
    title: 'O Que Acontece Se Não Agir',
    sb7Element: 'Failure / Stakes',
    awareness: 'Product Aware',
    description: 'O custo de não rastrear: perder contas para quem prova ROI.',
    seriesTag: 'Série: Atribuição Real',
    slides: [
      {
        number: 1,
        layout: 'hook',
        headline: 'POV: reunião de resultado\ne você só tem CPL\npra mostrar.',
        accent: 'amber',
        emoji: '😬',
        visualNote: 'Humor tenso. "POV:" como label de formato viral. Background ambar/navy escuro. Emoji de desconforto.',
      },
      {
        number: 2,
        layout: 'narrative',
        headline: 'O cliente questiona a verba.',
        supporting: 'Você não tem como provar\nque suas campanhas vendem.',
        accent: 'amber',
        visualNote: 'Cenário de reunião. Ícone de cifra com interrogação. Tom sério e dramático.',
      },
      {
        number: 3,
        layout: 'contrast',
        headline: 'Seu concorrente mostra\nreceita por campanha.',
        supporting: 'Você mostra CPL.',
        accent: 'amber',
        visualNote: 'Split-screen: esquerda = dashboard com receita (verde). Direita = tabela de CPL (cinza). Contraste impactante.',
      },
      {
        number: 4,
        layout: 'narrative',
        headline: 'O cliente migra.',
        supporting: 'Não porque você é ruim.\nMas porque o outro\nprovou melhor.',
        accent: 'white',
        visualNote: 'Texto emocional. "provou melhor" em itálico ou destaque sutil. Fundo mais escuro que o normal.',
      },
      {
        number: 5,
        layout: 'quote',
        headline: 'Cada venda não rastreada\né uma renovação\nque você pode perder.',
        accent: 'amber',
        visualNote: 'Manifesto. Texto grande centralizado. Amber como cor de alerta/urgência.',
      },
      {
        number: 6,
        layout: 'cta',
        headline: 'Não precisa ser assim.',
        supporting: '7 dias grátis → Link na bio',
        accent: 'green',
        visualNote: 'Transição do amber para o verde (esperança). CTA de alívio. Logo + botão.',
      },
    ],
  },

  // ─── C7: A Transformação ─────────────────────────────
  {
    id: 'c7',
    number: 7,
    title: 'A Transformação',
    sb7Element: 'Success — External + Internal + Status',
    awareness: 'Product → Most Aware',
    description: 'De "agência que manda lead" para "agência que prova receita".',
    seriesTag: 'Série: Atribuição Real',
    slides: [
      {
        number: 1,
        layout: 'hook',
        headline: 'De "agência que\nmanda lead"\npara "agência que\nprova receita".',
        accent: 'green',
        visualNote: 'Transformação como headline. Aspas estilizadas. "manda lead" em opacidade menor, "prova receita" em verde bold.',
      },
      {
        number: 2,
        layout: 'data',
        headline: 'Sucesso externo:',
        supporting: 'Cada venda rastreada.\nCada campanha otimizada\npor receita real.',
        accent: 'green',
        visualNote: 'Ícone de gráfico ascendente + check. Métricas empilhadas. Tom de conquista.',
      },
      {
        number: 3,
        layout: 'quote',
        headline: 'Sucesso interno:',
        supporting: 'Confiança para defender\nseus números em\nqualquer reunião.',
        accent: 'indigo',
        visualNote: 'Tom emocional positivo. Pessoa confiante (icônico). Fundo indigo profundo.',
      },
      {
        number: 4,
        layout: 'data',
        headline: 'Sucesso de status:',
        supporting: 'Renova contratos com dados,\nnão com promessas.',
        accent: 'green',
        visualNote: 'Ícone de troféu/badge. Contraste entre "dados" (bold) e "promessas" (opacidade menor).',
      },
      {
        number: 5,
        layout: 'contrast',
        headline: 'Antes × Depois',
        bullets: [
          'Antes: "Geramos X leads" → Depois: "Geramos R$Y em vendas"',
          'Antes: Medo da reunião → Depois: Confiança com dados',
          'Antes: CPL no relatório → Depois: Receita por campanha',
          'Antes: Cliente questiona → Depois: Cliente renova',
        ],
        accent: 'green',
        visualNote: 'Tabela estilizada antes/depois. Checks verdes no depois. Xs vermelhos sutis no antes.',
      },
      {
        number: 6,
        layout: 'cta',
        headline: 'Sua história começa aqui.',
        supporting: 'Teste grátis por 7 dias → Link na bio',
        accent: 'green',
        visualNote: 'Encerramento épico. Star-mark grande. Logo. Botão CTA verde. "história" em itálico para ressonância emocional.',
      },
    ],
  },
]

/** Mapa de awareness por cor para badges */
export const awarenessColors: Record<string, string> = {
  'Unaware → Problem Aware': '#f59e0b',
  'Problem Aware': '#ef4444',
  'Problem → Solution Aware': '#8b5cf6',
  'Solution Aware': '#3b82f6',
  'Solution → Product Aware': '#6366f1',
  'Product Aware': '#f97316',
  'Product → Most Aware': '#10b981',
}

/** Cor de acento para CSS */
export const accentMap: Record<SlideAccent, string> = {
  green: '#3BB56D',
  indigo: '#6366f1',
  white: '#ffffff',
  amber: '#f59e0b',
}
