# ✅ Implementação: Webhook UAZAPI v2

**Data**: 2025-01-28  
**Status**: 🟢 **Implementado**  
**Versão**: 2.0

---

## 🎯 Objetivo

Implementar suporte completo ao formato real do webhook UAZAPI na arquitetura v2 (Supabase), incluindo todas as funcionalidades da v1 (Xano).

---

## ✅ Funcionalidades Implementadas

### **1. Atualização de Tipos do UAZAPI**

**Arquivo**: `brokers/uazapi/types.ts`

- ✅ Atualizado `UazapiWebhookData` para formato real do webhook
- ✅ Adicionado suporte a `conversionSource` e `externalAdReply`
- ✅ Adicionado tipo `UazapiProfileResponse` para busca de perfil

**Estrutura do Webhook Real:**
```typescript
{
  EventType: 'messages' | 'status' | 'connection'
  message: {
    chatid: string // "554791662434@s.whatsapp.net"
    text?: string
    fromMe: boolean
    isGroup?: boolean
    messageType?: string
    content?: {
      contextInfo?: {
        conversionSource?: string
        externalAdReply?: { ... }
      }
    }
  }
  owner: string
  token: string
}
```

### **2. Extração de Protocolo Invisível**

**Arquivo**: `brokers/uazapi/UazapiBroker.ts`

- ✅ Implementada função `extractProtocol()` para extrair protocolo de rastreamento
- ✅ Mapeamento de caracteres Unicode invisíveis para números:
  - `\u200B` → `0` (Zero-width space)
  - `\u200C` → `1` (Zero-width non-joiner)
  - `\u200D` → `2` (Zero-width joiner)
  - `\u2060` → `3` (Word joiner)
- ✅ Protocolo salvo no `context.metadata.protocolNumber`
- ✅ Flag `isProtocol` salva no `context.metadata.isProtocol`

### **3. Busca de Nome via API Externa**

**Arquivo**: `brokers/uazapi/UazapiBroker.ts`

- ✅ Implementado método `fetchProfileName()`
- ✅ Chama `POST /chat/GetNameAndImageURL` quando `fromMe === true`
- ✅ Usa header `token` com token da instância
- ✅ Atualiza `contactName` com `wa_name` retornado
- ✅ Fallback: `"Nao consta"` se falhar ou não retornar nome

**Endpoint:**
```
POST https://adsmagic.uazapi.com/chat/GetNameAndImageURL
Headers: { "token": instanceToken }
Body: { "number": contactPhone, "preview": true }
```

### **4. Suporte a Conversion Source**

**Arquivo**: `brokers/uazapi/UazapiBroker.ts`

- ✅ Extração de `conversionSource` de `message.content.contextInfo.conversionSource`
- ✅ Suporte a `externalAdReply` (dados de anúncios)
- ✅ Dados salvos no `context.metadata` da mensagem normalizada
- ✅ Permite rastreamento de campanhas (Facebook Ads, Instagram Ads, etc.)

**Campos Extraídos:**
- `conversionSource`: Origem da conversão (ex: "FB_Ads", "IG_Ads")
- `externalAdReply`: Dados completos do anúncio (título, corpo, URL, etc.)

### **5. Normalização Completa do Webhook**

**Arquivo**: `brokers/uazapi/UazapiBroker.ts`

- ✅ Atualizado `normalizeWebhookData()` para formato real
- ✅ Extração correta de `contactPhone` (remove `@s.whatsapp.net`)
- ✅ Mapeamento de tipos de mensagem (`ExtendedTextMessage` → `text`, etc.)
- ✅ Suporte a grupos (`isGroup`, `groupId`, `groupName`)
- ✅ Timestamp correto (`messageTimestamp`)
- ✅ Device source (`message.source`)

**Mapeamento de Tipos:**
```typescript
'ExtendedTextMessage' → 'text'
'ImageMessage' → 'image'
'VideoMessage' → 'video'
'AudioMessage' → 'audio'
'DocumentMessage' → 'document'
'LocationMessage' → 'location'
'ContactMessage' → 'contact'
```

### **6. Validação de Mensagens Ignoradas**

**Arquivo**: `handlers/webhook.ts`

- ✅ Função `shouldIgnoreMessage()` implementada
- ✅ Ignora mensagens com `messageType === "error"`
- ✅ Ignora mensagens com `chatid === "status@broadcast"`
- ✅ Retorna resposta de sucesso com flag `ignored: true`
- ✅ Logs estruturados para debug

**Mensagens Ignoradas:**
- Mensagens de erro (`messageType: "error"`)
- Status broadcast (`chatid: "status@broadcast"`)

---

## 📊 Comparação: v1 vs v2

| Funcionalidade | v1 (Xano) | v2 (Supabase) |
|----------------|-----------|---------------|
| **Formato Real do Webhook** | ❌ Não suportava | ✅ Suportado |
| **Extração de Protocolo** | ✅ Sim | ✅ Sim |
| **Busca de Nome via API** | ✅ Sim | ✅ Sim |
| **Conversion Source** | ✅ Sim | ✅ Sim |
| **Ignorar Mensagens** | ✅ Sim | ✅ Sim |
| **Normalização** | ❌ Manual | ✅ Automática |
| **Múltiplos Brokers** | ❌ Não | ✅ Sim |
| **Persistência** | ✅ Xano | ✅ Supabase |
| **Validação de Assinatura** | ❌ Não | ⏳ Planejado |

---

## 🔄 Fluxo de Processamento

### **1. Recebimento do Webhook**

```
POST /messaging/webhook
Headers: { "x-account-id": "uuid" }
Body: { EventType, message, owner, token, ... }
```

### **2. Validação**

- ✅ Valida método POST
- ✅ Valida `x-account-id` header
- ✅ Busca conta no banco
- ✅ Verifica se mensagem deve ser ignorada

### **3. Normalização**

- ✅ Cria broker específico (UazapiBroker)
- ✅ Normaliza dados para formato padrão
- ✅ Extrai protocolo invisível
- ✅ Busca nome via API (se `fromMe === true`)
- ✅ Extrai `conversionSource`

### **4. Processamento**

- ✅ Cria/busca contato automaticamente
- ✅ Salva mensagem normalizada
- ✅ Atualiza estatísticas da conta
- ✅ Salva metadata (protocolo, conversionSource, etc.)

### **5. Resposta**

```json
{
  "success": true,
  "data": {
    "processed": true
  }
}
```

---

## 📝 Exemplo de Payload Processado

### **Webhook Recebido (UAZAPI)**

```json
{
  "EventType": "messages",
  "message": {
    "chatid": "554791662434@s.whatsapp.net",
    "text": "O‍‍‌‌​⁠‍⁠​‍​​‍⁠‌‍lá! Tenho interesse...",
    "fromMe": false,
    "isGroup": false,
    "messageType": "ExtendedTextMessage",
    "senderName": "Tânia herbst",
    "content": {
      "contextInfo": {
        "conversionSource": "FB_Ads"
      }
    }
  },
  "owner": "554796772041",
  "token": "2bb07e81-dfe3-414b-8e43-695030cb1c44"
}
```

### **Mensagem Normalizada**

```json
{
  "messageId": "554796772041:ACE65C74A5D044781791D7DDD25659FB",
  "externalMessageId": "554796772041:ACE65C74A5D044781791D7DDD25659FB",
  "brokerId": "uazapi",
  "accountId": "uuid-da-conta",
  "from": {
    "phoneNumber": "554791662434",
    "name": "Tânia herbst"
  },
  "to": {
    "phoneNumber": "554796772041",
    "accountName": "Conta WhatsApp"
  },
  "content": {
    "type": "text",
    "text": "O‍‍‌‌​⁠‍⁠​‍​​‍⁠‌‍lá! Tenho interesse..."
  },
  "timestamp": "2025-01-28T12:00:00.000Z",
  "status": "delivered",
  "isGroup": false,
  "context": {
    "metadata": {
      "conversionSource": "FB_Ads",
      "isProtocol": true,
      "protocolNumber": "0123",
      "messageDevice": "android",
      "owner": "554796772041",
      "instanceToken": "2bb07e81-dfe3-414b-8e43-695030cb1c44"
    }
  }
}
```

---

## 🧪 Testes Necessários

### **Testes Unitários**

- [ ] Testar `extractProtocol()` com diferentes mensagens
- [ ] Testar `fetchProfileName()` com sucesso e erro
- [ ] Testar `normalizeWebhookData()` com payload real
- [ ] Testar `shouldIgnoreMessage()` com diferentes casos

### **Testes de Integração**

- [ ] Testar webhook completo com payload real
- [ ] Testar busca de nome quando `fromMe === true`
- [ ] Testar ignorar mensagens de erro
- [ ] Testar extração de `conversionSource`
- [ ] Testar criação automática de contato

---

## 🔒 Melhorias Futuras

### **Segurança**

- [ ] Implementar validação de assinatura de webhook
- [ ] Adicionar rate limiting por conta
- [ ] Validar origem das requisições (IP whitelist)

### **Funcionalidades**

- [ ] Suportar outros tipos de eventos (`status`, `connection`)
- [ ] Processar `externalAdReply` completo
- [ ] Salvar dados de campanha em tabela separada
- [ ] Integrar com sistema de automações

---

## 📚 Arquivos Modificados

1. ✅ `brokers/uazapi/types.ts` - Tipos atualizados
2. ✅ `brokers/uazapi/UazapiBroker.ts` - Normalização completa
3. ✅ `handlers/webhook.ts` - Validação de mensagens ignoradas

---

## ✅ Checklist de Implementação

- [x] Atualizar tipos do UAZAPI
- [x] Implementar extração de protocolo invisível
- [x] Implementar busca de nome via API
- [x] Implementar suporte a `conversionSource`
- [x] Atualizar normalização do webhook
- [x] Implementar validação de mensagens ignoradas
- [ ] Testes unitários
- [ ] Testes de integração
- [ ] Validação de assinatura (futuro)
- [ ] Documentação de API (atualizar)

---

## 🎉 Conclusão

Todas as funcionalidades críticas da v1 foram implementadas na v2:

✅ **Formato real do webhook suportado**  
✅ **Extração de protocolo invisível**  
✅ **Busca de nome via API externa**  
✅ **Suporte a conversion source**  
✅ **Validação de mensagens ignoradas**  
✅ **Normalização completa e automática**

A arquitetura v2 é **superior** à v1 e mantém todas as funcionalidades, com melhorias em:
- Modularidade (brokers)
- Normalização automática
- Persistência robusta
- Extensibilidade

**Status**: 🟢 **Pronto para Testes**
