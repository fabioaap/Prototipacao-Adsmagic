# ✅ Implementação: Fase 1 - Estrutura Base de Webhooks

**Data**: 2025-01-28  
**Status**: ✅ **Concluído**  
**Fase**: 1 de 5

---

## 🎯 Objetivo

Implementar estrutura base para suportar dois cenários de webhook:
1. **Webhook Global** - Identifica conta por token no body
2. **Webhook por Conta** - Identifica conta por UUID na URL

---

## ✅ Implementações Realizadas

### **1. Lógica Comum Extraída**

**Arquivo**: `utils/webhook-processor.ts` (novo)

**Funcionalidades:**
- ✅ Função `processWebhookCommon()` com lógica reutilizável
- ✅ Validação de assinatura de webhook
- ✅ Filtros de mensagem (Strategy Pattern)
- ✅ Normalização de dados
- ✅ Processamento de mensagem
- ✅ Atualização de estatísticas

**Benefícios:**
- ✅ DRY (Don't Repeat Yourself)
- ✅ Código reutilizável entre handlers
- ✅ Fácil manutenção (mudanças em um lugar)

---

### **2. Handler: Webhook Global**

**Arquivo**: `handlers/webhook-global.ts` (novo)

**Rota**: `POST /messaging/webhook/{brokerType}`

**Funcionalidades:**
- ✅ Valida broker type
- ✅ Lê e parse body
- ✅ Identifica conta por token no body (via `AccountResolverFactory`)
- ✅ Valida broker type corresponde
- ✅ Valida conta está ativa
- ✅ Processa webhook usando lógica comum

**Exemplo de Uso:**
```bash
POST /messaging/webhook/uazapi
Body: {
  "token": "2bb07e81-dfe3-414b-8e43-695030cb1c44",
  "EventType": "messages",
  "message": {...}
}
```

---

### **3. Handler: Webhook por Conta**

**Arquivo**: `handlers/webhook-by-account.ts` (novo)

**Rota**: `POST /messaging/webhook/{brokerType}/{accountId}`

**Funcionalidades:**
- ✅ Valida formato UUID
- ✅ Valida broker type
- ✅ Busca conta por ID (`messaging_accounts.id`)
- ✅ Valida broker type corresponde
- ✅ Valida conta está ativa
- ✅ Processa webhook usando lógica comum

**Exemplo de Uso:**
```bash
POST /messaging/webhook/gupshup/550e8400-e29b-41d4-a716-446655440000
Body: {
  "message": {...}
}
```

---

### **4. Router Atualizado**

**Arquivo**: `index.ts` (modificado)

**Rotas Implementadas:**
```typescript
// Webhook Global
POST /messaging/webhook/{brokerType}

// Webhook por Conta
POST /messaging/webhook/{brokerType}/{accountId}

// Legacy (deprecado, mantido para compatibilidade)
POST /messaging/webhook
```

**Prioridade:**
1. Webhook Global (3 partes)
2. Webhook por Conta (4 partes)
3. Legacy (2 partes)

---

## 📊 Estrutura de Código

### **Arquitetura Implementada**

```
handlers/
├── webhook.ts              → Legacy (deprecado)
├── webhook-global.ts        → Novo ✅
└── webhook-by-account.ts    → Novo ✅

utils/
└── webhook-processor.ts     → Novo ✅ (lógica comum)

index.ts                     → Atualizado ✅
```

### **Fluxo de Processamento**

#### **Webhook Global:**
```
POST /webhook/{brokerType}
↓
handleWebhookGlobal()
↓
Valida broker type
↓
Lê body
↓
AccountResolverFactory.resolve() (identifica por token)
↓
Valida broker type corresponde
↓
Valida conta ativa
↓
processWebhookCommon() (lógica comum)
```

#### **Webhook por Conta:**
```
POST /webhook/{brokerType}/{accountId}
↓
handleWebhookByAccount()
↓
Valida UUID format
↓
Valida broker type
↓
Busca conta por ID
↓
Valida broker type corresponde
↓
Valida conta ativa
↓
processWebhookCommon() (lógica comum)
```

---

## ✅ Validações Implementadas

### **Webhook Global:**
- ✅ Broker type válido
- ✅ Body obrigatório
- ✅ JSON válido
- ✅ Conta encontrada pelo token
- ✅ Broker type corresponde ao da URL
- ✅ Conta está ativa

### **Webhook por Conta:**
- ✅ Formato UUID válido
- ✅ Broker type válido
- ✅ Body obrigatório
- ✅ JSON válido
- ✅ Conta existe
- ✅ Broker type corresponde ao da URL
- ✅ Conta está ativa

---

## 🔒 Segurança

### **Implementado:**
- ✅ Validação de assinatura (se configurado)
- ✅ Validação de broker type (prevenção de confusão)
- ✅ Validação de status da conta
- ✅ Logs informativos (sem dados sensíveis)
- ✅ Mensagens de erro claras

### **Futuro (Fase 3):**
- ⏳ Rate limiting por método
- ⏳ Validação de origem (IP whitelist)

---

## 📝 Exemplos de Uso

### **Webhook Global (UAZAPI)**

```bash
curl -X POST https://projeto.supabase.co/functions/v1/messaging/webhook/uazapi \
  -H "Content-Type: application/json" \
  -d '{
    "token": "2bb07e81-dfe3-414b-8e43-695030cb1c44",
    "EventType": "messages",
    "message": {
      "chatid": "554791662434@s.whatsapp.net",
      "text": "Olá!",
      "fromMe": false
    },
    "owner": "554796772041"
  }'
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "processed": true
  }
}
```

### **Webhook por Conta (Gupshup)**

```bash
curl -X POST https://projeto.supabase.co/functions/v1/messaging/webhook/gupshup/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -d '{
    "message": {
      "from": "5511999999999",
      "text": "Olá!",
      "timestamp": 1642684800
    }
  }'
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "processed": true
  }
}
```

---

## 🧪 Testes Necessários (Fase 4)

### **Testes Unitários:**
- [ ] `processWebhookCommon()` - Lógica comum
- [ ] `handleWebhookGlobal()` - Validações e fluxo
- [ ] `handleWebhookByAccount()` - Validações e fluxo
- [ ] Validação de UUID
- [ ] Validação de broker type

### **Testes de Integração:**
- [ ] Webhook global completo (UAZAPI)
- [ ] Webhook por conta completo (Gupshup)
- [ ] Múltiplas contas do mesmo broker
- [ ] Erros de validação

---

## 📋 Checklist de Implementação

### **Fase 1: Estrutura Base** ✅ **CONCLUÍDO**
- [x] Criar `utils/webhook-processor.ts` ✅
- [x] Criar `handlers/webhook-global.ts` ✅
- [x] Criar `handlers/webhook-by-account.ts` ✅
- [x] Atualizar router (`index.ts`) ✅
- [x] Validação de UUID ✅
- [x] Validação de broker type ✅
- [x] Validação de status da conta ✅
- [x] Logs informativos ✅
- [x] Verificar linter (sem erros) ✅

### **Fase 2: Validações** ⏳ **PRÓXIMA**
- [ ] Melhorar logs informativos
- [ ] Adicionar métricas por método
- [ ] Otimizar validações

### **Fase 3: Segurança** ⏳ **PENDENTE**
- [ ] Rate limiting por método
- [ ] Validação de assinatura (ambos)
- [ ] Logs apropriados (sem dados sensíveis)
- [ ] Validação de origem (futuro)

### **Fase 4: Testes** ⏳ **PENDENTE**
- [ ] Testes unitários para cada handler
- [ ] Testes de integração
- [ ] Testes de segurança
- [ ] Testes de múltiplas contas

### **Fase 5: Documentação** ⏳ **PENDENTE**
- [ ] Documentar ambos os métodos
- [ ] Exemplos de uso
- [ ] Guia de configuração por broker
- [ ] Atualizar API documentation

---

## 📁 Arquivos Criados/Modificados

### **Criados:**
1. ✅ `utils/webhook-processor.ts` - Lógica comum
2. ✅ `handlers/webhook-global.ts` - Handler global
3. ✅ `handlers/webhook-by-account.ts` - Handler por conta

### **Modificados:**
1. ✅ `index.ts` - Router atualizado

### **Mantidos (Legacy):**
1. ✅ `handlers/webhook.ts` - Mantido para compatibilidade (deprecado)

---

## 🎉 Conclusão

**Fase 1 concluída com sucesso:**

✅ **Estrutura base implementada**  
✅ **Dois handlers separados (SRP)**  
✅ **Lógica comum extraída (DRY)**  
✅ **Validações básicas implementadas**  
✅ **Router atualizado**  
✅ **Sem erros de linter**  

**Status**: 🟢 **Pronto para Fase 2**

---

## 🔄 Próximos Passos

1. **Fase 2**: Melhorar validações e logs
2. **Fase 3**: Implementar segurança adicional
3. **Fase 4**: Adicionar testes
4. **Fase 5**: Documentar completamente
