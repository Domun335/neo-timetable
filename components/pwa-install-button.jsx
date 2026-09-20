'use client'

import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { usePwaInstall } from '@/hooks/use-pwa-install'
import { cn } from '@/lib/utils'

export function PwaInstallButton({ className = '', variant = 'icon' }) {
  const { canInstall, install } = usePwaInstall()

  if (!canInstall) return null

  if (variant === 'banner') {
    return (
      <button
        type="button"
        onClick={install}
        className={cn(
          'group flex w-full items-center gap-2.5 rounded-xl border border-primary/30 bg-primary/5 px-3 py-2.5 text-left transition-all hover:bg-primary/10 hover:border-primary/50 animate-in fade-in slide-in-from-top-2 duration-300',
          className,
        )}
      >
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary ring-1 ring-primary/20">
          <Download className="size-3.5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-foreground">Zainstaluj aplikację</p>
          <p className="text-[11px] text-muted-foreground truncate">Dodaj do ekranu głównego</p>
        </div>
      </button>
    )
  }

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={install}
            className={cn(
              'rounded-xl border-border/60 bg-card/60 backdrop-blur-md shadow-xs text-muted-foreground transition-all hover:scale-105 hover:text-primary hover:border-primary/40 active:scale-95 animate-in fade-in zoom-in-90 duration-200',
              className,
            )}
            aria-label="Zainstaluj aplikację na urządzeniu"
          />
        }
      >
        <Download className="size-4" />
      </TooltipTrigger>
      <TooltipContent>Zainstaluj aplikację</TooltipContent>
    </Tooltip>
  )
}
