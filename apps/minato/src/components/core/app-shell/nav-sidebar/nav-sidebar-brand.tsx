import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

export function MizuBrand() {
  return (
    <div className="flex shrink-0 items-center gap-2 font-mono">
      <Tooltip>
        <TooltipTrigger
          render={
            <span className="flex size-6 shrink-0 cursor-default items-center justify-center rounded-md bg-blue-500/10 text-[13px] leading-none text-blue-400" />
          }
        >
          水
        </TooltipTrigger>
        <TooltipContent side="bottom" className="font-mono text-[10px]">
          mizu v0.1
        </TooltipContent>
      </Tooltip>
      <span className="text-[13px] font-medium leading-none text-white">mizu</span>
    </div>
  )
}
