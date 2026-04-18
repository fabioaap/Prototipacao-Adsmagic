# 🔐 Guia: Configurar Autenticação UAZAPI

**Data**: 2025-01-28  
**Status**: Guia de Resolução de Erro "Unauthorized"

---

## ❌ Erro Encontrado

Ao testar o endpoint "Criar Instância UAZAPI", você recebeu:

```json
{
  "error": "Unauthorized"
}
```

---

## ✅ Solução

O erro ocorre porque o endpoint `/instance/init` **requer autenticação**. A UAZAPI precisa de um **Admin Token** para criar instâncias.

**Header correto:** `admintoken: {seu-admin-token}`

---

## 📋 Passo a Passo para Resolver

### **Passo 1: Criar Conta na UAZAPI**

1. Acesse: **https://uazapi.com**
2. Crie uma conta ou faça login
3. Acesse o **Painel/Dashboard**

### **Passo 2: Obter Admin Token**

1. No painel da UAZAPI, procure por:
   - **"Admin Token"**
   - **"API Keys"**
   - **"Configurações"**
   - **"Minha Conta"**
   - **"Integrações"**

2. Gere ou copie seu **Admin Token** (token de administrador usado para criar e gerenciar instâncias)

### **Passo 3: Configurar no Postman**

1. Abra o Postman
2. Certifique-se de que o Environment "Adsmagic Backend - Local" está selecionado
3. Clique no ícone de **olho** (👁️) no canto superior direito
4. Clique em **"Edit"** ao lado do environment
5. Localize a variável `uazapi_master_apikey`
6. Cole seu **Admin Token** da UAZAPI
7. Clique em **"Save"**

**OU** configure diretamente na collection:

1. Abra o request "Criar Instância UAZAPI"
2. Na aba **Headers**
3. Localize o header `admintoken`
4. Substitua `{{uazapi_master_apikey}}` pelo valor real do seu Admin Token

---

## 🔄 Alternativas de Autenticação

Se a autenticação via `apikey` no header não funcionar, a UAZAPI pode usar outros métodos:

**Header Correto:**
```
admintoken: {seu-admin-token-aqui}
```

A collection do Postman já está configurada com este header. Você só precisa:
1. Obter seu Admin Token na UAZAPI
2. Configurar a variável `uazapi_master_apikey` no Environment
3. Testar novamente

---

## 📝 Configuração no Environment

A variável já foi adicionada ao Environment:

```json
{
  "key": "uazapi_master_apikey",
  "value": "",
  "type": "secret",
  "enabled": true,
  "description": "Admin Token da UAZAPI (necessário para criar instâncias)"
}
```

**Você só precisa:**
1. Obter seu Admin Token da UAZAPI
2. Colar no valor da variável no Postman Environment
3. O header `admintoken` será usado automaticamente

---

## 🧪 Testar Após Configurar

1. Certifique-se de que `uazapi_master_apikey` está configurada
2. Execute novamente o request "Criar Instância UAZAPI"
3. Se ainda receber erro, tente as alternativas acima

---

## 📚 Documentação UAZAPI

Consulte a documentação oficial para detalhes de autenticação:

- **Documentação**: https://docs.uazapi.com/
- **Painel**: https://uazapi.com/dashboard (ou similar)

---

## ⚠️ Notas Importantes

1. **Admin Token vs API Key da Instância:**
   - **Admin Token**: Usado para criar/gerenciar instâncias (o que você precisa agora) - Header: `admintoken`
   - **API Key da Instância**: Retornada após criar a instância, usada para operações específicas da instância

2. **Segurança:**
   - Nunca compartilhe seu Admin Token
   - Não commite em código
   - Use variáveis de ambiente (já configurado no Postman)

3. **Erro Persistente:**
   - Verifique se a conta UAZAPI está ativa
   - Confirme se o Admin Token está correto (sem espaços extras)
   - Verifique se o header está como `admintoken` (não `apikey`)
   - Consulte a documentação oficial da UAZAPI

---

## ✅ Checklist

- [ ] Criada conta na UAZAPI
- [ ] Obtido Admin Token
- [ ] Configurada variável `uazapi_master_apikey` no Postman Environment com o Admin Token
- [ ] Verificado que o header está como `admintoken` (não `apikey`)
- [ ] Testado novamente o endpoint "Criar Instância UAZAPI"
- [ ] Sucesso!

---

**Última Atualização**: 2025-01-28

**Status da Collection**: ✅ Atualizada com autenticação

