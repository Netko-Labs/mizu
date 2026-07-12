import type { InstanceSettingsForm, SettingsTabDefinition } from './types'

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

export const SETTINGS_TABS: SettingsTabDefinition[] = [
  { id: 'instance', label: 'instance' },
  { id: 'ingress', label: 'ingress' },
  { id: 'access', label: 'access' },
  { id: 'team', label: 'team' },
]
