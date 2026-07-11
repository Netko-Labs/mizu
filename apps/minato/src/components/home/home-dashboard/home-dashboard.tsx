import { motion } from 'motion/react'
import { HomeHostBand } from './home-host-band'
import { HomeQuickActions } from './home-quick-actions'
import { HomeRecentProjects } from './home-recent-projects'
import { HomeStatStrip } from './home-stat-strip'
import { getGreeting, useHomeDashboard } from './lib'

export function HomeDashboard() {
  const {
    isLoading,
    firstName,
    recentProjects,
    isProjectsLoading,
    isWorkspaceLoading,
    hasWorkspace,
    host,
    tiles,
    tailnet,
    runtimeLines,
  } = useHomeDashboard()

  return (
    <div className="relative min-h-screen bg-black font-mono">
      {/* Subtle gradient overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-neutral-950 via-black to-black" />

      <div className="relative mx-auto max-w-6xl px-6 py-8">
        {/* Greeting eyebrow — the machine below is the hero */}
        <motion.header
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="mb-4"
        >
          <div className="text-xs text-neutral-600">
            $ welcome --user={firstName} · {getGreeting()}
          </div>
        </motion.header>

        {/* Host band: hostname + os/uptime + status dots */}
        <HomeHostBand host={host} isLoading={isLoading} />

        {/* Stat strip: cpu / memory / containers meters + tailnet */}
        <HomeStatStrip tiles={tiles} tailnet={tailnet} isLoading={isLoading} />

        <section className="grid gap-6 lg:grid-cols-2">
          <HomeRecentProjects
            projects={recentProjects}
            isLoading={isProjectsLoading || isWorkspaceLoading}
            hasWorkspace={hasWorkspace}
          />
          <HomeQuickActions runtimeLines={runtimeLines} />
        </section>
      </div>
    </div>
  )
}
