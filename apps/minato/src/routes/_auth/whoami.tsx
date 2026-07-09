import { createFileRoute } from '@tanstack/react-router'
import { WhoamiView } from '@/components/whoami'

export const Route = createFileRoute('/_auth/whoami')({
  component: WhoamiView,
})
