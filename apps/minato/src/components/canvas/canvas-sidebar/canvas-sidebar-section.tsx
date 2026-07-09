import { useState } from 'react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'
import type { SidebarSectionProps } from './lib/types'

/**
 * Collapsible section in the sidebar
 */
export function SidebarSection({ title, icon, children, defaultOpen = true }: SidebarSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-neutral-700 hover:text-neutral-500 transition-colors">
        <span className="flex items-center gap-2">
          {icon}
          <span># {title.toLowerCase()}</span>
        </span>
        <svg
          className={cn('ml-auto size-4 transition-transform duration-200', isOpen && 'rotate-180')}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2 space-y-2">{children}</CollapsibleContent>
    </Collapsible>
  )
}
