import type { DashboardStats, InstanceSetting } from '@mizu/nagare-domain'

export interface InstanceSettingsForm {
  instanceName: string
  domain: string
  dns: string
  timezone: string
  publicIpv4: string
  publicIpv6: string
  doNotTrack: boolean
  registrationEnabled: boolean
  updatesCronExpression: string
}

export interface SettingsFeedback {
  type: 'success' | 'error'
  message: string
}

export type SettingsTab = 'instance' | 'ingress' | 'access' | 'team'

export interface SettingsTabDefinition {
  id: SettingsTab
  label: string
}

/** The settings fields the form reads — date columns excluded, so the serialized row satisfies it too. */
export type InstanceSettingsSource = Pick<InstanceSetting, keyof InstanceSettingsForm>

export type UpdateSettingsField = <K extends keyof InstanceSettingsForm>(
  key: K,
  value: InstanceSettingsForm[K],
) => void

export interface SettingsTabProps {
  form: InstanceSettingsForm
  updateField: UpdateSettingsField
}

export interface SettingsStatsTabProps extends SettingsTabProps {
  stats: DashboardStats | undefined
}

export interface SettingsStatRowProps {
  label: string
  value: string | number | undefined
  accent?: boolean
}
