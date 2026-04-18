-- ============================================================================
-- Migration 052: Add performance indexes
-- ============================================================================
-- Objetivo: Melhorar performance de queries frequentes
-- Data: 2026-02-02
--
-- Problema: Companies GET levando 7s devido a count: 'exact'
-- Solução: Adicionar índices para acelerar lookups de company_users e companies
-- ============================================================================

BEGIN;

-- Índice para company_users lookup por user_id (usado em RLS)
-- Partial index para evitar scan de registros inativos
CREATE INDEX IF NOT EXISTS idx_company_users_active_user
  ON company_users(user_id, company_id)
  WHERE is_active = true;

-- Índice para company_users lookup por company_id
CREATE INDEX IF NOT EXISTS idx_company_users_company_active
  ON company_users(company_id)
  WHERE is_active = true;

-- Índice para companies ordering por created_at (usado em list)
CREATE INDEX IF NOT EXISTS idx_companies_created_at_active
  ON companies(created_at DESC)
  WHERE is_active = true;

-- Índice para company_settings lookup
CREATE INDEX IF NOT EXISTS idx_company_settings_company
  ON company_settings(company_id);

COMMIT;
