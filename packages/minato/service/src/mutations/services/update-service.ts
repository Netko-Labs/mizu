import { type Service, type ServiceUpdate, serviceTable } from '@mizu/minato-domain'
import { db } from '@mizu/minato-repository'
import { eq } from 'drizzle-orm'

export const updateService = async (
  serviceId: string,
  data: Partial<ServiceUpdate>,
): Promise<Service | undefined> => {
  const [result] = await db
    .update(serviceTable)
    .set(data)
    .where(eq(serviceTable.id, serviceId))
    .returning()
  return result as Service | undefined
}

export const updateServiceStatus = async (
  serviceId: string,
  status: string,
  containerId?: string,
): Promise<void> => {
  await db
    .update(serviceTable)
    .set({ status: status as Service['status'], containerId })
    .where(eq(serviceTable.id, serviceId))
}

export const updateCanvasPosition = async (
  serviceId: string,
  position: { x: number; y: number },
): Promise<void> => {
  await db
    .update(serviceTable)
    .set({ canvasPosition: position })
    .where(eq(serviceTable.id, serviceId))
}
