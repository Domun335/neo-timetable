'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'

export function GroupCustomizerDialog({
  open,
  onOpenChange,
  subjectGroups = [],
  selectedGroups = { base: null, subjects: {} },
  onSetSubjectGroup,
  onClearSubjectOverride,
  onResetAllOverrides,
}) {
  const baseGroup = selectedGroups?.base ?? null
  const subjectsMap = selectedGroups?.subjects || {}
  const overridesCount = Object.keys(subjectsMap).length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden rounded-2xl border-border/70 shadow-xl">
        <DialogHeader className="px-5 sm:px-6 py-4 border-b border-border/60 bg-muted/20">
          <DialogTitle className="text-base font-bold text-foreground">Dostosuj grupy</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-0.5">
            Wybierz grupę dla każdego przedmiotu z podziałem:
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-3.5 space-y-1.5 divide-y divide-border/40">
          {subjectGroups.map((item) => {
            const currentOverride = subjectsMap[item.subject]
            const hasOverride = currentOverride !== undefined
            const subjectHasBaseGroup =
              baseGroup !== null && item.groups.some((g) => g.num === baseGroup)

            const effectiveSelected = hasOverride
              ? currentOverride
              : subjectHasBaseGroup
                ? baseGroup
                : 'all'

            return (
              <div
                key={item.subject}
                className="flex items-center justify-between gap-3 pt-2.5 first:pt-0"
              >
                <div className="min-w-0 flex-1">
                  <span className="font-semibold text-xs sm:text-sm text-foreground leading-snug block truncate">
                    {item.displayName}
                  </span>
                </div>

                <div
                  role="group"
                  aria-label={`Wybór grupy dla: ${item.displayName}`}
                  className="inline-flex items-center p-0.5 rounded-lg bg-muted/60 border border-border/60 gap-0.5 shrink-0 text-xs"
                >
                  {item.groups.map((grp) => {
                    const isSelected = effectiveSelected === grp.num
                    const isOverriddenThis = hasOverride && currentOverride === grp.num

                    return (
                      <button
                        key={grp.num}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => {
                          if (hasOverride && currentOverride === grp.num) {
                            onClearSubjectOverride?.(item.subject)
                          } else {
                            onSetSubjectGroup?.(item.subject, grp.num)
                          }
                        }}
                        className={cn(
                          'px-2.5 py-1 rounded-md font-medium text-xs transition-all active:scale-95 cursor-pointer',
                          isSelected
                            ? isOverriddenThis
                              ? 'bg-primary text-primary-foreground font-bold shadow-2xs'
                              : 'bg-background text-foreground shadow-2xs font-semibold'
                            : 'text-muted-foreground hover:text-foreground',
                        )}
                        title={grp.label ? `Grupa ${grp.num} (${grp.label})` : `Grupa ${grp.num}`}
                      >
                        Gr {grp.num}
                      </button>
                    )
                  })}

                  <button
                    type="button"
                    aria-pressed={effectiveSelected === 'all'}
                    aria-label={`Wszystkie grupy dla: ${item.displayName}`}
                    onClick={() => {
                      if (hasOverride && currentOverride === 'all') {
                        onClearSubjectOverride?.(item.subject)
                      } else {
                        onSetSubjectGroup?.(item.subject, 'all')
                      }
                    }}
                    className={cn(
                      'px-2 py-1 rounded-md font-medium text-xs transition-all active:scale-95 cursor-pointer',
                      effectiveSelected === 'all'
                        ? hasOverride && currentOverride === 'all'
                          ? 'bg-primary text-primary-foreground font-bold shadow-2xs'
                          : 'bg-background text-foreground shadow-2xs font-semibold'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                    title="Pokaż wszystkie grupy tego przedmiotu"
                  >
                    Wsz.
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        <DialogFooter className="m-0 px-5 sm:px-6 py-3.5 sm:py-4 border-t border-border/60 bg-muted/20 flex flex-row items-center justify-between sm:justify-between gap-3">
          {overridesCount > 0 ? (
            <button
              type="button"
              onClick={onResetAllOverrides}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-medium transition-colors cursor-pointer"
            >
              <RotateCcw className="size-3" />
              <span>Przywróć domyślne ({overridesCount})</span>
            </button>
          ) : (
            <span className="text-xs text-muted-foreground">
              Domyślna: {baseGroup ? `Grupa ${baseGroup}` : 'Wszystkie'}
            </span>
          )}

          <Button
            type="button"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="rounded-xl px-5 h-8 text-xs font-semibold shrink-0"
          >
            Gotowe
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
