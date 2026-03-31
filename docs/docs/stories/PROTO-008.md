---
id: PROTO-008
title: "Configuração de LLM no Workspace — Settings > Assistente IA"
epic: "Workspace de Produto"
status: backlog
priority: medium
agent: dev + architect
complexity: medium
depends_on: []
required_by: [PROTO-007]
---

# PROTO-008 — Configuração de LLM no Workspace

## Contexto

O **PROTO-007 (Wiki Assistant)** — e qualquer feature futura baseada em IA — exige que o workspace saiba qual LLM usar e como se autenticar. Essa configuração precisa ser gerenciada centralmente pelo usuário via UI, no módulo de Configurações.

A referência de UX é o **GitHub Copilot**: o usuário escolhe o provedor e o método de autenticação (API key manual ou OAuth), seleciona o modelo, e o workspace usa essa configuração em todos os módulos que requerem IA.

---

## Hipótese

> "Centralizar a configuração de LLM no Settings — com suporte a API key e OAuth — reduz a fricção para ativar features de IA e dá controle claro ao usuário sobre qual modelo está sendo usado e como."

---

## Escopo Implementado (protótipo v1)

A tab **Assistente IA** já existe em `Plataforma/src/views/settings/SettingsView.vue` com:

| Elemento | Status |
|---|---|
| Seletor de provedor (OpenAI, Anthropic, Gemini, GitHub Copilot) | ✅ Mockado |
| Seletor de modelo (por provedor) | ✅ Mockado |
| Toggle entre Chave de API e OAuth | ✅ Mockado |
| Campo de API key com show/hide | ✅ Mockado |
| Painel explicativo OAuth | ✅ Mockado |
| Botão "Conectar" com estado loading simulado | ✅ Mockado |
| Banner de status (conectado / desconectado) | ✅ Mockado |
| Botão Desconectar | ✅ Mockado |

---

## Critérios de Aceitação (produção futura)

### Seleção de provedor e modelo
- [ ] Usuário seleciona o provedor entre: OpenAI, Anthropic, Google Gemini, GitHub Copilot
- [ ] Lista de modelos muda dinamicamente de acordo com o provedor selecionado
- [ ] Modelo padrão é pré-selecionado ao trocar de provedor

### Autenticação por chave de API
- [ ] Campo de API key com máscara (show/hide)
- [ ] Validação básica de formato na UI (ex: `sk-...` para OpenAI)
- [ ] Chave é armazenada de forma segura (nunca em localStorage em texto claro — usar Keychain/SecretStore do SO ou variável de ambiente no servidor)
- [ ] Teste de conexão ao confirmar (chamada real ao endpoint do provedor)

### Autenticação OAuth
- [ ] Disponível apenas para provedores que suportam OAuth (GitHub Copilot, Google Gemini futuramente)
- [ ] Abre fluxo OAuth no navegador (popup ou redirect)
- [ ] Token é armazenado de forma segura e renovado automaticamente
- [ ] Status de expiração/revogação visível na UI

### Gestão de conexão
- [ ] Status visível: Conectado (com provedor+modelo) / Desconectado
- [ ] Botão "Desconectar" revoga token/apaga chave local
- [ ] Feedback Toast ao conectar, desconectar e em caso de erro

### Propagação da configuração
- [ ] A configuração de LLM ativa é consumida via store (`useLLMConfigStore`)
- [ ] Módulos que usam IA (Wiki Assistant, outros) consultam o store antes de inicializar
- [ ] Se nenhum provedor configurado, módulos de IA exibem CTA para ir às Configurações

---

## Provedores / Modelos (referência)

| Provedor | Modelos principais | Auth |
|---|---|---|
| OpenAI | gpt-4o, gpt-4o-mini, gpt-4-turbo | API Key |
| Anthropic | claude-opus-4-5, claude-sonnet-4-5, claude-haiku-3-5 | API Key |
| Google Gemini | gemini-2.0-flash, gemini-2.0-pro, gemini-1.5-pro | API Key ou OAuth |
| GitHub Copilot | copilot-gpt-4o, copilot-claude-sonnet | OAuth (como Copilot) |

---

## Arquivos Modificados (protótipo)

| Ação | Arquivo |
|---|---|
| EDITADO | `Plataforma/src/views/settings/SettingsView.vue` — nova tab "Assistente IA" |

## Arquivos a Criar (produção)

| Ação | Arquivo |
|---|---|
| CRIAR | `Plataforma/src/stores/llmConfig.ts` — store centralizado de configuração de LLM |
| CRIAR | `Plataforma/src/composables/useLLMConfig.ts` — composable para módulos consumirem |
| CRIAR | `Plataforma/src/data/llmProviders.ts` — catálogo de provedores e modelos |

---

## Segurança (notas para produção)

- API keys **nunca** devem ser lidas/escritas em `localStorage` em texto claro
- OAuth tokens devem ser armazenados via `httpOnly cookie` ou equivalente seguro
- A requisição ao LLM deve passar por um proxy no servidor — nunca expor a chave no client
- Seguir OWASP: validar e sanitizar qualquer input antes de enviar ao LLM (prompt injection)
