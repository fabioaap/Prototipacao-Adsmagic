# ✅ Correção: BOOT_ERROR - Variável Duplicada

**Data**: 2025-01-28  
**Status**: ✅ **CORRIGIDO**

---

## 🔴 Problema Identificado

O erro BOOT_ERROR estava sendo causado por uma **declaração duplicada de variável** no arquivo `UazapiBroker.ts`.

**Erro:**
```json
{
  "code": "BOOT_ERROR",
  "message": "Function failed to start (please check logs)"
}
```

**Causa Raiz:**
No método `generateQRCode` do `UazapiBroker.ts`, a variável `instanceToken` estava sendo declarada **duas vezes**:

```typescript
// Linha 235 - Primeira declaração
const instanceToken = this.accessToken || this.apiKey
if (!instanceToken) {
  throw new Error('Token de autenticação da instância é obrigatório para conectar')
}

// ... código ...

// Linha 253 - Segunda declaração (ERRO!)
const instanceToken = this.accessToken || this.apiKey  // ❌ Redeclaração!
if (!instanceToken) {
  throw new Error('Token de autenticação da instância não encontrado')
}
```

Em TypeScript/JavaScript, **não é permitido redeclarar uma variável `const` no mesmo escopo**, o que causava um erro de sintaxe que impedia a função de inicializar.

---

## ✅ Solução Aplicada

Removida a declaração duplicada e simplificado o código:

**Antes:**
```typescript
// Verificar se tem token da instância (obrigatório para conectar)
const instanceToken = this.accessToken || this.apiKey
if (!instanceToken) {
  throw new Error('Token de autenticação da instância é obrigatório para conectar')
}

if (!this.instanceId) {
  throw new Error('ID da instância é obrigatório para conectar')
}

// Endpoint: POST /instance/connect
// Autenticação: token da instância no header (UAZAPI usa 'apikey' no header)
const headers: Record<string, string> = {
  'Accept': 'application/json',
  'Content-Type': 'application/json',
}

// UAZAPI requer 'apikey' no header para /instance/connect
// Usar token da instância (accessToken tem prioridade sobre apiKey)
const instanceToken = this.accessToken || this.apiKey  // ❌ DUPLICADO!
if (!instanceToken) {
  throw new Error('Token de autenticação da instância não encontrado')
}

headers['apikey'] = instanceToken
```

**Depois:**
```typescript
// Verificar se tem token da instância (obrigatório para conectar)
const instanceToken = this.accessToken || this.apiKey
if (!instanceToken) {
  throw new Error('Token de autenticação da instância é obrigatório para conectar')
}

if (!this.instanceId) {
  throw new Error('ID da instância é obrigatório para conectar')
}

// Endpoint: POST /instance/connect
// Autenticação: token da instância no header (UAZAPI usa 'apikey' no header)
const headers: Record<string, string> = {
  'Accept': 'application/json',
  'Content-Type': 'application/json',
  'apikey': instanceToken, // ✅ Usar a variável já declarada
}
```

---

## 📋 Arquivo Corrigido

- ✅ `back-end/supabase/functions/messaging/brokers/uazapi/UazapiBroker.ts`
  - Removida declaração duplicada de `instanceToken`
  - Simplificado código para usar a variável já declarada

---

## 🚀 Próximo Passo: Deploy

**IMPORTANTE:** O Docker Desktop precisa estar rodando para fazer o deploy.

1. **Inicie o Docker Desktop**
2. **Aguarde o Docker inicializar completamente**
3. **Execute o deploy:**
   ```bash
   cd back-end
   supabase functions deploy messaging --project-ref nitefyufrzytdtxhaocf
   ```

---

## ✅ Resultado Esperado

Após o deploy:
- ✅ Função deve inicializar corretamente
- ✅ Sem erro BOOT_ERROR
- ✅ Endpoint `/messaging/connect/:accountId` deve funcionar

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
- ✅ Sem erro BOOT_ERROR

---

**🎉 Erro de sintaxe corrigido! Faça o deploy quando o Docker estiver rodando.**

