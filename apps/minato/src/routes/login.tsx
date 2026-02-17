import { IconDroplet } from '@tabler/icons-react'
import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { z } from 'zod'
import { LoginBackground } from '@/components/login-backgrounds'
import { LoginForm } from '@/components/login-form'
import { Spinner } from '@/components/ui/spinner'
import { authClient, signIn, signUp } from '@/integrations/auth/client'

const loginSearchSchema = z.object({
  redirect: z.string().optional(),
})

export const Route = createFileRoute('/login')({
  validateSearch: loginSearchSchema,
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()
  const search = useSearch({ from: '/login' })
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await authClient.getSession()
        if (session.data?.session) {
          navigate({ to: search.redirect || '/projects', replace: true })
          return
        }
      } catch {
        // Ignore errors
      } finally {
        setIsCheckingAuth(false)
      }
    }
    checkAuth()
  }, [navigate, search.redirect])

  const handleSubmit = async (data: { email: string; password: string; name?: string }) => {
    setIsLoading(true)
    setError(null)

    try {
      if (mode === 'signup') {
        const result = await signUp.email({
          name: data.name || '',
          email: data.email,
          password: data.password,
        })
        if (result.error) {
          setError(result.error.message || 'Failed to create account')
          return
        }
        navigate({ to: search.redirect || '/projects' })
      } else {
        const result = await signIn.email({
          email: data.email,
          password: data.password,
        })
        if (result.error) {
          setError(result.error.message || 'Invalid email or password')
          return
        }
        navigate({ to: search.redirect || '/projects' })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login')
    setError(null)
  }

  if (isCheckingAuth) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-black font-mono">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center gap-3"
        >
          <Spinner className="size-5 text-blue-500" />
          <span className="text-[10px] text-neutral-600">$ auth --check</span>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 grid bg-black lg:grid-cols-2">
      {/* Left column - Pixel art with overlay */}
      <div className="relative hidden lg:block">
        <img
          src="/images/login-bg.png"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          style={{ imageRendering: 'pixelated' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/50" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/40" />

        {/* Brand */}
        <motion.div
          className="relative z-10 flex h-full flex-col p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="flex items-center gap-3 font-mono"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <div className="flex size-10 items-center justify-center rounded-xl border border-white/10 bg-black/50 backdrop-blur-sm">
              <IconDroplet className="size-5 text-blue-500" strokeWidth={2} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-white">mizu</span>
                <motion.span
                  className="text-neutral-500"
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
                >
                  _
                </motion.span>
              </div>
              <div className="text-[9px] text-white/40">self-hosting platform</div>
            </div>
          </motion.div>

          <motion.div
            className="mt-auto max-w-sm font-mono"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            <div className="rounded-lg border border-white/10 bg-black/60 p-4 backdrop-blur-sm">
              <div className="mb-2 text-[10px] text-white/30"># motd</div>
              <p className="text-xs leading-relaxed text-white/70">
                "Deploy your apps like water flows — naturally, effortlessly, beautifully."
              </p>
              <p className="mt-2 text-[10px] text-white/30">▸ self-hosting for your home lab</p>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Right column - Login form */}
      <div className="relative flex items-center justify-center p-6 lg:p-8">
        <LoginBackground />

        <motion.div
          className="relative z-10 mx-auto flex w-full flex-col justify-center gap-6 sm:w-[380px]"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Mobile brand */}
          <div className="mb-4 flex items-center justify-center gap-3 font-mono lg:hidden">
            <div className="flex size-10 items-center justify-center rounded-xl border border-neutral-800 bg-neutral-950">
              <IconDroplet className="size-5 text-blue-500" strokeWidth={2} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-white">mizu</span>
                <motion.span
                  className="text-neutral-600"
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
                >
                  _
                </motion.span>
              </div>
              <div className="text-[9px] text-neutral-600">self-hosting platform</div>
            </div>
          </div>

          <LoginForm
            onSubmit={handleSubmit}
            error={error}
            isLoading={isLoading}
            mode={mode}
            onModeToggle={toggleMode}
          />
        </motion.div>
      </div>
    </div>
  )
}
