/**
 * Backend API types for conversation messages (snake_case contracts)
 *
 * @module types/api/conversations.api
 */

export interface BackendConversationMessage {
  id: string
  project_id: string
  contact_id: string
  messaging_account_id: string
  direction: 'inbound' | 'outbound'
  external_message_id: string | null
  broker_type: string
  content_type: 'text' | 'image' | 'video' | 'audio' | 'document' | 'location' | 'contact'
  content_text: string | null
  media_url: string | null
  caption: string | null
  mime_type: string | null
  file_name: string | null
  location_lat: number | null
  location_lng: number | null
  location_name: string | null
  status: 'sent' | 'delivered' | 'read' | 'failed'
  quoted_message_id: string | null
  metadata: Record<string, unknown>
  sent_at: string
  created_at: string
  updated_at: string
}

export interface BackendConversationResponse {
  messages: BackendConversationMessage[]
  has_more: boolean
  next_cursor: string | null
}
