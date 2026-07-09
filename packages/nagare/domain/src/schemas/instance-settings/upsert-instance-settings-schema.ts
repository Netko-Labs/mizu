import { z } from 'zod'

export const UpsertInstanceSettingsSchema = z.object({
  instanceName: z.string().min(1).max(100).optional(),
  domain: z.string().max(255).nullable().optional(),
  dns: z.string().max(255).nullable().optional(),
  timezone: z.string().min(1).max(100).optional(),
  publicIpv4: z.string().max(45).nullable().optional(),
  publicIpv6: z.string().max(45).nullable().optional(),
  doNotTrack: z.boolean().optional(),
  registrationEnabled: z.boolean().optional(),
  updatesCronExpression: z.string().min(1).max(100).optional(),
})

export type UpsertInstanceSettingsInput = z.infer<typeof UpsertInstanceSettingsSchema>
