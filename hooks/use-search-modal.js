'use client'

import { useState, useEffect, useCallback } from 'react'

let isOpenGlobal = false
const listeners = new Set()

function notify(val) {
  isOpenGlobal = val
  listeners.forEach((listener) => listener(isOpenGlobal))
}

export function useSearchModal() {
  const [isOpen, setIsOpenState] = useState(isOpenGlobal)

  useEffect(() => {
    const listener = (val) => setIsOpenState(val)
    listeners.add(listener)
    return () => listeners.delete(listener)
  }, [])

  const setOpen = useCallback((val) => {
    const next = typeof val === 'function' ? val(isOpenGlobal) : val
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
