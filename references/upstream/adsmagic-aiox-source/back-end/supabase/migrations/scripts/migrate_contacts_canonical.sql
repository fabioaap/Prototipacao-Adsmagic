-- ============================================================================
-- Script de Migração: Preencher canonical_identifier e Resolver Duplicatas
-- ============================================================================
-- Data: 2025-01-27
-- Descrição: 
--   1. Preenche canonical_identifier para contatos existentes
--   2. Resolve duplicatas mantendo o contato mais antigo
--   3. Marca contatos duplicados como inativos (soft delete) ou deleta
-- 
-- ⚠️ IMPORTANTE: 
--   - Execute o script de análise ANTES deste
--   - Faça backup do banco ANTES de executar
--   - Execute em staging primeiro
--   - Este script é idempotente (pode ser executado múltiplas vezes)
-- ============================================================================

BEGIN;

-- ============================================================================
-- CONFIGURAÇÃO: Estratégia de Resolução de Duplicatas
-- ============================================================================
-- Opções:
--   'hard_delete': Deleta contatos duplicados permanentemente (padrão)
--   'soft_delete': Não implementado (tabela não tem is_active)
-- 
-- ⚠️ ATENÇÃO: Deletar contatos também deleta (CASCADE):
--   - contact_origins (histórico de origens)
--   - contact_stage_history (histórico de estágios)
-- ============================================================================
DO $$
DECLARE
    duplicate_strategy TEXT := 'hard_delete'; -- ⚠️ ALTERE AQUI se necessário
    contacts_processed INTEGER := 0;
    duplicates_resolved INTEGER := 0;
    canonical_filled INTEGER := 0;
BEGIN
    RAISE NOTICE '=== INICIANDO MIGRAÇÃO DE CONTATOS ===';
    RAISE NOTICE 'Estratégia de duplicatas: %', duplicate_strategy;
    RAISE NOTICE 'Timestamp: %', NOW();

    -- ============================================================================
    -- ETAPA 1: Preencher canonical_identifier para contatos com phone
    -- ============================================================================
    RAISE NOTICE '=== ETAPA 1: Preenchendo canonical_identifier para contatos com phone ===';
    
    UPDATE contacts
    SET 
        canonical_identifier = CONCAT('phone:', country_code, ':', phone),
        updated_at = NOW()
    WHERE phone IS NOT NULL 
      AND country_code IS NOT NULL
      AND canonical_identifier IS NULL;
    
    GET DIAGNOSTICS contacts_processed = ROW_COUNT;
    canonical_filled := contacts_processed;
    RAISE NOTICE 'Contatos atualizados com canonical_identifier (phone): %', contacts_processed;

    -- ============================================================================
    -- ETAPA 2: Preencher canonical_identifier para contatos com jid
    -- ============================================================================
    RAISE NOTICE '=== ETAPA 2: Preenchendo canonical_identifier para contatos com jid ===';
    
    UPDATE contacts
    SET 
        canonical_identifier = CONCAT('jid:', jid),
        updated_at = NOW()
    WHERE jid IS NOT NULL
      AND canonical_identifier IS NULL;
    
    GET DIAGNOSTICS contacts_processed = ROW_COUNT;
    canonical_filled := canonical_filled + contacts_processed;
    RAISE NOTICE 'Contatos atualizados com canonical_identifier (jid): %', contacts_processed;

    -- ============================================================================
    -- ETAPA 3: Preencher canonical_identifier para contatos com lid
    -- ============================================================================
    RAISE NOTICE '=== ETAPA 3: Preenchendo canonical_identifier para contatos com lid ===';
    
    UPDATE contacts
    SET 
        canonical_identifier = CONCAT('lid:', REGEXP_REPLACE(lid, '@lid$', '')),
        updated_at = NOW()
    WHERE lid IS NOT NULL
      AND canonical_identifier IS NULL;
    
    GET DIAGNOSTICS contacts_processed = ROW_COUNT;
    canonical_filled := canonical_filled + contacts_processed;
    RAISE NOTICE 'Contatos atualizados com canonical_identifier (lid): %', contacts_processed;

    -- ============================================================================
    -- ETAPA 4: Resolver duplicatas (phone + country_code no mesmo projeto)
    -- ============================================================================
    RAISE NOTICE '=== ETAPA 4: Resolvendo duplicatas (phone + country_code) ===';
    RAISE WARNING '⚠️ ATENÇÃO: Deletar contatos também deleta registros relacionados (CASCADE):';
    RAISE WARNING '   - contact_origins (histórico de origens)';
    RAISE WARNING '   - contact_stage_history (histórico de estágios)';
    RAISE WARNING '   - sales (vendas relacionadas, se houver FK)';
    
    -- Estratégia hard_delete: Deletar duplicados mantendo apenas o mais antigo
    -- ⚠️ ATENÇÃO: Esta operação é irreversível (exceto via backup)
    -- ⚠️ CASCADE: Deletar contato também deleta:
    --   - contact_origins (histórico de origens)
    --   - contact_stage_history (histórico de estágios)
    IF duplicate_strategy = 'hard_delete' THEN
        -- Identificar contatos duplicados (mantém o mais antigo)
        WITH duplicates AS (
            SELECT 
                id,
                project_id,
                phone,
                country_code,
                created_at,
                ROW_NUMBER() OVER (
                    PARTITION BY project_id, phone, country_code 
                    ORDER BY created_at ASC
                ) as rn
            FROM contacts
            WHERE phone IS NOT NULL 
              AND country_code IS NOT NULL
        ),
        duplicates_to_delete AS (
            SELECT id, project_id, phone, country_code, created_at
            FROM duplicates 
            WHERE rn > 1
        )
        -- Deletar duplicados (mantém o mais antigo - rn = 1)
        DELETE FROM contacts
        WHERE id IN (SELECT id FROM duplicates_to_delete);
        
        GET DIAGNOSTICS contacts_processed = ROW_COUNT;
        duplicates_resolved := contacts_processed;
        RAISE NOTICE 'Contatos duplicados deletados (mantido o mais antigo): %', contacts_processed;
        
    ELSIF duplicate_strategy = 'soft_delete' THEN
        -- ⚠️ Estratégia soft_delete não implementada
        -- A tabela contacts não possui campo is_active ou deleted_at
        RAISE WARNING 'Estratégia soft_delete não implementada (tabela não tem is_active)';
        RAISE WARNING 'Usando estratégia hard_delete: manter mais antigo, deletar outros';
        -- Executar mesma lógica de hard_delete
        -- (código duplicado propositalmente para clareza)
        WITH duplicates AS (
            SELECT 
                id,
                project_id,
                phone,
                country_code,
                created_at,
                ROW_NUMBER() OVER (
                    PARTITION BY project_id, phone, country_code 
                    ORDER BY created_at ASC
                ) as rn
            FROM contacts
            WHERE phone IS NOT NULL 
              AND country_code IS NOT NULL
        )
        DELETE FROM contacts
        WHERE id IN (
            SELECT id FROM duplicates WHERE rn > 1
        );
        
        GET DIAGNOSTICS contacts_processed = ROW_COUNT;
        duplicates_resolved := contacts_processed;
        RAISE NOTICE 'Contatos duplicados deletados (mantido o mais antigo): %', contacts_processed;
    ELSE
        RAISE EXCEPTION 'Estratégia inválida: %. Use "hard_delete" ou "soft_delete"', duplicate_strategy;
    END IF;

    -- ============================================================================
    -- ETAPA 5: Resolver duplicatas (jid no mesmo projeto)
    -- ============================================================================
    RAISE NOTICE '=== ETAPA 5: Resolvendo duplicatas (jid) ===';
    
    WITH duplicates AS (
        SELECT 
            id,
            project_id,
            jid,
            ROW_NUMBER() OVER (
                PARTITION BY project_id, jid 
                ORDER BY created_at ASC
            ) as rn
        FROM contacts
        WHERE jid IS NOT NULL
    )
    DELETE FROM contacts
    WHERE id IN (
        SELECT id FROM duplicates WHERE rn > 1
    );
    
    GET DIAGNOSTICS contacts_processed = ROW_COUNT;
    duplicates_resolved := duplicates_resolved + contacts_processed;
    RAISE NOTICE 'Contatos duplicados por jid removidos: %', contacts_processed;

    -- ============================================================================
    -- ETAPA 6: Resolver duplicatas (lid no mesmo projeto)
    -- ============================================================================
    RAISE NOTICE '=== ETAPA 6: Resolvendo duplicatas (lid) ===';
    
    WITH duplicates AS (
        SELECT 
            id,
            project_id,
            lid,
            ROW_NUMBER() OVER (
                PARTITION BY project_id, lid 
                ORDER BY created_at ASC
            ) as rn
        FROM contacts
        WHERE lid IS NOT NULL
    )
    DELETE FROM contacts
    WHERE id IN (
        SELECT id FROM duplicates WHERE rn > 1
    );
    
    GET DIAGNOSTICS contacts_processed = ROW_COUNT;
    duplicates_resolved := duplicates_resolved + contacts_processed;
    RAISE NOTICE 'Contatos duplicados por lid removidos: %', contacts_processed;

    -- ============================================================================
    -- RESUMO FINAL
    -- ============================================================================
    RAISE NOTICE '=== MIGRAÇÃO CONCLUÍDA ===';
    RAISE NOTICE 'Total de canonical_identifier preenchidos: %', canonical_filled;
    RAISE NOTICE 'Total de duplicatas resolvidas: %', duplicates_resolved;
    RAISE NOTICE 'Timestamp: %', NOW();
    
END $$;

-- ============================================================================
-- VALIDAÇÃO: Verificar resultados
-- ============================================================================
SELECT 
    '=== VALIDAÇÃO PÓS-MIGRAÇÃO ===' as section;

-- Verificar contatos sem canonical_identifier
SELECT 
    COUNT(*) as contacts_without_canonical
FROM contacts
WHERE canonical_identifier IS NULL
  AND (phone IS NOT NULL OR jid IS NOT NULL OR lid IS NOT NULL);

-- Verificar duplicatas restantes
SELECT 
    'Duplicatas restantes (phone+country_code)' as check_type,
    COUNT(DISTINCT (project_id, phone, country_code)) as duplicate_groups
FROM (
    SELECT 
        project_id,
        phone,
        country_code,
        COUNT(*) as cnt
    FROM contacts
    WHERE phone IS NOT NULL 
      AND country_code IS NOT NULL
    GROUP BY project_id, phone, country_code
    HAVING COUNT(*) > 1
) duplicates;

-- Verificar duplicatas por jid
SELECT 
    'Duplicatas restantes (jid)' as check_type,
    COUNT(DISTINCT (project_id, jid)) as duplicate_groups
FROM (
    SELECT 
        project_id,
        jid,
        COUNT(*) as cnt
    FROM contacts
    WHERE jid IS NOT NULL
    GROUP BY project_id, jid
    HAVING COUNT(*) > 1
) duplicates;

-- Verificar duplicatas por lid
SELECT 
    'Duplicatas restantes (lid)' as check_type,
    COUNT(DISTINCT (project_id, lid)) as duplicate_groups
FROM (
    SELECT 
        project_id,
        lid,
        COUNT(*) as cnt
    FROM contacts
    WHERE lid IS NOT NULL
    GROUP BY project_id, lid
    HAVING COUNT(*) > 1
) duplicates;

COMMIT;

-- ============================================================================
-- INSTRUÇÕES PÓS-EXECUÇÃO
-- ============================================================================
-- 1. Verificar os resultados das queries de validação acima
-- 2. Se houver contatos sem canonical_identifier, investigar por que não foram preenchidos
-- 3. Se houver duplicatas restantes, revisar a lógica de resolução
-- 4. Executar o script de análise novamente para comparar resultados
-- 5. Fazer backup dos resultados antes de prosseguir para FASE 2
