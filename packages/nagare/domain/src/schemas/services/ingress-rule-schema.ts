import { z } from 'zod'

/**
 * A manually-configured public ingress route for one of a service's ports.
 * `hostType` decides how `host` becomes the public hostname:
 *  - 'subdomain' → `{host}.{instanceDomain}` — a label under the instance base
 *    domain, covered by the managed `*.domain` wildcard cert.
 *  - 'custom'    → `host` used verbatim as a full FQDN; the user points DNS at
 *    this box and caddy provisions its own cert via ACME.
 *
 * When a service has any rules they REPLACE its auto-derived ingress host
 * (opt-in override), so each rule targets an explicit `port`.
 */
export const IngressRuleSchema = z.object({
  id: z.string().min(1),
  port: z.number().int().positive(),
  hostType: z.enum(['subdomain', 'custom']),
  host: z
    .string()
    .min(1)
    .max(253)
    .regex(
      /^[a-z0-9]([a-z0-9.-]*[a-z0-9])?$/i,
      'must be a bare hostname (letters, digits, dots, hyphens)',
    ),
})

export type IngressRule = z.infer<typeof IngressRuleSchema>
