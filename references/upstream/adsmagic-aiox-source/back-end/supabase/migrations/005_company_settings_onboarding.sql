-- Migration 005: Company Settings and Onboarding
-- Data: 2025-01-27
-- Descrição: Criar tabelas de configurações de empresas e sistema de onboarding
-- Baseado em: doc/database-schema.md linhas 969-1044

BEGIN;

-- ============================================================================
-- TABELA: company_settings (Configurações Globais da Empresa)
-- ============================================================================
CREATE TABLE company_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Configurações de interface
    theme VARCHAR(20) DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
    language VARCHAR(5) DEFAULT 'pt' CHECK (language IN ('pt', 'en', 'es')),
    timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
    date_format VARCHAR(20) DEFAULT 'DD/MM/YYYY',
    time_format VARCHAR(10) DEFAULT '24h',
    thousands_separator VARCHAR(1) DEFAULT ',',
    decimal_separator VARCHAR(1) DEFAULT '.',
    
    -- Configurações de relatórios
    report_timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
    include_company_info BOOLEAN DEFAULT true,
    include_contact_info BOOLEAN DEFAULT true,
    
    -- Configurações de notificações globais
    notifications_enabled BOOLEAN DEFAULT true,
    notification_email VARCHAR(255),
    digest_frequency VARCHAR(20) DEFAULT 'weekly' CHECK (digest_frequency IN ('daily', 'weekly', 'monthly')),
    digest_time TIME DEFAULT '09:00:00',
    
    -- Configurações de integração
    default_attribution_model VARCHAR(20) DEFAULT 'first_touch' CHECK (default_attribution_model IN ('first_touch', 'last_touch', 'conversion')),
    auto_track_events BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(company_id)
);

-- ============================================================================
-- TABELA: onboarding_progress (Progresso do Onboarding)
-- ============================================================================
CREATE TABLE onboarding_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Etapas do onboarding
    company_setup BOOLEAN DEFAULT false,
    first_project_created BOOLEAN DEFAULT false,
    integrations_connected BOOLEAN DEFAULT false,
    first_contact_added BOOLEAN DEFAULT false,
    
    -- Dados do onboarding
    onboarding_data JSONB DEFAULT '{}',
    
    -- Status
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id)
);

-- ============================================================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================================================

-- Índices para company_settings
CREATE UNIQUE INDEX idx_company_settings_company_id ON company_settings(company_id);

-- Índices para onboarding_progress
CREATE INDEX idx_onboarding_progress_user_id ON onboarding_progress(user_id);
CREATE INDEX idx_onboarding_progress_company_id ON onboarding_progress(company_id);
CREATE INDEX idx_onboarding_progress_completed ON onboarding_progress(is_completed);

-- ============================================================================
-- CONSTRAINTS DE VALIDAÇÃO
-- ============================================================================

-- Constraints para company_settings
ALTER TABLE company_settings ADD CONSTRAINT company_settings_email_format 
    CHECK (notification_email IS NULL OR notification_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Constraints para onboarding_progress
ALTER TABLE onboarding_progress ADD CONSTRAINT onboarding_progress_completed_check 
    CHECK (is_completed = false OR (is_completed = true AND completed_at IS NOT NULL));

COMMIT;
