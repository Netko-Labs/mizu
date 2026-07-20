import { z } from 'zod'
import { IngressRuleSchema } from './ingress-rule-schema'

/**
 * The typed shape of `service.settings`. Extra keys are stripped on parse, so
 * this stays forward-compatible with older rows (mirrors ProjectSettings).
 */
export const ServiceSettingsSchema = z.object({
  // Manual public ingress routes. When present, they replace the service's
  // auto-derived host — each rule maps a chosen port to a public hostname.
  // A rule is explicit exposure on its own, independent of `exposed`.
  ingressRules: z.array(IngressRuleSchema).optional(),
  // Opt-in for the auto-derived `{service}-{project}.{domain}` host. Absent or
  // false = private (services are private by default; existing rows were
  // backfilled true by migration 0005).
  exposed: z.boolean().optional(),
})

export type ServiceSettings = z.infer<typeof ServiceSettingsSchema>
