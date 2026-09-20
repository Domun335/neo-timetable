'use client'

import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { useIsMounted } from '@/hooks/use-is-mounted'
import { cn } from '@/lib/utils'

export function ThemeToggle({ className = '' }) {
  const { setTheme, resolvedTheme } = useTheme()
  const mounted = useIsMounted()

  if (!mounted) {
    return (
      <Button
        variant="outline"
        size="icon"
        className={cn(
          'rounded-xl border-border/60 bg-card/60 backdrop-blur-md shadow-xs',
          className,
        )}
        aria-label="Przełącz motyw"
        disabled
      >
        <span className="size-4" />
      </Button>
    )
  }

  const isDark = resolvedTheme === 'dark'
  const tooltipText = isDark ? 'Przełącz na jasny motyw' : 'Przełącz na ciemny motyw'

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className={cn(
              'rounded-xl border-border/60 bg-card/60 backdrop-blur-md shadow-xs transition-all hover:scale-105 active:scale-95',
              className,
            )}
            aria-label="Przełącz motyw"
          />
        }
      >
        {isDark ? (
          <Sun className="size-4 text-amber-400 transition-transform duration-300 hover:rotate-45" />
        ) : (
          <Moon className="size-4 text-sky-600 transition-transform duration-300 hover:-rotate-12" />
        )}
      </TooltipTrigger>
      <TooltipContent>{tooltipText}</TooltipContent>
    </Tooltip>
  )
}
