---
id: PROTO-007
title: "Wiki Assistant — IA contextual com revisão de documentação"
epic: "Workspace de Produto"
status: backlog
priority: medium
agent: architect + ux + dev
complexity: high
---

# PROTO-007 — Wiki Assistant com IA e Fluxo de Revisão Colaborativa

## Contexto

A wiki do workspace já existe como portal Docusaurus hospedado em `/wiki/`. O time usa ela para registrar decisões, jornadas, guias e governança do protótipo. Hoje, porém, a wiki é passiva: o usuário lê mas não interage.

A referência de experiência é o **Gemini no Google Docs**, onde o assistente lê o documento aberto e responde perguntas contextuais sobre ele. A proposta vai além: o assistente do workspace não apenas explica o conteúdo — ele permite que o próprio usuário **revise, classifique e proponha edições** da documentação diretamente pelo chat, com um fluxo de aprovação baseado em permissão.

---

## Hipótese

> "Um assistente contextual embutido na wiki aumenta a qualidade da documentação porque transforma leitores passivos em revisores ativos, sem exigir que eles saibam editar Markdown diretamente."

---

## Visão do Produto

### Pilares da feature

| Pilar | Descrição |
|---|---|
| **Leitura de contexto** | O assistente sempre tem o conteúdo da página atual como contexto — sabe o que o usuário está lendo |
| **Q&A sobre a doc** | Usuário pergunta sobre o conteúdo e o assistente responde com trechos e links internos |
| **Classificação** | Usuário pode marcar seções como: 🟢 Aprovado / 🟡 Precisa de revisão / 🔴 Desatualizado |
| **Sugestão de edição** | Usuário pede ao assistente editar um trecho ("reformule esse parágrafo") e aprova a sugestão |
| **Edição direta assistida** | Usuário edita o texto diretamente no chat com o assistente como copiloto |
| **Fluxo de revisão** | Toda edição proposta é enviada para revisão pelo responsável da documentação antes de ser publicada |

---

## User Stories (rascunho)

### US-1 — Q&A contextual
**Como** membro do time lendo uma página da wiki,  
**quero** perguntar ao assistente sobre o conteúdo que estou vendo,  
**para** entender decisões e contexto sem precisar buscar em outros lugares.

### US-2 — Classificação de qualidade
**Como** revisor de documentação,  
**quero** classificar seções da página (Aprovado / Precisa revisão / Desatualizado),  
**para** sinalizar ao time quais partes precisam de atenção.

### US-3 — Sugestão via chat
**Como** usuário sem permissão de commit direta,  
**quero** pedir ao assistente que reformule um trecho e enviar a sugestão para revisão,  
**para** contribuir com a documentação sem precisar de acesso técnico.

### US-4 — Edição direta pelo chat (usuário com permissão)
**Como** responsável pela documentação,  
**quero** editar trechos diretamente no chat e aplicar sem fluxo de revisão,  
**para** corrigir erros rapidamente.

### US-5 — Fluxo de aprovação
**Como** responsável pela documentação,  
**quero** receber notificações de sugestões pendentes e aprovar/rejeitar com um clique,  
**para** manter controle de qualidade sem criar atrito desnecessário.

---

## Critérios de Aceitação (macro)

### Painel do assistente
- [ ] Ícone flutuante (ou botão na sidebar) abre drawer lateral do assistente em qualquer página da wiki
- [ ] Drawer exibe: campo de chat, contexto da página atual (título + trecho resumido), histórico da conversa
- [ ] Assistente responde perguntas sobre o conteúdo da página com citações de trechos
- [ ] Assistente sugere links internos relevantes quando aplicável

### Classificação de seções
- [ ] Usuário pode selecionar uma seção e marcar status: Aprovado / Precisa revisão / Desatualizado
- [ ] Classificação fica visível para o time (badge na seção ou na listagem da wiki)
- [ ] Classificações são persistidas (mock: localStorage ou store local)

### Sugestão e edição
- [ ] Usuário pode pedir uma reescrita via chat ("reescreva essa seção de forma mais direta")
- [ ] Assistente exibe diff visual: texto original × sugestão antes de confirmar
- [ ] Ao confirmar, a sugestão entra em fila de revisão se o usuário não tiver permissão de editor
- [ ] Usuário com permissão de editor pode aplicar diretamente

### Fluxo de revisão
- [ ] Responsável vê lista de sugestões pendentes para suas páginas
- [ ] Pode aprovar (aplica edição), rejeitar (descarta) ou solicitar ajuste (devolve com comentário)
- [ ] Status da sugestão é visível para quem sugeriu

---

## Escopo Fora (v1)
- Integração real com LLM (v1 usa respostas mock pré-programadas)
- Edição em tempo real multi-usuário (Notion-style)
- Controle de permissão granular por seção (v1 usa 2 níveis: leitor / editor)
- Histórico de versões com diff visual completo
- Notificações por e-mail ou push

---

## Referências de Experiência
- **Gemini no Google Docs** — assistente lê contexto do documento aberto
- **Notion AI** — sugestão e reescrita embutidas no editor
- **Linear comments** — revisão inline sem sair do fluxo de trabalho
- **GitHub PR review** — modelo de aprovação de mudanças com comentário

---

## Decisões em aberto

| # | Questão | Opções | Status |
|---|---|---|---|
| 1 | Onde hospedar o assistente no protótipo? | Drawer lateral Docusaurus / Widget Vue externo | Em aberto |
| 2 | Fonte de contexto no protótipo (v1 mock) | Parseamento client-side do DOM / Dados estáticos hardcoded | Em aberto |
| 3 | Modelo de permissão no mock | Enum no store (leitor/editor) / Campo no perfil mockado | Em aberto |
| 4 | Persistência das sugestões | localStorage / Pinia store efêmero | Em aberto |
| 5 | Integração futura com LLM | OpenAI API / Gemini / Anthropic / Ollama local | **Ver PROTO-008** |

---

## Dependências

- **PROTO-008** — Configuração de LLM no Workspace (Settings > Assistente IA). O Wiki Assistant consumirá o provedor e modelo configurados pelo usuário via `PROTO-008`.

---

## Estimativa de Complexidade

| Dimensão | Nível | Justificativa |
|---|---|---|
| Escopo | Alto | Afeta wiki (Docusaurus) + workspace (Vue) + store + permissões |
| Integração | Médio | v1 é mock, mas arquitetura deve acomodar LLM real |
| Infraestrutura | Baixo | Sem backend em v1 |
| Conhecimento | Alto | UX de chat + diff visual + fluxo de aprovação são novos padrões |
| Risco | Médio | Gemini/LLM real pode mudar o modelo de dados |

**Classificação:** COMPLEX — requer spec pipeline completo antes de implementar

---

## Próximos Passos (antes de entrar em sprint)

1. `@architect` definir onde o componente do assistente fica (Docusaurus plugin vs. iframe Vue vs. componente Vue embutido no layout da wiki)
2. `@ux` prototipar o drawer do assistente e o diff visual de sugestão
3. `@pm` refinar as US com o time e definir o MVP mínimo para o piloto
4. `@dev` explorar viabilidade do Docusaurus + componente Vue persistente entre páginas
