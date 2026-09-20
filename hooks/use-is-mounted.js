'use client'

import { useSyncExternalStore } from 'react'

const emptySubscribe = () => () => {}

/**
 * Hook określający czy komponent jest już zamontowany po stronie klienta (Client-side hydration)
 * Bezpieczny dla React 19, nie wywołuje kaskadowych renderów w useEffect.
 * @returns {boolean}
 */
export function useIsMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )
}
