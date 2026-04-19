# 📊 Análise: Webhook UAZAPI v1 (Xano) vs v2 (Supabase)

**Data**: 2025-01-28  
**Autor**: Análise Técnica  
**Status**: Proposta de Implementação

---

## 🎯 Objetivo

Analisar o webhook worker.js da v1 (Cloudflare Worker + Xano) e propor a melhor implementação para a v2 (Supabase Edge Function + Arquitetura de Brokers).

---

## 📋 Análise do Código v1

### **Estrutura do Worker v1**

```javascript
// Fluxo principal:
1. Valida método POST
2. Parse do body JSON
3. Extrai: EventType, message, owner, token
4. Ignora mensagens de erro ou status@broadcast
5. Extrai protocolo invisível (caracteres Unicode)
6. Monta payload normalizado
7. Se isFromMe: chama API externa para obter nome (GetNameAndImageURL)
8. Se não é grupo: envia para Xano
9. Retorna sucesso
```

### **Funcionalidades Identificadas**

#### ✅ **1. Validação de Mensagens**
- Ignora `messageType === "error"`
- Ignora `chatid === "status@broadcast"`
- Valida estrutura básica do payload

#### ✅ **2. Extração de Protocolo Invisível**
```javascript
const PROTOCOL_MAPPING = {
  "\u200B": "0",  // Zero-width space
  "\u200C": "1",  // Zero-width non-joiner
  "\u200D": "2",  // Zero-width joiner
  "\u2060": "3",  // Word joiner
};
```
- Extrai protocolo de rastreamento de mensagens
- Converte caracteres invisíveis em números

#### ✅ **3. Busca de Nome do Contato (API Externa)**
- Quando `isFromMe === true`, chama:
  - `POST https://adsmagic.uazapi.com/chat/GetNameAndImageURL`
  - Header: `token: instanceToken`
  - Body: `{ number: contactPhone, preview: true }`
- Atualiza `contactName` com `wa_name` retornado
- Fallback: `"Nao consta"` se falhar

#### ✅ **4. Payload Normalizado**
```javascript
{
  event: EventType,
  instanceApiKey: token,
  instanceToken: token,
  isFromMe: message.fromMe,
  messageBody: message.text,
  messageType: message.messageType,
  messageDevice: message.source,
  contactName: message.senderName || apiResponse.wa_name,
  contactPhone: message.chatid.replace('@s.whatsapp.net', ''),
  owner: owner,
  conversionSource: message.content.contextInfo.conversionSource,
  isProtocol: boolean,
  isGroup: message.isGroup,
  protocolNumber: string
}
```

---

## 📥 Formato do Webhook UAZAPI (Real)

### **Estrutura Completa**

```json
{
  "BaseUrl": "https://adsmagic.uazapi.com",
  "EventType": "messages",
  "chat": { /* dados do chat */ },
  "instanceName": "8c4a7ebb-1d7e-4b9a-bfd1-f8f2f01177bc",
  "message": {
    "buttonOrListid": "",
    "chatid": "554791662434@s.whatsapp.net",
    "content": {
      "text": "O‍‍‌‌​⁠‍⁠​‍​​‍⁠‌‍lá! Tenho interesse...",
      "previewType": 0,
      "contextInfo": {
        "conversionSource": "FB_Ads",
        "conversionData": "...",
        "externalAdReply": { /* dados do anúncio */ }
      }
    },
    "fromMe": false,
    "groupName": "Unknown",
    "id": "554796772041:ACE65C74A5D044781791D7DDD25659FB",
    "isGroup": false,
    "messageTimestamp": 1765237312000,
    "messageType": "ExtendedTextMessage",
    "messageid": "ACE65C74A5D044781791D7DDD25659FB",
    "owner": "554796772041",
    "sender": "213709100187796@lid",
    "senderName": "Tânia herbst",
    "sender_lid": "213709100187796@lid",
    "sender_pn": "554791662434@s.whatsapp.net",
    "source": "android",
    "text": "O‍‍‌‌​⁠‍⁠​‍​​‍⁠‌‍lá! Tenho interesse...",
    "type": "text",
    "wasSentByApi": false
  },
  "owner": "554796772041",
  "token": "2bb07e81-dfe3-414b-8e43-695030cb1c44"
}
```

### **Campos Importantes**

| Campo | Descrição | Uso |
|-------|-----------|-----|
| `EventType` | Tipo de evento (`"messages"`) | Identificar tipo de webhook |
| `message.chatid` | ID do chat (com `@s.whatsapp.net`) | Extrair número do contato |
| `message.fromMe` | Se mensagem foi enviada por nós | Determinar se buscar nome via API |
| `message.text` | Texto da mensagem | Conteúdo + extração de protocolo |
| `message.messageType` | Tipo da mensagem | Validar se deve processar |
| `message.isGroup` | Se é grupo | Filtrar grupos |
| `message.content.contextInfo.conversionSource` | Origem da conversão (ads) | Rastreamento de campanhas |
| `owner` | Número do dono da conta | Identificar conta |
| `token` | Token da instância | Autenticação para API externa |

---

## 🔄 Comparação: v1 vs v2

### **v1 (Cloudflare Worker + Xano)**

**✅ Vantagens:**
- Código simples e direto
- Processamento síncrono
- Logs detalhados

**❌ Desvantagens:**
- Hardcoded para UAZAPI
- Sem normalização (formato específico)
- Sem abstração de brokers
- Dependência de Xano (hardcoded URL)
- Sem validação de assinatura
- Sem tratamento de erros robusto
- Sem persistência de eventos

### **v2 (Supabase Edge Function + Brokers)**

**✅ Vantagens:**
- Arquitetura modular (brokers)
- Normalização automática
- Suporte a múltiplos brokers
- Validação de assinatura (planejado)
- Persistência no banco
- Criação automática de contatos
- Processamento assíncrono
- Logs estruturados

**❌ Desvantagens:**
- Mais complexo (mas mais flexível)
- Precisa identificar conta via `x-account-id`

---

## 🎯 Proposta de Implementação

### **1. Atualizar Normalização do UazapiBroker**

O `UazapiBroker.normalizeWebhookData()` precisa ser atualizado para suportar o formato real do webhook UAZAPI.

#### **Problemas Identificados no Código Atual:**

1. **Tipo `UazapiWebhookData` não corresponde ao formato real**
   - Atual: `{ id, from, to, body, timestamp, ... }`
   - Real: `{ EventType, message: { chatid, text, fromMe, ... }, owner, token }`

2. **Falta extração de protocolo invisível**
   - v1 tinha função `extractProtocol()` que precisa ser portada

3. **Falta busca de nome via API externa**
   - v1 chamava `GetNameAndImageURL` quando `isFromMe === true`

4. **Falta tratamento de `conversionSource`**
   - v1 extraía `conversionSource` de `contextInfo`

#### **Solução: Atualizar `UazapiBroker.ts`**

```typescript
// brokers/uazapi/UazapiBroker.ts

/**
 * Mapeamento de protocolo invisível
 */
const PROTOCOL_MAPPING: Record<string, string> = {
  '\u200B': '0', // Zero-width space
  '\u200C': '1', // Zero-width non-joiner
  '\u200D': '2', // Zero-width joiner
  '\u2060': '3', // Word joiner
}

/**
 * Extrai protocolo de rastreamento da mensagem
 */
function extractProtocol(messageText: string): string {
  let protocol = ''
  for (const char of messageText) {
    if (PROTOCOL_MAPPING[char] !== undefined) {
      protocol += PROTOCOL_MAPPING[char]
    }
  }
  return protocol
}

async normalizeWebhookData(rawData: unknown): Promise<NormalizedWebhookData> {
  // Validar estrutura
  if (!rawData || typeof rawData !== 'object') {
    throw new Error('Invalid webhook data: expected object')
  }
  
  const data = rawData as UazapiWebhookData
  
  // Validar campos obrigatórios
  if (!data.message || !data.message.chatid) {
    throw new Error('Invalid webhook data: missing message.chatid')
  }
  
  const message = data.message
  const messageBody = message.text || ''
  
  // Extrair protocolo invisível
  const extractedProtocol = extractProtocol(messageBody)
  const isProtocol = extractedProtocol.length > 0
  
  // Extrair número do contato (remove @s.whatsapp.net)
  const contactPhone = message.chatid.replace('@s.whatsapp.net', '')
  
  // Extrair conversionSource (origem de campanha)
  const conversionSource = message.content?.contextInfo?.conversionSource || ''
  
  // Se mensagem foi enviada por nós, buscar nome via API
  let contactName = message.senderName || ''
  if (message.fromMe) {
    try {
      const apiResponse = await this.fetchProfileName(data.token, contactPhone)
      contactName = apiResponse?.wa_name || 'Nao consta'
    } catch (error) {
      console.error('[UazapiBroker] Error fetching profile name:', error)
      contactName = 'Nao consta'
    }
  }
  
  // Normalizar mensagem
  const normalizedMessage: NormalizedMessage = {
    messageId: message.id || message.messageid || '',
    externalMessageId: message.id || message.messageid || '',
    brokerId: this.brokerId,
    accountId: this.accountId,
    from: {
      phoneNumber: contactPhone,
      name: contactName,
    },
    to: {
      phoneNumber: data.owner || '',
      accountName: this.config.accountName,
    },
    content: {
      type: this.mapMessageType(message.messageType || message.type),
      text: messageBody,
      mediaUrl: message.content?.mediaUrl,
      caption: message.content?.caption,
    },
    timestamp: new Date(message.messageTimestamp || Date.now()),
    status: 'delivered',
    isGroup: message.isGroup === true,
    groupId: message.isGroup ? message.chatid : undefined,
    groupName: message.groupName,
    context: {
      metadata: {
        conversionSource,
        isProtocol,
        protocolNumber: extractedProtocol,
        messageDevice: message.source,
        owner: data.owner,
        instanceToken: data.token,
      },
    },
  }
  
  return {
    eventType: data.EventType === 'messages' ? 'message' : 'status',
    message: normalizedMessage,
    timestamp: new Date(),
    rawData: data,
  }
}

/**
 * Busca nome e imagem do perfil via API UAZAPI
 * Endpoint: POST /chat/GetNameAndImageURL
 */
private async fetchProfileName(
  instanceToken: string,
  contactPhone: string
): Promise<{ wa_name?: string; wa_image?: string } | null> {
  try {
    const response = await this.makeRequest(
      `${this.apiUrl}/chat/GetNameAndImageURL`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'token': instanceToken, // Header 'token' conforme UAZAPI
        },
        body: {
          number: contactPhone,
          preview: true,
        },
      }
    )
    
    return response as { wa_name?: string; wa_image?: string }
  } catch (error) {
    console.error('[UazapiBroker] Error fetching profile:', error)
    return null
  }
}

/**
 * Mapeia tipo de mensagem UAZAPI para tipo normalizado
 */
private mapMessageType(uazapiType: string): NormalizedMessage['content']['type'] {
  const mapping: Record<string, NormalizedMessage['content']['type']> = {
    'ExtendedTextMessage': 'text',
    'ImageMessage': 'image',
    'VideoMessage': 'video',
    'AudioMessage': 'audio',
    'DocumentMessage': 'document',
    'LocationMessage': 'location',
    'ContactMessage': 'contact',
  }
  
  return mapping[uazapiType] || 'text'
}
```

### **2. Atualizar Tipos do UAZAPI**

```typescript
// brokers/uazapi/types.ts

/**
 * Formato real do webhook UAZAPI
 */
export interface UazapiWebhookData {
  BaseUrl?: string
  EventType: 'messages' | 'status' | 'connection'
  
  // Dados do chat (opcional)
  chat?: {
    id?: string
    phone?: string
    name?: string
    wa_name?: string
    owner?: string
    [key: string]: unknown
  }
  
  // Dados da mensagem
  message: {
    id?: string
    messageid?: string
    chatid: string // Formato: "554791662434@s.whatsapp.net"
    text?: string
    fromMe: boolean
    isGroup?: boolean
    groupName?: string
    messageType?: string // "ExtendedTextMessage", "ImageMessage", etc.
    type?: string // "text", "image", etc.
    messageTimestamp?: number
    sender?: string
    senderName?: string
    sender_lid?: string
    sender_pn?: string
    source?: string // "android", "ios", etc.
    content?: {
      text?: string
      mediaUrl?: string
      caption?: string
      contextInfo?: {
        conversionSource?: string
        conversionData?: string
        externalAdReply?: {
          title?: string
          body?: string
          mediaType?: number
          thumbnailURL?: string
          sourceType?: string
          sourceID?: string
          [key: string]: unknown
        }
        [key: string]: unknown
      }
      [key: string]: unknown
    }
    [key: string]: unknown
  }
  
  // Identificação
  instanceName?: string
  owner: string // Número do dono da conta
  token: string // Token da instância
}
```

### **3. Atualizar Handler de Webhook**

O handler atual já está bem estruturado, mas precisa de melhorias:

```typescript
// handlers/webhook.ts

export async function handleWebhook(
  req: Request,
  supabaseClient: ReturnType<typeof createClient>
) {
  try {
    // 1. Validar método
    if (req.method !== 'POST') {
      return errorResponse('Método não permitido', 405)
    }
    
    // 2. Extrair accountId do header
    const accountId = req.headers.get('x-account-id')
    if (!accountId) {
      return errorResponse('x-account-id header é obrigatório', 400)
    }
    
    // 3. Ler body como texto (para validação de assinatura futura)
    const rawBody = await req.text()
    
    // 4. Buscar conta
    const accountRepo = new MessagingAccountRepository(supabaseClient)
    const account = await accountRepo.findById(accountId)
    if (!account) {
      return errorResponse('Conta não encontrada', 404)
    }
    
    // 5. Validar se mensagem deve ser ignorada (antes de normalizar)
    const body = JSON.parse(rawBody)
    if (this.shouldIgnoreMessage(body)) {
      return successResponse({ ignored: true, reason: 'Mensagem ignorada' })
    }
    
    // 6. Criar broker e normalizar
    const broker = WhatsAppBrokerFactory.create(
      account.broker_type,
      {
        ...account.broker_config,
        accountName: account.account_name,
        apiKey: account.api_key || undefined,
        accessToken: account.access_token || undefined,
      },
      accountId
    )
    
    // 7. Validar assinatura (se configurado)
    if (account.webhook_secret && broker.validateWebhookSignature) {
      const signature = req.headers.get('x-signature') || 
                        req.headers.get('x-webhook-signature') ||
                        null
      
      if (signature) {
        const isValid = await broker.validateWebhookSignature(
          rawBody,
          signature,
          account.webhook_secret
        )
        
        if (!isValid) {
          return errorResponse('Invalid webhook signature', 401)
        }
      }
    }
    
    // 8. Normalizar dados
    const normalizer = new WhatsAppNormalizer([broker])
    const normalized = await normalizer.normalizeWebhook(
      account.broker_type,
      body
    )
    
    // 9. Processar mensagem
    const processor = new WhatsAppProcessor(supabaseClient)
    
    if (normalized.eventType === 'message' && normalized.message) {
      await processor.processMessage(normalized.message, account.project_id)
      
      // Atualizar estatísticas
      await accountRepo.updateStats(accountId, {
        totalMessages: account.total_messages + 1,
        lastWebhookAt: new Date().toISOString(),
      })
    } else if (normalized.eventType === 'status' && normalized.status) {
      await processor.processStatusUpdate(normalized.status)
    }
    
    return successResponse({ processed: true })
    
  } catch (error) {
    console.error('[Webhook Handler] Error:', error)
    return errorResponse(
      error instanceof Error ? error.message : 'Erro desconhecido',
      500
    )
  }
}

/**
 * Verifica se mensagem deve ser ignorada
 */
private shouldIgnoreMessage(body: unknown): boolean {
  if (!body || typeof body !== 'object') {
    return false
  }
  
  const data = body as { message?: { messageType?: string; chatid?: string } }
  
  // Ignorar mensagens de erro
  if (data.message?.messageType === 'error') {
    return true
  }
  
  // Ignorar status@broadcast
  if (data.message?.chatid === 'status@broadcast') {
    return true
  }
  
  return false
}
```

### **4. Adicionar Suporte a Protocolo Invisível no Processor**

O `WhatsAppProcessor` pode usar o protocolo para rastreamento:

```typescript
// core/processor.ts

async processMessage(
  normalizedMessage: NormalizedMessage,
  projectId: string
): Promise<ProcessResult> {
  // Extrair protocolo do contexto
  const protocolNumber = normalizedMessage.context?.metadata?.protocolNumber as string | undefined
  const isProtocol = normalizedMessage.context?.metadata?.isProtocol as boolean | undefined
  
  // Criar contato com metadata incluindo protocolo
  const contact = await this.findOrCreateContact({
    phoneNumber: normalizedMessage.from.phoneNumber,
    name: normalizedMessage.from.name,
    projectId,
    metadata: {
      lastMessageAt: normalizedMessage.timestamp.toISOString(),
      lastMessageContent: normalizedMessage.content.text,
      platform: 'whatsapp',
      protocolNumber,
      isProtocol,
      conversionSource: normalizedMessage.context?.metadata?.conversionSource,
    },
  })
  
  // ... resto do processamento
}
```

### **5. Adicionar Suporte a Conversion Source**

O `conversionSource` pode ser usado para rastreamento de campanhas:

```typescript
// Salvar conversionSource no contato ou em evento separado
// Pode ser usado para atribuição de conversões
```

---

## 📝 Checklist de Implementação

### **Fase 1: Atualização de Tipos**
- [ ] Atualizar `UazapiWebhookData` para formato real
- [ ] Adicionar tipos para `conversionSource` e `externalAdReply`
- [ ] Adicionar tipos para protocolo invisível

### **Fase 2: Atualização do Broker**
- [ ] Implementar `extractProtocol()` no `UazapiBroker`
- [ ] Implementar `fetchProfileName()` no `UazapiBroker`
- [ ] Atualizar `normalizeWebhookData()` para formato real
- [ ] Adicionar mapeamento de tipos de mensagem
- [ ] Extrair `conversionSource` do `contextInfo`

### **Fase 3: Atualização do Handler**
- [ ] Adicionar validação de mensagens ignoradas
- [ ] Melhorar tratamento de erros
- [ ] Adicionar logs estruturados

### **Fase 4: Atualização do Processor**
- [ ] Suportar protocolo invisível no metadata
- [ ] Suportar `conversionSource` no metadata
- [ ] Salvar dados de campanha quando disponível

### **Fase 5: Testes**
- [ ] Testar webhook com payload real
- [ ] Testar extração de protocolo
- [ ] Testar busca de nome via API
- [ ] Testar ignorar mensagens de erro
- [ ] Testar `conversionSource`

---

## 🔒 Segurança

### **Melhorias Necessárias**

1. **Validação de Assinatura**
   - Implementar `validateWebhookSignature()` no `UazapiBroker`
   - Validar assinatura antes de processar

2. **Rate Limiting**
   - Limitar requisições por conta
   - Prevenir abuso

3. **Validação de Origem**
   - Whitelist de IPs (opcional)
   - Validar `owner` e `token` correspondem à conta

---

## 📊 Comparação Final

| Aspecto | v1 (Xano) | v2 (Supabase) |
|---------|-----------|---------------|
| **Arquitetura** | Monolítica | Modular (brokers) |
| **Normalização** | Manual | Automática |
| **Extensibilidade** | Baixa | Alta |
| **Manutenibilidade** | Média | Alta |
| **Testabilidade** | Baixa | Alta |
| **Segurança** | Básica | Robusta (planejado) |
| **Persistência** | Xano | Supabase |
| **Protocolo Invisível** | ✅ | ⏳ (a implementar) |
| **Busca de Nome** | ✅ | ⏳ (a implementar) |
| **Conversion Source** | ✅ | ⏳ (a implementar) |

---

## ✅ Conclusão

A arquitetura v2 é **superior** à v1 em todos os aspectos, mas precisa implementar as funcionalidades específicas que a v1 tinha:

1. ✅ **Extração de protocolo invisível** → Implementar no `UazapiBroker`
2. ✅ **Busca de nome via API** → Implementar `fetchProfileName()`
3. ✅ **Suporte a `conversionSource`** → Extrair do `contextInfo`
4. ✅ **Ignorar mensagens de erro** → Adicionar validação no handler

**Próximos Passos:**
1. Atualizar tipos do UAZAPI
2. Implementar funcionalidades faltantes no `UazapiBroker`
3. Testar com payload real
4. Adicionar validação de assinatura

---

**Status**: 🟡 **Parcialmente Implementado**  
**Prioridade**: 🔴 **Alta** (funcionalidades críticas faltando)
