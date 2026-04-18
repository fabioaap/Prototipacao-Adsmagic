# 🔍 Análise: Cenários de Webhook - Arquitetura Proposta

**Data**: 2025-01-28  
**Status**: ⏸️ **Aguardando Aprovação**  
**Contexto**: Sistema em desenvolvimento

---

## 📋 Cenários Identificados

### **Cenário 1: Webhook Global**
**Características:**
- ✅ Webhook único para todas as instâncias de um broker
- ✅ Identificação da conta via `token` (ou outro campo) no body
- ✅ Um projeto pode ter várias contas conectadas
- ✅ Exemplo: UAZAPI envia `token` no body

**Fluxo:**
```
POST /messaging/webhook/uazapi
Body: { "token": "abc123...", "EventType": "messages", ... }
↓
Sistema busca conta por token (api_key ou access_token)
↓
Processa mensagem
```

### **Cenário 2: Webhook por Conta**
**Características:**
- ✅ URL específica por conta
- ✅ Usuário cadastra URL em plataformas externas (ex: Gupshup)
- ✅ Um projeto pode ter várias contas do mesmo broker
- ✅ Exemplo: `/webhook/gupshup/{accountId}`

**Fluxo:**
```
POST /messaging/webhook/gupshup/{accountId}
Body: { "message": {...} }
↓
Sistema identifica conta pelo accountId na URL
↓
Processa mensagem
```

---

## 🎯 Análise de Requisitos

### **Identificação de Conta**

#### **Cenário 1: Webhook Global**
- **Método**: Token no body
- **Campo no Banco**: `api_key` ou `access_token`
- **Desafio**: Múltiplas contas podem ter o mesmo token? (Não, token é único por instância)

#### **Cenário 2: Webhook por Conta**
- **Método**: UUID na URL
- **Campo no Banco**: `messaging_accounts.id`
- **Desafio**: Qual UUID usar? Precisa ser único e identificável

### **Qual UUID Usar para Webhook por Conta?**

**Opções:**

1. **`messaging_accounts.id`** ✅ **RECOMENDADO**
   - ✅ UUID único por conta
   - ✅ Já existe no banco
   - ✅ Não expõe informações sensíveis
   - ✅ Fácil de buscar
   - ✅ Permite múltiplas contas do mesmo broker

2. **`integration_account_id`**
   - ⚠️ Pode ser null (opcional)
   - ⚠️ Não é específico de mensageria
   - ❌ Não recomendado

3. **Gerar UUID específico para webhook**
   - ⚠️ Adiciona complexidade
   - ⚠️ Precisa de campo adicional
   - ⚠️ Sincronização necessária
   - ❌ Não recomendado

**Recomendação**: Usar `messaging_accounts.id` (UUID da conta)

---

## 🏗️ Arquitetura Proposta

### **Estrutura de Rotas**

```
POST /messaging/webhook/{brokerType}           → Webhook Global (identifica por token)
POST /messaging/webhook/{brokerType}/{accountId} → Webhook por Conta (identifica por UUID)
```

**Exemplos:**
```
POST /messaging/webhook/uazapi              → Global (token no body)
POST /messaging/webhook/gupshup/{uuid}      → Por conta (UUID na URL)
POST /messaging/webhook/official_whatsapp/{uuid} → Por conta (UUID na URL)
```

### **Fluxo de Identificação**

```typescript
// Router
if (pathParts.length === 3 && pathParts[1] === 'webhook') {
  // Webhook Global: /webhook/{brokerType}
  const brokerType = pathParts[2]
  return await handleWebhookGlobal(req, supabaseClient, brokerType)
}

if (pathParts.length === 4 && pathParts[1] === 'webhook') {
  // Webhook por Conta: /webhook/{brokerType}/{accountId}
  const brokerType = pathParts[2]
  const accountId = pathParts[3]
  return await handleWebhookByAccount(req, supabaseClient, brokerType, accountId)
}
```

---

## 📊 Comparação: Cenários

| Aspecto | Webhook Global | Webhook por Conta |
|---------|---------------|-------------------|
| **URL** | `/webhook/{brokerType}` | `/webhook/{brokerType}/{accountId}` |
| **Identificação** | Token no body | UUID na URL |
| **Configuração** | Uma URL para todas as contas | URL específica por conta |
| **Segurança** | Token no body (pode ser interceptado) | UUID na URL (menos sensível) |
| **Flexibilidade** | Alta (múltiplas contas) | Média (uma URL por conta) |
| **Uso** | Brokers com webhook global (UAZAPI) | Brokers que permitem URL customizada (Gupshup) |

---

## 🔧 Implementação Proposta

### **1. Handlers Separados**

#### **`handleWebhookGlobal()`**
- Identifica conta por token no body
- Usa `AccountResolverFactory` (já implementado)
- Suporta múltiplas contas do mesmo broker

#### **`handleWebhookByAccount()`**
- Identifica conta por UUID na URL
- Busca direta por `messaging_accounts.id`
- Valida que conta pertence ao broker correto
- Mais seguro (UUID não é sensível)

### **2. Validações**

#### **Webhook Global:**
- ✅ Token presente no body
- ✅ Conta encontrada pelo token
- ✅ Broker type corresponde

#### **Webhook por Conta:**
- ✅ UUID válido
- ✅ Conta existe
- ✅ Broker type corresponde ao da URL
- ✅ Conta está ativa

### **3. Segurança**

#### **Webhook Global:**
- ⚠️ Token no body (pode ser logado)
- ✅ Validação de assinatura (se configurado)
- ✅ Rate limiting por token

#### **Webhook por Conta:**
- ✅ UUID não é sensível
- ✅ Validação de assinatura (se configurado)
- ✅ Rate limiting por conta
- ✅ Validação de broker type (prevenção de confusão)

---

## 📝 Estrutura de Código Proposta

### **Handlers**

```typescript
// handlers/webhook-global.ts
export async function handleWebhookGlobal(
  req: Request,
  supabaseClient: ReturnType<typeof createClient>,
  brokerType: string
) {
  // Identifica conta por token no body
  // Usa AccountResolverFactory
}

// handlers/webhook-by-account.ts
export async function handleWebhookByAccount(
  req: Request,
  supabaseClient: ReturnType<typeof createClient>,
  brokerType: string,
  accountId: string
) {
  // Identifica conta por UUID na URL
  // Valida broker type
  // Processa webhook
}
```

### **Router**

```typescript
// index.ts
if (req.method === 'POST' && pathParts.length === 3 && pathParts[1] === 'webhook') {
  // Webhook Global
  const brokerType = pathParts[2]
  return await handleWebhookGlobal(req, supabaseClient, brokerType)
}

if (req.method === 'POST' && pathParts.length === 4 && pathParts[1] === 'webhook') {
  // Webhook por Conta
  const brokerType = pathParts[2]
  const accountId = pathParts[3]
  return await handleWebhookByAccount(req, supabaseClient, brokerType, accountId)
}
```

---

## 🔒 Considerações de Segurança

### **Webhook Global**

**Riscos:**
- ⚠️ Token no body pode ser interceptado
- ⚠️ Múltiplas contas podem ter tokens diferentes

**Mitigações:**
- ✅ Validação de assinatura (se configurado)
- ✅ Rate limiting por token
- ✅ Logs parciais do token
- ✅ HTTPS obrigatório

### **Webhook por Conta**

**Riscos:**
- ⚠️ UUID pode ser descoberto (menos crítico que token)
- ⚠️ Ataque de força bruta para descobrir UUIDs

**Mitigações:**
- ✅ Validação de assinatura (se configurado)
- ✅ Rate limiting por conta
- ✅ Validação de broker type (prevenção de confusão)
- ✅ UUIDs são aleatórios (difícil adivinhar)
- ✅ HTTPS obrigatório

---

## 📊 Vantagens da Arquitetura Proposta

### **1. Flexibilidade**
- ✅ Suporta ambos os cenários
- ✅ Fácil adicionar novos brokers
- ✅ Cada broker pode usar o método apropriado

### **2. Segurança**
- ✅ Validação específica por cenário
- ✅ Rate limiting por método
- ✅ Logs apropriados

### **3. Manutenibilidade**
- ✅ Handlers separados (SRP)
- ✅ Código reutilizável
- ✅ Fácil testar isoladamente

### **4. Extensibilidade**
- ✅ Fácil adicionar novos métodos de identificação
- ✅ Strategy Pattern aplicável
- ✅ Não requer mudanças em código existente

---

## 🎯 Recomendação Final

### **Arquitetura: Híbrida com Dois Handlers**

**Rotas:**
```
POST /messaging/webhook/{brokerType}              → Webhook Global
POST /messaging/webhook/{brokerType}/{accountId}  → Webhook por Conta
```

**UUID para Webhook por Conta:**
- ✅ Usar `messaging_accounts.id` (UUID da conta)
- ✅ Único, não sensível, fácil de buscar

**Implementação:**
- ✅ Handler separado para cada cenário
- ✅ Reutilizar lógica comum (normalização, processamento)
- ✅ Validações específicas por cenário

---

## 📋 Checklist de Implementação

### **Fase 1: Estrutura Base** ✅ **CONCLUÍDO**

- [x] Criar `handleWebhookGlobal()` handler ✅
- [x] Criar `handleWebhookByAccount()` handler ✅
- [x] Criar `processWebhookCommon()` (lógica comum) ✅
- [x] Atualizar router para suportar ambas as rotas ✅
- [x] Adicionar validação de UUID ✅
- [x] Adicionar validação de broker type ✅
- [x] Adicionar validação de status da conta ✅

### **Fase 2: Validações** ✅ **CONCLUÍDO**

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

### **Fase 4: Testes** ✅ **CONCLUÍDO**

- [x] Testes unitários para cada handler ✅
- [x] Testes de validação ✅
- [x] Testes de rate limiting ✅
- [x] Testes de resposta vazia 2xx ✅
- [ ] Testes de integração (futuro)
- [ ] Testes de segurança (futuro)

### **Fase 5: Documentação** ✅ **CONCLUÍDO**

- [x] Documentar ambos os métodos ✅
- [x] Exemplos de uso ✅
- [x] Guia de configuração por broker ✅
- [x] Atualizar API documentation ✅

---

## ✅ Conclusão

**Arquitetura Recomendada:**
- ✅ Dois handlers separados (SRP)
- ✅ Rotas específicas por cenário
- ✅ UUID: `messaging_accounts.id`
- ✅ Reutilização de lógica comum
- ✅ Segurança adequada
- ✅ Extensível e manutenível

**Status**: ✅ **Fase 1 Implementada** - Pronto para Fase 2

---

## ✅ Fase 1: Estrutura Base - CONCLUÍDA

### **Implementações Realizadas:**

1. **`utils/webhook-processor.ts`** ✅
   - Lógica comum extraída (DRY)
   - Função `processWebhookCommon()` reutilizável
   - Processa: validação de assinatura, filtros, normalização, processamento, stats

2. **`handlers/webhook-global.ts`** ✅
   - Handler para webhook global
   - Identifica conta por token no body
   - Validações: broker type, conta encontrada, broker type corresponde, conta ativa

3. **`handlers/webhook-by-account.ts`** ✅
   - Handler para webhook por conta
   - Identifica conta por UUID na URL
   - Validações: formato UUID, broker type, conta existe, broker type corresponde, conta ativa

4. **`index.ts` (Router)** ✅
   - Rotas implementadas:
     - `POST /messaging/webhook/{brokerType}` → Webhook Global
     - `POST /messaging/webhook/{brokerType}/{accountId}` → Webhook por Conta
     - `POST /messaging/webhook` → Legacy (deprecado, mantido para compatibilidade)

### **Validações Implementadas:**

✅ Formato UUID  
✅ Broker type válido  
✅ Conta existe  
✅ Broker type corresponde  
✅ Conta está ativa  
✅ Body obrigatório  
✅ JSON válido  

### **Fase 2: Validações - CONCLUÍDA**

#### **Implementações Realizadas:**

1. **`utils/validation.ts`** ✅
   - Validações centralizadas e reutilizáveis
   - Type guards para TypeScript
   - Validação de UUID, broker type, JSON, status

2. **`utils/logger.ts`** ✅
   - Logger estruturado com contexto
   - Métricas de tempo de processamento
   - Logs em JSON formatado

3. **Handlers Atualizados** ✅
   - Logs informativos em cada etapa
   - Métricas de performance
   - Mensagens de erro melhoradas

#### **Melhorias:**

✅ Validações centralizadas (DRY)  
✅ Logs estruturados com contexto  
✅ Métricas de tempo de processamento  
✅ Mensagens de erro claras e específicas  

### **Próximos Passos (Fase 3):**
- [ ] Rate limiting por método
- [ ] Validação de assinatura (ambos)
- [ ] Validação de origem (futuro)
