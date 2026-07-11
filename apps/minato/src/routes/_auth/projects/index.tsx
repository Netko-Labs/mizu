import { createFileRoute } from '@tanstack/react-router'
import { ProjectsDashboard } from '@/components/projects/projects-dashboard'

export const Route = createFileRoute('/_auth/projects/')({
  component: ProjectsDashboard,
})
