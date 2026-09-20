'use client'

import { useSyncExternalStore, useCallback, useMemo } from 'react'

const DEFAULT_GROUPS_JSON = JSON.stringify({ general: null, lang: null, wf: null })
const HIDE_FILTERED_KEY = 'neoplan_hide_filtered'

/** @type {Set<() => void>} */
const listeners = new Set()

function emitChange() {
  listeners.forEach((listener) => listener())
}

function subscribe(listener) {
  listeners.add(listener)
  const handleStorage = () => {
    listener()
  }
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', handleStorage)
  }
  return () => {
    listeners.delete(listener)
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', handleStorage)
    }
  }
}

/**
 * Hook do zarządzania preferencjami grup i ukrywania odfiltrowanych lekcji
 * Bezpieczny dla SSR i hydracji w Next.js / React 19
 * @param {'o'|'n'|'s'} type
 * @param {string} id
 */
export function useGroupPreferences(type, id) {
  const groupsStorageKey = `neoplan_groups_${id}`

  const getGroupsSnapshot = useCallback(() => {
    if (type !== 'o' || typeof window === 'undefined') return DEFAULT_GROUPS_JSON
    return localStorage.getItem(groupsStorageKey) || DEFAULT_GROUPS_JSON
  }, [type, groupsStorageKey])

  const getServerGroupsSnapshot = useCallback(() => DEFAULT_GROUPS_JSON, [])

  const rawGroups = useSyncExternalStore(subscribe, getGroupsSnapshot, getServerGroupsSnapshot)

  const selectedGroups = useMemo(() => {
    try {
      return JSON.parse(rawGroups)
    } catch {
      return { general: null, lang: null, wf: null }
    }
  }, [rawGroups])

  const setSelectedGroups = useCallback(
    (newGroups) => {
      if (type === 'o') {
        try {
          localStorage.setItem(groupsStorageKey, JSON.stringify(newGroups))
          emitChange()
        } catch (e) {
          console.warn('Błąd zapisu preferencji grup:', e)
        }
      }
    },
    [type, groupsStorageKey]
  )

  const getHideSnapshot = useCallback(() => {
    if (typeof window === 'undefined') return 'true'
    return localStorage.getItem(HIDE_FILTERED_KEY) ?? 'true'
  }, [])

  const getServerHideSnapshot = useCallback(() => 'true', [])

  const rawHide = useSyncExternalStore(subscribe, getHideSnapshot, getServerHideSnapshot)
  const hideFiltered = rawHide !== 'false'

  const toggleHideFiltered = useCallback(() => {
    try {
      const current = localStorage.getItem(HIDE_FILTERED_KEY) ?? 'true'
      const next = current === 'false' ? 'true' : 'false'
      localStorage.setItem(HIDE_FILTERED_KEY, next)
      emitChange()
    } catch {
      // ignore
    }
  }, [])

  return {
    selectedGroups,
    setSelectedGroups,
    hideFiltered,
    toggleHideFiltered,
  }
}
