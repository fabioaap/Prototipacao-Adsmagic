# ✅ Endpoints UAZAPI Atualizados - Documentação Oficial

**Data**: 2025-01-28  
**Status**: ✅ Atualizado com Endpoints Reais  
**Fonte**: Documentação Oficial UAZAPI

---

## 📋 Endpoints Confirmados

### 1. **Criar Instância**

**Endpoint:**
```
POST /instance/init
```

**URL Base:** `https://free.uazapi.com` ou `https://uazapi.com/api`

**Exemplo:**
```bash
curl --request POST \
  --url https://free.uazapi.com/instance/init \
  --header 'Accept: application/json' \
  --header 'Content-Type: application/json' \
  --data '{
    "name": "minha-instancia",
    "systemName": "apilocal",
    "adminField01": "custom-metadata-1",
    "adminField02": "custom-metadata-2"
  }'
```

**Resposta:**
```json
{
  "instance": {
    "instanceName": "minha-instancia",
    "apikey": "...",
    "token": "..."
  }
}
```

---

### 2. **Conectar Instância ao WhatsApp (Gerar QR Code)**

**Endpoint:**
```
POST /instance/connect
```

**URL Base:** `https://free.uazapi.com` ou `https://uazapi.com/api`

**Exemplo:**
```bash
curl --request POST \
  --url https://free.uazapi.com/instance/connect \
  --header 'Accept: application/json' \
  --header 'Content-Type: application/json' \
  --header 'apikey: {sua-api-key}' \
  --data '{
    "phone": "5511999999999"
  }'
```

**Resposta:**
```json
{
  "qrcode": {
    "base64": "data:image/png;base64,...",
    "code": "..."
  }
}
```

**Nota Importante:**
- ✅ Endpoint é `POST /instance/connect` (não `GET`)
- ✅ Não precisa de `instanceId` na URL
- ✅ Autenticação via `apikey` no header (ou `Authorization: Bearer`)
- ✅ Campo `phone` no body é opcional

---

## 🔧 Mudanças Implementadas

### 1. **Método `createInstance()` Adicionado**

```typescript
async createInstance(params: {
  name: string
  systemName?: string
  adminField01?: string
  adminField02?: string
}): Promise<{ instanceName: string; apikey?: string; token?: string }>
```

**Arquivo:** `supabase/functions/messaging/brokers/uazapi/UazapiBroker.ts`

---

### 2. **Método `generateQRCode()` Atualizado**

**Antes (Assumido):**
```typescript
GET /instance/connect/:instanceId
```

**Depois (Real):**
```typescript
POST /instance/connect
// Com body: { phone?: string }
// Com header: apikey ou Authorization Bearer
```

**Mudanças:**
- ✅ Método HTTP: `GET` → `POST`
- ✅ URL: `/instance/connect/:instanceId` → `/instance/connect`
- ✅ Body: Adicionado suporte para `phone` opcional
- ✅ Header: Adicionado suporte para `apikey` no header

**Arquivo:** `supabase/functions/messaging/brokers/uazapi/UazapiBroker.ts`

---

### 3. **Tipos TypeScript Atualizados**

**Novos Tipos Adicionados:**
- `UazapiInitInstanceResponse` - Resposta de criação de instância
- `UazapiConnectResponse` - Resposta de conexão

**Arquivo:** `supabase/functions/messaging/brokers/uazapi/types.ts`

---

### 4. **URL Base Padrão Atualizada**

**Antes:**
```typescript
this.apiUrl = 'https://uazapi.com/api'
```

**Depois:**
```typescript
this.apiUrl = 'https://free.uazapi.com'
```

**Arquivo:** `supabase/functions/messaging/brokers/uazapi/UazapiBroker.ts`

---

## ⚠️ Observações Importantes

### Autenticação

A UAZAPI pode usar diferentes métodos de autenticação:
- `apikey` no header (confirmado no exemplo)
- `Authorization: Bearer {token}` (possível alternativa)

**Implementação atual:** Usa `apikey` no header, mas pode ser ajustado se necessário.

### Instance ID

- A criação de instância retorna `instanceName` e `apikey`
- O `instanceId` pode ser o mesmo que `instanceName` ou diferente
- Verificar documentação para confirmar como identificar instância após criação

### Endpoints Ainda Não Confirmados

Estes endpoints ainda precisam ser verificados na documentação oficial:
- ✅ `POST /instance/init` - **Confirmado**
- ✅ `POST /instance/connect` - **Confirmado**
- ⏳ `GET /instance/status/:instanceId` - **A verificar**
- ⏳ `GET /instance/info/:instanceId` - **A verificar**
- ⏳ `GET /instance/pair-code/:instanceId` - **A verificar**
- ⏳ `DELETE /instance/logout/:instanceId` - **A verificar**

---

## 📝 Próximos Passos

1. ✅ **Criar Instância** - Implementado
2. ✅ **Conectar Instância** - Implementado
3. ⏳ **Verificar outros endpoints** na documentação oficial
4. ⏳ **Testar com conta real** após obter credenciais
5. ⏳ **Ajustar autenticação** se necessário (apikey vs Bearer)

---

## 🔗 Referências

- **Documentação Oficial**: https://docs.uazapi.com/
- **URL Base**: `https://free.uazapi.com` ou `https://uazapi.com/api`
- **Exemplos Fornecidos**: Endpoints de criação e conexão confirmados

---

**Última Atualização**: 2025-01-28

