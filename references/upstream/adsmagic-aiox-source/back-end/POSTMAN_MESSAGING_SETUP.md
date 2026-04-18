# 📦 Configuração Postman - Collection de Mensageria

**Data**: 2025-01-28  
**Versão**: 1.0

---

## 🎯 O que foi criado

Foi criada uma **collection completa do Postman** para testar todos os endpoints de mensageria, incluindo:

1. ✅ **Criação de Instância UAZAPI** (direto na API UAZAPI)
2. ✅ **Conexão UAZAPI** (geração de QR Code)
3. ✅ **Todos os endpoints de mensageria** da nossa Edge Function

---

## 📥 Como Importar

### **Opção 1: Collection Separada (Recomendado)**

1. Abra o **Postman**
2. Clique em **Import** (canto superior esquerdo)
3. Arraste o arquivo:
   - `MESSAGING_POSTMAN_COLLECTION.json`
4. Clique em **Import**
5. A collection "📱 Messaging API - UAZAPI & Endpoints" aparecerá

### **Opção 2: Adicionar à Collection Existente**

Você pode importar a collection separada OU adicionar manualmente os endpoints na collection `Adsmagic_Backend_API.postman_collection.json`.

---

## 🔧 Configurar Variáveis de Ambiente

Adicione estas variáveis ao seu Postman Environment (`Adsmagic Backend - Local`):

| Variável | Valor | Descrição |
|----------|-------|-----------|
| `uazapi_url` | `https://free.uazapi.com` | URL base da API UAZAPI |
| `uazapi_apikey` | (sua-api-key) | API Key da UAZAPI |
| `uazapi_instance_name` | `minha-instancia` | Nome da instância para criação |
| `uazapi_instance_id` | (deixe vazio) | ID da instância criada (será preenchido) |
| `messaging_account_id` | (deixe vazio) | ID da conta de mensageria no banco |
| `messaging_phone_to` | (deixe vazio) | Número de destino para testes |

**✅ As variáveis já foram adicionadas ao arquivo `Adsmagic_Backend_Environment.postman_environment.json`**

---

## 📋 Endpoints Disponíveis na Collection

### **🔧 UAZAPI - Gerenciamento de Instância**

1. **Criar Instância UAZAPI**
   - `POST {{uazapi_url}}/instance/init`
   - Body: `{ "name": "...", "systemName": "...", ... }`
   - Salva `uazapi_instance_id` e `uazapi_apikey` automaticamente

2. **Conectar Instância (Gerar QR Code)**
   - `POST {{uazapi_url}}/instance/connect`
   - Header: `apikey: {{uazapi_apikey}}`
   - Body: `{ "phone": "..." }` (opcional)

### **📨 Messaging - Webhooks**

3. **Webhook - UAZAPI**
   - `POST {{functions_url}}/messaging/webhook`
   - Header: `x-account-id: {{messaging_account_id}}`

4. **Webhook - WhatsApp Business API**
   - `POST {{functions_url}}/messaging/webhook`
   - Header: `x-account-id: {{messaging_account_id}}`

5. **Webhook - Gupshup**
   - `POST {{functions_url}}/messaging/webhook`
   - Header: `x-account-id: {{messaging_account_id}}`

### **📤 Messaging - Envio de Mensagens**

6. **Enviar Mensagem de Texto**
   - `POST {{functions_url}}/messaging/send`
   - Auth: `Bearer {{jwt_token}}`
   - Body: `{ "accountId": "...", "to": "...", "text": "..." }`

7. **Enviar Mensagem com Mídia**
   - `POST {{functions_url}}/messaging/send`
   - Body: `{ "accountId": "...", "to": "...", "mediaUrl": "...", "mediaType": "image" }`

8. **Enviar Template (WhatsApp Business)**
   - `POST {{functions_url}}/messaging/send`
   - Body: `{ "accountId": "...", "to": "...", "templateName": "...", "templateLanguage": "pt" }`

### **📊 Messaging - Status e Sincronização**

9. **Status da Conta**
   - `GET {{functions_url}}/messaging/status/{{messaging_account_id}}`
   - Auth: `Bearer {{jwt_token}}`

10. **Status de Conexão Detalhado**
    - `GET {{functions_url}}/messaging/connection-status/{{messaging_account_id}}`
    - Auth: `Bearer {{jwt_token}}`

11. **Sincronizar Contatos**
    - `POST {{functions_url}}/messaging/sync-contacts/{{messaging_account_id}}`
    - Auth: `Bearer {{jwt_token}}`

### **🔗 Messaging - Conexão (QR Code/Pair Code)**

12. **Gerar QR Code**
    - `GET {{functions_url}}/messaging/qrcode/{{messaging_account_id}}`
    - Auth: `Bearer {{jwt_token}}`

13. **Gerar Pair Code**
    - `GET {{functions_url}}/messaging/paircode/{{messaging_account_id}}`
    - Auth: `Bearer {{jwt_token}}`

---

## 🚀 Fluxo de Teste Completo

### **Passo 1: Criar Instância UAZAPI**

1. Execute: **Criar Instância UAZAPI**
2. Anote o `instanceName` e `apikey` retornados
3. Configure no Environment:
   - `uazapi_instance_id` = nome da instância
   - `uazapi_apikey` = apikey retornada

### **Passo 2: Criar Conta de Mensageria no Banco**

Execute no Supabase SQL Editor:

```sql
INSERT INTO messaging_accounts (
  project_id,
  platform,
  broker_type,
  account_identifier,
  account_name,
  broker_config,
  api_key,
  status
) VALUES (
  'SEU_PROJECT_ID',
  'whatsapp',
  'uazapi',
  '5511999999999',
  'Conta WhatsApp UAZAPI',
  '{
    "instanceId": "{{uazapi_instance_id}}",
    "apiBaseUrl": "{{uazapi_url}}"
  }'::jsonb,
  '{{uazapi_apikey}}',
  'disconnected'
) RETURNING id;
```

4. Configure no Environment:
   - `messaging_account_id` = id retornado

### **Passo 3: Conectar Instância (Gerar QR Code)**

**Opção A: Via UAZAPI Direto**

5. Execute: **Conectar Instância (Gerar QR Code)**
6. Escaneie o QR Code com seu WhatsApp

**Opção B: Via Nossa API**

7. Execute: **Gerar QR Code**
8. Escaneie o QR Code com seu WhatsApp
9. Verifique conexão: **Status de Conexão Detalhado**

### **Passo 4: Testar Webhook**

10. Execute: **Webhook - UAZAPI**
11. Verifique se contato foi criado no banco

### **Passo 5: Testar Envio de Mensagem**

12. Execute: **Enviar Mensagem de Texto**
13. Verifique se mensagem chegou no WhatsApp

---

## 📝 Exemplos de Requisições

### **Criar Instância UAZAPI**

```http
POST https://free.uazapi.com/instance/init
Accept: application/json
Content-Type: application/json

{
  "name": "minha-instancia",
  "systemName": "apilocal",
  "adminField01": "custom-metadata-1",
  "adminField02": "custom-metadata-2"
}
```

**Resposta:**
```json
{
  "instance": {
    "instanceName": "minha-instancia",
    "apikey": "sua-api-key-aqui",
    "token": "seu-token-aqui"
  }
}
```

### **Conectar Instância**

```http
POST https://free.uazapi.com/instance/connect
Accept: application/json
Content-Type: application/json
apikey: sua-api-key-aqui

{
  "phone": "5511999999999"
}
```

**Resposta:**
```json
{
  "qrcode": {
    "base64": "data:image/png;base64,iVBORw0KG...",
    "code": "..."
  }
}
```

### **Gerar QR Code via Nossa API**

```http
GET {{functions_url}}/messaging/qrcode/{{messaging_account_id}}
Authorization: Bearer {{jwt_token}}
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "qrCode": "data:image/png;base64,...",
    "expiresAt": "2025-01-28T12:00:40.000Z",
    "instanceId": "minha-instancia",
    "status": "generated"
  }
}
```

---

## ✅ Scripts de Teste Automatizados

Cada endpoint possui scripts de teste que:

- ✅ Validam status code (200/201)
- ✅ Validam estrutura de resposta
- ✅ Salvam variáveis automaticamente (IDs, tokens, etc.)
- ✅ Exibem mensagens no console

**Exemplo:**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

if (pm.response.code === 200) {
    const response = pm.response.json();
    if (response.instance?.instanceName) {
        pm.environment.set("uazapi_instance_id", response.instance.instanceName);
        console.log("✅ Instância criada:", response.instance.instanceName);
    }
}
```

---

## 📚 Documentação Relacionada

- **Guia Completo de Testes**: `TESTE_ENDPOINTS_MENSAGERIA.md`
- **Documentação da API**: `docs/MESSAGING_API_DOCUMENTATION.md`
- **Endpoints UAZAPI**: `UAZAPI_ENDPOINTS_ATUALIZADOS.md`

---

## 🔍 Troubleshooting

### **Erro: "Instance not found"**

- Verifique se `uazapi_instance_id` está correto
- Verifique se a instância foi criada

### **Erro: "API Key inválida"**

- Verifique se `uazapi_apikey` está configurada
- Verifique se a API key está correta

### **Erro: "Conta não encontrada"**

- Verifique se `messaging_account_id` está correto
- Verifique se a conta existe no banco de dados

---

**✅ Collection pronta para uso!**

Importe `MESSAGING_POSTMAN_COLLECTION.json` no Postman e comece a testar!

**Última Atualização**: 2025-01-28

