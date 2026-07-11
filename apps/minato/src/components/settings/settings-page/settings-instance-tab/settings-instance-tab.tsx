import { EditableField, TerminalCard } from '@/components/shared/terminal'
import type { SettingsStatsTabProps } from '../lib'
import { SettingsStatRow } from '../settings-stat-row'

export function SettingsInstanceTab({ form, updateField, stats }: SettingsStatsTabProps) {
  const runtime = stats?.mizu.runtimeInfo

  return (
    <div className="space-y-6">
      <TerminalCard title="instance.conf">
        <div className="space-y-3">
          <EditableField
            label="instance name"
            value={form.instanceName}
            onChange={(v) => updateField('instanceName', v)}
            placeholder="mizu"
          />
          <EditableField
            label="timezone"
            value={form.timezone}
            onChange={(v) => updateField('timezone', v)}
            placeholder="UTC"
          />
          <div className="pl-6 text-[10px] text-neutral-700">
            used for logs, schedules, and the dashboard clock
          </div>
        </div>
      </TerminalCard>

      <TerminalCard title="runtime.status — read-only">
        <div className="space-y-2.5">
          <SettingsStatRow
            label="runtime version"
            value={stats?.mizu.runtimeAvailable ? runtime?.version : 'unavailable'}
            accent={stats?.mizu.runtimeAvailable}
          />
          <SettingsStatRow
            label="containers running"
            value={runtime ? `${runtime.containersRunning}/${runtime.containers}` : undefined}
          />
          <SettingsStatRow label="images" value={runtime?.images} />
        </div>
      </TerminalCard>
    </div>
  )
}
