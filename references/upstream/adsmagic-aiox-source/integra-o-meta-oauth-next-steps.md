# Próximos Passos - Integração Meta OAuth

Este documento detalha os próximos passos após a implementação inicial da integração Meta OAuth.

---

## 1. Testar Fluxo Completo em Ambiente de Desenvolvimento

### Objetivo
Validar que todo o fluxo OAuth funciona corretamente do início ao fim.

### Tarefas
- [x] Implementar fluxo OAuth completo com seleção de contas e pixel
- [x] Integrar OAuth no ProjectWizard
- [ ] Testar abertura de popup OAuth ao clicar em "Conectar Meta"
- [ ] Validar redirecionamento para página de autorização do Facebook
- [ ] Testar autorização e retorno do token no callback
- [ ] Verificar troca de short-lived token por long-lived token
- [ ] Validar busca e seleção de contas de anúncios
- [ ] Validar seleção/criação de pixel
- [ ] Confirmar que integração aparece como "conectada" na interface
- [ ] Testar tratamento de erros (usuário cancela, token inválido, etc.)

### Critérios de Sucesso
- ✅ Popup abre e fecha corretamente
- ✅ Token é capturado do hash da URL
- ✅ Backend troca token com sucesso
- ✅ Contas são listadas e salvas no banco
- ✅ Interface reflete status de conexão

---

## 2. Validar Tokens Long-lived Salvos Corretamente no Banco (Criptografados)

### Objetivo
Garantir que os tokens são armazenados de forma segura e podem ser descriptografados quando necessário.

### Tarefas
- [ ] Verificar que tokens são criptografados antes de salvar em `integration_accounts.access_token`
- [ ] Testar descriptografia de tokens salvos
- [ ] Validar que tokens descriptografados são válidos (fazer requisição de teste à Meta API)
- [ ] Confirmar que `token_expires_at` está sendo salvo corretamente (~60 dias)
- [ ] Verificar que tokens não aparecem em logs ou respostas da API
- [ ] Testar que apenas usuários autorizados podem acessar tokens (RLS)

### Critérios de Sucesso
- ✅ Tokens salvos estão criptografados no banco
- ✅ Tokens podem ser descriptografados e usados para chamadas à API Meta
- ✅ `token_expires_at` reflete expiração real (~60 dias)
- ✅ RLS impede acesso não autorizado

---

## 3. Implementar Refresh de Tokens Antes de Expirar (~60 dias)

### Objetivo
Renovar tokens automaticamente antes da expiração para manter integrações ativas.

### Implementação

**Backend - Edge Function**:
- [x] Criar handler `POST /integrations/:id/refresh-token`
- [x] Implementar lógica para verificar `token_expires_at`
- [x] Criar função para renovar long-lived token via Meta API
- [x] Atualizar `access_token` e `token_expires_at` no banco
- [x] Retornar status de sucesso/erro

**Worker/QStash**:
- [x] Criar worker endpoint que verifica tokens próximos da expiração (7 dias antes)
- [x] Executar refresh automaticamente para tokens que expiram em breve
- [ ] Configurar QStash para chamar worker diariamente
- [ ] Enviar notificação se refresh falhar

**Frontend**:
- [ ] Adicionar indicador visual de tokens próximos da expiração
- [ ] Permitir refresh manual via botão "Renovar Conexão"

### Critérios de Sucesso
- ✅ Tokens são renovados automaticamente antes de expirar
- ✅ Usuário recebe notificação se refresh falhar
- ✅ Integrações permanecem ativas sem intervenção manual

---

## 4. Adicionar Sincronização Periódica de Contas Meta

### Objetivo
Manter lista de contas de anúncios sincronizada com a Meta.

### Implementação

**Backend - Edge Function**:
- [x] Criar handler `POST /integrations/:id/sync-accounts`
- [x] Buscar contas atualizadas da Meta API
- [x] Comparar com contas existentes no banco
- [x] Criar novas contas, atualizar existentes, marcar como inativas se removidas
- [x] Atualizar `last_sync_at` em `integrations`

**Worker/QStash**:
- [x] Criar worker endpoint que executa sincronização diária
- [x] Processar apenas integrações com status 'connected'
- [x] Registrar logs de sincronização
- [ ] Configurar QStash para chamar worker diariamente

**Frontend**:
- [ ] Adicionar botão "Sincronizar Agora" na interface
- [ ] Mostrar última sincronização (`last_sync_at`)
- [ ] Exibir loading durante sincronização
- [ ] Mostrar diferenças encontradas (novas contas, contas removidas)

### Critérios de Sucesso
- ✅ Contas são sincronizadas automaticamente
- ✅ Mudanças na Meta são refletidas no sistema
- ✅ Usuário pode forçar sincronização manual

---

## 5. Implementar Desconexão (Revogar Token via Meta API)

### Objetivo
Permitir que usuários desconectem integrações e revoguem tokens na Meta.

### Implementação

**Backend - Edge Function**:
- [x] Criar handler `DELETE /integrations/:id`
- [x] Revogar token na Meta API
- [x] Atualizar status da integração para 'disconnected'
- [x] Manter tokens no banco para auditoria
- [x] Atualizar todas as contas relacionadas para status 'inactive'

**Frontend**:
- [ ] Adicionar botão "Desconectar" na interface de integrações
- [ ] Mostrar modal de confirmação antes de desconectar
- [ ] Exibir loading durante desconexão
- [ ] Atualizar UI após desconexão bem-sucedida

### Critérios de Sucesso
- ✅ Token é revogado na Meta
- ✅ Integração é marcada como desconectada
- ✅ Usuário pode reconectar posteriormente

---

## 6. Adicionar Logs de Auditoria para OAuth Flows

### Objetivo
Rastrear todas as operações OAuth para debugging e segurança.

### Implementação

**Backend**:
- [x] Criar tabela `integration_audit_logs`:
  - `id` UUID
  - `integration_id` UUID
  - `project_id` UUID
  - `action` VARCHAR (oauth_start, oauth_callback, token_refresh, token_validation, account_selection, account_sync, pixel_creation, disconnect, error)
  - `status` VARCHAR (success, error, pending)
  - `metadata` JSONB (detalhes da operação)
  - `error_message` TEXT
  - `client_ip` VARCHAR
  - `created_at` TIMESTAMP
- [x] Criar repository e utilitário de logging
- [x] Criar handler `GET /integrations/:id/audit-logs`
- [ ] Adicionar logs em todos os handlers OAuth (pendente - pode ser feito incrementalmente)
- [x] Incluir informações relevantes (sem tokens): user_id, platform, timestamp, IP (se disponível)

**Frontend**:
- [ ] Adicionar seção "Histórico de Conexões" na interface
- [ ] Listar eventos de OAuth (conexão, desconexão, erros)
- [ ] Mostrar timestamps e status de cada evento

### Critérios de Sucesso
- ✅ Todas as operações OAuth são registradas
- ✅ Logs não contêm informações sensíveis (tokens)
- ✅ Logs podem ser consultados para debugging

---

## 7. Implementar Tratamento de Tokens Expirados (Re-autenticação)

### Objetivo
Detectar tokens expirados e guiar usuário para re-autenticação.

### Implementação

**Backend**:
- [x] Criar função para validar token (fazer requisição de teste à Meta API)
- [x] Criar handler `GET /integrations/:id/validate-token`
- [x] Detectar tokens expirados em requisições:
  - Se token expirado, retornar erro específico (`TOKEN_EXPIRED`)
  - Atualizar status da integração para 'expired'
- [x] Adicionar migration para status 'expired'
- [x] Verificar `token_expires_at` antes de usar token

**Frontend**:
- [ ] Detectar erro `TOKEN_EXPIRED` nas respostas da API
- [ ] Mostrar banner/notificação: "Sua conexão com Meta expirou. Reconecte para continuar."
- [ ] Adicionar botão "Reconectar" que inicia novo fluxo OAuth
- [ ] Atualizar status visual da integração (ex: badge "Expirado")

**Worker**:
- [x] Worker de refresh automático já verifica tokens próximos da expiração
- [ ] Enviar notificação por email/notificação in-app para usuários com tokens expirados

### Critérios de Sucesso
- ✅ Tokens expirados são detectados automaticamente
- ✅ Usuário é notificado e pode reconectar facilmente
- ✅ Sistema não tenta usar tokens expirados

---

## Priorização Sugerida

1. **Alta Prioridade** (Fase 1):
   - Testar fluxo completo em desenvolvimento
   - Validar tokens criptografados
   - Implementar tratamento de tokens expirados

2. **Média Prioridade** (Fase 2):
   - Implementar refresh de tokens
   - Adicionar logs de auditoria
   - Implementar desconexão

3. **Baixa Prioridade** (Fase 3):
   - Sincronização periódica de contas (pode ser manual inicialmente)

---

## Notas Técnicas

### Variáveis de Ambiente Adicionais (se necessário)
```bash
# Para workers/cron jobs
INTEGRATION_SYNC_INTERVAL_HOURS=24
TOKEN_REFRESH_DAYS_BEFORE_EXPIRY=7
```

### Endpoints Adicionais a Criar
- [x] `POST /integrations/:id/refresh-token` - Renovar token
- [x] `POST /integrations/:id/sync-accounts` - Sincronizar contas
- [x] `DELETE /integrations/:id` - Desconectar integração
- [x] `GET /integrations/:id/audit-logs` - Consultar logs de auditoria
- [x] `GET /integrations/:id/validate-token` - Validar token
- [x] `POST /integrations/:id/select-accounts` - Selecionar contas após OAuth
- [x] `GET /integrations/:id/pixels` - Listar pixels
- [x] `POST /integrations/:id/pixels` - Criar pixel

### Tabelas Adicionais (se necessário)
- [x] `integration_audit_logs` - Logs de auditoria OAuth (Migration 016)
- [x] Status 'expired' adicionado à tabela `integrations` (Migration 017)

---

## Checklist Geral

- [ ] Fase 1: Testes e Validação
- [ ] Fase 2: Refresh e Tratamento de Expiração
- [ ] Fase 3: Sincronização e Desconexão
- [ ] Fase 4: Auditoria e Monitoramento
- [ ] Documentação atualizada
- [ ] Testes E2E para todos os fluxos
- [ ] Deploy em staging
- [ ] Deploy em produção

---

**Última atualização**: 2025-01-27
**Status**: Implementação em andamento

## Progresso da Implementação

### ✅ Implementado

1. **Fluxo OAuth Completo com Seleção de Contas e Pixel**
   - Callback OAuth modificado para retornar contas sem salvar
   - Handler de seleção de contas implementado
   - Serviço de pixels (buscar e criar) implementado
   - Handlers para pixels implementados
   - Integração com ProjectWizard implementada
   - Composable `useMetaIntegration` criado

2. **Validação de Tokens**
   - Serviço de validação de tokens implementado
   - Handler de validação implementado
   - Migration para status 'expired' criada

3. **Refresh de Tokens**
   - Serviço de refresh implementado
   - Handler de refresh implementado
   - Worker para QStash criado

4. **Sincronização de Contas**
   - Serviço de sincronização implementado
   - Handler de sincronização implementado
   - Worker para QStash criado

5. **Desconexão**
   - Serviço de desconexão implementado
   - Handler de desconexão implementado

6. **Logs de Auditoria**
   - Migration para tabela de audit logs criada
   - Repository de audit logs implementado
   - Utilitário de logging implementado
   - Handler para obter logs implementado

### 🔄 Pendente

1. **Testes**
   - Testar fluxo completo no ProjectWizard
   - Testar validação de tokens
   - Testar refresh manual e automático
   - Testar sincronização
   - Testar desconexão

2. **Configuração QStash**
   - Configurar QStash para chamar workers diariamente
   - Configurar assinatura de verificação (opcional)

3. **Frontend**
   - Adicionar UI para refresh manual
   - Adicionar UI para sincronização manual
   - Adicionar UI para desconexão
   - Adicionar seção de logs de auditoria
   - Adicionar detecção de tokens expirados
   - Adicionar indicadores visuais de status

4. **Logging Incremental**
   - Adicionar logs em todos os handlers OAuth
   - Adicionar logs em operações críticas

