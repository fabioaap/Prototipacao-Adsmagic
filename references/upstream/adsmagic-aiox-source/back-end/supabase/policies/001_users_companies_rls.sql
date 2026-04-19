-- RLS Policies 001: Users and Companies
-- Data: 2025-01-27
-- Descrição: Políticas de Row Level Security para usuários e empresas
-- Baseado em: doc/database-schema.md linhas 1402-1420

BEGIN;

-- ============================================================================
-- HABILITAR RLS NAS TABELAS
-- ============================================================================
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_users ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- POLÍTICAS PARA user_profiles
-- ============================================================================

-- Usuários podem ver e editar apenas seu próprio perfil
CREATE POLICY "user_profiles_user_policy" ON user_profiles
    FOR ALL USING (auth.uid() = id);

-- ============================================================================
-- POLÍTICAS PARA companies
-- ============================================================================

-- Usuários podem ver apenas empresas onde são membros
CREATE POLICY "companies_user_policy" ON companies
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM company_users 
            WHERE company_users.company_id = companies.id 
            AND company_users.user_id = auth.uid()
            AND company_users.is_active = true
        )
    );

-- Apenas owners e admins podem criar empresas
CREATE POLICY "companies_create_policy" ON companies
    FOR INSERT WITH CHECK (
        -- Usuário não pode estar em outra empresa como owner/admin
        NOT EXISTS (
            SELECT 1 FROM company_users 
            WHERE company_users.user_id = auth.uid()
            AND company_users.role IN ('owner', 'admin')
            AND company_users.is_active = true
        )
    );

-- Apenas owners podem atualizar/deletar empresas
CREATE POLICY "companies_modify_policy" ON companies
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM company_users 
            WHERE company_users.company_id = companies.id 
            AND company_users.user_id = auth.uid()
            AND company_users.role = 'owner'
            AND company_users.is_active = true
        )
    );

-- ============================================================================
-- POLÍTICAS PARA company_users
-- ============================================================================

-- Usuários podem ver membros de empresas onde participam
CREATE POLICY "company_users_view_policy" ON company_users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM company_users cu2
            WHERE cu2.company_id = company_users.company_id 
            AND cu2.user_id = auth.uid()
            AND cu2.is_active = true
        )
    );

-- Apenas owners e admins podem gerenciar membros
CREATE POLICY "company_users_manage_policy" ON company_users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM company_users cu2
            WHERE cu2.company_id = company_users.company_id 
            AND cu2.user_id = auth.uid()
            AND cu2.role IN ('owner', 'admin')
            AND cu2.is_active = true
        )
    );

-- Usuários podem aceitar convites para si mesmos
CREATE POLICY "company_users_accept_policy" ON company_users
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
