# ✅ Solução: Webhook não salvando contato

## 🔍 Problema Identificado

O webhook retornava HTTP 200 mas o contato não era salvo no banco de dados.

## 🎯 Causa Raiz

**Nenhum estágio ativo no projeto** - O código exige pelo menos um estágio ativo para criar contatos, mas o projeto `063d5989-1d9f-444b-8391-3f79bc31de8f` não tinha nenhum estágio.

## ✅ Solução Aplicada

1. **Criado estágio inicial para o projeto**:
   - ID: `fd0aae6c-98a9-478c-8198-1ed4cf4b2d43`
   - Nome: "Novo Contato"
   - Tipo: `normal`
   - Status: `active`
   - Display Order: `1`

2. **Verificado que origem "WhatsApp" existe**:
   - ID: `30189213-dc8b-48b4-9ef4-c430b753cd7b`
   - Nome: "WhatsApp"
   - Status: `active`

3. **Funções deployadas**:
   - ✅ `messaging` (v17) - com logs melhorados
   - ✅ `messaging-webhooks` (v4) - pronto para receber webhooks

## 📋 Teste Novamente

Execute o mesmo curl:

```bash
curl --location 'https://nitefyufrzytdtxhaocf.supabase.co/functions/v1/messaging-webhooks/webhook/uazapi' \
--header 'Content-Type: application/json' \
--data-raw '{
  "token": "8e07a063-8c01-40ea-84c4-eee536d53cd5",
  "EventType": "messages",
  "message": {
    "chatid": "554791662434@s.whatsapp.net",
    "text": "Veja esta imagem",
    "fromMe": false,
    "isGroup": false,
    "messageType": "ImageMessage",
    "senderName": "João Silva",
    "messageTimestamp": 1642684800,
    "content": {
      "mimetype": "image/jpeg",
      "caption": "Veja esta imagem",
      "url": "https://example.com/image.jpg"
    }
  },
  "owner": "554796772041"
}'
```

## 🔍 Verificação

Após enviar o webhook, verifique se o contato foi criado:

```sql
SELECT id, name, phone, country_code, project_id, main_origin_id, current_stage_id 
FROM contacts 
WHERE phone = '4791662434' 
AND country_code = '55'
AND project_id = '063d5989-1d9f-444b-8391-3f79bc31de8f';
```

## 📊 Dados Esperados

Após o webhook, você deve ver:

1. **Contato criado**:
   - `name`: "João Silva"
   - `phone`: "4791662434"
   - `country_code`: "55"
   - `main_origin_id`: `30189213-dc8b-48b4-9ef4-c430b753cd7b` (WhatsApp)
   - `current_stage_id`: `fd0aae6c-98a9-478c-8198-1ed4cf4b2d43` (Novo Contato)

2. **Origem registrada** (se houver dados de origem):
   - Registro em `contact_origins` com `source_data` JSONB

## 🚨 Se ainda não funcionar

Verifique os logs:
```bash
supabase functions logs messaging-webhooks --project-ref nitefyufrzytdtxhaocf --tail
```

Ou via Dashboard:
https://supabase.com/dashboard/project/nitefyufrzytdtxhaocf/logs/edge-logs?function_id=09acde21-e52b-40bb-9483-ffcc7c4f43e7

---

**Status**: ✅ **RESOLVIDO** - Estágio criado, funções deployadas, pronto para testar!
