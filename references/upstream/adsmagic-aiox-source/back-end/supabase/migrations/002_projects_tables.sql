-- Migration 002: Projects Tables
-- Data: 2025-01-27
-- Descrição: Criar tabelas de projetos e multi-tenancy
-- Baseado em: doc/database-schema.md linhas 145-214

BEGIN;

-- ============================================================================
-- TABELA: projects
-- ============================================================================
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    company_type VARCHAR(20) NOT NULL CHECK (company_type IN ('franchise', 'corporate', 'individual')),
    franchise_count INTEGER CHECK (franchise_count >= 1 AND franchise_count <= 999),
    country VARCHAR(2) NOT NULL, -- ISO 3166-1 alpha-2
    language VARCHAR(5) NOT NULL DEFAULT 'pt', -- ISO 639-1
    currency VARCHAR(3) NOT NULL DEFAULT 'BRL', -- ISO 4217
    timezone VARCHAR(50) NOT NULL DEFAULT 'America/Sao_Paulo',
    attribution_model VARCHAR(20) NOT NULL DEFAULT 'first_touch' CHECK (attribution_model IN ('first_touch', 'last_touch', 'conversion')),
    
    -- Integrações
    whatsapp_connected BOOLEAN DEFAULT false,
    meta_ads_connected BOOLEAN DEFAULT false,
    google_ads_connected BOOLEAN DEFAULT false,
    tiktok_ads_connected BOOLEAN DEFAULT false,
    
    -- Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('draft', 'active', 'paused', 'archived')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- TABELA: project_users (Usuários do Projeto)
-- ============================================================================
CREATE TABLE project_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('owner', 'admin', 'manager', 'member', 'viewer')),
    permissions JSONB DEFAULT '{}', -- Permissões específicas do projeto
    is_active BOOLEAN DEFAULT true,
    invited_by UUID REFERENCES auth.users(id),
    invited_at TIMESTAMP WITH TIME ZONE,
    accepted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(project_id, user_id)
);

-- ============================================================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================================================

-- Índices para projects
CREATE INDEX idx_projects_company_id ON projects(company_id);
CREATE INDEX idx_projects_created_by ON projects(created_by);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_created_at ON projects(created_at);
CREATE INDEX idx_projects_company_type ON projects(company_type);

-- Índices para project_users
CREATE INDEX idx_project_users_project_id ON project_users(project_id);
CREATE INDEX idx_project_users_user_id ON project_users(user_id);
CREATE INDEX idx_project_users_role ON project_users(role);
CREATE INDEX idx_project_users_active ON project_users(is_active);

-- ============================================================================
-- CONSTRAINTS DE VALIDAÇÃO
-- ============================================================================

-- Constraints para projects
ALTER TABLE projects ADD CONSTRAINT projects_franchise_count_required 
    CHECK (company_type != 'franchise' OR franchise_count IS NOT NULL);
ALTER TABLE projects ADD CONSTRAINT projects_name_length 
    CHECK (LENGTH(name) >= 3 AND LENGTH(name) <= 100);

COMMIT;
