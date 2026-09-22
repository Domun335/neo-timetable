'use client'

import { useState, useCallback, useSyncExternalStore } from 'react'

const emptySubscribe = () => () => {}

let deferredPromptGlobal = null
let isInstructionsOpenGlobal = false
const instructionListeners = new Set()
const promptListeners = new Set()

function notifyInstructions(val) {
  isInstructionsOpenGlobal = val
  instructionListeners.forEach((fn) => fn())
}

function notifyPrompt(prompt) {
  deferredPromptGlobal = prompt
  promptListeners.forEach((fn) => fn())
}

function subscribeInstructions(onStoreChange) {
  instructionListeners.add(onStoreChange)
  return () => instructionListeners.delete(onStoreChange)
}

function subscribePrompt(onStoreChange) {
  promptListeners.add(onStoreChange)
  return () => promptListeners.delete(onStoreChange)
}

function getIsStandalone() {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true
  )
}

function subscribeStandalone(onStoreChange) {
  if (typeof window === 'undefined') return () => {}
  const mq = window.matchMedia('(display-mode: standalone)')
  if (mq.addEventListener) {
    mq.addEventListener('change', onStoreChange)
  } else if (mq.addListener) {
    mq.addListener(onStoreChange)
  }
  window.addEventListener('appinstalled', onStoreChange)
  return () => {
    if (mq.removeEventListener) {
      mq.removeEventListener('change', onStoreChange)
    } else if (mq.removeListener) {
      mq.removeListener(onStoreChange)
    }
    window.removeEventListener('appinstalled', onStoreChange)
  }
}

function detectPlatform() {
  if (typeof window === 'undefined') return 'desktop'
  const ua = window.navigator.userAgent || ''
  const isIOS =
    /iPhone|iPad|iPod/.test(ua) ||
    (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1)
  if (isIOS) return 'ios'
  if (/Android/.test(ua)) return 'android'
  return 'desktop'
}

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    notifyPrompt(e)
  })

  window.addEventListener('appinstalled', () => {
    notifyPrompt(null)
  })
}

/**
 * Hook do obsługi instalacji PWA (Progressive Web App).
 * Obsługuje natywny instalator Chromium (Chrome, Edge, Samsung Internet)
 * oraz instrukcje instalacji na iOS (Safari / Ekran początkowy) i innych urządzeniach.
 */
export function usePwaInstall() {
  const [platform] = useState(detectPlatform)

  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  )
  const deferredPrompt = useSyncExternalStore(
    subscribePrompt,
    () => deferredPromptGlobal,
    () => null,
  )
  const isInstructionsOpen = useSyncExternalStore(
    subscribeInstructions,
    () => isInstructionsOpenGlobal,
    () => false,
  )
  const isInstalled = useSyncExternalStore(subscribeStandalone, getIsStandalone, () => false)

  const openInstructions = useCallback(() => notifyInstructions(true), [])
  const closeInstructions = useCallback(() => notifyInstructions(false), [])

  const install = useCallback(async () => {
    if (deferredPromptGlobal) {
      try {
        await deferredPromptGlobal.prompt()
        const { outcome } = await deferredPromptGlobal.userChoice
        if (outcome === 'accepted') {
          notifyPrompt(null)
        }
      } catch (err) {
        console.warn('[PWA] Błąd wywołania promptu instalacji:', err)
        notifyInstructions(true)
      }
    } else {
      notifyInstructions(true)
    }
  }, [])

  return {
    canInstall: isMounted && !isInstalled,
    isInstalled,
    hasNativePrompt: Boolean(deferredPrompt),
    isInstructionsOpen,
    openInstructions,
    closeInstructions,
    install,
    platform,
  }
}
