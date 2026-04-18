-- Migration 010: Test Seeds
-- Data: 2025-01-27
-- Descrição: Criar dados de teste para desenvolvimento e validação
-- IMPORTANTE: Seeds devem ser facilmente removíveis

BEGIN;

-- ============================================================================
-- DADOS DE TESTE - EMPRESAS
-- ============================================================================

-- Empresa 1: Tech Startup
INSERT INTO companies (
    id,
    name,
    description,
    logo_url,
    website,
    industry,
    size,
    country,
    timezone,
    currency
) VALUES (
    '550e8400-e29b-41d4-a716-446655440001',
    'TechCorp Brasil',
    'Startup de tecnologia focada em soluções inovadoras',
    'https://example.com/logos/techcorp.png',
    'https://techcorp.com.br',
    'Technology',
    'startup',
    'BR',
    'America/Sao_Paulo',
    'BRL'
);

-- Empresa 2: E-commerce
INSERT INTO companies (
    id,
    name,
    description,
    logo_url,
    website,
    industry,
    size,
    country,
    timezone,
    currency
) VALUES (
    '550e8400-e29b-41d4-a716-446655440002',
    'MegaStore E-commerce',
    'Plataforma de e-commerce com múltiplas categorias',
    'https://example.com/logos/megastore.png',
    'https://megastore.com.br',
    'E-commerce',
    'medium',
    'BR',
    'America/Sao_Paulo',
    'BRL'
);

-- ============================================================================
-- DADOS DE TESTE - USUÁRIOS (Mock auth.users)
-- ============================================================================

-- Usuário 1: CEO da TechCorp
INSERT INTO user_profiles (
    id,
    first_name,
    last_name,
    preferred_language,
    timezone,
    avatar_url,
    phone,
    is_active
) VALUES (
    '550e8400-e29b-41d4-a716-446655440011',
    'João',
    'Silva',
    'pt',
    'America/Sao_Paulo',
    'https://example.com/avatars/joao.png',
    '+5511999999999',
    true
);

-- Usuário 2: CTO da TechCorp
INSERT INTO user_profiles (
    id,
    first_name,
    last_name,
    preferred_language,
    timezone,
    avatar_url,
    phone,
    is_active
) VALUES (
    '550e8400-e29b-41d4-a716-446655440012',
    'Maria',
    'Santos',
    'pt',
    'America/Sao_Paulo',
    'https://example.com/avatars/maria.png',
    '+5511888888888',
    true
);

-- Usuário 3: CEO da MegaStore
INSERT INTO user_profiles (
    id,
    first_name,
    last_name,
    preferred_language,
    timezone,
    avatar_url,
    phone,
    is_active
) VALUES (
    '550e8400-e29b-41d4-a716-446655440013',
    'Carlos',
    'Oliveira',
    'pt',
    'America/Sao_Paulo',
    'https://example.com/avatars/carlos.png',
    '+5511777777777',
    true
);

-- Usuário 4: Manager da MegaStore
INSERT INTO user_profiles (
    id,
    first_name,
    last_name,
    preferred_language,
    timezone,
    avatar_url,
    phone,
    is_active
) VALUES (
    '550e8400-e29b-41d4-a716-446655440014',
    'Ana',
    'Costa',
    'pt',
    'America/Sao_Paulo',
    'https://example.com/avatars/ana.png',
    '+5511666666666',
    true
);

-- Usuário 5: Developer da TechCorp
INSERT INTO user_profiles (
    id,
    first_name,
    last_name,
    preferred_language,
    timezone,
    avatar_url,
    phone,
    is_active
) VALUES (
    '550e8400-e29b-41d4-a716-446655440015',
    'Pedro',
    'Ferreira',
    'pt',
    'America/Sao_Paulo',
    'https://example.com/avatars/pedro.png',
    '+5511555555555',
    true
);

-- ============================================================================
-- DADOS DE TESTE - COMPANY_USERS
-- ============================================================================

-- TechCorp: João como Owner
INSERT INTO company_users (
    id,
    company_id,
    user_id,
    role,
    permissions,
    is_active,
    accepted_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440021',
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440011',
    'owner',
    '{"can_manage_users": true, "can_manage_projects": true, "can_view_analytics": true}',
    true,
    NOW()
);

-- TechCorp: Maria como Admin
INSERT INTO company_users (
    id,
    company_id,
    user_id,
    role,
    permissions,
    is_active,
    invited_by,
    invited_at,
    accepted_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440022',
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440012',
    'admin',
    '{"can_manage_users": true, "can_manage_projects": true, "can_view_analytics": true}',
    true,
    '550e8400-e29b-41d4-a716-446655440011',
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '1 day'
);

-- TechCorp: Pedro como Member
INSERT INTO company_users (
    id,
    company_id,
    user_id,
    role,
    permissions,
    is_active,
    invited_by,
    invited_at,
    accepted_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440023',
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440015',
    'member',
    '{"can_view_analytics": true}',
    true,
    '550e8400-e29b-41d4-a716-446655440012',
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '3 days'
);

-- MegaStore: Carlos como Owner
INSERT INTO company_users (
    id,
    company_id,
    user_id,
    role,
    permissions,
    is_active,
    accepted_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440024',
    '550e8400-e29b-41d4-a716-446655440002',
    '550e8400-e29b-41d4-a716-446655440013',
    'owner',
    '{"can_manage_users": true, "can_manage_projects": true, "can_view_analytics": true}',
    true,
    NOW()
);

-- MegaStore: Ana como Manager
INSERT INTO company_users (
    id,
    company_id,
    user_id,
    role,
    permissions,
    is_active,
    invited_by,
    invited_at,
    accepted_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440025',
    '550e8400-e29b-41d4-a716-446655440002',
    '550e8400-e29b-41d4-a716-446655440014',
    'manager',
    '{"can_manage_projects": true, "can_view_analytics": true}',
    true,
    '550e8400-e29b-41d4-a716-446655440013',
    NOW() - INTERVAL '7 days',
    NOW() - INTERVAL '5 days'
);

-- ============================================================================
-- DADOS DE TESTE - PROJECTS
-- ============================================================================

-- Projeto 1: TechCorp - App Mobile
INSERT INTO projects (
    id,
    company_id,
    created_by,
    name,
    description,
    company_type,
    franchise_count,
    country,
    language,
    currency,
    timezone,
    attribution_model,
    whatsapp_connected,
    meta_ads_connected,
    google_ads_connected,
    tiktok_ads_connected,
    status
) VALUES (
    '550e8400-e29b-41d4-a716-446655440031',
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440011',
    'TechCorp Mobile App',
    'Aplicativo mobile para gestão de clientes',
    'individual',
    NULL,
    'BR',
    'pt',
    'BRL',
    'America/Sao_Paulo',
    'first_touch',
    true,
    true,
    false,
    false,
    'active'
);

-- Projeto 2: MegaStore - E-commerce Platform
INSERT INTO projects (
    id,
    company_id,
    created_by,
    name,
    description,
    company_type,
    franchise_count,
    country,
    language,
    currency,
    timezone,
    attribution_model,
    whatsapp_connected,
    meta_ads_connected,
    google_ads_connected,
    tiktok_ads_connected,
    status
) VALUES (
    '550e8400-e29b-41d4-a716-446655440032',
    '550e8400-e29b-41d4-a716-446655440002',
    '550e8400-e29b-41d4-a716-446655440013',
    'MegaStore Platform',
    'Plataforma completa de e-commerce',
    'corporate',
    NULL,
    'BR',
    'pt',
    'BRL',
    'America/Sao_Paulo',
    'conversion',
    true,
    true,
    true,
    true,
    'active'
);

-- ============================================================================
-- DADOS DE TESTE - PROJECT_USERS
-- ============================================================================

-- TechCorp Mobile App: João como Owner
INSERT INTO project_users (
    id,
    project_id,
    user_id,
    role,
    permissions,
    is_active,
    accepted_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440041',
    '550e8400-e29b-41d4-a716-446655440031',
    '550e8400-e29b-41d4-a716-446655440011',
    'owner',
    '{"can_manage_users": true, "can_manage_data": true, "can_view_analytics": true}',
    true,
    NOW()
);

-- TechCorp Mobile App: Maria como Admin
INSERT INTO project_users (
    id,
    project_id,
    user_id,
    role,
    permissions,
    is_active,
    invited_by,
    invited_at,
    accepted_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440042',
    '550e8400-e29b-41d4-a716-446655440031',
    '550e8400-e29b-41d4-a716-446655440012',
    'admin',
    '{"can_manage_users": true, "can_manage_data": true, "can_view_analytics": true}',
    true,
    '550e8400-e29b-41d4-a716-446655440011',
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '12 hours'
);

-- TechCorp Mobile App: Pedro como Member
INSERT INTO project_users (
    id,
    project_id,
    user_id,
    role,
    permissions,
    is_active,
    invited_by,
    invited_at,
    accepted_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440043',
    '550e8400-e29b-41d4-a716-446655440031',
    '550e8400-e29b-41d4-a716-446655440015',
    'member',
    '{"can_view_analytics": true}',
    true,
    '550e8400-e29b-41d4-a716-446655440012',
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '1 day'
);

-- MegaStore Platform: Carlos como Owner
INSERT INTO project_users (
    id,
    project_id,
    user_id,
    role,
    permissions,
    is_active,
    accepted_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440044',
    '550e8400-e29b-41d4-a716-446655440032',
    '550e8400-e29b-41d4-a716-446655440013',
    'owner',
    '{"can_manage_users": true, "can_manage_data": true, "can_view_analytics": true}',
    true,
    NOW()
);

-- MegaStore Platform: Ana como Manager
INSERT INTO project_users (
    id,
    project_id,
    user_id,
    role,
    permissions,
    is_active,
    invited_by,
    invited_at,
    accepted_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440045',
    '550e8400-e29b-41d4-a716-446655440032',
    '550e8400-e29b-41d4-a716-446655440014',
    'manager',
    '{"can_manage_data": true, "can_view_analytics": true}',
    true,
    '550e8400-e29b-41d4-a716-446655440013',
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '2 days'
);

-- ============================================================================
-- DADOS DE TESTE - ONBOARDING_PROGRESS
-- ============================================================================

-- João: Onboarding completo
INSERT INTO onboarding_progress (
    id,
    user_id,
    company_id,
    company_setup,
    first_project_created,
    integrations_connected,
    first_contact_added,
    onboarding_data,
    is_completed,
    completed_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440051',
    '550e8400-e29b-41d4-a716-446655440011',
    '550e8400-e29b-41d4-a716-446655440001',
    true,
    true,
    true,
    true,
    '{"completed_steps": ["company_setup", "first_project", "integrations", "first_contact"], "completion_date": "2025-01-25"}',
    true,
    NOW() - INTERVAL '2 days'
);

-- Maria: Onboarding em progresso
INSERT INTO onboarding_progress (
    id,
    user_id,
    company_id,
    company_setup,
    first_project_created,
    integrations_connected,
    first_contact_added,
    onboarding_data,
    is_completed,
    completed_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440052',
    '550e8400-e29b-41d4-a716-446655440012',
    '550e8400-e29b-41d4-a716-446655440001',
    true,
    true,
    false,
    false,
    '{"completed_steps": ["company_setup", "first_project"], "current_step": "integrations"}',
    false,
    NULL
);

-- Carlos: Onboarding completo
INSERT INTO onboarding_progress (
    id,
    user_id,
    company_id,
    company_setup,
    first_project_created,
    integrations_connected,
    first_contact_added,
    onboarding_data,
    is_completed,
    completed_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440053',
    '550e8400-e29b-41d4-a716-446655440013',
    '550e8400-e29b-41d4-a716-446655440002',
    true,
    true,
    true,
    true,
    '{"completed_steps": ["company_setup", "first_project", "integrations", "first_contact"], "completion_date": "2025-01-24"}',
    true,
    NOW() - INTERVAL '3 days'
);

-- Ana: Onboarding parcial
INSERT INTO onboarding_progress (
    id,
    user_id,
    company_id,
    company_setup,
    first_project_created,
    integrations_connected,
    first_contact_added,
    onboarding_data,
    is_completed,
    completed_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440054',
    '550e8400-e29b-41d4-a716-446655440014',
    '550e8400-e29b-41d4-a716-446655440002',
    true,
    false,
    false,
    false,
    '{"completed_steps": ["company_setup"], "current_step": "first_project"}',
    false,
    NULL
);

-- Pedro: Onboarding não iniciado
INSERT INTO onboarding_progress (
    id,
    user_id,
    company_id,
    company_setup,
    first_project_created,
    integrations_connected,
    first_contact_added,
    onboarding_data,
    is_completed,
    completed_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440055',
    '550e8400-e29b-41d4-a716-446655440015',
    '550e8400-e29b-41d4-a716-446655440001',
    false,
    false,
    false,
    false,
    '{"completed_steps": [], "current_step": "company_setup"}',
    false,
    NULL
);

COMMIT;
