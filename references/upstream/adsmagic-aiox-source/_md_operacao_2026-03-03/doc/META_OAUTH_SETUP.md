# Configuração do Meta OAuth - Supabase Edge Functions

## Problema

O erro `"Failed to exchange token: Meta OAuth credentials not configured"` indica que as variáveis de ambiente necessárias não estão configuradas no Supabase.

## Variáveis Necessárias

As seguintes variáveis de ambiente precisam ser configuradas na Edge Function `integrations`:

### Obrigatórias:
- `META_OAUTH_CLIENT_ID` - Client ID do seu app Meta/Facebook
- `META_OAUTH_CLIENT_SECRET` - Client Secret do seu app Meta/Facebook

### Opcionais (com valores padrão):
- `META_OAUTH_API_VERSION` - Versão da API Meta (padrão: `v23.0`)
- `META_OAUTH_REDIRECT_URI` - URI de redirecionamento (pode vir do body da requisição)
- `META_OAUTH_SCOPE` - Scopes OAuth (padrão: `ads_read,business_management,ads_management`)

## Como Configurar

### Passo 1: Obter Credenciais do Meta

1. Acesse o [Meta for Developers](https://developers.facebook.com/)
2. Vá para **My Apps** → Seu App
3. Vá para **Settings** → **Basic**
4. Copie o **App ID** (será o `META_OAUTH_CLIENT_ID`)
5. Vá para **Settings** → **Advanced** → **Security**
6. Copie o **App Secret** (será o `META_OAUTH_CLIENT_SECRET`)

### Passo 2: Configurar no Supabase Dashboard

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto: `nitefyufrzytdtxhaocf`
3. Vá para **Edge Functions** no menu lateral
4. Clique na função `integrations`
5. Vá para a aba **Settings** ou **Secrets**
6. Clique em **Add Secret** ou **Manage Secrets**

### Passo 3: Adicionar Secrets

Adicione cada uma das seguintes variáveis:

#### META_OAUTH_CLIENT_ID
- **Name**: `META_OAUTH_CLIENT_ID`
- **Value**: Seu App ID do Meta
- **Type**: Secret (não será exibido)

#### META_OAUTH_CLIENT_SECRET
- **Name**: `META_OAUTH_CLIENT_SECRET`
- **Value**: Seu App Secret do Meta
- **Type**: Secret (não será exibido)

#### META_OAUTH_REDIRECT_URI (Opcional)
- **Name**: `META_OAUTH_REDIRECT_URI`
- **Value**: `https://[seu-dominio]/pt/auth/oauth/callback`
- **Exemplo**: `https://adsmagic-frontend.pages.dev/pt/auth/oauth/callback`
- **Nota**: Pode ser omitido se for enviado no body da requisição

#### META_OAUTH_API_VERSION (Opcional)
- **Name**: `META_OAUTH_API_VERSION`
- **Value**: `v23.0` (ou a versão mais recente)
- **Nota**: Se não configurado, usa `v23.0` como padrão

#### META_OAUTH_SCOPE (Opcional)
- **Name**: `META_OAUTH_SCOPE`
- **Value**: `ads_read,business_management,ads_management`
- **Nota**: Se não configurado, usa o valor padrão acima

### Passo 4: Verificar Configuração

Após adicionar os secrets, você pode verificar se estão configurados:

1. No Supabase Dashboard, vá para **Edge Functions** → `integrations`
2. Verifique se os secrets aparecem na lista (valores não serão exibidos por segurança)
3. Faça um novo deploy da função se necessário

## Configuração do Redirect URI no Meta App

Além de configurar no Supabase, você também precisa configurar o Redirect URI no Meta App:

1. No [Meta for Developers](https://developers.facebook.com/), vá para seu App
2. Vá para **Settings** → **Basic**
3. Em **Add Platform**, selecione **Website** (se ainda não tiver)
4. Em **Site URL**, adicione: `https://[seu-dominio]`
5. Em **Valid OAuth Redirect URIs**, adicione:
   - `https://[seu-dominio]/pt/auth/oauth/callback`
   - `https://[seu-dominio]/en/auth/oauth/callback`
   - (Adicione para todos os locales que você suporta)

## Teste Após Configuração

Após configurar os secrets:

1. Tente conectar o Meta OAuth novamente
2. O erro `"Meta OAuth credentials not configured"` não deve mais aparecer
3. Se aparecer outro erro, verifique os logs da Edge Function no Supabase Dashboard

## Troubleshooting

### Erro persiste após configurar
- Verifique se os nomes das variáveis estão exatamente como especificado (case-sensitive)
- Verifique se os valores foram salvos corretamente
- Faça um novo deploy da Edge Function
- Verifique os logs da Edge Function no Supabase Dashboard

### Erro "Invalid redirect URI"
- Verifique se o Redirect URI configurado no Meta App corresponde exatamente ao usado no código
- Verifique se o protocolo está correto (https, não http)
- Verifique se não há trailing slashes extras

### Erro "Invalid client_id"
- Verifique se o App ID está correto
- Verifique se o App está no modo correto (Development/Production)

## Referências

- [Meta OAuth Documentation](https://developers.facebook.com/docs/facebook-login/guides/advanced/manual-flow)
- [Supabase Edge Functions Secrets](https://supabase.com/docs/guides/functions/secrets)
- [Meta App Settings](https://developers.facebook.com/apps/)

