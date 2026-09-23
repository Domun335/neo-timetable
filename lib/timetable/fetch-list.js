import { parseList } from './parser'
import iconv from 'iconv-lite'
import { schoolConfig } from '../../school.config.js'

/**
 * Normalizuje dowolny adres URL planu VULCAN Optivum do czystego katalogu bazowego.
 * Automatycznie usuwa /index.html, /lista.html, /plany/o1.html, parametry zapytań itp.
 * @param {string} [rawUrl]
 * @returns {string}
 */
export function getCleanBaseUrl(
  rawUrl = schoolConfig.timetableUrl || process.env.TIMETABLE_BASE_URL,
) {
  if (!rawUrl) {
    throw new Error('Brak zmiennej TIMETABLE_BASE_URL w pliku .env ani w school.config.js!')
  }

  let clean = String(rawUrl).trim()

  // Dodaj protokół https jeśli podano samą domenę (np. zstlancut.pl/plan)
  if (!/^https?:\/\//i.test(clean)) {
    clean = 'https://' + clean
  }

  clean = clean.split(/[?#]/)[0].trim()

  // Usuń specyficzne pliki i podfoldery VULCAN Optivum
  return clean
    .replace(/\/plany\/[ons]?\d+\.html?$/i, '')
    .replace(/\/plany\/?$/i, '')
    .replace(/\/(index|lista)\.(html?|php)$/i, '')
    .replace(/\/+$/, '')
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
 * Wykrywa kodowanie znaków na podstawie nagłówka Content-Type lub tagu meta w buforze HTML
 * @param {string|null} contentTypeHeader
 * @param {Buffer} buffer
 * @returns {string}
 */
export function detectCharset(contentTypeHeader, buffer) {
  if (contentTypeHeader) {
    const match = contentTypeHeader.match(/charset\s*=\s*['"]?([\w-]+)/i)
    if (match && iconv.encodingExists(match[1])) {
      return match[1].toLowerCase()
    }
  }

  const sample = buffer.subarray(0, 2048).toString('latin1')
  const metaMatch = sample.match(/charset\s*=\s*['"]?([\w-]+)/i)
  if (metaMatch && iconv.encodingExists(metaMatch[1])) {
    return metaMatch[1].toLowerCase()
  }

  return 'utf-8'
}

/**
 * Pobiera stronę planu i dekoduje ją zgodnie z wykrytym lub skonfigurowanym kodowaniem
 * @param {string} url
 * @param {string} [forcedEncoding]
 * @returns {Promise<string>}
 */
export async function fetchHtmlWithEncoding(url, forcedEncoding = null) {
  const proxyUrl = process.env.TIMETABLE_PROXY_URL
  const finalUrl = proxyUrl ? `${proxyUrl.replace(/\/+$/, '')}/${url}` : url

  const res = await fetch(finalUrl, {
    next: { revalidate: 3600 },
    signal: AbortSignal.timeout(10000),
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
    throw new HttpError(
      413,
      `Odpowiedź serwera przekracza dopuszczalny limit rozmiaru (max 5MB): ${url}`,
      url,
    )
  }

  const arrayBuffer = await res.arrayBuffer()
  if (arrayBuffer.byteLength > MAX_RESPONSE_SIZE) {
    throw new HttpError(
      413,
      `Pobrany dokument przekracza dopuszczalny limit rozmiaru (max 5MB): ${url}`,
      url,
    )
  }

  const buffer = Buffer.from(arrayBuffer)
  const configEncoding =
    schoolConfig.encoding && schoolConfig.encoding !== 'auto' ? schoolConfig.encoding : null
  const encoding =
    forcedEncoding || configEncoding || detectCharset(res.headers.get('content-type'), buffer)

  if (encoding && encoding.toLowerCase() !== 'utf-8' && iconv.encodingExists(encoding)) {
    return iconv.decode(buffer, encoding)
  }

  const text = buffer.toString('utf-8')
  if (text.includes('\uFFFD')) {
    const windows1250 = iconv.decode(buffer, 'windows-1250')
    if (!windows1250.includes('\uFFFD')) {
      return windows1250
    }
  }

  return text
}

/** @type {{ data: import('./types').TimetableListResult, timestamp: number } | null} */
let cachedListResult = null
/** @type {Promise<import('./types').TimetableListResult> | null} */
let inFlightListPromise = null

/**
 * Pobiera i parsuje listę oddziałów, nauczycieli i sal
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

      const rawList = parseList(html)

      const classes = (rawList.classes || []).map((item) => ({
        name: (item.name || '').trim(),
        value: String(item.value || '').trim(),
      }))

      const teachers = (rawList.teachers || []).map((item) => {
        const name = (item.name || '').trim()
        const match = name.match(/^(.*?)\s*\((.*?)\)$/)
        const fullName = match ? match[1].trim() : name
        const shortName = match ? match[2].trim() : ''

        return {
          name,
          value: String(item.value || '').trim(),
          fullName,
          shortName,
        }
      })

      const rooms = (rawList.rooms || []).map((item) => ({
        name: (item.name || '').trim(),
        value: String(item.value || '').trim(),
      }))

      const teacherByShort = {}
      const teacherById = {}
      const teacherByName = {}
      teachers.forEach((t) => {
        if (t.shortName) teacherByShort[t.shortName.toUpperCase()] = t
        teacherById[t.value] = t
        if (t.name) teacherByName[t.name.toUpperCase()] = t
        if (t.fullName) teacherByName[t.fullName.toUpperCase()] = t
      })

      const roomByName = {}
      const roomById = {}
      rooms.forEach((r) => {
        if (r.name) roomByName[r.name.toUpperCase()] = r
        roomById[r.value] = r
      })

      const classByName = {}
      const classById = {}
      classes.forEach((c) => {
        if (c.name) classByName[c.name.toUpperCase()] = c
        classById[c.value] = c
      })

      const result = {
        classes,
        teachers,
        rooms,
        teacherByShort,
        teacherById,
        teacherByName,
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
