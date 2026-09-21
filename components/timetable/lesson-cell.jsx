'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { User, DoorOpen, GraduationCap } from 'lucide-react'
import { isLessonVisible } from '@/lib/timetable/group-utils'
import { cn } from '@/lib/utils'

export function LessonCell({
  lessons = [],
  selectedGroups = null,
  currentType = 'o',
  isMobileList = false,
  onSetSubjectGroup = null,
}) {
  if (!lessons || lessons.length === 0) {
    return (
      <div className="h-full min-h-[52px] flex items-center justify-center text-muted-foreground/30 text-xs select-none">
        &mdash;
      </div>
    )
  }

  const visibleLessons = lessons.filter((lesson) => isLessonVisible(lesson, selectedGroups))

  if (visibleLessons.length === 0) {
    return (
      <div className="h-full min-h-[52px] flex items-center justify-center text-muted-foreground/30 text-xs select-none">
        &mdash;
      </div>
    )
  }

  if (isMobileList) {
    return (
      <div className="flex flex-col gap-2.5 w-full">
        {visibleLessons.map((lesson, idx) => {
          const hasGroup = Boolean(lesson.groupName || lesson.groupNum)
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
            return 'bg-secondary text-secondary-foreground border-border/50'
          })()

          return (
            <div
              key={idx}
              className={cn(
                'flex flex-col gap-1.5 transition-all',
                visibleLessons.length > 1 &&
                  idx > 0 &&
                  'pt-2.5 border-t border-border/50',
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-bold text-sm text-foreground leading-snug">
                  {lesson.subject}
                </span>

                {hasGroup && badgeLabel && (
                  onSetSubjectGroup && lesson.groupNum ? (() => {
                    const currentOverride =
                      selectedGroups?.subjects &&
                      Object.hasOwn(selectedGroups.subjects, lesson.subject)
                        ? selectedGroups.subjects[lesson.subject]
                        : undefined
                    const isOverriddenThis = currentOverride === lesson.groupNum

                    return (
                      <button
                        type="button"
                        aria-pressed={isOverriddenThis}
                        onClick={(e) => {
                          e.stopPropagation()
                          if (isOverriddenThis) {
                            onSetSubjectGroup(lesson.subject, undefined)
                          } else {
                            onSetSubjectGroup(lesson.subject, lesson.groupNum)
                          }
                        }}
                        title={
                          isOverriddenThis
                            ? `Kliknij, aby odznaczyć Grupę ${lesson.groupNum} i przywrócić domyślne`
                            : `Kliknij, aby wybrać Grupę ${lesson.groupNum} dla: ${lesson.subject}`
                        }
                        className={cn(
                          'shrink-0 font-mono text-[11px] px-2 py-0.5 h-5 font-semibold rounded-md border transition-all cursor-pointer hover:scale-105 active:scale-95',
                          badgeClass,
                        )}
                      >
                        {badgeLabel}
                      </button>
                    )
                  })() : (
                    <Badge
                      variant="outline"
                      className={cn(
                        'shrink-0 font-mono text-[11px] px-2 py-0.5 h-5 font-semibold rounded-md',
                        badgeClass,
                      )}
                    >
                      {badgeLabel}
                    </Badge>
                  )
                )}
              </div>

              <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                {lesson.teacher && currentType !== 'n' && (
                  lesson.teacherId ? (
                    <Link
                      href={`/n/${lesson.teacherId}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 active:scale-95 transition-all text-xs font-semibold"
                    >
                      <User className="size-3 shrink-0" />
                      <span>{lesson.teacher}</span>
                    </Link>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-muted text-foreground/80 text-xs font-medium">
                      <User className="size-3 shrink-0" />
                      <span>{lesson.teacher}</span>
                    </span>
                  )
                )}

                {lesson.room && currentType !== 's' && (
                  lesson.roomId ? (
                    <Link
                      href={`/s/${lesson.roomId}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-muted text-muted-foreground hover:text-foreground active:scale-95 transition-all text-xs font-mono font-medium hover:bg-accent"
                    >
                      <DoorOpen className="size-3 shrink-0 text-muted-foreground" />
                      <span>s. {lesson.room}</span>
                    </Link>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-muted/60 text-muted-foreground text-xs font-mono">
                      <DoorOpen className="size-3 shrink-0" />
                      <span>s. {lesson.room}</span>
                    </span>
                  )
                )}

                {lesson.className && currentType !== 'o' && (
                  lesson.classId ? (
                    <Link
                      href={`/o/${lesson.classId}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 active:scale-95 transition-all text-xs font-bold"
                    >
                      <GraduationCap className="size-3 shrink-0" />
                      <span>{lesson.className}</span>
                    </Link>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-muted text-foreground font-bold text-xs">
                      <GraduationCap className="size-3 shrink-0" />
                      <span>{lesson.className}</span>
                    </span>
                  )
                )}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1.5 h-full justify-start p-1">
      {visibleLessons.map((lesson, idx) => {
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
            className="flex flex-col gap-1 rounded-xl p-2.5 border border-border/70 bg-card/85 shadow-2xs transition-all duration-150 hover:shadow-xs hover:border-primary/50"
          >
            <div className="flex items-start justify-between gap-1">
              <span className="font-bold text-xs text-foreground leading-snug line-clamp-2">
                {lesson.subject}
              </span>
              {hasGroup && badgeLabel && (
                onSetSubjectGroup && lesson.groupNum ? (() => {
                  const currentOverride =
                    selectedGroups?.subjects &&
                    Object.hasOwn(selectedGroups.subjects, lesson.subject)
                      ? selectedGroups.subjects[lesson.subject]
                      : undefined
                  const isOverriddenThis = currentOverride === lesson.groupNum

                  return (
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <button
                            type="button"
                            aria-pressed={isOverriddenThis}
                            onClick={(e) => {
                              e.stopPropagation()
                              if (isOverriddenThis) {
                                onSetSubjectGroup(lesson.subject, undefined)
                              } else {
                                onSetSubjectGroup(lesson.subject, lesson.groupNum)
                              }
                            }}
                            className={cn(
                              'shrink-0 font-mono text-[10px] px-1.5 py-0 h-4.5 font-medium rounded-md border transition-all cursor-pointer hover:scale-105 active:scale-95',
                              badgeClass,
                            )}
                          >
                            {badgeLabel}
                          </button>
                        }
                      />
                      <TooltipContent>
                        {isOverriddenThis
                          ? `Kliknij, aby odznaczyć Grupę ${lesson.groupNum} i przywrócić domyślne`
                          : `Kliknij, aby przypisać Grupę ${lesson.groupNum} do: ${lesson.subject}`}
                      </TooltipContent>
                    </Tooltip>
                  )
                })() : (
                  <Badge
                    variant="outline"
                    className={cn(
                      'shrink-0 font-mono text-[10px] px-1.5 py-0 h-4.5 font-medium',
                      badgeClass,
                    )}
                  >
                    {badgeLabel}
                  </Badge>
                )
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
