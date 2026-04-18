# ✅ Atualização: Postman Collection - Novo Endpoint de Conexão

**Data**: 2025-01-28  
**Status**: ✅ **ATUALIZADO**

---

## 🆕 Novo Endpoint Adicionado

### **POST** `/messaging/connect/:accountId`

**Localização na Collection:**
- Seção: **🔗 Messaging - Conexão (QR Code/Pair Code)**
- Nome: **"Conectar Instância (QR Code ou Pair Code)"**

---

## 📋 Funcionalidades do Novo Endpoint

### **Comportamento:**
- **Sem phone no body** (ou body vazio): Gera QR Code (timeout 2 minutos)
- **Com phone no body**: Gera Pair Code (timeout 5 minutos)
- Atualiza status da conta para "connecting"

### **Autenticação:**
- Requer JWT Token (Bearer Token)
- Header: `Authorization: Bearer {{jwt_token}}`

### **Body (JSON):**
```json
{
  "phone": "5511999999999"  // Opcional - se não passar, gera QR Code
}
```

---

## 📝 Exemplos de Uso

### **1. Gerar QR Code (sem phone)**
```json
{}
```
ou
```json
{
  "phone": ""
}
```

**Resposta esperada:**
```json
{
  "success": true,
  "type": "qrcode",
  "data": {
    "qrCode": "data:image/png;base64,...",
    "expiresAt": "2025-01-28T12:00:00.000Z",
    "instanceId": "ra03d1256ebb36c"
  },
  "message": "Escaneie o QR Code com seu WhatsApp para conectar (expira em 2 minutos)"
}
```

### **2. Gerar Pair Code (com phone)**
```json
{
  "phone": "5511999999999"
}
```

**Resposta esperada:**
```json
{
  "success": true,
  "type": "paircode",
  "data": {
    "code": "ABC-123-DEF",
    "expiresAt": "2025-01-28T12:05:00.000Z",
    "instanceId": "ra03d1256ebb36c",
    "phone": "5511999999999"
  },
  "message": "Use este código no WhatsApp: Configurações > Aparelhos conectados > Conectar um aparelho (expira em 5 minutos)"
}
```

---

## ✅ Testes Automáticos Incluídos

O endpoint inclui testes automáticos que verificam:
- ✅ Status code 200
- ✅ Resposta tem `success: true`
- ✅ Resposta tem `type` ('qrcode' ou 'paircode')
- ✅ Logs informativos no console

---

## 📋 Endpoints de Conexão Disponíveis

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/messaging/qrcode/:accountId` | Gera QR Code (sempre) |
| GET | `/messaging/paircode/:accountId` | Gera Pair Code (phone opcional) |
| **POST** | **`/messaging/connect/:accountId`** | **🆕 Conecta (QR ou Pair Code via body)** |

---

## 🎯 Como Usar no Postman

1. **Importe a Collection atualizada:**
   - Abra Postman
   - File → Import
   - Selecione `MESSAGING_POSTMAN_COLLECTION.json`

2. **Configure as Variáveis de Ambiente:**
   - `messaging_account_id`: ID da conta de mensageria
   - `jwt_token`: Token JWT do usuário autenticado
   - `messaging_phone_to`: Número de telefone (opcional, para Pair Code)

3. **Teste o Novo Endpoint:**
   - Navegue até: **🔗 Messaging - Conexão (QR Code/Pair Code)**
   - Selecione: **"Conectar Instância (QR Code ou Pair Code)"**
   - Para QR Code: Deixe o body vazio ou `{}`
   - Para Pair Code: Adicione `{"phone": "5511999999999"}` no body
   - Clique em **Send**

---

## ✅ Status

- ✅ Novo endpoint adicionado na collection
- ✅ Testes automáticos configurados
- ✅ Documentação completa na descrição
- ✅ Exemplos de uso incluídos
- ✅ JSON validado e funcionando

---

**📖 Collection atualizada e pronta para uso!**

