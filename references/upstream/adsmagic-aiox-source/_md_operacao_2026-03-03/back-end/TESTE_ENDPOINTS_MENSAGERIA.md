# 🧪 Guia de Testes - Endpoints de Mensageria com Dados Reais

**Versão**: 1.0  
**Data**: 2025-01-28  
**Autor**: Equipe Backend  
**Status**: Guia Prático de Testes  
**Sessão**: 8.5 - Sistema de WhatsApp com Brokers Modulares

---

## 📋 Índice

1. [Pré-requisitos](#1-pré-requisitos)
2. [Configuração Inicial](#2-configuração-inicial)
3. [Criar Conta de Mensageria](#3-criar-conta-de-mensageria)
4. [Testar Endpoints](#4-testar-endpoints)
5. [Exemplos de Payloads Reais](#5-exemplos-de-payloads-reais)
6. [Troubleshooting](#6-troubleshooting)

---

## 1. Pré-requisitos

Antes de testar os endpoints de mensageria, você precisa:

- ✅ **Projeto criado** (obter `project_id`)
- ✅ **JWT Token** (obter via login)
- ✅ **Conta de mensageria configurada** no banco de dados
- ✅ **Credenciais do broker** (API key, token, etc.)

---

## 2. Configuração Inicial

### **2.1. Obter Token JWT**

Siga o guia em `POSTMAN_TESTING_GUIDE.md` para obter o token JWT.

### **2.2. Obter Project ID**

Você precisa de um `project_id` válido. Se não tiver:

```http
POST {{functions_url}}/projects
Authorization: Bearer {{jwt_token}}
Content-Type: application/json

{
  "company_id": "{{company_id}}",
  "created_by": "{{user_id}}",
  "name": "Projeto Teste Mensageria",
  "description": "Projeto para testar mensageria",
  "company_type": "individual",
  "country": "BR",
  "language": "pt",
  "currency": "BRL",
  "timezone": "America/Sao_Paulo",
  "attribution_model": "first_touch",
  "status": "active"
}
```

---

## 3. Criar Conta de Mensageria

### **3.1. Verificar Brokers Disponíveis**

Primeiro, vamos ver quais brokers estão disponíveis no banco:

```sql
SELECT id, name, display_name, platform, broker_type, is_active
FROM messaging_brokers
WHERE platform = 'whatsapp'
AND is_active = true;
```

### **3.2. Criar Conta de Mensageria (Via SQL)**

**Opção 1: Via Supabase Dashboard SQL Editor**

```sql
-- 1. Verificar se existe integration_account_id (pode ser NULL inicialmente)
-- Para teste, podemos criar uma entrada temporária

-- 2. Criar conta de mensageria UAZAPI
INSERT INTO messaging_accounts (
  project_id,
  platform,
  broker_type,
  account_identifier,
  account_name,
  broker_config,
  api_key,
  status
) VALUES (
  'SEU_PROJECT_ID_AQUI',  -- Substitua pelo project_id real
  'whatsapp',
  'uazapi',
  '5511999999999',  -- Número do WhatsApp
  'Conta WhatsApp UAZAPI Teste',
  '{
    "instanceId": "sua-instance-id",
    "apiBaseUrl": "https://uazapi.com/api"
  }'::jsonb,
  'sua-api-key-uazapi',  -- Substitua pela API key real
  'active'
) RETURNING id, account_name, status;
```

**Exemplo com WhatsApp Business API:**

```sql
INSERT INTO messaging_accounts (
  project_id,
  platform,
  broker_type,
  account_identifier,
  account_name,
  broker_config,
  access_token,
  webhook_url,
  webhook_secret,
  status
) VALUES (
  'SEU_PROJECT_ID_AQUI',
  'whatsapp',
  'official_whatsapp',
  '5511999999999',
  'Conta WhatsApp Business Teste',
  '{
    "phoneNumberId": "seu-phone-number-id",
    "businessAccountId": "seu-business-account-id"
  }'::jsonb,
  'seu-access-token',  -- Substitua pelo access token real
  'https://nitefyufrzytdtxhaocf.supabase.co/functions/v1/messaging/webhook',
  'seu-webhook-secret',  -- Substitua pelo secret real
  'active'
) RETURNING id, account_name, status;
```

### **3.3. Obter Account ID**

Após criar a conta, anote o `id` retornado. Você precisará dele para os testes.

**Via SQL:**
```sql
SELECT id, account_name, broker_type, status
FROM messaging_accounts
WHERE project_id = 'SEU_PROJECT_ID_AQUI'
AND status = 'active';
```

---

## 4. Testar Endpoints

### **4.1. POST `/messaging/webhook` - Receber Webhook**

#### **Preparação**

1. Obter `account_id` da conta criada
2. Preparar payload do broker

#### **Teste com UAZAPI**

**Request:**
```http
POST {{functions_url}}/messaging/webhook
Content-Type: application/json
x-account-id: {{messaging_account_id}}

{
  "id": "msg_123456789",
  "from": "5511999999999",
  "to": "5511888888888",
  "body": "Olá! Esta é uma mensagem de teste do UAZAPI",
  "timestamp": 1642684800,
  "isGroup": false,
  "pushName": "João Silva",
  "type": "text"
}
```

**Response Esperada (200 OK):**
```json
{
  "success": true,
  "data": {
    "processed": true
  }
}
```

**O que verificar:**
- ✅ Status 200 OK
- ✅ Contato criado automaticamente (verificar na tabela `contacts`)
- ✅ Contato encontrado pelo número de telefone
- ✅ Estatísticas da conta atualizadas

**Verificar no Banco:**
```sql
-- Verificar se contato foi criado
SELECT id, name, phone, country_code, project_id, main_origin_id
FROM contacts
WHERE phone = '19999999999'
AND project_id = 'SEU_PROJECT_ID_AQUI';

-- Verificar estatísticas da conta
SELECT id, account_name, total_messages, total_contacts, last_webhook_at
FROM messaging_accounts
WHERE id = 'SEU_ACCOUNT_ID';
```

#### **Teste com WhatsApp Business API**

**Request:**
```http
POST {{functions_url}}/messaging/webhook
Content-Type: application/json
x-account-id: {{messaging_account_id}}
x-hub-signature-256: sha256=assinatura_aqui (opcional)

{
  "object": "whatsapp_business_account",
  "entry": [
    {
      "id": "WHATSAPP_BUSINESS_ACCOUNT_ID",
      "changes": [
        {
          "value": {
            "messaging_product": "whatsapp",
            "metadata": {
              "display_phone_number": "5511999999999",
              "phone_number_id": "PHONE_NUMBER_ID"
            },
            "contacts": [
              {
                "profile": {
                  "name": "João Silva"
                },
                "wa_id": "5511999999999"
              }
            ],
            "messages": [
              {
                "from": "5511999999999",
                "id": "wamid.XXXXXXXXXXXXXXXXXXXXXXXXXXX",
                "timestamp": "1642684800",
                "text": {
                  "body": "Olá! Esta é uma mensagem do WhatsApp Business API"
                },
                "type": "text"
              }
            ]
          },
          "field": "messages"
        }
      ]
    }
  ]
}
```

#### **Teste com Gupshup**

**Request:**
```http
POST {{functions_url}}/messaging/webhook
Content-Type: application/json
x-account-id: {{messaging_account_id}}

{
  "messageId": "gupshup_msg_123",
  "source": "5511999999999",
  "destination": "5511888888888",
  "timestamp": "2025-01-28T12:00:00Z",
  "payload": {
    "text": "Olá! Esta é uma mensagem do Gupshup",
    "type": "text"
  }
}
```

---

### **4.2. POST `/messaging/send` - Enviar Mensagem**

#### **Preparação**

1. Obter `account_id` da conta criada
2. Ter número de destino válido

#### **Enviar Mensagem de Texto**

**Request:**
```http
POST {{functions_url}}/messaging/send
Authorization: Bearer {{jwt_token}}
Content-Type: application/json

{
  "accountId": "{{messaging_account_id}}",
  "to": "5511999999999",
  "text": "Olá! Esta é uma mensagem de teste enviada através da API."
}
```

**Response Esperada (200 OK):**
```json
{
  "success": true,
  "data": {
    "messageId": "msg_123456789",
    "status": "sent",
    "timestamp": "2025-01-28T12:00:00.000Z"
  }
}
```

**O que verificar:**
- ✅ Status 200 OK
- ✅ Mensagem realmente enviada (verificar no WhatsApp do destinatário)
- ✅ `messageId` retornado
- ✅ Status correto (`sent`, `delivered`, etc.)

#### **Enviar Imagem**

**Request:**
```http
POST {{functions_url}}/messaging/send
Authorization: Bearer {{jwt_token}}
Content-Type: application/json

{
  "accountId": "{{messaging_account_id}}",
  "to": "5511999999999",
  "mediaUrl": "https://example.com/imagem.jpg",
  "mediaType": "image",
  "caption": "Legenda da imagem"
}
```

#### **Enviar Template (WhatsApp Business API)**

**Request:**
```http
POST {{functions_url}}/messaging/send
Authorization: Bearer {{jwt_token}}
Content-Type: application/json

{
  "accountId": "{{messaging_account_id}}",
  "to": "5511999999999",
  "templateName": "welcome_template",
  "templateLanguage": "pt",
  "templateParameters": ["João"]
}
```

**Nota**: O template deve estar aprovado no WhatsApp Business API.

---

### **4.3. GET `/messaging/status/:accountId` - Status da Conta**

#### **Request:**
```http
GET {{functions_url}}/messaging/status/{{messaging_account_id}}
Authorization: Bearer {{jwt_token}}
```

#### **Response Esperada (200 OK):**
```json
{
  "success": true,
  "data": {
    "accountId": "uuid-da-conta",
    "status": "active",
    "connected": true,
    "lastMessageAt": "2025-01-28T11:30:00.000Z",
    "totalMessages": 150,
    "totalContacts": 45
  }
}
```

**O que verificar:**
- ✅ Status 200 OK
- ✅ `connected` reflete o estado real do broker
- ✅ Estatísticas corretas (`totalMessages`, `totalContacts`)
- ✅ `lastMessageAt` atualizado

---

### **4.4. POST `/messaging/sync-contacts/:accountId` - Sincronizar Contatos**

#### **Request:**
```http
POST {{functions_url}}/messaging/sync-contacts/{{messaging_account_id}}
Authorization: Bearer {{jwt_token}}
Content-Type: application/json
```

#### **Response Esperada (200 OK):**
```json
{
  "success": true,
  "data": {
    "success": true,
    "accountInfo": {
      "phoneNumber": "5511999999999",
      "name": "Conta WhatsApp",
      "status": "active"
    }
  }
}
```

**O que verificar:**
- ✅ Status 200 OK
- ✅ Informações da conta atualizadas no banco
- ✅ `account_display_name` atualizado

---

## 5. Exemplos de Payloads Reais

### **5.1. UAZAPI - Webhook de Mensagem Recebida**

```json
{
  "id": "msg_1706457600123",
  "messageId": "msg_1706457600123",
  "from": "5511999999999",
  "to": "5511888888888",
  "body": "Olá! Gostaria de saber mais sobre o produto.",
  "timestamp": 1706457600,
  "pushName": "Maria Silva",
  "isGroup": false,
  "type": "text"
}
```

### **5.2. UAZAPI - Webhook de Mensagem com Mídia**

```json
{
  "id": "msg_1706457700456",
  "messageId": "msg_1706457700456",
  "from": "5511999999999",
  "to": "5511888888888",
  "type": "image",
  "body": "",
  "mediaUrl": "https://uazapi.com/storage/media/abc123.jpg",
  "caption": "Veja esta imagem",
  "timestamp": 1706457700,
  "pushName": "Maria Silva",
  "isGroup": false
}
```

### **5.3. WhatsApp Business API - Webhook de Mensagem**

```json
{
  "object": "whatsapp_business_account",
  "entry": [
    {
      "id": "123456789012345",
      "changes": [
        {
          "value": {
            "messaging_product": "whatsapp",
            "metadata": {
              "display_phone_number": "5511999999999",
              "phone_number_id": "987654321098765"
            },
            "contacts": [
              {
                "profile": {
                  "name": "João Santos"
                },
                "wa_id": "5511999999999"
              }
            ],
            "messages": [
              {
                "from": "5511999999999",
                "id": "wamid.HBgNNTUxMTk5OTk5OTk5OQUBMhYyMEU3MDNDNDk4RUY5Nzc5RTU0AA==",
                "timestamp": "1706457600",
                "text": {
                  "body": "Olá! Preciso de ajuda com o pedido."
                },
                "type": "text",
                "context": {
                  "from": "5511888888888",
                  "id": "wamid.HBgNNTUxMTg4ODg4ODg4ODgB"
                }
              }
            ]
          },
          "field": "messages"
        }
      ]
    }
  ]
}
```

### **5.4. WhatsApp Business API - Webhook de Status de Entrega**

```json
{
  "object": "whatsapp_business_account",
  "entry": [
    {
      "id": "123456789012345",
      "changes": [
        {
          "value": {
            "messaging_product": "whatsapp",
            "metadata": {
              "display_phone_number": "5511999999999",
              "phone_number_id": "987654321098765"
            },
            "statuses": [
              {
                "id": "wamid.HBgNNTUxMTk5OTk5OTk5OQUBMhYyMEU3MDNDNDk4RUY5Nzc5RTU0AA==",
                "status": "delivered",
                "timestamp": "1706457650",
                "recipient_id": "5511999999999"
              }
            ]
          },
          "field": "messages"
        }
      ]
    }
  ]
}
```

### **5.5. Gupshup - Webhook de Mensagem**

```json
{
  "messageId": "gupshup_1706457600123",
  "source": "5511999999999",
  "destination": "5511888888888",
  "timestamp": "2025-01-28T12:00:00Z",
  "payload": {
    "text": "Olá! Esta é uma mensagem do Gupshup.",
    "type": "text"
  },
  "channel": "whatsapp",
  "app": "seu-app-name"
}
```

---

## 6. Fluxo Completo de Teste

### **Sequência Recomendada:**

1. **Criar Conta de Mensageria**
   - Inserir registro em `messaging_accounts`
   - Configurar credenciais do broker
   - Anotar `account_id`

2. **Testar Webhook (Receber Mensagem)**
   - Enviar payload real do broker para `/messaging/webhook`
   - Verificar resposta 200 OK
   - Verificar se contato foi criado no banco
   - Verificar estatísticas atualizadas

3. **Verificar Criação de Contato**
   - Buscar contato na tabela `contacts`
   - Verificar dados preenchidos corretamente
   - Verificar origem atribuída

4. **Testar Envio de Mensagem**
   - Enviar mensagem via `/messaging/send`
   - Verificar resposta 200 OK
   - Verificar se mensagem chegou no WhatsApp
   - Verificar `messageId` retornado

5. **Testar Status da Conta**
   - Chamar `/messaging/status/:accountId`
   - Verificar conexão com broker
   - Verificar estatísticas

6. **Testar Sincronização**
   - Chamar `/messaging/sync-contacts/:accountId`
   - Verificar atualização de informações

---

## 7. Configurar no Postman

### **7.1. Adicionar Variáveis ao Environment**

Adicione ao seu Postman Environment:

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `messaging_account_id` | ID da conta de mensageria | `uuid-da-conta` |
| `messaging_phone_to` | Número de destino para testes | `5511999999999` |

### **7.2. Criar Collection de Testes**

Crie uma pasta "📱 Messaging" na sua collection Postman com:

- ✅ **POST Webhook (UAZAPI)** - Teste de webhook UAZAPI
- ✅ **POST Webhook (WhatsApp Business)** - Teste de webhook oficial
- ✅ **POST Webhook (Gupshup)** - Teste de webhook Gupshup
- ✅ **POST Send Message** - Enviar mensagem de texto
- ✅ **POST Send Media** - Enviar imagem/mídia
- ✅ **POST Send Template** - Enviar template (oficial)
- ✅ **GET Status** - Status da conta
- ✅ **POST Sync Contacts** - Sincronizar contatos

---

## 8. Troubleshooting

### **Erro: "Conta não encontrada" (404)**

**Causa**: `account_id` inválido ou conta não existe.

**Solução:**
```sql
-- Verificar conta existe
SELECT id, account_name, broker_type, status
FROM messaging_accounts
WHERE id = 'SEU_ACCOUNT_ID';
```

### **Erro: "Broker não encontrado"**

**Causa**: Broker não está registrado no factory ou banco.

**Solução:**
```sql
-- Verificar broker existe
SELECT name, display_name, is_active
FROM messaging_brokers
WHERE name = 'uazapi'  -- ou 'official_whatsapp', 'gupshup'
AND is_active = true;
```

### **Erro: "Authentication required" (401) no /send**

**Causa**: Token JWT ausente ou inválido.

**Solução:**
- Verificar header `Authorization: Bearer {{jwt_token}}`
- Renovar token se expirado

### **Erro: "Acesso negado ao projeto" (403)**

**Causa**: Usuário não tem acesso ao projeto da conta.

**Solução:**
```sql
-- Verificar acesso do usuário ao projeto
SELECT pu.*, p.name as project_name
FROM project_users pu
JOIN projects p ON p.id = pu.project_id
WHERE pu.user_id = 'SEU_USER_ID'
AND pu.project_id = 'PROJECT_ID_DA_CONTA'
AND pu.is_active = true;
```

### **Contato não é criado após webhook**

**Causa Possíveis:**
1. Normalização falhou
2. Processamento falhou
3. Erro ao buscar/criar contato

**Solução:**
1. Verificar logs da Edge Function no Supabase Dashboard
2. Verificar se payload está no formato correto
3. Verificar se `project_id` da conta é válido

**Verificar Logs:**
```sql
-- Ver logs no Supabase Dashboard
-- Edge Functions → messaging → Logs
```

### **Mensagem não é enviada**

**Causa Possíveis:**
1. Credenciais do broker inválidas
2. Número de destino inválido
3. Broker offline

**Solução:**
1. Verificar credenciais no banco
2. Verificar formato do número (deve incluir código do país)
3. Verificar status da conexão: `/messaging/status/:accountId`

---

## 9. Scripts de Validação (Postman)

### **Script para Webhook - Verificar Processamento**

```javascript
pm.test("Webhook processed successfully", function () {
    pm.response.to.have.status(200);
    
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('success');
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.data).to.have.property('processed');
});

// Salvar account_id se não estiver salvo
if (pm.response.code === 200) {
    const accountId = pm.environment.get("messaging_account_id");
    if (!accountId) {
        console.log("⚠️ Configure messaging_account_id no environment");
    }
}
```

### **Script para Send - Verificar Envio**

```javascript
pm.test("Message sent successfully", function () {
    pm.response.to.have.status(200);
    
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('success');
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.data).to.have.property('messageId');
    pm.expect(jsonData.data).to.have.property('status');
    
    console.log("✅ Message ID:", jsonData.data.messageId);
    console.log("✅ Status:", jsonData.data.status);
});

// Verificar tempo de resposta
pm.test("Response time is acceptable", function () {
    pm.expect(pm.response.responseTime).to.be.below(5000); // 5 segundos
});
```

---

## 10. Checklist de Testes

### **Testes Básicos**

- [ ] ✅ Webhook UAZAPI processa corretamente
- [ ] ✅ Webhook WhatsApp Business processa corretamente
- [ ] ✅ Webhook Gupshup processa corretamente
- [ ] ✅ Contato é criado automaticamente ao receber mensagem
- [ ] ✅ Contato existente é encontrado (não duplica)
- [ ] ✅ Envio de mensagem de texto funciona
- [ ] ✅ Envio de mídia funciona
- [ ] ✅ Status da conta retorna informações corretas
- [ ] ✅ Sincronização atualiza informações

### **Testes de Erro**

- [ ] ✅ Webhook sem `x-account-id` retorna 400
- [ ] ✅ Webhook com `account_id` inválido retorna 404
- [ ] ✅ Envio sem autenticação retorna 401
- [ ] ✅ Envio com `account_id` inválido retorna 404
- [ ] ✅ Envio sem número de destino retorna 400
- [ ] ✅ Status sem autenticação retorna 401

### **Testes de Integridade**

- [ ] ✅ Contato criado tem `project_id` correto
- [ ] ✅ Contato criado tem origem atribuída
- [ ] ✅ Estatísticas são atualizadas corretamente
- [ ] ✅ RLS funciona (usuário só vê contas do seu projeto)

---

## 11. Exemplos de Consultas SQL Úteis

### **Verificar Contas Criadas**

```sql
SELECT 
  ma.id,
  ma.account_name,
  ma.broker_type,
  ma.account_identifier,
  ma.status,
  ma.total_messages,
  ma.total_contacts,
  ma.last_message_at,
  p.name as project_name
FROM messaging_accounts ma
JOIN projects p ON p.id = ma.project_id
WHERE ma.project_id = 'SEU_PROJECT_ID'
ORDER BY ma.created_at DESC;
```

### **Verificar Contatos Criados por Mensageria**

```sql
SELECT 
  c.id,
  c.name,
  c.phone,
  c.country_code,
  c.created_at,
  o.name as origin_name,
  s.name as stage_name
FROM contacts c
JOIN origins o ON o.id = c.main_origin_id
JOIN stages s ON s.id = c.current_stage_id
WHERE c.project_id = 'SEU_PROJECT_ID'
AND c.created_at >= NOW() - INTERVAL '24 hours'
ORDER BY c.created_at DESC;
```

### **Estatísticas de Mensageria**

```sql
SELECT 
  ma.account_name,
  ma.broker_type,
  ma.total_messages,
  ma.total_contacts,
  ma.last_message_at,
  COUNT(c.id) as contacts_from_messaging
FROM messaging_accounts ma
LEFT JOIN contacts c ON c.project_id = ma.project_id
WHERE ma.project_id = 'SEU_PROJECT_ID'
GROUP BY ma.id, ma.account_name, ma.broker_type, ma.total_messages, ma.total_contacts, ma.last_message_at;
```

---

## 12. Links Úteis

- **Documentação de APIs**: `docs/MESSAGING_API_DOCUMENTATION.md`
- **Arquitetura Completa**: `docs/WHATSAPP_BROKERS_ARCHITECTURE.md`
- **Guia de Testes Geral**: `POSTMAN_TESTING_GUIDE.md`
- **Pendências da Sessão 8.5**: `SESSAO_8.5_PENDENCIAS.md`

---

**✅ Pronto para Testar!**

Siga a sequência recomendada e use os exemplos acima para testar todos os endpoints de mensageria com dados reais.

**Última Atualização**: 2025-01-28

