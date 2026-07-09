import { type InstanceSetting, instanceSettingTable } from '@mizu/nagare-domain'
import { db } from '@mizu/nagare-repository'

export const getInstanceSettings = async (): Promise<InstanceSetting | null> => {
  const [result] = await db.select().from(instanceSettingTable).limit(1)

  return (result as InstanceSetting) ?? null
}
