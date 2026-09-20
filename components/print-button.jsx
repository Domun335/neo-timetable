'use client'

import { Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

export function PrintButton({ className = '' }) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="outline"
            size="icon"
            onClick={() => window.print()}
            className={cn(
              'rounded-xl border-border/60 bg-card/60 backdrop-blur-md shadow-xs text-muted-foreground transition-all hover:scale-105 hover:text-foreground active:scale-95',
              className,
            )}
            aria-label="Drukuj plan lekcji"
          />
        }
      >
        <Printer className="size-4" />
      </TooltipTrigger>
      <TooltipContent>Drukuj plan lekcji (Ctrl+P)</TooltipContent>
    </Tooltip>
  )
}
