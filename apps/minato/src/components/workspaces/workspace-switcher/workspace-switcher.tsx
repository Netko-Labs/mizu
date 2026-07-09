import {
  IconAlertTriangle,
  IconCheck,
  IconChevronDown,
  IconPencil,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { type FormEvent, useState } from 'react'
import { useWorkspace } from '@/components/core/workspace'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'
import { createWorkspace, deleteWorkspace, updateWorkspace, workspaceKeys } from '@/shared/api'

interface WorkspaceSwitcherProps {
  collapsed?: boolean
}

type ActiveDialog = 'create' | 'edit' | 'delete' | null

export function WorkspaceSwitcher({ collapsed }: WorkspaceSwitcherProps) {
  const queryClient = useQueryClient()
  const [activeDialog, setActiveDialog] = useState<ActiveDialog>(null)
  const [targetWorkspaceId, setTargetWorkspaceId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [confirmName, setConfirmName] = useState('')

  const { workspaces, currentWorkspace, setCurrentWorkspaceId, isLoading } = useWorkspace()

  const targetWorkspace = targetWorkspaceId
    ? workspaces.find((w) => w.id === targetWorkspaceId)
    : null

  const invalidateList = () => queryClient.invalidateQueries({ queryKey: workspaceKeys.all })

  const createMutation = useMutation({ mutationFn: createWorkspace, onSuccess: invalidateList })
  const updateMutation = useMutation({ mutationFn: updateWorkspace, onSuccess: invalidateList })
  const deleteMutation = useMutation({ mutationFn: deleteWorkspace, onSuccess: invalidateList })

  // --- Dialog helpers ---

  const openCreate = () => {
    setName('')
    setActiveDialog('create')
  }

  const openEdit = (workspaceId: string, currentName: string) => {
    setTargetWorkspaceId(workspaceId)
    setName(currentName)
    setActiveDialog('edit')
  }

  const openDelete = (workspaceId: string) => {
    setTargetWorkspaceId(workspaceId)
    setConfirmName('')
    setActiveDialog('delete')
  }

  const closeDialog = () => {
    setActiveDialog(null)
    setTargetWorkspaceId(null)
    setName('')
    setConfirmName('')
    createMutation.reset()
    updateMutation.reset()
    deleteMutation.reset()
  }

  // --- Handlers ---

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    try {
      const workspace = await createMutation.mutateAsync({ name: name.trim() })
      setCurrentWorkspaceId(workspace.id)
      closeDialog()
    } catch {
      // error shown via mutation state
    }
  }

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !targetWorkspaceId) return
    try {
      await updateMutation.mutateAsync({ workspaceId: targetWorkspaceId, name: name.trim() })
      closeDialog()
    } catch {
      // error shown via mutation state
    }
  }

  const handleDelete = async () => {
    if (!targetWorkspaceId) return
    try {
      await deleteMutation.mutateAsync(targetWorkspaceId)
      if (targetWorkspaceId === currentWorkspace?.id) {
        const remaining = workspaces.find((w) => w.id !== targetWorkspaceId)
        if (remaining) setCurrentWorkspaceId(remaining.id)
      }
      closeDialog()
    } catch {
      // error shown via mutation state
    }
  }

  // --- Loading state ---

  if (isLoading) {
    return (
      <div
        className={cn(
          'flex items-center font-mono',
          collapsed
            ? 'justify-center p-1'
            : 'gap-2 rounded-lg border border-neutral-800 bg-black p-2',
        )}
      >
        <div
          className={cn('animate-pulse rounded bg-neutral-800', collapsed ? 'size-8' : 'size-6')}
        />
        {!collapsed && <div className="h-4 w-20 animate-pulse rounded bg-neutral-800" />}
      </div>
    )
  }

  // --- No workspace yet ---

  if (!currentWorkspace) {
    return (
      <>
        <button
          type="button"
          onClick={openCreate}
          disabled={createMutation.isPending}
          className={cn(
            'flex w-full items-center font-mono transition-all duration-200',
            collapsed
              ? 'justify-center rounded-md p-1 hover:bg-neutral-900'
              : 'gap-2 rounded-lg border border-neutral-800 bg-black px-2.5 py-2 text-xs text-neutral-500 hover:border-neutral-700 hover:text-neutral-300',
          )}
        >
          <IconPlus
            className={cn(collapsed ? 'size-5 text-neutral-600' : 'size-4 text-neutral-600')}
            strokeWidth={1.5}
          />
          {!collapsed && <span>{createMutation.isPending ? 'creating...' : '+ workspace'}</span>}
        </button>
        {renderCreateDialog()}
      </>
    )
  }

  // --- Main render ---

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(
            'flex w-full items-center font-mono outline-none transition-all duration-200',
            collapsed
              ? 'justify-center rounded-md p-1 hover:bg-neutral-900'
              : 'gap-2 rounded-lg border border-neutral-800 bg-black px-2.5 py-2 hover:border-neutral-700 data-[state=open]:border-neutral-700',
          )}
        >
          <div
            className={cn(
              'flex shrink-0 items-center justify-center rounded font-medium text-blue-500',
              collapsed
                ? 'size-8 border border-neutral-800 bg-neutral-950 text-xs'
                : 'size-6 border border-neutral-800 bg-neutral-950 text-[10px]',
            )}
          >
            {currentWorkspace.name.slice(0, 1).toUpperCase()}
          </div>

          {!collapsed && (
            <>
              <span className="flex-1 truncate text-left text-xs text-neutral-300">
                {currentWorkspace.name}
              </span>
              <IconChevronDown className="size-3 shrink-0 text-neutral-600" />
            </>
          )}
        </DropdownMenuTrigger>

        <DropdownMenuContent
          side={collapsed ? 'right' : 'bottom'}
          align="start"
          sideOffset={8}
          className="w-64 rounded-lg border-neutral-800 bg-black p-0 font-mono"
        >
          {/* Header */}
          <div className="border-b border-neutral-800 px-3 py-2">
            <p className="text-[10px] text-neutral-600"># workspaces</p>
          </div>

          {/* Workspace list */}
          <div className="p-1">
            {workspaces.map((workspace) => {
              const isCurrent = workspace.id === currentWorkspace.id
              return (
                <DropdownMenuItem
                  key={workspace.id}
                  className={cn(
                    'flex items-center gap-2 rounded-md px-2 py-1.5 text-xs',
                    isCurrent
                      ? 'text-neutral-200'
                      : 'text-neutral-500 focus:bg-neutral-950 focus:text-neutral-200',
                  )}
                  onClick={() => setCurrentWorkspaceId(workspace.id)}
                >
                  <div
                    className={cn(
                      'flex size-5 shrink-0 items-center justify-center rounded',
                      'border border-neutral-800 bg-neutral-950',
                      'text-[10px] font-medium',
                      isCurrent ? 'text-blue-500' : 'text-neutral-600',
                    )}
                  >
                    {workspace.name.slice(0, 1).toUpperCase()}
                  </div>
                  <span className="flex-1 truncate">{workspace.name}</span>
                  {isCurrent && <IconCheck className="size-3 shrink-0 text-blue-500" />}
                </DropdownMenuItem>
              )
            })}
          </div>

          <DropdownMenuSeparator className="bg-neutral-800" />

          {/* Actions */}
          <div className="p-1">
            <DropdownMenuItem
              onClick={() => openEdit(currentWorkspace.id, currentWorkspace.name)}
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-neutral-500 focus:bg-neutral-950 focus:text-neutral-300"
            >
              <IconPencil className="size-3" />
              <span>rename workspace</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={openCreate}
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-neutral-500 focus:bg-neutral-950 focus:text-neutral-300"
            >
              <IconPlus className="size-3" />
              <span>new workspace</span>
            </DropdownMenuItem>

            {workspaces.length > 1 && (
              <DropdownMenuItem
                onClick={() => openDelete(currentWorkspace.id)}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-red-500/70 focus:bg-red-500/10 focus:text-red-400"
              >
                <IconTrash className="size-3" />
                <span>delete workspace</span>
              </DropdownMenuItem>
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {renderCreateDialog()}
      {renderEditDialog()}
      {renderDeleteDialog()}
    </>
  )

  // --- Dialogs ---

  function renderCreateDialog() {
    return (
      <Dialog open={activeDialog === 'create'} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="border-neutral-800 bg-neutral-950 font-mono sm:max-w-md">
          <form onSubmit={handleCreate}>
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
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Studio, Labs, Client Work..."
                    maxLength={100}
                    autoFocus
                    disabled={createMutation.isPending}
                    className="border-neutral-800 bg-black font-mono"
                  />
                  <FieldDescription>Keep it short and recognizable.</FieldDescription>
                </Field>
              </FieldGroup>
              {createMutation.error && (
                <p className="mt-3 text-xs text-red-500">
                  <span className="text-red-700">▸</span> {createMutation.error.message}
                </p>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={closeDialog}
                disabled={createMutation.isPending}
                className="border-neutral-800 bg-black font-mono text-neutral-400 hover:bg-neutral-900 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!name.trim() || createMutation.isPending}
                className="bg-blue-600 font-mono text-white hover:bg-blue-500"
              >
                {createMutation.isPending ? (
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

  function renderEditDialog() {
    return (
      <Dialog open={activeDialog === 'edit'} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="border-neutral-800 bg-neutral-950 font-mono sm:max-w-md">
          <form onSubmit={handleUpdate}>
            <DialogHeader>
              <DialogTitle className="font-mono text-neutral-200">Rename Workspace</DialogTitle>
              <DialogDescription className="font-mono text-neutral-500">
                Update the name for{' '}
                <span className="text-neutral-300">{targetWorkspace?.name}</span>.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="edit-workspace-name">New name</FieldLabel>
                  <Input
                    id="edit-workspace-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Studio, Labs, Client Work..."
                    maxLength={100}
                    autoFocus
                    disabled={updateMutation.isPending}
                    className="border-neutral-800 bg-black font-mono"
                  />
                </Field>
              </FieldGroup>
              {updateMutation.error && (
                <p className="mt-3 text-xs text-red-500">
                  <span className="text-red-700">▸</span> {updateMutation.error.message}
                </p>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={closeDialog}
                disabled={updateMutation.isPending}
                className="border-neutral-800 bg-black font-mono text-neutral-400 hover:bg-neutral-900 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  !name.trim() || name.trim() === targetWorkspace?.name || updateMutation.isPending
                }
                className="bg-blue-600 font-mono text-white hover:bg-blue-500"
              >
                {updateMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <Spinner className="size-3" />
                    saving...
                  </span>
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

  function renderDeleteDialog() {
    const deleteTargetName = targetWorkspace?.name ?? ''
    const isConfirmed = confirmName === deleteTargetName

    return (
      <Dialog open={activeDialog === 'delete'} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="border-neutral-800 bg-neutral-950 font-mono sm:max-w-md">
          <DialogHeader>
            <div className="mb-3 flex size-10 items-center justify-center rounded-lg border border-red-500/20 bg-red-500/5">
              <IconAlertTriangle className="size-5 text-red-500" />
            </div>
            <DialogTitle className="font-mono text-neutral-200">Delete Workspace</DialogTitle>
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
                associated with this workspace will be permanently removed.
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
                  onChange={(e) => setConfirmName(e.target.value)}
                  placeholder={deleteTargetName}
                  autoFocus
                  autoComplete="off"
                  disabled={deleteMutation.isPending}
                  className="border-neutral-800 bg-black font-mono"
                />
              </Field>
            </FieldGroup>

            {deleteMutation.error && (
              <p className="text-xs text-red-500">
                <span className="text-red-700">▸</span> {deleteMutation.error.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={closeDialog}
              disabled={deleteMutation.isPending}
              className="border-neutral-800 bg-black font-mono text-neutral-400 hover:bg-neutral-900 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleDelete}
              disabled={!isConfirmed || deleteMutation.isPending}
              className="bg-red-600 font-mono text-white hover:bg-red-500 disabled:opacity-40"
            >
              {deleteMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <Spinner className="size-3" />
                  deleting...
                </span>
              ) : (
                'delete workspace'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }
}
