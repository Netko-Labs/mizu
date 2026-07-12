import { TerminalCard } from '@/components/shared/terminal'
import { authClient } from '@/integrations/auth'

// Read-only view of the caller's active team and its members. Team CRUD and
// switching live in the sidebar team-switcher; this surfaces who shares the
// tenant and at what role (owner/admin/member).
export function SettingsTeamTab() {
  const { data: team, isPending } = authClient.useActiveOrganization()

  if (isPending) {
    return <div className="h-48 animate-pulse rounded-lg bg-neutral-900" />
  }

  if (!team) {
    return (
      <TerminalCard title="team.conf">
        <div className="py-6 text-center text-xs text-neutral-500">no active team</div>
      </TerminalCard>
    )
  }

  const members = team.members ?? []

  return (
    <div className="space-y-6">
      <TerminalCard title="team.conf">
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-12 shrink-0 text-neutral-600">name</span>
            <span className="text-neutral-300">{team.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-12 shrink-0 text-neutral-600">slug</span>
            <span className="text-neutral-500">{team.slug}</span>
          </div>
        </div>
      </TerminalCard>

      <TerminalCard title={`members (${members.length})`}>
        <div className="space-y-2">
          {members.map((member) => (
            <div key={member.id} className="flex items-center justify-between gap-3 text-xs">
              <span className="truncate text-neutral-300">
                {member.user?.email ?? member.user?.name ?? member.userId}
              </span>
              <span className="shrink-0 rounded border border-neutral-800 px-2 py-0.5 text-[10px] text-neutral-500">
                {member.role}
              </span>
            </div>
          ))}
        </div>
      </TerminalCard>
    </div>
  )
}
