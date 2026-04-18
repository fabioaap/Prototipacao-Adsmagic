# 🚀 Deploy da Edge Function `integrations`

## ✅ Status

**✅ CONCLUÍDO - Deploy realizado com sucesso em 2025-01-28**

1. ✅ **Migration 018 aplicada** - Campo `pixel_id` adicionado em `integration_accounts`
2. ✅ **Edge Function `integrations` deployada** - Versão atualizada com as mudanças
3. ✅ **Frontend atualizado** - Carrega dados existentes corretamente

**Detalhes do Deploy:**
- Função: `integrations`
- Tamanho: 117.8kB
- Status: ACTIVE
- Projeto: `nitefyufrzytdtxhaocf`
- Dashboard: https://supabase.com/dashboard/project/nitefyufrzytdtxhaocf/functions

---

## 📋 Resumo das Mudanças

### Arquivos Alterados que Requerem Deploy:

1. ✅ `index.ts` - Nova rota `GET /integrations/:id/accounts`
2. ✅ `handlers/integrations/select-accounts.ts` - Salva pixel_id por conta
3. ✅ `handlers/integrations/get-accounts.ts` - **NOVO** - Endpoint para buscar contas
4. ✅ `repositories/IntegrationAccountRepository.ts` - Aceita pixelId no saveAccounts

---

## 🔧 Método 1: Deploy via Supabase CLI (Recomendado)

### Pré-requisitos

1. Docker Desktop deve estar rodando
2. Supabase CLI instalado:
   ```bash
   npm install -g supabase
   # ou
   brew install supabase/tap/supabase
   ```

### Comando de Deploy

```bash
cd back-end
supabase functions deploy integrations
```

**Ou se estiver usando link do projeto:**
```bash
cd back-end
supabase functions deploy integrations --project-ref nitefyufrzytdtxhaocf
```

---

## 🔧 Método 2: Deploy via Dashboard Supabase

1. Acesse: https://supabase.com/dashboard/project/nitefyufrzytdtxhaocf/functions
2. Encontre a função `integrations`
3. Clique em "Redeploy" ou "Update"
4. O código será atualizado automaticamente (se estiver sincronizado com Git)

---

## ✅ Verificação Pós-Deploy

Após o deploy, teste os endpoints:

### 1. Testar novo endpoint `GET /integrations/:id/accounts`
```bash
curl https://nitefyufrzytdtxhaocf.supabase.co/functions/v1/integrations/{INTEGRATION_ID}/accounts \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Project-ID: $PROJECT_ID"
```

### 2. Testar `POST /integrations/:id/select-accounts` com pixel_id
```bash
curl -X POST https://nitefyufrzytdtxhaocf.supabase.co/functions/v1/integrations/{INTEGRATION_ID}/select-accounts \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Project-ID: $PROJECT_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "accountIds": ["act_123"],
    "pixelId": "pixel_456"
  }'
```

### 3. Verificar logs
- Acesse: https://supabase.com/dashboard/project/nitefyufrzytdtxhaocf/logs/edge-functions
- Selecione função `integrations`
- Verifique se não há erros

---

## 🔄 Próximos Passos

1. ✅ Migration aplicada
2. ✅ Deploy da Edge Function concluído
3. ✅ Front-end atualizado
4. ⏳ **Testar fluxo completo:**
   - OAuth → Seleção → Salvamento com pixel_id por conta
   - Recarregar página → Verificar se dados são carregados
   - Testar endpoint `GET /integrations/:id/accounts`
   - Verificar se pixel_id é salvo corretamente na conta

---

## ✅ Concluído

Todas as mudanças foram aplicadas e a função foi deployada com sucesso!

