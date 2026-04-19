/**
 * Syncs subscription_addons rows with the current items of a Stripe subscription.
 *
 * For every Stripe subscription item whose price_id matches a row in plan_addons,
 * we upsert a corresponding subscription_addons row (keyed by stripe_item_id).
 * Any previously-stored addon rows whose stripe_item_id is no longer present in
 * Stripe are deleted (addon removed by the user).
 *
 * Line items that belong to the base plan (i.e., not addons) are ignored.
 */

import { SupabaseRestClient } from './supabase.js'
import type { StripeSubscriptionItem } from '../types.js'

interface SubscriptionRow {
  id: string
}

interface PlanAddonRow {
  id: string
  addon_type: string
  stripe_price_id: string
}

interface SubscriptionAddonRow {
  id: string
  subscription_id: string
  addon_type: string
  quantity: number | null
  stripe_item_id: string | null
}

export async function syncSubscriptionAddons(
  supabase: SupabaseRestClient,
  subscription: SubscriptionRow,
  stripeItems: StripeSubscriptionItem[]
): Promise<void> {
  if (!stripeItems.length) return

  // Look up which Stripe prices in this subscription are known addons
  const priceIds = stripeItems.map((item) => item.price.id)
  const inFilter = `(${priceIds.join(',')})`
  const addonCatalog = (await supabase.select('plan_addons', {
    stripe_price_id: `in.${inFilter}`,
  })) as unknown as PlanAddonRow[]

  const priceToAddon = new Map<string, PlanAddonRow>()
  for (const addon of addonCatalog) {
    priceToAddon.set(addon.stripe_price_id, addon)
  }

  // Build desired state: Stripe item id -> { addon_type, quantity }
  type Desired = { addon_type: string; quantity: number; stripe_item_id: string }
  const desired: Desired[] = []
  for (const item of stripeItems) {
    const addon = priceToAddon.get(item.price.id)
    if (!addon) continue // base plan line item or unknown price
    desired.push({
      addon_type: addon.addon_type,
      quantity: item.quantity ?? 1,
      stripe_item_id: item.id,
    })
  }

  // Current state in the DB for this subscription
  const existingRows = (await supabase.select('subscription_addons', {
    subscription_id: `eq.${subscription.id}`,
  })) as unknown as SubscriptionAddonRow[]

  const existingByItemId = new Map<string, SubscriptionAddonRow>()
  const existingByAddonType = new Map<string, SubscriptionAddonRow>()
  for (const row of existingRows) {
    if (row.stripe_item_id) existingByItemId.set(row.stripe_item_id, row)
    existingByAddonType.set(row.addon_type, row)
  }

  const keptIds = new Set<string>()

  for (const want of desired) {
    // Prefer matching by stripe_item_id; fallback to same addon_type (legacy rows
    // created before we tracked stripe_item_id, or backfilled manually).
    const existing =
      existingByItemId.get(want.stripe_item_id) ??
      existingByAddonType.get(want.addon_type)

    if (existing) {
      keptIds.add(existing.id)
      const needsUpdate =
        existing.quantity !== want.quantity ||
        existing.stripe_item_id !== want.stripe_item_id
      if (needsUpdate) {
        await supabase.update(
          'subscription_addons',
          {
            quantity: want.quantity,
            stripe_item_id: want.stripe_item_id,
            updated_at: new Date().toISOString(),
          },
          { id: `eq.${existing.id}` }
        )
      }
    } else {
      const inserted = (await supabase.insert('subscription_addons', {
        subscription_id: subscription.id,
        addon_type: want.addon_type,
        quantity: want.quantity,
        stripe_item_id: want.stripe_item_id,
      })) as unknown as Array<{ id: string }>
      if (inserted[0]?.id) keptIds.add(inserted[0].id)
    }
  }

  // Delete any rows that no longer correspond to a Stripe item
  for (const row of existingRows) {
    if (!keptIds.has(row.id)) {
      await supabase.delete('subscription_addons', { id: `eq.${row.id}` })
    }
  }
}
