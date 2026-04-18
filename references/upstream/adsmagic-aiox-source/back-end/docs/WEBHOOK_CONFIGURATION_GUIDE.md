# 🔧 Guia de Configuração de Webhooks por Broker

**Versão**: 2.0  
**Data**: 2025-01-28  
**Status**: Documentação Atualizada (v0.7.0 - Separação de Função)

---

## 📋 Visão Geral

Este guia explica como configurar webhooks para cada broker suportado. 

**⚠️ IMPORTANTE**: A partir da versão 0.7.0, os webhooks foram migrados para uma função separada (`messaging-webhooks`) que não requer autenticação JWT. A função `messaging` agora é exclusiva para endpoints autenticados.

O sistema suporta dois métodos de identificação de conta:

1. **Webhook Global** - Identifica conta por token no body
2. **Webhook por Conta** - Identifica conta por UUID na URL

---

## 🔄 Métodos de Webhook

### **Método 1: Webhook Global**

**Rota**: `POST /messaging-webhooks/webhook/{brokerType}`

**Características:**
- ✅ Uma URL para todas as contas do broker
- ✅ Identificação automática pelo token no body
- ✅ Fácil configuração (uma URL)
- ✅ Sem autenticação JWT necessária (função pública)
- ⚠️ Token no body (menos seguro que UUID)

**Quando Usar:**
- Brokers que têm webhook único para todas as instâncias
- Exemplos: UAZAPI, Evolution

**URL de Exemplo:**
```
https://projeto.supabase.co/functions/v1/messaging-webhooks/webhook/uazapi
```

---

### **Método 2: Webhook por Conta**

**Rota**: `POST /messaging-webhooks/webhook/{brokerType}/{accountId}`

**Características:**
- ✅ URL única por conta
- ✅ UUID na URL (não sensível)
- ✅ Fácil identificar qual conta recebeu
- ✅ Sem autenticação JWT necessária (função pública)
- ⚠️ Múltiplas URLs para gerenciar

**Quando Usar:**
- Brokers que permitem URL customizada por conta
- Exemplos: Gupshup, WhatsApp Business API

**URL de Exemplo:**
```
https://projeto.supabase.co/functions/v1/messaging-webhooks/webhook/gupshup/550e8400-e29b-41d4-a716-446655440000
```

**Como Obter o UUID:**
- O UUID é o `id` da conta em `messaging_accounts`
- Pode ser obtido através da API ou banco de dados

---

## 📱 Configuração por Broker

### **1. UAZAPI**

#### **Método Recomendado: Webhook Global**

**URL do Webhook:**
```
https://projeto.supabase.co/functions/v1/messaging-webhooks/webhook/uazapi
```

**Configuração no UAZAPI:**
1. Acesse as configurações da instância no UAZAPI
2. Configure o webhook URL: `https://projeto.supabase.co/functions/v1/messaging-webhooks/webhook/uazapi`
3. O UAZAPI enviará o `token` automaticamente no body

**Formato do Webhook:**
```json
{
  "token": "2bb07e81-dfe3-414b-8e43-695030cb1c44",
  "EventType": "messages",
  "message": {
    "chatid": "554791662434@s.whatsapp.net",
    "text": "Olá!",
    "fromMe": false
  },
  "owner": "554796772041"
}
```

**Identificação:**
- Sistema identifica conta pelo campo `token` no body
- Busca em `messaging_accounts` onde `api_key = token`

**Resposta Esperada:**
- HTTP 200 com resposta vazia (requisito do UAZAPI)

---

### **2. Gupshup**

#### **Método Recomendado: Webhook por Conta**

**URL do Webhook:**
```
https://projeto.supabase.co/functions/v1/messaging-webhooks/webhook/gupshup/{accountId}
```

**Configuração no Gupshup:**
1. Acesse as configurações da conta no Gupshup
2. Configure o webhook URL: `https://projeto.supabase.co/functions/v1/messaging-webhooks/webhook/gupshup/{accountId}`
3. Substitua `{accountId}` pelo UUID da conta (`messaging_accounts.id`)

**Como Obter o Account ID:**
```sql
SELECT id FROM messaging_accounts 
WHERE broker_type = 'gupshup' 
AND account_name = 'Nome da Conta';
```

**Formato do Webhook:**
```json
{
  "message": {
    "from": "5511999999999",
    "text": "Olá!",
    "timestamp": 1642684800
  }
}
```

**Identificação:**
- Sistema identifica conta pelo UUID na URL
- Valida que o broker type corresponde

**Resposta Esperada:**
- HTTP 200 com resposta vazia

---

### **3. WhatsApp Business API (Official)**

#### **Método Recomendado: Webhook por Conta**

**URL do Webhook:**
```
https://projeto.supabase.co/functions/v1/messaging-webhooks/webhook/official_whatsapp/{accountId}
```

**Configuração no Meta:**
1. Acesse o Meta Business Manager
2. Configure o webhook URL: `https://projeto.supabase.co/functions/v1/messaging-webhooks/webhook/official_whatsapp/{accountId}`
3. Substitua `{accountId}` pelo UUID da conta
4. Configure o webhook secret (se necessário)

**Formato do Webhook:**
```json
{
  "object": "whatsapp_business_account",
  "entry": [{
    "changes": [{
      "value": {
        "messages": [{
          "from": "5511999999999",
          "text": {
            "body": "Olá!"
          }
        }]
      }
    }]
  }]
}
```

**Identificação:**
- Sistema identifica conta pelo UUID na URL
- Valida assinatura do webhook (se `webhook_secret` configurado)

**Resposta Esperada:**
- HTTP 200 com resposta vazia

---

### **4. Evolution API**

#### **Método Recomendado: Webhook Global**

**URL do Webhook:**
```
https://projeto.supabase.co/functions/v1/messaging-webhooks/webhook/evolution
```

**Configuração no Evolution:**
1. Configure o webhook URL na instância
2. O Evolution enviará o token no body

**Formato do Webhook:**
```json
{
  "event": "messages.upsert",
  "instance": "instance-name",
  "data": {
    "key": {
      "remoteJid": "5511999999999@s.whatsapp.net"
    },
    "message": {
      "conversation": "Olá!"
    }
  }
}
```

**Identificação:**
- Sistema identifica conta pelo token no body
- Busca em `messaging_accounts` onde `api_key = token`

**Resposta Esperada:**
- HTTP 200 com resposta vazia

---

## 🔒 Segurança

### **Validação de Assinatura**

Alguns brokers suportam validação de assinatura de webhook:

1. **Configurar `webhook_secret`** na conta (`messaging_accounts.webhook_secret`)
2. O sistema valida automaticamente a assinatura quando presente
3. Headers suportados:
   - `x-hub-signature-256` (WhatsApp Business API)
   - `x-signature` (UAZAPI)
   - `x-webhook-signature` (Gupshup)
   - `signature` (genérico)

### **Rate Limiting**

O sistema implementa rate limiting automático:

- **Webhook Global**: 200 requisições/minuto por conta
- **Webhook por Conta**: 100 requisições/minuto por conta

**Headers de Rate Limit:**
```http
X-RateLimit-Limit: 200
X-RateLimit-Remaining: 150
X-RateLimit-Reset: 1642684860
Retry-After: 60
```

---

## 📊 Exemplos de Uso

### **Exemplo 1: UAZAPI (Webhook Global)**

```bash
curl -X POST https://projeto.supabase.co/functions/v1/messaging-webhooks/webhook/uazapi \
  -H "Content-Type: application/json" \
  -d '{
    "token": "2bb07e81-dfe3-414b-8e43-695030cb1c44",
    "EventType": "messages",
    "message": {
      "chatid": "554791662434@s.whatsapp.net",
      "text": "Olá!",
      "fromMe": false
    }
  }'
```

**Resposta:**
```http
HTTP/1.1 200 OK
Content-Length: 0
```

---

### **Exemplo 2: Gupshup (Webhook por Conta)**

```bash
curl -X POST https://projeto.supabase.co/functions/v1/messaging-webhooks/webhook/gupshup/550e8400-e29b-41d4-a716-446655440000 \
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
```http
HTTP/1.1 200 OK
Content-Length: 0
```

---

## ⚠️ Troubleshooting

### **Erro 404: Conta não encontrada**

**Webhook Global:**
- Verifique se o `token` no body corresponde a uma conta ativa
- Verifique se a conta está com `status = 'active'`
- Verifique se o `broker_type` corresponde ao da URL

**Webhook por Conta:**
- Verifique se o UUID está correto
- Verifique se a conta existe e está ativa
- Verifique se o `broker_type` corresponde ao da URL

### **Erro 400: Broker type mismatch**

- O `broker_type` da conta não corresponde ao da URL
- Exemplo: Tentar usar `/webhook/gupshup/{id}` para uma conta `uazapi`

### **Erro 429: Rate limit excedido**

- Aguarde o tempo indicado em `Retry-After`
- Verifique os headers `X-RateLimit-*` para mais informações

### **Resposta não vazia**

- Alguns brokers requerem resposta vazia 2xx
- O sistema retorna automaticamente resposta vazia após processar
- Se o broker reclamar, verifique os logs

---

## 📚 Referências

- [Documentação da API](./MESSAGING_API_DOCUMENTATION.md)
- [Arquitetura de Webhooks](../ANALISE_ARQUITETURA_WEBHOOK_CENARIOS.md)
