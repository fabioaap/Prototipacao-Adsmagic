# 🔄 Guia de Migração - Webhooks para Função Separada

**Versão**: 1.0  
**Data**: 2025-01-28  
**Status**: Migração v0.7.0

---

## 📋 Resumo da Migração

Na versão **0.7.0**, os webhooks foram migrados para uma função Edge separada chamada `messaging-webhooks`. Esta mudança melhora a segurança, escalabilidade e manutenção do sistema.

### **O Que Mudou**

- ✅ Webhooks agora estão em: `/functions/v1/messaging-webhooks/webhook/*`
- ✅ Função `messaging` agora é exclusiva para endpoints autenticados
- ✅ Webhooks não requerem autenticação JWT (função pública configurada)
- ✅ Segurança mantida via validação de assinatura e rate limiting

---

## 🔧 Ações de Migração Necessárias

### **1. Atualizar URLs nos Brokers**

Atualize as URLs de webhook configuradas em cada broker:

#### **UAZAPI**
- ❌ **Antigo**: `https://projeto.supabase.co/functions/v1/messaging/webhook/uazapi`
- ✅ **Novo**: `https://projeto.supabase.co/functions/v1/messaging-webhooks/webhook/uazapi`

#### **Gupshup**
- ❌ **Antigo**: `https://projeto.supabase.co/functions/v1/messaging/webhook/gupshup/{accountId}`
- ✅ **Novo**: `https://projeto.supabase.co/functions/v1/messaging-webhooks/webhook/gupshup/{accountId}`

#### **WhatsApp Business API**
- ❌ **Antigo**: `https://projeto.supabase.co/functions/v1/messaging/webhook/official_whatsapp/{accountId}`
- ✅ **Novo**: `https://projeto.supabase.co/functions/v1/messaging-webhooks/webhook/official_whatsapp/{accountId}`

#### **Evolution API**
- ❌ **Antigo**: `https://projeto.supabase.co/functions/v1/messaging/webhook/evolution`
- ✅ **Novo**: `https://projeto.supabase.co/functions/v1/messaging-webhooks/webhook/evolution`

### **2. Deploy da Nova Função**

A nova função `messaging-webhooks` precisa ser deployada:

```bash
cd back-end
supabase functions deploy messaging-webhooks --no-verify-jwt
```

**Nota**: 
- O flag `--no-verify-jwt` é obrigatório e também está configurado no `config.toml`
- A função usa `SUPABASE_SERVICE_ROLE_KEY` para acessar dados sem RLS (apropriado para webhooks públicos)
- Certifique-se de que `SUPABASE_SERVICE_ROLE_KEY` está configurada como variável de ambiente no Supabase

### **3. Verificar Configuração**

Verifique que o `config.toml` contém:

```toml
[functions.messaging-webhooks]
verify_jwt = false
```

### **4. Testar Webhooks**

Após o deploy, teste os webhooks para garantir que estão funcionando:

```bash
# Teste webhook global (UAZAPI)
curl -X POST https://projeto.supabase.co/functions/v1/messaging-webhooks/webhook/uazapi \
  -H "Content-Type: application/json" \
  -d '{
    "token": "seu-token-aqui",
    "EventType": "messages",
    "message": {...}
  }'

# Teste webhook por conta (Gupshup)
curl -X POST https://projeto.supabase.co/functions/v1/messaging-webhooks/webhook/gupshup/{accountId} \
  -H "Content-Type: application/json" \
  -d '{
    "message": {...}
  }'
```

---

## ⚠️ Compatibilidade

### **Endpoints Antigos**

Os endpoints antigos em `/functions/v1/messaging/webhook/*` **não funcionarão mais** após a migração. Certifique-se de atualizar todas as URLs configuradas nos brokers antes de desativar a função antiga.

### **Código Legacy**

O endpoint legacy `POST /messaging/webhook` foi removido. Todos os webhooks devem usar os novos endpoints:

- `POST /messaging-webhooks/webhook/{brokerType}` (Global)
- `POST /messaging-webhooks/webhook/{brokerType}/{accountId}` (Por Conta)

---

## 📊 Benefícios da Migração

### **Segurança**
- ✅ Isolamento: Webhooks públicos separados de endpoints autenticados
- ✅ Princípio de menor privilégio: Cada função tem apenas as permissões necessárias
- ✅ Validação mantida: Signature validation, rate limiting e account validation continuam funcionando

### **Escalabilidade**
- ✅ Escalonamento independente: Webhooks podem escalar separadamente
- ✅ Monitoramento isolado: Métricas e logs separados
- ✅ Deploy independente: Atualizações de webhook não afetam endpoints autenticados

### **Manutenção**
- ✅ Código mais limpo: Separação clara de responsabilidades (SOLID)
- ✅ Fácil de entender: Webhooks = função pública, Messaging = função privada
- ✅ Testes isolados: Testes de webhook não afetam testes de messaging

---

## 📚 Documentação Atualizada

- ✅ `CHANGELOG.md` - Versão 0.7.0 documentada
- ✅ `WEBHOOK_CONFIGURATION_GUIDE.md` - URLs atualizadas
- ✅ `WEBHOOK_EXAMPLES.md` - Exemplos atualizados
- ✅ `WEBHOOK_MIGRATION.md` - Este guia

---

## 🆘 Suporte

Se encontrar problemas durante a migração:

1. Verifique os logs da função `messaging-webhooks`:
   ```bash
   supabase functions logs messaging-webhooks
   ```

2. Verifique que a função está deployada:
   ```bash
   supabase functions list
   ```

3. Teste conectividade básica:
   ```bash
   curl -X OPTIONS https://projeto.supabase.co/functions/v1/messaging-webhooks/webhook/uazapi
   ```

4. Verifique a configuração `verify_jwt` no dashboard do Supabase ou `config.toml`

---

## ✅ Checklist de Migração

- [ ] Deploy da função `messaging-webhooks`
- [ ] Configurar `verify_jwt: false` no `config.toml` ou via deploy flag
- [ ] Atualizar URL no UAZAPI
- [ ] Atualizar URLs no Gupshup (para cada conta)
- [ ] Atualizar URLs no WhatsApp Business API (para cada conta)
- [ ] Atualizar URLs no Evolution API
- [ ] Testar webhook de cada broker
- [ ] Monitorar logs por 24h após migração
- [ ] Remover configurações antigas após confirmação

---

**Última atualização**: 2025-01-28
