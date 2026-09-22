'use client'

import { useCallback, useSyncExternalStore } from 'react'

let isOpenGlobal = false
const listeners = new Set()

function subscribe(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot() {
  return isOpenGlobal
}

function getServerSnapshot() {
  return false
}

function notify(val) {
  isOpenGlobal = val
  listeners.forEach((listener) => listener())
}

/**
 * Hook zarządzający globalnym stanem widoczności okna wyszukiwarki (Command Palette)
 */
export function useSearchModal() {
  const isOpen = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const setOpen = useCallback((val) => {
    const next = typeof val === 'function' ? val(isOpenGlobal) : Boolean(val)
    notify(next)
  }, [])

  const openSearch = useCallback(() => notify(true), [])
  const closeSearch = useCallback(() => notify(false), [])
  const toggleSearch = useCallback(() => notify(!isOpenGlobal), [])

  return {
    isOpen,
    setIsOpen: setOpen,
    openSearch,
    closeSearch,
    toggleSearch,
  }
}
