# Guia: Configurar Meta App para OAuth

## 🎯 **Problema Atual**

O erro "URL bloqueada" ocorre porque o `redirect_uri` não está na lista de URIs permitidos no Meta App.

**URL atual sendo usada:**
```
http://localhost:5173/pt/auth/oauth/callback
```

## 📋 **Passo a Passo para Configurar**

### **1. Acessar Facebook Developers**

1. Acesse: https://developers.facebook.com/apps/
2. Faça login com sua conta Meta/Facebook
3. Selecione ou crie o app com ID: `1014767140181992`

### **2. Configurar OAuth Settings**

1. No menu lateral, vá em **Settings** > **Basic**
2. Role até a seção **"App Domains"**
3. Adicione os domínios:
   ```
   localhost
   adsmagic.com.br
   www.adsmagic.com.br
   ```

### **3. Adicionar Platform "Website"**

1. Ainda em **Settings** > **Basic**
2. Role até **"Add Platform"**
3. Clique em **"Website"**
4. Em **"Site URL"**, adicione:
   ```
   http://localhost:5173
   ```
   (Para produção, adicione: `https://adsmagic.com.br`)

### **4. Configurar Valid OAuth Redirect URIs**

1. No menu lateral, vá em **Products** > **Facebook Login** > **Settings**
2. Se não tiver o produto "Facebook Login", adicione:
   - Clique em **"Add Product"**
   - Selecione **"Facebook Login"**
   - Clique em **"Set Up"**

3. Em **"Valid OAuth Redirect URIs"**, adicione TODAS as URLs de callback:

#### **Para Desenvolvimento (localhost):**
```
http://localhost:5173/pt/auth/oauth/callback
http://localhost:5173/en/auth/oauth/callback
http://localhost:3000/pt/auth/oauth/callback
http://localhost:3000/en/auth/oauth/callback
http://127.0.0.1:5173/pt/auth/oauth/callback
http://127.0.0.1:3000/pt/auth/oauth/callback
```

#### **Para Produção:**
```
https://adsmagic.com.br/pt/auth/oauth/callback
https://adsmagic.com.br/en/auth/oauth/callback
https://www.adsmagic.com.br/pt/auth/oauth/callback
https://www.adsmagic.com.br/en/auth/oauth/callback
```

### **5. Habilitar OAuth Login**

1. Em **Facebook Login** > **Settings**
2. Certifique-se de que:
   - ✅ **"Client OAuth Login"** está **ON**
   - ✅ **"Web OAuth Login"** está **ON**
   - ✅ **"Use Strict Mode for Redirect URIs"** está **OFF** (para desenvolvimento)

### **6. Configurar App Domains (Opcional mas Recomendado)**

1. Em **Settings** > **Basic**
2. Em **"App Domains"**, adicione:
   ```
   localhost
   adsmagic.com.br
   www.adsmagic.com.br
   ```

### **7. Salvar e Aguardar**

1. Clique em **"Save Changes"**
2. ⚠️ **IMPORTANTE**: As mudanças podem levar alguns minutos para propagar
3. Aguarde 2-5 minutos antes de testar novamente

## 🔍 **Verificação Rápida**

Após configurar, verifique se:

- [ ] App ID está correto: `1014767140181992`
- [ ] "Facebook Login" está adicionado como produto
- [ ] "Client OAuth Login" está ON
- [ ] "Web OAuth Login" está ON
- [ ] URL `http://localhost:5173/pt/auth/oauth/callback` está na lista de "Valid OAuth Redirect URIs"
- [ ] Mudanças foram salvas

## 🚨 **Problemas Comuns**

### **Erro persiste após configurar**

1. **Limpar cache do navegador**
2. **Aguardar 5-10 minutos** (propagação do Meta)
3. **Verificar se URL está EXATAMENTE igual** (case-sensitive, sem trailing slash)
4. **Verificar se app está em modo "Development"** (não precisa de revisão)

### **App em modo "Live"**

Se o app estiver em modo "Live":
- Precisa passar por revisão do Meta
- Para desenvolvimento, mantenha em modo "Development"

### **URLs com porta diferente**

Se estiver usando outra porta (ex: `:5174`, `:8080`):
- Adicione TODAS as portas possíveis nas "Valid OAuth Redirect URIs"

## 📝 **Checklist Final**

Antes de testar novamente:

- [ ] App ID configurado: `1014767140181992`
- [ ] Facebook Login adicionado como produto
- [ ] Client OAuth Login: **ON**
- [ ] Web OAuth Login: **ON**
- [ ] Valid OAuth Redirect URIs contém: `http://localhost:5173/pt/auth/oauth/callback`
- [ ] App Domains configurado (localhost, adsmagic.com.br)
- [ ] Mudanças salvas
- [ ] Aguardou 2-5 minutos para propagação

## 🎯 **URLs para Adicionar (Resumo)**

Cole estas URLs em "Valid OAuth Redirect URIs":

```
http://localhost:5173/pt/auth/oauth/callback
http://localhost:5173/en/auth/oauth/callback
http://localhost:3000/pt/auth/oauth/callback
http://localhost:3000/en/auth/oauth/callback
https://adsmagic.com.br/pt/auth/oauth/callback
https://adsmagic.com.br/en/auth/oauth/callback
https://www.adsmagic.com.br/pt/auth/oauth/callback
https://www.adsmagic.com.br/en/auth/oauth/callback
```

## 🔗 **Links Úteis**

- **Facebook Developers Dashboard**: https://developers.facebook.com/apps/
- **Seu App**: https://developers.facebook.com/apps/1014767140181992/
- **Documentação OAuth Meta**: https://developers.facebook.com/docs/facebook-login/guides/advanced/manual-flow

