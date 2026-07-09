import { createFileRoute } from '@tanstack/react-router'
import { HomeDashboard } from '@/components/home'

export const Route = createFileRoute('/_auth/home')({
  component: HomeDashboard,
})
