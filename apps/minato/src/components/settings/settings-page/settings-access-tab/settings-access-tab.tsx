import { EditableField, TerminalCard, ToggleField } from '@/components/shared/terminal'
import type { SettingsTabProps } from '../lib'

export function SettingsAccessTab({ form, updateField }: SettingsTabProps) {
  return (
    <div className="space-y-6">
      <TerminalCard title="access.conf">
        <div className="space-y-4">
          <ToggleField
            label="registration"
            checked={form.registrationEnabled}
            onCheckedChange={(v) => updateField('registrationEnabled', v)}
            description="allow new sign-ups"
          />
          <ToggleField
            label="do not track"
            checked={form.doNotTrack}
            onCheckedChange={(v) => updateField('doNotTrack', v)}
            description="disable anonymous usage pings"
          />
        </div>
      </TerminalCard>

      <TerminalCard title="updates.conf">
        <div className="space-y-3">
          <EditableField
            label="update check schedule (cron)"
            value={form.updatesCronExpression}
            onChange={(v) => updateField('updatesCronExpression', v)}
            placeholder="0 3 * * *"
          />
          <div className="pl-6 text-[10px] text-neutral-700">
            when mizu looks for new versions — default is 3am daily
          </div>
        </div>
      </TerminalCard>
    </div>
  )
}
