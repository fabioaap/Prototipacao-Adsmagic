-- Migration 076: Add notification columns to projects
-- Data: 2026-03-05
-- Descrição: Move configurações de notificação de company_settings para projects,
--            permitindo configuração por projeto.

BEGIN;

-- Adicionar colunas de notificação à tabela projects
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS notifications_enabled BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE projects
ADD COLUMN IF NOT EXISTS notification_email VARCHAR(255) DEFAULT NULL;

ALTER TABLE projects
ADD COLUMN IF NOT EXISTS digest_frequency VARCHAR(20) NOT NULL DEFAULT 'weekly'
  CHECK (digest_frequency IN ('daily', 'weekly', 'monthly', 'never'));

ALTER TABLE projects
ADD COLUMN IF NOT EXISTS digest_time TIME NOT NULL DEFAULT '09:00:00';

-- Copiar valores existentes de company_settings para os projetos correspondentes
UPDATE projects p
SET
  notifications_enabled = COALESCE(cs.notifications_enabled, true),
  notification_email = cs.notification_email,
  digest_frequency = COALESCE(cs.digest_frequency, 'weekly'),
  digest_time = COALESCE(cs.digest_time, '09:00:00')
FROM company_settings cs
WHERE cs.company_id = p.company_id;

-- Comentários descritivos
COMMENT ON COLUMN projects.notifications_enabled IS 'Se notificações estão habilitadas para este projeto';
COMMENT ON COLUMN projects.notification_email IS 'Email para receber notificações deste projeto';
COMMENT ON COLUMN projects.digest_frequency IS 'Frequência do digest de notificações (daily, weekly, monthly, never)';
COMMENT ON COLUMN projects.digest_time IS 'Horário de envio do digest (HH:MM:SS)';

COMMIT;
