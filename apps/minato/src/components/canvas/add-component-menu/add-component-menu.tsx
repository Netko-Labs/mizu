import { databaseTemplates, serviceTemplates } from '@mizu/nagare-domain'
import { IconApps, IconBox, IconBrandGit, IconDatabase } from '@tabler/icons-react'
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import type { AddComponentMenuProps } from './lib/types'

/**
 * Railway-style "what would you like to create?" menu — the single entry point
 * for adding components to the canvas (the old drag palette is gone).
 */
export function AddComponentMenu({
  open,
  onOpenChange,
  onAddService,
  onAddDatabase,
}: AddComponentMenuProps) {
  const close = () => onOpenChange(false)

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Add component"
      description="What would you like to create?"
    >
      <Command shouldFilter loop>
        <CommandInput placeholder="What would you like to create?" />
        <CommandList>
          <CommandEmpty>Nothing matches — try another name.</CommandEmpty>

          <CommandGroup heading="Services">
            <CommandItem
              onSelect={() => {
                onAddService?.({
                  name: 'Custom Service',
                  sourceType: 'image',
                  sourceConfig: { image: 'nginx', tag: 'latest' },
                })
                close()
              }}
            >
              <IconBox className="size-4" />
              <div className="flex flex-col">
                <span>Docker image</span>
                <span className="text-xs text-muted-foreground">
                  Any image — edit image and tag after adding
                </span>
              </div>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                onAddService?.({
                  name: 'Git Repository',
                  sourceType: 'git',
                  sourceConfig: { repository: 'https://github.com/example/repo' },
                })
                close()
              }}
            >
              <IconBrandGit className="size-4" />
              <div className="flex flex-col">
                <span>Git repository</span>
                <span className="text-xs text-muted-foreground">Deploy from a repo</span>
              </div>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Databases">
            {databaseTemplates.map((template) => (
              <CommandItem
                key={template.id}
                onSelect={() => {
                  onAddDatabase?.({
                    name: template.name,
                    type: template.databaseType,
                    version: template.sourceConfig.tag?.split('-')[0],
                  })
                  close()
                }}
              >
                <IconDatabase className="size-4" />
                <div className="flex flex-col">
                  <span>{template.name}</span>
                  <span className="text-xs text-muted-foreground">{template.description}</span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="One-click apps">
            {serviceTemplates.map((template) => (
              <CommandItem
                key={template.id}
                onSelect={() => {
                  onAddService?.({
                    name: template.name,
                    sourceType: 'template',
                    sourceConfig: {
                      templateId: template.id,
                      overrides: {},
                      // biome-ignore lint/style/useNamingConvention: underscore marks a transient client-side flag stripped before the API call
                      _createAsGroup: true,
                    },
                  })
                  close()
                }}
              >
                <IconApps className="size-4" />
                <div className="flex flex-col">
                  <span>{template.name}</span>
                  <span className="text-xs text-muted-foreground">{template.description}</span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  )
}
