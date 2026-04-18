# 🔌 Guia: Como Adicionar um Novo Broker de Mensageria

**Versão**: 1.0  
**Data**: 2025-01-28  
**Autor**: Equipe Backend  
**Status**: Documentação Atualizada

---

## 🎯 Visão Geral

Este guia explica passo a passo como adicionar um novo broker de mensageria ao sistema. O sistema foi projetado para ser modular, permitindo adicionar novos brokers sem modificar código existente.

### Princípios
- ✅ **Modularidade**: Cada broker é um módulo independente
- ✅ **Normalização**: Todos os brokers normalizam dados para formato padrão
- ✅ **Extensibilidade**: Fácil adicionar novos brokers seguindo a interface
- ✅ **Manutenibilidade**: Código limpo seguindo SOLID

---

## 📋 Pré-requisitos

Antes de começar, você precisa:
- ✅ Entender a arquitetura do sistema (ver `WHATSAPP_BROKERS_ARCHITECTURE.md`)
- ✅ Conhecer a interface `IWhatsAppBroker`
- ✅ Ter acesso à documentação da API do broker que deseja integrar
- ✅ Ter credenciais de teste do broker

---

## 🚀 Passo a Passo

### Passo 1: Criar Estrutura de Pastas

Crie a estrutura de pastas para o novo broker:

```
back-end/supabase/functions/messaging/
├── brokers/
│   └── [nome-do-broker]/
│       ├── [NomeBroker]Broker.ts    # Classe principal do broker
│       ├── types.ts                 # Tipos específicos do broker
│       └── utils.ts                 # Utilitários específicos (opcional)
```

**Exemplo para Evolution API:**
```
back-end/supabase/functions/messaging/
├── brokers/
│   └── evolution/
│       ├── EvolutionBroker.ts
│       ├── types.ts
│       └── utils.ts
```

---

### Passo 2: Definir Tipos Específicos do Broker

Crie o arquivo `types.ts` com os tipos específicos do broker:

```typescript
/**
 * Tipos específicos do Evolution API Broker
 */

export interface EvolutionWebhookData {
  event: string
  instance: string
  data: {
    key: {
      remoteJid: string
      fromMe: boolean
      id: string
    }
    message: {
      conversation?: string
      imageMessage?: {
        url: string
        caption?: string
      }
      videoMessage?: {
        url: string
        caption?: string
      }
    }
    messageTimestamp: number
    pushName?: string
  }
}

export interface EvolutionSendMessageResponse {
  key: {
    remoteJid: string
    fromMe: boolean
    id: string
  }
  message: {
    conversation?: string
  }
}

export interface EvolutionConnectionStatus {
  state: 'open' | 'close' | 'connecting'
  instance: string
}
```

---

### Passo 3: Implementar a Classe do Broker

Crie a classe do broker estendendo `BaseWhatsAppBroker`:

```typescript
/**
 * Broker Evolution API
 * https://doc.evolution-api.com
 */

import { BaseWhatsAppBroker } from '../base/WhatsAppBroker.ts'
import type {
  BrokerConfig,
  SendTextParams,
  SendMediaParams,
  SendTemplateParams,
  SendMessageResult,
  NormalizedWebhookData,
  ConnectionStatus,
  AccountInfo,
  ValidationResult,
} from '../../types.ts'
import type {
  EvolutionWebhookData,
  EvolutionSendMessageResponse,
  EvolutionConnectionStatus,
} from './types.ts'

export class EvolutionBroker extends BaseWhatsAppBroker {
  readonly brokerId = 'evolution'
  readonly brokerName = 'Evolution API'
  readonly brokerType = 'unofficial' // ou 'official' ou 'intermediary'
  
  private readonly apiUrl: string
  private readonly apiKey: string
  private readonly instanceName: string
  
  constructor(config: BrokerConfig, accountId: string) {
    super(config, accountId)
    this.apiUrl = config.apiBaseUrl || 'https://evolution-api.com'
    this.apiKey = config.apiKey!
    this.instanceName = config.instanceId!
  }
  
  /**
   * Envia mensagem de texto
   */
  async sendTextMessage(params: SendTextParams): Promise<SendMessageResult> {
    try {
      const response = await this.makeRequest(
        `${this.apiUrl}/message/sendText/${this.instanceName}`,
        {
          method: 'POST',
          headers: {
            'apikey': this.apiKey,
            'Content-Type': 'application/json',
          },
          body: {
            number: params.to,
            text: params.text,
          },
        }
      ) as EvolutionSendMessageResponse
      
      return {
        messageId: response.key.id,
        status: 'sent',
        timestamp: new Date(),
      }
    } catch (error) {
      return {
        messageId: '',
        status: 'failed',
        timestamp: new Date(),
        error: this.handleError(error).message,
      }
    }
  }
  
  /**
   * Envia mensagem com mídia
   */
  async sendMediaMessage(params: SendMediaParams): Promise<SendMessageResult> {
    try {
      const endpoint = this.getMediaEndpoint(params.type)
      const response = await this.makeRequest(
        `${this.apiUrl}/${endpoint}/${this.instanceName}`,
        {
          method: 'POST',
          headers: {
            'apikey': this.apiKey,
            'Content-Type': 'application/json',
          },
          body: {
            number: params.to,
            mediaUrl: params.mediaUrl,
            caption: params.caption,
            fileName: params.fileName,
          },
        }
      ) as EvolutionSendMessageResponse
      
      return {
        messageId: response.key.id,
        status: 'sent',
        timestamp: new Date(),
      }
    } catch (error) {
      return {
        messageId: '',
        status: 'failed',
        timestamp: new Date(),
        error: this.handleError(error).message,
      }
    }
  }
  
  /**
   * Normaliza dados do webhook para formato padrão
   */
  async normalizeWebhookData(rawData: unknown): Promise<NormalizedWebhookData> {
    const data = rawData as EvolutionWebhookData
    
    // Verificar tipo de evento
    if (data.event === 'messages.upsert') {
      const message = data.data
      const remoteJid = message.key.remoteJid
      const isGroup = remoteJid.includes('@g.us')
      
      return {
        eventType: 'message',
        message: {
          messageId: message.key.id,
          externalMessageId: message.key.id,
          brokerId: this.brokerId,
          accountId: this.accountId,
          from: {
            phoneNumber: remoteJid.split('@')[0],
            name: message.pushName,
          },
          to: {
            phoneNumber: this.config.accountName,
            accountName: this.config.accountName,
          },
          content: this.normalizeMessageContent(message.message),
          timestamp: new Date(message.messageTimestamp * 1000),
          status: 'delivered',
          isGroup,
          groupId: isGroup ? remoteJid : undefined,
        },
        timestamp: new Date(),
        rawData: data,
      }
    }
    
    // Outros tipos de eventos (status, connection, etc)
    return {
      eventType: 'status',
      timestamp: new Date(),
      rawData: data,
    }
  }
  
  /**
   * Verifica status da conexão
   */
  async getConnectionStatus(): Promise<ConnectionStatus> {
    try {
      const response = await this.makeRequest(
        `${this.apiUrl}/instance/fetchInstances`,
        {
          method: 'GET',
          headers: {
            'apikey': this.apiKey,
          },
        }
      ) as EvolutionConnectionStatus[]
      
      const instance = response.find((i) => i.instance === this.instanceName)
      
      if (!instance) {
        return {
          connected: false,
          error: 'Instance not found',
        }
      }
      
      return {
        connected: instance.state === 'open',
        lastConnectedAt: new Date(),
      }
    } catch (error) {
      return {
        connected: false,
        error: this.handleError(error).message,
      }
    }
  }
  
  /**
   * Obtém informações da conta
   */
  async getAccountInfo(): Promise<AccountInfo> {
    try {
      const response = await this.makeRequest(
        `${this.apiUrl}/instance/fetchInstances/${this.instanceName}`,
        {
          method: 'GET',
          headers: {
            'apikey': this.apiKey,
          },
        }
      ) as { instance: { instanceName: string; state: string } }
      
      return {
        phoneNumber: response.instance.instanceName,
        name: response.instance.instanceName,
        status: response.instance.state === 'open' ? 'active' : 'inactive',
      }
    } catch (error) {
      throw new Error(`Failed to get account info: ${this.handleError(error).message}`)
    }
  }
  
  /**
   * Valida configuração do broker
   */
  async validateConfiguration(config: BrokerConfig): Promise<ValidationResult> {
    const errors: string[] = []
    
    if (!config.apiKey) {
      errors.push('apiKey é obrigatório')
    }
    
    if (!config.instanceId) {
      errors.push('instanceId é obrigatório')
    }
    
    if (errors.length > 0) {
      return {
        valid: false,
        errors,
      }
    }
    
    return { valid: true }
  }
  
  // Métodos auxiliares privados
  
  private normalizeMessageContent(message: EvolutionWebhookData['data']['message']) {
    if (message.conversation) {
      return {
        type: 'text' as const,
        text: message.conversation,
      }
    }
    
    if (message.imageMessage) {
      return {
        type: 'image' as const,
        mediaUrl: message.imageMessage.url,
        caption: message.imageMessage.caption,
      }
    }
    
    if (message.videoMessage) {
      return {
        type: 'video' as const,
        mediaUrl: message.videoMessage.url,
        caption: message.videoMessage.caption,
      }
    }
    
    // Outros tipos de mídia...
    
    return {
      type: 'text' as const,
      text: '',
    }
  }
  
  private getMediaEndpoint(type: string): string {
    const endpoints: Record<string, string> = {
      image: 'message/sendMedia',
      video: 'message/sendMedia',
      audio: 'message/sendWhatsAppAudio',
      document: 'message/sendMedia',
    }
    
    return endpoints[type] || 'message/sendMedia'
  }
}
```

---

### Passo 4: Registrar o Broker no Factory

Edite o arquivo `WhatsAppBrokerFactory.ts` e adicione o novo broker:

```typescript
// back-end/supabase/functions/messaging/brokers/WhatsAppBrokerFactory.ts

import { UazapiBroker } from './uazapi/UazapiBroker.ts'
import { OfficialWhatsAppBroker } from './official/OfficialWhatsAppBroker.ts'
import { GupshupBroker } from './gupshup/GupshupBroker.ts'
import { EvolutionBroker } from './evolution/EvolutionBroker.ts' // ← Adicionar import

export class WhatsAppBrokerFactory {
  private static brokers: Map<string, new (config: BrokerConfig, accountId: string) => IWhatsAppBroker> = new Map([
    ['uazapi', UazapiBroker],
    ['official_whatsapp', OfficialWhatsAppBroker],
    ['gupshup', GupshupBroker],
    ['evolution', EvolutionBroker], // ← Adicionar registro
  ])
  
  // ... resto do código
}
```

---

### Passo 5: Adicionar Seed no Banco de Dados

Crie uma migration para adicionar o broker ao banco:

```sql
-- Migration: Add Evolution API Broker
-- Arquivo: back-end/supabase/migrations/XXX_add_evolution_broker.sql

INSERT INTO messaging_brokers (
  name,
  display_name,
  platform,
  broker_type,
  description,
  is_active,
  api_base_url,
  auth_type,
  required_fields,
  optional_fields,
  max_connections,
  supports_media,
  supports_templates,
  supports_webhooks,
  supports_automation,
  documentation_url
) VALUES (
  'evolution',
  'Evolution API',
  'whatsapp',
  'api',
  'Broker não oficial para WhatsApp usando Evolution API',
  true,
  'https://evolution-api.com',
  'api_key',
  ARRAY['api_key', 'instance_id'],
  ARRAY['api_base_url'],
  1,
  true,
  false,
  true,
  false,
  'https://doc.evolution-api.com'
) ON CONFLICT (name) DO NOTHING;
```

---

### Passo 6: Implementar Validação de Webhook (Opcional)

Se o broker suporta validação de assinatura, implemente no handler:

```typescript
// Adicionar método de validação no broker
async validateWebhookSignature(
  rawBody: string,
  signature: string,
  secret: string
): Promise<boolean> {
  // Implementar lógica de validação específica do broker
  // Exemplo: Evolution API pode usar HMAC-SHA256
  const crypto = await import('https://deno.land/std@0.168.0/crypto/mod.ts')
  const expectedSignature = await crypto.hmac(
    'sha256',
    secret,
    rawBody
  )
  
  return signature === expectedSignature
}
```

---

### Passo 7: Criar Testes (Recomendado)

Crie testes unitários para o novo broker:

```typescript
// back-end/supabase/functions/messaging/brokers/evolution/EvolutionBroker.test.ts

import { assertEquals, assertExists } from 'https://deno.land/std@0.168.0/testing/asserts.ts'
import { EvolutionBroker } from './EvolutionBroker.ts'

Deno.test('EvolutionBroker - normalizeWebhookData', async () => {
  const broker = new EvolutionBroker(
    {
      apiKey: 'test-key',
      instanceId: 'test-instance',
      accountName: 'Test Account',
    },
    'account-123'
  )
  
  const rawData = {
    event: 'messages.upsert',
    instance: 'test-instance',
    data: {
      key: {
        remoteJid: '5511999999999@s.whatsapp.net',
        fromMe: false,
        id: 'msg-123',
      },
      message: {
        conversation: 'Olá!',
      },
      messageTimestamp: 1642684800,
      pushName: 'João Silva',
    },
  }
  
  const normalized = await broker.normalizeWebhookData(rawData)
  
  assertEquals(normalized.eventType, 'message')
  assertExists(normalized.message)
  assertEquals(normalized.message?.from.phoneNumber, '5511999999999')
  assertEquals(normalized.message?.content.text, 'Olá!')
})
```

---

### Passo 8: Documentar o Broker

Adicione documentação do broker:

1. **Atualizar `WHATSAPP_BROKERS_ARCHITECTURE.md`**: Adicionar seção sobre o novo broker
2. **Atualizar `MESSAGING_API_DOCUMENTATION.md`**: Adicionar exemplos de webhook do novo broker
3. **Criar README específico** (opcional): `brokers/evolution/README.md`

---

## ✅ Checklist de Implementação

Antes de considerar o broker completamente implementado, verifique:

- [ ] Classe do broker implementada estendendo `BaseWhatsAppBroker`
- [ ] Todos os métodos obrigatórios implementados:
  - [ ] `sendTextMessage()`
  - [ ] `sendMediaMessage()`
  - [ ] `normalizeWebhookData()`
  - [ ] `getConnectionStatus()`
  - [ ] `getAccountInfo()`
  - [ ] `validateConfiguration()`
- [ ] Broker registrado no `WhatsAppBrokerFactory`
- [ ] Seed adicionado ao banco de dados
- [ ] Tipos específicos do broker definidos
- [ ] Validação de webhook implementada (se suportado)
- [ ] Testes unitários criados
- [ ] Documentação atualizada
- [ ] Testado com dados reais

---

## 🔍 Exemplo Completo: Evolution API

Veja a estrutura completa do broker Evolution API como referência:

```
back-end/supabase/functions/messaging/
├── brokers/
│   ├── evolution/
│   │   ├── EvolutionBroker.ts       ✅ Implementado
│   │   ├── types.ts                 ✅ Tipos definidos
│   │   ├── utils.ts                 ✅ Utilitários
│   │   └── README.md                ✅ Documentação
│   │
│   └── WhatsAppBrokerFactory.ts     ✅ Registrado
```

---

## 🚨 Problemas Comuns

### 1. Erro: "Broker não encontrado"
**Causa**: Broker não foi registrado no Factory  
**Solução**: Verificar se o broker está no `WhatsAppBrokerFactory.brokers` Map

### 2. Erro: "Invalid configuration"
**Causa**: Configuração do broker inválida  
**Solução**: Verificar `validateConfiguration()` e campos obrigatórios

### 3. Erro: "Failed to normalize webhook"
**Causa**: Estrutura do webhook diferente do esperado  
**Solução**: Verificar `normalizeWebhookData()` e adicionar tratamento de erros

### 4. Erro: "Service unavailable"
**Causa**: Falha na conexão com API do broker  
**Solução**: Verificar `makeRequest()` e tratamento de erros

---

## 📚 Referências

- **Arquitetura Completa**: `docs/WHATSAPP_BROKERS_ARCHITECTURE.md`
- **Documentação da API**: `docs/MESSAGING_API_DOCUMENTATION.md`
- **Brokers Existentes**: 
  - `brokers/uazapi/UazapiBroker.ts`
  - `brokers/official/OfficialWhatsAppBroker.ts`
  - `brokers/gupshup/GupshupBroker.ts`

---

## 🎯 Próximos Passos

Após implementar o broker:

1. **Testar em ambiente de desenvolvimento**
2. **Validar normalização de webhooks**
3. **Testar envio de mensagens**
4. **Validar criação automática de contatos**
5. **Adicionar testes de integração**
6. **Atualizar documentação**

---

**Última Atualização**: 2025-01-28

