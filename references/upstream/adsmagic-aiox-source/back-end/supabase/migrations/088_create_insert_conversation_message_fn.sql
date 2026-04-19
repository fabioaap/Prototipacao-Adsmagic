-- ============================================================================
-- Migration 088: Função insert_conversation_message
-- Insere mensagem na tabela conversation_messages via RPC, bypassando PostgREST
-- ============================================================================

CREATE OR REPLACE FUNCTION insert_conversation_message(
  p_project_id UUID,
  p_contact_id UUID,
  p_messaging_account_id UUID,
  p_direction TEXT,
  p_external_message_id TEXT DEFAULT NULL,
  p_broker_type TEXT DEFAULT 'uazapi',
  p_content_type TEXT DEFAULT 'text',
  p_content_text TEXT DEFAULT NULL,
  p_media_url TEXT DEFAULT NULL,
  p_caption TEXT DEFAULT NULL,
  p_mime_type TEXT DEFAULT NULL,
  p_file_name TEXT DEFAULT NULL,
  p_location_lat DOUBLE PRECISION DEFAULT NULL,
  p_location_lng DOUBLE PRECISION DEFAULT NULL,
  p_location_name TEXT DEFAULT NULL,
  p_status TEXT DEFAULT 'sent',
  p_quoted_message_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}',
  p_sent_at TIMESTAMPTZ DEFAULT NOW()
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO conversation_messages (
    project_id, contact_id, messaging_account_id, direction,
    external_message_id, broker_type, content_type, content_text,
    media_url, caption, mime_type, file_name,
    location_lat, location_lng, location_name,
    status, quoted_message_id, metadata, sent_at
  ) VALUES (
    p_project_id, p_contact_id, p_messaging_account_id, p_direction,
    p_external_message_id, p_broker_type, p_content_type, p_content_text,
    p_media_url, p_caption, p_mime_type, p_file_name,
    p_location_lat, p_location_lng, p_location_name,
    p_status, p_quoted_message_id, p_metadata, p_sent_at
  )
  ON CONFLICT (messaging_account_id, external_message_id)
    WHERE external_message_id IS NOT NULL
  DO NOTHING
  RETURNING id INTO v_id;

  RETURN v_id;  -- NULL quando dedup (DO NOTHING)
END;
$$;
