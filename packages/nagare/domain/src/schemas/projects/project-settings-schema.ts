import { z } from 'zod'

/**
 * Canvas one-click app bundle — a named group of nodes. (Already persisted in
 * `project.settings` today; typed here so the settings bag has a real shape.)
 */
export const ServiceGroupSchema = z.object({
  id: z.string(),
  name: z.string(),
  memberNodeIds: z.array(z.string()).optional(),
})

/**
 * The typed shape of `project.settings`. Extra keys are stripped on parse, so
 * this stays forward-compatible with older rows.
 */
export const ProjectSettingsSchema = z.object({
  serviceGroups: z.array(ServiceGroupSchema).optional(),
  // Per-project base domain / subdomain override for ingress hosts, e.g.
  // "apps.example.com" → web-myproject.apps.example.com. Falls back to the
  // instance-level domain, then *.localhost.
  domain: z
    .string()
    .max(253)
    .regex(/^[a-z0-9.-]+$/i, 'must be a bare hostname (letters, digits, dots, hyphens)')
    .optional(),
})

export type ProjectSettings = z.infer<typeof ProjectSettingsSchema>
