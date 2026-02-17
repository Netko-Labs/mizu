import { AnimatePresence, motion } from 'motion/react'
import { type FormEvent, useState } from 'react'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'

interface LoginFormProps extends React.ComponentProps<'form'> {
  onSubmit: (data: { email: string; password: string; name?: string }) => Promise<void>
  error: string | null
  isLoading: boolean
  mode: 'login' | 'signup'
  onModeToggle: () => void
}

export function LoginForm({
  className,
  onSubmit,
  error,
  isLoading,
  mode,
  onModeToggle,
  ...props
}: LoginFormProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    onSubmit({ email, password, name: mode === 'signup' ? name : undefined })
  }

  return (
    <div className={cn('font-mono', className)}>
      {/* Terminal card */}
      <div className="overflow-hidden rounded-lg border border-neutral-800 bg-neutral-950">
        {/* Window chrome */}
        <div className="flex items-center gap-2 border-b border-neutral-800 px-4 py-2.5">
          <div className="flex gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-neutral-800" />
            <div className="h-2.5 w-2.5 rounded-full bg-neutral-800" />
            <div className="h-2.5 w-2.5 rounded-full bg-neutral-800" />
          </div>
          <span className="text-[11px] text-neutral-600">
            {mode === 'login' ? 'auth.login' : 'auth.signup'}
          </span>
        </div>

        {/* Form content */}
        <form onSubmit={handleSubmit} {...props}>
          <div className="space-y-5 p-5">
            {/* Header */}
            <div>
              <div className="text-[10px] text-neutral-700">
                # {mode === 'login' ? 'welcome back' : 'join the flow'}
              </div>
              <h1 className="mt-1.5 text-lg font-medium text-white">
                {mode === 'login' ? 'Sign in' : 'Create account'}
              </h1>
              <p className="mt-1 text-xs text-neutral-500">
                {mode === 'login'
                  ? "Good to see you again. Let's deploy something."
                  : 'Set up your account and start deploying.'}
              </p>
            </div>

            {/* Fields */}
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {mode === 'signup' && (
                  <motion.div
                    key="name-field"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <label htmlFor="name" className="mb-1.5 block text-[10px] text-neutral-600">
                      name
                    </label>
                    <input
                      id="name"
                      type="text"
                      placeholder="your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      autoComplete="name"
                      className="h-9 w-full rounded-lg border border-neutral-800 bg-black px-3 text-xs text-neutral-300 outline-none placeholder:text-neutral-700 focus:border-neutral-700"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <label htmlFor="email" className="mb-1.5 block text-[10px] text-neutral-600">
                  email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="h-9 w-full rounded-lg border border-neutral-800 bg-black px-3 text-xs text-neutral-300 outline-none placeholder:text-neutral-700 focus:border-neutral-700"
                />
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label htmlFor="password" className="text-[10px] text-neutral-600">
                    password
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      className="text-[10px] text-neutral-700 transition-colors hover:text-neutral-400"
                    >
                      forgot?
                    </button>
                  )}
                </div>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  className="h-9 w-full rounded-lg border border-neutral-800 bg-black px-3 text-xs text-neutral-300 outline-none placeholder:text-neutral-700 focus:border-neutral-700"
                />
              </div>
            </div>

            {/* Error */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs text-red-500"
                >
                  <span className="text-red-700">▸</span> {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="flex h-9 w-full items-center justify-center rounded-lg bg-blue-600 text-xs font-medium text-white transition-colors hover:bg-blue-500 disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Spinner className="size-3.5" />
                  {mode === 'login' ? '$ auth --login ...' : '$ auth --signup ...'}
                </span>
              ) : mode === 'login' ? (
                '$ auth --login'
              ) : (
                '$ auth --signup'
              )}
            </button>
          </div>

          {/* Mode toggle footer */}
          <div className="border-t border-neutral-800 px-5 py-3">
            <p className="text-center text-[10px] text-neutral-600">
              {mode === 'login' ? 'New here? ' : 'Already have an account? '}
              <button
                type="button"
                onClick={onModeToggle}
                className="text-blue-500 transition-colors hover:text-blue-400"
              >
                {mode === 'login' ? 'Create an account' : 'Sign in'}
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
