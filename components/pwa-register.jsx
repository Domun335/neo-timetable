'use client'

import { useEffect } from 'react'

export function PwaRegister() {
  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      !('serviceWorker' in navigator) ||
      process.env.NODE_ENV !== 'production'
    ) {
      return
    }

    const isLocalhost =
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname === '[::1]'
    const isSecure = window.isSecureContext || isLocalhost

    if (!isSecure) {
      // W sieci lokalnej po czystym HTTP przeglądarki blokują Service Workera ze względów bezpieczeństwa
      return
    }

    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        console.log('[PWA] Service Worker zarejestrowany:', reg.scope)
      })
      .catch((err) => {
        console.warn('[PWA] Błąd rejestracji Service Workera:', err)
      })
  }, [])

  return null
}
