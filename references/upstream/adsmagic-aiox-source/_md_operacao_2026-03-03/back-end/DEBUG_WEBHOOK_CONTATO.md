# 🔍 Diagnóstico: Webhook não salvando contato

## Problema
Webhook retorna 200 mas contato não é salvo no banco.

## Dados do Teste
```json
{
  "token": "8e07a063-8c01-40ea-84c4-eee536d53cd5",
  "EventType": "messages",
  "message": {
    "chatid": "554791662434@s.whatsapp.net",
    "text": "Veja esta imagem",
    "fromMe": false,
    "isGroup": false,
    "messageType": "ImageMessage",
    "senderName": "João Silva",
    "messageTimestamp": 1642684800
  }
}
```

## Análise do Fluxo

### 1. Conta encontrada ✅
- Token: `8e07a063-8c01-40ea-84c4-eee536d53cd5`
- Account ID: `f83b9379-7844-4c42-91f9-cefe30cd3b74`
- Status: `active`
- Project ID: `063d5989-1d9f-444b-8391-3f79bc31de8f`

### 2. Normalização do chatid
- Input: `"554791662434@s.whatsapp.net"`
- Esperado:
  - countryCode: `"55"`
  - phone: `"4791662434"`
  - JID: `"554791662434@s.whatsapp.net"`

### 3. Pontos de falha possíveis

#### A. Extração do phoneNumber no UazapiBroker
**Arquivo**: `brokers/uazapi/UazapiBroker.ts` (linha 272-275)

```typescript
const phoneNumber = normalized.normalizedPhone?.phone ||
                   message.chatid
                     .replace('@s.whatsapp.net', '')
                     .replace('@c.us', '')
```

**Problema potencial**: Se `normalized.normalizedPhone?.phone` for `undefined`, o fallback extrai `"554791662434"` (com country code), mas o `processor.processMessage` espera apenas o número.

#### B. Processamento no WhatsAppProcessor
**Arquivo**: `core/processor.ts` (linha 88-90)

```typescript
const phoneMatch = params.phoneNumber.match(/^(\d{1,3})(\d{8,15})$/)
const countryCode = phoneMatch ? phoneMatch[1] : '55'
const phone = phoneMatch ? phoneMatch[2] : params.phoneNumber.replace(/^\d{1,3}/, '')
```

**Problema potencial**: 
- Se `phoneNumber = "554791662434"`, a regex pode extrair:
  - countryCode: `"55"` ou `"554"` (dependendo do regex)
  - phone: `"4791662434"` ou `"791662434"` (dependendo do regex)

#### C. Busca de contato existente
**Arquivo**: `core/processor.ts` (linha 93-99)

```typescript
const { data: existingContact } = await this.supabaseClient
  .from('contacts')
  .select('*')
  .eq('project_id', params.projectId)
  .eq('phone', phone)
  .eq('country_code', countryCode)
  .single()
```

**Problema**: Se a extração do countryCode/phone estiver incorreta, não encontra o contato e tenta criar um novo, mas pode falhar se:
- Não existir estágio no projeto
- Não existir origem "WhatsApp"

## 🔧 Solução Imediata

### Verificar no banco:
1. Existe estágio ativo para o projeto?
   ```sql
   SELECT * FROM stages 
   WHERE project_id = '063d5989-1d9f-444b-8391-3f79bc31de8f' 
   AND is_active = true;
   ```

2. Existe origem "WhatsApp" para o projeto?
   ```sql
   SELECT * FROM origins 
   WHERE project_id = '063d5989-1d9f-444b-8391-3f79bc31de8f' 
   AND name = 'WhatsApp';
   ```

### Adicionar logs detalhados
Adicionar logs em:
1. `webhook-processor.ts` - após normalização
2. `UazapiBroker.ts` - após extração de phoneNumber
3. `processor.ts` - antes/depois de buscar/criar contato
4. `ContactOriginService.ts` - antes/depois de criar contato

## 📝 Próximos Passos

1. ✅ Verificar se estágios e origens existem no banco
2. ✅ Adicionar logs mais detalhados nos pontos críticos
3. ✅ Testar webhook novamente e verificar logs
4. ✅ Corrigir extração de telefone se necessário
