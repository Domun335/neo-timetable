'use client'

import { memo } from 'react'
import { LessonCell } from './lesson-cell'
import { useCurrentLesson } from '@/hooks/use-current-lesson'
import { Badge } from '@/components/ui/badge'

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

export const TimetableTable = memo(function TimetableTable({
  timetable,
  selectedGroups = null,
  currentInfo: passedCurrentInfo,
  onSetSubjectGroup = null,
}) {
  const { hours, dayNames, rawDays, type } = timetable
  const hookCurrentInfo = useCurrentLesson(passedCurrentInfo ? null : hours)
  const currentInfo = passedCurrentInfo || hookCurrentInfo

  const sortedHourKeys = Object.keys(hours || {}).sort((a, b) => Number(a) - Number(b))

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md shadow-sm print:overflow-visible print:shadow-none print:rounded-xl print:border-border">
      <div className="overflow-x-auto print:overflow-visible">
        <table className="w-full border-collapse text-left min-w-[840px] print:min-w-0 table-fixed">
          <thead>
            <tr className="border-b border-border/80 bg-muted/40 print:bg-muted/20">
              <th className="w-20 lg:w-24 p-3 text-xs font-bold uppercase tracking-wider text-muted-foreground text-center print:p-2 print:text-[11px] shrink-0">
                Godz.
              </th>
              {dayNames.map((dayName, dayIndex) => {
                const isToday = currentInfo.isSchoolDay && currentInfo.currentDayIndex === dayIndex

                return (
                  <th
                    key={dayIndex}
                    className={`w-[19%] p-3 text-xs font-bold uppercase tracking-wider transition-colors print:p-2 print:text-[11px] ${
                      isToday
                        ? 'bg-primary/10 text-primary border-b-2 border-primary print:bg-transparent print:text-foreground print:border-b-foreground/20'
                        : 'text-foreground/80'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="truncate">{dayName}</span>
                      {isToday && (
                        <Badge variant="default" className="no-print text-[10px] font-mono px-1.5 py-0 h-4.5 rounded-full shrink-0">
                          Dziś
                        </Badge>
                      )}
                    </div>
                  </th>
                )
              })}
            </tr>
          </thead>

          <tbody className="divide-y divide-border/60">
            {sortedHourKeys.map((hourKey, hourIndex) => {
              const hourObj = hours[hourKey]
              const isCurrentPeriod =
                currentInfo.isSchoolDay &&
                currentInfo.currentLessonNumber === hourObj.number

              return (
                <tr
                  key={hourKey}
                  className={`transition-colors ${
                    isCurrentPeriod
                      ? 'bg-primary/5 hover:bg-primary/10 ring-1 ring-inset ring-primary/40 print:bg-transparent print:ring-0'
                      : 'hover:bg-muted/30'
                  }`}
                >
                  <td className="p-3 text-center align-middle border-r border-border/60 bg-muted/20 shrink-0 print:p-1.5">
                    <div className="flex flex-col items-center justify-center">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-sm font-extrabold print:text-xs ${isCurrentPeriod ? 'text-primary print:text-foreground' : 'text-foreground'}`}>
                          {hourObj.number}
                        </span>
                        {isCurrentPeriod && (
                          <span className="no-print relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-mono text-muted-foreground whitespace-nowrap print:text-[10px]">
                        {hourObj.timeFrom}
                      </span>
                      <span className="text-[10px] font-mono text-muted-foreground/60 whitespace-nowrap print:text-[9px]">
                        {hourObj.timeTo}
                      </span>
                    </div>
                  </td>

                  {dayNames.map((_, dayIndex) => {
                    const lessonsForSlot = rawDays?.[hourIndex]?.[dayIndex] || []
                    const isToday =
                      currentInfo.isSchoolDay && currentInfo.currentDayIndex === dayIndex

                    return (
                      <td
                        key={dayIndex}
                        className={`p-1.5 align-top border-r border-border/40 last:border-r-0 print:p-1 ${
                          isToday && isCurrentPeriod
                            ? 'bg-primary/10 ring-2 ring-primary ring-inset rounded-lg print:ring-0 print:bg-transparent'
                            : isToday
                            ? 'bg-primary/5 print:bg-transparent'
                            : ''
                        }`}
                      >
                        <LessonCell
                          lessons={lessonsForSlot}
                          selectedGroups={selectedGroups}
                          currentType={type}
                          onSetSubjectGroup={onSetSubjectGroup}
                        />
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}, (prev, next) => {
  if (prev.timetable !== next.timetable) return false
  if (prev.onSetSubjectGroup !== next.onSetSubjectGroup) return false
  if (!areGroupsEqual(prev.selectedGroups, next.selectedGroups)) return false

  const prevInfo = prev.currentInfo
  const nextInfo = next.currentInfo
  if (prevInfo && nextInfo) {
    return (
      prevInfo.isSchoolDay === nextInfo.isSchoolDay &&
      prevInfo.currentDayIndex === nextInfo.currentDayIndex &&
      prevInfo.currentLessonNumber === nextInfo.currentLessonNumber
    )
  }
  return prevInfo === nextInfo
})
