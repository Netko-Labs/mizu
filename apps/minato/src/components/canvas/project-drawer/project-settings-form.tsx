import { useMutation, useQueryClient } from '@tanstack/react-query'
import { type FormEvent, useState } from 'react'
import { PropertyLine } from '@/components/canvas/shared'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { projectKeys, updateProject } from '@/shared/api'
import type { ProjectSettingsFormProps } from './lib/types'

/** Project settings as drawer cards (was the standalone settings dialog). */
export function ProjectSettingsForm({ project }: ProjectSettingsFormProps) {
  const queryClient = useQueryClient()
  const currentSettings = (project.settings ?? {}) as { domain?: string; [k: string]: unknown }
  const [domain, setDomain] = useState(currentSettings.domain ?? '')

  const mutation = useMutation({
    mutationFn: updateProject,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: projectKeys.all }),
  })

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    // Merge so existing settings (e.g. canvas service groups) are preserved.
    mutation.mutate({
      projectId: project.id,
      settings: { ...currentSettings, domain: domain.trim() || undefined },
    })
  }

  const dirty = (domain.trim() || undefined) !== currentSettings.domain

  return (
    <div className="space-y-4 p-4">
      <Card size="sm">
        <CardHeader>
          <CardTitle className="text-sm">General</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1.5">
          <PropertyLine label="name" value={project.name} />
          <PropertyLine label="slug" value={project.slug} mono copyable />
          <PropertyLine label="id" value={project.id} mono copyable />
        </CardContent>
      </Card>

      <Card size="sm">
        <CardHeader>
          <CardTitle className="text-sm">Domains</CardTitle>
          <CardDescription className="text-xs">
            Overrides the instance domain for this project's services (e.g.{' '}
            <code className="font-mono text-primary/70">web-{project.slug}.apps.example.com</code>
            ). Leave blank to use the instance default.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <Input
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="apps.example.com"
              maxLength={253}
              className="h-8 font-mono text-xs"
            />
            <Button type="submit" size="sm" disabled={!dirty || mutation.isPending}>
              {mutation.isPending ? <Spinner className="size-3" /> : 'Save'}
            </Button>
          </form>
          {mutation.error && (
            <p className="mt-2 text-xs text-destructive">{mutation.error.message}</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
