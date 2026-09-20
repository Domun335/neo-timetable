'use client'

import { useState, useEffect, useMemo } from 'react'
import { useIsMounted } from './use-is-mounted'

/**
 * Konwertuje ciąg "HH:MM" na liczbę minut od północy
 * @param {string} timeStr
 * @returns {number}
 */
function timeToMinutes(timeStr) {
  if (!timeStr) return 0
  const [h, m] = timeStr.split(':').map((s) => parseInt(s.trim(), 10))
  return h * 60 + (m || 0)
}

/**
 * Formatuje liczbę minut do czytelnej postaci w języku polskim (np. "2 godziny", "1 godzinę", "45 min", "1 godz. 30 min")
 * @param {number} totalMinutes
 * @returns {string}
 */
export function formatRemainingTime(totalMinutes) {
  if (totalMinutes === null || totalMinutes === undefined || totalMinutes < 0) {
    return ''
  }

  if (totalMinutes < 60) {
    return `${totalMinutes} min`
  }

  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  const getHoursText = (h) => {
    if (h === 1) return '1 godzinę'
    const lastDigit = h % 10
    const lastTwo = h % 100
    if (lastDigit >= 2 && lastDigit <= 4 && (lastTwo < 10 || lastTwo >= 20)) {
      return `${h} godziny`
    }
    return `${h} godzin`
  }

  if (minutes === 0) {
    return getHoursText(hours)
  }

  return `${hours} godz. ${minutes} min`
}

/**
 * Hook określający aktualną lekcję, przerwę i odliczanie do dzwonka
 * @param {Record<number, import('@/lib/timetable/types').TableHour>} hours
 */
export function useCurrentLesson(hours) {
  const isMounted = useIsMounted()
  const [now, setNow] = useState(() => (typeof window !== 'undefined' ? new Date() : null))

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date())
    }, 15000) // 15s

    return () => clearInterval(interval)
  }, [])

  return useMemo(() => {
    if (!isMounted || !now) {
      return {
        isMounted: false,
        isWeekend: false,
        currentDayIndex: -1,
        isSchoolDay: false,
        status: 'loading',
        currentLessonNumber: null,
        nextLessonNumber: null,
        minutesRemaining: null,
        badgeText: null,
      }
    }

    return {
      isMounted: true,
      ...calculateCurrentState(hours, now),
    }
  }, [hours, now, isMounted])
}

/**
 * @param {Record<number, import('@/lib/timetable/types').TableHour>} hours
 * @param {Date} [now]
 */
function calculateCurrentState(hours, now = new Date()) {
  const jsDay = now.getDay()

  const currentDayIndex = jsDay >= 1 && jsDay <= 5 ? jsDay - 1 : -1
  const isWeekend = currentDayIndex === -1

  const currentMinutes = now.getHours() * 60 + now.getMinutes()

  if (!hours || Object.keys(hours).length === 0) {
    return {
      isWeekend,
      currentDayIndex: currentDayIndex === -1 ? 0 : currentDayIndex,
      isSchoolDay: !isWeekend,
      status: 'unknown',
      currentLessonNumber: null,
      nextLessonNumber: null,
      minutesRemaining: null,
      badgeText: isWeekend ? 'Weekend' : null,
    }
  }

  const sortedHours = Object.values(hours).sort((a, b) => a.number - b.number)
  if (sortedHours.length === 0) {
    return {
      isWeekend,
      currentDayIndex: currentDayIndex === -1 ? 0 : currentDayIndex,
      isSchoolDay: !isWeekend,
      status: 'unknown',
      currentLessonNumber: null,
      nextLessonNumber: null,
      minutesRemaining: null,
      badgeText: null,
    }
  }

  const firstLesson = sortedHours[0]
  const lastLesson = sortedHours[sortedHours.length - 1]
  const dayStartMinutes = timeToMinutes(firstLesson.timeFrom)
  const dayEndMinutes = timeToMinutes(lastLesson.timeTo)

  if (isWeekend) {
    return {
      isWeekend: true,
      currentDayIndex: 0,
      isSchoolDay: false,
      status: 'weekend',
      currentLessonNumber: null,
      nextLessonNumber: null,
      minutesRemaining: null,
      badgeText: 'Weekend',
    }
  }

  if (currentMinutes < dayStartMinutes) {
    const diff = dayStartMinutes - currentMinutes
    return {
      isWeekend: false,
      currentDayIndex,
      isSchoolDay: true,
      status: 'before_school',
      currentLessonNumber: null,
      nextLessonNumber: firstLesson.number,
      minutesRemaining: diff,
      badgeText: `Przed lekcjami • Początek za ${formatRemainingTime(diff)}`,
    }
  }

  if (currentMinutes >= dayEndMinutes) {
    const isFriday = currentDayIndex === 4
    const nextStartStr = firstLesson.timeFrom || '8:00'
    const badgeText = isFriday
      ? 'Koniec zajęć na dziś • Miłego weekendu!'
      : `Koniec zajęć na dziś • Jutro od ${nextStartStr}`

    return {
      isWeekend: false,
      currentDayIndex,
      isSchoolDay: true,
      status: 'after_school',
      currentLessonNumber: null,
      nextLessonNumber: null,
      minutesRemaining: null,
      badgeText,
    }
  }

  for (let i = 0; i < sortedHours.length; i++) {
    const h = sortedHours[i]
    const start = timeToMinutes(h.timeFrom)
    const end = timeToMinutes(h.timeTo)

    if (currentMinutes >= start && currentMinutes < end) {
      const diff = end - currentMinutes
      return {
        isWeekend: false,
        currentDayIndex,
        isSchoolDay: true,
        status: 'in_lesson',
        currentLessonNumber: h.number,
        nextLessonNumber: sortedHours[i + 1]?.number || null,
        minutesRemaining: diff,
        badgeText: `Trwa lekcja ${h.number} • ${diff} min do dzwonka`,
      }
    }

    const nextH = sortedHours[i + 1]
    if (nextH) {
      const nextStart = timeToMinutes(nextH.timeFrom)
      if (currentMinutes >= end && currentMinutes < nextStart) {
        const diff = nextStart - currentMinutes
        return {
          isWeekend: false,
          currentDayIndex,
          isSchoolDay: true,
          status: 'break',
          currentLessonNumber: null,
          nextLessonNumber: nextH.number,
          minutesRemaining: diff,
          badgeText: `Przerwa • Za ${formatRemainingTime(diff)} lekcja ${nextH.number}`,
        }
      }
    }
  }

  return {
    isWeekend: false,
    currentDayIndex,
    isSchoolDay: true,
    status: 'unknown',
    currentLessonNumber: null,
    nextLessonNumber: null,
    minutesRemaining: null,
    badgeText: null,
  }
}
