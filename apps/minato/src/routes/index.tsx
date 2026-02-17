import { createFileRoute, Navigate } from '@tanstack/react-router'
import { Spinner } from '@/components/ui/spinner'
import { useSession } from '@/integrations/auth'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  const { data, isPending } = useSession()

  if (!isPending && data?.session) {
    // Redirect authenticated users to home dashboard
    return <Navigate to="/home" replace />
  }

  if (!isPending && !data?.session) {
    return <Navigate to="/login" />
  }

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-black font-mono">
      <div className="flex flex-col items-center gap-3">
        <Spinner className="size-5 text-blue-500" />
        <span className="text-[10px] text-neutral-600">$ mizu --init</span>
      </div>
    </div>
  )
}
