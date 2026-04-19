# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

---

## [Unreleased]

### ✅ Concluída - Estrutura Híbrida Source Data (87.5% concluído - Migration 026 opcional)

#### Objetivo
Implementar estrutura híbrida (colunas críticas + JSONB) para `contact_origins` otimizando performance mantendo flexibilidade.

#### Etapas Concluídas (1-3)

**✅ Etapa 1: Preparação e Análise** (30min)
- Validação da estrutura atual de `contact_origins`
- Análise de dados existentes (1 registro com dados completos)
- Mapeamento de dependências (4 arquivos principais identificados)
- Descoberta: Helper `extractCriticalFields()` já existe
- Documentação completa em `ETAPA_1_RESULTADOS_PREPARACAO.md`

**✅ Etapa 2: Migration - Adicionar Colunas Críticas** (15min)
- Migration `024_add_critical_fields_contact_origins.sql` aplicada
- **4 colunas criadas**: `campaign_id`, `ad_id`, `adgroup_id`, `source_app` (TEXT, nullable)
- **5 índices criados**: 4 individuais + 1 composto (todos parciais para otimizar espaço)
- Comentários explicativos em todas as colunas
- Dados existentes preservados (1 registro intacto)
- Documentação em `ETAPA_2_RESULTADOS_MIGRATION.md`

**✅ Etapa 3: Trigger de Sincronização Automática** (20min)
- Migration `025_add_sync_trigger_contact_origins.sql` aplicada
- Função `sync_contact_origin_critical_fields()` criada
- Trigger `trigger_sync_critical_fields` criado e ativo
  - Executa em `BEFORE INSERT OR UPDATE`
  - Condição: `WHEN (NEW.source_data IS NOT NULL AND NEW.source_data != '{}'::jsonb)`
- **Testes completos realizados**:
  - ✅ INSERT com source_data completo (sincronização automática)
  - ✅ UPDATE com source_data completo (atualização automática)
  - ✅ INSERT com source_data NULL (não quebra, campos NULL)
- Consistência 100% validada entre JSONB e colunas
- Documentação em `ETAPA_3_RESULTADOS_TRIGGER.md`

#### Próximas Etapas
- [ ] **Etapa 4**: Migração de Dados Existentes (30min)
- [ ] **Etapa 6**: Testes (2h)
- [ ] **Etapa 7**: Validação Final (1h)
- [ ] **Etapa 8**: Deploy e Monitoramento (1h)

#### Mudanças no Banco de Dados

**Tabela `contact_origins`**:
- ✅ Adicionadas 4 colunas críticas normalizadas
- ✅ Criados 5 índices otimizados (parciais)
- ✅ Trigger automático de sincronização implementado
- ✅ Comentários explicativos em todas as colunas

**Funções e Triggers**:
- ✅ `sync_contact_origin_critical_fields()` - Função de sincronização
- ✅ `trigger_sync_critical_fields` - Trigger automático

#### Mudanças no Código TypeScript

**Tipos**:
- ✅ Interface `ContactOrigin` criada com campos críticos
- ✅ Tipos alinhados com estrutura do banco

**Serviços**:
- ✅ `ContactOriginService.insertContactOrigin()` - Usa helper e inclui campos críticos
- ✅ `ContactOriginService.addOriginToContact()` - Usa helper e inclui campos críticos
- ✅ Import de `extractCriticalFields` adicionado

**Testes**:
- ✅ `source-data-helpers.test.ts` - Testes unitários completos (15+ casos)
- ✅ `contact-origin-service.test.ts` - Testes atualizados com campos críticos
- ✅ Testes de integração documentados (queries SQL preparadas)
- ✅ Testes de performance documentados (queries SQL preparadas)
- ✅ Cobertura: ~95% para helper

#### Documentação Criada
- ✅ `GUIA_IMPLEMENTACAO_ETAPAS_SOURCE_DATA.md` - Guia completo por etapas
- ✅ `ETAPA_1_RESULTADOS_PREPARACAO.md` - Resultados da preparação
- ✅ `ETAPA_2_RESULTADOS_MIGRATION.md` - Resultados da migration
- ✅ `ETAPA_3_RESULTADOS_TRIGGER.md` - Resultados do trigger
- ✅ `ETAPA_5_RESULTADOS_TYPESCRIPT.md` - Resultados da atualização TypeScript
- ✅ `ETAPA_6_RESULTADOS_TESTES.md` - Resultados dos testes
- ✅ `ETAPA_7_RESULTADOS_VALIDACAO.md` - Resultados da validação final
- ✅ `ETAPA_8_RESULTADOS_DEPLOY.md` - Resultados do deploy e monitoramento
- ✅ `PROGRESSO_IMPLEMENTACAO_SOURCE_DATA.md` - Resumo do progresso

#### Benefícios Já Alcançados
- ✅ Sincronização automática de campos críticos (trigger funcionando)
- ✅ Estrutura preparada para queries otimizadas (índices criados)
- ✅ Consistência garantida entre JSONB e colunas (trigger testado)
- ✅ Sistema não quebrado (dados preservados, migrations seguras)

#### Próximos Benefícios (Após Conclusão)
- Performance: Queries 50-60% mais rápidas
- Manutenibilidade: Código mais simples (queries diretas)
- Escalabilidade: Suporta qualquer volume

---

## [0.7.0] - 2025-01-28

### ✅ Adicionado - Separação de Função para Webhooks

#### Nova Função: `messaging-webhooks`
- **Função dedicada para webhooks**: Criada `messaging-webhooks` separada da função `messaging`
- **Segurança isolada**: `verify_jwt: false` configurado apenas para webhooks
- **Isolamento de responsabilidades**: Webhooks públicos vs. endpoints autenticados
- **Novas rotas**:
  - `POST /messaging-webhooks/webhook/{brokerType}` - Webhook Global
  - `POST /messaging-webhooks/webhook/{brokerType}/{accountId}` - Webhook por Conta

#### Melhorias de Arquitetura
- **Princípio de menor privilégio**: Webhooks não têm acesso JWT, endpoints autenticados mantêm segurança total
- **Escalabilidade independente**: Webhooks podem escalar separadamente dos endpoints autenticados
- **Manutenção simplificada**: Código de webhooks isolado, fácil de manter e testar
- **Reutilização de código**: Handlers importam utils, repositories e brokers da função `messaging`

#### Mudanças na Função `messaging`
- **Removido código de webhook**: Todos os handlers e rotas de webhook removidos
- **Autenticação simplificada**: JWT obrigatório para todos os endpoints (sem lógica condicional)
- **Foco único**: Função dedicada apenas a operações autenticadas

#### Configuração
- **`config.toml`**: Adicionada configuração `[functions.messaging-webhooks]` com `verify_jwt = false`
- **Imports relativos**: Handlers de webhook importam código compartilhado de `../messaging/`
- **Service Role Key**: Função usa `SUPABASE_SERVICE_ROLE_KEY` para bypassar RLS (necessário para webhooks públicos sem JWT)

#### Correções
- **Acesso ao banco de dados**: Corrigido uso de `SUPABASE_ANON_KEY` para `SUPABASE_SERVICE_ROLE_KEY` em `messaging-webhooks`
  - Problema: RLS bloqueava acesso à tabela `messaging_accounts` com `ANON_KEY` sem autenticação
  - Solução: Uso de `SERVICE_ROLE_KEY` é apropriado pois segurança é garantida via validação de assinatura e rate limiting
  - Impacto: Webhooks agora conseguem acessar dados necessários corretamente

#### Documentação Atualizada
- **CHANGELOG.md**: Documentação da nova estrutura
- **WEBHOOK_CONFIGURATION_GUIDE.md**: URLs atualizadas para `/messaging-webhooks/webhook/*`
- **WEBHOOK_EXAMPLES.md**: URLs atualizadas para nova função
- **WEBHOOK_MIGRATION.md**: Guia completo de migração criado

#### Breaking Changes
- ⚠️ **URLs de webhook alteradas**: 
  - Antigo: `/functions/v1/messaging/webhook/{brokerType}`
  - Novo: `/functions/v1/messaging-webhooks/webhook/{brokerType}`
- **Migração**: Atualizar URLs configuradas nos brokers para a nova função

---

## [0.6.0] - 2025-01-28

### ✅ Adicionado - Sistema de Webhooks Refatorado e Melhorado

#### Arquitetura de Webhooks
- **Dois métodos de identificação de conta**:
  - **Webhook Global** (`POST /messaging/webhook/{brokerType}`): Identifica conta por token no body
    - Ideal para brokers com webhook único para todas as instâncias (UAZAPI, Evolution)
    - URL única para todas as contas do broker
  - **Webhook por Conta** (`POST /messaging/webhook/{brokerType}/{accountId}`): Identifica conta por UUID na URL
    - Ideal para brokers que suportam URLs específicas por conta (Gupshup, Official WhatsApp)
    - URL única por conta (mais seguro, UUID não sensível)
- **Endpoint legacy mantido**: `POST /messaging/webhook` (deprecado, mantido para compatibilidade)

#### Novos Handlers
- **`webhook-global.ts`**: Handler para webhooks globais
  - Identifica conta por token no body do webhook
  - Rate limiting por conta (após identificação)
  - Validação completa de broker type e body
- **`webhook-by-account.ts`**: Handler para webhooks por conta
  - Identifica conta por UUID na URL
  - Rate limiting por conta (usando UUID da URL)
  - Validação de UUID e broker type
  - Verificação de status da conta (apenas contas ativas recebem webhooks)

#### Utilitários e Helpers
- **`account-resolver.ts`**: Sistema de resolução de contas usando Strategy Pattern
  - Suporta múltiplas estratégias de identificação (header, token no body)
  - Factory pattern para criar resolvers específicos
- **`webhook-processor.ts`**: Lógica comum de processamento de webhooks
  - Extraída para reutilização entre diferentes handlers
  - Normalização, validação de assinatura, filtros, processamento e estatísticas
  - Resposta vazia 2xx conforme requisitos de webhooks
- **`rate-limiter.ts`**: Sistema de rate limiting
  - Configurações separadas para webhooks globais (200 req/min) e por conta (100 req/min)
  - Armazenamento em banco de dados (tabela `rate_limit_counters`)
  - Headers HTTP padronizados (`X-RateLimit-*`, `Retry-After`)
  - Limpeza automática de contadores expirados
- **`logger.ts`**: Sistema de logging melhorado
  - Contexto estruturado para rastreamento
  - Métricas de performance (tempo de processamento por etapa)
  - Níveis de log (info, warn, error, metrics)
- **`validation.ts`**: Validações centralizadas
  - Validação de UUID (formato v4)
  - Validação de broker types suportados
  - Funções reutilizáveis para validação
- **`message-filters.ts`**: Filtros de mensagens usando Strategy Pattern
  - Factory pattern para criar filtros específicos por broker
  - Ignora mensagens desnecessárias (status, próprias, etc.)
  - Razão de ignorar registrada para debugging

#### Banco de Dados
- **Nova tabela `rate_limit_counters`**: Armazena contadores de rate limiting
  - Chave única por tipo de limite (global ou por conta)
  - Contador e timestamp de expiração
  - Índices otimizados para busca e limpeza
  - Função de limpeza automática de expirados
  - RLS configurado (apenas service role)

#### Segurança e Validações
- **Validação de assinatura de webhook**: Suporte a múltiplos headers
  - `x-hub-signature-256` (WhatsApp Business API)
  - `x-signature` (UAZAPI)
  - `x-webhook-signature` (Gupshup)
- **Validação de status da conta**: Apenas contas com status `active` recebem webhooks
- **Validação de broker type**: Verifica se broker type é suportado antes de processar
- **Validação de UUID**: Formato v4 para webhooks por conta
- **Rate limiting**: Proteção contra abuso de webhooks

#### Testes
- **Testes unitários completos**:
  - `webhook-global.test.ts`: Testes para webhook global
  - `webhook-by-account.test.ts`: Testes para webhook por conta
  - `webhook-processor.test.ts`: Testes para lógica comum
  - `rate-limiter.test.ts`: Testes para rate limiting
  - `validation.test.ts`: Testes para validações
  - `response.test.ts`: Testes para helpers de resposta
- **Cobertura**: Todos os cenários críticos cobertos (sucesso, erro, validação, rate limit)

#### Documentação
- **`WEBHOOK_CONFIGURATION_GUIDE.md`**: Guia completo de configuração
  - Explicação dos dois métodos de webhook
  - Instruções específicas por broker
  - Exemplos de configuração
  - Troubleshooting

#### Melhorias de Código
- **Refatoração seguindo SOLID**:
  - Strategy Pattern para resolução de contas e filtros
  - Factory Pattern para criação de componentes
  - Single Responsibility: Cada handler tem responsabilidade única
  - DRY: Lógica comum extraída em `webhook-processor.ts`
- **Type Safety**: TypeScript strict em todos os novos arquivos
- **Error Handling**: Tratamento robusto de erros com logging detalhado
- **Performance**: Rate limiting e métricas de performance implementadas

#### Migrations
- `020_rate_limit_counters.sql`: Criação da tabela de rate limiting

---

## [0.5.2] - 2025-01-28

### ✅ Corrigido - UAZAPI: Header de Autenticação para Conexão

#### Correção Crítica
- **Header de autenticação**: Alterado de `apikey` para `token` no endpoint de conexão
  - A UAZAPI usa header `token` para identificar a instância na conexão
  - Formato correto: `token: {instance_token}` ao invés de `apikey: {token}`
- **URL simplificada**: Removido `instanceId` da URL do endpoint de conexão
  - Endpoint correto: `POST /instance/connect` (sem instanceId na URL)
  - A instância é identificada pelo header `token`
- **Extração de QR Code**: Ajustada para buscar em `instance.qrcode` (formato real da resposta)

#### Arquivos Alterados
- `supabase/functions/messaging/brokers/uazapi/UazapiBroker.ts`
  - Header alterado para `token`
  - URL simplificada sem instanceId
  - Extração de QR Code melhorada
- `supabase/functions/messaging/brokers/uazapi/types.ts`
  - Tipo `UazapiConnectResponse` atualizado para estrutura real

#### Impacto
- ✅ Correção do erro 401 "Missing token" ao conectar instâncias UAZAPI
- ✅ Conexão de instâncias agora funciona corretamente
- ✅ QR Code e Pair Code são gerados corretamente

---

## [0.5.1] - 2025-01-28

### ✅ Corrigido - UAZAPI: Integração e Conexão

#### Correções de Integração
- **Campo opcional**: `integration_account_id` agora é opcional em `messaging_accounts`
  - Migration `019_make_integration_account_id_optional.sql` aplicada
  - Permite criar contas UAZAPI sem integração OAuth
- **Salvamento completo**: Todos os dados da instância UAZAPI são salvos no banco
  - `instance.id`, `instance.token`, `instance.status`
  - `instanceData` completo para referência futura

#### Endpoints de Conexão
- **Novo endpoint**: `POST /messaging/connect/:accountId`
  - Gera QR Code (sem phone) ou Pair Code (com phone)
  - Timeouts corretos (2 min QR Code, 5 min Pair Code)
- **Endpoints existentes melhorados**:
  - `GET /messaging/qrcode/:accountId` - Gera QR Code
  - `GET /messaging/paircode/:accountId` - Gera Pair Code
  - `GET /messaging/connection-status/:accountId` - Status detalhado

---

## [0.5.0] - 2025-01-28

### ✅ Adicionado - Sessão 8.5: Sistema de WhatsApp com Brokers Modulares

#### Arquitetura Modular
- **Sistema de brokers modulares**: Arquitetura em 3 camadas (Normalização, Processamento, Envio)
- **Interface `IWhatsAppBroker`**: Contrato padrão para todos os brokers
- **Classe base `BaseWhatsAppBroker`**: Lógica comum reutilizável
- **Factory Pattern**: `WhatsAppBrokerFactory` para criação dinâmica de brokers
- **Sistema de normalização**: Formato unificado independente do broker

#### Camadas de Processamento
- **`WhatsAppNormalizer`**: Normaliza dados de qualquer broker para formato padrão
- **`WhatsAppProcessor`**: Processa mensagens normalizadas (cria/busca contatos automaticamente)
- **`WhatsAppSender`**: Gerencia envio de mensagens através dos brokers

#### Brokers Implementados
- **UazapiBroker**: Broker não oficial (UAZAPI)
  - Envio de texto e mídia
  - Normalização de webhooks
  - Validação de configuração
- **OfficialWhatsAppBroker**: WhatsApp Business API oficial
  - Integração com Graph API
  - Suporte a templates de mensagem
  - Normalização de webhooks oficiais
- **GupshupBroker**: Broker intermediário (Gupshup)
  - Integração com API Gupshup
  - Normalização de webhooks
  - Suporte a recursos específicos

#### Banco de Dados
- **Nova tabela `messaging_accounts`**: Contas de mensageria unificadas
  - Suporte a múltiplos brokers por plataforma
  - Configurações específicas por broker (JSONB)
  - Estatísticas de mensagens e contatos
  - Webhook URL e secret para validação
- **Nova tabela `messaging_brokers`**: Catálogo de brokers disponíveis
  - Metadados dos brokers (nome, tipo, URL, autenticação)
  - Campos obrigatórios e opcionais
  - Limitações e recursos suportados
  - Seeds: UAZAPI, Official WhatsApp, Gupshup
- **Nova tabela `messaging_webhooks`**: Configuração de webhooks
  - Eventos suportados
  - Status e controle
  - Estatísticas de eventos

#### Segurança (RLS)
- Políticas RLS completas para todas as tabelas de mensageria
- Isolamento por projeto e empresa
- Brokers públicos (read-only) para usuários autenticados
- Webhooks com validação de assinatura (suporte parcial)

#### API REST - Edge Function `messaging`
- **POST** `/functions/v1/messaging/webhook` - Recebe webhooks dos brokers
  - Validação automática via `x-account-id`
  - Normalização automática de dados
  - Processamento de mensagens (criação automática de contatos)
  - Atualização de estatísticas
- **POST** `/functions/v1/messaging/send` - Envia mensagem
  - Suporte a texto, mídia e templates
  - Validação completa com Zod
  - Conversão automática para formato do broker
- **GET** `/functions/v1/messaging/status/:accountId` - Status da conta
  - Verificação de conexão em tempo real
  - Estatísticas de mensagens e contatos
- **POST** `/functions/v1/messaging/sync-contacts/:accountId` - Sincroniza contatos
  - Atualização de informações da conta
  - Sincronização com broker

#### Funcionalidades
- Validação Zod em todos os endpoints
- CORS configurado corretamente
- Autenticação obrigatória via JWT (exceto webhooks)
- RLS automático via JWT
- Response helpers padronizados
- Tratamento de erros robusto
- Logs detalhados para debug

#### Repositories
- **`MessagingAccountRepository`**: Acesso a dados de contas de mensageria
- **`MessagingBrokerRepository`**: Acesso a dados de brokers

#### Utilitários
- **Validação de webhook**: Funções para validação de assinatura (HMAC-SHA256)
- **CORS helpers**: Configuração padronizada de CORS
- **Response helpers**: Formato padrão de respostas (sucesso/erro)

#### Migrations
- `create_messaging_tables`: Criação de tabelas de mensageria
- `create_messaging_rls_policies`: Políticas RLS completas
- `seed_messaging_brokers`: Seeds de brokers WhatsApp

#### Documentação
- **Arquitetura Completa**: `docs/WHATSAPP_BROKERS_ARCHITECTURE.md`
- **Documentação de APIs**: `docs/MESSAGING_API_DOCUMENTATION.md`
- **Guia de Adicionar Broker**: `docs/ADDING_NEW_BROKER_GUIDE.md`

---

## [0.5.1] - 2025-01-28

### 🐛 Corrigido - UAZAPI: integration_account_id Opcional e Salvamento Completo de Dados

#### Problema Resolvido
- **Erro ao criar instância UAZAPI**: Campo `integration_account_id` obrigatório causava erro "null value violates not-null constraint" ao criar `messaging_accounts` sem integração OAuth
- **Dados insuficientes**: Handler não salvava todas as informações importantes da instância (ID real, token, status, metadados completos)

#### Migration Aplicada
- **`019_make_integration_account_id_optional.sql`**: Tornou `integration_account_id` opcional (pode ser NULL)
  - Permite criação de `messaging_accounts` sem integração OAuth (caso UAZAPI direto via API)
  - Campo agora é opcional para brokers que não usam OAuth
  - Comentário adicionado explicando o uso opcional

#### Atualizações de Código
- **Tipo `UazapiInitInstanceResponse` atualizado** (`types.ts`): Reflete estrutura real da API UAZAPI
  - Inclui todos os campos retornados: `instance.id`, `instance.status`, `instance.token`, `instance.name`, etc.
  - Suporta múltiplos formatos de resposta da API
  
- **Método `createInstance` melhorado** (`UazapiBroker.ts`):
  - Retorna `instanceId` (ID real da instância na UAZAPI, ex: "ra03d1256ebb36c")
  - Retorna `status` da instância (connected/disconnected/connecting)
  - Retorna `instanceData` completo para referência futura
  - Extrai informações corretamente da resposta da API

- **Handler `create-instance.ts` atualizado**:
  - Salva `instanceId` no `broker_config.instanceId`
  - Salva `instanceName` no `broker_config.instanceName`
  - Salva `token` em `access_token`
  - Salva `status` da instância retornado pela API
  - Salva `instanceData` completo no `broker_config` para referência
  - Não inclui `integration_account_id` no insert (permite NULL)

#### API REST - Novo Endpoint
- **POST** `/functions/v1/messaging/instances/uazapi` - Criar instância UAZAPI e salvar no banco
  - Cria instância na UAZAPI usando Admin Token
  - Salva automaticamente no banco de dados (`messaging_accounts`)
  - Retorna dados completos da conta criada e instância UAZAPI
  - Validação completa com Zod
  - Verificação de acesso ao projeto

#### Deploy
- ✅ Edge Function `messaging` deployada com todas as correções
- ✅ Tamanho do bundle: 170.6kB
- ✅ Todos os endpoints funcionando corretamente

#### Migrations
- `019_make_integration_account_id_optional`: Campo `integration_account_id` opcional em `messaging_accounts`

#### Documentação
- `CORRECAO_INTEGRATION_ACCOUNT_ID.md` - Documentação completa das correções
- `RESUMO_CORRECOES_UAZAPI.md` - Resumo executivo
- `DEPLOY_FINAL_CONCLUIDO.md` - Status do deploy
- `IMPLEMENTACAO_CRIAR_INSTANCIA_UAZAPI.md` - Guia de implementação

---

## [0.4.0] - 2025-01-28

### ✅ Adicionado - Sessão 4: Sistema de Contatos e Gestão

#### Banco de Dados
- **Nova tabela `contacts`**: Sistema completo de contatos com suporte a multi-tenancy
  - Campos: name, phone, country_code, email, company, location, notes, avatar_url
  - Sistema de favoritos (`is_favorite`)
  - Metadados customizados (JSONB)
  - Relacionamentos com `origins` e `stages`
- **Nova tabela `origins`**: Origens de tráfego (sistema + customizadas)
  - Suporte a origens do sistema (project_id NULL) e customizadas por projeto
  - Sistema de cores e ícones
  - Seeds: 6 origens pré-cadastradas (Google Ads, Meta Ads, Instagram, Indicação, Manual, Outros)
- **Nova tabela `stages`**: Estágios do funil de vendas
  - Tipos: normal, sale, lost
  - Sistema de ordenação (`display_order`)
  - Validação de unicidade (apenas 1 estágio de venda e 1 de perdido por projeto)
  - Configuração de eventos (JSONB)
- **Nova tabela `contact_origins`**: Histórico de origens por contato
  - Rastreamento de quando cada origem foi adquirida
  - Observações opcionais
- **Nova tabela `contact_stage_history`**: Histórico de mudanças de estágios
  - Registro automático via trigger
  - Informação de quem moveu (system, user, automation)
  - Observações opcionais

#### Índices e Performance
- Índice full-text em português para busca em `contacts.name`
- Índice full-text composto (name + email + company)
- Índices otimizados para foreign keys
- Índices para filtros comuns (favoritos, projeto, origem, estágio)

#### Triggers
- **`update_contacts_updated_at_trigger`**: Atualização automática de `updated_at`
- **`log_contact_stage_change_trigger`**: Registro automático de mudanças de estágio no histórico

#### Segurança (RLS)
- Políticas RLS completas para todas as novas tabelas
- Isolamento por projeto e empresa
- Permissões baseadas em roles (owner, admin, manager, member, viewer)
- Proteção contra deleção de origens do sistema

#### API REST - Edge Function `contacts`
- **POST** `/functions/v1/contacts` - Criar contato
  - Validação completa com Zod
  - Verificação de acesso ao projeto
  - Validação de origem e estágio
  - Registro automático no histórico de origens
- **GET** `/functions/v1/contacts` - Listar contatos
  - Busca full-text (name, email, company, phone)
  - Filtros: projeto, origem, estágio, favoritos
  - Ordenação: created_at, updated_at, name (asc/desc)
  - Paginação com limit e offset
- **GET** `/functions/v1/contacts/:id` - Obter contato específico
- **PATCH** `/functions/v1/contacts/:id` - Atualizar contato
  - Validação de origem e estágio ao atualizar
  - Registro automático no histórico quando origem/estágio mudam
- **DELETE** `/functions/v1/contacts/:id` - Deletar contato
  - CASCADE automático para histórico

#### Migrations
- `create_contacts_origins_stages_tables`: Criação de todas as tabelas
- `create_contacts_rls_policies`: Políticas RLS completas

---

## [0.3.0] - 2025-01-27

### ✅ Adicionado - Sessão 3: Sistema de Projetos e Multi-tenancy

#### API REST - Edge Function `projects`
- **POST** `/functions/v1/projects` - Criar projeto
- **GET** `/functions/v1/projects` - Listar projetos
- **GET** `/functions/v1/projects/:id` - Obter projeto específico
- **PATCH** `/functions/v1/projects/:id` - Atualizar projeto
- **PATCH** `/functions/v1/projects/:id/complete` - Completar wizard e ativar projeto
- **DELETE** `/functions/v1/projects/:id` - Deletar projeto

#### API REST - Edge Function `companies`
- **POST** `/functions/v1/companies` - Criar empresa
- **GET** `/functions/v1/companies` - Listar empresas
- **GET** `/functions/v1/companies/:id` - Obter empresa específica
- **PATCH** `/functions/v1/companies/:id` - Atualizar empresa
- **DELETE** `/functions/v1/companies/:id` - Deletar empresa

#### Funcionalidades
- Validação Zod em todos os endpoints
- CORS configurado corretamente
- Autenticação obrigatória via JWT
- RLS automático via JWT
- Response helpers padronizados
- Estrutura de handlers organizada
- Tipos TypeScript completos

#### Migrations
- `013_project_wizard_progress`: Adicionado suporte a wizard de criação de projetos
- `014_fix_rls_policies`: Correção e otimização de políticas RLS

---

## [0.2.0] - 2025-01-27

### ✅ Adicionado - Sessão 2: Sistema de Usuários e Empresas

#### Banco de Dados
- **Tabela `company_settings`**: Configurações globais da empresa
  - Tema, idioma, timezone
  - Formato de data e hora
  - Configurações de notificações e digest
  - Modelo de atribuição padrão
- **Tabela `onboarding_progress`**: Acompanhamento de onboarding
  - Etapas: company_setup, first_project_created, integrations_connected, first_contact_added
  - Dados de progresso em JSONB
  - Sistema de conclusão automática

#### Funções de Validação
- `user_has_company_access()` - Verificar acesso à empresa
- `user_has_project_access()` - Verificar acesso ao projeto
- `user_company_role()` - Obter role na empresa
- `user_project_role()` - Obter role no projeto
- `user_can_manage_company()` - Verificar permissão de gestão
- `user_can_manage_project()` - Verificar permissão de gestão
- `user_is_company_owner()` - Verificar se é dono da empresa
- `user_is_project_owner()` - Verificar se é dono do projeto

#### Sistema de Convites
- `invite_user_to_company()` - Convidar usuário para empresa
- `accept_company_invite()` - Aceitar convite de empresa
- Validações de permissão implementadas
- Tratamento de usuários inexistentes

#### Triggers de Segurança
- `create_company_settings_on_company_insert()` - Criar configurações automaticamente
- `create_onboarding_progress_on_user_insert()` - Criar progresso de onboarding automaticamente
- `ensure_company_owner_exists()` - Garantir que empresa sempre tenha um dono

#### Otimizações
- RLS policies otimizadas com (SELECT auth.uid()) para evitar re-avaliação
- Índices adicionais criados para foreign keys
- Políticas consolidadas para reduzir redundância
- Índices únicos otimizados

#### Migrations
- `005_company_settings_onboarding`: Criação de tabelas de configurações
- `006_validation_functions`: Funções de validação de acesso
- `007_security_triggers`: Triggers de segurança
- `008_invite_system`: Sistema de convites
- `009_additional_indexes`: Índices adicionais
- `010_test_seeds`: Seeds de teste

---

## [0.1.0] - 2025-01-27

### ✅ Adicionado - Sessão 1: Setup Inicial e Infraestrutura

#### Estrutura do Projeto
- Pasta `back-end/` criada com estrutura completa
- Separação clara entre front-end e back-end
- Organização por responsabilidades (supabase, workers, docs, tests)

#### Documentação
- `BACKEND_IMPLEMENTATION_PLAN.md` - Plano de implementação completo
- `BACKEND_PROGRESS.md` - Documentação de progresso e checklist
- `README.md` - Documentação principal do backend
- `config.ts` - Configurações centralizadas
- `types.ts` - Tipos TypeScript completos

#### Banco de Dados
- **Tabela `user_profiles`**: Perfil estendido dos usuários
  - Extensão de `auth.users` do Supabase
  - Campos: first_name, last_name, preferred_language, timezone, avatar_url, phone
- **Tabela `companies`**: Empresas/organizações
  - Campos: name, description, logo_url, website, industry, size, country, timezone, currency
- **Tabela `company_users`**: Relacionamento usuário-empresa
  - Roles: owner, admin, manager, member, viewer
  - Sistema de permissões (JSONB)
  - Sistema de convites
- **Tabela `projects`**: Projetos com multi-tenancy
  - Campos: name, description, company_type, franchise_count, country, language, currency, timezone
  - Modelo de atribuição (first_touch, last_touch, conversion)
  - Status de integrações (whatsapp, meta_ads, google_ads, tiktok_ads)
  - Status do projeto (draft, active, paused, archived)
- **Tabela `project_users`**: Relacionamento usuário-projeto
  - Roles: owner, admin, manager, member, viewer
  - Sistema de permissões (JSONB)
  - Sistema de convites

#### Segurança (RLS)
- RLS habilitado em todas as tabelas
- Policies de usuários implementadas
- Policies de empresas implementadas
- Policies de projetos implementadas
- Isolamento de dados validado
- Zero avisos de segurança nos advisors

#### Triggers de Auditoria
- `update_updated_at_column()` - Função para atualização automática de timestamps
- Triggers automáticos para todas as tabelas
- `add_project_creator_as_owner()` - Adicionar criador como owner automaticamente

#### Integração MCP Supabase
- Conexão validada com projeto Supabase
- URL do projeto: `https://nitefyufrzytdtxhaocf.supabase.co`
- Chave anônima obtida e configurada
- Extensões disponíveis verificadas
- Banco limpo e pronto para implementação

#### Migrations
- `001_initial_users_tables`: Tabelas de usuários e empresas
- `002_projects_tables`: Tabelas de projetos
- `003_audit_triggers`: Triggers de auditoria
- `014_fix_rls_policies`: Correção de políticas RLS

---

## [0.0.1] - 2025-01-27

### ✅ Adicionado - Setup Inicial

#### Estrutura Base
- Criação da pasta `back-end/`
- Estrutura de pastas definida
- Arquivos de configuração base criados
- Integração MCP Supabase configurada

---

## Legenda de Tipos de Mudanças

- **✅ Adicionado**: Novas funcionalidades
- **🔄 Alterado**: Mudanças em funcionalidades existentes
- **🗑️ Removido**: Funcionalidades removidas
- **🐛 Corrigido**: Correções de bugs
- **🔒 Segurança**: Correções de segurança
- **⚡ Performance**: Melhorias de performance
- **📝 Documentação**: Mudanças na documentação

---

## Links Úteis

- [Plano de Implementação](BACKEND_IMPLEMENTATION_PLAN.md)
- [Progresso e Checklist](BACKEND_PROGRESS.md)
- [README do Backend](README.md)
- [Schema do Banco](../doc/database-schema.md)

---

**Nota**: Este changelog é atualizado a cada sessão de implementação concluída.

