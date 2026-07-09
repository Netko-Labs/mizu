import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import type { WorkspaceCreateDialogProps } from '../lib'

export function WorkspaceCreateDialog({
  open,
  name,
  onNameChange,
  onSubmit,
  onClose,
  isPending,
  error,
}: WorkspaceCreateDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent className="border-neutral-800 bg-neutral-950 font-mono sm:max-w-md">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle className="font-mono text-neutral-200">Create Workspace</DialogTitle>
            <DialogDescription className="font-mono text-neutral-500">
              Workspaces keep related projects grouped and organized.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="create-workspace-name">Workspace name</FieldLabel>
                <Input
                  id="create-workspace-name"
                  value={name}
                  onChange={(e) => onNameChange(e.target.value)}
                  placeholder="Studio, Labs, Client Work..."
                  maxLength={100}
                  autoFocus
                  disabled={isPending}
                  className="border-neutral-800 bg-black font-mono"
                />
                <FieldDescription>Keep it short and recognizable.</FieldDescription>
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
                  creating...
                </span>
              ) : (
                'create'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
