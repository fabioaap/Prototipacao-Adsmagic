# ✅ Implementação: Webhook Global UAZAPI

**Data**: 2025-01-28  
**Status**: ✅ **Concluído**  
**Versão**: 2.2

---

## 🎯 Objetivo

Implementar suporte a webhook global do UAZAPI, onde o sistema identifica a conta pelo `token` enviado no body do webhook, ao invés de usar header `x-account-id`.

---

## 📋 Regra de Negócio

### **Webhook Global UAZAPI**

**Fluxo:**
```
Webhook Global UAZAPI → POST com token no body → Sistema identifica conta pelo token → Processa mensagem
```

**Características:**
- ✅ Webhook único para todas as instâncias
- ✅ Identificação da conta via `token` no body
- ✅ Token corresponde ao `api_key` ou `access_token` da conta no banco
- ✅ Compatível com webhooks específicos (via header)

---

## 🔧 Implementação

### **1. Repository: Busca por Token**

**Arquivo**: `repositories/MessagingAccountRepository.ts`

**Método Adicionado:**
```typescript
async findByToken(
  token: string,
  brokerType?: string
): Promise<MessagingAccount | null>
```

**Funcionalidades:**
- ✅ Busca por `api_key` (prioridade)
- ✅ Busca por `access_token` (fallback)
- ✅ Filtro opcional por `broker_type`
- ✅ Retorna apenas contas ativas
- ✅ Logs parciais do token (segurança)

---

### **2. Account Resolver: Strategy Pattern**

**Arquivo**: `utils/account-resolver.ts` (novo)

**Interface:**
```typescript
interface AccountResolverStrategy {
  resolve(req: Request, body: unknown, accountRepo: MessagingAccountRepository): Promise<MessagingAccount | null>
  readonly name: string
}
```

**Implementações:**

#### **HeaderAccountResolver**
- Resolve conta por header `x-account-id`
- Usado para webhooks específicos por conta
- Prioridade: **Alta** (mais específico)

#### **TokenAccountResolver**
- Resolve conta por `token` no body
- Usado para webhooks globais (UAZAPI)
- Extrai token de diferentes formatos:
  - `token` (UAZAPI)
  - `instanceToken`
  - `instance_token`
- Detecta broker type automaticamente
- Prioridade: **Média** (fallback)

#### **AccountResolverFactory**
- Orquestra estratégias em ordem de prioridade
- Tenta header primeiro, depois token
- Retorna conta e estratégia usada (para logs)

---

### **3. Handler: Suporte a Ambos os Métodos**

**Arquivo**: `handlers/webhook.ts`

**Mudanças:**
- ✅ Removida obrigatoriedade de `x-account-id` header
- ✅ Usa `AccountResolverFactory` para identificar conta
- ✅ Suporta webhook global (token no body)
- ✅ Suporta webhook específico (header)
- ✅ Logs informativos sobre estratégia usada
- ✅ Mensagens de erro claras

**Fluxo Atualizado:**
```typescript
1. Ler body como texto
2. Parse JSON
3. Resolver conta (header ou token)
4. Validar assinatura (se configurado)
5. Filtrar mensagens ignoradas
6. Normalizar dados
7. Processar mensagem
```

---

## 📊 Comparação: Antes vs Depois

| Aspecto | Antes | Depois |
|---------|-------|--------|
| **Identificação** | Apenas por header `x-account-id` | Header OU token no body |
| **Webhook Global** | ❌ Não suportado | ✅ Suportado |
| **Flexibilidade** | Baixa | Alta |
| **Extensibilidade** | Média | Alta (Strategy Pattern) |
| **Logs** | Básicos | Detalhados (estratégia usada) |

---

## 🔄 Fluxo de Processamento

### **Cenário 1: Webhook Global UAZAPI**

```
POST /messaging/webhook
Body: { "token": "abc123...", "EventType": "messages", "message": {...} }

1. Parse body → { token: "abc123...", ... }
2. AccountResolverFactory.resolve()
   - HeaderAccountResolver → null (sem header)
   - TokenAccountResolver → busca por token "abc123..."
   - Encontra conta com api_key = "abc123..."
3. Processa mensagem normalmente
```

### **Cenário 2: Webhook Específico (Header)**

```
POST /messaging/webhook
Headers: { "x-account-id": "uuid-123" }
Body: { "message": {...} }

1. Parse body → { message: {...} }
2. AccountResolverFactory.resolve()
   - HeaderAccountResolver → busca por ID "uuid-123"
   - Encontra conta
3. Processa mensagem normalmente
```

---

## 🧪 Testes Necessários

### **Testes Unitários**

1. **MessagingAccountRepository.findByToken()**
   - ✅ Busca por `api_key`
   - ✅ Busca por `access_token` (fallback)
   - ✅ Filtro por `broker_type`
   - ✅ Retorna null se não encontrar
   - ✅ Logs parciais do token

2. **TokenAccountResolver**
   - ✅ Extrai token de diferentes formatos
   - ✅ Detecta broker type automaticamente
   - ✅ Retorna conta encontrada
   - ✅ Retorna null se token não encontrado

3. **HeaderAccountResolver**
   - ✅ Extrai `x-account-id` do header
   - ✅ Busca conta por ID
   - ✅ Retorna null se header não existe

4. **AccountResolverFactory**
   - ✅ Prioriza header sobre token
   - ✅ Usa token como fallback
   - ✅ Retorna estratégia usada

### **Testes de Integração**

1. **Webhook Global UAZAPI**
   - ✅ Enviar webhook com token no body
   - ✅ Verificar identificação correta da conta
   - ✅ Verificar processamento da mensagem

2. **Webhook Específico**
   - ✅ Enviar webhook com header `x-account-id`
   - ✅ Verificar identificação correta da conta
   - ✅ Verificar processamento da mensagem

3. **Compatibilidade**
   - ✅ Ambos os métodos funcionam
   - ✅ Logs corretos
   - ✅ Erros claros quando conta não encontrada

---

## 📝 Exemplo de Uso

### **Webhook Global UAZAPI**

```bash
curl -X POST https://your-project.supabase.co/functions/v1/messaging/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "token": "2bb07e81-dfe3-414b-8e43-695030cb1c44",
    "EventType": "messages",
    "message": {
      "chatid": "554791662434@s.whatsapp.net",
      "text": "Olá!",
      "fromMe": false,
      ...
    },
    "owner": "554796772041"
  }'
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "processed": true
  }
}
```

### **Webhook Específico (Header)**

```bash
curl -X POST https://your-project.supabase.co/functions/v1/messaging/webhook \
  -H "Content-Type: application/json" \
  -H "x-account-id: uuid-da-conta" \
  -d '{
    "message": {
      "chatid": "554791662434@s.whatsapp.net",
      "text": "Olá!",
      ...
    }
  }'
```

---

## 🔒 Segurança

### **Considerações**

1. **Token no Body**
   - ✅ Token é logado parcialmente (primeiros 10 caracteres)
   - ✅ Busca é otimizada por `broker_type` quando possível
   - ✅ Apenas contas ativas são retornadas

2. **Validação de Assinatura**
   - ✅ Mantida para ambos os métodos
   - ✅ Funciona com webhook global e específico

3. **Logs**
   - ✅ Não expõem token completo
   - ✅ Incluem estratégia usada para debug
   - ✅ Informativos sobre falhas

---

## ✅ Checklist de Implementação

- [x] Adicionar `findByToken()` no repository
- [x] Criar `AccountResolverStrategy` interface
- [x] Implementar `HeaderAccountResolver`
- [x] Implementar `TokenAccountResolver`
- [x] Criar `AccountResolverFactory`
- [x] Atualizar handler para usar resolver
- [x] Manter compatibilidade com header
- [x] Adicionar logs informativos
- [x] Verificar linter (sem erros)
- [ ] Testes unitários
- [ ] Testes de integração
- [x] Documentação atualizada

---

## 📚 Arquivos Modificados/Criados

### **Modificados:**
1. `repositories/MessagingAccountRepository.ts`
   - Adicionado `findByToken()`

2. `handlers/webhook.ts`
   - Atualizado para usar `AccountResolverFactory`
   - Removida obrigatoriedade de header

### **Criados:**
1. `utils/account-resolver.ts`
   - Interface `AccountResolverStrategy`
   - `HeaderAccountResolver`
   - `TokenAccountResolver`
   - `AccountResolverFactory`

---

## 🎉 Conclusão

Implementação concluída com sucesso:

✅ **Webhook global suportado** - Identifica conta por token no body  
✅ **Compatibilidade mantida** - Header ainda funciona  
✅ **Strategy Pattern** - Extensível e testável  
✅ **Logs informativos** - Facilita debug  
✅ **Segurança** - Tokens não expostos completamente  

**Status**: 🟢 **Pronto para Testes**

---

## 🔄 Próximos Passos

1. **Testes**: Implementar testes unitários e de integração
2. **Monitoramento**: Adicionar métricas de qual estratégia é mais usada
3. **Otimização**: Cache de busca por token (se necessário)
4. **Documentação**: Atualizar documentação da API
