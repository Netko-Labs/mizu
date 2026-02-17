import { motion } from 'motion/react'
import { useSession } from '@/integrations/auth/client'

function SectionCard({
  title,
  children,
  delay = 0,
}: {
  title: string
  children: React.ReactNode
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="group relative overflow-hidden rounded-lg border border-neutral-800 bg-neutral-950 font-mono"
    >
      <div className="flex items-center gap-2 border-b border-neutral-800 px-4 py-2.5">
        <div className="flex gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-neutral-800 transition-colors group-hover:bg-red-500" />
          <div className="h-2.5 w-2.5 rounded-full bg-neutral-800 transition-colors group-hover:bg-yellow-500" />
          <div className="h-2.5 w-2.5 rounded-full bg-neutral-800 transition-colors group-hover:bg-green-500" />
        </div>
        <span className="text-[11px] text-neutral-600">{title}</span>
      </div>
      <div className="relative p-5">{children}</div>
    </motion.div>
  )
}

function ConfigLine({
  label,
  value,
  accent = false,
}: {
  label: string
  value: string | undefined
  accent?: boolean
}) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-neutral-700">▸</span>
      <span className="min-w-[100px] text-neutral-600">{label}</span>
      <span className={accent ? 'text-blue-500' : 'text-neutral-400'}>{value ?? '—'}</span>
    </div>
  )
}

function formatDate(date: Date | string | undefined): string {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function MidnightAuroraWhoami() {
  const { data: session, isPending } = useSession()

  const user = session?.user
  const sess = session?.session

  if (isPending) {
    return (
      <div className="relative min-h-screen bg-black font-mono">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-neutral-950 via-black to-black" />
        <div className="relative mx-auto max-w-4xl px-6 py-8">
          <div className="space-y-6">
            <div className="h-6 w-48 animate-pulse rounded bg-neutral-800" />
            <div className="h-40 animate-pulse rounded-lg bg-neutral-900" />
            <div className="h-40 animate-pulse rounded-lg bg-neutral-900" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-black font-mono">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-neutral-950 via-black to-black" />

      <div className="relative mx-auto max-w-4xl px-6 py-8">
        <motion.header
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <div className="text-xs text-neutral-600">$ whoami --verbose</div>
          <h1 className="mt-2 text-xl text-neutral-400">
            <span className="text-white">{user?.name || 'user'}</span>
          </h1>
        </motion.header>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Identity */}
          <SectionCard title="~/.identity" delay={0.1}>
            <div className="space-y-3">
              <ConfigLine label="name" value={user?.name ?? undefined} accent />
              <ConfigLine label="email" value={user?.email ?? undefined} />
              <ConfigLine label="uid" value={user?.id?.slice(0, 8)} />
              <ConfigLine
                label="verified"
                value={user?.emailVerified ? 'true' : 'false'}
                accent={!!user?.emailVerified}
              />
              <ConfigLine label="created" value={formatDate(user?.createdAt)} />
            </div>
          </SectionCard>

          {/* Session info */}
          <SectionCard title="session.info" delay={0.15}>
            <div className="space-y-3">
              <ConfigLine
                label="token"
                value={sess?.token ? `${sess.token.slice(0, 8)}••••••••` : undefined}
              />
              <ConfigLine label="expires" value={formatDate(sess?.expiresAt)} />
              <ConfigLine label="created" value={formatDate(sess?.createdAt)} />
            </div>
          </SectionCard>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3"
        >
          <div className="flex items-center gap-x-6 text-[10px] text-neutral-600">
            <span>
              <span className="text-neutral-500">read-only</span> — edit profile via{' '}
              <span className="text-neutral-500">mizu config</span>
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
