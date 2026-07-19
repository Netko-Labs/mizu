import { z } from 'zod'

/**
 * Full-replacement map of a service's user env vars — the editor submits the
 * whole map, so deletions fall out naturally. Values are encrypted at rest by
 * the service layer; changes take effect on the next deploy.
 */
export const UpdateEnvVarsSchema = z.record(
  z
    .string()
    .regex(/^[A-Za-z_][A-Za-z0-9_]*$/, 'env var names must be letters, digits, underscores'),
  z.string(),
)

export type UpdateEnvVarsInput = z.infer<typeof UpdateEnvVarsSchema>
