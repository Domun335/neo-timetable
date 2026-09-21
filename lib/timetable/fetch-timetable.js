import { cache } from 'react'
import { Table } from '@wulkanowy/timetable-parser'
import {
  getCleanBaseUrl,
  fetchHtmlWithEncoding,
  fetchTimetableList,
  HttpError,
} from './fetch-list.js'
import { enrichLessonData } from './complete-data.js'
import { extractGroupInfo, extractSubjectGroups } from './group-utils.js'

/**
 * Normalizuje typ jednostki do litery o, n lub s
 * @param {string} rawType
 * @returns {'o'|'n'|'s'}
 */
export function normalizeType(rawType) {
  const t = (rawType || '').toLowerCase()
  if (t === 'o' || t === 'klasa' || t === 'oddzial' || t === 'oddzialy') return 'o'
  if (t === 'n' || t === 'nauczyciel' || t === 'nauczyciele') return 'n'
  if (t === 's' || t === 'sala' || t === 'sale') return 's'
  return 'o'
}

/**
 * Pobiera i parsuje plan lekcji dla danego typu i ID (memoizowane przez React.cache na czas cyklu żądania)
 * @param {'o'|'n'|'s'|string} rawType
 * @param {string|number} id
 * @returns {Promise<import('./types').ParsedTimetable>}
 */
export const fetchTimetable = cache(async function fetchTimetable(rawType, id) {
  const type = normalizeType(rawType)
  const cleanId = String(id).replace(/^[ons]/i, '')

  if (!/^\d+$/.test(cleanId)) {
    throw new HttpError(404, `Nieprawidłowe ID planu: ${id}`)
  }

  const baseUrl = getCleanBaseUrl()
  const timetableUrl = `${baseUrl}/plany/${type}${cleanId}.html`

  const [html, listData] = await Promise.all([
    fetchHtmlWithEncoding(timetableUrl),
    fetchTimetableList().catch(() => null),
  ])

  const parser = new Table(html)
  const title = parser.getTitle().trim()
  const dayNames = parser.getDayNames()
  const hours = parser.getHours()
  const rawMatrix = parser.getRawDays() // [hourIndex][dayIndex] -> LessonItem[]

  /** @type {Set<string>} */
  const legacyGroupsSet = new Set()

  const availableGroups = {
    general: new Set(),
    lang: new Set(),
    wf: new Set(),
  }

  const enrichedMatrix = rawMatrix.map((dayRow) => {
    return (dayRow || []).map((slotLessons) => {
      if (!Array.isArray(slotLessons)) return []
      return slotLessons.map((lesson) => {
        const groupInfo = extractGroupInfo(lesson.subject, lesson.groupName, lesson.room)

        /** @type {import('./types').LessonItem & { groupNum?: number, groupCategory?: string }} */
        let normalized = {
          ...lesson,
          subject: groupInfo.cleanSubject,
          groupName: groupInfo.label,
          groupNum: groupInfo.groupNum,
          groupCategory: groupInfo.category,
        }

        if (groupInfo.label) {
          legacyGroupsSet.add(groupInfo.label)
        }
        if (groupInfo.groupNum) {
          availableGroups[groupInfo.category]?.add(groupInfo.groupNum)
        }

        if (listData) {
          normalized = enrichLessonData(normalized, listData)
        }

        return normalized
      })
    })
  })

  const groups = Array.from(legacyGroupsSet).sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true }),
  )

  const structuredGroups = {
    general: Array.from(availableGroups.general).sort((a, b) => a - b),
    lang: Array.from(availableGroups.lang).sort((a, b) => a - b),
    wf: Array.from(availableGroups.wf).sort((a, b) => a - b),
  }

  return {
    type,
    id: cleanId,
    title,
    dayNames:
      dayNames.length > 0 ? dayNames : ['Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek'],
    hours,
    rawDays: enrichedMatrix,
    groups,
    availableGroups: structuredGroups,
    subjectGroups: extractSubjectGroups(enrichedMatrix),
  }
})
