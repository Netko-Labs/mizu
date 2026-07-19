import { type Service, type ServiceUpdate, serviceTable } from '@mizu/nagare-domain'
import { db } from '@mizu/nagare-repository'
import { eq } from 'drizzle-orm'
import { syncIngressSafe } from '../../ingress'

export const updateService = async (
  serviceId: string,
  data: Partial<ServiceUpdate>,
): Promise<Service | undefined> => {
  const [result] = await db
    .update(serviceTable)
    .set(data)
    .where(eq(serviceTable.id, serviceId))
    .returning()
  // Name or ingress-rule edits change the desired caddy routes — re-sync.
  syncIngressSafe()
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
