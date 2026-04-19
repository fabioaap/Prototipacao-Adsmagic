import type { SupabaseDbClient } from '../types-db.ts'

export interface UpdateLatestAutoSaleValueParams {
  projectId: string
  contactId: string
  value: number
  currency: string
  rawMatch: string
  messageId: string
}

export interface UpdateLatestAutoSaleValueResult {
  updated: boolean
  saleId?: string
}

/**
 * Atualiza o valor da venda mais recente criada automaticamente pelo trigger
 * `create_sale_on_contact_stage_sale` para um contato. Aplica-se apenas a vendas
 * com `value = 0` (não criadas/ajustadas manualmente), garantindo idempotência:
 * reprocessar a mesma mensagem não sobrescreve um valor já atribuído.
 */
export class SaleValueUpdateRepository {
  private supabaseClient: SupabaseDbClient

  constructor(supabaseClient: SupabaseDbClient) {
    this.supabaseClient = supabaseClient
  }

  async updateLatestAutoSaleValue(
    params: UpdateLatestAutoSaleValueParams
  ): Promise<UpdateLatestAutoSaleValueResult> {
    const { data: sale, error: selectError } = await this.supabaseClient
      .from('sales')
      .select('id, metadata')
      .eq('project_id', params.projectId)
      .eq('contact_id', params.contactId)
      .eq('status', 'completed')
      .eq('value', 0)
      .filter('metadata->>created_by', 'eq', 'trigger_contact_stage')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (selectError) {
      throw new Error(`Failed to find auto-created sale: ${selectError.message}`)
    }

    if (!sale) {
      return { updated: false }
    }

    const row = sale as { id: string; metadata: Record<string, unknown> | null }
    const mergedMetadata = {
      ...(row.metadata || {}),
      value_extracted_from_message: true,
      value_source_message_id: params.messageId,
      value_raw_match: params.rawMatch,
    }

    const { error: updateError } = await this.supabaseClient
      .from('sales')
      .update({
        value: params.value,
        currency: params.currency,
        metadata: mergedMetadata,
      })
      .eq('id', row.id)

    if (updateError) {
      throw new Error(`Failed to update sale value: ${updateError.message}`)
    }

    return { updated: true, saleId: row.id }
  }
}
