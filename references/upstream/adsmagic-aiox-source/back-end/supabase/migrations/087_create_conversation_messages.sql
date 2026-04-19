-- ============================================================================
-- Migration 087: Tabela conversation_messages
-- Persiste todas as mensagens trocadas entre contatos e a empresa
-- ============================================================================

CREATE TABLE conversation_messages (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id            UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  contact_id            UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  messaging_account_id  UUID NOT NULL REFERENCES messaging_accounts(id) ON DELETE SET NULL,

  -- Direção e identificação
  direction             TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  external_message_id   TEXT,
  broker_type           TEXT NOT NULL,

  -- Conteúdo (colunas flat para facilitar filtros e buscas)
  content_type          TEXT NOT NULL DEFAULT 'text'
                        CHECK (content_type IN ('text','image','video','audio','document','location','contact')),
  content_text          TEXT,
  media_url             TEXT,
  caption               TEXT,
  mime_type             TEXT,
  file_name             TEXT,
  location_lat          DOUBLE PRECISION,
  location_lng          DOUBLE PRECISION,
  location_name         TEXT,

  -- Status de entrega
  status                TEXT NOT NULL DEFAULT 'sent'
                        CHECK (status IN ('sent','delivered','read','failed')),

  -- Contexto de resposta
  quoted_message_id     UUID REFERENCES conversation_messages(id) ON DELETE SET NULL,
  metadata              JSONB DEFAULT '{}',

  -- Timestamps
  sent_at               TIMESTAMPTZ NOT NULL,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- Indexes
-- ============================================================================

-- Query principal: mensagens de um contato ordenadas por tempo (cursor pagination)
CREATE INDEX idx_conv_msgs_contact_sent
  ON conversation_messages(contact_id, sent_at DESC);

-- Isolamento por projeto (RLS)
CREATE INDEX idx_conv_msgs_project
  ON conversation_messages(project_id);

-- Atualização de status por ID externo do broker
CREATE INDEX idx_conv_msgs_external_id
  ON conversation_messages(external_message_id)
  WHERE external_message_id IS NOT NULL;

-- Deduplicação: evita inserir mesma mensagem do mesmo broker duas vezes
CREATE UNIQUE INDEX idx_conv_msgs_dedup
  ON conversation_messages(messaging_account_id, external_message_id)
  WHERE external_message_id IS NOT NULL;

-- ============================================================================
-- RLS Policies
-- ============================================================================

ALTER TABLE conversation_messages ENABLE ROW LEVEL SECURITY;

-- Leitura: membros do projeto podem ler mensagens
CREATE POLICY "Project members can read conversation messages"
  ON conversation_messages FOR SELECT
  USING (
    project_id IN (
      SELECT pu.project_id FROM project_users pu
      WHERE pu.user_id = auth.uid() AND pu.is_active = true
    )
  );

-- Inserção: membros do projeto podem inserir mensagens (envio via API)
CREATE POLICY "Project members can insert conversation messages"
  ON conversation_messages FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT pu.project_id FROM project_users pu
      WHERE pu.user_id = auth.uid() AND pu.is_active = true
    )
  );

-- Atualização: membros do projeto podem atualizar status de mensagens
CREATE POLICY "Project members can update conversation messages"
  ON conversation_messages FOR UPDATE
  USING (
    project_id IN (
      SELECT pu.project_id FROM project_users pu
      WHERE pu.user_id = auth.uid() AND pu.is_active = true
    )
  );

-- Nota: webhook handler usa SERVICE_ROLE_KEY que bypassa RLS automaticamente.

-- ============================================================================
-- Trigger updated_at
-- ============================================================================

CREATE TRIGGER update_conversation_messages_updated_at
  BEFORE UPDATE ON conversation_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
