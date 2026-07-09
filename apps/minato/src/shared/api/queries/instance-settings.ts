import type { InstanceSetting, UpsertInstanceSettingsInput } from '@mizu/nagare-domain'
import { queryOptions } from '@tanstack/react-query'
import { nagare } from '@/integrations/nagare'
import type { Serialized } from '../types'
import { unwrap } from '../utils'

// eden types drizzle timestamps as Date, but JSON delivers ISO strings —
// Serialized<> is the honest wire type (see ../types.ts).

export const instanceSettingsKeys = {
  all: ['instance-settings'] as const,
}

export const instanceSettingsQueries = {
  get: () =>
    queryOptions({
      queryKey: instanceSettingsKeys.all,
      queryFn: async () =>
        (await unwrap(
          nagare['instance-settings'].get(),
        )) as unknown as Serialized<InstanceSetting> | null,
    }),
}

export const upsertInstanceSettings = async (input: UpsertInstanceSettingsInput) =>
  (await unwrap(nagare['instance-settings'].put(input))) as unknown as Serialized<InstanceSetting>
