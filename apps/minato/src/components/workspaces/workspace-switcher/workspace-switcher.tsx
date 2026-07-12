import { IconCheck, IconChevronDown, IconPencil, IconPlus, IconTrash } from '@tabler/icons-react'
import { useWorkspace } from '@/components/core/workspace'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { useWorkspaceCrud, type WorkspaceSwitcherProps } from './lib'
import {
  WorkspaceCreateDialog,
  WorkspaceDeleteDialog,
  WorkspaceRenameDialog,
} from './workspace-dialogs'

export function WorkspaceSwitcher({ collapsed }: WorkspaceSwitcherProps) {
  const { workspaces, currentWorkspace, setCurrentWorkspaceId, isLoading } = useWorkspace()

  const {
    activeDialog,
    targetWorkspace,
    name,
    setName,
    confirmName,
    setConfirmName,
    openCreate,
    openEdit,
    openDelete,
    closeDialog,
    handleCreate,
    handleUpdate,
    handleDelete,
    isCreating,
    createError,
    isUpdating,
    updateError,
    isDeleting,
    deleteError,
  } = useWorkspaceCrud()

  const createDialog = (
    <WorkspaceCreateDialog
      open={activeDialog === 'create'}
      name={name}
      onNameChange={setName}
      onSubmit={handleCreate}
      onClose={closeDialog}
      isPending={isCreating}
      error={createError}
    />
  )

  // --- Loading state ---

  if (isLoading) {
    return collapsed ? (
      <div className="mx-auto size-8 animate-pulse rounded-md bg-neutral-800" />
    ) : (
      <div className="h-3 w-20 animate-pulse rounded bg-neutral-800" />
    )
  }

  // --- No workspace yet ---

  if (!currentWorkspace) {
    return (
      <>
        <button
          type="button"
          onClick={openCreate}
          disabled={isCreating}
          className={cn(
            'flex items-center font-mono outline-none transition-colors duration-200',
            'focus-visible:ring-2 focus-visible:ring-blue-500/40',
            collapsed
              ? 'mx-auto size-8 justify-center rounded-md bg-blue-500/10 text-blue-400 hover:bg-blue-500/20'
              : 'min-w-0 gap-1 rounded text-left text-xs text-neutral-500 hover:text-white',
          )}
        >
          <IconPlus
            className={cn('shrink-0', collapsed ? 'size-4' : 'size-3 text-neutral-600')}
            strokeWidth={1.5}
          />
          {!collapsed && <span className="truncate">{isCreating ? 'creating...' : 'team'}</span>}
        </button>
        {createDialog}
      </>
    )
  }

  // --- Main render ---

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label={collapsed ? `Team: ${currentWorkspace.name}` : undefined}
          className={cn(
            'group/switcher flex items-center font-mono outline-none transition-colors duration-200',
            'focus-visible:ring-2 focus-visible:ring-blue-500/40',
            collapsed
              ? cn(
                  'mx-auto size-8 justify-center rounded-md bg-blue-500/10 text-sm leading-none',
                  'text-blue-400 hover:bg-blue-500/20 data-[state=open]:bg-blue-500/20',
                )
              : cn(
                  'min-w-0 gap-1 rounded text-left text-xs text-neutral-400',
                  'hover:text-white data-[state=open]:text-white',
                ),
          )}
        >
          {collapsed ? (
            '水'
          ) : (
            <>
              <span className="truncate">{currentWorkspace.name}</span>
              <IconChevronDown
                className="size-3 shrink-0 text-neutral-700 transition-colors group-hover/switcher:text-neutral-400 group-data-[state=open]/switcher:text-neutral-400"
                strokeWidth={1.5}
              />
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
            <p className="text-[10px] text-neutral-600"># teams</p>
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
              <span>rename team</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={openCreate}
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-neutral-500 focus:bg-neutral-950 focus:text-neutral-300"
            >
              <IconPlus className="size-3" />
              <span>new team</span>
            </DropdownMenuItem>

            {workspaces.length > 1 && (
              <DropdownMenuItem
                onClick={() => openDelete(currentWorkspace.id)}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-red-500/70 focus:bg-red-500/10 focus:text-red-400"
              >
                <IconTrash className="size-3" />
                <span>delete team</span>
              </DropdownMenuItem>
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {createDialog}
      <WorkspaceRenameDialog
        open={activeDialog === 'edit'}
        name={name}
        targetName={targetWorkspace?.name}
        onNameChange={setName}
        onSubmit={handleUpdate}
        onClose={closeDialog}
        isPending={isUpdating}
        error={updateError}
      />
      <WorkspaceDeleteDialog
        open={activeDialog === 'delete'}
        confirmName={confirmName}
        targetName={targetWorkspace?.name}
        onConfirmNameChange={setConfirmName}
        onDelete={handleDelete}
        onClose={closeDialog}
        isPending={isDeleting}
        error={deleteError}
      />
    </>
  )
}
