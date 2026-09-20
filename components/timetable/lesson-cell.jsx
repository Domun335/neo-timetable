'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

export function LessonCell({
  lessons = [],
  selectedGroups = null,
  currentType = 'o',
  hideFiltered = true,
}) {
  if (!lessons || lessons.length === 0) {
    return <div className="h-full min-h-[56px] flex items-center justify-center text-muted-foreground/30 text-xs select-none">&mdash;</div>
  }

  const processedLessons = lessons.map((lesson) => {
    const isDimmed = (() => {
      if (!selectedGroups) return false
      if (!lesson.groupNum) return false

      if (typeof selectedGroups === 'object') {
        const cat = lesson.groupCategory || 'general'
        const chosen = selectedGroups[cat]
        if (chosen !== null && chosen !== undefined) {
          return lesson.groupNum !== chosen
        }
        return false
      }

      if (typeof selectedGroups === 'string') {
        return lesson.groupName?.trim() !== selectedGroups.trim()
      }

      return false
    })()

    return { lesson, isDimmed }
  })

  const visibleLessons = hideFiltered
    ? processedLessons.filter((p) => !p.isDimmed)
    : processedLessons

  if (visibleLessons.length === 0) {
    return (
      <div className="h-full min-h-[56px] flex items-center justify-center text-muted-foreground/30 text-xs select-none italic">
        &mdash;
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1.5 h-full justify-center p-1">
      {visibleLessons.map(({ lesson, isDimmed }, idx) => {
        const hasGroup = Boolean(lesson.groupName || lesson.groupNum)
        const teacherTooltip = lesson.teacherName
          ? `Nauczyciel: ${lesson.teacherName}`
          : lesson.teacher
          ? `Nauczyciel: ${lesson.teacher}`
          : ''

        const cat = lesson.groupCategory || 'general'
        const badgeLabel = (() => {
          if (!lesson.groupName) return null
          if (cat === 'wf') return `WF ${lesson.groupName}`
          if (cat === 'lang') return `Jęz ${lesson.groupName}`
          return lesson.groupName
        })()

        const badgeClass = (() => {
          if (cat === 'wf') {
            return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
          }
          if (cat === 'lang') {
            return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30'
          }
          return 'bg-secondary text-secondary-foreground border-border/40'
        })()

        return (
          <div
            key={idx}
            aria-hidden={isDimmed ? 'true' : undefined}
            className={cn(
              "flex flex-col gap-1 rounded-xl p-2 border border-border/60 bg-card/70 shadow-2xs transition-all duration-150 hover:shadow-sm hover:border-primary/40",
              isDimmed && "opacity-20 grayscale hover:opacity-100 hover:grayscale-0"
            )}
          >
            <div className="flex items-center justify-between gap-1">
              <span className="font-semibold text-xs text-foreground leading-tight line-clamp-2">
                {lesson.subject}
              </span>
              {hasGroup && badgeLabel && (
                <Badge
                  variant="outline"
                  className={cn("shrink-0 font-mono text-[10px] px-1.5 py-0 h-4.5 font-medium", badgeClass)}
                >
                  {badgeLabel}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-muted-foreground pt-0.5">
              {lesson.teacher && currentType !== 'n' && (
                lesson.teacherId ? (
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <Link
                          href={`/n/${lesson.teacherId}`}
                          className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-colors"
                        >
                          <span>{lesson.teacher}</span>
                        </Link>
                      }
                    />
                    <TooltipContent>{teacherTooltip}</TooltipContent>
                  </Tooltip>
                ) : (
                  <span className="text-foreground/80 font-medium">{lesson.teacher}</span>
                )
              )}

              {lesson.room && currentType !== 's' && (
                lesson.roomId ? (
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <Link
                          href={`/s/${lesson.roomId}`}
                          className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground font-mono font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                        >
                          <span>{lesson.room}</span>
                        </Link>
                      }
                    />
                    <TooltipContent>{`Plan sali: ${lesson.room}`}</TooltipContent>
                  </Tooltip>
                ) : (
                  <span className="text-muted-foreground font-mono">{lesson.room}</span>
                )
              )}

              {lesson.className && currentType !== 'o' && (
                lesson.classId ? (
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <Link
                          href={`/o/${lesson.classId}`}
                          className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-primary/10 text-primary font-bold hover:bg-primary/20 transition-colors"
                        >
                          <span>{lesson.className}</span>
                        </Link>
                      }
                    />
                    <TooltipContent>{`Plan klasy: ${lesson.className}`}</TooltipContent>
                  </Tooltip>
                ) : (
                  <span className="font-bold text-foreground">{lesson.className}</span>
                )
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

