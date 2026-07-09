import {
  type ServiceConnection,
  type ServiceConnectionInsert,
  serviceConnectionTable,
} from '@mizu/nagare-domain'
import { db } from '@mizu/nagare-repository'
import { and, eq } from 'drizzle-orm'

export const createConnection = async (
  data: ServiceConnectionInsert,
): Promise<ServiceConnection | undefined> => {
  const targetCondition =
    data.targetType === 'service' && data.toServiceId
      ? eq(serviceConnectionTable.toServiceId, data.toServiceId)
      : data.targetType === 'database' && data.toDatabaseId
        ? eq(serviceConnectionTable.toDatabaseId, data.toDatabaseId)
        : data.targetType === 'network' && data.toNetworkId
          ? eq(serviceConnectionTable.toNetworkId, data.toNetworkId)
          : data.targetType === 'external_service' && data.toExternalServiceId
            ? eq(serviceConnectionTable.toExternalServiceId, data.toExternalServiceId)
            : data.targetType === 'env_group' && data.toEnvGroupId
              ? eq(serviceConnectionTable.toEnvGroupId, data.toEnvGroupId)
              : null

  if (targetCondition) {
    const [existing] = await db
      .select()
      .from(serviceConnectionTable)
      .where(
        and(
          eq(serviceConnectionTable.fromServiceId, data.fromServiceId),
          eq(serviceConnectionTable.connectionType, data.connectionType),
          eq(serviceConnectionTable.targetType, data.targetType),
          targetCondition,
        ),
      )

    if (existing) {
      return existing as ServiceConnection
    }
  }

  const [result] = await db.insert(serviceConnectionTable).values(data).returning()
  return result as ServiceConnection | undefined
}
