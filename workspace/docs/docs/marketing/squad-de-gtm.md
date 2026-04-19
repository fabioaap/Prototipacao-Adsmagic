---
title: Squad de GTM
slug: /marketing/squad-de-gtm
---

# Squad de GTM

O Squad de GTM e a celula responsavel por transformar posicionamento, prova de produto e operacao comercial em geracao previsivel de demanda qualificada e pipeline.

No contexto do Adsmagic, esse squad existe para conectar midia, rastreamento, CRM, argumento de valor e rotina comercial em uma operacao unica, com foco em eficiencia de aquisicao e qualidade de conversao.

## Para que serve

Use esta pagina para registrar:

- missao e escopo do squad
- composicao minima e apoios compartilhados
- papeis e responsabilidades
- rituais operacionais
- interfaces com Produto, Vendas, CS e lideranca
- KPIs que definem performance real do GTM

## Missao

A missao do squad e fazer o Adsmagic crescer com menos atrito entre marketing, operacao e vendas.

Isso significa:

- gerar pipeline qualificado
- reduzir vazamento entre etapas do funil
- garantir leitura confiavel de origem e conversao
- transformar aprendizados de mercado em melhorias de mensagem, campanha e ativacao comercial

## Escopo de atuacao

O squad responde por quatro frentes:

- definicao da narrativa de mercado
- geracao e captura de demanda
- operacao do funil de marketing ate o handoff comercial
- aprendizado continuo sobre canais, segmentos e ofertas

Nao e papel do squad otimizar metricas vaidosas isoladas. Trafego, clique e volume bruto so importam quando melhoram qualidade de lead, velocidade de avancar no funil ou geracao de pipeline.

## Composicao minima

A composicao minima recomendada para o estagio inicial e enxuta e orientada a execucao:

- Lider de GTM, com ownership sobre metas, priorizacao e alinhamento executivo
- Growth ou Demand Gen, com foco em aquisicao, experimentacao e performance por canal
- Marketing Ops ou CRM Ops, com foco em tracking, automacao, lead routing, scoring e higiene de dados
- Product Marketing, com foco em narrativa, proposta de valor, provas, objecoes e enablement comercial
- Conteudo e Lifecycle, com foco em landing pages, e-mails, nutricao, casos de uso e reaproveitamento editorial

## Apoios compartilhados

Algumas capacidades podem ser compartilhadas com outras areas:

- Design, para criativos, paginas e materiais comerciais
- SDR ou Inside Sales, para validar qualidade de lead e feedback de handoff
- Produto, para roadmap, provas de capacidade e narrativa de uso real
- Dados ou RevOps, quando houver, para governanca de funil e reporting executivo

## Papeis e responsabilidades

### Lider de GTM

Define metas trimestrais, decide foco por segmento e canal, prioriza backlog, negocia capacidade com areas parceiras e garante que marketing nao opere desconectado de receita.

### Growth ou Demand Gen

Opera midia, inbound, testes de canal, paginas de captura e ofertas. Seu papel e aprender rapido, matar hipoteses fracas e concentrar investimento no que gera intencao e pipeline.

### Marketing Ops ou CRM Ops

Garante que os dados de origem, estagio e owner sejam confiaveis. Responde por automacoes, nomenclatura, lead routing, SLA entre areas e visao operacional do funil.

### Product Marketing

Traduz produto em tese comercial clara. E responsavel por mensagem-mae, mensagens por segmento, provas, handling de objecoes, battlecards e apoio a lancamentos.

### Conteudo e Lifecycle

Transforma a estrategia em ativos reutilizaveis. Responde por paginas, e-mails, sequencias, estudos de caso, newsletters, nurtures e materiais de apoio para acelerar consideracao e conversao.

## Rituais operacionais

- daily ou check-in curto, quando o time estiver em sprint intensa
- revisao semanal de funil para olhar volume, qualidade, origem, tempo de resposta, passagem por estagio e perdas por motivo
- planejamento semanal de experimentos para decidir o que entra em producao, o que sai e quais aprendizados viram padrao
- sync quinzenal com Vendas para revisar qualidade de lead, objecoes novas, motivos de perda e aderencia das mensagens
- sync quinzenal com Produto para alinhar claims, provas disponiveis, gaps de narrativa e proximos marcos de lancamento
- business review mensal para consolidar performance, custo, eficiencia, pipeline gerado e proximos bets

## Interfaces

### Com Vendas

O acordo principal deve cobrir definicao de lead qualificado, regra de handoff, prazo de abordagem e feedback obrigatorio sobre qualidade. Sem isso, marketing gera volume e vendas devolve ruido.

### Com Produto

A interface deve garantir que narrativa de mercado nao prometa o que o produto ainda nao sustenta. Toda claim usada em campanha ou deck precisa de base real ou marcacao explicita de hipotese futura.

### Com CS ou Onboarding

A interface existe para capturar sinais de ativacao, tempo ate valor, friccoes de adocao e casos reais que possam virar prova comercial.

### Com lideranca

O squad precisa de metas claras de pipeline, orcamento com guardrails e criterios objetivos de priorizacao.

### Com Dados ou RevOps

A interface deve garantir uma unica leitura de funil, origem, estagio e receita influenciada ou gerada.

## KPIs

Os KPIs do squad devem ser poucos, decisorios e ligados a pipeline:

- pipeline gerado por marketing
- numero de oportunidades qualificadas originadas pelo marketing
- taxa de conversao entre lead, MQL, SQL e oportunidade
- tempo de resposta para leads de alta intencao
- cobertura de atribuicao e completude de CRM
- custo por oportunidade qualificada
- ciclo de lancamento de campanhas e experimentos
- taxa de aproveitamento de leads pelo time comercial

## Leitura recomendada dos KPIs

Pipeline e a metrica principal. Conversao por etapa mostra onde o funil vaza. Tempo de resposta e qualidade de dados indicam se a operacao e confiavel. Custo por oportunidade evita crescimento ineficiente. Velocidade de experimentacao mostra se o squad aprende no ritmo que o negocio precisa.

## Criterio de gestao

Se o squad nao tiver definicao comum de estagio, origem, dono e SLA, ele nao esta operando GTM de fato; esta apenas executando pecas e campanhas soltas.

## Gaps abertos

As duvidas, lacunas e decisoes que ainda impedem um GTM totalmente consistente foram consolidadas em [Gaps e Decisoes Abertas do GTM](/marketing/gaps-e-decisoes-abertas-do-gtm).

## Invocacao operacional

O operating model acima agora foi materializado em uma squad local do projeto:

- `squads/marketing-gtm`

Para uso no editor, a invocacao por agente acontece com os wrappers de workspace abaixo:

- `@gtm-orchestrator` como entrada principal
- `@positioning-strategist` para posicionamento, ICP e mensagens
- `@demand-gen` para campanhas e aquisicao
- `@marketing-ops` para tracking, atribuicao e handoff
- `@content-lifecycle` para nurture, conteudo e cadencia

### Regra pratica

Se a demanda for ampla ou cruzar mais de uma frente, comece por `@gtm-orchestrator`.

Se a demanda for claramente especializada, chame o agente da frente correspondente.
