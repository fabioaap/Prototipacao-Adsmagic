# 📝 Exemplos de Uso - Webhooks

**Versão**: 1.0  
**Data**: 2025-01-28

---

## 🎯 Visão Geral

Este documento fornece exemplos práticos de como usar os endpoints de webhook para diferentes brokers.

---

## 📱 Exemplos por Broker

### **1. UAZAPI - Webhook Global**

#### **Configuração**

**URL do Webhook:**
```
https://projeto.supabase.co/functions/v1/messaging-webhooks/webhook/uazapi
```

#### **Exemplo de Requisição**

```bash
curl -X POST https://projeto.supabase.co/functions/v1/messaging-webhooks/webhook/uazapi \
  -H "Content-Type: application/json" \
  -d '{
    "token": "2bb07e81-dfe3-414b-8e43-695030cb1c44",
    "EventType": "messages",
    "message": {
      "chatid": "554791662434@s.whatsapp.net",
      "text": "Olá! Como posso ajudar?",
      "fromMe": false,
      "isGroup": false,
      "messageType": "ExtendedTextMessage",
      "senderName": "João Silva",
      "messageTimestamp": 1642684800,
      "content": {
        "text": "Olá! Como posso ajudar?",
        "contextInfo": {
          "conversionSource": "FB_Ads",
          "externalAdReply": {
            "title": "Anúncio Facebook",
            "body": "Descrição do anúncio"
          }
        }
      }
    },
    "owner": "554796772041"
  }'
```

#### **Resposta Esperada**

```http
HTTP/1.1 200 OK
Content-Length: 0
Access-Control-Allow-Origin: *
```

#### **O Que Acontece**

1. Sistema identifica conta pelo `token` no body
2. Valida que a conta está ativa
3. Normaliza dados do webhook
4. Processa mensagem (cria/atualiza contato)
5. Retorna resposta vazia 2xx (requisito do UAZAPI)

---

### **2. Gupshup - Webhook por Conta**

#### **Configuração**

**URL do Webhook:**
```
https://projeto.supabase.co/functions/v1/messaging-webhooks/webhook/gupshup/550e8400-e29b-41d4-a716-446655440000
```

**Nota**: Substitua `550e8400-e29b-41d4-a716-446655440000` pelo UUID real da conta.

#### **Exemplo de Requisição**

```bash
curl -X POST https://projeto.supabase.co/functions/v1/messaging-webhooks/webhook/gupshup/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -d '{
    "message": {
      "from": "5511999999999",
      "text": "Olá! Preciso de ajuda.",
      "timestamp": 1642684800,
      "type": "text"
    },
    "source": {
      "type": "user"
    }
  }'
```

#### **Resposta Esperada**

```http
HTTP/1.1 200 OK
Content-Length: 0
Access-Control-Allow-Origin: *
```

#### **O Que Acontece**

1. Sistema identifica conta pelo UUID na URL
2. Valida formato UUID
3. Valida que o broker type corresponde
4. Valida que a conta está ativa
5. Normaliza dados do webhook
6. Processa mensagem
7. Retorna resposta vazia 2xx

---

### **3. WhatsApp Business API - Webhook por Conta**

#### **Configuração**

**URL do Webhook:**
```
https://projeto.supabase.co/functions/v1/messaging-webhooks/webhook/official_whatsapp/550e8400-e29b-41d4-a716-446655440000
```

**Webhook Secret:**
- Configure no Meta Business Manager
- Configure também em `messaging_accounts.webhook_secret`

#### **Exemplo de Requisição**

```bash
curl -X POST https://projeto.supabase.co/functions/v1/messaging-webhooks/webhook/official_whatsapp/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -H "X-Hub-Signature-256: sha256=abc123..." \
  -d '{
    "object": "whatsapp_business_account",
    "entry": [{
      "id": "WHATSAPP_BUSINESS_ACCOUNT_ID",
      "changes": [{
        "value": {
          "messaging_product": "whatsapp",
          "metadata": {
            "display_phone_number": "5511999999999",
            "phone_number_id": "PHONE_NUMBER_ID"
          },
          "messages": [{
            "from": "5511999999999",
            "id": "wamid.xxx",
            "timestamp": "1642684800",
            "text": {
              "body": "Olá! Preciso de ajuda."
            },
            "type": "text"
          }]
        },
        "field": "messages"
      }]
    }]
  }'
```

#### **Resposta Esperada**

```http
HTTP/1.1 200 OK
Content-Length: 0
Access-Control-Allow-Origin: *
```

#### **O Que Acontece**

1. Sistema identifica conta pelo UUID na URL
2. Valida assinatura do webhook (se `webhook_secret` configurado)
3. Normaliza dados do webhook
4. Processa mensagem
5. Retorna resposta vazia 2xx

---

## 🔄 Cenários de Uso

### **Cenário 1: Múltiplas Contas UAZAPI**

**Problema**: Você tem 3 contas UAZAPI no mesmo projeto.

**Solução**: Use webhook global - todas as contas usam a mesma URL.

**Configuração:**
```
Conta 1: Token = "token-1" → URL: /webhook/uazapi
Conta 2: Token = "token-2" → URL: /webhook/uazapi
Conta 3: Token = "token-3" → URL: /webhook/uazapi
```

**Como Funciona:**
- UAZAPI envia webhook com `token` no body
- Sistema identifica qual conta pelo token
- Processa mensagem para a conta correta

---

### **Cenário 2: Múltiplas Contas Gupshup**

**Problema**: Você tem 3 contas Gupshup no mesmo projeto.

**Solução**: Use webhook por conta - cada conta tem sua própria URL.

**Configuração:**
```
Conta 1: UUID = "uuid-1" → URL: /webhook/gupshup/uuid-1
Conta 2: UUID = "uuid-2" → URL: /webhook/gupshup/uuid-2
Conta 3: UUID = "uuid-3" → URL: /webhook/gupshup/uuid-3
```

**Como Funciona:**
- Gupshup envia webhook para URL específica
- Sistema identifica conta pelo UUID na URL
- Processa mensagem para a conta correta

---

## ⚠️ Tratamento de Erros

### **Erro 400: Validação**

```json
{
  "error": "Formato de UUID inválido: invalid-uuid. O UUID deve estar no formato: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx"
}
```

**Solução**: Verifique o formato do UUID na URL.

---

### **Erro 404: Conta Não Encontrada**

**Webhook Global:**
```json
{
  "error": "Conta não encontrada. Verifique se o token no body corresponde a uma conta ativa."
}
```

**Solução**: 
- Verifique se o `token` está correto
- Verifique se a conta está com `status = 'active'`

**Webhook por Conta:**
```json
{
  "error": "Conta não encontrada com ID: 550e8400-e29b-41d4-a716-446655440000"
}
```

**Solução**: 
- Verifique se o UUID está correto
- Verifique se a conta existe no banco

---

### **Erro 429: Rate Limit**

```http
HTTP/1.1 429 Too Many Requests
Retry-After: 60
X-RateLimit-Limit: 200
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1642684860
```

**Solução**: 
- Aguarde o tempo indicado em `Retry-After`
- Verifique se há muitas requisições sendo enviadas

---

### **Erro 401: Assinatura Inválida**

```json
{
  "error": "Invalid webhook signature"
}
```

**Solução**: 
- Verifique se o `webhook_secret` está configurado corretamente
- Verifique se o header de assinatura está sendo enviado
- Verifique se a assinatura está sendo calculada corretamente

---

## 📊 Logs e Debugging

### **Logs Estruturados**

O sistema gera logs estruturados em JSON:

```json
{
  "timestamp": "2025-01-28T10:30:00.000Z",
  "level": "INFO",
  "message": "Webhook global received",
  "handler": "webhook-global",
  "brokerType": "uazapi",
  "method": "POST",
  "url": "/messaging/webhook/uazapi"
}
```

### **Métricas**

```json
{
  "timestamp": "2025-01-28T10:30:00.000Z",
  "level": "METRICS",
  "message": "Webhook processed successfully",
  "handler": "webhook-global",
  "accountId": "550e8400-e29b-41d4-a716-446655440000",
  "processingTimeMs": 120.5,
  "totalTimeMs": 180.3,
  "webhookType": "global",
  "resolutionTimeMs": 45.2
}
```

---

## 🔗 Referências

- [Documentação da API](./MESSAGING_API_DOCUMENTATION.md)
- [Guia de Configuração](./WEBHOOK_CONFIGURATION_GUIDE.md)
- [Arquitetura de Webhooks](../ANALISE_ARQUITETURA_WEBHOOK_CENARIOS.md)
