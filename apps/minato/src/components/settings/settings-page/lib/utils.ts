import type { InstanceSettingsForm, InstanceSettingsSource } from './types'
import { defaultForm } from './values'

export function settingsToForm(settings: InstanceSettingsSource | null | undefined) {
  if (!settings) return defaultForm
  return {
    instanceName: settings.instanceName ?? 'mizu',
    domain: settings.domain ?? '',
    dns: settings.dns ?? '',
    timezone: settings.timezone ?? 'UTC',
    publicIpv4: settings.publicIpv4 ?? '',
    publicIpv6: settings.publicIpv6 ?? '',
    doNotTrack: settings.doNotTrack ?? false,
    registrationEnabled: settings.registrationEnabled ?? true,
    updatesCronExpression: settings.updatesCronExpression ?? '0 3 * * *',
  } satisfies InstanceSettingsForm
}

export function isFormEqual(a: InstanceSettingsForm, b: InstanceSettingsForm) {
  return (Object.keys(a) as (keyof InstanceSettingsForm)[]).every((key) => a[key] === b[key])
}
