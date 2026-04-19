# ⚡ Resolução Rápida: Erro "Unauthorized" UAZAPI

## 🔴 Problema

Ao testar "Criar Instância UAZAPI" no Postman, você recebeu:

```json
{
  "error": "Unauthorized"
}
```

---

## ✅ Solução Rápida (2 minutos)

### **1. Obter Admin Token**

1. Acesse: **https://uazapi.com**
2. Crie conta ou faça login
3. No painel, encontre seu **Admin Token**

### **2. Configurar no Postman**

1. Abra Postman → Environment: "Adsmagic Backend - Local"
2. Clique em **👁️ (eye icon)** → **Edit**
3. Encontre `uazapi_master_apikey`
4. Cole seu **Admin Token**
5. Clique **Save**

### **3. Testar Novamente**

Execute novamente o request "Criar Instância UAZAPI"

---

## 📋 Collection Atualizada

✅ A collection já foi atualizada com:
- Header `admintoken` configurado (correto!)
- Variável `uazapi_master_apikey` no Environment
- Instruções na descrição do endpoint

**Importante:** O header correto é `admintoken`, não `apikey`!

---

## 📚 Mais Informações

Veja o guia completo: `UAZAPI_AUTENTICACAO_SETUP.md`

---

**✅ Pronto!** Configure o Admin Token e teste novamente.

**Lembre-se:** O header correto é `admintoken` (já configurado na collection).

