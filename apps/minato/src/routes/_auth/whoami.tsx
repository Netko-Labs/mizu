import { createFileRoute } from '@tanstack/react-router'
import { MidnightAuroraWhoami } from '@/components/whoami'

export const Route = createFileRoute('/_auth/whoami')({
  component: MidnightAuroraWhoami,
})
