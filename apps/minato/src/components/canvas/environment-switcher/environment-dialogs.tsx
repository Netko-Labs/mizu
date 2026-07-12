import type { FormEvent } from 'react'
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

interface NameDialogProps {
  open: boolean
  mode: 'create' | 'rename'
  name: string
  onNameChange: (name: string) => void
  onSubmit: (e: FormEvent) => void
  onClose: () => void
  isPending: boolean
  error: Error | null
}

export function EnvironmentNameDialog({
  open,
  mode,
  name,
  onNameChange,
  onSubmit,
  onClose,
  isPending,
  error,
}: NameDialogProps) {
  const creating = mode === 'create'
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="border-neutral-800 bg-neutral-950 font-mono sm:max-w-md">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle className="font-mono text-neutral-200">
              {creating ? 'New Environment' : 'Rename Environment'}
            </DialogTitle>
            <DialogDescription className="font-mono text-neutral-500">
              Environments are isolated deployments — their own services, databases, network, and
              URLs.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="env-name">Environment name</FieldLabel>
                <Input
                  id="env-name"
                  value={name}
                  onChange={(e) => onNameChange(e.target.value)}
                  placeholder="staging, preview, dev..."
                  maxLength={50}
                  autoFocus
                  disabled={isPending}
                  className="border-neutral-800 bg-black font-mono"
                />
              </Field>
            </FieldGroup>
            {error && (
              <p className="mt-3 text-xs text-red-500">
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
              type="submit"
              disabled={!name.trim() || isPending}
              className="bg-blue-600 font-mono text-white hover:bg-blue-500"
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <Spinner className="size-3" />
                  {creating ? 'creating...' : 'saving...'}
                </span>
              ) : creating ? (
                'create'
              ) : (
                'save'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

interface DeleteDialogProps {
  open: boolean
  targetName: string | undefined
  onDelete: () => void
  onClose: () => void
  isPending: boolean
  error: Error | null
}

export function EnvironmentDeleteDialog({
  open,
  targetName,
  onDelete,
  onClose,
  isPending,
  error,
}: DeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="border-neutral-800 bg-neutral-950 font-mono sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-mono text-neutral-200">Delete Environment</DialogTitle>
          <DialogDescription className="font-mono text-neutral-500">
            This permanently destroys{' '}
            <span className="font-medium text-neutral-200">{targetName}</span> and every service and
            database deployed in it.
          </DialogDescription>
        </DialogHeader>
        {error && (
          <p className="text-xs text-red-500">
            <span className="text-red-700">▸</span> {error.message}
          </p>
        )}
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
            disabled={isPending}
            className="bg-red-600 font-mono text-white hover:bg-red-500"
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <Spinner className="size-3" />
                deleting...
              </span>
            ) : (
              'delete environment'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
