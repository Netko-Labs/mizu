import type { InstanceSettingsForm } from './types'

export const defaultForm: InstanceSettingsForm = {
  instanceName: 'mizu',
  domain: '',
  dns: '',
  timezone: 'UTC',
  publicIpv4: '',
  publicIpv6: '',
  doNotTrack: false,
  registrationEnabled: true,
  updatesCronExpression: '0 3 * * *',
}
