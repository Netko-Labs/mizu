import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import {
  instanceSettingsKeys,
  instanceSettingsQueries,
  systemQueries,
  upsertInstanceSettings,
} from '@/shared/api'
import type { InstanceSettingsForm, SettingsFeedback } from '../types'
import { isFormEqual, settingsToForm } from '../utils'

export function useInstanceSettingsForm() {
  const queryClient = useQueryClient()

  const { data: settings, isPending: isLoadingSettings } = useQuery(instanceSettingsQueries.get())

  const { data: stats } = useQuery(systemQueries.dashboardStats())

  const savedForm = useMemo(() => settingsToForm(settings), [settings])

  const [form, setForm] = useState<InstanceSettingsForm>(savedForm)
  const [feedback, setFeedback] = useState<SettingsFeedback | null>(null)

  useEffect(() => {
    setForm(savedForm)
  }, [savedForm])

  const upsertMutation = useMutation({
    mutationFn: upsertInstanceSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: instanceSettingsKeys.all })
      setFeedback({ type: 'success', message: 'config saved' })
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
    isDirty: !isFormEqual(form, savedForm),
    isLoadingSettings,
    isSaving: upsertMutation.isPending,
    updateField,
    handleSave,
  }
}
