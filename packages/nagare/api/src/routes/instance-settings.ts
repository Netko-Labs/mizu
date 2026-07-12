import { UpsertInstanceSettingsSchema } from '@mizu/nagare-domain'
import { getInstanceSettings, upsertInstanceSettings } from '@mizu/nagare-service'
import { Elysia } from 'elysia'
import { authPlugin } from '../setup'

export const instanceSettingsRoutes = new Elysia({
  name: 'instance-settings',
  prefix: '/instance-settings',
})
  .use(authPlugin)
  // (◕ᴗ◕✿) current instance settings — any team member may read
  .get('/', { auth: true }, () => getInstanceSettings())
  // (๑˃ᴗ˂)ﻭ create-or-update the singleton settings row — owners/admins only
  .put('/', { ownerOrAdmin: true, body: UpsertInstanceSettingsSchema }, ({ body }) =>
    upsertInstanceSettings(body),
  )
