'use client'

import { useState, memo } from 'react'
import { LessonCell } from './lesson-cell'
import { useCurrentLesson } from '@/hooks/use-current-lesson'
import { Coffee } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty'
import { Badge } from '@/components/ui/badge'

export const TimetableList = memo(function TimetableList({
  timetable,
  selectedGroups = null,
  currentInfo: passedCurrentInfo,
  hideFiltered = true,
}) {
  const { hours, dayNames, rawDays, type } = timetable
  const hookCurrentInfo = useCurrentLesson(passedCurrentInfo ? null : hours)
  const currentInfo = passedCurrentInfo || hookCurrentInfo

  const [userSelectedDayIndex, setUserSelectedDayIndex] = useState(null)

  const defaultDayIndex = (() => {
    if (!currentInfo?.isMounted || !currentInfo?.isSchoolDay) {
      return 0
    }
    if (currentInfo.status === 'after_school') {
      return currentInfo.currentDayIndex < 4 ? currentInfo.currentDayIndex + 1 : 0
    }
    return currentInfo.currentDayIndex >= 0 ? currentInfo.currentDayIndex : 0
  })()

  const selectedDayIndex = userSelectedDayIndex !== null ? userSelectedDayIndex : defaultDayIndex

  const sortedHourKeys = Object.keys(hours || {}).sort((a, b) => Number(a) - Number(b))

  const shortDayNames = ['Pon', 'Wt', 'Śr', 'Czw', 'Pt']

  const hourIndicesWithLessons = sortedHourKeys
    .map((_, idx) => ({
      idx,
      lessons: rawDays?.[idx]?.[selectedDayIndex] || [],
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

  return (
    <div className="w-full flex flex-col gap-3">
      <Tabs
        value={String(selectedDayIndex)}
        onValueChange={(val) => setUserSelectedDayIndex(Number(val))}
        className="w-full"
      >
        <TabsList className="grid grid-cols-5 w-full !h-auto group-data-horizontal/tabs:!h-auto p-1 rounded-2xl bg-muted/60 border border-border/80 shadow-2xs gap-1">
          {dayNames.map((dayName, idx) => {
            const isToday = currentInfo.isSchoolDay && currentInfo.currentDayIndex === idx

            return (
              <TabsTrigger
                key={idx}
                value={String(idx)}
                className="flex flex-col items-center justify-center py-2 px-1 rounded-xl text-xs font-semibold data-active:bg-card data-active:text-foreground data-active:shadow-xs data-active:border data-active:border-border/60 relative h-auto"
              >
                <span className="hidden sm:inline">{dayName}</span>
                <span className="sm:hidden">{shortDayNames[idx] || dayName.slice(0, 3)}</span>

                {isToday && (
                  <span className="mt-0.5 inline-block size-1.5 rounded-full bg-primary" />
                )}
              </TabsTrigger>
            )
          })}
        </TabsList>
      </Tabs>

      {!hasAnyLessonsThisDay ? (
        <Empty className="border border-dashed border-border/60 bg-muted/20 p-8 rounded-2xl">
          <EmptyHeader>
            <EmptyMedia variant="icon" className="size-12 rounded-2xl bg-muted/60 text-muted-foreground [&_svg]:size-6">
              <Coffee className="text-primary" />
            </EmptyMedia>
            <EmptyTitle>Brak zajęć w tym dniu</EmptyTitle>
            <EmptyDescription className="text-xs">
              Ciesz się wolnym czasem lub wybierz inny dzień powyżej.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="space-y-2">
          {visibleHourEntries.map(({ hourKey, hourIndex, hourObj }) => {
            const lessons = rawDays?.[hourIndex]?.[selectedDayIndex] || []
            const isCurrentPeriod =
              currentInfo.isSchoolDay &&
              currentInfo.currentDayIndex === selectedDayIndex &&
              currentInfo.currentLessonNumber === hourObj.number

            const hasLessons = lessons.length > 0

            if (!hasLessons) {
              return (
                <div
                  key={hourKey}
                  className="flex items-center justify-between px-3 py-2 rounded-xl border border-dashed border-border/60 bg-muted/20 text-xs text-muted-foreground"
                >
                  <div className="flex items-center gap-2">
                    <span className="flex size-5 items-center justify-center rounded-md bg-muted text-[11px] font-bold text-foreground/70">
                      {hourObj.number}
                    </span>
                    <span className="font-medium">Okienko / Wolna godzina</span>
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
                className={`rounded-2xl border p-3 transition-all ${
                  isCurrentPeriod
                    ? 'border-primary bg-primary/5 ring-2 ring-primary shadow-sm'
                    : 'border-border/80 bg-card/70 shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between pb-2 mb-1.5 border-b border-border/40">
                  <div className="flex items-center gap-2">
                    <span
                      className={`flex size-6 items-center justify-center rounded-lg text-xs font-extrabold ${
                        isCurrentPeriod
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-foreground'
                      }`}
                    >
                      {hourObj.number}
                    </span>
                    <span className="text-xs font-mono text-muted-foreground">
                      {hourObj.timeFrom} &ndash; {hourObj.timeTo}
                    </span>
                  </div>

                  {isCurrentPeriod && (
                    <Badge variant="default" className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/20 text-primary border-transparent animate-pulse">
                      Trwa teraz
                    </Badge>
                  )}
                </div>

                <LessonCell
                  lessons={lessons}
                  selectedGroups={selectedGroups}
                  currentType={type}
                  hideFiltered={hideFiltered}
                />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}, (prev, next) => {
  if (prev.timetable !== next.timetable) return false
  if (prev.selectedGroups !== next.selectedGroups) return false
  if (prev.hideFiltered !== next.hideFiltered) return false

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
})
