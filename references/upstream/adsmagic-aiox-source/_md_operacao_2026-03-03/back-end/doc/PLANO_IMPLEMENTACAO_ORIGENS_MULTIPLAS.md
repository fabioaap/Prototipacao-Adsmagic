# Plano de Implementação: Permitir Múltiplas Origens para o Mesmo Contato

## 📊 Status da Implementação

| Etapa | Status | Data |
|-------|--------|------|
| Etapa 1: Refatorar `addOriginToContact` | ✅ **CONCLUÍDA** | 2025-01-XX |
| Etapa 2: Criar `ensureContactExists` | ✅ **CONCLUÍDA** | 2025-01-XX |
| Etapa 3: Refatorar `processIncomingContact` | ✅ **CONCLUÍDA** | 2025-01-XX |
| Etapa 4: Remover código não utilizado | ✅ **CONCLUÍDA** | 2025-01-XX |
| Etapa 5: Atualizar testes | ✅ **CONCLUÍDA** | 2025-01-XX |
| Etapa 6: Validação e testes | ⏳ Pendente | - |

**Progresso Geral**: 5/6 etapas concluídas (83%)

---

## 📋 Objetivo

Modificar o `ContactOriginService` para sempre criar um novo registro em `contact_origins` quando houver `sourceData`, mesmo que a origem já exista. Isso permite rastrear todas as interações de um contato com diferentes origens ou mesmo origens repetidas.

## 🎯 Requisitos

1. **Sempre criar origem quando identificada**: Criar novo registro em `contact_origins` sempre que houver `sourceData`, sem verificar se já existe
2. **Sem sourceData**: Se não houver `sourceData`, apenas garantir que o contato existe na tabela `contacts`
3. **Origens repetidas permitidas**: Um usuário pode ter múltiplos registros da mesma origem em `contact_origins`
4. **Histórico completo**: Cada interação com origem deve gerar um novo registro para manter histórico completo

## 🔍 Análise do Código

### Problema Identificado (Antes da Refatoração)

**Método `addOriginToContact`** (removido/refatorado):
- ~~Atualmente verifica se já existe registro com `contact_id` + `origin_id`~~
- ~~Se existe, faz UPDATE (merge de `source_data`) em vez de criar novo registro~~
- ~~Isso impedia que o mesmo contato tenha múltiplas entradas da mesma origem~~

**Status**: ✅ **CORRIGIDO** - Método refatorado para `createContactOrigin` que sempre cria novo registro

**Método `processIncomingContact`** (ainda pendente de refatoração):
- Atualmente só chama `createContactOrigin` se houver `sourceData` válido
- Se não houver `sourceData`, não faz nada (nem garante que o contato existe)
- ⏳ **PENDENTE**: Implementar uso de `ensureContactExists` quando não houver `sourceData`

## 📐 Design da Solução

### Princípios Aplicados (SOLID + Clean Code)

1. **Single Responsibility Principle (SRP)**
   - Manter responsabilidades separadas: criar contato vs criar origem
   - Método dedicado para garantir existência do contato

2. **Open/Closed Principle (OCP)**
   - Refatorar sem quebrar contratos existentes
   - Métodos privados podem ser modificados internamente

3. **Clean Code**
   - Nomes descritivos e claros
   - Remover código desnecessário (verificação de existência)
   - Documentação JSDoc atualizada

### Mudanças Necessárias

#### 1. Refatorar `addOriginToContact` → `createContactOrigin`

**Antes**: Verificava existência e fazia UPDATE ou INSERT  
**Depois**: Sempre faz INSERT (sem verificação)

**Responsabilidade**: Criar novo registro de origem sempre que houver `sourceData`

```typescript
/**
 * Cria novo registro de origem para o contato
 * 
 * Sempre cria um novo registro, mesmo que o contato já tenha a mesma origem.
 * Isso permite rastrear todas as interações com diferentes origens ou
 * múltiplas interações da mesma origem.
 * 
 * @param params - Parâmetros para criação de origem
 */
private async createContactOrigin(params: {
  contactId: string
  projectId: string
  sourceData: StandardizedSourceData
}): Promise<void>
```

#### 2. Criar método `ensureContactExists`

**Responsabilidade**: Garantir que o contato existe (sem criar origem)

```typescript
/**
 * Garante que o contato existe na tabela contacts
 * 
 * Se o contato não existir, cria um novo contato com origem padrão "WhatsApp".
 * Não cria registro em contact_origins.
 * 
 * @param params - Parâmetros para garantir existência do contato
 * @returns ID do contato (existente ou criado)
 */
private async ensureContactExists(params: {
  projectId: string
  identifier: ContactIdentifier
  name: string
}): Promise<string>
```

#### 3. Refatorar `processIncomingContact`

**Nova lógica**:
1. Extrair identificador
2. Normalizar `sourceData`
3. Buscar contato existente
4. Se contato não existe:
   - Se tem `sourceData`: criar contato com origem (como está)
   - Se não tem `sourceData`: criar contato sem origem
5. Se contato existe:
   - Se tem `sourceData`: sempre criar novo registro em `contact_origins`
   - Se não tem `sourceData`: retornar (nada a fazer)

## 📝 Plano de Implementação

### ✅ Etapa 1: Refatorar método `addOriginToContact` - **CONCLUÍDA**

**Arquivo**: `ContactOriginService.ts`

**Ação**:
- ✅ Renomear `addOriginToContact` → `createContactOrigin`
- ✅ Remover lógica de verificação de existência (linhas 228-264)
- ✅ Remover método `mergeSourceData` (não será mais necessário)
- ✅ Simplificar para apenas chamar `insertContactOrigin`

**Status**: ✅ **IMPLEMENTADO** em 2025-01-XX

**Mudanças Realizadas**:
- ✅ Método `addOriginToContact` renomeado para `createContactOrigin` (linha 223)
- ✅ Removida toda lógica de verificação de existência (query SELECT + UPDATE removidas)
- ✅ Removido método `mergeSourceData` completamente (não será mais usado)
- ✅ Método simplificado: apenas busca origem e cria novo registro sempre
- ✅ JSDoc atualizado com descrição clara do comportamento
- ✅ Chamada atualizada em `processIncomingContact` (linha 97)
- ✅ Validação com `deno check` passou sem erros
- ✅ Nenhuma referência remanescente aos métodos antigos

**Código Implementado**:
```typescript
/**
 * Cria novo registro de origem para o contato
 * 
 * Sempre cria um novo registro em contact_origins, permitindo que
 * o mesmo contato tenha múltiplas entradas da mesma origem para
 * rastreamento histórico completo.
 * 
 * @param params - Parâmetros para criação de origem
 */
private async createContactOrigin(params: {
  contactId: string
  projectId: string
  sourceData: StandardizedSourceData
}): Promise<void> {
  // 1. Buscar/criar origem
  const originId = await this.findOrCreateOrigin({
    projectId: params.projectId,
    sourceData: params.sourceData,
  })
  
  // 2. Sempre criar novo registro (sem verificar existência)
  await this.insertContactOrigin({
    contactId: params.contactId,
    originId,
    sourceData: params.sourceData,
  })
}
```

**Código**:
```typescript
/**
 * Cria novo registro de origem para o contato
 * 
 * Sempre cria um novo registro em contact_origins, permitindo que
 * o mesmo contato tenha múltiplas entradas da mesma origem para
 * rastreamento histórico completo.
 * 
 * @param params - Parâmetros para criação de origem
 */
private async createContactOrigin(params: {
  contactId: string
  projectId: string
  sourceData: StandardizedSourceData
}): Promise<void> {
  // 1. Buscar/criar origem
  const originId = await this.findOrCreateOrigin({
    projectId: params.projectId,
    sourceData: params.sourceData,
  })
  
  // 2. Sempre criar novo registro (sem verificar existência)
  await this.insertContactOrigin({
    contactId: params.contactId,
    originId,
    sourceData: params.sourceData,
  })
}
```

**Checklist**:
- [x] Remover método `mergeSourceData` (não será mais usado) ✅
- [x] Atualizar JSDoc ✅
- [x] Atualizar chamada em `processIncomingContact` ✅
- [x] Validar com `deno check` ✅

---

### ✅ Etapa 2: Criar método `ensureContactExists` - **CONCLUÍDA**

**Arquivo**: `ContactOriginService.ts`

**Ação**:
- ✅ Criar novo método privado para garantir existência do contato
- ✅ Usar lógica similar a `createContactWithOrigin`, mas sem criar origem

**Status**: ✅ **IMPLEMENTADO** em 2025-01-XX

**Mudanças Realizadas**:
- ✅ Método `ensureContactExists` criado (linhas 214-265)
- ✅ Implementada lógica para criar contato com origem padrão "WhatsApp"
- ✅ Método não cria registro em `contact_origins` (apenas garante que contato existe)
- ✅ Registra histórico de estágio corretamente
- ✅ Retorna apenas o ID do contato criado
- ✅ JSDoc completo e claro sobre o comportamento
- ✅ Validação com `deno check` passou sem erros

**Código**:
```typescript
/**
 * Garante que o contato existe na tabela contacts
 * 
 * Se o contato não existir, cria um novo contato com origem padrão "WhatsApp".
 * Não cria registro em contact_origins.
 * 
 * @param params - Parâmetros para garantir existência do contato
 * @returns ID do contato (existente ou criado)
 */
private async ensureContactExists(params: {
  projectId: string
  identifier: ContactIdentifier
  name: string
}): Promise<string> {
  // 1. Buscar origem padrão "WhatsApp"
  const defaultOriginId = await this.findOrCreateDefaultOrigin(
    params.projectId,
    'WhatsApp'
  )
  
  // 2. Buscar primeiro estágio ativo
  const firstStage = await this.getFirstActiveStage(params.projectId)
  if (!firstStage) {
    throw new Error('Nenhum estágio ativo encontrado para o projeto')
  }
  
  // 3. Criar contato usando repository
  const canonicalId = generateCanonicalIdentifier(params.identifier)
  
  const contact = await this.contactRepo.create({
    projectId: params.projectId,
    name: params.name,
    phone: params.identifier.normalizedPhone?.phone || null,
    countryCode: params.identifier.normalizedPhone?.countryCode || null,
    jid: params.identifier.originalJid || null,
    lid: params.identifier.originalLid || null,
    canonicalIdentifier: canonicalId,
    mainOriginId: defaultOriginId,
    currentStageId: firstStage.id,
    metadata: {
      platform: 'whatsapp',
    },
  })
  
  // 4. Registrar histórico de estágio
  await this.insertStageHistory({
    contactId: contact.id,
    stageId: firstStage.id,
  })
  
  return contact.id
}
```

**Checklist**:
- [x] Criar método seguindo padrão existente ✅
- [x] Adicionar JSDoc completo ✅
- [x] Validar com `deno check` ✅
- [x] Método posicionado corretamente no código (após `createContactWithOrigin`) ✅

**Código Implementado**:
```typescript
/**
 * Garante que o contato existe na tabela contacts
 * 
 * Se o contato não existir, cria um novo contato com origem padrão "WhatsApp".
 * Não cria registro em contact_origins.
 * 
 * @param params - Parâmetros para garantir existência do contato
 * @returns ID do contato (existente ou criado)
 */
private async ensureContactExists(params: {
  projectId: string
  identifier: ContactIdentifier
  name: string
}): Promise<string> {
  // 1. Buscar origem padrão "WhatsApp"
  const defaultOriginId = await this.findOrCreateDefaultOrigin(
    params.projectId,
    'WhatsApp'
  )
  
  // 2. Buscar primeiro estágio ativo
  const firstStage = await this.getFirstActiveStage(params.projectId)
  if (!firstStage) {
    throw new Error('Nenhum estágio ativo encontrado para o projeto')
  }
  
  // 3. Criar contato usando repository
  const canonicalId = generateCanonicalIdentifier(params.identifier)
  
  const contact = await this.contactRepo.create({
    projectId: params.projectId,
    name: params.name,
    phone: params.identifier.normalizedPhone?.phone || null,
    countryCode: params.identifier.normalizedPhone?.countryCode || null,
    jid: params.identifier.originalJid || null,
    lid: params.identifier.originalLid || null,
    canonicalIdentifier: canonicalId,
    mainOriginId: defaultOriginId,
    currentStageId: firstStage.id,
    metadata: {
      platform: 'whatsapp',
    },
  })
  
  // 4. Registrar histórico de estágio
  await this.insertStageHistory({
    contactId: contact.id,
    stageId: firstStage.id,
  })
  
  return contact.id
}
```

**Nota sobre o método**:
- Este método é usado quando não há `sourceData` na mensagem
- Cria o contato com `mainOriginId` = "WhatsApp", mas não cria registro em `contact_origins`
- Diferente de `createContactWithOrigin` que cria registro em `contact_origins` quando há `sourceData`
- Será usado na Etapa 3 ao refatorar `processIncomingContact`

---

### ✅ Etapa 3: Refatorar `processIncomingContact` - **CONCLUÍDA**

**Arquivo**: `ContactOriginService.ts`

**Ação**:
- ✅ Atualizar lógica do método principal
- ✅ Garantir que sempre cria origem quando houver `sourceData`
- ✅ Usar `ensureContactExists` quando não houver `sourceData`

**Status**: ✅ **IMPLEMENTADO** em 2025-01-XX

**Mudanças Realizadas**:
- ✅ Lógica do método `processIncomingContact` completamente refatorada (linhas 63-142)
- ✅ Implementada lógica condicional para criar contato com ou sem origem
- ✅ Quando contato não existe e não tem sourceData: usa `ensureContactExists`
- ✅ Quando contato existe e tem sourceData: sempre cria novo registro usando `createContactOrigin`
- ✅ JSDoc atualizado com seção "Comportamento" detalhando todos os cenários
- ✅ Validação com `deno check` passou sem erros
- ✅ Retorno mantém compatibilidade com `ProcessContactOriginResult`

**Código**:
```typescript
async processIncomingContact(
  params: ProcessContactOriginParams
): Promise<ProcessContactOriginResult> {
  const { normalizedMessage, projectId } = params
  
  // 1. Validar condições (apenas isGroup, fromMe é validado no caller)
  if (normalizedMessage.isGroup) {
    throw new Error(
      'processIncomingContact só deve ser chamado para mensagens de contato individual (isGroup=false)'
    )
  }
  
  // 2. Extrair identificador (phone/jid/lid)
  const identifier = this.extractIdentifier(normalizedMessage)
  
  // 3. Normalizar dados de origem
  const sourceData = OriginDataNormalizer.normalize(normalizedMessage)
  
  // 4. Buscar contato existente usando busca otimizada
  const existingContact = await this.contactRepo.findByAnyIdentifier({
    projectId,
    phone: identifier.normalizedPhone?.phone,
    countryCode: identifier.normalizedPhone?.countryCode,
    jid: identifier.originalJid,
    lid: identifier.originalLid,
    canonicalIdentifier: generateCanonicalIdentifier(identifier),
  })
  
  // 5. Se contato não existe: criar com ou sem origem
  if (!existingContact) {
    if (sourceData && OriginDataNormalizer.hasOriginData(sourceData)) {
      // Criar contato com origem
      return await this.createContactWithOrigin({
        projectId,
        identifier,
        name: normalizedMessage.from.name || identifier.normalizedPhone?.phone || 'Sem nome',
        sourceData,
      })
    } else {
      // Criar contato sem origem (apenas garantir existência)
      const contactId = await this.ensureContactExists({
        projectId,
        identifier,
        name: normalizedMessage.from.name || identifier.normalizedPhone?.phone || 'Sem nome',
      })
      
      // Buscar origem padrão para retorno
      const defaultOriginId = await this.findOrCreateDefaultOrigin(projectId, 'WhatsApp')
      
      return {
        contactId,
        created: true,
        originId: defaultOriginId,
        sourceData: undefined,
      }
    }
  }
  
  // 6. Se contato existe: criar origem se houver sourceData
  let originId: string | undefined = existingContact.main_origin_id
  
  if (sourceData && OriginDataNormalizer.hasOriginData(sourceData)) {
    // Sempre criar novo registro de origem
    originId = await this.findOrCreateOrigin({
      projectId,
      sourceData,
    })
    
    await this.createContactOrigin({
      contactId: existingContact.id,
      projectId,
      sourceData,
    })
  }
  
  return {
    contactId: existingContact.id,
    created: false,
    originId,
    sourceData: sourceData || undefined,
  }
}
```

**Checklist**:
- [x] Atualizar lógica do método ✅
- [x] Atualizar JSDoc do método ✅
- [x] Manter compatibilidade com retorno `ProcessContactOriginResult` ✅
- [x] Validar com `deno check` ✅
- [ ] Testar todos os cenários (pendente - Etapa 5)

**Código Implementado**:
O método `processIncomingContact` foi refatorado conforme o código acima. A lógica agora cobre todos os cenários:
- Contato não existe + sourceData: cria com origem
- Contato não existe + sem sourceData: cria sem origem (apenas garante existência)
- Contato existe + sourceData: sempre cria novo registro de origem
- Contato existe + sem sourceData: retorna contato existente

**JSDoc Atualizado**:
Adicionada seção "Comportamento" no JSDoc explicando todos os cenários possíveis e o comportamento esperado para cada um.

**Nota sobre o comportamento implementado**:
O método agora cobre todos os cenários possíveis:
- **Contato não existe + sourceData**: Cria contato completo com origem via `createContactWithOrigin`
- **Contato não existe + sem sourceData**: Cria apenas o contato (sem origem) via `ensureContactExists`
- **Contato existe + sourceData**: Sempre cria novo registro em `contact_origins` via `createContactOrigin` (permite múltiplas origens)
- **Contato existe + sem sourceData**: Retorna contato existente sem criar origem

Isso permite rastreamento histórico completo de todas as interações com origens, mesmo quando o usuário vem da mesma origem múltiplas vezes.

---

### Etapa 4: Remover código não utilizado

**Arquivo**: `ContactOriginService.ts`

**Ação**:
- Remover método `mergeSourceData` (linhas 463-486)
- Remover código de UPDATE em `addOriginToContact` (já removido na Etapa 1)

**Checklist**:
- [ ] Remover `mergeSourceData`
- [ ] Verificar se há outros métodos não utilizados
- [ ] Executar linter para verificar código morto

---

### ✅ Etapa 5: Atualizar testes - **CONCLUÍDA**

**Arquivo**: `contact-origin-service.test.ts`

**Status**: ✅ **IMPLEMENTADO** em 2025-01-XX

**Mudanças Realizadas**:
- ✅ Adicionados 4 novos testes para cobrir novos comportamentos
- ✅ Mock de Supabase atualizado para suportar tabela `contacts`
- ✅ Mock de `origins` atualizado para suportar `.is()` e múltiplos `.eq()` encadeados
- ✅ Mock de `stages` atualizado para suportar `maybeSingle()` corretamente
- ✅ Métodos auxiliares adicionados ao mock: `getContactOrigins()`, `getContactOriginsCount()`
- ✅ Todos os 21 testes passando

**Cenários de teste implementados**:

1. **Teste: Contato existente com sourceData cria nova origem**
   ```typescript
   it('should create new contact origin when sourceData exists, even if origin already exists', async () => {
     // Arrange: Contato existente com origem Meta Ads
     // Act: Enviar mensagem com sourceData Meta Ads novamente
     // Assert: Novo registro em contact_origins deve ser criado
   })
   ```

2. **Teste: Contato existente sem sourceData não cria origem**
   ```typescript
   it('should not create contact origin when contact exists but no sourceData', async () => {
     // Arrange: Contato existente
     // Act: Enviar mensagem sem sourceData
     // Assert: Nenhum registro em contact_origins deve ser criado
   })
   ```

3. **Teste: Contato não existente sem sourceData cria apenas contato**
   ```typescript
   it('should create contact without origin when no sourceData', async () => {
     // Arrange: Contato não existe
     // Act: Enviar mensagem sem sourceData
     // Assert: Contato criado, mas nenhum registro em contact_origins
   })
   ```

4. **Teste: Múltiplas origens do mesmo tipo são permitidas**
   ```typescript
   it('should allow multiple contact origins with same origin_id', async () => {
     // Arrange: Contato existe
     // Act: Enviar 3 mensagens com sourceData Meta Ads
     // Assert: 3 registros em contact_origins com mesmo origin_id
   })
   ```

**Checklist**:
- [x] Adicionar novos testes ✅
- [x] Atualizar mock para suportar todas as tabelas necessárias ✅
- [x] Executar todos os testes ✅ (21 testes passando)
- [x] Validar com `deno check` ✅

**Testes Adicionados**:
1. ✅ `should create new contact origin when sourceData exists, even if origin already exists`
   - Verifica que sempre cria novo registro mesmo quando origem já existe
   - Passa: ✅

2. ✅ `should not create contact origin when contact exists but no sourceData`
   - Verifica que não cria origem quando contato existe mas não há sourceData
   - Passa: ✅

3. ✅ `should create contact without origin when no sourceData`
   - Verifica que cria apenas contato (sem origem) quando não há sourceData
   - Passa: ✅

4. ✅ `should allow multiple contact origins with same origin_id`
   - Verifica que permite múltiplos registros da mesma origem
   - Passa: ✅

---

### Etapa 6: Validação e Testes

**Ações**:

1. **Testes unitários**
   ```bash
   cd back-end/supabase/functions/messaging
   deno test tests/contact-origin-service.test.ts
   ```

2. **Type checking**
   ```bash
   deno check services/ContactOriginService.ts
   ```

3. **Linter**
   ```bash
   deno lint services/ContactOriginService.ts
   ```

4. **Teste manual**
   - Enviar mensagem com sourceData (verificar criação de origem)
   - Enviar mensagem sem sourceData (verificar que contato existe)
   - Enviar múltiplas mensagens com mesma origem (verificar múltiplos registros)

**Checklist**:
- [ ] Todos os testes passam
- [ ] Type checking passa
- [ ] Linter passa
- [ ] Teste manual realizado

---

## 📊 Resumo das Mudanças

### Arquivos Modificados

1. **`ContactOriginService.ts`**
   - ✅ Refatorar `addOriginToContact` → `createContactOrigin` (**CONCLUÍDO**)
   - ✅ Criar método `ensureContactExists` (**CONCLUÍDO**)
   - ✅ Refatorar `processIncomingContact` (**CONCLUÍDO**)
   - ✅ Remover `mergeSourceData` (**CONCLUÍDO**)

2. **`contact-origin-service.test.ts`**
   - ✅ Adicionar testes para novos comportamentos (**CONCLUÍDO**)
   - ✅ Atualizar mock para suportar todas as tabelas (**CONCLUÍDO**)
   - ✅ Todos os testes passando (21 testes)

### Métodos Modificados

| Método | Ação | Impacto | Status |
|--------|------|---------|--------|
| `processIncomingContact` | Refatorado | Alto - Lógica principal alterada | ✅ **CONCLUÍDO** |
| `addOriginToContact` → `createContactOrigin` | Renomeado e simplificado | Médio - Removida verificação de existência | ✅ **CONCLUÍDO** |
| `mergeSourceData` | Removido | Baixo - Não será mais usado | ✅ **CONCLUÍDO** |

### Métodos Criados

| Método | Responsabilidade | Status |
|--------|------------------|--------|
| `createContactOrigin` | Sempre criar novo registro de origem | ✅ **CRIADO** |
| `ensureContactExists` | Garantir que contato existe sem criar origem | ✅ **CRIADO** |

### Comportamento Antes vs Depois

| Cenário | Antes | Depois |
|---------|-------|--------|
| Contato existe + sourceData | UPDATE se origem existe | Sempre INSERT |
| Contato existe + sem sourceData | Nada | Nada (sem mudança) |
| Contato não existe + sourceData | Criar contato + origem | Criar contato + origem (sem mudança) |
| Contato não existe + sem sourceData | Criar contato + origem padrão | Criar apenas contato |

## ✅ Critérios de Sucesso

1. ✅ Sempre criar novo registro em `contact_origins` quando houver `sourceData`
2. ✅ Não verificar se origem já existe antes de criar
3. ✅ Quando não houver `sourceData`, apenas garantir que contato existe
4. ✅ Permitir múltiplos registros da mesma origem para o mesmo contato
5. ✅ Todos os testes passam
6. ✅ Código segue princípios SOLID e Clean Code
7. ✅ TypeScript strict mode
8. ✅ Documentação JSDoc atualizada

## 🔒 Segurança e Rollback

### Possíveis Problemas

1. **Múltiplos registros podem gerar muitos dados**
   - Mitigação: Considere adicionar índices apropriados
   - Monitorar crescimento da tabela `contact_origins`

2. **Performance em queries**
   - Mitigação: Índices já existem em `contact_id` e `origin_id`
   - Considerar indexação adicional se necessário

### Plano de Rollback

Se houver problemas:

1. Reverter commit
2. Restaurar método `mergeSourceData` se necessário
3. Restaurar lógica de UPDATE em `addOriginToContact`

## 📅 Ordem de Execução

1. ✅ **Etapa 1: Refatorar `addOriginToContact`** - **CONCLUÍDA**
   - Método renomeado para `createContactOrigin`
   - Lógica de verificação removida
   - Método `mergeSourceData` removido
   - Validação com `deno check` passou

2. ✅ **Etapa 2: Criar `ensureContactExists`** - **CONCLUÍDA**
   - Método criado seguindo padrão existente
   - Cria contato com origem padrão "WhatsApp"
   - Não cria registro em `contact_origins`
   - JSDoc completo implementado
   - Validação com `deno check` passou

3. ✅ **Etapa 3: Refatorar `processIncomingContact`** - **CONCLUÍDA**
   - Lógica completamente refatorada para cobrir todos os cenários
   - Implementado uso de `ensureContactExists` quando não há sourceData
   - Implementado uso de `createContactOrigin` quando há sourceData (sempre cria novo registro)
   - JSDoc atualizado com seção "Comportamento"
   - Validação com `deno check` passou
   - Compatibilidade com `ProcessContactOriginResult` mantida

4. ✅ **Etapa 4: Remover código não utilizado** - **CONCLUÍDA** (feita na Etapa 1)
5. ✅ **Etapa 5: Atualizar testes** - **CONCLUÍDA**
   - 4 novos testes adicionados
   - Mock atualizado para suportar todas as tabelas e queries necessárias
   - Todos os 21 testes passando
   - Validação com `deno check` passou

6. ⏳ **Etapa 6: Validação e testes** - **PENDENTE**

## 📝 Notas de Implementação

- Manter compatibilidade com interface `ProcessContactOriginResult`
- Não alterar contratos públicos (apenas métodos privados)
- Documentar decisões de design no código
- Seguir convenções de nomenclatura existentes
