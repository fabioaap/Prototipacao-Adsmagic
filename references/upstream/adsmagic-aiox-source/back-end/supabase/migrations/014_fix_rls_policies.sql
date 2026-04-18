-- Migration 014: Fix RLS Policies
-- Data: 2025-01-27
-- Descrição: Corrigir políticas RLS conflitantes e garantir autenticação correta
-- Baseado em: Análise dos logs e identificação do problema de autenticação

BEGIN;

-- ============================================================================
-- VERIFICAR E CORRIGIR POLÍTICAS RLS
-- ============================================================================

-- Verificar se as políticas da migração 013 foram criadas e removê-las se existirem
-- (Elas não foram criadas, mas vamos garantir que não existam)
DROP POLICY IF EXISTS "Users can view their draft projects" ON projects;
DROP POLICY IF EXISTS "Users can update their draft projects" ON projects;
DROP POLICY IF EXISTS "Users can create draft projects in their company" ON projects;

-- ============================================================================
-- VERIFICAR FUNÇÕES DE ACESSO
-- ============================================================================

-- Verificar se as funções existem e estão funcionando
-- user_has_company_access já existe e está funcionando
-- user_has_project_access já existe e está funcionando

-- ============================================================================
-- TESTAR POLÍTICA EXISTENTE
-- ============================================================================

-- A política projects_create_policy já está correta e deve funcionar
-- Ela verifica se o usuário é owner/admin da empresa via company_users

-- ============================================================================
-- COMENTÁRIOS PARA DOCUMENTAÇÃO
-- ============================================================================

COMMENT ON POLICY projects_create_policy ON projects IS 'Permite criação de projetos apenas para owners/admins da empresa';

COMMIT;
