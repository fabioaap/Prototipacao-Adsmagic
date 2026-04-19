# ✅ Correção: Priorizar `api_key` para UAZAPI

**Data**: 2025-01-28  
**Status**: ✅ **CORRIGIDO**

---

## 🎯 Objetivo

Para UAZAPI, o token da instância deve ser buscado **principalmente** do campo `api_key` da tabela `messaging_accounts`.

---

## ✅ Correções Aplicadas

### **1. Handler: `connect-instance.ts`**
- ✅ Prioriza `account.api_key` sobre `account.access_token` para UAZAPI
- ✅ Mensagem de erro atualizada para mencionar `api_key` como campo principal
- ✅ Log adicionado mostrando a fonte do token (`tokenSource`)

### **2. Broker: `UazapiBroker.ts`**
- ✅ Prioriza `this.apiKey` sobre `this.accessToken` no método `generateQRCode()`
- ✅ Mensagem de erro atualizada para mencionar `api_key` como campo principal

### **3. Handler: `generate-qrcode.ts`**
- ✅ Prioriza `account.api_key` sobre `account.access_token`
- ✅ Mensagem de erro atualizada

### **4. Handler: `generate-paircode.ts`**
- ✅ Prioriza `account.api_key` sobre `account.access_token`
- ✅ Mensagem de erro atualizada

### **5. Handler: `connection-status.ts`**
- ✅ Prioriza `account.api_key` sobre `account.access_token`
- ✅ Mensagem de erro atualizada

---

## 📋 Mudanças Específicas

### **Antes:**
```typescript
// Priorizava access_token
const accessToken = account.access_token || account.api_key || ''
const instanceToken = this.accessToken || this.apiKey
```

### **Depois:**
```typescript
// Prioriza api_key para UAZAPI
const accessToken = account.api_key || account.access_token || ''
const instanceToken = this.apiKey || this.accessToken
```

---

## 🔍 Lógica de Busca do Token para UAZAPI

**Ordem de prioridade:**
1. ✅ `account.api_key` - **Campo principal** (onde o token da instância é salvo)
2. ✅ `account.access_token` - Campo secundário (fallback)
3. ✅ `broker_config.instanceData.token` - Último recurso

---

## 📝 Comentários Adicionados

Todos os handlers e o broker agora têm comentários claros indicando que:

> **Para UAZAPI, o token da instância está no campo `api_key` (campo principal)**

---

## ✅ Resultado

Agora, quando uma função precisa buscar o token de uma conta UAZAPI:

1. **Busca primeiro** no campo `api_key` da tabela `messaging_accounts`
2. Se não encontrar, busca no `access_token` (fallback)
3. Se ainda não encontrar, busca em `broker_config.instanceData.token`

---

## 🚀 Próximo Passo: Deploy

Após essas correções, fazer o deploy da Edge Function para aplicar as mudanças.

---

**✅ Correções aplicadas! O token do UAZAPI agora é buscado corretamente do campo `api_key`.**

