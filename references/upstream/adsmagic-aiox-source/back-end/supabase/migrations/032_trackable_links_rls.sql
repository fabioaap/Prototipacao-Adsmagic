-- Migration 032: Trackable Links RLS Policies
-- Data: 2026-01-17
-- Descrição: Políticas de segurança Row Level Security para tabela trackable_links
-- Baseado em: back-end/ETAPAS_BACKEND.md (Etapa 2)

BEGIN;

-- ============================================================================
-- RLS POLICIES PARA TRACKABLE_LINKS
-- ============================================================================
-- Seguem o mesmo padrão de sales/contacts: acesso baseado em project_users

-- Policy: SELECT - Usuário pode ver links dos projetos que participa
CREATE POLICY "trackable_links_select_policy" ON trackable_links
    FOR SELECT
    USING (
        project_id IN (
            SELECT pu.project_id 
            FROM project_users pu 
            WHERE pu.user_id = auth.uid() 
            AND pu.is_active = true
        )
    );

-- Policy: INSERT - Usuário pode criar links nos projetos (roles permitidas)
CREATE POLICY "trackable_links_insert_policy" ON trackable_links
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

-- Policy: UPDATE - Usuário pode atualizar links dos projetos (roles permitidas)
CREATE POLICY "trackable_links_update_policy" ON trackable_links
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

-- Policy: DELETE - Usuário pode deletar links (apenas roles gerenciais)
CREATE POLICY "trackable_links_delete_policy" ON trackable_links
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
