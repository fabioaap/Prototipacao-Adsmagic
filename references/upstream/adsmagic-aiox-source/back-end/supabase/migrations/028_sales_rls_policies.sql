-- Migration 028: Sales RLS Policies
-- Data: 2026-01-10
-- Descrição: Políticas de segurança Row Level Security para tabela sales
-- Baseado em: doc/IMPLEMENTACAO_SALES_BACKEND.md

BEGIN;

-- ============================================================================
-- RLS POLICIES PARA SALES
-- ============================================================================
-- Seguem o mesmo padrão de contacts: acesso baseado em project_users

-- Policy: SELECT - Usuário pode ver vendas dos projetos que participa
CREATE POLICY "sales_select_policy" ON sales
    FOR SELECT
    USING (
        project_id IN (
            SELECT pu.project_id 
            FROM project_users pu 
            WHERE pu.user_id = auth.uid() 
            AND pu.is_active = true
        )
    );

-- Policy: INSERT - Usuário pode criar vendas nos projetos (roles permitidas)
CREATE POLICY "sales_insert_policy" ON sales
    FOR INSERT
    WITH CHECK (
        project_id IN (
            SELECT pu.project_id 
            FROM project_users pu 
            WHERE pu.user_id = auth.uid() 
            AND pu.is_active = true
            AND pu.role IN ('owner', 'admin', 'manager', 'member')
        )
    );

-- Policy: UPDATE - Usuário pode atualizar vendas dos projetos (roles permitidas)
CREATE POLICY "sales_update_policy" ON sales
    FOR UPDATE
    USING (
        project_id IN (
            SELECT pu.project_id 
            FROM project_users pu 
            WHERE pu.user_id = auth.uid() 
            AND pu.is_active = true
            AND pu.role IN ('owner', 'admin', 'manager', 'member')
        )
    )
    WITH CHECK (
        project_id IN (
            SELECT pu.project_id 
            FROM project_users pu 
            WHERE pu.user_id = auth.uid() 
            AND pu.is_active = true
            AND pu.role IN ('owner', 'admin', 'manager', 'member')
        )
    );

-- Policy: DELETE - Usuário pode deletar vendas (apenas roles gerenciais)
CREATE POLICY "sales_delete_policy" ON sales
    FOR DELETE
    USING (
        project_id IN (
            SELECT pu.project_id 
            FROM project_users pu 
            WHERE pu.user_id = auth.uid() 
            AND pu.is_active = true
            AND pu.role IN ('owner', 'admin', 'manager')
        )
    );

COMMIT;
