import { Link } from '@tanstack/react-router'

export function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black font-mono">
      <div className="mx-auto w-full max-w-sm">
        <div className="rounded-lg border border-neutral-800 bg-neutral-950">
          <div className="flex items-center gap-2 border-b border-neutral-800 px-4 py-2.5">
            <div className="flex gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-neutral-800" />
              <div className="h-2.5 w-2.5 rounded-full bg-neutral-800" />
              <div className="h-2.5 w-2.5 rounded-full bg-neutral-800" />
            </div>
            <span className="text-[11px] text-neutral-600">error.log</span>
          </div>
          <div className="space-y-3 p-6">
            <div className="text-4xl font-bold text-white">404</div>
            <div className="space-y-1">
              <div className="text-xs text-neutral-600">
                $ curl --head <span className="text-neutral-500">current_page</span>
              </div>
              <div className="text-xs text-red-500">▸ error: route not found</div>
            </div>
            <Link
              to="/"
              className="mt-4 inline-flex items-center gap-2 rounded-lg border border-neutral-800 bg-black px-4 py-2 text-xs text-neutral-400 transition-all hover:border-neutral-700 hover:text-white"
            >
              $ cd ~
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
