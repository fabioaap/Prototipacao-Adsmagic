-- Migration: Tabela de tokens para compartilhamento de QR Code do WhatsApp
-- Permite que usuários gerem links compartilháveis para que terceiros escaneiem o QR Code

CREATE TABLE whatsapp_share_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  token VARCHAR(64) NOT NULL UNIQUE,
  messaging_account_id UUID NOT NULL REFERENCES messaging_accounts(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  qr_code TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'connected', 'revoked')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_whatsapp_share_tokens_token ON whatsapp_share_tokens(token);
CREATE INDEX idx_whatsapp_share_tokens_expires ON whatsapp_share_tokens(expires_at);
CREATE INDEX idx_whatsapp_share_tokens_account ON whatsapp_share_tokens(messaging_account_id);

-- Updated_at trigger
CREATE TRIGGER update_whatsapp_share_tokens_updated_at
  BEFORE UPDATE ON whatsapp_share_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE whatsapp_share_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY whatsapp_share_tokens_select ON whatsapp_share_tokens
  FOR SELECT USING (
    project_id IN (
      SELECT project_id FROM project_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY whatsapp_share_tokens_insert ON whatsapp_share_tokens
  FOR INSERT WITH CHECK (
    created_by = auth.uid() AND
    project_id IN (
      SELECT project_id FROM project_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY whatsapp_share_tokens_update ON whatsapp_share_tokens
  FOR UPDATE USING (
    project_id IN (
      SELECT project_id FROM project_users WHERE user_id = auth.uid()
    )
  );
