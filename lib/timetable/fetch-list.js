import { TimetableList } from '@wulkanowy/timetable-parser'
import iconv from 'iconv-lite'
import { schoolConfig } from '../../school.config.js'

/**
 * Normalizuje bazowy adres URL planu (gwarantuje brak ukośnika na końcu)
 * @param {string} url
 * @returns {string}
 */
export function getCleanBaseUrl(url = schoolConfig.timetableUrl) {
  if (!url) {
    throw new Error('Brak zmiennej TIMETABLE_BASE_URL w pliku .env!')
  }
  const clean = url.trim().replace(/\/+$/, '')
  if (!/^https?:\/\//i.test(clean)) {
    throw new Error('Nieprawidłowy adres TIMETABLE_BASE_URL — wymagany protokół http:// lub https://')
  }
  return clean
}

export class HttpError extends Error {
  constructor(status, message, url) {
    super(message)
    this.name = 'HttpError'
    this.status = status
    this.url = url
  }
}

const MAX_RESPONSE_SIZE = 5 * 1024 * 1024 // 5 MB

/**
 * Pobiera zawartość strony i dekoduje ją zgodnie z konfiguracją
 * @param {string} url
 * @param {'utf-8'|'windows-1250'|'iso-8859-2'} [encoding]
 * @returns {Promise<string>}
 */
export async function fetchHtmlWithEncoding(url, encoding = schoolConfig.encoding || 'utf-8') {
  const res = await fetch(url, {
    next: { revalidate: 3600 },
    signal: AbortSignal.timeout(8000), // 8s
    headers: {
      'User-Agent': 'NeoPlan/1.0 (+https://github.com/Domun335/neo-timetable)',
      Accept: 'text/html,application/xhtml+xml',
    },
  })

  if (!res.ok) {
    throw new HttpError(res.status, `Błąd pobierania (${res.status}): ${url}`, url)
  }

  const contentLength = res.headers.get('content-length')
  if (contentLength && parseInt(contentLength, 10) > MAX_RESPONSE_SIZE) {
    throw new HttpError(413, `Odpowiedź serwera przekracza dopuszczalny limit rozmiaru (max 5MB): ${url}`, url)
  }

  const arrayBuffer = await res.arrayBuffer()
  if (arrayBuffer.byteLength > MAX_RESPONSE_SIZE) {
    throw new HttpError(413, `Pobrany dokument przekracza dopuszczalny limit rozmiaru (max 5MB): ${url}`, url)
  }
  const buffer = Buffer.from(arrayBuffer)

  if (encoding.toLowerCase() !== 'utf-8') {
    return iconv.decode(buffer, encoding)
  }

  const initialText = buffer.toString('utf-8')
  if (/charset\s*=\s*(windows-1250|iso-8859-2)/i.test(initialText)) {
    const match = initialText.match(/charset\s*=\s*(windows-1250|iso-8859-2)/i)
    if (match && match[1]) {
      return iconv.decode(buffer, match[1])
    }
  }

  return initialText
}

/** @type {{ data: import('./types').TimetableListResult, timestamp: number } | null} */
let cachedListResult = null
/** @type {Promise<import('./types').TimetableListResult> | null} */
let inFlightListPromise = null

/**
 * Pobiera i parsuje listę oddziałów, nauczycieli i sal (z in-memory cachingiem)
 * @returns {Promise<import('./types').TimetableListResult>}
 */
export async function fetchTimetableList() {
  if (cachedListResult && Date.now() - cachedListResult.timestamp < 3600 * 1000) {
    return cachedListResult.data
  }

  if (inFlightListPromise) {
    return inFlightListPromise
  }

  inFlightListPromise = (async () => {
    try {
      const baseUrl = getCleanBaseUrl()
      const listUrl = `${baseUrl}/lista.html`
      const html = await fetchHtmlWithEncoding(listUrl)

      const parser = new TimetableList(html)
      const rawList = parser.getList()

      const classes = (rawList.classes || []).map((item) => ({
        name: item.name.trim(),
        value: String(item.value).trim(),
      }))

      const teachers = (rawList.teachers || []).map((item) => {
        const name = item.name.trim()
        const match = name.match(/^(.*?)\s*\((.*?)\)$/)
        const fullName = match ? match[1].trim() : name
        const shortName = match ? match[2].trim() : ''

        return {
          name,
          value: String(item.value).trim(),
          fullName,
          shortName,
        }
      })

      const rooms = (rawList.rooms || []).map((item) => ({
        name: item.name.trim(),
        value: String(item.value).trim(),
      }))

      /** @type {Record<string, import('./types').ListItem>} */
      const teacherByShort = {}
      /** @type {Record<string, import('./types').ListItem>} */
      const teacherById = {}
      teachers.forEach((t) => {
        if (t.shortName) teacherByShort[t.shortName.toUpperCase()] = t
        teacherById[t.value] = t
      })

      /** @type {Record<string, import('./types').ListItem>} */
      const roomByName = {}
      /** @type {Record<string, import('./types').ListItem>} */
      const roomById = {}
      rooms.forEach((r) => {
        roomByName[r.name.toUpperCase()] = r
        roomById[r.value] = r
      })

      /** @type {Record<string, import('./types').ListItem>} */
      const classByName = {}
      /** @type {Record<string, import('./types').ListItem>} */
      const classById = {}
      classes.forEach((c) => {
        classByName[c.name.toUpperCase()] = c
        classById[c.value] = c
      })

      const result = {
        classes,
        teachers,
        rooms,
        teacherByShort,
        teacherById,
        roomByName,
        roomById,
        classByName,
        classById,
      }

      cachedListResult = {
        data: result,
        timestamp: Date.now(),
      }

      return result
    } finally {
      inFlightListPromise = null
    }
  })()

  return inFlightListPromise
}
