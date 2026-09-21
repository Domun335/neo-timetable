'use client'

import { useSyncExternalStore, useCallback, useMemo, useRef, useEffect } from 'react'

const DEFAULT_PREFERENCES = { base: null, subjects: {} }
const DEFAULT_PREFERENCES_JSON = JSON.stringify(DEFAULT_PREFERENCES)

/** @type {Set<() => void>} */
const listeners = new Set()

function emitChange() {
  listeners.forEach((listener) => listener())
}

// Pojedynczy, globalny listener zdarzenia storage na poziomie modułu
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (!e.key || e.key.startsWith('neoplan_groups_')) {
      emitChange()
    }
  })
}

function subscribe(listener) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/**
 * Hook do zarządzania wybraną grupą lekcyjną dla klasy
 * Obsługuje wybór ogólny (baza) oraz personalizację grup per-przedmiot
 * Bezpieczny dla SSR i hydracji w Next.js / React 19
 * @param {'o'|'n'|'s'} type
 * @param {string} id
 */
export function useGroupPreferences(type, id) {
  const groupsStorageKey = `neoplan_groups_${id}`

  const getGroupsSnapshot = useCallback(() => {
    if (type !== 'o' || typeof window === 'undefined') return DEFAULT_PREFERENCES_JSON
    try {
      return localStorage.getItem(groupsStorageKey) || DEFAULT_PREFERENCES_JSON
    } catch {
      return DEFAULT_PREFERENCES_JSON
    }
  }, [type, groupsStorageKey])

  const getServerGroupsSnapshot = useCallback(() => DEFAULT_PREFERENCES_JSON, [])

  const rawGroups = useSyncExternalStore(subscribe, getGroupsSnapshot, getServerGroupsSnapshot)

  const selectedGroups = useMemo(() => {
    try {
      const parsed = JSON.parse(rawGroups)
      if (!parsed || typeof parsed !== 'object') {
        return { base: null, subjects: {}, general: null, lang: null, wf: null }
      }

      // 1. Nowy format: { base, subjects }
      if ('base' in parsed || 'subjects' in parsed) {
        const base = typeof parsed.base === 'number' ? parsed.base : null
        const subjects =
          parsed.subjects &&
          typeof parsed.subjects === 'object' &&
          !Array.isArray(parsed.subjects)
            ? parsed.subjects
            : {}
        return {
          base,
          subjects,
          // Wsteczna kompatybilność z kodem sprawdzającym stare pola
          general: base,
          lang: base,
          wf: base,
        }
      }

      // 2. Migracja ze starego formatu: { general, lang, wf }
      const oldGeneral = typeof parsed.general === 'number' ? parsed.general : null
      return {
        base: oldGeneral,
        subjects: {},
        general: oldGeneral,
        lang: typeof parsed.lang === 'number' ? parsed.lang : oldGeneral,
        wf: typeof parsed.wf === 'number' ? parsed.wf : oldGeneral,
      }
    } catch {
      return { base: null, subjects: {}, general: null, lang: null, wf: null }
    }
  }, [rawGroups])

  // Referencja do aktualnego stanu preferencji zapewniająca stabilność referencyjną callbacków
  const selectedGroupsRef = useRef(selectedGroups)
  useEffect(() => {
    selectedGroupsRef.current = selectedGroups
  }, [selectedGroups])

  const setSelectedGroups = useCallback(
    (newGroups) => {
      if (type === 'o') {
        try {
          // Jeśli przekazano stary format { general, lang, wf } bez base:
          let toSave = newGroups
          if (newGroups && typeof newGroups === 'object' && !('base' in newGroups) && !('subjects' in newGroups)) {
            toSave = {
              base: newGroups.general ?? null,
              subjects: {},
            }
          }

          localStorage.setItem(groupsStorageKey, JSON.stringify(toSave))
          emitChange()
        } catch (e) {
          console.warn('Błąd zapisu preferencji grup:', e)
        }
      }
    },
    [type, groupsStorageKey],
  )

  /** Ustawienie globalnej bazy grup (np. Grupa 1, Grupa 2 lub null dla wszystkich) */
  const setBaseGroup = useCallback(
    (groupNum) => {
      const num = typeof groupNum === 'number' ? groupNum : null
      const current = selectedGroupsRef.current
      setSelectedGroups({
        base: num,
        subjects: current.subjects || {},
      })
    },
    [setSelectedGroups],
  )

  /** Ustawienie wybranej grupy lub wariantu dla konkretnego przedmiotu */
  const setSubjectGroup = useCallback(
    (subject, groupVal) => {
      if (!subject) return
      const current = selectedGroupsRef.current
      const currentSubjects = { ...(current.subjects || {}) }
      if (groupVal === undefined) {
        delete currentSubjects[subject]
      } else {
        currentSubjects[subject] = groupVal
      }
      setSelectedGroups({
        base: current.base,
        subjects: currentSubjects,
      })
    },
    [setSelectedGroups],
  )

  /** Wyczyszczenie wyjątku dla konkretnego przedmiotu (powrót do dziedziczenia z bazy) */
  const clearSubjectOverride = useCallback(
    (subject) => {
      if (!subject) return
      const current = selectedGroupsRef.current
      const currentSubjects = { ...(current.subjects || {}) }
      delete currentSubjects[subject]
      setSelectedGroups({
        base: current.base,
        subjects: currentSubjects,
      })
    },
    [setSelectedGroups],
  )

  /** Wyczyszczenie wszystkich wyjątków per-przedmiot przy zachowaniu bazy */
  const resetAllOverrides = useCallback(() => {
    const current = selectedGroupsRef.current
    setSelectedGroups({
      base: current.base,
      subjects: {},
    })
  }, [setSelectedGroups])

  /** Pełny reset do stanu początkowego (Wszystkie grupy, bez wyjątków) */
  const resetAll = useCallback(() => {
    setSelectedGroups({
      base: null,
      subjects: {},
    })
  }, [setSelectedGroups])

  // Liczba aktywnych wyjątków per-przedmiot
  const overrideCount = useMemo(() => {
    return Object.keys(selectedGroups.subjects || {}).length
  }, [selectedGroups.subjects])

  return {
    selectedGroups,
    setSelectedGroups,
    setBaseGroup,
    setSubjectGroup,
    clearSubjectOverride,
    resetAllOverrides,
    resetAll,
    overrideCount,
  }
}
