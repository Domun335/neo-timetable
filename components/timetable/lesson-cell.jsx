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
      <div className="h-full min-h-10 flex items-center justify-center text-muted-foreground/30 text-xs select-none">
        &mdash;
      </div>
    )
  }

  const visibleLessons = lessons.filter((lesson) => isLessonVisible(lesson, selectedGroups))

  if (visibleLessons.length === 0) {
    return (
      <div className="h-full min-h-10 flex items-center justify-center text-muted-foreground/30 text-xs select-none">
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

          const badgeClass = 'bg-muted/80 text-foreground/80 border-border/70 hover:bg-muted font-medium'
          const overrideClass = 'bg-primary/10 text-primary border-primary/30 font-semibold'

          return (
            <div
              key={idx}
              className={cn(
                'flex flex-col gap-1.5 transition-all',
                visibleLessons.length > 1 && idx > 0 && 'pt-2.5 border-t border-border/50',
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-bold text-sm text-foreground leading-snug">
                  {lesson.subject}
                </span>

                {hasGroup &&
                  badgeLabel &&
                  (onSetSubjectGroup && lesson.groupNum ? (
                    (() => {
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
                            'shrink-0 font-mono text-[11px] px-2 py-0.5 h-5 rounded-md border transition-all cursor-pointer hover:scale-105 active:scale-95',
                            isOverriddenThis ? overrideClass : badgeClass,
                          )}
                        >
                          {badgeLabel}
                        </button>
                      )
                    })()
                  ) : (
                    <Badge
                      variant="outline"
                      className={cn(
                        'shrink-0 font-mono text-[11px] px-2 py-0.5 h-5 rounded-md',
                        badgeClass,
                      )}
                    >
                      {badgeLabel}
                    </Badge>
                  ))}
              </div>

              <div className="flex items-center gap-2 flex-wrap pt-0.5 text-xs text-muted-foreground">
                {lesson.room &&
                  currentType !== 's' &&
                  (lesson.roomId ? (
                    <Link
                      href={`/s/${lesson.roomId}`}
                      className="inline-flex items-center gap-1 font-semibold text-foreground/90 hover:text-primary transition-colors"
                    >
                      <DoorOpen className="size-3.5 shrink-0 text-muted-foreground" />
                      <span>sala {lesson.room}</span>
                    </Link>
                  ) : (
                    <span className="inline-flex items-center gap-1 font-medium text-foreground/75">
                      <DoorOpen className="size-3.5 shrink-0 text-muted-foreground" />
                      <span>sala {lesson.room}</span>
                    </span>
                  ))}

                {lesson.room && lesson.teacher && currentType !== 'n' && currentType !== 's' && (
                  <span className="text-muted-foreground/40 font-light">&bull;</span>
                )}

                {lesson.teacher &&
                  currentType !== 'n' &&
                  (lesson.teacherId ? (
                    <Link
                      href={`/n/${lesson.teacherId}`}
                      className="inline-flex items-center gap-1 hover:text-primary transition-colors text-muted-foreground hover:underline"
                    >
                      <User className="size-3.5 shrink-0 text-muted-foreground" />
                      <span>{lesson.teacher}</span>
                    </Link>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-muted-foreground">
                      <User className="size-3.5 shrink-0 text-muted-foreground" />
                      <span>{lesson.teacher}</span>
                    </span>
                  ))}

                {lesson.className &&
                  currentType !== 'o' &&
                  (lesson.classId ? (
                    <Link
                      href={`/o/${lesson.classId}`}
                      className="inline-flex items-center gap-1 font-bold text-primary hover:underline transition-colors"
                    >
                      <GraduationCap className="size-3.5 shrink-0" />
                      <span>{lesson.className}</span>
                    </Link>
                  ) : (
                    <span className="inline-flex items-center gap-1 font-bold text-foreground">
                      <GraduationCap className="size-3.5 shrink-0" />
                      <span>{lesson.className}</span>
                    </span>
                  ))}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1 h-full justify-start p-0.5">
      {visibleLessons.map((lesson, idx) => {
        const isMulti = visibleLessons.length > 1
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

        const badgeClass = 'bg-muted/80 text-foreground/80 border-border/60 hover:bg-muted font-medium'
        const overrideClass = 'bg-primary/10 text-primary border-primary/30 font-semibold'

        return (
          <div
            key={idx}
            className={cn(
              'flex flex-col rounded-lg border border-border/70 bg-card/85 shadow-2xs transition-all duration-150 hover:shadow-xs hover:border-primary/50',
              isMulti ? 'gap-0.5 p-1.5' : 'gap-0.5 px-2.5 py-1.5',
            )}
          >
            <div className="flex items-center justify-between gap-1 min-w-0">
              <span
                title={lesson.subject}
                className={cn(
                  'font-bold text-foreground leading-tight truncate',
                  isMulti ? 'text-[11px]' : 'text-xs',
                )}
              >
                {lesson.subject}
              </span>
              {hasGroup &&
                badgeLabel &&
                (onSetSubjectGroup && lesson.groupNum ? (
                  (() => {
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
                                'shrink-0 font-mono text-[9px] px-1 py-0 h-4 font-medium rounded border transition-all cursor-pointer hover:scale-105 active:scale-95',
                                isOverriddenThis ? overrideClass : badgeClass,
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
                  })()
                ) : (
                  <Badge
                    variant="outline"
                    className="shrink-0 font-mono text-[9px] px-1 py-0 h-4 font-medium"
                  >
                    {badgeLabel}
                  </Badge>
                ))}
            </div>

            <div
              className={cn(
                'text-muted-foreground flex items-center gap-1.5 flex-wrap leading-tight',
                isMulti ? 'text-[10px]' : 'text-[11px]',
              )}
            >
              {lesson.teacher &&
                currentType !== 'n' &&
                (lesson.teacherId ? (
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <Link
                          href={`/n/${lesson.teacherId}`}
                          className="inline-flex items-center gap-0.5 px-1 py-0.25 rounded bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-colors"
                        >
                          <span>{lesson.teacher}</span>
                        </Link>
                      }
                    />
                    <TooltipContent>{teacherTooltip}</TooltipContent>
                  </Tooltip>
                ) : (
                  <span className="text-foreground/80 font-medium">{lesson.teacher}</span>
                ))}

              {lesson.room &&
                currentType !== 's' &&
                (lesson.roomId ? (
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <Link
                          href={`/s/${lesson.roomId}`}
                          className="inline-flex items-center gap-0.5 px-1 py-0.25 rounded bg-muted text-muted-foreground font-mono font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                        >
                          <span>{lesson.room}</span>
                        </Link>
                      }
                    />
                    <TooltipContent>{`Plan sali: ${lesson.room}`}</TooltipContent>
                  </Tooltip>
                ) : (
                  <span className="text-muted-foreground font-mono">{lesson.room}</span>
                ))}

              {lesson.className &&
                currentType !== 'o' &&
                (lesson.classId ? (
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <Link
                          href={`/o/${lesson.classId}`}
                          className="inline-flex items-center gap-0.5 px-1 py-0.25 rounded bg-primary/10 text-primary font-bold hover:bg-primary/20 transition-colors"
                        >
                          <span>{lesson.className}</span>
                        </Link>
                      }
                    />
                    <TooltipContent>{`Plan klasy: ${lesson.className}`}</TooltipContent>
                  </Tooltip>
                ) : (
                  <span className="font-bold text-foreground">{lesson.className}</span>
                ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
