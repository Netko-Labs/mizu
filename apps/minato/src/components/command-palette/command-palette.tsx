'use client'

import {
  IconBox,
  IconDatabase,
  IconFolder,
  IconPlus,
  IconSearch,
  IconSettings,
  IconZoomIn,
  IconZoomOut,
  IconZoomReset,
} from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useCallback, useState } from 'react'
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command'
import { useWorkspace } from '@/providers/workspace-provider'
import { projectQueries } from '@/shared/api'

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface Project {
  id: string
  name: string
  slug: string
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const { currentWorkspace } = useWorkspace()

  // Fetch projects for navigation
  const { data: projects } = useQuery({
    ...projectQueries.list(currentWorkspace?.id ?? ''),
    enabled: open && Boolean(currentWorkspace),
  })

  const runCommand = useCallback(
    (command: () => void) => {
      onOpenChange(false)
      command()
    },
    [onOpenChange],
  )

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <Command shouldFilter loop>
        <CommandInput
          placeholder="Type a command or search..."
          value={search}
          onValueChange={setSearch}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          {/* Navigation commands */}
          <CommandGroup heading="Navigation">
            <CommandItem onSelect={() => runCommand(() => navigate({ to: '/projects' }))}>
              <IconFolder className="mr-2 size-4" />
              <span>Go to Projects</span>
              <CommandShortcut>G P</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate({ to: '/' }))}>
              <IconSettings className="mr-2 size-4" />
              <span>Go to Settings</span>
              <CommandShortcut>G S</CommandShortcut>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          {/* Project commands */}
          <CommandGroup heading="Projects">
            <CommandItem
              onSelect={() =>
                runCommand(() => {
                  // TODO: Open create project dialog
                  navigate({ to: '/projects' })
                })
              }
            >
              <IconPlus className="mr-2 size-4" />
              <span>Create New Project</span>
              <CommandShortcut>N P</CommandShortcut>
            </CommandItem>

            {/* List recent projects */}
            {(projects as Project[] | undefined)?.slice(0, 5).map((project) => (
              <CommandItem
                key={project.id}
                onSelect={() =>
                  runCommand(() =>
                    navigate({
                      to: '/projects/$slug',
                      params: { slug: project.slug },
                    }),
                  )
                }
              >
                <IconFolder className="mr-2 size-4" />
                <span>{project.name}</span>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          {/* Canvas commands (only shown when on a project page) */}
          <CommandGroup heading="Canvas">
            <CommandItem
              onSelect={() =>
                runCommand(() => {
                  // TODO: Add service to canvas
                })
              }
            >
              <IconBox className="mr-2 size-4" />
              <span>Add Service</span>
              <CommandShortcut>N S</CommandShortcut>
            </CommandItem>
            <CommandItem
              onSelect={() =>
                runCommand(() => {
                  // TODO: Add database to canvas
                })
              }
            >
              <IconDatabase className="mr-2 size-4" />
              <span>Add Database</span>
              <CommandShortcut>N D</CommandShortcut>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          {/* View commands */}
          <CommandGroup heading="View">
            <CommandItem
              onSelect={() =>
                runCommand(() => {
                  // TODO: Zoom in
                })
              }
            >
              <IconZoomIn className="mr-2 size-4" />
              <span>Zoom In</span>
              <CommandShortcut>+</CommandShortcut>
            </CommandItem>
            <CommandItem
              onSelect={() =>
                runCommand(() => {
                  // TODO: Zoom out
                })
              }
            >
              <IconZoomOut className="mr-2 size-4" />
              <span>Zoom Out</span>
              <CommandShortcut>-</CommandShortcut>
            </CommandItem>
            <CommandItem
              onSelect={() =>
                runCommand(() => {
                  // TODO: Fit view
                })
              }
            >
              <IconZoomReset className="mr-2 size-4" />
              <span>Fit to View</span>
              <CommandShortcut>0</CommandShortcut>
            </CommandItem>
          </CommandGroup>

          {/* Search command */}
          {search && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Search">
                <CommandItem
                  onSelect={() =>
                    runCommand(() => {
                      // TODO: Global search
                    })
                  }
                >
                  <IconSearch className="mr-2 size-4" />
                  <span>Search for "{search}"</span>
                </CommandItem>
              </CommandGroup>
            </>
          )}
        </CommandList>
      </Command>
    </CommandDialog>
  )
}
