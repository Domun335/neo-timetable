'use client'

import { useSyncExternalStore, useCallback, useMemo } from 'react'
import { useIsMounted } from './use-is-mounted'

const STORAGE_KEY = 'neoplan_favorites'

/** @type {Set<() => void>} */
const listeners = new Set()

function emitChange() {
  listeners.forEach((listener) => listener())
}

function subscribe(listener) {
  listeners.add(listener)
  const handleStorage = (e) => {
    if (e.key === STORAGE_KEY) {
      listener()
    }
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

function getSnapshot() {
  if (typeof window === 'undefined') return '[]'
  return localStorage.getItem(STORAGE_KEY) || '[]'
}

function getServerSnapshot() {
  return '[]'
}

/**
 * @typedef {Object} FavoriteItem
 * @property {'o'|'n'|'s'} type
 * @property {string} id
 * @property {string} name
 */

export function useFavorites() {
  const isLoaded = useIsMounted()
  const rawData = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const favorites = useMemo(() => {
    try {
      return JSON.parse(rawData)
    } catch {
      return []
    }
  }, [rawData])

  const isFavorite = useCallback(
    (type, id) => {
      const cleanId = String(id).replace(/^[ons]/i, '')
      return favorites.some((fav) => fav.type === type && String(fav.id) === cleanId)
    },
    [favorites]
  )

  const toggleFavorite = useCallback(
    (item) => {
      const cleanId = String(item.id).replace(/^[ons]/i, '')
      const current = (() => {
        try {
          return JSON.parse(getSnapshot())
        } catch {
          return []
        }
      })()

      const exists = current.some((fav) => fav.type === item.type && String(fav.id) === cleanId)
      let updated
      if (exists) {
        updated = current.filter((fav) => !(fav.type === item.type && String(fav.id) === cleanId))
      } else {
        updated = [...current, { type: item.type, id: cleanId, name: item.name }]
      }

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
        emitChange()
      } catch (e) {
        console.error('Błąd zapisu ulubionych:', e)
      }
    },
    []
  )

  return {
    favorites,
    isFavorite,
    toggleFavorite,
    isLoaded,
  }
}
