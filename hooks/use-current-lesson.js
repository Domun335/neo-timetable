'use client'

import { useState, useEffect, useMemo } from 'react'
import { useIsMounted } from './use-is-mounted.js'
import { isLessonVisible } from '../lib/timetable/group-utils.js'

/**
 * Konwertuje ciąg "HH:MM" na liczbę minut od północy
 * @param {string} timeStr
 * @returns {number}
 */
export function timeToMinutes(timeStr) {
  if (!timeStr) return 0
  const [h, m] = timeStr.split(':').map((s) => parseInt(s.trim(), 10))
  return h * 60 + (m || 0)
}

/**
 * Formatuje liczbę minut do czytelnej postaci w języku polskim
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

const POLISH_DAY_PREP = {
  0: 'w poniedziałek',
  1: 'we wtorek',
  2: 'w środę',
  3: 'w czwartek',
  4: 'w piątek',
}

/**
 * Wyznacza listę slotów godzinowych i aktywnych lekcji dla danego dnia tygodnia
 * @param {number} dayIndex
 * @param {Record<string|number, import('@/lib/timetable/types').TableHour>} hours
 * @param {any[][][]} [rawDays]
 * @param {any} [selectedGroups]
 */
export function getDaySchedule(dayIndex, hours, rawDays, selectedGroups) {
  if (!hours || typeof hours !== 'object') {
    return {
      hasLessons: false,
      slots: [],
      lessonSlots: [],
      firstSlot: null,
      lastSlot: null,
    }
  }

  const sortedHourKeys = Object.keys(hours).sort((a, b) => Number(a) - Number(b))
  if (sortedHourKeys.length === 0) {
    return {
      hasLessons: false,
      slots: [],
      lessonSlots: [],
      firstSlot: null,
      lastSlot: null,
    }
  }

  const slots = []
  for (let idx = 0; idx < sortedHourKeys.length; idx++) {
    const hourKey = sortedHourKeys[idx]
    const hourObj = hours[hourKey]
    if (!hourObj) continue

    const slotRawLessons = rawDays?.[idx]?.[dayIndex] || []
    const visibleLessons = rawDays
      ? slotRawLessons.filter((lesson) => isLessonVisible(lesson, selectedGroups))
      : []

    const hasLesson = rawDays ? visibleLessons.length > 0 : true

    slots.push({
      hourIndex: idx,
      hour: hourObj,
      number: hourObj.number,
      timeFrom: hourObj.timeFrom,
      timeTo: hourObj.timeTo,
      startMinutes: timeToMinutes(hourObj.timeFrom),
      endMinutes: timeToMinutes(hourObj.timeTo),
      hasLesson,
      lessons: visibleLessons,
    })
  }

  const lessonSlots = slots.filter((s) => s.hasLesson)

  return {
    hasLessons: lessonSlots.length > 0,
    slots,
    lessonSlots,
    firstSlot: lessonSlots.length > 0 ? lessonSlots[0] : null,
    lastSlot: lessonSlots.length > 0 ? lessonSlots[lessonSlots.length - 1] : null,
  }
}

/**
 * Szuka kolejnego dnia nauki z zaplanowanymi lekcjami
 * @param {number} currentDayIndex
 * @param {Record<string|number, import('@/lib/timetable/types').TableHour>} hours
 * @param {any[][][]} [rawDays]
 * @param {any} [selectedGroups]
 */
export function findNextSchoolDay(currentDayIndex, hours, rawDays, selectedGroups) {
  const startDay = currentDayIndex === -1 ? 0 : (currentDayIndex + 1) % 5

  for (let offset = 0; offset < 5; offset++) {
    const dayIdx = (startDay + offset) % 5
    const schedule = getDaySchedule(dayIdx, hours, rawDays, selectedGroups)
    if (schedule.hasLessons) {
      return {
        dayIndex: dayIdx,
        schedule,
      }
    }
  }

  const fallbackSchedule = getDaySchedule(startDay, hours, null, null)
  return {
    dayIndex: startDay,
    schedule: fallbackSchedule,
  }
}

/**
 * Główny algorytm wyliczający stan timera na dany moment
 * @param {object} params
 * @param {Record<string|number, import('@/lib/timetable/types').TableHour>} params.hours
 * @param {any[][][]} [params.rawDays]
 * @param {any} [params.selectedGroups]
 * @param {Date} [params.now]
 */
export function calculateCurrentState({ hours, rawDays, selectedGroups, now = new Date() }) {
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
      nextSchoolDayIndex: 0,
      minutesRemaining: null,
      badgeText: isWeekend ? 'Weekend' : null,
      actualStartMinutes: null,
      actualEndMinutes: null,
    }
  }

  if (isWeekend) {
    const nextSchoolDay = findNextSchoolDay(-1, hours, rawDays, selectedGroups)
    const nextStartStr = nextSchoolDay.schedule.firstSlot?.timeFrom || '8:00'
    const isSunday = jsDay === 0

    let badgeText = ''
    if (isSunday && nextSchoolDay.dayIndex === 0) {
      badgeText = `Weekend • Jutro od ${nextStartStr}`
    } else {
      const dayName = POLISH_DAY_PREP[nextSchoolDay.dayIndex] || 'w poniedziałek'
      badgeText = `Weekend • ${dayName.charAt(0).toUpperCase() + dayName.slice(1)} od ${nextStartStr}`
    }

    return {
      isWeekend: true,
      currentDayIndex: 0,
      isSchoolDay: false,
      status: 'weekend',
      currentLessonNumber: null,
      nextLessonNumber: nextSchoolDay.schedule.firstSlot?.number || null,
      nextSchoolDayIndex: nextSchoolDay.dayIndex,
      minutesRemaining: null,
      badgeText,
      actualStartMinutes: null,
      actualEndMinutes: null,
    }
  }

  const todaySchedule = getDaySchedule(currentDayIndex, hours, rawDays, selectedGroups)
  const nextSchoolDay = findNextSchoolDay(currentDayIndex, hours, rawDays, selectedGroups)
  const nextStartStr = nextSchoolDay.schedule.firstSlot?.timeFrom || '8:00'

  const formatNextDayText = () => {
    if (currentDayIndex === 4) {
      const dayName = nextSchoolDay.dayIndex === 0 ? 'w poniedziałek' : POLISH_DAY_PREP[nextSchoolDay.dayIndex]
      return `Miłego weekendu! • ${dayName.charAt(0).toUpperCase() + dayName.slice(1)} od ${nextStartStr}`
    }
    if (nextSchoolDay.dayIndex === currentDayIndex + 1) {
      return `Koniec zajęć na dziś • Jutro od ${nextStartStr}`
    }
    const dayName = POLISH_DAY_PREP[nextSchoolDay.dayIndex] || 'wkrótce'
    return `Koniec zajęć na dziś • ${dayName.charAt(0).toUpperCase() + dayName.slice(1)} od ${nextStartStr}`
  }

  if (!todaySchedule.hasLessons) {
    const isTomorrow = nextSchoolDay.dayIndex === currentDayIndex + 1
    const dayText = isTomorrow ? 'Jutro' : (POLISH_DAY_PREP[nextSchoolDay.dayIndex] || 'wkrótce')
    return {
      isWeekend: false,
      currentDayIndex,
      isSchoolDay: true,
      status: 'no_lessons_today',
      currentLessonNumber: null,
      nextLessonNumber: nextSchoolDay.schedule.firstSlot?.number || null,
      nextSchoolDayIndex: nextSchoolDay.dayIndex,
      minutesRemaining: null,
      badgeText: `Dziś brak zajęć • ${dayText.charAt(0).toUpperCase() + dayText.slice(1)} od ${nextStartStr}`,
      actualStartMinutes: null,
      actualEndMinutes: null,
    }
  }

  const { firstSlot, lastSlot, slots, lessonSlots } = todaySchedule
  const dayStartMinutes = firstSlot.startMinutes
  const dayEndMinutes = lastSlot.endMinutes

  if (currentMinutes < dayStartMinutes) {
    const diff = dayStartMinutes - currentMinutes
    return {
      isWeekend: false,
      currentDayIndex,
      isSchoolDay: true,
      status: 'before_school',
      currentLessonNumber: null,
      nextLessonNumber: firstSlot.number,
      nextSchoolDayIndex: currentDayIndex,
      minutesRemaining: diff,
      badgeText: `Przed lekcjami • Początek o ${firstSlot.timeFrom} (za ${formatRemainingTime(diff)})`,
      actualStartMinutes: dayStartMinutes,
      actualEndMinutes: dayEndMinutes,
    }
  }

  if (currentMinutes >= dayEndMinutes) {
    return {
      isWeekend: false,
      currentDayIndex,
      isSchoolDay: true,
      status: 'after_school',
      currentLessonNumber: null,
      nextLessonNumber: nextSchoolDay.schedule.firstSlot?.number || null,
      nextSchoolDayIndex: nextSchoolDay.dayIndex,
      minutesRemaining: null,
      badgeText: formatNextDayText(),
      actualStartMinutes: dayStartMinutes,
      actualEndMinutes: dayEndMinutes,
    }
  }

  const currentSlot = slots.find((s) => currentMinutes >= s.startMinutes && currentMinutes < s.endMinutes)

  if (currentSlot) {
    if (currentSlot.hasLesson) {
      const diff = currentSlot.endMinutes - currentMinutes
      const nextLessonSlot = lessonSlots.find((s) => s.startMinutes > currentSlot.startMinutes)
      return {
        isWeekend: false,
        currentDayIndex,
        isSchoolDay: true,
        status: 'in_lesson',
        currentLessonNumber: currentSlot.number,
        nextLessonNumber: nextLessonSlot?.number || null,
        nextSchoolDayIndex: currentDayIndex,
        minutesRemaining: diff,
        badgeText: `Trwa lekcja ${currentSlot.number} • ${diff} min do dzwonka`,
        actualStartMinutes: dayStartMinutes,
        actualEndMinutes: dayEndMinutes,
      }
    }

    const nextLessonSlot = lessonSlots.find((s) => s.startMinutes > currentSlot.startMinutes)
    const diff = nextLessonSlot ? nextLessonSlot.startMinutes - currentMinutes : null
    const nextLessonText = nextLessonSlot
      ? ` • Następna lekcja o ${nextLessonSlot.timeFrom} (za ${formatRemainingTime(diff)})`
      : ''

    return {
      isWeekend: false,
      currentDayIndex,
      isSchoolDay: true,
      status: 'free_period',
      currentLessonNumber: null,
      nextLessonNumber: nextLessonSlot?.number || null,
      nextSchoolDayIndex: currentDayIndex,
      minutesRemaining: diff,
      badgeText: `Okienko${nextLessonText}`,
      actualStartMinutes: dayStartMinutes,
      actualEndMinutes: dayEndMinutes,
    }
  }

  const nextSlot = slots.find((s) => s.startMinutes > currentMinutes)
  const nextLessonSlot = lessonSlots.find((s) => s.startMinutes > currentMinutes)

  if (nextSlot && nextSlot.hasLesson) {
    const diff = nextSlot.startMinutes - currentMinutes
    return {
      isWeekend: false,
      currentDayIndex,
      isSchoolDay: true,
      status: 'break',
      currentLessonNumber: null,
      nextLessonNumber: nextSlot.number,
      nextSchoolDayIndex: currentDayIndex,
      minutesRemaining: diff,
      badgeText: `Przerwa • Za ${formatRemainingTime(diff)} lekcja ${nextSlot.number}`,
      actualStartMinutes: dayStartMinutes,
      actualEndMinutes: dayEndMinutes,
    }
  }

  if (nextLessonSlot) {
    const diff = nextLessonSlot.startMinutes - currentMinutes
    return {
      isWeekend: false,
      currentDayIndex,
      isSchoolDay: true,
      status: 'free_period',
      currentLessonNumber: null,
      nextLessonNumber: nextLessonSlot.number,
      nextSchoolDayIndex: currentDayIndex,
      minutesRemaining: diff,
      badgeText: `Wolne • Za ${formatRemainingTime(diff)} lekcja ${nextLessonSlot.number}`,
      actualStartMinutes: dayStartMinutes,
      actualEndMinutes: dayEndMinutes,
    }
  }

  return {
    isWeekend: false,
    currentDayIndex,
    isSchoolDay: true,
    status: 'unknown',
    currentLessonNumber: null,
    nextLessonNumber: null,
    nextSchoolDayIndex: currentDayIndex,
    minutesRemaining: null,
    badgeText: null,
    actualStartMinutes: dayStartMinutes,
    actualEndMinutes: dayEndMinutes,
  }
}

/**
 * Hook określający aktualną lekcję, przerwę i odliczanie do dzwonka z uwzględnieniem grup
 * @param {Record<number, import('@/lib/timetable/types').TableHour> | { hours: any, rawDays?: any, selectedGroups?: any }} optionsOrHours
 * @param {any[][][]} [maybeRawDays]
 * @param {any} [maybeSelectedGroups]
 */
export function useCurrentLesson(optionsOrHours, maybeRawDays, maybeSelectedGroups) {
  let hours = null
  let rawDays = null
  let selectedGroups = null

  if (
    optionsOrHours &&
    typeof optionsOrHours === 'object' &&
    ('hours' in optionsOrHours || 'rawDays' in optionsOrHours || 'selectedGroups' in optionsOrHours)
  ) {
    hours = optionsOrHours.hours || null
    rawDays = optionsOrHours.rawDays || null
    selectedGroups = optionsOrHours.selectedGroups || null
  } else {
    hours = optionsOrHours || null
    rawDays = maybeRawDays || null
    selectedGroups = maybeSelectedGroups || null
  }

  const isMounted = useIsMounted()
  const [now, setNow] = useState(() => (typeof window !== 'undefined' ? new Date() : null))

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date())
    }, 15000)

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
        nextSchoolDayIndex: 0,
        minutesRemaining: null,
        badgeText: null,
        actualStartMinutes: null,
        actualEndMinutes: null,
      }
    }

    return {
      isMounted: true,
      ...calculateCurrentState({ hours, rawDays, selectedGroups, now }),
    }
  }, [hours, rawDays, selectedGroups, now, isMounted])
}
