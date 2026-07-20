import { IconPlus, IconRocket } from '@tabler/icons-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { DrawerSection } from '../shared'
import { useVariablesEditor } from './lib'
import type { VariablesTabProps } from './lib/types'
import { VariableRow } from './variable-row'

/**
 * User env vars editor: draft rows + add form + save bar. Connection-injected
 * vars aren't shown — they're resolved at deploy time. Saved changes apply on
 * the next deploy.
 */
export function VariablesTab({ service, onAction }: VariablesTabProps) {
  const editor = useVariablesEditor({ serviceId: service.id })
  const [newName, setNewName] = useState('')
  const [newValue, setNewValue] = useState('')

  const handleAdd = () => {
    if (editor.addVariable(newName.trim(), newValue)) {
      setNewName('')
      setNewValue('')
    }
  }

  const names = Object.keys(editor.draft).sort()

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-auto p-4">
        <DrawerSection
          title="Environment variables"
          description="Connection vars are injected at deploy. Saved changes apply on the next deploy."
        >
          <div className="space-y-2">
            {editor.isLoading && (
              <div className="flex items-center gap-2 py-2 text-xs text-muted-foreground">
                <Spinner className="size-3" /> Loading variables…
              </div>
            )}
            {!editor.isLoading && names.length === 0 && (
              <div className="py-4 text-center text-xs text-muted-foreground">
                No variables yet — connection vars are injected automatically at deploy.
              </div>
            )}
            {names.map((name) => (
              <VariableRow
                key={name}
                name={name}
                value={editor.draft[name] ?? ''}
                onChange={(value) => editor.setVariable(name, value)}
                onRemove={() => editor.removeVariable(name)}
              />
            ))}

            {/* Add row */}
            <div className="flex items-center gap-1.5 rounded-md border border-dashed border-border px-2 py-1.5">
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                placeholder="NAME"
                className="w-[38%] shrink-0 bg-transparent font-mono text-[11px] text-foreground outline-none placeholder:text-muted-foreground/50"
              />
              <input
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                placeholder="value"
                className="min-w-0 flex-1 bg-transparent font-mono text-[11px] text-foreground outline-none placeholder:text-muted-foreground/50"
              />
              <button
                type="button"
                onClick={handleAdd}
                disabled={!newName.trim()}
                className="shrink-0 text-muted-foreground transition-colors hover:text-primary disabled:opacity-40"
                aria-label="add variable"
              >
                <IconPlus className="size-3.5" />
              </button>
            </div>
          </div>
        </DrawerSection>
      </div>

      {/* Save bar */}
      {(editor.dirty || editor.savedPendingDeploy) && (
        <div className="flex items-center gap-2 border-t border-border bg-background/60 px-4 py-2.5">
          {editor.dirty ? (
            <>
              <span className="text-[11px] text-muted-foreground">Unsaved changes</span>
              <Button
                size="sm"
                className="ml-auto"
                disabled={editor.isSaving}
                onClick={editor.save}
              >
                {editor.isSaving ? <Spinner className="size-3" /> : 'Save'}
              </Button>
            </>
          ) : (
            <>
              <span className="text-[11px] text-muted-foreground">
                Saved — applies on next deploy
              </span>
              <Button
                size="sm"
                variant="outline"
                className="ml-auto"
                onClick={() => onAction?.({ type: 'deploy' })}
              >
                <IconRocket className="size-3" />
                Deploy now
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
