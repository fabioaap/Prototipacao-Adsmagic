# ✅ Correção: Header de Autenticação UAZAPI - Usar 'token' ao invés de 'apikey'

**Data**: 2025-01-28  
**Status**: ✅ **CORRIGIDO**

---

## 🔴 Problema Identificado

Após análise profunda e teste direto na UAZAPI, descobrimos que:

1. **Header incorreto**: Estávamos usando `apikey` no header, mas a UAZAPI espera `token`
2. **URL desnecessária**: Tentávamos usar `instanceId` na URL, mas não é necessário

---

## ✅ Correções Aplicadas

### **1. Header de Autenticação**

**Antes:**
```typescript
headers['apikey'] = instanceToken
headers['Authorization'] = `Bearer ${instanceToken}`
```

**Depois:**
```typescript
headers['token'] = instanceToken // CORRETO: Header 'token' conforme UAZAPI
```

### **2. URL do Endpoint**

**Antes:**
```typescript
// Tentava com instanceId na URL
`${this.apiUrl}/instance/connect/${this.instanceId}`
// Depois tentava sem (fallback)
`${this.apiUrl}/instance/connect`
```

**Depois:**
```typescript
// Sempre sem instanceId na URL (formato correto)
`${this.apiUrl}/instance/connect`
// O token da instância é identificado pelo header 'token'
```

### **3. Extração do QR Code**

**Ajustado para buscar o QR Code no formato real da resposta:**
- `instance.qrcode` (string direta com base64)
- Fallbacks para outros formatos possíveis

---

## 📋 Arquivos Alterados

1. ✅ `supabase/functions/messaging/brokers/uazapi/UazapiBroker.ts`
   - Header alterado de `apikey` para `token`
   - Removido instanceId da URL
   - Removido try-catch desnecessário
   - Ajustada extração do QR Code

2. ✅ `supabase/functions/messaging/brokers/uazapi/types.ts`
   - Atualizado `UazapiConnectResponse` para refletir estrutura real da resposta

---

## 🧪 Teste de Validação

**Teste direto na UAZAPI (funcionou!):**
```bash
curl --location 'https://adsmagic.uazapi.com/instance/connect' \
  --header 'token: 7b2a5b05-7090-4756-91af-f72bef5dad61' \
  --header 'Content-Type: application/json' \
  --data '{}'
```

**Resposta (sucesso):**
```json
{
  "connected": true,
  "instance": {
    "id": "r3977f52ed45449",
    "status": "connecting",
    "qrcode": "data:image/png;base64,..."
  }
}
```

---

## ✅ Próximo Passo

**Deploy** da Edge Function para aplicar as correções.

---

**🎯 Problema identificado e corrigido!**

