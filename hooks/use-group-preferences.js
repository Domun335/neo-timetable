'use client'

import { useSyncExternalStore, useCallback, useMemo, useRef, useEffect } from 'react'

const DEFAULT_PREFERENCES = { base: null, subjects: {} }
const DEFAULT_PREFERENCES_JSON = JSON.stringify(DEFAULT_PREFERENCES)

const listeners = new Set()

function emitChange() {
  listeners.forEach((listener) => listener())
}

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
 * Zarządza preferencjami wybranej grupy lekcyjnej dla oddziału (baza oraz personalizacja per-przedmiot).
 * Synchronizuje stan w localStorage między kartami przeglądarki.
 *
 * @param {'o'|'n'|'s'} type Typ jednostki ('o' - klasa, 'n' - nauczyciel, 's' - sala)
 * @param {string} id Identyfikator jednostki
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
        return DEFAULT_PREFERENCES
      }

      const base = typeof parsed.base === 'number' ? parsed.base : null
      const subjects =
        parsed.subjects && typeof parsed.subjects === 'object' && !Array.isArray(parsed.subjects)
          ? parsed.subjects
          : {}

      return { base, subjects }
    } catch {
      return DEFAULT_PREFERENCES
    }
  }, [rawGroups])

  const selectedGroupsRef = useRef(selectedGroups)
  useEffect(() => {
    selectedGroupsRef.current = selectedGroups
  }, [selectedGroups])

  const setSelectedGroups = useCallback(
    (newGroups) => {
      if (type === 'o') {
        try {
          const toSave = {
            base: typeof newGroups?.base === 'number' ? newGroups.base : null,
            subjects:
              newGroups?.subjects &&
              typeof newGroups.subjects === 'object' &&
              !Array.isArray(newGroups.subjects)
                ? newGroups.subjects
                : {},
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

  const clearSubjectOverride = useCallback(
    (subject) => setSubjectGroup(subject, undefined),
    [setSubjectGroup],
  )

  const resetAllOverrides = useCallback(() => {
    const current = selectedGroupsRef.current
    setSelectedGroups({
      base: current.base,
      subjects: {},
    })
  }, [setSelectedGroups])

  const resetAll = useCallback(() => {
    setSelectedGroups(DEFAULT_PREFERENCES)
  }, [setSelectedGroups])

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
