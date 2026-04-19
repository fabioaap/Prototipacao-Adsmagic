# 🔍 Análise: Preparação do Sistema para JID e LID do WhatsApp

## 📋 Resumo Executivo

Este documento analisa a arquitetura atual e propõe um plano de implementação para que o sistema aceite **JID (Jabber ID)** e **LID (Local ID)** além do número de telefone tradicional como identificadores de contatos no WhatsApp.

**Contexto**: O WhatsApp está evoluindo para usar identificadores únicos (JID/LID) além ou em substituição aos números de telefone, especialmente em contextos de automação e APIs. O sistema precisa ser preparado para aceitar esses novos formatos sem quebrar a funcionalidade existente.

---

## 🎯 Objetivos

1. ✅ **Suportar múltiplos formatos de identificação**: número de telefone, JID, ou LID
2. ✅ **Manter retrocompatibilidade**: sistema atual que usa números de telefone continua funcionando
3. ✅ **Normalização unificada**: converter todos os formatos para um identificador interno padronizado
4. ✅ **Rastreamento correto**: garantir que contatos sejam identificados corretamente independente do formato recebido
5. ✅ **Extensibilidade futura**: preparar para outros formatos que possam surgir

---

## ⚠️ ORDEM CORRETA DE IMPLEMENTAÇÃO

**IMPORTANTE**: Seguir esta ordem para evitar problemas de dependências.

### **FASE 0: Tipos e Validadores** (BLOQUEADOR - Antes de tudo)
1. Atualizar tipos TypeScript (4 arquivos)
2. Atualizar validadores Zod (2 arquivos)

**Por que primeiro?** Tipos e validadores são usados por TODO o código. Se não atualizar primeiro, TypeScript vai reclamar e validadores vão rejeitar requisições.

### **FASE 1.5: Migração de Dados Existentes** (BLOQUEADOR - Antes de unique constraints)
1. Preencher `canonical_identifier` para contatos existentes
2. Resolver duplicatas

**Por que antes de unique constraints?** Se criar unique constraints sem resolver duplicatas, migração vai falhar.

### **FASE 2: Banco de Dados** (Inclui ajuste de constraints existentes)
1. Remover NOT NULL de phone/country_code
2. Ajustar constraints existentes para permitir NULL
3. Adicionar campos jid, lid, canonical_identifier
4. Criar unique constraints (APÓS Fase 1.5)

### **FASE 1: Refatoração de Normalização**
1. Refatorar `phone-normalizer.ts` → `identifier-normalizer.ts`
2. Implementar suporte a JID/LID

### **FASES 3-8: Código e Testes**
3. Repository
4. UazapiBroker
5. Processor
6. API REST
7. Testes

**Ver seções detalhadas abaixo para cada fase.**

---

## 📐 Análise da Arquitetura Atual

### 1. Fluxo Atual de Processamento

```
Webhook → Normalizer → Processor → Database
```

#### **Ponto de Entrada: Webhook**
- **Arquivo**: `back-end/supabase/functions/messaging/handlers/webhook.ts`
- **Responsabilidade**: Recebe webhook e delega para normalização

#### **Normalização: UazapiBroker**
- **Arquivo**: `back-end/supabase/functions/messaging/brokers/uazapi/UazapiBroker.ts`
- **Método**: `extractContactInfo()` (linhas 230-253)
- **Comportamento atual**:
  ```typescript
  // Extrai número do contato (remove @s.whatsapp.net e @c.us)
  const phoneNumber = message.chatid
    .replace('@s.whatsapp.net', '')
    .replace('@c.us', '')
  ```
- **Campos disponíveis no webhook**:
  - `message.chatid`: JID no formato `"554791662434@s.whatsapp.net"`
  - `message.sender_lid`: LID no formato `"213709100187796@lid"` (opcional)
  - `message.sender_pn`: JID alternativo (opcional)
  - `message.sender`: Pode ser JID ou LID

#### **Processamento: WhatsAppProcessor**
- **Arquivo**: `back-end/supabase/functions/messaging/core/processor.ts`
- **Método**: `findOrCreateContact()` (linhas 81-162)
- **Comportamento atual**:
  ```typescript
  // Extrair código do país e número
  const phoneMatch = params.phoneNumber.match(/^(\d{1,3})(\d{8,15})$/)
  const countryCode = phoneMatch ? phoneMatch[1] : '55'
  const phone = phoneMatch ? phoneMatch[2] : params.phoneNumber.replace(/^\d{1,3}/, '')
  ```
- **Busca no banco**: Por `phone` + `country_code`

#### **Armazenamento: Tabela `contacts`**
- **Campos**: `phone` (VARCHAR 15), `country_code` (VARCHAR 3)
- **Índices**: `idx_contacts_phone` em `phone`
- **Constraint**: `contacts_phone_format CHECK (phone ~ '^[0-9]{8,15}$')`

### 2. Limitações Identificadas

#### ❌ **Limitação 1: Assumir que sempre há número de telefone**
- Código atual assume que `chatid` sempre contém um número de telefone
- Não trata casos onde `sender_lid` ou `sender` são LIDs puros
- Não preserva o identificador original (JID/LID) para referência futura

#### ❌ **Limitação 2: Regex de extração de telefone**
- Regex `^(\d{1,3})(\d{8,15})$` funciona apenas para números de telefone
- Falha se receber JID completo (`+5511999999999@s.whatsapp.net`) sem remoção prévia
- Falha se receber LID (`213709100187796@lid`)

#### ❌ **Limitação 3: Constraint de banco restritiva**
- Constraint `contacts_phone_format` permite apenas dígitos
- Não permite armazenar JID/LID como identificadores alternativos

#### ❌ **Limitação 4: Busca por telefone apenas**
- `findOrCreateContact()` busca apenas por `phone` + `country_code`
- Não busca por JID/LID se o contato foi criado com um desses formatos

---

## 🏗️ Plano de Implementação

### **Fase 1: Refatoração de Normalização de Identificadores**

**Objetivo**: Refatorar `phone-normalizer.ts` para suportar JID e LID além de telefone.

**Decisão Arquitetural**: **REFATORAR** em vez de criar novo arquivo (DRY + OCP + SRP)

**Por que refatorar?**
- ✅ **DRY**: Evita duplicar lógica de normalização de telefone já existente
- ✅ **OCP**: Estende componente existente sem criar novo arquivo
- ✅ **SRP**: Mantém responsabilidade única (normalizar identificadores)
- ✅ **Manutenibilidade**: Um único ponto de verdade

**Arquitetura**: Seguindo **SOLID** e **Clean Code**:
- **SRP**: Cada função normaliza um tipo específico de identificador
- **OCP**: Estrutura extensível para novos formatos via Strategy Pattern
- **DIP**: Interface `IIdentifierNormalizer` permite diferentes implementações
- **DRY**: Reutiliza lógica de normalização de telefone existente

**Arquivo**: `back-end/supabase/functions/messaging/utils/identifier-normalizer.ts` (REFATORADO de `phone-normalizer.ts`)

```typescript
/**
 * Utilitário para normalização de identificadores de contato WhatsApp
 * 
 * REFATORADO de phone-normalizer.ts para suportar JID e LID além de telefone.
 * 
 * Arquitetura seguindo SOLID:
 * - DRY: Reutiliza lógica existente de normalização de telefone
 * - SRP: Cada função normaliza um tipo específico
 * - OCP: Extensível via Strategy Pattern para novos formatos
 * - DIP: Interface IIdentifierNormalizer permite diferentes implementações
 * - KISS: Código simples e direto, sem wrappers deprecated desnecessários
 * 
 * Suporta múltiplos formatos:
 * - Número de telefone: "5511999999999", "+5511999999999"
 * - JID: "5511999999999@s.whatsapp.net", "5511999999999-1234567890@g.us"
 * - LID: "213709100187796@lid"
 * 
 * Funções principais:
 * - normalizeIdentifier(): Normaliza qualquer formato (telefone, JID, LID)
 * - extractPhoneNumber(): Extrai telefone de telefone ou JID (refatorada para usar normalizeIdentifier() internamente)
 */

/**
 * Interface para normalização de identificadores (DIP)
 * Permite diferentes estratégias de normalização por broker
 */
export interface IIdentifierNormalizer {
  normalize(input: string): ContactIdentifier
}

/**
 * Identificador normalizado de contato
 */
export interface ContactIdentifier {
  normalizedPhone?: {
    phone: string
    countryCode: string
  }
  originalJid?: string
  originalLid?: string
  originalPhone?: string
  primaryType: 'phone' | 'jid' | 'lid'
  canonicalId: string
}

/**
 * Constantes para padrões regex (evita magic strings)
 */
const PATTERNS = {
  JID_INDIVIDUAL: /^(\d{1,3})(\d{8,15})@s\.whatsapp\.net$/,
  JID_GROUP: /^(\d{1,3})(\d{8,15})-(\d+)@g\.us$/,
  JID_BROADCAST: /^(\d{1,3})(\d{8,15})-(\d+)@broadcast$/,
  LID: /^(\d{10,20})@lid$/,  // ⚠️ CORREÇÃO: Validar tamanho (10-20 dígitos)
  PHONE_PURE: /^(\d{1,3})(\d{8,15})$/,
} as const

/**
 * Normaliza JID individual (SRP: função única responsabilidade)
 * 
 * @param input - JID no formato "5511999999999@s.whatsapp.net"
 * @returns Identificador normalizado ou null
 */
function normalizeIndividualJid(input: string): ContactIdentifier | null {
  const match = input.match(PATTERNS.JID_INDIVIDUAL)
  if (!match) return null
  
  return {
    normalizedPhone: {
      countryCode: match[1],
      phone: match[2],
    },
    originalJid: input,
    primaryType: 'jid',
    canonicalId: `${match[1]}${match[2]}`,
  }
}

/**
 * Normaliza JID de grupo (SRP: função única responsabilidade)
 * 
 * @param input - JID no formato "5511999999999-1234567890@g.us"
 * @returns Identificador normalizado ou null
 */
function normalizeGroupJid(input: string): ContactIdentifier | null {
  const match = input.match(PATTERNS.JID_GROUP)
  if (!match) return null
  
  return {
    normalizedPhone: {
      countryCode: match[1],
      phone: match[2],
    },
    originalJid: input,
    primaryType: 'jid',
    canonicalId: `${match[1]}${match[2]}`,
  }
}

/**
 * Normaliza LID (SRP: função única responsabilidade)
 * 
 * @param input - LID no formato "213709100187796@lid"
 * @returns Identificador normalizado ou null
 */
function normalizeLid(input: string): ContactIdentifier | null {
  const match = input.match(PATTERNS.LID)
  if (!match) return null
  
  const lidNumber = match[1]
  
  // ⚠️ CORREÇÃO: Validação adicional de tamanho (já validado no regex)
  // Regex já garante 10-20 dígitos, mas manter validação explícita
  if (lidNumber.length < 10 || lidNumber.length > 20) {
    return null  // LID inválido
  }
  
  return {
    originalLid: input,
    primaryType: 'lid',
    canonicalId: `lid:${lidNumber}`,
  }
}

/**
 * Normaliza número de telefone puro (SRP: função única responsabilidade)
 * 
 * @param input - Telefone no formato "5511999999999" ou "+5511999999999"
 * @returns Identificador normalizado ou null
 */
function normalizePhone(input: string): ContactIdentifier | null {
  const cleaned = input.replace(/^\+/, '').replace(/@.*$/, '')
  const match = cleaned.match(PATTERNS.PHONE_PURE)
  if (!match) return null
  
  return {
    normalizedPhone: {
      countryCode: match[1],
      phone: match[2],
    },
    originalPhone: input,
    primaryType: 'phone',
    canonicalId: `${match[1]}${match[2]}`,
  }
}

/**
 * Normaliza identificador de contato WhatsApp
 * 
 * Segue Strategy Pattern: tenta cada normalizador em ordem
 * 
 * @param input - Identificador em qualquer formato (telefone, JID, ou LID)
 * @returns Identificador normalizado
 * @throws {Error} Se input for inválido
 */
export function normalizeIdentifier(input: string): ContactIdentifier {
  if (!input || typeof input !== 'string') {
    throw new Error('Contact identifier input must be a non-empty string')
  }
  
  // Tentar cada normalizador específico (Strategy Pattern)
  const normalizers: Array<(input: string) => ContactIdentifier | null> = [
    normalizeIndividualJid,
    normalizeGroupJid,
    normalizeLid,
    normalizePhone,
  ]
  
  for (const normalizer of normalizers) {
    const result = normalizer(input)
    if (result) return result
  }
  
  // ⚠️ CORREÇÃO: Não criar identificador para formato desconhecido
  // Lançar erro em vez de criar identificador inválido
  throw new Error(
    `Formato de identificador não reconhecido: ${input}. ` +
    `Formatos suportados: telefone (8-15 dígitos), ` +
    `JID (ex: 5511999999999@s.whatsapp.net ou 5511999999999-1234567890@g.us), ` +
    `LID (ex: 213709100187796@lid)`
  )
}

/**
 * Extrai número de telefone e código do país de uma string
 * 
 * REFATORADA: Agora usa normalizeIdentifier() internamente para suportar telefone, JID e LID.
 * 
 * Suporta múltiplos formatos:
 * - Número: "5511999999999", "+5511999999999"
 * - JID: "5511999999999@s.whatsapp.net" (extrai telefone do JID)
 * - LID: Não suportado (LID não contém telefone)
 * 
 * @param input - Identificador em qualquer formato (telefone ou JID)
 * @returns Número normalizado e código do país
 * @throws {Error} Se não encontrar número de telefone no identificador
 */
export function extractPhoneNumber(input: string): { phone: string; countryCode: string } {
  // Reutiliza normalizeIdentifier() internamente (DRY)
  const identifier = normalizeIdentifier(input)
  
  if (!identifier.normalizedPhone) {
    throw new Error(`No phone number found in identifier: ${input}`)
  }
  
  return {
    phone: identifier.normalizedPhone.phone,
    countryCode: identifier.normalizedPhone.countryCode,
  }
}

// Alias para compatibilidade (mantém nome antigo funcionando)
export const normalizeContactIdentifier = normalizeIdentifier

/**
 * Interface para dados de webhook contendo identificadores
 */
export interface WebhookContactIdentifierData {
  chatid?: string
  sender_lid?: string
  sender_pn?: string
  sender?: string
}

/**
 * Enriquece identificador normalizado com dados adicionais do webhook
 * 
 * @param normalized - Identificador já normalizado
 * @param webhookData - Dados adicionais do webhook
 * @returns Identificador enriquecido
 */
function enrichIdentifierWithWebhookData(
  normalized: ContactIdentifier,
  webhookData: WebhookContactIdentifierData
): ContactIdentifier {
  if (webhookData.sender_lid) {
    normalized.originalLid = webhookData.sender_lid
  }
  
  // Se sender_pn é diferente do chatid, pode ser JID alternativo
  if (webhookData.sender_pn && webhookData.chatid && webhookData.sender_pn !== webhookData.chatid) {
    // Preservar JID principal e adicionar alternativo
    normalized.originalJid = normalized.originalJid || ''
    // Nota: Em produção, considere usar array ou objeto para múltiplos JIDs
  }
  
  return normalized
}

/**
 * Prioridades de campos do webhook (constante para evitar magic strings)
 */
const WEBHOOK_FIELD_PRIORITIES: Array<keyof WebhookContactIdentifierData> = [
  'chatid',     // Prioridade 1: sempre presente, JID padrão
  'sender_pn',  // Prioridade 2: JID alternativo
  'sender_lid', // Prioridade 3: LID
  'sender',     // Prioridade 4: pode ser JID ou LID
]

/**
 * Normaliza múltiplos identificadores do webhook
 * 
 * Segue SRP: função única responsabilidade de orquestrar normalização
 * 
 * @param webhookData - Dados do webhook contendo múltiplos identificadores
 * @returns Identificador normalizado com priorização correta
 * @throws {Error} Se nenhum identificador for encontrado
 */
export function normalizeWebhookIdentifier(
  webhookData: WebhookContactIdentifierData
): ContactIdentifier {
  // Buscar primeiro campo disponível conforme prioridade
  for (const field of WEBHOOK_FIELD_PRIORITIES) {
    const value = webhookData[field]
    if (value) {
      const normalized = normalizeIdentifier(value)
      
      // Se chatid (prioridade 1), enriquecer com dados adicionais
      if (field === 'chatid') {
        return enrichIdentifierWithWebhookData(normalized, webhookData)
      }
      
      return normalized
    }
  }
  
  throw new Error('No contact identifier found in webhook data')
}

// Alias para compatibilidade
export const normalizeWebhookContactIdentifier = normalizeWebhookIdentifier
```

**Checklist de Refatoração**:
- [ ] Renomear `phone-normalizer.ts` → `identifier-normalizer.ts`
- [ ] Refatorar função `extractPhoneNumber()` diretamente para usar `normalizeIdentifier()` internamente
- [ ] Adicionar funções de normalização específicas para JID e LID (SRP)
- [ ] Implementar `normalizeIdentifier()` como função principal (orquestrador)
- [ ] Implementar `normalizeWebhookContactIdentifier()` (orquestrador)
- [ ] Adicionar constantes para padrões regex (evitar magic strings)
- [ ] Migrar código existente gradualmente
- [ ] Testes unitários para todos os formatos (telefone, JID, LID)
- [ ] Testes de edge cases (valores vazios, formatos inválidos)
- [ ] Testes de `extractPhoneNumber()` refatorada (com telefone, JID)

**Princípios SOLID aplicados**:
- ✅ **DRY**: Reutiliza lógica existente de normalização de telefone
- ✅ **SRP**: Cada função normaliza um tipo específico
- ✅ **OCP**: Estende componente existente sem criar novo (Strategy Pattern)
- ✅ **DIP**: Interface `IIdentifierNormalizer` permite diferentes implementações
- ✅ **Clean Code**: Funções pequenas (< 20 linhas), nomenclatura clara, constantes nomeadas

---

### **Fase 2: Atualização do Banco de Dados**

**Objetivo**: Adicionar campos para armazenar JID/LID sem quebrar estrutura existente.

**Migração**: `back-end/supabase/migrations/XXX_add_jid_lid_to_contacts.sql` (NOVO)

```sql
-- Migration: Adicionar suporte a JID e LID em contacts
-- Data: 2024-XX-XX
-- Descrição: Adiciona campos opcionais para armazenar JID/LID como identificadores alternativos
-- 
-- ⚠️ CORREÇÃO CRÍTICA: Remove NOT NULL de phone e country_code para permitir contatos apenas com LID

BEGIN;

-- ⚠️ CORREÇÃO CRÍTICA: Remover NOT NULL de phone e country_code
-- Permite criar contato apenas com JID/LID (sem telefone)
ALTER TABLE contacts
  ALTER COLUMN phone DROP NOT NULL,
  ALTER COLUMN country_code DROP NOT NULL;

-- ⚠️ CORREÇÃO CRÍTICA: Ajustar constraints existentes para permitir NULL
-- Constraints existentes não permitem NULL, precisam ser ajustadas
ALTER TABLE contacts DROP CONSTRAINT IF EXISTS contacts_phone_format;
ALTER TABLE contacts DROP CONSTRAINT IF EXISTS contacts_country_code_format;

-- Re-criar constraints permitindo NULL
ALTER TABLE contacts ADD CONSTRAINT contacts_phone_format 
  CHECK (phone IS NULL OR phone ~ '^[0-9]{8,15}$');

ALTER TABLE contacts ADD CONSTRAINT contacts_country_code_format 
  CHECK (country_code IS NULL OR country_code ~ '^[0-9]{1,3}$');

-- Adicionar campos opcionais para identificadores alternativos
ALTER TABLE contacts
ADD COLUMN IF NOT EXISTS jid VARCHAR(255),           -- JID completo (ex: 5511999999999@s.whatsapp.net)
ADD COLUMN IF NOT EXISTS lid VARCHAR(255),           -- LID completo (ex: 213709100187796@lid)
ADD COLUMN IF NOT EXISTS canonical_identifier VARCHAR(255); -- Identificador canônico para busca

-- ⚠️ CORREÇÃO CRÍTICA: Constraint que garante pelo menos um identificador
ALTER TABLE contacts ADD CONSTRAINT contacts_identifier_required 
  CHECK (
    phone IS NOT NULL OR 
    jid IS NOT NULL OR 
    lid IS NOT NULL OR
    canonical_identifier IS NOT NULL
  );

-- ⚠️ CORREÇÃO CRÍTICA: Unique constraints para evitar duplicação
-- Unique constraint para canonical_identifier (por projeto)
CREATE UNIQUE INDEX IF NOT EXISTS idx_contacts_canonical_identifier_unique 
ON contacts(project_id, canonical_identifier) 
WHERE canonical_identifier IS NOT NULL;

-- Unique constraint para jid (por projeto)
CREATE UNIQUE INDEX IF NOT EXISTS idx_contacts_jid_unique 
ON contacts(project_id, jid) 
WHERE jid IS NOT NULL;

-- Unique constraint para lid (por projeto)
CREATE UNIQUE INDEX IF NOT EXISTS idx_contacts_lid_unique 
ON contacts(project_id, lid) 
WHERE lid IS NOT NULL;

-- Unique constraint para phone + country_code (por projeto)
CREATE UNIQUE INDEX IF NOT EXISTS idx_contacts_phone_unique 
ON contacts(project_id, phone, country_code) 
WHERE phone IS NOT NULL AND country_code IS NOT NULL;

-- ⚠️ CORREÇÃO: Índices compostos otimizados (project_id + identifier)
-- Permite busca eficiente com WHERE project_id = X AND identifier = Y
CREATE INDEX IF NOT EXISTS idx_contacts_project_jid 
ON contacts(project_id, jid) 
WHERE jid IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_contacts_project_lid 
ON contacts(project_id, lid) 
WHERE lid IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_contacts_project_canonical 
ON contacts(project_id, canonical_identifier) 
WHERE canonical_identifier IS NOT NULL;

-- Comentários explicativos
COMMENT ON COLUMN contacts.jid IS 
'JID (Jabber ID) do WhatsApp. Formato: +5511999999999@s.whatsapp.net ou +5511999999999-1234567890@g.us';

COMMENT ON COLUMN contacts.lid IS 
'LID (Local ID) do WhatsApp. Formato: 213709100187796@lid';

COMMENT ON COLUMN contacts.canonical_identifier IS 
'Identificador canônico único usado para busca. Pode ser número de telefone, JID, ou LID prefixado. Deve ser único por projeto.';

COMMENT ON CONSTRAINT contacts_identifier_required ON contacts IS 
'Garante que contato tenha pelo menos um identificador (phone, jid, lid ou canonical_identifier)';

-- ⚠️ IMPORTANTE: Preencher canonical_identifier para contatos existentes antes de criar unique constraints
-- Executar script de migração de dados (ver abaixo)

COMMIT;
```

**Estratégia de Migração**:
1. Campos opcionais (`NULL` permitido)
2. **CORREÇÃO CRÍTICA**: `phone` e `country_code` agora são opcionais (NOT NULL removido)
3. Constraint garante pelo menos um identificador (phone, jid, lid ou canonical_identifier)
4. Unique constraints previnem duplicação
5. Migração gradual: campos preenchidos conforme webhooks novos chegam

**Checklist**:
- [ ] Criar arquivo de migração
- [ ] Testar em ambiente local
- [ ] Validar índices criados corretamente
- [ ] Documentar estratégia de preenchimento gradual

---

### **Fase 3: Atualização do Repository**

**Objetivo**: Atualizar `ContactRepository` para buscar por múltiplos identificadores.

**Arquivo**: `back-end/supabase/functions/messaging/repositories/ContactRepository.ts` (ATUALIZAR)

```typescript
/**
 * Parâmetros para busca de contato por identificadores
 */
export interface FindContactByIdentifiersParams {
  projectId: string
  canonicalId?: string
  phone?: string
  countryCode?: string
  jid?: string
  lid?: string
}

/**
 * Prioridades de busca (constante)
 */
const SEARCH_PRIORITIES = [
  'canonical_identifier', // Prioridade 1: mais rápido, índice dedicado
  'phone_country_code',   // Prioridade 2: retrocompatibilidade
  'jid',                  // Prioridade 3
  'lid',                  // Prioridade 4
] as const

/**
 * Busca contato por canonical_identifier (SRP: função única)
 * 
 * @param params - Parâmetros de busca
 * @returns Contato encontrado ou null
 */
private async findByCanonicalId(params: FindContactByIdentifiersParams): Promise<Contact | null> {
  if (!params.canonicalId) return null
  
  const { data, error } = await this.supabaseClient
    .from('contacts')
    .select('*')
    .eq('project_id', params.projectId)
    .eq('canonical_identifier', params.canonicalId)
    .single()
  
  if (data) return data as Contact
  if (error && error.code !== 'PGRST116') {
    throw new Error(`Erro ao buscar contato por canonical_identifier: ${error.message}`)
  }
  
  return null
}

/**
 * Busca contato por phone + country_code (SRP: função única)
 * 
 * @param params - Parâmetros de busca
 * @returns Contato encontrado ou null
 */
private async findByPhoneAndCountryCode(
  params: FindContactByIdentifiersParams
): Promise<Contact | null> {
  if (!params.phone || !params.countryCode) return null
  
  const { data, error } = await this.supabaseClient
    .from('contacts')
    .select('*')
    .eq('project_id', params.projectId)
    .eq('phone', params.phone)
    .eq('country_code', params.countryCode)
    .single()
  
  if (data) return data as Contact
  if (error && error.code !== 'PGRST116') {
    throw new Error(`Erro ao buscar contato por telefone: ${error.message}`)
  }
  
  return null
}

/**
 * Busca contato por JID (SRP: função única)
 * 
 * @param params - Parâmetros de busca
 * @returns Contato encontrado ou null
 */
private async findByJid(params: FindContactByIdentifiersParams): Promise<Contact | null> {
  if (!params.jid) return null
  
  const { data, error } = await this.supabaseClient
    .from('contacts')
    .select('*')
    .eq('project_id', params.projectId)
    .eq('jid', params.jid)
    .single()
  
  if (data) return data as Contact
  if (error && error.code !== 'PGRST116') {
    throw new Error(`Erro ao buscar contato por JID: ${error.message}`)
  }
  
  return null
}

/**
 * Busca contato por LID (SRP: função única)
 * 
 * @param params - Parâmetros de busca
 * @returns Contato encontrado ou null
 */
private async findByLid(params: FindContactByIdentifiersParams): Promise<Contact | null> {
  if (!params.lid) return null
  
  const { data, error } = await this.supabaseClient
    .from('contacts')
    .select('*')
    .eq('project_id', params.projectId)
    .eq('lid', params.lid)
    .single()
  
  if (data) return data as Contact
  if (error && error.code !== 'PGRST116') {
    throw new Error(`Erro ao buscar contato por LID: ${error.message}`)
  }
  
  return null
}

/**
 * Busca contato por qualquer identificador (otimizado)
 * 
 * ⚠️ CORREÇÃO: Busca em PARALELO para melhor performance
 * Em vez de 4 queries sequenciais, executa buscas em paralelo
 * 
 * Orquestra múltiplas estratégias de busca seguindo SRP
 * Cada estratégia é uma função privada com responsabilidade única
 * 
 * @param params - Parâmetros de busca com identificadores
 * @returns Contato encontrado ou null
 */
async findByAnyIdentifier(
  params: FindContactByIdentifiersParams
): Promise<Contact | null> {
  // ⚠️ CORREÇÃO: Buscar em PARALELO para melhor performance
  // Executa todas as buscas possíveis simultaneamente
  const searches = await Promise.allSettled([
    params.canonicalId ? this.findByCanonicalId(params) : Promise.resolve(null),
    (params.phone && params.countryCode) ? this.findByPhoneAndCountryCode(params) : Promise.resolve(null),
    params.jid ? this.findByJid(params) : Promise.resolve(null),
    params.lid ? this.findByLid(params) : Promise.resolve(null),
  ])
  
  // Retornar primeiro resultado encontrado
  for (const result of searches) {
    if (result.status === 'fulfilled' && result.value) {
      return result.value
    }
  }
  
  return null
}

/**
 * ALTERNATIVA: Busca única com OR (ainda mais otimizada)
 * 
 * Requer função RPC no banco ou query raw
 * 
 * @param params - Parâmetros de busca
 * @returns Contato encontrado ou null
 */
async findByAnyIdentifierOptimized(
  params: FindContactByIdentifiersParams
): Promise<Contact | null> {
  // Construir condições OR dinamicamente
  const conditions: string[] = []
  
  if (params.canonicalId) {
    conditions.push(`canonical_identifier = '${params.canonicalId.replace(/'/g, "''")}'`)
  }
  
  if (params.phone && params.countryCode) {
    conditions.push(`(phone = '${params.phone.replace(/'/g, "''")}' AND country_code = '${params.countryCode.replace(/'/g, "''")}')`)
  }
  
  if (params.jid) {
    conditions.push(`jid = '${params.jid.replace(/'/g, "''")}'`)
  }
  
  if (params.lid) {
    conditions.push(`lid = '${params.lid.replace(/'/g, "''")}'`)
  }
  
  if (conditions.length === 0) return null
  
  // ⚠️ NOTA: Supabase PostgREST não suporta OR diretamente
  // Opções:
  // 1. Usar busca paralela (implementação acima) ✅ RECOMENDADO
  // 2. Criar função RPC no PostgreSQL
  // 3. Usar query raw (menos seguro)
  
  // Por enquanto, usar busca paralela (já implementada acima)
  return this.findByAnyIdentifier(params)
}

/**
 * Cria contato com suporte a JID/LID
 */
async create(params: {
  projectId: string
  name: string
  phone?: string
  countryCode?: string
  jid?: string
  lid?: string
  canonicalId: string
  mainOriginId: string
  currentStageId: string
  metadata?: Record<string, unknown>
}): Promise<Contact> {
  // ⚠️ CORREÇÃO: Validação mais completa
  // Validar que temos pelo menos um identificador
  if (!params.phone && !params.jid && !params.lid && !params.canonicalId) {
    throw new Error('At least one identifier (phone, jid, lid, or canonicalId) is required')
  }
  
  // Se tem phone, validar countryCode
  if (params.phone && !params.countryCode) {
    throw new Error('countryCode is required when phone is provided')
  }
  
  // ⚠️ CORREÇÃO: Validar consistência de identificadores
  this.validateIdentifierConsistency(params)
  
  const { data, error } = await this.supabaseClient
    .from('contacts')
    .insert({
      project_id: params.projectId,
      name: params.name,
      phone: params.phone || null,
      country_code: params.countryCode || null,
      jid: params.jid || null,
      lid: params.lid || null,
      canonical_identifier: params.canonicalId,
      main_origin_id: params.mainOriginId,
      current_stage_id: params.currentStageId,
      metadata: params.metadata || {},
    })
    .select()
    .single()
  
  if (error) {
    // ⚠️ CORREÇÃO: Tratamento específico de erro de unique constraint
    if (error.code === '23505') { // Unique violation
      // Tentar identificar qual constraint foi violada
      const errorMessage = error.message.toLowerCase()
      let conflictingField = 'identificador'
      
      if (errorMessage.includes('canonical_identifier') || error.details?.includes('canonical_identifier')) {
        conflictingField = 'canonical_identifier'
      } else if (errorMessage.includes('jid') || error.details?.includes('jid')) {
        conflictingField = 'jid'
      } else if (errorMessage.includes('lid') || error.details?.includes('lid')) {
        conflictingField = 'lid'
      } else if (errorMessage.includes('phone') || error.details?.includes('phone')) {
        conflictingField = 'phone + country_code'
      }
      
      throw new Error(
        `Contato com ${conflictingField} já existe neste projeto. ` +
        `Verifique se o contato já foi cadastrado anteriormente.`
      )
    }
    throw new Error(`Erro ao criar contato: ${error.message}`)
  }
  
  return data as Contact
}

/**
 * Valida consistência entre identificadores (CORREÇÃO)
 * 
 * Garante que canonicalId corresponde ao phone, jid ou lid fornecido
 * 
 * @param params - Parâmetros de criação
 * @throws {Error} Se identificadores são inconsistentes
 */
private validateIdentifierConsistency(params: {
  phone?: string
  countryCode?: string
  jid?: string
  lid?: string
  canonicalId: string
}): void {
  // Se canonicalId é número puro, deve corresponder ao phone
  if (/^\d{10,15}$/.test(params.canonicalId)) {
    if (params.phone && params.countryCode) {
      const expectedCanonical = `${params.countryCode}${params.phone}`
      if (params.canonicalId !== expectedCanonical) {
        throw new Error(
          `Inconsistência: canonicalId=${params.canonicalId} não corresponde a ` +
          `phone=${params.phone} com countryCode=${params.countryCode}`
        )
      }
    }
  }
  
  // Se canonicalId é LID, deve corresponder ao lid
  if (params.canonicalId.startsWith('lid:')) {
    const lidNumber = params.canonicalId.replace('lid:', '')
    const expectedLid = `${lidNumber}@lid`
    if (params.lid && params.lid !== expectedLid) {
      throw new Error(
        `Inconsistência: canonicalId=${params.canonicalId} não corresponde a lid=${params.lid}`
      )
    }
  }
  
  // ⚠️ Validação: canonicalId não deve ser "unknown:..."
  if (params.canonicalId.startsWith('unknown:')) {
    throw new Error(`canonicalId inválido: ${params.canonicalId}. Formato não reconhecido.`)
  }
}

/**
 * Atualiza identificadores alternativos em contato existente
 * 
 * Útil quando um contato foi criado com telefone e depois recebemos JID/LID
 */
async updateIdentifiers(params: {
  contactId: string
  jid?: string
  lid?: string
  canonicalId?: string
}): Promise<void> {
  const updateData: Record<string, unknown> = {}
  
  if (params.jid) updateData.jid = params.jid
  if (params.lid) updateData.lid = params.lid
  if (params.canonicalId) updateData.canonical_identifier = params.canonicalId
  
  if (Object.keys(updateData).length === 0) {
    return // Nada para atualizar
  }
  
  const { error } = await this.supabaseClient
    .from('contacts')
    .update(updateData)
    .eq('id', params.contactId)
  
  if (error) {
    throw new Error(`Erro ao atualizar identificadores: ${error.message}`)
  }
}
```

**Checklist**:
- [ ] Atualizar interface `ContactRepository`
- [ ] Implementar `findByAnyIdentifier()`
- [ ] Atualizar `create()` para aceitar JID/LID
- [ ] Implementar `updateIdentifiers()`
- [ ] Manter método `findByPhone()` para retrocompatibilidade
- [ ] Testes unitários

---

### **Fase 4: Atualização do UazapiBroker**

**Objetivo**: Usar normalizador de identificadores no broker UAZAPI.

**Arquivo**: `back-end/supabase/functions/messaging/brokers/uazapi/UazapiBroker.ts` (ATUALIZAR)

**Método `extractContactInfo()`** (substituir linhas 230-253):

```typescript
/**
 * Extrai informações do contato (telefone, nome, JID, LID)
 * Busca nome via API se mensagem foi enviada por nós
 */
private async extractContactInfo(
  message: UazapiWebhookData['message'],
  instanceToken?: string
): Promise<{ 
  phoneNumber?: string
  name: string
  jid?: string
  lid?: string
  canonicalId: string
}> {
  // Normalizar identificador do webhook usando função refatorada
  const identifier = normalizeWebhookIdentifier({
    chatid: message.chatid,
    sender_lid: message.sender_lid,
    sender_pn: message.sender_pn,
    sender: message.sender,
  })
  
  // Extrair número de telefone se disponível
  let phoneNumber: string | undefined
  if (identifier.normalizedPhone) {
    phoneNumber = `${identifier.normalizedPhone.countryCode}${identifier.normalizedPhone.phone}`
  }
  
  // Usar phoneNumber para busca de nome via API (compatibilidade)
  let name = message.senderName || ''
  
  // Se mensagem foi enviada por nós, buscar nome via API externa
  // Usar phoneNumber se disponível, senão usar JID/LID
  if (message.fromMe && instanceToken) {
    try {
      const searchIdentifier = phoneNumber || identifier.originalJid || identifier.originalLid
      if (searchIdentifier) {
        const apiResponse = await this.fetchProfileName(instanceToken, searchIdentifier)
        name = apiResponse?.wa_name || 'Nao consta'
      }
    } catch (error) {
      console.error('[UazapiBroker] Error fetching profile name:', error)
      name = 'Nao consta'
    }
  }
  
  return {
    phoneNumber,
    name,
    jid: identifier.originalJid,
    lid: identifier.originalLid,
    canonicalId: identifier.canonicalId,
  }
}
```

**Atualizar `buildNormalizedMessage()`** (linha 332):

```typescript
from: {
  phoneNumber: contactInfo.phoneNumber || contactInfo.jid || contactInfo.lid || '',
  name: contactInfo.name,
  // Adicionar identificadores alternativos no metadata
  jid: contactInfo.jid,
  lid: contactInfo.lid,
  canonicalId: contactInfo.canonicalId,
},
```

**Checklist**:
- [ ] Importar `normalizeWebhookIdentifier` (ou `normalizeWebhookContactIdentifier` para compatibilidade)
- [ ] Atualizar `extractContactInfo()` para usar normalizador refatorado
- [ ] Atualizar tipo de retorno de `extractContactInfo()`
- [ ] Atualizar `buildNormalizedMessage()` para incluir JID/LID
- [ ] Migrar gradualmente de `extractPhoneNumber()` para `normalizeIdentifier()` onde apropriado
- [ ] Testar com webhook real (com e sem JID/LID)

---

## 🔄 Arquitetura Reutilizável Entre Brokers

### **Princípio de Reutilização**

O normalizador de identificadores foi projetado para ser **reutilizado por TODOS os brokers**:
- ✅ UAZAPI (já implementado)
- ✅ Gupshup (futuro - apenas usar o normalizador)
- ✅ Official WhatsApp Business API (futuro - apenas usar o normalizador)
- ✅ Qualquer novo broker (apenas usar o normalizador comum)

### **Como Outros Brokers Utilizam**

```typescript
// Exemplo: GupshupBroker usando o normalizador comum
import { normalizeContactIdentifier } from '../utils/contact-identifier-normalizer.ts'

class GupshupBroker extends BaseWhatsAppBroker {
  private extractContactInfo(message: GupshupMessage) {
    // Gupshup tem formato diferente, mas usa mesmo normalizador
    const identifier = normalizeContactIdentifier(message.from) // JID ou número
    return {
      phoneNumber: identifier.normalizedPhone 
        ? `${identifier.normalizedPhone.countryCode}${identifier.normalizedPhone.phone}`
        : undefined,
      jid: identifier.originalJid,
      lid: identifier.originalLid,
      canonicalId: identifier.canonicalId,
    }
  }
}

// Official WhatsApp também usa o mesmo normalizador
class OfficialWhatsAppBroker extends BaseWhatsAppBroker {
  private extractContactInfo(message: OfficialMessage) {
    // Official API já vem com JID formatado
    const identifier = normalizeContactIdentifier(message.from) // JID
    // ... mesmo código
  }
}
```

**Benefícios**:
- ✅ Lógica comum escrita UMA vez
- ✅ Novos brokers apenas importam e usam
- ✅ Bug fixes beneficiam todos os brokers automaticamente
- ✅ Testes da lógica comum validam todos os brokers

---

### **Fase 5: Atualização do WhatsAppProcessor**

**Objetivo**: Usar novo método de busca por múltiplos identificadores.

**Arquivo**: `back-end/supabase/functions/messaging/core/processor.ts` (ATUALIZAR)

**Método `findOrCreateContact()`** (refatorado seguindo SOLID):

```typescript
/**
 * Parâmetros para busca/criação de contato
 */
interface FindOrCreateContactParams {
  phoneNumber?: string
  jid?: string
  lid?: string
  canonicalId?: string
  name?: string
  projectId: string
  metadata?: Record<string, unknown>
}

/**
 * Extrai phone e countryCode de phoneNumber (SRP: função única)
 * Reutiliza lógica do normalizador para evitar duplicação (DRY)
 * 
 * @param phoneNumber - Número em qualquer formato
 * @returns Phone e countryCode extraídos ou undefined
 */
private extractPhoneAndCountryCode(
  phoneNumber?: string
): { phone: string; countryCode: string } | undefined {
  if (!phoneNumber) return undefined
  
  // Usar normalizador refatorado para garantir consistência (DRY)
  try {
    const normalized = normalizeIdentifier(phoneNumber)
    if (normalized.normalizedPhone) {
      return {
        phone: normalized.normalizedPhone.phone,
        countryCode: normalized.normalizedPhone.countryCode,
      }
    }
  } catch (error) {
    // Se normalizador falhar, tentar regex direto (fallback)
    const cleaned = phoneNumber
      .replace('@s.whatsapp.net', '')
      .replace('@c.us', '')
      .replace('@g.us', '')
      .replace('@lid', '')
    
    const match = cleaned.match(/^(\d{1,3})(\d{8,15})$/)
    if (match) {
      return {
        countryCode: match[1],
        phone: match[2],
      }
    }
  }
  
  return undefined
}

/**
 * Verifica se contato precisa de atualização de identificadores (SRP)
 * 
 * @param existingContact - Contato existente
 * @param params - Parâmetros novos
 * @returns true se precisa atualizar
 */
private needsIdentifierUpdate(
  existingContact: Contact,
  params: FindOrCreateContactParams
): boolean {
  // ⚠️ CORREÇÃO: Verificar se identificador MUDOU, não apenas se está vazio
  return !!(
    (params.jid && existingContact.jid !== params.jid) ||  // ✅ Verifica mudança
    (params.lid && existingContact.lid !== params.lid) ||  // ✅ Verifica mudança
    (params.canonicalId && existingContact.canonical_identifier !== params.canonicalId)  // ✅ Já verificava mudança
  )
}

/**
 * Atualiza contato existente com novos dados (SRP)
 * 
 * @param existingContact - Contato existente
 * @param params - Novos dados
 * @returns Contato atualizado
 */
/**
 * Atualiza contato existente com novos dados (SRP)
 * 
 * ⚠️ CORREÇÃO: Atualização atômica em uma única query
 * Evita race conditions e estados inconsistentes
 * 
 * @param existingContact - Contato existente
 * @param params - Novos dados
 * @returns Contato atualizado
 */
private async updateExistingContact(
  existingContact: Contact,
  params: FindOrCreateContactParams
): Promise<Contact> {
  // ⚠️ CORREÇÃO: Atualização atômica em uma única query
  // Evita race conditions e garante consistência
  const updateData: Record<string, unknown> = {
    name: params.name || existingContact.name,
    metadata: {
      ...existingContact.metadata,
      ...params.metadata,
    },
    updated_at: new Date().toISOString(),
  }
  
  // Atualizar identificadores apenas se mudaram
  if (this.needsIdentifierUpdate(existingContact, params)) {
    if (params.jid) updateData.jid = params.jid
    if (params.lid) updateData.lid = params.lid
    if (params.canonicalId) updateData.canonical_identifier = params.canonicalId
  }
  
  // ⚠️ CORREÇÃO: Uma única query UPDATE atômica
  // Em vez de duas queries separadas (updateIdentifiers + update)
  const { data: updatedContact, error } = await this.supabaseClient
    .from('contacts')
    .update(updateData)
    .eq('id', existingContact.id)
    .select()
    .single()
  
  if (error) {
    throw new Error(`Erro ao atualizar contato: ${error.message}`)
  }
  
  return (updatedContact || existingContact) as Contact
}

/**
 * Busca origem padrão do projeto (SRP: função única)
 * 
 * @param projectId - ID do projeto
 * @returns ID da origem padrão
 */
private async findDefaultOrigin(projectId: string): Promise<string> {
  const { data: whatsappOrigin } = await this.supabaseClient
    .from('origins')
    .select('id')
    .eq('project_id', projectId)
    .eq('name', 'WhatsApp')
    .single()
  
  return whatsappOrigin?.id || ''
}

/**
 * Busca primeiro estágio ativo do projeto (SRP: função única)
 * 
 * @param projectId - ID do projeto
 * @returns ID do primeiro estágio
 * @throws {Error} Se nenhum estágio encontrado
 */
private async findFirstActiveStage(projectId: string): Promise<string> {
  const { data: firstStage } = await this.supabaseClient
    .from('stages')
    .select('id')
    .eq('project_id', projectId)
    .eq('is_active', true)
    .order('display_order', { ascending: true })
    .limit(1)
    .single()
  
  if (!firstStage) {
    throw new Error('Nenhum estágio encontrado para o projeto')
  }
  
  return firstStage.id
}

/**
 * Busca ou cria contato
 * 
 * Refatorado seguindo SOLID:
 * - SRP: Cada função tem responsabilidade única
 * - DRY: Reutiliza normalizador em vez de duplicar lógica
 * 
 * @param params - Parâmetros de busca/criação
 * @returns Contato encontrado ou criado
 */
private async findOrCreateContact(
  params: FindOrCreateContactParams
): Promise<Contact> {
  // Validar que temos pelo menos um identificador
  if (!params.phoneNumber && !params.jid && !params.lid && !params.canonicalId) {
    throw new Error('At least one identifier is required')
  }
  
  // Extrair phone e countryCode se disponível (reutiliza normalizador)
  const phoneData = this.extractPhoneAndCountryCode(params.phoneNumber)
  
  // Buscar contato existente
  const contactRepo = new SupabaseContactRepository(this.supabaseClient)
  const existingContact = await contactRepo.findByAnyIdentifier({
    projectId: params.projectId,
    canonicalId: params.canonicalId,
    phone: phoneData?.phone,
    countryCode: phoneData?.countryCode,
    jid: params.jid,
    lid: params.lid,
  })
  
  if (existingContact) {
    return await this.updateExistingContact(existingContact, params)
  }
  
  // Criar novo contato
  const originId = await this.findDefaultOrigin(params.projectId)
  const stageId = await this.findFirstActiveStage(params.projectId)
  
  const defaultName = params.name || 
    phoneData?.phone || 
    params.jid || 
    params.lid || 
    'Nao consta'
  
  const canonicalId = params.canonicalId || 
    (phoneData ? `${phoneData.countryCode}${phoneData.phone}` : '') ||
    params.jid ||
    params.lid ||
    ''
  
  return await contactRepo.create({
    projectId: params.projectId,
    name: defaultName,
    phone: phoneData?.phone,
    countryCode: phoneData?.countryCode,
    jid: params.jid,
    lid: params.lid,
    canonicalId,
    mainOriginId: originId || stageId, // Fallback temporário
    currentStageId: stageId,
    metadata: params.metadata || {},
  })
}
```

**Atualizar chamada em `processMessage()`** (linha 28):

```typescript
const contact = await this.findOrCreateContact({
  phoneNumber: normalizedMessage.from.phoneNumber,
  jid: normalizedMessage.from.jid,
  lid: normalizedMessage.from.lid,
  canonicalId: normalizedMessage.from.canonicalId,
  name: normalizedMessage.from.name,
  projectId,
  metadata: {
    platform: 'whatsapp',
    brokerId: normalizedMessage.brokerId,
  },
})
```

**Checklist**:
- [ ] Atualizar `findOrCreateContact()` para aceitar JID/LID
- [ ] Usar `findByAnyIdentifier()` do repository
- [ ] Implementar lógica de atualização de identificadores
- [ ] Atualizar `processMessage()` para passar JID/LID
- [ ] Testes unitários

---

### **Fase 6: Atualização dos Tipos TypeScript**

**Objetivo**: Adicionar campos JID/LID nos tipos.

**Arquivo**: `back-end/supabase/functions/messaging/types.ts` (ATUALIZAR)

```typescript
// Atualizar interface NormalizedMessage.from (linhas 94-98)
from: {
  phoneNumber?: string      // Opcional agora (pode ser apenas JID/LID)
  jid?: string              // NOVO: JID completo
  lid?: string              // NOVO: LID completo
  canonicalId?: string      // NOVO: ID canônico para busca
  name?: string
  profilePicture?: string
}
```

**Arquivo**: `back-end/types.ts` (ATUALIZAR)

```typescript
// Atualizar tipo Contact se existir
export interface Contact {
  // ... campos existentes
  jid?: string
  lid?: string
  canonical_identifier?: string
}
```

**Checklist**:
- [ ] Atualizar `NormalizedMessage.from`
- [ ] Atualizar tipo `Contact` se existir
- [ ] Validar que todos os tipos estão sincronizados

---

## 🔄 Estratégia de Migração e Retrocompatibilidade

### **1. Migração Gradual (Recomendada)**

**Fase A: Preparação (Backend apenas)**
- ✅ Implementar normalizador de identificadores
- ✅ Adicionar campos JID/LID no banco (opcionais)
- ✅ Atualizar repository e processor
- ✅ **Não alterar fluxo atual** - sistema continua funcionando normalmente

**Fase B: Ativação (Enriquecimento de dados)**
- ✅ Atualizar UazapiBroker para extrair JID/LID
- ✅ Preencher campos JID/LID em contatos existentes quando possível
- ✅ Novos contatos são criados com todos os identificadores disponíveis

**Fase C: Otimização (Busca aprimorada)**
- ✅ Sistema busca por múltiplos identificadores
- ✅ Contatos identificados corretamente mesmo sem número de telefone
- ✅ Migração de dados existentes (se necessário)

### **2. Retrocompatibilidade Garantida**

✅ **Código antigo continua funcionando**:
- `phoneNumber` continua sendo usado se disponível
- Busca por `phone + country_code` ainda funciona
- Constraint de telefone mantida (apenas valida se presente)

✅ **Webhooks antigos continuam funcionando**:
- Se webhook não enviar JID/LID, sistema usa número de telefone
- Se webhook enviar apenas número, sistema processa normalmente

✅ **Dados existentes não quebram**:
- Campos JID/LID são opcionais
- Contatos existentes continuam acessíveis por telefone
- Migração gradual preenche campos conforme webhooks chegam

---

## 🧪 Plano de Testes

### **1. Testes Unitários**

**Arquivo**: `back-end/supabase/functions/messaging/utils/contact-identifier-normalizer.test.ts` (NOVO)

```typescript
describe('normalizeIdentifier', () => {
  it('should normalize JID individual', () => {
    const result = normalizeIdentifier('5511999999999@s.whatsapp.net')
    expect(result.normalizedPhone).toEqual({ countryCode: '55', phone: '11999999999' })
    expect(result.originalJid).toBe('5511999999999@s.whatsapp.net')
    expect(result.primaryType).toBe('jid')
    expect(result.canonicalId).toBe('5511999999999')
  })
  
  it('should normalize LID', () => {
    const result = normalizeIdentifier('213709100187796@lid')
    expect(result.originalLid).toBe('213709100187796@lid')
    expect(result.primaryType).toBe('lid')
    expect(result.canonicalId).toBe('lid:213709100187796')
  })
  
  it('should normalize phone number', () => {
    const result = normalizeIdentifier('5511999999999')
    expect(result.normalizedPhone).toEqual({ countryCode: '55', phone: '11999999999' })
    expect(result.primaryType).toBe('phone')
  })
  
  // ... mais testes
})

describe('extractPhoneNumber (refatorada)', () => {
  it('should extract phone from JID', () => {
    const result = extractPhoneNumber('5511999999999@s.whatsapp.net')
    expect(result).toEqual({ countryCode: '55', phone: '11999999999' })
  })
  
  it('should extract phone from phone number', () => {
    const result = extractPhoneNumber('5511999999999')
    expect(result).toEqual({ countryCode: '55', phone: '11999999999' })
  })
  
  it('should throw error if no phone found in LID', () => {
    expect(() => extractPhoneNumber('213709100187796@lid')).toThrow('No phone number found')
  })
  
  it('should use normalizeIdentifier() internally (DRY)', () => {
    // Verifica que reutiliza lógica comum
    const spy = jest.spyOn(module, 'normalizeIdentifier')
    extractPhoneNumber('5511999999999@s.whatsapp.net')
    expect(spy).toHaveBeenCalled()
  })
  
  // ... mais testes
})

describe('normalizeWebhookIdentifier', () => {
  it('should prioritize chatid over sender_lid', () => {
    const result = normalizeWebhookIdentifier({
      chatid: '5511999999999@s.whatsapp.net',
      sender_lid: '213709100187796@lid',
    })
    expect(result.originalJid).toBe('5511999999999@s.whatsapp.net')
    expect(result.originalLid).toBe('213709100187796@lid')
  })
  
  // ... mais testes
})
```

### **2. Testes de Integração**

**Cenário 1: Webhook com apenas número de telefone (retrocompatibilidade)**
```
Input: { chatid: "5511999999999@s.whatsapp.net" }
Expected: Contato criado com phone, country_code, jid, canonicalId
```

**Cenário 2: Webhook com JID e LID**
```
Input: { 
  chatid: "5511999999999@s.whatsapp.net",
  sender_lid: "213709100187796@lid" 
}
Expected: Contato criado com phone, jid, lid, canonicalId
```

**Cenário 3: Webhook com apenas LID (sem telefone)**
```
Input: { sender_lid: "213709100187796@lid" }
Expected: Contato criado com lid, canonicalId="lid:213709100187796", phone=NULL
```

**Cenário 4: Contato existente recebe JID/LID novo**
```
Setup: Contato existe com phone="11999999999", jid=NULL, lid=NULL
Input: Webhook com chatid (JID) para mesmo contato
Expected: Contato atualizado com jid preenchido, phone mantido
```

---

## ⚠️ Riscos e Mitigações

### **Risco 1: Constraint de banco quebra para LID puro** ✅ RESOLVIDO
**Impacto**: Contatos criados apenas com LID (sem telefone) violariam constraint `NOT NULL`

**Mitigação Aplicada**:
- ✅ **CORREÇÃO**: Migração remove `NOT NULL` de `phone` e `country_code`
- ✅ Constraint `contacts_identifier_required` garante pelo menos um identificador
- ✅ Validar que código não tenta inserir LID no campo `phone`
- ✅ Usar `canonical_identifier` para contatos sem telefone

### **Risco 2: Duplicação de contatos** ✅ MITIGADO
**Impacto**: Mesmo contato pode ser criado duas vezes se vier com formatos diferentes

**Mitigação Aplicada**:
- ✅ **CORREÇÃO**: Unique constraints adicionadas (canonical_identifier, jid, lid, phone+country_code)
- ✅ Buscar por `canonical_identifier` primeiro (mais eficiente)
- ✅ Busca paralela por todos os identificadores disponíveis
- ✅ Lógica de merge/update implementada no `findOrCreateContact()`
- ✅ Banco de dados garante unicidade por projeto

### **Risco 3: Performance de busca** ✅ MITIGADO
**Impacto**: Buscar por múltiplos campos pode ser mais lento

**Mitigação Aplicada**:
- ✅ **CORREÇÃO**: Índices compostos otimizados `(project_id, identifier)`
- ✅ Busca em PARALELO usando `Promise.allSettled()` (em vez de sequencial)
- ✅ Índices criados para `jid`, `lid`, e `canonical_identifier`
- ✅ Queries otimizadas com `WHERE` clauses específicas
- ✅ Unique constraints também servem como índices para busca rápida

---

## 📊 Checklist de Implementação

**⚠️ ORDEM CORRETA DE IMPLEMENTAÇÃO** (Ver seção acima para detalhes):

1. ✅ **Fase 0**: Tipos e Validadores (BLOQUEADOR - Antes de tudo)
2. ✅ **Fase 1.5**: Migração de Dados Existentes (BLOQUEADOR - Antes de unique constraints)
3. ✅ **Fase 2**: Banco de Dados (inclui ajuste de constraints existentes)
4. ✅ **Fase 1**: Refatoração de Normalização
5. ✅ **Fase 3**: Repository
6. ✅ **Fase 4**: UazapiBroker
7. ✅ **Fase 5**: Processor
8. ✅ **Fase 6**: Tipos (movido para Fase 0)
9. ✅ **Fase 7**: Validadores (movido para Fase 0)
10. ✅ **Fase 8**: API REST
11. ✅ **Fase 9**: Documentação e Rollback

**⚠️ ATENÇÃO**: Não pule fases. Cada fase depende da anterior.

### **Fase 0: Tipos e Validadores** (VER ACIMA - Fase 0.1 e 0.2)

### **Fase 1: Refatoração de Normalização** (Após Fase 0)
- [ ] Renomear `phone-normalizer.ts` → `identifier-normalizer.ts`
- [ ] Refatorar para suportar JID e LID mantendo telefone
- [ ] Implementar `normalizeIdentifier()` (função principal)
- [ ] Refatorar `extractPhoneNumber()` diretamente para usar `normalizeIdentifier()` internamente (sem wrapper deprecated)
- [ ] Manter interface pública de `extractPhoneNumber()` (mesma assinatura)
- [ ] Implementar `normalizeWebhookIdentifier()` (ou `normalizeWebhookContactIdentifier` alias)
- [ ] Criar aliases para compatibilidade (`normalizeContactIdentifier`, etc.)
- [ ] Testes unitários completos (telefone, JID, LID)
- [ ] Testes de `extractPhoneNumber()` refatorada (com telefone, JID)

### **Fase 1.5: Migração de Dados Existentes (CRÍTICO - Adicionado)**

**⚠️ BLOQUEADOR**: Deve ser executado ANTES de criar unique constraints.

**Arquivo**: `back-end/supabase/migrations/XXX_migrate_existing_contacts_to_jid_lid.sql`

```sql
-- Script: Migração de dados existentes para suporte a JID/LID
-- Data: 2024-XX-XX
-- Descrição: Preenche canonical_identifier e resolve duplicatas antes de criar unique constraints

BEGIN;

-- 1. Preencher canonical_identifier para contatos existentes
UPDATE contacts
SET canonical_identifier = COALESCE(
  -- Prioridade 1: phone + country_code (se disponível)
  CASE 
    WHEN phone IS NOT NULL AND country_code IS NOT NULL 
    THEN country_code || phone
    ELSE NULL
  END,
  -- Prioridade 2: jid (extrair número do JID)
  CASE 
    WHEN jid IS NOT NULL 
    THEN REGEXP_REPLACE(jid, '@.*$', '')  -- Remove sufixo @s.whatsapp.net
    ELSE NULL
  END,
  -- Prioridade 3: lid (com prefixo)
  CASE 
    WHEN lid IS NOT NULL 
    THEN 'lid:' || REGEXP_REPLACE(lid, '@lid$', '')
    ELSE NULL
  END,
  -- Fallback: usar ID como canonical_identifier temporário
  -- ⚠️ NOTA: Este fallback será substituído quando contato receber identificador real
  'temp:' || id::text
)
WHERE canonical_identifier IS NULL;

-- 2. Resolver duplicatas de canonical_identifier antes de criar unique constraint
-- Identificar duplicatas
WITH duplicates AS (
  SELECT 
    project_id, 
    canonical_identifier, 
    COUNT(*) as cnt,
    array_agg(id ORDER BY created_at) as ids
  FROM contacts
  WHERE canonical_identifier IS NOT NULL
    AND canonical_identifier NOT LIKE 'temp:%'  -- Ignorar temporários
  GROUP BY project_id, canonical_identifier
  HAVING COUNT(*) > 1
),
-- Manter primeiro contato, atualizar os demais
to_update AS (
  SELECT 
    d.project_id,
    d.canonical_identifier,
    unnest(d.ids[2:]) as contact_id  -- Todos exceto o primeiro
  FROM duplicates d
)
UPDATE contacts c
SET canonical_identifier = c.canonical_identifier || '_dup_' || c.id::text
FROM to_update tu
WHERE c.id = tu.contact_id
  AND c.project_id = tu.project_id
  AND c.canonical_identifier = tu.canonical_identifier;

-- 3. Validar dados antes de prosseguir
-- Verificar se ainda há duplicatas
DO $$
DECLARE
  dup_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO dup_count
  FROM (
    SELECT project_id, canonical_identifier, COUNT(*) as cnt
    FROM contacts
    WHERE canonical_identifier IS NOT NULL
      AND canonical_identifier NOT LIKE 'temp:%'
    GROUP BY project_id, canonical_identifier
    HAVING COUNT(*) > 1
  ) dups;
  
  IF dup_count > 0 THEN
    RAISE EXCEPTION 'Ainda existem % duplicatas de canonical_identifier após migração', dup_count;
  END IF;
END $$;

COMMIT;
```

**Checklist**:
- [ ] **CRÍTICO**: Criar script de migração de dados
- [ ] Preencher `canonical_identifier` para contatos existentes
- [ ] Resolver duplicatas de `canonical_identifier`
- [ ] Validar que não há duplicatas restantes
- [ ] Testar em ambiente local com dados de produção
- [ ] Documentar estratégia de rollback deste script

### **Fase 2: Banco de Dados**
- [ ] Criar migração `XXX_add_jid_lid_to_contacts.sql` com correções críticas
- [ ] **CRÍTICO**: Remover NOT NULL de phone e country_code
- [ ] **CRÍTICO**: Ajustar constraints existentes (contacts_phone_format, contacts_country_code_format) para permitir NULL
- [ ] **CRÍTICO**: Executar Fase 1.5 (Migração de dados) ANTES desta fase
- [ ] **CRÍTICO**: Adicionar constraint `contacts_identifier_required`
- [ ] **CRÍTICO**: Adicionar unique constraints APÓS migração de dados
- [ ] **IMPORTANTE**: Criar índices compostos otimizados (project_id + identifier)
- [ ] Testar migração em ambiente local
- [ ] Validar que contato pode ser criado apenas com LID
- [ ] Validar que unique constraints previnem duplicação
- [ ] Validar índices criados
- [ ] Criar script de rollback
- [ ] Documentar mudanças

### **Fase 3: Repository**
- [ ] Atualizar interface `ContactRepository`
- [ ] Implementar `findByAnyIdentifier()` com busca paralela (otimizada)
- [ ] Atualizar `create()` para aceitar JID/LID
- [ ] **IMPORTANTE**: Adicionar validação de consistência de identificadores
- [ ] Implementar `updateIdentifiers()` ou usar atualização atômica
- [ ] **CORREÇÃO**: Melhorar lógica de merge (verificar mudanças, não apenas presença)
- [ ] Manter método `findByPhone()` para retrocompatibilidade
- [ ] Testes unitários incluindo edge cases

### **Fase 4: UazapiBroker**
- [ ] Atualizar `extractContactInfo()`
- [ ] Importar normalizador
- [ ] Atualizar `buildNormalizedMessage()`
- [ ] Testar com webhook real

### **Fase 5: Processor**
- [ ] Atualizar `findOrCreateContact()`
- [ ] Usar novo método de busca
- [ ] Atualizar `processMessage()`
- [ ] Testes de integração

### **Fase 0: Tipos e Validadores (CRÍTICO - Reordenado)**

**⚠️ BLOQUEADOR**: Deve ser feito ANTES de qualquer outra implementação.

**Ordem Correta**: Tipos → Validadores → Migração → Código

#### **Fase 0.1: Tipos TypeScript**

**Arquivos**:
- `back-end/types.ts`
- `back-end/supabase/functions/contacts/types.ts`
- `back-end/supabase/functions/messaging/types.ts`
- `front-end/src/types/models.ts`

**Mudanças Necessárias**:
```typescript
export interface Contact {
  // ... outros campos
  phone?: string | null           // ⚠️ CORREÇÃO: Tornar opcional
  country_code?: string | null    // ⚠️ CORREÇÃO: Tornar opcional
  jid?: string | null             // ✅ NOVO
  lid?: string | null             // ✅ NOVO
  canonical_identifier?: string | null  // ✅ NOVO
}
```

**Checklist**:
- [ ] **CRÍTICO**: Atualizar `back-end/types.ts`
- [ ] **CRÍTICO**: Atualizar `contacts/types.ts`
- [ ] **CRÍTICO**: Atualizar `messaging/types.ts` (NormalizedMessage.from)
- [ ] **CRÍTICO**: Atualizar `front-end/src/types/models.ts`
- [ ] Validar sincronização entre todos os arquivos
- [ ] Executar `pnpm typecheck` para validar

#### **Fase 0.2: Validadores (CRÍTICO - Reordenado)**

**⚠️ BLOQUEADOR**: Sistema não funcionará sem estas atualizações.

**Arquivo Backend**: `back-end/supabase/functions/contacts/validators/contact.ts`

```typescript
// ✅ CORREÇÃO: Tornar phone e country_code opcionais
export const createContactSchema = z.object({
  // ... outros campos
  phone: z.string().regex(/^[0-9]{8,15}$/, 'Phone must be 8-15 digits').optional().nullable(),
  country_code: z.string().regex(/^[0-9]{1,3}$/, 'Country code must be 1-3 digits').optional().nullable(),
  
  // ✅ NOVO: Adicionar campos JID/LID
  jid: z.string().optional().nullable(),
  lid: z.string().optional().nullable(),
  canonical_identifier: z.string().optional().nullable(),
}).refine(
  (data) => data.phone || data.jid || data.lid || data.canonical_identifier,
  { message: 'At least one identifier (phone, jid, lid, or canonical_identifier) is required' }
)
```

**Arquivo Frontend**: `front-end/src/schemas/contact.ts`

```typescript
// ✅ CORREÇÃO: Similar ao backend
export const createContactSchema = z.object({
  // ... outros campos
  phone: z.string()...optional().nullable(),
  countryCode: z.string()...optional().nullable(),
  jid: z.string().optional().nullable(),
  lid: z.string().optional().nullable(),
  canonicalIdentifier: z.string().optional().nullable(),
}).refine(...)
```

**Checklist**:
- [ ] **CRÍTICO**: Atualizar `contacts/validators/contact.ts` (Zod backend)
- [ ] **CRÍTICO**: Atualizar `schemas/contact.ts` (Zod frontend)
- [ ] Tornar `phone` e `country_code` opcionais em ambos
- [ ] Adicionar campos `jid`, `lid`, `canonical_identifier` em ambos
- [ ] Adicionar validação: pelo menos um identificador obrigatório
- [ ] Testar criação de contato apenas com LID via API REST
- [ ] Testar criação de contato apenas com JID via API REST
- [ ] Testar criação de contato apenas com telefone (retrocompatibilidade)

### **Fase 8: API REST (IMPORTANTE - Adicionado)**

**⚠️ IMPORTANTE**: Permite criação de contatos via API REST com JID/LID.

**Arquivos a Atualizar**:
- `back-end/supabase/functions/contacts/handlers/create.ts`
- `back-end/supabase/functions/contacts/handlers/update.ts`
- `back-end/supabase/functions/contacts/types.ts`

**Mudanças Necessárias**:
- Aceitar campos `jid`, `lid`, `canonical_identifier` no body
- Validar pelo menos um identificador
- Atualizar tipos TypeScript

**Checklist**:
- [ ] Atualizar Edge Function `contacts` para suportar JID/LID
- [ ] Atualizar handler `create.ts` para aceitar novos campos
- [ ] Atualizar handler `update.ts` para aceitar novos campos
- [ ] Atualizar tipos em `contacts/types.ts`
- [ ] Testar criação via API REST com JID/LID
- [ ] Testar criação via API REST apenas com LID
- [ ] Documentar novos campos na API

### **Fase 9: Documentação e Rollback**
- [ ] Atualizar documentação de arquitetura
- [ ] Documentar estratégia de migração
- [ ] Criar guia de troubleshooting
- [ ] **IMPORTANTE**: Criar script de rollback (veja seção abaixo)
- [ ] Documentar feature flag para ativação gradual (opcional)

---

## ✅ Validação de Conformidade com SOLID e Clean Code

### **Princípios SOLID Aplicados**

#### ✅ **Single Responsibility Principle (SRP)**
- ✅ Cada função normaliza um tipo específico de identificador
- ✅ Funções de busca separadas por estratégia (`findByCanonicalId`, `findByJid`, etc.)
- ✅ Funções de atualização separadas por responsabilidade
- ✅ Funções pequenas (< 20 linhas)

**Exemplo**:
```typescript
// ✅ BOM - Uma responsabilidade por função
function normalizeIndividualJid(input: string): ContactIdentifier | null
function normalizeLid(input: string): ContactIdentifier | null
function findByCanonicalId(params: FindContactByIdentifiersParams): Promise<Contact | null>
```

#### ✅ **Open/Closed Principle (OCP)**
- ✅ Sistema aberto para extensão via Strategy Pattern
- ✅ Novos formatos podem ser adicionados sem modificar código existente
- ✅ Interface `IIdentifierNormalizer` permite diferentes implementações
- ✅ Novos brokers apenas usam o normalizador comum

**Exemplo**:
```typescript
// ✅ BOM - Extensível sem modificar código existente
// Adicionar novo formato: apenas adicionar nova função normalizadora
function normalizeNewFormat(input: string): ContactIdentifier | null {
  // Nova implementação
}
// Adicionar à lista de normalizadores
const normalizers = [..., normalizeNewFormat]
```

#### ✅ **Liskov Substitution Principle (LSP)**
- ✅ Implementações de `IIdentifierNormalizer` são substituíveis
- ✅ Diferentes estratégias de busca podem ser trocadas sem quebrar código

#### ✅ **Interface Segregation Principle (ISP)**
- ✅ Interfaces pequenas e específicas (`IIdentifierNormalizer`, `ContactIdentifier`)
- ✅ Parâmetros de objeto evitam interfaces muito abrangentes

**Exemplo**:
```typescript
// ✅ BOM - Interface específica
interface ContactIdentifier {
  normalizedPhone?: { phone: string; countryCode: string }
  originalJid?: string
  originalLid?: string
  primaryType: 'phone' | 'jid' | 'lid'
  canonicalId: string
}
```

#### ✅ **Dependency Inversion Principle (DIP)**
- ✅ Dependências de abstrações (`IIdentifierNormalizer`, `ContactRepository`)
- ✅ Repository Pattern com interface permite diferentes implementações
- ✅ Processors dependem de abstrações, não de implementações concretas

**Exemplo**:
```typescript
// ✅ BOM - Depende de abstração
class ContactOriginService {
  constructor(private contactRepo: ContactRepository) { }
  // Não conhece SupabaseContactRepository diretamente
}
```

### **Princípios Clean Code Aplicados**

#### ✅ **Nomenclatura Clara e Descritiva**
- ✅ Funções com nomes verbos claros: `normalizeIndividualJid()`, `findByCanonicalId()`
- ✅ Interfaces descritivas: `ContactIdentifier`, `FindContactByIdentifiersParams`
- ✅ Constantes nomeadas: `PATTERNS`, `WEBHOOK_FIELD_PRIORITIES`, `SEARCH_PRIORITIES`

#### ✅ **Funções Pequenas e Focadas**
- ✅ Todas as funções têm < 20 linhas
- ✅ Cada função faz uma única coisa
- ✅ Funções de orquestração delegam para funções específicas

#### ✅ **Parâmetros de Objeto**
- ✅ Uso consistente de objetos de parâmetros
- ✅ Evita listas longas de parâmetros

**Exemplo**:
```typescript
// ✅ BOM - Objeto de parâmetros
async findByAnyIdentifier(params: FindContactByIdentifiersParams)

// ❌ EVITAR - Muitos parâmetros
async findByAnyIdentifier(projectId, canonicalId, phone, countryCode, jid, lid)
```

#### ✅ **Tratamento de Erros**
- ✅ Erros específicos e informativos
- ✅ Tratamento adequado de casos de erro (PGRST116 = not found)

**Exemplo**:
```typescript
// ✅ BOM - Erro específico
if (error && error.code !== 'PGRST116') {
  throw new Error(`Erro ao buscar contato por JID: ${error.message}`)
}
```

#### ✅ **Código DRY (Don't Repeat Yourself)**
- ✅ Normalizador reutilizado por todos os brokers
- ✅ Lógica de extração de phone/countryCode centralizada
- ✅ Funções de busca reutilizáveis

#### ✅ **Constantes em vez de Magic Strings/Numbers**
- ✅ Padrões regex em constantes (`PATTERNS`)
- ✅ Prioridades em constantes (`WEBHOOK_FIELD_PRIORITIES`)

#### ✅ **Documentação JSDoc**
- ✅ Todas as funções públicas têm JSDoc
- ✅ Parâmetros documentados
- ✅ Retornos documentados
- ✅ Exemplos quando necessário

### **Arquitetura Reutilizável**

#### ✅ **Extensível para Novos Brokers**
- ✅ Normalizador comum pode ser usado por qualquer broker
- ✅ Novos brokers apenas importam e usam o normalizador
- ✅ Lógica comum escrita UMA vez, reutilizada por todos

#### ✅ **Separação de Responsabilidades**
```
utils/contact-identifier-normalizer.ts   (Normalização)
repositories/ContactRepository.ts        (Acesso a dados)
core/processor.ts                        (Lógica de negócio)
brokers/uazapi/UazapiBroker.ts          (Mapeamento específico)
```

#### ✅ **Testável**
- ✅ Dependências injetáveis (Repository Pattern)
- ✅ Funções puras (normalizadores)
- ✅ Fácil criar mocks para testes

---

## 🎯 Conclusão

A implementação proposta permite que o sistema aceite **JID e LID além de números de telefone** de forma **gradual, retrocompatível e seguindo princípios SOLID e Clean Code**.

**Principais benefícios**:
- ✅ Suporte a múltiplos formatos de identificação
- ✅ Retrocompatibilidade total (código antigo continua funcionando)
- ✅ Migração gradual (dados preenchidos conforme webhooks chegam)
- ✅ Busca otimizada (índices dedicados)
- ✅ Extensível para futuros formatos
- ✅ **Arquitetura reutilizável** entre todos os brokers
- ✅ **SOLID e Clean Code** aplicados consistentemente
- ✅ **Testável** e manutenível

**Conformidade com Regras**:
- ✅ Segue `.cursor/rules/cursorrules.mdc`
- ✅ Arquitetura reutilizável implementada
- ✅ Clean Code aplicado (funções pequenas, nomenclatura clara, DRY)
- ✅ SOLID aplicado (SRP, OCP, LSP, ISP, DIP)

**Próximos passos**:
1. Aguardar aprovação desta análise
2. Implementar Fase 1 (Normalização) primeiro
3. Testar em ambiente de desenvolvimento
4. Implementar fases restantes sequencialmente
5. Documentar mudanças no CHANGELOG

---

## ⚠️ Correções Críticas Aplicadas

### **1. Constraint NOT NULL Removida**

**Problema Identificado**: Schema atual tinha `phone NOT NULL` e `country_code NOT NULL`, bloqueando criação de contatos apenas com LID.

**Correção Aplicada**: Migração agora remove `NOT NULL` e adiciona constraint que requer pelo menos um identificador.

### **2. Unique Constraints Adicionadas**

**Problema Identificado**: Risco de duplicação de contatos.

**Correção Aplicada**: Unique constraints em `canonical_identifier`, `jid`, `lid` e `(phone, country_code)` por projeto.

### **3. Busca Otimizada**

**Problema Identificado**: 4 queries sequenciais no pior caso.

**Correção Aplicada**: Busca em paralelo usando `Promise.allSettled()`.

### **4. Validação de Consistência**

**Problema Identificado**: `canonicalId` pode não corresponder aos outros identificadores.

**Correção Aplicada**: Função `validateIdentifierConsistency()` adicionada.

### **5. Atualização Atômica**

**Problema Identificado**: Múltiplas queries sem transação.

**Correção Aplicada**: Atualização em uma única query atômica.

### **⚠️ Ações Pendentes (Ver Seção de Validadores)**

- [ ] **CRÍTICO**: Atualizar validadores Zod (backend + frontend)
- [ ] **CRÍTICO**: Atualizar API REST Edge Function `contacts`
- [ ] **IMPORTANTE**: Criar script de rollback
- [ ] **IMPORTANTE**: Adicionar feature flag (opcional)

---

## 🔄 Plano de Rollback

### **Rollback Completo (Migração Reversa)**

**Arquivo**: `back-end/supabase/migrations/XXX_rollback_jid_lid_from_contacts.sql`

**⚠️ ATENÇÃO**: Esta migração remove dados de JID/LID existentes. Apenas executar se necessário reverter funcionalidade completamente.

```sql
-- Migration: Rollback - Remover suporte a JID e LID
-- Data: 2024-XX-XX
-- Descrição: Reverte migração de JID/LID se necessário

BEGIN;

-- Remover unique constraints
DROP INDEX IF EXISTS idx_contacts_canonical_identifier_unique;
DROP INDEX IF EXISTS idx_contacts_jid_unique;
DROP INDEX IF EXISTS idx_contacts_lid_unique;
DROP INDEX IF EXISTS idx_contacts_phone_unique;

-- Remover índices compostos
DROP INDEX IF EXISTS idx_contacts_project_jid;
DROP INDEX IF EXISTS idx_contacts_project_lid;
DROP INDEX IF EXISTS idx_contacts_project_canonical;

-- Remover constraint de identificador obrigatório
ALTER TABLE contacts DROP CONSTRAINT IF EXISTS contacts_identifier_required;

-- Restaurar constraints originais (sem NULL)
ALTER TABLE contacts DROP CONSTRAINT IF EXISTS contacts_phone_format;
ALTER TABLE contacts DROP CONSTRAINT IF EXISTS contacts_country_code_format;

ALTER TABLE contacts ADD CONSTRAINT contacts_phone_format 
  CHECK (phone ~ '^[0-9]{8,15}$');  -- Sem permitir NULL

ALTER TABLE contacts ADD CONSTRAINT contacts_country_code_format 
  CHECK (country_code ~ '^[0-9]{1,3}$');  -- Sem permitir NULL

-- Restaurar NOT NULL em phone e country_code
-- ⚠️ ATENÇÃO: Apenas se TODOS os contatos tiverem phone preenchido
-- Validar antes:
-- SELECT COUNT(*) FROM contacts WHERE phone IS NULL; -- Deve ser 0

ALTER TABLE contacts
  ALTER COLUMN phone SET NOT NULL,
  ALTER COLUMN country_code SET NOT NULL;

-- Remover colunas (opcional - apenas se quiser remover completamente)
-- ALTER TABLE contacts
--   DROP COLUMN IF EXISTS jid,
--   DROP COLUMN IF EXISTS lid,
--   DROP COLUMN IF EXISTS canonical_identifier;

COMMIT;
```

**Validação Antes de Rollback Completo**:
```sql
-- Verificar se há contatos apenas com JID/LID (sem phone)
SELECT COUNT(*) FROM contacts 
WHERE phone IS NULL AND country_code IS NULL;
-- Se > 0, não pode fazer rollback completo

-- Verificar se há contatos com JID/LID
SELECT COUNT(*) FROM contacts 
WHERE jid IS NOT NULL OR lid IS NOT NULL;
```

### **Rollback Parcial (Manter Dados, Remover Constraints)**

**Cenário**: Migração aplicada, mas queremos remover unique constraints temporariamente.

```sql
-- Remover apenas unique constraints (mantém dados)
DROP INDEX IF EXISTS idx_contacts_canonical_identifier_unique;
DROP INDEX IF EXISTS idx_contacts_jid_unique;
DROP INDEX IF EXISTS idx_contacts_lid_unique;
DROP INDEX IF EXISTS idx_contacts_phone_unique;

-- Dados de JID/LID permanecem no banco
-- Constraints podem ser recriadas depois
```

### **Rollback de Código (Sem Rollback de Banco)**

**Cenário**: Bug no código, queremos desativar funcionalidade sem tocar no banco.

**Estratégia**:
1. Feature flag desativa uso de JID/LID no código
2. Sistema continua usando apenas telefone
3. Dados JID/LID permanecem no banco
4. Quando bug corrigido, reativar feature flag

---

## 📚 Referências

- **Documentação WhatsApp JID**: [Formato JID do WhatsApp](https://www.whatsapp.com/)
- **Documentação UAZAPI**: Campos `sender_lid` e `sender_pn` no webhook
- **Arquitetura atual**: `back-end/doc/IMPLEMENTATION_CONTACT_ORIGINS.md`
- **Validação SOLID**: `back-end/doc/ARCHITECTURE_VALIDATION.md`
- **Análise crítica**: `back-end/doc/CRITICA_PLANO_IMPLEMENTACAO_JID_LID.md` ⚠️ IMPORTANTE

---

## ⚠️ Ações Pendentes Críticas

**⚠️ ORDEM CORRETA DE IMPLEMENTAÇÃO**:

### **FASE 0: Tipos e Validadores (BLOQUEADOR - Antes de tudo)**

#### **0.1. Tipos TypeScript (BLOQUEADOR)**
```typescript
// ⚠️ CRÍTICO: Atualizar 4 arquivos ANTES de qualquer implementação
// back-end/types.ts
// back-end/supabase/functions/contacts/types.ts
// back-end/supabase/functions/messaging/types.ts
// front-end/src/types/models.ts
// 
// Tornar phone e country_code opcionais (string | null | undefined)
// Adicionar campos: jid, lid, canonical_identifier (opcionais)
```

#### **0.2. Validadores Zod (BLOQUEADOR)**
```typescript
// ⚠️ CRÍTICO: Atualizar 2 arquivos ANTES de qualquer implementação
// back-end/supabase/functions/contacts/validators/contact.ts
// front-end/src/schemas/contact.ts
//
// Tornar phone e country_code opcionais (.optional().nullable())
// Adicionar campos jid, lid, canonical_identifier
// Validar: pelo menos um identificador obrigatório (.refine())
```

### **FASE 1.5: Migração de Dados Existentes (BLOQUEADOR - Antes de unique constraints)**
```sql
-- ⚠️ CRÍTICO: Executar script de migração de dados
-- Preencher canonical_identifier para contatos existentes
-- Resolver duplicatas antes de criar unique constraints
-- Ver seção "Fase 1.5" acima
```

### **FASE 2: Banco de Dados (Inclui ajuste de constraints existentes)**
```sql
-- ⚠️ CRÍTICO: Ajustar constraints existentes para permitir NULL
-- ALTER TABLE contacts DROP CONSTRAINT contacts_phone_format;
-- ALTER TABLE contacts ADD CONSTRAINT contacts_phone_format 
--   CHECK (phone IS NULL OR phone ~ '^[0-9]{8,15}$');
```

### **FASE 8: API REST Edge Function (Importante)**
```typescript
// ⚠️ IMPORTANTE: Atualizar back-end/supabase/functions/contacts/handlers/create.ts
// Aceitar jid, lid, canonical_identifier
// Validar: pelo menos um identificador
```

**Veja `CRITICA_PLANO_IMPLEMENTACAO_JID_LID.md` e `ANALISE_CRITICA_COMPLETA_JID_LID.md` para detalhes completos de todas as correções necessárias.**
