-- ============================================================================
-- Migration 022: Adicionar Unique Constraints em contacts
-- ============================================================================
-- Data: 2025-01-27
-- Descrição: Adiciona unique constraints para evitar duplicatas de identificadores
-- 
-- ⚠️ IMPORTANTE: Esta migration deve ser executada APÓS a migração de dados (FASE 1.5)
-- ⚠️ ORDEM: Executar scripts de análise e migração ANTES desta migration
-- ============================================================================

BEGIN;

-- ============================================================================
-- ETAPA 1: Unique constraint para canonical_identifier (por projeto)
-- ============================================================================
-- Garante que não há dois contatos com o mesmo canonical_identifier no mesmo projeto
CREATE UNIQUE INDEX IF NOT EXISTS idx_contacts_canonical_identifier_unique 
ON contacts(project_id, canonical_identifier) 
WHERE canonical_identifier IS NOT NULL;

-- ============================================================================
-- ETAPA 2: Unique constraint para jid (por projeto)
-- ============================================================================
-- Garante que não há dois contatos com o mesmo jid no mesmo projeto
CREATE UNIQUE INDEX IF NOT EXISTS idx_contacts_jid_unique 
ON contacts(project_id, jid) 
WHERE jid IS NOT NULL;

-- ============================================================================
-- ETAPA 3: Unique constraint para lid (por projeto)
-- ============================================================================
-- Garante que não há dois contatos com o mesmo lid no mesmo projeto
CREATE UNIQUE INDEX IF NOT EXISTS idx_contacts_lid_unique 
ON contacts(project_id, lid) 
WHERE lid IS NOT NULL;

-- ============================================================================
-- ETAPA 4: Unique constraint para phone + country_code (por projeto)
-- ============================================================================
-- Garante que não há dois contatos com o mesmo phone + country_code no mesmo projeto
CREATE UNIQUE INDEX IF NOT EXISTS idx_contacts_phone_unique 
ON contacts(project_id, phone, country_code) 
WHERE phone IS NOT NULL AND country_code IS NOT NULL;

-- ============================================================================
-- ETAPA 5: Comentários explicativos
-- ============================================================================
COMMENT ON INDEX idx_contacts_canonical_identifier_unique IS 
'Unique constraint: garante que canonical_identifier seja único por projeto';

COMMENT ON INDEX idx_contacts_jid_unique IS 
'Unique constraint: garante que jid seja único por projeto';

COMMENT ON INDEX idx_contacts_lid_unique IS 
'Unique constraint: garante que lid seja único por projeto';

COMMENT ON INDEX idx_contacts_phone_unique IS 
'Unique constraint: garante que phone + country_code seja único por projeto';

COMMIT;
