# Fix: StepWhatsApp - CORS 503 e Traduções i18n

## 📋 Resumo do Problema

**Data**: 2025-01-20  
**Severidade**: Alta (funcionalidade bloqueada)  
**Componentes Afetados**: 
- Edge Function `messaging` (backend)
- `StepWhatsApp.vue` (frontend)
- Arquivos de tradução i18n

### Sintomas Observados

1. **Erro CORS 503** ao acessar `/messaging/brokers`
2. **Textos de tradução não resolvidos** (ex: `projectWizard.step4.statusError`)
3. **Lista de brokers vazia** - usuário não consegue selecionar provedor WhatsApp

### Evidências dos Logs

```
OPTIONS | 503 | https://nitefyufrzytdtxhaocf.supabase.co/functions/v1/messaging/brokers
```

Comparação com outras Edge Functions:
- `projects`: OPTIONS → **200** ✅
- `companies`: OPTIONS → **200** ✅
- `messaging`: OPTIONS → **503** ❌

---

## 🔍 Análise de Causa Raiz

### Problema 1: Edge Function `messaging` retornando 503

**Causa provável**: Erro durante inicialização da Edge Function (cold start failure)

Possíveis razões:
1. Erro de importação em algum handler
2. Dependência não resolvida
3. Timeout na inicialização
4. Erro de sintaxe em arquivo importado

**Código atual** (`index.ts` linha 40-44):
```typescript
serve(async (req) => {
  // CORS preflight - Este código está correto
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
```

O handler de OPTIONS está correto, mas a função falha **antes** de chegar nele.

### Problema 2: Traduções i18n com namespace hardcoded

**Causa**: O componente `StepWhatsApp.vue` usa `t('projectWizard.step4.xxx')`, mas:
- As traduções de WhatsApp estão em `step6` no arquivo de locales
- O step de WhatsApp pode mudar de posição no wizard

**Violação identificada**: Acoplamento forte entre posição do step e namespace de tradução.

---

## 🎯 Solução Proposta

### Arquitetura de Tradução Resiliente

Em vez de usar `step4`, `step5`, `step6` (posicional), usar namespaces **semânticos**:

```
projectWizard.steps.whatsapp.*    # Traduções do step WhatsApp
projectWizard.steps.platforms.*   # Traduções do step Plataformas
projectWizard.steps.links.*       # Traduções do step Links
```

**Benefícios**:
- Independente da ordem dos steps
- Mais legível e manutenível
- Facilita reorganização do wizard
- Segue princípio **Open/Closed** (adicionar steps não quebra existentes)

---

## 📝 Etapas de Implementação

### FASE 1: Diagnóstico Backend (CONCLUÍDO)

**Objetivo**: Identificar causa exata do erro 503

#### Etapa 1.1: Verificar logs detalhados no Supabase Dashboard

- [x] Acessar Supabase Dashboard → Edge Functions → `messaging`
- [x] Verificar aba "Logs" para erros de inicialização
- [x] Procurar por: `Error`, `TypeError`, `ReferenceError`, `SyntaxError`
- [x] Anotar timestamp e mensagem de erro

**Resultado dos Logs (2025-01-20)**:
```json
{
  "function_id": "7e0e802c-e22a-4995-91e4-60023d852563",
  "event_message": "OPTIONS | 503 | https://nitefyufrzytdtxhaocf.supabase.co/functions/v1/messaging/brokers",
  "execution_time_ms": 74-286,
  "status_code": 503,
  "version": "20"
}
```

**Comparação com outras funções**:
| Função | OPTIONS Status | Versão |
|--------|---------------|--------|
| `projects` | 200 ✅ | v21 |
| `companies` | 200 ✅ | v12 |
| `contacts` | 200 ✅ | v2 |
| `integrations` | 200 ✅ | v30 |
| `messaging` | **503** ❌ | v20 |

#### Etapa 1.2: Verificar status da função

- [x] Verificar se função está `ACTIVE` no dashboard
- [x] Verificar versão deployada (deve ser v20)
- [x] Comparar código local com código deployado

**Resultado**:
- Status: `ACTIVE`
- Versão: `v20`
- Entrypoint: `back-end/supabase/functions/messaging/index.ts`

#### Etapa 1.3: Análise de Causa Raiz

**Diagnóstico**: O erro **503 (BOOT_ERROR)** indica que a Edge Function falha durante a **inicialização** (cold start), antes mesmo de executar o handler de OPTIONS.

**Conforme documentação Supabase**:
> 503 Service Unavailable - Your Edge Function failed to start (BOOT_ERROR).
> Common causes: Syntax errors, Import errors, Invalid configuration.

**Análise do código local (`index.ts`)**:
```typescript
// Importações no topo do arquivo
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from './utils/cors.ts'
import { errorResponse } from './utils/response.ts'
import { handleSendMessage } from './handlers/send-message.ts'
import { handleGetStatus } from './handlers/get-status.ts'
import { handleSyncContacts } from './handlers/sync-contacts.ts'
import { handleConnectionStatus } from './handlers/connection-status.ts'
import { handleCreateInstance } from './handlers/create-instance.ts'
import { handleConnectInstance } from './handlers/connect-instance.ts'
import { handleListWhatsAppBrokers } from './handlers/list-whatsapp-brokers.ts'
import { handleConfigureBroker } from './handlers/configure-broker.ts'
```

**Cadeia de dependências identificada**:
1. `WhatsAppBrokerFactory.ts` → importa `UazapiBroker`, `OfficialWhatsAppBroker`, `GupshupBroker`
2. `UazapiBroker.ts` → importa `identifier-normalizer.ts`, `connection.ts`
3. `OfficialWhatsAppBroker.ts` → valida `accessToken` e `phoneNumberId` no construtor (throw Error)
4. `GupshupBroker.ts` → valida `apiKey` e `appName` no construtor (throw Error)

**Hipótese principal**: 
O registro dos brokers na Factory (`WhatsAppBrokerFactory.register()`) acontece no **top-level** do módulo. Se alguma importação falhar ou lançar erro, a função não consegue inicializar.

**Possíveis causas**:
1. Erro em alguma dependência transitiva (ex: `zod` na versão específica)
2. Timeout na resolução de módulos remotos (`esm.sh`, `deno.land`)
3. Erro de sintaxe em arquivo importado indiretamente

#### Etapa 1.4: Próximos Passos (FASE 2)

**Recomendação**: Adicionar logs de diagnóstico no topo do `index.ts` para identificar exatamente onde a inicialização falha.

```bash
# Testar via curl (substitua TOKEN pelo seu JWT)
curl -X OPTIONS \
  'https://nitefyufrzytdtxhaocf.supabase.co/functions/v1/messaging/brokers' \
  -H 'Origin: https://adsmagic-first-ai.pages.dev'

# Deve retornar 200 com headers CORS
```

**Resultado atual**: Retorna 503, confirmando problema de inicialização.

---

### FASE 2: Fix Backend - Edge Function `messaging` (CONCLUÍDO)

**ALLOWED_PATHS**: 
- `back-end/supabase/functions/messaging/index.ts`

**FORBIDDEN_PATHS**: Não alterar handlers individuais nesta fase.

#### Etapa 2.1: Adicionar logs de inicialização (CONCLUÍDO)

**Arquivo**: `back-end/supabase/functions/messaging/index.ts`

**Alterações implementadas**:
1. Logs de diagnóstico em cada fase da inicialização
2. Importações dinâmicas com try-catch para identificar qual módulo falha
3. CORS headers inline para garantir que OPTIONS sempre funcione

```typescript
// FASE 1: Logs de diagnóstico de inicialização
console.log('[Messaging] ========== BOOT START ==========')
console.log('[Messaging] Timestamp:', new Date().toISOString())

// FASE 2: Importações críticas (serve e CORS)
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
console.log('[Messaging] ✓ serve loaded')

// CORS headers inline para garantir que OPTIONS sempre funcione
const corsHeaders = { ... }

// FASE 3: Importações de handlers via dynamic import
async function loadHandlers(): Promise<void> {
  try {
    const responseModule = await import('./utils/response.ts')
    // ... carrega cada handler com log
  } catch (error) {
    console.error('[Messaging] ❌ HANDLER LOAD ERROR:', error)
  }
}
```

**Checklist**:
- [x] Adicionar logs de inicialização
- [x] Não alterar lógica de routing
- [x] Não alterar handlers

#### Etapa 2.2: Melhorar tratamento de erro no OPTIONS (CONCLUÍDO)

**Alteração**: OPTIONS agora retorna 200 SEMPRE, mesmo se handlers não carregaram.

```typescript
serve(async (req) => {
  // CORS preflight - SEMPRE retornar 200, mesmo se handlers não carregaram
  if (req.method === 'OPTIONS') {
    console.log('[Messaging] OPTIONS request - returning CORS headers')
    return new Response('ok', { headers: corsHeaders })
  }
  
  // Aguardar carregamento dos handlers (com timeout de 5s)
  // Se handlers não carregaram, retornar erro 503 com detalhes
  // ...
})
```

**Checklist**:
- [x] OPTIONS handler é o primeiro check
- [x] Não há código que possa falhar antes do OPTIONS check
- [x] Log adicionado para rastreabilidade

#### Etapa 2.3: Deploy da função (CONCLUÍDO)

**Resultado do deploy**:
```json
{
  "id": "7e0e802c-e22a-4995-91e4-60023d852563",
  "slug": "messaging",
  "version": 21,
  "status": "ACTIVE",
  "updated_at": 1768955449400
}
```

**Checklist**:
- [x] Deploy executado sem erros
- [x] Verificar nova versão no dashboard (v21) ✅
- [ ] Testar OPTIONS via curl (aguardando próxima requisição)
- [ ] Testar no frontend (aguardando próxima requisição)

#### Etapa 2.4: Verificação pós-deploy

A função `messaging` está agora na **versão 21** com status **ACTIVE**.

**Mudanças principais**:
1. **CORS headers inline** - Não dependem mais de importação externa
2. **Dynamic imports** - Handlers são carregados de forma assíncrona com try-catch
3. **Fallback para erros** - Se handlers falharem, retorna 503 com detalhes do erro
4. **OPTIONS sempre funciona** - Não depende de nenhuma importação externa

**Próximo passo**: Testar o endpoint no frontend para verificar se o erro 503 foi resolvido

---

### FASE 3: Fix Frontend - Traduções i18n

**ALLOWED_PATHS**:
- `front-end/src/locales/pt.json`
- `front-end/src/locales/en.json`
- `front-end/src/locales/es.json`
- `front-end/src/views/project-wizard/steps/StepWhatsApp.vue`

#### Etapa 3.1: Criar namespace semântico para WhatsApp

**Arquivo**: `front-end/src/locales/pt.json`

**Alteração**: Adicionar novo namespace `steps.whatsapp` (mantendo `step6` para retrocompatibilidade).

```json
{
  "projectWizard": {
    "steps": {
      "whatsapp": {
        "title": "Conectar WhatsApp",
        "description": "Conecte seu número do WhatsApp para receber notificações e leads",
        "statusWaiting": "Aguardando conexão...",
        "statusConnecting": "Conectando...",
        "statusConnected": "Conectado com sucesso",
        "statusError": "Erro na conexão",
        "loadingQR": "Carregando QR Code...",
        "instructions": "Abra o WhatsApp e escaneie o QR Code para conectar seu número.",
        "step1": "Abra o WhatsApp no seu celular",
        "step2": "Toque em Menu > Aparelhos conectados",
        "step3": "Aponte seu celular para esta tela para capturar o código",
        "shareLink": "Compartilhar link de conexão",
        "shareTitle": "Conectar WhatsApp - AdsMagic",
        "shareText": "Conecte seu WhatsApp ao AdsMagic",
        "successTitle": "WhatsApp Conectado!",
        "successDescription": "Número conectado: {phone}",
        "successHint": "Você receberá notificações e poderá gerenciar conversas pelo painel.",
        "errorTitle": "Falha na Conexão",
        "errorDescription": "Não foi possível conectar o WhatsApp. Tente novamente.",
        "retry": "Tentar novamente",
        "skip": "Pular e conectar depois",
        "skipHint": "Você pode conectar o WhatsApp depois nas configurações",
        "selectBroker": "Escolha como deseja conectar seu WhatsApp",
        "selectMethod": "Escolha o método de conexão do seu WhatsApp",
        "noBrokersAvailable": "Nenhum provedor de WhatsApp disponível no momento.",
        "tryAgain": "Tentar novamente",
        "connectionSecure": "Conexão criptografada e segura",
        "loadingOptions": "Carregando opções de conexão...",
        "qrCodeExpires": "QR Code expira em {seconds}s",
        "renewQRCode": "Renovar QR Code",
        "chooseAnotherMethod": "Escolher outro método",
        "configureCredentials": "Preencha suas credenciais",
        "validateAndConnect": "Validar e Conectar",
        "validatingCredentials": "Validando credenciais...",
        "testingConnection": "Testando conexão...",
        "preparingConnection": "Preparando conexão...",
        "generatingQRCode": "Gerando QR Code...",
        "connectedVia": "Conectado via {broker}",
        "connectionMethodQR": "Conexão via QR Code",
        "connectionMethodCredentials": "Conexão via credenciais",
        "connectionMethodOAuth": "Conexão via Meta Business",
        "connectionMethodPairCode": "Conexão via código de pareamento",
        "howToGetCredentials": "Como obter essas credenciais?",
        "cancel": "Cancelar",
        "changeMethod": "Trocar método"
      }
    }
  }
}
```

**Checklist**:
- [ ] Adicionar namespace `steps.whatsapp` em `pt.json`
- [ ] Adicionar namespace `steps.whatsapp` em `en.json`
- [ ] Adicionar namespace `steps.whatsapp` em `es.json`
- [ ] Manter `step6` existente (retrocompatibilidade)
- [ ] Incluir todas as chaves usadas no componente

#### Etapa 3.2: Atualizar StepWhatsApp.vue para usar namespace semântico

**Arquivo**: `front-end/src/views/project-wizard/steps/StepWhatsApp.vue`

**Alteração**: Criar constante para o namespace e usar em todas as traduções.

```typescript
// Adicionar no início do script setup
const I18N_NAMESPACE = 'projectWizard.steps.whatsapp'

// Helper para tradução com namespace
const tw = (key: string, params?: Record<string, unknown>) => {
  return t(`${I18N_NAMESPACE}.${key}`, params)
}
```

**Uso no template**:
```vue
<!-- Antes -->
{{ t('projectWizard.step4.title') }}

<!-- Depois -->
{{ tw('title') }}
```

**Checklist**:
- [ ] Criar constante `I18N_NAMESPACE`
- [ ] Criar helper `tw()` para traduções
- [ ] Substituir todas as chamadas `t('projectWizard.step4.xxx')` por `tw('xxx')`
- [ ] Substituir todas as chamadas `t('projectWizard.step6.xxx')` por `tw('xxx')`
- [ ] Verificar que nenhuma chave ficou hardcoded

#### Etapa 3.3: Validar traduções

```bash
cd front-end
pnpm typecheck
pnpm lint
pnpm build
```

**Checklist**:
- [ ] TypeScript sem erros
- [ ] ESLint sem warnings
- [ ] Build completo sem erros
- [ ] Testar no navegador todos os estados

---

### FASE 4: Testes

#### Etapa 4.1: Testes manuais

**Cenários a testar**:

| # | Cenário | Resultado Esperado |
|---|---------|-------------------|
| 1 | Acessar StepWhatsApp | Lista de brokers carrega |
| 2 | Nenhum broker disponível | Mensagem amigável + botão retry |
| 3 | Erro de rede | Mensagem de erro + botão retry |
| 4 | Selecionar broker uazapi | QR Code é exibido |
| 5 | Timeout do QR Code | Aviso + botão renovar |
| 6 | Conexão bem-sucedida | Mensagem de sucesso |
| 7 | Pular step | Wizard avança normalmente |
| 8 | Trocar idioma | Textos atualizam corretamente |

**Checklist**:
- [ ] Cenário 1 passou
- [ ] Cenário 2 passou
- [ ] Cenário 3 passou
- [ ] Cenário 4 passou
- [ ] Cenário 5 passou
- [ ] Cenário 6 passou
- [ ] Cenário 7 passou
- [ ] Cenário 8 passou

#### Etapa 4.2: Verificar traduções em todos os idiomas

- [ ] Português (pt) - todos os textos aparecem
- [ ] Inglês (en) - todos os textos aparecem
- [ ] Espanhol (es) - todos os textos aparecem

---

## 🔄 Plano de Rollback

### Rollback Backend (Edge Function)

Se a Edge Function continuar falhando após o fix:

```bash
# Listar versões anteriores
npx supabase functions list

# Reverter para versão anterior (se disponível)
# Ou fazer redeploy do código do commit anterior
git checkout HEAD~1 -- back-end/supabase/functions/messaging/
npx supabase functions deploy messaging
```

### Rollback Frontend (Traduções)

Se as traduções quebrarem:

```bash
# Reverter arquivos de tradução
git checkout HEAD~1 -- front-end/src/locales/
git checkout HEAD~1 -- front-end/src/views/project-wizard/steps/StepWhatsApp.vue

# Rebuild
cd front-end
pnpm build
```

### Rollback Completo

```bash
# Reverter todo o commit
git revert HEAD

# Ou reset para commit anterior
git reset --hard HEAD~1
```

---

## 📊 Métricas de Sucesso

| Métrica | Antes | Depois |
|---------|-------|--------|
| OPTIONS `/messaging/brokers` | 503 | 200 |
| Tempo de carregamento brokers | N/A (erro) | < 2s |
| Traduções resolvidas | ~50% | 100% |
| Cobertura de idiomas | Parcial | Completa |

---

## 📁 Arquivos Modificados

### Backend
- `back-end/supabase/functions/messaging/index.ts` - Logs de diagnóstico

### Frontend
- `front-end/src/locales/pt.json` - Novo namespace `steps.whatsapp`
- `front-end/src/locales/en.json` - Novo namespace `steps.whatsapp`
- `front-end/src/locales/es.json` - Novo namespace `steps.whatsapp`
- `front-end/src/views/project-wizard/steps/StepWhatsApp.vue` - Usar namespace semântico

---

## ✅ Checklist Final

### Pré-Deploy
- [ ] Código revisado
- [ ] Testes locais passaram
- [ ] Build sem erros
- [ ] Documentação atualizada

### Deploy
- [ ] Backend deployado
- [ ] Frontend deployado
- [ ] Smoke tests passaram

### Pós-Deploy
- [ ] Monitorar logs por 30 minutos
- [ ] Verificar métricas de erro
- [ ] Confirmar com stakeholders

### Confirmações Obrigatórias
- [ ] Não alterei FORBIDDEN_PATHS
- [ ] Atualizei contratos/adapters/testes/CHANGELOG conforme necessário
- [ ] `pnpm typecheck lint test build` passou
- [ ] Plano de rollback documentado e testado

---

## 📚 Referências

- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [Vue i18n Best Practices](https://vue-i18n.intlify.dev/guide/essentials/syntax.html)
- [CORS Preflight Requests](https://developer.mozilla.org/en-US/docs/Glossary/Preflight_request)

---

## 📝 Histórico de Alterações

| Data | Autor | Descrição |
|------|-------|-----------|
| 2025-01-20 | AI Assistant | Documento criado |
