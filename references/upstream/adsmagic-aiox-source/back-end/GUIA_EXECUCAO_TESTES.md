# 🧪 Guia de Execução de Testes

## 📋 Pré-requisitos

### **Instalar Deno**

O Deno é necessário para executar os testes das Edge Functions do Supabase.

#### **macOS/Linux:**
```bash
curl -fsSL https://deno.land/install.sh | sh
```

#### **Windows (PowerShell):**
```powershell
irm https://deno.land/install.ps1 | iex
```

#### **Verificar Instalação:**
```bash
deno --version
```

---

## 🚀 Executar Testes

### **Executar Todos os Testes:**
```bash
cd back-end
deno test --allow-all supabase/functions/messaging/tests/
```

### **Executar Teste Específico:**
```bash
# Testes de validação
deno test --allow-all supabase/functions/messaging/tests/validation.test.ts

# Testes de resposta
deno test --allow-all supabase/functions/messaging/tests/response.test.ts

# Testes de rate limiting
deno test --allow-all supabase/functions/messaging/tests/rate-limiter.test.ts

# Testes de webhook global
deno test --allow-all supabase/functions/messaging/tests/webhook-global.test.ts

# Testes de webhook por conta
deno test --allow-all supabase/functions/messaging/tests/webhook-by-account.test.ts

# Testes de webhook processor
deno test --allow-all supabase/functions/messaging/tests/webhook-processor.test.ts
```

### **Executar com Cobertura:**
```bash
deno test --allow-all --coverage=coverage supabase/functions/messaging/tests/
deno coverage coverage
```

### **Executar com Output Detalhado:**
```bash
deno test --allow-all --verbose supabase/functions/messaging/tests/
```

---

## 📊 Testes Disponíveis

### **1. validation.test.ts**
- ✅ Validação de UUID v4
- ✅ Validação de broker types
- ✅ Validação de JSON
- ✅ Validação de status de conta

### **2. response.test.ts**
- ✅ Resposta vazia 2xx (requisito de webhooks)
- ✅ Resposta de sucesso
- ✅ Resposta de erro

### **3. rate-limiter.test.ts**
- ✅ Rate limiting dentro do limite
- ✅ Rate limiting acima do limite
- ✅ RetryAfter quando bloqueado

### **4. webhook-global.test.ts**
- ✅ Validação de broker type
- ✅ Validação de body
- ✅ Validação de JSON
- ✅ Conta não encontrada

### **5. webhook-by-account.test.ts**
- ✅ Validação de UUID
- ✅ Validação de broker type
- ✅ Validação de body
- ✅ Conta não encontrada

### **6. webhook-processor.test.ts**
- ✅ Resposta vazia 2xx após processar
- ✅ Requisito: "HTTP_SUCCESS (code: 2xx) with an empty response"

---

## 🔍 Validação Manual (Sem Deno)

Se o Deno não estiver disponível, você pode validar os testes manualmente:

### **1. Verificar Sintaxe:**
```bash
# Verificar se os arquivos TypeScript são válidos
# (requer TypeScript instalado)
tsc --noEmit supabase/functions/messaging/tests/*.ts
```

### **2. Verificar Estrutura:**
- ✅ Todos os testes importam `assertEquals` ou `assertExists`
- ✅ Todos os testes usam `Deno.test()`
- ✅ Todos os testes têm nomes descritivos
- ✅ Todos os testes seguem padrão AAA (Arrange, Act, Assert)

---

## 📝 Notas

### **Mocks Necessários:**
Alguns testes requerem mocks do Supabase client. Os mocks estão implementados nos próprios arquivos de teste.

### **Testes de Integração:**
Os testes atuais são **unitários**. Testes de integração completos requerem:
- Banco de dados Supabase configurado
- Contas de teste criadas
- Tokens de teste válidos

---

## ✅ Checklist de Execução

- [ ] Deno instalado (`deno --version`)
- [ ] Navegar para pasta `back-end`
- [ ] Executar `deno test --allow-all supabase/functions/messaging/tests/`
- [ ] Verificar que todos os testes passam
- [ ] Verificar cobertura (opcional)

---

## 🐛 Troubleshooting

### **Erro: "deno: command not found"**
- Instale o Deno seguindo as instruções acima
- Adicione Deno ao PATH se necessário

### **Erro: "Permission denied"**
- Use `--allow-all` flag para permitir todas as permissões

### **Erro: "Module not found"**
- Verifique se está na pasta correta (`back-end`)
- Verifique se os imports estão corretos

---

## 📚 Referências

- [Deno Testing](https://deno.land/manual/testing)
- [Deno Installation](https://deno.land/manual/getting_started/installation)
