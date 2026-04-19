# ✅ Deploy Rápido: Edge Function `messaging`

**Status**: ✅ **DEPLOY CONCLUÍDO** - 2025-01-28

---

## 🚀 Comando Rápido

```bash
cd back-end
supabase functions deploy messaging
```

---

## ✅ Pré-requisitos

1. **Docker Desktop** rodando
2. **Supabase CLI** instalado:
   ```bash
   npm install -g supabase
   ```
3. **Autenticado**:
   ```bash
   supabase login
   ```

---

## 📋 O que será deployado

- ✅ Novo handler: `create-instance.ts`
- ✅ Nova rota: `POST /messaging/instances/uazapi`
- ✅ Broker UAZAPI atualizado com header `admintoken`

---

## ✅ Verificar Deploy

Após deploy, teste:

```bash
curl -X POST https://nitefyufrzytdtxhaocf.supabase.co/functions/v1/messaging/instances/uazapi \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "uuid",
    "instanceName": "test",
    "adminToken": "token"
  }'
```

Ou use o Postman: "Criar Instância UAZAPI (Salva no Banco)"

---

**📖 Guia completo:** `DEPLOY_MESSAGING_FUNCTION.md`

