'use client'

import { useState } from 'react'
import { SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GroupCustomizerDialog } from './group-customizer-dialog'
import { cn } from '@/lib/utils'

export function GroupFilter({
  availableGroups = { general: [], lang: [], wf: [] },
  subjectGroups = [],
  selectedGroups = { base: null, subjects: {} },
  onChangeGroups,
  onSetBaseGroup,
  onSetSubjectGroup,
  onClearSubjectOverride,
  onResetAllOverrides,
}) {
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false)

  const hasAnyGroups =
    (availableGroups?.general?.length || 0) > 0 ||
    (availableGroups?.lang?.length || 0) > 0 ||
    (availableGroups?.wf?.length || 0) > 0 ||
    (subjectGroups?.length || 0) > 0

  if (!hasAnyGroups) return null

  const maxGroupNum = Math.max(
    2,
    ...(availableGroups?.general || []),
    ...(availableGroups?.lang || []),
    ...(availableGroups?.wf || []),
    ...(subjectGroups?.flatMap((s) => s.groups?.map((g) => g.num) || []) || []),
  )

  const groupNumbers = Array.from({ length: maxGroupNum }, (_, i) => i + 1)

  const currentBase = selectedGroups?.base ?? null
  const subjectsMap = selectedGroups?.subjects || {}
  const overridesCount = Object.keys(subjectsMap).length

  const handleSelectBase = (num) => {
    if (onSetBaseGroup) {
      onSetBaseGroup(num)
    } else if (onChangeGroups) {
      onChangeGroups({
        base: num,
        subjects: subjectsMap,
      })
    }
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div
        role="group"
        aria-label="Wybór grupy lekcyjnej"
        className="inline-flex items-center p-1 rounded-xl bg-muted/60 border border-border/60 gap-1 text-xs font-semibold shadow-2xs shrink-0"
      >
        <span className="text-[11px] font-medium text-muted-foreground pl-2 sm:pl-2.5 pr-1 select-none">
          <span className="sm:hidden">Gr:</span>
          <span className="hidden sm:inline">Grupy:</span>
        </span>

        <button
          type="button"
          aria-label="Wszystkie grupy"
          aria-pressed={currentBase === null && overridesCount === 0}
          onClick={() => handleSelectBase(null)}
          className={cn(
            'px-2.5 sm:px-3 py-1.5 rounded-lg transition-all active:scale-95 cursor-pointer',
            currentBase === null && overridesCount === 0
              ? 'bg-background text-foreground shadow-2xs'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          Wszystkie
        </button>

        {groupNumbers.map((num) => {
          const isBaseSelected = currentBase === num
          return (
            <button
              key={num}
              type="button"
              aria-label={`Grupa ${num}`}
              aria-pressed={isBaseSelected}
              onClick={() => handleSelectBase(num)}
              className={cn(
                'min-w-7.5 px-2.5 sm:px-3 py-1.5 rounded-lg transition-all active:scale-95 cursor-pointer text-center',
                isBaseSelected
                  ? 'bg-primary text-primary-foreground shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {num}
            </button>
          )
        })}
      </div>

      {subjectGroups.length > 0 && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          aria-label="Dostosuj przedmioty"
          title="Dostosuj przedmioty"
          onClick={() => setIsCustomizerOpen(true)}
          className={cn(
            'h-8.5 px-2.5 sm:px-3 rounded-xl text-xs font-medium gap-1.5 transition-all shadow-2xs border-border/60 shrink-0',
            overridesCount > 0
              ? 'bg-primary/10 border-primary/40 text-primary hover:bg-primary/20 font-semibold'
              : 'bg-card/70 hover:bg-muted text-muted-foreground hover:text-foreground',
          )}
        >
          <SlidersHorizontal className="size-3.5 shrink-0" />
          <span className="hidden min-[375px]:inline">
            Dostosuj<span className="hidden sm:inline"> przedmioty</span>
          </span>
          {overridesCount > 0 && (
            <span className="inline-flex items-center justify-center size-4 text-[10px] font-bold rounded-full bg-primary text-primary-foreground shrink-0">
              {overridesCount}
            </span>
          )}
        </Button>
      )}

      <GroupCustomizerDialog
        open={isCustomizerOpen}
        onOpenChange={setIsCustomizerOpen}
        subjectGroups={subjectGroups}
        selectedGroups={selectedGroups}
        onSetSubjectGroup={onSetSubjectGroup}
        onClearSubjectOverride={onClearSubjectOverride}
        onResetAllOverrides={onResetAllOverrides}
      />
    </div>
  )
}
