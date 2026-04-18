# ✅ Atualização: Conexão de Instância UAZAPI ao WhatsApp

**Data**: 2025-01-28  
**Status**: ✅ **IMPLEMENTADO**

---

## 📚 Baseado na Documentação Oficial UAZAPI

Conforme documentação: **POST /instance/connect**

### **Comportamento:**
- **Sem phone no body**: Gera QR Code (timeout 2 minutos)
- **Com phone no body**: Gera código de pareamento (timeout 5 minutos)
- **Requer**: Token de autenticação da instância
- **Atualiza status**: Para "connecting"

---

## ✅ Mudanças Implementadas

### **1. UazapiBroker Atualizado**

#### **Constructor:**
- ✅ Agora recebe e armazena `accessToken` (token da instância)
- ✅ Usa `accessToken` ou `apiKey` conforme disponibilidade

#### **Método `generateQRCode` Atualizado:**
- ✅ Usa token da instância (`accessToken`) para autenticação
- ✅ Suporta passar `phone` opcional no parâmetro
- ✅ Retorna QR Code ou Pair Code baseado na presença de phone
- ✅ Timeout correto: 2 minutos para QR Code, 5 minutos para Pair Code
- ✅ Retorna tipo: `'qrcode'` ou `'paircode'`

#### **Método `generatePairCode` Atualizado:**
- ✅ Usa o mesmo endpoint `POST /instance/connect` com phone
- ✅ Timeout de 5 minutos conforme documentação

---

### **2. Novos Endpoints**

#### **POST** `/messaging/connect/:accountId`
- ✅ Aceita phone opcional no body
- ✅ Gera QR Code (sem phone) ou Pair Code (com phone)
- ✅ Atualiza status para "connecting"
- ✅ Retorna resposta formatada baseada no tipo

**Exemplo de Request:**
```json
{
  "phone": "5511999999999"  // Opcional - se não passar, gera QR Code
}
```

**Exemplo de Response (QR Code):**
```json
{
  "success": true,
  "type": "qrcode",
  "data": {
    "qrCode": "data:image/png;base64,...",
    "expiresAt": "2025-01-28T12:00:00.000Z",
    "instanceId": "ra03d1256ebb36c"
  },
  "message": "Escaneie o QR Code com seu WhatsApp para conectar (expira em 2 minutos)"
}
```

**Exemplo de Response (Pair Code):**
```json
{
  "success": true,
  "type": "paircode",
  "data": {
    "code": "ABC-123-DEF",
    "expiresAt": "2025-01-28T12:05:00.000Z",
    "instanceId": "ra03d1256ebb36c",
    "phone": "5511999999999"
  },
  "message": "Use este código no WhatsApp: Configurações > Aparelhos conectados > Conectar um aparelho (expira em 5 minutos)"
}
```

---

### **3. Endpoints Existentes Atualizados**

#### **GET** `/messaging/qrcode/:accountId`
- ✅ Sempre gera QR Code (não passa phone)
- ✅ Timeout: 2 minutos

#### **GET** `/messaging/paircode/:accountId`
- ✅ Pode passar phone opcional da conta
- ✅ Gera Pair Code via `POST /instance/connect` com phone
- ✅ Timeout: 5 minutos

---

### **4. Autenticação**

O endpoint `/instance/connect` requer:
- **Token da instância** (não admin token)
- Token é salvo em `access_token` quando a instância é criada
- Autenticação via `Authorization: Bearer <token>` ou header `apikey`

**Prioridade:**
1. `access_token` (token da instância) → `Authorization: Bearer`
2. `api_key` (fallback) → header `apikey`

---

## 📋 Fluxo de Uso

### **1. Criar Instância:**
```
POST /messaging/instances/uazapi
→ Retorna: instanceId, token, apikey
```

### **2. Conectar ao WhatsApp:**

**Opção A: QR Code (sem phone)**
```
POST /messaging/connect/:accountId
Body: {} (vazio)
→ Retorna QR Code (expira em 2 minutos)
```

**Opção B: Pair Code (com phone)**
```
POST /messaging/connect/:accountId
Body: { "phone": "5511999999999" }
→ Retorna Pair Code (expira em 5 minutos)
```

### **3. Monitorar Conexão:**
```
GET /messaging/connection-status/:accountId
→ Retorna status: disconnected | connecting | connected
```

---

## 🔧 Arquivos Modificados

1. ✅ `brokers/uazapi/UazapiBroker.ts`
   - Adicionado `accessToken` no constructor
   - Atualizado `generateQRCode` para usar token da instância
   - Ajustados timeouts (2 min QR Code, 5 min Pair Code)
   - Suporte a retorno de Pair Code quando phone é passado

2. ✅ `handlers/generate-qrcode.ts`
   - Atualizado para não passar phone (sempre gera QR Code)

3. ✅ `handlers/generate-paircode.ts`
   - Atualizado para passar phone opcionalmente

4. ✅ `handlers/connect-instance.ts` **(NOVO)**
   - Endpoint POST que aceita phone no body
   - Gera QR Code ou Pair Code conforme phone

5. ✅ `index.ts`
   - Nova rota: `POST /messaging/connect/:accountId`

6. ✅ `types.ts`
   - Atualizado `QRCodeResponse` para suportar type

---

## 🧪 Testes

### **Teste 1: QR Code (sem phone)**
```bash
curl -X POST 'https://nitefyufrzytdtxhaocf.supabase.co/functions/v1/messaging/connect/ACCOUNT_ID' \
  -H 'Authorization: Bearer JWT_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{}'
```

### **Teste 2: Pair Code (com phone)**
```bash
curl -X POST 'https://nitefyufrzytdtxhaocf.supabase.co/functions/v1/messaging/connect/ACCOUNT_ID' \
  -H 'Authorization: Bearer JWT_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "phone": "5511999999999"
  }'
```

---

## ✅ Status

- ✅ Broker atualizado conforme documentação
- ✅ Timeouts corretos (2 min QR Code, 5 min Pair Code)
- ✅ Endpoint POST criado para conectar com phone
- ✅ Handlers atualizados
- ⏳ **Próximo passo**: Deploy e testes

---

**📖 Documentação UAZAPI:** https://docs.uazapi.com/

