/**
 * Backfill one-shot de atribuicao por protocolo WhatsApp.
 *
 * Uso:
 *   deno run --allow-env --allow-net scripts/backfill-whatsapp-protocol-attribution.ts --dry-run
 *   deno run --allow-env --allow-net scripts/backfill-whatsapp-protocol-attribution.ts
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import {
  decodeWhatsAppProtocol,
  stripInvisibleProtocolChars,
} from '../../_shared/whatsapp-protocol.ts'
import { WhatsAppProtocolAttributionService } from '../services/WhatsAppProtocolAttributionService.ts'
import type { SupabaseDbClient } from '../types-db.ts'

type ContactRow = {
  id: string
  project_id: string
  metadata: Record<string, unknown> | null
}

const INVISIBLE_PROTOCOL_REGEX = /[\u200B\u200C\u200D\u2060]/
const PAGE_SIZE = 500

function asObject(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object'
    ? (value as Record<string, unknown>)
    : {}
}

function hasInvisibleProtocolChars(text: string): boolean {
  return INVISIBLE_PROTOCOL_REGEX.test(text)
}

async function main() {
  const dryRun = Deno.args.includes('--dry-run')

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_ANON_KEY') ?? ''

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY ausentes no ambiente')
  }

  const supabaseClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  }) as unknown as SupabaseDbClient

  const attributionService = new WhatsAppProtocolAttributionService(supabaseClient)

  let offset = 0
  let totalScanned = 0
  let totalCandidates = 0
  let totalDecoded = 0
  let totalSanitizedOnly = 0
  let attributed = 0
  let alreadyAttributed = 0
  let notFound = 0
  let projectMismatch = 0
  let conflict = 0
  let errors = 0

  while (true) {
    const { data, error } = await supabaseClient
      .from('contacts')
      .select('id, project_id, metadata')
      .order('created_at', { ascending: true })
      .range(offset, offset + PAGE_SIZE - 1)

    if (error) {
      throw new Error(`Erro ao buscar contatos: ${error.message}`)
    }

    const page = (data || []) as ContactRow[]
    if (page.length === 0) break

    totalScanned += page.length

    for (const contact of page) {
      const metadata = asObject(contact.metadata)
      const lastMessageContent = typeof metadata.lastMessageContent === 'string'
        ? metadata.lastMessageContent
        : null

      if (!lastMessageContent || !hasInvisibleProtocolChars(lastMessageContent)) {
        continue
      }

      const hasTracking = Object.prototype.hasOwnProperty.call(metadata, 'adsmagic_tracking')
      if (hasTracking) {
        continue
      }

      totalCandidates += 1

      const protocol = decodeWhatsAppProtocol(lastMessageContent)
      const sanitizedLastMessage = stripInvisibleProtocolChars(lastMessageContent)
      const shouldSanitize = sanitizedLastMessage !== lastMessageContent

      if (!protocol) {
        if (shouldSanitize) {
          totalSanitizedOnly += 1
          if (!dryRun) {
            const nextMetadata = {
              ...metadata,
              lastMessageContent: sanitizedLastMessage,
            }

            const { error: updateError } = await supabaseClient
              .from('contacts')
              .update({
                metadata: nextMetadata,
                updated_at: new Date().toISOString(),
              } as never)
              .eq('id', contact.id)
              .eq('project_id', contact.project_id)

            if (updateError) {
              errors += 1
              console.error('[backfill.protocol] sanitize_failed', {
                contactId: contact.id,
                projectId: contact.project_id,
                error: updateError.message,
              })
            }
          }
        }
        continue
      }

      totalDecoded += 1

      if (dryRun) {
        continue
      }

      try {
        const result = await attributionService.attributeByProtocol({
          protocol,
          projectId: contact.project_id,
          contactId: contact.id,
        })

        if (result.status === 'attributed') attributed += 1
        else if (result.status === 'already_attributed') alreadyAttributed += 1
        else if (result.status === 'not_found') notFound += 1
        else if (result.status === 'project_mismatch') projectMismatch += 1
        else if (result.status === 'conflict') conflict += 1
        else errors += 1
      } catch (error) {
        errors += 1
        console.error('[backfill.protocol] attribution_failed', {
          contactId: contact.id,
          projectId: contact.project_id,
          protocol,
          error: error instanceof Error ? error.message : String(error),
        })
      }

      if (shouldSanitize) {
        const nextMetadata = {
          ...metadata,
          lastMessageContent: sanitizedLastMessage,
        }

        const { error: updateError } = await supabaseClient
          .from('contacts')
          .update({
            metadata: nextMetadata,
            updated_at: new Date().toISOString(),
          } as never)
          .eq('id', contact.id)
          .eq('project_id', contact.project_id)

        if (updateError) {
          errors += 1
          console.error('[backfill.protocol] sanitize_failed', {
            contactId: contact.id,
            projectId: contact.project_id,
            error: updateError.message,
          })
        }
      }
    }

    offset += PAGE_SIZE
  }

  console.log('[backfill.protocol] done', {
    dryRun,
    totalScanned,
    totalCandidates,
    totalDecoded,
    totalSanitizedOnly,
    attributed,
    alreadyAttributed,
    notFound,
    projectMismatch,
    conflict,
    errors,
  })
}

if (import.meta.main) {
  await main()
}
