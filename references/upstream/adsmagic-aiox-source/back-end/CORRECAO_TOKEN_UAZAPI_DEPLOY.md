# ✅ Deploy: Correções de Token UAZAPI

**Data**: 2025-01-28  
**Status**: ✅ **DEPLOY CONCLUÍDO**

---

## 🎉 Resultado do Deploy

```
✅ Deployed Functions on project nitefyufrzytdtxhaocf: messaging
📦 Script size: 177kB
🌐 Dashboard: https://supabase.com/dashboard/project/nitefyufrzytdtxhaocf/functions
```

---

## 📋 Correções Aplicadas

### **1. Logs Detalhados na Criação de Instância**
- ✅ Logs completos da resposta da UAZAPI ao criar instância
- ✅ Logs dos valores extraídos (token, apikey, instanceId)
- ✅ Aviso se token/apikey não forem retornados

### **2. Correção no Salvamento do Token**
- ✅ **Removido fallback para adminToken** - Não usar adminToken como token da instância
- ✅ Se não tiver token/apikey, salvar como `null` e logar aviso
- ✅ Priorizar `token` sobre `apikey` para `access_token`

### **3. Tentativa com InstanceId na URL**
- ✅ Se falhar com `/instance/connect`, tenta `/instance/connect/{instanceId}`
- ✅ Algumas versões da UAZAPI podem precisar do instanceId na URL

### **4. Logs Detalhados na Conexão**
- ✅ Logs completos do token sendo usado
- ✅ Logs dos headers sendo enviados
- ✅ Logs do body sendo enviado

---

## 🔍 Verificar nos Logs

Após testar, verifique os logs no Dashboard do Supabase:

### **1. Logs de Criação de Instância**
Procure por `[UazapiBroker] Create instance response:`:
- Verifique se `instanceToken` e `instanceApikey` estão presentes
- Verifique se os valores extraídos estão corretos

### **2. Logs de Conexão**
Procure por `[Connect Instance] UAZAPI token extraction:`:
- Verifique se `finalTokenLength` > 0
- Verifique de onde o token foi extraído (access_token, api_key, instanceData)

Procure por `[UazapiBroker] Connecting instance:`:
- Verifique se `hasToken: true`
- Verifique se `tokenLength` > 0
- Verifique o `tokenPreview` para confirmar que não está vazio

Procure por `[UazapiBroker] Request details:`:
- Verifique se `headerApikey` não é 'null'
- Verifique se `headerAuthorization` não é 'null'

---

## 🧪 Teste Novamente

Após o deploy, aguarde alguns segundos e teste:

```bash
curl --location 'https://nitefyufrzytdtxhaocf.supabase.co/functions/v1/messaging/connect/f83b9379-7844-4c42-91f9-cefe30cd3b74' \
  --header 'Content-Type: application/json' \
  --header 'Authorization: Bearer YOUR_JWT_TOKEN' \
  --data '{}'
```

---

## ⚠️ Possíveis Problemas

### **1. Token Não Retornado pela UAZAPI**
Se os logs mostrarem que `instanceToken` e `instanceApikey` são `null`:
- A UAZAPI pode não estar retornando o token na resposta
- Verifique a documentação da UAZAPI para confirmar o formato da resposta
- Pode ser necessário usar outro endpoint para obter o token

### **2. Token Inválido**
Se o token estiver sendo enviado mas ainda der "Missing token":
- O token pode estar expirado ou inválido
- Pode ser necessário recriar a instância
- Verifique se o token no banco corresponde ao token real da instância

### **3. Formato do Endpoint**
Se ainda falhar, pode ser que:
- O endpoint precise do instanceId na URL: `/instance/connect/{instanceId}`
- O endpoint precise de outro formato de autenticação
- Verifique a documentação oficial da UAZAPI

---

## 📊 Verificar Token no Banco

Execute esta query para verificar o token salvo:

```sql
SELECT 
  id,
  account_name,
  access_token,
  api_key,
  broker_config->>'instanceId' as instance_id,
  broker_config->'instanceData'->>'token' as token_from_instance_data,
  broker_config->'instanceData'->>'apikey' as apikey_from_instance_data
FROM messaging_accounts 
WHERE id = 'f83b9379-7844-4c42-91f9-cefe30cd3b74';
```

**Verifique:**
- Se `access_token` e `api_key` não são `null`
- Se os valores correspondem ao token real da instância UAZAPI
- Se `token_from_instance_data` ou `apikey_from_instance_data` têm valores diferentes

---

## ✅ Próximos Passos

1. ✅ Deploy concluído
2. ⏳ Testar conexão novamente
3. ⏳ Verificar logs detalhados
4. ⏳ Se ainda falhar, verificar se o token está correto no banco
5. ⏳ Se necessário, recriar a instância para obter token válido

---

**🎉 Deploy concluído! Teste agora e verifique os logs detalhados para identificar o problema.**

