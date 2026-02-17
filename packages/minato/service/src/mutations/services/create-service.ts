import { type Service, type ServiceInsert, serviceTable } from '@mizu/minato-domain'
import { db } from '@mizu/minato-repository'
import { eq } from 'drizzle-orm'

export const createService = async (data: ServiceInsert): Promise<Service | undefined> => {
  const existingServices = await db
    .select({ id: serviceTable.id })
    .from(serviceTable)
    .where(eq(serviceTable.projectId, data.projectId))

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
