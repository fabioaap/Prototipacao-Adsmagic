# Customizar emails de autenticação do Supabase

Este guia explica como deixar os emails enviados pelo Supabase (confirmação de cadastro, recuperação de senha, magic link, etc.) mais bonitos e alinhados à marca AdsMagic.

---

## Opção 1: Dashboard (projeto hospedado) — recomendado

1. Acesse o **Supabase Dashboard** do seu projeto.
2. Vá em **Authentication** → **Email Templates**.
3. Edite cada template (Confirm signup, Magic link, Reset password, Invite, Change email, Reauthentication).
4. Altere o **Subject** e o **Body** (HTML permitido).

**Variáveis disponíveis (sintaxe Go template):**

| Variável | Uso |
|----------|-----|
| `{{ .ConfirmationURL }}` | Link completo de confirmação (ex.: verificar email, resetar senha) |
| `{{ .Token }}` | Código OTP de 6 dígitos (alternativa ao link) |
| `{{ .TokenHash }}` | Token hasheado para montar seu próprio link |
| `{{ .SiteURL }}` | URL do app (configurada em Auth → URL Configuration) |
| `{{ .RedirectTo }}` | URL de redirecionamento passada na chamada |
| `{{ .Email }}` | Email do usuário |
| `{{ .NewEmail }}` / `{{ .OldEmail }}` | (Change email / notificações) |
| `{{ .Data }}` | Metadados do usuário (`user_metadata`) para personalização |

**Dica:** Cole o HTML dos arquivos em `supabase/templates/` (ver opção 2) no Body do Dashboard. Ajuste textos e links conforme cada tipo de email.

---

## Opção 2: Desenvolvimento local (config.toml + arquivos HTML)

Para ambiente local você pode usar templates em arquivos e referenciá-los no `config.toml`.

1. Crie os arquivos em `back-end/supabase/templates/` (ex.: `confirmation.html`, `recovery.html`).
2. No `config.toml`, descomente e configure por tipo:

```toml
[auth.email.template.confirmation]
subject = "Confirme seu cadastro no AdsMagic"
content_path = "./supabase/templates/confirmation.html"

[auth.email.template.recovery]
subject = "Redefinir sua senha - AdsMagic"
content_path = "./supabase/templates/recovery.html"

[auth.email.template.magic_link]
subject = "Seu link de acesso - AdsMagic"
content_path = "./supabase/templates/magic_link.html"

[auth.email.template.invite]
subject = "Você foi convidado para o AdsMagic"
content_path = "./supabase/templates/invite.html"

[auth.email.template.email_change]
subject = "Confirme sua nova conta de email - AdsMagic"
content_path = "./supabase/templates/email_change.html"

[auth.email.template.reauthentication]
subject = "Confirme sua identidade - AdsMagic"
content_path = "./supabase/templates/reauthentication.html"
```

3. Reinicie o Supabase local (`supabase stop` e `supabase start`) após alterar o `config.toml`.

**Nota:** No projeto **hospedado**, templates são configurados pelo Dashboard (ou Management API). O `content_path` do `config.toml` vale apenas para o Supabase rodando localmente.

---

## Opção 3: SMTP customizado (enviar do seu domínio)

Para usar seu próprio domínio e remetente (ex.: `noreply@adsmagic.com.br`):

1. No Dashboard: **Project Settings** → **Auth** → **SMTP Settings**.
2. Habilite **Custom SMTP** e preencha host, porta, usuário, senha (ou variável de ambiente).
3. Defina **Sender name** (ex.: "AdsMagic") e **Sender email**.

Serviços comuns: SendGrid, Resend, Amazon SES, Mailgun. Isso não altera o visual do email; o visual continua sendo o que você definir no Body dos templates (Opção 1 ou 2).

---

## Limitações importantes

- **Prefetch de links:** Alguns clientes de email (ex.: Microsoft Safe Links) podem “abrir” o link antes do usuário. Se isso quebrar o token, use no template o código **OTP** `{{ .Token }}` e uma tela no app onde o usuário digita o código (ex.: `verifyOtp`).
- **Rastreamento de email:** Se o provedor reescrever links para rastreamento, o link de confirmação pode parar de funcionar. Desative “email tracking” no provedor quando possível.
- **Redirect server-side:** Se precisar redirecionar para um endpoint seu para tratar sessão no servidor, use um link customizado no template que aponte para esse endpoint, passando `token_hash`, `type` e `redirect_to` na query. Documentação: [Server-side rendering](https://supabase.com/docs/guides/auth/server-side-rendering).

---

## Referências

- [Email Templates (Supabase Docs)](https://supabase.com/docs/guides/auth/auth-email-templates)
- [Customizing email templates (local)](https://supabase.com/docs/guides/local-development/customizing-email-templates)
- [Custom SMTP](https://supabase.com/docs/guides/auth/auth-smtp)
- [Management API](https://supabase.com/docs/guides/auth/auth-email-templates#editing-email-templates) (atualizar templates via API)

**Templates disponíveis em `back-end/supabase/templates/`:**

| Arquivo | Uso no Supabase |
|---------|------------------|
| `confirmation.html` | Confirm sign up |
| `recovery.html` | Reset password |
| `magic_link.html` | Magic link |
| `invite.html` | Invite user |
| `email_change.html` | Change email address |
| `reauthentication.html` | Reauthentication |
