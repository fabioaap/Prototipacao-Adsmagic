# 📚 Referência de Endpoints UAZAPI - Documentação Oficial

**Data**: 2025-01-28  
**Status**: ⚠️ Requer Verificação  
**Documentação Oficial**: https://docs.uazapi.com/

---

## ⚠️ IMPORTANTE

Esta documentação contém endpoints **assumidos baseados em padrões comuns** de APIs não oficiais do WhatsApp. **É essencial verificar a documentação oficial da UAZAPI** para confirmar os endpoints exatos antes de usar em produção.

**URL da Documentação**: https://docs.uazapi.com/

---

## 🔍 Como Verificar a Documentação

1. Acesse: https://docs.uazapi.com/
2. Procure pelas seções:
   - **Instance Management** ou **Gerenciamento de Instâncias**
   - **Connection** ou **Conexão**
   - **QR Code** ou **Pair Code**
   - **Authentication** ou **Autenticação**
3. Verifique os endpoints específicos mencionados abaixo

---

## 📋 Endpoints Confirmados (Documentação Oficial)

### 1. Criar Instância

**Endpoint Confirmado:**
```
POST /instance/init
```

**URL Base:** `https://free.uazapi.com` ou `https://uazapi.com/api`

**Headers:**
```http
Accept: application/json
Content-Type: application/json
```

**Body:**
```json
{
  "name": "minha-instancia",
  "systemName": "apilocal",
  "adminField01": "custom-metadata-1",
  "adminField02": "custom-metadata-2"
}
```

**Resposta Esperada:**
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

### 2. Conectar Instância (Gerar QR Code)

**Endpoint Confirmado:**
```
POST /instance/connect
```

**URL Base:** `https://free.uazapi.com` ou `https://uazapi.com/api`

**Headers:**
```http
Accept: application/json
Content-Type: application/json
apikey: {sua-api-key}  // ou Authorization: Bearer {token}
```

**Body (Opcional):**
```json
{
  "phone": "5511999999999"
}
```

**Resposta Esperada:**
```json
{
  "qrcode": {
    "base64": "data:image/png;base64,...",
    "code": "..."
  }
}
```

**Nota:** O endpoint é `POST /instance/connect` (não `GET /instance/connect/:instanceId`)

**Headers Esperados:**
```http
Authorization: Bearer {apiKey}
Content-Type: application/json
```

**Resposta Esperada (Formatos Possíveis):**

**Formato 1:**
```json
{
  "qrcode": {
    "base64": "data:image/png;base64,iVBORw0KG...",
    "code": "QR_CODE_STRING"
  },
  "status": "connecting",
  "instanceId": "instance_123"
}
```

**Formato 2:**
```json
{
  "base64": "data:image/png;base64,iVBORw0KG...",
  "qr": "QR_CODE_STRING",
  "status": "connecting"
}
```

**Formato 3:**
```json
{
  "qrcode": "data:image/png;base64,iVBORw0KG...",
  "expiresIn": 40,
  "instanceId": "instance_123"
}
```

---

### 2. Gerar Pair Code

**Endpoint Assumido:**
```
GET /instance/pair-code/:instanceId
```

**Alternativas Possíveis:**
- `GET /api/instance/:instanceId/pair-code`
- `GET /instance/:instanceId/paircode`
- `POST /instance/:instanceId/pair-code`
- `GET /pair-code/:instanceId`

**Headers Esperados:**
```http
Authorization: Bearer {apiKey}
Content-Type: application/json
```

**Resposta Esperada:**
```json
{
  "code": "ABC-123-DEF-456",
  "expiresIn": 120,
  "instanceId": "instance_123",
  "status": "connecting"
}
```

---

### 3. Verificar Status da Instância

**Endpoint Assumido:**
```
GET /instance/status/:instanceId
```

**Alternativas Possíveis:**
- `GET /api/instance/:instanceId/status`
- `GET /instance/:instanceId`
- `GET /instance/info/:instanceId`
- `GET /status/:instanceId`

**Headers Esperados:**
```http
Authorization: Bearer {apiKey}
Content-Type: application/json
```

**Resposta Esperada:**
```json
{
  "instanceId": "instance_123",
  "status": "connected",
  "number": "5511999999999",
  "name": "Nome do WhatsApp",
  "qrcode": {
    "base64": "...",
    "code": "..."
  }
}
```

**Valores de Status Possíveis:**
- `connected` - Conectado e pronto
- `disconnected` - Desconectado
- `connecting` - Aguardando conexão
- `timeout` - Conexão expirada

---

### 4. Obter Informações da Instância

**Endpoint Assumido:**
```
GET /instance/info/:instanceId
```

**Alternativas Possíveis:**
- `GET /api/instance/:instanceId/info`
- `GET /instance/:instanceId/info`
- `GET /instance/:instanceId` (mesmo que status)

**Resposta Esperada:**
```json
{
  "instanceId": "instance_123",
  "number": "5511999999999",
  "name": "Nome do WhatsApp",
  "status": "connected",
  "connectedAt": "2025-01-28T12:00:00Z"
}
```

---

### 5. Desconectar Instância

**Endpoint Assumido:**
```
DELETE /instance/logout/:instanceId
```

**Alternativas Possíveis:**
- `DELETE /api/instance/:instanceId/logout`
- `POST /instance/:instanceId/logout`
- `DELETE /instance/:instanceId/disconnect`
- `DELETE /instance/:instanceId`

**Resposta Esperada:**
```json
{
  "success": true,
  "message": "Instance disconnected"
}
```

---

## 🔧 Como Ajustar Após Verificar Documentação

### Passo 1: Verificar Endpoints

1. Acesse a documentação oficial
2. Identifique os endpoints corretos
3. Compare com os assumidos acima

### Passo 2: Atualizar UazapiBroker.ts

**Arquivo**: `back-end/supabase/functions/messaging/brokers/uazapi/UazapiBroker.ts`

**O que ajustar:**
- URLs dos endpoints (linhas ~166, ~210, ~247, ~281, ~309)
- Métodos HTTP (GET, POST, DELETE)
- Estrutura de headers se necessário

**Exemplo de ajuste:**
```typescript
// ANTES (assumido)
const response = await this.makeRequest(
  `${this.apiUrl}/instance/connect/${this.instanceId}`,
  { method: 'GET', ... }
)

// DEPOIS (após verificar documentação)
const response = await this.makeRequest(
  `${this.apiUrl}/api/v1/instance/${this.instanceId}/qrcode`, // Endpoint correto
  { method: 'POST', ... } // Método correto
)
```

### Passo 3: Atualizar Tipos TypeScript

**Arquivo**: `back-end/supabase/functions/messaging/brokers/uazapi/types.ts`

**O que ajustar:**
- Estrutura das interfaces de resposta
- Campos retornados pela API
- Valores possíveis de status

**Exemplo de ajuste:**
```typescript
// Se a resposta real for diferente, ajuste:
export interface UazapiQRCodeResponse {
  // Formato real da API UAZAPI
  qrCodeBase64: string // campo correto
  expiresIn: number
  // ...
}
```

### Passo 4: Testar com Conta Real

1. Criar conta de teste na UAZAPI
2. Obter API Key e Instance ID
3. Testar cada endpoint
4. Verificar respostas reais
5. Ajustar código conforme necessário

---

## 📝 Checklist de Verificação

Use este checklist após acessar a documentação oficial:

- [ ] ✅ Endpoint de QR Code confirmado
- [ ] ✅ Endpoint de Pair Code confirmado
- [ ] ✅ Endpoint de Status confirmado
- [ ] ✅ Endpoint de Info confirmado
- [ ] ✅ Endpoint de Logout confirmado
- [ ] ✅ Estrutura de resposta do QR Code confirmada
- [ ] ✅ Estrutura de resposta do Pair Code confirmada
- [ ] ✅ Estrutura de resposta de Status confirmada
- [ ] ✅ Métodos HTTP corretos confirmados
- [ ] ✅ Headers necessários confirmados
- [ ] ✅ Valores de status possíveis confirmados
- [ ] ✅ Código ajustado conforme documentação
- [ ] ✅ Testado com conta real

---

## 🚀 Teste Rápido

Após verificar a documentação, use este script de teste:

```typescript
// Teste básico para verificar endpoints
const testEndpoints = async () => {
  const apiUrl = 'https://uazapi.com/api'
  const apiKey = 'sua-api-key'
  const instanceId = 'sua-instance-id'
  
  // 1. Testar QR Code
  try {
    const qrResponse = await fetch(`${apiUrl}/instance/connect/${instanceId}`, {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    })
    console.log('QR Code Response:', await qrResponse.json())
  } catch (error) {
    console.error('QR Code Error:', error)
  }
  
  // 2. Testar Status
  try {
    const statusResponse = await fetch(`${apiUrl}/instance/status/${instanceId}`, {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    })
    console.log('Status Response:', await statusResponse.json())
  } catch (error) {
    console.error('Status Error:', error)
  }
}
```

---

## 📚 Recursos Úteis

- **Documentação Oficial**: https://docs.uazapi.com/
- **Site UAZAPI**: https://uazapi.com/
- **Suporte**: Verificar na documentação ou site oficial

---

## ✅ Após Verificação

Após verificar e ajustar os endpoints:

1. ✅ Atualizar este documento com endpoints corretos
2. ✅ Atualizar `UazapiBroker.ts` com endpoints reais
3. ✅ Atualizar tipos TypeScript se necessário
4. ✅ Testar com conta real
5. ✅ Atualizar `IMPLEMENTACAO_CONEXAO_UAZAPI.md` com informações corretas

---

**⚠️ Lembre-se**: Esta implementação usa padrões comuns, mas os endpoints reais podem ser diferentes. Sempre verifique a documentação oficial antes de usar em produção!

**Última Atualização**: 2025-01-28

