# 🏗️ Análise: Arquitetura de Webhooks - Dois Cenários

**Data**: 2025-01-28  
**Status**: ⏸️ **Aguardando Aprovação**  
**Contexto**: Sistema em desenvolvimento

---

## 📋 Cenários Identificados

### **Cenário 1: Webhook Global**
**Descrição:**
- Webhook único para todas as instâncias de um broker
- Identificação da conta via informação no body (ex: `token`)
- Um projeto pode ter várias contas conectadas
- Exemplo: UAZAPI envia `token` no body

**Características:**
- ✅ Uma URL para todas as contas do broker
- ✅ Identificação dinâmica pelo body
- ✅ Fácil configuração (uma URL)
- ⚠️ Token no body (menos seguro que UUID)

**Exemplo:**
```
POST /messaging/webhook/uazapi
Body: {
  "token": "2bb07e81-dfe3-414b-8e43-695030cb1c44",
  "EventType": "messages",
  "message": {...}
}
```

### **Cenário 2: Webhook por Conta**
**Descrição:**
- URL específica por conta
- Usuário cadastra URL em plataformas externas (ex: Gupshup)
- Um projeto pode ter várias contas do mesmo broker
- Identificação via UUID na URL

**Características:**
- ✅ URL única por conta
- ✅ UUID na URL (não sensível)
- ✅ Fácil identificar qual conta recebeu
- ⚠️ Múltiplas URLs para gerenciar

**Exemplo:**
```
POST /messaging/webhook/gupshup/550e8400-e29b-41d4-a716-446655440000
Body: {
  "message": {...}
}
```

---

## 🔍 Análise: Qual UUID Usar?

### **Opções Disponíveis**

#### **1. `messaging_accounts.id`** ✅ **RECOMENDADO**

**Características:**
- ✅ UUID único por conta (PRIMARY KEY)
- ✅ Já existe no banco (sem migração)
- ✅ Não expõe informações sensíveis
- ✅ Fácil de buscar (índice primário)
- ✅ Permite múltiplas contas do mesmo broker
- ✅ Relacionamento direto com a conta

**Exemplo:**
```sql
SELECT * FROM messaging_accounts WHERE id = '550e8400-e29b-41d4-a716-446655440000'
```

**Vantagens:**
- ✅ Sem necessidade de campo adicional
- ✅ Performance (índice primário)
- ✅ Não sensível (UUID aleatório)
- ✅ Único globalmente

**Desvantagens:**
- ⚠️ UUID pode ser descoberto (menos crítico que token)
- ⚠️ Não é "amigável" (mas não precisa ser)

**Score: 9.5/10**

---

#### **2. `integration_account_id`**

**Características:**
- ⚠️ Pode ser NULL (opcional)
- ⚠️ Não é específico de mensageria
- ⚠️ Relacionamento indireto
- ❌ Não recomendado para webhook

**Score: 4/10**

---

#### **3. Gerar UUID Específico para Webhook**

**Características:**
- ⚠️ Requer campo adicional no banco
- ⚠️ Complexidade de sincronização
- ⚠️ Manutenção adicional
- ❌ Não recomendado (over-engineering)

**Score: 5/10**

---

### **Recomendação Final: `messaging_accounts.id`**

**Justificativa:**
1. ✅ **Já existe** - Sem migração necessária
2. ✅ **Único** - PRIMARY KEY garante unicidade
3. ✅ **Performance** - Índice primário
4. ✅ **Não sensível** - UUID aleatório
5. ✅ **Direto** - Relacionamento direto com conta

---

## 🏗️ Arquitetura Proposta

### **Estrutura de Rotas**

```
POST /messaging/webhook/{brokerType}              → Webhook Global
POST /messaging/webhook/{brokerType}/{accountId}  → Webhook por Conta
```

**Exemplos:**
```
POST /messaging/webhook/uazapi                    → Global (token no body)
POST /messaging/webhook/gupshup/{uuid}            → Por conta (UUID na URL)
POST /messaging/webhook/official_whatsapp/{uuid}  → Por conta (UUID na URL)
```

### **Fluxo de Identificação**

#### **Webhook Global:**
```
1. Recebe POST /webhook/{brokerType}
2. Extrai token do body
3. Busca conta por token (api_key ou access_token)
4. Valida broker type
5. Processa webhook
```

#### **Webhook por Conta:**
```
1. Recebe POST /webhook/{brokerType}/{accountId}
2. Valida UUID format
3. Busca conta por ID
4. Valida broker type corresponde
5. Valida conta está ativa
6. Processa webhook
```

---

## 📊 Comparação: Cenários

| Aspecto | Webhook Global | Webhook por Conta |
|---------|---------------|-------------------|
| **URL** | `/webhook/{brokerType}` | `/webhook/{brokerType}/{accountId}` |
| **Identificação** | Token no body | UUID na URL |
| **Configuração** | Uma URL para todas | URL específica por conta |
| **Segurança** | Token no body | UUID na URL (menos sensível) |
| **Flexibilidade** | Alta (múltiplas contas) | Média (uma URL por conta) |
| **Uso** | UAZAPI, Evolution | Gupshup, WhatsApp Business API |
| **Múltiplas Contas** | ✅ Sim (identifica por token) | ✅ Sim (URLs diferentes) |

---

## 🔧 Implementação Proposta

### **1. Handlers Separados (SRP)**

#### **`handlers/webhook-global.ts`**
```typescript
/**
 * Handler para webhook global
 * Identifica conta por token no body
 */
export async function handleWebhookGlobal(
  req: Request,
  supabaseClient: ReturnType<typeof createClient>,
  brokerType: string
) {
  // 1. Validar broker type
  // 2. Ler body
  // 3. Usar AccountResolverFactory (já implementado)
  // 4. Processar webhook
}
```

#### **`handlers/webhook-by-account.ts`**
```typescript
/**
 * Handler para webhook por conta
 * Identifica conta por UUID na URL
 */
export async function handleWebhookByAccount(
  req: Request,
  supabaseClient: ReturnType<typeof createClient>,
  brokerType: string,
  accountId: string
) {
  // 1. Validar UUID format
  // 2. Buscar conta por ID
  // 3. Validar broker type corresponde
  // 4. Validar conta ativa
  // 5. Processar webhook
}
```

### **2. Router Atualizado**

```typescript
// index.ts

// POST /messaging/webhook/{brokerType} - Webhook Global
if (req.method === 'POST' && pathParts.length === 3 && pathParts[1] === 'webhook') {
  const brokerType = pathParts[2]
  return await handleWebhookGlobal(req, supabaseClient, brokerType)
}

// POST /messaging/webhook/{brokerType}/{accountId} - Webhook por Conta
if (req.method === 'POST' && pathParts.length === 4 && pathParts[1] === 'webhook') {
  const brokerType = pathParts[2]
  const accountId = pathParts[3]
  return await handleWebhookByAccount(req, supabaseClient, brokerType, accountId)
}
```

### **3. Validações Específicas**

#### **Webhook Global:**
- ✅ Token presente no body
- ✅ Conta encontrada pelo token
- ✅ Broker type corresponde
- ✅ Validação de assinatura (se configurado)

#### **Webhook por Conta:**
- ✅ UUID válido (formato)
- ✅ Conta existe
- ✅ Broker type corresponde ao da URL
- ✅ Conta está ativa
- ✅ Validação de assinatura (se configurado)

### **4. Reutilização de Código**

**Lógica Comum:**
- ✅ Normalização (já implementado)
- ✅ Processamento (já implementado)
- ✅ Filtros de mensagem (já implementado)
- ✅ Atualização de estatísticas (já implementado)

**Extração:**
```typescript
// utils/webhook-processor.ts
export async function processWebhookCommon(
  account: MessagingAccount,
  body: unknown,
  supabaseClient: ReturnType<typeof createClient>
) {
  // Lógica comum de processamento
  // 1. Criar broker
  // 2. Filtrar mensagens
  // 3. Normalizar
  // 4. Processar
  // 5. Atualizar stats
}
```

---

## 🔒 Segurança

### **Webhook Global**

**Riscos:**
- ⚠️ Token no body pode ser interceptado
- ⚠️ Logs podem expor token

**Mitigações:**
- ✅ Validação de assinatura (se configurado)
- ✅ Rate limiting por token
- ✅ Logs parciais do token (primeiros 10 caracteres)
- ✅ HTTPS obrigatório
- ✅ Validação de origem (IP whitelist - futuro)

### **Webhook por Conta**

**Riscos:**
- ⚠️ UUID pode ser descoberto (menos crítico)
- ⚠️ Ataque de força bruta (baixa probabilidade)

**Mitigações:**
- ✅ UUID aleatório (difícil adivinhar)
- ✅ Validação de assinatura (se configurado)
- ✅ Rate limiting por conta
- ✅ Validação de broker type (prevenção de confusão)
- ✅ HTTPS obrigatório
- ✅ Validação de origem (IP whitelist - futuro)

---

## 📈 Vantagens da Arquitetura

### **1. Flexibilidade**
- ✅ Suporta ambos os cenários
- ✅ Cada broker pode usar o método apropriado
- ✅ Fácil adicionar novos brokers

### **2. Segurança**
- ✅ Validação específica por cenário
- ✅ Rate limiting por método
- ✅ Logs apropriados (sem dados sensíveis)

### **3. Manutenibilidade**
- ✅ Handlers separados (SRP)
- ✅ Código reutilizável (DRY)
- ✅ Fácil testar isoladamente

### **4. Extensibilidade**
- ✅ Fácil adicionar novos métodos de identificação
- ✅ Strategy Pattern aplicável
- ✅ Não requer mudanças em código existente (OCP)

### **5. Clareza**
- ✅ URL indica método de identificação
- ✅ Logs claros sobre qual método foi usado
- ✅ Documentação específica por cenário

---

## 🎯 Casos de Uso

### **Caso 1: UAZAPI (Webhook Global)**
```
Configuração no UAZAPI:
Webhook URL: https://projeto.supabase.co/functions/v1/messaging/webhook/uazapi

Fluxo:
1. UAZAPI envia webhook com token no body
2. Sistema identifica conta pelo token
3. Processa mensagem
```

### **Caso 2: Gupshup (Webhook por Conta)**
```
Configuração no Gupshup:
Webhook URL: https://projeto.supabase.co/functions/v1/messaging/webhook/gupshup/550e8400-e29b-41d4-a716-446655440000

Fluxo:
1. Gupshup envia webhook para URL específica
2. Sistema identifica conta pelo UUID na URL
3. Valida broker type
4. Processa mensagem
```

### **Caso 3: Múltiplas Contas Gupshup**
```
Projeto tem 3 contas Gupshup:
- Conta 1: /webhook/gupshup/uuid-1
- Conta 2: /webhook/gupshup/uuid-2
- Conta 3: /webhook/gupshup/uuid-3

Cada conta tem sua própria URL configurada no Gupshup
```

---

## 📋 Checklist de Implementação

### **Fase 1: Estrutura Base** ✅ **CONCLUÍDO**
- [x] Criar `handlers/webhook-global.ts` ✅
- [x] Criar `handlers/webhook-by-account.ts` ✅
- [x] Criar `utils/webhook-processor.ts` (lógica comum) ✅
- [x] Atualizar router (`index.ts`) ✅

### **Fase 2: Validações** ✅ **CONCLUÍDO**
- [x] Validar formato UUID ✅
- [x] Validar broker type na URL ✅
- [x] Validar que conta pertence ao broker correto ✅
- [x] Validar que conta está ativa ✅
- [x] Adicionar logs informativos ✅
- [x] Criar utils de validação reutilizáveis ✅
- [x] Adicionar métricas de tempo de processamento ✅
- [x] Melhorar mensagens de erro ✅

### **Fase 3: Segurança** ✅ **CONCLUÍDO**
- [x] Rate limiting por método ✅
- [x] Validação de assinatura (ambos) ✅
- [x] Logs apropriados (sem dados sensíveis) ✅
- [x] Resposta vazia 2xx para webhooks ✅
- [ ] Validação de origem (futuro)

### **Fase 4: Testes** ✅ **CONCLUÍDO**
- [x] Testes unitários para cada handler ✅
- [x] Testes de validação ✅
- [x] Testes de rate limiting ✅
- [x] Testes de resposta vazia 2xx ✅
- [ ] Testes de integração (futuro)
- [ ] Testes de múltiplas contas (futuro)

### **Fase 5: Documentação** ✅ **CONCLUÍDO**
- [x] Documentar ambos os métodos ✅
- [x] Exemplos de uso ✅
- [x] Guia de configuração por broker ✅
- [x] Atualizar API documentation ✅

---

## ✅ Conclusão

### **Arquitetura Recomendada:**

**Rotas:**
```
POST /messaging/webhook/{brokerType}              → Webhook Global
POST /messaging/webhook/{brokerType}/{accountId}  → Webhook por Conta
```

**UUID:**
- ✅ Usar `messaging_accounts.id` (UUID da conta)

**Implementação:**
- ✅ Dois handlers separados (SRP)
- ✅ Lógica comum extraída (DRY)
- ✅ Validações específicas por cenário
- ✅ Segurança adequada
- ✅ Extensível e manutenível

**Status**: ✅ **Fase 1 Implementada** - Pronto para Fase 2

---

## ✅ Fase 1: Estrutura Base - CONCLUÍDA

### **Arquivos Criados:**

1. **`utils/webhook-processor.ts`** ✅
   - Lógica comum de processamento extraída
   - Função `processWebhookCommon()` reutilizável
   - Segue DRY (Don't Repeat Yourself)

2. **`handlers/webhook-global.ts`** ✅
   - Handler para webhook global
   - Identifica conta por token no body
   - Valida broker type e status da conta
   - Usa `AccountResolverFactory` (já implementado)

3. **`handlers/webhook-by-account.ts`** ✅
   - Handler para webhook por conta
   - Identifica conta por UUID na URL
   - Valida formato UUID, broker type e status
   - Busca direta por `messaging_accounts.id`

### **Arquivos Modificados:**

1. **`index.ts`** ✅
   - Adicionadas rotas para webhook global e por conta
   - Mantido endpoint legacy `/webhook` (deprecado)
   - Prioridade: Específicos primeiro, depois legacy

### **Rotas Implementadas:**

```
POST /messaging/webhook/{brokerType}              → Webhook Global ✅
POST /messaging/webhook/{brokerType}/{accountId}  → Webhook por Conta ✅
POST /messaging/webhook                           → Legacy (deprecado) ✅
```

### **Validações Implementadas:**

#### **Webhook Global:**
- ✅ Broker type válido
- ✅ Body obrigatório
- ✅ JSON válido
- ✅ Conta encontrada pelo token
- ✅ Broker type corresponde
- ✅ Conta está ativa

#### **Webhook por Conta:**
- ✅ Formato UUID válido
- ✅ Broker type válido
- ✅ Body obrigatório
- ✅ JSON válido
- ✅ Conta existe
- ✅ Broker type corresponde
- ✅ Conta está ativa

### **Fase 2: Validações - CONCLUÍDA**

#### **Arquivos Criados:**

1. **`utils/validation.ts`** ✅
   - Funções de validação reutilizáveis
   - `isValidUUID()` - Valida formato UUID v4
   - `isValidBrokerType()` - Valida broker type com type guard
   - `isValidJSON()` - Valida JSON
   - `isAccountActive()` - Valida status da conta
   - `validateFields()` - Valida múltiplos campos
   - Constante `SUPPORTED_BROKERS` para centralizar brokers suportados

2. **`utils/logger.ts`** ✅
   - Logger estruturado com contexto
   - Classe `WebhookLogger` com métodos: `info()`, `warn()`, `error()`, `metrics()`
   - Função `measureTime()` para medir tempo de execução
   - Logs em JSON com timestamp, nível, contexto e dados

#### **Arquivos Modificados:**

1. **`handlers/webhook-global.ts`** ✅
   - Integrado com `WebhookLogger`
   - Métricas de tempo: resolução de conta, processamento total
   - Logs informativos em cada etapa
   - Mensagens de erro melhoradas

2. **`handlers/webhook-by-account.ts`** ✅
   - Integrado com `WebhookLogger`
   - Métricas de tempo: lookup de conta, processamento total
   - Logs informativos em cada etapa
   - Mensagens de erro melhoradas

3. **`utils/webhook-processor.ts`** ✅
   - Integrado com `WebhookLogger`
   - Métricas de tempo: validação de assinatura, normalização, processamento
   - Logs informativos em cada etapa

#### **Melhorias Implementadas:**

✅ **Validações Centralizadas**
- Utils reutilizáveis (DRY)
- Type guards para TypeScript
- Mensagens de erro claras e específicas

✅ **Logs Estruturados**
- JSON formatado com timestamp
- Contexto em cada log (handler, accountId, brokerType)
- Métricas de tempo de processamento
- Sem dados sensíveis nos logs

✅ **Métricas de Performance**
- Tempo de resolução/lookup de conta
- Tempo de validação de assinatura
- Tempo de normalização
- Tempo de processamento
- Tempo total de processamento

✅ **Mensagens de Erro Melhoradas**
- Mensagens específicas por tipo de erro
- Informações sobre valores esperados
- Lista de brokers suportados quando aplicável

### **Próximos Passos (Fase 3):**
- [ ] Rate limiting por método
- [ ] Validação de assinatura (ambos)
- [ ] Logs apropriados (sem dados sensíveis) ✅ (já implementado)
- [ ] Validação de origem (futuro)
