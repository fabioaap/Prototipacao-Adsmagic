# 🧪 Testes - Sistema de Messaging WhatsApp Multi-Broker

## 📋 Visão Geral

Este diretório contém todos os testes unitários e de integração para o sistema de messaging, incluindo:
- **Sistema de Rastreamento de Origem de Contatos** (FASE 8)
- **Integração WhatsApp Multi-Broker** (FASE 5.1 - Testes Unitários Backend)

## 📁 Estrutura de Testes

```
tests/
├── # ====== Testes de Integração WhatsApp Multi-Broker (FASE 5.1) ======
├── whatsapp-schemas.test.ts           # Testes dos validadores Zod genéricos
├── list-whatsapp-brokers.test.ts      # Testes do handler de listar brokers
├── create-instance.test.ts            # Testes do handler de criar instância
├── connect-instance.test.ts           # Testes do handler de conectar (QR/Pair Code)
├── connection-status.test.ts          # Testes do handler de status de conexão
├── configure-broker.test.ts           # Testes do handler de configurar credenciais
│
├── # ====== Testes de Rastreamento de Origem (FASE 8) ======
├── identifier-normalizer.test.ts      # Testes do normalizador de identificadores
├── source-data-extractor.test.ts      # Testes dos extractors de dados de origem
├── source-data-helpers.test.ts        # Testes dos helpers de dados de origem
├── contact-origin-service.test.ts     # Testes do serviço principal
├── contact-repository.test.ts         # Testes do repository
│
├── # ====== Testes de Webhooks ======
├── webhook-processor.test.ts          # Testes do processador de webhooks
├── webhook-global.test.ts             # Testes do webhook global
├── webhook-by-account.test.ts         # Testes do webhook por conta
│
├── # ====== Testes de Utilitários ======
├── validation.test.ts                 # Testes de funções de validação
├── response.test.ts                   # Testes de respostas HTTP
├── rate-limiter.test.ts               # Testes do rate limiter
│
├── # ====== Testes de Integração e Performance ======
├── integration.test.ts                # Testes de integração (fluxo completo)
├── performance-security.test.ts       # Testes de performance e segurança
│
└── README.md                          # Esta documentação
```

## 🚀 Executando os Testes

### Pré-requisitos

1. **Deno instalado** (versão 1.30+)
   ```bash
   curl -fsSL https://deno.land/install.sh | sh
   ```

2. **Navegar para o diretório correto**
   ```bash
   cd back-end/supabase/functions/messaging
   ```

### Executar Todos os Testes

```bash
deno test --allow-all tests/
```

### Executar Teste Específico

```bash
# ====== Testes de Integração WhatsApp Multi-Broker (FASE 5.1) ======
deno test --allow-all tests/whatsapp-schemas.test.ts
deno test --allow-all tests/list-whatsapp-brokers.test.ts
deno test --allow-all tests/create-instance.test.ts
deno test --allow-all tests/connect-instance.test.ts
deno test --allow-all tests/connection-status.test.ts
deno test --allow-all tests/configure-broker.test.ts

# ====== Testes de Rastreamento de Origem (FASE 8) ======
deno test --allow-all tests/identifier-normalizer.test.ts
deno test --allow-all tests/source-data-extractor.test.ts
deno test --allow-all tests/contact-origin-service.test.ts

# ====== Testes de Integração e Performance ======
deno test --allow-all tests/integration.test.ts
deno test --allow-all tests/performance-security.test.ts

# ====== Executar apenas testes WhatsApp ======
deno test --allow-all tests/whatsapp-schemas.test.ts tests/list-whatsapp-brokers.test.ts tests/create-instance.test.ts tests/connect-instance.test.ts tests/connection-status.test.ts tests/configure-broker.test.ts
```

### Executar com Cobertura

```bash
deno test --allow-all --coverage=coverage tests/
deno coverage coverage
```

### Executar com Output Detalhado

```bash
deno test --allow-all --verbose tests/
```

## 📊 Cobertura de Testes

### ✅ Testes de Integração WhatsApp Multi-Broker (FASE 5.1)

| Arquivo | Componente | Cobertura | Status |
|---------|-----------|-----------|--------|
| `whatsapp-schemas.test.ts` | Validadores Zod genéricos | 95%+ | ✅ Completo |
| `list-whatsapp-brokers.test.ts` | Handler de listar brokers | 90%+ | ✅ Completo |
| `create-instance.test.ts` | Handler de criar instância | 90%+ | ✅ Completo |
| `connect-instance.test.ts` | Handler de conectar (QR/Pair) | 90%+ | ✅ Completo |
| `connection-status.test.ts` | Handler de status de conexão | 85%+ | ✅ Completo |
| `configure-broker.test.ts` | Handler de configurar credenciais | 90%+ | ✅ Completo |

### ✅ Testes de Rastreamento de Origem (FASE 8)

| Arquivo | Componente | Cobertura | Status |
|---------|-----------|-----------|--------|
| `identifier-normalizer.test.ts` | Normalizador de identificadores | 95%+ | ✅ Completo |
| `source-data-extractor.test.ts` | Extractors de dados de origem | 90%+ | ✅ Completo |
| `contact-origin-service.test.ts` | Serviço principal | 80%+ | ✅ Completo |
| `contact-repository.test.ts` | Repository | 90%+ | ✅ Existente |

### ✅ Testes de Integração

| Arquivo | Tipo | Status |
|---------|------|--------|
| `integration.test.ts` | Fluxo completo | ✅ Completo |

### ✅ Testes de Performance e Segurança

| Arquivo | Tipo | Status |
|---------|------|--------|
| `performance-security.test.ts` | Performance e segurança | ✅ Completo |

## 📝 Detalhamento dos Testes

### Testes de Integração WhatsApp Multi-Broker (FASE 5.1)

#### 1. whatsapp-schemas.test.ts

Testa validadores Zod genéricos para integração WhatsApp:

- ✅ `createInstanceSchema` - Validação de projectId, brokerId, campos opcionais
- ✅ `connectInstanceSchema` - Validação de telefone (QR Code vs Pair Code)
- ✅ `configureBrokerSchema` - Validação de credenciais dinâmicas
- ✅ `saveConnectedAccountSchema` - Validação de dados de conta
- ✅ `extractValidationErrors` - Formatação de erros
- ✅ Edge cases e formatos inválidos

**Total de testes**: ~35+

#### 2. list-whatsapp-brokers.test.ts

Testa listagem de brokers WhatsApp:

- ✅ Filtrar apenas brokers ativos
- ✅ Não expor admin_token na resposta
- ✅ Conversão snake_case → camelCase
- ✅ Formato de resposta correto
- ✅ Segurança (dados sensíveis não expostos)
- ✅ Filtrar apenas plataforma whatsapp

**Total de testes**: ~15+

#### 3. create-instance.test.ts

Testa criação de instância WhatsApp:

- ✅ Validação de schema (projectId, brokerId)
- ✅ Validação de broker types (UAZAPI, Gupshup, Official)
- ✅ Validação de admin_token
- ✅ Processamento de resultado de instância
- ✅ Estrutura de dados da conta
- ✅ Formato de resposta (sem tokens sensíveis)
- ✅ Tratamento de erros específicos

**Total de testes**: ~40+

#### 4. connect-instance.test.ts

Testa conexão de instância (QR Code / Pair Code):

- ✅ Validação de schema (telefone opcional)
- ✅ Validação de suporte do broker
- ✅ Extração de configuração do broker
- ✅ Timeouts (QR: 2min, Pair: 5min)
- ✅ Formato de resposta QR Code e Pair Code
- ✅ Decisão de tipo de conexão
- ✅ Tratamento de erros

**Total de testes**: ~40+

#### 5. connection-status.test.ts

Testa verificação de status de conexão:

- ✅ Validação de acesso à conta
- ✅ Extração de configuração do broker
- ✅ Determinação de status (connected, disconnected, connecting, timeout)
- ✅ Formato de resposta ConnectionStatusResponse
- ✅ Atualização de status no banco
- ✅ Tratamento de accountInfo
- ✅ Logging sem dados sensíveis

**Total de testes**: ~35+

#### 6. configure-broker.test.ts

Testa configuração de credenciais (Gupshup, API Oficial):

- ✅ Validação de schema (credentials dinâmicos)
- ✅ Validação de campos obrigatórios por broker
- ✅ Validação de plataforma e status ativo
- ✅ Tratamento de erros (401, 404, 503)
- ✅ Validação Gupshup (apiKey, appName)
- ✅ Validação API Oficial (accessToken, phoneNumberId)
- ✅ Formato de resposta

**Total de testes**: ~35+

---

### Testes de Rastreamento de Origem (FASE 8)

#### 7. identifier-normalizer.test.ts

Testa normalização de identificadores:

- ✅ Normalização de telefone (vários formatos)
- ✅ Normalização de JID individual e de grupo
- ✅ Normalização de LID
- ✅ Extração de telefone de JID
- ✅ Geração de identificador canônico
- ✅ Normalização de webhook identifier
- ✅ Edge cases e validações
- ✅ Tratamento de erros

**Total de testes**: ~30+

#### 8. source-data-extractor.test.ts

Testa extractors de dados de origem:

- ✅ Classe base (BaseSourceDataExtractor)
  - Extração de click IDs
  - Extração de UTMs
  - Métodos utilitários (detectSourceApp, detectSourceType)
  - Template Method Pattern
- ✅ UazapiSourceExtractor
  - Extração de ctwaClid do externalAdReply
  - Extração de UTMs específicos do UAZAPI
  - Extração de IDs de campanha
  - Extração de metadados
- ✅ Factory (SourceDataExtractorFactory)
  - Criação de extractors baseado em brokerId
  - Fallback genérico
  - Extração via factory

**Total de testes**: ~25+

#### 9. contact-origin-service.test.ts

Testa serviço principal:

- ✅ Validações (isGroup, identificadores)
- ✅ Criação de contato novo
  - Com telefone
  - Com JID
  - Com LID
  - Com dados de origem
- ✅ Processamento de contato existente
- ✅ Extração de identificadores
- ✅ Priorização de identificadores

**Total de testes**: ~15+

#### 10. integration.test.ts

Testa fluxo completo de integração:

- ✅ Fluxo: Normalização → Extração → Serviço
- ✅ Mensagens com dados de origem
- ✅ Mensagens sem dados de origem
- ✅ Validação de estrutura de dados
- ✅ Priorização de múltiplos identificadores
- ✅ Factory Pattern em ação

**Total de testes**: ~8+

#### 11. performance-security.test.ts

Testa performance e segurança:

- ✅ Performance de normalização (< 10ms por operação)
- ✅ Performance de extração (< 50ms por operação)
- ✅ Processamento em lote (1000+ itens)
- ✅ Validação de entrada (SQL injection, XSS)
- ✅ Rejeição de inputs maliciosos
- ✅ Sanitização de dados
- ✅ Type safety
- ✅ Edge cases de performance
- ✅ Gerenciamento de memória

**Total de testes**: ~20+

## ✅ Critérios de Sucesso

### Funcionalidade
- ✅ Todos os testes passando
- ✅ Cobertura > 80% para componentes críticos
- ✅ Edge cases cobertos

### Performance
- ✅ Normalização < 10ms por operação
- ✅ Extração < 50ms por operação
- ✅ Processamento em lote eficiente

### Segurança
- ✅ Validação de entrada robusta
- ✅ Rejeição de inputs maliciosos
- ✅ Type safety garantido

## 🔄 Execução Contínua

### CI/CD Integration

Os testes devem ser executados:
- ✅ Antes de cada commit (pre-commit hook)
- ✅ Em pull requests
- ✅ Antes de deploy para staging/produção

### Comandos para CI/CD

```bash
# Executar todos os testes
deno test --allow-all tests/

# Executar com cobertura
deno test --allow-all --coverage=coverage tests/
deno coverage coverage --lcov > coverage/lcov.info
```

## 📚 Referências

- [Documentação Deno Testing](https://deno.land/manual/testing)
- [Arquitetura do Sistema](./../doc/ARCHITECTURE_VALIDATION.md)
- [Plano de Implementação](./../doc/PLANO_IMPLEMENTACAO_ETAPAS.md)

## 🐛 Troubleshooting

### Erro: "Permission denied"
```bash
# Use --allow-all flag
deno test --allow-all tests/
```

### Erro: "Module not found"
```bash
# Verifique se está no diretório correto
cd back-end/supabase/functions/messaging
```

### Testes falhando
1. Verifique versão do Deno: `deno --version` (deve ser 1.30+)
2. Execute com `--verbose` para ver detalhes
3. Verifique imports e paths

## 📈 Próximos Passos

### Testes Adicionais (Futuro)

- [ ] Testes E2E com webhooks reais
- [ ] Testes de carga (load testing)
- [ ] Testes de regressão visual
- [ ] Testes com dados reais de staging

### Melhorias

- [ ] Aumentar cobertura para 90%+
- [ ] Adicionar testes para outros brokers (Gupshup, Official)
- [ ] Testes de migração de dados
- [ ] Testes de rollback

---

**Status**: ✅ **FASE 5.1 (Testes Backend WhatsApp) + FASE 8 CONCLUÍDAS**

**Datas**:
- FASE 5.1 (Testes WhatsApp): 2025-01-20
- FASE 8 (Rastreamento de Origem): 2025-01-28

**Total de Testes**: ~300+
- Testes WhatsApp Multi-Broker: ~200+
- Testes de Rastreamento de Origem: ~100+

**Cobertura**: > 80% para componentes críticos

## 📋 Resumo FASE 5.1 - Testes Unitários Backend

A FASE 5.1 implementou testes unitários completos para os handlers da integração WhatsApp Multi-Broker:

### Arquivos Criados

| Arquivo | Linhas | Testes | Descrição |
|---------|--------|--------|-----------|
| `whatsapp-schemas.test.ts` | ~300 | ~35 | Validadores Zod |
| `list-whatsapp-brokers.test.ts` | ~200 | ~15 | Handler de listar brokers |
| `create-instance.test.ts` | ~350 | ~40 | Handler de criar instância |
| `connect-instance.test.ts` | ~350 | ~40 | Handler de conectar |
| `connection-status.test.ts` | ~300 | ~35 | Handler de status |
| `configure-broker.test.ts` | ~350 | ~35 | Handler de configurar |

### Cobertura por Handler

- **whatsappSchemas**: createInstanceSchema, connectInstanceSchema, configureBrokerSchema, saveConnectedAccountSchema
- **list-whatsapp-brokers**: Filtros, segurança, formato de resposta
- **create-instance**: Schema, broker types, admin_token, resultado da instância
- **connect-instance**: Schema, suporte do broker, QR Code, Pair Code, timeouts
- **connection-status**: Acesso, config, determinação de status, resposta
- **configure-broker**: Schema, campos obrigatórios, validação, erros

### Padrões de Teste Seguidos

1. **AAA Pattern**: Arrange, Act, Assert
2. **Nomenclatura Descritiva**: `handlerName - Deve fazer X quando Y`
3. **Mocks Reutilizáveis**: Constantes de mock no topo do arquivo
4. **Edge Cases**: Cobertura de casos limite e erros
5. **Segurança**: Verificação de não exposição de dados sensíveis
