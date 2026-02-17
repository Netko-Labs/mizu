import { IconBrandDocker, IconDatabase, IconServer } from '@tabler/icons-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'motion/react'
import { useEffect, useState } from 'react'
import {
  ConfigLine,
  EditableField,
  SettingsItem,
  TerminalCard,
  ToggleField,
} from '@/components/midnight-aurora'
import { useTRPC } from '@/integrations/trpc'

interface InstanceSettingsForm {
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

const defaultForm: InstanceSettingsForm = {
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

export function MidnightAuroraSettings() {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  const { data: settings, isPending: isLoadingSettings } = useQuery({
    ...trpc.instanceSettings.get.queryOptions(),
  })

  const { data: stats } = useQuery({
    ...trpc.system.dashboardStats.queryOptions(),
  })

  const [form, setForm] = useState<InstanceSettingsForm>(defaultForm)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null,
  )

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
    ...trpc.instanceSettings.upsert.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trpc.instanceSettings.get.queryKey() })
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

  if (isLoadingSettings) {
    return (
      <div className="relative min-h-screen bg-black font-mono">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-neutral-950 via-black to-black" />
        <div className="relative mx-auto max-w-6xl px-6 py-8">
          <div className="space-y-6">
            <div className="h-6 w-48 animate-pulse rounded bg-neutral-800" />
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="h-48 animate-pulse rounded-lg bg-neutral-900" />
              <div className="h-48 animate-pulse rounded-lg bg-neutral-900" />
              <div className="h-48 animate-pulse rounded-lg bg-neutral-900" />
              <div className="h-48 animate-pulse rounded-lg bg-neutral-900" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-black font-mono">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-neutral-950 via-black to-black" />

      <div className="relative mx-auto max-w-6xl px-6 py-8">
        <motion.header
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <div className="text-xs text-neutral-600">$ mizu config --list</div>
          <h1 className="mt-2 text-xl text-neutral-400">
            <span className="text-white">settings</span>
          </h1>
        </motion.header>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Instance config */}
          <TerminalCard title="instance.conf" delay={0.1}>
            <div className="space-y-3">
              <EditableField
                label="name"
                value={form.instanceName}
                onChange={(v) => updateField('instanceName', v)}
                placeholder="mizu"
              />
              <EditableField
                label="domain"
                value={form.domain}
                onChange={(v) => updateField('domain', v)}
                placeholder="mizu.local"
              />
              <EditableField
                label="dns"
                value={form.dns}
                onChange={(v) => updateField('dns', v)}
                placeholder="1.1.1.1"
              />
              <EditableField
                label="timezone"
                value={form.timezone}
                onChange={(v) => updateField('timezone', v)}
                placeholder="UTC"
              />
            </div>
          </TerminalCard>

          {/* Network config */}
          <TerminalCard title="network.conf" delay={0.15}>
            <div className="space-y-3">
              <EditableField
                label="ipv4"
                value={form.publicIpv4}
                onChange={(v) => updateField('publicIpv4', v)}
                placeholder="0.0.0.0"
              />
              <EditableField
                label="ipv6"
                value={form.publicIpv6}
                onChange={(v) => updateField('publicIpv6', v)}
                placeholder="::1"
              />
            </div>
          </TerminalCard>

          {/* Privacy config */}
          <TerminalCard title="privacy.conf" delay={0.2}>
            <div className="space-y-4">
              <ToggleField
                label="do-not-track"
                checked={form.doNotTrack}
                onCheckedChange={(v) => updateField('doNotTrack', v)}
                description="disable telemetry"
              />
              <ToggleField
                label="registration"
                checked={form.registrationEnabled}
                onCheckedChange={(v) => updateField('registrationEnabled', v)}
                description="allow new signups"
              />
            </div>
          </TerminalCard>

          {/* Updates config */}
          <TerminalCard title="updates.conf" delay={0.25}>
            <div className="space-y-3">
              <EditableField
                label="cron"
                value={form.updatesCronExpression}
                onChange={(v) => updateField('updatesCronExpression', v)}
                placeholder="0 3 * * *"
              />
              <div className="text-[10px] text-neutral-700">
                schedule for automatic update checks (cron syntax)
              </div>
            </div>
          </TerminalCard>

          {/* System (read-only) */}
          <TerminalCard title="system.conf" delay={0.3}>
            <div className="space-y-3">
              <ConfigLine label="hostname" value={stats?.system.hostname} />
              <ConfigLine label="platform" value={stats?.system.platform} />
              <ConfigLine label="arch" value={stats?.system.arch} />
              <ConfigLine label="uptime" value={stats?.system.uptimeFormatted} accent />
            </div>
          </TerminalCard>

          {/* Services (read-only) */}
          <TerminalCard title="services.d/" delay={0.35}>
            <div className="space-y-2">
              <SettingsItem
                icon={IconBrandDocker}
                label="docker"
                description="container runtime"
                status={stats?.mizu.dockerAvailable ? 'active' : 'inactive'}
              />
              <SettingsItem
                icon={IconDatabase}
                label="postgresql"
                description="database engine"
                status="active"
              />
              <SettingsItem
                icon={IconServer}
                label="mizu-server"
                description="application server"
                status="active"
              />
            </div>
          </TerminalCard>
        </div>

        {/* Save bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3"
        >
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleSave}
              disabled={upsertMutation.isPending}
              className="rounded border border-neutral-700 bg-black px-4 py-1.5 font-mono text-xs text-neutral-300 transition-all hover:border-blue-500/50 hover:text-white disabled:opacity-50"
            >
              {upsertMutation.isPending ? '$ saving...' : '$ save config'}
            </button>

            {feedback && (
              <motion.span
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                className={
                  feedback.type === 'success'
                    ? 'text-[11px] text-green-500'
                    : 'text-[11px] text-red-500'
                }
              >
                {feedback.type === 'success' ? '\u2713' : '\u2717'} {feedback.message}
              </motion.span>
            )}

            <div className="ml-auto flex flex-wrap items-center gap-x-6 gap-y-1 text-[10px] text-neutral-600">
              <span>
                mizu <span className="text-neutral-500">v0.1.0-alpha</span>
              </span>
              <span>
                docker{' '}
                <span className="text-neutral-500">
                  {stats?.mizu.dockerAvailable ? stats.mizu.dockerInfo?.version : 'n/a'}
                </span>
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
