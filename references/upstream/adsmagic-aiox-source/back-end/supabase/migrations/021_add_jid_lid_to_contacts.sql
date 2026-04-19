-- ============================================================================
-- Migration 021: Adicionar suporte a JID e LID em contacts
-- ============================================================================
-- Data: 2025-01-27
-- Descrição: Adiciona campos opcionais para armazenar JID/LID como identificadores alternativos
-- 
-- ⚠️ IMPORTANTE: Remove NOT NULL de phone e country_code para permitir contatos apenas com LID
-- ⚠️ ORDEM: Esta migration deve ser executada ANTES de criar unique constraints
-- ============================================================================

BEGIN;

-- ============================================================================
-- ETAPA 1: Remover NOT NULL de phone e country_code
-- ============================================================================
-- Permite criar contato apenas com JID/LID (sem telefone)
ALTER TABLE contacts
  ALTER COLUMN phone DROP NOT NULL,
  ALTER COLUMN country_code DROP NOT NULL;

-- ============================================================================
-- ETAPA 2: Ajustar constraints existentes para permitir NULL
-- ============================================================================
-- Constraints existentes não permitem NULL, precisam ser ajustadas
ALTER TABLE contacts DROP CONSTRAINT IF EXISTS contacts_phone_format;
ALTER TABLE contacts DROP CONSTRAINT IF EXISTS contacts_country_code_format;

-- Re-criar constraints permitindo NULL
ALTER TABLE contacts ADD CONSTRAINT contacts_phone_format 
  CHECK (phone IS NULL OR phone ~ '^[0-9]{8,15}$');

ALTER TABLE contacts ADD CONSTRAINT contacts_country_code_format 
  CHECK (country_code IS NULL OR country_code ~ '^[0-9]{1,3}$');

-- ============================================================================
-- ETAPA 3: Adicionar campos opcionais para identificadores alternativos
-- ============================================================================
ALTER TABLE contacts
ADD COLUMN IF NOT EXISTS jid VARCHAR(255),           -- JID completo (ex: 5511999999999@s.whatsapp.net)
ADD COLUMN IF NOT EXISTS lid VARCHAR(255),           -- LID completo (ex: 213709100187796@lid)
ADD COLUMN IF NOT EXISTS canonical_identifier VARCHAR(255); -- Identificador canônico para busca

-- ============================================================================
-- ETAPA 4: Constraint que garante pelo menos um identificador
-- ============================================================================
ALTER TABLE contacts DROP CONSTRAINT IF EXISTS contacts_identifier_required;

ALTER TABLE contacts ADD CONSTRAINT contacts_identifier_required 
  CHECK (
    phone IS NOT NULL OR 
    jid IS NOT NULL OR 
    lid IS NOT NULL OR
    canonical_identifier IS NOT NULL
  );

-- ============================================================================
-- ETAPA 5: Índices para performance (sem unique ainda - será na próxima migration)
-- ============================================================================
-- Índices compostos otimizados (project_id + identifier)
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

-- ============================================================================
-- ETAPA 6: Comentários explicativos
-- ============================================================================
COMMENT ON COLUMN contacts.jid IS 
'JID (Jabber ID) do WhatsApp. Formato: 5511999999999@s.whatsapp.net ou 5511999999999-1234567890@g.us';

COMMENT ON COLUMN contacts.lid IS 
'LID (Local ID) do WhatsApp. Formato: 213709100187796@lid';

COMMENT ON COLUMN contacts.canonical_identifier IS 
'Identificador canônico único usado para busca. Formato: phone:${country_code}:${phone} ou jid:${jid} ou lid:${lid_number}. Deve ser único por projeto.';

COMMENT ON CONSTRAINT contacts_identifier_required ON contacts IS 
'Garante que contato tenha pelo menos um identificador (phone, jid, lid ou canonical_identifier)';

-- ============================================================================
-- NOTA: Unique constraints serão criados na migration 022 após migração de dados
-- ============================================================================
-- ⚠️ IMPORTANTE: 
--   1. Executar script de migração de dados (FASE 1.5) para preencher canonical_identifier
--   2. Executar script de análise para verificar duplicatas
--   3. Resolver duplicatas antes de criar unique constraints
--   4. Criar unique constraints na migration 022

COMMIT;
