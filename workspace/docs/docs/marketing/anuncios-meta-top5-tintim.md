---
title: Anúncios — Top 5 modelados do Tintim
slug: /marketing/anuncios-meta-top5-tintim
---

# Anúncios — Top 5 modelados do Tintim

Este documento materializa os cinco anúncios prioritários para a primeira onda de mídia paga do Adsmagic, modelados a partir do recorte mais veiculado da Biblioteca de Anúncios do Tintim (page 105626472372076, BR, ordenado por `total_impressions`). Cada anúncio está enquadrado na mensagem-mãe **“Pare de reportar lead. Comece a provar venda.”**, respeita o [Posicionamento](/marketing/posicionamento), o [Kit de Copies Meta Ads](/marketing/copies-meta-ads) e o [Alinhamento de Fontes](/marketing/alinhamento-de-fontes), e segue o mesmo padrão de tabela editorial + coluna de prompt Nano Banana usado na [série StoryBrand dos carrosséis](/marketing/copies-carrosseis-instagram-storybrand).

A versão visual (mockup de feed do Meta, com moldura de post e elementos de marca) está publicada no Brand OS em **Templates → Anúncios Top 5 (Meta)** — `/styleguide/brand/templates/anuncios-top-5`.

## Regras operacionais (obrigatórias antes de publicar)

- **Destino único:** `https://adsmagic.com.br/para-agencias`.
- **CTA de conversão:** demo diagnóstica (nunca trial, nunca desconto).
- **Pricing vigente:** R$ 147/mês — só aparece quando a leitura já cobre dor + categoria.
- **Claims:** só afirmações já listadas como sustentadas em [Provas e Objeções](/marketing/provas-e-objecoes); usar “desenhado para”, “permite”, “torna possível”.
- **Anti-categoria:** nada de CRM, chatbot ou automação ampla. A camada é **atribuição, inteligência e envio de conversões**.
- **Criativos:** fotografia editorial cinematográfica com **pessoas reais** (dono(a) de agência, media buyer, cliente em reunião) e **mockup da própria plataforma Adsmagic** visível em laptop/iPad/TV — a gramática de marca (fundo navy #000E50/#00185D, barras diagonais 135° 2 azuis + 1 verde, acento verde #3BB56D em palavra-chave) entra como **camada de acento**, não como herói. Proibido: stock sorridente, dashboard SaaS genérico fake, neon roxo, mascote, baloão de chat ilustrado literal.
- **Formato padrão:** feed 1:1 (placement principal) com variação 4:5 reels/stories.
- **Assets reais:** `logo-wordmark-white.svg`, `logo-icon.svg`, screenshots reais do dashboard Adsmagic (North Star, funil, atribuição) hospedados em `workspace/docs/static/img/screens/adsmagic/` quando necessário para brief visual do diretor de arte.

## Régua de custo para gerar as artes

Esta régua usa os **5 prompts reais** desta página como base de cálculo. A estimativa operacional considera **2.241 tokens de entrada no total** para o pacote completo, ou **448 tokens por prompt em média**. Na prática, o custo do texto é quase irrelevante; o que domina o orçamento é a **imagem gerada** e a **quantidade de tentativas por criativo**.

### Comparativo de modelos para este fluxo

| Modelo | Papel recomendado | Preço de input | Preço de output imagem | Custo médio por criativo com os prompts desta página |
| --- | --- | --- | --- | --- |
| Nano Banana | opção econômica / fallback | US$ 0,30 por 1M tokens | US$ 0,039 por imagem até 1024 px | **US$ 0,0391** |
| Nano Banana 2 | padrão recomendado para produção | US$ 0,50 por 1M tokens | US$ 0,045 em 512, US$ 0,067 em 1K, US$ 0,101 em 2K, US$ 0,151 em 4K | **US$ 0,0452 em 512**, **US$ 0,0672 em 1K**, **US$ 0,1012 em 2K** |
| Nano Banana Pro | uso premium para peça mais elaborada, texto delicado e direção de arte mais exigente | US$ 2,00 por 1M tokens | US$ 0,134 por imagem em 1K/2K, US$ 0,24 em 4K | **US$ 0,1349 em 1K/2K** |

### Quanto custa gerar este pacote de 5 anúncios

| Cenário | Lógica operacional | Custo aproximado |
| --- | --- | ---: |
| Pacote econômico | 5 criativos no Nano Banana | **US$ 0,20** |
| Pacote padrão | 5 criativos no Nano Banana 2 em 1K | **US$ 0,34** |
| Pacote mais refinado | 5 criativos no Nano Banana 2 em 2K | **US$ 0,51** |
| Pacote premium | 5 criativos no Nano Banana Pro em 1K/2K | **US$ 0,67** |
| Padrão com 3 tentativas | 5 criativos no Nano Banana 2 em 1K, 3 gerações por criativo | **US$ 1,01** |

### Fluxo recomendado para buscar o melhor resultado

| Objetivo | Fluxo | Custo por criativo | Custo para os 5 |
| --- | --- | ---: | ---: |
| Volume rápido com boa qualidade | Nano Banana 2 em 512 até achar direção visual | **US$ 0,0452** | **US$ 0,23** |
| Produção padrão da campanha | Nano Banana 2 em 1K como render final | **US$ 0,0672** | **US$ 0,34** |
| Fluxo em 2 etapas recomendado | 2 drafts em Nano Banana 2 512 + 1 final em Nano Banana 2 1K | **US$ 0,1577** | **US$ 0,79** |
| Fluxo em 2 etapas para peça mais elaborada | 2 drafts em Nano Banana 2 512 + 1 final em Nano Banana Pro 1K/2K | **US$ 0,2253** | **US$ 1,13** |

### Regra prática de decisão

- Use **Nano Banana 2** como modelo padrão para este conjunto de anúncios. É o melhor equilíbrio entre qualidade, velocidade e custo.
- Use **Nano Banana Pro** quando a peça pedir acabamento mais premium, fidelidade maior de texto, composição mais delicada ou imagem hero para landing page, manifesto ou peça institucional.
- Use **Nano Banana** apenas quando a prioridade for custo mínimo ou fallback operacional.
- Para o fluxo deste documento, a régua mais segura é: **explorar em Nano Banana 2 512** e **finalizar em Nano Banana 2 1K**. Só subir para **Nano Banana Pro** quando o criativo realmente pedir uma peça mais elaborada.

> Referência de pricing: documentação oficial da Gemini Developer API, páginas de pricing e image generation consultadas em 19/04/2026. Os valores acima não incluem variações de grounding, Batch API ou múltiplas imagens de referência.

## Mapa dos 5 anúncios

| Nº | Nome interno | Ângulo modelado do Tintim | Awareness | Ad ref. (Tintim) |
| --- | --- | --- | --- | --- |
| 1 | Reunião mensal de resultado | Reunião de métricas erradas | Consciente do problema | 2298289447325682 |
| 2 | Conversa ≠ venda | Dado enganoso | Consciente do problema | 1711655889820686 |
| 3 | Onde foi parar a verba | Tráfego sem rastro de venda | Consciente do problema | 4196883800572734 |
| 4 | Meta vendeu, Google também | Atribuição duplicada | Consciente da solução | 953694203842936 |
| 5 | Concorrente mostra venda | Diferencial competitivo | Consciente da solução | 3798841463744998 |

> Cada anúncio abaixo segue o mesmo cabeçalho editorial: ângulo modelado, copy completa (primary text curto e expandido, headline, description, CTA), elementos de cena (actors, grafismos, personagens) e prompt Nano Banana pronto para gerar a arte.

---

## Anúncio 1 — Reunião mensal de resultado

**Ângulo modelado:** a reunião de resultado que cobra venda e recebe lead.
**Awareness dominante:** Consciente do problema.
**Persona principal:** dono(a) de agência e head de performance que conduzem reunião mensal com o cliente.
**Gatilhos psicológicos:** perda de autoridade, medo de churn, pergunta sem resposta.
**CTA do post:** Agende uma demo diagnóstica.
**Racional curto:** Dor imediata + autoridade operacional. A prova social entra como peer truth de operação: toda agência reconhece a reunião em que o cliente para de ouvir lead e cobra venda, sem precisar inventar case ou depoimento.

**Primary Text (curto, até 125 chars):**
Tem reunião que vira cobrança em 1 pergunta: cadê a venda?

**Primary Text (expandido):**
Todo dono de agência conhece essa cena: o cliente abre o relatório e a pergunta não é sobre CPL. É sobre venda. Se a resposta ainda depende de planilha, memória do comercial ou sensação de qualidade, sua autoridade já entrou curta na reunião. O Adsmagic conecta Ads, WhatsApp e fechamento comercial para transformar campanha em prova de venda. Agende uma demo diagnóstica e veja como entrar na próxima reunião com a resposta certa na tela.

**Headline:** Quando o cliente cobra venda, lead não basta.
**Description:** Venda provada. Não lead defendido.
**CTA Button:** Saiba mais

**Elementos de cena (criativo):**
- Atores: dono(a) de agência brasileiro(a), 35–45 anos, smart casual (camisa de linho sem gravata ou blazer navy sobre camiseta), sentado(a) em sala de reunião moderna de agência (paineis acústicos + pôsteres de campanha desfocados ao fundo). Expressão séria e contida — não sorriso stock. Enquadramento meio-busto, olhar reto para a câmera como founder-to-camera.
- Grafismos: fotografia com grading navy frio + leve vinheta; 3 barras diagonais 135° (2 azuis longas + 1 verde curta) sobrepostas a 20% de opacidade como camada de marca; sparkle verde #3BB56D no rodapé direito.
- Personagem narrativo: acima da pessoa, balão tipográfico editorial gigante **“E AS VENDAS?”** em branco, como a pergunta do cliente pairando na sala. Ao fundo desfocado, notebook aberto exibindo o dashboard Adsmagic North Star (cartões “Gastos anúncios R$ 50.000” e “Receita R$ ?” em destaque).
- Marca: `logo-wordmark-white.svg` no topo esquerdo (h≈24px no render final).
- Contraste: pessoa iluminada com key light lateral; palavra **venda** no overlay inferior em `#3BB56D`, palavra **lead** com strike-through editorial branco.

| Campo | Conteúdo |
| --- | --- |
| Objetivo narrativo | Abrir pela reunião de cobrança, expor o descasamento entre pergunta do cliente e métrica reportada, levar à demo diagnóstica. |
| Gancho visual | Balão “E as vendas?” gigante, tipografia editorial, relatório desfocado como fundo discreto. |
| Copy overlay no criativo | **Cliente cobra venda.** / **Lead não sustenta conta.** (duas linhas, kicker “Na reunião mensal”). |
| Apoio / rodapé do criativo | “Ads + WhatsApp + fechamento para provar venda.” |
| Prompt Nano Banana | `Anuncio Meta 1:1, fotografia editorial cinematografica estilo A24 corporativo, plano meio-busto de dono(a) de agencia brasileiro(a) de 38 anos, smart casual (camisa de linho off-white sem gravata ou blazer navy sobre camiseta cinza), sentado(a) em sala de reuniao de agencia moderna com paineis acusticos e posters de campanha desfocados ao fundo; olhar reto e sereno para a camera, sem sorriso stock; iluminacao chiaroscuro lateral com key light quente de janela e fill frio azul, grading geral navy #000E50; camera iPhone 15 Pro 35mm, f/2.8, shallow depth of field; atras da pessoa, notebook MacBook aberto em desfoque bokeh exibindo tela real do dashboard Adsmagic North Star (cartoes visiveis "Gastos anuncios R$ 50.000" e "Receita R$ 6.060"), header branco com chips "Projeto: Projeto Demo" e "WhatsApp Desconectado"; SOBRE a fotografia, balao tipografico editorial gigante "E AS VENDAS?" em branco estourado inclinado 2 graus emergindo do lado direito como pergunta do cliente pairando na sala; overlay inferior com headline em duas linhas "Cliente cobra venda. / Lead nao sustenta conta." (palavra venda em verde #3BB56D, palavra lead com strike-through branco); kicker superior "NA REUNIAO MENSAL" em tracking largo branco 70% opacidade; logo-wordmark-white.svg topo esquerdo altura pequena; 2 barras diagonais 135 graus azuis #00185D a 20% opacidade cruzando as laterais + 1 barra verde #3BB56D curta no canto inferior direito; sparkle verde 4 pontas no rodape; microcopy inferior "Ads + WhatsApp + fechamento para provar venda."; negativos: stock photo sorridente corporativo, dashboard SaaS generico fake, neon roxo, grafico 3D flutuante, balao de chat estilo app, emoji, pose de braco cruzado classica, iluminacao chapada frontal.` |

---

## Anúncio 2 — Conversa iniciada ≠ venda fechada

**Ângulo modelado:** dado enganoso (o mercado celebra conversa iniciada como se fosse venda).
**Awareness dominante:** Consciente do problema.
**Persona principal:** gestor(a) de tráfego sênior que reporta métricas de WhatsApp para o cliente.
**Gatilhos psicológicos:** virada de métrica, especificidade operacional, ataque ao proxy falso.
**CTA do post:** Agende uma demo diagnóstica.
**Racional curto:** Contrarian + desmistificação. A prova social entra como leitura de mercado: muita operação ainda chama conversa de resultado, mas o cliente já diferencia conversa de venda sem que a gente precise fabricar prova externa.

**Primary Text (curto):**
Abrir conversa não é resultado. Resultado é venda.

**Primary Text (expandido):**
O mercado se acostumou a chamar conversa iniciada de resultado. Seu cliente, não. Conversa abre atendimento. Venda é o que sustenta verba, fee e renovação. O Adsmagic conecta Ads, WhatsApp e fechamento comercial para mostrar o que virou proposta, aprovação e venda, em vez de parar no volume de conversa. Agende uma demo diagnóstica e veja a diferença entre abrir chat e provar resultado.

**Headline:** Conversa não fecha contrato.
**Description:** Venda é resultado. Conversa é entrada.
**CTA Button:** Saiba mais

**Elementos de cena (criativo):**
- Atores: mão brasileira (manga de camisa social arregaçada, sem jóias chamativas) segurando um iPhone preto na diagonal no lado esquerdo da composição, como se estivesse em reunião apresentando evidência. Enquadramento flat-lay levemente inclinado.
- Grafismos: tela do iPhone com conversa realista de WhatsApp Business (3 balões verdes de “conversa iniciada”, horário visível, status visto); selo tipográfico **“CONVERSA”** sobre ela. No lado direito, MacBook aberto com o dashboard Adsmagic de funil mostrando cartão **“Vendas: 8 negócios fechados”** e “Receita R$ 6.060,00”; selo **“VENDA”** em verde sobre a tela. Glow verde central baixo marcando o fechamento.
- Personagem narrativo: entre o iPhone e o MacBook, sinal **≠** enorme em branco flutuando como cesura visual. Mesa escura de agência como plano de apoio.
- Marca: `logo-wordmark-white.svg` no topo direito; `logo-icon.svg` como watermark no rodapé esquerdo a 35% opacidade; 1 barra diagonal azul curta + 1 barra verde curta como acento, a 22% opacidade.
- Contraste: lado do iPhone com grading frio azul; lado do MacBook com iluminação mais quente e highlight verde #3BB56D na UI. Palavra-chave **não é** em `#3BB56D` com underline editorial no primary text.

| Campo | Conteúdo |
| --- | --- |
| Objetivo narrativo | Desmontar o proxy de “conversa iniciada” e reposicionar a agência como autoridade em prova de receita. |
| Gancho visual | Split 50/50 com gap central escuro representando o buraco do WhatsApp. |
| Copy overlay no criativo | **Conversa abre funil.** / **Venda fecha argumento.** (duas linhas, kicker “O dado que engana”). |
| Apoio / rodapé do criativo | “O mercado chama conversa. O cliente chama venda.” |
| Prompt Nano Banana | `Anuncio Meta 1:1, fotografia editorial flat-lay cinematografica; mesa de agencia com laminado navy escuro visto de cima levemente inclinado; no lado esquerdo, mao brasileira com manga de camisa social arregacada segurando um iPhone 15 preto na diagonal, tela acesa com conversa real de WhatsApp Business (3 baloes verdes de mensagem de "conversa iniciada" com horario 10:42, status duplo check verde); no lado direito, MacBook Pro aberto exibindo tela real do dashboard Adsmagic com cartao destacado "Vendas: 8 negocios fechados" e logo abaixo "Taxa de vendas 11,76%" + "Receita R$ 6.060,00", header com chip "WhatsApp Desconectado" em vermelho sutil; sobre a tela do iPhone, selo tipografico branco "CONVERSA"; sobre a tela do MacBook, selo tipografico verde #3BB56D "VENDA"; entre os dois dispositivos, sinal "≠" enorme em branco flutuando como cesura visual; fundo geral gradiente navy #000E50 ao #00185D esfumado; lado esquerdo com grading frio azul, lado direito com key light quente e highlight verde sutil vindo do MacBook; camera 45mm f/2.8 overhead inclinada 15 graus; logo-wordmark-white.svg topo direito pequeno; logo-icon.svg watermark rodape esquerdo a 35% opacidade; 1 barra diagonal 135 graus azul curta e 1 barra verde curta a 22% opacidade como acento; kicker superior "O DADO QUE ENGANA" em tracking largo branco 70%; headline inferior "Conversa abre funil. / Venda fecha argumento."; microcopy "O mercado chama conversa. O cliente chama venda."; negativos: ilustracao vetorial de chat, mascote do WhatsApp, emoji flutuante, stock photo sorridente, neon roxo, UI de SaaS generico fake, personagem 3D, grafico pizza, composicao simetrica centralizada batida.` |

---

## Anúncio 3 — Onde foi parar a verba

**Ângulo modelado:** gasta em tráfego e não sabe quantas vendas vieram.
**Awareness dominante:** Consciente do problema.
**Persona principal:** dono(a) de agência pressionado(a) pelo cliente a justificar aumento de verba.
**Gatilhos psicológicos:** abrir no momento de cobrança, especificidade operacional, desconforto financeiro.
**CTA do post:** Agende uma demo diagnóstica.
**Racional curto:** Stakes financeiros + contraste entre o básico e o raro. A prova social entra como truth de categoria em “todo dashboard mostra gasto; poucos mostram venda”, sem transformar mockup em case real.

**Primary Text (curto):**
Mostrar gasto é fácil. Difícil é provar a venda que voltou.

**Primary Text (expandido):**
Todo dashboard mostra gasto. Poucos mostram o que voltou em venda. Quando a verba sobe, a tolerância para suposição some. Mostrar investimento, CPL e volume não resolve a pergunta central: o que isso virou em venda? Se essa resposta continua escondida entre WhatsApp, proposta e fechamento, a agência defende mídia no escuro. O Adsmagic conecta Ads, WhatsApp e fechamento comercial para mostrar onde a verba virou venda e onde o funil travou. Agende uma demo diagnóstica.

**Headline:** Sem prova de venda, verba vira cobrança.
**Description:** Do clique ao fechamento, sem caixa-preta.
**CTA Button:** Saiba mais

**Elementos de cena (criativo):**
- Atores: media buyer mulher brasileira, 28–34 anos, estética de agência moderna (camiseta básica, cabelo preso, óculos de grau), sentada à mesa em home office ou sala de mídia com luzes suaves navy/verde desfocadas ao fundo. Expressão apreensiva e concentrada olhando para o laptop — não pânico stock.
- Grafismos: laptop aberto na frente da pessoa exibindo o dashboard Adsmagic com cartão **“Gastos anúncios R$ 50.000,00”** em destaque; metade direita da tela se dissolve em pixels/glitch preto formando uma **“caixa-preta”** onde a cifra entra e some. Luz do monitor refletida no rosto.
- Personagem narrativo: sobre a tela (camada overlay), seta afilada descendente branca sai de **“R$ 50.000”** e entra no glitch preto; headline sobreposta abaixo **“TODO MUNDO MOSTRA GASTO. / POUCOS PROVAM VENDA.”**.
- Marca: `logo-wordmark-white.svg` no rodapé; badge pequeno **“Demo diagnóstica gratuita”** acima do rodapé.
- Contraste: pessoa e mesa em navy frio; tela do laptop com highlight real da UI Adsmagic (branco + navy + acento verde). Palavra **venda** no overlay em `#3BB56D`; caixa-preta com gradiente radial #00082A.

| Campo | Conteúdo |
| --- | --- |
| Objetivo narrativo | Abrir a conta de quanto o cliente paga em mídia e expor a ausência de prova de receita como dívida invisível. |
| Gancho visual | “Caixa-preta” central com cifra entrando e saindo vazia. |
| Copy overlay no criativo | **Todo mundo mostra gasto.** / **Poucos provam venda.** (duas linhas, kicker “Sem caixa-preta”). |
| Apoio / rodapé do criativo | “Pare de estimar. Comece a provar venda.” |
| Prompt Nano Banana | `Anuncio Meta 1:1, fotografia editorial cinematografica, plano meio-busto 3/4 de media buyer mulher brasileira de 30 anos sentada em home office de agencia, camiseta basica cinza, cabelo preso em coque baixo, oculos de grau, sem sorriso forcado — expressao concentrada e levemente apreensiva olhando para o laptop; laptop MacBook aberto a frente dela exibindo tela real do dashboard Adsmagic com cartao grande "Gastos anuncios R$ 50.000,00" e "Receita R$ ?" em destaque, header com chips "Projeto: Projeto Demo" e "WhatsApp Desconectado"; metade direita da tela do laptop se dissolvendo em glitch/pixel preto formando uma "caixa-preta" retangular #00082A com gradiente radial por dentro, efeito de dados sumindo; luz do monitor refletida azul-navy no rosto, key light lateral quente de janela discreta; fundo de escritorio desfocado com painel de corticera e posters de campanha em bokeh, grading geral navy #000E50/#00185D; camera 50mm f/2.2 shallow depth; SOBRE a imagem, seta afilada descendente branca saindo da cifra "R$ 50.000" e entrando no glitch preto, headline sobreposta abaixo do laptop "TODO MUNDO MOSTRA GASTO. / POUCOS PROVAM VENDA." em branco com a palavra "venda" em verde #3BB56D, kicker superior "SEM CAIXA-PRETA" em tracking largo branco 70%; logo-wordmark-white.svg rodape centralizado discreto, pequeno badge "DEMO DIAGNOSTICA GRATUITA" acima; 2 barras diagonais 135 graus azuis longas a 22% opacidade nas quinas + 1 barra verde curta entrando na caixa-preta; microcopy inferior "Pare de estimar. Comece a provar venda."; negativos: cofre literal, maleta de dinheiro, icone de moeda 3D, estetica fintech neon, hacker com capuz, foto stock de executivo com mao na cabeca, neon roxo, gradient flou pastel, mascote.` |

---

## Anúncio 4 — Meta diz que vendeu, Google também. Mas onde está o dinheiro?

**Ângulo modelado:** conflito de atribuição entre canais (Meta reporta X, Google reporta Y, cliente fecha Z).
**Awareness dominante:** Consciente da solução.
**Persona principal:** gestor(a) de tráfego multi-canal que concilia relatório de Meta com Google Ads e descobre que a soma não bate.
**Gatilhos psicológicos:** paradoxo do dado duplicado, desgaste de autoridade, atribuição como tema adulto.
**CTA do post:** Agende uma demo diagnóstica.
**Racional curto:** Caos operacional + autoridade de mediação. A prova social entra pelo impasse reconhecível em qualquer operação multi-canal, sem recorrer a cliente nomeado: todo mundo já viu plataformas “venderem” números diferentes para a mesma conta.

**Primary Text (curto):**
Quando cada tela jura uma venda diferente, ninguém lidera a conta.

**Primary Text (expandido):**
Toda operação multi-canal conhece esse impasse: Meta mostra uma venda, Google mostra outra, o fechamento traz uma terceira leitura. Sem uma visão unificada, a agência vira mediadora de relatório em vez de liderar decisão. O Adsmagic conecta Ads, WhatsApp e fechamento comercial para devolver uma leitura única da venda e enviar conversões com contexto para cada canal. Agende uma demo diagnóstica e veja como parar de arbitrar plataforma e voltar a provar venda.

**Headline:** Três telas. Uma venda defensável.
**Description:** Uma venda. Não três versões.
**CTA Button:** Saiba mais

**Elementos de cena (criativo):**
- Atores: três profissionais de agência brasileira em pé (diretor comercial ~40a, terno navy sem gravata; head de mídia mulher ~32a, blazer caramelo sobre camiseta branca; estrategista jovem ~28a, hoodie cinza), vistos de costas/3-quartos, olhando juntos para uma TV 65” montada na parede da sala de reunião.
- Grafismos: na TV, dashboard Adsmagic em tela cheia com três colunas de atribuição lado a lado — **“META · 120 vendas”**, **“GOOGLE · 90 vendas”**, **“FECHAMENTO · 70 vendas”** (última destacada em verde #3BB56D e levemente maior). Linhas finas brancas convergindo das duas primeiras para a terceira.
- Personagem narrativo: luz azul da TV em contraluz ilumina os rostos parcialmente; sala com paineis acústicos escuros, mesa de madeira com notebooks abertos, cadeiras Eames. Overlay tipográfico superior **“CADA TELA REIVINDICA VENDA. / QUEM PROVA A VENDA REAL?”**.
- Marca: `logo-wordmark-white.svg` no topo esquerdo; `logo-icon.svg` discreto no header do dashboard da TV.
- Contraste: pessoas em silhueta contraluz azul-navy; TV com branco UI + destaque verde #3BB56D no número 70 puxando o olho.

| Campo | Conteúdo |
| --- | --- |
| Objetivo narrativo | Mostrar o paradoxo do dado duplicado e posicionar o Adsmagic como quem unifica a leitura. |
| Gancho visual | Três números em triângulo convergindo para o ícone da marca. |
| Copy overlay no criativo | **Cada tela reivindica venda.** / **Quem prova a venda real?** (duas linhas, kicker “Na mesma conta”). |
| Apoio / rodapé do criativo | “Ads + WhatsApp + fechamento em uma leitura só.” |
| Prompt Nano Banana | `Anuncio Meta 1:1, fotografia editorial cinematografica estilo A24 corporativo, plano wide 24mm levemente plongee mostrando sala de reuniao de agencia brasileira moderna vista de tras, tres profissionais em pe de costas/tres-quartos para a camera olhando para uma TV 65 polegadas montada na parede principal: diretor comercial homem 40 anos terno navy sem gravata, head de midia mulher 32 anos blazer caramelo sobre camiseta branca cabelo solto, estrategista jovem 28 anos hoodie cinza; iluminacao noturna de agencia com paineis acusticos escuros, mesa de reuniao de madeira com notebooks abertos, cadeiras Eames; a luz principal vem da propria TV em contraluz azul navy iluminando os rostos parcialmente; na TV, tela cheia real do dashboard Adsmagic de atribuicao mostrando tres cartoes grandes lado a lado "META · 120 vendas", "GOOGLE · 90 vendas", "FECHAMENTO · 70 vendas" com o terceiro em destaque verde #3BB56D e levemente maior, linhas finas brancas animadas convergindo dos dois primeiros para o terceiro; camera Sony FX3 24mm f/4, composicao simetrica, grading navy #000E50/#00185D; SOBRE a imagem, overlay tipografico superior "CADA TELA REIVINDICA VENDA. / QUEM PROVA A VENDA REAL?" em branco com "VENDA" em verde; kicker discreto "NA MESMA CONTA"; microcopy inferior "Ads + WhatsApp + fechamento em uma leitura so."; logo-wordmark-white.svg topo esquerdo pequeno; 2 barras diagonais 135 graus azuis convergindo a 18% opacidade + 1 barra verde curta cortando o centro; negativos: logos oficiais Meta/Google visiveis, mascote, personagem cartoon, pose de luta versus, ring de boxe, neon roxo, grafico pizza, stock photo de reuniao sorrindo, palestrante apontando, estetica conferencia TED, figurinos paletizados demais.` |

---

## Anúncio 5 — Enquanto você mostra lead, o concorrente mostra venda

**Ângulo modelado:** diferencial competitivo — a agência ao lado entra na reunião com prova de receita.
**Awareness dominante:** Consciente da solução.
**Persona principal:** dono(a) de agência ou sócio comercial em cenário de concorrência direta por uma conta.
**Gatilhos psicológicos:** perda relativa, comparação direta, medo de ficar atrás.
**CTA do post:** Agende uma demo diagnóstica.
**Racional curto:** Tensão competitiva + perda relativa. A prova social entra pela comparação entre pares na renovação: não é um cliente inventado elogiando, é o próprio mercado servindo de espelho entre a agência comum e a que já prova venda.

**Primary Text (curto):**
Na renovação, agência comum explica lead. A difícil de trocar prova venda.

**Primary Text (expandido):**
Na renovação, o cliente compara duas agências: a que ainda explica lead e a que já prova venda. De um lado, CPL, conversa iniciada e justificativa. Do outro, campanha, WhatsApp, proposta e venda na mesma história. O Adsmagic foi desenhado para colocar sua operação nesse segundo grupo. Agende uma demo diagnóstica e veja onde sua carteira ainda perde autoridade.

**Headline:** Quem prova venda negocia de outro lugar.
**Description:** Agência comum explica. Agência forte prova.
**CTA Button:** Saiba mais

**Elementos de cena (criativo):**
- Atores: split-screen vertical 50/50 com a **mesma cena de reunião de renovação**. **Esquerda:** CEO de agência A (homem brasileiro ~42a, camisa social azul clara sem gravata) mostrando iPad a uma cliente (mulher executiva ~45a, blazer cinza) que está com braços cruzados, cética. **Direita:** CEO de agência B (mulher brasileira ~38a, blazer preto) mostrando outro iPad à **mesma cliente** (continuidade visual proposital), que agora se inclina para frente, anotando.
- Grafismos: tela do iPad esquerdo com dashboard genérico cinza-azul “Leads: 3.240” e gráfico plano vazio. Tela do iPad direito com dashboard Adsmagic real “Receita atribuída R$ 187.420” + “Vendas: 12 fechadas”, acentos verdes #3BB56D. Linha vertical fina verde separando os lados.
- Personagem narrativo: a mesma cliente nos dois lados — expressão fechada à esquerda, engajada à direita. A diferença de linguagem corporal é o argumento.
- Marca: `logo-wordmark-white.svg` centralizado no rodapé sobre a linha divisória verde.
- Contraste: lado esquerdo dessaturado com paleta navy fria; lado direito com key light quente + highlight verde `#3BB56D` na UI e no rosto da cliente.

| Campo | Conteúdo |
| --- | --- |
| Objetivo narrativo | Forçar escolha identitária — qual tipo de agência você quer ser na próxima renovação. |
| Gancho visual | Split-screen navy com dois relatórios enfrentando-se. |
| Copy overlay no criativo | **Uma defende lead.** / **A outra prova venda.** (headline em duas linhas; kicker “Na renovação”). |
| Apoio / rodapé do criativo | “O cliente compara com quem prova venda.” |
| Prompt Nano Banana | `Anuncio Meta 1:1 split-screen vertical 50/50, fotografia editorial cinematografica estilo documentario corporativo; AMBOS os lados mostram a mesma cena de reuniao de renovacao de contrato numa sala de agencia brasileira moderna com paineis de madeira clara e vidro, mesa redonda; LADO ESQUERDO: CEO de agencia A (homem brasileiro 42 anos, camisa social azul claro sem gravata, relogio classico) mostrando um iPad a uma cliente (mulher executiva brasileira 45 anos blazer cinza, cabelo meio-longo) sentada a frente; a cliente de bracos cruzados, expressao cetica e distante, recostada na cadeira; tela do iPad visivel com dashboard generico cinza-azul "LEADS: 3.240" e grafico plano; grading frio azul dessaturado, iluminacao fluorescente baixa, janela cinza ao fundo; LADO DIREITO: mesma sala, MESMA cliente (continuidade visual proposital), agora com CEO de agencia B (mulher brasileira 38 anos, blazer preto sobre camiseta branca, cabelo curto) mostrando outro iPad; cliente inclinada para frente, mao no queixo, expressao engajada, anotando no caderno; tela do iPad visivel com dashboard Adsmagic real mostrando "Receita atribuida R$ 187.420" e "Vendas: 12 negocios fechados" com destaque verde #3BB56D; grading mais quente, key light lateral de janela dourada, highlight verde sutil da tela reflete no rosto da cliente; camera 35mm f/2.8 em ambos os lados, altura de olho; SOBRE a imagem, linha vertical fina verde #3BB56D dividindo os dois quadros no centro; kicker superior centralizado "NA RENOVACAO" em tracking largo branco 70%; headline inferior centralizada em duas linhas "UMA DEFENDE LEAD. / A OUTRA PROVA VENDA." em branco com "VENDA" em verde; microcopy inferior "O cliente compara com quem prova venda."; logo-wordmark-white.svg rodape centralizado sobre a linha divisoria; 2 barras diagonais 135 graus azuis a 20% opacidade no lado esquerdo + 1 barra verde atravessando o lado direito a 40%; negativos: confronto cartoon versus, estetica game of thrones, emoji, retrato stock sorridente de dentes, neon roxo, grafico pizza, overlay de dashboard ilustrado fake, mascote, personagem 3D, pose cruzada repetida em ambos os lados identicos (a diferenca de linguagem corporal e o ponto).` |

---

## Próximos passos sugeridos

1. Submeter este documento para aprovação editorial em [Governança](/marketing/governanca).
2. Gerar cada uma das 5 artes seguindo a régua acima: explorar em Nano Banana 2 512, finalizar em Nano Banana 2 1K e subir para Nano Banana Pro apenas nas peças que pedirem acabamento mais elaborado; armazenar em `design-system/brand/anuncios-top-5/`.
3. Publicar como experimento controlado no Meta Ads com objetivo de tráfego para a [LP de Agências](/marketing/oferta-para-agencias), usando o [Kit de Copies Meta Ads](/marketing/copies-meta-ads) como referência de variações secundárias.
4. Após 7 dias corridos, cruzar leitura operacional em [Plano de Organização das Campanhas de GTM](/marketing/plano-organizacao-campanhas-gtm).
