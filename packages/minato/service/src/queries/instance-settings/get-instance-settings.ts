import { type InstanceSetting, instanceSettingTable } from '@mizu/minato-domain'
import { db } from '@mizu/minato-repository'

export const getInstanceSettings = async (): Promise<InstanceSetting | null> => {
  const [result] = await db.select().from(instanceSettingTable).limit(1)

  return (result as InstanceSetting) ?? null
}
