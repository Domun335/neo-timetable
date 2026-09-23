/**
 * Klasyfikuje przedmiot do kategorii grupowej
 * @param {string} subject
 * @param {string} [room]
 * @returns {'wf' | 'lang' | 'general'}
 */
export function categorizeLesson(subject = '', room = '') {
  const s = (subject || '').toLowerCase().trim()
  const r = (room || '').toLowerCase().trim()

  // Wychowanie fizyczne
  if (
    s.startsWith('wf') ||
    s.includes('wych.fiz') ||
    s.includes('wychowanie fiz') ||
    r.includes('gim') ||
    r.includes('tenis')
  ) {
    return 'wf'
  }

  // Wykluczamy język polski z języków obcych
  if (s.includes('polski') || s.startsWith('j. pol')) {
    return 'general'
  }

  // Języki obce
  if (
    s.includes('angielski') ||
    s.includes('niem') ||
    s.includes('hiszpa') ||
    s.includes('rosyj') ||
    s.includes('franc') ||
    s.startsWith('j.') ||
    s.startsWith('r_ang') ||
    s.startsWith('z_ang')
  ) {
    return 'lang'
  }

  // Zajęcia zawodowe i ogólnokształcące
  return 'general'
}

/**
 * Wyciąga numer grupy z oznaczenia tekstowego (np. "1/2", "-1/2", "#1", "I/2", "-II", "III").
 * Cyfry rzymskie sprawdzamy pierwsze z dopasowaniem separatorów/końca ciągu,
 * aby uniknąć błędnego złapania mianownika (np. "I/2" -> 1, a nie 2).
 * @param {string} str
 * @returns {number | null}
 */
export function parseGroupNumber(str) {
  if (!str) return null
  const clean = str.replace(/^[-#]\s*/, '').trim()

  // Cyfry rzymskie sprawdzamy PIERWSZE — regex bez anchora mógłby złapać mianownik z "I/2" jako 2
  if (/^I(\s*\/|\s+|$)/i.test(clean)) return 1
  if (/^II(\s*\/|\s+|$)/i.test(clean)) return 2
  if (/^III(\s*\/|\s+|$)/i.test(clean)) return 3
  if (/^IV(\s*\/|\s+|$)/i.test(clean)) return 4

  // Grupy numeryczne: "1/2", "2/2", "-1/2", "#3", "1"
  const numMatch = clean.match(/^([1-9]\d*)/)
  return numMatch ? parseInt(numMatch[1], 10) : null
}

/**
 * Wyodrębnia grupę z subjectu lub groupName z Optivum (obsługuje m.in. formaty ZS2: -I/2, -II/, -I, -II)
 * @param {string} rawSubject
 * @param {string} [rawGroup]
 * @param {string} [room]
 * @returns {{ cleanSubject: string, label: string | null, groupNum: number | null, category: 'wf' | 'lang' | 'general' }}
 */
export function extractGroupInfo(rawSubject = '', rawGroup = '', room = '') {
  const cleanInitial = (rawSubject || '').trim()
  const cat = categorizeLesson(cleanInitial, room)

  // 1. Jeśli parser Optivum rozpoznał grupę (np. "1/2", "2/2", "-1/2", "-I/2", "I", "II")
  if (rawGroup && rawGroup.trim()) {
    const g = rawGroup.trim()
    return {
      cleanSubject: cleanInitial,
      label: g,
      groupNum: parseGroupNumber(g),
      category: cat,
    }
  }

  // 2. Obsługa specyfiki grup w nazwie przedmiotu (np. "j. angielski-I/2", "wf-II/", "wf-I /", "inform-II", "inf-III/3")
  const m = cleanInitial.match(/^(.*?)\s*[-–]\s*([IVX0-9/ ]+)$/i)
  if (m) {
    const baseSubject = m[1].trim()
    const rawSuffix = m[2].trim()
    const groupNum = parseGroupNumber(rawSuffix)

    if (groupNum !== null) {
      return {
        cleanSubject: baseSubject,
        label: rawSuffix.replace(/\/+$/, '').trim(),
        groupNum,
        category: cat,
      }
    }
  }

  return {
    cleanSubject: cleanInitial,
    label: null,
    groupNum: null,
    category: cat,
  }
}

/**
 * Czyści i ładnie formatuje nazwę przedmiotu do wyświetlenia w UI
 * @param {string} rawSubject
 * @returns {string}
 */
export function formatSubjectDisplayName(rawSubject = '') {
  const s = (rawSubject || '').trim()
  if (!s) return ''

  const lower = s.toLowerCase()
  if (lower === 'wf' || lower.includes('wych.fiz')) return 'Wychowanie fizyczne'
  if (lower.startsWith('r_ang') || lower.includes('r_angielski'))
    return 'Język angielski (rozszerzony)'
  if (lower.startsWith('z_ang') || lower.includes('z_angielski')) return 'Język angielski zawodowy'
  if (lower === 'j. angielski' || lower === 'j.angielski' || lower === 'angielski')
    return 'Język angielski'
  if (lower.startsWith('j. niem') || lower === 'j.niemiecki' || lower === 'niemiecki')
    return 'Język niemiecki'
  if (lower.startsWith('j. hiszp') || lower.includes('hiszpański')) return 'Język hiszpański'
  if (lower === 'inform' || lower === 'inf') return 'Informatyka'

  return s.charAt(0).toUpperCase() + s.slice(1)
}

/**
 * Wyciąga z macierzy lekcji pełną listę przedmiotów podzielonych na grupy
 * @param {any[][][]} rawDays
 * @returns {Array<{ subject: string, displayName: string, category: 'lang' | 'wf' | 'general', groups: Array<{ num: number, label: string }> }>}
 */
export function extractSubjectGroups(rawDays = []) {
  if (!Array.isArray(rawDays)) return []

  /** @type {Map<string, { subject: string, displayName: string, category: 'lang' | 'wf' | 'general', groups: Map<number, string> }>} */
  const subjectsMap = new Map()

  for (const dayRow of rawDays) {
    if (!Array.isArray(dayRow)) continue
    for (const slot of dayRow) {
      if (!Array.isArray(slot)) continue
      for (const lesson of slot) {
        if (!lesson || !lesson.subject) continue
        if (lesson.groupName || lesson.groupNum) {
          const s = lesson.subject.trim()
          if (!subjectsMap.has(s)) {
            subjectsMap.set(s, {
              subject: s,
              displayName: formatSubjectDisplayName(s),
              category: lesson.groupCategory || categorizeLesson(s, lesson.room),
              groups: new Map(),
            })
          }

          const entry = subjectsMap.get(s)
          if (lesson.groupNum) {
            const currentLabel = entry.groups.get(lesson.groupNum)
            const newLabel = lesson.groupName || `Gr ${lesson.groupNum}`

            // Preferujemy etykietę bardziej precyzyjną (np. zawierającą mianownik "1/2" zamiast "Gr 1" lub "1")
            const newHasSlash = newLabel.includes('/')
            const curHasSlash = Boolean(currentLabel && currentLabel.includes('/'))
            if (
              !currentLabel ||
              (newHasSlash && !curHasSlash) ||
              (newHasSlash === curHasSlash && newLabel.length > currentLabel.length)
            ) {
              entry.groups.set(lesson.groupNum, newLabel)
            }
          }
        }
      }
    }
  }

  const categoryOrder = { lang: 0, general: 1, wf: 2 }

  return Array.from(subjectsMap.values())
    .map((item) => ({
      subject: item.subject,
      displayName: item.displayName,
      category: item.category,
      groups: Array.from(item.groups.entries())
        .map(([num, label]) => ({ num, label }))
        .sort((a, b) => a.num - b.num),
    }))
    .filter((item) => item.groups.length > 0)
    .sort((a, b) => {
      const catA = categoryOrder[a.category] ?? 3
      const catB = categoryOrder[b.category] ?? 3
      if (catA !== catB) return catA - catB
      return a.displayName.localeCompare(b.displayName, 'pl')
    })
}

/**
 * Sprawdza, czy lekcja powinna być widoczna zgodnie z wybranymi preferencjami grup
 * @param {import('./types').LessonItem & { groupNum?: number, groupCategory?: string }} lesson
 * @param {{ base: number | null, subjects?: Record<string, number | 'all' | 'hide'> }} [preferences]
 * @returns {boolean}
 */
export function isLessonVisible(lesson, preferences) {
  if (!preferences || !lesson) return Boolean(lesson)
  // Lekcja ogólnoklasowa bez podziału na grupy jest zawsze widoczna
  if (!lesson.groupNum && !lesson.groupName) return true

  const { base = null, subjects } = preferences
  const subjectKey = (lesson.subject || '').trim()

  // 1. Sprawdzamy wyjątek zdefiniowany dla konkretnego przedmiotu
  if (subjects && subjectKey && Object.hasOwn(subjects, subjectKey)) {
    const override = subjects[subjectKey]
    if (override === 'hide') return false
    if (override === 'all' || override === null) return true
    if (typeof override === 'number') {
      return lesson.groupNum === override
    }
  }

  // 2. Brak wyjątku -> sprawdzamy grupę bazową
  if (base === null || base === undefined) {
    return true
  }

  // Jeśli lekcja ma oznaczenie grupy, ale nie udało się wyodrębnić numeru grupy (np. grupa tekstowa),
  // pozostawiamy ją widoczną, aby uczeń nie stracił zajęć z widoku
  if (lesson.groupNum === null || lesson.groupNum === undefined) {
    return true
  }

  // Jeśli baza to np. 3, ale dany podział ma mniej grup (np. języki/WF mają max 2 grupy)
  // a) Sprawdzamy mianownik podziału w nazwie grupy (np. "1/2", "2/2", "I/2")
  const denomMatch = (lesson.groupName || '').match(/\/([1-9]\d*)/)
  if (denomMatch) {
    const totalGroups = parseInt(denomMatch[1], 10)
    if (base > totalGroups) {
      return true
    }
  }

  // b) Języki obce oraz WF mają zazwyczaj podział na maksymalnie 2 grupy
  const cat = lesson.groupCategory
  if ((cat === 'lang' || cat === 'wf') && base > 2) {
    return true
  }

  return lesson.groupNum === base
}
