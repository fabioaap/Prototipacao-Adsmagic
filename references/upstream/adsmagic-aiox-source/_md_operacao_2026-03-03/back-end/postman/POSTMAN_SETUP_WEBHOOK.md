# 📬 Guia de Configuração - Postman Collection para Webhooks

**Versão**: 2.0  
**Data**: 2025-01-28  
**Última Atualização**: 2025-12-12

---

## 📋 Visão Geral

Esta collection do Postman permite testar todos os endpoints de webhook do sistema de mensageria, incluindo:
- ✅ Diferentes brokers (UAZAPI, Gupshup, Official WhatsApp, Evolution)
- ✅ **Cenários de rastreamento de origem** (Meta Ads, Google Ads, TikTok Ads, UTMs)
- ✅ Validação de assinatura e rate limiting
- ✅ Cenários de erro e troubleshooting
- ✅ **Queries SQL para validação de origem e source_data JSONB**

---

## 🚀 Configuração Inicial

### **1. Importar Collection**

1. Abra o Postman
2. Clique em **Import** no canto superior esquerdo
3. Selecione o arquivo `Webhooks.postman_collection.json`
4. Clique em **Import**

### **2. Importar Environment (Opcional mas Recomendado)**

1. No Postman, clique em **Import**
2. Selecione o arquivo `Webhooks.postman_environment.json`
3. Clique em **Import**
4. Selecione o environment **"Messaging Webhooks - Environment"** no dropdown superior direito

---

## ⚙️ Configurar Variáveis de Ambiente

### **Variáveis Necessárias**

Configure as seguintes variáveis no Postman (ou no arquivo de environment):

#### **1. base_url** (Obrigatório)
```
https://seu-projeto.supabase.co/functions/v1
```
**Como obter:**
- URL do seu projeto Supabase
- Formato: `https://[project-ref].supabase.co/functions/v1`

#### **2. account_id** (Obrigatório para webhooks por conta)
```
550e8400-e29b-41d4-a716-446655440000
```
**Como obter:**
```sql
SELECT id FROM messaging_accounts 
WHERE broker_type = 'gupshup' 
AND status = 'active'
LIMIT 1;
```

#### **3. uazapi_token** (Obrigatório para webhooks UAZAPI)
```
2bb07e81-dfe3-414b-8e43-695030cb1c44
```
**Como obter:**
```sql
SELECT api_key FROM messaging_accounts 
WHERE broker_type = 'uazapi' 
AND status = 'active'
LIMIT 1;
```

#### **4. webhook_secret** (Opcional)
```
your-webhook-secret-here
```
**Como obter:**
- Configurado no Meta Business Manager (WhatsApp Business API)
- Ou configurado manualmente em `messaging_accounts.webhook_secret`

---

## 📦 Estrutura da Collection

### **1. Webhook Global - UAZAPI**
- ✅ Mensagem de Texto
- ✅ Mensagem com Mídia
- ✅ Status Update
- ✅ Com Assinatura (X-Signature)

### **2. Webhook por Conta - Gupshup**
- ✅ Mensagem de Texto
- ✅ Com Assinatura (X-Webhook-Signature)

### **3. Webhook por Conta - WhatsApp Business API**
- ✅ Mensagem de Texto
- ✅ Status Update

### **4. Webhook Global - Evolution API**
- ✅ Mensagem de Texto

### **5. Cenários de Rastreamento de Origem** 🆕
- ✅ Mensagem com Meta Ads (Facebook/Instagram)
- ✅ Mensagem com Google Ads (GCLID)
- ✅ Mensagem com UTMs (Campanhas Orgânicas)
- ✅ Mensagem com Click ID TikTok Ads
- ✅ Mensagem com Múltiplas Origens
- ✅ Mensagem sem Dados de Origem
- ✅ Validação de Origem Registrada
- ✅ Consulta de Source Data JSONB

### **6. Cenários de Erro**
- ❌ UUID Inválido (400)
- ❌ Broker Type Inválido (400)
- ❌ Body Vazio (400)
- ❌ Conta Não Encontrada - Global (404)
- ❌ Conta Não Encontrada - Por Conta (404)
- ❌ Assinatura Inválida (401)

### **7. Rate Limiting**
- ⏱️ Verificar Headers de Rate Limit

---

## 🧪 Como Testar

### **Teste Básico - UAZAPI**

1. **Configure as variáveis:**
   - `base_url`: URL do seu projeto
   - `uazapi_token`: Token de uma conta UAZAPI ativa

2. **Selecione a request:**
   - `Webhook Global - UAZAPI` → `UAZAPI - Mensagem de Texto`

3. **Execute a request** (Send)

4. **Verifique a resposta:**
   - Status: `200 OK`
   - Body: Vazio (requisito do UAZAPI)

### **Teste - Gupshup (Por Conta)**

1. **Configure as variáveis:**
   - `base_url`: URL do seu projeto
   - `account_id`: UUID de uma conta Gupshup ativa

2. **Selecione a request:**
   - `Webhook por Conta - Gupshup` → `Gupshup - Mensagem de Texto`

3. **Execute a request** (Send)

4. **Verifique a resposta:**
   - Status: `200 OK`
   - Body: Vazio

### **Teste de Erros**

1. **Teste UUID Inválido:**
   - Use qualquer request de webhook por conta
   - Altere o `account_id` na URL para um valor inválido (ex: `invalid-uuid`)
   - Esperado: `400 Bad Request` com mensagem sobre formato UUID

2. **Teste Conta Não Encontrada:**
   - Use `account_id` válido mas que não existe no banco
   - Esperado: `404 Not Found`

---

## 🔍 Testes Automáticos

Cada request inclui testes automáticos no Postman:

### **Testes de Sucesso**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response is empty (webhook requirement)", function () {
    pm.expect(pm.response.text()).to.be.empty;
});
```

### **Testes de Erro**
```javascript
pm.test("Status code is 400", function () {
    pm.response.to.have.status(400);
});

pm.test("Error message about UUID format", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.error).to.include("UUID");
});
```

### **Testes de Rate Limit**
```javascript
pm.test("Response has rate limit headers", function () {
    const limit = pm.response.headers.get('X-RateLimit-Limit');
    const remaining = pm.response.headers.get('X-RateLimit-Remaining');
    // ...
});
```

---

## 📊 Headers de Rate Limit

O sistema retorna headers de rate limiting em todas as respostas:

```http
X-RateLimit-Limit: 200
X-RateLimit-Remaining: 150
X-RateLimit-Reset: 1642684860
```

Quando o limite é excedido:
```http
HTTP/1.1 429 Too Many Requests
Retry-After: 60
X-RateLimit-Limit: 200
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1642684860
```

**Limites:**
- **Webhook Global**: 200 requisições/minuto
- **Webhook por Conta**: 100 requisições/minuto

---

## 🔒 Validação de Assinatura

Para testar validação de assinatura:

1. **Configure `webhook_secret`** na variável de ambiente
2. **Configure `webhook_secret`** na conta do banco:
   ```sql
   UPDATE messaging_accounts 
   SET webhook_secret = 'your-secret-here'
   WHERE id = 'account-uuid';
   ```
3. **Use requests que incluem headers de assinatura:**
   - `UAZAPI - Com Assinatura (X-Signature)`
   - `Gupshup - Com Assinatura (X-Webhook-Signature)`
   - `Official WhatsApp - Mensagem de Texto`

**Nota:** O sistema valida automaticamente a assinatura quando:
- `webhook_secret` está configurado na conta
- Header de assinatura está presente na requisição

---

## 🐛 Troubleshooting

### **Erro 404 - Conta Não Encontrada**

**Possíveis causas:**
- Token/UUID incorreto
- Conta não está ativa (`status != 'active'`)
- Broker type não corresponde

**Solução:**
```sql
-- Verificar conta
SELECT id, broker_type, status, api_key 
FROM messaging_accounts 
WHERE id = 'your-account-id' OR api_key = 'your-token';
```

### **Erro 400 - Broker Type Mismatch**

**Causa:** O `broker_type` da conta não corresponde ao da URL.

**Exemplo:**
- URL: `/webhook/gupshup/{id}`
- Conta: `broker_type = 'uazapi'`

**Solução:** Use a URL correta para o broker type da conta.

### **Resposta Não Vazia**

**Problema:** Alguns brokers requerem resposta vazia, mas você está recebendo JSON.

**Causa:** O sistema retorna resposta vazia automaticamente após processar. Se você vê JSON, pode ser uma resposta de erro.

**Verifique:**
- Status code (deve ser 2xx para sucesso)
- Se há erros nos logs

---

## 📝 Exemplos de Payload

### **UAZAPI - Mensagem de Texto**
```json
{
  "token": "2bb07e81-dfe3-414b-8e43-695030cb1c44",
  "EventType": "messages",
  "message": {
    "chatid": "554791662434@s.whatsapp.net",
    "text": "Olá! Como posso ajudar?",
    "fromMe": false,
    "isGroup": false,
    "messageType": "ExtendedTextMessage",
    "senderName": "João Silva",
    "messageTimestamp": 1642684800
  },
  "owner": "554796772041"
}
```

### **UAZAPI - Mensagem com Origem Meta Ads (Facebook/Instagram)** 🆕
```json
{
  "token": "2bb07e81-dfe3-414b-8e43-695030cb1c44",
  "EventType": "messages",
  "message": {
    "chatid": "554791662434@s.whatsapp.net",
    "text": "Olá! Vi o anúncio no Facebook",
    "fromMe": false,
    "isGroup": false,
    "messageType": "ExtendedTextMessage",
    "senderName": "João Silva",
    "messageTimestamp": 1642684800,
    "content": {
      "text": "Olá! Vi o anúncio no Facebook",
      "contextInfo": {
        "externalAdReply": {
          "sourceUrl": "https://example.com?utm_source=facebook&utm_medium=paid_social&utm_campaign=promo_verao&fbclid=abc123xyz",
          "ctwaClid": "ctwa-clid-123456",
          "fbclid": "fbclid.abc123xyz",
          "sourceType": "AD",
          "sourceApp": "facebook",
          "sourceID": "campaign-789",
          "sourceName": "Promoção de Verão",
          "mediaType": "IMAGE",
          "thumbnailUrl": "https://example.com/thumb.jpg"
        }
      }
    }
  },
  "owner": "554796772041"
}
```

### **UAZAPI - Mensagem com Origem Google Ads (GCLID)** 🆕
```json
{
  "token": "2bb07e81-dfe3-414b-8e43-695030cb1c44",
  "EventType": "messages",
  "message": {
    "chatid": "554791662434@s.whatsapp.net",
    "text": "Interessei no produto que vi no Google",
    "fromMe": false,
    "isGroup": false,
    "messageType": "ExtendedTextMessage",
    "senderName": "Maria Santos",
    "messageTimestamp": 1642684800,
    "content": {
      "text": "Interessei no produto que vi no Google",
      "contextInfo": {
        "externalAdReply": {
          "sourceUrl": "https://example.com?utm_source=google&utm_medium=cpc&utm_campaign=produtos&gclid=CjwKCAiA...",
          "sourceType": "AD",
          "sourceApp": "google",
          "sourceID": "campaign-456",
          "sourceName": "Campanha de Produtos",
          "mediaType": "VIDEO"
        }
      }
    }
  },
  "owner": "554796772041"
}
```

### **UAZAPI - Mensagem com Origem TikTok Ads** 🆕
```json
{
  "token": "2bb07e81-dfe3-414b-8e43-695030cb1c44",
  "EventType": "messages",
  "message": {
    "chatid": "554791662434@s.whatsapp.net",
    "text": "Vi o vídeo no TikTok",
    "fromMe": false,
    "isGroup": false,
    "messageType": "ExtendedTextMessage",
    "senderName": "Pedro Costa",
    "messageTimestamp": 1642684800,
    "content": {
      "text": "Vi o vídeo no TikTok",
      "contextInfo": {
        "externalAdReply": {
          "sourceUrl": "https://example.com?utm_source=tiktok&utm_medium=paid_social&utm_campaign=video_promo",
          "sourceType": "AD",
          "sourceApp": "tiktok",
          "sourceID": "campaign-tiktok-123",
          "sourceName": "Promoção TikTok",
          "mediaType": "VIDEO"
        }
      }
    }
  },
  "owner": "554796772041"
}
```

### **UAZAPI - Mensagem com Origem Orgânica (UTMs)** 🆕
```json
{
  "token": "2bb07e81-dfe3-414b-8e43-695030cb1c44",
  "EventType": "messages",
  "message": {
    "chatid": "554791662434@s.whatsapp.net",
    "text": "Encontrei vocês pelo Google",
    "fromMe": false,
    "isGroup": false,
    "messageType": "ExtendedTextMessage",
    "senderName": "Ana Lima",
    "messageTimestamp": 1642684800,
    "content": {
      "text": "Encontrei vocês pelo Google",
      "contextInfo": {
        "externalAdReply": {
          "sourceUrl": "https://example.com?utm_source=google&utm_medium=organic&utm_campaign=seo&utm_term=produtos",
          "sourceType": "ORGANIC",
          "sourceApp": "google",
          "sourceName": "Busca Orgânica"
        }
      }
    }
  },
  "owner": "554796772041"
}
```

### **Gupshup - Mensagem de Texto**
```json
{
  "message": {
    "from": "5511999999999",
    "text": "Olá! Preciso de ajuda.",
    "timestamp": 1642684800,
    "type": "text"
  },
  "source": {
    "type": "user"
  }
}
```

### **WhatsApp Business API - Mensagem de Texto**
```json
{
  "object": "whatsapp_business_account",
  "entry": [{
    "id": "WHATSAPP_BUSINESS_ACCOUNT_ID",
    "changes": [{
      "value": {
        "messaging_product": "whatsapp",
        "messages": [{
          "from": "5511999999999",
          "id": "wamid.xxx",
          "timestamp": "1642684800",
          "text": {
            "body": "Olá! Preciso de ajuda."
          },
          "type": "text"
        }]
      },
      "field": "messages"
    }]
  }]
}
```

---

## 🎯 Testando Rastreamento de Origem 🆕

### **O que é Rastreamento de Origem?**

O sistema rastreia automaticamente a origem dos contatos que entram em contato via WhatsApp, armazenando:
- **Click IDs**: GCLID (Google), FBCLID (Facebook), CTWA CLID (Meta Ads)
- **UTM Parameters**: utm_source, utm_medium, utm_campaign, etc.
- **IDs de Campanha**: sourceID, campaign IDs
- **Metadados**: Tipo de origem (AD, ORGANIC, REFERRAL), App de origem (google, facebook, etc.)

### **Como Funciona**

1. **Webhook recebido** com dados de origem (ex: `externalAdReply`)
2. **Normalização** dos dados de origem via `OriginDataNormalizer`
3. **Extração** de Click IDs, UTMs e IDs de campanha
4. **Criação/Atualização** do contato
5. **Registro** da origem em `contact_origins` com `source_data` JSONB
6. **Associação** da origem com o contato

### **Cenários de Teste**

#### **1. Mensagem com Meta Ads (Facebook/Instagram)**

Use o payload **"UAZAPI - Mensagem com Origem Meta Ads"** acima.

**Após enviar, verifique:**

```sql
-- 1. Contato foi criado/encontrado
SELECT id, name, phone, country_code, main_origin_id 
FROM contacts 
WHERE phone = '4791662434' 
AND country_code = '55';

-- 2. Origem foi registrada
SELECT co.*, o.name as origin_name
FROM contact_origins co
JOIN origins o ON co.origin_id = o.id
WHERE co.contact_id = '{contact_id_from_step_1}'
ORDER BY co.created_at DESC;

-- 3. Source Data contém dados corretos
SELECT 
  source_data->>'source_app' as source_app,
  source_data->>'source_type' as source_type,
  source_data->'clickIds'->>'fbclid' as fbclid,
  source_data->'clickIds'->>'ctwaClid' as ctwa_clid,
  source_data->'utmParams'->>'utm_source' as utm_source,
  source_data->'utmParams'->>'utm_medium' as utm_medium,
  source_data->'utmParams'->>'utm_campaign' as utm_campaign
FROM contact_origins
WHERE contact_id = '{contact_id_from_step_1}';
```

**Resultado Esperado:**
- `source_app`: `"facebook"`
- `source_type`: `"ad"`
- `fbclid`: `"fbclid.abc123xyz"`
- `ctwa_clid`: `"ctwa-clid-123456"`
- `utm_source`: `"facebook"`
- `utm_medium`: `"paid_social"`
- `utm_campaign`: `"promo_verao"`

#### **2. Mensagem com Google Ads (GCLID)**

Use o payload **"UAZAPI - Mensagem com Origem Google Ads"** acima.

**Verificação:**
```sql
SELECT 
  source_data->>'source_app' as source_app,
  source_data->'clickIds'->>'gclid' as gclid,
  source_data->'utmParams'->>'utm_source' as utm_source
FROM contact_origins
WHERE contact_id = '{contact_id}';
```

**Resultado Esperado:**
- `source_app`: `"google"`
- `gclid`: Contém GCLID do Google Ads
- `utm_source`: `"google"`

#### **3. Mensagem com TikTok Ads**

Use o payload **"UAZAPI - Mensagem com Origem TikTok Ads"** acima.

**Verificação:**
```sql
SELECT 
  source_data->>'source_app' as source_app,
  source_data->'utmParams'->>'utm_source' as utm_source
FROM contact_origins
WHERE contact_id = '{contact_id}';
```

**Resultado Esperado:**
- `source_app`: `"tiktok"`
- `utm_source`: `"tiktok"`

#### **4. Mensagem Sem Dados de Origem**

Use o payload **"UAZAPI - Mensagem de Texto"** básico (sem `externalAdReply`).

**Verificação:**
```sql
-- Contato deve ser criado com origem padrão "WhatsApp"
SELECT c.id, c.name, o.name as origin_name
FROM contacts c
JOIN origins o ON c.main_origin_id = o.id
WHERE c.phone = '{phone}'
AND c.country_code = '{country_code}';
```

**Resultado Esperado:**
- `origin_name`: `"WhatsApp"` (origem padrão)
- Não deve haver registro em `contact_origins` com `source_data` (ou `source_data` vazio)

### **Estrutura do Source Data JSONB**

O campo `source_data` armazena dados estruturados:

```json
{
  "source_app": "facebook",
  "source_type": "ad",
  "source_id": "campaign-789",
  "source_name": "Promoção de Verão",
  "clickIds": {
    "gclid": "CjwKCAiA...",
    "fbclid": "fbclid.abc123xyz",
    "ctwaClid": "ctwa-clid-123456"
  },
  "utmParams": {
    "utm_source": "facebook",
    "utm_medium": "paid_social",
    "utm_campaign": "promo_verao",
    "utm_term": "verão",
    "utm_content": "banner-1"
  },
  "campaignIds": {
    "metaCampaignId": "campaign-789",
    "metaAdsetId": "adset-456",
    "metaAdId": "ad-123"
  },
  "metadata": {
    "mediaType": "IMAGE",
    "thumbnailUrl": "https://example.com/thumb.jpg"
  }
}
```

### **Queries Úteis para Análise**

#### **Contatos por Origem (Top 10)**
```sql
SELECT 
  o.name as origin_name,
  COUNT(DISTINCT co.contact_id) as total_contacts
FROM contact_origins co
JOIN origins o ON co.origin_id = o.id
WHERE co.source_data IS NOT NULL
AND co.source_data != '{}'::jsonb
GROUP BY o.name
ORDER BY total_contacts DESC
LIMIT 10;
```

#### **Contatos por Source App**
```sql
SELECT 
  source_data->>'source_app' as source_app,
  COUNT(DISTINCT contact_id) as total_contacts
FROM contact_origins
WHERE source_data->>'source_app' IS NOT NULL
GROUP BY source_data->>'source_app'
ORDER BY total_contacts DESC;
```

#### **Contatos por Campanha**
```sql
SELECT 
  source_data->'utmParams'->>'utm_campaign' as campaign,
  source_data->'utmParams'->>'utm_source' as source,
  COUNT(DISTINCT contact_id) as total_contacts
FROM contact_origins
WHERE source_data->'utmParams'->>'utm_campaign' IS NOT NULL
GROUP BY 
  source_data->'utmParams'->>'utm_campaign',
  source_data->'utmParams'->>'utm_source'
ORDER BY total_contacts DESC
LIMIT 20;
```

#### **Click IDs Únicos por Tipo**
```sql
SELECT 
  'gclid' as click_type,
  COUNT(DISTINCT source_data->'clickIds'->>'gclid') as unique_clicks
FROM contact_origins
WHERE source_data->'clickIds'->>'gclid' IS NOT NULL
UNION ALL
SELECT 
  'fbclid' as click_type,
  COUNT(DISTINCT source_data->'clickIds'->>'fbclid') as unique_clicks
FROM contact_origins
WHERE source_data->'clickIds'->>'fbclid' IS NOT NULL
UNION ALL
SELECT 
  'ctwaClid' as click_type,
  COUNT(DISTINCT source_data->'clickIds'->>'ctwaClid') as unique_clicks
FROM contact_origins
WHERE source_data->'clickIds'->>'ctwaClid' IS NOT NULL;
```

### **Validação Pós-Webhook**

Após enviar qualquer webhook com dados de origem, execute esta query completa:

```sql
-- Query completa de validação
WITH latest_webhook AS (
  SELECT 
    c.id as contact_id,
    c.name as contact_name,
    c.phone,
    c.country_code,
    o.name as origin_name,
    co.source_data,
    co.created_at as origin_created_at
  FROM contacts c
  LEFT JOIN contact_origins co ON c.id = co.contact_id
  LEFT JOIN origins o ON co.origin_id = o.id
  WHERE c.updated_at > NOW() - INTERVAL '5 minutes'
  ORDER BY co.created_at DESC
  LIMIT 1
)
SELECT 
  contact_id,
  contact_name,
  phone,
  country_code,
  origin_name,
  source_data->>'source_app' as source_app,
  source_data->>'source_type' as source_type,
  source_data->'clickIds' as click_ids,
  source_data->'utmParams' as utm_params,
  origin_created_at
FROM latest_webhook;
```

---

## 🔗 Referências

- [Guia de Configuração de Webhooks](./WEBHOOK_CONFIGURATION_GUIDE.md)
- [Exemplos de Webhooks](./WEBHOOK_EXAMPLES.md)
- [Documentação da API](./MESSAGING_API_DOCUMENTATION.md)
- **Implementação de Origem de Contatos**: `back-end/doc/IMPLEMENTATION_CONTACT_ORIGINS.md`
- **Plano de Implementação**: `back-end/doc/PLANO_IMPLEMENTACAO_ETAPAS.md`
- **Deploy FASE 8**: `back-end/DEPLOY_FASE8_RESUMO.md`

---

## ✅ Checklist de Configuração

Antes de começar a testar, certifique-se de:

- [ ] Collection importada no Postman
- [ ] Environment importado (ou variáveis configuradas manualmente)
- [ ] `base_url` configurado corretamente
- [ ] `account_id` configurado (para webhooks por conta)
- [ ] `uazapi_token` configurado (para webhooks UAZAPI)
- [ ] Contas criadas no banco de dados e ativas
- [ ] Status das contas é `active`
- [ ] **Origem "WhatsApp" existe** no projeto (para contatos sem origem específica)
- [ ] **Pelo menos um estágio ativo** existe no projeto (para criação de contatos)

### **Verificações no Banco de Dados**

#### **1. Verificar Origem WhatsApp**
```sql
SELECT id, name, project_id 
FROM origins 
WHERE name = 'WhatsApp' 
AND project_id = '{seu_project_id}';
```

**Se não existir, crie:**
```sql
INSERT INTO origins (project_id, name, type, color, is_active)
VALUES (
  '{seu_project_id}',
  'WhatsApp',
  'custom',
  '#25D366',
  true
);
```

#### **2. Verificar Estágios Ativos**
```sql
SELECT id, name, type, is_active 
FROM stages 
WHERE project_id = '{seu_project_id}' 
AND is_active = true;
```

**Se não existir, crie:**
```sql
INSERT INTO stages (project_id, name, type, color, is_active, display_order)
VALUES (
  '{seu_project_id}',
  'Novo Contato',
  'normal',
  '#10B981',
  true,
  1
);
```

---

**Nota:** Esta collection é uma ferramenta de teste e desenvolvimento. Para produção, configure os webhooks diretamente nos brokers (UAZAPI, Gupshup, Meta, etc.).

---

## 📈 Novidades da Versão 2.0 🆕

### **Rastreamento de Origem de Contatos**

✅ **Suporte completo a rastreamento de origem**:
- Meta Ads (Facebook/Instagram) com FBCLID e CTWA CLID
- Google Ads com GCLID
- TikTok Ads
- Campanhas orgânicas com UTMs
- Múltiplos tipos de origem por contato

✅ **Armazenamento estruturado**:
- Dados padronizados em `source_data` JSONB
- Click IDs, UTMs e IDs de campanha
- Metadados completos da origem

✅ **Queries de análise**:
- Contatos por origem
- Performance por campanha
- Análise de click IDs
- Timeline de origens por contato

### **Melhorias**

- 📝 Exemplos completos de payloads com origem
- 🔍 Queries SQL para validação
- ✅ Checklist atualizado com verificações de origem e estágios
- 📊 Queries úteis para análise de dados
