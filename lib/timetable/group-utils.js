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
 * Wyodrębnia grupę z subjectu lub groupName z Optivum (obsługuje m.in. formaty ZS2: -I/2, -II/, -I, -II)
 * @param {string} rawSubject
 * @param {string} [rawGroup]
 * @param {string} [room]
 * @returns {{ cleanSubject: string, label: string | null, groupNum: number | null, category: 'wf' | 'lang' | 'general' }}
 */
export function extractGroupInfo(rawSubject = '', rawGroup = '', room = '') {
  const cleanInitial = (rawSubject || '').trim()
  const cat = categorizeLesson(cleanInitial, room)

  // 1. Jeśli parser Optivum rozpoznał grupę (np. "1/2", "2/2", "1/3", "3/3", "-1/2", "I/2", "I", "II")
  if (rawGroup && rawGroup.trim()) {
    const g = rawGroup.trim()
    let groupNum = null
    const numMatch = g.match(/^[-#]?\s*([1-9]\d*)/) || g.match(/([1-9]\d*)/)
    if (numMatch) {
      groupNum = parseInt(numMatch[1], 10)
    } else {
      // Cyfry rzymskie w rawGroup (np. "I", "II", "III", "IV")
      if (/^I(\/|$)/i.test(g)) groupNum = 1
      else if (/^II(\/|$)/i.test(g)) groupNum = 2
      else if (/^III(\/|$)/i.test(g)) groupNum = 3
      else if (/^IV(\/|$)/i.test(g)) groupNum = 4
    }
    return {
      cleanSubject: cleanInitial,
      label: g,
      groupNum,
      category: cat,
    }
  }

  // 2. Obsługa specyfiki ZS2 — grupy zapisane w nazwie przedmiotu (np. "j. angielski-I/2", "wf-II/", "wf-I /", "inform-II", "inf-III/3")
  const m = cleanInitial.match(/^(.*?)[-–]\s*([IVX0-9/ ]+)$/i)
  if (m) {
    const baseSubject = m[1].trim()
    const rawSuffix = m[2].trim()

    let groupNum = null
    let displayLabel = rawSuffix

    // Grupa 1: I/2, I/3, I/, I, 1/2, 1/3, 1
    if (/^I(\/[1-9]|\/| |$)/i.test(rawSuffix) || rawSuffix === '1' || rawSuffix.startsWith('1/')) {
      groupNum = 1
      displayLabel = rawSuffix.replace(/\/+$/, '')
    }
    // Grupa 2: II/2, II/3, II/, II, 2/2, 2/3, 2
    else if (
      /^II(\/[1-9]|\/| |$)/i.test(rawSuffix) ||
      rawSuffix === '2' ||
      rawSuffix.startsWith('2/')
    ) {
      groupNum = 2
      displayLabel = rawSuffix.replace(/\/+$/, '')
    }
    // Grupa 3: III/3, III/, III, 3/3, 3
    else if (
      /^III(\/[1-9]|\/| |$)/i.test(rawSuffix) ||
      rawSuffix === '3' ||
      rawSuffix.startsWith('3/')
    ) {
      groupNum = 3
      displayLabel = rawSuffix.replace(/\/+$/, '')
    }
    // Grupa 4: IV/4, IV/, IV, 4/4, 4
    else if (
      /^IV(\/[1-9]|\/| |$)/i.test(rawSuffix) ||
      rawSuffix === '4' ||
      rawSuffix.startsWith('4/')
    ) {
      groupNum = 4
      displayLabel = rawSuffix.replace(/\/+$/, '')
    }

    if (groupNum !== null) {
      return {
        cleanSubject: baseSubject,
        label: displayLabel,
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
            // Zachowujemy bardziej szczegółową etykietę (np. "I/2" zamiast "1")
            const newLabel = lesson.groupName || `Gr ${lesson.groupNum}`
            if (
              !currentLabel ||
              (newLabel.length > currentLabel.length && !currentLabel.includes('/'))
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

  // 1. Sprawdzamy wyjątek zdefiniowany dla konkretnego przedmiotu
  if (subjects && Object.hasOwn(subjects, lesson.subject)) {
    const override = subjects[lesson.subject]
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
