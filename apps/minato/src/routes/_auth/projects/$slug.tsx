import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { CanvasView } from '@/components/canvas/canvas-view'
import { useWorkspace } from '@/components/core/workspace'
import { projectQueries } from '@/shared/api'

export const Route = createFileRoute('/_auth/projects/$slug')({
  component: ProjectDetailPage,
})

function ProjectDetailPage() {
  const { slug } = Route.useParams()
  const { currentWorkspace } = useWorkspace()
  const { data: project, isLoading } = useQuery({
    ...projectQueries.bySlug(currentWorkspace?.id ?? '', slug),
    enabled: Boolean(currentWorkspace),
  })

  if (!currentWorkspace) {
    return <CanvasGuard code="WORKSPACE_REQUIRED" message="workspace required" />
  }

  if (!project && !isLoading) {
    return <CanvasGuard code="NOT_FOUND" message="project not found" />
  }

  if (isLoading || !project) {
    return (
      <div className="flex h-screen items-center justify-center bg-black font-mono">
        <div className="text-center">
          <div className="text-xs text-neutral-600">$ loading...</div>
        </div>
      </div>
    )
  }

  return <CanvasView projectId={project.id} projectName={project.name} />
}

function CanvasGuard({ code, message }: { code: string; message: string }) {
  return (
    <div className="flex h-screen items-center justify-center bg-black font-mono">
      <div className="text-center">
        <div className="text-xs text-neutral-600">$ error --code={code}</div>
        <h1 className="mt-2 text-sm text-neutral-400">{message}</h1>
        <Link to="/projects">
          <button
            type="button"
            className="mt-4 rounded border border-neutral-800 bg-neutral-950 px-4 py-1.5 text-xs text-neutral-400 transition hover:border-neutral-700 hover:text-white"
          >
            $ cd /projects
          </button>
        </Link>
      </div>
    </div>
  )
}
