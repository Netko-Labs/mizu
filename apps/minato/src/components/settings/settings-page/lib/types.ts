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
