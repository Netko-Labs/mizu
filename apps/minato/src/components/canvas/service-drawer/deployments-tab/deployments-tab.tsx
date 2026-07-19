import { useQuery } from '@tanstack/react-query'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Spinner } from '@/components/ui/spinner'
import { deploymentQueries } from '@/shared/api'
import { DeploymentItem } from './deployment-item'
import { useRollback } from './lib'
import type { DeploymentsTabProps } from './lib/types'

/** Deploy history, newest first, with rollback-to-snapshot. */
export function DeploymentsTab({ service }: DeploymentsTabProps) {
  const { data: deployments, isLoading } = useQuery(deploymentQueries.byService(service.id))
  const { confirmId, setConfirmId, rollback, isPending } = useRollback({
    serviceId: service.id,
    projectId: service.projectId,
  })

  const currentId = deployments?.find(
    (d) => d.status === 'success' && d.containerId === service.containerId,
  )?.id

  return (
    <div className="space-y-2 p-4">
      {isLoading && (
        <div className="flex items-center gap-2 py-6 text-xs text-muted-foreground">
          <Spinner className="size-3" /> Loading history…
        </div>
      )}
      {!isLoading && (!deployments || deployments.length === 0) && (
        <div className="py-8 text-center text-xs text-muted-foreground">
          No deployments yet — hit Deploy and history shows up here.
        </div>
      )}
      {deployments?.map((deployment) => (
        <DeploymentItem
          key={deployment.id}
          deployment={deployment}
          isCurrent={deployment.id === currentId}
          onRollback={setConfirmId}
          rollbackPending={isPending}
        />
      ))}

      <AlertDialog open={confirmId !== null} onOpenChange={(open) => !open && setConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Roll back to this deployment?</AlertDialogTitle>
            <AlertDialogDescription>
              The service's image and variables revert to this deployment's snapshot and it
              redeploys immediately. Variables changed since then are replaced.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => confirmId && rollback(confirmId)}>
              Roll back
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
