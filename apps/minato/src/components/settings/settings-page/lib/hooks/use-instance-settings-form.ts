import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import {
  instanceSettingsKeys,
  instanceSettingsQueries,
  systemQueries,
  upsertInstanceSettings,
} from '@/shared/api'
import type { InstanceSettingsForm, SettingsFeedback } from '../types'
import { defaultForm } from '../values'

export function useInstanceSettingsForm() {
  const queryClient = useQueryClient()

  const { data: settings, isPending: isLoadingSettings } = useQuery(instanceSettingsQueries.get())

  const { data: stats } = useQuery(systemQueries.dashboardStats())

  const [form, setForm] = useState<InstanceSettingsForm>(defaultForm)
  const [feedback, setFeedback] = useState<SettingsFeedback | null>(null)

  useEffect(() => {
    if (settings) {
      setForm({
        instanceName: settings.instanceName ?? 'mizu',
        domain: settings.domain ?? '',
        dns: settings.dns ?? '',
        timezone: settings.timezone ?? 'UTC',
        publicIpv4: settings.publicIpv4 ?? '',
        publicIpv6: settings.publicIpv6 ?? '',
        doNotTrack: settings.doNotTrack ?? false,
        registrationEnabled: settings.registrationEnabled ?? true,
        updatesCronExpression: settings.updatesCronExpression ?? '0 3 * * *',
      })
    }
  }, [settings])

  const upsertMutation = useMutation({
    mutationFn: upsertInstanceSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: instanceSettingsKeys.all })
      setFeedback({ type: 'success', message: 'configuration saved successfully' })
      setTimeout(() => setFeedback(null), 3000)
    },
    onError: (error) => {
      setFeedback({ type: 'error', message: error.message })
      setTimeout(() => setFeedback(null), 5000)
    },
  })

  const handleSave = () => {
    upsertMutation.mutate({
      instanceName: form.instanceName,
      domain: form.domain || null,
      dns: form.dns || null,
      timezone: form.timezone,
      publicIpv4: form.publicIpv4 || null,
      publicIpv6: form.publicIpv6 || null,
      doNotTrack: form.doNotTrack,
      registrationEnabled: form.registrationEnabled,
      updatesCronExpression: form.updatesCronExpression,
    })
  }

  const updateField = <K extends keyof InstanceSettingsForm>(
    key: K,
    value: InstanceSettingsForm[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  return {
    form,
    feedback,
    stats,
    isLoadingSettings,
    isSaving: upsertMutation.isPending,
    updateField,
    handleSave,
  }
}
