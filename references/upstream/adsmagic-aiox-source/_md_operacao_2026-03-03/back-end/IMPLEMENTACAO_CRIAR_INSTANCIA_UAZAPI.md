# ✅ Implementação: Criar Instância UAZAPI e Salvar no Banco

**Data**: 2025-01-28  
**Status**: ✅ Implementado

---

## 🎯 Objetivo

Implementar um endpoint que:
1. Cria instância na UAZAPI usando Admin Token
2. Salva automaticamente no banco de dados (tabela `messaging_accounts`)
3. Retorna os dados da conta criada

---

## 📋 Arquivos Criados/Modificados

### **1. Handler**
- ✅ `supabase/functions/messaging/handlers/create-instance.ts`
  - Validação de entrada (Zod)
  - Verificação de autenticação
  - Verificação de acesso ao projeto
  - Criação de instância na UAZAPI
  - Salvamento no banco de dados
  - Tratamento de erros

### **2. Rota**
- ✅ `supabase/functions/messaging/index.ts`
  - Rota: `POST /messaging/instances/uazapi`
  - Adicionado handler importado

### **3. Broker UAZAPI**
- ✅ `supabase/functions/messaging/brokers/uazapi/UazapiBroker.ts`
  - Método `createInstance` atualizado para aceitar `adminToken`
  - Header `admintoken` adicionado na requisição
  - Validação de apiKey comentada para permitir criação

### **4. Collection Postman**
- ✅ `MESSAGING_POSTMAN_COLLECTION.json`
  - Novo endpoint: "Criar Instância UAZAPI (Salva no Banco)"
  - Testes automatizados
  - Configuração de variáveis de ambiente

---

## 🔌 Endpoint

### **POST `/messaging/instances/uazapi`**

**Autenticação:** Requer JWT Bearer Token

**Body:**
```json
{
  "projectId": "uuid-do-projeto",
  "instanceName": "nome-da-instancia",
  "adminToken": "seu-admin-token-uazapi",
  "apiBaseUrl": "https://free.uazapi.com", // opcional
  "systemName": "apilocal", // opcional
  "phone": "5511999999999", // opcional
  "accountName": "Nome da Conta", // opcional
  "adminField01": "metadata-1", // opcional
  "adminField02": "metadata-2" // opcional
}
```

**Resposta (201 Created):**
```json
{
  "success": true,
  "data": {
    "accountId": "uuid-da-conta-criada",
    "instanceName": "nome-da-instancia",
    "instanceId": "nome-da-instancia",
    "apikey": "api-key-da-instancia",
    "token": "token-da-instancia",
    "account": {
      "id": "uuid-da-conta",
      "accountName": "Nome da Conta",
      "status": "disconnected",
      "brokerType": "uazapi"
    }
  },
  "message": "Instância criada e salva com sucesso"
}
```

---

## 🗄️ Dados Salvos no Banco

A conta é salva na tabela `messaging_accounts` com:

- `project_id`: ID do projeto
- `platform`: 'whatsapp'
- `broker_type`: 'uazapi'
- `account_identifier`: Número do telefone ou nome da instância
- `account_name`: Nome da conta
- `broker_config`: JSONB com configurações da instância
- `api_key`: API Key retornada pela UAZAPI
- `status`: 'disconnected' (ainda não conectado)
- `total_messages`: 0
- `total_contacts`: 0

**Nota:** `integration_account_id` não é incluído inicialmente (pode ser NULL ou adicionado depois).

---

## ✅ Fluxo Completo

1. **Cliente faz requisição** → `POST /messaging/instances/uazapi`
2. **Validação** → Verifica autenticação e dados de entrada
3. **Criação na UAZAPI** → Chama `POST /instance/init` com header `admintoken`
4. **Salvamento no Banco** → Insere registro em `messaging_accounts`
5. **Resposta** → Retorna dados da conta criada

---

## 🧪 Como Testar

### **1. Configurar Variáveis no Postman**
- `project_id`: ID do seu projeto
- `uazapi_master_apikey`: Admin Token da UAZAPI
- `uazapi_instance_name`: Nome da instância (ex: "minha-instancia")
- `jwt_token`: Token JWT de autenticação

### **2. Executar Request**
Use o endpoint "Criar Instância UAZAPI (Salva no Banco)" na collection.

### **3. Verificar Resultado**
- ✅ Status 201
- ✅ `accountId` retornado
- ✅ `messaging_account_id` salvo automaticamente no environment
- ✅ Conta salva no banco de dados

---

## 🔍 Verificação no Banco

```sql
-- Verificar conta criada
SELECT 
  id,
  account_name,
  broker_type,
  status,
  broker_config->>'instanceId' as instance_id,
  created_at
FROM messaging_accounts
WHERE project_id = 'SEU_PROJECT_ID'
ORDER BY created_at DESC
LIMIT 1;
```

---

## ⚠️ Observações

1. **Admin Token**: O endpoint requer o Admin Token da UAZAPI (não a API Key da instância)
2. **Status Inicial**: A conta é criada com status `disconnected`. Você precisará conectar depois via QR Code.
3. **integration_account_id**: Pode ser NULL inicialmente. Pode ser associado depois se necessário.

---

## 🚀 Próximos Passos

Após criar a instância, você pode:

1. **Conectar ao WhatsApp**: Use `GET /messaging/qrcode/:accountId` para gerar QR Code
2. **Verificar Status**: Use `GET /messaging/connection-status/:accountId`
3. **Enviar Mensagem**: Após conectar, use `POST /messaging/send`

---

**✅ Implementação concluída!**

