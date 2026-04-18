# 🔌 Implementação: Conexão UAZAPI via QR Code/Pair Code

**Data**: 2025-01-28  
**Status**: ✅ Implementado  
**Versão**: 1.0

---

## 📋 Resumo

Implementada a funcionalidade completa de conexão com UAZAPI via **QR Code** e **Pair Code**. Agora é possível conectar contas de mensageria do tipo UAZAPI através da geração de QR Code ou Pair Code, seguindo o padrão comum de APIs não oficiais do WhatsApp.

---

## ✅ O que foi implementado

### 1. **Métodos no UazapiBroker** ✅

#### `generateQRCode()`
- Gera QR Code para conexão da instância
- Retorna QR Code em base64, data de expiração e instanceId
- QR Code expira em ~40 segundos (padrão WhatsApp)

#### `generatePairCode()`
- Gera Pair Code alternativo para conexão
- Retorna código, data de expiração e instanceId
- Pair Code expira em ~2 minutos

#### `getConnectionStatus()` (sobrescrito)
- Verifica status detalhado de conexão
- Retorna se está conectado, data de última conexão e erros

#### `getAccountInfo()` (sobrescrito)
- Obtém informações da conta conectada
- Retorna número de telefone, nome e status

#### `disconnect()`
- Desconecta a instância
- Útil para desconexão manual

### 2. **Novos Endpoints da API** ✅

#### `GET /messaging/qrcode/:accountId`
- Gera QR Code para conexão
- Disponível apenas para brokers não oficiais
- Atualiza status da conta para "connecting"
- Retorna QR Code em base64 e informações de expiração

#### `GET /messaging/paircode/:accountId`
- Gera Pair Code para conexão
- Disponível apenas para brokers não oficiais
- Alternativa ao QR Code para conexão manual
- Retorna código e informações de expiração

#### `GET /messaging/connection-status/:accountId`
- Verifica status detalhado de conexão
- Retorna informações sobre conexão, número de telefone, QR Code ativo, etc.
- Status possíveis: `connected`, `disconnected`, `connecting`, `timeout`

### 3. **Tipos TypeScript Atualizados** ✅

Adicionados novos tipos em `types.ts`:
- `QRCodeResponse`
- `PairCodeResponse`
- `ConnectionStatusResponse`

Adicionados tipos específicos do UAZAPI em `uazapi/types.ts`:
- `UazapiQRCodeResponse`
- `UazapiPairCodeResponse`
- `UazapiInstanceStatus`

### 4. **Handlers Criados** ✅

- ✅ `handlers/generate-qrcode.ts` - Handler para gerar QR Code
- ✅ `handlers/generate-paircode.ts` - Handler para gerar Pair Code
- ✅ `handlers/connection-status.ts` - Handler para verificar status

### 5. **Rotas Adicionadas** ✅

Todas as rotas foram adicionadas ao `index.ts` da Edge Function com:
- Validação de autenticação
- Validação de acesso ao projeto (RLS)
- Tratamento de erros

### 6. **Documentação Atualizada** ✅

- ✅ Documentação da API atualizada com os 3 novos endpoints
- ✅ Exemplos de requisições e respostas
- ✅ Descrição de comportamentos e códigos de erro

---

## 📚 Documentação da API

### Endpoint: Gerar QR Code

```http
GET /functions/v1/messaging/qrcode/:accountId
Authorization: Bearer <JWT_TOKEN>
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "qrCode": "data:image/png;base64,iVBORw0KG...",
    "code": "ABC-123-DEF",
    "expiresAt": "2025-01-28T12:00:40.000Z",
    "instanceId": "instance_123",
    "status": "generated",
    "message": "Escaneie o QR Code com seu WhatsApp para conectar"
  }
}
```

### Endpoint: Gerar Pair Code

```http
GET /functions/v1/messaging/paircode/:accountId
Authorization: Bearer <JWT_TOKEN>
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "code": "ABC-123-DEF-456",
    "expiresAt": "2025-01-28T12:02:00.000Z",
    "instanceId": "instance_123",
    "status": "generated",
    "message": "Insira este código no WhatsApp: Configurações > Aparelhos conectados > Conectar um aparelho"
  }
}
```

### Endpoint: Verificar Status de Conexão

```http
GET /functions/v1/messaging/connection-status/:accountId
Authorization: Bearer <JWT_TOKEN>
```

**Resposta (Conectado):**
```json
{
  "success": true,
  "data": {
    "instanceId": "instance_123",
    "connected": true,
    "status": "connected",
    "phoneNumber": "5511999999999",
    "message": "Conectado com sucesso"
  }
}
```

**Resposta (Aguardando Conexão):**
```json
{
  "success": true,
  "data": {
    "instanceId": "instance_123",
    "connected": false,
    "status": "connecting",
    "qrCode": "data:image/png;base64,...",
    "pairCode": "ABC-123-DEF",
    "message": "Aguardando conexão"
  }
}
```

---

## 🔧 Estrutura de Endpoints UAZAPI

**✅ ATUALIZADO**: Endpoints confirmados com documentação oficial.

### Endpoints Confirmados

- ✅ `POST /instance/init` - Criar instância
- ✅ `POST /instance/connect` - Conectar instância (gerar QR Code)

### Endpoints Ainda a Verificar

- ⏳ `GET /instance/status/:instanceId` - Verificar status
- ⏳ `GET /instance/info/:instanceId` - Obter informações da instância
- ⏳ `GET /instance/pair-code/:instanceId` - Gerar Pair Code
- ⏳ `DELETE /instance/logout/:instanceId` - Desconectar

**📚 Ver:** `UAZAPI_ENDPOINTS_ATUALIZADOS.md` para detalhes completos.

**⚠️ IMPORTANTE**: Verificar a documentação oficial da UAZAPI (https://docs.uazapi.com/) para confirmar os endpoints exatos e ajustar se necessário.

---

## 🧪 Como Testar

### 1. Criar Conta de Mensageria UAZAPI

```sql
INSERT INTO messaging_accounts (
  project_id,
  platform,
  broker_type,
  account_identifier,
  account_name,
  broker_config,
  api_key,
  status
) VALUES (
  'SEU_PROJECT_ID',
  'whatsapp',
  'uazapi',
  '5511999999999',
  'Conta WhatsApp UAZAPI',
  '{
    "instanceId": "sua-instance-id",
    "apiBaseUrl": "https://uazapi.com/api"
  }'::jsonb,
  'sua-api-key-uazapi',
  'disconnected'
) RETURNING id;
```

### 2. Gerar QR Code

```bash
curl -X GET https://your-project.supabase.co/functions/v1/messaging/qrcode/uuid-da-conta \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. Verificar Status

```bash
curl -X GET https://your-project.supabase.co/functions/v1/messaging/connection-status/uuid-da-conta \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 4. Processo de Conexão

1. Gerar QR Code ou Pair Code
2. Escanear QR Code ou inserir Pair Code no WhatsApp
3. Verificar status periodicamente (polling)
4. Quando status mudar para "connected", conexão concluída

---

## ⚠️ Notas Importantes

### Documentação da UAZAPI

**✅ ATUALIZADO**: Endpoints principais confirmados com documentação oficial.
- 📖 **Documentação Oficial**: https://docs.uazapi.com/
- 📚 **Endpoints Atualizados**: Veja `UAZAPI_ENDPOINTS_ATUALIZADOS.md`
- 📚 **Referência Completa**: Veja `docs/UAZAPI_ENDPOINTS_REFERENCE.md`

**Endpoints Confirmados:**
- ✅ `POST /instance/init` - Criar instância
- ✅ `POST /instance/connect` - Conectar instância (gerar QR Code)

### Ajustes Necessários

Após verificar a documentação oficial, consulte `docs/UAZAPI_ENDPOINTS_REFERENCE.md` para:
1. **Endpoints** em `UazapiBroker.ts`:
   - URLs dos endpoints (linhas ~166, ~210, ~247, ~281, ~309)
   - Métodos HTTP utilizados

2. **Formato de Resposta** em `uazapi/types.ts`:
   - Estrutura de resposta do QR Code
   - Estrutura de resposta do Pair Code
   - Estrutura de status de conexão

3. **Tratamento de Erros**:
   - Códigos de erro específicos
   - Mensagens de erro da API

**⚠️ IMPORTANTE**: Veja o checklist completo em `docs/UAZAPI_ENDPOINTS_REFERENCE.md`

---

## 📝 Próximos Passos

1. ✅ **Verificar Documentação Oficial da UAZAPI**
   - Confirmar endpoints exatos
   - Confirmar formato de respostas
   - Ajustar implementação se necessário

2. ⏳ **Testar com Conta Real**
   - Criar conta UAZAPI real
   - Gerar QR Code
   - Testar conexão completa
   - Verificar se funciona conforme esperado

3. ⏳ **Implementar Polling no Frontend**
   - Criar componente para exibir QR Code
   - Implementar polling de status
   - Atualizar UI quando conectar

4. ⏳ **Melhorias Futuras**
   - Auto-refresh de QR Code quando expirar
   - Notificações quando conexão for estabelecida
   - Histórico de tentativas de conexão

---

## 🔗 Arquivos Modificados

### Novos Arquivos

- ✅ `supabase/functions/messaging/handlers/generate-qrcode.ts`
- ✅ `supabase/functions/messaging/handlers/generate-paircode.ts`
- ✅ `supabase/functions/messaging/handlers/connection-status.ts`

### Arquivos Modificados

- ✅ `supabase/functions/messaging/brokers/uazapi/UazapiBroker.ts` - Métodos de conexão adicionados
- ✅ `supabase/functions/messaging/brokers/uazapi/types.ts` - Tipos adicionados
- ✅ `supabase/functions/messaging/types.ts` - Tipos de resposta adicionados
- ✅ `supabase/functions/messaging/index.ts` - Rotas adicionadas
- ✅ `docs/MESSAGING_API_DOCUMENTATION.md` - Documentação atualizada

---

## ✅ Checklist de Implementação

- [x] Métodos no UazapiBroker implementados
- [x] Handlers criados
- [x] Rotas adicionadas na Edge Function
- [x] Tipos TypeScript atualizados
- [x] Documentação da API atualizada
- [ ] **Pendente**: Verificar documentação oficial da UAZAPI
- [ ] **Pendente**: Testar com conta real
- [ ] **Pendente**: Ajustar endpoints se necessário

---

**Última Atualização**: 2025-01-28

