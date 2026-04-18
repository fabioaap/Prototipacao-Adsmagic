# 🧪 Resumo: Como Testar Endpoints de Mensageria com Dados Reais

**Versão**: 1.0  
**Data**: 2025-01-28  
**Status**: Guia Rápido

---

## ⚡ Passos Rápidos

### **1. Criar Conta de Mensageria no Banco**

Execute no Supabase SQL Editor:

```sql
-- Substitua SEU_PROJECT_ID pelo ID real do seu projeto
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
  'SEU_PROJECT_ID',  -- ⚠️ SUBSTITUA AQUI
  'whatsapp',
  'uazapi',
  '5511999999999',  -- ⚠️ SUBSTITUA pelo número real
  'Conta WhatsApp Teste',
  '{"instanceId": "sua-instance-id", "apiBaseUrl": "https://uazapi.com/api"}'::jsonb,
  'sua-api-key-aqui',  -- ⚠️ SUBSTITUA pela API key real
  'active'
) RETURNING id, account_name;
```

**Anote o `id` retornado** - você precisará dele!

---

### **2. Testar Webhook (Receber Mensagem)**

**No Postman:**

```http
POST {{functions_url}}/messaging/webhook
Content-Type: application/json
x-account-id: SEU_ACCOUNT_ID_AQUI  ⚠️ SUBSTITUA

{
  "id": "msg_123",
  "from": "5511999999999",
  "to": "5511888888888",
  "body": "Olá! Mensagem de teste",
  "timestamp": 1642684800,
  "isGroup": false,
  "pushName": "João Silva",
  "type": "text"
}
```

**Verificar se funcionou:**

```sql
-- Verificar se contato foi criado
SELECT id, name, phone, created_at
FROM contacts
WHERE phone = '19999999999'
AND project_id = 'SEU_PROJECT_ID';
```

---

### **3. Testar Envio de Mensagem**

**No Postman:**

```http
POST {{functions_url}}/messaging/send
Authorization: Bearer {{jwt_token}}
Content-Type: application/json

{
  "accountId": "SEU_ACCOUNT_ID_AQUI",  ⚠️ SUBSTITUA
  "to": "5511999999999",
  "text": "Olá! Esta é uma mensagem de teste."
}
```

**Verificar:**
- ✅ Status 200 OK
- ✅ `messageId` retornado
- ✅ Mensagem chegou no WhatsApp do destinatário

---

### **4. Testar Status da Conta**

```http
GET {{functions_url}}/messaging/status/SEU_ACCOUNT_ID_AQUI
Authorization: Bearer {{jwt_token}}
```

---

## 📚 Documentação Completa

Para guia detalhado com todos os exemplos e troubleshooting, consulte:

- 📖 **[TESTE_ENDPOINTS_MENSAGERIA.md](./TESTE_ENDPOINTS_MENSAGERIA.md)** - Guia completo de testes
- 📖 **[MESSAGING_API_DOCUMENTATION.md](./docs/MESSAGING_API_DOCUMENTATION.md)** - Documentação completa das APIs

---

## 🔍 Troubleshooting Rápido

| Erro | Solução |
|------|---------|
| "Conta não encontrada" | Verificar se `account_id` existe: `SELECT id FROM messaging_accounts WHERE id = '...'` |
| "Authentication required" | Adicionar header `Authorization: Bearer {{jwt_token}}` |
| "Acesso negado ao projeto" | Verificar se usuário tem acesso ao projeto da conta |
| Contato não é criado | Verificar logs da Edge Function no Supabase Dashboard |

---

**✅ Pronto para testar!**

Siga os passos acima e consulte a documentação completa para mais detalhes.

