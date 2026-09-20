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

  // 1. Jeśli parser Optivum rozpoznał grupę (np. "1/2", "2/2", "1/3", "3/3", "-1/2")
  if (rawGroup && rawGroup.trim()) {
    const g = rawGroup.trim()
    const numMatch = g.match(/^[-#]?\s*([1-9]\d*)/) || g.match(/([1-9]\d*)/)
    const groupNum = numMatch ? parseInt(numMatch[1], 10) : null
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
    else if (/^II(\/[1-9]|\/| |$)/i.test(rawSuffix) || rawSuffix === '2' || rawSuffix.startsWith('2/')) {
      groupNum = 2
      displayLabel = rawSuffix.replace(/\/+$/, '')
    }
    // Grupa 3: III/3, III/, III, 3/3, 3
    else if (/^III(\/[1-9]|\/| |$)/i.test(rawSuffix) || rawSuffix === '3' || rawSuffix.startsWith('3/')) {
      groupNum = 3
      displayLabel = rawSuffix.replace(/\/+$/, '')
    }
    // Grupa 4: IV/4, IV/, IV, 4/4, 4
    else if (/^IV(\/[1-9]|\/| |$)/i.test(rawSuffix) || rawSuffix === '4' || rawSuffix.startsWith('4/')) {
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
