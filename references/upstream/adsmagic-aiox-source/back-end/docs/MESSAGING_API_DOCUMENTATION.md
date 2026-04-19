# 📡 Documentação da API de Mensageria - Edge Function

**Versão**: 2.0  
**Data**: 2025-01-28  
**Autor**: Equipe Backend  
**Status**: Documentação Atualizada (Fase 5)  
**Base URL**: `/functions/v1/messaging`

**Última Atualização**: Implementação de webhooks globais e por conta (Fase 1-5)

---

## 🎯 Visão Geral

A Edge Function `messaging` fornece uma API unificada para gerenciar mensageria através de múltiplos brokers (UAZAPI, WhatsApp Business API, Gupshup, etc). O sistema normaliza dados de diferentes brokers para um formato padrão, facilitando a integração.

### Recursos Principais
- ✅ Recebimento de webhooks de múltiplos brokers
- ✅ Envio de mensagens através de qualquer broker configurado
- ✅ Verificação de status de contas de mensageria
- ✅ Sincronização de contatos
- ✅ Geração de QR Code para conexão (brokers não oficiais)
- ✅ Geração de Pair Code para conexão (brokers não oficiais)
- ✅ Verificação detalhada de status de conexão
- ✅ Normalização automática de dados
- ✅ Processamento automático de mensagens (criação de contatos)

---

## 🔐 Autenticação

### Endpoints que Requerem Autenticação
Todos os endpoints, **exceto** `/webhook`, requerem autenticação via JWT Bearer Token:

```http
Authorization: Bearer <JWT_TOKEN>
```

O token JWT deve ser obtido através do Supabase Auth. O sistema usa Row Level Security (RLS) para garantir que usuários só acessem dados de projetos aos quais têm permissão.

### Endpoints de Webhook

Os endpoints de webhook não requerem autenticação JWT padrão. A identificação da conta pode ser feita de duas formas:

**Método 1: Webhook Global** - `POST /messaging/webhook/{brokerType}`
- Identifica conta por **token no body** do webhook
- Usado para webhooks globais onde múltiplas instâncias compartilham o mesmo endpoint
- Exemplo: UAZAPI, Evolution

**Método 2: Webhook por Conta** - `POST /messaging/webhook/{brokerType}/{accountId}`
- Identifica conta por **UUID na URL**
- Usado quando cada conta tem sua própria URL de webhook
- Exemplo: Gupshup, WhatsApp Business API

**Legacy**: `POST /messaging/webhook` (deprecado, mantido para compatibilidade)
- Suporta ambos os métodos acima
- ⚠️ Use os novos endpoints específicos quando possível

**Nota**: A validação de assinatura de webhook está implementada e é validada automaticamente quando `webhook_secret` está configurado (ver seção de Segurança).

---

## 📋 Endpoints

### 1. **POST** `/messaging/webhook/{brokerType}` - Webhook Global

Recebe webhooks globais dos brokers. Identifica a conta pelo token no body do webhook.

**Rota**: `POST /messaging/webhook/{brokerType}`

**Brokers Suportados**: `uazapi`, `gupshup`, `official_whatsapp`, `evolution`

#### Headers
```http
Content-Type: application/json
```

#### Identificação da Conta

A conta é identificada automaticamente pelo **token no body** do webhook:
- Campo `token` no body do webhook
- O sistema busca a conta pelo `api_key` ou `access_token` correspondente
- Usado para webhooks globais onde múltiplas instâncias compartilham o mesmo endpoint

#### Request Body

O formato do body depende do broker. O sistema normaliza automaticamente para o formato padrão.

**Exemplo (UAZAPI):**
```json
{
  "token": "2bb07e81-dfe3-414b-8e43-695030cb1c44",
  "EventType": "messages",
  "message": {
    "chatid": "554791662434@s.whatsapp.net",
    "text": "Olá!",
    "fromMe": false,
    "isGroup": false,
    "messageType": "ExtendedTextMessage",
    "senderName": "João Silva",
    "messageTimestamp": 1642684800
  },
  "owner": "554796772041"
}
```

#### Response

**Sucesso (200)**: Resposta vazia (requisito de alguns brokers)
```http
HTTP/1.1 200 OK
Content-Length: 0
```

**Erro (400)**: Broker não suportado, body inválido, broker type mismatch
```json
{
  "error": "Broker não suportado: invalid_broker. Brokers suportados: uazapi, gupshup, official_whatsapp, evolution"
}
```

**Erro (404)**: Conta não encontrada
```json
{
  "error": "Conta não encontrada. Verifique se o token no body corresponde a uma conta ativa."
}
```

**Erro (429)**: Rate limit excedido
```http
HTTP/1.1 429 Too Many Requests
Retry-After: 60
X-RateLimit-Limit: 200
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1642684860
```

---

### 2. **POST** `/messaging/webhook/{brokerType}/{accountId}` - Webhook por Conta

Recebe webhooks específicos por conta. Identifica a conta pelo UUID na URL.

**Rota**: `POST /messaging/webhook/{brokerType}/{accountId}`

**Brokers Suportados**: `uazapi`, `gupshup`, `official_whatsapp`, `evolution`

#### Headers
```http
Content-Type: application/json
```

#### Parâmetros da URL

- `brokerType`: Tipo do broker (`uazapi`, `gupshup`, `official_whatsapp`, `evolution`)
- `accountId`: UUID da conta de mensageria (`messaging_accounts.id`)

#### Identificação da Conta

A conta é identificada pelo **UUID na URL**:
- UUID da conta (`messaging_accounts.id`)
- Validação automática de formato UUID v4
- Validação de que o broker type corresponde ao da conta

#### Request Body

O formato do body depende do broker. O sistema normaliza automaticamente para o formato padrão.

**Exemplo (Gupshup):**
```json
{
  "message": {
    "from": "5511999999999",
    "text": "Olá!",
    "timestamp": 1642684800
  }
}
```

#### Response

**Sucesso (200)**: Resposta vazia (requisito de alguns brokers)
```http
HTTP/1.1 200 OK
Content-Length: 0
```

**Erro (400)**: UUID inválido, broker não suportado, broker type mismatch, conta inativa
```json
{
  "error": "Formato de UUID inválido: invalid-uuid. O UUID deve estar no formato: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx"
}
```

**Erro (404)**: Conta não encontrada
```json
{
  "error": "Conta não encontrada com ID: 550e8400-e29b-41d4-a716-446655440000"
}
```

**Erro (429)**: Rate limit excedido
```http
HTTP/1.1 429 Too Many Requests
Retry-After: 60
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1642684860
```

---

### 3. **POST** `/messaging/webhook` - Legacy (Deprecado)

⚠️ **Este endpoint está deprecado**. Use `/messaging/webhook/{brokerType}` ou `/messaging/webhook/{brokerType}/{accountId}`.

Recebe webhooks dos brokers e processa mensagens automaticamente.

#### Headers
```http
Content-Type: application/json
x-account-id: <UUID_DA_CONTA> (opcional - se não fornecido, usa token no body)
```

#### Identificação da Conta

O sistema identifica a conta de duas formas (em ordem de prioridade):

1. **Por Header** (Webhook Específico):
   - Header `x-account-id` com UUID da conta
   - Usado quando cada conta tem seu próprio webhook

2. **Por Token no Body** (Webhook Global):
   - Campo `token` no body do webhook
   - O sistema busca a conta pelo `api_key` ou `access_token` correspondente
   - Usado para webhooks globais (ex: UAZAPI) onde múltiplas instâncias compartilham o mesmo endpoint

#### Request Body
O formato do body depende do broker. O sistema normaliza automaticamente para o formato padrão.

**Exemplo (UAZAPI - Webhook Global):**
```json
{
  "token": "2bb07e81-dfe3-414b-8e43-695030cb1c44",
  "EventType": "messages",
  "message": {
    "chatid": "554791662434@s.whatsapp.net",
    "text": "Olá!",
    "fromMe": false,
    "isGroup": false,
    "messageType": "ExtendedTextMessage",
    "senderName": "João Silva",
    "messageTimestamp": 1642684800
  },
  "owner": "554796772041"
}
```

**Nota**: O campo `token` identifica qual conta processar o webhook. O sistema busca a conta pelo `api_key` ou `access_token` correspondente.

**Exemplo (WhatsApp Business API):**
```json
{
  "entry": [{
    "id": "WHATSAPP_BUSINESS_ACCOUNT_ID",
    "changes": [{
      "value": {
        "messaging_product": "whatsapp",
        "metadata": {
          "display_phone_number": "5511999999999",
          "phone_number_id": "PHONE_NUMBER_ID"
        },
        "messages": [{
          "from": "5511999999999",
          "id": "wamid.xxx",
          "timestamp": "1642684800",
          "text": {
            "body": "Olá!"
          },
          "type": "text"
        }]
      },
      "field": "messages"
    }]
  }]
}
```

#### Response

**Sucesso (200 OK):**
```json
{
  "success": true,
  "data": {
    "processed": true
  }
}
```

**Erro (400 Bad Request):**
```json
{
  "success": false,
  "error": "Body da requisição é obrigatório"
}
```

**Erro (404 Not Found):**
```json
{
  "success": false,
  "error": "Conta não encontrada. Verifique x-account-id header ou token no body."
}
```

**Nota**: O erro 404 ocorre quando:
- Header `x-account-id` não existe E token não está no body, OU
- Conta não foi encontrada pelo ID fornecido no header, OU
- Conta não foi encontrada pelo token fornecido no body

**Erro (500 Internal Server Error):**
```json
{
  "success": false,
  "error": "Erro ao processar webhook"
}
```

#### Comportamento
1. O webhook é recebido e validado
2. A conta é identificada através do `x-account-id`
3. O broker específico normaliza os dados para o formato padrão
4. A mensagem normalizada é processada:
   - Cria ou busca contato automaticamente
   - Registra a mensagem
   - Atualiza estatísticas da conta
5. Retorna sucesso ou erro

---

### 2. **POST** `/messaging/send`

Envia uma mensagem através de um broker configurado.

#### Headers
```http
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>
```

#### Request Body
```json
{
  "accountId": "uuid-da-conta",
  "to": "5511999999999",
  "text": "Olá! Esta é uma mensagem de teste.",
  "mediaUrl": "https://example.com/image.jpg", // Opcional
  "mediaType": "image", // Opcional: "image" | "video" | "audio" | "document"
  "caption": "Legenda da imagem", // Opcional
  "templateName": "welcome_template", // Opcional (para WhatsApp Business API)
  "templateLanguage": "pt", // Opcional
  "templateParameters": ["João"] // Opcional
}
```

#### Validações
- `accountId`: UUID válido (obrigatório)
- `to`: Número de telefone não vazio (obrigatório)
- Pelo menos um dos campos deve estar presente: `text`, `mediaUrl` ou `templateName`

#### Response

**Sucesso (200 OK):**
```json
{
  "success": true,
  "data": {
    "messageId": "msg_123456789",
    "status": "sent",
    "timestamp": "2025-01-28T12:00:00.000Z"
  }
}
```

**Erro (400 Bad Request):**
```json
{
  "success": false,
  "error": "Validation failed",
  "errors": [
    "accountId: Invalid account ID format",
    "to: Destination phone number is required"
  ]
}
```

**Erro (401 Unauthorized):**
```json
{
  "success": false,
  "error": "Authentication required"
}
```

**Erro (403 Forbidden):**
```json
{
  "success": false,
  "error": "Acesso negado ao projeto"
}
```

**Erro (404 Not Found):**
```json
{
  "success": false,
  "error": "Conta não encontrada"
}
```

**Erro (500 Internal Server Error):**
```json
{
  "success": false,
  "error": "Erro ao enviar mensagem"
}
```

#### Exemplos de Uso

**Enviar mensagem de texto:**
```bash
curl -X POST https://your-project.supabase.co/functions/v1/messaging/send \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "accountId": "uuid-da-conta",
    "to": "5511999999999",
    "text": "Olá! Como posso ajudar?"
  }'
```

**Enviar imagem:**
```bash
curl -X POST https://your-project.supabase.co/functions/v1/messaging/send \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "accountId": "uuid-da-conta",
    "to": "5511999999999",
    "mediaUrl": "https://example.com/product.jpg",
    "mediaType": "image",
    "caption": "Confira nosso novo produto!"
  }'
```

**Enviar template (WhatsApp Business API):**
```bash
curl -X POST https://your-project.supabase.co/functions/v1/messaging/send \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "accountId": "uuid-da-conta",
    "to": "5511999999999",
    "templateName": "welcome_template",
    "templateLanguage": "pt",
    "templateParameters": ["João"]
  }'
```

---

### 3. **GET** `/messaging/status/:accountId`

Obtém o status atual de uma conta de mensageria.

#### Headers
```http
Authorization: Bearer <JWT_TOKEN>
```

#### Path Parameters
- `accountId`: UUID da conta de mensageria

#### Response

**Sucesso (200 OK):**
```json
{
  "success": true,
  "data": {
    "accountId": "uuid-da-conta",
    "status": "active",
    "connected": true,
    "lastMessageAt": "2025-01-28T11:30:00.000Z",
    "totalMessages": 150,
    "totalContacts": 45
  }
}
```

**Campos da Resposta:**
- `accountId`: UUID da conta
- `status`: Status da conta (`active` | `inactive` | `suspended` | `connecting` | `disconnected`)
- `connected`: Indica se a conta está conectada ao broker (verificação em tempo real)
- `lastMessageAt`: Data/hora da última mensagem enviada/recebida
- `totalMessages`: Total de mensagens processadas
- `totalContacts`: Total de contatos únicos

**Erro (401 Unauthorized):**
```json
{
  "success": false,
  "error": "Authentication required"
}
```

**Erro (403 Forbidden):**
```json
{
  "success": false,
  "error": "Acesso negado ao projeto"
}
```

**Erro (404 Not Found):**
```json
{
  "success": false,
  "error": "Conta não encontrada"
}
```

**Erro (500 Internal Server Error):**
```json
{
  "success": false,
  "error": "Erro ao obter status"
}
```

#### Exemplo de Uso

```bash
curl -X GET https://your-project.supabase.co/functions/v1/messaging/status/uuid-da-conta \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 4. **POST** `/messaging/sync-contacts/:accountId`

Sincroniza informações da conta de mensageria com o broker.

#### Headers
```http
Authorization: Bearer <JWT_TOKEN>
```

#### Path Parameters
- `accountId`: UUID da conta de mensageria

#### Request Body
Não requer body (vazio).

#### Response

**Sucesso (200 OK):**
```json
{
  "success": true,
  "data": {
    "success": true,
    "accountInfo": {
      "phoneNumber": "5511999999999",
      "name": "Conta WhatsApp",
      "status": "active"
    }
  }
}
```

**Erro (401 Unauthorized):**
```json
{
  "success": false,
  "error": "Authentication required"
}
```

**Erro (403 Forbidden):**
```json
{
  "success": false,
  "error": "Acesso negado ao projeto"
}
```

**Erro (404 Not Found):**
```json
{
  "success": false,
  "error": "Conta não encontrada"
}
```

**Erro (500 Internal Server Error):**
```json
{
  "success": false,
  "error": "Erro ao sincronizar contatos"
}
```

#### Comportamento
1. Obtém informações atualizadas da conta do broker
2. Atualiza o registro da conta no banco de dados
3. Retorna informações sincronizadas

#### Exemplo de Uso

```bash
curl -X POST https://your-project.supabase.co/functions/v1/messaging/sync-contacts/uuid-da-conta \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 5. **GET** `/messaging/qrcode/:accountId`

Gera QR Code para conexão de conta de mensageria (brokers não oficiais como UAZAPI).

**⚠️ Disponível apenas para brokers não oficiais** (UAZAPI, Evolution, etc.)

#### Headers
```http
Authorization: Bearer <JWT_TOKEN>
```

#### Path Parameters
- `accountId`: UUID da conta de mensageria

#### Response

**Sucesso (200 OK):**
```json
{
  "success": true,
  "data": {
    "qrCode": "data:image/png;base64,iVBORw0KG...",
    "code": "ABC-123-DEF",
    "expiresAt": "2025-01-28T12:00:40.000Z",
    "instanceId": "instance_123",
    "status": "generated",
    "message": "Escaneie o QR Code com seu WhatsApp para conectar"
  }
}
```

**Erro (400 Bad Request):**
```json
{
  "success": false,
  "error": "QR Code só está disponível para brokers não oficiais"
}
```

**Erro (404 Not Found):**
```json
{
  "success": false,
  "error": "Conta não encontrada"
}
```

#### Comportamento
1. Gera QR Code através do broker
2. Atualiza status da conta para "connecting"
3. Retorna QR Code em base64 e informações de expiração
4. QR Code expira em ~40 segundos (padrão WhatsApp)

#### Exemplo de Uso

```bash
curl -X GET https://your-project.supabase.co/functions/v1/messaging/qrcode/uuid-da-conta \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 6. **GET** `/messaging/paircode/:accountId`

Gera Pair Code para conexão de conta de mensageria (brokers não oficiais como UAZAPI).

**⚠️ Disponível apenas para brokers não oficiais** (UAZAPI, Evolution, etc.)

Pair Code é uma alternativa ao QR Code - o usuário insere o código manualmente no WhatsApp.

#### Headers
```http
Authorization: Bearer <JWT_TOKEN>
```

#### Path Parameters
- `accountId`: UUID da conta de mensageria

#### Response

**Sucesso (200 OK):**
```json
{
  "success": true,
  "data": {
    "code": "ABC-123-DEF-456",
    "expiresAt": "2025-01-28T12:02:00.000Z",
    "instanceId": "instance_123",
    "status": "generated",
    "message": "Insira este código no WhatsApp: Configurações > Aparelhos conectados > Conectar um aparelho"
  }
}
```

**Erro (400 Bad Request):**
```json
{
  "success": false,
  "error": "Pair Code só está disponível para brokers não oficiais"
}
```

**Erro (404 Not Found):**
```json
{
  "success": false,
  "error": "Conta não encontrada"
}
```

#### Comportamento
1. Gera Pair Code através do broker
2. Atualiza status da conta para "connecting"
3. Retorna código e informações de expiração
4. Pair Code expira em ~2 minutos

#### Exemplo de Uso

```bash
curl -X GET https://your-project.supabase.co/functions/v1/messaging/paircode/uuid-da-conta \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 7. **GET** `/messaging/connection-status/:accountId`

Verifica status detalhado de conexão da conta de mensageria.

Retorna informações sobre conexão, número de telefone conectado, QR Code ativo (se houver), etc.

#### Headers
```http
Authorization: Bearer <JWT_TOKEN>
```

#### Path Parameters
- `accountId`: UUID da conta de mensageria

#### Response

**Sucesso (200 OK):**
```json
{
  "success": true,
  "data": {
    "instanceId": "instance_123",
    "connected": true,
    "status": "connected",
    "phoneNumber": "5511999999999",
    "message": "Conectado com sucesso"
  }
}
```

**Status "connecting" (200 OK):**
```json
{
  "success": true,
  "data": {
    "instanceId": "instance_123",
    "connected": false,
    "status": "connecting",
    "qrCode": "data:image/png;base64,...",
    "pairCode": "ABC-123-DEF",
    "message": "Aguardando conexão"
  }
}
```

**Erro (404 Not Found):**
```json
{
  "success": false,
  "error": "Conta não encontrada"
}
```

#### Valores de Status

| Status | Descrição |
|--------|-----------|
| `connected` | Instância conectada e pronta para uso |
| `disconnected` | Instância desconectada |
| `connecting` | Aguardando conexão (QR Code/Pair Code gerado) |
| `timeout` | Conexão expirada (QR Code/Pair Code expirou) |

#### Comportamento
1. Verifica status da conexão no broker
2. Obtém informações da conta (número de telefone, etc.)
3. Atualiza status da conta no banco se conectada
4. Retorna informações detalhadas de conexão

#### Exemplo de Uso

```bash
curl -X GET https://your-project.supabase.co/functions/v1/messaging/connection-status/uuid-da-conta \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🚨 Códigos de Erro

### Códigos HTTP

| Código | Significado | Descrição |
|--------|-------------|-----------|
| **200** | OK | Requisição bem-sucedida |
| **400** | Bad Request | Dados inválidos ou faltando |
| **401** | Unauthorized | Token de autenticação ausente ou inválido |
| **403** | Forbidden | Usuário não tem permissão para acessar o recurso |
| **404** | Not Found | Recurso não encontrado |
| **500** | Internal Server Error | Erro interno do servidor |
| **503** | Service Unavailable | Serviço externo indisponível |

### Mensagens de Erro Comuns

#### Validação
- `"Invalid account ID format"`: UUID da conta inválido
- `"Destination phone number is required"`: Número de telefone não fornecido
- `"At least one of text, mediaUrl, or templateName is required"`: Nenhum conteúdo fornecido

#### Autenticação
- `"Unauthorized: Missing Authorization header"`: Header de autorização ausente
- `"Unauthorized: Invalid token format"`: Formato do token inválido
- `"Unauthorized: Invalid or expired token"`: Token inválido ou expirado

#### Acesso
- `"Acesso negado ao projeto"`: Usuário não tem permissão para acessar o projeto

#### Recursos
- `"Conta não encontrada"`: Conta de mensageria não existe
- `"Broker não encontrado"`: Tipo de broker não suportado

#### Servidor
- `"Erro ao processar webhook"`: Erro ao processar webhook recebido
- `"Erro ao enviar mensagem"`: Erro ao enviar mensagem através do broker
- `"Service Unavailable: External service connection failed"`: Falha na conexão com serviço externo

---

## 🔒 Segurança

### Autenticação
- Todos os endpoints (exceto `/webhook`) requerem autenticação JWT
- O RLS garante isolamento de dados por projeto
- Usuários só podem acessar contas de projetos aos quais pertencem

### Webhooks
- ✅ **Implementado**: Identificação de conta por token (webhook global) ou UUID (webhook por conta)
- ✅ **Implementado**: Validação de assinatura de webhook quando `webhook_secret` configurado
  - UAZAPI: Validação via `x-signature`
  - WhatsApp Business API: Validação via `x-hub-signature-256`
  - Gupshup: Validação via `x-webhook-signature`
  - Genérico: Validação via `signature`

### Rate Limiting
- ✅ **Implementado**: Rate limiting automático por conta
  - Webhook Global: 200 requisições/minuto
  - Webhook por Conta: 100 requisições/minuto
- Headers HTTP padrão: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`, `Retry-After`

### Validação de Origem
- ⏳ **Planejado**: Validação de IP whitelist para webhooks (futuro)

---

## 📊 Formato Normalizado

Todas as mensagens são normalizadas para o seguinte formato padrão, independente do broker:

```typescript
interface NormalizedMessage {
  messageId: string
  externalMessageId: string
  brokerId: string
  accountId: string
  from: {
    phoneNumber: string
    name?: string
    profilePicture?: string
  }
  to: {
    phoneNumber: string
    accountName: string
  }
  content: {
    type: 'text' | 'image' | 'video' | 'audio' | 'document' | 'location' | 'contact'
    text?: string
    mediaUrl?: string
    caption?: string
    mimeType?: string
    fileName?: string
    location?: {
      latitude: number
      longitude: number
      name?: string
    }
  }
  timestamp: Date
  status: 'sent' | 'delivered' | 'read' | 'failed'
  isGroup: boolean
  groupId?: string
  groupName?: string
  context?: {
    quotedMessageId?: string
    metadata?: Record<string, unknown>
  }
}
```

---

## 🔄 Processamento Automático

### Quando uma mensagem é recebida via webhook:

1. **Normalização**: Dados do broker são normalizados para formato padrão
2. **Criação de Contato**: Sistema busca ou cria contato automaticamente
3. **Registro de Mensagem**: Mensagem é registrada no histórico
4. **Atualização de Estatísticas**: Contadores são atualizados
5. **Automações** (Futuro): Regras de automação são processadas

---

## 📝 Notas de Implementação

### Suportado
- ✅ Múltiplos brokers (UAZAPI, WhatsApp Business API, Gupshup)
- ✅ Normalização automática de dados
- ✅ Processamento de mensagens
- ✅ Envio de texto, mídia e templates
- ✅ Verificação de status em tempo real

### Implementado (v2.0)
- ✅ Webhooks globais e por conta
- ✅ Validação de assinatura de webhook
- ✅ Rate limiting por conta
- ✅ Resposta vazia 2xx (requisito de brokers)
- ✅ Logs estruturados com métricas
- ✅ Validações centralizadas

### Planejado
- ⏳ Validação de origem das requisições (IP whitelist)
- ⏳ Integração com sistema de automações
- ⏳ Integração com sistema de eventos

---

## 🔗 Referências

- **Arquitetura Completa**: `docs/WHATSAPP_BROKERS_ARCHITECTURE.md`
- **Schema do Banco**: `doc/database-schema.md`
- **Plano de Implementação**: `BACKEND_IMPLEMENTATION_PLAN.md` (Sessão 8.5)

---

**Última Atualização**: 2025-01-28

