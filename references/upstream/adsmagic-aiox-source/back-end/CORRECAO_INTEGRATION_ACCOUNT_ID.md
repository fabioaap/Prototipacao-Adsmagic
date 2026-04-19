# ✅ Correção: integration_account_id Opcional + Salvar Dados Completos da Instância

**Data**: 2025-01-28  
**Status**: ✅ **CORRIGIDO**

---

## 🐛 Problema Identificado

1. **Erro ao criar instância UAZAPI:**
   ```
   null value in column "integration_account_id" of relation "messaging_accounts" violates not-null constraint
   ```

2. **Falta de dados salvos:**
   - O handler não estava salvando todas as informações importantes da instância:
     - `instance.id` (ID real da instância na UAZAPI)
     - `instance.token` 
     - `instance.status`
     - Outros metadados importantes

---

## ✅ Soluções Implementadas

### **1. Migration: Tornar `integration_account_id` Opcional**

**Arquivo:** `back-end/supabase/migrations/019_make_integration_account_id_optional.sql`

**Mudança:**
- Campo `integration_account_id` agora pode ser `NULL`
- Permitindo criação de `messaging_accounts` sem integração OAuth (caso do UAZAPI direto via API)

**Status:** ✅ **MIGRATION APLICADA**

---

### **2. Atualização do Tipo `UazapiInitInstanceResponse`**

**Arquivo:** `back-end/supabase/functions/messaging/brokers/uazapi/types.ts`

**Mudanças:**
- Tipo atualizado para refletir a resposta real da API UAZAPI
- Inclui todos os campos retornados: `instance.id`, `instance.status`, `instance.token`, etc.

---

### **3. Atualização do Método `createInstance`**

**Arquivo:** `back-end/supabase/functions/messaging/brokers/uazapi/UazapiBroker.ts`

**Mudanças:**
- Retorna agora `instanceId` (ID real da instância)
- Retorna `status` da instância
- Retorna `instanceData` completo para referência futura
- Extrai corretamente informações da resposta da API

---

### **4. Atualização do Handler `create-instance.ts`**

**Arquivo:** `back-end/supabase/functions/messaging/handlers/create-instance.ts`

**Mudanças:**
- ✅ Não inclui `integration_account_id` no insert (permitindo NULL)
- ✅ Salva `instanceId` no `broker_config`
- ✅ Salva `instanceName` no `broker_config`
- ✅ Salva `instanceData` completo para referência futura
- ✅ Salva `token` em `access_token`
- ✅ Salva `status` da instância
- ✅ Retorna todas as informações na resposta

---

## 📊 Dados Salvos Agora

### **Na tabela `messaging_accounts`:**

```json
{
  "id": "uuid",
  "integration_account_id": null,  // ✅ Agora pode ser NULL
  "project_id": "uuid",
  "platform": "whatsapp",
  "broker_type": "uazapi",
  "account_identifier": "5516993028321",
  "account_name": "Conta WhatsApp UAZAPI",
  "api_key": "api-key-da-instancia",
  "access_token": "token-da-instancia",  // ✅ Novo
  "status": "disconnected",  // ✅ Status real da API
  "broker_config": {
    "instanceId": "ra03d1256ebb36c",  // ✅ ID real da instância
    "instanceName": "teste",
    "apiBaseUrl": "https://adsmagic.uazapi.com",
    "systemName": "apilocal",
    "adminField01": "custom-metadata-1",
    "adminField02": "custom-metadata-2",
    "instanceData": { /* dados completos */ }  // ✅ Dados completos salvos
  }
}
```

---

## 🧪 Como Testar

### **1. Criar Instância UAZAPI:**

```bash
curl -X POST 'https://nitefyufrzytdtxhaocf.supabase.co/functions/v1/messaging/instances/uazapi' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -d '{
    "projectId": "063d5989-1d9f-444b-8391-3f79bc31de8f",
    "instanceName": "teste",
    "adminToken": "MF2duBUv9YecnJRa7fTFAD2w4JKuqwi6jRWCGq2vwNsmS3hqtF",
    "apiBaseUrl": "https://adsmagic.uazapi.com",
    "accountName": "Conta WhatsApp UAZAPI",
    "phone": "5516993028321"
  }'
```

### **2. Verificar Resposta:**

A resposta agora incluirá:
- ✅ `instanceId` (ID real da instância na UAZAPI)
- ✅ `instanceName`
- ✅ `token`
- ✅ `apikey`
- ✅ `status`
- ✅ `accountId` (ID da conta criada no banco)

### **3. Verificar Banco de Dados:**

```sql
SELECT 
  id,
  account_name,
  status,
  api_key,
  access_token,
  broker_config->>'instanceId' as uazapi_instance_id,
  broker_config->>'instanceName' as instance_name
FROM messaging_accounts
WHERE broker_type = 'uazapi'
ORDER BY created_at DESC
LIMIT 1;
```

---

## 🚀 Próximos Passos

1. ✅ **Deploy da Edge Function atualizada:**
   ```bash
   cd back-end
   supabase functions deploy messaging --project-ref nitefyufrzytdtxhaocf
   ```

2. **Testar criação de instância** via Postman ou cURL

3. **Conectar ao WhatsApp** via QR Code:
   ```
   GET /messaging/qrcode/:accountId
   ```

---

## 📝 Notas Importantes

- ✅ `integration_account_id` agora é opcional e pode ser `NULL`
- ✅ Todas as informações importantes da instância são salvas
- ✅ O `instanceId` real da UAZAPI é salvo para uso futuro
- ✅ Migration aplicada com sucesso no banco de dados

---

**✅ Problema resolvido!**

