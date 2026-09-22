'use client'

import { useEffect } from 'react'

// Tymczasowo zdejmuje klasę .dark na czas wydruku, aby style Tailwind dark:* renderowały się w trybie jasnym
export function PrintThemeHandler() {
  useEffect(() => {
    let wasDark = false

    const handleBeforePrint = () => {
      const root = document.documentElement
      if (root.classList.contains('dark')) {
        wasDark = true
        root.classList.remove('dark')
      }
    }

    const handleAfterPrint = () => {
      if (wasDark) {
        document.documentElement.classList.add('dark')
        wasDark = false
      }
    }

    window.addEventListener('beforeprint', handleBeforePrint)
    window.addEventListener('afterprint', handleAfterPrint)

    const mql = window.matchMedia('print')
    const handleMediaChange = (e) => {
      if (e.matches) {
        handleBeforePrint()
      } else {
        handleAfterPrint()
      }
    }

    if (mql.addEventListener) {
      mql.addEventListener('change', handleMediaChange)
    } else if (mql.addListener) {
      mql.addListener(handleMediaChange)
    }

    return () => {
      window.removeEventListener('beforeprint', handleBeforePrint)
      window.removeEventListener('afterprint', handleAfterPrint)
      if (mql.removeEventListener) {
        mql.removeEventListener('change', handleMediaChange)
      } else if (mql.removeListener) {
        mql.removeListener(handleMediaChange)
      }
    }
  }, [])

  return null
}
