# ✅ Correção: Erro "Missing token" UAZAPI

**Data**: 2025-01-28  
**Status**: ✅ **CORRIGIDO - PRONTO PARA DEPLOY**

---

## 🔴 Problema Identificado

Após corrigir o BOOT_ERROR, agora ocorre erro diferente:

```json
{
  "error": "Falha ao conectar instância: HTTP 401: {\"code\":401,\"message\":\"Missing token.\",\"data\":{}}\n"
}
```

**Causa:** O token da instância pode não estar sendo recuperado corretamente do banco de dados ou pode estar em um formato diferente do esperado.

---

## ✅ Correções Aplicadas

### **1. Extração Melhorada do Token**

O token agora é extraído de **múltiplas fontes** possíveis:
- ✅ `account.access_token` (campo direto)
- ✅ `account.api_key` (campo direto)
- ✅ `broker_config.instanceData.token` (dentro dos dados salvos)
- ✅ `broker_config.instanceData.instance.token` (formato alternativo)

### **2. Extração Melhorada do InstanceId**

O `instanceId` também é extraído de múltiplas fontes:
- ✅ `broker_config.instanceId` (campo direto)
- ✅ `broker_config.instanceData.id` (dentro dos dados salvos)
- ✅ `broker_config.instanceData.instance.id` (formato alternativo)

### **3. Logs Detalhados Adicionados**

Logs informativos para debug:
- ✅ Comprimento dos tokens encontrados
- ✅ Origem do token (access_token, api_key, instanceData)
- ✅ Comprimento do instanceId
- ✅ Configuração final do broker

---

## 📋 Arquivos Alterados

1. ✅ `handlers/connect-instance.ts`
   - Extração melhorada de token e instanceId
   - Logs detalhados para debug
   - Validação mais robusta

2. ✅ `brokers/uazapi/UazapiBroker.ts`
   - Logs adicionais no método `generateQRCode`
   - Informações sobre token sendo usado

---

## 🔍 Como Funciona Agora

### **Fluxo de Extração do Token:**

```typescript
// 1. Tenta extrair de account.access_token
const tokenFromAccessToken = account.access_token || ''

// 2. Tenta extrair de account.api_key
const tokenFromApiKey = account.api_key || ''

// 3. Tenta extrair de broker_config.instanceData
const tokenFromInstanceData = 
  account.broker_config?.instanceData?.token || 
  account.broker_config?.instanceData?.instance?.token || 
  ''

// 4. Usa o primeiro disponível
finalAccessToken = tokenFromAccessToken || tokenFromApiKey || tokenFromInstanceData
```

### **Fluxo de Extração do InstanceId:**

```typescript
finalInstanceId = 
  account.broker_config?.instanceId || 
  account.broker_config?.instanceData?.id || 
  account.broker_config?.instanceData?.instance?.id || 
  ''
```

---

## 🚀 Próximo Passo: Deploy

**IMPORTANTE:** O Docker Desktop precisa estar rodando.

1. **Inicie o Docker Desktop**
2. **Aguarde o Docker inicializar completamente**
3. **Execute o deploy:**
   ```bash
   cd back-end
   supabase functions deploy messaging --project-ref nitefyufrzytdtxhaocf
   ```

---

## 🧪 Teste Após Deploy

Após o deploy, teste novamente:

```bash
POST {{functions_url}}/messaging/connect/{{messaging_account_id}}
Body: {}
```

**Resultado esperado:**
- ✅ Status 200 (sucesso)
- ✅ QR Code ou Pair Code retornado
- ✅ Logs detalhados no console para debug

---

## 📝 Logs Esperados

Após o deploy, você verá logs como:

```
[Connect Instance] UAZAPI token extraction: {
  accountId: "...",
  instanceId: "...",
  hasAccessToken: true/false,
  hasApiKey: true/false,
  hasTokenInInstanceData: true/false,
  accessTokenLength: 36,
  apiKeyLength: 36,
  instanceDataTokenLength: 36,
  finalTokenLength: 36,
  brokerConfigKeys: [...]
}

[UazapiBroker] Connecting instance: {
  instanceId: "...",
  apiUrl: "https://...",
  hasToken: true,
  tokenLength: 36,
  tokenPreview: "93f77a7f-4...",
  endpoint: "https://.../instance/connect"
}
```

---

## ✅ Status

- ✅ Extração melhorada de token e instanceId
- ✅ Logs detalhados adicionados
- ✅ Validação mais robusta
- ⏳ Aguardando deploy

**🎉 Correções aplicadas! Faça o deploy quando o Docker estiver rodando.**

