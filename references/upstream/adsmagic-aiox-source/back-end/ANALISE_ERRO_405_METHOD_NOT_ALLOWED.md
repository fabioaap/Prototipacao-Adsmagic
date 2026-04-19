# 🔍 Análise: Erro 405 Method Not Allowed UAZAPI

**Data**: 2025-01-28  
**Status**: 🔍 **ANÁLISE E CORREÇÃO**

---

## 🔴 Problema Atual

Erro 500 com mensagem interna:
```json
{
  "error": "Falha ao conectar instância: HTTP 405: {\"code\":405,\"message\":\"Method Not Allowed.\",\"data\":{}}\n"
}
```

**Mudança de Erro:**
- ✅ **Antes**: 401 "Missing token" (problema de autenticação)
- ❌ **Agora**: 405 "Method Not Allowed" (problema de formato de requisição)

---

## 📊 Análise

### **O que mudou:**
1. ✅ Token agora está sendo encontrado e enviado
2. ❌ O formato da requisição está incorreto

### **Possíveis causas do 405:**

1. **InstanceId pode precisar estar na URL:**
   - `/instance/connect/{instanceId}` ao invés de `/instance/connect`

2. **Body pode estar com formato incorreto:**
   - Estamos enviando `instance: this.instanceId` no body
   - A documentação não menciona esse campo
   - Pode estar causando rejeição

3. **Endpoint pode ser diferente:**
   - Pode ser que a UAZAPI use outro formato

---

## ✅ Correções Aplicadas

### **1. Removido campo `instance` do body**
- ❌ **Antes**: `{ instance: this.instanceId, phone?: string }`
- ✅ **Agora**: `{ phone?: string }` (somente phone quando fornecido)

### **2. Priorizar instanceId na URL**
- ✅ Tentar primeiro: `POST /instance/connect/{instanceId}`
- ⚠️ Fallback: `POST /instance/connect` (sem instanceId na URL)

### **3. Body limpo**
- Se não tiver phone, body será `undefined` (vazio)
- Se tiver phone, body será `{ phone: "..." }`

---

## 🧪 Teste Após Correção

Após deploy, testar novamente:

```bash
POST {{functions_url}}/messaging/connect/{{messaging_account_id}}
Body: {}
```

**Logs esperados:**
```
[UazapiBroker] Request details: {
  url: "https://.../instance/connect/{instanceId}",
  method: "POST",
  bodyKeys: [],
  bodyPhone: "none",
  ...
}
```

---

## 📝 Verificações Adicionais

Se o erro persistir após o deploy, verificar:

1. **URL Base correta:**
   - Verificar se `apiBaseUrl` está correto no `broker_config`
   - Pode ser `https://free.uazapi.com` ou `https://adsmagic.uazapi.com`

2. **Formato do endpoint:**
   - Pode ser que precise de prefixo: `/api/instance/connect`
   - Ou formato diferente: `/instance/{instanceId}/connect`

3. **Documentação UAZAPI:**
   - Verificar documentação oficial para confirmar formato exato

---

**✅ Correções aplicadas! Faça o deploy e teste novamente.**

