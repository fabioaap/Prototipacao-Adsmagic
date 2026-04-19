# Criação automática de venda ao alterar etapa do contato

## Opções avaliadas

### 1. Função buscar o secret quando for acionada

- **Ideia:** A Edge Function **sales** não receberia o token na request; ao ser acionada, leria o secret do ambiente (`Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')`).
- **Problema:** A sales já faz isso. O 401 ocorria porque **quem envia a request** é a contacts: ela precisa enviar algum token no `Authorization` para a sales aceitar. Se a sales “só buscasse o secret quando acionada”, ela não saberia se a chamada veio da contacts ou de um cliente externo — então não dá para confiar só em “buscar o secret ao ser acionada” sem um critério de **quem** está chamando (por exemplo comparar o token recebido com o secret). Ou seja, o secret continua necessário na **sales** para comparar com o `Authorization` enviado pela **contacts**; o ponto crítico era o secret estar disponível no ambiente da função **sales** e ser o mesmo valor usado pela **contacts**.

### 2. Trigger no banco (escolhida)

- **Ideia:** Em vez de contacts chamar a Edge Function sales via HTTP, um **trigger** em `contacts` (AFTER INSERT OR UPDATE OF current_stage_id) verifica se o novo `current_stage_id` aponta para um estágio com `type = 'sale'` e, nesse caso, insere diretamente em `sales`.
- **Vantagens:**
  - Não precisa compartilhar `SUPABASE_SERVICE_ROLE_KEY` entre Edge Functions.
  - Não há chamada HTTP entre funções (menos latência e menos pontos de falha).
  - Lógica “quando o dado muda, faça X” fica no banco, próximo dos dados.
  - Uma única fonte de verdade; invalidação de cache já existente (INSERT em `sales`) continua funcionando.
- **Implementação:** Migration `047_auto_sale_on_contact_stage.sql` + remoção da chamada a `createSaleForStageTransition` nos handlers de create e update de contacts.

## Implementação atual (trigger)

- **Migration:** `back-end/supabase/migrations/047_auto_sale_on_contact_stage.sql`
  - Função `create_sale_on_contact_stage_sale()` (SECURITY DEFINER).
  - Trigger `contacts_auto_sale_on_stage_sale`: AFTER INSERT OR UPDATE OF current_stage_id ON contacts.
- **Edge Function contacts:** não chama mais a Edge Function sales; a venda é criada pelo trigger ao inserir/atualizar o contato para um estágio tipo `sale`.

## Rollback

- Reverter a migration 047 (DROP TRIGGER + DROP FUNCTION).
- Restaurar nos handlers de contacts a chamada a `createSaleForStageTransition` e garantir que a secret `SUPABASE_SERVICE_ROLE_KEY` esteja disponível na Edge Function **sales**.
