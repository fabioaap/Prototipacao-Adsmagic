# ✅ Correção: Erro 405 Method Not Allowed

**Data**: 2025-01-28  
**Status**: ✅ **CORRIGIDO**

---

## 🔴 Problema Identificado

Erro 405 "Method Not Allowed" ao tentar conectar instância UAZAPI:

```json
{
  "error": "Falha ao conectar instância: HTTP 405: {\"code\":405,\"message\":\"Method Not Allowed.\",\"data\":{}}\n"
}
```

**Análise:**
- ✅ Token está sendo encontrado e enviado (erro mudou de 401 para 405)
- ❌ Formato da requisição está incorreto

---

## ✅ Correções Aplicadas

### **1. Removido campo `instance` do body**
- ❌ **Antes**: Enviava `{ instance: this.instanceId, phone?: string }`
- ✅ **Agora**: Envia apenas `{ phone?: string }` quando necessário
- **Motivo**: A documentação UAZAPI não menciona o campo `instance` no body

### **2. Priorizar instanceId na URL**
- ✅ **Tentar primeiro**: `POST /instance/connect/{instanceId}`
- ⚠️ **Fallback**: `POST /instance/connect` (sem instanceId na URL)
- **Motivo**: APIs REST geralmente usam o ID na URL

### **3. Body limpo**
- Se não tiver `phone`, body será `undefined` (não envia body vazio)
- Se tiver `phone`, body será `{ phone: "..." }`

---

## 📋 Mudanças no Código

**Arquivo:** `supabase/functions/messaging/brokers/uazapi/UazapiBroker.ts`

**Antes:**
```typescript
const body: Record<string, unknown> = {
  instance: this.instanceId, // Campo que pode estar causando erro
}
if (phone) {
  body.phone = phone
}

// Tentava primeiro sem instanceId na URL
response = await this.makeRequest(`${this.apiUrl}/instance/connect`, ...)
```

**Depois:**
```typescript
const body: Record<string, unknown> = {}
if (phone) {
  body.phone = phone
}

// Tenta primeiro COM instanceId na URL (formato mais comum)
response = await this.makeRequest(`${this.apiUrl}/instance/connect/${this.instanceId}`, ...)
```

---

## 🧪 Próximo Passo: Deploy e Teste

Após deploy, teste novamente:

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

## 📝 Se o Erro Persistir

1. **Verificar URL Base:**
   - Confirme se `apiBaseUrl` está correto no `broker_config`
   - Pode precisar de prefixo `/api/`

2. **Verificar formato do endpoint:**
   - Pode ser: `/api/instance/connect/{instanceId}`
   - Ou: `/instance/{instanceId}/connect`

3. **Consultar documentação UAZAPI:**
   - Verificar formato exato do endpoint na documentação oficial

---

**✅ Correções aplicadas! Faça o deploy e teste novamente.**

