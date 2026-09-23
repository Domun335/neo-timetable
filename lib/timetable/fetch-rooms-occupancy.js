import { getCleanBaseUrl, fetchHtmlWithEncoding, fetchTimetableList } from './fetch-list.js'
import { parseTable } from './parser/index.js'
import { enrichLessonData } from './complete-data.js'

const POLISH_DAYS = ['Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota']

/**
 * Pobiera i agreguje stan zajętości wszystkich sal lekcyjnych dla każdego dnia i godziny
 * @returns {Promise<{
 *   rooms: Array<{
 *     id: string,
 *     name: string,
 *     days: Array<{
 *       dayIndex: number,
 *       dayName: string,
 *       slots: Array<{
 *         hourNumber: number,
 *         timeFrom: string,
 *         timeTo: string,
 *         isFree: boolean,
 *         lessons: Array<import('./types').LessonItem>
 *       }>
 *     }>
 *   }>,
 *   hours: Array<{ number: number, timeFrom: string, timeTo: string, index: number }>,
 *   dayNames: string[]
 * }>}
 */
export async function fetchAllRoomsOccupancy() {
  const listData = await fetchTimetableList()
  const rawRooms = listData?.rooms || []

  if (rawRooms.length === 0) {
    return { rooms: [], hours: [], dayNames: POLISH_DAYS.slice(0, 5) }
  }

  const baseUrl = getCleanBaseUrl()

  // Równoległe pobranie planu każdej sali (z revalidate: 3600 zapewnianym przez fetchHtmlWithEncoding)
  const roomResults = await Promise.allSettled(
    rawRooms.map(async (room) => {
      const timetableUrl = `${baseUrl}/plany/s${room.value}.html`
      const html = await fetchHtmlWithEncoding(timetableUrl)
      const parsed = parseTable(html)
      return {
        id: room.value,
        name: room.name,
        parsed,
      }
    }),
  )

  /** @type {Record<number, { number: number, timeFrom: string, timeTo: string, index: number }>} */
  const aggregatedHoursMap = {}
  let maxDayCount = 5

  // 1. Zbuduj kanoniczną listę godzin i dni na podstawie pomyślnie pobranych planów
  for (const res of roomResults) {
    if (res.status === 'fulfilled' && res.value?.parsed) {
      const { hours, dayNames } = res.value.parsed
      if (dayNames?.length > maxDayCount) {
        maxDayCount = dayNames.length
      }

      // Przypisz godziny z uwzględnieniem indeksu wiersza (rowIdx)
      if (hours && typeof hours === 'object') {
        const sortedNumbers = Object.keys(hours)
          .map(Number)
          .sort((a, b) => a - b)

        sortedNumbers.forEach((hourNum, rowIdx) => {
          if (!aggregatedHoursMap[hourNum]) {
            aggregatedHoursMap[hourNum] = {
              number: hourNum,
              timeFrom: hours[hourNum]?.timeFrom || '',
              timeTo: hours[hourNum]?.timeTo || '',
              index: rowIdx,
            }
          }
        })
      }
    }
  }

  const sortedHours = Object.values(aggregatedHoursMap).sort((a, b) => a.number - b.number)
  const finalDayNames = POLISH_DAYS.slice(0, maxDayCount)

  // 2. Przygotuj strukturę zajętości dla każdej sali
  const roomsOccupancy = []

  for (const res of roomResults) {
    if (res.status !== 'fulfilled' || !res.value?.parsed) {
      continue
    }

    const { id, name, parsed } = res.value
    const rawDays = parsed.rawDays || []

    const days = finalDayNames.map((dayName, dayIndex) => {
      const slots = sortedHours.map((hourObj, rowIdx) => {
        const rawLessons = rawDays?.[rowIdx]?.[dayIndex] || []
        const isFree = rawLessons.length === 0
        const enrichedLessons = rawLessons.map((l) => enrichLessonData(l, listData))

        return {
          hourNumber: hourObj.number,
          timeFrom: hourObj.timeFrom,
          timeTo: hourObj.timeTo,
          isFree,
          lessons: enrichedLessons,
        }
      })

      return {
        dayIndex,
        dayName,
        slots,
      }
    })

    roomsOccupancy.push({
      id,
      name,
      days,
    })
  }

  // Sortuj sale naturalnie (np. 1, 2, 10, W9, CKZ_1...)
  roomsOccupancy.sort((a, b) =>
    a.name.localeCompare(b.name, 'pl', { numeric: true, sensitivity: 'base' }),
  )

  return {
    rooms: roomsOccupancy,
    hours: sortedHours,
    dayNames: finalDayNames,
  }
}
