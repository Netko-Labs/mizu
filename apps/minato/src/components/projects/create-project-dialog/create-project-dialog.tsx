'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { type FormEvent, type ReactElement, useState } from 'react'
import { useWorkspace } from '@/components/core/workspace'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { createProject, projectKeys } from '@/shared/api'

interface CreateProjectDialogProps {
  children: ReactElement
}

export function CreateProjectDialog({ children }: CreateProjectDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { currentWorkspace } = useWorkspace()

  const createMutation = useMutation({
    mutationFn: createProject,
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all })
      setOpen(false)
      resetForm()
      navigate({ to: '/projects/$slug', params: { slug: project.slug } })
    },
  })

  const resetForm = () => {
    setName('')
    setDescription('')
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      resetForm()
    }
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    if (!currentWorkspace) return

    createMutation.mutate({
      name: name.trim(),
      description: description.trim() || undefined,
    })
  }

  const isValid = name.trim().length > 0
  const isPending = createMutation.isPending

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={children} />
      <DialogContent className="border-neutral-800 bg-black font-mono sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-neutral-200">$ mizu new</DialogTitle>
            <DialogDescription className="text-neutral-600">
              create a new project to deploy services and databases
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="my-4">
            <Field>
              <FieldLabel htmlFor="project-name" className="text-xs text-neutral-500">
                name
              </FieldLabel>
              <Input
                id="project-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="my-awesome-project"
                autoFocus
                required
                maxLength={100}
                disabled={isPending}
                className="border-neutral-800 bg-neutral-950 text-neutral-300 placeholder:text-neutral-700 focus-visible:border-blue-500/50 focus-visible:ring-0"
              />
              <FieldDescription className="text-[10px] text-neutral-700">
                used to generate the project slug
              </FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor="project-description" className="text-xs text-neutral-500">
                description
              </FieldLabel>
              <Textarea
                id="project-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="what is this project for?"
                rows={3}
                maxLength={500}
                disabled={isPending}
                className="border-neutral-800 bg-neutral-950 text-neutral-300 placeholder:text-neutral-700 focus-visible:border-blue-500/50 focus-visible:ring-0"
              />
              <FieldDescription className="text-[10px] text-neutral-700">optional</FieldDescription>
            </Field>
          </FieldGroup>

          {createMutation.error && (
            <p className="mb-4 text-xs text-red-500">{createMutation.error.message}</p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
              className="border-neutral-800 bg-neutral-950 text-neutral-400 hover:bg-neutral-900 hover:text-neutral-300"
            >
              cancel
            </Button>
            <Button
              type="submit"
              disabled={!isValid || isPending || !currentWorkspace}
              className="border-neutral-700 bg-neutral-900 text-neutral-300 hover:bg-neutral-800 hover:text-white"
            >
              {isPending ? '$ creating...' : '$ create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
