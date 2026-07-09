import { createFileRoute, Outlet, useLocation, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { CommandPaletteProvider } from '@/components/command-palette/command-palette-provider'
import { AppShell } from '@/components/core/app-shell'
import { WorkspaceProvider } from '@/components/core/workspace'
import { Spinner } from '@/components/ui/spinner'
import { authClient } from '@/integrations/auth/client'

export const Route = createFileRoute('/_auth')({
  component: AuthLayout,
})

function AuthLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [isChecking, setIsChecking] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await authClient.getSession()

        if (!session.data?.session) {
          // Not authenticated, redirect to login
          navigate({
            to: '/login',
            search: { redirect: location.pathname },
            replace: true,
          })
          return
        }

        setIsAuthenticated(true)
      } catch {
        // On error, redirect to login
        navigate({ to: '/login', replace: true })
      } finally {
        setIsChecking(false)
      }
    }

    checkAuth()
  }, [navigate, location.pathname])

  // Show loading while checking auth
  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black font-mono">
        <div className="flex flex-col items-center gap-3">
          <Spinner className="size-5 text-blue-500" />
          <span className="text-[10px] text-neutral-600">$ auth --verify</span>
        </div>
      </div>
    )
  }

  // Don't render children if not authenticated
  if (!isAuthenticated) {
    return null
  }

  return (
    <WorkspaceProvider>
      <CommandPaletteProvider>
        <AppShell showHeader={false}>
          <Outlet />
        </AppShell>
      </CommandPaletteProvider>
    </WorkspaceProvider>
  )
}
