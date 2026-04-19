-- RLS Policies 002: Projects
-- Data: 2025-01-27
-- Descrição: Políticas de Row Level Security para projetos
-- Baseado em: doc/database-schema.md linhas 1422-1430

BEGIN;

-- ============================================================================
-- HABILITAR RLS NAS TABELAS DE PROJETOS
-- ============================================================================
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_users ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- POLÍTICAS PARA projects
-- ============================================================================

-- Usuários podem ver projetos de empresas onde são membros
CREATE POLICY "projects_user_policy" ON projects
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM company_users 
            WHERE company_users.company_id = projects.company_id 
            AND company_users.user_id = auth.uid()
            AND company_users.is_active = true
        )
    );

-- Apenas owners e admins de empresas podem criar projetos
CREATE POLICY "projects_create_policy" ON projects
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM company_users 
            WHERE company_users.company_id = projects.company_id 
            AND company_users.user_id = auth.uid()
            AND company_users.role IN ('owner', 'admin')
            AND company_users.is_active = true
        )
        AND created_by = auth.uid()
    );

-- Apenas owners e admins de projetos podem atualizar/deletar
CREATE POLICY "projects_modify_policy" ON projects
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM project_users 
            WHERE project_users.project_id = projects.id 
            AND project_users.user_id = auth.uid()
            AND project_users.role IN ('owner', 'admin')
            AND project_users.is_active = true
        )
    );

-- ============================================================================
-- POLÍTICAS PARA project_users
-- ============================================================================

-- Usuários podem ver membros de projetos onde participam
CREATE POLICY "project_users_view_policy" ON project_users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM project_users pu2
            WHERE pu2.project_id = project_users.project_id 
            AND pu2.user_id = auth.uid()
            AND pu2.is_active = true
        )
    );

-- Apenas owners e admins de projetos podem gerenciar membros
CREATE POLICY "project_users_manage_policy" ON project_users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM project_users pu2
            WHERE pu2.project_id = project_users.project_id 
            AND pu2.user_id = auth.uid()
            AND pu2.role IN ('owner', 'admin')
            AND pu2.is_active = true
        )
    );

-- Usuários podem aceitar convites para si mesmos
CREATE POLICY "project_users_accept_policy" ON project_users
    FOR UPDATE USING (
        user_id = auth.uid()
        AND invited_at IS NOT NULL
        AND accepted_at IS NULL
    )
    WITH CHECK (
        user_id = auth.uid()
        AND accepted_at IS NOT NULL
    );

COMMIT;
