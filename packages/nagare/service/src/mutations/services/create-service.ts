import { type Service, type ServiceInsert, serviceTable } from '@mizu/nagare-domain'
import { db } from '@mizu/nagare-repository'
import { eq } from 'drizzle-orm'

export const createService = async (data: ServiceInsert): Promise<Service | undefined> => {
  // Count within the target environment so each environment's canvas lays out
  // its own nodes independently.
  const existingServices = await db
    .select({ id: serviceTable.id })
    .from(serviceTable)
    .where(eq(serviceTable.environmentId, data.environmentId))

  const [result] = await db
    .insert(serviceTable)
    .values({
      ...data,
      canvasPosition:
        data.canvasPosition ??
        ({
          x: 100 + existingServices.length * 280,
          y: 100,
        } satisfies { x: number; y: number }),
    })
    .returning()

  return result as Service | undefined
}
