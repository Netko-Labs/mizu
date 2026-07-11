import { IconBox, IconCpu, IconFolder, IconPhoto, IconPlus, IconServer } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { CreateProjectDialog } from '@/components/projects/create-project-dialog'
import { StatLine, TerminalCard } from '@/components/shared/terminal'
import { Skeleton } from '@/components/ui/skeleton'
import { HomeRecentProjects } from './home-recent-projects'
import { formatBytes, getGreeting, useHomeDashboard } from './lib'

export function HomeDashboard() {
  const {
    stats,
    isLoading,
    firstName,
    recentProjects,
    isProjectsLoading,
    isWorkspaceLoading,
    hasWorkspace,
  } = useHomeDashboard()

  return (
    <div className="relative min-h-screen bg-black font-mono">
      {/* Subtle gradient overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-neutral-950 via-black to-black" />

      <div className="relative mx-auto max-w-6xl px-6 py-8">
        {/* Greeting Header */}
        <motion.header
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <div className="text-xs text-neutral-600">$ welcome --user={firstName}</div>
          <h1 className="mt-2 text-xl text-neutral-400">
            {getGreeting()}, <span className="text-white">{firstName}</span>
          </h1>
        </motion.header>

        {/* System banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 rounded-lg border border-neutral-800 bg-neutral-950 p-3 text-xs"
        >
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-neutral-600">
            <span>
              <span className="text-neutral-700">host:</span>
              <span className="ml-1 text-neutral-400">{stats?.system.hostname}</span>
            </span>
            <span>
              <span className="text-neutral-700">os:</span>
              <span className="ml-1 text-neutral-400">{stats?.system.platform}</span>
            </span>
            <span>
              <span className="text-neutral-700">uptime:</span>
              <span className="ml-1 text-blue-500">{stats?.system.uptimeFormatted}</span>
            </span>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <section className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton
                key={String(i)}
                className="h-36 rounded-lg border border-neutral-800 bg-neutral-950"
              />
            ))
          ) : (
            <>
              <TerminalCard title="system.info" delay={0.1}>
                <div className="flex items-center gap-3">
                  <IconServer className="h-8 w-8 text-neutral-700" strokeWidth={1.5} />
                  <div>
                    <div className="text-lg font-medium text-white">{stats?.system.hostname}</div>
                    <div className="text-[10px] text-neutral-600">{stats?.system.platform}</div>
                  </div>
                </div>
                <div className="mt-3 space-y-0.5">
                  <StatLine label="arch" value={stats?.system.arch} />
                  <StatLine label="uptime" value={stats?.system.uptimeFormatted} accent />
                </div>
              </TerminalCard>

              <TerminalCard title="cpu.stats" delay={0.15}>
                <div className="flex items-center gap-3">
                  <IconCpu className="h-8 w-8 text-neutral-700" strokeWidth={1.5} />
                  <div>
                    <div className="text-2xl font-bold text-white">{stats?.cpu.cores}</div>
                    <div className="text-[10px] text-neutral-600">cores</div>
                  </div>
                </div>
                <div className="mt-3 space-y-0.5">
                  <StatLine label="load_1m" value={stats?.cpu.loadAverage[0]?.toFixed(2)} />
                  <StatLine label="load_5m" value={stats?.cpu.loadAverage[1]?.toFixed(2)} />
                </div>
              </TerminalCard>

              <TerminalCard title="memory.usage" delay={0.2}>
                <div className="flex items-center gap-3">
                  <IconServer className="h-8 w-8 text-neutral-700" strokeWidth={1.5} />
                  <div>
                    <div className="text-2xl font-bold text-white">
                      {stats?.memory.usedPercent}%
                    </div>
                    <div className="text-[10px] text-neutral-600">used</div>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="mb-1.5 flex justify-between text-[10px] text-neutral-600">
                    <span>{formatBytes(stats?.memory.used ?? 0)}</span>
                    <span>{formatBytes(stats?.memory.total ?? 0)}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-neutral-800">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-blue-600 to-blue-400"
                      initial={{ width: 0 }}
                      animate={{ width: `${stats?.memory.usedPercent ?? 0}%` }}
                      transition={{ duration: 1, delay: 0.4 }}
                    />
                  </div>
                </div>
              </TerminalCard>

              <TerminalCard title="runtime.status" delay={0.25}>
                <div className="flex items-center gap-3">
                  <IconBox className="h-8 w-8 text-neutral-700" strokeWidth={1.5} />
                  <div>
                    <div className="text-2xl font-bold text-white">
                      {stats?.mizu.runtimeAvailable
                        ? stats.mizu.runtimeInfo?.containersRunning
                        : '\u2014'}
                    </div>
                    <div className="text-[10px] text-neutral-600">running</div>
                  </div>
                </div>
                <div className="mt-3 space-y-0.5">
                  <StatLine
                    label="status"
                    value={stats?.mizu.runtimeAvailable ? 'online' : 'offline'}
                    accent={stats?.mizu.runtimeAvailable}
                  />
                  <StatLine
                    label="version"
                    value={stats?.mizu.runtimeAvailable ? stats.mizu.runtimeInfo?.version : 'n/a'}
                  />
                </div>
              </TerminalCard>
            </>
          )}
        </section>

        {/* Two Column Grid */}
        <section className="grid gap-6 lg:grid-cols-2">
          {/* Projects */}
          <HomeRecentProjects
            projects={recentProjects}
            isLoading={isProjectsLoading || isWorkspaceLoading}
            hasWorkspace={hasWorkspace}
          />

          {/* Quick Actions & Stats */}
          <div className="flex flex-col gap-4">
            <TerminalCard title="commands.sh" delay={0.35}>
              <div className="grid gap-3 sm:grid-cols-2">
                <CreateProjectDialog>
                  <button
                    type="button"
                    className="flex items-center gap-3 rounded-lg border border-neutral-800 bg-black p-3 text-left transition-all hover:border-neutral-700 hover:bg-neutral-900"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-950 text-blue-500">
                      <IconPlus className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs text-neutral-300">mizu new</div>
                      <div className="text-[10px] text-neutral-600">create project</div>
                    </div>
                  </button>
                </CreateProjectDialog>
                <Link to="/projects">
                  <div className="flex items-center gap-3 rounded-lg border border-neutral-800 bg-black p-3 transition-all hover:border-neutral-700 hover:bg-neutral-900">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-950 text-neutral-500">
                      <IconFolder className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs text-neutral-300">mizu ls</div>
                      <div className="text-[10px] text-neutral-600">list projects</div>
                    </div>
                  </div>
                </Link>
              </div>
            </TerminalCard>

            <div className="grid flex-1 gap-4 sm:grid-cols-2">
              <TerminalCard title="containers" delay={0.4}>
                <div className="flex items-center gap-3">
                  <IconBox className="h-6 w-6 text-neutral-700" />
                  <div>
                    <div className="text-3xl font-bold text-white">
                      {stats?.mizu.runtimeAvailable
                        ? (stats.mizu.runtimeInfo?.containersRunning ?? 0)
                        : '\u2014'}
                    </div>
                    <div className="text-[10px] text-neutral-600">
                      / {stats?.mizu.runtimeInfo?.containers ?? 0} total
                    </div>
                  </div>
                </div>
              </TerminalCard>

              <TerminalCard title="images" delay={0.45}>
                <div className="flex items-center gap-3">
                  <IconPhoto className="h-6 w-6 text-neutral-700" />
                  <div>
                    <div className="text-3xl font-bold text-white">
                      {stats?.mizu.runtimeAvailable
                        ? (stats.mizu.runtimeInfo?.images ?? 0)
                        : '\u2014'}
                    </div>
                    <div className="text-[10px] text-neutral-600">available</div>
                  </div>
                </div>
              </TerminalCard>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
