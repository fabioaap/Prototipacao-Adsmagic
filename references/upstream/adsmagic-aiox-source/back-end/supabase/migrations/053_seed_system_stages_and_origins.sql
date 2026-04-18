-- Migration 053: Seed system stages and origins (Opção A)
-- Etapas e origens do sistema (project_id NULL) para listagem não vir vazia.
-- Referência: front-end/src/mocks/stages.ts e front-end/src/mocks/origins.ts

BEGIN;

-- ============================================================================
-- STAGES (etapas do sistema)
-- ============================================================================
INSERT INTO stages (
  id,
  project_id,
  name,
  display_order,
  color,
  tracking_phrase,
  type,
  is_active,
  event_config,
  created_at
) VALUES
  (
    'a0000000-0000-4000-8000-000000000001',
    NULL,
    'Contato Iniciado',
    0,
    NULL,
    'oi',
    'normal',
    true,
    NULL,
    NOW()
  ),
  (
    'a0000000-0000-4000-8000-000000000002',
    NULL,
    'Qualificação',
    1,
    NULL,
    'quero saber mais',
    'normal',
    true,
    '{"meta":{"eventType":"Lead","active":true},"google":{"eventType":"generate_lead","active":true},"tiktok":{"eventType":"CompleteRegistration","active":false}}'::jsonb,
    NOW()
  ),
  (
    'a0000000-0000-4000-8000-000000000003',
    NULL,
    'Proposta Enviada',
    2,
    NULL,
    'enviei a proposta',
    'normal',
    true,
    '{"meta":{"eventType":"InitiateCheckout","active":true},"google":{"eventType":"begin_checkout","active":true}}'::jsonb,
    NOW()
  ),
  (
    'a0000000-0000-4000-8000-000000000004',
    NULL,
    'Venda Realizada',
    3,
    NULL,
    'fechou',
    'sale',
    true,
    '{"meta":{"eventType":"Purchase","active":true},"google":{"eventType":"purchase","active":true}}'::jsonb,
    NOW()
  ),
  (
    'a0000000-0000-4000-8000-000000000005',
    NULL,
    'Perdida',
    4,
    NULL,
    NULL,
    'lost',
    true,
    NULL,
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- ORIGINS (origens do sistema)
-- ============================================================================
INSERT INTO origins (
  id,
  project_id,
  name,
  type,
  color,
  icon,
  is_active,
  created_at
) VALUES
  ('b0000000-0000-4000-8000-000000000001', NULL, 'Google Ads', 'system', '#4285F4', NULL, true, NOW()),
  ('b0000000-0000-4000-8000-000000000002', NULL, 'Meta Ads', 'system', '#E4405F', NULL, true, NOW()),
  ('b0000000-0000-4000-8000-000000000003', NULL, 'Instagram', 'system', '#C13584', NULL, true, NOW()),
  ('b0000000-0000-4000-8000-000000000004', NULL, 'TikTok Ads', 'system', '#FE2C55', NULL, true, NOW()),
  ('b0000000-0000-4000-8000-000000000005', NULL, 'WhatsApp', 'system', '#25D366', NULL, true, NOW()),
  ('b0000000-0000-4000-8000-000000000006', NULL, 'Indicação', 'system', '#10B981', NULL, true, NOW()),
  ('b0000000-0000-4000-8000-000000000007', NULL, 'Organic', 'system', '#8B5CF6', NULL, true, NOW()),
  ('b0000000-0000-4000-8000-000000000008', NULL, 'Direct', 'system', '#1F2937', NULL, true, NOW()),
  ('b0000000-0000-4000-8000-000000000009', NULL, 'Outros', 'system', '#6B7280', NULL, true, NOW())
ON CONFLICT (id) DO NOTHING;

COMMIT;
