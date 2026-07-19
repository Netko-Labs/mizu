import { z } from 'zod'
import { IngressRuleSchema } from './ingress-rule-schema'

/**
 * The typed shape of `service.settings`. Extra keys are stripped on parse, so
 * this stays forward-compatible with older rows (mirrors ProjectSettings).
 */
export const ServiceSettingsSchema = z.object({
  // Manual public ingress routes. When present, they replace the service's
  // auto-derived host — each rule maps a chosen port to a public hostname.
  ingressRules: z.array(IngressRuleSchema).optional(),
})

export type ServiceSettings = z.infer<typeof ServiceSettingsSchema>
