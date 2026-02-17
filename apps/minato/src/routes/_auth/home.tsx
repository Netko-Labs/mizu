import { createFileRoute } from '@tanstack/react-router'
import { MidnightAuroraHome } from '@/components/home'

export const Route = createFileRoute('/_auth/home')({
  component: MidnightAuroraHome,
})
