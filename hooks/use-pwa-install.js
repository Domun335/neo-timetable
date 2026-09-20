'use client'

import { useState, useEffect, useCallback, useSyncExternalStore } from 'react'

const emptySubscribe = () => () => {}

/**
 * Hook do obsługi instalacji PWA (Progressive Web App).
 * Przechwytuje zdarzenie `beforeinstallprompt` przeglądarki i sprawdza,
 * czy aplikacja jest już zainstalowana (działa w trybie standalone / PWA).
 *
 * @returns {{ canInstall: boolean, isInstalled: boolean, install: () => Promise<void> }}
 */
export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isInstalled, setIsInstalled] = useState(false)

  // Bezpieczne wykrywanie klienta - nie powoduje rozbieżności hydracji
  const isMounted = useSyncExternalStore(emptySubscribe, () => true, () => false)

  useEffect(() => {
    // Sprawdź czy już jest zainstalowana (tryb standalone / PWA)
    const checkInstalled = () => (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: fullscreen)').matches ||
      window.navigator.standalone === true
    )

    const mq = window.matchMedia('(display-mode: standalone)')

    const handleDisplayModeChange = () => {
      setIsInstalled(checkInstalled())
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }

    const handleAppInstalled = () => {
      setIsInstalled(true)
      setDeferredPrompt(null)
    }

    // Ustawienie stanu instalacji po zamontowaniu
    handleDisplayModeChange()

    mq.addEventListener('change', handleDisplayModeChange)
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      mq.removeEventListener('change', handleDisplayModeChange)
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const install = useCallback(async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setDeferredPrompt(null)
    }
  }, [deferredPrompt])

  return {
    canInstall: isMounted && !isInstalled && deferredPrompt !== null,
    isInstalled,
    install,
  }
}
