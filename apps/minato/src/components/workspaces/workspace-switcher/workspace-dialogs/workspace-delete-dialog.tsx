import { IconAlertTriangle } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import type { WorkspaceDeleteDialogProps } from '../lib'

export function WorkspaceDeleteDialog({
  open,
  confirmName,
  targetName,
  onConfirmNameChange,
  onDelete,
  onClose,
  isPending,
  error,
}: WorkspaceDeleteDialogProps) {
  const deleteTargetName = targetName ?? ''
  const isConfirmed = confirmName === deleteTargetName

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent className="border-neutral-800 bg-neutral-950 font-mono sm:max-w-md">
        <DialogHeader>
          <div className="mb-3 flex size-10 items-center justify-center rounded-lg border border-red-500/20 bg-red-500/5">
            <IconAlertTriangle className="size-5 text-red-500" />
          </div>
          <DialogTitle className="font-mono text-neutral-200">Delete Team</DialogTitle>
          <DialogDescription className="font-mono text-neutral-500">
            This will permanently destroy{' '}
            <span className="font-medium text-neutral-200">{deleteTargetName}</span> and
            cascade-delete all projects, services, databases, and volumes within it.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="rounded-lg border border-red-500/10 bg-red-500/5 px-3 py-2.5">
            <p className="text-[11px] leading-relaxed text-red-400/80">
              <span className="text-red-500">▸</span> This action is irreversible. All data
              associated with this team will be permanently removed.
            </p>
          </div>

          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="delete-confirm-name" className="text-neutral-500">
                Type <span className="text-neutral-300">{deleteTargetName}</span> to confirm
              </FieldLabel>
              <Input
                id="delete-confirm-name"
                value={confirmName}
                onChange={(e) => onConfirmNameChange(e.target.value)}
                placeholder={deleteTargetName}
                autoFocus
                autoComplete="off"
                disabled={isPending}
                className="border-neutral-800 bg-black font-mono"
              />
            </Field>
          </FieldGroup>

          {error && (
            <p className="text-xs text-red-500">
              <span className="text-red-700">▸</span> {error.message}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isPending}
            className="border-neutral-800 bg-black font-mono text-neutral-400 hover:bg-neutral-900 hover:text-white"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onDelete}
            disabled={!isConfirmed || isPending}
            className="bg-red-600 font-mono text-white hover:bg-red-500 disabled:opacity-40"
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <Spinner className="size-3" />
                deleting...
              </span>
            ) : (
              'delete team'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
