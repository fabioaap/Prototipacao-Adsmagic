# 🔍 Análise: Erro "Missing token" UAZAPI

**Data**: 2025-01-28  
**Status**: 🔍 **ANÁLISE E CORREÇÃO APLICADA**

---

## 🔴 Problema

Erro 500 com mensagem:
```json
{
  "error": "Falha ao conectar instância: HTTP 401: {\"code\":401,\"message\":\"Missing token.\",\"data\":{}}\n"
}
```

---

## 📊 Análise dos Logs

### **Logs do Supabase Edge Function:**

**Versão 9 (mais recente):**
- ✅ Status: 500 (Internal Server Error)
- ⏱️ Tempo de execução: ~1.6-2.0 segundos
- 🔗 Endpoint: `POST /messaging/connect/f83b9379-7844-4c42-91f9-cefe30cd3b74`

**Observações:**
- A função está executando (não é mais BOOT_ERROR)
- O erro está ocorrendo na chamada para a UAZAPI
- A UAZAPI está retornando 401 "Missing token"

---

## 🔍 Possíveis Causas

### **1. Token não está sendo enviado corretamente**
- O token pode estar vazio ou `undefined`
- O token pode não estar sendo recuperado do banco corretamente
- O token pode estar em um formato incorreto

### **2. Formato do header incorreto**
- A UAZAPI pode precisar de `Authorization: Bearer` ao invés de `apikey`
- A UAZAPI pode precisar de ambos os formatos
- O header pode estar sendo sobrescrito

### **3. InstanceId pode ser necessário**
- A UAZAPI pode precisar do `instanceId` no body
- A UAZAPI pode precisar do `instanceId` na URL
- A UAZAPI pode precisar do `instanceId` como query parameter

---

## ✅ Correções Aplicadas

### **1. Adicionado Ambos os Formatos de Autenticação**

```typescript
// Antes: Apenas 'apikey'
headers['apikey'] = instanceToken

// Depois: Ambos os formatos
headers['apikey'] = instanceToken
headers['Authorization'] = `Bearer ${instanceToken}`
```

### **2. Adicionado InstanceId no Body**

```typescript
// Antes: Apenas phone (se fornecido)
const body: Record<string, unknown> = {}
if (phone) {
  body.phone = phone
}

// Depois: InstanceId sempre + phone opcional
const body: Record<string, unknown> = {
  instance: this.instanceId, // Sempre incluir instanceId
}
if (phone) {
  body.phone = phone
}
```

### **3. Logs Detalhados Adicionados**

```typescript
console.log('[UazapiBroker] Request details:', {
  url: `${this.apiUrl}/instance/connect`,
  method: 'POST',
  bodyKeys: Object.keys(body),
  bodyInstance: body.instance,
  headerKeys: Object.keys(headers),
  headerApikey: headers['apikey'] ? `${headers['apikey'].substring(0, 10)}...` : 'null',
})
```

---

## 🚀 Próximo Passo: Deploy e Teste

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

Após o deploy, teste novamente e verifique os logs:

```bash
POST {{functions_url}}/messaging/connect/{{messaging_account_id}}
Body: {}
```

**Logs esperados:**
```
[UazapiBroker] Connecting instance: {
  instanceId: "...",
  apiUrl: "https://...",
  hasToken: true,
  tokenLength: 36,
  tokenPreview: "93f77a7f-4...",
  ...
}

[UazapiBroker] Request details: {
  url: "https://.../instance/connect",
  method: "POST",
  bodyKeys: ["instance"],
  bodyInstance: "...",
  headerKeys: ["Accept", "Content-Type", "apikey", "Authorization"],
  headerApikey: "93f77a7f-4..."
}
```

---

## 📝 Verificações Adicionais

Se o erro persistir após o deploy, verifique:

1. **Token no Banco de Dados:**
   ```sql
   SELECT 
     id,
     account_name,
     access_token,
     api_key,
     broker_config->>'instanceId' as instance_id
   FROM messaging_accounts 
   WHERE id = 'f83b9379-7844-4c42-91f9-cefe30cd3b74';
   ```

2. **URL Base da API:**
   - Verificar se `apiBaseUrl` está correto no `broker_config`
   - Pode ser `https://free.uazapi.com` ou `https://adsmagic.uazapi.com`

3. **Formato do Token:**
   - O token deve ser uma string válida (não null, não vazio)
   - O token deve ter o formato correto (geralmente UUID)

---

## ✅ Status

- ✅ Ambos os formatos de autenticação adicionados
- ✅ InstanceId adicionado no body
- ✅ Logs detalhados adicionados
- ⏳ Aguardando deploy

**🎉 Correções aplicadas! Faça o deploy quando o Docker estiver rodando e verifique os logs.**

