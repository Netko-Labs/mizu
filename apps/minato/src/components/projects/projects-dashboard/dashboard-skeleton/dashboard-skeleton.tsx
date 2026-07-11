export function ProjectGridSkeleton() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={String(i)}
          className="h-24 animate-pulse rounded-lg border border-neutral-800 bg-neutral-950"
        />
      ))}
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div>
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <div className="h-3 w-32 animate-pulse rounded bg-neutral-900" />
          <div className="mt-2 h-5 w-24 animate-pulse rounded bg-neutral-800" />
        </div>
        <div className="h-7 w-72 animate-pulse rounded-md bg-neutral-900" />
      </div>
      <div className="mb-5 h-4 animate-pulse rounded bg-neutral-900" />
      <ProjectGridSkeleton />
    </div>
  )
}
