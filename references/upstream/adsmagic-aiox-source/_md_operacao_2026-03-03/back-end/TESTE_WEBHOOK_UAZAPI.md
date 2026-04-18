# 🧪 Teste de Webhook UazAPI

**Data**: 2025-01-28  
**Status**: ✅ Guia de Teste  
**Endpoint**: `POST /functions/v1/messaging/webhook`

---

## 📋 Informações Necessárias

Antes de testar, você precisa ter:

1. **ID da Conta de Mensageria** (`messaging_account_id`)
   - UUID da conta UazAPI cadastrada no banco
   - Pode ser obtido através do Supabase Dashboard ou via query SQL

2. **URL Base da Edge Function**
   - Formato: `https://{project-ref}.supabase.co/functions/v1/messaging/webhook`
   - Exemplo: `https://nitefyufrzytdtxhaocf.supabase.co/functions/v1/messaging/webhook`

---

## 🔌 Endpoint

```
POST https://{project-ref}.supabase.co/functions/v1/messaging/webhook
```

---

## 📝 Headers Obrigatórios

```http
Content-Type: application/json
x-account-id: {UUID_DA_CONTA_UAZAPI}
```

**Nota**: O header `x-broker-type` é opcional. O sistema detecta automaticamente o tipo do broker através da conta.

---

## 📦 Exemplos de Payload

### **1. Mensagem de Texto Simples**

```json
{
  "BaseUrl": "https://adsmagic.uazapi.com",
  "EventType": "messages",
  "instanceName": "8c4a7ebb-1d7e-4b9a-bfd1-f8f2f01177bc",
  "message": {
    "id": "554796772041:ACE65C74A5D044781791D7DDD25659FB",
    "messageid": "ACE65C74A5D044781791D7DDD25659FB",
    "chatid": "554791662434@s.whatsapp.net",
    "text": "Olá! Tenho interesse no seu produto.",
    "fromMe": false,
    "isGroup": false,
    "messageType": "ExtendedTextMessage",
    "type": "text",
    "messageTimestamp": 1738084800000,
    "senderName": "João Silva",
    "sender": "213709100187796@lid",
    "sender_pn": "554791662434@s.whatsapp.net",
    "source": "android",
    "wasSentByApi": false,
    "buttonOrListid": "",
    "groupName": "Unknown"
  },
  "owner": "554796772041",
  "token": "2bb07e81-dfe3-414b-8e43-695030cb1c44"
}
```

### **2. Mensagem com Conversão de Anúncio (Facebook Ads)**

```json
{
  "BaseUrl": "https://adsmagic.uazapi.com",
  "EventType": "messages",
  "instanceName": "8c4a7ebb-1d7e-4b9a-bfd1-f8f2f01177bc",
  "message": {
    "id": "554796772041:ACE65C74A5D044781791D7DDD25659FB",
    "messageid": "ACE65C74A5D044781791D7DDD25659FB",
    "chatid": "554791662434@s.whatsapp.net",
    "text": "Olá! Tenho interesse...",
    "fromMe": false,
    "isGroup": false,
    "messageType": "ExtendedTextMessage",
    "type": "text",
    "messageTimestamp": 1738084800000,
    "senderName": "Maria Santos",
    "sender": "213709100187796@lid",
    "sender_pn": "554791662434@s.whatsapp.net",
    "source": "android",
    "wasSentByApi": false,
    "buttonOrListid": "",
    "groupName": "Unknown",
    "content": {
      "text": "Olá! Tenho interesse...",
      "previewType": 0,
      "contextInfo": {
        "conversionSource": "FB_Ads",
        "conversionData": "campaign_123",
        "externalAdReply": {
          "title": "Produto Incrível",
          "body": "Descrição do anúncio",
          "sourceType": "ad",
          "sourceID": "123456789",
          "sourceURL": "https://facebook.com/ads",
          "sourceApp": "facebook"
        }
      }
    }
  },
  "owner": "554796772041",
  "token": "2bb07e81-dfe3-414b-8e43-695030cb1c44"
}
```

### **3. Mensagem com Protocolo Invisível**

```json
{
  "BaseUrl": "https://adsmagic.uazapi.com",
  "EventType": "messages",
  "instanceName": "8c4a7ebb-1d7e-4b9a-bfd1-f8f2f01177bc",
  "message": {
    "id": "554796772041:ACE65C74A5D044781791D7DDD25659FB",
    "messageid": "ACE65C74A5D044781791D7DDD25659FB",
    "chatid": "554791662434@s.whatsapp.net",
    "text": "Olá! ‍‍‌‌​⁠‍⁠​‍​​‍⁠‌‍ Esta mensagem contém protocolo invisível.",
    "fromMe": false,
    "isGroup": false,
    "messageType": "ExtendedTextMessage",
    "type": "text",
    "messageTimestamp": 1738084800000,
    "senderName": "Pedro Costa",
    "sender": "213709100187796@lid",
    "sender_pn": "554791662434@s.whatsapp.net",
    "source": "android",
    "wasSentByApi": false,
    "buttonOrListid": "",
    "groupName": "Unknown"
  },
  "owner": "554796772041",
  "token": "2bb07e81-dfe3-414b-8e43-695030cb1c44"
}
```

**Nota**: Os caracteres invisíveis (Zero-width space, etc.) serão extraídos automaticamente pelo sistema como protocolo de rastreamento.

### **4. Mensagem Enviada por Nós (fromMe: true)**

```json
{
  "BaseUrl": "https://adsmagic.uazapi.com",
  "EventType": "messages",
  "instanceName": "8c4a7ebb-1d7e-4b9a-bfd1-f8f2f01177bc",
  "message": {
    "id": "554796772041:ACE65C74A5D044781791D7DDD25659FB",
    "messageid": "ACE65C74A5D044781791D7DDD25659FB",
    "chatid": "554791662434@s.whatsapp.net",
    "text": "Obrigado pelo contato!",
    "fromMe": true,
    "isGroup": false,
    "messageType": "ExtendedTextMessage",
    "type": "text",
    "messageTimestamp": 1738084800000,
    "sender": "554796772041",
    "sender_pn": "554796772041@s.whatsapp.net",
    "source": "api",
    "wasSentByApi": true,
    "buttonOrListid": "",
    "groupName": "Unknown"
  },
  "owner": "554796772041",
  "token": "2bb07e81-dfe3-414b-8e43-695030cb1c44"
}
```

**Nota**: Quando `fromMe: true`, o sistema buscará o nome do contato via API externa (`POST /chat/GetNameAndImageURL`).

### **5. Mensagem de Mídia (Imagem)**

```json
{
  "BaseUrl": "https://adsmagic.uazapi.com",
  "EventType": "messages",
  "instanceName": "8c4a7ebb-1d7e-4b9a-bfd1-f8f2f01177bc",
  "message": {
    "id": "554796772041:ACE65C74A5D044781791D7DDD25659FB",
    "messageid": "ACE65C74A5D044781791D7DDD25659FB",
    "chatid": "554791662434@s.whatsapp.net",
    "fromMe": false,
    "isGroup": false,
    "messageType": "ImageMessage",
    "type": "image",
    "messageTimestamp": 1738084800000,
    "senderName": "Ana Lima",
    "sender": "213709100187796@lid",
    "sender_pn": "554791662434@s.whatsapp.net",
    "source": "android",
    "wasSentByApi": false,
    "buttonOrListid": "",
    "groupName": "Unknown",
    "content": {
      "mediaUrl": "https://example.com/image.jpg",
      "caption": "Esta é uma imagem",
      "previewType": 1
    }
  },
  "owner": "554796772041",
  "token": "2bb07e81-dfe3-414b-8e43-695030cb1c44"
}
```

### **6. Evento de Status**

```json
{
  "BaseUrl": "https://adsmagic.uazapi.com",
  "EventType": "status",
  "instanceName": "8c4a7ebb-1d7e-4b9a-bfd1-f8f2f01177bc",
  "message": {
    "chatid": "554791662434@s.whatsapp.net",
    "status": "delivered",
    "messageTimestamp": 1738084800000
  },
  "owner": "554796772041",
  "token": "2bb07e81-dfe3-414b-8e43-695030cb1c44"
}
```

---

## 🧪 Exemplos de Teste

### **1. Via cURL**

```bash
# Substitua {ACCOUNT_ID} pelo UUID da sua conta UazAPI
# Substitua {PROJECT_REF} pelo seu project-ref do Supabase

curl -X POST \
  "https://{PROJECT_REF}.supabase.co/functions/v1/messaging/webhook" \
  -H "Content-Type: application/json" \
  -H "x-account-id: {ACCOUNT_ID}" \
  -d '{
    "BaseUrl": "https://adsmagic.uazapi.com",
    "EventType": "messages",
    "instanceName": "8c4a7ebb-1d7e-4b9a-bfd1-f8f2f01177bc",
    "message": {
      "id": "554796772041:ACE65C74A5D044781791D7DDD25659FB",
      "messageid": "ACE65C74A5D044781791D7DDD25659FB",
      "chatid": "554791662434@s.whatsapp.net",
      "text": "Olá! Teste de webhook.",
      "fromMe": false,
      "isGroup": false,
      "messageType": "ExtendedTextMessage",
      "type": "text",
      "messageTimestamp": 1738084800000,
      "senderName": "Teste User",
      "sender": "213709100187796@lid",
      "sender_pn": "554791662434@s.whatsapp.net",
      "source": "android",
      "wasSentByApi": false,
      "buttonOrListid": "",
      "groupName": "Unknown"
    },
    "owner": "554796772041",
    "token": "2bb07e81-dfe3-414b-8e43-695030cb1c44"
  }'
```

### **2. Via HTTPie**

```bash
http POST \
  https://{PROJECT_REF}.supabase.co/functions/v1/messaging/webhook \
  Content-Type:application/json \
  x-account-id:{ACCOUNT_ID} \
  BaseUrl="https://adsmagic.uazapi.com" \
  EventType="messages" \
  owner="554796772041" \
  token="2bb07e81-dfe3-414b-8e43-695030cb1c44" \
  message:='{
    "chatid": "554791662434@s.whatsapp.net",
    "text": "Teste via HTTPie",
    "fromMe": false,
    "isGroup": false,
    "messageType": "ExtendedTextMessage",
    "type": "text",
    "messageTimestamp": 1738084800000,
    "senderName": "Teste User"
  }'
```

### **3. Via Postman**

1. **Método**: `POST`
2. **URL**: `https://{PROJECT_REF}.supabase.co/functions/v1/messaging/webhook`
3. **Headers**:
   - `Content-Type`: `application/json`
   - `x-account-id`: `{ACCOUNT_ID}`
4. **Body** (raw JSON): Use um dos exemplos de payload acima

### **4. Via JavaScript (Fetch API)**

```javascript
const accountId = 'YOUR_ACCOUNT_ID';
const projectRef = 'YOUR_PROJECT_REF';

const webhookPayload = {
  BaseUrl: "https://adsmagic.uazapi.com",
  EventType: "messages",
  instanceName: "8c4a7ebb-1d7e-4b9a-bfd1-f8f2f01177bc",
  message: {
    id: "554796772041:ACE65C74A5D044781791D7DDD25659FB",
    messageid: "ACE65C74A5D044781791D7DDD25659FB",
    chatid: "554791662434@s.whatsapp.net",
    text: "Olá! Teste de webhook via JavaScript.",
    fromMe: false,
    isGroup: false,
    messageType: "ExtendedTextMessage",
    type: "text",
    messageTimestamp: Date.now(),
    senderName: "Teste User",
    sender: "213709100187796@lid",
    sender_pn: "554791662434@s.whatsapp.net",
    source: "android",
    wasSentByApi: false,
    buttonOrListid: "",
    groupName: "Unknown"
  },
  owner: "554796772041",
  token: "2bb07e81-dfe3-414b-8e43-695030cb1c44"
};

const response = await fetch(
  `https://${projectRef}.supabase.co/functions/v1/messaging/webhook`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-account-id': accountId
    },
    body: JSON.stringify(webhookPayload)
  }
);

const result = await response.json();
console.log('Resultado:', result);
```

### **5. Via Python (requests)**

```python
import requests
import json
from datetime import datetime

account_id = 'YOUR_ACCOUNT_ID'
project_ref = 'YOUR_PROJECT_REF'

webhook_payload = {
    "BaseUrl": "https://adsmagic.uazapi.com",
    "EventType": "messages",
    "instanceName": "8c4a7ebb-1d7e-4b9a-bfd1-f8f2f01177bc",
    "message": {
        "id": "554796772041:ACE65C74A5D044781791D7DDD25659FB",
        "messageid": "ACE65C74A5D044781791D7DDD25659FB",
        "chatid": "554791662434@s.whatsapp.net",
        "text": "Olá! Teste de webhook via Python.",
        "fromMe": False,
        "isGroup": False,
        "messageType": "ExtendedTextMessage",
        "type": "text",
        "messageTimestamp": int(datetime.now().timestamp() * 1000),
        "senderName": "Teste User",
        "sender": "213709100187796@lid",
        "sender_pn": "554791662434@s.whatsapp.net",
        "source": "android",
        "wasSentByApi": False,
        "buttonOrListid": "",
        "groupName": "Unknown"
    },
    "owner": "554796772041",
    "token": "2bb07e81-dfe3-414b-8e43-695030cb1c44"
}

response = requests.post(
    f'https://{project_ref}.supabase.co/functions/v1/messaging/webhook',
    headers={
        'Content-Type': 'application/json',
        'x-account-id': account_id
    },
    json=webhook_payload
)

print(f'Status: {response.status_code}')
print(f'Response: {response.json()}')
```

---

## ✅ Resposta Esperada

### **Sucesso (200 OK)**

```json
{
  "success": true,
  "data": {
    "processed": true
  }
}
```

### **Mensagem Ignorada (200 OK)**

```json
{
  "success": true,
  "data": {
    "processed": false,
    "ignored": true,
    "reason": "Message type is error"
  }
}
```

### **Erro - Conta Não Encontrada (404)**

```json
{
  "success": false,
  "error": "Conta não encontrada"
}
```

### **Erro - Header Faltando (400)**

```json
{
  "success": false,
  "error": "x-account-id header é obrigatório"
}
```

### **Erro - Assinatura Inválida (401)**

```json
{
  "success": false,
  "error": "Invalid webhook signature"
}
```

---

## 🔍 Como Obter o Account ID

### **Via SQL (Supabase Dashboard)**

```sql
SELECT 
  id,
  account_name,
  broker_type,
  broker_config->>'instanceId' as instance_id,
  created_at
FROM messaging_accounts
WHERE broker_type = 'uazapi'
ORDER BY created_at DESC;
```

### **Via Supabase Client**

```typescript
const { data, error } = await supabase
  .from('messaging_accounts')
  .select('id, account_name, broker_type')
  .eq('broker_type', 'uazapi')
  .order('created_at', { ascending: false });

console.log('Contas UazAPI:', data);
```

---

## 📊 O Que Acontece Quando o Webhook é Processado?

1. **Validação**
   - Verifica se `x-account-id` está presente
   - Busca a conta no banco de dados
   - Valida estrutura do payload

2. **Filtragem de Mensagens**
   - Ignora mensagens de erro (`messageType === "error"`)
   - Ignora grupos (se configurado)
   - Ignora mensagens de broadcast (`chatid === "status@broadcast"`)

3. **Normalização**
   - Converte formato UazAPI para formato padrão
   - Extrai protocolo invisível (se presente)
   - Extrai dados de conversão (se presente)

4. **Busca de Nome (se necessário)**
   - Se `fromMe === true`, busca nome via API externa
   - Endpoint: `POST /chat/GetNameAndImageURL`

5. **Processamento**
   - Cria/atualiza contato no banco
   - Salva mensagem no banco
   - Atualiza estatísticas da conta

---

## 🐛 Troubleshooting

### **Erro: "Conta não encontrada"**
- Verifique se o `x-account-id` está correto
- Verifique se a conta existe no banco de dados
- Verifique se o `broker_type` da conta é `'uazapi'`

### **Erro: "Invalid webhook signature"**
- Verifique se `webhook_secret` está configurado na conta
- Se estiver configurado, a UazAPI deve enviar a assinatura no header `x-signature`

### **Mensagem sendo ignorada**
- Verifique os logs para ver o motivo
- Pode ser que a mensagem seja de erro, grupo ou broadcast
- Verifique se o filtro está configurado corretamente

### **Contato não está sendo criado**
- Verifique se o `chatid` está no formato correto (`554791662434@s.whatsapp.net`)
- Verifique os logs para erros de processamento
- Verifique se a conta tem permissões para criar contatos

---

## 📝 Notas Importantes

1. **Timestamp**: O `messageTimestamp` deve estar em **milissegundos** (Unix timestamp * 1000)

2. **Chat ID**: O `chatid` deve estar no formato `{numero}@s.whatsapp.net` ou `{numero}@c.us`

3. **Token**: O `token` no payload deve corresponder ao token da instância configurado na conta

4. **Owner**: O `owner` deve corresponder ao número do dono da conta WhatsApp

5. **Protocolo Invisível**: Caracteres Unicode invisíveis são automaticamente extraídos e convertidos em números

---

## 🔗 Referências

- [Documentação da API de Mensageria](./docs/MESSAGING_API_DOCUMENTATION.md)
- [Análise Webhook UazAPI v1 vs v2](./ANALISE_WEBHOOK_UAZAPI_V1_VS_V2.md)
- [Implementação Webhook UazAPI v2](./IMPLEMENTACAO_WEBHOOK_UAZAPI_V2.md)
- [Tipos do UazAPI](./supabase/functions/messaging/brokers/uazapi/types.ts)
