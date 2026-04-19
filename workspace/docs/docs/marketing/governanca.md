---
title: Governança
slug: /marketing/governanca
---

# Governança

Esta página define como a wiki de Marketing do Adsmagic é mantida, revisada e evoluída. Ela é o documento de meta-governança: não trata de estratégia ou mensagem, mas de como todos os outros documentos devem ser administrados para que a wiki continue sendo uma fonte de verdade confiável.

Leia esta página junto com [Alinhamento de Fontes](/marketing/alinhamento-de-fontes) (ordem de precedência entre BP, LP, wiki e Notion) e [Squad de GTM](/marketing/squad-de-gtm) (papéis e rituais do time).

---

## Donos

Todo documento da wiki deve ter um **papel responsável** pela sua atualização e revisão. Não atribuímos a pessoas individuais — atribuímos a funções do [Squad de GTM](/marketing/squad-de-gtm), o que garante continuidade mesmo com mudanças de time.

**Regra editorial:** se um documento não tem dono, status e data de revisão, ele **não deve ser tratado como fonte de verdade**. Essa regra vem do princípio registrado em [Alinhamento de Fontes](/marketing/alinhamento-de-fontes) e vale para qualquer artefato da wiki.

A atribuição de ownership segue a lógica do escopo de cada papel:

| Papel | Escopo de ownership |
| --- | --- |
| **Líder de GTM** | Metas, priorização, alinhamento executivo, governança geral |
| **Product Marketing** | Narrativa, proposta de valor, provas, objeções, enablement |
| **Growth / Demand Gen** | Aquisição, experimentação, performance por canal |
| **Marketing Ops / CRM Ops** | Tracking, automação, lead routing, scoring, higiene de dados |
| **Conteúdo e Lifecycle** | Landing pages, e-mails, nutrição, casos de uso, reaproveitamento editorial |

---

## Estados editoriais

Cada página da wiki deve exibir um estado visível no topo ou na tabela de registro. Os estados são quatro:

| Emoji | Estado | Significado |
| --- | --- | --- |
| 📝 | **Rascunho** | Conteúdo em elaboração; ainda não validado para uso operacional |
| ✅ | **Em uso** | Fonte de verdade vigente; pode ser referenciado em campanhas, decks e decisões |
| ⚠️ | **Substituído** | Foi superado por versão mais nova ou decisão posterior; permanece visível apenas para contexto |
| 🗄️ | **Arquivado** | Fora do uso ativo; movido para histórico e não deve ser citado como referência |

**Regra de transição:**

- Rascunho → Em uso: requer revisão do dono e confirmação de que não há conflito com a [ordem de precedência de fontes](/marketing/alinhamento-de-fontes).
- Em uso → Substituído: quando uma nova versão ou decisão torna o conteúdo desatualizado. O documento substituído deve linkar para o sucessor.
- Substituído → Arquivado: após um ciclo completo de revisão sem demanda de consulta.

---

## Convenção de nomes

### Páginas da wiki

As páginas seguem o padrão slug do Docusaurus: `kebab-case`, sem acentos, sem abreviações ambíguas.

Formato: `tema-principal` ou `tema-subtema`

Exemplos: `posicionamento`, `icp-e-segmentos`, `assets-e-campanhas`, `benchmark-competitivo-tintim`.

### Campanhas e assets

Para campanhas, criativos e materiais operacionais referenciados na wiki ou em ferramentas externas, usar a taxonomia:

```
[canal]-[segmento]-[tipo]-[tema]-[versão]
```

| Componente | Valores de exemplo |
| --- | --- |
| Canal | `meta`, `google`, `email`, `linkedin`, `whatsapp` |
| Segmento | `gestortrafego`, `agencia`, `ecomm` |
| Tipo | `lp`, `ad`, `email`, `nurture`, `deck` |
| Tema | `trial7d`, `roiatribuicao`, `casoagencia` |
| Versão | `v1`, `v2`, `teste-a` |

Exemplo completo: `meta-gestortrafego-ad-trial7d-v2`

Essa padronização garante busca e rastreamento de origem consistentes — um requisito operacional descrito no [Plano de 90 dias](/marketing/plano-90-dias) (taxonomia de canais, campanhas e origens).

---

## Revisão

A cadência de revisão varia conforme a camada do documento, seguindo os rituais operacionais definidos no [Squad de GTM](/marketing/squad-de-gtm):

| Camada | Cadência de revisão | Ritual relacionado |
| --- | --- | --- |
| **Estratégia** (posicionamento, ICP, pricing, benchmark) | Mensal | Business review mensal |
| **Messaging** (mensagens-chave, provas, alinhamento de fontes) | Quinzenal | Sync quinzenal com Vendas e Produto |
| **Operações** (squad, plano 90d, assets, governança) | Semanal | Revisão semanal de funil |
| **Index** (landing page da wiki) | Mensal | Business review mensal |

**Protocolo de revisão:**

1. O dono do documento verifica se o conteúdo ainda reflete a decisão vigente.
2. Se houver divergência com BP ou LP pública, aplica a [regra de resolução de conflito](/marketing/alinhamento-de-fontes#regra-de-resolucao-de-conflito).
3. Atualiza o estado editorial (se necessário) e a data de última revisão na tabela de registro abaixo.
4. Se o documento ficou mais de dois ciclos sem revisão, deve ser escalado ao Líder de GTM para decisão: atualizar, substituir ou arquivar.

**Princípio do Plano de 90 dias:** toda iniciativa precisa de owner, hipótese, métrica e data de revisão. Essa regra se estende à wiki — cada página é tratada como uma iniciativa editorial.

---

## Arquivamento

Um documento deve ser arquivado quando qualquer um dos gatilhos abaixo se aplicar:

| Gatilho | Exemplo |
| --- | --- |
| **Decisão superada** | Pricing antigo substituído por nova escada validada no BP |
| **Segmento descontinuado** | Material de ICP que não faz mais parte da priorização |
| **Dois ciclos sem revisão** | Página de operações que ficou mais de duas semanas sem ser revisada pelo dono |
| **Conflito não resolvido** | Documento que contradiz múltiplas fontes e não foi reconciliado após escalar |

**Processo de arquivamento:**

1. Alterar estado para 🗄️ Arquivado.
2. Adicionar nota no topo: `> ⚠️ Este documento foi arquivado em [data]. Consulte [link do documento atual] para a versão vigente.`
3. Mover para pasta `/marketing/arquivo/` quando o volume justificar separação.
4. O documento permanece acessível para consulta histórica, mas não deve ser citado como referência operacional.

---

## Registro de documentos

A tabela abaixo lista todas as páginas da wiki de Marketing com dono, estado, cadência e data de última revisão.

### Camada de Estratégia

| Página | Dono | Estado | Cadência | Última revisão |
| --- | --- | --- | --- | --- |
| [Posicionamento](/marketing/posicionamento) | Product Marketing | ✅ Em uso | Mensal | pendente |
| [ICP e Segmentos](/marketing/icp-e-segmentos) | Product Marketing | ✅ Em uso | Mensal | pendente |
| [Agências e Parceiros](/marketing/agencias-e-parceiros) | Product Marketing | ✅ Em uso | Mensal | pendente |
| [Oferta para Agências](/marketing/oferta-para-agencias) | Product Marketing | ✅ Em uso | Mensal | pendente |
| [Base de Inteligência de Conteúdo](/marketing/base-de-inteligencia-de-conteudo) | Conteúdo e Lifecycle | ✅ Em uso | Mensal | pendente |
| [Pricing e Unit Economics](/marketing/pricing-e-unit-economics) | Líder de GTM | ✅ Em uso | Mensal | pendente |
| [Benchmark Competitivo: Tintim](/marketing/benchmark-competitivo-tintim) | Growth / Demand Gen | ✅ Em uso | Mensal | pendente |

### Camada de Messaging

| Página | Dono | Estado | Cadência | Última revisão |
| --- | --- | --- | --- | --- |
| [Mensagens-Chave](/marketing/mensagens-chave) | Product Marketing | ✅ Em uso | Quinzenal | pendente |
| [Provas e Objeções](/marketing/provas-e-objecoes) | Product Marketing | ✅ Em uso | Quinzenal | pendente |
| [Canvas de Conteúdo Instagram](/marketing/canvas-de-conteudo-instagram) | Conteúdo e Lifecycle | ✅ Em uso | Quinzenal | pendente |
| [Alinhamento de Fontes](/marketing/alinhamento-de-fontes) | Líder de GTM | ✅ Em uso | Quinzenal | pendente |

### Camada de Operações

| Página | Dono | Estado | Cadência | Última revisão |
| --- | --- | --- | --- | --- |
| [Squad de GTM](/marketing/squad-de-gtm) | Líder de GTM | ✅ Em uso | Semanal | pendente |
| [Plano de 90 dias](/marketing/plano-90-dias) | Líder de GTM | ✅ Em uso | Semanal | pendente |
| [Assets e Campanhas](/marketing/assets-e-campanhas) | Marketing Ops / CRM Ops | ✅ Em uso | Semanal | pendente |
| [Gaps e Decisões Abertas](/marketing/gaps-e-decisoes-abertas-do-gtm) | Líder de GTM | ✅ Em uso | Semanal | pendente |
| [Governança](/marketing/governanca) | Líder de GTM | ✅ Em uso | Semanal | pendente |

### Index

| Página | Dono | Estado | Cadência | Última revisão |
| --- | --- | --- | --- | --- |
| [Marketing (index)](/marketing) | Líder de GTM | ✅ Em uso | Mensal | pendente |
