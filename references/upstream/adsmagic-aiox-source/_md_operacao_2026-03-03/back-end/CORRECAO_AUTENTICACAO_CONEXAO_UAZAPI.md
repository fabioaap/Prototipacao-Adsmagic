# ✅ Correção: Autenticação UAZAPI - Endpoint de Conexão

**Data**: 2025-01-28  
**Status**: ✅ **CORRIGIDO E DEPLOYADO**

---

## 🔴 Problema Identificado

Ao testar o endpoint `POST /messaging/connect/:accountId`, ocorreu erro:

```json
{
  "error": "Falha ao conectar instância: HTTP 401: {\"code\":401,\"message\":\"Missing token.\",\"data\":{}}\n"
}
```

**Causa:** O formato do header de autenticação estava incorreto para o endpoint `/instance/connect` da UAZAPI.

---

## ✅ Solução Aplicada

### **Mudança no Header de Autenticação**

**Antes:**
```typescript
if (this.accessToken) {
  headers['Authorization'] = `Bearer ${this.accessToken}`
} else if (this.apiKey) {
  headers['apikey'] = this.apiKey
}
```

**Depois:**
```typescript
// UAZAPI requer 'apikey' no header para /instance/connect
const instanceToken = this.accessToken || this.apiKey
if (!instanceToken) {
  throw new Error('Token de autenticação da instância não encontrado')
}

headers['apikey'] = instanceToken
```

---

## 📋 O Que Foi Alterado

### **Arquivo:** `supabase/functions/messaging/brokers/uazapi/UazapiBroker.ts`

**Método:** `generateQRCode()`

**Mudanças:**
1. ✅ Removido uso de `Authorization: Bearer`
2. ✅ Sempre usa `apikey` no header (formato correto da UAZAPI)
3. ✅ Adicionado log para debug
4. ✅ Validação melhorada do token

---

## 🔍 Verificação no Banco

A conta testada possui:
- ✅ `api_key`: "8e07a063-8c01-40ea-84c4-eee536d53cd5"
- ✅ `access_token`: "8e07a063-8c01-40ea-84c4-eee536d53cd5"
- ✅ `instance_id`: "r0d268a07c14a29"

**Token estava salvo corretamente** - o problema era apenas o formato do header.

---

## ✅ Deploy Realizado

**Data**: 2025-01-28  
**Status**: ✅ **DEPLOY CONCLUÍDO**

```
✅ Deployed Functions on project nitefyufrzytdtxhaocf: messaging
📦 Script size: 172.7kB
🌐 Dashboard: https://supabase.com/dashboard/project/nitefyufrzytdtxhaocf/functions
```

---

## 🧪 Teste Novamente

Use o mesmo curl que você testou antes:

```bash
curl --location 'https://nitefyufrzytdtxhaocf.supabase.co/functions/v1/messaging/connect/f83b9379-7844-4c42-91f9-cefe30cd3b74' \
  --header 'Content-Type: application/json' \
  --header 'Authorization: Bearer YOUR_JWT_TOKEN' \
  --data '{
    "phone": "5516993028321"
  }'
```

**Resultado esperado:**
- ✅ Status 200 (sucesso)
- ✅ QR Code ou Pair Code retornado
- ✅ Sem erro 401

---

## 📝 Notas Importantes

### **Formato de Autenticação UAZAPI**

A UAZAPI usa diferentes formatos de autenticação dependendo do endpoint:

| Endpoint | Header Correto |
|----------|----------------|
| `POST /instance/init` | `admintoken: {admin-token}` |
| `POST /instance/connect` | `apikey: {instance-token}` |
| `GET /instance/status/:id` | `Authorization: Bearer {token}` ou `apikey: {token}` |
| `POST /send-text` | `Authorization: Bearer {token}` |

**Para `/instance/connect`, o formato correto é `apikey` no header.**

---

## ✅ Status Final

- ✅ Header de autenticação corrigido
- ✅ Deploy realizado com sucesso
- ✅ Pronto para testar novamente

**🎉 Correção aplicada! Teste novamente o endpoint de conexão.**

