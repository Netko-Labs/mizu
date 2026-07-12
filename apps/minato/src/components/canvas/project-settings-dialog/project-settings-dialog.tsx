import type { Project } from '@mizu/nagare-domain'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { type FormEvent, useState } from 'react'
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
import { projectKeys, type Serialized, updateProject } from '@/shared/api'

interface ProjectSettingsDialogProps {
  open: boolean
  onClose: () => void
  project: Serialized<Project>
}

export function ProjectSettingsDialog({ open, onClose, project }: ProjectSettingsDialogProps) {
  const queryClient = useQueryClient()
  const currentSettings = (project.settings ?? {}) as { domain?: string; [k: string]: unknown }
  const [domain, setDomain] = useState(currentSettings.domain ?? '')

  const mutation = useMutation({
    mutationFn: updateProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all })
      onClose()
    },
  })

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    // Merge so existing settings (e.g. canvas service groups) are preserved.
    mutation.mutate({
      projectId: project.id,
      settings: { ...currentSettings, domain: domain.trim() || undefined },
    })
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="border-neutral-800 bg-neutral-950 font-mono sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="font-mono text-neutral-200">Project settings</DialogTitle>
            <DialogDescription className="font-mono text-neutral-500">
              Configuration for <span className="text-neutral-300">{project.name}</span>.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="project-domain">Custom base domain</FieldLabel>
                <Input
                  id="project-domain"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="apps.example.com"
                  maxLength={253}
                  className="border-neutral-800 bg-black font-mono"
                />
                <FieldDescription>
                  Overrides the instance domain for this project's services (e.g.
                  <code className="mx-1 text-blue-400/70">web-{project.slug}.apps.example.com</code>
                  ). Leave blank to use the instance default.
                </FieldDescription>
              </Field>
            </FieldGroup>
            {mutation.error && (
              <p className="mt-3 text-xs text-red-500">
                <span className="text-red-700">▸</span> {mutation.error.message}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={mutation.isPending}
              className="border-neutral-800 bg-black font-mono text-neutral-400 hover:bg-neutral-900 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={mutation.isPending}
              className="bg-blue-600 font-mono text-white hover:bg-blue-500"
            >
              {mutation.isPending ? (
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
