import {
  IconBrandDocker,
  IconChevronRight,
  IconCpu,
  IconFolder,
  IconPhoto,
  IconPlus,
  IconServer,
} from '@tabler/icons-react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { useEffect, useRef } from 'react'
import { useWorkspace } from '@/components/core/workspace'
import { CreateProjectDialog } from '@/components/projects/create-project-dialog'
import { StatLine, TerminalCard } from '@/components/shared/terminal'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useSession } from '@/integrations/auth/client'
import { initializeMizu, projectQueries, systemQueries } from '@/shared/api'

function formatBytes(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let unitIndex = 0
  let value = bytes
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024
    unitIndex++
  }
  return `${value.toFixed(1)} ${units[unitIndex]}`
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

function ProjectItem({
  name,
  slug,
  description,
  delay = 0,
}: {
  name: string
  slug: string
  description?: string | null
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay }}
    >
      <Link to="/projects/$slug" params={{ slug }}>
        <div className="group rounded-lg border border-neutral-800 bg-neutral-950 p-3 transition-all hover:border-neutral-700 hover:bg-neutral-900">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-800 bg-black">
              <IconFolder className="h-4 w-4 text-neutral-500" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-neutral-300 group-hover:text-white">{name}</p>
              {description && (
                <p className="truncate text-[10px] text-neutral-600">{description}</p>
              )}
            </div>
            <IconChevronRight className="size-3 text-neutral-700 transition-transform group-hover:translate-x-0.5 group-hover:text-neutral-500" />
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

export function HomeDashboard() {
  const { data: session } = useSession()
  const { currentWorkspace, isLoading: isWorkspaceLoading } = useWorkspace()

  const { data: stats, isLoading: isStatsLoading } = useQuery(systemQueries.dashboardStats())

  const { data: projects = [], isLoading: isProjectsLoading } = useQuery({
    ...projectQueries.list(currentWorkspace?.id ?? ''),
    enabled: Boolean(currentWorkspace),
  })

  // First-run setup is a POST with side effects now — fire it once per mount.
  const { mutate: runInitialize } = useMutation({ mutationFn: initializeMizu })
  const initialized = useRef(false)
  useEffect(() => {
    if (initialized.current) return
    initialized.current = true
    runInitialize()
  }, [runInitialize])

  const recentProjects = projects.slice(0, 4)
  const isLoading = isStatsLoading || isWorkspaceLoading
  const firstName = session?.user?.name?.split(' ')[0] || 'user'

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

              <TerminalCard title="docker.status" delay={0.25}>
                <div className="flex items-center gap-3">
                  <IconBrandDocker className="h-8 w-8 text-neutral-700" strokeWidth={1.5} />
                  <div>
                    <div className="text-2xl font-bold text-white">
                      {stats?.mizu.dockerAvailable
                        ? stats.mizu.dockerInfo?.containersRunning
                        : '\u2014'}
                    </div>
                    <div className="text-[10px] text-neutral-600">running</div>
                  </div>
                </div>
                <div className="mt-3 space-y-0.5">
                  <StatLine
                    label="status"
                    value={stats?.mizu.dockerAvailable ? 'online' : 'offline'}
                    accent={stats?.mizu.dockerAvailable}
                  />
                  <StatLine
                    label="version"
                    value={stats?.mizu.dockerAvailable ? stats.mizu.dockerInfo?.version : 'n/a'}
                  />
                </div>
              </TerminalCard>
            </>
          )}
        </section>

        {/* Two Column Grid */}
        <section className="grid gap-6 lg:grid-cols-2">
          {/* Projects */}
          <TerminalCard title="~/projects --recent" delay={0.3}>
            <div className="mb-4 flex items-center justify-between">
              <div className="text-xs text-neutral-600">$ ls -la | head -4</div>
              <Link
                to="/projects"
                className="flex items-center gap-1 text-[10px] text-neutral-600 transition-colors hover:text-neutral-400"
              >
                view all
                <IconChevronRight className="h-3 w-3" />
              </Link>
            </div>

            {isProjectsLoading || isWorkspaceLoading ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton
                    key={String(i)}
                    className="h-16 rounded-lg border border-neutral-800 bg-neutral-950"
                  />
                ))}
              </div>
            ) : !currentWorkspace ? (
              <div className="py-8 text-center">
                <div className="mb-2 text-xs text-yellow-500">! no workspace selected</div>
                <div className="text-[10px] text-neutral-600">$ workspace --select</div>
              </div>
            ) : recentProjects.length === 0 ? (
              <div className="py-8 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg border border-neutral-800 bg-black">
                  <IconFolder className="h-6 w-6 text-neutral-700" />
                </div>
                <div className="mb-1 text-xs text-neutral-400">no projects found</div>
                <div className="mb-4 text-[10px] text-neutral-600">$ mizu init</div>
                <CreateProjectDialog>
                  <Button
                    size="sm"
                    className="rounded-lg border border-neutral-800 bg-neutral-900 font-mono text-xs text-neutral-400 hover:bg-neutral-800 hover:text-white"
                  >
                    <IconPlus className="mr-1.5 h-3 w-3" />
                    new project
                  </Button>
                </CreateProjectDialog>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {recentProjects.map((project, index) => (
                  <ProjectItem
                    key={project.id}
                    name={project.name}
                    slug={project.slug}
                    description={project.description}
                    delay={0.1 * index}
                  />
                ))}
              </div>
            )}
          </TerminalCard>

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
                  <IconBrandDocker className="h-6 w-6 text-neutral-700" />
                  <div>
                    <div className="text-3xl font-bold text-white">
                      {stats?.mizu.dockerAvailable
                        ? (stats.mizu.dockerInfo?.containersRunning ?? 0)
                        : '\u2014'}
                    </div>
                    <div className="text-[10px] text-neutral-600">
                      / {stats?.mizu.dockerInfo?.containers ?? 0} total
                    </div>
                  </div>
                </div>
              </TerminalCard>

              <TerminalCard title="images" delay={0.45}>
                <div className="flex items-center gap-3">
                  <IconPhoto className="h-6 w-6 text-neutral-700" />
                  <div>
                    <div className="text-3xl font-bold text-white">
                      {stats?.mizu.dockerAvailable
                        ? (stats.mizu.dockerInfo?.images ?? 0)
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
