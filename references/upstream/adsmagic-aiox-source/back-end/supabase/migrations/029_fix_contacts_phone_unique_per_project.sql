-- ============================================================================
-- Migration 029: Corrigir Unique Constraint de phone para ser por projeto
-- ============================================================================
-- Data: 2025-01-10
-- Descrição: Remove qualquer constraint UNIQUE global de phone e garante que
--            a constraint seja apenas por projeto (project_id, phone, country_code)
-- 
-- PROBLEMA: Um contato pode estar em múltiplos projetos com o mesmo telefone
--           (ex: cliente entrou em contato com duas empresas diferentes)
-- ============================================================================

BEGIN;

-- ============================================================================
-- ETAPA 1: Remover constraints globais que podem existir
-- ============================================================================

-- Remover constraint UNIQUE global de phone (se existir)
DROP INDEX IF EXISTS contacts_phone_key;
DROP INDEX IF EXISTS contacts_phone_idx;
DROP INDEX IF EXISTS idx_contacts_phone;

-- Remover qualquer constraint UNIQUE que seja apenas em phone (sem project_id)
DO $$
DECLARE
    constraint_name TEXT;
BEGIN
    -- Busca constraints que são apenas em phone (sem project_id)
    FOR constraint_name IN
        SELECT conname
        FROM pg_constraint c
        JOIN pg_class t ON t.oid = c.conrelid
        WHERE t.relname = 'contacts'
        AND c.contype = 'u'  -- unique constraint
        AND array_length(c.conkey, 1) = 1  -- apenas uma coluna
        AND EXISTS (
            SELECT 1 FROM pg_attribute a
            WHERE a.attrelid = t.oid
            AND a.attnum = ANY(c.conkey)
            AND a.attname = 'phone'
        )
    LOOP
        EXECUTE format('ALTER TABLE contacts DROP CONSTRAINT IF EXISTS %I', constraint_name);
        RAISE NOTICE 'Removida constraint global: %', constraint_name;
    END LOOP;
END $$;

-- ============================================================================
-- ETAPA 2: Garantir que a constraint por projeto existe
-- ============================================================================

-- Dropar e recriar o índice por projeto para garantir que está correto
DROP INDEX IF EXISTS idx_contacts_phone_unique;

-- Criar índice UNIQUE por projeto (project_id + phone + country_code)
CREATE UNIQUE INDEX IF NOT EXISTS idx_contacts_phone_unique 
ON contacts(project_id, phone, country_code) 
WHERE phone IS NOT NULL AND country_code IS NOT NULL;

-- ============================================================================
-- ETAPA 3: Adicionar comentário explicativo
-- ============================================================================
COMMENT ON INDEX idx_contacts_phone_unique IS 
'Unique constraint por PROJETO: garante que phone + country_code seja único DENTRO do mesmo projeto. Um contato pode existir em múltiplos projetos com o mesmo telefone.';

-- ============================================================================
-- ETAPA 4: Log para verificação
-- ============================================================================
DO $$
BEGIN
    RAISE NOTICE 'Migration 029 concluída: Constraint de phone agora é por projeto (project_id, phone, country_code)';
END $$;

COMMIT;
