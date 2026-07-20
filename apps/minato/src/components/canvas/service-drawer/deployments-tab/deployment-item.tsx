import { IconRotateClockwise2 } from '@tabler/icons-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { deploymentImageRef, formatRelativeTime } from './lib'
import type { DeploymentItemProps } from './lib/types'

/** One timeline row: rail dot, image ref, trigger + time, rollback. */
export function DeploymentItem({
  deployment,
  isCurrent,
  isLast,
  onRollback,
  rollbackPending,
}: DeploymentItemProps) {
  const ok = deployment.status === 'success'

  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <span
          className={cn(
            'mt-1 size-2.5 shrink-0 rounded-full ring-2 ring-background',
            ok ? 'bg-emerald-400' : 'bg-red-400',
          )}
          title={deployment.status}
        />
        {!isLast && <span className="w-px flex-1 bg-border" />}
      </div>
      <div className="min-w-0 flex-1 pb-4">
        <div className="flex items-center gap-2">
          <span className="truncate font-mono text-[11px] text-foreground/90">
            {deploymentImageRef(deployment.sourceConfig)}
          </span>
          {isCurrent && (
            <Badge variant="secondary" className="shrink-0 text-[9px] uppercase">
              Current
            </Badge>
          )}
          {ok && !isCurrent && (
            <Button
              variant="outline"
              size="xs"
              disabled={rollbackPending}
              onClick={() => onRollback(deployment.id)}
              className="ml-auto shrink-0"
            >
              <IconRotateClockwise2 className="size-3" />
              Rollback
            </Button>
          )}
        </div>
        <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <span className="font-mono">{deployment.id.slice(0, 8)}</span>
          <span>·</span>
          <span>{deployment.trigger}</span>
          <span>·</span>
          <span>{formatRelativeTime(deployment.createdAt)}</span>
        </div>
        {deployment.error && (
          <div className="mt-0.5 truncate text-[11px] text-red-400/80">{deployment.error}</div>
        )}
      </div>
    </div>
  )
}
