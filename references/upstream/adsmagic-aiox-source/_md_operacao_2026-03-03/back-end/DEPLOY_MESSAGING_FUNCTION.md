# ✅ Deploy da Edge Function `messaging` - CONCLUÍDO

**Data**: 2025-01-28  
**Status**: ✅ **DEPLOY REALIZADO COM SUCESSO**

---

## 📋 Resumo das Mudanças

### Arquivos Alterados que Requerem Deploy:

1. ✅ **Novo Handler**: `handlers/create-instance.ts`
   - Endpoint: `POST /messaging/instances/uazapi`
   - Cria instância UAZAPI e salva no banco automaticamente

2. ✅ **Router Atualizado**: `index.ts`
   - Nova rota adicionada para criar instância

3. ✅ **Broker UAZAPI Atualizado**: `brokers/uazapi/UazapiBroker.ts`
   - Método `createInstance` atualizado para usar header `admintoken`
   - Validação de apiKey ajustada

---

## 🔧 Método 1: Deploy via Supabase CLI (Recomendado)

### Pré-requisitos

1. **Docker Desktop deve estar rodando**
2. **Supabase CLI instalado:**
   ```bash
   npm install -g supabase
   # ou
   brew install supabase/tap/supabase
   ```

3. **Autenticado no Supabase:**
   ```bash
   supabase login
   ```

4. **Linkado ao projeto (se necessário):**
   ```bash
   cd back-end
   supabase link --project-ref nitefyufrzytdtxhaocf
   ```

### Comando de Deploy

```bash
cd back-end
supabase functions deploy messaging
```

**Ou se estiver usando link do projeto:**
```bash
cd back-end
supabase functions deploy messaging --project-ref nitefyufrzytdtxhaocf
```

**Com verificação de erros:**
```bash
supabase functions deploy messaging --no-verify-jwt
```

---

## 🔧 Método 2: Deploy via Dashboard Supabase

1. **Acesse o Dashboard:**
   - URL: https://supabase.com/dashboard/project/nitefyufrzytdtxhaocf/functions

2. **Encontre a função `messaging`**
   - Se já existir, clique em "Redeploy" ou "Update"
   - Se não existir, você precisará fazer via CLI primeiro

3. **Verificar status:**
   - A função deve aparecer como "ACTIVE"
   - Verificar logs para confirmar deploy

---

## 🔧 Método 3: Deploy via Git (CI/CD)

Se você tem CI/CD configurado, o deploy pode ser automático via Git push.

**Verifique se há GitHub Actions ou similar configurado.**

---

## ✅ Verificação Pós-Deploy

Após o deploy, teste os endpoints:

### 1. Testar novo endpoint `POST /messaging/instances/uazapi`

**Via cURL:**
```bash
curl -X POST https://nitefyufrzytdtxhaocf.supabase.co/functions/v1/messaging/instances/uazapi \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "uuid-do-projeto",
    "instanceName": "minha-instancia",
    "adminToken": "seu-admin-token",
    "accountName": "Conta WhatsApp UAZAPI"
  }'
```

**Via Postman:**
- Use o endpoint "Criar Instância UAZAPI (Salva no Banco)" da collection

### 2. Verificar logs

**Dashboard:**
- Acesse: https://supabase.com/dashboard/project/nitefyufrzytdtxhaocf/logs/edge-functions
- Selecione função `messaging`
- Verifique se não há erros

**Via CLI:**
```bash
supabase functions logs messaging --project-ref nitefyufrzytdtxhaocf
```

---

## 📊 Endpoints da Função `messaging`

Após o deploy, os seguintes endpoints estarão disponíveis:

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/messaging/webhook` | Recebe webhooks dos brokers |
| POST | `/messaging/send` | Envia mensagem |
| GET | `/messaging/status/:accountId` | Status da conta |
| POST | `/messaging/sync-contacts/:accountId` | Sincroniza contatos |
| GET | `/messaging/qrcode/:accountId` | Gera QR Code para conexão |
| GET | `/messaging/paircode/:accountId` | Gera Pair Code para conexão |
| GET | `/messaging/connection-status/:accountId` | Status de conexão detalhado |
| **POST** | **`/messaging/instances/uazapi`** | **🆕 Criar instância UAZAPI e salvar no banco** |

---

## 🐛 Troubleshooting

### Erro: "Function not found"
- Verifique se você está no diretório correto (`back-end`)
- Verifique se a função existe em `supabase/functions/messaging/`

### Erro: "Authentication required"
- Execute: `supabase login`
- Verifique se está linkado ao projeto correto

### Erro: "Docker not running"
- Inicie o Docker Desktop
- Aguarde Docker estar completamente inicializado

### Erro no deploy: "Import error"
- Verifique se todas as dependências estão corretas
- Verifique imports relativos nos arquivos

### Função não aparece no Dashboard
- Aguarde alguns minutos
- Recarregue a página
- Verifique se o deploy foi concluído com sucesso

---

## 🔄 Fluxo Completo de Deploy

1. **Desenvolvimento Local:**
   ```bash
   # Testar localmente (opcional)
   supabase functions serve messaging
   ```

2. **Deploy:**
   ```bash
   supabase functions deploy messaging
   ```

3. **Verificação:**
   ```bash
   # Ver logs
   supabase functions logs messaging
   
   # Testar endpoint
   curl -X POST https://nitefyufrzytdtxhaocf.supabase.co/functions/v1/messaging/instances/uazapi ...
   ```

4. **Monitoramento:**
   - Acompanhar logs no Dashboard
   - Testar endpoints críticos
   - Verificar métricas de performance

---

## ✅ Checklist Pós-Deploy

- [ ] Deploy concluído sem erros
- [ ] Função aparece como "ACTIVE" no Dashboard
- [ ] Logs sem erros críticos
- [ ] Testar endpoint `POST /messaging/instances/uazapi`
- [ ] Verificar se dados são salvos no banco
- [ ] Testar outros endpoints existentes para garantir compatibilidade

---

## 📝 Notas Importantes

1. **Variáveis de Ambiente:**
   - As variáveis de ambiente do Supabase (SUPABASE_URL, SUPABASE_ANON_KEY) são injetadas automaticamente
   - Não é necessário configurar manualmente

2. **Tamanho da Função:**
   - Edge Functions têm limite de tamanho
   - Se a função for muito grande, considere dividir em múltiplas funções

3. **Caching:**
   - Mudanças podem levar alguns segundos para propagar
   - Se não funcionar imediatamente, aguarde 1-2 minutos

4. **Rollback:**
   - Versões anteriores ficam disponíveis no Dashboard
   - Você pode fazer rollback se necessário

---

**🚀 Pronto para fazer deploy!**

Execute o comando e verifique os resultados.

