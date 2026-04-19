/**
 * Validador Zod para endpoint público de tracking (POST /events/track)
 */

import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'

export const trackEventSchema = z.object({
  project_id: z.string().uuid('project_id must be a valid UUID'),
  event_name: z.string().min(1, 'event_name is required').max(100),
  event_type: z.string().max(50).optional().default('page_view'),
  event_data: z.record(z.unknown()).optional().default({}),
  // UTM params
  utm_source: z.string().max(255).optional().nullable(),
  utm_medium: z.string().max(255).optional().nullable(),
  utm_campaign: z.string().max(255).optional().nullable(),
  utm_content: z.string().max(255).optional().nullable(),
  utm_term: z.string().max(255).optional().nullable(),
  // Click IDs
  fbclid: z.string().max(255).optional().nullable(),
  gclid: z.string().max(255).optional().nullable(),
  ttclid: z.string().max(255).optional().nullable(),
  // Page context
  page_url: z.string().max(2048).optional().nullable(),
  page_title: z.string().max(500).optional().nullable(),
  referrer: z.string().max(2048).optional().nullable(),
})

export type TrackEventInput = z.infer<typeof trackEventSchema>
