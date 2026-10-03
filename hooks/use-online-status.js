'use client'

import { useSyncExternalStore } from 'react'

function subscribe(callback) {
  window.addEventListener('online', callback)
  window.addEventListener('offline', callback)
  return () => {
    window.removeEventListener('online', callback)
    window.removeEventListener('offline', callback)
  }
}

function getSnapshot() {
  return navigator.onLine
}

function getServerSnapshot() {
  return true
}

/**
 * Hook subskrybujący stan połączenia sieciowego przeglądarki (navigator.onLine).
 * Oparty na useSyncExternalStore - optymalny dla React 19,
 * nie wywołuje kaskadowych renderów w useEffect i zapobiega błędom hydracji.
 * @returns {boolean}
 */
export function useOnlineStatus() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
