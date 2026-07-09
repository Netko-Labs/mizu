import { IconBolt } from '@tabler/icons-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect } from 'react'
import { type DeployEntity, type DeployEntityStatus, useDeployProject } from './lib'
import { cn } from '@/lib/utils'

interface DeployDialogProps {
  projectId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

const statusIcons: Record<DeployEntityStatus, string> = {
  pending: '\u25cb',
  deploying: '\u25cf',
  success: '\u2713',
  error: '\u2717',
}

const statusColors: Record<DeployEntityStatus, string> = {
  pending: 'text-neutral-600',
  deploying: 'text-blue-500',
  success: 'text-emerald-500',
  error: 'text-red-500',
}

const statusLabels: Record<DeployEntityStatus, string> = {
  pending: 'pending',
  deploying: 'deploying...',
  success: 'running',
  error: 'error',
}

function EntityLine({ entity }: { entity: DeployEntity }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -5 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-3 text-xs"
    >
      <span className="text-neutral-700">&#x25b8;</span>
      <span className="min-w-[120px] text-neutral-400">{entity.name}</span>
      <span className="min-w-[70px] text-neutral-700">{entity.type}</span>
      <span
        className={cn(
          'flex items-center gap-1',
          statusColors[entity.status],
          entity.status === 'deploying' && 'animate-pulse',
        )}
      >
        {statusIcons[entity.status]} {statusLabels[entity.status]}
      </span>
      {entity.error && (
        <span className="truncate text-[10px] text-red-500/70">{entity.error}</span>
      )}
    </motion.div>
  )
}

export function DeployDialog({ projectId, open, onOpenChange }: DeployDialogProps) {
  const { entities, isDeploying, deployAll, buildEntities, setEntities } =
    useDeployProject(projectId)

  // Build entity list when dialog opens
  useEffect(() => {
    if (open) {
      setEntities(buildEntities())
    }
  }, [open, buildEntities, setEntities])

  if (!open) return null

  const canDeploy = entities.some((e) => e.status === 'pending')
  const allDone = entities.length > 0 && entities.every((e) => e.status === 'success')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={() => !isDeploying && onOpenChange(false)}
        onKeyDown={(e) => e.key === 'Escape' && !isDeploying && onOpenChange(false)}
        role="button"
        tabIndex={-1}
      />

      {/* Dialog */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-lg rounded-lg border border-neutral-800 bg-black font-mono shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center gap-2 border-b border-neutral-800 px-4 py-2.5">
          <div className="flex gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-neutral-800" />
            <div className="h-2.5 w-2.5 rounded-full bg-neutral-800" />
            <div className="h-2.5 w-2.5 rounded-full bg-neutral-800" />
          </div>
          <span className="text-[11px] text-neutral-600">deploy.sh</span>
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="mb-4 text-xs text-neutral-600">$ mizu deploy --all</div>

          {entities.length === 0 ? (
            <div className="py-6 text-center text-[10px] text-neutral-700">
              no deployable entities found
            </div>
          ) : (
            <div className="space-y-2">
              <AnimatePresence>
                {entities.map((entity) => (
                  <EntityLine key={entity.id} entity={entity} />
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Deploy action */}
          <div className="mt-6 flex items-center gap-3">
            {!isDeploying && !allDone && (
              <button
                type="button"
                onClick={deployAll}
                disabled={!canDeploy}
                className="flex items-center gap-1.5 rounded border border-neutral-700 bg-neutral-900 px-4 py-1.5 text-xs text-neutral-300 transition-all hover:border-blue-500/50 hover:text-white disabled:opacity-50"
              >
                <IconBolt className="size-3" />
                $ deploy --confirm
              </button>
            )}

            {allDone && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-emerald-500"
              >
                &#x2713; all entities deployed successfully
              </motion.span>
            )}

            {isDeploying && (
              <span className="animate-pulse text-xs text-blue-500">deploying...</span>
            )}

            <div className="ml-auto">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                disabled={isDeploying}
                className="rounded border border-neutral-800 px-3 py-1.5 text-[10px] text-neutral-600 transition-colors hover:text-neutral-400 disabled:opacity-50"
              >
                {allDone ? 'close' : 'cancel'}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
