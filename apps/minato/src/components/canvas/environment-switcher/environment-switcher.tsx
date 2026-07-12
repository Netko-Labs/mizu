import {
  IconCheck,
  IconChevronDown,
  IconPencil,
  IconPlus,
  IconStack2,
  IconTrash,
} from '@tabler/icons-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { EnvironmentDeleteDialog, EnvironmentNameDialog } from './environment-dialogs'
import { type EnvironmentSwitcherProps, useEnvironmentCrud } from './lib'

export function EnvironmentSwitcher({
  projectId,
  environments,
  activeEnvironmentId,
  onSelect,
}: EnvironmentSwitcherProps) {
  const crud = useEnvironmentCrud(projectId, onSelect)
  const active = environments.find((e) => e.id === activeEnvironmentId) ?? null
  const target = crud.targetId ? environments.find((e) => e.id === crud.targetId) : null

  if (!active) return null

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(
            'group/env flex items-center gap-1 rounded font-mono text-xs outline-none transition-colors',
            'text-neutral-400 hover:text-white data-[state=open]:text-white',
            'focus-visible:ring-2 focus-visible:ring-blue-500/40',
          )}
        >
          <IconStack2 className="size-3 shrink-0 text-neutral-600" strokeWidth={1.5} />
          <span className="truncate">{active.name}</span>
          <IconChevronDown
            className="size-3 shrink-0 text-neutral-700 transition-colors group-hover/env:text-neutral-400 group-data-[state=open]/env:text-neutral-400"
            strokeWidth={1.5}
          />
        </DropdownMenuTrigger>

        <DropdownMenuContent
          side="bottom"
          align="start"
          sideOffset={8}
          className="w-60 rounded-lg border-neutral-800 bg-black p-0 font-mono"
        >
          <div className="border-b border-neutral-800 px-3 py-2">
            <p className="text-[10px] text-neutral-600"># environments</p>
          </div>

          <div className="p-1">
            {environments.map((env) => {
              const isCurrent = env.id === active.id
              return (
                <DropdownMenuItem
                  key={env.id}
                  onClick={() => onSelect(env.id)}
                  className={cn(
                    'flex items-center gap-2 rounded-md px-2 py-1.5 text-xs',
                    isCurrent
                      ? 'text-neutral-200'
                      : 'text-neutral-500 focus:bg-neutral-950 focus:text-neutral-200',
                  )}
                >
                  <span className="flex-1 truncate">{env.name}</span>
                  {env.isDefault && (
                    <span className="shrink-0 text-[9px] text-neutral-600">default</span>
                  )}
                  {isCurrent && <IconCheck className="size-3 shrink-0 text-blue-500" />}
                </DropdownMenuItem>
              )
            })}
          </div>

          <DropdownMenuSeparator className="bg-neutral-800" />

          <div className="p-1">
            <DropdownMenuItem
              onClick={() => crud.openRename(active.id, active.name)}
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-neutral-500 focus:bg-neutral-950 focus:text-neutral-300"
            >
              <IconPencil className="size-3" />
              <span>rename environment</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={crud.openCreate}
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-neutral-500 focus:bg-neutral-950 focus:text-neutral-300"
            >
              <IconPlus className="size-3" />
              <span>new environment</span>
            </DropdownMenuItem>
            {!active.isDefault && (
              <DropdownMenuItem
                onClick={() => crud.openDelete(active.id)}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-red-500/70 focus:bg-red-500/10 focus:text-red-400"
              >
                <IconTrash className="size-3" />
                <span>delete environment</span>
              </DropdownMenuItem>
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <EnvironmentNameDialog
        open={crud.mode === 'create' || crud.mode === 'rename'}
        mode={crud.mode === 'rename' ? 'rename' : 'create'}
        name={crud.name}
        onNameChange={crud.setName}
        onSubmit={crud.submitName}
        onClose={crud.close}
        isPending={crud.isSubmitting}
        error={crud.submitError}
      />
      <EnvironmentDeleteDialog
        open={crud.mode === 'delete'}
        targetName={target?.name}
        onDelete={crud.confirmDelete}
        onClose={crud.close}
        isPending={crud.isDeleting}
        error={crud.deleteError}
      />
    </>
  )
}
