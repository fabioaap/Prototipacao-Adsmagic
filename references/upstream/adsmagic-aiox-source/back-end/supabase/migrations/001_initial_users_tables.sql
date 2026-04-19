-- Migration 001: Initial Users Tables
-- Data: 2025-01-27
-- Descrição: Criar tabelas base de usuários, empresas e relacionamentos
-- Baseado em: doc/database-schema.md linhas 57-139

BEGIN;

-- Criar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- TABELA: user_profiles (Perfil Estendido do Usuário)
-- ============================================================================
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    preferred_language VARCHAR(5) DEFAULT 'pt' CHECK (preferred_language IN ('pt', 'en', 'es')),
    timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
    avatar_url VARCHAR(500),
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- TABELA: companies (Empresas/Organizações)
-- ============================================================================
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    logo_url VARCHAR(500),
    website VARCHAR(255),
    industry VARCHAR(100),
    size VARCHAR(20) CHECK (size IN ('startup', 'small', 'medium', 'large', 'enterprise')),
    country VARCHAR(2) NOT NULL, -- ISO 3166-1 alpha-2
    timezone VARCHAR(50) NOT NULL DEFAULT 'America/Sao_Paulo',
    currency VARCHAR(3) NOT NULL DEFAULT 'BRL', -- ISO 4217
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- TABELA: company_users (Usuários da Empresa)
-- ============================================================================
CREATE TABLE company_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('owner', 'admin', 'manager', 'member', 'viewer')),
    permissions JSONB DEFAULT '{}', -- Permissões específicas
    is_active BOOLEAN DEFAULT true,
    invited_by UUID REFERENCES auth.users(id),
    invited_at TIMESTAMP WITH TIME ZONE,
    accepted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(company_id, user_id)
);

-- ============================================================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================================================

-- Índices para user_profiles
CREATE INDEX idx_user_profiles_active ON user_profiles(is_active);
CREATE INDEX idx_user_profiles_created_at ON user_profiles(created_at);

-- Índices para companies
CREATE INDEX idx_companies_active ON companies(is_active);
CREATE INDEX idx_companies_country ON companies(country);
CREATE INDEX idx_companies_created_at ON companies(created_at);

-- Índices para company_users
CREATE INDEX idx_company_users_company_id ON company_users(company_id);
CREATE INDEX idx_company_users_user_id ON company_users(user_id);
CREATE INDEX idx_company_users_role ON company_users(role);
CREATE INDEX idx_company_users_active ON company_users(is_active);

-- ============================================================================
-- CONSTRAINTS DE VALIDAÇÃO
-- ============================================================================

-- Constraints para user_profiles
ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_name_length 
    CHECK (LENGTH(first_name) >= 2 AND LENGTH(first_name) <= 100);
ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_phone_format 
    CHECK (phone IS NULL OR phone ~ '^[0-9+]{10,20}$');

-- Constraints para companies
ALTER TABLE companies ADD CONSTRAINT companies_name_length 
    CHECK (LENGTH(name) >= 2 AND LENGTH(name) <= 100);
ALTER TABLE companies ADD CONSTRAINT companies_website_format 
    CHECK (website IS NULL OR website ~ '^https?://');

COMMIT;
