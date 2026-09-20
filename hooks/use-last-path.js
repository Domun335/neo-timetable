'use client'

import { useCallback } from 'react'

const STORAGE_KEY = 'neoplan_last_path'

export function useLastPath() {
  const saveLastPath = useCallback((path) => {
    if (!path || path === '/') return
    try {
      localStorage.setItem(STORAGE_KEY, path)
    } catch (e) {
      console.error('Błąd zapisu ostatniej ścieżki:', e)
    }
  }, [])

  const getLastPath = useCallback(() => {
    try {
      return localStorage.getItem(STORAGE_KEY)
    } catch (e) {
      console.error('Błąd odczytu ostatniej ścieżki:', e)
      return null
    }
  }, [])

  return {
    saveLastPath,
    getLastPath,
  }
}
