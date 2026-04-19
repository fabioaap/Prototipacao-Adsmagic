/**
 * Billing request validators
 */

export interface ValidationResult {
  valid: boolean
  errors: string[]
}

export function validateCheckoutRequest(body: Record<string, unknown>): ValidationResult {
  const errors: string[] = []

  if (!body.plan_slug || typeof body.plan_slug !== 'string') {
    errors.push('plan_slug is required and must be a string')
  } else if (!['starter', 'growth', 'pro'].includes(body.plan_slug)) {
    errors.push('plan_slug must be one of: starter, growth, pro')
  }

  if (!body.billing_cycle || typeof body.billing_cycle !== 'string') {
    errors.push('billing_cycle is required and must be a string')
  } else if (!['monthly', 'yearly'].includes(body.billing_cycle)) {
    errors.push('billing_cycle must be one of: monthly, yearly')
  }

  if (!body.success_url || typeof body.success_url !== 'string') {
    errors.push('success_url is required and must be a string')
  }

  if (!body.cancel_url || typeof body.cancel_url !== 'string') {
    errors.push('cancel_url is required and must be a string')
  }

  if (body.extra_projects !== undefined) {
    if (typeof body.extra_projects !== 'number' || !Number.isInteger(body.extra_projects) || body.extra_projects < 0) {
      errors.push('extra_projects must be a non-negative integer')
    }
  }

  return { valid: errors.length === 0, errors }
}

export function validateAddProjectsRequest(body: Record<string, unknown>): ValidationResult {
  const errors: string[] = []

  if (!body.quantity || typeof body.quantity !== 'number' || !Number.isInteger(body.quantity) || body.quantity < 1) {
    errors.push('quantity must be a positive integer')
  }

  return { valid: errors.length === 0, errors }
}

export function validatePortalRequest(body: Record<string, unknown>): ValidationResult {
  const errors: string[] = []

  if (!body.return_url || typeof body.return_url !== 'string') {
    errors.push('return_url is required and must be a string')
  }

  return { valid: errors.length === 0, errors }
}
