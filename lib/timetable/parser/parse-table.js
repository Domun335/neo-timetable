import { parse } from 'node-html-parser'
import { cleanText } from './utils.js'

/** @type {Map<string, RegExp>} */
const HREF_RE_CACHE = new Map()

/**
 * Wyciaga ID jednostki z atrybutu href linka Optivum (np. "n14.html", "plany/n14.html" -> "14")
 * @param {import('node-html-parser').HTMLElement | null} el
 * @param {string} letter - prefiks: 'n', 's', 'o'
 * @returns {string | undefined}
 */
function getIdFromHref(el, letter) {
  const href = el?.getAttribute('href') || ''
  if (!HREF_RE_CACHE.has(letter)) {
    HREF_RE_CACHE.set(letter, new RegExp(`(?:^|/)${letter}(.+)\\.html$`))
  }
  return HREF_RE_CACHE.get(letter).exec(href)?.[1]
}

/**
 * Wyszukuje element z klasa wewnatrz podanego elementu (lub sam element jesli ma ta klase)
 * @param {import('node-html-parser').HTMLElement} el
 * @param {string} cls
 * @returns {import('node-html-parser').HTMLElement | null}
 */
function findWithClass(el, cls) {
  if (el.classList?.contains(cls)) return el
  return el.querySelector(`.${cls}`)
}

/**
 * Parsuje jeden wezel "linii" (segmentu miedzy <br>) i zwraca dane lekcji
 * @param {import('node-html-parser').HTMLElement} lineEl
 * @returns {import('./types.js').LessonItem | null}
 */
function parseLineElement(lineEl) {
  const pEl = findWithClass(lineEl, 'p')
  const nEl = findWithClass(lineEl, 'n')
  const sEl = findWithClass(lineEl, 's')
  const oEl = findWithClass(lineEl, 'o')

  let subject = ''
  let groupName

  if (pEl) {
    const txt = cleanText(pEl)
    // Grupy zapisane w nazwie przedmiotu: "sieci.komput-2/2", "wf-I/2", "r_fizyka-1/2", "j. angielski - 1/2"
    const gMatch = txt.match(/^(.*?)\s*[-–]\s*([0-9IVX]+(?:\s*\/\s*[0-9IVX]*)?)\s*$/i)
    if (gMatch) {
      subject = gMatch[1].trim()
      groupName = gMatch[2].replace(/\s+/g, '')
    } else {
      subject = txt
    }
  } else {
    // Brak pojedynczego elementu .p -- szukamy we wszystkich .p
    const allP = lineEl.querySelectorAll('.p')
    const texts = allP.map((p) => cleanText(p)).filter(Boolean)
    if (texts.length > 0) {
      subject = texts.join(' ').trim()
    } else {
      // Brak tagu .p w ogóle (np. sam tekst przed .n/.s)
      const clone = parse(`<div>${lineEl.innerHTML}</div>`).querySelector('div')
      clone?.querySelectorAll('.n, .s, .o').forEach((e) => e.remove())
      subject = cleanText(clone)
    }

    const rawText = cleanText(lineEl)
    const gMatch = rawText.match(/[-–]\s*([0-9IVX]+(?:\s*\/\s*[0-9IVX]*)?)/i)
    if (gMatch) groupName = gMatch[1].replace(/\s+/g, '')
  }

  if (!subject) return null

  const lesson = { subject }
  if (groupName) lesson.groupName = groupName

  if (nEl) {
    const teacher = cleanText(nEl)
    if (teacher) lesson.teacher = teacher
    const id = getIdFromHref(nEl, 'n')
    if (id) lesson.teacherId = id
  }
  if (sEl) {
    const room = cleanText(sEl)
    if (room) lesson.room = room
    const id = getIdFromHref(sEl, 's')
    if (id) lesson.roomId = id
  }
  if (oEl) {
    const className = cleanText(oEl)
    if (className) lesson.className = className
    const id = getIdFromHref(oEl, 'o')
    if (id) lesson.classId = id
  }

  return lesson
}

/**
 * Parsuje zawartosc komorki lekcji (.l) -- dzieli po <br> na osobne lekcje/grupy
 * @param {import('node-html-parser').HTMLElement} cell
 * @returns {import('../types.js').LessonItem[]}
 */
function parseLessonCell(cell) {
  const rawHtml = cell.innerHTML
  const lineHtmls = rawHtml.split(/<br\s*\/?>/i)
  const results = []

  for (const lineHtml of lineHtmls) {
    const lineRoot = parse(`<div>${lineHtml}</div>`)
    const lineEl = lineRoot.querySelector('div')
    if (!lineEl) continue

    const text = cleanText(lineEl)
    if (!text) continue

    const lesson = parseLineElement(lineEl)
    if (lesson) results.push(lesson)
  }

  return results
}

/**
 * Parsuje strone HTML planu lekcji VULCAN Optivum (plik plany/XYY.html)
 *
 * Zwraca rawDays w ukladzie [hourIndex][dayIndex] -> LessonItem[]
 * (taki sam uklad jak getRawDays() ze starej biblioteki @wulkanowy/timetable-parser)
 *
 * @param {string} html - surowy HTML strony planu
 * @returns {{
 *   title: string,
 *   dayNames: string[],
 *   hours: Record<number, import('./types.js').TableHour>,
 *   rawDays: import('./types.js').LessonItem[][][]
 * }}
 */
export function parseTable(html) {
  const root = parse(html)

  // Tytul planu (np. nazwa klasy, nauczyciela, sali)
  const title = cleanText(root.querySelector('.tytulnapis'))

  // Nazwy dni (naglowki kolumn, pomijamy pierwsze 2: Nr, Godz)
  const dayNames = root
    .querySelectorAll('.tabela tr:first-child th')
    .slice(2)
    .map((th) => cleanText(th))

  // Rzedy z lekcjami (wszystkie poza naglowkowym)
  const rows = root.querySelectorAll('.tabela tr:not(:first-child)')

  const hours = {}

  // rawDays[hourIndex][dayIndex] -> LessonItem[]
  const rawDays = []

  rows.forEach((row, hourIndex) => {
    const nr = parseInt(cleanText(row.querySelector('.nr')), 10)
    const timesText = cleanText(row.querySelector('.g'))
    const [timeFrom, timeTo] = timesText.split('-').map((s) => s.trim())

    if (!isNaN(nr)) {
      hours[nr] = { number: nr, timeFrom: timeFrom ?? '', timeTo: timeTo ?? '' }
    }

    // Inicjalizujemy tablicę dla tego rzędu (przypisanie zamiast push zapobiega dziurom w tablicy
    // gdy zapis do rawDays[hourIndex] następuje niekoniecznie sekwencyjnie)
    rawDays[hourIndex] = []

    const lessonCells = row.querySelectorAll('.l')
    lessonCells.forEach((cell) => {
      const text = cleanText(cell)

      if (!text) {
        rawDays[hourIndex].push([])
        return
      }

      const hasElements = cell.childNodes.some((n) => n.nodeType === 1)

      if (!hasElements) {
        // Prosta lekcja bez linkow -- tylko tekst
        rawDays[hourIndex].push([{ subject: text }])
        return
      }

      const lessons = parseLessonCell(cell)
      rawDays[hourIndex].push(lessons.length > 0 ? lessons : [])
    })
  })

  return { title, dayNames, hours, rawDays }
}
