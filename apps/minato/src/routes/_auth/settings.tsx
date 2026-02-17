import { createFileRoute } from '@tanstack/react-router'
import { MidnightAuroraSettings } from '@/components/settings'

export const Route = createFileRoute('/_auth/settings')({
  component: MidnightAuroraSettings,
})
