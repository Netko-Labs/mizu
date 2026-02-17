import { LoaderCircle } from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

export type NodeStatus = 'loading' | 'success' | 'error' | 'initial'

export type NodeStatusVariant = 'overlay' | 'border'

export type NodeStatusIndicatorProps = {
  status?: NodeStatus
  variant?: NodeStatusVariant
  children: ReactNode
}

export const SpinnerLoadingIndicator = ({ children }: { children: ReactNode }) => {
  return (
    <div className="relative">
      <div className="relative">{children}</div>
      <div className="absolute inset-0 z-50 rounded-xl bg-black/50 backdrop-blur-xs" />
      <div className="absolute inset-0 z-50">
        <LoaderCircle className="absolute left-[calc(50%-0.625rem)] top-[calc(50%-0.625rem)] size-5 animate-spin text-blue-400/60" />
      </div>
    </div>
  )
}

export const BorderLoadingIndicator = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <div className="absolute -top-px -left-px h-[calc(100%+2px)] w-[calc(100%+2px)]">
        <style>
          {`
        @keyframes spin {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        .spinner {
          animation: spin 2s linear infinite;
          position: absolute;
          left: 50%;
          top: 50%;
          width: 140%;
          aspect-ratio: 1;
          transform-origin: center;
        }
      `}
        </style>
        <div className="absolute inset-0 overflow-hidden rounded-xl">
          <div className="spinner rounded-full bg-[conic-gradient(from_0deg_at_50%_50%,rgba(59,130,246,0.2)_0deg,rgba(59,130,246,0)_360deg)]" />
        </div>
      </div>
      {children}
    </>
  )
}

const StatusGlow = ({ children, className }: { children: ReactNode; className?: string }) => {
  return (
    <div className={cn('relative', className)}>
      {children}
    </div>
  )
}

export const NodeStatusIndicator = ({
  status,
  variant = 'border',
  children,
}: NodeStatusIndicatorProps) => {
  switch (status) {
    case 'loading':
      switch (variant) {
        case 'overlay':
          return <SpinnerLoadingIndicator>{children}</SpinnerLoadingIndicator>
        case 'border':
          return <BorderLoadingIndicator>{children}</BorderLoadingIndicator>
        default:
          return <>{children}</>
      }
    case 'success':
      return <StatusGlow>{children}</StatusGlow>
    case 'error':
      return <StatusGlow>{children}</StatusGlow>
    default:
      return <>{children}</>
  }
}
