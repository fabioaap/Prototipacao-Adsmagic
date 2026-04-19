-- ============================================================================
-- Script de Análise: Duplicatas e Contatos sem canonical_identifier
-- ============================================================================
-- Data: 2025-01-27
-- Descrição: Analisa a tabela contacts para identificar:
--   1. Contatos duplicados (mesmo phone + country_code no mesmo projeto)
--   2. Contatos sem canonical_identifier
--   3. Estatísticas gerais
-- 
-- ⚠️ IMPORTANTE: Execute este script ANTES da migração de dados
-- ============================================================================

-- ============================================================================
-- 1. ESTATÍSTICAS GERAIS
-- ============================================================================
SELECT 
    '=== ESTATÍSTICAS GERAIS ===' as section;

SELECT 
    COUNT(*) as total_contacts,
    COUNT(DISTINCT project_id) as total_projects,
    COUNT(*) FILTER (WHERE phone IS NOT NULL AND country_code IS NOT NULL) as contacts_with_phone,
    COUNT(*) FILTER (WHERE jid IS NOT NULL) as contacts_with_jid,
    COUNT(*) FILTER (WHERE lid IS NOT NULL) as contacts_with_lid,
    COUNT(*) FILTER (WHERE canonical_identifier IS NOT NULL) as contacts_with_canonical,
    COUNT(*) FILTER (WHERE canonical_identifier IS NULL) as contacts_without_canonical
FROM contacts;

-- ============================================================================
-- 2. CONTATOS SEM canonical_identifier
-- ============================================================================
SELECT 
    '=== CONTATOS SEM canonical_identifier ===' as section;

SELECT 
    id,
    project_id,
    name,
    phone,
    country_code,
    jid,
    lid,
    created_at
FROM contacts
WHERE canonical_identifier IS NULL
ORDER BY project_id, created_at
LIMIT 100;

-- Contagem total
SELECT 
    COUNT(*) as total_without_canonical
FROM contacts
WHERE canonical_identifier IS NULL;

-- ============================================================================
-- 3. DUPLICATAS: Mesmo phone + country_code no mesmo projeto
-- ============================================================================
SELECT 
    '=== DUPLICATAS (phone + country_code no mesmo projeto) ===' as section;

-- Listar duplicatas com detalhes
SELECT 
    project_id,
    phone,
    country_code,
    COUNT(*) as duplicate_count,
    array_agg(id ORDER BY created_at) as contact_ids,
    array_agg(name ORDER BY created_at) as contact_names,
    array_agg(created_at ORDER BY created_at) as created_dates,
    MIN(created_at) as oldest_contact,
    MAX(created_at) as newest_contact
FROM contacts
WHERE phone IS NOT NULL 
  AND country_code IS NOT NULL
GROUP BY project_id, phone, country_code
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC, project_id, phone;

-- Estatísticas de duplicatas
SELECT 
    COUNT(DISTINCT (project_id, phone, country_code)) as duplicate_groups,
    SUM(duplicate_count - 1) as total_duplicate_contacts
FROM (
    SELECT 
        project_id,
        phone,
        country_code,
        COUNT(*) as duplicate_count
    FROM contacts
    WHERE phone IS NOT NULL 
      AND country_code IS NOT NULL
    GROUP BY project_id, phone, country_code
    HAVING COUNT(*) > 1
) duplicates;

-- ============================================================================
-- 4. DUPLICATAS: Mesmo jid no mesmo projeto
-- ============================================================================
SELECT 
    '=== DUPLICATAS (jid no mesmo projeto) ===' as section;

SELECT 
    project_id,
    jid,
    COUNT(*) as duplicate_count,
    array_agg(id ORDER BY created_at) as contact_ids,
    array_agg(name ORDER BY created_at) as contact_names,
    MIN(created_at) as oldest_contact
FROM contacts
WHERE jid IS NOT NULL
GROUP BY project_id, jid
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC;

-- ============================================================================
-- 5. DUPLICATAS: Mesmo lid no mesmo projeto
-- ============================================================================
SELECT 
    '=== DUPLICATAS (lid no mesmo projeto) ===' as section;

SELECT 
    project_id,
    lid,
    COUNT(*) as duplicate_count,
    array_agg(id ORDER BY created_at) as contact_ids,
    array_agg(name ORDER BY created_at) as contact_names,
    MIN(created_at) as oldest_contact
FROM contacts
WHERE lid IS NOT NULL
GROUP BY project_id, lid
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC;

-- ============================================================================
-- 6. CONTATOS COM PROBLEMAS (sem nenhum identificador válido)
-- ============================================================================
SELECT 
    '=== CONTATOS SEM IDENTIFICADOR VÁLIDO ===' as section;

SELECT 
    id,
    project_id,
    name,
    phone,
    country_code,
    jid,
    lid,
    canonical_identifier,
    created_at
FROM contacts
WHERE (phone IS NULL OR country_code IS NULL)
  AND jid IS NULL
  AND lid IS NULL
  AND canonical_identifier IS NULL
ORDER BY project_id, created_at;

-- ============================================================================
-- 7. RESUMO PARA DECISÃO DE MIGRAÇÃO
-- ============================================================================
SELECT 
    '=== RESUMO PARA MIGRAÇÃO ===' as section;

SELECT 
    'Total de contatos' as metric,
    COUNT(*)::text as value
FROM contacts
UNION ALL
SELECT 
    'Contatos sem canonical_identifier' as metric,
    COUNT(*)::text
FROM contacts
WHERE canonical_identifier IS NULL
UNION ALL
SELECT 
    'Grupos de duplicatas (phone+country_code)' as metric,
    COUNT(DISTINCT (project_id, phone, country_code))::text
FROM contacts
WHERE phone IS NOT NULL 
  AND country_code IS NOT NULL
GROUP BY project_id, phone, country_code
HAVING COUNT(*) > 1
UNION ALL
SELECT 
    'Contatos duplicados a resolver' as metric,
    SUM(duplicate_count - 1)::text
FROM (
    SELECT 
        project_id,
        phone,
        country_code,
        COUNT(*) as duplicate_count
    FROM contacts
    WHERE phone IS NOT NULL 
      AND country_code IS NOT NULL
    GROUP BY project_id, phone, country_code
    HAVING COUNT(*) > 1
) duplicates;
