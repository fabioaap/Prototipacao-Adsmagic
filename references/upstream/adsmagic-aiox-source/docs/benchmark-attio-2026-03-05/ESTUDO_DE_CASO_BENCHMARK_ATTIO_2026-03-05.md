# Estudo de Caso - Benchmark de Jornada de Cadastro/Autenticacao da Attio

Data: 2026-03-05
Produto analisado: Attio (`https://app.attio.com`)
Objetivo: mapear a jornada real de cadastro/login, documentar friccoes e registrar evidencias visuais.

## Escopo e metodo

- Mapeamento da jornada publica (sem acesso interno ao produto apos login).
- Teste de dois caminhos principais de entrada:
  - OAuth Google (`Sign in with Google`)
  - Email com senha temporaria (`Continue`)
- Captura de screenshots em cada etapa chave.

## Evidencias (prints)

Pasta: `docs/benchmark-attio-2026-03-05`

1. `01-attio-signin.png` - Tela inicial de login da Attio.
2. `02-google-account-chooser.png` - Seletor de conta do Google apos clique em OAuth.
3. `03-google-identifier-step.png` - Etapa de identificacao do Google (usar outra conta).
4. `04-google-password-step.png` - Etapa de senha do Google para o email informado.
5. `05-google-invalid-password.png` - Retorno de senha incorreta no Google.
6. `06-attio-signin-return.png` - Retorno para tela de login da Attio.
7. `07-attio-temp-password-step.png` - Etapa de senha temporaria por email na Attio.
8. `08-attio-temp-password-invalid.png` - Erro de senha temporaria incorreta.

## Jornada observada

### 1) Entrada na Attio

- URL: `/auth/sign-in`
- CTA principal 1: `Sign in with Google`
- CTA principal 2: campo de email + `Continue`
- Links secundarios: `Terms and Conditions`, `Privacy Policy`, `Support`
- Widget de suporte via Intercom acessivel na mesma tela.

### 2) Caminho A - OAuth Google

1. Usuario clica em `Sign in with Google`.
2. Sistema redireciona para `accounts.google.com`.
3. Fluxo passa por:
   - Seletor de contas
   - Identificacao de conta
   - Entrada de senha
4. Resultado no teste:
   - O Google retornou `Senha incorreta` para a tentativa feita.
   - Sem autenticacao Google valida, o fluxo nao retorna autenticado para a Attio.

### 3) Caminho B - Email + senha temporaria

1. Usuario informa email e clica `Continue`.
2. Attio redireciona para `/auth/temporary-password?email=...`.
3. Sistema informa envio de senha temporaria para inbox.
4. Usuario precisa inserir a senha temporaria recebida e clicar `Continue`.
5. Resultado no teste:
   - A senha informada no campo foi recusada com `Temporary password is incorrect`.

## Diagnostico principal do bloqueio

- O ponto em que o fluxo ficou bloqueado foi a validacao de credenciais externas (Google) e da senha temporaria da propria Attio.
- Na tela de `temporary password`, a plataforma espera um token/senha temporaria emitido por email naquele momento. Essa etapa nao utiliza a senha da conta Google.
- Sem acesso ao inbox para recuperar a senha temporaria vigente, nao foi possivel concluir o cadastro/login ponta a ponta.

## Benchmark UX - Insights

### O que a Attio faz bem

1. Fluxo de entrada enxuto com apenas dois caminhos principais.
2. Microcopy clara na etapa de senha temporaria (`Check your inbox`).
3. Rapida recuperacao de contexto: email fica travado na etapa seguinte, reduz erro de digitacao.
4. Suporte contextual (Intercom) acessivel sem sair da tela de autenticacao.

### Friccoes percebidas

1. Ambiguidade semantica entre "senha de conta" e "senha temporaria" para alguns usuarios.
2. Falta de CTA explicito de `reenviar senha temporaria` na area imediatamente visivel (no estado observado).
3. Erro de senha invalida sem ajuda direta sobre expiração/tempo de validade do codigo.

### Oportunidades para benchmark no AdsMagic

1. Diferenciar visualmente "senha da conta" vs "codigo temporario" com labels e exemplos.
2. Exibir contador de validade do codigo temporario + botao de reenvio evidente.
3. Oferecer fallback rapido: `Entrar com Google` e `Receber novo codigo` na mesma tela de erro.
4. Incluir feedback orientado a acao em erros, por exemplo: `Codigo expirado? Reenviar agora`.

## Mapa resumido da jornada (ASCII)

`/auth/sign-in`

- Opcao 1: `Sign in with Google`
- `Google Account Chooser`
- `Google Password`
- Se valido: retorna autenticado
- Se invalido: erro Google e bloqueio

- Opcao 2: `Email + Continue`
- `/auth/temporary-password`
- Inserir senha temporaria enviada ao email
- Se valida: autentica
- Se invalida: `Temporary password is incorrect`

## Limitacoes deste estudo

1. Nao houve acesso ao inbox para recuperar senha temporaria atual.
2. Nao foi possivel completar o onboarding interno da Attio sem autenticacao valida.
3. O estudo cobre a jornada publica de autenticacao, nao os fluxos internos apos login.

## Proximo passo recomendado para fechar o benchmark

1. Recuperar a senha temporaria valida no email testado e repetir a etapa `temporary password`.
2. Com login concluido, mapear onboarding inicial, criacao de workspace, importacao de contatos e navegacao base.
3. Registrar segunda rodada de prints para benchmark comparativo (pre-login vs pos-login).
