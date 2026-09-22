'use client'

import { useState, useRef, useEffect, memo } from 'react'
import { LessonCell } from './lesson-cell'
import { useCurrentLesson } from '@/hooks/use-current-lesson'
import { Coffee, ChevronLeft, ChevronRight } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { isLessonVisible } from '@/lib/timetable/group-utils'
import { cn } from '@/lib/utils'

/**
 * Porównanie stanu wybranych grup lekcyjnych (grupa bazowa + wyjątki przedmiotowe)
 */
function areGroupsEqual(prevGroups, nextGroups) {
  if (prevGroups === nextGroups) return true
  if (!prevGroups || !nextGroups) return false
  if (prevGroups.base !== nextGroups.base) return false

  const prevSub = prevGroups.subjects || {}
  const nextSub = nextGroups.subjects || {}
  if (prevSub === nextSub) return true

  const prevKeys = Object.keys(prevSub)
  const nextKeys = Object.keys(nextSub)
  if (prevKeys.length !== nextKeys.length) return false

  for (const key of prevKeys) {
    if (prevSub[key] !== nextSub[key]) return false
  }
  return true
}

/**
 * Widok listy planu lekcji (karty poszczególnych dni dla urządzeń mobilnych)
 * Zoptymalizowany przez React.memo — unika ponownego renderowania przy odliczaniu minut
 */
export const TimetableList = memo(
  function TimetableList({
    timetable,
    selectedGroups = null,
    currentInfo: passedCurrentInfo,
    onSetSubjectGroup = null,
  }) {
    const { hours, dayNames, rawDays, type } = timetable
    const hookCurrentInfo = useCurrentLesson(
      passedCurrentInfo ? null : { hours, rawDays, selectedGroups },
    )
    const currentInfo = passedCurrentInfo || hookCurrentInfo

    const [userSelectedDayIndex, setUserSelectedDayIndex] = useState(null)
    const currentLessonRef = useRef(null)
    const touchStartX = useRef(0)
    const touchStartY = useRef(0)

    const defaultDayIndex = (() => {
      if (!currentInfo?.isMounted || !currentInfo?.isSchoolDay) {
        return 0
      }
      if (currentInfo.status === 'after_school' || currentInfo.status === 'no_lessons_today') {
        if (
          currentInfo.nextSchoolDayIndex !== undefined &&
          currentInfo.nextSchoolDayIndex !== null
        ) {
          return currentInfo.nextSchoolDayIndex
        }
        return currentInfo.currentDayIndex < 4 ? currentInfo.currentDayIndex + 1 : 0
      }
      return currentInfo.currentDayIndex >= 0 ? currentInfo.currentDayIndex : 0
    })()

    const selectedDayIndex = userSelectedDayIndex !== null ? userSelectedDayIndex : defaultDayIndex

    const sortedHourKeys = Object.keys(hours || {}).sort((a, b) => Number(a) - Number(b))
    const shortDayNames = ['Pon', 'Wt', 'Śr', 'Czw', 'Pt']

    useEffect(() => {
      const timer = setTimeout(() => {
        if (
          currentInfo?.isSchoolDay &&
          currentInfo?.currentDayIndex === selectedDayIndex &&
          currentLessonRef.current
        ) {
          currentLessonRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          })
        }
      }, 300)
      return () => clearTimeout(timer)
    }, [selectedDayIndex, currentInfo?.isSchoolDay, currentInfo?.currentDayIndex])

    const handleTouchStart = (e) => {
      touchStartX.current = e.touches[0].clientX
      touchStartY.current = e.touches[0].clientY
    }

    const handleTouchEnd = (e) => {
      const deltaX = e.changedTouches[0].clientX - touchStartX.current
      const deltaY = e.changedTouches[0].clientY - touchStartY.current

      if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY) * 1.4) {
        if (deltaX < 0 && selectedDayIndex < 4) {
          setUserSelectedDayIndex(selectedDayIndex + 1)
        } else if (deltaX > 0 && selectedDayIndex > 0) {
          setUserSelectedDayIndex(selectedDayIndex - 1)
        }
      }
    }

    const isLessonActive = (lesson) => isLessonVisible(lesson, selectedGroups)

    const hourIndicesWithLessons = sortedHourKeys
      .map((_, idx) => ({
        idx,
        lessons: (rawDays?.[idx]?.[selectedDayIndex] || []).filter(isLessonActive),
      }))
      .filter((item) => item.lessons.length > 0)
      .map((item) => item.idx)

    const hasAnyLessonsThisDay = hourIndicesWithLessons.length > 0
    const minHourIndex = hasAnyLessonsThisDay ? Math.min(...hourIndicesWithLessons) : 0
    const maxHourIndex = hasAnyLessonsThisDay
      ? Math.max(...hourIndicesWithLessons)
      : sortedHourKeys.length - 1

    const visibleHourEntries = sortedHourKeys
      .map((hourKey, hourIndex) => ({ hourKey, hourIndex, hourObj: hours[hourKey] }))
      .filter(({ hourIndex }) => hourIndex >= minHourIndex && hourIndex <= maxHourIndex)

    const isCurrentDay =
      currentInfo?.isSchoolDay && currentInfo?.currentDayIndex === selectedDayIndex

    return (
      <div
        className="w-full flex flex-col gap-3 select-none touch-pan-y"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex flex-col gap-1.5 w-full">
          <Tabs
            value={String(selectedDayIndex)}
            onValueChange={(val) => setUserSelectedDayIndex(Number(val))}
            className="w-full"
          >
            <TabsList className="grid grid-cols-5 w-full !h-auto p-1 rounded-xl bg-muted/50 border border-border/70 shadow-2xs gap-1">
              {dayNames.map((dayName, idx) => {
                const isToday = currentInfo.isSchoolDay && currentInfo.currentDayIndex === idx
                const isSelected = selectedDayIndex === idx

                return (
                  <TabsTrigger
                    key={idx}
                    value={String(idx)}
                    className={cn(
                      'flex items-center justify-center h-8 px-1 rounded-lg text-xs font-semibold relative transition-all active:scale-95 border',
                      isSelected
                        ? 'bg-background text-foreground font-bold shadow-2xs border-border/70'
                        : isToday
                          ? 'border-primary/50 text-primary dark:text-primary bg-primary/5 font-semibold hover:bg-primary/10'
                          : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-background/40',
                    )}
                  >
                    <span className="text-xs">{shortDayNames[idx] || dayName.slice(0, 3)}</span>
                  </TabsTrigger>
                )
              })}
            </TabsList>
          </Tabs>

          <div className="flex items-center justify-between px-1 text-xs text-muted-foreground">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={selectedDayIndex === 0}
              onClick={() => setUserSelectedDayIndex(Math.max(0, selectedDayIndex - 1))}
              className="size-7 rounded-lg text-muted-foreground disabled:opacity-30 active:scale-95"
              aria-label="Poprzedni dzień"
            >
              <ChevronLeft className="size-4" />
            </Button>

            <div className="flex items-center gap-1.5">
              <span className="font-bold text-foreground text-xs">
                {dayNames[selectedDayIndex]}
              </span>
              {isCurrentDay && (
                <Badge
                  variant="secondary"
                  className="text-[10px] font-bold px-1.5 py-0 h-4 rounded-full bg-primary/15 text-primary border-transparent"
                >
                  Dziś
                </Badge>
              )}
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={selectedDayIndex === 4}
              onClick={() => setUserSelectedDayIndex(Math.min(4, selectedDayIndex + 1))}
              className="size-7 rounded-lg text-muted-foreground disabled:opacity-30 active:scale-95"
              aria-label="Następny dzień"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>

        {!hasAnyLessonsThisDay ? (
          <Empty className="border border-dashed border-border/70 bg-muted/20 p-8 rounded-3xl animate-in fade-in zoom-in-95 duration-200">
            <EmptyHeader>
              <EmptyMedia
                variant="icon"
                className="size-14 rounded-2xl bg-muted/70 text-muted-foreground [&_svg]:size-7"
              >
                <Coffee className="text-primary" />
              </EmptyMedia>
              <EmptyTitle className="text-sm font-bold">Brak zajęć w tym dniu</EmptyTitle>
              <EmptyDescription className="text-xs text-muted-foreground max-w-xs">
                {isCurrentDay
                  ? 'Brak zaplanowanych lekcji na dziś. Ciesz się wolnym czasem!'
                  : 'W ten dzień nie ma żadnych lekcji w planie.'}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="space-y-2.5">
            {visibleHourEntries.map(({ hourKey, hourIndex, hourObj }) => {
              const lessons = rawDays?.[hourIndex]?.[selectedDayIndex] || []
              const isCurrentPeriod =
                currentInfo.isSchoolDay &&
                currentInfo.currentDayIndex === selectedDayIndex &&
                currentInfo.currentLessonNumber === hourObj.number

              const activeLessons = lessons.filter(isLessonActive)
              const hasLessons = activeLessons.length > 0

              if (!hasLessons) {
                return (
                  <div
                    key={hourKey}
                    className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl border border-dashed border-border/60 bg-muted/20 text-xs text-muted-foreground"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="flex size-6 items-center justify-center rounded-lg bg-muted/80 text-[11px] font-bold text-foreground/70">
                        {hourObj.number}
                      </span>
                      <span className="font-medium text-[11px]">Okienko / Wolna godzina</span>
                    </div>
                    <span className="font-mono text-[11px] text-muted-foreground/70">
                      {hourObj.timeFrom} &ndash; {hourObj.timeTo}
                    </span>
                  </div>
                )
              }

              return (
                <div
                  key={hourKey}
                  ref={isCurrentPeriod ? currentLessonRef : null}
                  className={cn(
                    'rounded-2xl border p-3.5 transition-all shadow-2xs',
                    isCurrentPeriod
                      ? 'border-primary/80 bg-primary/[0.04] ring-2 ring-primary/30 shadow-xs'
                      : 'border-border/70 bg-card/85',
                  )}
                >
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/40">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          'flex size-6.5 items-center justify-center rounded-lg text-xs font-black shadow-2xs',
                          isCurrentPeriod
                            ? 'bg-primary text-primary-foreground ring-1 ring-primary/40'
                            : 'bg-muted text-foreground/85',
                        )}
                      >
                        {hourObj.number}
                      </span>

                      <span className="text-xs font-mono font-medium text-muted-foreground">
                        {hourObj.timeFrom} &ndash; {hourObj.timeTo}
                      </span>
                    </div>

                    {isCurrentPeriod && (
                      <Badge
                        variant="default"
                        className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-primary/20 text-primary border-transparent animate-pulse flex items-center gap-1"
                      >
                        <span className="size-1.5 rounded-full bg-primary" />
                        <span>Trwa teraz</span>
                      </Badge>
                    )}
                  </div>

                  <LessonCell
                    lessons={lessons}
                    selectedGroups={selectedGroups}
                    currentType={type}
                    isMobileList={true}
                    onSetSubjectGroup={onSetSubjectGroup}
                  />
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  },
  (prev, next) => {
    if (prev.timetable !== next.timetable) return false
    if (prev.onSetSubjectGroup !== next.onSetSubjectGroup) return false
    if (!areGroupsEqual(prev.selectedGroups, next.selectedGroups)) return false

    const prevInfo = prev.currentInfo
    const nextInfo = next.currentInfo
    if (prevInfo && nextInfo) {
      return (
        prevInfo.isSchoolDay === nextInfo.isSchoolDay &&
        prevInfo.currentDayIndex === nextInfo.currentDayIndex &&
        prevInfo.currentLessonNumber === nextInfo.currentLessonNumber &&
        prevInfo.status === nextInfo.status
      )
    }
    return prevInfo === nextInfo
  },
)
