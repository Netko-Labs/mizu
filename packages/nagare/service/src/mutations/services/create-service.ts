import {
  getTemplateById,
  type Service,
  type ServiceInsert,
  serviceTable,
} from '@mizu/nagare-domain'
import { db } from '@mizu/nagare-repository'
import { eq } from 'drizzle-orm'
import { encrypt } from '../../shared/crypto'

/**
 * Expand a `template` source into a concrete image service at create time: the
 * template's image, default ports, and default env become the service's own, so
 * deploy and ingress routing work with no template special-casing downstream.
 */
function resolveTemplate(data: ServiceInsert): ServiceInsert {
  if (data.sourceType !== 'template') return data

  const { templateId } = data.sourceConfig as { templateId?: string }
  const template = templateId ? getTemplateById(templateId) : undefined
  if (!template) throw new Error(`Unknown service template: ${templateId ?? '(none)'}`)

  return {
    ...data,
    sourceType: 'image',
    sourceConfig: { ...template.sourceConfig },
    ports:
      Array.isArray(data.ports) && data.ports.length ? data.ports : (template.defaultPorts ?? []),
    envVars:
      data.envVars ??
      (template.defaultEnvVars ? encrypt(JSON.stringify(template.defaultEnvVars)) : data.envVars),
  }
}

export const createService = async (data: ServiceInsert): Promise<Service | undefined> => {
  const resolved = resolveTemplate(data)

  // Count within the target environment so each environment's canvas lays out
  // its own nodes independently.
  const existingServices = await db
    .select({ id: serviceTable.id })
    .from(serviceTable)
    .where(eq(serviceTable.environmentId, resolved.environmentId))

  const [result] = await db
    .insert(serviceTable)
    .values({
      ...resolved,
      canvasPosition:
        resolved.canvasPosition ??
        ({
          x: 100 + existingServices.length * 280,
          y: 100,
        } satisfies { x: number; y: number }),
    })
    .returning()

  return result as Service | undefined
}
