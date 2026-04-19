export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      companies: {
        Row: {
          country: string
          created_at: string | null
          currency: string
          description: string | null
          id: string
          industry: string | null
          is_active: boolean | null
          logo_url: string | null
          name: string
          size: string | null
          timezone: string
          updated_at: string | null
          website: string | null
        }
        Insert: {
          country: string
          created_at?: string | null
          currency?: string
          description?: string | null
          id?: string
          industry?: string | null
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          size?: string | null
          timezone?: string
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          country?: string
          created_at?: string | null
          currency?: string
          description?: string | null
          id?: string
          industry?: string | null
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          size?: string | null
          timezone?: string
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      company_settings: {
        Row: {
          auto_track_events: boolean | null
          company_id: string
          created_at: string | null
          date_format: string | null
          decimal_separator: string | null
          default_attribution_model: string | null
          digest_frequency: string | null
          digest_time: string | null
          id: string
          include_company_info: boolean | null
          include_contact_info: boolean | null
          language: string | null
          notification_email: string | null
          notifications_enabled: boolean | null
          report_timezone: string | null
          theme: string | null
          thousands_separator: string | null
          time_format: string | null
          timezone: string | null
          updated_at: string | null
        }
        Insert: {
          auto_track_events?: boolean | null
          company_id: string
          created_at?: string | null
          date_format?: string | null
          decimal_separator?: string | null
          default_attribution_model?: string | null
          digest_frequency?: string | null
          digest_time?: string | null
          id?: string
          include_company_info?: boolean | null
          include_contact_info?: boolean | null
          language?: string | null
          notification_email?: string | null
          notifications_enabled?: boolean | null
          report_timezone?: string | null
          theme?: string | null
          thousands_separator?: string | null
          time_format?: string | null
          timezone?: string | null
          updated_at?: string | null
        }
        Update: {
          auto_track_events?: boolean | null
          company_id?: string
          created_at?: string | null
          date_format?: string | null
          decimal_separator?: string | null
          default_attribution_model?: string | null
          digest_frequency?: string | null
          digest_time?: string | null
          id?: string
          include_company_info?: boolean | null
          include_contact_info?: boolean | null
          language?: string | null
          notification_email?: string | null
          notifications_enabled?: boolean | null
          report_timezone?: string | null
          theme?: string | null
          thousands_separator?: string | null
          time_format?: string | null
          timezone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_settings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      company_users: {
        Row: {
          accepted_at: string | null
          company_id: string
          created_at: string | null
          id: string
          invited_at: string | null
          invited_by: string | null
          is_active: boolean | null
          permissions: Json | null
          role: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          accepted_at?: string | null
          company_id: string
          created_at?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          is_active?: boolean | null
          permissions?: Json | null
          role: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          accepted_at?: string | null
          company_id?: string
          created_at?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          is_active?: boolean | null
          permissions?: Json | null
          role?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_users_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_origins: {
        Row: {
          acquired_at: string | null
          ad_id: string | null
          adgroup_id: string | null
          campaign_id: string | null
          contact_id: string
          created_at: string | null
          id: string
          observations: string | null
          origin_id: string
          source_app: string | null
          source_data: Json | null
        }
        Insert: {
          acquired_at?: string | null
          ad_id?: string | null
          adgroup_id?: string | null
          campaign_id?: string | null
          contact_id: string
          created_at?: string | null
          id?: string
          observations?: string | null
          origin_id: string
          source_app?: string | null
          source_data?: Json | null
        }
        Update: {
          acquired_at?: string | null
          ad_id?: string | null
          adgroup_id?: string | null
          campaign_id?: string | null
          contact_id?: string
          created_at?: string | null
          id?: string
          observations?: string | null
          origin_id?: string
          source_app?: string | null
          source_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "contact_origins_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_origins_origin_id_fkey"
            columns: ["origin_id"]
            isOneToOne: false
            referencedRelation: "origins"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_stage_history: {
        Row: {
          contact_id: string
          created_at: string | null
          id: string
          moved_at: string | null
          moved_by: string | null
          observations: string | null
          stage_id: string
        }
        Insert: {
          contact_id: string
          created_at?: string | null
          id?: string
          moved_at?: string | null
          moved_by?: string | null
          observations?: string | null
          stage_id: string
        }
        Update: {
          contact_id?: string
          created_at?: string | null
          id?: string
          moved_at?: string | null
          moved_by?: string | null
          observations?: string | null
          stage_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_stage_history_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_stage_history_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "stages"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          avatar_url: string | null
          canonical_identifier: string | null
          company: string | null
          country_code: string | null
          created_at: string | null
          current_stage_id: string
          email: string | null
          id: string
          is_favorite: boolean | null
          jid: string | null
          lid: string | null
          location: string | null
          main_origin_id: string
          metadata: Json | null
          name: string
          notes: string | null
          phone: string | null
          project_id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          canonical_identifier?: string | null
          company?: string | null
          country_code?: string | null
          created_at?: string | null
          current_stage_id: string
          email?: string | null
          id?: string
          is_favorite?: boolean | null
          jid?: string | null
          lid?: string | null
          location?: string | null
          main_origin_id: string
          metadata?: Json | null
          name: string
          notes?: string | null
          phone?: string | null
          project_id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          canonical_identifier?: string | null
          company?: string | null
          country_code?: string | null
          created_at?: string | null
          current_stage_id?: string
          email?: string | null
          id?: string
          is_favorite?: boolean | null
          jid?: string | null
          lid?: string | null
          location?: string | null
          main_origin_id?: string
          metadata?: Json | null
          name?: string
          notes?: string | null
          phone?: string | null
          project_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_current_stage_id_fkey"
            columns: ["current_stage_id"]
            isOneToOne: false
            referencedRelation: "stages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_main_origin_id_fkey"
            columns: ["main_origin_id"]
            isOneToOne: false
            referencedRelation: "origins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      conversion_events: {
        Row: {
          contact_id: string | null
          created_at: string | null
          error_message: string | null
          event_type: string
          id: string
          job_id: string | null
          last_retry_at: string | null
          max_retries: number
          payload: Json
          platform: string
          processed_at: string | null
          project_id: string
          response: Json | null
          retry_count: number
          sale_id: string | null
          sent_at: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          contact_id?: string | null
          created_at?: string | null
          error_message?: string | null
          event_type: string
          id?: string
          job_id?: string | null
          last_retry_at?: string | null
          max_retries?: number
          payload?: Json
          platform: string
          processed_at?: string | null
          project_id: string
          response?: Json | null
          retry_count?: number
          sale_id?: string | null
          sent_at?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          contact_id?: string | null
          created_at?: string | null
          error_message?: string | null
          event_type?: string
          id?: string
          job_id?: string | null
          last_retry_at?: string | null
          max_retries?: number
          payload?: Json
          platform?: string
          processed_at?: string | null
          project_id?: string
          response?: Json | null
          retry_count?: number
          sale_id?: string | null
          sent_at?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversion_events_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversion_events_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversion_events_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversion_events_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_accounts: {
        Row: {
          access_token: string | null
          account_metadata: Json | null
          account_name: string
          created_at: string | null
          error_message: string | null
          external_account_id: string
          external_account_name: string
          external_email: string | null
          id: string
          integration_id: string
          is_primary: boolean | null
          last_sync_at: string | null
          permissions: Json | null
          pixel_id: string | null
          project_id: string
          refresh_token: string | null
          status: string
          sync_status: string | null
          token_expires_at: string | null
          updated_at: string | null
        }
        Insert: {
          access_token?: string | null
          account_metadata?: Json | null
          account_name: string
          created_at?: string | null
          error_message?: string | null
          external_account_id: string
          external_account_name: string
          external_email?: string | null
          id?: string
          integration_id: string
          is_primary?: boolean | null
          last_sync_at?: string | null
          permissions?: Json | null
          pixel_id?: string | null
          project_id: string
          refresh_token?: string | null
          status?: string
          sync_status?: string | null
          token_expires_at?: string | null
          updated_at?: string | null
        }
        Update: {
          access_token?: string | null
          account_metadata?: Json | null
          account_name?: string
          created_at?: string | null
          error_message?: string | null
          external_account_id?: string
          external_account_name?: string
          external_email?: string | null
          id?: string
          integration_id?: string
          is_primary?: boolean | null
          last_sync_at?: string | null
          permissions?: Json | null
          pixel_id?: string | null
          project_id?: string
          refresh_token?: string | null
          status?: string
          sync_status?: string | null
          token_expires_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "integration_accounts_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "integrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "integration_accounts_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      integrations: {
        Row: {
          created_at: string | null
          error_message: string | null
          id: string
          last_sync_at: string | null
          platform: string
          platform_config: Json | null
          platform_type: string
          project_id: string
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          last_sync_at?: string | null
          platform: string
          platform_config?: Json | null
          platform_type: string
          project_id: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          last_sync_at?: string | null
          platform?: string
          platform_config?: Json | null
          platform_type?: string
          project_id?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "integrations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          completed_at: string | null
          created_at: string | null
          error_message: string | null
          error_stack: string | null
          id: string
          job_type: string
          last_retry_at: string | null
          locked_at: string | null
          locked_by: string | null
          max_retries: number
          payload: Json
          priority: number | null
          project_id: string
          queue_name: string
          result: Json | null
          retry_after: string | null
          retry_count: number
          scheduled_at: string | null
          started_at: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          error_stack?: string | null
          id?: string
          job_type: string
          last_retry_at?: string | null
          locked_at?: string | null
          locked_by?: string | null
          max_retries?: number
          payload?: Json
          priority?: number | null
          project_id: string
          queue_name: string
          result?: Json | null
          retry_after?: string | null
          retry_count?: number
          scheduled_at?: string | null
          started_at?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          error_stack?: string | null
          id?: string
          job_type?: string
          last_retry_at?: string | null
          locked_at?: string | null
          locked_by?: string | null
          max_retries?: number
          payload?: Json
          priority?: number | null
          project_id?: string
          queue_name?: string
          result?: Json | null
          retry_after?: string | null
          retry_count?: number
          scheduled_at?: string | null
          started_at?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jobs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      messaging_accounts: {
        Row: {
          access_token: string | null
          account_display_name: string | null
          account_identifier: string
          account_name: string
          api_key: string | null
          broker_config: Json | null
          broker_type: string
          created_at: string | null
          id: string
          integration_account_id: string | null
          is_primary: boolean | null
          last_message_at: string | null
          last_webhook_at: string | null
          platform: string
          platform_config: Json | null
          project_id: string
          refresh_token: string | null
          status: string | null
          token_expires_at: string | null
          total_contacts: number | null
          total_messages: number | null
          updated_at: string | null
          webhook_secret: string | null
          webhook_url: string | null
        }
        Insert: {
          access_token?: string | null
          account_display_name?: string | null
          account_identifier: string
          account_name: string
          api_key?: string | null
          broker_config?: Json | null
          broker_type: string
          created_at?: string | null
          id?: string
          integration_account_id?: string | null
          is_primary?: boolean | null
          last_message_at?: string | null
          last_webhook_at?: string | null
          platform: string
          platform_config?: Json | null
          project_id: string
          refresh_token?: string | null
          status?: string | null
          token_expires_at?: string | null
          total_contacts?: number | null
          total_messages?: number | null
          updated_at?: string | null
          webhook_secret?: string | null
          webhook_url?: string | null
        }
        Update: {
          access_token?: string | null
          account_display_name?: string | null
          account_identifier?: string
          account_name?: string
          api_key?: string | null
          broker_config?: Json | null
          broker_type?: string
          created_at?: string | null
          id?: string
          integration_account_id?: string | null
          is_primary?: boolean | null
          last_message_at?: string | null
          last_webhook_at?: string | null
          platform?: string
          platform_config?: Json | null
          project_id?: string
          refresh_token?: string | null
          status?: string | null
          token_expires_at?: string | null
          total_contacts?: number | null
          total_messages?: number | null
          updated_at?: string | null
          webhook_secret?: string | null
          webhook_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messaging_accounts_integration_account_id_fkey"
            columns: ["integration_account_id"]
            isOneToOne: false
            referencedRelation: "integration_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messaging_accounts_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      messaging_brokers: {
        Row: {
          admin_token: string | null
          admin_token_encrypted: boolean | null
          api_base_url: string | null
          auth_type: string | null
          broker_type: string
          created_at: string | null
          description: string | null
          display_name: string
          documentation_url: string | null
          id: string
          is_active: boolean | null
          max_connections: number | null
          name: string
          optional_fields: Json | null
          platform: string
          required_fields: Json | null
          support_url: string | null
          supports_automation: boolean | null
          supports_media: boolean | null
          supports_templates: boolean | null
          supports_webhooks: boolean | null
          updated_at: string | null
          version: string | null
          webhook_endpoint: string | null
        }
        Insert: {
          admin_token?: string | null
          admin_token_encrypted?: boolean | null
          api_base_url?: string | null
          auth_type?: string | null
          broker_type: string
          created_at?: string | null
          description?: string | null
          display_name: string
          documentation_url?: string | null
          id?: string
          is_active?: boolean | null
          max_connections?: number | null
          name: string
          optional_fields?: Json | null
          platform: string
          required_fields?: Json | null
          support_url?: string | null
          supports_automation?: boolean | null
          supports_media?: boolean | null
          supports_templates?: boolean | null
          supports_webhooks?: boolean | null
          updated_at?: string | null
          version?: string | null
          webhook_endpoint?: string | null
        }
        Update: {
          admin_token?: string | null
          admin_token_encrypted?: boolean | null
          api_base_url?: string | null
          auth_type?: string | null
          broker_type?: string
          created_at?: string | null
          description?: string | null
          display_name?: string
          documentation_url?: string | null
          id?: string
          is_active?: boolean | null
          max_connections?: number | null
          name?: string
          optional_fields?: Json | null
          platform?: string
          required_fields?: Json | null
          support_url?: string | null
          supports_automation?: boolean | null
          supports_media?: boolean | null
          supports_templates?: boolean | null
          supports_webhooks?: boolean | null
          updated_at?: string | null
          version?: string | null
          webhook_endpoint?: string | null
        }
        Relationships: []
      }
      messaging_webhooks: {
        Row: {
          created_at: string | null
          error_count: number | null
          events: string[] | null
          id: string
          last_error: string | null
          last_triggered_at: string | null
          max_retries: number | null
          messaging_account_id: string
          project_id: string
          retry_count: number | null
          retry_delay: number | null
          status: string | null
          total_events: number | null
          updated_at: string | null
          webhook_secret: string | null
          webhook_url: string
        }
        Insert: {
          created_at?: string | null
          error_count?: number | null
          events?: string[] | null
          id?: string
          last_error?: string | null
          last_triggered_at?: string | null
          max_retries?: number | null
          messaging_account_id: string
          project_id: string
          retry_count?: number | null
          retry_delay?: number | null
          status?: string | null
          total_events?: number | null
          updated_at?: string | null
          webhook_secret?: string | null
          webhook_url: string
        }
        Update: {
          created_at?: string | null
          error_count?: number | null
          events?: string[] | null
          id?: string
          last_error?: string | null
          last_triggered_at?: string | null
          max_retries?: number | null
          messaging_account_id?: string
          project_id?: string
          retry_count?: number | null
          retry_delay?: number | null
          status?: string | null
          total_events?: number | null
          updated_at?: string | null
          webhook_secret?: string | null
          webhook_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "messaging_webhooks_messaging_account_id_fkey"
            columns: ["messaging_account_id"]
            isOneToOne: false
            referencedRelation: "messaging_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messaging_webhooks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_progress: {
        Row: {
          company_id: string | null
          company_setup: boolean | null
          completed_at: string | null
          created_at: string | null
          first_contact_added: boolean | null
          first_project_created: boolean | null
          id: string
          integrations_connected: boolean | null
          is_completed: boolean | null
          onboarding_data: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          company_id?: string | null
          company_setup?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          first_contact_added?: boolean | null
          first_project_created?: boolean | null
          id?: string
          integrations_connected?: boolean | null
          is_completed?: boolean | null
          onboarding_data?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          company_id?: string | null
          company_setup?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          first_contact_added?: boolean | null
          first_project_created?: boolean | null
          id?: string
          integrations_connected?: boolean | null
          is_completed?: boolean | null
          onboarding_data?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_progress_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      origins: {
        Row: {
          color: string
          created_at: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          project_id: string | null
          type: string
        }
        Insert: {
          color: string
          created_at?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          project_id?: string | null
          type: string
        }
        Update: {
          color?: string
          created_at?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          project_id?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "origins_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_users: {
        Row: {
          accepted_at: string | null
          created_at: string | null
          id: string
          invited_at: string | null
          invited_by: string | null
          is_active: boolean | null
          permissions: Json | null
          project_id: string
          role: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          is_active?: boolean | null
          permissions?: Json | null
          project_id: string
          role: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          is_active?: boolean | null
          permissions?: Json | null
          project_id?: string
          role?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_users_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          attribution_model: string
          company_id: string
          company_type: string
          country: string
          created_at: string | null
          created_by: string
          currency: string
          description: string | null
          franchise_count: number | null
          google_ads_connected: boolean | null
          id: string
          language: string
          meta_ads_connected: boolean | null
          name: string
          status: string | null
          tiktok_ads_connected: boolean | null
          timezone: string
          updated_at: string | null
          whatsapp_connected: boolean | null
          wizard_completed_at: string | null
          wizard_current_step: number | null
          wizard_progress: Json | null
        }
        Insert: {
          attribution_model?: string
          company_id: string
          company_type: string
          country: string
          created_at?: string | null
          created_by: string
          currency?: string
          description?: string | null
          franchise_count?: number | null
          google_ads_connected?: boolean | null
          id?: string
          language?: string
          meta_ads_connected?: boolean | null
          name: string
          status?: string | null
          tiktok_ads_connected?: boolean | null
          timezone?: string
          updated_at?: string | null
          whatsapp_connected?: boolean | null
          wizard_completed_at?: string | null
          wizard_current_step?: number | null
          wizard_progress?: Json | null
        }
        Update: {
          attribution_model?: string
          company_id?: string
          company_type?: string
          country?: string
          created_at?: string | null
          created_by?: string
          currency?: string
          description?: string | null
          franchise_count?: number | null
          google_ads_connected?: boolean | null
          id?: string
          language?: string
          meta_ads_connected?: boolean | null
          name?: string
          status?: string | null
          tiktok_ads_connected?: boolean | null
          timezone?: string
          updated_at?: string | null
          whatsapp_connected?: boolean | null
          wizard_completed_at?: string | null
          wizard_current_step?: number | null
          wizard_progress?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      sales: {
        Row: {
          contact_id: string
          created_at: string | null
          currency: string
          date: string
          id: string
          lost_observations: string | null
          lost_reason: string | null
          metadata: Json | null
          notes: string | null
          origin_id: string | null
          project_id: string
          status: string
          tracking_params: Json | null
          updated_at: string | null
          value: number
        }
        Insert: {
          contact_id: string
          created_at?: string | null
          currency?: string
          date?: string
          id?: string
          lost_observations?: string | null
          lost_reason?: string | null
          metadata?: Json | null
          notes?: string | null
          origin_id?: string | null
          project_id: string
          status?: string
          tracking_params?: Json | null
          updated_at?: string | null
          value: number
        }
        Update: {
          contact_id?: string
          created_at?: string | null
          currency?: string
          date?: string
          id?: string
          lost_observations?: string | null
          lost_reason?: string | null
          metadata?: Json | null
          notes?: string | null
          origin_id?: string | null
          project_id?: string
          status?: string
          tracking_params?: Json | null
          updated_at?: string | null
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "sales_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_origin_id_fkey"
            columns: ["origin_id"]
            isOneToOne: false
            referencedRelation: "origins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      stages: {
        Row: {
          color: string | null
          created_at: string | null
          display_order: number
          event_config: Json | null
          id: string
          is_active: boolean | null
          name: string
          project_id: string | null
          tracking_phrase: string | null
          type: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          display_order: number
          event_config?: Json | null
          id?: string
          is_active?: boolean | null
          name: string
          project_id?: string | null
          tracking_phrase?: string | null
          type: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          display_order?: number
          event_config?: Json | null
          id?: string
          is_active?: boolean | null
          name?: string
          project_id?: string | null
          tracking_phrase?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "stages_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          first_name: string
          id: string
          is_active: boolean | null
          last_login_at: string | null
          last_name: string
          phone: string | null
          preferred_language: string | null
          timezone: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          first_name: string
          id: string
          is_active?: boolean | null
          last_login_at?: string | null
          last_name: string
          phone?: string | null
          preferred_language?: string | null
          timezone?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          first_name?: string
          id?: string
          is_active?: boolean | null
          last_login_at?: string | null
          last_name?: string
          phone?: string | null
          preferred_language?: string | null
          timezone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      [key: string]: {
        Row: Record<string, Json | null>
        Insert: Record<string, Json | null | undefined>
        Update: Record<string, Json | null | undefined>
        Relationships: {
          foreignKeyName: string
          columns: string[]
          isOneToOne: boolean
          referencedRelation: string
          referencedColumns: string[]
        }[]
      }
    }
    Views: {
      [key: string]: {
        Row: Record<string, Json | null>
        Relationships: {
          foreignKeyName: string
          columns: string[]
          isOneToOne: boolean
          referencedRelation: string
          referencedColumns: string[]
        }[]
      }
    }
    Functions: {
      accept_company_invite: { Args: { p_company_id: string }; Returns: Json }
      cleanup_expired_cache: { Args: Record<string, never>; Returns: number }
      decrypt_token: {
        Args: { encrypted_data: string; encryption_key: string }
        Returns: string
      }
      encrypt_token: {
        Args: { encryption_key: string; token_data: string }
        Returns: string
      }
      get_dashboard_cache: {
        Args: { p_endpoint: string; p_params_hash: string; p_project_id: string }
        Returns: Json
      }
      invite_user_to_company: {
        Args: {
          p_company_id: string
          p_permissions?: Json
          p_role?: string
          p_user_email: string
        }
        Returns: Json
      }
      invalidate_dashboard_cache: {
        Args: { p_project_id: string; p_endpoint?: string }
        Returns: number
      }
      refresh_analytics_materialized_views: {
        Args: { refresh_type?: string; view_name?: string }
        Returns: undefined
      }
      set_dashboard_cache: {
        Args: {
          p_data: Json
          p_endpoint: string
          p_params_hash: string
          p_project_id: string
          p_ttl_minutes?: number
        }
        Returns: undefined
      }
      user_can_manage_company: {
        Args: { company_uuid: string }
        Returns: boolean
      }
      user_can_manage_project: {
        Args: { project_uuid: string }
        Returns: boolean
      }
      user_company_role: { Args: { company_uuid: string }; Returns: string }
      user_has_company_access: {
        Args: { company_uuid: string }
        Returns: boolean
      }
      user_has_project_access: {
        Args: { project_uuid: string }
        Returns: boolean
      }
      user_is_company_owner: {
        Args: { company_uuid: string }
        Returns: boolean
      }
      user_is_project_owner: {
        Args: { project_uuid: string }
        Returns: boolean
      }
      user_project_role: { Args: { project_uuid: string }; Returns: string }
      [key: string]: {
        Args: Record<string, Json | undefined> | undefined
        Returns: unknown
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
