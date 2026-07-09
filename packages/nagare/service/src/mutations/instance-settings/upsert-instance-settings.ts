import {
  type InstanceSetting,
  type InstanceSettingInsert,
  instanceSettingTable,
} from '@mizu/nagare-domain'
import { db } from '@mizu/nagare-repository'
import { eq } from 'drizzle-orm'

type UpsertInstanceSettingsData = Omit<InstanceSettingInsert, 'id' | 'createdAt' | 'updatedAt'>

export const upsertInstanceSettings = async (
  data: UpsertInstanceSettingsData,
): Promise<InstanceSetting> => {
  // Check if a row already exists
  const [existing] = await db.select().from(instanceSettingTable).limit(1)

  if (existing) {
    const [updated] = await db
      .update(instanceSettingTable)
      .set(data)
      .where(eq(instanceSettingTable.id, existing.id))
      .returning()

    return updated as InstanceSetting
  }

  const [created] = await db.insert(instanceSettingTable).values(data).returning()

  return created as InstanceSetting
}
