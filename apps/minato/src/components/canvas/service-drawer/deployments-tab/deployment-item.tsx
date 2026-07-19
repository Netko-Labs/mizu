import { IconRotateClockwise2 } from '@tabler/icons-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { deploymentImageRef, formatRelativeTime } from './lib'
import type { DeploymentItemProps } from './lib/types'

/** One history row: status dot, image ref, trigger, time, rollback. */
export function DeploymentItem({
  deployment,
  isCurrent,
  onRollback,
  rollbackPending,
}: DeploymentItemProps) {
  const ok = deployment.status === 'success'

  return (
    <div className="flex items-center gap-2.5 rounded-md border border-border bg-background/60 px-3 py-2">
      <span
        className={cn('size-2 shrink-0 rounded-full', ok ? 'bg-emerald-400' : 'bg-red-400')}
        title={deployment.status}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate font-mono text-[11px] text-foreground/90">
            {deploymentImageRef(deployment.sourceConfig)}
          </span>
          {isCurrent && (
            <Badge variant="secondary" className="shrink-0 text-[9px] uppercase">
              Current
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
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
      {ok && !isCurrent && (
        <Button
          variant="outline"
          size="xs"
          disabled={rollbackPending}
          onClick={() => onRollback(deployment.id)}
          className="shrink-0"
        >
          <IconRotateClockwise2 className="size-3" />
          Rollback
        </Button>
      )}
    </div>
  )
}
