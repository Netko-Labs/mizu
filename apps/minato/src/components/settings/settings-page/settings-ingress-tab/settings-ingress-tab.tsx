import { EditableField, TerminalCard } from '@/components/shared/terminal'
import type { SettingsStatsTabProps } from '../lib'
import { SettingsStatRow } from '../settings-stat-row'

export function SettingsIngressTab({ form, updateField, stats }: SettingsStatsTabProps) {
  const tailscale = stats?.mizu.tailscale

  return (
    <div className="space-y-6">
      <TerminalCard title="ingress.conf">
        <div className="space-y-3">
          <EditableField
            label="base domain"
            value={form.domain}
            onChange={(v) => updateField('domain', v)}
            placeholder="localhost"
          />
          <div className="pl-6 text-[10px] text-neutral-700">
            apps are served at {'{service}-{project}'}.{form.domain || '<domain>'} — with a
            cloudflare token on the server, https is automatic
          </div>
        </div>
      </TerminalCard>

      <TerminalCard title="network identity">
        <div className="space-y-3">
          <EditableField
            label="dns server"
            value={form.dns}
            onChange={(v) => updateField('dns', v)}
            placeholder="1.1.1.1"
          />
          <EditableField
            label="public ipv4"
            value={form.publicIpv4}
            onChange={(v) => updateField('publicIpv4', v)}
            placeholder="0.0.0.0"
          />
          <EditableField
            label="public ipv6"
            value={form.publicIpv6}
            onChange={(v) => updateField('publicIpv6', v)}
            placeholder="::1"
          />
          <div className="pl-6 text-[10px] text-neutral-700">
            how this machine is reached from outside your network
          </div>
        </div>
      </TerminalCard>

      <TerminalCard title="tailnet.status — read-only">
        <div className="space-y-2.5">
          <SettingsStatRow
            label="tailnet name"
            value={tailscale ? tailscale.dnsName : 'not connected'}
            accent={Boolean(tailscale)}
          />
          <SettingsStatRow label="tailnet ip" value={tailscale?.ip} />
        </div>
      </TerminalCard>
    </div>
  )
}
